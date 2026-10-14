import React, { useState } from 'react';
import { DEFECT_CATALOG } from '../data/defectCatalog';
import { DefectClass, DefectSeverity } from '../types/inspection';
import { SectionHeader } from '../components/ui/SectionHeader';
import { SeverityBadge } from '../components/ui/Badge';
import { Calculator } from 'lucide-react';

export const SeverityMatrixView: React.FC = () => {
  // Interactive Severity Calculator State
  const [calcClass, setCalcClass] = useState<DefectClass>('squat');
  const [calcDepth, setCalcDepth] = useState<number>(3.5);
  const [calcLength, setCalcLength] = useState<number>(28);
  const [calcSpeed, setCalcSpeed] = useState<number>(120);
  const [calcTonnage, setCalcTonnage] = useState<number>(45);

  // Computed severity logic
  const computeSeverity = (): {
    severity: DefectSeverity;
    tsr: number | null;
    timeline: string;
    action: string;
  } => {
    if (calcClass === 'squat') {
      if (calcDepth >= 3.0 || calcLength >= 25 || calcSpeed >= 120) {
        return {
          severity: 'critical',
          tsr: 50,
          timeline: 'Within 24 Hours',
          action: 'Impose immediate 50 km/h Temporary Speed Restriction (TSR). Ultrasonic depth verification; rail segment replacement with thermite weld within 7 days.',
        };
      } else if (calcDepth >= 1.5) {
        return {
          severity: 'high',
          tsr: 80,
          timeline: 'Within 7 Days',
          action: 'Apply 80 km/h speed restriction. NDT ultrasonic examination; plan rail plug insertion.',
        };
      } else {
        return {
          severity: 'medium',
          tsr: null,
          timeline: 'Within 14 Days',
          action: 'Reprofile running band via precision rail grinding.',
        };
      }
    }

    if (calcClass === 'wheel_burn') {
      if (calcDepth >= 2.0 || calcLength >= 35) {
        return {
          severity: 'critical',
          tsr: 60,
          timeline: 'Within 48 Hours',
          action: 'Thermal martensitic crust failure hazard. Clamp fishplates over thermal zone or weld build-up.',
        };
      } else if (calcDepth >= 1.0) {
        return {
          severity: 'high',
          tsr: null,
          timeline: 'Within 7 Days',
          action: 'Grind depression to transition slope 1:500. Ultrasonic scan for thermal shock transverse fissures.',
        };
      } else {
        return {
          severity: 'medium',
          tsr: null,
          timeline: 'Routine Campaign',
          action: 'Surface polishing pass during cyclic rail maintenance.',
        };
      }
    }

    // Spalling
    if (calcDepth >= 2.5 || calcLength >= 40) {
      return {
        severity: 'high',
        tsr: 90,
        timeline: 'Within 14 Days',
        action: 'Heavy cyclic fatigue metal loss. Profile grinding pass 1.5mm; re-measure gauge corner angle.',
      };
    } else if (calcDepth >= 1.0) {
      return {
        severity: 'medium',
        tsr: null,
        timeline: 'Next Grinding Run',
        action: 'Corrective reprofiling pass to remove RCF micro-cracks before coalescence.',
      };
    } else {
      return {
        severity: 'low',
        tsr: null,
        timeline: 'Cyclic Audit (30 Days)',
        action: 'Routine track geometry vehicle patrol and visual verification.',
      };
    }
  };

  const calculated = computeSeverity();

  return (
    <div className="space-y-8 text-charcoal-900">
      <SectionHeader
        sectionNumber="03"
        metadata="ENGINEERING STANDARDS COMPENDIUM // UIC 712 R"
        title="Defect Classification &amp; Severity Assessment Protocol"
        subtitle="Permanent Way technical specifications for YOLOv8n defect classes: Rolling Contact Fatigue (Spalling), Martensitic Slip (Wheel Burn), and Transverse Sub-surface Branching (Squat)."
      />

      {/* The 3 Core YOLOv8 Classes Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Spalling */}
        <div className="bg-ivory-50 border-t-4 border-t-defect-spalling border-r border-b border-l border-rail-border p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-mono mb-2">
              <span className="font-bold text-signal-orange">CLASS 01</span>
              <span className="text-charcoal-500">{DEFECT_CATALOG.spalling.uicReference}</span>
            </div>
            <h3 className="font-bold text-base text-charcoal-900 mb-2">
              {DEFECT_CATALOG.spalling.displayName}
            </h3>
            <p className="text-xs text-charcoal-700 leading-relaxed mb-3">
              {DEFECT_CATALOG.spalling.description}
            </p>

            <div className="space-y-1.5 text-xs pt-2 border-t border-rail-border">
              <div className="text-[10px] font-mono uppercase text-charcoal-500 font-semibold">
                ROOT CAUSES
              </div>
              <ul className="list-disc list-inside text-charcoal-600 text-[11px] space-y-1">
                {DEFECT_CATALOG.spalling.rootCauses.map((c, i) => (
                  <li key={i} className="leading-snug">
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-rail-border bg-ivory-100 p-2 text-xs">
            <span className="text-[10px] font-mono text-charcoal-500 uppercase block font-semibold">
              STANDARD INTERVENTION
            </span>
            <span className="text-charcoal-800 text-[11px] leading-snug">
              {DEFECT_CATALOG.spalling.standardRemedy}
            </span>
          </div>
        </div>

        {/* Wheel Burn */}
        <div className="bg-ivory-50 border-t-4 border-t-defect-wheelburn border-r border-b border-l border-rail-border p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-mono mb-2">
              <span className="font-bold text-defect-wheelburn">CLASS 02</span>
              <span className="text-charcoal-500">{DEFECT_CATALOG.wheel_burn.uicReference}</span>
            </div>
            <h3 className="font-bold text-base text-charcoal-900 mb-2">
              {DEFECT_CATALOG.wheel_burn.displayName}
            </h3>
            <p className="text-xs text-charcoal-700 leading-relaxed mb-3">
              {DEFECT_CATALOG.wheel_burn.description}
            </p>

            <div className="space-y-1.5 text-xs pt-2 border-t border-rail-border">
              <div className="text-[10px] font-mono uppercase text-charcoal-500 font-semibold">
                ROOT CAUSES
              </div>
              <ul className="list-disc list-inside text-charcoal-600 text-[11px] space-y-1">
                {DEFECT_CATALOG.wheel_burn.rootCauses.map((c, i) => (
                  <li key={i} className="leading-snug">
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-rail-border bg-ivory-100 p-2 text-xs">
            <span className="text-[10px] font-mono text-charcoal-500 uppercase block font-semibold">
              STANDARD INTERVENTION
            </span>
            <span className="text-charcoal-800 text-[11px] leading-snug">
              {DEFECT_CATALOG.wheel_burn.standardRemedy}
            </span>
          </div>
        </div>

        {/* Squat Defect */}
        <div className="bg-ivory-50 border-t-4 border-t-defect-squat border-r border-b border-l border-rail-border p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-mono mb-2">
              <span className="font-bold text-defect-squat">CLASS 03</span>
              <span className="text-charcoal-500">{DEFECT_CATALOG.squat.uicReference}</span>
            </div>
            <h3 className="font-bold text-base text-charcoal-900 mb-2">
              {DEFECT_CATALOG.squat.displayName}
            </h3>
            <p className="text-xs text-charcoal-700 leading-relaxed mb-3">
              {DEFECT_CATALOG.squat.description}
            </p>

            <div className="space-y-1.5 text-xs pt-2 border-t border-rail-border">
              <div className="text-[10px] font-mono uppercase text-charcoal-500 font-semibold">
                ROOT CAUSES
              </div>
              <ul className="list-disc list-inside text-charcoal-600 text-[11px] space-y-1">
                {DEFECT_CATALOG.squat.rootCauses.map((c, i) => (
                  <li key={i} className="leading-snug">
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-rail-border bg-[#FDF2F0] border-[#E8A29A] p-2 text-xs">
            <span className="text-[10px] font-mono text-[#9E241A] uppercase block font-bold">
              CRITICAL INTERVENTION
            </span>
            <span className="text-[#801B12] text-[11px] leading-snug">
              {DEFECT_CATALOG.squat.standardRemedy}
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Severity Assessment Tool */}
      <div className="bg-white border-2 border-charcoal-900 p-5 space-y-5">
        <div className="flex items-center justify-between border-b border-rail-border pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-charcoal-900 text-ivory-100 flex items-center justify-center font-mono text-xs font-bold">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-charcoal-900">
                Permanent Way Severity Matrix Calculator
              </h3>
              <p className="text-xs text-charcoal-600">
                Simulate track parameter inputs to evaluate safety critical thresholds and mandatory TSRs
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono text-charcoal-500 uppercase">
            CALCULATION ENGINE v1.2
          </span>
        </div>

        {/* Input Parameters Form */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-xs">
          <div>
            <label className="block text-[10px] font-mono uppercase text-charcoal-500 mb-1">
              Defect Class
            </label>
            <select
              value={calcClass}
              onChange={(e) => setCalcClass(e.target.value as DefectClass)}
              className="w-full bg-ivory-100 border border-rail-border px-2.5 py-2 font-mono text-xs text-charcoal-900 focus:outline-none focus:border-signal-orange"
            >
              <option value="squat">Squat Defect (UIC 227)</option>
              <option value="wheel_burn">Wheel Burn (UIC 225)</option>
              <option value="spalling">Spalling / Flaking (UIC 221)</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase text-charcoal-500 mb-1">
              Estimated Depth: {calcDepth} mm
            </label>
            <input
              type="range"
              min={0.2}
              max={6.0}
              step={0.1}
              value={calcDepth}
              onChange={(e) => setCalcDepth(parseFloat(e.target.value))}
              className="w-full accent-signal-orange mt-2 cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase text-charcoal-500 mb-1">
              Surface Length: {calcLength} mm
            </label>
            <input
              type="range"
              min={5}
              max={60}
              step={1}
              value={calcLength}
              onChange={(e) => setCalcLength(parseInt(e.target.value))}
              className="w-full accent-signal-orange mt-2 cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase text-charcoal-500 mb-1">
              Line Speed: {calcSpeed} km/h
            </label>
            <input
              type="range"
              min={40}
              max={250}
              step={10}
              value={calcSpeed}
              onChange={(e) => setCalcSpeed(parseInt(e.target.value))}
              className="w-full accent-signal-orange mt-2 cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase text-charcoal-500 mb-1">
              Annual Tonnage: {calcTonnage} MGT
            </label>
            <input
              type="range"
              min={5}
              max={100}
              step={5}
              value={calcTonnage}
              onChange={(e) => setCalcTonnage(parseInt(e.target.value))}
              className="w-full accent-signal-orange mt-2 cursor-pointer"
            />
          </div>
        </div>

        {/* Calculated Result Outcome Strip */}
        <div className="bg-ivory-100 border border-charcoal-900 p-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <div>
            <div className="text-[10px] font-mono text-charcoal-500 uppercase">
              COMPUTED SEVERITY TIER
            </div>
            <div className="mt-1">
              <SeverityBadge severity={calculated.severity} size="md" />
            </div>
          </div>

          <div>
            <div className="text-[10px] font-mono text-charcoal-500 uppercase">
              SPEED RESTRICTION (TSR)
            </div>
            <div className="font-mono text-lg font-bold text-charcoal-900 mt-0.5">
              {calculated.tsr ? (
                <span className="text-defect-squat">{calculated.tsr} km/h Cap</span>
              ) : (
                <span className="text-sage-800">No Restriction</span>
              )}
            </div>
          </div>

          <div>
            <div className="text-[10px] font-mono text-charcoal-500 uppercase">
              MANDATORY TIMELINE
            </div>
            <div className="font-mono font-bold text-charcoal-900 mt-0.5">
              {calculated.timeline}
            </div>
          </div>

          <div>
            <div className="text-[10px] font-mono text-charcoal-500 uppercase">
              PRESCRIBED REMEDY
            </div>
            <div className="text-xs text-charcoal-800 font-sans leading-snug mt-0.5">
              {calculated.action}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
