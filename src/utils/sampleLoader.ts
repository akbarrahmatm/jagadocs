import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import type { UploadedFile } from '../types/watermark';
import { loadPdfInfo } from './pdfPreview';

/**
 * Creates a sample photo canvas as a high-res File object
 */
export async function createSamplePhoto(): Promise<UploadedFile> {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 800;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not create sample canvas');

  // Draw modern gradient backdrop
  const grad = ctx.createLinearGradient(0, 0, 1200, 800);
  grad.addColorStop(0, '#1e1b4b');
  grad.addColorStop(0.5, '#312e81');
  grad.addColorStop(1, '#0f172a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1200, 800);

  // Draw geometric visual elements / scenery mockup
  // Sun/Moon
  const sunGrad = ctx.createRadialGradient(900, 250, 20, 900, 250, 140);
  sunGrad.addColorStop(0, '#fbbf24');
  sunGrad.addColorStop(0.7, '#f59e0b');
  sunGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = sunGrad;
  ctx.beginPath();
  ctx.arc(900, 250, 140, 0, Math.PI * 2);
  ctx.fill();

  // Mountains silhouettes
  ctx.fillStyle = '#4338ca';
  ctx.beginPath();
  ctx.moveTo(0, 800);
  ctx.lineTo(300, 450);
  ctx.lineTo(600, 800);
  ctx.fill();

  ctx.fillStyle = '#3730a3';
  ctx.beginPath();
  ctx.moveTo(350, 800);
  ctx.lineTo(750, 380);
  ctx.lineTo(1100, 800);
  ctx.fill();

  ctx.fillStyle = '#1e1b4b';
  ctx.beginPath();
  ctx.moveTo(700, 800);
  ctx.lineTo(1000, 520);
  ctx.lineTo(1200, 800);
  ctx.fill();

  // Lake / water reflection line
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 700, 1200, 100);

  // Typography
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 44px system-ui, sans-serif';
  ctx.fillText('NATURE & ARCHITECTURE PHOTOGRAPHY', 80, 120);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '22px system-ui, sans-serif';
  ctx.fillText('Original High Resolution Asset • 1200 × 800 px', 80, 160);

  const blob = await new Promise<Blob>((resolve) => {
    canvas.toBlob((b) => resolve(b || new Blob()), 'image/png');
  });

  const file = new File([blob], 'mountain_sunset_sample.png', { type: 'image/png' });
  const previewUrl = URL.createObjectURL(blob);

  return {
    id: `sample-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    file,
    name: 'mountain_sunset_sample.png',
    type: 'image',
    size: blob.size,
    previewUrl,
    originalWidth: 1200,
    originalHeight: 800,
  };
}

/**
 * Generates a 3-page sample PDF on the fly using pdf-lib
 */
export async function createSamplePdf(): Promise<UploadedFile> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Page 1: Executive Summary
  const page1 = pdfDoc.addPage([595, 842]); // A4
  page1.drawText('CONFIDENTIAL BUSINESS REPORT', {
    x: 50,
    y: 760,
    size: 24,
    font: fontBold,
    color: rgb(0.1, 0.15, 0.3),
  });

  page1.drawText('Quarterly Financial & Strategic Overview', {
    x: 50,
    y: 730,
    size: 14,
    font,
    color: rgb(0.3, 0.35, 0.4),
  });

  page1.drawRectangle({
    x: 50,
    y: 700,
    width: 495,
    height: 2,
    color: rgb(0.38, 0.35, 0.9),
  });

  page1.drawText(
    'This document contains proprietary information intended strictly for internal review.\nUnauthorized copying, distribution, or dissemination is strictly prohibited by law.\n\nKey Highlights:\n- Q1 Revenue increased by 34% YoY across core cloud segments.\n- Enterprise customer acquisition grew by 48% following product expansion.\n- Operational efficiency improved gross margins to 68.4%.',
    {
      x: 50,
      y: 650,
      size: 11,
      font,
      color: rgb(0.2, 0.2, 0.2),
      lineHeight: 18,
    }
  );

  // Page 2: Financials & Metrics
  const page2 = pdfDoc.addPage([595, 842]);
  page2.drawText('SECTION 2: FINANCIAL BREAKDOWN', {
    x: 50,
    y: 760,
    size: 20,
    font: fontBold,
    color: rgb(0.1, 0.15, 0.3),
  });

  page2.drawText(
    'Detailed statement of operations and profit margin distribution for fiscal year 2026.\nAll figures reported in thousands of USD unless otherwise stated.\n\nRevenue Breakdown:\n• Cloud Software Subscriptions: $14,200,000\n• Professional Services & Consulting: $4,850,000\n• Hardware Integrations: $2,150,000\n\nTotal Gross Revenue: $21,200,000',
    {
      x: 50,
      y: 700,
      size: 11,
      font,
      color: rgb(0.2, 0.2, 0.2),
      lineHeight: 18,
    }
  );

  // Page 3: Compliance & Legal Notes
  const page3 = pdfDoc.addPage([595, 842]);
  page3.drawText('SECTION 3: LEGAL & COMPLIANCE', {
    x: 50,
    y: 760,
    size: 20,
    font: fontBold,
    color: rgb(0.1, 0.15, 0.3),
  });

  page3.drawText(
    'Disclosure Notice:\nThe contents of this document are protected under non-disclosure agreements.\nSubject to audit and security verification.\n\nApproved By:\nBoard of Directors & Chief Legal Counsel',
    {
      x: 50,
      y: 700,
      size: 11,
      font,
      color: rgb(0.2, 0.2, 0.2),
      lineHeight: 18,
    }
  );

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
  const file = new File([blob], 'annual_financial_report_2026.pdf', { type: 'application/pdf' });

  const buffer = await file.arrayBuffer();
  const info = await loadPdfInfo(buffer);

  return {
    id: `sample-pdf-${Date.now()}`,
    file,
    name: 'annual_financial_report_2026.pdf',
    type: 'pdf',
    size: blob.size,
    previewUrl: info.firstPagePreview,
    originalWidth: info.width,
    originalHeight: info.height,
    pdfNumPages: info.numPages,
    pdfActivePage: 1,
    pdfArrayBuffer: buffer,
  };
}
