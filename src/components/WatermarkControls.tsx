import React, { useRef, useState } from 'react';
import {
  Type,
  Image as ImageIcon,
  Grid3X3,
  Sliders,
  Layers,
  FileCheck,
  Bold,
  Italic,
  Underline,
  UploadCloud,
  X,
  ChevronDown,
  ChevronUp,
  Crop,
  Lock,
  Unlock,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  SlidersHorizontal,
} from 'lucide-react';
import type {
  GridPosition,
  WatermarkConfig,
  ExportSettings,
  CropConfig,
  CropUnit,
  UploadedFile,
} from '../types/watermark';
import { CROP_PRESETS, type CropPreset, formatPaperDimensions } from '../utils/cropUtils';

interface WatermarkControlsProps {
  config: WatermarkConfig;
  onChangeConfig: (newConfig: WatermarkConfig) => void;
  exportSettings: ExportSettings;
  onChangeExportSettings: (newSettings: ExportSettings) => void;
  onLogoUpload: (file: File) => void;
  onRemoveLogo: () => void;
  hasPdfInFiles: boolean;
  activeStudioTab?: 'watermark' | 'crop';
  onSelectStudioTab?: (tab: 'watermark' | 'crop') => void;
  activeFile?: UploadedFile | null;
}

const FONT_FAMILIES = [
  { label: 'Helvetica / Arial (Clean Sans)', value: 'Helvetica, Arial, sans-serif' },
  { label: 'Times New Roman (Classic Serif)', value: '"Times New Roman", Times, serif' },
  { label: 'Georgia (Warm Serif)', value: 'Georgia, serif' },
  { label: 'Courier New (Monospace / Code)', value: '"Courier New", Courier, monospace' },
  { label: 'Impact (Bold Display)', value: 'Impact, "Arial Black", sans-serif' },
  { label: 'Trebuchet MS (Modern Sans)', value: '"Trebuchet MS", sans-serif' },
  { label: 'Verdana (Readable)', value: 'Verdana, Geneva, sans-serif' },
];

const PRESET_COLORS = [
  '#dc2626',
  '#ef4444',
  '#f97316',
  '#7cb342',
  '#2e7d32',
  '#0288d1',
  '#212635',
  '#c2185b',
  '#ffffff',
  '#2b2b2b',
];

