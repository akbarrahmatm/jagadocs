import React, { useState } from 'react';
import {
  Download,
  Archive,
  Settings2,
  Loader2,
  Sparkles,
} from 'lucide-react';
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
}) => {
  const [showOptions, setShowOptions] = useState(false);

  if (files.length === 0) return null;

  return (
    <div className="sticky bottom-0 z-30 bg-slate-950/80 backdrop-blur-2xl border-t border-white/[0.08] p-4 shadow-[0_-20px_50px_rgba(0,0,0,0.6)] transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Quick Export Format & Settings Toggle */}
        <div className="flex flex-wrap items-center gap-3 text-xs w-full md:w-auto">
          {/* Output Format */}
          <div className="flex items-center gap-2 bg-slate-900/90 px-3.5 py-2 rounded-2xl border border-white/10 shadow-inner">
            <span className="text-slate-400 font-medium">Export Format:</span>
            <select
              value={exportSettings.imageFormat}
              onChange={(e) =>
                onChangeExportSettings({
                  ...exportSettings,
                  imageFormat: e.target.value as ExportSettings['imageFormat'],
                })
              }
              className="bg-transparent text-white font-bold outline-none cursor-pointer"
            >
              <option value="original" className="bg-slate-900">Original (Auto)</option>
              <option value="png" className="bg-slate-900">PNG (Lossless)</option>
              <option value="jpeg" className="bg-slate-900">JPEG (Compressed)</option>
              <option value="webp" className="bg-slate-900">WebP (Modern)</option>
            </select>
          </div>

          {/* JPEG Quality Slider */}
          {exportSettings.imageFormat === 'jpeg' && (
            <div className="flex items-center gap-2 bg-slate-900/90 px-3.5 py-2 rounded-2xl border border-white/10 shadow-inner">
              <span className="text-slate-400 font-medium">Quality:</span>
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
                className="w-16 accent-indigo-500 h-1 bg-slate-950 rounded cursor-pointer"
              />
              <span className="text-indigo-400 font-mono text-[11px] font-bold">
                {Math.round(exportSettings.jpegQuality * 100)}%
              </span>
            </div>
          )}

          {/* Filename prefix/suffix toggle */}
          <button
            type="button"
            onClick={() => setShowOptions(!showOptions)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl glass-pill hover:bg-white/10 text-slate-300 border border-white/10 transition-colors cursor-pointer text-xs font-semibold"
          >
            <Settings2 className="w-3.5 h-3.5 text-indigo-400" />
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
              className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-100 border border-white/10 hover:border-indigo-500/40 font-bold text-xs transition-all cursor-pointer disabled:opacity-50 shadow-lg active:scale-95"
            >
              <Download className="w-4 h-4 text-indigo-400" />
              <span>Download Active {activeFile.type === 'pdf' ? 'PDF' : 'Photo'}</span>
            </button>
          )}

          {/* Download All (Batch ZIP) with Glowing Button */}
          <button
            type="button"
            disabled={isExporting || files.length === 0}
            onClick={onExportBatch}
            className="flex-1 md:flex-initial flex items-center justify-center gap-2.5 px-7 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 text-white font-extrabold text-xs shadow-[0_10px_35px_rgba(99,102,241,0.4)] hover:shadow-[0_15px_45px_rgba(168,85,247,0.5)] transition-all cursor-pointer disabled:opacity-50 active:scale-95"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Archive className="w-4 h-4" />
                <span>
                  Download All ({files.length}) as ZIP
                </span>
                <Sparkles className="w-3.5 h-3.5 text-pink-200" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Expandable Naming Options Drawer */}
      {showOptions && (
        <div className="max-w-7xl mx-auto mt-3 pt-3 border-t border-white/10 flex flex-wrap items-center gap-4 text-xs animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Prefix:</span>
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
              className="px-3 py-1.5 bg-slate-950 border border-white/10 rounded-xl text-white text-xs outline-none focus:border-indigo-500 font-mono"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Suffix:</span>
            <input
              type="text"
              placeholder="e.g. wm"
              value={exportSettings.fileNameSuffix}
              onChange={(e) =>
                onChangeExportSettings({
                  ...exportSettings,
                  fileNameSuffix: e.target.value,
                })
              }
              className="px-3 py-1.5 bg-slate-950 border border-white/10 rounded-xl text-white text-xs outline-none focus:border-indigo-500 font-mono"
            />
          </div>
          <div className="text-[11px] text-slate-400">
            Preview: <span className="font-mono text-indigo-300 font-bold">{exportSettings.fileNamePrefix ? `${exportSettings.fileNamePrefix}_` : ''}document{exportSettings.fileNameSuffix ? `_${exportSettings.fileNameSuffix}` : ''}.pdf</span>
          </div>
        </div>
      )}

      {/* Batch Processing Overlay Modal */}
      {isExporting && exportProgress && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-2xl flex items-center justify-center p-4">
          <div className="glass-panel border border-white/15 rounded-3xl p-8 max-w-md w-full shadow-[0_30px_90px_rgba(0,0,0,0.8)] text-center space-y-5 animate-in zoom-in-95 duration-200">
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500/20 via-purple-500/20 to-pink-500/20 border border-white/20 flex items-center justify-center mx-auto text-indigo-300 shadow-xl">
              <Loader2 className="w-8 h-8 animate-spin text-white" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-white tracking-tight">
                Applying Watermarks &amp; Packaging
              </h3>
              <p className="text-xs text-slate-400 truncate max-w-xs mx-auto font-mono">
                {exportProgress.currentFileName}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-white/10 p-0.5">
                <div
                  className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-full rounded-full transition-all duration-300 shadow-[0_0_15px_rgba(168,85,247,0.6)]"
                  style={{ width: `${exportProgress.percentage}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                <span>
                  {exportProgress.current} of {exportProgress.total} files
                </span>
                <span className="font-mono text-indigo-300 font-bold">
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
