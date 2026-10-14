import React, { useState, useRef, useEffect } from 'react';
import { DefectPrediction, DefectClass } from '../../types/inspection';
import { DEFECT_CATALOG } from '../../data/defectCatalog';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Eye,
  EyeOff,
  Crosshair,
  Upload,
  Play,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { Button } from '../ui/Button';

interface InteractiveTrackCanvasProps {
  imageUrl: string | null;
  predictions: DefectPrediction[];
  selectedPredictionId: string | null;
  hoveredPredictionId?: string | null;
  onSelectPrediction: (prediction: DefectPrediction | null) => void;
  onHoverPrediction?: (predictionId: string | null) => void;
  visibleClasses: Set<DefectClass>;
  confidenceCutoff: number;
  isScanning?: boolean;
  isStaged?: boolean;
  isDemoMode?: boolean;
  onStartAnalysis?: () => void;
  onUploadClick?: () => void;
  onDropFile?: (file: File) => void;
}

export const InteractiveTrackCanvas: React.FC<InteractiveTrackCanvasProps> = ({
  imageUrl,
  predictions,
  selectedPredictionId,
  hoveredPredictionId,
  onSelectPrediction,
  onHoverPrediction,
  visibleClasses,
  confidenceCutoff,
  isScanning = false,
  isStaged = false,
  isDemoMode = true,
  onStartAnalysis,
  onUploadClick,
  onDropFile,
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [showOverlays, setShowOverlays] = useState<boolean>(true);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [showCrosshairs, setShowCrosshairs] = useState<boolean>(false);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const imageWrapperRef = useRef<HTMLDivElement>(null);

  // Filter predictions matching confidence cutoff and visible classes
  const filteredPredictions = isStaged
    ? []
    : predictions.filter(
        (p) => visibleClasses.has(p.defectClass) && p.confidence >= confidenceCutoff
      );

  const handleZoomIn = () => setZoom((prev) => Math.min(Number((prev + 0.25).toFixed(2)), 3.0));
  const handleZoomOut = () => setZoom((prev) => Math.max(Number((prev - 0.25).toFixed(2)), 0.75));
  const handleResetZoom = () => setZoom(1);

  // Reset zoom whenever image changes
  useEffect(() => {
    setZoom(1);
  }, [imageUrl]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setMousePos({ x, y });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && onDropFile) {
      onDropFile(file);
    }
  };

  return (
    <div
      className={cn(
        'relative border bg-charcoal-950 overflow-hidden select-none flex flex-col transition-colors',
        isDragOver ? 'border-signal-orange ring-2 ring-signal-orange/40' : 'border-rail-border-strong'
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Canvas Top Industrial Toolbar */}
      <div className="bg-charcoal-900 border-b border-charcoal-800 px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-ivory-200">
        {/* Left Telemetry and Mode Indicator */}
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={cn(
              'w-2 h-2 rounded-full',
              isScanning
                ? 'bg-signal-orange animate-ping'
                : isStaged
                ? 'bg-amber-400'
                : imageUrl
                ? 'bg-emerald-500'
                : 'bg-charcoal-600'
            )}
          />
          <span className="font-semibold tracking-wider uppercase text-ivory-100">
            {isStaged ? 'STAGED SCAN PREVIEW' : 'OPTICAL INSPECTION CANVAS'}
          </span>

          <span className="text-charcoal-600 hidden sm:inline">|</span>

          {/* Clear Demonstration Mode or Live Engine Indicator */}
          {isDemoMode ? (
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-charcoal-800 border border-signal-orange text-signal-orange">
              [DEMO MODE: SIMULATED INFERENCE]
            </span>
          ) : (
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-emerald-950 border border-emerald-500 text-emerald-400">
              [LIVE YOLOv8n BACKEND]
            </span>
          )}

          {!isStaged && imageUrl && (
            <span className="text-charcoal-400 hidden md:inline text-[11px]">
              • {filteredPredictions.length} OF {predictions.length} DEFECTS SHOWN
            </span>
          )}
        </div>

        {/* View and Layer Controls */}
        {imageUrl && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setShowOverlays(!showOverlays)}
              title="Toggle Defect Bounding Boxes"
              className={cn(
                'px-2 py-1 flex items-center gap-1 text-[11px] border transition-colors',
                showOverlays
                  ? 'bg-charcoal-800 text-ivory-100 border-signal-orange'
                  : 'bg-charcoal-900 text-charcoal-400 border-charcoal-700 hover:text-ivory-200'
              )}
            >
              {showOverlays ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>BOXES</span>
            </button>

            {showOverlays && (
              <button
                type="button"
                onClick={() => setShowLabels(!showLabels)}
                title="Toggle Detection Class & Confidence Badges"
                className={cn(
                  'px-2 py-1 flex items-center gap-1 text-[11px] border transition-colors',
                  showLabels
                    ? 'bg-charcoal-800 text-ivory-100 border-charcoal-600'
                    : 'bg-charcoal-900 text-charcoal-400 border-charcoal-700 hover:text-ivory-200'
                )}
              >
                <span>LABELS</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowCrosshairs(!showCrosshairs)}
              title="Toggle Engineering Reticle Crosshairs"
              className={cn(
                'p-1 text-[11px] border transition-colors',
                showCrosshairs
                  ? 'bg-charcoal-800 text-signal-orange border-signal-orange'
                  : 'bg-charcoal-900 text-charcoal-400 border-charcoal-700 hover:text-ivory-200'
              )}
            >
              <Crosshair className="w-3.5 h-3.5" />
            </button>

            <div className="h-4 w-[1px] bg-charcoal-800 mx-1 hidden sm:block" />

            <div className="flex items-center">
              <button
                type="button"
                onClick={handleZoomOut}
                disabled={zoom <= 0.75}
                title="Zoom Out"
                className="p-1 border border-charcoal-700 text-charcoal-300 hover:text-ivory-100 hover:bg-charcoal-800 disabled:opacity-40"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono px-1.5 min-w-[3rem] text-center text-charcoal-300">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                onClick={handleZoomIn}
                disabled={zoom >= 3.0}
                title="Zoom In"
                className="p-1 border border-charcoal-700 text-charcoal-300 hover:text-ivory-100 hover:bg-charcoal-800 disabled:opacity-40"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleResetZoom}
                title="Reset Zoom to 100%"
                className="p-1 border border-charcoal-700 text-charcoal-300 hover:text-ivory-100 hover:bg-charcoal-800 ml-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Viewport */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setMousePos(null)}
        className="relative w-full min-h-[380px] sm:min-h-[460px] max-h-[640px] bg-charcoal-950 flex items-center justify-center overflow-hidden cursor-crosshair"
      >
        {/* Subtle engineering grid background */}
        <div className="absolute inset-0 rail-grid-dense opacity-15 pointer-events-none" />

        {/* Empty State: No image uploaded or selected */}
        {!imageUrl && (
          <div className="p-8 text-center max-w-md mx-auto space-y-4 z-10 select-none">
            <div className="w-14 h-14 mx-auto bg-charcoal-900 border border-rail-border-strong flex items-center justify-center text-signal-orange">
              <Upload className="w-7 h-7 stroke-[1.8]" />
            </div>
            <div>
              <h4 className="font-sans font-bold text-base text-ivory-100">
                No Track Inspection Image Loaded
              </h4>
              <p className="text-xs text-charcoal-400 mt-1 leading-relaxed">
                Drag and drop an optical scan of the rail running surface, or select a Colab benchmark preset above to begin defect localization.
              </p>
            </div>
            <div className="pt-2">
              <Button
                variant="signal"
                size="md"
                leftIcon={<Upload className="w-4 h-4" />}
                onClick={onUploadClick}
              >
                CHOOSE IMAGE TO INGEST
              </Button>
            </div>
            <div className="text-[10px] font-mono text-charcoal-500 uppercase">
              SUPPORTED: JPEG, PNG, WEBP • MAX 25 MB
            </div>
          </div>
        )}

        {/* Scanning laser animation overlay when running inference */}
        {isScanning && (
          <div className="absolute inset-0 z-30 pointer-events-none bg-signal-orange/10 overflow-hidden flex flex-col justify-between p-4">
            <div className="w-full h-1 bg-signal-orange shadow-[0_0_16px_#D9653B] animate-pulse" />
            <div className="self-start bg-charcoal-950/95 text-signal-orange border border-signal-orange px-3 py-1.5 text-xs font-mono tracking-wider shadow-lg flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-signal-orange animate-ping" />
              <span>YOLOv8n TENSOR PASS IN PROGRESS (640×640 RESOLUTION)...</span>
            </div>
          </div>
        )}

        {/* Staged State Banner overlay: Image is loaded, awaiting explicit analysis trigger */}
        {imageUrl && isStaged && !isScanning && (
          <div className="absolute top-4 left-4 right-4 z-20 pointer-events-auto flex items-center justify-between gap-3 bg-charcoal-900/90 border border-amber-500/60 p-3 shadow-lg">
            <div className="flex items-center gap-2.5 text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="text-ivory-100">
                <span className="font-bold text-amber-400 font-mono">IMAGE STAGED //</span> Review track telemetry below, then execute YOLOv8n inference to locate defects.
              </div>
            </div>
            <Button
              variant="signal"
              size="sm"
              leftIcon={<Play className="w-3.5 h-3.5 fill-current" />}
              onClick={onStartAnalysis}
            >
              RUN ANALYSIS
            </Button>
          </div>
        )}

        {/* Reticle / Crosshair overlay */}
        {showCrosshairs && mousePos && imageUrl && (
          <div className="absolute inset-0 pointer-events-none z-20">
            <div
              className="absolute left-0 right-0 border-t border-signal-orange/50 border-dashed"
              style={{ top: `${mousePos.y}%` }}
            />
            <div
              className="absolute top-0 bottom-0 border-l border-signal-orange/50 border-dashed"
              style={{ left: `${mousePos.x}%` }}
            />
            <div
              className="absolute font-mono text-[9px] bg-charcoal-950 text-ivory-200 border border-charcoal-700 px-1.5 py-0.5 shadow"
              style={{
                top: mousePos.y > 85 ? `calc(${mousePos.y}% - 22px)` : `calc(${mousePos.y}% + 6px)`,
                left: mousePos.x > 80 ? `calc(${mousePos.x}% - 80px)` : `calc(${mousePos.x}% + 6px)`,
              }}
            >
              GAUGE X: {mousePos.x.toFixed(1)}% | Y: {mousePos.y.toFixed(1)}%
            </div>
          </div>
        )}

        {/* Scalable Canvas Content: Exact inline-block wrapper tightly bounding the image */}
        {imageUrl && (
          <div
            className="p-4 flex items-center justify-center transition-transform duration-150 ease-out origin-center"
            style={{ transform: `scale(${zoom})` }}
          >
            <div
              ref={imageWrapperRef}
              className="relative inline-block select-none shadow-2xl border border-charcoal-800"
              style={{ maxWidth: '100%' }}
            >
              <img
                src={imageUrl}
                alt="Track Inspection Scan"
                className="block max-h-[540px] w-auto max-w-full object-contain pointer-events-none select-none"
                draggable={false}
              />

              {/* Defect Bounding Boxes Overlay */}
              {showOverlays &&
                !isStaged &&
                filteredPredictions.map((pred) => {
                  const isSelected = selectedPredictionId === pred.id;
                  const isHovered = hoveredPredictionId === pred.id;
                  const catalogInfo = DEFECT_CATALOG[pred.defectClass];
                  const strokeColor = catalogInfo?.accentColor || '#D9653B';

                  // Normalized coordinates [0..1] mapped directly to percentage of image bounds
                  const left = `${pred.bbox.x * 100}%`;
                  const top = `${pred.bbox.y * 100}%`;
                  const width = `${pred.bbox.width * 100}%`;
                  const height = `${pred.bbox.height * 100}%`;

                  // Avoid clipping labels when the defect box is near the top edge of the image
                  const isNearTopEdge = pred.bbox.y < 0.08;
                  const isNearRightEdge = pred.bbox.x + pred.bbox.width > 0.85;

                  return (
                    <div
                      key={pred.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectPrediction(isSelected ? null : pred);
                      }}
                      onMouseEnter={() => onHoverPrediction && onHoverPrediction(pred.id)}
                      onMouseLeave={() => onHoverPrediction && onHoverPrediction(null)}
                      className={cn(
                        'absolute border-2 transition-all cursor-pointer z-10 group',
                        isSelected
                          ? 'ring-2 ring-white shadow-xl scale-[1.01]'
                          : isHovered
                          ? 'ring-1 ring-white/70'
                          : ''
                      )}
                      style={{
                        left,
                        top,
                        width,
                        height,
                        borderColor: isSelected ? '#FFFFFF' : strokeColor,
                        backgroundColor: isSelected
                          ? 'rgba(217, 101, 59, 0.32)'
                          : isHovered
                          ? 'rgba(217, 101, 59, 0.20)'
                          : 'rgba(37, 42, 40, 0.12)',
                      }}
                    >
                      {/* Detection Label Badge */}
                      {showLabels && (
                        <div
                          className={cn(
                            'absolute flex items-center gap-1 font-mono text-[10px] uppercase font-bold text-white px-1.5 py-0.5 tracking-wider shadow pointer-events-none z-20 whitespace-nowrap',
                            isNearTopEdge ? 'top-0' : '-top-6',
                            isNearRightEdge ? 'right-0' : 'left-0'
                          )}
                          style={{
                            backgroundColor: strokeColor,
                            outline: isSelected ? '1px solid #FFFFFF' : 'none',
                          }}
                        >
                          <span>{catalogInfo.displayName.split(' ')[0]}</span>
                          <span className="opacity-90 font-mono text-[9px]">
                            {(pred.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                      )}

                      {/* Precise Corner Marks for Engineering Reticle Feel */}
                      <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t-2 border-l-2 border-white" />
                      <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t-2 border-r-2 border-white" />
                      <div className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b-2 border-l-2 border-white" />
                      <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b-2 border-r-2 border-white" />
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>

      {/* Canvas Bottom Coordinates and Telemetry Strip */}
      <div className="bg-charcoal-900 border-t border-charcoal-800 px-3 py-1.5 flex flex-wrap items-center justify-between text-[11px] font-mono text-charcoal-400 gap-2">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span>TENSOR: 640×640 (YOLOv8n)</span>
          <span>•</span>
          <span>IoU THRESHOLD: 0.45</span>
          <span>•</span>
          <span className="text-ivory-300">CLASSES: SPALLING, WHEEL_BURN, SQUAT</span>
        </div>
        <div className="text-ivory-200 flex items-center gap-2">
          <span className="text-charcoal-500">ENGINEERING STATUS:</span>
          {isStaged ? (
            <span className="text-amber-400 font-semibold uppercase">AWAITING ANALYSIS</span>
          ) : predictions.length > 0 ? (
            <span className="text-signal-orange font-semibold uppercase">DEFECTS ANNOTATED</span>
          ) : (
            <span className="text-sage-800 font-semibold uppercase">ZERO ANOMALIES</span>
          )}
        </div>
      </div>
    </div>
  );
};
