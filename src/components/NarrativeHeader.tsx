import React from 'react';
import { Compass, ShieldCheck } from 'lucide-react';

interface NarrativeHeaderProps {
  onNavigateHome: () => void;
}

export const NarrativeHeader: React.FC<NarrativeHeaderProps> = ({ onNavigateHome }) => {
  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F2]/95 backdrop-blur-md border-b border-[#2B2B2B]/10 px-4 sm:px-6 lg:px-8 py-3 transition-all">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        {/* Brand identity (PdfBar style) */}
        <div
          onClick={onNavigateHome}
          className="flex items-center gap-2.5 cursor-pointer group"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onNavigateHome()}
          aria-label="Return to JagaDocs Home"
        >
          <div className="w-9 h-9 rounded-ghibli-sm bg-white border border-[#2B2B2B]/15 shadow-2xs flex items-center justify-center text-[#212635] group-hover:scale-105 transition-transform">
            <Compass className="w-5 h-5 text-[#7CB342]" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-[#2B2B2B]">
              JagaDocs
            </span>
          </div>
        </div>

        {/* Center/Right: Privacy Guarantee Pill */}
        <div className="flex items-center gap-2 text-xs text-[#2E7D32] bg-[#E8F5E9] border border-[#7CB342]/30 px-3.5 py-1.5 rounded-ghibli-sm font-medium shadow-2xs">
          <ShieldCheck className="w-4 h-4 text-[#7CB342]" />
          <span>100% Private in Browser • No Server Uploads</span>
        </div>
      </div>
    </header>
  );
};
