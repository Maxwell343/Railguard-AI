"""
Automated Backend Tests for RailGuard AI FastAPI Inference Engine
Tests:
- Health endpoint behavior
- Unsupported or malformed image uploads
- Upload-size validation
- Response schema on real image
- Missing-checkpoint behavior diagnostic
"""

import io
from pathlib import Path
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient
from PIL import Image

from backend.main import app, WEIGHTS_PATH


@pytest.fixture(scope="module")
def client():
    """Create test client with lifespan context to load model."""
    with TestClient(app) as test_client:
        yield test_client


def create_test_image(width: int = 640, height: int = 640, color: tuple = (128, 128, 128)) -> io.BytesIO:
    """Generate a valid in-memory JPEG test image."""
    img = Image.new("RGB", (width, height), color=color)
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    buf.seek(0)
    return buf


# ------------------------------------------------------------------------------
# 1. Health Endpoint Tests
# ------------------------------------------------------------------------------
def test_health_endpoint(client: TestClient):
    """Verify that /health reports model readiness and correct 3 classes."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()

    assert data["status"] == "healthy"
    assert data["model_loaded"] is True
    assert data["model_name"] == "YOLOv8n"
    assert data["weights_file_exists"] is True
    assert data["weights_size_bytes"] > 0

    # Verify model classes exactly match: 0: spalling, 1: wheel burn, 2: squat
    classes = data["classes"]
    assert classes.get("0") == "spalling"
    assert classes.get("1") == "wheel burn"
    assert classes.get("2") == "squat"


# ------------------------------------------------------------------------------
# 2. Unsupported and Malformed Image Upload Tests
# ------------------------------------------------------------------------------
def test_reject_unsupported_mime_type(client: TestClient):
    """Verify that non-image file uploads (e.g. text/plain) are rejected with HTTP 400."""
    response = client.post(
        "/api/v1/predict",
        files={"file": ("test.txt", b"Permanent way track telemetry", "text/plain")},
        data={"confidence": 0.45},
    )
    assert response.status_code == 400
    assert "Invalid file MIME type" in response.json()["detail"]


def test_reject_empty_file(client: TestClient):
    """Verify that an empty file upload is rejected with HTTP 400."""
    response = client.post(
        "/api/v1/predict",
        files={"file": ("empty.jpg", b"", "image/jpeg")},
        data={"confidence": 0.45},
    )
    assert response.status_code == 400
    assert "Uploaded file is empty" in response.json()["detail"]


def test_reject_corrupted_malformed_image(client: TestClient):
    """Verify that a corrupted image stream is safely caught and rejected with HTTP 400."""
    corrupt_bytes = b"\xff\xd8\xff\xe0" + b"NotARealJpegImageCorruptStream123456789"
    response = client.post(
        "/api/v1/predict",
        files={"file": ("corrupt.jpg", corrupt_bytes, "image/jpeg")},
        data={"confidence": 0.45},
    )
    assert response.status_code == 400
    assert "Malformed or corrupted image" in response.json()["detail"]


# ------------------------------------------------------------------------------
# 3. Upload Size Validation Tests
# ------------------------------------------------------------------------------
def test_reject_oversized_upload(client: TestClient):
    """Verify that uploads exceeding 25 MB are rejected with HTTP 413."""
    # Temporarily set max size to 100 KB for test performance without allocating 25MB
    with patch("backend.main.MAX_FILE_SIZE", 100 * 1024):
        large_bytes = b"0" * (101 * 1024)
        response = client.post(
            "/api/v1/predict",
            files={"file": ("oversized.jpg", large_bytes, "image/jpeg")},
            data={"confidence": 0.45},
        )
        assert response.status_code == 413
        assert "exceeds maximum allowed" in response.json()["detail"]


# ------------------------------------------------------------------------------
# 4. Response Schema and Real Inference Tests
# ------------------------------------------------------------------------------
def test_prediction_response_schema(client: TestClient):
    """Verify response structure and normalized coordinate bounds on valid image."""
    img_buf = create_test_image(width=800, height=600)

    response = client.post(
        "/api/v1/predict",
        files={"file": ("track_sample.jpg", img_buf.getvalue(), "image/jpeg")},
        data={"confidence": 0.25, "iou": 0.45},
    )

    assert response.status_code == 200
    data = response.json()

    # Schema field checks
    assert "inference_time_ms" in data
    assert isinstance(data["inference_time_ms"], (int, float))
    assert data["image_dimensions"]["width"] == 800
    assert data["image_dimensions"]["height"] == 600
    assert data["model"] == "YOLOv8n"
    assert data["is_demo_mode"] is False
    assert "predictions" in data
    assert isinstance(data["predictions"], list)

    # If predictions are detected on the synthetic image, check their schema
    for pred in data["predictions"]:
        assert "id" in pred
        assert pred["defect_class"] in ["spalling", "wheel_burn", "squat"]
        assert 0.0 <= pred["confidence"] <= 1.0

        # Normalized coordinates MUST be within [0..1]
        bbox = pred["bbox"]
        assert 0.0 <= bbox["x"] <= 1.0
        assert 0.0 <= bbox["y"] <= 1.0
        assert 0.0 <= bbox["width"] <= 1.0
        assert 0.0 <= bbox["height"] <= 1.0

        # Pixel coordinates
        bbox_px = pred["bbox_pixel"]
        assert 0.0 <= bbox_px["x1"] <= 800
        assert 0.0 <= bbox_px["y1"] <= 600

        # Confirm optical estimate transparency
        assert pred["depth_estimate_mm"] is None
        assert "depth cannot be determined from 2D optical photography" in pred["depth_note"].lower()


# ------------------------------------------------------------------------------
# 5. Missing Checkpoint Diagnostic Test
# ------------------------------------------------------------------------------
def test_missing_checkpoint_diagnostic(client: TestClient):
    """Verify that when the model is not loaded, requests return HTTP 503 with clear diagnostics."""
    with patch("backend.main.model", None), \
         patch("backend.main.load_model_checkpoint", return_value=False), \
         patch("backend.main.model_load_error", "Simulated missing weights"):
        img_buf = create_test_image()
        response = client.post(
            "/api/v1/predict",
            files={"file": ("track.jpg", img_buf.getvalue(), "image/jpeg")},
            data={"confidence": 0.45},
        )
        assert response.status_code == 503
        assert "Inference model is not loaded" in response.json()["detail"]
        assert "Simulated missing weights" in response.json()["detail"]
