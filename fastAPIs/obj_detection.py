"""
Satellite Object Detection API
Returns: detection JSON + annotated image + raw image — all in one ZIP.
"""

import gc
import io
import json
import time
import zipfile
import tempfile
from collections import defaultdict
from pathlib import Path

import torch
import joblib
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from ultralytics import YOLO
from huggingface_hub import hf_hub_download
import uvicorn


# ── Config ──────────────────────────────────────────────────────────────────
DOTA_PKL       = Path("/pkls/object_detection/my_model.pkl")                          # preferred – joblib pkl
DOTA_WEIGHTS   = Path("/pkls/object_detection/best.pt")    # fallback – native .pt
BUILDING_REPO  = "keremberke/yolov8s-building-segmentation"
BUILDING_DIR   = Path("/pkls/object_detection/building_model")
DEVICE         = 0 if torch.cuda.is_available() else "cpu"
DOTA_IMGSZ     = 640
BUILDING_IMGSZ = 416
DOTA_CONF      = 0.2
BUILDING_CONF  = 0.25

DOTA_CLASSES = [
    "plane", "ship", "storage-tank", "baseball-diamond",
    "tennis-court", "basketball-court", "ground-track-field",
    "harbor", "bridge", "large-vehicle", "small-vehicle",
    "helicopter", "roundabout", "soccer-ball-field", "swimming-pool",
]

# Colour palette – one RGB tuple per DOTA class + building colour
import matplotlib
_cmap = matplotlib.colormaps.get_cmap("tab20").resampled(len(DOTA_CLASSES))
PALETTE = [tuple(int(c * 255) for c in _cmap(i)[:3]) for i in range(len(DOTA_CLASSES))]
BUILDING_COLOR = (25, 230, 25)


# ── Helpers ──────────────────────────────────────────────────────────────────
def merge_boxes_by_class(detections: list) -> list:
    """One union bounding box + all confs per class."""
    buckets = defaultdict(list)
    for det in detections:
        cls_id = det[0]
        cx, cy, bw, bh = det[1], det[2], det[3], det[4]
        conf = det[5] if len(det) > 5 else 1.0
        buckets[cls_id].append(
            (cx - bw / 2, cy - bh / 2, cx + bw / 2, cy + bh / 2, conf)
        )
    merged = []
    for cls_id, boxes in buckets.items():
        x1    = min(b[0] for b in boxes)
        y1    = min(b[1] for b in boxes)
        x2    = max(b[2] for b in boxes)
        y2    = max(b[3] for b in boxes)
        confs = [b[4] for b in boxes]
        merged.append((cls_id, x1, y1, x2, y2, confs))
    return merged


def build_detection_entry(cls_name: str, confs: list,
                           x1: float, y1: float, x2: float, y2: float,
                           img_w: int, img_h: int) -> dict:
    return {
        "class"          : cls_name,
        "count"          : len(confs),
        "confidence_max" : round(max(confs), 4),
        "confidence_avg" : round(sum(confs) / len(confs), 4),
        "bbox"           : {
            "x1": round(x1 * img_w, 1), "y1": round(y1 * img_h, 1),
            "x2": round(x2 * img_w, 1), "y2": round(y2 * img_h, 1),
        },
    }


