'use client';

import React from 'react';
import {
  Sparkles,
  Image as ImageIcon,
  Type,
  Shapes,
  Layers,
  Undo2,
  Redo2,
} from 'lucide-react';
import { useEditorStore, ActiveTool } from '@/store/useEditorStore';
import AiGeneratorPanel from './AiGeneratorPanel';
import ImageToolPanel from './ImageToolPanel';
import TextToolPanel from './TextToolPanel';
import ShapeToolPanel from './ShapeToolPanel';
import LayerPanel from './LayerPanel';

const TOOLS: { icon: React.ElementType; label: string; id: ActiveTool }[] = [
  { icon: Sparkles, label: 'AI 생성', id: 'ai' },
  { icon: ImageIcon, label: '이미지', id: 'image' },
  { icon: Type, label: '텍스트', id: 'text' },
  { icon: Shapes, label: '도형', id: 'shape' },
  { icon: Layers, label: '레이어', id: 'layers' },
];

const PANEL_TITLES: Record<ActiveTool, string> = {
  ai: 'AI 생성',
  image: '이미지',
  text: '텍스트 에디터',
  shape: '도형',
  layers: '레이어',
};

export default function ToolSidebar() {
  const {
    activeTool,
    setActiveTool,
    canvasRef,
    historyStack,
    historyIndex,
    setHistoryIndex,
  } = useEditorStore();

  const handleUndo = async () => {
    if (!canvasRef || historyIndex <= 0) return;
    const newIndex = historyIndex - 1;
    const state = historyStack[newIndex];
    if (state) {
      await canvasRef.loadFromJSON(JSON.parse(state));
      canvasRef.renderAll();
      setHistoryIndex(newIndex);
    }
  };

  const handleRedo = async () => {
    if (!canvasRef || historyIndex >= historyStack.length - 1) return;
    const newIndex = historyIndex + 1;
    const state = historyStack[newIndex];
    if (state) {
      await canvasRef.loadFromJSON(JSON.parse(state));
      canvasRef.renderAll();
      setHistoryIndex(newIndex);
    }
  };

  const renderPanel = () => {
    switch (activeTool) {
      case 'ai':
        return <AiGeneratorPanel />;
      case 'image':
        return <ImageToolPanel />;
      case 'text':
        return <TextToolPanel />;
      case 'shape':
        return <ShapeToolPanel />;
      case 'layers':
        return <LayerPanel />;
      default:
        return <AiGeneratorPanel />;
    }
  };

  return (
    <>
      {/* Left icon bar */}
      <aside className="hidden md:flex w-16 bg-white border-r flex-col items-center py-6 gap-6 shrink-0 z-20 shadow-sm">
        {TOOLS.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTool(item.id)}
            className={`group flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all relative ${
              activeTool === item.id ? 'bg-emerald-50' : 'hover:bg-gray-50'
            }`}
          >
            <item.icon
              size={20}
              className={`transition-colors ${
                activeTool === item.id
                  ? 'text-emerald-600'
                  : 'text-gray-400 group-hover:text-emerald-600'
              }`}
            />
            <span
              className={`text-[9px] font-bold ${
                activeTool === item.id
                  ? 'text-emerald-700'
                  : 'text-gray-400 group-hover:text-emerald-700'
              }`}
            >
              {item.label}
            </span>
          </button>
        ))}

        {/* Undo/Redo */}
        <div className="mt-auto border-t pt-6 w-full flex flex-col items-center gap-4">
          <button
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="text-gray-300 hover:text-gray-600 disabled:opacity-20"
          >
            <Undo2 size={18} />
          </button>
          <button
            onClick={handleRedo}
            disabled={historyIndex >= historyStack.length - 1}
            className="text-gray-300 hover:text-gray-600 disabled:opacity-20"
          >
            <Redo2 size={18} />
          </button>
        </div>
      </aside>

      {/* Right panel */}
      <aside className="hidden md:flex w-80 bg-white border-l z-20 shadow-sm flex-col shrink-0">
        <div className="flex border-b">
          <div className="flex-1 py-4 text-xs font-bold text-emerald-600 border-b-2 border-emerald-600 text-center">
            {PANEL_TITLES[activeTool]}
          </div>
        </div>
        {renderPanel()}
      </aside>

      {/* Mobile bottom bar */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center bg-black/90 text-white px-2 py-2 rounded-2xl shadow-2xl z-50 gap-1 border border-white/10 backdrop-blur-md">
        {TOOLS.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTool(item.id)}
            className={`p-3 rounded-xl transition-colors ${
              activeTool === item.id ? 'bg-white/20' : 'hover:bg-white/10'
            }`}
          >
            <item.icon size={20} />
          </button>
        ))}
        <div className="w-px h-6 bg-white/20 mx-1" />
        <button
          onClick={handleUndo}
          disabled={historyIndex <= 0}
          className="p-3 rounded-xl hover:bg-white/10 disabled:opacity-30"
        >
          <Undo2 size={20} />
        </button>
      </div>
    </>
  );
}
