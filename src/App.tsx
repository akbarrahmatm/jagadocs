import { useEffect, useState, useMemo } from 'react';
import type {
  ExportSettings,
  UploadedFile,
  WatermarkConfig,
  WatermarkPreset,
} from './types/watermark';
import { Header } from './components/Header';
import { FileUploader } from './components/FileUploader';
import { FileList } from './components/FileList';
import { WatermarkControls } from './components/WatermarkControls';
import { PreviewCanvas } from './components/PreviewCanvas';
import { ExportSection } from './components/ExportSection';
import { exportBatchFiles, exportSingleFile, type ExportProgress } from './utils/exportManager';
import { loadPdfInfo } from './utils/pdfPreview';
import { createSamplePhoto, createSamplePdf } from './utils/sampleLoader';
import { CheckCircle2, AlertCircle, Shield, Cpu, Zap } from 'lucide-react';

const DEFAULT_CONFIG: WatermarkConfig = {
  type: 'text',
  positionMode: 'grid',
  gridPosition: 'center',
  customPosition: { xPercent: 50, yPercent: 50 },
  tileSettings: { gapX: 180, gapY: 120, diagonalOffset: true },
  text: {
    text: 'CONFIDENTIAL',
    fontFamily: 'Helvetica, Arial, sans-serif',
    fontSize: 48,
    fontSizeMode: 'percent',
    fontSizePercent: 10,
    color: '#dc2626',
    opacity: 0.45,
    rotation: -30,
    bold: true,
    italic: false,
    underline: false,
    stroke: true,
    strokeColor: '#991b1b',
    strokeWidth: 2,
    shadow: true,
    shadowColor: '#000000',
    shadowBlur: 6,
    background: false,
    bgColor: '#fee2e2',
    bgOpacity: 0.5,
    bgPadding: 10,
    bgRadius: 8,
  },
  image: {
    imageUrl: null,
    imageName: null,
    imageWidth: 0,
    imageHeight: 0,
    scalePercent: 25,
    opacity: 0.6,
    rotation: 0,
  },
};

const DEFAULT_EXPORT_SETTINGS: ExportSettings = {
  imageFormat: 'original',
  jpegQuality: 0.92,
  fileNamePrefix: 'watermarked',
  fileNameSuffix: '',
  pdfPageRangeMode: 'all',
  pdfCustomPages: '1-3',
};

