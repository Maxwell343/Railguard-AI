"""
RailGuard AI — Production Inference API
FastAPI + Ultralytics YOLOv8n for Railway Track Surface Defect Localization
Classes: 0: 'spalling', 1: 'wheel burn', 2: 'squat'
"""

import io
import os
import time
import logging
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Dict, List, Optional

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("railguard.inference")

from fastapi import FastAPI, File, Form, HTTPException, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image, UnidentifiedImageError
from ultralytics import YOLO

# ------------------------------------------------------------------------------
# Configuration & Path Resolution
# ------------------------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent
WEIGHTS_PATH = BASE_DIR / "weights" / "railguard_yolov8n_best.pt"
MAX_FILE_SIZE = int(os.getenv("MAX_UPLOAD_SIZE_BYTES", 25 * 1024 * 1024))  # 25 MB

# Official UIC 712 R Catalog and Action Protocols
CLASS_MAP: Dict[int, Dict[str, str]] = {
    0: {
        "raw_name": "spalling",
        "frontend_class": "spalling",
        "display_name": "Spalling / Flaking",
        "uic_code": "UIC 712 R / 221",
        "default_severity": "medium",
        "action": "Schedule rail reprofiling pass within standard maintenance interval (14 days). Monitor for micro-crack spall propagation.",
        "description": "Surface flaking and metallic sliver dislocation detected on running band gauge corner due to rolling contact fatigue.",
    },
    1: {
        "raw_name": "wheel burn",
        "frontend_class": "wheel_burn",
        "display_name": "Wheel Burn / Slip Damage",
        "uic_code": "UIC 712 R / 225",
        "default_severity": "high",
        "action": "Perform ultrasonic non-destructive examination. Polish or rebuild thermally martensitic zone before heavy freight transit.",
        "description": "Localized martensitic thermal discoloration with mechanical friction depression from locomotive tractive wheel slip.",
    },
    2: {
        "raw_name": "squat",
        "frontend_class": "squat",
        "display_name": "Squat Defect",
        "uic_code": "UIC 712 R / 227",
        "default_severity": "critical",
        "action": "Impose immediate 50 km/h Temporary Speed Restriction (TSR). Schedule emergency ultrasonic probe depth validation within 24h.",
        "description": "Localized surface indentation with crescent-shaped crack along running band. High risk of transverse rail fracture under dynamic axle shock.",
    },
}

# ------------------------------------------------------------------------------
# Global Model State & Lifespan Management
# ------------------------------------------------------------------------------
model: Optional[YOLO] = None
model_load_error: Optional[str] = None
model_device: str = "cpu"


def load_model_checkpoint() -> bool:
    """Load YOLOv8n model checkpoint if not already initialized."""
    global model, model_load_error, model_device
    if model is not None:
        return True

    if not WEIGHTS_PATH.exists():
        model_load_error = f"Model checkpoint not found at: {WEIGHTS_PATH}"
        print(f"[ERROR] {model_load_error}")
        return False

    try:
        print(f"[INFO] Loading YOLOv8n checkpoint from: {WEIGHTS_PATH}")
        loaded_model = YOLO(str(WEIGHTS_PATH))
        print(f"[INFO] Loaded model successfully with classes: {loaded_model.names}")
        model = loaded_model
        model_device = getattr(loaded_model, "device", "cpu") or "cpu"
        model_load_error = None
        return True
    except Exception as e:
        model_load_error = f"Failed to initialize YOLO model: {str(e)}"
        print(f"[ERROR] {model_load_error}")
        return False


@asynccontextmanager
async def lifespan(app: FastAPI):
    load_model_checkpoint()
    yield


app = FastAPI(
    title="RailGuard AI — Inference Engine",
    description="Automated optical railway track surface defect detection with YOLOv8n (Spalling, Wheel burn, Squat)",
    version="1.0.0",
    lifespan=lifespan,
)

