import React from 'react';
import {
  DefectPrediction,
  DefectClass,
  InspectionRecord,
} from '../../types/inspection';
import { DEFECT_CATALOG } from '../../data/defectCatalog';
import { DefectClassBadge, SeverityBadge } from '../ui/Badge';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';
import {
  Sliders,
  AlertCircle,
  FileCheck,
  Wrench,
  Activity,
  Layers,
  Play,
  CheckCircle2,
  HelpCircle,
  Compass,
} from 'lucide-react';
import { cn } from '../../utils/cn';

interface DefectInspectorSidebarProps {
  record: InspectionRecord | null;
  selectedPrediction: DefectPrediction | null;
  hoveredPredictionId?: string | null;
  onSelectPrediction: (prediction: DefectPrediction | null) => void;
  onHoverPrediction?: (id: string | null) => void;
  confidenceCutoff: number;
  onChangeConfidenceCutoff: (val: number) => void;
  visibleClasses: Set<DefectClass>;
  onToggleClass: (defectClass: DefectClass) => void;
  isStaged?: boolean;
  isScanning?: boolean;
  onStartAnalysis?: () => void;
  onExportReport?: () => void;
}

export const DefectInspectorSidebar: React.FC<DefectInspectorSidebarProps> = ({
  record,
  selectedPrediction,
  hoveredPredictionId,
  onSelectPrediction,
  onHoverPrediction,
  confidenceCutoff,
  onChangeConfidenceCutoff,
  visibleClasses,
  onToggleClass,
  isStaged = false,
  isScanning = false,
  onStartAnalysis,
  onExportReport,
}) => {
  if (!record) {
    return (
      <div className="bg-ivory-50 border border-rail-border p-6 text-center text-charcoal-500 space-y-3">
        <Compass className="w-8 h-8 mx-auto text-charcoal-400 stroke-[1.5]" />
        <div className="font-mono text-xs uppercase font-semibold text-charcoal-700">
          Awaiting Track Ingestion
        </div>
        <p className="text-xs text-charcoal-500 max-w-xs mx-auto">
          Select a test preset above or upload an optical rail scan to view sector telemetry and defect analysis.
        </p>
      </div>
    );
  }

  const activePredictions = isStaged
    ? []
    : record.predictions.filter(
        (p) => visibleClasses.has(p.defectClass) && p.confidence >= confidenceCutoff
      );

  return (
    <div className="flex flex-col gap-4 text-charcoal-900">
      {/* Track Sector Telemetry Header */}
      <div className="bg-ivory-50 border border-rail-border p-3.5 space-y-2">
        <div className="flex items-center justify-between text-xs font-mono border-b border-rail-border pb-2">
          <span className="text-signal-orange font-semibold uppercase tracking-wider">
            SECTOR TELEMETRY
          </span>
          <span className="text-charcoal-500 font-bold">{record.trackMeta.divisionCode}</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <div className="text-[10px] font-mono text-charcoal-500 uppercase">Chainage / KM</div>
            <div className="font-mono font-bold text-sm text-charcoal-900">
              {record.trackMeta.chainageKm}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-mono text-charcoal-500 uppercase">Rail Profile</div>
            <div className="font-mono font-semibold text-charcoal-900">
              {record.trackMeta.railProfile}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-mono text-charcoal-500 uppercase">Track Line</div>
            <div className="font-sans font-medium text-charcoal-800 truncate" title={record.trackMeta.lineName}>
              {record.trackMeta.lineName}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-mono text-charcoal-500 uppercase">Lead Inspector</div>
            <div className="font-sans text-charcoal-700 truncate" title={record.trackMeta.inspectorName}>
              {record.trackMeta.inspectorName}
            </div>
          </div>
        </div>
      </div>

      {/* Model Filter & Confidence Threshold Controls */}
      <div className="bg-ivory-50 border border-rail-border p-3.5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-mono font-semibold uppercase text-charcoal-800">
            <Sliders className="w-3.5 h-3.5 text-signal-orange" />
            <span>CONFIDENCE CUTOFF</span>
          </div>
          <span className="font-mono text-xs font-bold text-signal-orange">
            {(confidenceCutoff * 100).toFixed(0)}%
          </span>
        </div>

        <input
          type="range"
          min={0.1}
          max={0.95}
          step={0.05}
          disabled={isStaged}
          value={confidenceCutoff}
          onChange={(e) => onChangeConfidenceCutoff(parseFloat(e.target.value))}
          className="w-full accent-signal-orange bg-ivory-300 h-1.5 rounded-none cursor-pointer disabled:opacity-40"
          aria-label="Confidence threshold cutoff slider"
        />

        {/* Defect Class Filters */}
        <div className="pt-2 border-t border-rail-border">
          <div className="text-[10px] font-mono uppercase text-charcoal-500 mb-1.5 flex items-center justify-between">
            <span>Filter Classes</span>
            <span className="text-[9px] text-charcoal-400">YOLOv8n Classes</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(['spalling', 'wheel_burn', 'squat'] as DefectClass[]).map((cls) => {
              const isVisible = visibleClasses.has(cls);
              const count = isStaged
                ? 0
                : record.predictions.filter((p) => p.defectClass === cls).length;
              const catalog = DEFECT_CATALOG[cls];
              return (
                <button
                  key={cls}
                  type="button"
                  disabled={isStaged}
                  onClick={() => onToggleClass(cls)}
                  className={cn(
                    'text-[11px] font-mono uppercase px-2 py-1 border transition-colors flex items-center gap-1.5 select-none disabled:opacity-50',
                    isVisible
                      ? 'bg-ivory-200 border-charcoal-800 text-charcoal-900 font-semibold'
                      : 'bg-transparent border-rail-border text-charcoal-400 line-through opacity-60'
                  )}
                  title={`Toggle ${catalog.displayName}`}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: catalog.accentColor }}
                  />
                  <span>{catalog.displayName.split(' ')[0]}</span>
                  <span className="text-[10px] opacity-75">({count})</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Identified Defects List / Staged Action State */}
      <div className="bg-ivory-50 border border-rail-border p-3.5 space-y-3">
        <div className="flex items-center justify-between border-b border-rail-border pb-2">
          <div className="flex items-center gap-1.5 text-xs font-mono font-semibold uppercase text-charcoal-800">
            <Layers className="w-3.5 h-3.5 text-signal-orange" />
            <span>IDENTIFIED DEFECTS ({activePredictions.length})</span>
          </div>
          <span className="font-mono text-[11px] text-charcoal-500">
            SEV:{' '}
            <span className="uppercase font-bold text-charcoal-900">
              {isStaged ? 'PENDING' : record.summarySeverity}
            </span>
          </span>
        </div>

        {/* If Image is staged (awaiting analysis) */}
        {isStaged ? (
          <div className="p-4 text-center bg-ivory-100 border border-amber-300 space-y-3 text-xs">
            <p className="text-charcoal-700 leading-relaxed font-sans">
              Track photograph is staged. Execute the YOLOv8n detector to locate surface defects.
            </p>
            <Button
              variant="signal"
              size="sm"
              className="w-full"
              isLoading={isScanning}
              leftIcon={<Play className="w-3.5 h-3.5 fill-current" />}
              onClick={onStartAnalysis}
            >
              EXECUTE YOLOv8n INFERENCE
            </Button>
          </div>
        ) : activePredictions.length === 0 ? (
          /* Zero defects detected state */
          <div className="p-4 text-center bg-sage-100 border border-sage-300 space-y-2 text-xs">
            <CheckCircle2 className="w-6 h-6 text-sage-800 mx-auto" />
            <div className="font-mono font-bold uppercase text-sage-800">
              Clear Running Surface
            </div>
            <p className="text-charcoal-600 leading-snug">
              No surface defects detected matching current criteria above {(confidenceCutoff * 100).toFixed(0)}% confidence threshold.
            </p>
          </div>
        ) : (
          /* List of identified predictions */
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {activePredictions.map((pred) => {
              const isSelected = selectedPrediction?.id === pred.id;
              const isHovered = hoveredPredictionId === pred.id;
              const catalog = DEFECT_CATALOG[pred.defectClass];

              return (
                <div
                  key={pred.id}
                  tabIndex={0}
                  role="button"
                  aria-pressed={isSelected}
                  onClick={() => onSelectPrediction(isSelected ? null : pred)}
                  onMouseEnter={() => onHoverPrediction && onHoverPrediction(pred.id)}
                  onMouseLeave={() => onHoverPrediction && onHoverPrediction(null)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectPrediction(isSelected ? null : pred);
                    }
                  }}
                  className={cn(
                    'p-2.5 border transition-all cursor-pointer text-xs focus-visible:outline-2 focus-visible:outline-signal-orange',
                    isSelected
                      ? 'border-signal-orange bg-signal-orange-subtle ring-1 ring-signal-orange'
                      : isHovered
                      ? 'border-charcoal-600 bg-ivory-100'
                      : 'border-rail-border bg-white hover:border-charcoal-500'
                  )}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <DefectClassBadge
                      defectClass={pred.defectClass}
                      confidence={pred.confidence}
                      size="sm"
                    />
                    <SeverityBadge severity={pred.severity} size="sm" />
                  </div>

                  <p className="text-charcoal-700 text-[11px] line-clamp-2 mb-1.5 font-sans leading-snug">
                    {pred.technicalDescription}
                  </p>

                  <div className="flex items-center justify-between text-[10px] font-mono text-charcoal-500 pt-1 border-t border-rail-border/60">
                    <span>{pred.uicCode || catalog.uicReference}</span>
                    <span>Area: ~{pred.estimatedAreaMm2 ?? 'N/A'} mm²</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Defect Detail & Action Protocol (Dossier) */}
      {!isStaged && selectedPrediction && (
        <div className="bg-white border-2 border-charcoal-900 p-3.5 space-y-3.5">
          <div className="flex items-center justify-between border-b border-rail-border pb-2">
            <span className="font-mono text-xs font-bold uppercase text-charcoal-900 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-signal-orange" />
              <span>DEFECT DOSSIER // {selectedPrediction.id}</span>
            </span>
            <span className="font-mono text-[10px] text-charcoal-500">
              UIC CODE: {selectedPrediction.uicCode || DEFECT_CATALOG[selectedPrediction.defectClass].uicReference}
            </span>
          </div>

          {/* CRITICAL DISTINCTION: Neural Net Confidence vs Engineering Severity */}
          <div className="grid grid-cols-2 gap-2 p-2 bg-ivory-100 border border-rail-border">
            <div>
              <div className="text-[10px] font-mono uppercase text-charcoal-500">
                MODEL CONFIDENCE
              </div>
              <div className="font-mono text-base font-bold text-signal-orange mt-0.5">
                {(selectedPrediction.confidence * 100).toFixed(1)}%
              </div>
              <div className="text-[9px] text-charcoal-500 leading-tight mt-0.5">
                Optical YOLOv8n certainty
              </div>
            </div>

            <div>
              <div className="text-[10px] font-mono uppercase text-charcoal-500">
                STRUCTURAL SEVERITY
              </div>
              <div className="mt-1">
                <SeverityBadge severity={selectedPrediction.severity} size="sm" />
              </div>
              <div className="text-[9px] text-charcoal-500 leading-tight mt-1">
                UIC 712 R physical risk tier
              </div>
            </div>
          </div>

          {/* Defect Physical Parameters */}
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2 border border-rail-border bg-ivory-50">
              <span className="text-[10px] uppercase text-charcoal-500 block">Est. Pit Depth</span>
              <span className="font-bold text-charcoal-900">
                {selectedPrediction.depthEstimateMm ? `${selectedPrediction.depthEstimateMm} mm` : 'Pending ultrasonic scan'}
              </span>
            </div>
            <div className="p-2 border border-rail-border bg-ivory-50">
              <span className="text-[10px] uppercase text-charcoal-500 block">Contact Surface Area</span>
              <span className="font-bold text-charcoal-900">
                {selectedPrediction.estimatedAreaMm2 ? `${selectedPrediction.estimatedAreaMm2} mm²` : '—'}
              </span>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <div className="text-[10px] font-mono text-charcoal-500 uppercase font-semibold">
                Permanent Way Classification
              </div>
              <div className="font-semibold text-charcoal-900 text-[13px] mt-0.5">
                {DEFECT_CATALOG[selectedPrediction.defectClass].displayName}
              </div>
            </div>

            {selectedPrediction.speedRestrictionKmh && (
              <Alert variant="critical" title="Temporary Speed Restriction (TSR)">
                Impose immediate <strong>{selectedPrediction.speedRestrictionKmh} km/h</strong> speed
                cap along this chainage segment until verified by permanent way supervisor.
              </Alert>
            )}

            <div>
              <div className="text-[10px] font-mono text-charcoal-500 uppercase flex items-center gap-1 font-semibold">
                <Wrench className="w-3 h-3 text-signal-orange" />
                <span>Prescribed Maintenance Remedy</span>
              </div>
              <div className="p-2 bg-ivory-100 border border-rail-border text-charcoal-900 mt-1 leading-relaxed text-[11px] font-sans">
                {selectedPrediction.recommendedAction}
              </div>
            </div>

            <div>
              <div className="text-[10px] font-mono text-charcoal-500 uppercase flex items-center gap-1 font-semibold">
                <AlertCircle className="w-3 h-3 text-defect-wheelburn" />
                <span>Safety &amp; Structural Risk</span>
              </div>
              <div className="text-charcoal-700 mt-0.5 text-[11px] font-sans leading-relaxed">
                {DEFECT_CATALOG[selectedPrediction.defectClass].riskFactor}
              </div>
            </div>
          </div>

          <div className="text-[10px] text-charcoal-500 italic pt-1 border-t border-rail-border flex items-center gap-1">
            <HelpCircle className="w-3 h-3 text-charcoal-400 shrink-0" />
            <span>Severity is determined independently from neural net confidence.</span>
          </div>
        </div>
      )}

      {/* Action Footer: Export Docket Notice */}
      {!isStaged && (
        <div className="flex flex-col gap-2 pt-1">
          <Button
            variant="signal"
            size="md"
            className="w-full"
            leftIcon={<FileCheck className="w-4 h-4" />}
            onClick={onExportReport}
          >
            GENERATE INSPECTION NOTICE (PDF/JSON)
          </Button>
          {record.isDemoMode && (
            <div className="text-[10px] font-mono text-charcoal-500 text-center uppercase tracking-tight">
              Demonstration Mode • Remote Drive Checkpoint Staged
            </div>
          )}
        </div>
      )}
    </div>
  );
};
