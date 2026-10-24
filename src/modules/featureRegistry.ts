export type FeatureId = 'pdf-watermark' | 'image-watermark' | 'doc-crop';

export interface FeatureModule {
  id: FeatureId;
  name: string;
  stationName: string;
  badge: string;
  tagline: string;
  description: string;
  accentColor: string; // Theme color
  lightBgColor: string;
  iconName: 'FileText' | 'Image' | 'Crop';
  acceptedMimeTypes: string;
  acceptedExtensions: string[];
  demoType: 'pdf' | 'photo' | 'scan-pdf';
  demoButtonLabel: string;
  demoDescription: string;
  highlights: string[];
}

export const FEATURE_REGISTRY: FeatureModule[] = [
  {
    id: 'pdf-watermark',
    name: 'PDF Watermark Studio',
    stationName: 'PDF Document Pavilion',
    badge: 'Multi-Page Vector',
    tagline: 'High-fidelity vector watermarks for official PDF documents and multi-page reports.',
    description:
      'Embed crisp dynamic text or transparent logo stamps directly into PDF content streams with zero raster degradation. Includes automatic page numbers and date tokens.',
    accentColor: '#7CB342', // Grass Green
    lightBgColor: '#F1F8E9',
    iconName: 'FileText',
    acceptedMimeTypes: 'application/pdf',
    acceptedExtensions: ['.pdf'],
    demoType: 'pdf',
    demoButtonLabel: 'Explore 3-Page PDF Demo',
    demoDescription:
      'Try an executive report document with dynamic {page} and {totalPages} numbering tokens.',
    highlights: [
      'Smart tokens: {page}, {totalPages}, {date}',
      'Selective page scope: All, First, Last, or Custom range',
      'Lossless PDF-Lib vector preservation',
      'Interactive multi-page canvas navigator',
    ],
  },
  {
    id: 'image-watermark',
    name: 'Photo & Image Watermark',
    stationName: 'Photo & Imagery Garden',
    badge: 'Batch Processing',
    tagline: 'Batch protection for photography, artwork, and commercial images.',
    description:
      'Apply watermarks to hundreds of high-resolution images simultaneously in browser memory. Position via 9-grid snapping, repeated security tile patterns, and export organized ZIP archives.',
    accentColor: '#4FC3F7', // Sky Blue
    lightBgColor: '#E1F5FE',
    iconName: 'Image',
    acceptedMimeTypes: 'image/*',
    acceptedExtensions: ['.png', '.jpg', '.jpeg', '.webp', '.svg', '.bmp'],
    demoType: 'photo',
    demoButtonLabel: 'Explore Landscape Photo Demo (1200x800)',
    demoDescription:
      'Try a high-resolution landscape photo to test opacity, tilt angles, and typography styling.',
    highlights: [
      'Batch queue with unlimited file processing',
      'Security tile pattern repeat across documents',
      'Export format selection: Original, PNG, JPEG, WebP',
      'Instant ZIP archive packaging with progress tracking',
    ],
  },
  {
    id: 'doc-crop',
    name: 'Edge Crop & Margin Trim',
    stationName: 'Margin & Crop Atelier',
    badge: 'Precision Trimming',
    tagline: 'Trim dark scanner borders, punch hole shadows, and uneven document margins.',
    description:
      'Interactive 8-handle crop frame directly on the canvas. Features pixel-based white border auto-detection and standardized document margin presets.',
    accentColor: '#F48FB1', // Soft Pink
    lightBgColor: '#FCE4EC',
    iconName: 'Crop',
    acceptedMimeTypes: 'application/pdf,image/*',
    acceptedExtensions: ['.pdf', '.png', '.jpg', '.jpeg'],
    demoType: 'scan-pdf',
    demoButtonLabel: 'Explore Document Trim Demo',
    demoDescription:
      'Try a document with uneven scan margins to test automatic margin detection and 3 mm scanner clean presets.',
    highlights: [
      'Interactive 8-handle crop boundary controls',
      'Pixel scanner white border auto-detection',
      'Multi-unit precision: mm, pt, %, and px',
      'One-click presets: 3 mm Scanner Clean, 15 mm Binding Trim',
    ],
  },
];

export function getFeatureById(id: FeatureId): FeatureModule {
  const found = FEATURE_REGISTRY.find((f) => f.id === id);
  return found || FEATURE_REGISTRY[0];
}

export function detectFeatureForFiles(files: File[]): FeatureId {
  const hasPdf = files.some((f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
  if (hasPdf) return 'pdf-watermark';
  return 'image-watermark';
}
