import React, { useRef, useState } from 'react';
import {
  Type,
  Image as ImageIcon,
  Grid3X3,
  Sliders,
  Sparkles,
  Layers,
  FileCheck,
  Bold,
  Italic,
  Underline,
  UploadCloud,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type {
  GridPosition,
  WatermarkConfig,
  ExportSettings,
} from '../types/watermark';

interface WatermarkControlsProps {
  config: WatermarkConfig;
  onChangeConfig: (newConfig: WatermarkConfig) => void;
  exportSettings: ExportSettings;
  onChangeExportSettings: (newSettings: ExportSettings) => void;
  onLogoUpload: (file: File) => void;
  onRemoveLogo: () => void;
  hasPdfInFiles: boolean;
}

const FONT_FAMILIES = [
  { label: 'Helvetica / Arial (Clean Sans)', value: 'Helvetica, Arial, sans-serif' },
  { label: 'Times New Roman (Classic Serif)', value: '"Times New Roman", Times, serif' },
  { label: 'Georgia (Elegant Serif)', value: 'Georgia, serif' },
  { label: 'Courier New (Monospace / Code)', value: '"Courier New", Courier, monospace' },
  { label: 'Impact (Bold Header)', value: 'Impact, "Arial Black", sans-serif' },
  { label: 'Trebuchet MS (Modern Sans)', value: '"Trebuchet MS", sans-serif' },
  { label: 'Verdana (Readable)', value: 'Verdana, Geneva, sans-serif' },
];

const PRESET_COLORS = [
  '#dc2626',
  '#ef4444',
  '#f97316',
  '#f59e0b',
  '#10b981',
  '#06b6d4',
  '#3b82f6',
  '#6366f1',
  '#a855f7',
  '#ec4899',
  '#ffffff',
  '#000000',
];

export const WatermarkControls: React.FC<WatermarkControlsProps> = ({
  config,
  onChangeConfig,
  exportSettings,
  onChangeExportSettings,
  onLogoUpload,
  onRemoveLogo,
  hasPdfInFiles,
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

  const insertToken = (token: string) => {
    updateText({
      text: `${config.text.text} ${token}`.trim(),
    });
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

  return (
    <div className="flex flex-col gap-5 p-5 md:p-6 glass-panel rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.5)] text-slate-200">
      {/* 1. Watermark Type Switcher */}
      <div>
        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2.5">
          Watermark Type
        </label>
        <div className="grid grid-cols-2 gap-2 bg-slate-950/80 p-1.5 rounded-2xl border border-white/10 shadow-inner">
          <button
            type="button"
            onClick={() => onChangeConfig({ ...config, type: 'text' })}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              config.type === 'text'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-[0_4px_15px_rgba(99,102,241,0.4)]'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Type className="w-4 h-4" />
            <span>Text Watermark</span>
          </button>

          <button
            type="button"
            onClick={() => onChangeConfig({ ...config, type: 'image' })}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              config.type === 'image'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-[0_4px_15px_rgba(99,102,241,0.4)]'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Logo / Stamp</span>
          </button>
        </div>
      </div>

      {/* 2. Text Watermark Settings */}
      {config.type === 'text' && (
        <div className="flex flex-col gap-4 border-t border-white/[0.08] pt-4">
          {/* Text Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-300">
                Watermark Text
              </label>
              <span className="text-[11px] text-slate-400">Multi-line support</span>
            </div>
            <textarea
              value={config.text.text}
              onChange={(e) => updateText({ text: e.target.value })}
              rows={2}
              placeholder="e.g. CONFIDENTIAL, © 2026 Studio"
              className="w-full px-3.5 py-2.5 bg-slate-950/90 border border-white/10 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-2xl text-sm text-white placeholder-slate-500 outline-none transition-all resize-y shadow-inner font-medium"
            />

            {/* Dynamic Tokens */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Tokens:</span>
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
                  className="text-[10px] px-2.5 py-1 rounded-lg glass-pill hover:bg-indigo-600/30 text-indigo-300 hover:text-white border border-white/10 hover:border-indigo-500/40 transition-all cursor-pointer active:scale-95 font-medium"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Font Family & Styles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Font Family
              </label>
              <select
                value={config.text.fontFamily}
                onChange={(e) => updateText({ fontFamily: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-indigo-500 cursor-pointer"
              >
                {FONT_FAMILIES.map((font) => (
                  <option key={font.value} value={font.value} className="bg-slate-900">
                    {font.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Bold, Italic, Underline */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Text Style
              </label>
              <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={() => updateText({ bold: !config.text.bold })}
                  className={`flex-1 py-1.5 flex items-center justify-center rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    config.text.bold
                      ? 'bg-indigo-600 text-white shadow-[0_0_10px_rgba(99,102,241,0.5)]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Bold"
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => updateText({ italic: !config.text.italic })}
                  className={`flex-1 py-1.5 flex items-center justify-center rounded-lg text-xs italic transition-all cursor-pointer ${
                    config.text.italic
                      ? 'bg-indigo-600 text-white shadow-[0_0_10px_rgba(99,102,241,0.5)]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Italic"
                >
                  <Italic className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => updateText({ underline: !config.text.underline })}
                  className={`flex-1 py-1.5 flex items-center justify-center rounded-lg text-xs underline transition-all cursor-pointer ${
                    config.text.underline
                      ? 'bg-indigo-600 text-white shadow-[0_0_10px_rgba(99,102,241,0.5)]'
                      : 'text-slate-400 hover:text-white'
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
                <span className="font-bold text-slate-300">Font Scale</span>
                <span className="text-indigo-400 font-mono text-[11px] font-bold">
                  {config.text.fontSizePercent}%
                </span>
              </div>
              <input
                type="range"
                min={2}
                max={35}
                value={config.text.fontSizePercent}
                onChange={(e) => updateText({ fontSizePercent: Number(e.target.value) })}
                className="w-full accent-indigo-500 h-1.5 bg-slate-950 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-slate-300">Opacity</span>
                <span className="text-indigo-400 font-mono text-[11px] font-bold">
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
                className="w-full accent-indigo-500 h-1.5 bg-slate-950 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Color & Rotation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Color Palette */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                Watermark Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={config.text.color}
                  onChange={(e) => updateText({ color: e.target.value })}
                  className="w-8 h-8 rounded-xl border border-white/20 bg-transparent cursor-pointer"
                />
                <div className="flex flex-wrap gap-1 flex-1">
                  {PRESET_COLORS.slice(0, 8).map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => updateText({ color })}
                      className="w-5 h-5 rounded-full border border-white/20 transition-transform hover:scale-125 cursor-pointer shadow-sm"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Rotation Slider */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-slate-300">Angle / Tilt</span>
                <span className="text-indigo-400 font-mono text-[11px] font-bold">
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
                className="w-full accent-indigo-500 h-1.5 bg-slate-950 rounded-lg cursor-pointer"
              />
              <div className="flex items-center justify-between mt-1">
                {[-45, 0, 45, 90].map((deg) => (
                  <button
                    key={deg}
                    type="button"
                    onClick={() => updateText({ rotation: deg })}
                    className="text-[10px] font-semibold text-slate-400 hover:text-indigo-300 cursor-pointer"
                  >
                    {deg}°
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Advanced Effects Accordion */}
          <div className="border border-white/10 rounded-2xl overflow-hidden glass-card">
            <button
              type="button"
              onClick={() => setShowAdvancedEffects(!showAdvancedEffects)}
              className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-bold text-slate-300 hover:bg-white/5 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Outline, Shadows &amp; Badges</span>
              </div>
              {showAdvancedEffects ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {showAdvancedEffects && (
              <div className="p-3.5 border-t border-white/10 space-y-3">
                {/* Stroke Outline */}
                <div className="flex items-center justify-between gap-2">
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.text.stroke}
                      onChange={(e) => updateText({ stroke: e.target.checked })}
                      className="accent-indigo-500 rounded"
                    />
                    <span>Stroke / Outline</span>
                  </label>
                  {config.text.stroke && (
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={config.text.strokeColor}
                        onChange={(e) => updateText({ strokeColor: e.target.value })}
                        className="w-6 h-6 rounded border border-white/20 bg-transparent cursor-pointer"
                      />
                      <input
                        type="range"
                        min={1}
                        max={8}
                        value={config.text.strokeWidth}
                        onChange={(e) => updateText({ strokeWidth: Number(e.target.value) })}
                        className="w-16 accent-indigo-500 h-1 bg-slate-950 rounded cursor-pointer"
                      />
                    </div>
                  )}
                </div>

                {/* Drop Shadow */}
                <div className="flex items-center justify-between gap-2">
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.text.shadow}
                      onChange={(e) => updateText({ shadow: e.target.checked })}
                      className="accent-indigo-500 rounded"
                    />
                    <span>Drop Shadow</span>
                  </label>
                  {config.text.shadow && (
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={config.text.shadowColor}
                        onChange={(e) => updateText({ shadowColor: e.target.value })}
                        className="w-6 h-6 rounded border border-white/20 bg-transparent cursor-pointer"
                      />
                      <input
                        type="range"
                        min={1}
                        max={16}
                        value={config.text.shadowBlur}
                        onChange={(e) => updateText({ shadowBlur: Number(e.target.value) })}
                        className="w-16 accent-indigo-500 h-1 bg-slate-950 rounded cursor-pointer"
                      />
                    </div>
                  )}
                </div>

                {/* Badge Background */}
                <div className="flex items-center justify-between gap-2">
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.text.background}
                      onChange={(e) => updateText({ background: e.target.checked })}
                      className="accent-indigo-500 rounded"
                    />
                    <span>Badge Background</span>
                  </label>
                  {config.text.background && (
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={config.text.bgColor}
                        onChange={(e) => updateText({ bgColor: e.target.value })}
                        className="w-6 h-6 rounded border border-white/20 bg-transparent cursor-pointer"
                      />
                      <span className="text-[10px] text-slate-400 font-mono">
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

      {/* 3. Image / Logo Watermark Settings */}
      {config.type === 'image' && (
        <div className="flex flex-col gap-4 border-t border-white/[0.08] pt-4">
          <input
            ref={logoInputRef}
            type="file"
            accept="image/*"
            onChange={handleLogoFileChange}
            className="hidden"
          />

          {config.image.imageUrl ? (
            <div className="flex items-center gap-3 p-3 bg-slate-950/80 rounded-2xl border border-white/10 shadow-inner">
              <div className="w-12 h-12 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center overflow-hidden p-1 shadow-md">
                <img
                  src={config.image.imageUrl}
                  alt="Watermark Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate m-0">
                  {config.image.imageName || 'Custom Logo'}
                </p>
                <p className="text-[11px] text-slate-400 m-0 font-mono">
                  {config.image.imageWidth} × {config.image.imageHeight} px
                </p>
              </div>
              <button
                type="button"
                onClick={onRemoveLogo}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-600/30 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                title="Remove logo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => logoInputRef.current?.click()}
              className="border border-dashed border-white/20 hover:border-indigo-500 bg-slate-950/60 hover:bg-slate-900/80 rounded-2xl p-5 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer text-slate-300 hover:text-white group"
            >
              <UploadCloud className="w-7 h-7 text-indigo-400 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold">Upload Stamp Logo (PNG / SVG)</span>
              <span className="text-[10px] text-slate-400">Supports transparency and high-res vector graphics</span>
            </button>
          )}

          {/* Logo Scale, Opacity & Rotation */}
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-slate-300">Logo Scale</span>
                <span className="text-indigo-400 font-mono text-[11px] font-bold">
                  {config.image.scalePercent}%
                </span>
              </div>
              <input
                type="range"
                min={5}
                max={90}
                value={config.image.scalePercent}
                onChange={(e) => updateImage({ scalePercent: Number(e.target.value) })}
                className="w-full accent-indigo-500 h-1.5 bg-slate-950 rounded-lg cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-slate-300">Opacity</span>
                  <span className="text-indigo-400 font-mono text-[11px] font-bold">
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
                  className="w-full accent-indigo-500 h-1.5 bg-slate-950 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-slate-300">Rotation</span>
                  <span className="text-indigo-400 font-mono text-[11px] font-bold">
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
                  className="w-full accent-indigo-500 h-1.5 bg-slate-950 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Layout & Positioning */}
      <div className="border-t border-white/[0.08] pt-4">
        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2.5">
          Position &amp; Pattern
        </label>

        {/* Position Mode Tabs */}
        <div className="grid grid-cols-3 gap-1.5 bg-slate-950/80 p-1.5 rounded-2xl border border-white/10 mb-3 text-xs shadow-inner">
          <button
            type="button"
            onClick={() => onChangeConfig({ ...config, positionMode: 'grid' })}
            className={`py-2 px-2 rounded-xl font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              config.positionMode === 'grid'
                ? 'bg-slate-800 text-indigo-300 shadow-md border border-white/10'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Grid3X3 className="w-3.5 h-3.5" />
            <span>9-Grid</span>
          </button>
          <button
            type="button"
            onClick={() => onChangeConfig({ ...config, positionMode: 'custom' })}
            className={`py-2 px-2 rounded-xl font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              config.positionMode === 'custom'
                ? 'bg-slate-800 text-indigo-300 shadow-md border border-white/10'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Custom Drag</span>
          </button>
          <button
            type="button"
            onClick={() => onChangeConfig({ ...config, positionMode: 'tile' })}
            className={`py-2 px-2 rounded-xl font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              config.positionMode === 'tile'
                ? 'bg-slate-800 text-indigo-300 shadow-md border border-white/10'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Tile Matrix</span>
          </button>
        </div>

        {/* 9-Grid Position Selector */}
        {config.positionMode === 'grid' && (
          <div className="grid grid-cols-3 gap-1.5 max-w-[220px] mx-auto p-2 bg-slate-950/90 rounded-2xl border border-white/10 shadow-inner">
            {GRID_POSITIONS.map((item) => (
              <button
                key={item.pos}
                type="button"
                onClick={() => onChangeConfig({ ...config, gridPosition: item.pos })}
                className={`w-full h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  config.gridPosition === item.pos
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-[0_0_12px_rgba(99,102,241,0.5)]'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-white/5'
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
          <div className="space-y-2 bg-slate-950/90 p-3.5 rounded-2xl border border-white/10 text-xs">
            <p className="text-[11px] text-indigo-300 m-0 font-semibold">
              💡 Drag directly on the canvas preview or use fine-tune sliders:
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <span className="text-slate-400 font-mono">X: {config.customPosition.xPercent}%</span>
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
                  className="w-full accent-indigo-500 h-1 bg-slate-900 rounded cursor-pointer mt-1"
                />
              </div>
              <div>
                <span className="text-slate-400 font-mono">Y: {config.customPosition.yPercent}%</span>
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
                  className="w-full accent-indigo-500 h-1 bg-slate-900 rounded cursor-pointer mt-1"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tiling Settings */}
        {config.positionMode === 'tile' && (
          <div className="space-y-3 bg-slate-950/90 p-3.5 rounded-2xl border border-white/10 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-400 font-semibold">Horizontal Spacing</span>
                <input
                  type="range"
                  min={50}
                  max={400}
                  value={config.tileSettings.gapX}
                  onChange={(e) => updateTile({ gapX: Number(e.target.value) })}
                  className="w-full accent-indigo-500 h-1.5 bg-slate-900 rounded-lg cursor-pointer mt-1"
                />
              </div>
              <div>
                <span className="text-slate-400 font-semibold">Vertical Spacing</span>
                <input
                  type="range"
                  min={40}
                  max={300}
                  value={config.tileSettings.gapY}
                  onChange={(e) => updateTile({ gapY: Number(e.target.value) })}
                  className="w-full accent-indigo-500 h-1.5 bg-slate-900 rounded-lg cursor-pointer mt-1"
                />
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer text-slate-300 font-medium">
              <input
                type="checkbox"
                checked={config.tileSettings.diagonalOffset}
                onChange={(e) => updateTile({ diagonalOffset: e.target.checked })}
                className="accent-indigo-500 rounded"
              />
              <span>Diagonal / Staggered Repeat</span>
            </label>
          </div>
        )}
      </div>

      {/* 5. PDF Page Selection */}
      {hasPdfInFiles && (
        <div className="border-t border-white/[0.08] pt-4">
          <label className="text-[11px] font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5 mb-2.5">
            <FileCheck className="w-4 h-4" />
            <span>PDF Watermark Scope</span>
          </label>
          <div className="space-y-2 bg-slate-950/90 p-3.5 rounded-2xl border border-white/10 text-xs">
            <select
              value={exportSettings.pdfPageRangeMode}
              onChange={(e) =>
                onChangeExportSettings({
                  ...exportSettings,
                  pdfPageRangeMode: e.target.value as ExportSettings['pdfPageRangeMode'],
                })
              }
              className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-indigo-500 cursor-pointer"
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
                className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-indigo-500 font-mono"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
