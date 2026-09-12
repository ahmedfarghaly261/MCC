"""
Anomaly Detection FastAPI Service  — V4
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Additions over V3:
  • Full structured response matching the spec:
      frame_index, timestamp, prediction (is_anomaly, anomaly_score,
      threshold), explanation (method, root_cause, top_3_features with
      feature/value/shap), subsystem
  • SHAP explanations via shap.TreeExplainer for Isolation Forest;
    scaled-space deviation fallback for every other PyOD model
  • Subsystem tag per feature (EPS / OBC / ADCS / COMM / ENGINEERED)
  • Threshold sourced from model_metadataV3.json (threshold_95pct)
  • frame_index counter persisted on ModelRegistry (resets on restart)
  • Per-parameter predictions retained in a flat list as before
  • All V3 fixes retained (DataFrame → RobustScaler, feature name map)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""

import os
import json
import logging
import threading
import numpy as np
import pandas as pd
from typing import Optional, List
from contextlib import asynccontextmanager
from datetime import datetime, timezone
import joblib

from fastapi import FastAPI, HTTPException, Security, Depends
from fastapi.security.api_key import APIKeyHeader
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# ─────────────────────────────────────────────────────────────────────
# Logging
# ─────────────────────────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────────────────────────────
# Config
# ─────────────────────────────────────────────────────────────────────
MODEL_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "pkls"))
MODEL_PATH    = os.getenv("MODEL_PATH",    os.path.join(MODEL_ROOT, "best_anomaly_modelV3.pkl"))
SCALER_PATH   = os.getenv("SCALER_PATH",   os.path.join(MODEL_ROOT, "scalerV3.pkl"))
METADATA_PATH = os.getenv("METADATA_PATH", os.path.join(MODEL_ROOT, "model_metadataV3.json"))
API_KEY       = os.getenv("ANOMALY_API_KEY", "change-me-in-production")

api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)


def verify_api_key(key: str = Security(api_key_header)):
    if key != API_KEY:
        raise HTTPException(status_code=403, detail="Invalid or missing API key")
    return key


# ─────────────────────────────────────────────────────────────────────
# Feature groups (must match training order exactly)
# ─────────────────────────────────────────────────────────────────────
EPS_FEATS = [
    "EPS_Solar_1_V", "EPS_Solar_2_V", "EPS_Solar_3_V",
    "EPS_Solar_1_C", "EPS_Solar_2_C", "EPS_Solar_3_C",
    "EPS_VBAT", "EPS_IBAT",
    "EPS_BUS_1_V", "EPS_BUS_2_V",
    "EPS_BUS_1_C", "EPS_BUS_2_C",
    "EPS_Temp",
]
OBC_FEATS = [
    "OBC_Latitude", "OBC_Longitude",
    "OBC_velN", "OBC_velE", "OBC_velD",
    "OBC_RX_CMD_Count", "OBC_TX_CMD_Count",
    "OBC_EPS_SRecords", "OBC_ADCS_SRecords",
]
ADCS_FEATS = [
    "ADCS_Sun_X", "ADCS_Sun_Y", "ADCS_Sun_Z",
    "ADCS_accel_x", "ADCS_accel_y", "ADCS_accel_z",
    "ADCS_Gyro_X", "ADCS_Gyro_Y", "ADCS_Gyro_Z",
    "ADCS_MM_X", "ADCS_MM_Y", "ADCS_MM_Z",
    "ADCS_RW_RPM",
]
COMM_FEATS = [
    "COMM_Total_RX", "COMM_Correct_RX",
    "COMM_RF_Power", "COMM_RSSI",
    "COMM_RF_Temp",
    "COMM_RX_Current", "COMM_TX_I_3V3", "COMM_TX_I_5V",
]

# Engineered features (created at inference time)
ENGINEERED_FEATS = [
    "EPS_Solar_1_Power", "EPS_Solar_2_Power", "EPS_Solar_3_Power",
    "ADCS_Gyro_Magnitude", "ADCS_MM_Magnitude",
    "COMM_Success_Rate",
]

# Build a fast lookup: feature_name → subsystem label
def _build_subsystem_map() -> dict:
    m: dict = {}
    for f in EPS_FEATS:
        m[f] = "EPS"
    for f in OBC_FEATS:
        m[f] = "OBC"
    for f in ADCS_FEATS:
        m[f] = "ADCS"
    for f in COMM_FEATS:
        m[f] = "COMM"
    for f in ENGINEERED_FEATS:
        # Engineered features inherit subsystem from their prefix
        prefix = f.split("_")[0]
        m[f] = prefix if prefix in ("EPS", "OBC", "ADCS", "COMM") else "ENGINEERED"
    return m

SUBSYSTEM_MAP: dict = _build_subsystem_map()


def feature_subsystem(feature_name: str) -> str:
    """Return the subsystem label for a feature (best-effort prefix match)."""
    if feature_name in SUBSYSTEM_MAP:
        return SUBSYSTEM_MAP[feature_name]
    prefix = feature_name.split("_")[0]
    return prefix if prefix in ("EPS", "OBC", "ADCS", "COMM") else "UNKNOWN"


def dominant_subsystem(features: List[str]) -> str:
    """Return the subsystem that owns the majority of features in the list."""
    from collections import Counter
    counts = Counter(feature_subsystem(f) for f in features)
    return counts.most_common(1)[0][0] if counts else "UNKNOWN"


# ─────────────────────────────────────────────────────────────────────
# Model registry (singleton, thread-safe counter)
# ─────────────────────────────────────────────────────────────────────
class ModelRegistry:
    model           = None
    scaler          = None
    shap_explainer  = None          # TreeExplainer when available
    feature_names:  list = []
    n_features:     int  = 0
    model_name:     str  = "unknown"
    threshold:      float = 0.5     # sourced from metadata threshold_95pct
    score_mean:     float = 0.0
    score_std:      float = 1.0

    # Rolling frame counter (reset on service restart)
    _frame_lock   = threading.Lock()
    _frame_counter: int = 0

    @classmethod
    def next_frame_index(cls) -> int:
        with cls._frame_lock:
            idx = cls._frame_counter
            cls._frame_counter += 1
        return idx


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Loading model artifacts …")
    try:
        ModelRegistry.model  = joblib.load(MODEL_PATH)
        ModelRegistry.scaler = joblib.load(SCALER_PATH)
        logger.info("Model and scaler loaded.")
    except Exception as e:
        logger.error(f"FAILED to load model/scaler: {e}")

    try:
        with open(METADATA_PATH) as f:
            meta = json.load(f)
        ModelRegistry.feature_names = meta["features"]
        ModelRegistry.n_features    = meta["n_features"]
        ModelRegistry.model_name    = meta.get("model_name", "unknown")
        ModelRegistry.threshold     = float(meta.get("threshold_95pct", 0.5))
        ModelRegistry.score_mean    = float(meta.get("score_mean", 0.0))
        ModelRegistry.score_std     = float(meta.get("score_std",  1.0))
        logger.info(
            f"Metadata loaded — {ModelRegistry.n_features} features, "
            f"threshold={ModelRegistry.threshold:.4f}."
        )
    except Exception as e:
        logger.warning(f"Metadata load failed ({e}).")
        if hasattr(ModelRegistry.model, "n_features_in_"):
            ModelRegistry.n_features = ModelRegistry.model.n_features_in_

    # Build SHAP explainer for tree-based models (Isolation Forest)
    if ModelRegistry.model is not None:
        _try_build_shap_explainer()

    yield
    logger.info("Shutting down.")


def _try_build_shap_explainer():
    """Attempt to build a SHAP TreeExplainer against the underlying sklearn detector."""
    try:
        import shap  # noqa: F401
        detector = getattr(ModelRegistry.model, "detector_", None)
        if detector is None:
            logger.warning("SHAP: model has no .detector_ attribute — will use fallback.")
            return
        ModelRegistry.shap_explainer = shap.TreeExplainer(detector)
        logger.info("SHAP TreeExplainer initialised successfully.")
    except Exception as e:
        logger.warning(f"SHAP explainer could not be built ({e}). Fallback scoring active.")


# ─────────────────────────────────────────────────────────────────────
# Pydantic schemas
# ─────────────────────────────────────────────────────────────────────
class TelemetryItem(BaseModel):
    parameter_id:    Optional[int]   = None
    parameter_name:  Optional[str]   = None
    unit:            Optional[str]   = None
    raw_value:       Optional[float] = None
    converted_value: Optional[float] = None
    sampled_at:      Optional[str]   = None


class AnomalyRequest(BaseModel):
    command_log_id: int
    telemetry:      List[TelemetryItem] = Field(..., min_length=1)


# ── Per-parameter flat list (retained from V3) ────────────────────────
class TelemetryPrediction(BaseModel):
    parameter_id:    Optional[int]
    parameter_name:  Optional[str]
    converted_value: Optional[float]
    subsystem:       str
    is_anomaly:      bool
    anomaly_score:   Optional[float]


# ── SHAP / explanation objects ────────────────────────────────────────
class FeatureContribution(BaseModel):
    feature:  str
    value:    float
    shap:     float          # SHAP value (or scaled deviation for fallback)


class Explanation(BaseModel):
    method:          str     # "SHAP" | "scaled_deviation"
    root_cause:      str
    top_3_features:  List[FeatureContribution]


class PredictionSummary(BaseModel):
    is_anomaly:    bool
    anomaly_score: float
    threshold:     float


# ── Full enriched response ────────────────────────────────────────────
class AnomalyResponse(BaseModel):
    command_log_id: int
    frame_index:    int
    timestamp:      str              # ISO-8601 UTC

    prediction:     PredictionSummary
    explanation:    Optional[Explanation]
    subsystem:      str              # dominant subsystem of top contributors

    # Flat per-parameter list (unchanged from V3)
    has_anomaly:    bool
    anomaly_count:  int
    anomaly_ratio:  float
    predictions:    List[TelemetryPrediction]
    model_version:  str


# ─────────────────────────────────────────────────────────────────────
# App
# ─────────────────────────────────────────────────────────────────────
app = FastAPI(title="Satellite Anomaly API — V4", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─────────────────────────────────────────────────────────────────────
# Feature builder (unchanged logic, returns scaled DataFrame)
# ─────────────────────────────────────────────────────────────────────
def build_feature_row(
    telemetry: List[TelemetryItem],
) -> tuple[pd.DataFrame, dict]:
    """
    Returns
    -------
    X_scaled_df : pd.DataFrame  — scaled row ready for model.predict()
    raw         : dict          — {feature_name: raw (unscaled) value}
                                  used by SHAP value builder
    """
    raw: dict = {}
    for t in telemetry:
        name = t.parameter_name
        val  = t.converted_value if t.converted_value is not None else 0.0
        if name:
            raw[name] = val

    # Feature engineering (mirrors training)
    for i in [1, 2, 3]:
        v, c = f"EPS_Solar_{i}_V", f"EPS_Solar_{i}_C"
        if v in raw and c in raw:
            raw[f"EPS_Solar_{i}_Power"] = raw[v] * raw[c]

    gx = raw.get("ADCS_Gyro_X", 0.0)
    gy = raw.get("ADCS_Gyro_Y", 0.0)
    gz = raw.get("ADCS_Gyro_Z", 0.0)
    raw["ADCS_Gyro_Magnitude"] = float(np.sqrt(gx**2 + gy**2 + gz**2))

    mx = raw.get("ADCS_MM_X", 0.0)
    my = raw.get("ADCS_MM_Y", 0.0)
    mz = raw.get("ADCS_MM_Z", 0.0)
    raw["ADCS_MM_Magnitude"] = float(np.sqrt(mx**2 + my**2 + mz**2))

    total_rx   = raw.get("COMM_Total_RX",   0.0)
    correct_rx = raw.get("COMM_Correct_RX", 0.0)
    raw["COMM_Success_Rate"] = (correct_rx / total_rx) if total_rx > 0 else 0.0

    # Align to training feature order
    feature_names = ModelRegistry.feature_names or (
        EPS_FEATS + OBC_FEATS + ADCS_FEATS + COMM_FEATS
    )
    row  = [raw.get(f, 0.0) for f in feature_names]
    X_df = pd.DataFrame([row], columns=feature_names)

    if ModelRegistry.scaler is not None:
        X_scaled = ModelRegistry.scaler.transform(X_df)
        X_scaled_df = pd.DataFrame(X_scaled, columns=feature_names)
    else:
        X_scaled_df = X_df

    return X_scaled_df, raw


# ─────────────────────────────────────────────────────────────────────
# Explanation builder
# ─────────────────────────────────────────────────────────────────────
def build_explanation(
    X_scaled_df: pd.DataFrame,
    raw_values:  dict,
    label:       int,
) -> Optional[Explanation]:
    """
    Returns an Explanation object with method, root_cause, top_3_features.
    Uses SHAP TreeExplainer when available, otherwise falls back to
    scaled-space |deviation from zero| (proxy for anomaly contribution).
    """
    feature_names = ModelRegistry.feature_names
    if not feature_names:
        return None

    try:
        if ModelRegistry.shap_explainer is not None:
            # ── SHAP path ──────────────────────────────────────────
            shap_vals = ModelRegistry.shap_explainer.shap_values(X_scaled_df)
            # shap_vals may be shape (1, n_features) or (1, n_features, n_classes)
            if isinstance(shap_vals, list):
                sv = np.array(shap_vals[0]).flatten()
            else:
                sv = np.array(shap_vals).flatten()

            contributions = sorted(
                [
                    {
                        "feature": feat,
                        "shap":    round(float(sv[i]), 6),
                        "value":   round(float(raw_values.get(feat, 0.0)), 6),
                    }
                    for i, feat in enumerate(feature_names)
                ],
                key=lambda x: abs(x["shap"]),
                reverse=True,
            )
            method = "SHAP"

        else:
            # ── Fallback: absolute deviation on scaled row ─────────
            scaled_row = X_scaled_df.values.flatten()
            contributions = sorted(
                [
                    {
                        "feature": feat,
                        "shap":    round(float(abs(scaled_row[i])), 6),
                        "value":   round(float(raw_values.get(feat, 0.0)), 6),
                    }
                    for i, feat in enumerate(feature_names)
                ],
                key=lambda x: abs(x["shap"]),
                reverse=True,
            )
            method = "scaled_deviation"

        top3 = contributions[:3]
        return Explanation(
            method=method,
            root_cause=top3[0]["feature"] if top3 else "unknown",
            top_3_features=[
                FeatureContribution(
                    feature=c["feature"],
                    value=c["value"],
                    shap=c["shap"],
                )
                for c in top3
            ],
        )

    except Exception as exc:
        logger.warning(f"Explanation failed: {exc}")
        return None


# ─────────────────────────────────────────────────────────────────────
# Per-parameter predictions (V3 logic, enhanced with subsystem)
# ─────────────────────────────────────────────────────────────────────
def per_parameter_score(
    X_full:        pd.DataFrame,
    telemetry:     List[TelemetryItem],
    label:         int,
    overall_score: float,
) -> List[TelemetryPrediction]:
    model         = ModelRegistry.model
    feature_names = ModelRegistry.feature_names
    predictions   = []

    for item in telemetry:
        name        = item.parameter_name
        param_score = overall_score

        if name and name in feature_names and label == 1:
            X_masked        = X_full.copy()
            X_masked[name]  = 0.0
            try:
                masked_score = float(model.decision_function(X_masked)[0])
                param_score  = round(overall_score - masked_score, 6)
            except Exception:
                param_score = overall_score

        predictions.append(
            TelemetryPrediction(
                parameter_id=item.parameter_id,
                parameter_name=name,
                converted_value=item.converted_value,
                subsystem=feature_subsystem(name) if name else "UNKNOWN",
                is_anomaly=(label == 1),
                anomaly_score=round(param_score, 6),
            )
        )
    return predictions


# ─────────────────────────────────────────────────────────────────────
# Routes
# ─────────────────────────────────────────────────────────────────────
@app.post(
    "/detect",
    response_model=AnomalyResponse,
    dependencies=[Depends(verify_api_key)],
)
def detect(body: AnomalyRequest):
    if ModelRegistry.model is None or ModelRegistry.scaler is None:
        raise HTTPException(status_code=503, detail="Model or Scaler not loaded")

    now         = datetime.now(timezone.utc).isoformat(timespec="seconds")
    frame_index = ModelRegistry.next_frame_index()

    try:
        X_scaled, raw_values = build_feature_row(body.telemetry)

        label = int(ModelRegistry.model.predict(X_scaled)[0])
        score = float(ModelRegistry.model.decision_function(X_scaled)[0])

        explanation   = build_explanation(X_scaled, raw_values, label)
        per_param     = per_parameter_score(X_scaled, body.telemetry, label, score)

    except Exception as exc:
        logger.exception("Prediction failed")
        raise HTTPException(status_code=500, detail=str(exc))

    # Dominant subsystem from explanation top features (fallback to UNKNOWN)
    top_features = (
        [c.feature for c in explanation.top_3_features]
        if explanation
        else []
    )
    primary_subsystem = dominant_subsystem(top_features) if top_features else "UNKNOWN"

    anomalies = [p for p in per_param if p.is_anomaly]

    return AnomalyResponse(
        command_log_id=body.command_log_id,
        frame_index=frame_index,
        timestamp=now,

        prediction=PredictionSummary(
            is_anomaly=(label == 1),
            anomaly_score=round(score, 6),
            threshold=round(ModelRegistry.threshold, 6),
        ),
        explanation=explanation,
        subsystem=primary_subsystem,

        has_anomaly=len(anomalies) > 0,
        anomaly_count=len(anomalies),
        anomaly_ratio=(
            round(len(anomalies) / len(per_param), 4) if per_param else 0.0
        ),
        predictions=per_param,
        model_version=(
            f"PyOD_{type(ModelRegistry.model).__name__}"
            f"_{ModelRegistry.model_name}"
        ),
    )


@app.get("/health")
def health():
    return {
        "status":         "ok",
        "model_loaded":   ModelRegistry.model  is not None,
        "scaler_loaded":  ModelRegistry.scaler is not None,
        "shap_available": ModelRegistry.shap_explainer is not None,
        "model_name":     ModelRegistry.model_name,
        "n_features":     ModelRegistry.n_features,
        "threshold":      ModelRegistry.threshold,
        "frames_served":  ModelRegistry._frame_counter,
    }
