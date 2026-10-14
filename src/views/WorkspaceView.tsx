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
  RotateCcw,
  Camera,
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
  // Current active inspection record
  const [activeRecord, setActiveRecord] = useState<InspectionRecord>(
    initialRecord || SAMPLE_INSPECTIONS[0]
  );
  const [selectedPrediction, setSelectedPrediction] = useState<DefectPrediction | null>(
    (initialRecord || SAMPLE_INSPECTIONS[0]).predictions[0] || null
  );

  // Confidence & filtering controls
  const [confidenceCutoff, setConfidenceCutoff] = useState<number>(0.45);
  const [visibleClasses, setVisibleClasses] = useState<Set<DefectClass>>(
    new Set(['spalling', 'wheel_burn', 'squat'])
  );

  // Upload & processing state
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDocketModalOpen, setIsDocketModalOpen] = useState<boolean>(false);

  // Metadata form state
  const [trackMeta, setTrackMeta] = useState<TrackMetadata>(
    (initialRecord || SAMPLE_INSPECTIONS[0]).trackMeta
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  // When initialRecord changes (e.g. user clicked "Inspect" in history log)
  useEffect(() => {
    if (initialRecord) {
      setActiveRecord(initialRecord);
      setSelectedPrediction(initialRecord.predictions[0] || null);
      setTrackMeta(initialRecord.trackMeta);
    }
  }, [initialRecord]);

  // Handle switching sample inspections
  const handleSelectSample = (sample: InspectionRecord) => {
    setActiveRecord(sample);
    setSelectedPrediction(sample.predictions[0] || null);
    setTrackMeta(sample.trackMeta);
    setUploadError(null);
  };

  // Handle local file upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Invalid format. Please supply a valid railway inspection photograph (PNG, JPEG, WebP).');
      return;
    }

    setUploadError(null);
    setIsScanning(true);

    try {
      const response = await railGuardApi.detectDefects(file, {
        confidenceCutoff,
        trackMeta,
      });

      setActiveRecord(response.record);
      setSelectedPrediction(response.record.predictions[0] || null);
      if (onRecordAnalyzed) {
        onRecordAnalyzed(response.record);
      }
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Defect scan failed.');
    } finally {
      setIsScanning(false);
      // Reset input value so same file can be re-selected if desired
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Re-run inference on current image (e.g. after changing confidence)
  const handleRerunInference = async () => {
    setIsScanning(true);
    try {
      const response = await railGuardApi.detectDefects(activeRecord.imageUrl, {
        confidenceCutoff,
        trackMeta,
      });
      setActiveRecord(response.record);
      setSelectedPrediction(response.record.predictions[0] || null);
      if (onRecordAnalyzed) {
        onRecordAnalyzed(response.record);
      }
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Re-inference failed.');
    } finally {
      setIsScanning(false);
    }
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
        subtitle="Ingest high-resolution rail crown scans, execute YOLOv8n defect localization for Spalling, Wheel Burn, and Squats, and evaluate UIC severity classifications."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              onClick={handleRerunInference}
              isLoading={isScanning}
            >
              RERUN INFERENCE
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Upload className="w-3.5 h-3.5" />}
              onClick={() => fileInputRef.current?.click()}
            >
              INGEST TRACK IMAGE
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
              <span>TEST BENCH PRESETS (COLAB BENCHMARK IMAGES)</span>
            </span>
            <span className="text-[10px] font-mono text-charcoal-500">
              Select to evaluate pre-calibrated track conditions
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {SAMPLE_INSPECTIONS.map((sample, idx) => {
              const isSelected = activeRecord.id === sample.id;
              const labels = ['Squat Defect (Critical)', 'Wheel Burn Slip', 'Gauge Spalling', 'Nominal / Clean Track'];
              return (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => handleSelectSample(sample)}
                  className={cn(
                    'text-left p-2.5 border transition-all flex flex-col justify-between text-xs',
                    isSelected
                      ? 'bg-ivory-200 border-charcoal-900 ring-1 ring-charcoal-900 font-medium'
                      : 'bg-white border-rail-border hover:border-charcoal-500'
                  )}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono text-charcoal-500 mb-1">
                    <span>CASE 0{idx + 1}</span>
                    <span className="font-bold uppercase text-charcoal-800">{sample.summarySeverity}</span>
                  </div>
                  <div className="font-semibold text-charcoal-900 leading-snug line-clamp-1">
                    {labels[idx] || sample.title}
                  </div>
                  <div className="font-mono text-[10px] text-charcoal-500 mt-1">
                    {sample.trackMeta.chainageKm}
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
              onChange={(e) => setTrackMeta({ ...trackMeta, inspectorName: e.target.value })}
              className="w-full bg-white border border-rail-border px-2 py-1.5 font-sans text-xs text-charcoal-900 focus:border-signal-orange focus:outline-none"
            />
          </div>
        </div>
      </div>

      {uploadError && (
        <Alert variant="critical" title="Inspection Ingestion Error">
          {uploadError}
        </Alert>
      )}

      {/* Main Analysis Grid: Asymmetric Layout (7 cols Canvas / 5 cols Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Visual Canvas */}
        <div className="lg:col-span-8 space-y-4">
          <InteractiveTrackCanvas
            imageUrl={activeRecord.imageUrl}
            predictions={activeRecord.predictions}
            selectedPredictionId={selectedPrediction?.id || null}
            onSelectPrediction={setSelectedPrediction}
            visibleClasses={visibleClasses}
            confidenceCutoff={confidenceCutoff}
            isScanning={isScanning}
          />

          {/* Quick Inspection Summary Footer */}
          <div className="bg-ivory-50 border border-rail-border p-3 flex flex-wrap items-center justify-between text-xs font-mono gap-2">
            <div className="flex items-center gap-4 text-charcoal-600">
              <span>SCAN ID: {activeRecord.id}</span>
              <span>•</span>
              <span>TIMESTAMP: {activeRecord.timestamp}</span>
              <span>•</span>
              <span>INFERENCE: {activeRecord.inferenceTimeMs}ms</span>
            </div>
            <div className="text-charcoal-800">
              STATUS:{' '}
              <span className="font-bold text-signal-orange uppercase">
                {activeRecord.status.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Telemetry & Defect Inspector Sidebar */}
        <div className="lg:col-span-4">
          <DefectInspectorSidebar
            record={activeRecord}
            selectedPrediction={selectedPrediction}
            onSelectPrediction={setSelectedPrediction}
            confidenceCutoff={confidenceCutoff}
            onChangeConfidenceCutoff={setConfidenceCutoff}
            visibleClasses={visibleClasses}
            onToggleClass={handleToggleClass}
            onExportReport={() => setIsDocketModalOpen(true)}
          />
        </div>
      </div>

      {/* Official Docket Export Modal */}
      <InspectionReportModal
        isOpen={isDocketModalOpen}
        onClose={() => setIsDocketModalOpen(false)}
        record={activeRecord}
      />
    </div>
  );
};
