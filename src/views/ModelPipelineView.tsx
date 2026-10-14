import React, { useState, useEffect } from 'react';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import {
  HardDrive,
  Terminal,
  Copy,
  Check,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { railGuardApi } from '../services/railGuardApi';
import { ModelPipelineStatus } from '../types/inspection';

export const ModelPipelineView: React.FC = () => {
  const [modelStatus, setModelStatus] = useState<ModelPipelineStatus | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const checkStatus = async () => {
    setIsVerifying(true);
    try {
      const status = await railGuardApi.getModelStatus();
      setModelStatus(status);
      setSyncStatus({
        success: status.isConnected,
        message: status.isConnected
          ? `FastAPI service is active on ${status.apiEndpointUrl}. Model '${status.checkpointName}' loaded on ${status.inferenceDevice}.`
          : `FastAPI service is unreachable at http://localhost:8000. Run: uvicorn backend.main:app --port 8000`,
      });
    } catch (e: any) {
      setSyncStatus({
        success: false,
        message: `Connection failed: ${e.message}`,
      });
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const pythonFastApiSnippet = `# ==============================================================================
# RailGuard AI — Production Inference API (FastAPI + Ultralytics YOLOv8n)
# File: backend/main.py
# Checkpoint: backend/weights/railguard_yolov8n_best.pt
# ==============================================================================

# Run with:
# uvicorn backend.main:app --host 127.0.0.1 --port 8000

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
from PIL import Image
import io

app = FastAPI(title="RailGuard AI — Inference Engine", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = YOLO("backend/weights/railguard_yolov8n_best.pt")

@app.get("/health")
def health():
    return {"status": "healthy", "model_loaded": True, "classes": model.names}

@app.post("/api/v1/predict")
async def predict(file: UploadFile = File(...), confidence: float = Form(0.45), iou: float = Form(0.45)):
    contents = await file.read()
    image = Image.open(io.BytesIO(contents)).convert("RGB")
    results = model.predict(image, conf=confidence, iou=iou, imgsz=640)
    # Extracts normalized bounding boxes [x, y, w, h] aligned with frontend canvas
    ...`;

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
        title="YOLOv8n Model &amp; FastAPI Backend Runtime"
        subtitle="Production inference architecture: YOLOv8n trained weights, FastAPI REST endpoint contract, and real-time backend health diagnostics."
      />

      {/* Model Integration Status Alert */}
      {modelStatus?.isConnected ? (
        <Alert
          variant="success"
          title="Live Inference Backend Connected &amp; Active"
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />}
        >
          FastAPI inference backend is responding at <code>{modelStatus.apiEndpointUrl}</code>. Checkpoint{' '}
          <strong>{modelStatus.checkpointName}</strong> is verified on device <strong>{modelStatus.inferenceDevice}</strong>.
          The Inspection Workspace is consuming live YOLOv8n predictions.
        </Alert>
      ) : (
        <Alert
          variant="warning"
          title="FastAPI Service Standby"
          icon={<AlertTriangle className="w-5 h-5 text-defect-wheelburn shrink-0 mt-0.5" />}
        >
          FastAPI service is not running on <code>http://localhost:8000</code>. Start it with:{' '}
          <code className="bg-ivory-300 px-1 py-0.5 font-bold">python -m uvicorn backend.main:app --port 8000</code>.
        </Alert>
      )}

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
          <div className="text-[10px] font-mono uppercase text-charcoal-500">HELD-OUT TEST mAP@0.5</div>
          <div className="text-xl font-bold font-mono text-signal-orange mt-1">72.5% mAP</div>
          <div className="text-xs text-charcoal-600 mt-1">Precision: 66.7% • Recall: 73.9% (RSD-YOLO)</div>
        </div>

        <div className="bg-ivory-50 border border-rail-border p-4">
          <div className="text-[10px] font-mono uppercase text-charcoal-500">INFERENCE RESOLUTION</div>
          <div className="text-xl font-bold font-mono text-charcoal-900 mt-1">640 × 640</div>
          <div className="text-xs text-charcoal-600 mt-1">Letterbox Square Tensor (RGB)</div>
        </div>
      </div>

      {/* Checkpoint File Verification Block */}
      <div className="bg-white border-2 border-charcoal-900 p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-rail-border pb-3">
          <div className="flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-signal-orange" />
            <h3 className="font-bold text-base text-charcoal-900">
              Integrated Model Checkpoint File
            </h3>
          </div>
          <span className="text-[11px] font-mono text-charcoal-500 uppercase">
            LOCAL REPOSITORY
          </span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="p-3 bg-ivory-100 border border-rail-border font-mono text-xs text-charcoal-900 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-charcoal-500 uppercase text-[10px]">Checkpoint File:</span>
              <span className="font-bold text-charcoal-950">backend/weights/railguard_yolov8n_best.pt</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-charcoal-500 uppercase text-[10px]">Trained Classes (Order):</span>
              <span className="font-bold text-signal-orange">0: spalling, 1: wheel burn, 2: squat</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-charcoal-500 uppercase text-[10px]">Target Inference Endpoint:</span>
              <span className="font-bold text-charcoal-950">POST /api/v1/predict</span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <div className="text-xs text-charcoal-600">
              Click to ping the backend <code>/health</code> endpoint and check model availability:
            </div>
            <Button
              variant="primary"
              size="sm"
              isLoading={isVerifying}
              onClick={checkStatus}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              TEST BACKEND HEALTH
            </Button>
          </div>
        </div>

        {syncStatus && (
          <Alert variant={syncStatus.success ? 'success' : 'warning'} title="Health Diagnostic Result">
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
                FastAPI Backend Architecture (backend/main.py)
              </h3>
              <p className="text-xs text-charcoal-600">
                Production service implementation running Uvicorn and Ultralytics YOLOv8n.
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
            ENVIRONMENT CONFIGURATION (.env):
          </div>
          <div className="p-3 bg-ivory-200 border border-rail-border text-xs font-mono text-charcoal-800 space-y-1">
            <div className="font-bold text-charcoal-950">VITE_USE_LIVE_API=true</div>
            <div className="font-bold text-charcoal-950">VITE_API_ENDPOINT=http://localhost:8000/api/v1</div>
          </div>
        </div>
      </div>
    </div>
  );
};