def annotate_image(img: Image.Image,
                   dota_raw: list,
                   building_raw: list) -> Image.Image:
    """Draw merged boxes + count table directly on a PIL image."""
    draw  = ImageDraw.Draw(img, "RGBA")
    img_w, img_h = img.size
    count_table  = []   # (label, count, rgb)

    # Try to load a font; fall back to default if not available
    try:
        font_sm  = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 14)
        font_xs  = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 12)
        font_mono= ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf", 11)
    except Exception:
        font_sm = font_xs = font_mono = ImageFont.load_default()

    # ── DOTA boxes ──────────────────────────────────────────────────────────
    class_confs = defaultdict(list)
    for cls_id, cx, cy, bw, bh, conf in dota_raw:
        class_confs[cls_id].append(conf)

    for cls_id, x1, y1, x2, y2, confs in merge_boxes_by_class(dota_raw):
        color = PALETTE[cls_id]
        px1   = int(x1 * img_w); py1 = int(y1 * img_h)
        px2   = int(x2 * img_w); py2 = int(y2 * img_h)
        count = len(confs)
        conf  = max(confs)
        label = f"{DOTA_CLASSES[cls_id]}  ×{count}  ({conf:.2f})"

        # Box (solid outline)
        draw.rectangle([px1, py1, px2, py2],
                       outline=color, width=3)

        # Label pill
        tw = draw.textlength(label, font=font_sm)
        pill_h = 18
        draw.rectangle([px1, py1, px1 + int(tw) + 8, py1 + pill_h],
                       fill=(*color, 200))
        draw.text((px1 + 4, py1 + 2), label, fill=(255, 255, 255), font=font_sm)

        count_table.append((DOTA_CLASSES[cls_id], count, color))

    # ── Building boxes ──────────────────────────────────────────────────────
    b_raw = [(0, cx, cy, bw, bh, conf) for _, cx, cy, bw, bh, conf in building_raw]
    b_confs_all = [conf for *_, conf in building_raw]

    if b_raw:
        for _, x1, y1, x2, y2, confs in merge_boxes_by_class(b_raw):
            px1 = int(x1 * img_w); py1 = int(y1 * img_h)
            px2 = int(x2 * img_w); py2 = int(y2 * img_h)
            count = len(confs)
            conf  = max(confs)
            label = f"building  ×{count}  ({conf:.2f})"

            # Dashed outline (approximated with segments)
            seg = 18
            for sx in range(px1, px2, seg * 2):
                draw.line([(sx, py1), (min(sx + seg, px2), py1)],
                          fill=BUILDING_COLOR, width=3)
                draw.line([(sx, py2), (min(sx + seg, px2), py2)],
                          fill=BUILDING_COLOR, width=3)
            for sy in range(py1, py2, seg * 2):
                draw.line([(px1, sy), (px1, min(sy + seg, py2))],
                          fill=BUILDING_COLOR, width=3)
                draw.line([(px2, sy), (px2, min(sy + seg, py2))],
                          fill=BUILDING_COLOR, width=3)

            # Label pill
            tw = draw.textlength(label, font=font_sm)
            draw.rectangle([px1, py1, px1 + int(tw) + 8, py1 + 18],
                           fill=(*BUILDING_COLOR, 200))
            draw.text((px1 + 4, py1 + 2), label, fill=(0, 0, 0), font=font_sm)

            count_table.append(("building", count, BUILDING_COLOR))

    # ── Count table – top-right corner ─────────────────────────────────────
    if count_table:
        count_table_sorted = sorted(count_table, key=lambda x: x[1], reverse=True)
        total  = sum(c for _, c, _ in count_table_sorted)
        row_h  = 20
        pad    = 8
        col_w  = 210
        rows   = len(count_table_sorted)
        tbl_h  = row_h * (rows + 1) + pad * 2
        tbl_x  = img_w - col_w - 10
        tbl_y  = 10

        # Panel background
        draw.rectangle([tbl_x - pad, tbl_y - pad,
                        tbl_x + col_w + pad, tbl_y + tbl_h],
                       fill=(0, 0, 0, 160), outline=(255, 255, 255, 120), width=1)

        # Header
        header = f"Detected  total = {total}"
        draw.text((tbl_x, tbl_y + 2), header, fill=(255, 255, 255), font=font_sm)

        # Rows
        for i, (cls_name, count, color) in enumerate(count_table_sorted):
            ry = tbl_y + row_h * (i + 1) + pad
            # Colour swatch
            draw.rectangle([tbl_x, ry + 2, tbl_x + 14, ry + 14], fill=color)
            # Text
            draw.text((tbl_x + 18, ry),
                      f"{cls_name:<20} ×{count}",
                      fill=(220, 220, 220), font=font_mono)

    return img


