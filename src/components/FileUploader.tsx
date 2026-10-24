import React, { useCallback, useRef, useState } from 'react';
import { UploadCloud, Image as ImageIcon, FolderUp, FileText } from 'lucide-react';

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
        className={`border-2 border-dashed rounded-ghibli-sm p-3 text-center transition-all cursor-pointer flex items-center justify-center gap-2 group ${
          isDragging
            ? 'border-[#7CB342] bg-[#F1F8E9] text-[#2E7D32]'
            : 'border-[#2B2B2B]/20 hover:border-[#212635]/60 bg-white hover:bg-[#FAF8F2] text-[#2B2B2B]'
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
        <FolderUp className="w-4 h-4 text-[#7CB342] group-hover:scale-110 transition-transform" />
        <span className="text-xs font-bold text-[#2B2B2B]">Add Files</span>
      </div>
    );
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative w-full max-w-3xl mx-auto rounded-ghibli-md border-2 transition-all duration-200 p-8 sm:p-10 text-center group overflow-hidden bg-white ${
        isDragging
          ? 'border-[#7CB342] bg-[#F1F8E9] ring-4 ring-[#7CB342]/20'
          : 'border-dashed border-[#2B2B2B]/20 hover:border-[#212635]/50 shadow-sm'
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

      <div className="relative z-10 flex flex-col items-center justify-center max-w-xl mx-auto space-y-4">
        {/* Warm Nature-Inspired Icon Badge */}
        <div className="w-14 h-14 rounded-ghibli-sm bg-[#FAF8F2] border border-[#2B2B2B]/15 flex items-center justify-center text-[#212635] shadow-sm group-hover:scale-105 transition-transform">
          <UploadCloud className="w-7 h-7 text-[#7CB342]" />
        </div>

        {/* Heading & Subtext */}
        <div className="space-y-1.5">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#2B2B2B] m-0">
            Drop Photos or Multi-Page PDFs Here
          </h2>
          <p className="text-xs sm:text-sm text-[#2B2B2B]/70 max-w-md mx-auto leading-relaxed m-0">
            Private, client-side batch processing with zero internet transmissions. Works with both
            multi-page PDF documents and high-resolution images.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 pt-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-ghibli-sm bg-[#212635] hover:bg-[#2B2B2B] text-[#FAF8F2] font-semibold text-xs sm:text-sm shadow-sm transition-all cursor-pointer active:translate-y-[1px]"
          >
            <FolderUp className="w-4 h-4 text-[#7CB342]" />
            <span>Select Files from Device</span>
          </button>

          <button
            type="button"
            onClick={() => onLoadSample('pdf')}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-ghibli-sm bg-white hover:bg-[#F1F8E9] text-[#2B2B2B] border border-[#2B2B2B]/15 text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-sm active:translate-y-[1px]"
          >
            <FileText className="w-4 h-4 text-[#7CB342]" />
            <span>Sample PDF Document</span>
          </button>

          <button
            type="button"
            onClick={() => onLoadSample('photo')}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-ghibli-sm bg-white hover:bg-[#E1F5FE] text-[#2B2B2B] border border-[#2B2B2B]/15 text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-sm active:translate-y-[1px]"
          >
            <ImageIcon className="w-4 h-4 text-[#0288D1]" />
            <span>Sample Landscape Photo</span>
          </button>
        </div>

        {/* Format Badges */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-[11px] text-[#2B2B2B]/70">
          <span className="px-2.5 py-1 rounded-full bg-[#FAF8F2] border border-[#2B2B2B]/10 font-medium">
            PNG, JPG, WEBP, SVG
          </span>
          <span className="px-2.5 py-1 rounded-full bg-[#FAF8F2] border border-[#2B2B2B]/10 font-medium">
            Multi-Page PDF Vector
          </span>
          <span className="px-2.5 py-1 rounded-full bg-[#E8F5E9] text-[#2E7D32] border border-[#7CB342]/30 font-semibold">
            100% In-Memory Browser Execution
          </span>
        </div>
      </div>
    </div>
  );
};
