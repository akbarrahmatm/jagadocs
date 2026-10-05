import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Initialize PDF.js worker using Vite asset URL
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;
}

export interface PdfInfo {
  numPages: number;
  firstPagePreview: string;
  width: number;
  height: number;
}

/**
 * Loads a PDF ArrayBuffer and extracts page count & renders page 1 with white background
 */
export async function loadPdfInfo(arrayBuffer: ArrayBuffer): Promise<PdfInfo> {
  // Always use a slice/copy so worker postMessage does not detach caller's ArrayBuffer!
  const bufferCopy = new Uint8Array(arrayBuffer.slice(0));

  const loadingTask = pdfjsLib.getDocument({
    data: bufferCopy,
    cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@6.4.299/cmaps/',
    cMapPacked: true,
  });

  const pdfDoc = await loadingTask.promise;
  const numPages = pdfDoc.numPages;

  // Render first page preview
  const page = await pdfDoc.getPage(1);
  const viewport = page.getViewport({ scale: 1.5 });

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Could not create canvas context');

  canvas.width = Math.round(viewport.width);
  canvas.height = Math.round(viewport.height);

  // CRITICAL: Fill with solid white paper background before rendering PDF elements
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderParams: any = {
    canvasContext: context,
    viewport: viewport,
    canvas: canvas,
  };

  await page.render(renderParams).promise;

  const firstPagePreview = canvas.toDataURL('image/png');

  return {
    numPages,
    firstPagePreview,
    width: canvas.width,
    height: canvas.height,
  };
}

/**
 * Renders a specific PDF page to an Image element or Canvas with white background
 */
export async function renderPdfPageToCanvas(
  arrayBuffer: ArrayBuffer,
  pageNumber: number,
  scale = 2.0
): Promise<{ canvas: HTMLCanvasElement; width: number; height: number }> {
  // Always use a slice/copy so worker does not detach caller's ArrayBuffer!
  const bufferCopy = new Uint8Array(arrayBuffer.slice(0));

  const loadingTask = pdfjsLib.getDocument({
    data: bufferCopy,
    cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@6.4.299/cmaps/',
    cMapPacked: true,
  });

  const pdfDoc = await loadingTask.promise;
  const safePageNum = Math.min(Math.max(1, pageNumber), pdfDoc.numPages);
  const page = await pdfDoc.getPage(safePageNum);
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Could not create canvas context');

  canvas.width = Math.round(viewport.width);
  canvas.height = Math.round(viewport.height);

  // CRITICAL: Fill with solid white paper background
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderParams: any = {
    canvasContext: context,
    viewport: viewport,
    canvas: canvas,
  };

  await page.render(renderParams).promise;

  return {
    canvas,
    width: canvas.width,
    height: canvas.height,
  };
}
