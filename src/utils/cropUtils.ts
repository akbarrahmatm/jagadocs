import type { CropConfig, CropUnit } from '../types/watermark';

export const DEFAULT_CROP_CONFIG: CropConfig = {
  enabled: false,
  unit: 'percent',
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
  linked: false,
  scope: 'all',
};

// 1 inch = 72 pt = 25.4 mm => 1 mm = 72 / 25.4 pt ≈ 2.83464567 pt
export const PT_PER_MM = 72 / 25.4;
export const MM_PER_PT = 25.4 / 72;

/**
 * Converts a crop margin value into PDF points (pt)
 */
export function toPoints(val: number, unit: CropUnit, totalSizePt: number): number {
  if (val <= 0) return 0;
  switch (unit) {
    case 'percent':
      return (val / 100) * totalSizePt;
    case 'mm':
      return val * PT_PER_MM;
    case 'pt':
      return val;
    case 'px':
      // 96 DPI screen pixels to 72 pt PDF
      return (val * 72) / 96;
    default:
      return (val / 100) * totalSizePt;
  }
}

/**
 * Converts a crop margin value into screen / canvas pixels (px)
 */
export function toPixels(
  val: number,
  unit: CropUnit,
  totalPx: number,
  dpi = 96
): number {
  if (val <= 0) return 0;
  switch (unit) {
    case 'percent':
      return (val / 100) * totalPx;
    case 'px':
      return val;
    case 'mm':
      return val * (dpi / 25.4);
    case 'pt':
      return val * (dpi / 72);
    default:
      return (val / 100) * totalPx;
  }
}

/**
 * Converts a pixel value into the specified CropUnit
 */
export function fromPixels(
  px: number,
  targetUnit: CropUnit,
  totalPx: number,
  dpi = 96
): number {
  if (px <= 0 || totalPx <= 0) return 0;
  switch (targetUnit) {
    case 'percent':
      return Math.round(((px / totalPx) * 100) * 10) / 10;
    case 'px':
      return Math.round(px);
    case 'mm':
      return Math.round((px * (25.4 / dpi)) * 10) / 10;
    case 'pt':
      return Math.round((px * (72 / dpi)) * 10) / 10;
    default:
      return Math.round(((px / totalPx) * 100) * 10) / 10;
  }
}

/**
 * Converts a margin between two units
 */
export function convertCropUnit(
  val: number,
  fromUnit: CropUnit,
  toUnit: CropUnit,
  totalPx: number
): number {
  if (fromUnit === toUnit) return val;
  const inPixels = toPixels(val, fromUnit, totalPx);
  return fromPixels(inPixels, toUnit, totalPx);
}

/**
 * Ensures crop margins do not overlap or exceed document dimensions
 */
export function clampCropMargins(
  margins: { top: number; bottom: number; left: number; right: number },
  unit: CropUnit,
  width: number,
  height: number
): { top: number; bottom: number; left: number; right: number } {
  if (unit === 'percent') {
    const maxHorizontal = 45; // max 45% each side
    const maxVertical = 45;
    return {
      top: Math.max(0, Math.min(maxVertical, margins.top)),
      bottom: Math.max(0, Math.min(maxVertical, margins.bottom)),
      left: Math.max(0, Math.min(maxHorizontal, margins.left)),
      right: Math.max(0, Math.min(maxHorizontal, margins.right)),
    };
  }

  const maxL = width * 0.45;
  const maxT = height * 0.45;
  return {
    top: Math.max(0, Math.min(maxT, margins.top)),
    bottom: Math.max(0, Math.min(maxT, margins.bottom)),
    left: Math.max(0, Math.min(maxL, margins.left)),
    right: Math.max(0, Math.min(maxL, margins.right)),
  };
}

/**
 * Scans canvas pixels to automatically detect non-white document contents
 * and computes suggested white margin trimming in percentage
 */
