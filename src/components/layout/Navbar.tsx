import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  History,
  BookOpen,
  Cpu,
  Radio,
} from 'lucide-react';
import { StatusIndicator } from '../ui/StatusIndicator';
import { cn } from '../../utils/cn';

export type NavTab = 'workspace' | 'history' | 'matrix' | 'pipeline';

interface NavbarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  defectCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  defectCount = 0,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    {
      id: 'workspace' as NavTab,
      label: 'INSPECTION WORKSPACE',
      num: '01',
      icon: <Radio className="w-4 h-4" />,
      badge: defectCount > 0 ? defectCount : undefined,
    },
    {
      id: 'history' as NavTab,
      label: 'TRACK AUDIT LOG',
      num: '02',
      icon: <History className="w-4 h-4" />,
    },
    {
      id: 'matrix' as NavTab,
      label: 'UIC SEVERITY MATRIX',
      num: '03',
      icon: <BookOpen className="w-4 h-4" />,
    },
    {
      id: 'pipeline' as NavTab,
      label: 'YOLOv8 MODEL & DRIVE',
      num: '04',
      icon: <Cpu className="w-4 h-4" />,
    },
  ];

  return (
    <header className="border-b border-rail-border bg-charcoal-900 text-ivory-100 select-none">
      {/* Top Utility Telemetry Strip */}
      <div className="border-b border-charcoal-800 px-4 py-1.5 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-charcoal-400">
        <div className="flex items-center gap-3">
          <span className="text-signal-orange font-bold tracking-widest">
            PERMANENT WAY INFRASTRUCTURE
          </span>
          <span>•</span>
          <span>SYSTEM REV: v0.1.0-YOLOv8n</span>
          <span>•</span>
          <span className="text-charcoal-300">UIC 712 R COMPLIANT</span>
        </div>

        <div className="flex items-center gap-4">
          <StatusIndicator
            status="standby"
            label="MODEL: YOLOv8n"
            sublabel="DRIVE CHECKPOINT STAGED"
            className="text-ivory-200"
          />
          <div className="h-3 w-[1px] bg-charcoal-700 hidden sm:block" />
          <span className="font-mono text-ivory-300 hidden sm:inline">
            {currentTime || '2026-10-14 14:35:00 UTC'}
          </span>
        </div>
      </div>

      {/* Main Branding and Nav Container */}
      <div className="px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-signal-orange flex items-center justify-center text-white shrink-0 shadow-sm">
            <ShieldAlert className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-white font-sans">
                RAILGUARD AI
              </span>
              <span className="text-[10px] font-mono uppercase bg-charcoal-800 text-signal-orange border border-charcoal-700 px-1.5 py-0.5 font-bold">
                PRECISION DEFECT RADAR
              </span>
            </div>
            <p className="text-[11px] text-charcoal-400 font-mono tracking-tight">
              RAILWAY TRACK DEFECT DETECTION &amp; SEVERITY ASSESSMENT
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav
          aria-label="Primary Navigation"
          className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none"
        >
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={cn(
                  'px-3 py-2 text-xs font-mono font-medium tracking-wider flex items-center gap-2 border transition-all shrink-0',
                  isActive
                    ? 'bg-ivory-100 text-charcoal-900 border-ivory-100 font-bold shadow'
                    : 'text-charcoal-300 hover:text-white hover:bg-charcoal-800 border-transparent'
                )}
              >
                <span className={cn('text-[10px]', isActive ? 'text-signal-orange' : 'text-charcoal-500')}>
                  {item.num} //
                </span>
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className="ml-0.5 bg-signal-orange text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
