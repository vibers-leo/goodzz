'use client';

import React, { useState } from 'react';
import { Shapes } from 'lucide-react';
import { useEditorStore } from '@/store/useEditorStore';
import { addShapeToCanvas, ShapeType } from '@/lib/fabric/object-helpers';

const SHAPES: { type: ShapeType; label: string; icon: string }[] = [
  { type: 'rect', label: '사각형', icon: '⬜' },
  { type: 'circle', label: '원', icon: '⭕' },
  { type: 'triangle', label: '삼각형', icon: '🔺' },
  { type: 'star', label: '별', icon: '⭐' },
  { type: 'line', label: '선', icon: '➖' },
];

const PRESET_COLORS = [
  '#10b981', '#3b82f6', '#8b5cf6', '#ef4444',
  '#f59e0b', '#ec4899', '#000000', '#6b7280',
];

export default function ShapeToolPanel() {
  const { canvasRef } = useEditorStore();
  const [fill, setFill] = useState('#10b981');
  const [stroke, setStroke] = useState('');
  const [strokeWidth, setStrokeWidth] = useState(0);

  const handleAddShape = async (type: ShapeType) => {
    if (!canvasRef) return;
    await addShapeToCanvas(canvasRef, type, { fill, stroke, strokeWidth });
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
        <Shapes size={14} className="text-orange-500" /> 도형 추가
      </h3>

      {/* Shape buttons */}
      <div className="grid grid-cols-3 gap-3">
        {SHAPES.map((shape) => (
          <button
            key={shape.type}
            onClick={() => handleAddShape(shape.type)}
            className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-xl hover:border-emerald-300 hover:bg-emerald-50/30 transition-all"
          >
            <span className="text-2xl">{shape.icon}</span>
            <span className="text-[10px] font-bold text-gray-600">{shape.label}</span>
          </button>
        ))}
      </div>

      {/* Fill color */}
      <div className="space-y-2">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
          채우기 색상
        </label>
        <div className="flex flex-wrap gap-2">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => setFill(color)}
              className={`w-8 h-8 rounded-lg border-2 transition-all ${
                fill === color ? 'border-gray-800 scale-110' : 'border-gray-200'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
          <input
            type="color"
            value={fill}
            onChange={(e) => setFill(e.target.value)}
            className="w-8 h-8 rounded-lg border border-gray-200 cursor-pointer"
          />
        </div>
      </div>

      {/* Stroke */}
      <div className="space-y-2">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
          테두리
        </label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={stroke || '#000000'}
            onChange={(e) => setStroke(e.target.value)}
            className="w-8 h-8 rounded-lg border border-gray-200 cursor-pointer"
          />
          <input
            type="range"
            min={0}
            max={10}
            value={strokeWidth}
            onChange={(e) => setStrokeWidth(Number(e.target.value))}
            className="flex-1 accent-orange-500"
          />
          <span className="text-xs font-bold w-8 text-right">{strokeWidth}px</span>
        </div>
      </div>
    </div>
  );
}
