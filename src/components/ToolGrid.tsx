import React from 'react';
import {
  FileText,
  Image as ImageIcon,
  Crop,
  FileImage,
  Files,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { TOOLS, type ToolDefinition } from '../modules/featureRegistry';

interface ToolGridProps {
  onSelectTool: (tool: ToolDefinition) => void;
}

export const ToolGrid: React.FC<ToolGridProps> = ({ onSelectTool }) => {
  const renderIcon = (iconName: ToolDefinition['icon'], color: string) => {
    switch (iconName) {
      case 'FileText':
        return <FileText className="w-6 h-6" style={{ color }} />;
      case 'Image':
        return <ImageIcon className="w-6 h-6" style={{ color }} />;
      case 'Crop':
        return <Crop className="w-6 h-6" style={{ color }} />;
      case 'FileImage':
        return <FileImage className="w-6 h-6" style={{ color }} />;
      case 'Files':
        return <Files className="w-6 h-6" style={{ color }} />;
    }
  };

  return (
    <div className="py-8 md:py-12 space-y-10 max-w-6xl mx-auto px-4 sm:px-6">
      {/* Banner / Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#2B2B2B] m-0">
          Every document and photo tool you need
        </h1>
        <p className="text-base sm:text-lg text-[#2B2B2B]/75 leading-relaxed m-0">
          Free and private. Your files are processed locally in your browser memory and never uploaded.
        </p>
      </div>

      {/* Tools Grid (PdfBar layout) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {TOOLS.map((tool) => (
          <a
            key={tool.id}
            href={tool.route}
            onClick={(e) => {
              e.preventDefault();
              onSelectTool(tool);
            }}
            className="group ghibli-card p-5 sm:p-6 bg-white hover:bg-white text-left flex flex-col justify-between transition-all duration-200 cursor-pointer border border-[#2B2B2B]/10 hover:border-[#212635]/30 shadow-xs hover:shadow-md active:translate-y-[1px]"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div
                  className="w-12 h-12 rounded-ghibli-sm flex items-center justify-center border shadow-2xs group-hover:scale-105 transition-transform"
                  style={{
                    backgroundColor: tool.lightBg,
                    borderColor: `${tool.color}35`,
                  }}
                >
                  {renderIcon(tool.icon, tool.color)}
                </div>
                {tool.badge && (
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border shadow-2xs"
                    style={{
                      backgroundColor: tool.lightBg,
                      color: '#212635',
                      borderColor: `${tool.color}40`,
                    }}
                  >
                    {tool.badge}
                  </span>
                )}
              </div>

              <div>
                <strong className="text-base sm:text-lg font-bold text-[#2B2B2B] group-hover:text-[#212635] block">
                  {tool.title}
                </strong>
                <p className="text-xs sm:text-sm text-[#2B2B2B]/70 mt-1 m-0 leading-relaxed">
                  {tool.description}
                </p>
              </div>
            </div>

            <div className="pt-4 flex items-center gap-1 text-xs font-semibold text-[#212635] opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Open tool</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </a>
        ))}
      </div>

      {/* Bottom Privacy Notice (like PdfBar) */}
      <div className="pt-6 border-t border-[#2B2B2B]/10 flex flex-wrap items-center justify-center gap-2 text-xs text-[#2B2B2B]/60">
        <ShieldCheck className="w-4 h-4 text-[#7CB342]" />
        <span>Files never leave your computer • 100% client-side WebAssembly &amp; Canvas</span>
      </div>
    </div>
  );
};