# ── Model manager (singleton) ────────────────────────────────────────────────
class ModelManager:
    _dota     = None
    _building = None

    @classmethod
    def dota(cls) -> YOLO:
        if cls._dota is None:
            if DOTA_PKL.exists():
                # Load from joblib .pkl (preferred)
                print(f"Loading DOTA model from .pkl → {DOTA_PKL} …")
                cls._dota = joblib.load(str(DOTA_PKL))
                print("DOTA model loaded from .pkl successfully.")
            elif DOTA_WEIGHTS.exists():
                # Fall back to native .pt weights
                print(f"[fallback] .pkl not found. Loading from .pt → {DOTA_WEIGHTS} …")
                cls._dota = YOLO(str(DOTA_WEIGHTS))
                print("DOTA model loaded from .pt successfully.")
            else:
                raise RuntimeError(
                    f"No model found.\n"
                    f"  Expected .pkl : {DOTA_PKL}\n"
                    f"  Expected .pt  : {DOTA_WEIGHTS}\n"
                    "Run training and the joblib.dump() cell in the notebook first."
                )
        return cls._dota

    @classmethod
    def building(cls) -> YOLO:
        if cls._building is None:
            weights = BUILDING_DIR / "best.pt"
            if not weights.exists():
                print("Downloading building model …")
                weights = hf_hub_download(
                    repo_id=BUILDING_REPO, filename="best.pt",
                    local_dir=str(BUILDING_DIR),
                )
            print("Loading building model …")
            cls._building = YOLO(str(weights))
        return cls._building


# ── App ──────────────────────────────────────────────────────────────────────
app = FastAPI(
    title       = "Satellite Object Detection API",
    description = "Upload a satellite image → get detection JSON + annotated image + raw image in a ZIP.",
    version     = "2.0.0",
)
app.add_middleware(CORSMiddleware, allow_origins=["*"],
                   allow_methods=["*"], allow_headers=["*"])


@app.on_event("startup")
async def startup():
    ModelManager.dota()
    ModelManager.building()
    print(f"Models ready. Device: {'GPU' if DEVICE == 0 else 'CPU'}")


@app.get("/health")
def health():
    if DOTA_PKL.exists():
        dota_source = f"pkl  → {DOTA_PKL}"
        dota_ready  = True
    elif DOTA_WEIGHTS.exists():
        dota_source = f"pt (fallback) → {DOTA_WEIGHTS}"
        dota_ready  = True
    else:
        dota_source = "not found"
        dota_ready  = False

    return {
        "status": "ok",
        "device": "GPU" if DEVICE == 0 else "CPU",
        "models": {
            "dota"          : dota_ready,
            "dota_source"   : dota_source,
            "building"      : (BUILDING_DIR / "best.pt").exists(),
        },
    }


