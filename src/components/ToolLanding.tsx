import React, { useRef, useState, useCallback } from 'react';
import { ArrowLeft, UploadCloud, FileText, Image as ImageIcon } from 'lucide-react';
import type { ToolDefinition } from '../modules/featureRegistry';

interface ToolLandingProps {
  tool: ToolDefinition;
  onBackToTools: () => void;
  onFilesSelected: (files: File[]) => void;
  onLoadSample: (type: 'photo' | 'pdf') => void;
}

export const ToolLanding: React.FC<ToolLandingProps> = ({
  tool,
  onBackToTools,
  onFilesSelected,
  onLoadSample,
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
        onFilesSelected(Array.from(e.dataTransfer.files));
      }
    },
    [onFilesSelected]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  return (
    <div className="py-8 md:py-12 max-w-4xl mx-auto px-4 sm:px-6 space-y-8 text-center">
      {/* Back to All Tools (PdfBar style) */}
      <div className="flex items-center justify-start">
        <button
          onClick={onBackToTools}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#2B2B2B]/70 hover:text-[#212635] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All tools</span>
        </button>
      </div>

      {/* Tool Header */}
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#2B2B2B] m-0">
          {tool.title}
        </h1>
        <p className="text-sm sm:text-base text-[#2B2B2B]/75 max-w-lg mx-auto m-0 leading-relaxed">
          {tool.description}
        </p>
      </div>

      {/* PdfBar Style Large Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`ghibli-card p-10 sm:p-14 border-2 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center gap-3.5 group select-none ${
          isDragging
            ? 'border-[#7CB342] bg-[#F1F8E9] shadow-md'
            : 'border-dashed border-[#2B2B2B]/20 hover:border-[#212635]/50 bg-white shadow-xs hover:shadow-sm'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={tool.acceptedMimeTypes}
          onChange={handleFileInput}
          className="hidden"
        />

        <div
          className="w-16 h-16 rounded-ghibli-sm flex items-center justify-center border shadow-xs group-hover:scale-105 transition-transform"
          style={{
            backgroundColor: tool.lightBg,
            borderColor: `${tool.color}40`,
          }}
        >
          <UploadCloud className="w-8 h-8" style={{ color: tool.color }} />
        </div>

        <div className="space-y-1">
          <button
            type="button"
            className="px-6 py-2.5 rounded-ghibli-sm bg-[#212635] group-hover:bg-[#2B2B2B] text-white font-bold text-sm shadow-sm transition-all active:translate-y-[1px]"
          >
            {tool.filePrompt}
          </button>
          <p className="text-xs text-[#2B2B2B]/60 m-0 pt-1">
            or drop files here ({tool.acceptedExtensions.join(', ')})
          </p>
        </div>
      </div>

      {/* Dedicated Sample Loader Button (Right below dropzone, clean and obvious) */}
      <div className="pt-1 flex items-center justify-center gap-2">
        <span className="text-xs text-[#2B2B2B]/60">Don't have a file ready?</span>
        <button
          type="button"
          onClick={() => onLoadSample(tool.sampleType)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-ghibli-sm bg-white hover:bg-[#F5F3EC] text-[#212635] border border-[#2B2B2B]/20 text-xs font-semibold shadow-2xs transition-all active:translate-y-[1px] cursor-pointer"
        >
          {tool.sampleType === 'pdf' ? (
            <FileText className="w-3.5 h-3.5 text-[#7CB342]" />
          ) : (
            <ImageIcon className="w-3.5 h-3.5 text-[#0288D1]" />
          )}
          <span>{tool.samplePrompt}</span>
        </button>
      </div>
    </div>
  );
};
