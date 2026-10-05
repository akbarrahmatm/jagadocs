import { degrees, PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import type { PDFImage } from 'pdf-lib';
import type {
  ExportSettings,
  GridPosition,
  WatermarkConfig,
} from '../types/watermark';
import { parseWatermarkTokens } from './tokenParser';

/**
 * Converts Hex color string (#RRGGBB) to RGB (0..1)
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split('')
      .map((c) => c + c)
      .join('');
  }
  const num = parseInt(cleanHex, 16);
  const r = ((num >> 16) & 255) / 255;
  const g = ((num >> 8) & 255) / 255;
  const b = (num & 255) / 255;
  return {
    r: isNaN(r) ? 0.9 : r,
    g: isNaN(g) ? 0.1 : g,
    b: isNaN(b) ? 0.1 : b,
  };
}

/**
 * Maps font family name to standard PDF fonts
 */
function getStandardFont(fontFamily: string, bold: boolean, italic: boolean): StandardFonts {
  const fontLower = fontFamily.toLowerCase();

  if (fontLower.includes('times') || fontLower.includes('georgia') || fontLower.includes('serif')) {
    if (bold && italic) return StandardFonts.TimesRomanBoldItalic;
    if (bold) return StandardFonts.TimesRomanBold;
    if (italic) return StandardFonts.TimesRomanItalic;
    return StandardFonts.TimesRoman;
  }

  if (fontLower.includes('courier') || fontLower.includes('mono')) {
    if (bold && italic) return StandardFonts.CourierBoldOblique;
    if (bold) return StandardFonts.CourierBold;
    if (italic) return StandardFonts.CourierOblique;
    return StandardFonts.Courier;
  }

  // Default to Helvetica
  if (bold && italic) return StandardFonts.HelveticaBoldOblique;
  if (bold) return StandardFonts.HelveticaBold;
  if (italic) return StandardFonts.HelveticaOblique;
  return StandardFonts.Helvetica;
}

/**
 * Parses page range string (e.g. "1, 3-5, 8") into 1-based page numbers
 */
export function parsePageRange(rangeStr: string, totalPages: number): Set<number> {
  const pages = new Set<number>();
  const parts = rangeStr.split(/[,;\s]+/).filter(Boolean);

  for (const part of parts) {
    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-');
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      if (!isNaN(start) && !isNaN(end)) {
        const minP = Math.max(1, Math.min(start, end));
        const maxP = Math.min(totalPages, Math.max(start, end));
        for (let p = minP; p <= maxP; p++) {
          pages.add(p);
        }
      }
    } else {
      const pageNum = parseInt(part, 10);
      if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
        pages.add(pageNum);
      }
    }
  }

  return pages;
}

/**
 * Calculate coordinates in PDF coordinate space (where (0,0) is bottom-left)
 */
function getPdfGridCoordinates(
  position: GridPosition,
  pageWidth: number,
  pageHeight: number,
  itemWidth: number,
  itemHeight: number,
  marginPercent = 5
): { x: number; y: number } {
  const marginX = (pageWidth * marginPercent) / 100;
  const marginY = (pageHeight * marginPercent) / 100;

  let x: number;
  if (position.includes('left')) {
    x = marginX + itemWidth / 2;
  } else if (position.includes('right')) {
    x = pageWidth - marginX - itemWidth / 2;
  } else {
    x = pageWidth / 2;
  }

  let y: number;
  if (position.includes('top')) {
    y = pageHeight - marginY - itemHeight / 2;
  } else if (position.includes('bottom')) {
    y = marginY + itemHeight / 2;
  } else {
    y = pageHeight / 2;
  }

  return { x, y };
}

/**
 * Converts image data URL or blob URL to Uint8Array for pdf-lib embedding
 */
async function fetchImageBytes(url: string): Promise<{ bytes: Uint8Array; format: 'png' | 'jpg' }> {
  const response = await fetch(url);
  const blob = await response.blob();
  const buffer = await blob.arrayBuffer();
  const isJpg = blob.type.includes('jpeg') || blob.type.includes('jpg');
  return {
    bytes: new Uint8Array(buffer),
    format: isJpg ? 'jpg' : 'png',
  };
}

export interface WatermarkPdfOptions {
  pdfArrayBuffer: ArrayBuffer;
  config: WatermarkConfig;
  exportSettings: ExportSettings;
  filename: string;
}

