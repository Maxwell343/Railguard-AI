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
} from 'lucide-react';
import { cn } from '../../utils/cn';

interface DefectInspectorSidebarProps {
  record: InspectionRecord;
  selectedPrediction: DefectPrediction | null;
  onSelectPrediction: (prediction: DefectPrediction | null) => void;
  confidenceCutoff: number;
  onChangeConfidenceCutoff: (val: number) => void;
  visibleClasses: Set<DefectClass>;
  onToggleClass: (defectClass: DefectClass) => void;
  onExportReport?: () => void;
}

export const DefectInspectorSidebar: React.FC<DefectInspectorSidebarProps> = ({
  record,
  selectedPrediction,
  onSelectPrediction,
  confidenceCutoff,
  onChangeConfidenceCutoff,
  visibleClasses,
  onToggleClass,
  onExportReport,
}) => {
  const activePredictions = record.predictions.filter(
    (p) => visibleClasses.has(p.defectClass) && p.confidence >= confidenceCutoff
  );

  return (
    <div className="flex flex-col gap-4 text-charcoal-900">
      {/* Track Sector Telemetry Header */}
      <div className="bg-ivory-50 border border-rail-border p-3.5 space-y-2">
        <div className="flex items-center justify-between text-xs font-mono border-b border-rail-border pb-2">
          <span className="text-signal-orange font-semibold uppercase">
            SECTOR TELEMETRY
          </span>
          <span className="text-charcoal-500">{record.trackMeta.divisionCode}</span>
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
            <div className="text-[10px] font-mono text-charcoal-500 uppercase">Inspector</div>
            <div className="font-sans text-charcoal-700 truncate" title={record.trackMeta.inspectorName}>
              {record.trackMeta.inspectorName}
            </div>
          </div>
        </div>
      </div>

      {/* Model Filter Controls */}
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
          value={confidenceCutoff}
          onChange={(e) => onChangeConfidenceCutoff(parseFloat(e.target.value))}
          className="w-full accent-signal-orange bg-ivory-300 h-1.5 rounded-none cursor-pointer"
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
              const count = record.predictions.filter((p) => p.defectClass === cls).length;
              const catalog = DEFECT_CATALOG[cls];
              return (
                <button
                  key={cls}
                  type="button"
                  onClick={() => onToggleClass(cls)}
                  className={cn(
                    'text-[11px] font-mono uppercase px-2 py-1 border transition-colors flex items-center gap-1',
                    isVisible
                      ? 'bg-ivory-200 border-charcoal-800 text-charcoal-900 font-semibold'
                      : 'bg-transparent border-rail-border text-charcoal-400 line-through opacity-60'
                  )}
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

      {/* Defect Predictions List */}
      <div className="bg-ivory-50 border border-rail-border p-3.5 space-y-3">
        <div className="flex items-center justify-between border-b border-rail-border pb-2">
          <div className="flex items-center gap-1.5 text-xs font-mono font-semibold uppercase text-charcoal-800">
            <Layers className="w-3.5 h-3.5 text-signal-orange" />
            <span>IDENTIFIED DEFECTS ({activePredictions.length})</span>
          </div>
          <span className="font-mono text-[11px] text-charcoal-500">
            SEV: <span className="uppercase font-bold text-charcoal-900">{record.summarySeverity}</span>
          </span>
        </div>

        {activePredictions.length === 0 ? (
          <div className="p-4 text-center bg-ivory-100 border border-dashed border-rail-border text-xs text-charcoal-500">
            No defects detected above {(confidenceCutoff * 100).toFixed(0)}% confidence threshold.
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {activePredictions.map((pred) => {
              const isSelected = selectedPrediction?.id === pred.id;
              const catalog = DEFECT_CATALOG[pred.defectClass];

              return (
                <div
                  key={pred.id}
                  onClick={() => onSelectPrediction(isSelected ? null : pred)}
                  className={cn(
                    'p-2.5 border transition-all cursor-pointer text-xs',
                    isSelected
                      ? 'border-signal-orange bg-signal-orange-subtle shadow-sm'
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

                  <p className="text-charcoal-700 text-[11px] line-clamp-2 mb-1.5">
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

      {/* Selected Defect Detail & Action Protocol */}
      {selectedPrediction && (
        <div className="bg-white border-2 border-charcoal-900 p-3.5 space-y-3">
          <div className="flex items-center justify-between border-b border-rail-border pb-2">
            <span className="font-mono text-xs font-bold uppercase text-charcoal-900 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-signal-orange" />
              <span>DEFECT DOSSIER // {selectedPrediction.id}</span>
            </span>
            <span className="font-mono text-[10px] text-charcoal-500">
              CONF: {(selectedPrediction.confidence * 100).toFixed(1)}%
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <div className="text-[10px] font-mono text-charcoal-500 uppercase">
                UIC Classification
              </div>
              <div className="font-semibold text-charcoal-900">
                {DEFECT_CATALOG[selectedPrediction.defectClass].displayName} (
                {selectedPrediction.uicCode || DEFECT_CATALOG[selectedPrediction.defectClass].uicReference}
                )
              </div>
            </div>

            {selectedPrediction.speedRestrictionKmh && (
              <Alert variant="critical" title="Temporary Speed Restriction (TSR)">
                Impose immediate <strong>{selectedPrediction.speedRestrictionKmh} km/h</strong> speed
                cap along this chainage segment until verified by permanent way supervisor.
              </Alert>
            )}

            <div>
              <div className="text-[10px] font-mono text-charcoal-500 uppercase flex items-center gap-1">
                <Wrench className="w-3 h-3 text-signal-orange" />
                <span>Recommended Engineering Remedy</span>
              </div>
              <div className="p-2 bg-ivory-100 border border-rail-border text-charcoal-900 mt-1 leading-relaxed text-[11px]">
                {selectedPrediction.recommendedAction}
              </div>
            </div>

            <div>
              <div className="text-[10px] font-mono text-charcoal-500 uppercase flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-defect-wheelburn" />
                <span>Primary Risk Factor</span>
              </div>
              <div className="text-charcoal-700 mt-0.5 text-[11px]">
                {DEFECT_CATALOG[selectedPrediction.defectClass].riskFactor}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Footer */}
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
      </div>
    </div>
  );
};