export function autoDetectWhiteMargins(
  canvas: HTMLCanvasElement,
  threshold = 242,
  paddingPercent = 1.5
): { top: number; bottom: number; left: number; right: number } {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return { top: 0, bottom: 0, left: 0, right: 0 };

  const { width, height } = canvas;
  let imgData: ImageData;
  try {
    imgData = ctx.getImageData(0, 0, width, height);
  } catch (err) {
    console.warn('Canvas getImageData failed for auto-detect', err);
    return { top: 0, bottom: 0, left: 0, right: 0 };
  }

  const data = imgData.data;

  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  let foundNonWhite = false;

  // Step sampling for high performance on large canvases
  const step = Math.max(1, Math.floor(Math.min(width, height) / 400));

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = data[idx + 3];

      // Pixel is considered non-white if transparent or darker than threshold
      const isNonWhite = a > 20 && (r < threshold || g < threshold || b < threshold);

      if (isNonWhite) {
        foundNonWhite = true;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (!foundNonWhite || minX >= maxX || minY >= maxY) {
    return { top: 0, bottom: 0, left: 0, right: 0 };
  }

  // Calculate raw margin percentages
  const leftPct = (minX / width) * 100;
  const rightPct = ((width - maxX) / width) * 100;
  const topPct = (minY / height) * 100;
  const bottomPct = ((height - maxY) / height) * 100;

  // Add safe padding inside so text isn't tightly clipped
  const safeLeft = Math.max(0, Math.round((leftPct - paddingPercent) * 10) / 10);
  const safeRight = Math.max(0, Math.round((rightPct - paddingPercent) * 10) / 10);
  const safeTop = Math.max(0, Math.round((topPct - paddingPercent) * 10) / 10);
  const safeBottom = Math.max(0, Math.round((bottomPct - paddingPercent) * 10) / 10);

  return {
    left: Math.min(safeLeft, 35),
    right: Math.min(safeRight, 35),
    top: Math.min(safeTop, 35),
    bottom: Math.min(safeBottom, 35),
  };
}

/**
 * Returns formatted dimensions and standard paper size name if recognized
 */
export function formatPaperDimensions(widthPt: number, heightPt: number): string {
  const wMm = Math.round(widthPt * MM_PER_PT);
  const hMm = Math.round(heightPt * MM_PER_PT);

  // Standard paper checks
  if (
    (Math.abs(wMm - 210) <= 2 && Math.abs(hMm - 297) <= 2) ||
    (Math.abs(wMm - 297) <= 2 && Math.abs(hMm - 210) <= 2)
  ) {
    return `${wMm} × ${hMm} mm (A4)`;
  }
  if (
    (Math.abs(wMm - 148) <= 2 && Math.abs(hMm - 210) <= 2) ||
    (Math.abs(wMm - 210) <= 2 && Math.abs(hMm - 148) <= 2)
  ) {
    return `${wMm} × ${hMm} mm (A5)`;
  }
  if (
    (Math.abs(wMm - 297) <= 2 && Math.abs(hMm - 420) <= 2) ||
    (Math.abs(wMm - 420) <= 2 && Math.abs(hMm - 297) <= 2)
  ) {
    return `${wMm} × ${hMm} mm (A3)`;
  }
  if (
    (Math.abs(wMm - 216) <= 2 && Math.abs(hMm - 279) <= 2) ||
    (Math.abs(wMm - 279) <= 2 && Math.abs(hMm - 216) <= 2)
  ) {
    return `${wMm} × ${hMm} mm (Letter)`;
  }
  if (
    (Math.abs(wMm - 216) <= 2 && Math.abs(hMm - 356) <= 2) ||
    (Math.abs(wMm - 356) <= 2 && Math.abs(hMm - 216) <= 2)
  ) {
    return `${wMm} × ${hMm} mm (Legal)`;
  }

  return `${wMm} × ${hMm} mm (${Math.round(widthPt)} × ${Math.round(heightPt)} pt)`;
}

export interface CropPreset {
  id: string;
  name: string;
  description: string;
  badge?: string;
  config: Partial<CropConfig>;
}

export const CROP_PRESETS: CropPreset[] = [
  {
    id: 'scanner-edge-clean',
    name: 'Scanner Edge Clean (3 mm)',
    description: 'Trims small dark border lines and artifacts from scanned PDFs',
    badge: 'Scanned Docs',
    config: {
      enabled: true,
      unit: 'mm',
      top: 3,
      bottom: 3,
      left: 3,
      right: 3,
      linked: true,
    },
  },
  {
    id: 'standard-margin',
    name: 'Standard Margins (10 mm)',
    description: 'Clean uniform 10mm border trim around all sides',
    badge: 'Uniform',
    config: {
      enabled: true,
      unit: 'mm',
      top: 10,
      bottom: 10,
      left: 10,
      right: 10,
      linked: true,
    },
  },
  {
    id: 'header-footer-trim',
    name: 'Header & Footer Trim (15 mm)',
    description: 'Removes unwanted headers, footers, page numbers, or URLs',
    badge: 'Headers/Footers',
    config: {
      enabled: true,
      unit: 'mm',
      top: 15,
      bottom: 15,
      left: 0,
      right: 0,
      linked: false,
    },
  },
  {
    id: 'binding-trim',
    name: 'Hole Punch / Binding Trim (15 mm Left)',
    description: 'Trims left margin for punched holes, staples or binder shadows',
    badge: 'Binding',
    config: {
      enabled: true,
      unit: 'mm',
      top: 0,
      bottom: 0,
      left: 15,
      right: 0,
      linked: false,
    },
  },
  {
    id: 'five-percent',
    name: '5% Outer Margin Trim',
    description: 'Proportional 5% trim on all 4 sides',
    badge: 'Proportional',
    config: {
      enabled: true,
      unit: 'percent',
      top: 5,
      bottom: 5,
      left: 5,
      right: 5,
      linked: true,
    },
  },
];
