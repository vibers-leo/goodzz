'use client';

let fabricModule: typeof import('fabric') | null = null;

async function getFabric() {
  if (!fabricModule) {
    fabricModule = await import('fabric');
  }
  return fabricModule;
}

function generateId(): string {
  return `obj_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

/** Get the print zone rect bounds from canvas */
function getPrintZoneBounds(canvas: any): { x: number; y: number; w: number; h: number } | null {
  const objects = canvas.getObjects();
  const zoneRect = objects.find((o: any) => o._isPrintZone && o.type === 'rect');
  if (zoneRect) {
    return {
      x: zoneRect.left,
      y: zoneRect.top,
      w: zoneRect.width * (zoneRect.scaleX || 1),
      h: zoneRect.height * (zoneRect.scaleY || 1),
    };
  }
  return { x: 0, y: 0, w: canvas.getWidth(), h: canvas.getHeight() };
}

export async function addImageToCanvas(
  canvas: any,
  imageUrl: string,
  options?: { maxWidth?: number; maxHeight?: number }
) {
  const { FabricImage } = await getFabric();

  const img = await FabricImage.fromURL(imageUrl, { crossOrigin: 'anonymous' });
  const zone = getPrintZoneBounds(canvas);

  if (zone) {
    const maxW = options?.maxWidth || zone.w * 0.8;
    const maxH = options?.maxHeight || zone.h * 0.8;
    const imgW = (img as any).width || 100;
    const imgH = (img as any).height || 100;
    const scale = Math.min(maxW / imgW, maxH / imgH, 1);

    img.set({
      scaleX: scale,
      scaleY: scale,
      left: zone.x + zone.w / 2,
      top: zone.y + zone.h / 2,
      originX: 'center',
      originY: 'center',
    });
  }

  (img as any).id = generateId();
  img.setControlsVisibility({
    mt: true, mb: true, ml: true, mr: true,
    tl: true, tr: true, bl: true, br: true,
    mtr: true,
  });

  canvas.add(img);
  canvas.setActiveObject(img);
  canvas.renderAll();
  return img;
}

export interface TextOptions {
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  fill?: string;
  fontWeight?: string | number;
  fontStyle?: string;
  underline?: boolean;
  textAlign?: string;
}

export async function addTextToCanvas(
  canvas: any,
  options: TextOptions = {}
) {
  const { Textbox } = await getFabric();

  const zone = getPrintZoneBounds(canvas);
  const text = new Textbox(options.text || '텍스트를 입력하세요', {
    fontFamily: options.fontFamily || 'Noto Sans KR, sans-serif',
    fontSize: options.fontSize || 32,
    fill: options.fill || '#000000',
    fontWeight: options.fontWeight || 'normal',
    fontStyle: options.fontStyle || 'normal',
    underline: options.underline || false,
    textAlign: (options.textAlign as any) || 'center',
    left: zone ? zone.x + zone.w / 2 : canvas.getWidth() / 2,
    top: zone ? zone.y + zone.h / 2 : canvas.getHeight() / 2,
    originX: 'center',
    originY: 'center',
    width: zone ? zone.w * 0.6 : 200,
    editable: true,
  } as any);

  (text as any).id = generateId();
  canvas.add(text);
  canvas.setActiveObject(text);
  canvas.renderAll();
  return text;
}

export type ShapeType = 'rect' | 'circle' | 'triangle' | 'star' | 'line';

export interface ShapeOptions {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  size?: number;
}

export async function addShapeToCanvas(
  canvas: any,
  shapeType: ShapeType,
  options: ShapeOptions = {}
) {
  const fabric = await getFabric();
  const zone = getPrintZoneBounds(canvas);

  const fill = options.fill || '#10b981';
  const stroke = options.stroke || '';
  const strokeWidth = options.strokeWidth || 0;
  const size = options.size || 80;

  const centerX = zone ? zone.x + zone.w / 2 : canvas.getWidth() / 2;
  const centerY = zone ? zone.y + zone.h / 2 : canvas.getHeight() / 2;

  let shape: any;

  switch (shapeType) {
    case 'rect':
      shape = new fabric.Rect({
        width: size,
        height: size,
        fill,
        stroke,
        strokeWidth,
        left: centerX,
        top: centerY,
        originX: 'center',
        originY: 'center',
        rx: 4,
        ry: 4,
      });
      break;

    case 'circle':
      shape = new fabric.Circle({
        radius: size / 2,
        fill,
        stroke,
        strokeWidth,
        left: centerX,
        top: centerY,
        originX: 'center',
        originY: 'center',
      });
      break;

    case 'triangle': {
      const half = size / 2;
      shape = new fabric.Polygon(
        [
          { x: 0, y: -half },
          { x: half, y: half },
          { x: -half, y: half },
        ],
        {
          fill,
          stroke,
          strokeWidth,
          left: centerX,
          top: centerY,
          originX: 'center',
          originY: 'center',
        }
      );
      break;
    }

    case 'star': {
      const points: { x: number; y: number }[] = [];
      const outerR = size / 2;
      const innerR = outerR * 0.4;
      for (let i = 0; i < 10; i++) {
        const r = i % 2 === 0 ? outerR : innerR;
        const angle = (Math.PI / 5) * i - Math.PI / 2;
        points.push({
          x: r * Math.cos(angle),
          y: r * Math.sin(angle),
        });
      }
      shape = new fabric.Polygon(points, {
        fill,
        stroke,
        strokeWidth,
        left: centerX,
        top: centerY,
        originX: 'center',
        originY: 'center',
      });
      break;
    }

    case 'line':
      shape = new fabric.Line(
        [centerX - size / 2, centerY, centerX + size / 2, centerY],
        {
          stroke: fill,
          strokeWidth: strokeWidth || 3,
          originX: 'center',
          originY: 'center',
        }
      );
      break;
  }

  if (shape) {
    (shape as any).id = generateId();
    canvas.add(shape);
    canvas.setActiveObject(shape);
    canvas.renderAll();
  }
  return shape;
}
