import React, { useState, useRef, useEffect } from 'react';
import {
  DefectPrediction,
  DefectClass,
  InspectionRecord,
  TrackMetadata,
} from '../types/inspection';
import { SAMPLE_INSPECTIONS } from '../data/sampleInspections';
import { railGuardApi } from '../services/railGuardApi';
import { InteractiveTrackCanvas } from '../components/inspection/InteractiveTrackCanvas';
import { DefectInspectorSidebar } from '../components/inspection/DefectInspectorSidebar';
import { InspectionReportModal } from '../components/inspection/InspectionReportModal';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import {
  Upload,
  Play,
  RotateCcw,
  Camera,
  Trash2,
  AlertCircle,
  X,
} from 'lucide-react';
import { cn } from '../utils/cn';

interface WorkspaceViewProps {
  initialRecord?: InspectionRecord | null;
  onRecordAnalyzed?: (record: InspectionRecord) => void;
}

export const WorkspaceView: React.FC<WorkspaceViewProps> = ({
  initialRecord,
  onRecordAnalyzed,
}) => {
  // Current active inspection record or null if cleared
  const [activeRecord, setActiveRecord] = useState<InspectionRecord | null>(
    initialRecord || SAMPLE_INSPECTIONS[0]
  );

  // Staged state: true when an image is previewed before running inference
  const [isStaged, setIsStaged] = useState<boolean>(false);
  const [stagedFile, setStagedFile] = useState<File | null>(null);

  // Selection & Hover state
  const [selectedPrediction, setSelectedPrediction] = useState<DefectPrediction | null>(
    initialRecord ? initialRecord.predictions[0] || null : SAMPLE_INSPECTIONS[0].predictions[0] || null
  );
  const [hoveredPredictionId, setHoveredPredictionId] = useState<string | null>(null);

  // Model confidence & class filtering
  const [confidenceCutoff, setConfidenceCutoff] = useState<number>(0.45);
  const [visibleClasses, setVisibleClasses] = useState<Set<DefectClass>>(
    new Set(['spalling', 'wheel_burn', 'squat'])
  );

  // Scan & modal state
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDocketModalOpen, setIsDocketModalOpen] = useState<boolean>(false);

  // Track metadata form state
  const [trackMeta, setTrackMeta] = useState<TrackMetadata>(
    (initialRecord || SAMPLE_INSPECTIONS[0]).trackMeta
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync when initialRecord is passed from HistoryView
  useEffect(() => {
    if (initialRecord) {
      setActiveRecord(initialRecord);
      setSelectedPrediction(initialRecord.predictions[0] || null);
      setTrackMeta(initialRecord.trackMeta);
      setIsStaged(false);
      setStagedFile(null);
    }
  }, [initialRecord]);

  // Validate optical track image
  const validateFile = (file: File): string | null => {
    const validTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/bmp',
      'image/tiff',
    ];

    if (!validTypes.includes(file.type.toLowerCase())) {
      return `Unsupported file format '${file.type || 'unknown'}'. Please supply an optical rail track image (JPEG, PNG, WebP, BMP, or TIFF).`;
    }

    const maxBytes = 25 * 1024 * 1024; // 25 MB
    if (file.size > maxBytes) {
      const mb = (file.size / (1024 * 1024)).toFixed(1);
      return `File size (${mb} MB) exceeds maximum permissible 25 MB limit for optical scans.`;
    }

    return null;
  };

  // Stage a file for preview (Step 1 & 2 of workflow: Select & Preview)
  const stageUploadedFile = (file: File) => {
    const error = validateFile(file);
    if (error) {
      setUploadError(error);
      return;
    }

    setUploadError(null);
    const objectUrl = URL.createObjectURL(file);
    setStagedFile(file);
    setIsStaged(true);
    setSelectedPrediction(null);

    // Create a temporary staged record for telemetry display
    const temporaryRecord: InspectionRecord = {
      id: `SCAN-STAGED-${Math.floor(1000 + Math.random() * 9000)}`,
      title: `${trackMeta.lineName} — ${trackMeta.chainageKm} (Pending Analysis)`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16) + ' UTC',
      trackMeta: {
        ...trackMeta,
        inspectionDate: new Date().toISOString().substring(0, 10),
      },
      imageUrl: objectUrl,
      imageDimensions: { width: 1400, height: 933 },
      predictions: [],
      summarySeverity: 'none',
      status: 'under_review',
      inferenceTimeMs: 0,
      modelConfidenceCutoff: confidenceCutoff,
      isDemoMode: true,
    };

    setActiveRecord(temporaryRecord);
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    stageUploadedFile(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle drag-and-drop directly onto canvas
  const handleDropFile = (file: File) => {
    stageUploadedFile(file);
  };

  // Select a benchmark preset
  const handleSelectSample = (sample: InspectionRecord) => {
    setActiveRecord(sample);
    setSelectedPrediction(sample.predictions[0] || null);
    setTrackMeta(sample.trackMeta);
    setIsStaged(false);
    setStagedFile(null);
    setUploadError(null);
  };

  // Execute YOLOv8n inference (Step 3: Start Analysis)
  const handleRunInference = async () => {
    if (!activeRecord && !stagedFile) return;

    setIsScanning(true);
    setUploadError(null);

    try {
      const inputSource = stagedFile || (activeRecord ? activeRecord.imageUrl : '');
      const response = await railGuardApi.detectDefects(inputSource, {
        confidenceCutoff,
        trackMeta,
      });

      setActiveRecord(response.record);
      setSelectedPrediction(response.record.predictions[0] || null);
      setIsStaged(false);
      setStagedFile(null);

      if (onRecordAnalyzed) {
        onRecordAnalyzed(response.record);
      }
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Inference pipeline failed.');
    } finally {
      setIsScanning(false);
    }
  };

  // Remove current image and return to clean canvas
  const handleRemoveImage = () => {
    setActiveRecord(null);
    setSelectedPrediction(null);
    setIsStaged(false);
    setStagedFile(null);
    setUploadError(null);
  };

  const handleToggleClass = (defectClass: DefectClass) => {
    setVisibleClasses((prev) => {
      const next = new Set(prev);
      if (next.has(defectClass)) {
        next.delete(defectClass);
      } else {
        next.add(defectClass);
      }
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {/* Editorial Section Header */}
      <SectionHeader
        sectionNumber="01"
        metadata="OPTICAL SENSOR ACQUISITION &amp; INFERENCE ENGINE"
        title="Rail Track Surface Defect Detection &amp; Analysis"
        subtitle="Ingest optical rail head imagery, inspect staged scans, execute YOLOv8n defect localization for Spalling, Wheel Burn, and Squats, and review physical severity assessments."
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            {activeRecord && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Trash2 className="w-3.5 h-3.5 text-charcoal-500" />}
                  onClick={handleRemoveImage}
                  disabled={isScanning}
                  title="Remove current track image"
                >
                  CLEAR
                </Button>

                {isStaged ? (
                  <Button
                    variant="signal"
                    size="sm"
                    leftIcon={<Play className="w-3.5 h-3.5 fill-current" />}
                    onClick={handleRunInference}
                    isLoading={isScanning}
                  >
                    START YOLOv8 ANALYSIS
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                    onClick={handleRunInference}
                    isLoading={isScanning}
                  >
                    RE-ANALYZE
                  </Button>
                )}
              </>
            )}

            <Button
              variant={activeRecord ? 'secondary' : 'signal'}
              size="sm"
              leftIcon={<Upload className="w-3.5 h-3.5" />}
              onClick={() => fileInputRef.current?.click()}
              disabled={isScanning}
            >
              {activeRecord ? 'REPLACE IMAGE' : 'INGEST TRACK IMAGE'}
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        }
      />

      {/* Preset Test Tracks & Ingestion Metadata Bar */}
      <div className="bg-ivory-50 border border-rail-border p-4 space-y-4">
        {/* Sample Inspection Selector */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono uppercase font-bold text-charcoal-700 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-signal-orange" />
              <span>COLAB BENCHMARK TEST PRESETS (YOLOv8n TRAINED DOMAIN)</span>
            </span>
            <span className="text-[10px] font-mono text-charcoal-500">
              Select calibrated condition to evaluate detection accuracy
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {SAMPLE_INSPECTIONS.map((sample, idx) => {
              const isSelected = !isStaged && activeRecord?.id === sample.id;
              const labels = [
                'Squat Defect (Critical)',
                'Wheel Burn Slip (High)',
                'Gauge Spalling (Medium)',
                'Nominal / Clean Track',
              ];
              return (
                <button
                  key={sample.id}
                  type="button"
                  disabled={isScanning}
                  onClick={() => handleSelectSample(sample)}
                  className={cn(
                    'text-left p-2.5 border transition-all flex flex-col justify-between text-xs select-none',
                    isSelected
                      ? 'bg-ivory-200 border-charcoal-900 ring-1 ring-charcoal-900 font-medium'
                      : 'bg-white border-rail-border hover:border-charcoal-500'
                  )}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono text-charcoal-500 mb-1">
                    <span>CASE 0{idx + 1}</span>
                    <span className="font-bold uppercase text-charcoal-800">
                      {sample.summarySeverity}
                    </span>
                  </div>
                  <div className="font-semibold text-charcoal-900 leading-snug line-clamp-1">
                    {labels[idx] || sample.title}
                  </div>
                  <div className="font-mono text-[10px] text-charcoal-500 mt-1">
                    {sample.trackMeta.chainageKm} • {sample.trackMeta.railProfile}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Track Telemetry Fields */}
        <div className="pt-3 border-t border-rail-border grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-[10px] font-mono uppercase text-charcoal-500 mb-1">
              Sector / Line Name
            </label>
            <input
              type="text"
              value={trackMeta.lineName}
              disabled={isScanning}
              onChange={(e) => setTrackMeta({ ...trackMeta, lineName: e.target.value })}
              className="w-full bg-white border border-rail-border px-2 py-1.5 font-sans text-xs text-charcoal-900 focus:border-signal-orange focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase text-charcoal-500 mb-1">
              Chainage Coordinate
            </label>
            <input
              type="text"
              value={trackMeta.chainageKm}
              disabled={isScanning}
              onChange={(e) => setTrackMeta({ ...trackMeta, chainageKm: e.target.value })}
              className="w-full bg-white border border-rail-border px-2 py-1.5 font-mono text-xs text-charcoal-900 focus:border-signal-orange focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase text-charcoal-500 mb-1">
              Rail Profile
            </label>
            <select
              value={trackMeta.railProfile}
              disabled={isScanning}
              onChange={(e) =>
                setTrackMeta({
                  ...trackMeta,
                  railProfile: e.target.value as TrackMetadata['railProfile'],
                })
              }
              className="w-full bg-white border border-rail-border px-2 py-1.5 font-mono text-xs text-charcoal-900 focus:border-signal-orange focus:outline-none"
            >
              <option value="60E1 (UIC 60)">60E1 (UIC 60)</option>
              <option value="54E1 (UIC 54)">54E1 (UIC 54)</option>
              <option value="52 kg/m">52 kg/m</option>
              <option value="60 kg/m">60 kg/m</option>
              <option value="136 RE">136 RE</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase text-charcoal-500 mb-1">
              Lead Inspector
            </label>
            <input
              type="text"
              value={trackMeta.inspectorName}
              disabled={isScanning}
              onChange={(e) => setTrackMeta({ ...trackMeta, inspectorName: e.target.value })}
              className="w-full bg-white border border-rail-border px-2 py-1.5 font-sans text-xs text-charcoal-900 focus:border-signal-orange focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Upload or Validation Error Banner with Dismiss */}
      {uploadError && (
        <Alert
          variant="critical"
          title="Inspection Ingestion Notice"
          className="relative"
          icon={<AlertCircle className="w-5 h-5 text-defect-squat shrink-0 mt-0.5" />}
        >
          <div className="flex items-start justify-between gap-4">
            <div>{uploadError}</div>
            <button
              type="button"
              onClick={() => setUploadError(null)}
              className="p-1 hover:bg-red-200/50 text-defect-squat"
              aria-label="Dismiss error"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </Alert>
      )}

      {/* Main Analysis Grid: 8 cols Centerpiece Canvas / 4 cols Defect Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Centerpiece Visual Canvas */}
        <div className="lg:col-span-8 space-y-4">
          <InteractiveTrackCanvas
            imageUrl={activeRecord ? activeRecord.imageUrl : null}
            predictions={activeRecord ? activeRecord.predictions : []}
            selectedPredictionId={selectedPrediction?.id || null}
            hoveredPredictionId={hoveredPredictionId}
            onSelectPrediction={setSelectedPrediction}
            onHoverPrediction={setHoveredPredictionId}
            visibleClasses={visibleClasses}
            confidenceCutoff={confidenceCutoff}
            isScanning={isScanning}
            isStaged={isStaged}
            isDemoMode={activeRecord?.isDemoMode ?? true}
            onStartAnalysis={handleRunInference}
            onUploadClick={() => fileInputRef.current?.click()}
            onDropFile={handleDropFile}
          />

          {/* Quick Inspection Summary Footer */}
          {activeRecord && (
            <div className="bg-ivory-50 border border-rail-border p-3 flex flex-wrap items-center justify-between text-xs font-mono gap-2">
              <div className="flex items-center gap-3 text-charcoal-600 flex-wrap">
                <span>SCAN: {activeRecord.id}</span>
                <span>•</span>
                <span>TIME: {activeRecord.timestamp}</span>
                <span>•</span>
                <span>
                  INFERENCE:{' '}
                  {isStaged ? 'PENDING' : `${activeRecord.inferenceTimeMs}ms`}
                </span>
              </div>
              <div className="text-charcoal-800">
                STATUS:{' '}
                <span
                  className={cn(
                    'font-bold uppercase',
                    isStaged
                      ? 'text-amber-600'
                      : activeRecord.status === 'action_required'
                      ? 'text-defect-squat'
                      : 'text-sage-800'
                  )}
                >
                  {isStaged ? 'STAGED FOR ANALYSIS' : activeRecord.status.replace('_', ' ')}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Telemetry & Defect Inspector Sidebar */}
        <div className="lg:col-span-4">
          <DefectInspectorSidebar
            record={activeRecord}
            selectedPrediction={selectedPrediction}
            hoveredPredictionId={hoveredPredictionId}
            onSelectPrediction={setSelectedPrediction}
            onHoverPrediction={setHoveredPredictionId}
            confidenceCutoff={confidenceCutoff}
            onChangeConfidenceCutoff={setConfidenceCutoff}
            visibleClasses={visibleClasses}
            onToggleClass={handleToggleClass}
            isStaged={isStaged}
            isScanning={isScanning}
            onStartAnalysis={handleRunInference}
            onExportReport={() => setIsDocketModalOpen(true)}
          />
        </div>
      </div>

      {/* Official Docket Export Modal */}
      {activeRecord && !isStaged && (
        <InspectionReportModal
          isOpen={isDocketModalOpen}
          onClose={() => setIsDocketModalOpen(false)}
          record={activeRecord}
        />
      )}
    </div>
  );
};
