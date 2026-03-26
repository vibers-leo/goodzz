'use client';

import React from 'react';
import {
  ChevronLeft,
  Download,
  Save,
  Loader2,
  ShoppingCart,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEditorStore } from '@/store/useEditorStore';
import { useAuth } from '@/context/AuthContext';
import { useStore } from '@/store/useStore';
import { saveDesign, uploadDesignImage } from '@/lib/designs';
import { exportToPNG } from '@/lib/fabric/export-utils';
import { toast } from 'sonner';

export default function EditorHeader() {
  const router = useRouter();
  const { user } = useAuth();
  const addToCart = useStore((s) => s.addToCart);

  const {
    product,
    canvasRef,
    isSaving,
    setIsSaving,
    generationMode,
    faceCanvasStates,
    activeFace,
  } = useEditorStore();

  const hasDesign = canvasRef
    ? canvasRef.getObjects().some((o: any) => !o._isBgMockup && !o._isPrintZone)
    : false;

  const handleExportPNG = async () => {
    if (!canvasRef || !product) return;
    try {
      await exportToPNG(canvasRef, product.name);
      toast.success('PNG 이미지가 다운로드되었습니다!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('이미지 내보내기 중 오류가 발생했습니다.');
    }
  };

  const handleSaveDraft = async () => {
    if (!user || !product || !canvasRef) {
      toast.error('저장할 디자인이 없거나 로그인이 필요합니다.');
      return;
    }
    setIsSaving(true);
    try {
      const previewDataUrl = canvasRef.toDataURL({
        format: 'png',
        multiplier: 0.5,
      });
      const uploadedUrl = await uploadDesignImage(user.uid, previewDataUrl);
      const previewUrl = uploadedUrl || previewDataUrl;

      const fabricJSON = canvasRef.toJSON(['id', 'selectable', 'evented', '_isBgMockup', '_isPrintZone']);

      // Save current face state
      const allFaceStates = { ...faceCanvasStates };
      allFaceStates[activeFace] = JSON.stringify(fabricJSON);

      const designId = await saveDesign(user.uid, {
        productId: product.id,
        productName: product.name,
        previewUrl,
        designData: {
          fabricJSON,
          faceStates: allFaceStates,
          version: 2,
        },
      });

      if (designId) {
        toast.success('작업물이 안전하게 저장되었습니다!');
      }
    } catch (error) {
      console.error('Save draft error:', error);
      toast.error('디자인 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleOrder = async () => {
    if (!product || !canvasRef) return;
    setIsSaving(true);
    try {
      const previewDataUrl = canvasRef.toDataURL({
        format: 'png',
        multiplier: 3, // 고해상도 제작 도안급 추출
      });
      const uploadedUrl = await uploadDesignImage(
        user?.uid || 'guest',
        previewDataUrl
      );
      const finalImageUrl = uploadedUrl || previewDataUrl;

      addToCart({
        productId: product.id,
        name: product.name,
        price: product.price,
        thumbnail: product.thumbnail,
        quantity: 1,
        customDesignUrl: finalImageUrl,
        selectedOptions: [
          { groupLabel: '디자인 방식', valueLabel: 'AI 실시간 커스텀' },
        ],
      });

      toast.success('선택하신 디자인이 장바구니에 담겼습니다!');
      router.push('/checkout');
    } catch (error) {
      toast.error('주문 처리 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <header className="h-16 bg-white border-b flex justify-between items-center px-6 shrink-0 z-30 shadow-xs">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex flex-col">
            <h1 className="text-sm font-bold text-gray-900 leading-tight">
              제미나이 스튜디오 Pro
            </h1>
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">
              {product?.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportPNG}
            disabled={!hasDesign}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            <Download size={14} /> PNG 내보내기
          </button>
          <button
            onClick={handleSaveDraft}
            disabled={isSaving || !hasDesign}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Save size={14} />
            )}
            저장하기
          </button>
          <button
            onClick={handleOrder}
            disabled={!hasDesign || isSaving}
            className="flex items-center gap-2 px-5 py-2 bg-primary-600 text-white rounded-xl text-xs font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-100 disabled:opacity-50"
          >
            <ShoppingCart size={14} /> 제작 요청 & 주문하기
          </button>
        </div>
      </header>

      {/* Demo Mode Banner */}
      {generationMode && generationMode !== 'real' && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center text-xs text-amber-700 font-medium shrink-0">
          데모 모드: 실제 AI 생성이 아닌 샘플 이미지가 표시됩니다. 실제 생성을
          위해 GOOGLE_API_KEY를 설정하세요.
        </div>
      )}
    </>
  );
}
