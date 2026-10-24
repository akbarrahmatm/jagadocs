import React, { useState } from 'react';
import { Download, Archive, Settings2, Loader2, Crop } from 'lucide-react';
import type { ExportSettings, UploadedFile } from '../types/watermark';
import type { ExportProgress } from '../utils/exportManager';

interface ExportSectionProps {
  files: UploadedFile[];
  activeFile: UploadedFile | null;
  exportSettings: ExportSettings;
  onChangeExportSettings: (newSettings: ExportSettings) => void;
  onExportSingle: () => void;
  onExportBatch: () => void;
  isExporting: boolean;
  exportProgress: ExportProgress | null;
  isCropActive?: boolean;
}

export const ExportSection: React.FC<ExportSectionProps> = ({
  files,
  activeFile,
  exportSettings,
  onChangeExportSettings,
  onExportSingle,
  onExportBatch,
  isExporting,
  exportProgress,
  isCropActive = false,
}) => {
  const [showOptions, setShowOptions] = useState(false);

  if (files.length === 0) return null;

  return (
    <div className="sticky bottom-0 z-30 bg-[#FAF8F2]/95 backdrop-blur-md border-t border-[#2B2B2B]/10 p-3.5 sm:p-4 shadow-sm transition-all text-[#2B2B2B]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Quick Export Format & Settings Toggle */}
        <div className="flex flex-wrap items-center gap-3 text-xs w-full md:w-auto">
          {isCropActive && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-ghibli-sm bg-[#E8F5E9] border border-[#7CB342]/30 text-[#2E7D32] font-bold text-[11px] shadow-xs">
              <Crop className="w-3.5 h-3.5 text-[#7CB342]" />
              <span>Trim Active</span>
            </div>
          )}

          {/* Output Format */}
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-ghibli-sm border border-[#2B2B2B]/15 shadow-xs">
            <span className="text-[#2B2B2B]/70 font-semibold">Export Format:</span>
            <select
              value={exportSettings.imageFormat}
              onChange={(e) =>
                onChangeExportSettings({
                  ...exportSettings,
                  imageFormat: e.target.value as ExportSettings['imageFormat'],
                })
              }
              className="bg-transparent text-[#2B2B2B] font-bold outline-none cursor-pointer"
            >
              <option value="original">Original (Auto)</option>
              <option value="png">PNG (Lossless)</option>
              <option value="jpeg">JPEG (Compressed)</option>
              <option value="webp">WebP (Modern)</option>
            </select>
          </div>

          {/* JPEG Quality Slider */}
          {exportSettings.imageFormat === 'jpeg' && (
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-ghibli-sm border border-[#2B2B2B]/15 shadow-xs">
              <span className="text-[#2B2B2B]/70 font-semibold">Quality:</span>
              <input
                type="range"
                min={0.4}
                max={1.0}
                step={0.05}
                value={exportSettings.jpegQuality}
                onChange={(e) =>
                  onChangeExportSettings({
                    ...exportSettings,
                    jpegQuality: Number(e.target.value),
                  })
                }
                className="w-16 accent-[#212635] h-1 bg-[#2B2B2B]/10 rounded cursor-pointer"
              />
              <span className="text-[#212635] font-mono text-[11px] font-bold">
                {Math.round(exportSettings.jpegQuality * 100)}%
              </span>
            </div>
          )}

          {/* Filename prefix/suffix toggle */}
          <button
            type="button"
            onClick={() => setShowOptions(!showOptions)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-ghibli-sm bg-white hover:bg-[#FAF8F2] text-[#2B2B2B] border border-[#2B2B2B]/15 transition-colors cursor-pointer text-xs font-semibold shadow-xs"
          >
            <Settings2 className="w-3.5 h-3.5 text-[#212635]" />
            <span>File Naming</span>
          </button>
        </div>

        {/* Right: Action Buttons (Single Download & Batch ZIP) */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          {/* Download Active File */}
          {activeFile && (
            <button
              type="button"
              disabled={isExporting}
              onClick={onExportSingle}
              className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-ghibli-sm bg-white hover:bg-[#FAF8F2] text-[#2B2B2B] border border-[#2B2B2B]/20 font-bold text-xs transition-all cursor-pointer disabled:opacity-50 shadow-xs active:translate-y-[1px]"
            >
              <Download className="w-4 h-4 text-[#7CB342]" />
              <span>Download Active {activeFile.type === 'pdf' ? 'PDF' : 'Photo'}</span>
            </button>
          )}

          {/* Download All (Batch ZIP) */}
          <button
            type="button"
            disabled={isExporting || files.length === 0}
            onClick={onExportBatch}
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-ghibli-sm bg-[#212635] hover:bg-[#2B2B2B] text-[#FAF8F2] font-bold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50 active:translate-y-[1px]"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#7CB342]" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Archive className="w-4 h-4 text-[#7CB342]" />
                <span>Download All ({files.length}) as ZIP</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Expandable Naming Options Drawer */}
      {showOptions && (
        <div className="max-w-7xl mx-auto mt-3 pt-3 border-t border-[#2B2B2B]/10 flex flex-wrap items-center gap-4 text-xs animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <span className="text-[#2B2B2B]/70 font-semibold">Prefix:</span>
            <input
              type="text"
              placeholder="e.g. watermarked"
              value={exportSettings.fileNamePrefix}
              onChange={(e) =>
                onChangeExportSettings({
                  ...exportSettings,
                  fileNamePrefix: e.target.value,
                })
              }
              className="px-3 py-1 bg-white border border-[#2B2B2B]/20 rounded-ghibli-sm text-[#2B2B2B] text-xs outline-none focus:border-[#212635] font-mono shadow-xs"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#2B2B2B]/70 font-semibold">Suffix:</span>
            <input
              type="text"
              placeholder="e.g. final"
              value={exportSettings.fileNameSuffix}
              onChange={(e) =>
                onChangeExportSettings({
                  ...exportSettings,
                  fileNameSuffix: e.target.value,
                })
              }
              className="px-3 py-1 bg-white border border-[#2B2B2B]/20 rounded-ghibli-sm text-[#2B2B2B] text-xs outline-none focus:border-[#212635] font-mono shadow-xs"
            />
          </div>
          <div className="text-[11px] text-[#2B2B2B]/70">
            Preview:{' '}
            <span className="font-mono text-[#212635] font-bold">
              {exportSettings.fileNamePrefix ? `${exportSettings.fileNamePrefix}_` : ''}document
              {exportSettings.fileNameSuffix ? `_${exportSettings.fileNameSuffix}` : ''}.pdf
            </span>
          </div>
        </div>
      )}

      {/* Batch Processing Overlay Modal */}
      {isExporting && exportProgress && (
        <div className="fixed inset-0 z-50 bg-[#2B2B2B]/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#2B2B2B]/15 rounded-ghibli-md p-7 max-w-md w-full shadow-xl text-center space-y-4 animate-in fade-in duration-200">
            <div className="w-14 h-14 rounded-ghibli-sm bg-[#FAF8F2] border border-[#2B2B2B]/15 flex items-center justify-center mx-auto text-[#212635] shadow-xs">
              <Loader2 className="w-7 h-7 animate-spin text-[#7CB342]" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#2B2B2B] tracking-tight m-0">
                Applying Watermarks &amp; Packaging
              </h3>
              <p className="text-xs text-[#2B2B2B]/70 truncate max-w-xs mx-auto font-mono m-0">
                {exportProgress.currentFileName}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="w-full bg-[#FAF8F2] h-3 rounded-full overflow-hidden border border-[#2B2B2B]/15 p-0.5">
                <div
                  className="bg-[#7CB342] h-full rounded-full transition-all duration-300"
                  style={{ width: `${exportProgress.percentage}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-[#2B2B2B]/70 font-medium">
                <span>
                  {exportProgress.current} of {exportProgress.total} files
                </span>
                <span className="font-mono text-[#212635] font-bold">
                  {exportProgress.percentage}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
