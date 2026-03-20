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
      // 제품 카테고리에 따른 초기 캔버스 크기 계산
      const printConfig = getPrintConfig(product.category);
      const aspectRatio = printConfig.canvasAspectRatio || 1;

      let initialWidth = 600;
      let initialHeight = 600;

      if (aspectRatio !== 1) {
        // 명함 등 특수 비율: 너비 600px 기준으로 높이 계산
        initialWidth = 600;
        initialHeight = Math.round(initialWidth / aspectRatio);
      }

      const canvas = await initCanvas(canvasElRef.current!, {
        width: initialWidth,
        height: initialHeight,
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
      const zone = printConfig.zones.find((z) => z.id === activeFace) || printConfig.zones[0];
      if (zone) {
        await addPrintZoneOverlay(canvas, zone, initialWidth, initialHeight);
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
    if (!container || !product) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (fabricRef.current) {
          // 명함 등 특수 가로세로 비율 제품 지원
          const printConfig = getPrintConfig(product.category);
          const aspectRatio = printConfig.canvasAspectRatio;

          if (aspectRatio) {
            // 가로세로 비율이 정의된 경우 (예: 명함 1.8)
            const maxWidth = Math.min(width - 80, 800);
            const maxHeight = Math.min(height - 80, 600);

            let canvasWidth = maxWidth;
            let canvasHeight = canvasWidth / aspectRatio;

            // 높이가 컨테이너를 초과하면 높이 기준으로 재계산
            if (canvasHeight > maxHeight) {
              canvasHeight = maxHeight;
              canvasWidth = canvasHeight * aspectRatio;
            }

            resizeCanvas(fabricRef.current, canvasWidth, canvasHeight);
          } else {
            // 기본 정사각형 (기존 로직)
            const size = Math.min(width, 600);
            resizeCanvas(fabricRef.current, size, size);
          }
        }
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, [product]);

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
