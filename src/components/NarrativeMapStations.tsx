import React, { useRef } from 'react';
import {
  FileText,
  Image as ImageIcon,
  Crop,
  CheckCircle2,
  ArrowRight,
  MapPin,
  FolderUp,
} from 'lucide-react';
import { FEATURE_REGISTRY, type FeatureModule } from '../modules/featureRegistry';

interface NarrativeMapStationsProps {
  onLoadFeatureSample: (featureId: FeatureModule['id'], type: 'pdf' | 'photo') => void;
  onFilesSelectedForFeature: (files: File[], featureId: FeatureModule['id']) => void;
}

export const NarrativeMapStations: React.FC<NarrativeMapStationsProps> = ({
  onLoadFeatureSample,
  onFilesSelectedForFeature,
}) => {
  const fileInputRefs = {
    'pdf-watermark': useRef<HTMLInputElement>(null),
    'image-watermark': useRef<HTMLInputElement>(null),
    'doc-crop': useRef<HTMLInputElement>(null),
  };

  const getIcon = (name: FeatureModule['iconName'], colorClass: string) => {
    switch (name) {
      case 'FileText':
        return <FileText className={`w-5 h-5 ${colorClass}`} />;
      case 'Image':
        return <ImageIcon className={`w-5 h-5 ${colorClass}`} />;
      case 'Crop':
        return <Crop className={`w-5 h-5 ${colorClass}`} />;
    }
  };

  return (
    <section id="feature-map" className="py-12 md:py-16 space-y-16 md:space-y-24">
      {/* Section Waypoint Heading */}
      <div className="max-w-2xl mx-auto text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-ghibli-sm bg-[#FAF8F2] border border-[#2B2B2B]/15 text-xs font-semibold text-[#2B2B2B]/80 shadow-sm">
          <MapPin className="w-3.5 h-3.5 text-[#7CB342]" />
          <span>Core Feature Stations &amp; Dedicated Demos</span>
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#2B2B2B] m-0">
          Modular Feature Journey
        </h2>
        <p className="text-sm sm:text-base text-[#2B2B2B]/75 leading-relaxed m-0">
          Each feature is crafted as a modular station with its own focused demo and workspace,
          so you can explore and process files without confusion.
        </p>
      </div>

      {/* Narrative Zig-Zag Stations */}
      <div className="space-y-16 md:space-y-20 max-w-6xl mx-auto">
        {FEATURE_REGISTRY.map((feature, index) => {
          const isReversed = index % 2 === 1;

          return (
            <div
              key={feature.id}
              className={`grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center ${
                isReversed ? 'lg:flex-row-reverse' : ''
              }`}
            >
              {/* Feature Narrative & Highlights Column */}
              <div
                className={`lg:col-span-6 space-y-5 text-left ${
                  isReversed ? 'lg:order-2' : 'lg:order-1'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-10 h-10 rounded-ghibli-sm flex items-center justify-center border shadow-sm"
                    style={{
                      backgroundColor: feature.lightBgColor,
                      borderColor: `${feature.accentColor}40`,
                    }}
                  >
                    {getIcon(feature.iconName, 'text-[#212635]')}
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#2B2B2B]/60 block">
                      Station 0{index + 1}
                    </span>
                    <h3 className="text-lg sm:text-xl font-bold text-[#2B2B2B] m-0">
                      {feature.stationName}
                    </h3>
                  </div>
                  <span
                    className="ml-auto text-[11px] font-semibold px-2.5 py-0.5 rounded-full border shadow-sm hidden sm:inline-block"
                    style={{
                      backgroundColor: feature.lightBgColor,
                      color: '#212635',
                      borderColor: `${feature.accentColor}50`,
                    }}
                  >
                    {feature.badge}
                  </span>
                </div>

                <h4 className="text-xl sm:text-2xl font-bold text-[#2B2B2B] leading-snug m-0">
                  {feature.name}
                </h4>

                <p className="text-sm sm:text-base text-[#2B2B2B]/80 leading-relaxed m-0">
                  {feature.description}
                </p>

                {/* Capability Bullet Highlights */}
                <div className="space-y-2 pt-1">
                  {feature.highlights.map((highlight, hIndex) => (
                    <div key={hIndex} className="flex items-center gap-2.5 text-xs sm:text-sm text-[#2B2B2B]/85">
                      <CheckCircle2
                        className="w-4 h-4 shrink-0"
                        style={{ color: feature.accentColor }}
                      />
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dedicated Demo & Dropzone Column */}
              <div
                className={`lg:col-span-6 ${
                  isReversed ? 'lg:order-1' : 'lg:order-2'
                }`}
              >
                <div className="ghibli-card-elevated p-6 sm:p-7 bg-white relative overflow-hidden text-left border border-[#2B2B2B]/10 space-y-5">
                  {/* Dedicated Demo Box */}
                  <div
                    className="p-4 rounded-ghibli-sm border space-y-3"
                    style={{
                      backgroundColor: feature.lightBgColor,
                      borderColor: `${feature.accentColor}35`,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#212635] uppercase tracking-wider">
                        Dedicated Demo
                      </span>
                      <span className="text-[11px] font-semibold text-[#212635]/70">
                        1-Click Instant Preview
                      </span>
                    </div>

                    <p className="text-xs text-[#2B2B2B]/80 m-0 leading-relaxed">
                      {feature.demoDescription}
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        onLoadFeatureSample(
                          feature.id,
                          feature.demoType === 'photo' ? 'photo' : 'pdf'
                        )
                      }
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-ghibli-sm text-white font-semibold text-xs sm:text-sm shadow-sm transition-all active:translate-y-[1px] cursor-pointer"
                      style={{ backgroundColor: '#212635' }}
                    >
                      {getIcon(feature.iconName, 'text-white')}
                      <span>{feature.demoButtonLabel}</span>
                      <ArrowRight className="w-3.5 h-3.5 opacity-80" />
                    </button>
                  </div>

                  {/* Dedicated File Dropzone */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                        const fileList = Array.from(e.dataTransfer.files);
                        onFilesSelectedForFeature(fileList, feature.id);
                      }
                    }}
                    onClick={() => fileInputRefs[feature.id].current?.click()}
                    className="border-2 border-dashed border-[#2B2B2B]/15 hover:border-[#212635]/50 bg-[#FAF8F2] hover:bg-[#F5F3EC] p-5 rounded-ghibli-sm text-center transition-all cursor-pointer group space-y-2"
                  >
                    <input
                      ref={fileInputRefs[feature.id]}
                      type="file"
                      multiple
                      accept={feature.acceptedMimeTypes}
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          const fileList = Array.from(e.target.files);
                          onFilesSelectedForFeature(fileList, feature.id);
                          e.target.value = '';
                        }
                      }}
                      className="hidden"
                    />

                    <div className="w-10 h-10 rounded-full bg-white border border-[#2B2B2B]/10 mx-auto flex items-center justify-center text-[#212635] group-hover:scale-105 transition-transform shadow-sm">
                      <FolderUp className="w-5 h-5 text-[#212635]" />
                    </div>

                    <div>
                      <span className="text-xs sm:text-sm font-bold text-[#2B2B2B] block">
                        Upload Files to {feature.name}
                      </span>
                      <span className="text-[11px] text-[#2B2B2B]/60 block mt-0.5">
                        Drop files here or click to browse ({feature.acceptedExtensions.join(', ')})
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
