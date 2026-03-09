'use client';

import React from 'react';
import Image from 'next/image';
import { Sparkles, Loader2, Maximize2 } from 'lucide-react';
import { useEditorStore } from '@/store/useEditorStore';
import { addImageToCanvas } from '@/lib/fabric/object-helpers';
import { toast } from 'sonner';

const AI_STYLES = [
  { id: 'Artistic', name: '예술적', icon: '🎨' },
  { id: 'Watercolor', name: '수채화', icon: '💧' },
  { id: 'Cyberpunk', name: '네온/사이버', icon: '🌃' },
  { id: 'Minimalist', name: '미니멀', icon: '▫️' },
  { id: '3D Render', name: '3D 렌더링', icon: '🧊' },
  { id: 'Pixar Style', name: '디즈니 풍', icon: '🧸' },
];

export default function AiGeneratorPanel() {
  const {
    prompt,
    setPrompt,
    isGenerating,
    setIsGenerating,
    selectedStyle,
    setSelectedStyle,
    removeBackground,
    setRemoveBackground,
    setGenerationMode,
    generationHistory,
    addToGenerationHistory,
    canvasRef,
  } = useEditorStore();

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, style: selectedStyle, removeBackground }),
      });
      const data = await response.json();
      if (data.url) {
        const newImage = data.url;
        setGenerationMode(data.mode || 'real');
        addToGenerationHistory(newImage);

        // Add image to canvas
        if (canvasRef) {
          await addImageToCanvas(canvasRef, newImage);
        }

        if (data.mode === 'demo' || data.mode === 'fallback') {
          toast.info('데모 모드로 실행 중입니다', {
            description: 'AI 이미지 생성 API 키가 설정되지 않아 샘플 이미지를 표시합니다.',
          });
        } else {
          toast.success('제미나이 Pro가 새로운 디자인을 생성했습니다!', {
            description: 'Imagen 3 엔진을 통해 고품질 이미지가 생성되었습니다.',
          });
        }
      }
    } catch {
      toast.error('이미지 생성 중 오류가 발생했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleHistoryClick = async (url: string) => {
    if (canvasRef) {
      await addImageToCanvas(canvasRef, url);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-8">
      {/* AI Generator Section */}
      <div className="space-y-4">
        <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
          <Sparkles size={14} className="text-amber-500" /> 제미나이 Pro 이미지 생성
        </h3>
        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="어떤 스타일의 디자인을 원하시나요?..."
            className="w-full h-32 bg-white border-none rounded-xl text-sm p-3 focus:ring-2 focus:ring-emerald-500 resize-none transition-all shadow-xs"
          />

          {/* AI Style Recommendations */}
          <div className="space-y-3">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              추천 스타일
            </p>
            <div className="grid grid-cols-3 gap-2">
              {AI_STYLES.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyle(style.id)}
                  className={`py-2 px-1 rounded-xl text-[10px] font-black border transition-all ${
                    selectedStyle === style.id
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg scale-[1.02]'
                      : 'bg-white border-gray-100 text-gray-600 hover:border-emerald-200'
                  }`}
                >
                  <span className="block text-base mb-1">{style.icon}</span>
                  {style.name}
                </button>
              ))}
            </div>
          </div>

          {/* Background removal toggle */}
          <div className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Maximize2 size={16} />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-900">배경 자동 제거</p>
                <p className="text-[9px] text-gray-400">누끼용 단색 배경으로 생성</p>
              </div>
            </div>
            <button
              onClick={() => setRemoveBackground(!removeBackground)}
              className={`w-10 h-5 rounded-full relative transition-all ${
                removeBackground ? 'bg-indigo-600' : 'bg-gray-200'
              }`}
            >
              <div
                className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${
                  removeBackground ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt}
            className="w-full bg-linear-to-r from-emerald-600 to-teal-600 text-white font-bold py-4 rounded-xl hover:opacity-90 disabled:opacity-50 transition-all shadow-xl shadow-emerald-100 flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Sparkles size={18} />
            )}
            제미나이 Pro로 디자인 생성
          </button>
        </div>
      </div>

      {/* Generation History */}
      {generationHistory.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">
            이전 시안
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {generationHistory.map((url, i) => (
              <button
                key={i}
                onClick={() => handleHistoryClick(url)}
                className="aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-emerald-300 transition-all relative"
              >
                <Image
                  src={url}
                  className="w-full h-full object-cover"
                  alt={`History ${i}`}
                  fill
                  unoptimized
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
