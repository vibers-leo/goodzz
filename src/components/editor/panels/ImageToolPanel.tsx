'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import { Upload, ImagePlus } from 'lucide-react';
import { useEditorStore } from '@/store/useEditorStore';
import { addImageToCanvas } from '@/lib/fabric/object-helpers';
import { toast } from 'sonner';

export default function ImageToolPanel() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { canvasRef, generationHistory } = useEditorStore();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !canvasRef) return;

    if (!file.type.startsWith('image/')) {
      toast.error('이미지 파일만 업로드 가능합니다.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      await addImageToCanvas(canvasRef, dataUrl);
      toast.success('이미지가 캔버스에 추가되었습니다!');
    };
    reader.readAsDataURL(file);

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleHistoryClick = async (url: string) => {
    if (canvasRef) {
      await addImageToCanvas(canvasRef, url);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file || !canvasRef) return;

    if (!file.type.startsWith('image/')) {
      toast.error('이미지 파일만 업로드 가능합니다.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      await addImageToCanvas(canvasRef, dataUrl);
      toast.success('이미지가 캔버스에 추가되었습니다!');
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
        <ImagePlus size={14} className="text-blue-500" /> 이미지 추가
      </h3>

      {/* Upload area */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:border-emerald-300 hover:bg-emerald-50/30 transition-all cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload size={32} className="mx-auto text-gray-300 mb-3" />
        <p className="text-sm font-bold text-gray-600">이미지 업로드</p>
        <p className="text-[10px] text-gray-400 mt-1">
          클릭 또는 드래그 앤 드롭
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {/* AI Generated Images */}
      {generationHistory.length > 0 && (
        <div className="space-y-3">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            AI 생성 이미지
          </p>
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
                  alt={`AI image ${i}`}
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
