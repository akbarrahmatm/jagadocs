export type ToolId =
  | 'watermark-pdf'
  | 'watermark-image'
  | 'crop-pdf'
  | 'pdf-to-image'
  | 'image-to-pdf';

export interface ToolDefinition {
  id: ToolId;
  route: string;
  title: string;
  description: string;
  badge?: string;
  icon: 'FileText' | 'Image' | 'Crop' | 'FileImage' | 'Files';
  color: string;
  lightBg: string;
  acceptedMimeTypes: string;
  acceptedExtensions: string[];
  filePrompt: string;
  samplePrompt: string;
  sampleType: 'pdf' | 'photo';
  studioTab: 'watermark' | 'crop';
}

export const TOOLS: ToolDefinition[] = [
  {
    id: 'watermark-pdf',
    route: '#/watermark-pdf',
    title: 'Watermark PDF',
    description: 'Add vector text, dynamic page numbers, and transparent stamps to multi-page PDFs.',
    badge: 'Vector',
    icon: 'FileText',
    color: '#7CB342', // Grass Green
    lightBg: '#F1F8E9',
    acceptedMimeTypes: 'application/pdf',
    acceptedExtensions: ['.pdf'],
    filePrompt: 'Choose a PDF',
    samplePrompt: 'Try with a 3-page sample PDF',
    sampleType: 'pdf',
    studioTab: 'watermark',
  },
  {
    id: 'watermark-image',
    route: '#/watermark-image',
    title: 'Watermark Photo & Image',
    description: 'Batch watermark photos with 9-grid snapping, custom positions, or tile repeat.',
    badge: 'Batch',
    icon: 'Image',
    color: '#4FC3F7', // Sky Blue
    lightBg: '#E1F5FE',
    acceptedMimeTypes: 'image/*',
    acceptedExtensions: ['.png', '.jpg', '.jpeg', '.webp', '.svg'],
    filePrompt: 'Choose Photos or Images',
    samplePrompt: 'Try with a sample photo (1200x800)',
    sampleType: 'photo',
    studioTab: 'watermark',
  },
  {
    id: 'crop-pdf',
    route: '#/crop-pdf',
    title: 'Crop & Trim PDF',
    description: 'Trim margins, clean dark scanner edges, and auto-detect white borders.',
    badge: 'Precision',
    icon: 'Crop',
    color: '#F48FB1', // Soft Pink
    lightBg: '#FCE4EC',
    acceptedMimeTypes: 'application/pdf,image/*',
    acceptedExtensions: ['.pdf', '.png', '.jpg'],
    filePrompt: 'Choose a PDF or Document',
    samplePrompt: 'Try with a sample document',
    sampleType: 'pdf',
    studioTab: 'crop',
  },
  {
    id: 'pdf-to-image',
    route: '#/pdf-to-image',
    title: 'PDF to JPG / PNG',
    description: 'Extract and convert every PDF page into clean, high-resolution images.',
    icon: 'FileImage',
    color: '#212635',
    lightBg: '#F5F3EC',
    acceptedMimeTypes: 'application/pdf',
    acceptedExtensions: ['.pdf'],
    filePrompt: 'Choose a PDF to Convert',
    samplePrompt: 'Try with sample PDF',
    sampleType: 'pdf',
    studioTab: 'watermark',
  },
  {
    id: 'image-to-pdf',
    route: '#/image-to-pdf',
    title: 'Image to PDF',
    description: 'Combine multiple JPG, PNG, or WebP images into a single clean PDF document.',
    icon: 'Files',
    color: '#7CB342',
    lightBg: '#F1F8E9',
    acceptedMimeTypes: 'image/*',
    acceptedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
    filePrompt: 'Choose Images to Combine',
    samplePrompt: 'Try with sample photo',
    sampleType: 'photo',
    studioTab: 'watermark',
  },
];

export function getToolByRoute(hash: string): ToolDefinition | null {
  const clean = hash.replace(/^#\/?/, '');
  if (!clean) return null;
  return TOOLS.find((t) => t.route.replace(/^#\/?/, '') === clean) || null;
}

export function getToolById(id: ToolId): ToolDefinition {
  return TOOLS.find((t) => t.id === id) || TOOLS[0];
}
