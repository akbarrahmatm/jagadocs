export interface TokenContext {
  filename?: string;
  page?: number;
  totalPages?: number;
}

export function parseWatermarkTokens(text: string, context?: TokenContext): string {
  const now = new Date();
  const dateStr = now.toLocaleDateString();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const yearStr = now.getFullYear().toString();
  const monthStr = (now.getMonth() + 1).toString().padStart(2, '0');
  const dayStr = now.getDate().toString().padStart(2, '0');

  let result = text;
  result = result.replace(/\{date\}/gi, dateStr);
  result = result.replace(/\{time\}/gi, timeStr);
  result = result.replace(/\{year\}/gi, yearStr);
  result = result.replace(/\{month\}/gi, monthStr);
  result = result.replace(/\{day\}/gi, dayStr);

  if (context?.filename) {
    // Remove extension for clean filename
    const nameWithoutExt = context.filename.replace(/\.[^/.]+$/, '');
    result = result.replace(/\{filename\}/gi, nameWithoutExt);
    result = result.replace(/\{fullfilename\}/gi, context.filename);
  } else {
    result = result.replace(/\{filename\}/gi, 'Document');
    result = result.replace(/\{fullfilename\}/gi, 'Document.png');
  }

  if (context?.page !== undefined) {
    result = result.replace(/\{page\}/gi, context.page.toString());
  } else {
    result = result.replace(/\{page\}/gi, '1');
  }

  if (context?.totalPages !== undefined) {
    result = result.replace(/\{total_pages\}/gi, context.totalPages.toString());
  } else {
    result = result.replace(/\{total_pages\}/gi, '1');
  }

  return result;
}
