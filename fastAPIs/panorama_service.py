import os
import cv2
import numpy as np
import pickle
import torch
import kornia.feature as KF
from fastapi import FastAPI, UploadFile, File
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List
import io
import json

import certifi

os.environ["SSL_CERT_FILE"] = certifi.where()

app = FastAPI(title="Panorama Stitching Service")

# ── Load config ────────────────────────────────────────────────────
with open("../pkls/panorama/pipeline_config.pkl", "rb") as f:
    CONFIG = pickle.load(f)

TILE_SIZE     = CONFIG["tile_size"]
CLAHE_CLIP    = CONFIG["clahe_clip"]
LOFTR_CONF    = CONFIG["loftr_conf"]
RANSAC_THRESH = CONFIG["ransac_thresh"]
BLEND_LEVELS  = CONFIG["blend_levels"]

# ── Load LoFTR ─────────────────────────────────────────────────────
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
loftr  = KF.LoFTR(pretrained="outdoor").to(device).eval()

# ── Helper Functions ───────────────────────────────────────────────
def apply_clahe(img_bgr):
    lab            = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2LAB)
    clahe          = cv2.createCLAHE(clipLimit=CLAHE_CLIP, tileGridSize=(8,8))
    lab[:, :, 0]   = clahe.apply(lab[:, :, 0])
    return cv2.cvtColor(lab, cv2.COLOR_LAB2BGR)

def to_gray_tensor(img_bgr, max_size=512):
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    h, w = gray.shape
    if max(h, w) > max_size:
        scale = max_size / max(h, w)
        gray  = cv2.resize(gray, (int(w*scale), int(h*scale)))
    tensor = torch.from_numpy(gray / 255.0).float()[None, None].to(device)
    return tensor, gray.shape

def match_loftr(img1_bgr, img2_bgr):
    t1, shape1 = to_gray_tensor(img1_bgr)
    t2, _      = to_gray_tensor(img2_bgr)
    with torch.no_grad():
        out = loftr({"image0": t1, "image1": t2})
    mkpts1 = out["keypoints0"].cpu().numpy()
    mkpts2 = out["keypoints1"].cpu().numpy()
    conf   = out["confidence"].cpu().numpy()
    mask   = conf > LOFTR_CONF
    mkpts1, mkpts2, conf = mkpts1[mask], mkpts2[mask], conf[mask]
    h1, w1 = shape1
    oh, ow  = img1_bgr.shape[:2]
    if oh != h1:
        mkpts1 *= [ow/w1, oh/h1]
        mkpts2 *= [ow/w1, oh/h1]
    return mkpts1, mkpts2, conf

def compute_homography(mkpts1, mkpts2):
    if len(mkpts1) < 10:
        return None
    H, mask = cv2.findHomography(
        mkpts1.reshape(-1,1,2),
        mkpts2.reshape(-1,1,2),
        cv2.RANSAC,
        ransacReprojThreshold=RANSAC_THRESH,
        maxIters=2000,
        confidence=0.995
    )
    return H

def gaussian_weight(h, w):
    gy = np.hanning(h)
    gx = np.hanning(w)
    return np.outer(gy, gx).astype(np.float32)

def build_panorama(tiles):
    """
    tiles: list of dicts
    {
      "img"  : numpy BGR image,
      "x1"   : int,
      "y1"   : int,
      "x2"   : int,
      "y2"   : int
    }
    """
    # ── Sort by (y1, x1) ──────────────────────────────────────────
    tiles = sorted(tiles, key=lambda t: (t["y1"], t["x1"]))

    # ── Canvas size ────────────────────────────────────────────────
    max_x = max(t["x2"] for t in tiles)
    max_y = max(t["y2"] for t in tiles)

    canvas     = np.zeros((max_y, max_x, 3), dtype=np.float32)
    weight_sum = np.zeros((max_y, max_x),    dtype=np.float32)

    for t in tiles:
        x1, y1 = t["x1"], t["y1"]
        x2, y2 = t["x2"], t["y2"]
        tw, th  = x2 - x1, y2 - y1

        # CLAHE
        img_enhanced = apply_clahe(t["img"])
        tile_img     = cv2.resize(img_enhanced, (tw, th)).astype(np.float32)

        # Gaussian weight
        w_map = gaussian_weight(th, tw)

        canvas[y1:y2, x1:x2]     += tile_img * w_map[:, :, np.newaxis]
        weight_sum[y1:y2, x1:x2] += w_map

    # ── Normalize ──────────────────────────────────────────────────
    weight_sum = np.maximum(weight_sum, 1e-8)
    panorama   = canvas / weight_sum[:, :, np.newaxis]
    panorama   = np.clip(panorama, 0, 255).astype(np.uint8)

    # ── Auto-crop ──────────────────────────────────────────────────
    gray  = cv2.cvtColor(panorama, cv2.COLOR_BGR2GRAY)
    mask  = gray > 5
    rows  = np.any(mask, axis=1)
    cols  = np.any(mask, axis=0)
    y_min, y_max = np.where(rows)[0][[0, -1]]
    x_min, x_max = np.where(cols)[0][[0, -1]]
    panorama = panorama[y_min:y_max+1, x_min:x_max+1]

    return panorama

# ── Request Model ──────────────────────────────────────────────────
class TileMetadata(BaseModel):
    x1: int
    y1: int
    x2: int
    y2: int

# ── Endpoints ─────────────────────────────────────────────────────
@app.get("/")
def root():
    return {"status": "Panorama Service Running"}

@app.get("/health")
def health():
    return {
        "status" : "ok",
        "device" : str(device),
        "config" : {
            "tile_size"    : TILE_SIZE,
            "clahe_clip"   : CLAHE_CLIP,
            "loftr_conf"   : LOFTR_CONF,
            "ransac_thresh": RANSAC_THRESH
        }
    }

# FIXED — explicitly declare it as a Form field
from fastapi import FastAPI, UploadFile, File, Form

@app.post("/stitch")
async def stitch_panorama(
    files    : List[UploadFile] = File(...),
    metadata : str              = Form(...)   
):
    """
    Input:
      - files    : list of tile images
      - metadata : JSON string with coordinates for each tile
                   [{"x1":0,"y1":0,"x2":1024,"y2":1024}, ...]

    Output:
      - panorama image as JPEG
    """
    # ── Parse metadata ─────────────────────────────────────────────
    if metadata:
        coords = json.loads(metadata)
    else:
        return {"error": "metadata required"}

    if len(files) != len(coords):
        return {"error": f"files({len(files)}) != metadata({len(coords)})"}

    # ── Load tiles ─────────────────────────────────────────────────
    tiles = []
    for f, c in zip(files, coords):
        contents = await f.read()
        nparr    = np.frombuffer(contents, np.uint8)
        img      = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            continue
        tiles.append({
            "img": img,
            "x1" : c["x1"],
            "y1" : c["y1"],
            "x2" : c["x2"],
            "y2" : c["y2"]
        })

    if len(tiles) < 2:
        return {"error": "need at least 2 tiles"}

    # ── Build panorama ─────────────────────────────────────────────
    panorama = build_panorama(tiles)

    # ── Return as JPEG ─────────────────────────────────────────────
    _, buffer = cv2.imencode(".jpg", panorama,
                             [cv2.IMWRITE_JPEG_QUALITY, 95])
    return StreamingResponse(
        io.BytesIO(buffer.tobytes()),
        media_type="image/jpeg"
    )

# ── Run ────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)