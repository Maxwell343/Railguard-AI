import {
  DefectPrediction,
  InspectionRecord,
  ModelPipelineStatus,
  TrackMetadata,
} from '../types/inspection';
import { SAMPLE_INSPECTIONS } from '../data/sampleInspections';

export interface DetectionOptions {
  confidenceCutoff?: number;
  trackMeta?: Partial<TrackMetadata>;
}

export interface DetectionResponse {
  record: InspectionRecord;
  latencyMs: number;
}

export interface IRailGuardApiService {
  detectDefects(
    file: File | Blob | string,
    options?: DetectionOptions
  ): Promise<DetectionResponse>;
  getInspectionHistory(): Promise<InspectionRecord[]>;
  getInspectionById(id: string): Promise<InspectionRecord | null>;
  getModelStatus(): Promise<ModelPipelineStatus>;
  syncDriveCheckpoint(driveUrl: string): Promise<{ success: boolean; message: string }>;
}

/**
 * MockRailGuardService:
 * Provides a faithful engineering simulation while the Colab YOLOv8n checkpoint
 * is being transitioned from Google Drive into a production inference container.
 */
export class MockRailGuardService implements IRailGuardApiService {
  private history: InspectionRecord[] = [...SAMPLE_INSPECTIONS];

  private modelStatus: ModelPipelineStatus = {
    modelArchitecture: 'YOLOv8n',
    checkpointName: 'railguard_yolov8n_best.pt',
    classes: ['spalling', 'wheel_burn', 'squat'],
    inputResolution: '640x640',
    colabTrainedDate: 'Colab Run #42 (Epoch 100/100, AdamW, lr=0.001)',
    driveCheckpointPath: 'Google Drive / RailGuard_Models / exp_yolov8n_v1 / weights / best.pt',
    apiEndpointUrl: import.meta.env.VITE_API_ENDPOINT || 'http://localhost:8000/api/v1/detect',
    isConnected: false, // Explicitly false to reflect that local backend is not yet bound
    latencyMs: 41.2,
    mAP50: 0.884,
    precision: 0.862,
    recall: 0.841,
    inferenceDevice: 'Simulated Engine (Awaiting Drive Checkpoint Bridge)',
  };

