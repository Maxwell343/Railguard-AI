import React, { useState, useRef } from 'react';
import { DefectPrediction, DefectClass } from '../../types/inspection';
import { DEFECT_CATALOG } from '../../data/defectCatalog';
import { ZoomIn, ZoomOut, RotateCcw, Eye, EyeOff, Crosshair } from 'lucide-react';
import { cn } from '../../utils/cn';

interface InteractiveTrackCanvasProps {
  imageUrl: string;
  predictions: DefectPrediction[];
  selectedPredictionId: string | null;
  onSelectPrediction: (prediction: DefectPrediction | null) => void;
  visibleClasses: Set<DefectClass>;
  confidenceCutoff: number;
  isScanning?: boolean;
}

export const InteractiveTrackCanvas: React.FC<InteractiveTrackCanvasProps> = ({
  imageUrl,
  predictions,
  selectedPredictionId,
  onSelectPrediction,
  visibleClasses,
  confidenceCutoff,
  isScanning = false,
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [showOverlays, setShowOverlays] = useState<boolean>(true);
  const [showCrosshairs, setShowCrosshairs] = useState<boolean>(false);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredPredictions = predictions.filter(
    (p) => visibleClasses.has(p.defectClass) && p.confidence >= confidenceCutoff
  );

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.75));
  const handleResetZoom = () => setZoom(1);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  return (
    <div className="relative border border-rail-border-strong bg-charcoal-950 overflow-hidden select-none flex flex-col">
      {/* Canvas Top Industrial Toolbar */}
      <div className="bg-charcoal-900 border-b border-charcoal-800 px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-ivory-200">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-signal-orange"></span>
          <span className="font-semibold tracking-wider uppercase text-ivory-100">
            OPTICAL SCANNER FEED
          </span>
          <span className="text-charcoal-400">|</span>
          <span className="text-charcoal-400">
            YOLOv8n : {filteredPredictions.length} DEFECTS PINPOINTED
          </span>
        </div>

        {/* View Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowOverlays(!showOverlays)}
            title="Toggle Defect Bounding Boxes"
            className={cn(
              'px-2 py-1 flex items-center gap-1 text-[11px] border border-charcoal-700 transition-colors',
              showOverlays
                ? 'bg-charcoal-800 text-ivory-100 border-signal-orange'
                : 'text-charcoal-400 hover:text-ivory-200'
            )}
          >
            {showOverlays ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>BOUNDING BOXES</span>
          </button>

          <button
            type="button"
            onClick={() => setShowCrosshairs(!showCrosshairs)}
            title="Toggle Reticle / Track Gauge Guide"
            className={cn(
              'p-1 text-[11px] border border-charcoal-700 transition-colors',
              showCrosshairs
                ? 'bg-charcoal-800 text-signal-orange border-signal-orange'
                : 'text-charcoal-400 hover:text-ivory-200'
            )}
          >
            <Crosshair className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-[1px] bg-charcoal-800 mx-1" />

          <button
            type="button"
            onClick={handleZoomOut}
            title="Zoom Out"
            className="p-1 border border-charcoal-700 text-charcoal-300 hover:text-ivory-100 hover:bg-charcoal-800"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-mono px-1 min-w-[3rem] text-center text-charcoal-300">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={handleZoomIn}
            title="Zoom In"
            className="p-1 border border-charcoal-700 text-charcoal-300 hover:text-ivory-100 hover:bg-charcoal-800"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleResetZoom}
            title="Reset Zoom"
            className="p-1 border border-charcoal-700 text-charcoal-300 hover:text-ivory-100 hover:bg-charcoal-800"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Viewport */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setMousePos(null)}
        className="relative w-full aspect-[16/10] sm:aspect-[16/9] bg-charcoal-950 flex items-center justify-center overflow-hidden cursor-crosshair"
      >
        {/* Subtle engineering grid background */}
        <div className="absolute inset-0 rail-grid-dense opacity-20 pointer-events-none" />

        {/* Scanning laser animation overlay when running inference */}
        {isScanning && (
          <div className="absolute inset-0 z-30 pointer-events-none bg-signal-orange/5 overflow-hidden">
            <div className="w-full h-1 bg-signal-orange shadow-[0_0_12px_#D9653B] animate-pulse absolute top-1/2 -translate-y-1/2" />
            <div className="absolute bottom-4 left-4 bg-charcoal-900/90 text-signal-orange border border-signal-orange px-3 py-1 text-xs font-mono tracking-wider animate-pulse flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-signal-orange animate-ping" />
              YOLOV8n INFERENCE PASS IN PROGRESS (640×640 TENSOR)...
            </div>
          </div>
        )}

        {/* Reticle / Crosshair overlay */}
        {showCrosshairs && mousePos && (
          <div className="absolute inset-0 pointer-events-none z-20">
            <div
              className="absolute left-0 right-0 border-t border-signal-orange/40 border-dashed"
              style={{ top: `${mousePos.y}%` }}
            />
            <div
              className="absolute top-0 bottom-0 border-l border-signal-orange/40 border-dashed"
              style={{ left: `${mousePos.x}%` }}
            />
            <div
              className="absolute font-mono text-[9px] bg-charcoal-900/90 text-ivory-200 border border-charcoal-700 px-1 py-0.5"
              style={{ top: `calc(${mousePos.y}% + 6px)`, left: `calc(${mousePos.x}% + 6px)` }}
            >
              X: {mousePos.x.toFixed(1)}% | Y: {mousePos.y.toFixed(1)}%
            </div>
          </div>
        )}

        {/* Scalable Canvas Content */}
        <div
          className="relative transition-transform duration-150 ease-out origin-center"
          style={{ transform: `scale(${zoom})` }}
        >
          <img
            src={imageUrl}
            alt="Track Inspection Scan"
            className="block max-h-[600px] w-auto object-contain select-none shadow-md"
            draggable={false}
          />

          {/* Defect Bounding Boxes */}
          {showOverlays &&
            filteredPredictions.map((pred) => {
              const isSelected = selectedPredictionId === pred.id;
              const catalogInfo = DEFECT_CATALOG[pred.defectClass];
              const strokeColor = catalogInfo?.accentColor || '#D9653B';

              // Convert normalized coordinates [0..1] to CSS percentage
              const left = `${pred.bbox.x * 100}%`;
              const top = `${pred.bbox.y * 100}%`;
              const width = `${pred.bbox.width * 100}%`;
              const height = `${pred.bbox.height * 100}%`;

              return (
                <div
                  key={pred.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectPrediction(isSelected ? null : pred);
                  }}
                  className={cn(
                    'absolute border-2 transition-all cursor-pointer group z-10',
                    isSelected
                      ? 'border-white ring-2 ring-signal-orange shadow-lg'
                      : 'hover:border-white'
                  )}
                  style={{
                    left,
                    top,
                    width,
                    height,
                    borderColor: strokeColor,
                    backgroundColor: isSelected
                      ? 'rgba(217, 101, 59, 0.25)'
                      : 'rgba(37, 42, 40, 0.15)',
                  }}
                >
                  {/* Defect Tag Header on Top-Left of Box */}
                  <div
                    className="absolute -top-6 left-0 flex items-center gap-1 font-mono text-[10px] uppercase font-bold text-white px-1.5 py-0.5 tracking-wider shadow"
                    style={{ backgroundColor: strokeColor }}
                  >
                    <span>{catalogInfo.displayName.split(' ')[0]}</span>
                    <span className="opacity-90">{(pred.confidence * 100).toFixed(0)}%</span>
                  </div>

                  {/* Corner Reticle Markers for Industrial feel */}
                  <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t-2 border-l-2 border-white" />
                  <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t-2 border-r-2 border-white" />
                  <div className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b-2 border-l-2 border-white" />
                  <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b-2 border-r-2 border-white" />
                </div>
              );
            })}
        </div>
      </div>

      {/* Canvas Bottom Coordinates and Telemetry Strip */}
      <div className="bg-charcoal-900 border-t border-charcoal-800 px-3 py-1.5 flex flex-wrap items-center justify-between text-[11px] font-mono text-charcoal-400">
        <div className="flex items-center gap-3">
          <span>TENSOR: 640×640×3 (RGB)</span>
          <span>•</span>
          <span>NMS IoU: 0.45</span>
          <span>•</span>
          <span>CLASSES: [SPALLING, WHEEL_BURN, SQUAT]</span>
        </div>
        <div className="text-ivory-200 flex items-center gap-2">
          <span className="text-charcoal-500">CANVAS MODE:</span>
          <span className="text-signal-orange font-semibold">INTERACTIVE INSPECTOR</span>
        </div>
      </div>
    </div>
  );
};
