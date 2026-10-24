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
  Crop,
  Layers,
  RotateCcw,
} from 'lucide-react';
import type { UploadedFile, WatermarkConfig, CropConfig } from '../types/watermark';
import { renderWatermarkOnCanvas } from '../utils/imageWatermark';
import { renderPdfPageToCanvas } from '../utils/pdfPreview';
import {
  toPixels,
  fromPixels,
  autoDetectWhiteMargins,
  formatPaperDimensions,
  clampCropMargins,
} from '../utils/cropUtils';

interface PreviewCanvasProps {
  activeFile: UploadedFile | null;
  config: WatermarkConfig;
  logoImage: HTMLImageElement | null;
  onUpdateCustomPosition: (xPercent: number, yPercent: number) => void;
  onUpdateCropConfig?: (newCrop: CropConfig) => void;
  onPageChange?: (newPage: number) => void;
  activeStudioTab?: 'watermark' | 'crop';
  onSelectStudioTab?: (tab: 'watermark' | 'crop') => void;
}

type DragHandleType =
  | 'move'
  | 'n'
  | 's'
  | 'e'
  | 'w'
  | 'nw'
  | 'ne'
  | 'sw'
  | 'se'
  | 'watermark';

export const PreviewCanvas: React.FC<PreviewCanvasProps> = ({
  activeFile,
  config,
  logoImage,
  onUpdateCustomPosition,
  onUpdateCropConfig,
  onPageChange,
  activeStudioTab = 'watermark',
  onSelectStudioTab,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [isComparing, setIsComparing] = useState(false);
  const [cachedSourceImg, setCachedSourceImg] = useState<HTMLImageElement | HTMLCanvasElement | null>(null);
  const [isLoadingPdfPage, setIsLoadingPdfPage] = useState(false);

  // 'guides' shows interactive handles & shaded crop borders; 'cropped' shows clean clipped view
  const [cropViewMode, setCropViewMode] = useState<'guides' | 'cropped'>('guides');

  // Interactive Dragging State
  const [activeDragHandle, setActiveDragHandle] = useState<DragHandleType | null>(null);
  const dragStartRef = useRef<{
    startX: number;
    startY: number;
    initialCrop: CropConfig;
    canvasRect: DOMRect;
    rawWidth: number;
    rawHeight: number;
  } | null>(null);

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

  // Render on canvas whenever watermark config, crop, source image, or compare mode changes
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
      const previewMode =
        activeStudioTab === 'crop' && cropViewMode === 'guides' ? 'guides' : 'cropped';

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
        previewMode,
      });
    }
  }, [cachedSourceImg, config, isComparing, activeFile, logoImage, activeStudioTab, cropViewMode]);

  useEffect(() => {
    renderPreview();
  }, [renderPreview]);

  // Dragging interaction handlers for crop handles and watermark positioning
  const handleStartDrag = (e: React.MouseEvent, handle: DragHandleType) => {
    e.stopPropagation();
    e.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas || !cachedSourceImg) return;

    const rawW = (cachedSourceImg as HTMLImageElement).naturalWidth || cachedSourceImg.width;
    const rawH = (cachedSourceImg as HTMLImageElement).naturalHeight || cachedSourceImg.height;

    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialCrop: { ...config.crop },
      canvasRect: canvas.getBoundingClientRect(),
      rawWidth: rawW,
      rawHeight: rawH,
    };

    setActiveDragHandle(handle);
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeStudioTab === 'watermark' && config.positionMode === 'custom') {
      setActiveDragHandle('watermark');
      updateWatermarkPositionFromMouse(e);
    }
  };

  const updateWatermarkPositionFromMouse = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const xPercent = Math.max(0, Math.min(100, Math.round((clickX / rect.width) * 100)));
    const yPercent = Math.max(0, Math.min(100, Math.round((clickY / rect.height) * 100)));

    onUpdateCustomPosition(xPercent, yPercent);
  };

  // Global mouse move & up listeners during drag
  useEffect(() => {
    const onWindowMouseMove = (e: MouseEvent) => {
      if (!activeDragHandle || !dragStartRef.current || !onUpdateCropConfig) return;

      if (activeDragHandle === 'watermark') {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;
        const xPercent = Math.max(0, Math.min(100, Math.round((clickX / rect.width) * 100)));
        const yPercent = Math.max(0, Math.min(100, Math.round((clickY / rect.height) * 100)));
        onUpdateCustomPosition(xPercent, yPercent);
        return;
      }

      const { startX, startY, initialCrop, canvasRect, rawWidth, rawHeight } =
        dragStartRef.current;

      const deltaXScreen = e.clientX - startX;
      const deltaYScreen = e.clientY - startY;

      // Scale screen deltas to canvas image pixels
      const scaleX = rawWidth / (canvasRect.width || 1);
      const scaleY = rawHeight / (canvasRect.height || 1);

      const deltaXPx = deltaXScreen * scaleX;
      const deltaYPx = deltaYScreen * scaleY;

      const curUnit = initialCrop.unit;

      const initLPx = toPixels(initialCrop.left, curUnit, rawWidth);
      const initRPx = toPixels(initialCrop.right, curUnit, rawWidth);
      const initTPx = toPixels(initialCrop.top, curUnit, rawHeight);
      const initBPx = toPixels(initialCrop.bottom, curUnit, rawHeight);

      let nextLPx = initLPx;
      let nextRPx = initRPx;
      let nextTPx = initTPx;
      let nextBPx = initBPx;

      if (activeDragHandle === 'move') {
        nextLPx = Math.max(0, initLPx + deltaXPx);
        nextRPx = Math.max(0, initRPx - deltaXPx);
        nextTPx = Math.max(0, initTPx + deltaYPx);
        nextBPx = Math.max(0, initBPx - deltaYPx);
      } else {
        if (activeDragHandle.includes('w')) {
          nextLPx = Math.max(0, initLPx + deltaXPx);
        }
        if (activeDragHandle.includes('e')) {
          nextRPx = Math.max(0, initRPx - deltaXPx);
        }
        if (activeDragHandle.includes('n')) {
          nextTPx = Math.max(0, initTPx + deltaYPx);
        }
        if (activeDragHandle.includes('s')) {
          nextBPx = Math.max(0, initBPx - deltaYPx);
        }
      }

      // Convert back to chosen unit
      let nextL = fromPixels(nextLPx, curUnit, rawWidth);
      let nextR = fromPixels(nextRPx, curUnit, rawWidth);
      let nextT = fromPixels(nextTPx, curUnit, rawHeight);
      let nextB = fromPixels(nextBPx, curUnit, rawHeight);

      if (initialCrop.linked && activeDragHandle !== 'move') {
        const maxVal = Math.max(nextL, nextR, nextT, nextB);
        nextL = maxVal;
        nextR = maxVal;
        nextT = maxVal;
        nextB = maxVal;
      }

      const clamped = clampCropMargins(
        { top: nextT, bottom: nextB, left: nextL, right: nextR },
        curUnit,
        rawWidth,
        rawHeight
      );

      onUpdateCropConfig({
        ...initialCrop,
        enabled: true,
        left: clamped.left,
        right: clamped.right,
        top: clamped.top,
        bottom: clamped.bottom,
      });
    };

    const onWindowMouseUp = () => {
      setActiveDragHandle(null);
      dragStartRef.current = null;
    };

    if (activeDragHandle) {
      window.addEventListener('mousemove', onWindowMouseMove);
      window.addEventListener('mouseup', onWindowMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', onWindowMouseMove);
      window.removeEventListener('mouseup', onWindowMouseUp);
    };
  }, [activeDragHandle, config.crop, onUpdateCropConfig, onUpdateCustomPosition]);

  // Auto-detect white borders trigger
  const handleAutoDetect = () => {
    if (!canvasRef.current || !onUpdateCropConfig) return;
    const detected = autoDetectWhiteMargins(canvasRef.current);
    onUpdateCropConfig({
      ...config.crop,
      enabled: true,
      unit: 'percent',
      top: detected.top,
      bottom: detected.bottom,
      left: detected.left,
      right: detected.right,
    });
  };

  // Reset Crop
  const handleResetCrop = () => {
    if (!onUpdateCropConfig) return;
    onUpdateCropConfig({
      ...config.crop,
      enabled: false,
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    });
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.4));
  const handleResetZoom = () => setZoom(1);

  if (!activeFile) {
    return (
      <div className="w-full h-full min-h-[420px] rounded-3xl glass-panel flex flex-col items-center justify-center p-8 text-center text-slate-500 m-auto">
        <Sparkles className="w-8 h-8 text-indigo-400 mb-2 opacity-50" />
        <p className="text-sm font-medium">Select or upload a file to view real-time studio preview</p>
      </div>
    );
  }

  const isPdf = activeFile.type === 'pdf';
  const totalPages = activeFile.pdfNumPages || 1;
  const currentPage = activeFile.pdfActivePage || 1;

  // Raw and Cropped Dimensions Calculation
  const rawW = cachedSourceImg
    ? (cachedSourceImg as HTMLImageElement).naturalWidth || cachedSourceImg.width
    : activeFile.originalWidth || 800;
  const rawH = cachedSourceImg
    ? (cachedSourceImg as HTMLImageElement).naturalHeight || cachedSourceImg.height
    : activeFile.originalHeight || 600;

  const isCropActive =
    !!config.crop?.enabled &&
    (config.crop.top > 0 || config.crop.bottom > 0 || config.crop.left > 0 || config.crop.right > 0);

  const cropLPx = isCropActive ? toPixels(config.crop.left, config.crop.unit, rawW) : 0;
  const cropRPx = isCropActive ? toPixels(config.crop.right, config.crop.unit, rawW) : 0;
  const cropTPx = isCropActive ? toPixels(config.crop.top, config.crop.unit, rawH) : 0;
  const cropBPx = isCropActive ? toPixels(config.crop.bottom, config.crop.unit, rawH) : 0;

  const croppedWPx = Math.max(10, rawW - cropLPx - cropRPx);
  const croppedHPx = Math.max(10, rawH - cropTPx - cropBPx);

  const leftPct = (cropLPx / rawW) * 100;
  const rightPct = (cropRPx / rawW) * 100;
  const topPct = (cropTPx / rawH) * 100;
  const bottomPct = (cropBPx / rawH) * 100;
  const boxWPct = 100 - leftPct - rightPct;
  const boxHPct = 100 - topPct - bottomPct;

  const trimmedAreaPct = Math.round((1 - (croppedWPx * croppedHPx) / (rawW * rawH)) * 100);

  return (
    <div
      ref={containerRef}
      className="flex flex-col h-full rounded-ghibli-md bg-white border border-[#2B2B2B]/10 shadow-sm overflow-hidden relative select-none"
    >
      {/* Top Floating Toolbar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-[#FAF8F2] border-b border-[#2B2B2B]/10 text-xs text-[#2B2B2B] z-10 gap-2">
        {/* Left: Studio Mode Pill Switcher & Document Info */}
        <div className="flex items-center gap-2.5">
          {/* Mode Tabs */}
          <div className="flex items-center bg-white p-0.5 rounded-ghibli-sm border border-[#2B2B2B]/15 shadow-xs">
            <button
              type="button"
              onClick={() => onSelectStudioTab && onSelectStudioTab('watermark')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-ghibli-sm text-xs font-bold transition-all cursor-pointer ${
                activeStudioTab === 'watermark'
                  ? 'bg-[#212635] text-[#FAF8F2] shadow-xs'
                  : 'text-[#2B2B2B]/70 hover:text-[#2B2B2B]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Watermark</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectStudioTab && onSelectStudioTab('crop')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-ghibli-sm text-xs font-bold transition-all cursor-pointer ${
                activeStudioTab === 'crop'
                  ? 'bg-[#7CB342] text-white shadow-xs'
                  : 'text-[#2B2B2B]/70 hover:text-[#2B2B2B]'
              }`}
            >
              <Crop className="w-3.5 h-3.5" />
              <span>Crop &amp; Trim</span>
              {isCropActive && (
                <span className="w-2 h-2 rounded-full bg-[#558B2F] animate-pulse" />
              )}
            </button>
          </div>

          {/* PDF Page Navigator */}
          {isPdf && totalPages > 1 && (
            <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-ghibli-sm border border-[#2B2B2B]/15 shadow-xs">
              <button
                type="button"
                disabled={currentPage <= 1 || isLoadingPdfPage}
                onClick={() => onPageChange && onPageChange(currentPage - 1)}
                className="p-1 rounded-md hover:bg-[#FAF8F2] disabled:opacity-30 cursor-pointer transition-colors text-[#2B2B2B]"
                title="Previous page"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-bold text-[#2B2B2B] min-w-[45px] text-center font-mono">
                {isLoadingPdfPage ? (
                  <RotateCw className="w-3 h-3 animate-spin inline mr-1 text-[#7CB342]" />
                ) : null}
                {currentPage}/{totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage >= totalPages || isLoadingPdfPage}
                onClick={() => onPageChange && onPageChange(currentPage + 1)}
                className="p-1 rounded-md hover:bg-[#FAF8F2] disabled:opacity-30 cursor-pointer transition-colors text-[#2B2B2B]"
                title="Next page"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Right: Mode-Specific Quick Actions (Guides vs Clipped, Auto-Detect, Zoom) */}
        <div className="flex items-center gap-2">
          {activeStudioTab === 'crop' && (
            <>
              {/* Toggle Guides vs Cropped View */}
              <div className="flex items-center bg-white p-0.5 rounded-ghibli-sm border border-[#2B2B2B]/15 shadow-xs">
                <button
                  type="button"
                  onClick={() => setCropViewMode('guides')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                    cropViewMode === 'guides'
                      ? 'bg-[#212635] text-[#FAF8F2]'
                      : 'text-[#2B2B2B]/70 hover:text-[#2B2B2B]'
                  }`}
                  title="Interactive resize guides with shaded margins"
                >
                  Guides
                </button>
                <button
                  type="button"
                  onClick={() => setCropViewMode('cropped')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                    cropViewMode === 'cropped'
                      ? 'bg-[#7CB342] text-white'
                      : 'text-[#2B2B2B]/70 hover:text-[#2B2B2B]'
                  }`}
                  title="Clean trimmed result preview"
                >
                  Cropped
                </button>
              </div>

              {/* Auto Detect Button */}
              <button
                type="button"
                onClick={handleAutoDetect}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-ghibli-sm bg-white hover:bg-[#F1F8E9] text-[#2E7D32] hover:text-[#1B5E20] border border-[#7CB342]/40 text-[11px] font-bold transition-all cursor-pointer shadow-xs active:translate-y-[1px]"
                title="Auto-detect and crop white margins from page"
              >
                <Crop className="w-3.5 h-3.5 text-[#7CB342]" />
                <span className="hidden sm:inline">Auto Trim</span>
              </button>

              {/* Reset Crop Button */}
              {isCropActive && (
                <button
                  type="button"
                  onClick={handleResetCrop}
                  className="p-1.5 rounded-ghibli-sm bg-white hover:bg-[#FFEBEE] text-[#C62828] border border-[#C62828]/30 transition-colors cursor-pointer shadow-xs"
                  title="Reset margins to zero"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </>
          )}

          {activeStudioTab === 'watermark' && (
            /* Compare Button */
            <button
              type="button"
              onMouseDown={() => setIsComparing(true)}
              onMouseUp={() => setIsComparing(false)}
              onTouchStart={() => setIsComparing(true)}
              onTouchEnd={() => setIsComparing(false)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-ghibli-sm text-xs font-bold transition-all cursor-pointer select-none border border-[#2B2B2B]/15 shadow-xs ${
                isComparing
                  ? 'bg-[#FAF8F2] text-[#212635] ring-2 ring-[#7CB342]'
                  : 'bg-white hover:bg-[#FAF8F2] text-[#2B2B2B]'
              }`}
              title="Hold to see original without watermark"
            >
              {isComparing ? <EyeOff className="w-3.5 h-3.5 text-[#C62828]" /> : <Eye className="w-3.5 h-3.5 text-[#7CB342]" />}
              <span className="hidden sm:inline">
                {isComparing ? 'Original' : 'Compare'}
              </span>
            </button>
          )}

          {/* Zoom Controls */}
          <div className="flex items-center gap-0.5 bg-white border border-[#2B2B2B]/15 rounded-ghibli-sm p-0.5 shadow-xs">
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-1.5 hover:bg-[#FAF8F2] rounded-md text-[#2B2B2B] cursor-pointer transition-colors"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleResetZoom}
              className="text-[11px] font-bold px-1.5 py-0.5 rounded-md hover:bg-[#FAF8F2] text-[#2B2B2B] cursor-pointer font-mono"
              title="Reset zoom"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              type="button"
              onClick={handleZoomIn}
              className="p-1.5 hover:bg-[#FAF8F2] rounded-md text-[#2B2B2B] cursor-pointer transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Canvas Viewport Stage */}
      <div className="flex-1 overflow-auto p-4 md:p-8 flex items-center justify-center bg-canvas-checkerboard min-h-[380px] select-none relative">
        {isLoadingPdfPage ? (
          <div className="flex flex-col items-center gap-3 text-[#212635] bg-white px-8 py-5 rounded-ghibli-sm border border-[#2B2B2B]/15 shadow-md m-auto">
            <RotateCw className="w-7 h-7 animate-spin text-[#7CB342]" />
            <span className="text-xs font-bold tracking-wide">Rendering Page {currentPage}...</span>
          </div>
        ) : (
          <div
            className="relative transition-transform duration-100 ease-out origin-center flex items-center justify-center m-auto"
            style={{
              transform: `scale(${zoom})`,
            }}
          >
            {/* The Main HTML5 Canvas */}
            <canvas
              ref={canvasRef}
              onMouseDown={handleCanvasMouseDown}
              className={`max-w-full max-h-[66vh] object-contain rounded-xl shadow-[0_25px_60px_rgba(0,0,0,0.6)] border border-white/10 transition-all block mx-auto ${
                activeStudioTab === 'watermark' && config.positionMode === 'custom'
                  ? 'cursor-crosshair'
                  : 'cursor-default'
              }`}
            />

            {/* Interactive Crop Handles Overlay (When in Crop tab & Guides mode) */}
            {activeStudioTab === 'crop' && cropViewMode === 'guides' && (
              <div
                className="absolute inset-0 pointer-events-none rounded-xl overflow-hidden"
                style={{
                  width: '100%',
                  height: '100%',
                }}
              >
                {/* Active Crop Frame with Glowing Border */}
                <div
                  className="absolute pointer-events-auto border-2 border-emerald-400/90 shadow-[0_0_20px_rgba(52,211,153,0.4)] transition-[border-color] duration-150"
                  style={{
                    left: `${leftPct}%`,
                    top: `${topPct}%`,
                    width: `${boxWPct}%`,
                    height: `${boxHPct}%`,
                  }}
                >
                  {/* Center Move Area */}
                  <div
                    onMouseDown={(e) => handleStartDrag(e, 'move')}
                    className="w-full h-full cursor-move flex items-center justify-center group"
                    title="Drag to reposition crop area"
                  >
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-emerald-500/40 text-[10px] font-bold text-emerald-300 flex items-center gap-1 shadow-lg pointer-events-none font-mono">
                      <Move className="w-3 h-3 text-emerald-400" />
                      <span>
                        {Math.round(croppedWPx)} × {Math.round(croppedHPx)} px
                      </span>
                    </div>
                  </div>

                  {/* 8 Resize Handles */}
                  {/* Top-Left (NW) */}
                  <div
                    onMouseDown={(e) => handleStartDrag(e, 'nw')}
                    className="absolute -top-2 -left-2 w-4 h-4 rounded-full bg-white border-2 border-emerald-500 shadow-md cursor-nwse-resize hover:scale-125 transition-transform"
                  />
                  {/* Top (N) */}
                  <div
                    onMouseDown={(e) => handleStartDrag(e, 'n')}
                    className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-6 h-3 rounded-md bg-white border-2 border-emerald-500 shadow-md cursor-ns-resize hover:scale-110 transition-transform flex items-center justify-center"
                  >
                    <div className="w-2.5 h-0.5 bg-slate-700 rounded" />
                  </div>
                  {/* Top-Right (NE) */}
                  <div
                    onMouseDown={(e) => handleStartDrag(e, 'ne')}
                    className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-white border-2 border-emerald-500 shadow-md cursor-nesw-resize hover:scale-125 transition-transform"
                  />
                  {/* Right (E) */}
                  <div
                    onMouseDown={(e) => handleStartDrag(e, 'e')}
                    className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-6 rounded-md bg-white border-2 border-emerald-500 shadow-md cursor-ew-resize hover:scale-110 transition-transform flex items-center justify-center"
                  >
                    <div className="w-0.5 h-2.5 bg-slate-700 rounded" />
                  </div>
                  {/* Bottom-Right (SE) */}
                  <div
                    onMouseDown={(e) => handleStartDrag(e, 'se')}
                    className="absolute -bottom-2 -right-2 w-4 h-4 rounded-full bg-white border-2 border-emerald-500 shadow-md cursor-nwse-resize hover:scale-125 transition-transform"
                  />
                  {/* Bottom (S) */}
                  <div
                    onMouseDown={(e) => handleStartDrag(e, 's')}
                    className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-6 h-3 rounded-md bg-white border-2 border-emerald-500 shadow-md cursor-ns-resize hover:scale-110 transition-transform flex items-center justify-center"
                  >
                    <div className="w-2.5 h-0.5 bg-slate-700 rounded" />
                  </div>
                  {/* Bottom-Left (SW) */}
                  <div
                    onMouseDown={(e) => handleStartDrag(e, 'sw')}
                    className="absolute -bottom-2 -left-2 w-4 h-4 rounded-full bg-white border-2 border-emerald-500 shadow-md cursor-nesw-resize hover:scale-125 transition-transform"
                  />
                  {/* Left (W) */}
                  <div
                    onMouseDown={(e) => handleStartDrag(e, 'w')}
                    className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3 h-6 rounded-md bg-white border-2 border-emerald-500 shadow-md cursor-ew-resize hover:scale-110 transition-transform flex items-center justify-center"
                  >
                    <div className="w-0.5 h-2.5 bg-slate-700 rounded" />
                  </div>
                </div>
              </div>
            )}

            {/* Custom Watermark Drag Handle indicator */}
            {activeStudioTab === 'watermark' && config.positionMode === 'custom' && (
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

      {/* Bottom Status Strip */}
      <div className="px-5 py-2.5 bg-[#FAF8F2] border-t border-[#2B2B2B]/10 flex items-center justify-between text-[11px] text-[#2B2B2B]/75">
        <div className="flex items-center gap-2">
          {activeStudioTab === 'crop' ? (
            <span className="flex items-center gap-1.5 text-[#2E7D32] font-semibold">
              <Crop className="w-3.5 h-3.5 text-[#7CB342]" />
              {isCropActive ? (
                <>
                  Trim Active: Top {config.crop.top}
                  {config.crop.unit === 'percent' ? '%' : config.crop.unit}, Bottom{' '}
                  {config.crop.bottom}
                  {config.crop.unit === 'percent' ? '%' : config.crop.unit}, Left{' '}
                  {config.crop.left}
                  {config.crop.unit === 'percent' ? '%' : config.crop.unit}, Right{' '}
                  {config.crop.right}
                  {config.crop.unit === 'percent' ? '%' : config.crop.unit} ({trimmedAreaPct}% area trimmed)
                </>
              ) : (
                'Drag frame handles on page edges to trim margins'
              )}
            </span>
          ) : config.positionMode === 'custom' ? (
            <span className="flex items-center gap-1.5 text-[#212635] font-semibold">
              <Move className="w-3.5 h-3.5 text-[#7CB342]" />
              Click and drag anywhere on canvas to reposition watermark freely
            </span>
          ) : (
            <span>
              Layout Mode:{' '}
              <strong className="text-[#2B2B2B] capitalize">
                {config.positionMode} ({config.gridPosition})
              </strong>
            </span>
          )}
        </div>

        <div className="font-mono text-[#2B2B2B]/70 text-right">
          {isPdf ? (
            <span className="text-[#2E7D32] font-semibold">
              {formatPaperDimensions(rawW, rawH)} • Page {currentPage}/{totalPages}
            </span>
          ) : (
            <span className="text-[#2B2B2B]/70">
              {rawW} x {rawH} px
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