/**
 * Applies text or image watermark to a PDF document using pdf-lib
 */
export async function watermarkPdfDocument(options: WatermarkPdfOptions): Promise<Uint8Array> {
  const { pdfArrayBuffer, config, exportSettings, filename } = options;
  // Always load from a cloned buffer to prevent detachment issues
  const bufferCopy = new Uint8Array(pdfArrayBuffer.slice(0));
  const pdfDoc = await PDFDocument.load(bufferCopy);
  const totalPages = pdfDoc.getPageCount();

  // Determine pages to watermark
  const targetPages = new Set<number>();
  if (exportSettings.pdfPageRangeMode === 'all') {
    for (let i = 1; i <= totalPages; i++) targetPages.add(i);
  } else if (exportSettings.pdfPageRangeMode === 'first') {
    targetPages.add(1);
  } else if (exportSettings.pdfPageRangeMode === 'last') {
    targetPages.add(totalPages);
  } else if (exportSettings.pdfPageRangeMode === 'custom') {
    const parsed = parsePageRange(exportSettings.pdfCustomPages, totalPages);
    if (parsed.size > 0) {
      parsed.forEach((p) => targetPages.add(p));
    } else {
      for (let i = 1; i <= totalPages; i++) targetPages.add(i);
    }
  }

  // Embed logo image if Image watermark type
  let embeddedImage: PDFImage | null = null;
  if (config.type === 'image' && config.image.imageUrl) {
    try {
      const { bytes, format } = await fetchImageBytes(config.image.imageUrl);
      if (format === 'jpg') {
        embeddedImage = await pdfDoc.embedJpg(bytes);
      } else {
        embeddedImage = await pdfDoc.embedPng(bytes);
      }
    } catch (err) {
      console.warn('Failed to embed image directly in PDF', err);
    }
  }

  // Embed Font if Text watermark type
  const stdFont = getStandardFont(
    config.text.fontFamily,
    config.text.bold,
    config.text.italic
  );
  const pdfFont = await pdfDoc.embedFont(stdFont);

  // Process target pages
  for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
    const pageNum = pageIdx + 1;
    if (!targetPages.has(pageNum)) continue;

    const page = pdfDoc.getPage(pageIdx);
    const { width, height } = page.getSize();

    if (config.type === 'text') {
      const parsedText = parseWatermarkTokens(config.text.text, {
        filename,
        page: pageNum,
        totalPages,
      });
      if (!parsedText.trim()) continue;

      const lines = parsedText.split('\n');

      // Calculate font size
      let fontSize: number;
      if (config.text.fontSizeMode === 'percent') {
        const minDim = Math.min(width, height);
        fontSize = Math.max(10, (minDim * config.text.fontSizePercent) / 100);
      } else {
        const scaleFactor = Math.max(width, height) / 1000;
        fontSize = Math.max(8, config.text.fontSize * scaleFactor);
      }

      const lineHeight = fontSize * 1.25;
      const rgbColor = hexToRgb(config.text.color);
      const pdfColor = rgb(rgbColor.r, rgbColor.g, rgbColor.b);

      // Measure max text line width
      let maxLineWidth = 0;
      for (const line of lines) {
        const w = pdfFont.widthOfTextAtSize(line, fontSize);
        if (w > maxLineWidth) maxLineWidth = w;
      }
      const totalBlockHeight = lines.length * lineHeight;

      // In PDF, positive angle is counter-clockwise. config.text.rotation in UI: positive is clockwise.
      // So PDF rotation angle = -config.text.rotation
      const pdfRotationAngle = -config.text.rotation;
      const rad = (pdfRotationAngle * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);

      const drawTextAtCenter = (cx: number, cy: number) => {
        // Draw background rectangle if enabled
        if (config.text.background) {
          const pad = (config.text.bgPadding * fontSize) / 24;
          const bgW = maxLineWidth + pad * 2;
          const bgH = totalBlockHeight + pad * 2;
          const bgRgb = hexToRgb(config.text.bgColor);

          // Local bottom-left of bg rect
          const bgLx = -bgW / 2;
          const bgLy = -bgH / 2;
          const bgRx = cx + bgLx * cos - bgLy * sin;
          const bgRy = cy + bgLx * sin + bgLy * cos;

          page.drawRectangle({
            x: bgRx,
            y: bgRy,
            width: bgW,
            height: bgH,
            rotate: degrees(pdfRotationAngle),
            color: rgb(bgRgb.r, bgRgb.g, bgRgb.b),
            opacity: config.text.bgOpacity * config.text.opacity,
          });
        }

        // Draw each line
        lines.forEach((line, lineIndex) => {
          const lineWidth = pdfFont.widthOfTextAtSize(line, fontSize);
          // Local offset: line 0 is at the top, line n-1 at the bottom
          const offsetY = ((lines.length - 1) / 2 - lineIndex) * lineHeight - fontSize * 0.35;

          const lx = -lineWidth / 2;
          const ly = offsetY;

          const rotatedX = cx + lx * cos - ly * sin;
          const rotatedY = cy + lx * sin + ly * cos;

          page.drawText(line, {
            x: rotatedX,
            y: rotatedY,
            size: fontSize,
            font: pdfFont,
            color: pdfColor,
            opacity: Math.max(0.05, config.text.opacity),
            rotate: degrees(pdfRotationAngle),
          });
        });
      };

      if (config.positionMode === 'tile') {
        const gapX = Math.max(100, (config.tileSettings.gapX * width) / 1000) + maxLineWidth;
        const gapY = Math.max(80, (config.tileSettings.gapY * height) / 1000) + totalBlockHeight;
        const diagOffset = config.tileSettings.diagonalOffset ? gapX / 2 : 0;

        let row = 0;
        for (let y = -totalBlockHeight; y <= height + totalBlockHeight + gapY; y += gapY) {
          const xOffset = (row % 2 === 1) ? diagOffset : 0;
          for (let x = -maxLineWidth; x <= width + maxLineWidth + gapX; x += gapX) {
            drawTextAtCenter(x + xOffset, y);
          }
          row++;
        }
      } else if (config.positionMode === 'custom') {
        const cx = (config.customPosition.xPercent / 100) * width;
        const cy = height - (config.customPosition.yPercent / 100) * height; // Invert Y for PDF origin
        drawTextAtCenter(cx, cy);
      } else {
        const coords = getPdfGridCoordinates(
          config.gridPosition,
          width,
          height,
          maxLineWidth,
          totalBlockHeight
        );
        drawTextAtCenter(coords.x, coords.y);
      }
    } else if (config.type === 'image' && embeddedImage) {
      // Image Watermark
      const imgWidth = embeddedImage.width;
      const imgHeight = embeddedImage.height;
      const minDim = Math.min(width, height);
      const targetScale = config.image.scalePercent / 100;
      const targetW = minDim * targetScale;
      const targetH = (targetW / imgWidth) * imgHeight;

      const pdfRotationAngle = -config.image.rotation;
      const rad = (pdfRotationAngle * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);

      const drawImageAtCenter = (cx: number, cy: number) => {
        const lx = -targetW / 2;
        const ly = -targetH / 2;
        const rx = cx + lx * cos - ly * sin;
        const ry = cy + lx * sin + ly * cos;

        page.drawImage(embeddedImage, {
          x: rx,
          y: ry,
          width: targetW,
          height: targetH,
          opacity: Math.max(0.05, config.image.opacity),
          rotate: degrees(pdfRotationAngle),
        });
      };

      if (config.positionMode === 'tile') {
        const gapX = Math.max(100, (config.tileSettings.gapX * width) / 1000) + targetW;
        const gapY = Math.max(80, (config.tileSettings.gapY * height) / 1000) + targetH;
        const diagOffset = config.tileSettings.diagonalOffset ? gapX / 2 : 0;

        let row = 0;
        for (let y = -targetH; y <= height + targetH + gapY; y += gapY) {
          const xOffset = (row % 2 === 1) ? diagOffset : 0;
          for (let x = -targetW; x <= width + targetW + gapX; x += gapX) {
            drawImageAtCenter(x + xOffset, y);
          }
          row++;
        }
      } else if (config.positionMode === 'custom') {
        const cx = (config.customPosition.xPercent / 100) * width;
        const cy = height - (config.customPosition.yPercent / 100) * height;
        drawImageAtCenter(cx, cy);
      } else {
        const coords = getPdfGridCoordinates(
          config.gridPosition,
          width,
          height,
          targetW,
          targetH
        );
        drawImageAtCenter(coords.x, coords.y);
      }
    }
  }

  return await pdfDoc.save();
}
