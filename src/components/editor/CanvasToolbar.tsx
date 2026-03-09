'use client';

import React from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  FlipHorizontal,
} from 'lucide-react';
import { useEditorStore } from '@/store/useEditorStore';
import { getPrintConfig } from '@/lib/editor-config';
import { addPrintZoneOverlay } from '@/lib/fabric/canvas-manager';

export default function CanvasToolbar() {
  const {
    product,
    canvasRef,
    zoom,
    setZoom,
    isMockupMode,
    setIsMockupMode,
    activeFace,
    setActiveFace,
    saveFaceState,
    getFaceState,
  } = useEditorStore();

  const printConfig = product ? getPrintConfig(product.category) : null;
  const hasMultipleFaces = (printConfig?.zones.length || 0) > 1;

  const handleFaceToggle = async () => {
    if (!hasMultipleFaces || !canvasRef || !printConfig) return;

    // Save current face state
    const currentState = JSON.stringify(
      canvasRef.toJSON(['id', 'selectable', 'evented', '_isBgMockup', '_isPrintZone'])
    );
    saveFaceState(activeFace, currentState);

    // Switch face
    const nextFace = activeFace === 'front' ? 'back' : 'front';
    const savedState = getFaceState(nextFace);

    // Clear non-system objects
    const objects = canvasRef.getObjects().filter(
      (o: any) => !o._isBgMockup && !o._isPrintZone
    );
    objects.forEach((o: any) => canvasRef.remove(o));

    // Load saved state for new face if it exists
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        // Only restore non-system objects
        const userObjects = parsed.objects?.filter(
          (o: any) => !o._isBgMockup && !o._isPrintZone
        );
        if (userObjects && userObjects.length > 0) {
          const fabric = await import('fabric');
          for (const objData of userObjects) {
            try {
              const objs = await fabric.util.enlivenObjects([objData]);
              objs.forEach((obj: any) => canvasRef.add(obj));
            } catch {
              // Skip objects that can't be revived
            }
          }
        }
      } catch {
        // Invalid saved state, start fresh
      }
    }

    // Update print zone overlay
    const zone = printConfig.zones.find((z) => z.id === nextFace) || printConfig.zones[0];
    if (zone) {
      await addPrintZoneOverlay(canvasRef, zone, canvasRef.getWidth(), canvasRef.getHeight());
    }

    setActiveFace(nextFace);
    canvasRef.renderAll();
  };

  const zoomPercent = Math.round(zoom * 100);

  return (
    <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex items-center bg-white/90 backdrop-blur-md px-6 py-3 rounded-2xl shadow-xl border border-white/50 gap-6">
      {/* Zoom controls */}
      <div className="flex items-center gap-3 border-r pr-6">
        <button
          onClick={() => setZoom(zoom - 0.1)}
          className="p-1 hover:bg-gray-100 rounded-md"
        >
          <ZoomOut size={16} />
        </button>
        <span className="text-xs font-bold w-12 text-center">{zoomPercent}%</span>
        <button
          onClick={() => setZoom(zoom + 0.1)}
          className="p-1 hover:bg-gray-100 rounded-md"
        >
          <ZoomIn size={16} />
        </button>
      </div>

      {/* Rotation reset */}
      <div className="flex items-center gap-2 border-r pr-6">
        <button
          onClick={() => {
            if (!canvasRef) return;
            const active = canvasRef.getActiveObject();
            if (active) {
              active.set('angle', 0);
              canvasRef.renderAll();
            }
          }}
          className="p-1 hover:bg-gray-100 rounded-md text-gray-400 hover:text-gray-600"
          title="회전 초기화"
        >
          <RotateCw size={14} />
        </button>
      </div>

      {/* Face toggle */}
      {hasMultipleFaces && (
        <div className="flex items-center gap-2 border-r pr-6">
          <button
            onClick={handleFaceToggle}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold hover:bg-gray-100 transition-all"
          >
            <FlipHorizontal size={14} />
            {activeFace === 'front' ? '앞면' : '뒷면'}
          </button>
        </div>
      )}

      {/* Mockup mode */}
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isMockupMode}
            onChange={(e) => setIsMockupMode(e.target.checked)}
            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
          />
          <span className="text-xs font-bold text-gray-600">목업 모드</span>
        </label>
      </div>
    </div>
  );
}
