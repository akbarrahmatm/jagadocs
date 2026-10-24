import type {
  GridPosition,
  ImageWatermarkConfig,
  TextWatermarkConfig,
  WatermarkConfig,
} from '../types/watermark';
import { parseWatermarkTokens, type TokenContext } from './tokenParser';
import { toPixels } from './cropUtils';

export interface RenderWatermarkOptions {
  canvas: HTMLCanvasElement;
  sourceImage: HTMLImageElement | HTMLCanvasElement;
  config: WatermarkConfig;
  tokenContext?: TokenContext;
  logoImage?: HTMLImageElement | null;
  previewMode?: 'cropped' | 'guides';
}

/**
 * Calculates absolute font size based on config and canvas dimensions
 */
export function calculateFontSize(
  textConfig: TextWatermarkConfig,
  canvasWidth: number,
  canvasHeight: number
): number {
  if (textConfig.fontSizeMode === 'percent') {
    const minDim = Math.min(canvasWidth, canvasHeight);
    return Math.max(10, Math.round((minDim * textConfig.fontSizePercent) / 100));
  }
  // Fixed size scaled relative to a standard 1000px baseline
  const scaleFactor = Math.max(canvasWidth, canvasHeight) / 1000;
  return Math.max(8, Math.round(textConfig.fontSize * scaleFactor));
}

/**
 * Calculates X/Y coordinates for 9-grid preset positions
 */
export function calculateGridCoordinates(
  position: GridPosition,
  canvasWidth: number,
  canvasHeight: number,
  itemWidth: number,
  itemHeight: number,
  marginPercent = 4
): { x: number; y: number } {
  const marginX = (canvasWidth * marginPercent) / 100;
  const marginY = (canvasHeight * marginPercent) / 100;

  let x: number;
  if (position.includes('left')) {
    x = marginX + itemWidth / 2;
  } else if (position.includes('right')) {
    x = canvasWidth - marginX - itemWidth / 2;
  } else {
    x = canvasWidth / 2;
  }

  let y: number;
  if (position.includes('top')) {
    y = marginY + itemHeight / 2;
  } else if (position.includes('bottom')) {
    y = canvasHeight - marginY - itemHeight / 2;
  } else {
    y = canvasHeight / 2;
  }

  return { x, y };
}

/**
 * Draws rounded rectangle path
 */
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/**
 * Measures multi-line text dimensions
 */
export function measureTextBounds(
  ctx: CanvasRenderingContext2D,
  lines: string[],
  lineHeight: number
): { width: number; height: number } {
  let maxWidth = 0;
  for (const line of lines) {
    const metrics = ctx.measureText(line);
    if (metrics.width > maxWidth) {
      maxWidth = metrics.width;
    }
  }
  const height = lines.length * lineHeight;
  return { width: maxWidth, height };
}

/**
 * Draws text watermark block at a specific center coordinate
 */
function drawSingleTextBlock(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  lines: string[],
  fontSize: number,
  lineHeight: number,
  textConfig: TextWatermarkConfig,
  bounds: { width: number; height: number }
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((textConfig.rotation * Math.PI) / 180);

  // Background box if enabled
  if (textConfig.background) {
    const pad = (textConfig.bgPadding * fontSize) / 24;
    const bgW = bounds.width + pad * 2;
    const bgH = bounds.height + pad * 2;
    const bgX = -bgW / 2;
    const bgY = -bgH / 2;

    ctx.save();
    ctx.globalAlpha = ctx.globalAlpha * textConfig.bgOpacity;
    ctx.fillStyle = textConfig.bgColor;
    drawRoundedRect(ctx, bgX, bgY, bgW, bgH, textConfig.bgRadius);
    ctx.fill();
    ctx.restore();
  }

  // Text Shadow
  if (textConfig.shadow) {
    ctx.shadowColor = textConfig.shadowColor;
    ctx.shadowBlur = (textConfig.shadowBlur * fontSize) / 24;
    ctx.shadowOffsetX = (fontSize * 0.08);
    ctx.shadowOffsetY = (fontSize * 0.08);
  } else {
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
  }

  // Draw lines
  lines.forEach((line, index) => {
    const currentY = (index - (lines.length - 1) / 2) * lineHeight;

    // Stroke / Outline
    if (textConfig.stroke && textConfig.strokeWidth > 0) {
      ctx.strokeStyle = textConfig.strokeColor;
      ctx.lineWidth = (textConfig.strokeWidth * fontSize) / 24;
      ctx.lineJoin = 'round';
      ctx.strokeText(line, 0, currentY);
    }

    // Fill
    ctx.fillStyle = textConfig.color;
    ctx.fillText(line, 0, currentY);

    // Underline
    if (textConfig.underline) {
      const metrics = ctx.measureText(line);
      const textW = metrics.width;
      const underlineY = currentY + fontSize * 0.55;
      ctx.save();
      ctx.strokeStyle = textConfig.color;
      ctx.lineWidth = Math.max(1, fontSize * 0.08);
      ctx.beginPath();
      ctx.moveTo(-textW / 2, underlineY);
      ctx.lineTo(textW / 2, underlineY);
      ctx.stroke();
      ctx.restore();
    }
  });

  ctx.restore();
}

