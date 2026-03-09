'use client';

import React, { useState, useEffect } from 'react';
import {
  Type,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Plus,
} from 'lucide-react';
import { useEditorStore } from '@/store/useEditorStore';
import { addTextToCanvas } from '@/lib/fabric/object-helpers';

const KOREAN_FONTS = [
  { value: 'Noto Sans KR, sans-serif', label: 'Noto Sans KR' },
  { value: 'Nanum Gothic, sans-serif', label: '나눔고딕' },
  { value: 'Nanum Myeongjo, serif', label: '나눔명조' },
  { value: 'Black Han Sans, sans-serif', label: 'Black Han Sans' },
  { value: 'Jua, sans-serif', label: '주아' },
  { value: 'Do Hyeon, sans-serif', label: '도현' },
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: 'Georgia, serif', label: 'Georgia' },
];

export default function TextToolPanel() {
  const { canvasRef, selectedObjectIds } = useEditorStore();

  const [fontFamily, setFontFamily] = useState(KOREAN_FONTS[0].value);
  const [fontSize, setFontSize] = useState(32);
  const [fill, setFill] = useState('#000000');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [textAlign, setTextAlign] = useState('center');

  // Sync state when a text object is selected
  useEffect(() => {
    if (!canvasRef || selectedObjectIds.length === 0) return;

    const active = canvasRef.getActiveObject();
    if (!active || (active.type !== 'textbox' && active.type !== 'i-text')) return;

    setFontFamily(active.fontFamily || KOREAN_FONTS[0].value);
    setFontSize(active.fontSize || 32);
    setFill(active.fill as string || '#000000');
    setIsBold(active.fontWeight === 'bold' || active.fontWeight >= 700);
    setIsItalic(active.fontStyle === 'italic');
    setIsUnderline(active.underline || false);
    setTextAlign(active.textAlign || 'center');
  }, [canvasRef, selectedObjectIds]);

  const getActiveTextObject = () => {
    if (!canvasRef) return null;
    const active = canvasRef.getActiveObject();
    if (active && (active.type === 'textbox' || active.type === 'i-text')) {
      return active;
    }
    return null;
  };

  const updateActiveText = (props: Record<string, any>) => {
    const obj = getActiveTextObject();
    if (obj) {
      obj.set(props);
      canvasRef?.renderAll();
    }
  };

  const handleAddText = async () => {
    if (!canvasRef) return;
    await addTextToCanvas(canvasRef, {
      fontFamily,
      fontSize,
      fill,
      fontWeight: isBold ? 'bold' : 'normal',
      fontStyle: isItalic ? 'italic' : 'normal',
      underline: isUnderline,
      textAlign,
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
        <Type size={14} className="text-purple-500" /> 텍스트 도구
      </h3>

      {/* Add text button */}
      <button
        onClick={handleAddText}
        className="w-full flex items-center justify-center gap-2 py-3 bg-purple-50 border border-purple-200 rounded-xl text-sm font-bold text-purple-700 hover:bg-purple-100 transition-all"
      >
        <Plus size={16} /> 텍스트 추가
      </button>

      {/* Font family */}
      <div className="space-y-2">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
          폰트
        </label>
        <select
          value={fontFamily}
          onChange={(e) => {
            setFontFamily(e.target.value);
            updateActiveText({ fontFamily: e.target.value });
          }}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white"
        >
          {KOREAN_FONTS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      {/* Font size */}
      <div className="space-y-2">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
          크기
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={8}
            max={120}
            value={fontSize}
            onChange={(e) => {
              const val = Number(e.target.value);
              setFontSize(val);
              updateActiveText({ fontSize: val });
            }}
            className="flex-1 accent-purple-600"
          />
          <span className="text-xs font-bold w-10 text-right">{fontSize}px</span>
        </div>
      </div>

      {/* Color */}
      <div className="space-y-2">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
          색상
        </label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={fill}
            onChange={(e) => {
              setFill(e.target.value);
              updateActiveText({ fill: e.target.value });
            }}
            className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
          />
          <span className="text-xs font-mono text-gray-500">{fill}</span>
        </div>
      </div>

      {/* Style toggles */}
      <div className="space-y-2">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
          스타일
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => {
              const val = !isBold;
              setIsBold(val);
              updateActiveText({ fontWeight: val ? 'bold' : 'normal' });
            }}
            className={`p-2.5 rounded-lg border transition-all ${
              isBold ? 'bg-purple-100 border-purple-300 text-purple-700' : 'border-gray-200 text-gray-400 hover:bg-gray-50'
            }`}
          >
            <Bold size={16} />
          </button>
          <button
            onClick={() => {
              const val = !isItalic;
              setIsItalic(val);
              updateActiveText({ fontStyle: val ? 'italic' : 'normal' });
            }}
            className={`p-2.5 rounded-lg border transition-all ${
              isItalic ? 'bg-purple-100 border-purple-300 text-purple-700' : 'border-gray-200 text-gray-400 hover:bg-gray-50'
            }`}
          >
            <Italic size={16} />
          </button>
          <button
            onClick={() => {
              const val = !isUnderline;
              setIsUnderline(val);
              updateActiveText({ underline: val });
            }}
            className={`p-2.5 rounded-lg border transition-all ${
              isUnderline ? 'bg-purple-100 border-purple-300 text-purple-700' : 'border-gray-200 text-gray-400 hover:bg-gray-50'
            }`}
          >
            <Underline size={16} />
          </button>
        </div>
      </div>

      {/* Alignment */}
      <div className="space-y-2">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
          정렬
        </label>
        <div className="flex gap-2">
          {[
            { value: 'left', icon: AlignLeft },
            { value: 'center', icon: AlignCenter },
            { value: 'right', icon: AlignRight },
          ].map(({ value, icon: Icon }) => (
            <button
              key={value}
              onClick={() => {
                setTextAlign(value);
                updateActiveText({ textAlign: value });
              }}
              className={`p-2.5 rounded-lg border transition-all ${
                textAlign === value ? 'bg-purple-100 border-purple-300 text-purple-700' : 'border-gray-200 text-gray-400 hover:bg-gray-50'
              }`}
            >
              <Icon size={16} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