# ------------------------------------------------------------------------------
# CORS Middleware Configuration
# ------------------------------------------------------------------------------
cors_origins_env = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001,http://localhost:5173,http://127.0.0.1:5173",
)
allowed_origins = [origin.strip() for origin in cors_origins_env.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if allowed_origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ------------------------------------------------------------------------------
# Endpoints
# ------------------------------------------------------------------------------
@app.get("/health")
@app.get("/api/v1/health")
@app.get("/api/v1/model/status")
def health_check():
    """
    Expose health status and whether the trained YOLOv8n checkpoint is loaded.
    """
    if model is None:
        load_model_checkpoint()
    is_healthy = model is not None and model_load_error is None
    return {
        "status": "healthy" if is_healthy else "degraded",
        "model_loaded": model is not None,
        "model_name": "YOLOv8n",
        "weights_path": str(WEIGHTS_PATH),
        "weights_file_exists": WEIGHTS_PATH.exists(),
        "weights_size_bytes": WEIGHTS_PATH.stat().st_size if WEIGHTS_PATH.exists() else 0,
        "classes": model.names if model is not None else {0: "spalling", 1: "wheel burn", 2: "squat"},
        "device": str(model_device),
        "error": model_load_error,
    }


@app.post("/api/v1/predict")
@app.post("/api/v1/detect")
async def predict_defects(
    file: UploadFile = File(..., description="Optical railway track image (JPEG, PNG, WebP)"),
    confidence: float = Form(0.15, description="Confidence threshold cutoff [0.05..0.95]"),
    iou: float = Form(0.45, description="Non-maximum suppression IoU threshold [0.1..0.9]"),
):
    """
    Run real YOLOv8n defect localization on the uploaded rail track image.
    Returns normalized bounding boxes matching the frontend inspection canvas.
    """
    # 1. Verify model availability
    if model is None:
        load_model_checkpoint()

    if model is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Inference model is not loaded: {model_load_error or 'Weights checkpoint unavailable'}",
        )

    # 2. Validate MIME type
    content_type = (file.content_type or "").lower()
    if not (content_type.startswith("image/") or content_type in ["application/octet-stream"]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file MIME type '{file.content_type}'. Please upload an image (JPEG, PNG, WebP, etc.).",
        )

    # 3. Read bytes & enforce upload size limit
    contents = await file.read()
    if len(contents) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty (0 bytes).",
        )

    if len(contents) > MAX_FILE_SIZE:
        mb = len(contents) / (1024 * 1024)
        raise HTTPException(
            status_code=status.HTTP_413_CONTENT_TOO_LARGE,
            detail=f"Uploaded file size ({mb:.1f} MB) exceeds maximum allowed {MAX_FILE_SIZE / (1024 * 1024):.0f} MB limit.",
        )

    # 4. Decode image in-memory (never permanently saved to disk)
    try:
        pil_image = Image.open(io.BytesIO(contents))
        pil_image.verify()  # Verify header and integrity
        # Re-open after verify() to load image pixels and convert to standard RGB
        pil_image = Image.open(io.BytesIO(contents)).convert("RGB")
    except (UnidentifiedImageError, Exception) as img_err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Malformed or corrupted image. Unable to decode image data: {str(img_err)}",
        )

    orig_width, orig_height = pil_image.size

    # Clamp thresholds to safe operational bounds
    conf_threshold = max(0.05, min(0.95, float(confidence)))
    iou_threshold = max(0.10, min(0.90, float(iou)))

    # 5. Execute real YOLOv8n inference pass
    start_time = time.perf_counter()
    try:
        results = model.predict(
            pil_image,
            conf=conf_threshold,
            iou=iou_threshold,
            imgsz=640,
            verbose=False,
        )
    except Exception as inf_err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"YOLOv8 inference engine error: {str(inf_err)}",
        )
    elapsed_ms = round((time.perf_counter() - start_time) * 1000, 1)

    # 6. Extract predictions
    predictions: List[Dict] = []
    if len(results) > 0 and results[0].boxes is not None:
        boxes = results[0].boxes
        for idx, box in enumerate(boxes):
            class_id = int(box.cls[0].item())
            conf_score = float(box.conf[0].item())

            # xywhn returns normalized [x_center, y_center, width, height]
            xywhn = box.xywhn[0].tolist()
            norm_w = max(0.0, min(1.0, float(xywhn[2])))
            norm_h = max(0.0, min(1.0, float(xywhn[3])))
            norm_x = max(0.0, min(1.0, float(xywhn[0] - norm_w / 2)))
            norm_y = max(0.0, min(1.0, float(xywhn[1] - norm_h / 2)))

            # xyxy returns pixel coordinates [x1, y1, x2, y2]
            xyxy = box.xyxy[0].tolist()
            pixel_coords = {
                "x1": round(float(xyxy[0]), 1),
                "y1": round(float(xyxy[1]), 1),
                "x2": round(float(xyxy[2]), 1),
                "y2": round(float(xyxy[3]), 1),
            }

            info = CLASS_MAP.get(
                class_id,
                {
                    "raw_name": str(model.names.get(class_id, f"class_{class_id}")),
                    "frontend_class": "spalling",
                    "display_name": f"Defect Class {class_id}",
                    "uic_code": "UIC 712 R",
                    "default_severity": "medium",
                    "action": "Inspect track geometry and evaluate with permanent way engineering team.",
                    "description": "Unclassified surface anomaly detected on rail crown.",
                },
            )

            predictions.append(
                {
                    "id": f"pred-{class_id}-{idx+1}",
                    "class_id": class_id,
                    "class_name": info["raw_name"],
                    "defect_class": info["frontend_class"],
                    "confidence": round(conf_score, 4),
                    "bbox": {
                        "x": round(norm_x, 4),
                        "y": round(norm_y, 4),
                        "width": round(norm_w, 4),
                        "height": round(norm_h, 4),
                    },
                    "bbox_pixel": pixel_coords,
                    "severity": info["default_severity"],
                    "uic_code": info["uic_code"],
                    "recommended_action": info["action"],
                    "technical_description": info["description"],
                    "speed_restriction_kmh": 50 if info["frontend_class"] == "squat" else None,
                    "depth_estimate_mm": None,
                    "depth_note": "Physical defect depth cannot be determined from 2D optical photography; ultrasonic probe NDT scan required.",
                    "estimated_area_mm2": None,
                }
            )

    # 7. Telemetry logging for operational observability
    logger.info(
        f"[INFERENCE] File: {file.filename} | Dims: {orig_width}x{orig_height} | "
        f"Conf Cutoff: {conf_threshold} | IoU: {iou_threshold} | Inference Time: {elapsed_ms}ms | "
        f"Retained detections: {len(predictions)}"
    )

    # 8. Compute summary severity across detected defects
    has_critical = any(p["severity"] == "critical" for p in predictions)
    has_high = any(p["severity"] == "high" for p in predictions)
    has_medium = any(p["severity"] == "medium" for p in predictions)

    summary_severity = (
        "critical"
        if has_critical
        else "high"
        if has_high
        else "medium"
        if has_medium
        else "low"
        if len(predictions) > 0
        else "none"
    )

    return {
        "inference_time_ms": elapsed_ms,
        "image_dimensions": {
            "width": orig_width,
            "height": orig_height,
        },
        "model": "YOLOv8n",
        "checkpoint": WEIGHTS_PATH.name,
        "confidence_threshold": conf_threshold,
        "iou_threshold": iou_threshold,
        "detections_count": len(predictions),
        "summary_severity": summary_severity,
        "is_demo_mode": False,  # Explicitly false: real model inference
        "predictions": predictions,
    }


if __name__ == "__main__":
    import uvicorn

    host = os.getenv("HOST", "127.0.0.1")
    port = int(os.getenv("PORT", 8000))
    print(f"Starting RailGuard AI Inference Service on http://{host}:{port}")
    uvicorn.run("backend.main:app", host=host, port=port, reload=False)