/**
 * Draws image watermark block at a specific center coordinate
 */
function drawSingleImageBlock(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  logoImg: HTMLImageElement,
  imgConfig: ImageWatermarkConfig,
  targetW: number,
  targetH: number
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((imgConfig.rotation * Math.PI) / 180);
  ctx.drawImage(logoImg, -targetW / 2, -targetH / 2, targetW, targetH);
  ctx.restore();
}

/**
 * Main function to render watermarked image onto a canvas
 */
export function renderWatermarkOnCanvas(options: RenderWatermarkOptions) {
  const {
    canvas,
    sourceImage,
    config,
    tokenContext,
    logoImage,
    previewMode = 'cropped',
  } = options;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const rawWidth = (sourceImage as HTMLImageElement).naturalWidth || sourceImage.width;
  const rawHeight = (sourceImage as HTMLImageElement).naturalHeight || sourceImage.height;

  const isCropActive =
    !!config.crop?.enabled &&
    (config.crop.top > 0 ||
      config.crop.bottom > 0 ||
      config.crop.left > 0 ||
      config.crop.right > 0);

  let cropL = 0;
  let cropR = 0;
  let cropT = 0;
  let cropB = 0;
  let activeW = rawWidth;
  let activeH = rawHeight;
  let shiftX = 0;
  let shiftY = 0;

  if (isCropActive) {
    cropL = Math.max(0, Math.round(toPixels(config.crop.left, config.crop.unit, rawWidth)));
    cropR = Math.max(0, Math.round(toPixels(config.crop.right, config.crop.unit, rawWidth)));
    cropT = Math.max(0, Math.round(toPixels(config.crop.top, config.crop.unit, rawHeight)));
    cropB = Math.max(0, Math.round(toPixels(config.crop.bottom, config.crop.unit, rawHeight)));

    activeW = Math.max(10, rawWidth - cropL - cropR);
    activeH = Math.max(10, rawHeight - cropT - cropB);
  }

  if (previewMode === 'cropped' && isCropActive) {
    // Canvas dimensions are clipped to cropped area
    canvas.width = activeW;
    canvas.height = activeH;
    ctx.clearRect(0, 0, activeW, activeH);
    ctx.drawImage(sourceImage, cropL, cropT, activeW, activeH, 0, 0, activeW, activeH);
    shiftX = 0;
    shiftY = 0;
  } else {
    // Full image view with crop guides
    canvas.width = rawWidth;
    canvas.height = rawHeight;
    ctx.clearRect(0, 0, rawWidth, rawHeight);
    ctx.drawImage(sourceImage, 0, 0, rawWidth, rawHeight);

    if (isCropActive) {
      shiftX = cropL;
      shiftY = cropT;

      // Draw semi-transparent dark mask over trimmed margins
      ctx.save();
      ctx.fillStyle = 'rgba(2, 6, 23, 0.65)';
      if (cropT > 0) ctx.fillRect(0, 0, rawWidth, cropT);
      if (cropB > 0) ctx.fillRect(0, rawHeight - cropB, rawWidth, cropB);
      if (cropL > 0) ctx.fillRect(0, cropT, cropL, rawHeight - cropT - cropB);
      if (cropR > 0) ctx.fillRect(rawWidth - cropR, cropT, cropR, rawHeight - cropT - cropB);

      // Subtle crop border
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = Math.max(2, Math.round(rawWidth / 500));
      ctx.setLineDash([8, 6]);
      ctx.strokeRect(cropL, cropT, activeW, activeH);
      ctx.restore();
    }
  }

  const isWatermarkEnabled = config.watermarkEnabled !== false && config.type !== 'none';
  if (!isWatermarkEnabled) return;

  // 2. Render Text Watermark
  if (config.type === 'text') {
    const rawText = parseWatermarkTokens(config.text.text, tokenContext);
    if (!rawText.trim()) return;

    const lines = rawText.split('\n');
    const fontSize = calculateFontSize(config.text, activeW, activeH);
    const lineHeight = fontSize * 1.25;

    // Setup font
    const fontStyle = config.text.italic ? 'italic ' : '';
    const fontWeight = config.text.bold ? 'bold ' : 'normal ';
    ctx.font = `${fontStyle}${fontWeight}${fontSize}px ${config.text.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const bounds = measureTextBounds(ctx, lines, lineHeight);

    ctx.save();
    ctx.globalAlpha = config.text.opacity;

    if (config.positionMode === 'tile') {
      // Repeating pattern inside active area
      const gapX = Math.max(80, (config.tileSettings.gapX * activeW) / 1000) + bounds.width;
      const gapY = Math.max(60, (config.tileSettings.gapY * activeH) / 1000) + bounds.height;
      const diagOffset = config.tileSettings.diagonalOffset ? gapX / 2 : 0;

      let row = 0;
      for (let y = -bounds.height; y <= activeH + bounds.height + gapY; y += gapY) {
        const xOffset = row % 2 === 1 ? diagOffset : 0;
        for (let x = -bounds.width; x <= activeW + bounds.width + gapX; x += gapX) {
          drawSingleTextBlock(
            ctx,
            shiftX + x + xOffset,
            shiftY + y,
            lines,
            fontSize,
            lineHeight,
            config.text,
            bounds
          );
        }
        row++;
      }
    } else if (config.positionMode === 'custom') {
      const x = shiftX + (config.customPosition.xPercent / 100) * activeW;
      const y = shiftY + (config.customPosition.yPercent / 100) * activeH;
      drawSingleTextBlock(ctx, x, y, lines, fontSize, lineHeight, config.text, bounds);
    } else {
      // Grid preset
      const coords = calculateGridCoordinates(
        config.gridPosition,
        activeW,
        activeH,
        bounds.width,
        bounds.height
      );
      drawSingleTextBlock(
        ctx,
        shiftX + coords.x,
        shiftY + coords.y,
        lines,
        fontSize,
        lineHeight,
        config.text,
        bounds
      );
    }

    ctx.restore();
  }

  // 3. Render Image Watermark
  if (config.type === 'image' && logoImage) {
    const logoW = logoImage.naturalWidth || logoImage.width;
    const logoH = logoImage.naturalHeight || logoImage.height;
    if (logoW <= 0 || logoH <= 0) return;

    // Scale calculation relative to active bounds
    const maxDimension = Math.min(activeW, activeH);
    const targetScale = config.image.scalePercent / 100;
    const baseW = maxDimension * targetScale;
    const aspectRatio = logoW / logoH;
    const targetW = baseW;
    const targetH = baseW / aspectRatio;

    ctx.save();
    ctx.globalAlpha = config.image.opacity;

    if (config.positionMode === 'tile') {
      const gapX = Math.max(80, (config.tileSettings.gapX * activeW) / 1000) + targetW;
      const gapY = Math.max(60, (config.tileSettings.gapY * activeH) / 1000) + targetH;
      const diagOffset = config.tileSettings.diagonalOffset ? gapX / 2 : 0;

      let row = 0;
      for (let y = -targetH; y <= activeH + targetH + gapY; y += gapY) {
        const xOffset = row % 2 === 1 ? diagOffset : 0;
        for (let x = -targetW; x <= activeW + targetW + gapX; x += gapX) {
          drawSingleImageBlock(
            ctx,
            shiftX + x + xOffset,
            shiftY + y,
            logoImage,
            config.image,
            targetW,
            targetH
          );
        }
        row++;
      }
    } else if (config.positionMode === 'custom') {
      const x = shiftX + (config.customPosition.xPercent / 100) * activeW;
      const y = shiftY + (config.customPosition.yPercent / 100) * activeH;
      drawSingleImageBlock(ctx, x, y, logoImage, config.image, targetW, targetH);
    } else {
      const coords = calculateGridCoordinates(
        config.gridPosition,
        activeW,
        activeH,
        targetW,
        targetH
      );
      drawSingleImageBlock(
        ctx,
        shiftX + coords.x,
        shiftY + coords.y,
        logoImage,
        config.image,
        targetW,
        targetH
      );
    }

    ctx.restore();
  }
}

/**
 * Export canvas to Blob with chosen format & quality
 */
export async function exportCanvasToBlob(
  canvas: HTMLCanvasElement,
  format: 'png' | 'jpeg' | 'webp',
  quality = 0.92
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const mimeType = format === 'jpeg' ? 'image/jpeg' : format === 'webp' ? 'image/webp' : 'image/png';
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to generate image blob'));
      },
      mimeType,
      quality
    );
  });
}
