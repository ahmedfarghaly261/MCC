import io
import json
import logging
import os
from typing import Optional
from fastapi import FastAPI, File, UploadFile, Query, HTTPException, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import numpy as np
import cv2
import torch
import torch.nn as nn
from PIL import Image

# Initialize logger and application setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("water_segmentation_api")

app = FastAPI(
    title="Satellite Water Body Segmentation API",
    description="Production endpoints for processing multi-spectral aerial captures to compute boundary segmentation maps and coverage arrays.",
    version="1.0.0"
)

# ----------------------------------------------------------------------
# 1. Custom PyTorch U-Net Dynamic Model Layer Definition
# ----------------------------------------------------------------------
class DoubleConv(nn.Module):
    def __init__(self, in_channels: int, out_channels: int):
        super().__init__()
        self.conv = nn.Sequential(
            nn.Conv2d(in_channels, out_channels, kernel_size=3, padding=1, bias=False),
            nn.BatchNorm2d(out_channels),
            nn.ReLU(inplace=True),
            nn.Conv2d(out_channels, out_channels, kernel_size=3, padding=1, bias=False),
            nn.BatchNorm2d(out_channels),
            nn.ReLU(inplace=True)
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.conv(x)


class DownBlock(nn.Module):
    def __init__(self, in_channels: int, out_channels: int):
        super().__init__()
        self.down = nn.Sequential(
            nn.MaxPool2d(2),
            DoubleConv(in_channels, out_channels)
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.down(x)


class UpBlock(nn.Module):
    def __init__(self, in_channels: int, out_channels: int):
        super().__init__()
        self.up = nn.ConvTranspose2d(in_channels, in_channels // 2, kernel_size=2, stride=2)
        self.conv = DoubleConv(in_channels, out_channels)

    def forward(self, x1: torch.Tensor, x2: torch.Tensor) -> torch.Tensor:
        x1 = self.up(x1)
        # Handle shape padding safely for dimensions mismatches if needed
        diff_y = x2.size()[2] - x1.size()[2]
        diff_x = x2.size()[3] - x1.size()[3]
        if diff_y > 0 or diff_x > 0:
            x1 = nn.functional.pad(x1, [diff_x // 2, diff_x - diff_x // 2, diff_y // 2, diff_y - diff_y // 2])
        x = torch.cat([x2, x1], dim=1)
        return self.conv(x)


class UNet(nn.Module):
    def __init__(self, in_channels: int = 3, base_filters: int = 64):
        super().__init__()
        self.init_conv = DoubleConv(in_channels, base_filters)
        self.down1 = DownBlock(base_filters, base_filters * 2)
        self.down2 = DownBlock(base_filters * 2, base_filters * 4)
        self.down3 = DownBlock(base_filters * 4, base_filters * 8)
        self.down4 = DownBlock(base_filters * 8, base_filters * 16)
        
        self.up1 = UpBlock(base_filters * 16, base_filters * 8)
        self.up2 = UpBlock(base_filters * 8, base_filters * 4)
        self.up3 = UpBlock(base_filters * 4, base_filters * 2)
        self.up4 = UpBlock(base_filters * 2, base_filters)
        self.head = nn.Conv2d(base_filters, 1, kernel_size=1)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        s1 = self.init_conv(x)
        s2 = self.down1(s1)
        s3 = self.down2(s2)
        s4 = self.down3(s3)
        b = self.down4(s4)
        
        d4 = self.up1(b, s4)
        d3 = self.up2(d4, s3)
        d2 = self.up3(d3, s2)
        d1 = self.up4(d2, s1)
        return self.head(d1)


# ----------------------------------------------------------------------
# 2. Global State Setup, Weight Injection, and Preprocessing Context
# ----------------------------------------------------------------------
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
TILE_SIZE = 256
WEIGHTS_PATH = os.getenv(
    "SEGMENTATION_WEIGHTS_PATH",
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "pkls", "water_segmentation_weights.pth")),
)

# Exact statistical norms utilized during ImageNet tensor standardization
MEAN = np.array([0.485, 0.456, 0.406], dtype=np.float32)
STD = np.array([0.229, 0.224, 0.225], dtype=np.float32)

model: Optional[UNet] = None

@app.on_event("startup")
def load_segmentation_engine():
    """Initializes and safely maps trained weights into memory on server lifecycle startup."""
    global model
    try:
        model = UNet(in_channels=3, base_filters=64)
        # Safely capture either pure model state or checkpoint container format keys
        raw_state = torch.load(WEIGHTS_PATH, map_location=DEVICE)
        if "model_state_dict" in raw_state:
            state_dict = raw_state["model_state_dict"]
        else:
            state_dict = raw_state

        model.load_state_dict(state_dict)
        model.to(DEVICE)
        model.eval()
        logger.info(f"Successfully injected segmentation parameters onto engine execution targets: [{DEVICE}]")
    except FileNotFoundError:
        logger.error(f"Execution failed: Could not locate weight matrix map at baseline trajectory: '{WEIGHTS_PATH}'")
        # Keep the HTTP process alive so /health reports the missing weights.
        # Supplying the .pth file makes this service healthy.
        model = None
    except Exception as exc:
        logger.error(f"Critical execution fault initializing runtime model layers: {str(exc)}")
        raise exc


# ----------------------------------------------------------------------
# 3. Model Preprocessing & Analytics Utilities
# ----------------------------------------------------------------------
def pipeline_preprocess(image_bytes: bytes):
    """Processes incoming bytes array into normalized float tensors matching model requirements."""
    pil_image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    original_dimensions = pil_image.size  # (Width, Height)
    
    # 1. Resize image to the network structure sizing parameters
    resized_img = pil_image.resize((TILE_SIZE, TILE_SIZE), Image.Resampling.BILINEAR)
    np_img = np.array(resized_img, dtype=np.float32) / 255.0
    
    # 2. Standardize array via structural statistics mapping rules
    normalized_img = (np_img - MEAN) / STD
    
    # 3. Permute channel layout configuration matrix matching PyTorch expectations [Channels, Height, Width]
    tensor_img = torch.from_numpy(normalized_img).permute(2, 0, 1).float()
    tensor_img = tensor_img.unsqueeze(0)  # [1, Channels, TILE_SIZE, TILE_SIZE]
    
    return tensor_img, pil_image, original_dimensions


class AnalysisResponse(BaseModel):
    water_coverage_percentage: float
    water_pixel_count: int
    land_pixel_count: int
    total_pixel_count: int
    image_width: int
    image_height: int
    applied_threshold: float


# ----------------------------------------------------------------------
# 4. Production API Endpoints Context Definitions
# ----------------------------------------------------------------------
@app.get("/health", status_code=status.HTTP_200_OK)
async def check_health():
    """Sanity probe verification returning status mapping indicators."""
    if model is None:
        raise HTTPException(status_code=503, detail="Segmentation architecture remains unmapped in active space memory context.")
    return {"status": "healthy", "hardware_device": str(DEVICE)}


@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_coverage(
    file: UploadFile = File(...),
    threshold: float = Query(0.95, ge=0.0, le=1.0, description="Confidence decision boundary mask value classification limit configuration parameter.")
):
    """Parses visual upload telemetry array data arrays and evaluates spatial metadata indices payload back."""
    if model is None:
        raise HTTPException(status_code=503, detail="Active inferencing pipeline layer structures uninitialized.")
        
    try:
        contents = await file.read()
        tensor_in, _, (w, h) = pipeline_preprocess(contents)
        
        # Execute numerical matrix evaluation inside non-tracking layer scopes
        with torch.no_grad():
            logits = model(tensor_in.to(DEVICE))
            probability_matrix = torch.sigmoid(logits).squeeze().cpu().numpy()
            
        # Safely upsample the resolution configurations array to native layout coordinates mapping targets
        native_prob_map = cv2.resize(probability_matrix, (w, h), interpolation=cv2.INTER_LINEAR)
        
        # Apply strict dynamic execution target decision boundary matrix
        binary_water_mask = native_prob_map >= threshold
        water_pixels = int(np.sum(binary_water_mask))
        total_pixels = int(w * h)
        land_pixels = total_pixels - water_pixels
        coverage_percentage = float((water_pixels / total_pixels) * 100.0)
        
        return AnalysisResponse(
            water_coverage_percentage=round(coverage_percentage, 4),
            water_pixel_count=water_pixels,
            land_pixel_count=land_pixels,
            total_pixel_count=total_pixels,
            image_width=w,
            image_height=h,
            applied_threshold=threshold
        )
    except Exception as err:
        logger.error(f"Encountered matrix parsing pipeline evaluation fatal mismatch context: {str(err)}")
        raise HTTPException(status_code=500, detail=f"Pipeline exception handling sequence failure configuration mapping target: {str(err)}")


@app.post("/segment", response_class=StreamingResponse)
async def generate_segmentation_visuals(
    file: UploadFile = File(...),
    threshold: float = Query(0.95, ge=0.0, le=1.0),
    output_type: str = Query("overlay", regex="^(overlay|mask)$", description="Type of visual map payload to serialize back to binary channel streams.")
):
    """Generates visual pixel-level classification overlay responses back directly as stream buffers data contexts."""
    if model is None:
        raise HTTPException(status_code=503, detail="Active model inferencing pipelines missing from working process targets mappings.")
        
    try:
        contents = await file.read()
        tensor_in, pil_orig, (w, h) = pipeline_preprocess(contents)
        
        with torch.no_grad():
            logits = model(tensor_in.to(DEVICE))
            prob_map = torch.sigmoid(logits).squeeze().cpu().numpy()
            
        prob_map_resized = cv2.resize(prob_map, (w, h), interpolation=cv2.INTER_LINEAR)
        binary_mask = (prob_map_resized >= threshold).astype(np.uint8) * 255
        
        if output_type == "mask":
            # Return directly pure grayscale alpha masks maps array target contexts
            res_image = Image.fromarray(binary_mask, mode="L")
            format_ext = "PNG"
            mime_str = "image/png"
        else:
            # Replicate the notebook transparency mix alpha composition tracking blueprint
            original_rgb = np.array(pil_orig)
            visual_overlay = original_rgb.copy()
            
            # Map where condition evaluation arrays
            water_indices = (binary_mask == 255)
            
            # Notebook transparency equation mapping parameters mix matching logic rules configurations
            # original * 0.40 + cyan_tint * 0.60
            visual_overlay[water_indices] = (
                original_rgb[water_indices].astype(np.float32) * 0.40 +
                np.array([0, 100, 255], dtype=np.float32) * 0.60
            ).astype(np.uint8)
            
            # Extract boundaries geometries masks contours maps inside exact opencv properties context arrays
            contours, _ = cv2.findContours(binary_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            # Render standard bright golden trace contours borders mapping boundary logic rules
            cv2.drawContours(visual_overlay, contours, -1, (255, 220, 0), 2)
            
            res_image = Image.fromarray(visual_overlay, mode="RGB")
            format_ext = "JPEG"
            mime_str = "image/jpeg"
            
        # Buffer image context arrays out into continuous asynchronous server stream targets
        img_buffer = io.BytesIO()
        res_image.save(img_buffer, format=format_ext)
        img_buffer.seek(0)
        
        return StreamingResponse(img_buffer, media_type=mime_str)
    except Exception as err:
        logger.error(f"Failed handling mask image synthesis matrix layout calculations target logic sequence: {str(err)}")
        raise HTTPException(status_code=500, detail=f"Visual compilation phase fault context logic failure error mapping structure: {str(err)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.py:app", host="0.0.0.0", port=8000, reload=True)
