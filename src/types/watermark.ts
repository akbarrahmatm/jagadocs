export type WatermarkType = 'text' | 'image';

export type GridPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'center-left'
  | 'center'
  | 'center-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export type PositionMode = 'grid' | 'custom' | 'tile';

export interface CustomPosition {
  xPercent: number; // 0 to 100%
  yPercent: number; // 0 to 100%
}

export interface TileSettings {
  gapX: number; // Spacing in px (scaled)
  gapY: number;
  diagonalOffset: boolean;
}

export interface TextWatermarkConfig {
  text: string;
  fontFamily: string;
  fontSize: number; // in pt/px relative to 1000px canvas baseline
  fontSizeMode: 'fixed' | 'percent'; // percent of document min dimension
  fontSizePercent: number; // 1 to 50%
  color: string; // Hex color
  opacity: number; // 0 to 1
  rotation: number; // -180 to 180 degrees
  bold: boolean;
  italic: boolean;
  underline: boolean;
  stroke: boolean;
  strokeColor: string;
  strokeWidth: number;
  shadow: boolean;
  shadowColor: string;
  shadowBlur: number;
  background: boolean;
  bgColor: string;
  bgOpacity: number;
  bgPadding: number;
  bgRadius: number;
}

export interface ImageWatermarkConfig {
  imageUrl: string | null;
  imageName: string | null;
  imageWidth: number;
  imageHeight: number;
  scalePercent: number; // 5 to 100% of image size
  opacity: number; // 0 to 1
  rotation: number; // -180 to 180 degrees
}

export interface WatermarkConfig {
  type: WatermarkType;
  positionMode: PositionMode;
  gridPosition: GridPosition;
  customPosition: CustomPosition;
  tileSettings: TileSettings;
  text: TextWatermarkConfig;
  image: ImageWatermarkConfig;
}

export type FileType = 'image' | 'pdf';

export interface UploadedFile {
  id: string;
  file: File;
  name: string;
  type: FileType;
  size: number;
  previewUrl: string; // Object URL or rendered image
  originalWidth: number;
  originalHeight: number;
  // PDF specific
  pdfNumPages?: number;
  pdfPagePreviews?: string[]; // Array of rendered page data URLs
  pdfActivePage?: number; // 1-indexed
  pdfArrayBuffer?: ArrayBuffer;
}

export interface ExportSettings {
  imageFormat: 'original' | 'png' | 'jpeg' | 'webp';
  jpegQuality: number; // 0.1 to 1.0
  fileNamePrefix: string;
  fileNameSuffix: string;
  pdfPageRangeMode: 'all' | 'first' | 'last' | 'custom';
  pdfCustomPages: string; // e.g., "1, 3-5"
}

export interface WatermarkPreset {
  id: string;
  name: string;
  description: string;
  badge?: string;
  config: Partial<WatermarkConfig>;
}
