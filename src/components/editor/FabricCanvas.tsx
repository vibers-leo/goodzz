'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { getPrintConfig } from '@/lib/editor-config';
import {
  initCanvas,
  resizeCanvas,
  disposeCanvas,
  setBackgroundFromURL,
  addPrintZoneOverlay,
} from '@/lib/fabric/canvas-manager';

export default function FabricCanvas() {
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fabricRef = useRef<any>(null);

  const {
    product,
    activeFace,
    setCanvas,
    setSelectedObjectIds,
    zoom,
    isMockupMode,
  } = useEditorStore();

  // Initialize canvas
  useEffect(() => {
    if (!canvasElRef.current || !product) return;

    let disposed = false;

    const setup = async () => {
      const canvas = await initCanvas(canvasElRef.current!, {
        width: 600,
        height: 600,
      });

      if (disposed) {
        disposeCanvas(canvas);
        return;
      }

      fabricRef.current = canvas;
      setCanvas(canvas);

      // Set product mockup as background
      await setBackgroundFromURL(canvas, product.thumbnail);

      // Add print zone overlay
      const printConfig = getPrintConfig(product.category);
      const zone = printConfig.zones.find((z) => z.id === activeFace) || printConfig.zones[0];
      if (zone) {
        await addPrintZoneOverlay(canvas, zone, 600, 600);
      }

      // Event listeners for selection sync
      canvas.on('selection:created', (e: any) => {
        const selected = e.selected || [];
        setSelectedObjectIds(selected.map((o: any) => o.id).filter(Boolean));
      });

      canvas.on('selection:updated', (e: any) => {
        const selected = e.selected || [];
        setSelectedObjectIds(selected.map((o: any) => o.id).filter(Boolean));
      });

      canvas.on('selection:cleared', () => {
        setSelectedObjectIds([]);
      });

      // Capture history on object modification
      canvas.on('object:modified', () => {
        captureHistory(canvas);
      });

      canvas.on('object:added', (e: any) => {
        const obj = e.target;
        // Don't capture history for background/print zone additions
        if (obj && !obj._isBgMockup && !obj._isPrintZone) {
          captureHistory(canvas);
        }
      });
    };

    setup();

    return () => {
      disposed = true;
      if (fabricRef.current) {
        disposeCanvas(fabricRef.current);
        fabricRef.current = null;
        setCanvas(null);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id]);

  // Debounced history capture
  const historyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const captureHistory = useCallback((canvas: any) => {
    if (historyTimer.current) clearTimeout(historyTimer.current);
    historyTimer.current = setTimeout(() => {
      const json = JSON.stringify(
        canvas.toJSON(['id', 'selectable', 'evented', '_isBgMockup', '_isPrintZone'])
      );
      useEditorStore.getState().pushHistory(json);
    }, 300);
  }, []);

  // Handle face change
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas || !product) return;

    const updateZone = async () => {
      const printConfig = getPrintConfig(product.category);
      const zone = printConfig.zones.find((z) => z.id === activeFace) || printConfig.zones[0];
      if (zone) {
        await addPrintZoneOverlay(canvas, zone, canvas.getWidth(), canvas.getHeight());
      }
    };
    updateZone();
  }, [activeFace, product]);

  // Handle zoom
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    canvas.setZoom(zoom);
    canvas.renderAll();
  }, [zoom]);

  // Responsive resize
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        const size = Math.min(width, 600);
        if (fabricRef.current) {
          resizeCanvas(fabricRef.current, size, size);
        }
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Mouse wheel zoom
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const handleWheel = (opt: any) => {
      const e = opt.e as WheelEvent;
      e.preventDefault();
      e.stopPropagation();

      const delta = e.deltaY;
      const currentZoom = useEditorStore.getState().zoom;
      const newZoom = delta > 0
        ? Math.max(0.25, currentZoom - 0.05)
        : Math.min(4, currentZoom + 0.05);

      useEditorStore.getState().setZoom(newZoom);
    };

    canvas.on('mouse:wheel', handleWheel);
    return () => {
      canvas.off('mouse:wheel', handleWheel);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative group/canvas">
      <div
        className="aspect-square bg-white shadow-2xl relative overflow-hidden"
        style={{ width: 'min(600px, 90vw)', cursor: 'crosshair' }}
      >
        <canvas ref={canvasElRef} />
      </div>
    </div>
  );
}