export function App() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [config, setConfig] = useState<WatermarkConfig>(DEFAULT_CONFIG);
  const [exportSettings, setExportSettings] = useState<ExportSettings>(DEFAULT_EXPORT_SETTINGS);
  const [logoImage, setLogoImage] = useState<HTMLImageElement | null>(null);

  // Export State
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<ExportProgress | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage((curr) => (curr?.text === text ? null : curr));
    }, 4000);
  };

  // Active File Reference
  const activeFile = useMemo(() => {
    return files.find((f) => f.id === activeFileId) || (files.length > 0 ? files[0] : null);
  }, [files, activeFileId]);

  const hasPdfInFiles = useMemo(() => {
    return files.some((f) => f.type === 'pdf');
  }, [files]);

  // Load logo HTMLImageElement when config.image.imageUrl changes
  useEffect(() => {
    let active = true;
    if (!config.image.imageUrl) {
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (active) {
        setLogoImage(img);
      }
    };
    img.src = config.image.imageUrl;

    return () => {
      active = false;
    };
  }, [config.image.imageUrl]);

  // Handle uploaded files
  const handleFilesSelected = async (newRawFiles: File[]) => {
    const loadedList: UploadedFile[] = [];

    for (const file of newRawFiles) {
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

      if (isPdf) {
        try {
          const buffer = await file.arrayBuffer();
          // Pass sliced copy to prevent worker detachment
          const info = await loadPdfInfo(buffer.slice(0));
          loadedList.push({
            id,
            file,
            name: file.name,
            type: 'pdf',
            size: file.size,
            previewUrl: info.firstPagePreview,
            originalWidth: info.width,
            originalHeight: info.height,
            pdfNumPages: info.numPages,
            pdfActivePage: 1,
            pdfArrayBuffer: buffer,
          });
        } catch (err) {
          console.error('Failed to parse PDF:', err);
          showToast(`Failed to parse PDF: ${file.name}`, 'error');
        }
      } else {
        // Image file
        try {
          const previewUrl = URL.createObjectURL(file);
          const dimensions = await new Promise<{ width: number; height: number }>((resolve) => {
            const img = new Image();
            img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
            img.onerror = () => resolve({ width: 800, height: 600 });
            img.src = previewUrl;
          });

          loadedList.push({
            id,
            file,
            name: file.name,
            type: 'image',
            size: file.size,
            previewUrl,
            originalWidth: dimensions.width,
            originalHeight: dimensions.height,
          });
        } catch (err) {
          console.error('Failed to load image:', err);
        }
      }
    }

    if (loadedList.length > 0) {
      setFiles((prev) => [...prev, ...loadedList]);
      if (!activeFileId) {
        setActiveFileId(loadedList[0].id);
      }
      showToast(`Added ${loadedList.length} file(s) successfully!`);
    }
  };

  // Load sample file
  const handleLoadSample = async (type: 'photo' | 'pdf') => {
    try {
      const sampleItem = type === 'photo' ? await createSamplePhoto() : await createSamplePdf();
      setFiles((prev) => [sampleItem, ...prev]);
      setActiveFileId(sampleItem.id);
      showToast(`Sample ${type === 'photo' ? 'Photo' : 'PDF Document'} loaded!`);
    } catch (err) {
      console.error('Failed to load sample:', err);
      showToast('Could not load sample file', 'error');
    }
  };

  // Remove File
  const handleRemoveFile = (id: string) => {
    setFiles((prev) => {
      const next = prev.filter((f) => f.id !== id);
      if (activeFileId === id) {
        setActiveFileId(next.length > 0 ? next[0].id : null);
      }
      return next;
    });
  };

  // Clear All Files
  const handleClearFiles = () => {
    setFiles([]);
    setActiveFileId(null);
    showToast('Cleared all files');
  };

  // Preset Application
  const handleApplyPreset = (preset: WatermarkPreset) => {
    setConfig((prev) => ({
      ...prev,
      ...preset.config,
      text: {
        ...prev.text,
        ...(preset.config.text || {}),
      },
      image: {
        ...prev.image,
        ...(preset.config.image || {}),
      },
      tileSettings: {
        ...prev.tileSettings,
        ...(preset.config.tileSettings || {}),
      },
    }));
    showToast(`Applied preset: ${preset.name}`);
  };

  // Handle Logo Upload
  const handleLogoUpload = (file: File) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setLogoImage(img);
      setConfig((prev) => ({
        ...prev,
        type: 'image',
        image: {
          ...prev.image,
          imageUrl: url,
          imageName: file.name,
          imageWidth: img.naturalWidth,
          imageHeight: img.naturalHeight,
        },
      }));
      showToast(`Logo "${file.name}" uploaded!`);
    };
    img.src = url;
  };

  const handleRemoveLogo = () => {
    setLogoImage(null);
    setConfig((prev) => ({
      ...prev,
      image: {
        ...prev.image,
        imageUrl: null,
        imageName: null,
        imageWidth: 0,
        imageHeight: 0,
      },
    }));
  };

  // Handle PDF Page Change for active file
  const handlePageChange = (newPage: number) => {
    if (!activeFile || activeFile.type !== 'pdf') return;
    setFiles((prev) =>
      prev.map((f) => (f.id === activeFile.id ? { ...f, pdfActivePage: newPage } : f))
    );
  };

  // Update Custom Position from Preview Dragging
  const handleUpdateCustomPosition = (xPercent: number, yPercent: number) => {
    setConfig((prev) => ({
      ...prev,
      positionMode: 'custom',
      customPosition: { xPercent, yPercent },
    }));
  };

  // Export Single File
  const handleExportSingle = async () => {
    if (!activeFile) return;
    try {
      setIsExporting(true);
      await exportSingleFile(activeFile, config, exportSettings, logoImage);
      showToast(`Exported "${activeFile.name}" successfully!`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      console.error('Export single failed:', err);
      showToast(`Export failed: ${msg}`, 'error');
    } finally {
      setIsExporting(false);
    }
  };

  // Export Batch ZIP
  const handleExportBatch = async () => {
    if (files.length === 0) return;
    try {
      setIsExporting(true);
      setExportProgress({
        current: 0,
        total: files.length,
        currentFileName: 'Preparing batch...',
        percentage: 0,
      });

      await exportBatchFiles(files, config, exportSettings, logoImage, (progress) => {
        setExportProgress(progress);
      });

      showToast(`Batch ZIP of ${files.length} files downloaded!`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      console.error('Export batch failed:', err);
      showToast(`Batch export error: ${msg}`, 'error');
    } finally {
      setIsExporting(false);
      setExportProgress(null);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#050714] text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white overflow-hidden bg-spatial-grid">
      {/* Floating Spatial Background Nebulas / Glowing Orbs */}
      <div className="fixed top-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none animate-orb-1" />
      <div className="fixed bottom-[-15%] right-[-10%] w-[650px] h-[650px] bg-purple-600/15 rounded-full blur-[160px] pointer-events-none animate-orb-2" />
      <div className="fixed top-[40%] left-[50%] -translate-x-1/2 w-[500px] h-[500px] bg-pink-600/10 rounded-full blur-[180px] pointer-events-none animate-pulse-glow" />

      {/* Top Header */}
      <Header
        onApplyPreset={handleApplyPreset}
        onClearFiles={handleClearFiles}
        onLoadSample={handleLoadSample}
        fileCount={files.length}
      />

      {/* Notification Toast */}
      {toastMessage && (
        <div className="fixed top-18 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] glass-panel border border-white/20 text-xs font-bold text-white animate-in slide-in-from-top-3 duration-300">
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Main Workspace */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 flex flex-col gap-6">
        {files.length === 0 ? (
          /* Empty State: Antigravity Hero & Feature Grid */
          <div className="flex-1 flex flex-col items-center justify-center py-2 md:py-4 space-y-4 md:space-y-6 w-full my-auto">
            <FileUploader
              onFilesSelected={handleFilesSelected}
              onLoadSample={handleLoadSample}
            />

            {/* Spatial Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4 w-full max-w-4xl">
              <div className="glass-panel p-4 md:p-4.5 rounded-2xl text-left border border-white/10 hover:border-indigo-500/40 hover:-translate-y-1 transition-all duration-300 group shadow-md">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 border border-white/15 text-indigo-400 flex items-center justify-center font-bold text-base mb-2.5 group-hover:scale-110 transition-transform shadow-inner">
                  <Cpu className="w-4.5 h-4.5 text-indigo-400" />
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-white tracking-tight m-0">
                  Vector PDF Engine
                </h4>
                <p className="text-[11px] sm:text-xs text-slate-400 mt-1 m-0 leading-relaxed">
                  Embed scalable vector text and transparent stamps across all pages with zero raster degradation.
                </p>
              </div>

              <div className="glass-panel p-4 md:p-4.5 rounded-2xl text-left border border-white/10 hover:border-purple-500/40 hover:-translate-y-1 transition-all duration-300 group shadow-md">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-500/20 to-pink-500/20 border border-white/15 text-purple-400 flex items-center justify-center font-bold text-base mb-2.5 group-hover:scale-110 transition-transform shadow-inner">
                  <Zap className="w-4.5 h-4.5 text-purple-400" />
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-white tracking-tight m-0">
                  Batch Multi-Core Export
                </h4>
                <p className="text-[11px] sm:text-xs text-slate-400 mt-1 m-0 leading-relaxed">
                  Watermark hundreds of high-res photos in parallel and download packaged as a instant ZIP archive.
                </p>
              </div>

              <div className="glass-panel p-4 md:p-4.5 rounded-2xl text-left border border-white/10 hover:border-pink-500/40 hover:-translate-y-1 transition-all duration-300 group shadow-md">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-500/20 to-rose-500/20 border border-white/15 text-pink-400 flex items-center justify-center font-bold text-base mb-2.5 group-hover:scale-110 transition-transform shadow-inner">
                  <Shield className="w-4.5 h-4.5 text-pink-400" />
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-white tracking-tight m-0">
                  Total Privacy &amp; Security
                </h4>
                <p className="text-[11px] sm:text-xs text-slate-400 mt-1 m-0 leading-relaxed">
                  All rendering executes 100% inside your local browser memory. Files are never transmitted over the internet.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Active Editor Layout */
          <div className="flex flex-col gap-6 flex-1">
            {/* Horizontal Files Carousel */}
            <div className="glass-panel rounded-3xl p-3.5 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-36 shrink-0">
                  <FileUploader
                    onFilesSelected={handleFilesSelected}
                    onLoadSample={handleLoadSample}
                    isCompact
                  />
                </div>
                <div className="flex-1 overflow-hidden">
                  <FileList
                    files={files}
                    activeFileId={activeFile?.id || null}
                    onSelectFile={(id) => setActiveFileId(id)}
                    onRemoveFile={handleRemoveFile}
                  />
                </div>
              </div>
            </div>

            {/* Split Screen: Preview Canvas & Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start flex-1">
              {/* Preview Canvas Area */}
              <div className="lg:col-span-7 xl:col-span-8 flex flex-col h-[520px] lg:h-[720px] sticky top-20">
                <PreviewCanvas
                  activeFile={activeFile}
                  config={config}
                  logoImage={logoImage}
                  onUpdateCustomPosition={handleUpdateCustomPosition}
                  onPageChange={handlePageChange}
                />
              </div>

              {/* Watermark Controls Sidebar */}
              <div className="lg:col-span-5 xl:col-span-4">
                <WatermarkControls
                  config={config}
                  onChangeConfig={setConfig}
                  exportSettings={exportSettings}
                  onChangeExportSettings={setExportSettings}
                  onLogoUpload={handleLogoUpload}
                  onRemoveLogo={handleRemoveLogo}
                  hasPdfInFiles={hasPdfInFiles}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Sticky Export Bar */}
      <ExportSection
        files={files}
        activeFile={activeFile}
        exportSettings={exportSettings}
        onChangeExportSettings={setExportSettings}
        onExportSingle={handleExportSingle}
        onExportBatch={handleExportBatch}
        isExporting={isExporting}
        exportProgress={exportProgress}
      />
    </div>
  );
}

export default App;
