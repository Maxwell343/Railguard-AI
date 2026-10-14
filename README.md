# RailGuard AI — Railway Track Defect Detection & Severity Assessment System

RailGuard AI is an industrial-grade permanent way engineering software application designed for railway track inspectors, permanent way engineers, and infrastructure authorities. It delivers automated surface defect localization using a fine-tuned **YOLOv8n** model, UIC 712 R severity evaluation, and maintenance protocol enforcement.

---

## 1. System Architecture

```
RailGuard AI
├── frontend/ (React 18 + TypeScript + Vite + Tailwind CSS)
│   ├── src/components/inspection/  (Canvas, Defect Dossier, Docket Modal)
│   ├── src/services/railGuardApi.ts (Typed HTTP API client with predict/health integration)
│   └── src/views/                  (Workspace, Audit Log, Severity Matrix, Model Specs)
└── backend/ (FastAPI + Ultralytics YOLOv8 + PIL)
    ├── main.py                     (Inference service, CORS, health & prediction endpoints)
    ├── requirements.txt            (FastAPI, Uvicorn, Ultralytics, PyTorch, Pillow, Pytest)
    ├── weights/                    (Trained YOLOv8n checkpoint: railguard_yolov8n_best.pt)
    └── tests/test_api.py           (Automated test suite: health, validation, schema, diagnostics)
```

- **Model Architecture**: Ultralytics YOLOv8 Nano (`YOLOv8n`) trained on 640×640 optical rail scans.
- **Trained Checkpoint**: `backend/weights/railguard_yolov8n_best.pt` (6.2 MB)
- **Dataset**: RSD-YOLO Dataset v1.0 (4,020 images total: 3,216 train, 402 validation, 402 held-out test)
- **Trained Classes (Exact Order)**:
  - **Class 0**: `spalling` (UIC 712 R / Code 221 — Rolling Contact Fatigue)
  - **Class 1**: `wheel burn` (UIC 712 R / Code 225 — Martensitic slip damage)
  - **Class 2**: `squat` (UIC 712 R / Code 227 — Transverse sub-surface crack propagation)
- **Independently Verified Benchmark Metrics (402 Held-out Test Images)**:
  - Precision: 66.7% (Reported: 65.1%)
  - Recall: 73.9% (Reported: 73.0%)
  - mAP@0.5: 72.5% (Reported: 71.9%)
  - mAP@0.5:0.95: 34.4% (Reported: 34.6%)
  - Per-class AP@0.5: Spalling = 75.1%, Wheel Burn = 76.8%, Squat = 65.5%

---

## 2. Windows PowerShell Setup & Execution Guide

Follow these exact steps in Windows PowerShell to set up and run the system:

### Step 1: Create Python Virtual Environment
Open Windows PowerShell in the project root directory (`d:\Maxwell\Projects\AIDS_MP`):
```powershell
python -m venv venv
```

### Step 2: Activate the Virtual Environment
```powershell
.\venv\Scripts\Activate.ps1
```
*(If PowerShell restricts script execution, run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` first).*

### Step 3: Install Backend Dependencies
```powershell
pip install -r backend/requirements.txt
```

### Step 4: Run Backend Automated Tests
```powershell
python -m pytest backend/tests/test_api.py -v
```

### Step 5: Start the FastAPI Inference Service (Port 8000)
```powershell
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```
> The API will be active at `http://127.0.0.1:8000`

### Step 6: Start the Frontend Application (Port 3000)
Open a **second PowerShell terminal** in the project root directory:
```powershell
npm run dev
```
> Access the web application at `http://localhost:3000/`

---

## 3. Verification & API Testing

### Check Backend Health
In PowerShell:
```powershell
Invoke-RestMethod -Uri "http://127.0.0.1:8000/health"
```
**Expected Response:**
```json
{
  "status": "healthy",
  "model_loaded": true,
  "model_name": "YOLOv8n",
  "weights_path": "...\\backend\\weights\\railguard_yolov8n_best.pt",
  "weights_file_exists": true,
  "classes": {
    "0": "spalling",
    "1": "wheel burn",
    "2": "squat"
  },
  "device": "cpu"
}
```

### Execute a Prediction via Command Line
```powershell
# Using curl.exe (built into Windows) to submit an optical track photo
curl.exe -X POST "http://127.0.0.1:8000/api/v1/predict" `
  -F "file=@path\to\your\rail_image.jpg" `
  -F "confidence=0.45" `
  -F "iou=0.45"
```

---

## 4. Environment Variables

### Frontend Configuration (`.env`)
```ini
# Connect directly to the live FastAPI backend
VITE_USE_LIVE_API=true

# API endpoint URL
VITE_API_ENDPOINT=http://localhost:8000/api/v1
```

### Backend Configuration (`backend/.env.example`)
```ini
HOST=127.0.0.1
PORT=8000
WEIGHTS_PATH=weights/railguard_yolov8n_best.pt
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
MAX_UPLOAD_SIZE_BYTES=26214440
```

---

## 5. Verification Commands

| Command | Purpose |
| :--- | :--- |
| `python -m pytest backend/tests/test_api.py -v` | Executes 7 backend test suites |
| `npx tsc --noEmit` | Typechecks all TypeScript files (0 errors) |
| `npm run build` | Produces optimized production bundle |
