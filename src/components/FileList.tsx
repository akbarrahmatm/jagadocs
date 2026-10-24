import React from 'react';
import { FileText, Image as ImageIcon, X } from 'lucide-react';
import type { UploadedFile } from '../types/watermark';

interface FileListProps {
  files: UploadedFile[];
  activeFileId: string | null;
  onSelectFile: (id: string) => void;
  onRemoveFile: (id: string) => void;
}

export const FileList: React.FC<FileListProps> = ({
  files,
  activeFileId,
  onSelectFile,
  onRemoveFile,
}) => {
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#2B2B2B]/70 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#7CB342] animate-dot-pulse" />
          Document Queue ({files.length})
        </span>
        <span className="text-[11px] text-[#2B2B2B]/60 font-medium">
          Click thumbnail to preview
        </span>
      </div>

      <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 scrollbar-thin">
        {files.map((fileItem) => {
          const isActive = fileItem.id === activeFileId;
          const isPdf = fileItem.type === 'pdf';

          return (
            <div
              key={fileItem.id}
              onClick={() => onSelectFile(fileItem.id)}
              className={`group relative flex-shrink-0 w-36 rounded-ghibli-sm p-2.5 transition-all duration-200 cursor-pointer select-none border ${
                isActive
                  ? 'bg-white border-[#7CB342] shadow-[0_4px_16px_rgba(124,179,66,0.18)] ring-2 ring-[#7CB342]/30 -translate-y-0.5'
                  : 'bg-white/80 border-[#2B2B2B]/10 hover:border-[#2B2B2B]/25 hover:bg-white hover:-translate-y-0.5 shadow-sm'
              }`}
            >
              {/* Delete button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveFile(fileItem.id);
                }}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white hover:bg-[#FFEBEE] text-[#2B2B2B]/60 hover:text-[#C62828] flex items-center justify-center opacity-80 group-hover:opacity-100 transition-all shadow-sm cursor-pointer z-20 border border-[#2B2B2B]/15"
                title="Remove file"
              >
                <X className="w-3 h-3" />
              </button>

              {/* Preview Thumbnail */}
              <div className="w-full h-20 rounded-ghibli-sm overflow-hidden bg-[#FAF8F2] flex items-center justify-center relative mb-2 border border-[#2B2B2B]/10">
                {fileItem.previewUrl ? (
                  <img
                    src={fileItem.previewUrl}
                    alt={fileItem.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="flex items-center justify-center text-[#2B2B2B]/40">
                    {isPdf ? (
                      <FileText className="w-7 h-7 text-[#7CB342]" />
                    ) : (
                      <ImageIcon className="w-7 h-7 text-[#4FC3F7]" />
                    )}
                  </div>
                )}

                {/* Badge for PDF or image type */}
                <div className="absolute bottom-1 right-1">
                  {isPdf ? (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-[#7CB342] text-white shadow-xs">
                      PDF ({fileItem.pdfNumPages || 1}p)
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-[#212635] text-white shadow-xs">
                      IMG
                    </span>
                  )}
                </div>
              </div>

              {/* File Title and Info */}
              <div className="px-0.5">
                <p
                  className={`text-[11px] font-bold truncate m-0 ${
                    isActive ? 'text-[#2E7D32]' : 'text-[#2B2B2B]'
                  }`}
                  title={fileItem.name}
                >
                  {fileItem.name}
                </p>
                <div className="flex items-center justify-between text-[10px] text-[#2B2B2B]/60 mt-0.5">
                  <span>{formatFileSize(fileItem.size)}</span>
                  <span>
                    {fileItem.originalWidth}x{fileItem.originalHeight}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
