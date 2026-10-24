import React from 'react';
import { Compass, ShieldCheck, Feather } from 'lucide-react';

interface NarrativeHeaderProps {
  onNavigateHome?: () => void;
  onOpenStudio?: () => void;
  isStudioActive?: boolean;
}

export const NarrativeHeader: React.FC<NarrativeHeaderProps> = ({
  onNavigateHome,
  onOpenStudio,
  isStudioActive = false,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F2]/90 backdrop-blur-md border-b border-[#2B2B2B]/10 px-4 sm:px-6 lg:px-8 py-3.5 transition-all">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        {/* Brand identity */}
        <div
          onClick={onNavigateHome}
          className="flex items-center gap-3 cursor-pointer group"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onNavigateHome?.()}
          aria-label="Return to JagaDocs Home"
        >
          <div className="w-10 h-10 rounded-ghibli-sm bg-[#FAF8F2] border border-[#2B2B2B]/15 shadow-sm flex items-center justify-center text-[#212635] group-hover:scale-105 transition-transform">
            <Compass className="w-5 h-5 text-[#7CB342] group-hover:rotate-45 transition-transform duration-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-[#2B2B2B]">
                JagaDocs
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#7CB342]/15 text-[#558B2F] border border-[#7CB342]/25">
                Narrative Map
              </span>
            </div>
            <p className="text-xs text-[#2B2B2B]/70 m-0 hidden sm:block font-medium">
              Client-Side Document &amp; Photo Protection Studio
            </p>
          </div>
        </div>

        {/* Center: Privacy Guarantee Pill */}
        <div className="hidden md:flex items-center gap-2 text-xs text-[#2E7D32] bg-[#E8F5E9] border border-[#7CB342]/30 px-3.5 py-1.5 rounded-ghibli-sm font-medium shadow-sm">
          <ShieldCheck className="w-4 h-4 text-[#7CB342]" />
          <span>100% In-Memory Browser Execution • No Server Uploads</span>
        </div>

        {/* Right Navigation */}
        <div className="flex items-center gap-3">
          {isStudioActive ? (
            <button
              onClick={onNavigateHome}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-ghibli-sm bg-white hover:bg-[#F5F3EC] text-[#2B2B2B] border border-[#2B2B2B]/15 transition-all shadow-sm active:translate-y-[1px]"
            >
              <Feather className="w-3.5 h-3.5 text-[#7CB342]" />
              <span>Back to Map</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              {onOpenStudio && (
                <button
                  onClick={onOpenStudio}
                  className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-ghibli-sm bg-white hover:bg-[#F5F3EC] text-[#2B2B2B] border border-[#2B2B2B]/15 transition-all shadow-sm active:translate-y-[1px]"
                >
                  <span>Open Studio</span>
                </button>
              )}
              <a
                href="#feature-map"
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-ghibli-sm bg-[#212635] hover:bg-[#2B2B2B] text-[#FAF8F2] transition-all shadow-sm active:translate-y-[1px]"
              >
                <span>Explore Features</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
