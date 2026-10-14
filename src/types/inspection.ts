export type DefectClass = 'spalling' | 'wheel_burn' | 'squat';

export type DefectSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface BoundingBox {
  /** Normalized top-left X coordinate [0..1] */
  x: number;
  /** Normalized top-left Y coordinate [0..1] */
  y: number;
  /** Normalized width [0..1] */
  width: number;
  /** Normalized height [0..1] */
  height: number;
}

export interface DefectPrediction {
  id: string;
  defectClass: DefectClass;
  confidence: number;
  bbox: BoundingBox;
  severity: DefectSeverity;
  estimatedAreaMm2?: number;
  depthEstimateMm?: number;
  recommendedAction: string;
  technicalDescription: string;
  uicCode?: string; // UIC 712 R Defect classification catalog code
  speedRestrictionKmh?: number;
}

export interface TrackMetadata {
  lineId: string;
  lineName: string;
  chainageKm: string; // e.g. "KM 142+250"
  trackType: 'Main Line' | 'Branch' | 'Heavy Haul' | 'High Speed' | 'Yard / Siding';
  railProfile: '60E1 (UIC 60)' | '54E1 (UIC 54)' | '52 kg/m' | '60 kg/m' | '136 RE';
  sleeperType: 'Pre-stressed Concrete (PSC)' | 'Steel Trough' | 'Hardwood Timber';
  inspectorName: string;
  divisionCode: string;
  inspectionDate: string;
}

export interface InspectionRecord {
  id: string;
  title: string;
  timestamp: string;
  trackMeta: TrackMetadata;
  imageUrl: string;
  imageDimensions: {
    width: number;
    height: number;
  };
  predictions: DefectPrediction[];
  summarySeverity: DefectSeverity | 'none';
  status: 'verified' | 'action_required' | 'under_review' | 'archived';
  notes?: string;
  inferenceTimeMs: number;
  modelConfidenceCutoff: number;
  isDemoMode?: boolean;
}

export interface ModelPipelineStatus {
  modelArchitecture: 'YOLOv8n';
  checkpointName: string;
  classes: DefectClass[];
  inputResolution: string;
  colabTrainedDate: string;
  driveCheckpointPath: string;
  apiEndpointUrl: string;
  isConnected: boolean;
  latencyMs: number;
  mAP50: number;
  precision: number;
  recall: number;
  inferenceDevice: string;
}

export interface DefectClassInfo {
  id: DefectClass;
  displayName: string;
  uicReference: string;
  accentColor: string;
  description: string;
  rootCauses: string[];
  riskFactor: string;
  standardRemedy: string;
}