@app.post(
    "/predict",
    response_class=StreamingResponse,
    responses={
        200: {
            "content"    : {"application/zip": {}},
            "description": "ZIP containing detections.json, annotated.png, original.png",
        }
    },
)
async def predict(
    file          : UploadFile = File(...),
    run_dota      : bool  = True,
    run_buildings : bool  = True,
    dota_conf     : float = DOTA_CONF,
    building_conf : float = BUILDING_CONF,
):
    """
    Upload a satellite image.

    Returns a **ZIP** file with three items:
    - `detections.json`  – structured detections (class, count, confidence, bbox)
    - `annotated.png`    – image with boxes + count table drawn on it
    - `original.png`     – unmodified uploaded image
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(400, "File must be an image.")

    img_bytes = await file.read()
    try:
        original_img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
    except Exception:
        raise HTTPException(400, "Cannot open image file.")

    img_w, img_h = original_img.size
    stem = Path(file.filename).stem

    # Save to temp file for YOLO
    with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
        original_img.save(tmp.name)
        tmp_path = tmp.name

    t_start = time.perf_counter()
    dota_raw, building_raw = [], []

    # ── DOTA inference ───────────────────────────────────────────────────────
    if run_dota:
        result = ModelManager.dota().predict(
            source=tmp_path, imgsz=DOTA_IMGSZ, conf=dota_conf,
            iou=0.5, device=DEVICE, half=(DEVICE == 0), verbose=False,
        )[0]
        if result.boxes is not None:
            for box in result.boxes:
                cls_id         = int(box.cls[0])
                conf           = float(box.conf[0])
                cx, cy, bw, bh = box.xywhn[0].tolist()
                dota_raw.append((cls_id, cx, cy, bw, bh, conf))

    # ── Building inference ───────────────────────────────────────────────────
    if run_buildings:
        result = ModelManager.building().predict(
            source=tmp_path, imgsz=BUILDING_IMGSZ, conf=building_conf,
            iou=0.4, device=DEVICE, half=(DEVICE == 0), verbose=False,
        )[0]
        if result.boxes is not None:
            for box in result.boxes:
                conf           = float(box.conf[0])
                cx, cy, bw, bh = box.xywhn[0].tolist()
                building_raw.append((0, cx, cy, bw, bh, conf))

    elapsed = round(time.perf_counter() - t_start, 3)

    # ── Build JSON payload ───────────────────────────────────────────────────
    dota_dets, building_dets = [], []

    class_confs = defaultdict(list)
    for cls_id, cx, cy, bw, bh, conf in dota_raw:
        class_confs[cls_id].append(conf)
    for cls_id, x1, y1, x2, y2, confs in merge_boxes_by_class(dota_raw):
        dota_dets.append(build_detection_entry(
            DOTA_CLASSES[cls_id], confs, x1, y1, x2, y2, img_w, img_h
        ))

    if building_raw:
        b_raw = [(0, cx, cy, bw, bh, conf) for _, cx, cy, bw, bh, conf in building_raw]
        for _, x1, y1, x2, y2, confs in merge_boxes_by_class(b_raw):
            building_dets.append(build_detection_entry(
                "building", confs, x1, y1, x2, y2, img_w, img_h
            ))

    all_dets    = dota_dets + building_dets
    total_count = sum(d["count"] for d in all_dets)
    class_totals = dict(
        sorted({d["class"]: d["count"] for d in all_dets}.items(),
               key=lambda x: x[1], reverse=True)
    )

    # ── Natural-language description ─────────────────────────────────────────
    def build_description(filename, total, class_totals, img_w, img_h, elapsed):
        if total == 0:
            return (
                f"No objects were detected in '{filename}' "
                f"({img_w}×{img_h} px). "
                "Try lowering the confidence threshold if objects are expected."
            )

        # Format each class as "47 small-vehicles" / "1 plane"
        def fmt(cls, n):
            # Simple pluralisation
            if n == 1:
                return f"1 {cls}"
            if cls.endswith("s"):
                return f"{n} {cls}"
            return f"{n} {cls}s"

        parts = [fmt(cls, n) for cls, n in class_totals.items()]

        if len(parts) == 1:
            objects_str = parts[0]
        elif len(parts) == 2:
            objects_str = f"{parts[0]} and {parts[1]}"
        else:
            objects_str = ", ".join(parts[:-1]) + f", and {parts[-1]}"

        dominant = next(iter(class_totals))   # highest-count class
        dominant_n = class_totals[dominant]
        dominant_pct = round(dominant_n / total * 100)

        desc = (
            f"Analysis of '{filename}' ({img_w}×{img_h} px) completed in "
            f"{elapsed}s. "
            f"A total of {total} object{'s' if total != 1 else ''} "
            f"{'were' if total != 1 else 'was'} detected across "
            f"{len(class_totals)} class{'es' if len(class_totals) != 1 else ''}: "
            f"{objects_str}. "
            f"The dominant object type is '{dominant}', "
            f"accounting for {dominant_pct}% of all detections."
        )
        return desc

    description = build_description(
        file.filename, total_count, class_totals, img_w, img_h, elapsed
    )

    payload     = {
        "image"          : file.filename,
        "size"           : {"width": img_w, "height": img_h},
        "elapsed_seconds": elapsed,
        "description"    : description,
        "summary"        : {
            "total_objects_detected": total_count,
            "per_class_totals"      : class_totals,
        },
        "detections"     : {"dota": dota_dets, "buildings": building_dets},
    }

    # ── Annotate image ───────────────────────────────────────────────────────
    annotated_img = annotate_image(original_img.copy(), dota_raw, building_raw)

    # ── Pack ZIP ─────────────────────────────────────────────────────────────
    zip_buf = io.BytesIO()
    with zipfile.ZipFile(zip_buf, "w", zipfile.ZIP_DEFLATED) as zf:
        # detections.json
        zf.writestr(
            f"{stem}_detections.json",
            json.dumps(payload, indent=2)
        )
        # annotated.png
        ann_buf = io.BytesIO()
        annotated_img.save(ann_buf, format="PNG")
        zf.writestr(f"{stem}_annotated.png", ann_buf.getvalue())

        # original.png
        orig_buf = io.BytesIO()
        original_img.save(orig_buf, format="PNG")
        zf.writestr(f"{stem}_original.png", orig_buf.getvalue())

    zip_buf.seek(0)
    return StreamingResponse(
        zip_buf,
        media_type="application/zip",
        headers={"Content-Disposition": f'attachment; filename="{stem}_results.zip"'},
    )


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)
