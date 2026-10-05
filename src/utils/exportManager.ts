import confetti from 'canvas-confetti';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import type { ExportSettings, UploadedFile, WatermarkConfig } from '../types/watermark';
import { exportCanvasToBlob, renderWatermarkOnCanvas } from './imageWatermark';
import { watermarkPdfDocument } from './pdfWatermark';

export interface ExportProgress {
  current: number;
  total: number;
  currentFileName: string;
  percentage: number;
}

/**
 * Generates the output filename with custom prefix & suffix and extension
 */
export function getOutputFileName(
  originalName: string,
  prefix: string,
  suffix: string,
  targetExtension?: string
): string {
  const lastDot = originalName.lastIndexOf('.');
  const baseName = lastDot !== -1 ? originalName.substring(0, lastDot) : originalName;
  const originalExt = lastDot !== -1 ? originalName.substring(lastDot + 1) : '';

  const finalExt = targetExtension || originalExt || 'png';
  const cleanPrefix = prefix ? `${prefix}_` : '';
  const cleanSuffix = suffix ? `_${suffix}` : '';

  return `${cleanPrefix}${baseName}${cleanSuffix}.${finalExt}`;
}

/**
 * Loads an image from URL into an HTMLImageElement
 */
function loadImageElement(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = url;
  });
}

/**
 * Exports a single Image file with watermarks applied
 */
export async function processImageFile(
  fileItem: UploadedFile,
  config: WatermarkConfig,
  exportSettings: ExportSettings,
  logoImg?: HTMLImageElement | null
): Promise<{ blob: Blob; fileName: string }> {
  const sourceImg = await loadImageElement(fileItem.previewUrl);
  const canvas = document.createElement('canvas');

  renderWatermarkOnCanvas({
    canvas,
    sourceImage: sourceImg,
    config,
    tokenContext: { filename: fileItem.name, page: 1, totalPages: 1 },
    logoImage: logoImg,
  });

  // Determine export format
  let format: 'png' | 'jpeg' | 'webp';
  let ext: string;

  if (exportSettings.imageFormat === 'original') {
    const lower = fileItem.name.toLowerCase();
    if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) {
      format = 'jpeg';
      ext = 'jpg';
    } else if (lower.endsWith('.webp')) {
      format = 'webp';
      ext = 'webp';
    } else {
      format = 'png';
      ext = 'png';
    }
  } else {
    format = exportSettings.imageFormat;
    ext = exportSettings.imageFormat === 'jpeg' ? 'jpg' : exportSettings.imageFormat;
  }

  const blob = await exportCanvasToBlob(canvas, format, exportSettings.jpegQuality);
  const fileName = getOutputFileName(
    fileItem.name,
    exportSettings.fileNamePrefix,
    exportSettings.fileNameSuffix,
    ext
  );

  return { blob, fileName };
}

/**
 * Exports a single PDF file with watermarks applied
 */
export async function processPdfFile(
  fileItem: UploadedFile,
  config: WatermarkConfig,
  exportSettings: ExportSettings
): Promise<{ blob: Blob; fileName: string }> {
  if (!fileItem.pdfArrayBuffer) {
    const buffer = await fileItem.file.arrayBuffer();
    fileItem.pdfArrayBuffer = buffer;
  }

  const watermarkedBytes = await watermarkPdfDocument({
    pdfArrayBuffer: fileItem.pdfArrayBuffer,
    config,
    exportSettings,
    filename: fileItem.name,
  });

  const blob = new Blob([new Uint8Array(watermarkedBytes)], { type: 'application/pdf' });
  const fileName = getOutputFileName(
    fileItem.name,
    exportSettings.fileNamePrefix,
    exportSettings.fileNameSuffix,
    'pdf'
  );

  return { blob, fileName };
}

/**
 * Triggers confetti animation
 */
export function fireConfetti() {
  try {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#6366f1', '#a855f7', '#ec4899', '#3b82f6', '#10b981'],
    });
  } catch {
    // ignore
  }
}

/**
 * Exports a single file and downloads it immediately
 */
export async function exportSingleFile(
  fileItem: UploadedFile,
  config: WatermarkConfig,
  exportSettings: ExportSettings,
  logoImg?: HTMLImageElement | null
): Promise<void> {
  let result: { blob: Blob; fileName: string };

  if (fileItem.type === 'pdf') {
    result = await processPdfFile(fileItem, config, exportSettings);
  } else {
    result = await processImageFile(fileItem, config, exportSettings, logoImg);
  }

  saveAs(result.blob, result.fileName);
  fireConfetti();
}

/**
 * Batch exports all files and downloads as a ZIP archive
 */
export async function exportBatchFiles(
  files: UploadedFile[],
  config: WatermarkConfig,
  exportSettings: ExportSettings,
  logoImg: HTMLImageElement | null,
  onProgress?: (progress: ExportProgress) => void
): Promise<void> {
  const zip = new JSZip();
  const total = files.length;

  for (let i = 0; i < total; i++) {
    const fileItem = files[i];

    if (onProgress) {
      onProgress({
        current: i + 1,
        total,
        currentFileName: fileItem.name,
        percentage: Math.round(((i + 1) / total) * 100),
      });
    }

    try {
      if (fileItem.type === 'pdf') {
        const { blob, fileName } = await processPdfFile(fileItem, config, exportSettings);
        zip.file(fileName, blob);
      } else {
        const { blob, fileName } = await processImageFile(fileItem, config, exportSettings, logoImg);
        zip.file(fileName, blob);
      }
    } catch (err) {
      console.error(`Failed to process ${fileItem.name}:`, err);
    }
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const timestamp = new Date().toISOString().slice(0, 10);
  saveAs(zipBlob, `watermarked_batch_${timestamp}.zip`);
  fireConfetti();
}
