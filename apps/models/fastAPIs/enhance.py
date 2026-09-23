import cv2
import numpy as np
import io
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import StreamingResponse

app = FastAPI(
    title="Satellite Image Enhancement API",
    description="An adaptive pipeline for satellite imagery with AVX2 compatibility fixes.",
    version="1.1.0"
)

# --- ENHANCEMENT MODULE LOGIC ---

def _analyze(img):
    """Internal helper to compute quality metrics."""
    # Convert to float32 for initial analysis
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY).astype(np.float32)
    
    brightness = float(np.mean(gray))
    contrast   = float(gray.std())
    
    # FIX: Use CV_32F to avoid Format 5 -> Format 6 (AVX2 mismatch)
    sharpness  = float(cv2.Laplacian(gray, cv2.CV_32F).var())
    
    dark_ratio = float(np.sum(gray < 50) / gray.size)
    local_mean = cv2.blur(gray, (5, 5))
    snr        = brightness / (float(np.std(np.abs(gray - local_mean))) + 1e-6)
    
    return {
        "brightness"      : brightness,
        "contrast"        : contrast,
        "sharpness"       : sharpness,
        "dark_ratio"      : dark_ratio,
        "is_dark"         : brightness < 80,
        "is_low_contrast" : contrast   < 40,
        "is_blurry"       : sharpness  < 150,
        "is_noisy"        : snr        < 5.0,
        "has_dark_regions": dark_ratio > 0.15,
    }

def enhance_image(img: np.ndarray) -> np.ndarray:
    """Adaptive enhancement pipeline with explicit type safety for hardware acceleration."""
    if img is None or img.size == 0:
        raise ValueError("Empty image received.")

    info = _analyze(img)
    # Ensure starting point is a standard uint8 array
    out = np.ascontiguousarray(img, dtype=np.uint8)

    # 1. Denoise
    if info["is_noisy"] or info["contrast"] < 50:
        out = cv2.fastNlMeansDenoisingColored(out, None, 8, 8, 7, 21)

    # 2. Shadow recovery
    if info["has_dark_regions"] or info["is_dark"]:
        strength = 80 if info["brightness"] < 50 else 55
        hsv      = cv2.cvtColor(out, cv2.COLOR_BGR2HSV).astype(np.float32)
        h, s, v  = cv2.split(hsv)
        mask     = (v < 100).astype(np.float32)
        v        = np.clip(v + strength * mask * (1.0 - v / 100.0), 0, 255)
        # CAST BACK TO UINT8 immediately
        out      = cv2.cvtColor(cv2.merge([h, s, v]).astype(np.uint8), cv2.COLOR_HSV2BGR)

    # 3. Gamma correction
    if info["is_dark"]:
        g     = 1.8 if info["brightness"] < 50 else 1.4
        table = np.array([(i/255.0)**(1.0/g)*255 for i in range(256)], np.uint8)
        out   = cv2.LUT(out, table)

    # 4. Histogram stretch
    if info["is_low_contrast"]:
        tmp = np.zeros_like(out)
        for i in range(3):
            ch = out[:,:,i].astype(np.float32)
            lo, hi = ch.min(), ch.max()
            tmp[:,:,i] = ((ch-lo)/(hi-lo)*255).astype(np.uint8) if hi > lo else out[:,:,i]
        out = tmp

    # 5. CLAHE (Local Contrast)
    clip  = 4.0 if info["is_low_contrast"] else 2.5
    c     = cv2.createCLAHE(clipLimit=clip, tileGridSize=(8, 8))
    lab   = cv2.cvtColor(out, cv2.COLOR_BGR2LAB)
    l,a,b = cv2.split(lab)
    out   = cv2.cvtColor(cv2.merge([c.apply(l), a, b]), cv2.COLOR_LAB2BGR)

    # 6. Bilateral Filter
    out = cv2.bilateralFilter(out, 9, 75, 75)

    # 7. Unsharp mask
    if info["is_blurry"] or info["contrast"] < 60:
        s       = 1.5 if info["sharpness"] < 80 else 1.1
        blurred = cv2.GaussianBlur(out, (0,0), 1.5)
        # Ensure result is clipped and cast to uint8 to prevent format drift
        out     = np.clip(cv2.addWeighted(out, 1+s, blurred, -s, 0), 0, 255).astype(np.uint8)

    # 8. Detail enhance (MAJOR FIX: Force contiguous uint8)
    out = np.ascontiguousarray(out, dtype=np.uint8)
    out = cv2.detailEnhance(out, sigma_s=10, sigma_r=0.12)

    # 9. Color boost
    hsv          = cv2.cvtColor(out, cv2.COLOR_BGR2HSV).astype(np.float32)
    hsv[:,:,1]   = np.clip(hsv[:,:,1] * 1.15, 0, 255)
    out          = cv2.cvtColor(hsv.astype(np.uint8), cv2.COLOR_HSV2BGR)

    return out

# --- API ENDPOINTS ---

@app.get("/")
async def health_check():
    return {"status": "online", "model": "Satellite Enhancement Pipeline"}

@app.post("/enhance")
async def enhance(file: UploadFile = File(...)):
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if img is None:
        raise HTTPException(status_code=400, detail="Invalid image format.")

    try:
        enhanced_img = enhance_image(img)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Enhancement failed: {str(e)}")

    _, encoded_img = cv2.imencode('.png', enhanced_img)
    return StreamingResponse(io.BytesIO(encoded_img.tobytes()), media_type="image/png")

if __name__ == "__main__":
    import uvicorn
    # Using python -m uvicorn is recommended if your venv is acting up
    uvicorn.run(app, host="0.0.0.0", port=8001)