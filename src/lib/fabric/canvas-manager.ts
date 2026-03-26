'use client';

import type { PrintZone } from '@/lib/editor-config';

let fabricModule: typeof import('fabric') | null = null;

async function getFabric() {
  if (!fabricModule) {
    fabricModule = await import('fabric');
  }
  return fabricModule;
}

export interface CanvasInitOptions {
  width?: number;
  height?: number;
  backgroundColor?: string;
}

export async function initCanvas(
  element: HTMLCanvasElement,
  options: CanvasInitOptions = {}
) {
  const { Canvas } = await getFabric();

  const canvas = new Canvas(element, {
    width: options.width || 600,
    height: options.height || 600,
    backgroundColor: options.backgroundColor || '#ffffff',
    selection: true,
    preserveObjectStacking: true,
    stopContextMenu: true,
    fireRightClick: true,
  });

  // Default control styling
  const fabricAny = canvas as any;
  if (fabricAny.selectionColor !== undefined) {
    fabricAny.selectionColor = 'rgba(16, 185, 129, 0.1)';
    fabricAny.selectionBorderColor = '#10b981';
    fabricAny.selectionLineWidth = 1.5;
  }

  return canvas;
}

export function resizeCanvas(
  canvas: any,
  width: number,
  height: number
) {
  canvas.setDimensions({ width, height });
  canvas.renderAll();
}

export function disposeCanvas(canvas: any) {
  if (canvas) {
    canvas.dispose();
  }
}

export async function setBackgroundFromURL(
  canvas: any,
  url: string
) {
  const { FabricImage } = await getFabric();

  try {
    const img = await FabricImage.fromURL(url, { crossOrigin: 'anonymous' });
    const canvasWidth = canvas.getWidth();
    const canvasHeight = canvas.getHeight();

    img.scaleToWidth(canvasWidth);
    img.scaleToHeight(canvasHeight);

    img.set({
      selectable: false,
      evented: false,
      excludeFromExport: false,
      originX: 'left',
      originY: 'top',
    } as any);

    // Remove existing background image if any
    const objects = canvas.getObjects();
    const existingBg = objects.find((o: any) => o._isBgMockup);
    if (existingBg) {
      canvas.remove(existingBg);
    }

    (img as any)._isBgMockup = true;
    canvas.insertAt(0, img);
    canvas.renderAll();
  } catch (error) {
    console.error('Failed to set background image:', error);
  }
}

export async function addPrintZoneOverlay(
  canvas: any,
  zone: PrintZone,
  canvasWidth: number,
  canvasHeight: number
) {
  const { Rect, FabricText } = await getFabric();

  // Remove existing print zone overlays
  const objects = canvas.getObjects();
  const existing = objects.filter((o: any) => o._isPrintZone);
  existing.forEach((o: any) => canvas.remove(o));

  const x = (zone.x / 100) * canvasWidth;
  const y = (zone.y / 100) * canvasHeight;
  const w = (zone.width / 100) * canvasWidth;
  const h = (zone.height / 100) * canvasHeight;

  const rect = new Rect({
    left: x,
    top: y,
    width: w,
    height: h,
    fill: 'transparent',
    stroke: '#3b82f6',
    strokeWidth: 1.5,
    strokeDashArray: [6, 3],
    selectable: false,
    evented: false,
    excludeFromExport: true,
    opacity: 0.8,
  } as any);
  (rect as any)._isPrintZone = true;

  // Safe Zone (80% of Print Zone)
  const safePadding = w * 0.1;
  const safeRect = new Rect({
    left: x + safePadding,
    top: y + safePadding,
    width: w - safePadding * 2,
    height: h - safePadding * 2,
    fill: 'transparent',
    stroke: '#10b981',
    strokeWidth: 1,
    strokeDashArray: [2, 2],
    selectable: false,
    evented: false,
    excludeFromExport: true,
    opacity: 0.5,
  } as any);
  (safeRect as any)._isPrintZone = true;

  const label = new FabricText(`${zone.label} (Print Area)`, {
    left: x,
    top: y - 22,
    fontSize: 10,
    fontWeight: 'bold',
    fill: '#ffffff',
    backgroundColor: '#3b82f6',
    padding: 4,
    selectable: false,
    evented: false,
    excludeFromExport: true,
  } as any);
  (label as any)._isPrintZone = true;

  canvas.add(rect);
  canvas.add(safeRect);
  canvas.add(label);
  canvas.renderAll();
}