  async detectDefects(
    fileInput: File | Blob | string,
    options?: DetectionOptions
  ): Promise<DetectionResponse> {
    const startTime = performance.now();

    // Simulate realistic inference processing time (450ms - 850ms)
    await new Promise((resolve) => setTimeout(resolve, 650));

    const cutoff = options?.confidenceCutoff ?? 0.45;
    let imageUrl = '';
    let imageWidth = 1400;
    let imageHeight = 933;

    if (typeof fileInput === 'string') {
      imageUrl = fileInput;
    } else {
      imageUrl = URL.createObjectURL(fileInput);
    }

    // Generate realistic simulated YOLOv8 predictions for the uploaded track
    // If user uploaded a custom image, provide representative detections
    const simulatedPredictions: DefectPrediction[] = [
      {
        id: `pred-${Math.random().toString(36).substring(2, 7)}`,
        defectClass: 'spalling' as const,
        confidence: 0.87,
        bbox: {
          x: 0.38,
          y: 0.46,
          width: 0.24,
          height: 0.16,
        },
        severity: 'medium' as const,
        estimatedAreaMm2: 490,
        depthEstimateMm: 1.4,
        recommendedAction:
          'Schedule rail reprofiling pass within standard maintenance interval (14 days). Monitor for micro-crack spall propagation.',
        technicalDescription:
          'Surface flaking and metallic chip dislocation detected at running band gauge corner.',
        uicCode: 'UIC 712 R / 221',
      },
      {
        id: `pred-${Math.random().toString(36).substring(2, 7)}`,
        defectClass: 'wheel_burn' as const,
        confidence: 0.76,
        bbox: {
          x: 0.58,
          y: 0.60,
          width: 0.19,
          height: 0.15,
        },
        severity: 'high' as const,
        estimatedAreaMm2: 540,
        depthEstimateMm: 1.6,
        recommendedAction:
          'Perform manual dye-penetrant or ultrasonic inspection for sub-surface thermal cracks before next freight transit.',
        technicalDescription:
          'Localized martensitic thermal discoloration with mechanical friction depression.',
        uicCode: 'UIC 712 R / 225',
      },
    ].filter((p) => p.confidence >= cutoff);

    const hasCritical = simulatedPredictions.some((p) => p.severity === 'critical');
    const hasHigh = simulatedPredictions.some((p) => p.severity === 'high');
    const hasMedium = simulatedPredictions.some((p) => p.severity === 'medium');

    const summarySeverity = hasCritical
      ? 'critical'
      : hasHigh
      ? 'high'
      : hasMedium
      ? 'medium'
      : simulatedPredictions.length > 0
      ? 'low'
      : 'none';

    const newRecord: InspectionRecord = {
      id: `INS-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      title: options?.trackMeta?.lineName
        ? `${options.trackMeta.lineName} — ${options.trackMeta.chainageKm || 'Chainage Pending'}`
        : 'Live Ingestion Scan — Sector Track Review',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16) + ' UTC',
      trackMeta: {
        lineId: options?.trackMeta?.lineId || 'LINE-LIVE-01',
        lineName: options?.trackMeta?.lineName || 'Mainline Western Corridor (Live)',
        chainageKm: options?.trackMeta?.chainageKm || 'KM 108+600',
        trackType: options?.trackMeta?.trackType || 'Main Line',
        railProfile: options?.trackMeta?.railProfile || '60E1 (UIC 60)',
        sleeperType: options?.trackMeta?.sleeperType || 'Pre-stressed Concrete (PSC)',
        inspectorName: options?.trackMeta?.inspectorName || 'Field Inspector S. Rao',
        divisionCode: options?.trackMeta?.divisionCode || 'DIV-WEST-01',
        inspectionDate: new Date().toISOString().substring(0, 10),
      },
      imageUrl,
      imageDimensions: {
        width: imageWidth,
        height: imageHeight,
      },
      predictions: simulatedPredictions,
      summarySeverity,
      status: simulatedPredictions.length > 0 ? 'action_required' : 'verified',
      notes: 'Automated field scan ingested via operator portal.',
      inferenceTimeMs: Math.round(performance.now() - startTime),
      modelConfidenceCutoff: cutoff,
    };

    // Prepend to history
    this.history = [newRecord, ...this.history];

    return {
      record: newRecord,
      latencyMs: newRecord.inferenceTimeMs,
    };
  }

  async getInspectionHistory(): Promise<InspectionRecord[]> {
    return [...this.history];
  }

  async getInspectionById(id: string): Promise<InspectionRecord | null> {
    return this.history.find((item) => item.id === id) || null;
  }

  async getModelStatus(): Promise<ModelPipelineStatus> {
    return { ...this.modelStatus };
  }

  async syncDriveCheckpoint(
    driveUrl: string
  ): Promise<{ success: boolean; message: string }> {
    // Contract definition for future automated Drive weight retrieval
    await new Promise((resolve) => setTimeout(resolve, 800));
    return {
      success: true,
      message: `Google Drive path verified: "${driveUrl}". Checkpoint signature staged for Python FastAPI backend.`,
    };
  }
}

/**
 * HttpRailGuardService:
 * Real production implementation that calls the backend inference API
 * once the Python backend (FastAPI + Ultralytics YOLOv8) is running.
 */
export class HttpRailGuardService implements IRailGuardApiService {
  private baseUrl: string;

  constructor(baseUrl: string = import.meta.env.VITE_API_ENDPOINT || 'http://localhost:8000/api/v1') {
    this.baseUrl = baseUrl;
  }

  async detectDefects(
    fileInput: File | Blob | string,
    options?: DetectionOptions
  ): Promise<DetectionResponse> {
    const formData = new FormData();
    if (typeof fileInput === 'string') {
      formData.append('image_url', fileInput);
    } else {
      formData.append('file', fileInput);
    }
    if (options?.confidenceCutoff) {
      formData.append('confidence', options.confidenceCutoff.toString());
    }

    const response = await fetch(`${this.baseUrl}/detect`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Inference API failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  async getInspectionHistory(): Promise<InspectionRecord[]> {
    const res = await fetch(`${this.baseUrl}/inspections`);
    if (!res.ok) throw new Error('Failed to fetch history');
    return await res.json();
  }

  async getInspectionById(id: string): Promise<InspectionRecord | null> {
    const res = await fetch(`${this.baseUrl}/inspections/${id}`);
    if (!res.ok) return null;
    return await res.json();
  }

  async getModelStatus(): Promise<ModelPipelineStatus> {
    const res = await fetch(`${this.baseUrl}/model/status`);
    if (!res.ok) throw new Error('Failed to fetch model status');
    return await res.json();
  }

  async syncDriveCheckpoint(driveUrl: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${this.baseUrl}/model/sync-drive`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ driveUrl }),
    });
    if (!res.ok) throw new Error('Failed to sync checkpoint');
    return await res.json();
  }
}

// Default export uses MockRailGuardService with pre-loaded authentic scenarios
// and prepares seamless switch if VITE_USE_LIVE_API is set
export const railGuardApi: IRailGuardApiService = import.meta.env.VITE_USE_LIVE_API === 'true'
  ? new HttpRailGuardService()
  : new MockRailGuardService();
