import React, { useCallback, useRef, useState } from 'react';
import { UploadCloud, FileType as FileTypeIcon, Image as ImageIcon, Sparkles, FolderUp, FileText, ArrowUpRight } from 'lucide-react';

interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void;
  onLoadSample: (type: 'photo' | 'pdf') => void;
  isCompact?: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onFilesSelected,
  onLoadSample,
  isCompact = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const filesArray = Array.from(e.dataTransfer.files);
        onFilesSelected(filesArray);
      }
    },
    [onFilesSelected]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      onFilesSelected(filesArray);
      e.target.value = '';
    }
  };

  if (isCompact) {
    return (
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border border-dashed rounded-xl p-3 text-center transition-all cursor-pointer flex items-center justify-center gap-2 group ${
          isDragging
            ? 'border-indigo-400 bg-indigo-500/20 text-indigo-300 shadow-[0_0_20px_rgba(99,102,241,0.3)]'
            : 'border-white/10 hover:border-indigo-500/50 bg-slate-900/60 hover:bg-slate-800/80 text-slate-400 hover:text-white'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,application/pdf"
          onChange={handleFileInput}
          className="hidden"
        />
        <FolderUp className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
        <span className="text-xs font-semibold">Add Files</span>
      </div>
    );
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative w-full max-w-3xl mx-auto rounded-3xl border transition-all duration-300 p-6 sm:p-8 md:p-10 text-center group overflow-hidden ${
        isDragging
          ? 'border-indigo-400 bg-indigo-950/40 scale-[1.01] shadow-[0_20px_60px_rgba(99,102,241,0.3)] ring-2 ring-indigo-500/40'
          : 'glass-panel border-white/10 hover:border-indigo-500/40 shadow-[0_25px_60px_rgba(0,0,0,0.5)]'
      }`}
    >
      {/* Background Spatial Nebula Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-[100px] pointer-events-none group-hover:bg-purple-600/20 transition-all duration-700" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-pink-600/10 rounded-full blur-[80px] pointer-events-none" />

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,application/pdf"
        onChange={handleFileInput}
        className="hidden"
      />

      <div className="relative z-10 flex flex-col items-center justify-center max-w-2xl mx-auto space-y-4">
        {/* Floating Weightless Icon with Specular Rim */}
        <div className="relative animate-float-slow">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500/30 via-purple-500/30 to-pink-500/30 border border-white/20 flex items-center justify-center text-indigo-300 shadow-[0_15px_35px_rgba(99,102,241,0.25)] group-hover:scale-110 group-hover:shadow-[0_20px_45px_rgba(168,85,247,0.35)] transition-all duration-500 backdrop-blur-xl">
            <UploadCloud className="w-8 h-8 text-white" />
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-purple-500/30 border border-purple-400/50 flex items-center justify-center shadow-lg">
            <Sparkles className="w-3 h-3 text-purple-200 animate-pulse" />
          </div>
        </div>

        {/* Heading & Subtext */}
        <div className="space-y-1.5">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-transparent m-0">
            Drop your Photos or Multi-Page PDFs
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed m-0">
            Batch watermark hundreds of photos or entire PDF documents in seconds. 100% private, executed locally in browser memory.
          </p>
        </div>

        {/* Action Buttons: perfectly fits in 1 clean row */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 pt-1">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 text-white font-bold text-xs sm:text-sm shadow-[0_8px_25px_rgba(99,102,241,0.35)] hover:shadow-[0_12px_35px_rgba(168,85,247,0.45)] transition-all cursor-pointer active:scale-95"
          >
            <FolderUp className="w-4 h-4" />
            <span>Select Files from Device</span>
            <ArrowUpRight className="w-3.5 h-3.5 opacity-70" />
          </button>

          <button
            type="button"
            onClick={() => onLoadSample('photo')}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-white/10 hover:border-indigo-500/40 text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-md active:scale-95"
          >
            <ImageIcon className="w-4 h-4 text-emerald-400" />
            <span>Sample Photo</span>
          </button>

          <button
            type="button"
            onClick={() => onLoadSample('pdf')}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-white/10 hover:border-rose-500/40 text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-md active:scale-95"
          >
            <FileText className="w-4 h-4 text-rose-400" />
            <span>Sample PDF</span>
          </button>
        </div>

        {/* Feature Badges */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5 glass-pill px-3 py-1 rounded-full text-slate-300">
            <ImageIcon className="w-3 h-3 text-indigo-400" />
            PNG, JPG, WEBP, SVG
          </span>
          <span className="flex items-center gap-1.5 glass-pill px-3 py-1 rounded-full text-slate-300">
            <FileTypeIcon className="w-3 h-3 text-rose-400" />
            Multi-Page PDF Vector
          </span>
          <span className="glass-pill px-3 py-1 rounded-full text-indigo-300 font-semibold">
            ⚡ Instant WASM Engine
          </span>
        </div>
      </div>
    </div>
  );
};
