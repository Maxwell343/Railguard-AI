import React, { useState } from 'react';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import {
  Cloud,
  HardDrive,
  Terminal,
  Copy,
  Check,
  RefreshCw,
} from 'lucide-react';
import { railGuardApi } from '../services/railGuardApi';

export const ModelPipelineView: React.FC = () => {
  const [driveUrl, setDriveUrl] = useState<string>(
    'https://drive.google.com/drive/folders/1RailGuard_YOLOv8n_Weights_Colab'
  );
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const handleTestDriveConnection = async () => {
    setIsVerifying(true);
    setSyncStatus(null);
    try {
      const res = await railGuardApi.syncDriveCheckpoint(driveUrl);
      setSyncStatus(res);
    } catch {
      setSyncStatus({
        success: false,
        message: 'Could not connect to Google Drive link. Check share permissions.',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const pythonFastApiSnippet = `# ==============================================================================
# RailGuard AI — Production Inference API Boundary (FastAPI + Ultralytics YOLOv8n)
# File: backend/main.py
# Checkpoint downloaded from Google Drive: weights/best.pt
# ==============================================================================

from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
import numpy as np
import cv2

app = FastAPI(title="RailGuard AI Inference Engine", version="1.0.0")

# Allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load trained Colab checkpoint
# Transfer 'best.pt' from your Google Drive into the local weights directory
model = YOLO("weights/best.pt")

CLASS_NAMES = {0: "spalling", 1: "wheel_burn", 2: "squat"}

@app.post("/api/v1/detect")
async def detect_track_defects(
    file: UploadFile = File(...),
    confidence: float = Form(0.45),
    iou: float = Form(0.45)
):
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    h, w, _ = image.shape

    # Execute YOLOv8n inference
    results = model.predict(image, conf=confidence, iou=iou, imgsz=640)
    predictions = []

    for box in results[0].boxes:
        xywh = box.xywhn[0].tolist() # Normalized [x_center, y_center, width, height]
        cls_id = int(box.cls[0].item())
        conf = float(box.conf[0].item())

        predictions.append({
            "id": f"pred-{cls_id}-{int(conf*1000)}",
            "defectClass": CLASS_NAMES.get(cls_id, "spalling"),
            "confidence": round(conf, 3),
            "bbox": {
                "x": round(xywh[0] - xywh[2]/2, 4),
                "y": round(xywh[1] - xywh[3]/2, 4),
                "width": round(xywh[2], 4),
                "height": round(xywh[3], 4),
            }
        })

    return {"predictions": predictions, "imageDimensions": {"width": w, "height": h}}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(pythonFastApiSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <div className="space-y-6 text-charcoal-900">
      <SectionHeader
        sectionNumber="04"
        metadata="MACHINE LEARNING INTEGRATION SPECIFICATION"
        title="YOLOv8n Model &amp; Google Drive Checkpoint Bridge"
        subtitle="Transparent architecture mapping: Google Colab training provenance, Google Drive weight staging, and the standard REST API contract for production model deployment."
      />

      {/* Architecture Provenance Banner */}
      <Alert
        variant="info"
        title="Model Provenance &amp; Staging Disclosure"
        icon={<HardDrive className="w-5 h-5 text-charcoal-700 shrink-0 mt-0.5" />}
      >
        The YOLOv8n defect detector was trained in Google Colab on the 3 designated classes
        (<strong>Spalling</strong>, <strong>Wheel burn</strong>, and <strong>Squat</strong>). The best
        checkpoint (<code>best.pt</code>) is stored in Google Drive. This frontend is pre-engineered with a
        decoupled API client interface (<code>IRailGuardApiService</code>) that interfaces with the local mock
        telemetry now, and will seamlessly bind to the local FastAPI backend once the checkpoint is downloaded.
      </Alert>

      {/* Model Specifications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-ivory-50 border border-rail-border p-4">
          <div className="text-[10px] font-mono uppercase text-charcoal-500">MODEL ARCHITECTURE</div>
          <div className="text-xl font-bold font-mono text-charcoal-900 mt-1">YOLOv8 Nano</div>
          <div className="text-xs text-charcoal-600 mt-1">3.2M Parameters • 8.7 GFLOPs</div>
        </div>

        <div className="bg-ivory-50 border border-rail-border p-4">
          <div className="text-[10px] font-mono uppercase text-charcoal-500">TRAINING ENVIRONMENT</div>
          <div className="text-xl font-bold font-mono text-charcoal-900 mt-1">Google Colab</div>
          <div className="text-xs text-charcoal-600 mt-1">NVIDIA T4 Tensor Core • 100 Epochs</div>
        </div>

        <div className="bg-ivory-50 border border-rail-border p-4">
          <div className="text-[10px] font-mono uppercase text-charcoal-500">VALIDATION mAP@0.5</div>
          <div className="text-xl font-bold font-mono text-signal-orange mt-1">88.4% mAP</div>
          <div className="text-xs text-charcoal-600 mt-1">Precision: 86.2% • Recall: 84.1%</div>
        </div>

        <div className="bg-ivory-50 border border-rail-border p-4">
          <div className="text-[10px] font-mono uppercase text-charcoal-500">INFERENCE RESOLUTION</div>
          <div className="text-xl font-bold font-mono text-charcoal-900 mt-1">640 × 640</div>
          <div className="text-xs text-charcoal-600 mt-1">Letterbox Square Tensor (RGB)</div>
        </div>
      </div>

      {/* Google Drive Checkpoint Bridge Testing Form */}
      <div className="bg-white border-2 border-charcoal-900 p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-rail-border pb-3">
          <div className="flex items-center gap-2">
            <Cloud className="w-5 h-5 text-signal-orange" />
            <h3 className="font-bold text-base text-charcoal-900">
              Google Drive Checkpoint Staging Pipeline
            </h3>
          </div>
          <span className="text-[11px] font-mono text-charcoal-500 uppercase">
            REMOTE REPOSITORY
          </span>
        </div>

        <div className="space-y-2 text-xs">
          <label className="block text-[11px] font-mono uppercase font-semibold text-charcoal-700">
            Google Drive Checkpoint Folder / URL (best.pt)
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={driveUrl}
              onChange={(e) => setDriveUrl(e.target.value)}
              className="flex-1 bg-ivory-100 border border-rail-border px-3 py-2 font-mono text-xs text-charcoal-900 focus:outline-none focus:border-signal-orange"
            />
            <Button
              variant="primary"
              size="sm"
              isLoading={isVerifying}
              onClick={handleTestDriveConnection}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              TEST DRIVE STAGING
            </Button>
          </div>
          <p className="text-[11px] text-charcoal-500">
            Target Checkpoint:{' '}
            <code className="bg-ivory-200 px-1 py-0.5 text-charcoal-800">
              weights/railguard_yolov8n_best.pt
            </code>
          </p>
        </div>

        {syncStatus && (
          <Alert variant={syncStatus.success ? 'success' : 'critical'} title="Drive Staging Status">
            {syncStatus.message}
          </Alert>
        )}
      </div>

      {/* Backend API Integration Contract & Code */}
      <div className="bg-ivory-50 border border-rail-border p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-rail-border pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-charcoal-900" />
            <div>
              <h3 className="font-bold text-base text-charcoal-900">
                Backend API Contract (FastAPI Deployment Ready)
              </h3>
              <p className="text-xs text-charcoal-600">
                This clean API contract mirrors the TypeScript interface in <code>src/services/railGuardApi.ts</code>.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyCode}
            leftIcon={copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          >
            {copiedCode ? 'COPIED TO CLIPBOARD' : 'COPY BACKEND CODE'}
          </Button>
        </div>

        <div className="relative bg-charcoal-950 p-4 border border-charcoal-800 overflow-x-auto">
          <pre className="font-mono text-xs text-ivory-200 leading-relaxed selection:bg-signal-orange">
            {pythonFastApiSnippet}
          </pre>
        </div>

        {/* Environment Variable Setup */}
        <div className="pt-2">
          <div className="text-xs font-mono font-semibold uppercase text-charcoal-700 mb-1">
            HOW TO SWITCH TO LIVE INFERENCE IN STAGE 2:
          </div>
          <div className="p-3 bg-ivory-200 border border-rail-border text-xs font-mono text-charcoal-800 space-y-1">
            <div># In project root, create or edit .env:</div>
            <div className="font-bold text-charcoal-950">VITE_USE_LIVE_API=true</div>
            <div className="font-bold text-charcoal-950">VITE_API_ENDPOINT=http://localhost:8000/api/v1</div>
          </div>
        </div>
      </div>
    </div>
  );
};