export const WatermarkControls: React.FC<WatermarkControlsProps> = ({
  config,
  onChangeConfig,
  exportSettings,
  onChangeExportSettings,
  onLogoUpload,
  onRemoveLogo,
  hasPdfInFiles,
  activeStudioTab = 'watermark',
  onSelectStudioTab,
  activeFile,
}) => {
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [showAdvancedEffects, setShowAdvancedEffects] = useState(false);

  const updateText = (partial: Partial<WatermarkConfig['text']>) => {
    onChangeConfig({
      ...config,
      text: { ...config.text, ...partial },
    });
  };

  const updateImage = (partial: Partial<WatermarkConfig['image']>) => {
    onChangeConfig({
      ...config,
      image: { ...config.image, ...partial },
    });
  };

  const updateTile = (partial: Partial<WatermarkConfig['tileSettings']>) => {
    onChangeConfig({
      ...config,
      tileSettings: { ...config.tileSettings, ...partial },
    });
  };

  const updateCrop = (partial: Partial<CropConfig>) => {
    const nextCrop = { ...config.crop, ...partial };

    if (partial.top !== undefined && config.crop.linked) {
      nextCrop.bottom = partial.top;
      nextCrop.left = partial.top;
      nextCrop.right = partial.top;
    }

    onChangeConfig({
      ...config,
      crop: nextCrop,
    });
  };

  const handleApplyCropPreset = (preset: CropPreset) => {
    updateCrop({
      enabled: true,
      ...preset.config,
    });
  };

  const insertToken = (token: string) => {
    updateText({ text: `${config.text.text} ${token}` });
  };

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onLogoUpload(e.target.files[0]);
    }
  };

  const GRID_POSITIONS: { pos: GridPosition; label: string }[] = [
    { pos: 'top-left', label: 'TL' },
    { pos: 'top-center', label: 'TC' },
    { pos: 'top-right', label: 'TR' },
    { pos: 'center-left', label: 'CL' },
    { pos: 'center', label: 'C' },
    { pos: 'center-right', label: 'CR' },
    { pos: 'bottom-left', label: 'BL' },
    { pos: 'bottom-center', label: 'BC' },
    { pos: 'bottom-right', label: 'BR' },
  ];

  const isCropActive =
    !!config.crop?.enabled &&
    (config.crop.top > 0 ||
      config.crop.bottom > 0 ||
      config.crop.left > 0 ||
      config.crop.right > 0);

  const getSliderMax = (unit: CropUnit): number => {
    switch (unit) {
      case 'percent':
        return 45;
      case 'mm':
        return 60;
      case 'pt':
        return 180;
      case 'px':
        return 300;
    }
  };

  const getSliderStep = (unit: CropUnit): number => {
    switch (unit) {
      case 'percent':
        return 0.5;
      case 'mm':
        return 0.5;
      case 'pt':
        return 1;
      case 'px':
        return 1;
    }
  };

  const unitLabel = config.crop.unit === 'percent' ? '%' : config.crop.unit;

  return (
    <div className="flex flex-col gap-5 p-5 md:p-6 ghibli-card bg-white border border-[#2B2B2B]/10 text-[#2B2B2B] shadow-sm">
      {/* Studio Primary Navigation Tabs */}
      <div className="grid grid-cols-2 gap-2 bg-[#FAF8F2] p-1.5 rounded-ghibli-sm border border-[#2B2B2B]/15 shadow-xs">
        <button
          type="button"
          onClick={() => onSelectStudioTab && onSelectStudioTab('watermark')}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-ghibli-sm text-xs font-bold transition-all cursor-pointer ${
            activeStudioTab === 'watermark'
              ? 'bg-[#212635] text-[#FAF8F2] shadow-xs'
              : 'text-[#2B2B2B]/70 hover:text-[#2B2B2B] hover:bg-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Watermark Studio</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectStudioTab && onSelectStudioTab('crop')}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-ghibli-sm text-xs font-bold transition-all cursor-pointer relative ${
            activeStudioTab === 'crop'
              ? 'bg-[#7CB342] text-white shadow-xs'
              : 'text-[#2B2B2B]/70 hover:text-[#2B2B2B] hover:bg-white'
          }`}
        >
          <Crop className="w-4 h-4" />
          <span>Crop &amp; Margin</span>
          {isCropActive && (
            <span className="w-2 h-2 rounded-full bg-[#2E7D32]" />
          )}
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: CROP & TRIM PANEL                                */}
      {/* ======================================================== */}
      {activeStudioTab === 'crop' && (
        <div className="flex flex-col gap-4">
          {/* Master Enable / Disable Banner */}
          <div className="flex items-center justify-between p-3.5 bg-[#FAF8F2] rounded-ghibli-sm border border-[#2B2B2B]/10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-ghibli-sm bg-[#E8F5E9] border border-[#7CB342]/30 flex items-center justify-center text-[#2E7D32]">
                <Crop className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#2B2B2B] block">
                  Document Edge Crop &amp; Margin Trim
                </span>
                <span className="text-[10px] text-[#2B2B2B]/70">
                  {isCropActive ? 'Active (Margins trimmed)' : 'Disabled / Full page'}
                </span>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.crop.enabled}
                onChange={(e) => updateCrop({ enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#2B2B2B]/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7CB342]" />
            </label>
          </div>

          {/* Quick Presets Grid */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#2B2B2B]/70 block mb-2">
              Quick Margin Presets
            </label>
            <div className="grid grid-cols-2 gap-2">
              {CROP_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleApplyCropPreset(preset)}
                  className="px-2.5 py-2 rounded-ghibli-sm bg-[#FAF8F2] hover:bg-white border border-[#2B2B2B]/10 hover:border-[#7CB342]/50 text-left transition-all cursor-pointer group shadow-xs active:translate-y-[1px]"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#2B2B2B] group-hover:text-[#2E7D32]">
                      {preset.name}
                    </span>
                    {preset.badge && (
                      <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-[#E8F5E9] text-[#2E7D32] border border-[#7CB342]/20">
                        {preset.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-[#2B2B2B]/60 truncate block mt-0.5">
                    {preset.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Unit Selector & Linked Sides Toggle */}
          <div className="grid grid-cols-2 gap-3 border-t border-[#2B2B2B]/10 pt-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#2B2B2B]/70 block mb-1.5">
                Unit of Measure
              </label>
              <div className="flex items-center bg-[#FAF8F2] p-1 rounded-ghibli-sm border border-[#2B2B2B]/15">
                {(['percent', 'mm', 'pt', 'px'] as CropUnit[]).map((unit) => (
                  <button
                    key={unit}
                    type="button"
                    onClick={() => updateCrop({ unit })}
                    className={`flex-1 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                      config.crop.unit === unit
                        ? 'bg-[#212635] text-white shadow-xs'
                        : 'text-[#2B2B2B]/70 hover:text-[#2B2B2B]'
                    }`}
                  >
                    {unit === 'percent' ? '%' : unit}
                  </button>
                ))}
              </div>
            </div>

            {/* Lock / Linked Sides Toggle */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#2B2B2B]/70 block mb-1.5">
                Margin Ratio
              </label>
              <button
                type="button"
                onClick={() => updateCrop({ linked: !config.crop.linked })}
                className={`w-full py-1.5 px-3 rounded-ghibli-sm border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  config.crop.linked
                    ? 'bg-[#E8F5E9] border-[#7CB342]/40 text-[#2E7D32]'
                    : 'bg-[#FAF8F2] border-[#2B2B2B]/15 text-[#2B2B2B]/70 hover:text-[#2B2B2B]'
                }`}
              >
                {config.crop.linked ? (
                  <>
                    <Lock className="w-3.5 h-3.5 text-[#2E7D32]" />
                    <span>Linked (Uniform)</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-3.5 h-3.5" />
                    <span>Independent</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 4 Edge Sliders */}
          <div className="space-y-3.5 bg-[#FAF8F2] p-4 rounded-ghibli-sm border border-[#2B2B2B]/10">
            {/* Top Margin */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-[#2B2B2B] flex items-center gap-1.5">
                  <ArrowUp className="w-3.5 h-3.5 text-[#7CB342]" />
                  <span>Top Edge Trim</span>
                </span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={0}
                    max={getSliderMax(config.crop.unit)}
                    step={getSliderStep(config.crop.unit)}
                    value={config.crop.top}
                    onChange={(e) => updateCrop({ top: Math.max(0, Number(e.target.value)) })}
                    className="w-14 px-1.5 py-0.5 bg-white border border-[#2B2B2B]/20 rounded text-right text-[#2E7D32] font-mono text-xs font-bold outline-none"
                  />
                  <span className="text-[#2B2B2B]/60 font-mono text-[11px]">{unitLabel}</span>
                </div>
              </div>
              <input
                type="range"
                min={0}
                max={getSliderMax(config.crop.unit)}
                step={getSliderStep(config.crop.unit)}
                value={config.crop.top}
                onChange={(e) => updateCrop({ top: Number(e.target.value) })}
                className="w-full accent-[#7CB342] h-1.5 bg-[#2B2B2B]/10 rounded-lg cursor-pointer"
              />
            </div>

            {/* Bottom Margin */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-[#2B2B2B] flex items-center gap-1.5">
                  <ArrowDown className="w-3.5 h-3.5 text-[#7CB342]" />
                  <span>Bottom Edge Trim</span>
                </span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={0}
                    max={getSliderMax(config.crop.unit)}
                    step={getSliderStep(config.crop.unit)}
                    value={config.crop.bottom}
                    onChange={(e) => updateCrop({ bottom: Math.max(0, Number(e.target.value)) })}
                    className="w-14 px-1.5 py-0.5 bg-white border border-[#2B2B2B]/20 rounded text-right text-[#2E7D32] font-mono text-xs font-bold outline-none"
                  />
                  <span className="text-[#2B2B2B]/60 font-mono text-[11px]">{unitLabel}</span>
                </div>
              </div>
              <input
                type="range"
                min={0}
                max={getSliderMax(config.crop.unit)}
                step={getSliderStep(config.crop.unit)}
                value={config.crop.bottom}
                onChange={(e) => updateCrop({ bottom: Number(e.target.value) })}
                className="w-full accent-[#7CB342] h-1.5 bg-[#2B2B2B]/10 rounded-lg cursor-pointer"
              />
            </div>

            {/* Left Margin */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-[#2B2B2B] flex items-center gap-1.5">
                  <ArrowLeft className="w-3.5 h-3.5 text-[#7CB342]" />
                  <span>Left Edge Trim</span>
                </span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={0}
                    max={getSliderMax(config.crop.unit)}
                    step={getSliderStep(config.crop.unit)}
                    value={config.crop.left}
                    onChange={(e) => updateCrop({ left: Math.max(0, Number(e.target.value)) })}
                    className="w-14 px-1.5 py-0.5 bg-white border border-[#2B2B2B]/20 rounded text-right text-[#2E7D32] font-mono text-xs font-bold outline-none"
                  />
                  <span className="text-[#2B2B2B]/60 font-mono text-[11px]">{unitLabel}</span>
                </div>
              </div>
              <input
                type="range"
                min={0}
                max={getSliderMax(config.crop.unit)}
                step={getSliderStep(config.crop.unit)}
                value={config.crop.left}
                onChange={(e) => updateCrop({ left: Number(e.target.value) })}
                className="w-full accent-[#7CB342] h-1.5 bg-[#2B2B2B]/10 rounded-lg cursor-pointer"
              />
            </div>

            {/* Right Margin */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-[#2B2B2B] flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-[#7CB342]" />
                  <span>Right Edge Trim</span>
                </span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={0}
                    max={getSliderMax(config.crop.unit)}
                    step={getSliderStep(config.crop.unit)}
                    value={config.crop.right}
                    onChange={(e) => updateCrop({ right: Math.max(0, Number(e.target.value)) })}
                    className="w-14 px-1.5 py-0.5 bg-white border border-[#2B2B2B]/20 rounded text-right text-[#2E7D32] font-mono text-xs font-bold outline-none"
                  />
                  <span className="text-[#2B2B2B]/60 font-mono text-[11px]">{unitLabel}</span>
                </div>
              </div>
              <input
                type="range"
                min={0}
                max={getSliderMax(config.crop.unit)}
                step={getSliderStep(config.crop.unit)}
                value={config.crop.right}
                onChange={(e) => updateCrop({ right: Number(e.target.value) })}
                className="w-full accent-[#7CB342] h-1.5 bg-[#2B2B2B]/10 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* PDF Page Scope */}
          {hasPdfInFiles && (
            <div className="border-t border-[#2B2B2B]/10 pt-3">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#2B2B2B]/70 block mb-1.5">
                Crop Application Scope
              </label>
              <div className="grid grid-cols-2 gap-2 bg-[#FAF8F2] p-1 rounded-ghibli-sm border border-[#2B2B2B]/15">
                <button
                  type="button"
                  onClick={() => updateCrop({ scope: 'all' })}
                  className={`py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                    config.crop.scope === 'all'
                      ? 'bg-[#7CB342] text-white shadow-xs'
                      : 'text-[#2B2B2B]/70 hover:text-[#2B2B2B]'
                  }`}
                >
                  All PDF Pages
                </button>
                <button
                  type="button"
                  onClick={() => updateCrop({ scope: 'current' })}
                  className={`py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                    config.crop.scope === 'current'
                      ? 'bg-[#7CB342] text-white shadow-xs'
                      : 'text-[#2B2B2B]/70 hover:text-[#2B2B2B]'
                  }`}
                >
                  Current Page Only
                </button>
              </div>
            </div>
          )}

          {activeFile && (
            <div className="p-3 bg-[#FAF8F2] rounded-ghibli-sm border border-[#2B2B2B]/10 text-xs space-y-1">
              <div className="flex items-center justify-between text-[#2B2B2B]/70">
                <span className="font-semibold">Original Dimensions:</span>
                <span className="text-[#2B2B2B] font-mono font-bold">
                  {formatPaperDimensions(activeFile.originalWidth, activeFile.originalHeight)}
                </span>
              </div>
              {isCropActive ? (
                <div className="flex items-center justify-between text-[#2E7D32]">
                  <span className="font-semibold">Trim Status:</span>
                  <span className="font-mono font-bold text-[11px]">
                    Top {config.crop.top}
                    {unitLabel}, Bottom {config.crop.bottom}
                    {unitLabel}, Left {config.crop.left}
                    {unitLabel}, Right {config.crop.right}
                    {unitLabel}
                  </span>
                </div>
              ) : (
                <div className="text-[11px] text-[#2B2B2B]/60 italic">
                  No margins trimmed (Full page output)
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: WATERMARK STUDIO                                 */}
      {/* ======================================================== */}
      {activeStudioTab === 'watermark' && (
        <div className="flex flex-col gap-5">
          {/* Master Enable/Disable Watermark Switch */}
          <div className="flex items-center justify-between p-3.5 bg-[#FAF8F2] rounded-ghibli-sm border border-[#2B2B2B]/10">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-8 h-8 rounded-ghibli-sm flex items-center justify-center ${
                  config.watermarkEnabled !== false
                    ? 'bg-[#212635] text-white'
                    : 'bg-[#2B2B2B]/10 text-[#2B2B2B]/50'
                }`}
              >
                <Type className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#2B2B2B] block">
                  Watermark Stamp
                </span>
                <span className="text-[10px] text-[#2B2B2B]/70">
                  {config.watermarkEnabled !== false
                    ? 'Enabled on export'
                    : 'Disabled (Crop-only mode)'}
                </span>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.watermarkEnabled !== false}
                onChange={(e) =>
                  onChangeConfig({
                    ...config,
                    watermarkEnabled: e.target.checked,
                  })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#2B2B2B]/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#212635]" />
            </label>
          </div>

          {config.watermarkEnabled === false ? (
            <div className="p-4 bg-[#E1F5FE] rounded-ghibli-sm border border-[#4FC3F7]/40 text-xs space-y-2 text-[#0277BD]">
              <div className="flex items-center gap-2 font-bold text-[#01579B]">
                <Layers className="w-4 h-4 text-[#0288D1]" />
                <span>Crop-Only Mode Active</span>
              </div>
              <p className="text-[11px] text-[#0277BD] leading-relaxed m-0">
                Watermark stamp is disabled. Your document will be exported with margin trimming only.
              </p>
              <button
                type="button"
                onClick={() => onChangeConfig({ ...config, watermarkEnabled: true })}
                className="mt-1 px-3.5 py-1.5 rounded-ghibli-sm bg-[#0288D1] hover:bg-[#0277BD] text-white font-bold text-xs cursor-pointer shadow-xs transition-all inline-block"
              >
                Re-enable Watermark
              </button>
            </div>
          ) : (
            <>
              {/* Watermark Type Switcher */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#2B2B2B]/70 block mb-2">
                  Watermark Type
                </label>
                <div className="grid grid-cols-2 gap-2 bg-[#FAF8F2] p-1.5 rounded-ghibli-sm border border-[#2B2B2B]/15">
                  <button
                    type="button"
                    onClick={() => onChangeConfig({ ...config, type: 'text' })}
                    className={`flex items-center justify-center gap-2 py-2 rounded-ghibli-sm text-xs font-bold transition-all cursor-pointer ${
                      config.type === 'text'
                        ? 'bg-[#212635] text-white shadow-xs'
                        : 'text-[#2B2B2B]/70 hover:text-[#2B2B2B]'
                    }`}
                  >
                    <Type className="w-4 h-4" />
                    <span>Text Watermark</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onChangeConfig({ ...config, type: 'image' })}
                    className={`flex items-center justify-center gap-2 py-2 rounded-ghibli-sm text-xs font-bold transition-all cursor-pointer ${
                      config.type === 'image'
                        ? 'bg-[#212635] text-white shadow-xs'
                        : 'text-[#2B2B2B]/70 hover:text-[#2B2B2B]'
                    }`}
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span>Logo / Stamp</span>
                  </button>
                </div>
              </div>

              {/* Text Watermark Settings */}
              {config.type === 'text' && (
                <div className="flex flex-col gap-4 border-t border-[#2B2B2B]/10 pt-4">
                  {/* Text Input */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-[#2B2B2B]">Watermark Text</label>
                      <span className="text-[11px] text-[#2B2B2B]/60">Multi-line support</span>
                    </div>
                    <textarea
                      value={config.text.text}
                      onChange={(e) => updateText({ text: e.target.value })}
                      rows={2}
                      placeholder="e.g. CONFIDENTIAL, OFFICIAL COPY 2026"
                      className="w-full px-3.5 py-2.5 bg-white border border-[#2B2B2B]/20 focus:border-[#212635] focus:ring-2 focus:ring-[#212635]/20 rounded-ghibli-sm text-sm text-[#2B2B2B] placeholder-[#2B2B2B]/40 outline-none transition-all resize-y shadow-xs font-medium"
                    />

                    {/* Dynamic Tokens */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      <span className="text-[10px] text-[#2B2B2B]/60 uppercase font-bold">Tokens:</span>
                      {[
                        { label: '+ Date', token: '{date}' },
                        { label: '+ Year', token: '{year}' },
                        { label: '+ Filename', token: '{filename}' },
                        { label: '+ Page #', token: '{page}' },
                      ].map((item) => (
                        <button
                          key={item.token}
                          type="button"
                          onClick={() => insertToken(item.token)}
                          className="text-[10px] px-2.5 py-1 rounded-ghibli-sm bg-[#FAF8F2] hover:bg-white text-[#212635] border border-[#2B2B2B]/15 transition-all cursor-pointer font-medium shadow-xs"
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Font Family & Styles */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-[#2B2B2B] block mb-1">
                        Font Family
                      </label>
                      <select
                        value={config.text.fontFamily}
                        onChange={(e) => updateText({ fontFamily: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-[#2B2B2B]/20 rounded-ghibli-sm text-xs text-[#2B2B2B] outline-none focus:border-[#212635] cursor-pointer shadow-xs"
                      >
                        {FONT_FAMILIES.map((font) => (
                          <option key={font.value} value={font.value}>
                            {font.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Bold, Italic, Underline */}
                    <div>
                      <label className="text-xs font-bold text-[#2B2B2B] block mb-1">
                        Font Style
                      </label>
                      <div className="flex items-center gap-1 bg-[#FAF8F2] p-1 rounded-ghibli-sm border border-[#2B2B2B]/15">
                        <button
                          type="button"
                          onClick={() => updateText({ bold: !config.text.bold })}
                          className={`flex-1 py-1.5 flex items-center justify-center rounded-md text-xs font-bold transition-all cursor-pointer ${
                            config.text.bold
                              ? 'bg-[#212635] text-white shadow-xs'
                              : 'text-[#2B2B2B]/70 hover:text-[#2B2B2B]'
                          }`}
                          title="Bold"
                        >
                          <Bold className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => updateText({ italic: !config.text.italic })}
                          className={`flex-1 py-1.5 flex items-center justify-center rounded-md text-xs italic transition-all cursor-pointer ${
                            config.text.italic
                              ? 'bg-[#212635] text-white shadow-xs'
                              : 'text-[#2B2B2B]/70 hover:text-[#2B2B2B]'
                          }`}
                          title="Italic"
                        >
                          <Italic className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => updateText({ underline: !config.text.underline })}
                          className={`flex-1 py-1.5 flex items-center justify-center rounded-md text-xs underline transition-all cursor-pointer ${
                            config.text.underline
                              ? 'bg-[#212635] text-white shadow-xs'
                              : 'text-[#2B2B2B]/70 hover:text-[#2B2B2B]'
                          }`}
                          title="Underline"
                        >
                          <Underline className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Font Size & Opacity Sliders */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-[#2B2B2B]">Font Scale</span>
                        <span className="text-[#212635] font-mono text-[11px] font-bold">
                          {config.text.fontSizePercent}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min={2}
                        max={35}
                        value={config.text.fontSizePercent}
                        onChange={(e) => updateText({ fontSizePercent: Number(e.target.value) })}
                        className="w-full accent-[#212635] h-1.5 bg-[#2B2B2B]/10 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-[#2B2B2B]">Opacity</span>
                        <span className="text-[#212635] font-mono text-[11px] font-bold">
                          {Math.round(config.text.opacity * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0.05}
                        max={1}
                        step={0.05}
                        value={config.text.opacity}
                        onChange={(e) => updateText({ opacity: Number(e.target.value) })}
                        className="w-full accent-[#212635] h-1.5 bg-[#2B2B2B]/10 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Color & Rotation */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Color Palette */}
                    <div>
                      <label className="text-xs font-bold text-[#2B2B2B] block mb-1.5">
                        Watermark Color
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={config.text.color}
                          onChange={(e) => updateText({ color: e.target.value })}
                          className="w-8 h-8 rounded-ghibli-sm border border-[#2B2B2B]/20 bg-transparent cursor-pointer shadow-xs"
                        />
                        <div className="flex flex-wrap gap-1 flex-1">
                          {PRESET_COLORS.slice(0, 8).map((color) => (
                            <button
                              key={color}
                              type="button"
                              onClick={() => updateText({ color })}
                              className="w-6 h-6 rounded-full border border-[#2B2B2B]/20 transition-transform hover:scale-110 cursor-pointer shadow-xs"
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Rotation Slider */}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-[#2B2B2B]">Rotation Angle</span>
                        <span className="text-[#212635] font-mono text-[11px] font-bold">
                          {config.text.rotation}°
                        </span>
                      </div>
                      <input
                        type="range"
                        min={-180}
                        max={180}
                        step={5}
                        value={config.text.rotation}
                        onChange={(e) => updateText({ rotation: Number(e.target.value) })}
                        className="w-full accent-[#212635] h-1.5 bg-[#2B2B2B]/10 rounded-lg cursor-pointer"
                      />
                      <div className="flex items-center justify-between mt-1">
                        {[-45, 0, 45, 90].map((deg) => (
                          <button
                            key={deg}
                            type="button"
                            onClick={() => updateText({ rotation: deg })}
                            className="text-[10px] font-semibold text-[#2B2B2B]/60 hover:text-[#212635] cursor-pointer"
                          >
                            {deg}°
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Advanced Effects Accordion */}
                  <div className="border border-[#2B2B2B]/10 rounded-ghibli-sm overflow-hidden bg-[#FAF8F2]">
                    <button
                      type="button"
                      onClick={() => setShowAdvancedEffects(!showAdvancedEffects)}
                      className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-bold text-[#2B2B2B] hover:bg-white transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <SlidersHorizontal className="w-4 h-4 text-[#7CB342]" />
                        <span>Outline, Drop Shadow &amp; Badge Container</span>
                      </div>
                      {showAdvancedEffects ? (
                        <ChevronUp className="w-4 h-4 text-[#2B2B2B]/60" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[#2B2B2B]/60" />
                      )}
                    </button>

                    {showAdvancedEffects && (
                      <div className="p-3.5 border-t border-[#2B2B2B]/10 space-y-3 bg-white">
                        {/* Stroke Outline */}
                        <div className="flex items-center justify-between gap-2">
                          <label className="flex items-center gap-2 text-xs font-medium text-[#2B2B2B] cursor-pointer">
                            <input
                              type="checkbox"
                              checked={config.text.stroke}
                              onChange={(e) => updateText({ stroke: e.target.checked })}
                              className="accent-[#212635] rounded"
                            />
                            <span>Text Outline (Stroke)</span>
                          </label>
                          {config.text.stroke && (
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={config.text.strokeColor}
                                onChange={(e) => updateText({ strokeColor: e.target.value })}
                                className="w-6 h-6 rounded border border-[#2B2B2B]/20 bg-transparent cursor-pointer"
                              />
                              <input
                                type="range"
                                min={1}
                                max={8}
                                value={config.text.strokeWidth}
                                onChange={(e) => updateText({ strokeWidth: Number(e.target.value) })}
                                className="w-16 accent-[#212635] h-1 bg-[#2B2B2B]/10 rounded cursor-pointer"
                              />
                            </div>
                          )}
                        </div>

                        {/* Drop Shadow */}
                        <div className="flex items-center justify-between gap-2">
                          <label className="flex items-center gap-2 text-xs font-medium text-[#2B2B2B] cursor-pointer">
                            <input
                              type="checkbox"
                              checked={config.text.shadow}
                              onChange={(e) => updateText({ shadow: e.target.checked })}
                              className="accent-[#212635] rounded"
                            />
                            <span>Soft Drop Shadow</span>
                          </label>
                          {config.text.shadow && (
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={config.text.shadowColor}
                                onChange={(e) => updateText({ shadowColor: e.target.value })}
                                className="w-6 h-6 rounded border border-[#2B2B2B]/20 bg-transparent cursor-pointer"
                              />
                              <input
                                type="range"
                                min={1}
                                max={16}
                                value={config.text.shadowBlur}
                                onChange={(e) => updateText({ shadowBlur: Number(e.target.value) })}
                                className="w-16 accent-[#212635] h-1 bg-[#2B2B2B]/10 rounded cursor-pointer"
                              />
                            </div>
                          )}
                        </div>

                        {/* Badge Background */}
                        <div className="flex items-center justify-between gap-2">
                          <label className="flex items-center gap-2 text-xs font-medium text-[#2B2B2B] cursor-pointer">
                            <input
                              type="checkbox"
                              checked={config.text.background}
                              onChange={(e) => updateText({ background: e.target.checked })}
                              className="accent-[#212635] rounded"
                            />
                            <span>Rounded Badge Container</span>
                          </label>
                          {config.text.background && (
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={config.text.bgColor}
                                onChange={(e) => updateText({ bgColor: e.target.value })}
                                className="w-6 h-6 rounded border border-[#2B2B2B]/20 bg-transparent cursor-pointer"
                              />
                              <span className="text-[10px] text-[#2B2B2B]/70 font-mono">
                                {Math.round(config.text.bgOpacity * 100)}%
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Logo Watermark Settings */}
              {config.type === 'image' && (
                <div className="flex flex-col gap-4 border-t border-[#2B2B2B]/10 pt-4">
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoFileChange}
                    className="hidden"
                  />

                  {config.image.imageUrl ? (
                    <div className="flex items-center gap-3 p-3 bg-[#FAF8F2] rounded-ghibli-sm border border-[#2B2B2B]/15">
                      <div className="w-12 h-12 rounded-ghibli-sm bg-white border border-[#2B2B2B]/15 flex items-center justify-center overflow-hidden p-1 shadow-xs">
                        <img
                          src={config.image.imageUrl}
                          alt="Watermark Logo"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-[#2B2B2B] truncate m-0">
                          {config.image.imageName || 'Custom Logo'}
                        </p>
                        <p className="text-[11px] text-[#2B2B2B]/60 m-0 font-mono">
                          {config.image.imageWidth} x {config.image.imageHeight} px
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={onRemoveLogo}
                        className="p-1.5 rounded-ghibli-sm bg-white hover:bg-[#FFEBEE] text-[#C62828] border border-[#2B2B2B]/10 transition-colors cursor-pointer"
                        title="Remove logo"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      className="border-2 border-dashed border-[#2B2B2B]/20 hover:border-[#212635] bg-[#FAF8F2] hover:bg-white rounded-ghibli-sm p-5 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer text-[#2B2B2B] group shadow-xs"
                    >
                      <UploadCloud className="w-7 h-7 text-[#7CB342] group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-bold">Upload Stamp Logo (PNG / SVG)</span>
                      <span className="text-[10px] text-[#2B2B2B]/60">
                        Supports transparent alpha channel and vector graphics
                      </span>
                    </button>
                  )}

                  {/* Logo Scale, Opacity & Rotation */}
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-[#2B2B2B]">Logo Scale</span>
                        <span className="text-[#212635] font-mono text-[11px] font-bold">
                          {config.image.scalePercent}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min={5}
                        max={90}
                        value={config.image.scalePercent}
                        onChange={(e) => updateImage({ scalePercent: Number(e.target.value) })}
                        className="w-full accent-[#212635] h-1.5 bg-[#2B2B2B]/10 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-bold text-[#2B2B2B]">Opacity</span>
                          <span className="text-[#212635] font-mono text-[11px] font-bold">
                            {Math.round(config.image.opacity * 100)}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min={0.05}
                          max={1}
                          step={0.05}
                          value={config.image.opacity}
                          onChange={(e) => updateImage({ opacity: Number(e.target.value) })}
                          className="w-full accent-[#212635] h-1.5 bg-[#2B2B2B]/10 rounded-lg cursor-pointer"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-bold text-[#2B2B2B]">Rotation</span>
                          <span className="text-[#212635] font-mono text-[11px] font-bold">
                            {config.image.rotation}°
                          </span>
                        </div>
                        <input
                          type="range"
                          min={-180}
                          max={180}
                          step={5}
                          value={config.image.rotation}
                          onChange={(e) => updateImage({ rotation: Number(e.target.value) })}
                          className="w-full accent-[#212635] h-1.5 bg-[#2B2B2B]/10 rounded-lg cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Layout & Positioning */}
              <div className="border-t border-[#2B2B2B]/10 pt-4">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#2B2B2B]/70 block mb-2">
                  Position &amp; Pattern
                </label>

                {/* Position Mode Tabs */}
                <div className="grid grid-cols-3 gap-1.5 bg-[#FAF8F2] p-1.5 rounded-ghibli-sm border border-[#2B2B2B]/15 mb-3 text-xs">
                  <button
                    type="button"
                    onClick={() => onChangeConfig({ ...config, positionMode: 'grid' })}
                    className={`py-2 px-2 rounded-md font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      config.positionMode === 'grid'
                        ? 'bg-[#212635] text-white shadow-xs'
                        : 'text-[#2B2B2B]/70 hover:text-[#2B2B2B]'
                    }`}
                  >
                    <Grid3X3 className="w-3.5 h-3.5" />
                    <span>9-Grid</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onChangeConfig({ ...config, positionMode: 'custom' })}
                    className={`py-2 px-2 rounded-md font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      config.positionMode === 'custom'
                        ? 'bg-[#212635] text-white shadow-xs'
                        : 'text-[#2B2B2B]/70 hover:text-[#2B2B2B]'
                    }`}
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Custom Drag</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onChangeConfig({ ...config, positionMode: 'tile' })}
                    className={`py-2 px-2 rounded-md font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      config.positionMode === 'tile'
                        ? 'bg-[#212635] text-white shadow-xs'
                        : 'text-[#2B2B2B]/70 hover:text-[#2B2B2B]'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Tile Matrix</span>
                  </button>
                </div>

                {/* 9-Grid Position Selector */}
                {config.positionMode === 'grid' && (
                  <div className="grid grid-cols-3 gap-1.5 max-w-[220px] mx-auto p-2 bg-[#FAF8F2] rounded-ghibli-sm border border-[#2B2B2B]/15">
                    {GRID_POSITIONS.map((item) => (
                      <button
                        key={item.pos}
                        type="button"
                        onClick={() => onChangeConfig({ ...config, gridPosition: item.pos })}
                        className={`w-full h-9 rounded-md text-xs font-bold transition-all cursor-pointer ${
                          config.gridPosition === item.pos
                            ? 'bg-[#212635] text-white shadow-xs'
                            : 'bg-white text-[#2B2B2B]/70 hover:bg-[#FAF8F2] hover:text-[#2B2B2B] border border-[#2B2B2B]/10'
                        }`}
                        title={item.pos}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Custom Coordinates */}
                {config.positionMode === 'custom' && (
                  <div className="space-y-2 bg-[#FAF8F2] p-3.5 rounded-ghibli-sm border border-[#2B2B2B]/15 text-xs">
                    <p className="text-[11px] text-[#212635] m-0 font-semibold">
                      Drag directly on canvas preview or use fine-tune sliders:
                    </p>
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <span className="text-[#2B2B2B]/70 font-mono">
                          X: {config.customPosition.xPercent}%
                        </span>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={config.customPosition.xPercent}
                          onChange={(e) =>
                            onChangeConfig({
                              ...config,
                              customPosition: {
                                ...config.customPosition,
                                xPercent: Number(e.target.value),
                              },
                            })
                          }
                          className="w-full accent-[#212635] h-1.5 bg-[#2B2B2B]/10 rounded cursor-pointer mt-1"
                        />
                      </div>
                      <div>
                        <span className="text-[#2B2B2B]/70 font-mono">
                          Y: {config.customPosition.yPercent}%
                        </span>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={config.customPosition.yPercent}
                          onChange={(e) =>
                            onChangeConfig({
                              ...config,
                              customPosition: {
                                ...config.customPosition,
                                yPercent: Number(e.target.value),
                              },
                            })
                          }
                          className="w-full accent-[#212635] h-1.5 bg-[#2B2B2B]/10 rounded cursor-pointer mt-1"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Tiling Settings */}
                {config.positionMode === 'tile' && (
                  <div className="space-y-3 bg-[#FAF8F2] p-3.5 rounded-ghibli-sm border border-[#2B2B2B]/15 text-xs">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-[#2B2B2B]/70 font-semibold">Horizontal Spacing</span>
                        <input
                          type="range"
                          min={50}
                          max={400}
                          value={config.tileSettings.gapX}
                          onChange={(e) => updateTile({ gapX: Number(e.target.value) })}
                          className="w-full accent-[#212635] h-1.5 bg-[#2B2B2B]/10 rounded-lg cursor-pointer mt-1"
                        />
                      </div>
                      <div>
                        <span className="text-[#2B2B2B]/70 font-semibold">Vertical Spacing</span>
                        <input
                          type="range"
                          min={40}
                          max={300}
                          value={config.tileSettings.gapY}
                          onChange={(e) => updateTile({ gapY: Number(e.target.value) })}
                          className="w-full accent-[#212635] h-1.5 bg-[#2B2B2B]/10 rounded-lg cursor-pointer mt-1"
                        />
                      </div>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer text-[#2B2B2B] font-medium">
                      <input
                        type="checkbox"
                        checked={config.tileSettings.diagonalOffset}
                        onChange={(e) => updateTile({ diagonalOffset: e.target.checked })}
                        className="accent-[#212635] rounded"
                      />
                      <span>Diagonal / Staggered Repeat</span>
                    </label>
                  </div>
                )}
              </div>

              {/* PDF Watermark Scope */}
              {hasPdfInFiles && (
                <div className="border-t border-[#2B2B2B]/10 pt-4">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#2E7D32] flex items-center gap-1.5 mb-2">
                    <FileCheck className="w-4 h-4" />
                    <span>PDF Page Watermark Scope</span>
                  </label>
                  <div className="space-y-2 bg-[#FAF8F2] p-3.5 rounded-ghibli-sm border border-[#2B2B2B]/15 text-xs">
                    <select
                      value={exportSettings.pdfPageRangeMode}
                      onChange={(e) =>
                        onChangeExportSettings({
                          ...exportSettings,
                          pdfPageRangeMode: e.target.value as ExportSettings['pdfPageRangeMode'],
                        })
                      }
                      className="w-full px-3 py-2 bg-white border border-[#2B2B2B]/20 rounded-ghibli-sm text-xs text-[#2B2B2B] outline-none focus:border-[#212635] cursor-pointer"
                    >
                      <option value="all">Watermark All Pages</option>
                      <option value="first">First Page Only</option>
                      <option value="last">Last Page Only</option>
                      <option value="custom">Custom Page Range (e.g. 1-3, 5)</option>
                    </select>

                    {exportSettings.pdfPageRangeMode === 'custom' && (
                      <input
                        type="text"
                        placeholder="e.g. 1, 3-5, 8"
                        value={exportSettings.pdfCustomPages}
                        onChange={(e) =>
                          onChangeExportSettings({
                            ...exportSettings,
                            pdfCustomPages: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 bg-white border border-[#2B2B2B]/20 rounded-ghibli-sm text-xs text-[#2B2B2B] outline-none focus:border-[#212635] font-mono"
                      />
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
