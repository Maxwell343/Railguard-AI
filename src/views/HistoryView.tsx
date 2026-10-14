import React, { useState } from 'react';
import { InspectionRecord } from '../types/inspection';
import { SectionHeader } from '../components/ui/SectionHeader';
import { DefectClassBadge, SeverityBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { InspectionReportModal } from '../components/inspection/InspectionReportModal';
import {
  Search,
  Filter,
  ExternalLink,
  FileText,
  AlertOctagon,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import { cn } from '../utils/cn';

interface HistoryViewProps {
  records: InspectionRecord[];
  onSelectRecordForInspection: (record: InspectionRecord) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  records,
  onSelectRecordForInspection,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [selectedForModal, setSelectedForModal] = useState<InspectionRecord | null>(null);

  // Filter records
  const filtered = records.filter((rec) => {
    const matchesSearch =
      rec.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.trackMeta.chainageKm.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.trackMeta.lineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesClass =
      classFilter === 'all'
        ? true
        : rec.predictions.some((p) => p.defectClass === classFilter);

    const matchesSeverity =
      severityFilter === 'all' ? true : rec.summarySeverity === severityFilter;

    return matchesSearch && matchesClass && matchesSeverity;
  });

  const criticalCount = records.filter((r) => r.summarySeverity === 'critical').length;
  const actionRequiredCount = records.filter((r) => r.status === 'action_required').length;
  const verifiedCount = records.filter((r) => r.status === 'verified').length;

  return (
    <div className="space-y-6 text-charcoal-900">
      <SectionHeader
        sectionNumber="02"
        metadata="PERMANENT WAY AUDIT REGISTRY"
        title="Historical Track Scan Registry"
        subtitle="Review, audit, and trace previous track inspection runs, model inference detections, and maintenance interventions across railway divisions."
      />

      {/* Summary KPI Tiles (Specialized industrial layout) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-ivory-50 border border-rail-border p-3.5">
          <div className="text-[10px] font-mono uppercase text-charcoal-500">
            TOTAL INSPECTIONS LOGGED
          </div>
          <div className="font-mono text-2xl font-bold text-charcoal-900 mt-1">
            {records.length}
          </div>
          <div className="text-[11px] text-charcoal-500 mt-0.5">Permanent Way Division Archive</div>
        </div>

        <div className="bg-ivory-50 border border-rail-border p-3.5">
          <div className="text-[10px] font-mono uppercase text-defect-squat flex items-center gap-1 font-bold">
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>CRITICAL SEVERITY SCANS</span>
          </div>
          <div className="font-mono text-2xl font-bold text-defect-squat mt-1">
            {criticalCount}
          </div>
          <div className="text-[11px] text-charcoal-500 mt-0.5">TSR &amp; Emergency Repair Mandates</div>
        </div>

        <div className="bg-ivory-50 border border-rail-border p-3.5">
          <div className="text-[10px] font-mono uppercase text-signal-orange flex items-center gap-1 font-bold">
            <Layers className="w-3.5 h-3.5" />
            <span>ACTION REQUIRED</span>
          </div>
          <div className="font-mono text-2xl font-bold text-signal-orange mt-1">
            {actionRequiredCount}
          </div>
          <div className="text-[11px] text-charcoal-500 mt-0.5">Scheduled for Grinder / Plug Replacement</div>
        </div>

        <div className="bg-ivory-50 border border-rail-border p-3.5">
          <div className="text-[10px] font-mono uppercase text-sage-800 flex items-center gap-1 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>VERIFIED &amp; NOMINAL</span>
          </div>
          <div className="font-mono text-2xl font-bold text-sage-800 mt-1">
            {verifiedCount}
          </div>
          <div className="text-[11px] text-charcoal-500 mt-0.5">Cleared for Full Track Speed</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-ivory-50 border border-rail-border p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-charcoal-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Chainage (e.g. KM 142), Line Name, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-rail-border pl-8 pr-3 py-1.5 font-sans text-xs text-charcoal-900 focus:border-signal-orange focus:outline-none"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 font-mono text-[11px] text-charcoal-600">
            <Filter className="w-3.5 h-3.5 text-signal-orange" />
            <span>CLASS:</span>
          </div>
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="bg-white border border-rail-border px-2 py-1.5 font-mono text-xs text-charcoal-900 focus:border-signal-orange focus:outline-none"
          >
            <option value="all">ALL CLASSES</option>
            <option value="spalling">SPALLING ONLY</option>
            <option value="wheel_burn">WHEEL BURN ONLY</option>
            <option value="squat">SQUAT DEFECTS ONLY</option>
          </select>

          <div className="flex items-center gap-1 font-mono text-[11px] text-charcoal-600 ml-2">
            <span>SEVERITY:</span>
          </div>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-white border border-rail-border px-2 py-1.5 font-mono text-xs text-charcoal-900 focus:border-signal-orange focus:outline-none"
          >
            <option value="all">ALL SEVERITIES</option>
            <option value="critical">CRITICAL</option>
            <option value="high">HIGH</option>
            <option value="medium">MEDIUM</option>
            <option value="none">NOMINAL / NONE</option>
          </select>
        </div>
      </div>

      {/* Registry Table */}
      <div className="border border-rail-border bg-white overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-ivory-200/80 font-mono text-[11px] text-charcoal-700 border-b border-rail-border">
              <th className="p-3 border-r border-rail-border">PREVIEW</th>
              <th className="p-3 border-r border-rail-border">SCAN REFERENCE</th>
              <th className="p-3 border-r border-rail-border">LOCATION &amp; PROFILE</th>
              <th className="p-3 border-r border-rail-border">PREDICTIONS</th>
              <th className="p-3 border-r border-rail-border">SEVERITY</th>
              <th className="p-3 border-r border-rail-border">STATUS</th>
              <th className="p-3 text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rail-border">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-charcoal-500 font-mono">
                  No inspection logs matched the current search criteria.
                </td>
              </tr>
            ) : (
              filtered.map((record) => (
                <tr key={record.id} className="hover:bg-ivory-100 transition-colors">
                  {/* Thumbnail */}
                  <td className="p-3 border-r border-rail-border w-20">
                    <img
                      src={record.imageUrl}
                      alt="Thumbnail"
                      className="w-16 h-10 object-cover border border-rail-border bg-charcoal-900"
                    />
                  </td>

                  {/* ID & Date */}
                  <td className="p-3 border-r border-rail-border font-mono">
                    <div className="font-bold text-charcoal-900">{record.id}</div>
                    <div className="text-[10px] text-charcoal-500 mt-0.5">{record.timestamp}</div>
                    <div className="text-[10px] text-charcoal-400 mt-0.5">{record.trackMeta.divisionCode}</div>
                  </td>

                  {/* Location & Rail Profile */}
                  <td className="p-3 border-r border-rail-border">
                    <div className="font-bold font-mono text-charcoal-900">
                      {record.trackMeta.chainageKm}
                    </div>
                    <div className="text-charcoal-700 font-medium truncate max-w-xs">
                      {record.trackMeta.lineName}
                    </div>
                    <div className="text-[10px] font-mono text-charcoal-500 mt-0.5">
                      {record.trackMeta.railProfile} • {record.trackMeta.trackType}
                    </div>
                  </td>

                  {/* Predictions list */}
                  <td className="p-3 border-r border-rail-border">
                    {record.predictions.length === 0 ? (
                      <span className="text-charcoal-400 font-mono text-[11px]">0 Defects</span>
                    ) : (
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {record.predictions.map((p) => (
                          <DefectClassBadge
                            key={p.id}
                            defectClass={p.defectClass}
                            confidence={p.confidence}
                            size="sm"
                          />
                        ))}
                      </div>
                    )}
                  </td>

                  {/* Severity */}
                  <td className="p-3 border-r border-rail-border font-mono">
                    <SeverityBadge severity={record.summarySeverity} size="sm" />
                  </td>

                  {/* Status */}
                  <td className="p-3 border-r border-rail-border">
                    <span
                      className={cn(
                        'font-mono text-[10px] font-bold uppercase px-2 py-0.5 border inline-block',
                        record.status === 'action_required'
                          ? 'bg-[#FDF2F0] text-[#9E241A] border-[#E8A29A]'
                          : record.status === 'verified'
                          ? 'bg-sage-200 text-sage-800 border-sage-300'
                          : 'bg-ivory-200 text-charcoal-800 border-rail-border'
                      )}
                    >
                      {record.status.replace('_', ' ')}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="secondary"
                        size="sm"
                        leftIcon={<FileText className="w-3.5 h-3.5" />}
                        onClick={() => setSelectedForModal(record)}
                        title="View Official Docket"
                      >
                        Docket
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
                        onClick={() => onSelectRecordForInspection(record)}
                        title="Load into Inspection Workspace"
                      >
                        Inspect
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedForModal && (
        <InspectionReportModal
          isOpen={true}
          onClose={() => setSelectedForModal(null)}
          record={selectedForModal}
        />
      )}
    </div>
  );
};
