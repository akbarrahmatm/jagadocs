import React, { useState } from 'react';
import { ShieldCheck, Compass, SlidersHorizontal, Trash2, FileText, Image as ImageIcon, ArrowLeft } from 'lucide-react';
import type { WatermarkPreset } from '../types/watermark';
import { WATERMARK_PRESETS } from '../utils/presets';

interface HeaderProps {
  onApplyPreset: (preset: WatermarkPreset) => void;
  onClearFiles: () => void;
  onLoadSample: (type: 'photo' | 'pdf') => void;
  fileCount: number;
  onNavigateHome?: () => void;
  activeFeatureId?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onApplyPreset,
  onClearFiles,
  onLoadSample,
  fileCount,
  onNavigateHome,
}) => {
  const [showPresetDropdown, setShowPresetDropdown] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F2]/95 backdrop-blur-md border-b border-[#2B2B2B]/10 px-4 lg:px-8 py-3 transition-all shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand & Narrative Station Navigation */}
        <div className="flex items-center gap-3.5">
          {onNavigateHome && (
            <button
              onClick={onNavigateHome}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-ghibli-sm bg-white hover:bg-[#F5F3EC] text-[#2B2B2B] border border-[#2B2B2B]/15 text-xs font-semibold shadow-sm transition-all active:translate-y-[1px]"
              title="Return to Narrative Feature Map"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#212635]" />
              <span className="hidden sm:inline">Feature Map</span>
            </button>
          )}

          <div
            onClick={onNavigateHome}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-ghibli-sm bg-white border border-[#2B2B2B]/15 shadow-sm flex items-center justify-center text-[#7CB342] group-hover:scale-105 transition-transform">
              <Compass className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-bold tracking-tight text-[#2B2B2B]">
                  JagaDocs Studio
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#7CB342]/15 text-[#558B2F] border border-[#7CB342]/30">
                  {fileCount} {fileCount === 1 ? 'File' : 'Files'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Privacy Guarantee Badge */}
        <div className="hidden md:flex items-center gap-2 text-xs text-[#2E7D32] bg-[#E8F5E9] border border-[#7CB342]/30 px-3.5 py-1.5 rounded-ghibli-sm font-medium shadow-sm">
          <ShieldCheck className="w-4 h-4 text-[#7CB342]" />
          <span>Local In-Memory Browser Execution • 100% Private</span>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-2.5">
          {/* Preset Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowPresetDropdown(!showPresetDropdown)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-ghibli-sm bg-white hover:bg-[#F5F3EC] text-[#2B2B2B] border border-[#2B2B2B]/15 transition-all cursor-pointer shadow-sm active:translate-y-[1px]"
              title="Apply watermark style presets"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#212635]" />
              <span>Presets</span>
            </button>

            {showPresetDropdown && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowPresetDropdown(false)}
                />
                <div className="absolute right-0 mt-2.5 w-80 bg-white rounded-ghibli-sm shadow-xl z-50 p-2.5 text-left border border-[#2B2B2B]/15 animate-in fade-in duration-200">
                  <div className="px-3 py-2 text-[11px] font-bold text-[#2B2B2B]/70 uppercase tracking-wider border-b border-[#2B2B2B]/10 mb-1 flex items-center justify-between">
                    <span>Quick Style Presets</span>
                    <span className="text-[10px] text-[#558B2F]">1-Click Apply</span>
                  </div>
                  <div className="space-y-1 max-h-80 overflow-y-auto pr-1">
                    {WATERMARK_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => {
                          onApplyPreset(preset);
                          setShowPresetDropdown(false);
                        }}
                        className="w-full text-left px-3 py-2.5 rounded-ghibli-sm hover:bg-[#F1F8E9] text-[#2B2B2B] text-xs transition-all flex flex-col gap-0.5 cursor-pointer group border border-transparent hover:border-[#7CB342]/30"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#2B2B2B] group-hover:text-[#558B2F]">
                            {preset.name}
                          </span>
                          {preset.badge && (
                            <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-[#FAF8F2] text-[#2B2B2B]/70 group-hover:bg-[#7CB342]/20 group-hover:text-[#2E7D32] border border-[#2B2B2B]/10">
                              {preset.badge}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-[#2B2B2B]/70 truncate">
                          {preset.description}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Quick Sample Loaders */}
          <button
            onClick={() => onLoadSample('pdf')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-ghibli-sm bg-white hover:bg-[#F1F8E9] text-[#2B2B2B] border border-[#2B2B2B]/15 transition-all cursor-pointer shadow-sm active:translate-y-[1px]"
            title="Load sample PDF document"
          >
            <FileText className="w-3.5 h-3.5 text-[#7CB342]" />
            <span>+ PDF Sample</span>
          </button>

          <button
            onClick={() => onLoadSample('photo')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-ghibli-sm bg-white hover:bg-[#E1F5FE] text-[#2B2B2B] border border-[#2B2B2B]/15 transition-all cursor-pointer shadow-sm active:translate-y-[1px]"
            title="Load sample Photo"
          >
            <ImageIcon className="w-3.5 h-3.5 text-[#0288D1]" />
            <span>+ Photo Sample</span>
          </button>

          {/* Clear Files Button */}
          {fileCount > 0 && (
            <button
              onClick={onClearFiles}
              className="flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-ghibli-sm bg-white hover:bg-[#FFEBEE] text-[#C62828] border border-[#C62828]/25 transition-all cursor-pointer shadow-sm active:translate-y-[1px]"
              title="Clear all loaded files"
            >
              <Trash2 className="w-3.5 h-3.5 text-[#C62828]" />
              <span className="hidden sm:inline">Clear All</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
