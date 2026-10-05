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
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
          Queue ({files.length})
        </span>
        <span className="text-[11px] text-slate-400 font-medium">
          Select to preview
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
              className={`group relative flex-shrink-0 w-36 rounded-2xl p-2.5 transition-all duration-300 cursor-pointer select-none ${
                isActive
                  ? 'bg-gradient-to-b from-indigo-900/40 to-slate-900/80 border-indigo-500/80 shadow-[0_10px_30px_rgba(99,102,241,0.25)] ring-2 ring-indigo-500/40 -translate-y-1'
                  : 'glass-card hover:border-white/20 hover:bg-slate-800/60 hover:-translate-y-0.5'
              }`}
            >
              {/* Delete button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveFile(fileItem.id);
                }}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-slate-800 hover:bg-rose-600 text-slate-400 hover:text-white flex items-center justify-center opacity-80 group-hover:opacity-100 transition-all shadow-md cursor-pointer z-20 border border-white/10"
                title="Remove file"
              >
                <X className="w-3 h-3" />
              </button>

              {/* Preview Thumbnail with Specular Border */}
              <div className="w-full h-22 rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center relative mb-2 border border-white/10 shadow-inner">
                {fileItem.previewUrl ? (
                  <img
                    src={fileItem.previewUrl}
                    alt={fileItem.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="flex items-center justify-center text-slate-500">
                    {isPdf ? <FileText className="w-8 h-8 text-rose-400" /> : <ImageIcon className="w-8 h-8 text-indigo-400" />}
                  </div>
                )}

                {/* Badge for PDF or image type */}
                <div className="absolute bottom-1.5 right-1.5">
                  {isPdf ? (
                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-rose-600/90 text-white shadow-md backdrop-blur-sm">
                      PDF ({fileItem.pdfNumPages || 1}p)
                    </span>
                  ) : (
                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-slate-900/90 text-indigo-300 border border-white/10 shadow-md">
                      IMG
                    </span>
                  )}
                </div>
              </div>

              {/* File Title and Info */}
              <div className="px-0.5">
                <p
                  className={`text-[11px] font-semibold truncate m-0 ${
                    isActive ? 'text-indigo-300' : 'text-slate-200 group-hover:text-white'
                  }`}
                  title={fileItem.name}
                >
                  {fileItem.name}
                </p>
                <p className="text-[10px] text-slate-400 m-0 mt-0.5 flex items-center justify-between font-mono">
                  <span>{formatFileSize(fileItem.size)}</span>
                  {fileItem.originalWidth > 0 && (
                    <span className="text-slate-400">
                      {fileItem.originalWidth}×{fileItem.originalHeight}
                    </span>
                  )}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
