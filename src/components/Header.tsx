import React, { useState } from 'react';
import { ShieldCheck, Sparkles, Wand2, Trash2, Image as ImageIcon, FileText } from 'lucide-react';
import type { WatermarkPreset } from '../types/watermark';
import { WATERMARK_PRESETS } from '../utils/presets';

interface HeaderProps {
  onApplyPreset: (preset: WatermarkPreset) => void;
  onClearFiles: () => void;
  onLoadSample: (type: 'photo' | 'pdf') => void;
  fileCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onApplyPreset,
  onClearFiles,
  onLoadSample,
  fileCount,
}) => {
  const [showPresetDropdown, setShowPresetDropdown] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-slate-950/70 backdrop-blur-2xl border-b border-white/[0.08] px-4 lg:px-8 py-3.5 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand with glowing aura */}
        <div className="flex items-center gap-3.5 group cursor-pointer">
          <div className="relative">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-50 blur-sm group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative w-10 h-10 rounded-xl bg-slate-900 border border-white/20 flex items-center justify-center shadow-inner">
              <Sparkles className="w-5 h-5 text-indigo-400 group-hover:rotate-12 transition-transform duration-300" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent m-0">
                JagaDocs
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 shadow-[0_0_12px_rgba(99,102,241,0.2)]">
                PDF &amp; Photo
              </span>
            </div>
            <p className="text-xs text-slate-400 m-0 hidden sm:block font-medium">
              Secure watermark studio for photos &amp; multi-page PDFs
            </p>
          </div>
        </div>

        {/* Center: Privacy Indicator Badge */}
        <div className="hidden md:flex items-center gap-2 text-xs text-emerald-300 bg-emerald-950/30 border border-emerald-500/30 px-3.5 py-1.5 rounded-full font-medium shadow-[0_0_20px_rgba(16,185,129,0.15)] backdrop-blur-md">
          <ShieldCheck className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>100% Client-Side • Local Processing</span>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-2.5">
          {/* Preset Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowPresetDropdown(!showPresetDropdown)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-white/10 hover:border-indigo-500/40 transition-all cursor-pointer shadow-lg hover:shadow-indigo-500/10 active:scale-95"
              title="Apply pre-built watermark presets"
            >
              <Wand2 className="w-3.5 h-3.5 text-purple-400" />
              <span>Presets</span>
            </button>

            {showPresetDropdown && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowPresetDropdown(false)}
                />
                <div className="absolute right-0 mt-3 w-80 glass-panel rounded-2xl shadow-2xl z-50 p-2.5 text-left border border-white/15 animate-in fade-in zoom-in-95 duration-200">
                  <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-white/10 mb-1 flex items-center justify-between">
                    <span>Quick Style Presets</span>
                    <span className="text-[10px] text-indigo-400">1-Click Apply</span>
                  </div>
                  <div className="space-y-1 max-h-80 overflow-y-auto pr-1">
                    {WATERMARK_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => {
                          onApplyPreset(preset);
                          setShowPresetDropdown(false);
                        }}
                        className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-indigo-600/20 text-slate-300 text-xs transition-all flex flex-col gap-1 cursor-pointer group border border-transparent hover:border-indigo-500/30"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white group-hover:text-indigo-300">
                            {preset.name}
                          </span>
                          {preset.badge && (
                            <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 group-hover:bg-indigo-500/30 group-hover:text-indigo-200 border border-white/5">
                              {preset.badge}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 group-hover:text-slate-300 truncate">
                          {preset.description}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Sample Loaders */}
          {fileCount === 0 && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onLoadSample('photo')}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 transition-all cursor-pointer shadow-sm active:scale-95"
                title="Load sample photo"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Try Photo</span>
              </button>
              <button
                onClick={() => onLoadSample('pdf')}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 transition-all cursor-pointer shadow-sm active:scale-95"
                title="Load sample PDF"
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Try PDF</span>
              </button>
            </div>
          )}

          {/* Clear Files */}
          {fileCount > 0 && (
            <button
              onClick={onClearFiles}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/25 transition-all cursor-pointer active:scale-95"
              title="Remove all uploaded files"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear ({fileCount})</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
