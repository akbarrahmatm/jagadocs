import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Move,
  RotateCw,
  Sparkles,
} from 'lucide-react';
import type { UploadedFile, WatermarkConfig } from '../types/watermark';
import { renderWatermarkOnCanvas } from '../utils/imageWatermark';
import { renderPdfPageToCanvas } from '../utils/pdfPreview';

interface PreviewCanvasProps {
  activeFile: UploadedFile | null;
  config: WatermarkConfig;
  logoImage: HTMLImageElement | null;
  onUpdateCustomPosition: (xPercent: number, yPercent: number) => void;
  onPageChange?: (newPage: number) => void;
}

export const PreviewCanvas: React.FC<PreviewCanvasProps> = ({
  activeFile,
  config,
  logoImage,
  onUpdateCustomPosition,
  onPageChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [isComparing, setIsComparing] = useState(false);
  const [isDraggingHandle, setIsDraggingHandle] = useState(false);
  const [cachedSourceImg, setCachedSourceImg] = useState<HTMLImageElement | HTMLCanvasElement | null>(null);
  const [isLoadingPdfPage, setIsLoadingPdfPage] = useState(false);

  // Load source image or PDF page when activeFile changes
  useEffect(() => {
    let isCancelled = false;

    if (!activeFile) {
      return;
    }

    if (activeFile.type === 'image') {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        if (!isCancelled) {
          setCachedSourceImg(img);
        }
      };
      img.src = activeFile.previewUrl;
    } else if (activeFile.type === 'pdf') {
      const pageNum = activeFile.pdfActivePage || 1;

      const loadPdf = async () => {
        setIsLoadingPdfPage(true);
        try {
          const buffer = activeFile.pdfArrayBuffer ?? (await activeFile.file.arrayBuffer());
          const { canvas } = await renderPdfPageToCanvas(buffer, pageNum, 2.0);
          if (!isCancelled) {
            setCachedSourceImg(canvas);
          }
        } catch (err) {
          console.error('Error rendering PDF page for preview:', err);
        } finally {
          if (!isCancelled) {
            setIsLoadingPdfPage(false);
          }
        }
      };

      loadPdf();
    }

    return () => {
      isCancelled = true;
    };
  }, [activeFile]);

  // Render on canvas whenever watermark config, source image, or compare mode changes
  const renderPreview = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !cachedSourceImg || !activeFile) return;

    if (isComparing) {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const width = (cachedSourceImg as HTMLImageElement).naturalWidth || cachedSourceImg.width;
      const height = (cachedSourceImg as HTMLImageElement).naturalHeight || cachedSourceImg.height;
      canvas.width = width;
      canvas.height = height;
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(cachedSourceImg, 0, 0, width, height);
    } else {
      renderWatermarkOnCanvas({
        canvas,
        sourceImage: cachedSourceImg,
        config,
        tokenContext: {
          filename: activeFile.name,
          page: activeFile.pdfActivePage || 1,
          totalPages: activeFile.pdfNumPages || 1,
        },
        logoImage,
      });
    }
  }, [cachedSourceImg, config, isComparing, activeFile, logoImage]);

  useEffect(() => {
    renderPreview();
  }, [renderPreview]);

  // Handle Dragging watermark on preview canvas
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (config.positionMode !== 'custom') return;
    setIsDraggingHandle(true);
    updatePositionFromMouse(e);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingHandle || config.positionMode !== 'custom') return;
    updatePositionFromMouse(e);
  };

  const handleMouseUp = () => {
    setIsDraggingHandle(false);
  };

  const updatePositionFromMouse = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const xPercent = Math.max(0, Math.min(100, Math.round((clickX / rect.width) * 100)));
    const yPercent = Math.max(0, Math.min(100, Math.round((clickY / rect.height) * 100)));

    onUpdateCustomPosition(xPercent, yPercent);
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.4));
  const handleResetZoom = () => setZoom(1);

  if (!activeFile) {
    return (
      <div className="w-full h-full min-h-[420px] rounded-3xl glass-panel flex flex-col items-center justify-center p-8 text-center text-slate-500 m-auto">
        <Sparkles className="w-8 h-8 text-indigo-400 mb-2 opacity-50" />
        <p className="text-sm font-medium">Select or upload a file to view real-time watermark preview</p>
      </div>
    );
  }

  const isPdf = activeFile.type === 'pdf';
  const totalPages = activeFile.pdfNumPages || 1;
  const currentPage = activeFile.pdfActivePage || 1;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className="flex flex-col h-full rounded-3xl glass-panel shadow-[0_25px_60px_rgba(0,0,0,0.5)] overflow-hidden relative"
    >
      {/* Top Floating Toolbar */}
      <div className="flex items-center justify-between px-5 py-3 bg-slate-950/60 backdrop-blur-xl border-b border-white/[0.08] text-xs text-slate-300 z-10 select-none">
        {/* Left: Document Info & PDF Pager */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            <span className="font-bold text-white truncate max-w-[180px] md:max-w-xs" title={activeFile.name}>
              {activeFile.name}
            </span>
          </div>

          {isPdf && totalPages > 1 && (
            <div className="flex items-center gap-1.5 glass-pill px-2.5 py-1 rounded-xl shadow-inner">
              <button
                type="button"
                disabled={currentPage <= 1 || isLoadingPdfPage}
                onClick={() => onPageChange && onPageChange(currentPage - 1)}
                className="p-1 rounded-lg hover:bg-white/10 disabled:opacity-30 cursor-pointer transition-colors"
                title="Previous page"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-bold text-slate-200 min-w-[50px] text-center font-mono">
                {isLoadingPdfPage ? (
                  <RotateCw className="w-3 h-3 animate-spin inline mr-1 text-indigo-400" />
                ) : null}
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage >= totalPages || isLoadingPdfPage}
                onClick={() => onPageChange && onPageChange(currentPage + 1)}
                className="p-1 rounded-lg hover:bg-white/10 disabled:opacity-30 cursor-pointer transition-colors"
                title="Next page"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Right: Compare & Zoom Pills */}
        <div className="flex items-center gap-2.5">
          {/* Compare Button */}
          <button
            type="button"
            onMouseDown={() => setIsComparing(true)}
            onMouseUp={() => setIsComparing(false)}
            onTouchStart={() => setIsComparing(true)}
            onTouchEnd={() => setIsComparing(false)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer select-none ${
              isComparing
                ? 'bg-amber-400 text-slate-950 shadow-[0_0_20px_rgba(251,191,36,0.4)] scale-95'
                : 'glass-pill hover:bg-white/10 text-slate-300'
            }`}
            title="Hold to see original without watermark"
          >
            {isComparing ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-indigo-400" />}
            <span className="hidden sm:inline">
              {isComparing ? 'Original' : 'Hold to Compare'}
            </span>
          </button>

          {/* Zoom Controls */}
          <div className="flex items-center gap-1 glass-pill rounded-xl p-0.5">
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-1.5 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white cursor-pointer transition-colors"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleResetZoom}
              className="text-[11px] font-bold px-2 py-0.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white cursor-pointer font-mono"
              title="Reset zoom"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              type="button"
              onClick={handleZoomIn}
              className="p-1.5 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white cursor-pointer transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Canvas Viewport Stage (Always centered) */}
      <div className="flex-1 overflow-auto p-4 md:p-8 flex items-center justify-center bg-checkerboard min-h-[380px] select-none relative">
        {isLoadingPdfPage ? (
          <div className="flex flex-col items-center gap-3 text-indigo-300 glass-card px-8 py-5 rounded-2xl border border-white/10 shadow-2xl m-auto">
            <RotateCw className="w-7 h-7 animate-spin text-indigo-400" />
            <span className="text-xs font-bold tracking-wide">Rendering Page {currentPage}...</span>
          </div>
        ) : (
          <div
            className="relative transition-transform duration-100 ease-out origin-center flex items-center justify-center m-auto"
            style={{
              transform: `scale(${zoom})`,
            }}
          >
            <canvas
              ref={canvasRef}
              onMouseDown={handleCanvasMouseDown}
              className={`max-w-full max-h-[66vh] object-contain rounded-xl shadow-[0_25px_60px_rgba(0,0,0,0.6)] border border-white/10 transition-all block mx-auto ${
                config.positionMode === 'custom' ? 'cursor-crosshair' : 'cursor-default'
              }`}
            />

            {/* Custom drag visual indicator handle with glowing ring */}
            {config.positionMode === 'custom' && (
              <div
                className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 border-2 border-dashed border-indigo-400 rounded-xl flex items-center justify-center bg-indigo-500/20 backdrop-blur-sm shadow-[0_0_20px_rgba(99,102,241,0.5)] transition-all"
                style={{
                  left: `${config.customPosition.xPercent}%`,
                  top: `${config.customPosition.yPercent}%`,
                  width: '80px',
                  height: '40px',
                }}
              >
                <Move className="w-4 h-4 text-white animate-bounce" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Spatial Status Strip */}
      <div className="px-5 py-2.5 bg-slate-950/70 backdrop-blur-xl border-t border-white/[0.08] flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-2">
          {config.positionMode === 'custom' ? (
            <span className="flex items-center gap-1.5 text-indigo-300 font-semibold">
              <Move className="w-3.5 h-3.5" />
              Click &amp; drag anywhere on canvas to reposition watermark freely
            </span>
          ) : (
            <span>Layout Mode: <strong className="text-slate-200 capitalize">{config.positionMode} ({config.gridPosition})</strong></span>
          )}
        </div>

        <div className="font-mono text-slate-400">
          {isPdf ? (
            <span className="text-rose-400 font-semibold">PDF Document Page {currentPage}/{totalPages}</span>
          ) : (
            <span className="text-slate-400">High Resolution Canvas</span>
          )}
        </div>
      </div>
    </div>
  );
};
