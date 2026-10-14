import React from 'react';
import { InspectionRecord } from '../../types/inspection';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Printer, Download, ShieldAlert, AlertTriangle } from 'lucide-react';
import { DEFECT_CATALOG } from '../../data/defectCatalog';

interface InspectionReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: InspectionRecord;
}

export const InspectionReportModal: React.FC<InspectionReportModalProps> = ({
  isOpen,
  onClose,
  record,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJson = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(record, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `railguard_docket_${record.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Official Railway Track Inspection Docket"
      subtitle={`Permanent Way Record Reference: ${record.id}`}
      technicalCode="UIC-712-FORM-D"
      maxWidth="2xl"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Download className="w-4 h-4" />}
            onClick={handleDownloadJson}
          >
            Export JSON Docket
          </Button>
          <Button
            variant="signal"
            size="sm"
            leftIcon={<Printer className="w-4 h-4" />}
            onClick={handlePrint}
          >
            Print Official Notice
          </Button>
        </>
      }
    >
      <div className="space-y-5 text-charcoal-900 font-sans print:text-black">
        {/* Demonstration Mode Warning Strip if not using real backend */}
        {record.isDemoMode && (
          <div className="p-2.5 bg-[#FDF8EC] border border-[#DEC17B] text-[#7A4B07] text-xs font-mono flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-defect-wheelburn shrink-0" />
              <span>
                <strong>DEMONSTRATION RUN:</strong> Generated via simulated YOLOv8n engine. Remote Colab weights staged in Google Drive.
              </span>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider">
              NON-CERTIFIED
            </span>
          </div>
        )}

        {/* Official Header */}
        <div className="border-b-2 border-charcoal-900 pb-3 flex justify-between items-start">
          <div>
            <div className="text-[11px] font-mono tracking-widest text-signal-orange uppercase font-bold">
              RAILGUARD AI // PERMANENT WAY SAFETY SYSTEMS
            </div>
            <h1 className="text-xl font-bold tracking-tight">
              PERMANENT WAY DEFECT INTERVENTION NOTICE
            </h1>
            <p className="text-xs text-charcoal-600">
              Department of Track Engineering &amp; Structural Safety Standards • Form UIC-712
            </p>
          </div>
          <div className="text-right font-mono text-xs">
            <div className="font-bold text-sm text-charcoal-900">{record.id}</div>
            <div className="text-charcoal-500">{record.timestamp}</div>
          </div>
        </div>

        {/* Telemetry Block */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-ivory-100 p-3 border border-rail-border text-xs font-mono">
          <div>
            <div className="text-charcoal-500 uppercase text-[10px]">Track Sector / Line</div>
            <div className="font-bold text-charcoal-900">{record.trackMeta.lineId}</div>
          </div>
          <div>
            <div className="text-charcoal-500 uppercase text-[10px]">Chainage Location</div>
            <div className="font-bold text-charcoal-900">{record.trackMeta.chainageKm}</div>
          </div>
          <div>
            <div className="text-charcoal-500 uppercase text-[10px]">Rail Profile Standard</div>
            <div className="font-bold text-charcoal-900">{record.trackMeta.railProfile}</div>
          </div>
          <div>
            <div className="text-charcoal-500 uppercase text-[10px]">Division / Lead Inspector</div>
            <div className="font-bold text-charcoal-900 truncate" title={record.trackMeta.inspectorName}>
              {record.trackMeta.inspectorName}
            </div>
          </div>
        </div>

        {/* Severity Banner */}
        <div className="border border-charcoal-800 p-3 flex items-center justify-between bg-ivory-50">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-signal-orange shrink-0" />
            <div>
              <div className="text-[10px] font-mono uppercase text-charcoal-500">
                OVERALL SECTOR STATUS
              </div>
              <div className="font-mono font-bold text-sm uppercase">
                {record.summarySeverity === 'critical' ? (
                  <span className="text-defect-squat font-bold">
                    CRITICAL DEFECT — MANDATORY TSR &amp; IMMEDIATE INTERVENTION
                  </span>
                ) : record.summarySeverity === 'high' ? (
                  <span className="text-signal-orange font-bold">
                    HIGH SEVERITY — EXPEDITE REPROFILING REPAIR
                  </span>
                ) : record.summarySeverity === 'medium' ? (
                  <span className="text-[#9A6214] font-bold">
                    MODERATE WEAR — PLANNED MAINTENANCE WINDOW
                  </span>
                ) : (
                  <span className="text-sage-800 font-bold">
                    NOMINAL TRACK INTEGRITY — CLEAR FOR LINE SPEED
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="text-right font-mono text-xs hidden sm:block">
            <span className="text-charcoal-500">Inference: </span>
            <span className="font-bold">{record.inferenceTimeMs} ms</span>
          </div>
        </div>

        {/* Detected Defects Table */}
        <div className="space-y-1.5">
          <div className="text-xs font-mono font-semibold uppercase text-charcoal-800 flex justify-between items-center">
            <span>RECORDED SURFACE ANOMALIES ({record.predictions.length})</span>
            <span className="text-[10px] text-charcoal-500 font-normal">
              Confidence and physical severity assessed independently
            </span>
          </div>
          <table className="w-full text-left border-collapse border border-rail-border text-xs">
            <thead>
              <tr className="bg-ivory-200/80 font-mono text-[11px] text-charcoal-700 border-b border-rail-border">
                <th className="p-2 border-r border-rail-border">CLASS &amp; UIC</th>
                <th className="p-2 border-r border-rail-border">CONFIDENCE</th>
                <th className="p-2 border-r border-rail-border">EST. DEPTH / AREA</th>
                <th className="p-2 border-r border-rail-border">STRUCTURAL TIER</th>
                <th className="p-2">PRESCRIBED REMEDY</th>
              </tr>
            </thead>
            <tbody>
              {record.predictions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-charcoal-500 font-mono">
                    Zero surface defects identified above confidence threshold.
                  </td>
                </tr>
              ) : (
                record.predictions.map((p) => {
                  const info = DEFECT_CATALOG[p.defectClass];
                  return (
                    <tr key={p.id} className="border-b border-rail-border hover:bg-ivory-50">
                      <td className="p-2 border-r border-rail-border font-medium">
                        <div className="font-semibold">{info.displayName}</div>
                        <div className="text-[10px] font-mono text-charcoal-500">
                          {p.uicCode || info.uicReference}
                        </div>
                      </td>
                      <td className="p-2 border-r border-rail-border font-mono font-bold text-signal-orange">
                        {(p.confidence * 100).toFixed(1)}%
                      </td>
                      <td className="p-2 border-r border-rail-border font-mono text-[11px]">
                        <div>{p.depthEstimateMm ? `Depth: ${p.depthEstimateMm} mm` : 'Depth: Pending NDT'}</div>
                        <div className="text-charcoal-500">{p.estimatedAreaMm2 ? `Area: ${p.estimatedAreaMm2} mm²` : '—'}</div>
                      </td>
                      <td className="p-2 border-r border-rail-border font-mono uppercase font-bold text-[11px]">
                        <span
                          className={
                            p.severity === 'critical'
                              ? 'text-defect-squat'
                              : p.severity === 'high'
                              ? 'text-signal-orange'
                              : p.severity === 'medium'
                              ? 'text-amber-700'
                              : 'text-sage-800'
                          }
                        >
                          {p.severity}
                        </span>
                      </td>
                      <td className="p-2 text-[11px] text-charcoal-800 leading-snug">
                        {p.recommendedAction}
                        {p.speedRestrictionKmh && (
                          <span className="block font-bold text-defect-squat mt-0.5">
                            Mandatory TSR: {p.speedRestrictionKmh} km/h
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Engineering Sign-off Box */}
        <div className="pt-4 border-t border-dashed border-rail-border-strong grid grid-cols-2 gap-6 text-xs font-mono">
          <div>
            <div className="text-[10px] text-charcoal-500 uppercase mb-4">
              PERMANENT WAY INSPECTOR ACKNOWLEDGEMENT
            </div>
            <div className="border-b border-charcoal-900 pb-1">
              Signed: ___________________________
            </div>
            <div className="text-[11px] text-charcoal-600 mt-1">
              Officer: {record.trackMeta.inspectorName}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-charcoal-500 uppercase mb-4">
              TRACK MAINTENANCE ENGINEER AUTHORIZATION
            </div>
            <div className="border-b border-charcoal-900 pb-1">
              Signed: ___________________________
            </div>
            <div className="text-[11px] text-charcoal-600 mt-1">
              TSR Status: {record.predictions.some((p) => p.speedRestrictionKmh) ? 'ENFORCED' : 'NOT REQUIRED'}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
