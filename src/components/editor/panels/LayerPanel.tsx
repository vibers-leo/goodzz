'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Layers,
  Eye,
  EyeOff,
  Trash2,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { useEditorStore } from '@/store/useEditorStore';

interface LayerItem {
  id: string;
  type: string;
  label: string;
  visible: boolean;
  index: number;
  obj: any;
}

export default function LayerPanel() {
  const { canvasRef } = useEditorStore();
  const [layers, setLayers] = useState<LayerItem[]>([]);

  const refreshLayers = useCallback(() => {
    if (!canvasRef) return;

    const objects = canvasRef.getObjects();
    const userObjects = objects.filter(
      (o: any) => !o._isBgMockup && !o._isPrintZone
    );

    const items: LayerItem[] = userObjects.map((obj: any, i: number) => {
      let label = obj.type || 'object';
      if (obj.type === 'textbox' || obj.type === 'i-text') {
        label = (obj.text || '').substring(0, 20) || 'Text';
      } else if (obj.type === 'image') {
        label = 'Image';
      } else if (obj.type === 'rect') {
        label = 'Rectangle';
      } else if (obj.type === 'circle') {
        label = 'Circle';
      } else if (obj.type === 'polygon') {
        label = 'Polygon';
      } else if (obj.type === 'line') {
        label = 'Line';
      }

      return {
        id: obj.id || `layer_${i}`,
        type: obj.type || 'object',
        label,
        visible: obj.visible !== false,
        index: i,
        obj,
      };
    });

    // Reverse so top layer is first
    setLayers(items.reverse());
  }, [canvasRef]);

  useEffect(() => {
    if (!canvasRef) return;

    refreshLayers();

    const events = ['object:added', 'object:removed', 'object:modified'];
    events.forEach((evt) => canvasRef.on(evt, refreshLayers));

    return () => {
      events.forEach((evt) => canvasRef.off(evt, refreshLayers));
    };
  }, [canvasRef, refreshLayers]);

  const handleToggleVisibility = (layer: LayerItem) => {
    layer.obj.set('visible', !layer.visible);
    canvasRef?.renderAll();
    refreshLayers();
  };

  const handleDelete = (layer: LayerItem) => {
    canvasRef?.remove(layer.obj);
    canvasRef?.renderAll();
    refreshLayers();
  };

  const handleMoveUp = (layer: LayerItem) => {
    if (!canvasRef) return;
    const objects = canvasRef.getObjects();
    const idx = objects.indexOf(layer.obj);
    if (idx < objects.length - 1) {
      canvasRef.moveObjectTo(layer.obj, idx + 1);
      canvasRef.renderAll();
      refreshLayers();
    }
  };

  const handleMoveDown = (layer: LayerItem) => {
    if (!canvasRef) return;
    const objects = canvasRef.getObjects();
    const idx = objects.indexOf(layer.obj);
    // Don't move below background/print zone
    const systemCount = objects.filter(
      (o: any) => o._isBgMockup || o._isPrintZone
    ).length;
    if (idx > systemCount) {
      canvasRef.moveObjectTo(layer.obj, idx - 1);
      canvasRef.renderAll();
      refreshLayers();
    }
  };

  const handleSelect = (layer: LayerItem) => {
    if (!canvasRef) return;
    canvasRef.setActiveObject(layer.obj);
    canvasRef.renderAll();
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4">
      <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
        <Layers size={14} className="text-cyan-500" /> 레이어
      </h3>

      {layers.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">
          캔버스에 요소를 추가하세요
        </p>
      ) : (
        <div className="space-y-1">
          {layers.map((layer) => (
            <div
              key={layer.id}
              onClick={() => handleSelect(layer)}
              className="flex items-center gap-2 p-2.5 rounded-xl border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all cursor-pointer group"
            >
              {/* Type badge */}
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500 shrink-0">
                {layer.type === 'image' ? 'IMG' :
                 layer.type === 'textbox' || layer.type === 'i-text' ? 'T' :
                 layer.type === 'rect' ? 'R' :
                 layer.type === 'circle' ? 'C' :
                 layer.type === 'polygon' ? 'P' :
                 layer.type === 'line' ? 'L' : '?'}
              </div>

              {/* Label */}
              <span className="flex-1 text-xs font-medium text-gray-700 truncate">
                {layer.label}
              </span>

              {/* Controls */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMoveUp(layer);
                  }}
                  className="p-1 hover:bg-gray-200 rounded"
                  title="위로"
                >
                  <ChevronUp size={12} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMoveDown(layer);
                  }}
                  className="p-1 hover:bg-gray-200 rounded"
                  title="아래로"
                >
                  <ChevronDown size={12} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleVisibility(layer);
                  }}
                  className="p-1 hover:bg-gray-200 rounded"
                  title={layer.visible ? '숨기기' : '보이기'}
                >
                  {layer.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(layer);
                  }}
                  className="p-1 hover:bg-red-100 text-red-400 rounded"
                  title="삭제"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
