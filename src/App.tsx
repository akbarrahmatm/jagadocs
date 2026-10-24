import { useEffect, useState, useMemo } from 'react';
import type {
  ExportSettings,
  UploadedFile,
  WatermarkConfig,
  WatermarkPreset,
} from './types/watermark';
import { Header } from './components/Header';
import { NarrativeHeader } from './components/NarrativeHeader';
import { ToolGrid } from './components/ToolGrid';
import { ToolLanding } from './components/ToolLanding';
import { FileUploader } from './components/FileUploader';
import { FileList } from './components/FileList';
import { WatermarkControls } from './components/WatermarkControls';
import { PreviewCanvas } from './components/PreviewCanvas';
import { ExportSection } from './components/ExportSection';
import { exportBatchFiles, exportSingleFile, type ExportProgress } from './utils/exportManager';
import { loadPdfInfo } from './utils/pdfPreview';
import { createSamplePhoto, createSamplePdf } from './utils/sampleLoader';
import { DEFAULT_CROP_CONFIG } from './utils/cropUtils';
import type { CropConfig } from './types/watermark';
import { getToolByRoute, type ToolDefinition } from './modules/featureRegistry';
import { CheckCircle2, AlertCircle } from 'lucide-react';

const DEFAULT_CONFIG: WatermarkConfig = {
  watermarkEnabled: true,
  type: 'text',
  positionMode: 'grid',
  gridPosition: 'center',
  customPosition: { xPercent: 50, yPercent: 50 },
  tileSettings: { gapX: 180, gapY: 120, diagonalOffset: true },
  crop: DEFAULT_CROP_CONFIG,
  text: {
    text: 'CONFIDENTIAL',
    fontFamily: 'Helvetica, Arial, sans-serif',
    fontSize: 48,
    fontSizeMode: 'percent',
    fontSizePercent: 10,
    color: '#7cb342',
    opacity: 0.55,
    rotation: -30,
    bold: true,
    italic: false,
    underline: false,
    stroke: true,
    strokeColor: '#2b2b2b',
    strokeWidth: 2,
    shadow: true,
    shadowColor: '#FAF8F2',
    shadowBlur: 4,
    background: false,
    bgColor: '#FAF8F2',
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
  const [selectedTool, setSelectedTool] = useState<ToolDefinition | null>(null);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [config, setConfig] = useState<WatermarkConfig>(DEFAULT_CONFIG);
  const [exportSettings, setExportSettings] = useState<ExportSettings>(DEFAULT_EXPORT_SETTINGS);
  const [logoImage, setLogoImage] = useState<HTMLImageElement | null>(null);
  const [activeStudioTab, setActiveStudioTab] = useState<'watermark' | 'crop'>('watermark');

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

  // Sync hash route (e.g. #/watermark-pdf, #/crop-pdf, #/)
  useEffect(() => {
    const handleHashChange = () => {
      const tool = getToolByRoute(window.location.hash);
      setSelectedTool(tool);
      if (tool) {
        setActiveStudioTab(tool.studioTab);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

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

  // Navigate to a tool
  const handleSelectTool = (tool: ToolDefinition) => {
    setSelectedTool(tool);
    setActiveStudioTab(tool.studioTab);
    window.location.hash = tool.route;
  };

  const handleBackToAllTools = () => {
    setSelectedTool(null);
    setFiles([]);
    setActiveFileId(null);
    window.location.hash = '#/';
  };

  // Handle uploaded files
  const handleFilesSelected = async (newRawFiles: File[]) => {
    const loadedList: UploadedFile[] = [];

    for (const file of newRawFiles) {
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

      if (isPdf) {
        try {
          const buffer = await file.arrayBuffer();
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
      showToast(`Loaded ${loadedList.length} file(s) successfully!`);
    }
  };

  // Dedicated Sample Loader for active tool
  const handleLoadSample = async (type: 'photo' | 'pdf') => {
    try {
      const sampleItem = type === 'photo' ? await createSamplePhoto() : await createSamplePdf();
      setFiles((prev) => [sampleItem, ...prev]);
      setActiveFileId(sampleItem.id);

      if (selectedTool?.id === 'crop-pdf') {
        setActiveStudioTab('crop');
        setConfig((prev) => ({
          ...prev,
          crop: {
            ...prev.crop,
            enabled: true,
            top: 10,
            bottom: 10,
            left: 10,
            right: 10,
            unit: 'mm',
          },
        }));
      }

      showToast(`Sample ${type === 'photo' ? 'Photo' : 'PDF'} loaded!`);
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
    showToast('All files cleared');
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
      crop: {
        ...prev.crop,
        ...(preset.config.crop || {}),
      },
    }));
    showToast(`Applied preset: ${preset.name}`);
  };

  // Crop Config Handler
  const handleUpdateCropConfig = (newCrop: CropConfig) => {
    setConfig((prev) => ({
      ...prev,
      crop: newCrop,
    }));
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
      showToast(`Logo "${file.name}" uploaded successfully!`);
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

  // Handle PDF Page Change
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
        currentFileName: 'Preparing batch files...',
        percentage: 0,
      });

      await exportBatchFiles(files, config, exportSettings, logoImage, (progress) => {
        setExportProgress(progress);
      });

      showToast(`ZIP package of ${files.length} file(s) downloaded!`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      console.error('Export batch failed:', err);
      showToast(`Batch export failed: ${msg}`, 'error');
    } finally {
      setIsExporting(false);
      setExportProgress(null);
    }
  };

  return (
    <div className="relative min-h-[100dvh] bg-[#FAF8F2] text-[#2B2B2B] flex flex-col font-['Quicksand'] selection:bg-[#7CB342]/30 selection:text-[#212635] bg-ghibli-parchment">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-18 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-ghibli-sm shadow-md bg-white border border-[#2B2B2B]/15 text-xs font-bold text-[#2B2B2B] animate-in slide-in-from-top-3 duration-300">
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-[#7CB342] shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-[#C62828] shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* STATE 1: HOMEPAGE TOOLS GRID (Exact PdfBar pattern) */}
      {!selectedTool && files.length === 0 && (
        <div className="flex-1 flex flex-col">
          <NarrativeHeader onNavigateHome={handleBackToAllTools} />
          <main className="flex-1">
            <ToolGrid onSelectTool={handleSelectTool} />
          </main>
          <footer className="py-6 border-t border-[#2B2B2B]/10 text-center text-xs text-[#2B2B2B]/60">
            JagaDocs • Free, client-side document and photo utility.
          </footer>
        </div>
      )}

      {/* STATE 2: SPECIFIC TOOL LANDING (No files loaded yet) */}
      {selectedTool && files.length === 0 && (
        <div className="flex-1 flex flex-col">
          <NarrativeHeader onNavigateHome={handleBackToAllTools} />
          <main className="flex-1 flex items-center justify-center">
            <ToolLanding
              tool={selectedTool}
              onBackToTools={handleBackToAllTools}
              onFilesSelected={handleFilesSelected}
              onLoadSample={handleLoadSample}
            />
          </main>
          <footer className="py-6 border-t border-[#2B2B2B]/10 text-center text-xs text-[#2B2B2B]/60">
            JagaDocs • 100% processed locally in browser memory.
          </footer>
        </div>
      )}

      {/* STATE 3: ACTIVE STUDIO WORKSPACE (Files loaded) */}
      {files.length > 0 && (
        <div className="flex-1 flex flex-col">
          <Header
            onApplyPreset={handleApplyPreset}
            onClearFiles={handleClearFiles}
            onLoadSample={handleLoadSample}
            fileCount={files.length}
            onNavigateHome={handleBackToAllTools}
          />

          <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 flex flex-col gap-5">
            {/* Horizontal Files Carousel & Quick Add */}
            <div className="ghibli-card p-3 shadow-xs">
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
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start flex-1">
              {/* Preview Canvas Area */}
              <div className="lg:col-span-7 xl:col-span-8 flex flex-col h-[520px] lg:h-[720px] sticky top-18">
                <PreviewCanvas
                  activeFile={activeFile}
                  config={config}
                  logoImage={logoImage}
                  onUpdateCustomPosition={handleUpdateCustomPosition}
                  onUpdateCropConfig={handleUpdateCropConfig}
                  onPageChange={handlePageChange}
                  activeStudioTab={activeStudioTab}
                  onSelectStudioTab={setActiveStudioTab}
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
                  activeStudioTab={activeStudioTab}
                  onSelectStudioTab={setActiveStudioTab}
                  activeFile={activeFile}
                />
              </div>
            </div>
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
            isCropActive={
              !!config.crop?.enabled &&
              (config.crop.top > 0 ||
                config.crop.bottom > 0 ||
                config.crop.left > 0 ||
                config.crop.right > 0)
            }
          />
        </div>
      )}
    </div>
  );
}

export default App;
