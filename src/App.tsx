import React, { useState } from 'react';
import { Navbar, NavTab } from './components/layout/Navbar';
import { WorkspaceView } from './views/WorkspaceView';
import { HistoryView } from './views/HistoryView';
import { SeverityMatrixView } from './views/SeverityMatrixView';
import { ModelPipelineView } from './views/ModelPipelineView';
import { InspectionRecord } from './types/inspection';
import { SAMPLE_INSPECTIONS } from './data/sampleInspections';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('workspace');
  const [records, setRecords] = useState<InspectionRecord[]>(SAMPLE_INSPECTIONS);
  const [selectedRecordForInspection, setSelectedRecordForInspection] =
    useState<InspectionRecord | null>(null);

  const handleRecordAnalyzed = (newRecord: InspectionRecord) => {
    setRecords((prev) => [newRecord, ...prev]);
  };

  const handleInspectFromHistory = (record: InspectionRecord) => {
    setSelectedRecordForInspection(record);
    setActiveTab('workspace');
  };

  const defectCount = records.reduce((acc, r) => acc + r.predictions.length, 0);

  return (
    <div className="min-h-screen bg-ivory-100 flex flex-col font-sans selection:bg-signal-orange selection:text-white">
      {/* Top Industrial Navbar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        defectCount={defectCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'workspace' && (
          <WorkspaceView
            initialRecord={selectedRecordForInspection}
            onRecordAnalyzed={handleRecordAnalyzed}
          />
        )}
        {activeTab === 'history' && (
          <HistoryView
            records={records}
            onSelectRecordForInspection={handleInspectFromHistory}
          />
        )}
        {activeTab === 'matrix' && <SeverityMatrixView />}
        {activeTab === 'pipeline' && <ModelPipelineView />}
      </main>

      {/* Industrial Footer */}
      <footer className="border-t border-rail-border bg-ivory-200/70 text-charcoal-700 py-6 px-4 sm:px-6 lg:px-8 text-xs font-mono select-none">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-bold text-charcoal-900">RAILGUARD AI</span>
            <span>•</span>
            <span>PERMANENT WAY SAFETY SYSTEMS</span>
            <span>•</span>
            <span className="text-signal-orange">YOLOv8n TRIPLE DEFECT CLASSIFICATION</span>
          </div>

          <div className="text-charcoal-500 text-[11px] text-center sm:text-right">
            <span>STANDARDS: UIC 712 R / AREMA VOL 1</span>
            <span className="mx-2">•</span>
            <span>CLASSES: SPALLING, WHEEL BURN, SQUAT</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
