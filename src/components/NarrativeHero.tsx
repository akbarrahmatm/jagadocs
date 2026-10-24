import React from 'react';
import { Compass, MapPin, ArrowDown, FileText, Image as ImageIcon, Crop } from 'lucide-react';

interface NarrativeHeroProps {
  onQuickStart: (featureId: 'pdf-watermark' | 'image-watermark' | 'doc-crop') => void;
}

export const NarrativeHero: React.FC<NarrativeHeroProps> = ({ onQuickStart }) => {
  return (
    <section className="relative pt-6 pb-12 md:py-16 overflow-hidden">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column: Narrative Copy */}
        <div className="lg:col-span-7 space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-ghibli-sm bg-[#FAF8F2] border border-[#2B2B2B]/15 text-xs font-semibold text-[#2B2B2B]/80 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#7CB342] animate-dot-pulse" />
            <span>Document Protection Wayfinding Map</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#2B2B2B] leading-[1.15] m-0">
            Caring for Cherished Documents and Imagery with Whimsical Warmth.
          </h1>

          <p className="text-base sm:text-lg text-[#2B2B2B]/80 leading-relaxed max-w-[65ch] m-0">
            Every document and photograph tells an important story. JagaDocs brings you a tranquil,
            artisan-crafted workspace to apply watermarks, trim scanner edges, and secure your files
            entirely inside local browser memory. No server uploads, no privacy compromises.
          </p>

          {/* Action Waypoints */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <a
              href="#feature-map"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-ghibli-sm bg-[#212635] hover:bg-[#2B2B2B] text-[#FAF8F2] font-semibold text-sm shadow-sm transition-all active:translate-y-[1px]"
            >
              <Compass className="w-4 h-4 text-[#7CB342]" />
              <span>Explore Feature Map</span>
              <ArrowDown className="w-3.5 h-3.5 opacity-70" />
            </a>

            <button
              onClick={() => onQuickStart('pdf-watermark')}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-ghibli-sm bg-white hover:bg-[#F5F3EC] text-[#2B2B2B] border border-[#2B2B2B]/20 font-semibold text-sm shadow-sm transition-all active:translate-y-[1px]"
            >
              <FileText className="w-4 h-4 text-[#7CB342]" />
              <span>Launch PDF Studio</span>
            </button>
          </div>

          {/* Quick Landmark Badges */}
          <div className="pt-4 flex flex-wrap items-center gap-3 text-xs text-[#2B2B2B]/70">
            <span className="font-semibold text-[#2B2B2B]">Main Waypoints:</span>
            <button
              onClick={() => onQuickStart('pdf-watermark')}
              className="hover:text-[#212635] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#7CB342]" />
              PDF Pavilion
            </button>
            <span>•</span>
            <button
              onClick={() => onQuickStart('image-watermark')}
              className="hover:text-[#212635] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#4FC3F7]" />
              Photo Garden
            </button>
            <span>•</span>
            <button
              onClick={() => onQuickStart('doc-crop')}
              className="hover:text-[#212635] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#F48FB1]" />
              Crop Atelier
            </button>
          </div>
        </div>

        {/* Right Column: Narrative Map Illustration Vignette */}
        <div className="lg:col-span-5 relative">
          <div className="ghibli-card-elevated p-6 sm:p-8 bg-white/90 relative overflow-hidden text-left border border-[#2B2B2B]/10">
            {/* Soft decorative background wash */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#4FC3F7]/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#7CB342]/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 space-y-5">
              <div className="flex items-center justify-between border-b border-[#2B2B2B]/10 pb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#7CB342]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#2B2B2B]">
                    Wayfinding Map
                  </span>
                </div>
                <span className="text-[11px] font-mono font-medium text-[#2B2B2B]/60">
                  EST. 100% CLIENT-SIDE
                </span>
              </div>

              {/* Station Waypoint 1 */}
              <div
                onClick={() => onQuickStart('pdf-watermark')}
                className="p-3.5 rounded-ghibli-sm bg-[#FAF8F2] hover:bg-[#F1F8E9] border border-[#2B2B2B]/10 transition-all cursor-pointer group flex items-start gap-3.5 shadow-sm active:translate-y-[1px]"
              >
                <div className="w-9 h-9 rounded-ghibli-sm bg-white border border-[#7CB342]/30 flex items-center justify-center text-[#7CB342] shrink-0 group-hover:scale-110 transition-transform">
                  <FileText className="w-4.5 h-4.5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-[#2B2B2B] m-0 group-hover:text-[#558B2F]">
                      PDF Document Pavilion
                    </h2>
                    <span className="text-[10px] font-semibold text-[#558B2F] bg-[#7CB342]/15 px-2 py-0.5 rounded-full">
                      Vector
                    </span>
                  </div>
                  <p className="text-xs text-[#2B2B2B]/70 mt-1 m-0">
                    Multi-page watermarks with dynamic {`{page}`} &amp; {`{totalPages}`} numbering tokens.
                  </p>
                </div>
              </div>

              {/* Station Waypoint 2 */}
              <div
                onClick={() => onQuickStart('image-watermark')}
                className="p-3.5 rounded-ghibli-sm bg-[#FAF8F2] hover:bg-[#E1F5FE] border border-[#2B2B2B]/10 transition-all cursor-pointer group flex items-start gap-3.5 shadow-sm active:translate-y-[1px]"
              >
                <div className="w-9 h-9 rounded-ghibli-sm bg-white border border-[#4FC3F7]/30 flex items-center justify-center text-[#0288D1] shrink-0 group-hover:scale-110 transition-transform">
                  <ImageIcon className="w-4.5 h-4.5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-[#2B2B2B] m-0 group-hover:text-[#0288D1]">
                      Photo &amp; Imagery Garden
                    </h2>
                    <span className="text-[10px] font-semibold text-[#0288D1] bg-[#4FC3F7]/15 px-2 py-0.5 rounded-full">
                      Batch ZIP
                    </span>
                  </div>
                  <p className="text-xs text-[#2B2B2B]/70 mt-1 m-0">
                    Batch stamp hundreds of photos in parallel, apply security tiles, and download ZIPs.
                  </p>
                </div>
              </div>

              {/* Station Waypoint 3 */}
              <div
                onClick={() => onQuickStart('doc-crop')}
                className="p-3.5 rounded-ghibli-sm bg-[#FAF8F2] hover:bg-[#FCE4EC] border border-[#2B2B2B]/10 transition-all cursor-pointer group flex items-start gap-3.5 shadow-sm active:translate-y-[1px]"
              >
                <div className="w-9 h-9 rounded-ghibli-sm bg-white border border-[#F48FB1]/40 flex items-center justify-center text-[#C2185B] shrink-0 group-hover:scale-110 transition-transform">
                  <Crop className="w-4.5 h-4.5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-[#2B2B2B] m-0 group-hover:text-[#C2185B]">
                      Margin &amp; Crop Atelier
                    </h2>
                    <span className="text-[10px] font-semibold text-[#C2185B] bg-[#F48FB1]/20 px-2 py-0.5 rounded-full">
                      Precision
                    </span>
                  </div>
                  <p className="text-xs text-[#2B2B2B]/70 mt-1 m-0">
                    Interactive 8-handle crop frame, pixel white border auto-detection, and 3 mm scanner trim.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
