"""
Real Hardware Telemetry Decoder Service — GRAD Project SSP Protocol
=====================================================================
Decodes real SSP frames (C0 DEST SRC CMD LEN DATA CRC0 CRC1 C0) coming
from the actual satellite hardware via the RS-485/UART gateway, using
the authoritative decode logic from the hardware team.
"""

import logging
import os
from datetime import datetime, timezone
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator

from protocol import SSPFrame, CRCAlgorithm
from catalog import SatelliteProfile
from decode_engine import decode_frame as decode_ssp_frame

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

app = FastAPI(
    title="GRAD Project Telemetry Decoder Service",
    description="Decodes real SSP frames from the satellite hardware.",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# الجيت واي الحقيقي (مش simulator خالص)
SATELLITE_PROFILE = SatelliteProfile.GRAD_PROJECT


# ══════════════════════════════════════════════════════════════════
# Request Models
# ══════════════════════════════════════════════════════════════════
class DecodeRequest(BaseModel):
    hex_frame: str
    frame_index: int = 0
    captured_at: Optional[str] = None
    station: Optional[str] = None
    satellite_id: Optional[int] = None  # لارافيل بيبعتها، نتجاهلها هنا

    @field_validator("hex_frame")
    @classmethod
    def hex_frame_not_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("hex_frame must not be blank.")
        return v.strip()


class BatchDecodeRequest(BaseModel):
    frames: list[DecodeRequest]


# ══════════════════════════════════════════════════════════════════
# Core: hex string → SSPFrame → decoded telemetry
# ══════════════════════════════════════════════════════════════════
def decode_hex_frame(hex_frame: str) -> dict:
    hex_frame = "".join(hex_frame.split())
    if not hex_frame:
        raise ValueError("Empty hex frame.")

    try:
        raw = bytes.fromhex(hex_frame)
    except ValueError:
        raise ValueError("Frame contains non-hexadecimal characters.")

    # فك الفريم عن طريق البروتوكول الحقيقي (طول ديناميكي + تحقق CRC)
    frame = SSPFrame.decode(raw, algorithm=CRCAlgorithm.IBM_3740)

    if not frame.valid:
        raise ValueError(f"Frame validation failed: {frame.error or 'CRC mismatch'}")

    subsystem_name, values = decode_ssp_frame(frame, profile=SATELLITE_PROFILE)

    # ── لو الرد ACK/NACK/PEND (مش تليمتري كاملة) ──────────────────
    if "Response" in values:
        return {
            "status": "ok",
            "type": values["Response"],  # ACK / NACK / PEND
            "for_command": values.get("For command"),
            "meta": {
                "decoded_at_utc": datetime.now(timezone.utc).isoformat(),
                "source": frame.source,
                "destination": frame.destination,
                "command": frame.command,
            },
        }

    # ── تليمتري حقيقية: نلفها بنفس شكل اللي لارافيل متوقعه ────────
    # storeDecodedFrame() بيدور على مفتاح {subsystem_name}_Address
    values_with_meta = {
        f"{subsystem_name}_Address": f"0x{frame.source:02X}",
        **values,
    }

    return {
        "status": "ok",
        "meta": {
            "decoded_at_utc": datetime.now(timezone.utc).isoformat(),
            "source": frame.source,
            "destination": frame.destination,
            "command": frame.command,
            "frame_bytes": len(raw),
        },
        subsystem_name: values_with_meta,
    }


# ══════════════════════════════════════════════════════════════════
# Routes
# ══════════════════════════════════════════════════════════════════
@app.get("/", summary="Decoder service health check")
def root():
    return {
        "status": "online",
        "service": "GRAD Project Telemetry Decoder",
        "profile": SATELLITE_PROFILE.value,
        "endpoints": {
            "POST /decode": "Decode a single real SSP hex frame",
            "POST /decode/batch": "Decode multiple frames",
        },
    }


@app.post("/decode", summary="Decode a single raw SSP hex frame")
def decode_single(req: DecodeRequest):
    logger.info(f"POST /decode  len={len(req.hex_frame)}  station={req.station}")
    try:
        decoded = decode_hex_frame(req.hex_frame)
    except ValueError as exc:
        logger.error(f"Decode failed: {exc}")
        raise HTTPException(status_code=422, detail=str(exc))

    return {
        **decoded,
        "captured_at": req.captured_at,
        "station": req.station,
        "raw_hex": req.hex_frame,
    }


@app.post("/decode/batch", summary="Decode multiple frames")
def decode_batch(req: BatchDecodeRequest):
    results = []
    for item in req.frames:
        try:
            decoded = decode_hex_frame(item.hex_frame)
            results.append({
                **decoded,
                "captured_at": item.captured_at,
                "station": item.station,
                "raw_hex": item.hex_frame,
            })
        except ValueError as exc:
            results.append({
                "status": "error",
                "captured_at": item.captured_at,
                "station": item.station,
                "raw_hex": item.hex_frame,
                "error": str(exc),
            })

    ok_count = sum(1 for r in results if r["status"] == "ok")
    return {
        "total": len(results),
        "ok": ok_count,
        "errors": len(results) - ok_count,
        "results": results,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("decoder2:app", host="0.0.0.0", port=8082, reload=True)