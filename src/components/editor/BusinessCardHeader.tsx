'use client';

import { Download, Save, Undo2, Redo2, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEditorStore } from '@/store/useEditorStore';
import { saveDesign } from '@/lib/designs';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

/**
 * 명함 에디터 전용 헤더
 *
 * 기능:
 * - 홈으로 돌아가기
 * - 실행 취소/다시 실행
 * - 디자인 저장
 * - PNG 다운로드 (300 DPI)
 */
export default function BusinessCardHeader() {
  const router = useRouter();
  const { user } = useAuth();

  const {
    canvasRef,
    product,
    historyStack,
    historyIndex,
    setHistoryIndex,
    isSaving,
    setIsSaving,
  } = useEditorStore();

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < historyStack.length - 1;

  // 실행 취소
  const handleUndo = () => {
    if (!canvasRef || !canUndo) return;

    const prevIndex = historyIndex - 1;
    const prevState = historyStack[prevIndex];

    if (prevState) {
      canvasRef.loadFromJSON(prevState, () => {
        canvasRef.renderAll();
        setHistoryIndex(prevIndex);
      });
    }
  };

  // 다시 실행
  const handleRedo = () => {
    if (!canvasRef || !canRedo) return;

    const nextIndex = historyIndex + 1;
    const nextState = historyStack[nextIndex];

    if (nextState) {
      canvasRef.loadFromJSON(nextState, () => {
        canvasRef.renderAll();
        setHistoryIndex(nextIndex);
      });
    }
  };

  // 디자인 저장
  const handleSave = async () => {
    if (!canvasRef || !product) {
      toast.error('캔버스가 준비되지 않았습니다.');
      return;
    }

    if (!user) {
      toast.error('로그인이 필요합니다.');
      router.push('/login');
      return;
    }

    setIsSaving(true);

    try {
      // Fabric.js JSON 직렬화
      const fabricJSON = canvasRef.toJSON();

      // 미리보기 이미지 생성 (1x 품질)
      const previewDataURL = canvasRef.toDataURL({
        format: 'png',
        quality: 0.8,
        multiplier: 1,
      });

      // 디자인 저장
      const designId = await saveDesign(
        user.uid,
        {
          productId: product.id,
          productName: product.name,
          designData: { fabricJSON },
          previewUrl: previewDataURL,
          status: 'draft',
        }
      );

      toast.success('명함 디자인이 저장되었습니다!');
      console.log('Design saved with ID:', designId);
    } catch (error) {
      console.error('Failed to save design:', error);
      toast.error('저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  // PNG 다운로드 (300 DPI 품질)
  const handleDownload = () => {
    if (!canvasRef) {
      toast.error('캔버스가 준비되지 않았습니다.');
      return;
    }

    try {
      // 300 DPI 출력을 위해 3배 확대
      // (90mm * 300dpi / 25.4 ≈ 1063px)
      const dataURL = canvasRef.toDataURL({
        format: 'png',
        quality: 1.0,
        multiplier: 3,
      });

      // 다운로드 트리거
      const link = document.createElement('a');
      link.download = `businesscard-design-${Date.now()}.png`;
      link.href = dataURL;
      link.click();

      toast.success('명함 디자인이 다운로드되었습니다!');
    } catch (error) {
      console.error('Failed to download:', error);
      toast.error('다운로드 중 오류가 발생했습니다.');
    }
  };

  return (
    <header className="editor-header px-6 flex-between">
      {/* 왼쪽: 타이틀 */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/')}
          className="btn-icon btn-secondary"
          title="홈으로"
        >
          <Home className="w-5 h-5" />
        </button>

        <div className="divider-vertical" />

        <h1 className="text-xl font-bold">명함 디자인</h1>
        <div className="text-small text-muted">
          90mm × 50mm (300 DPI)
        </div>
      </div>

      {/* 오른쪽: 액션 버튼 */}
      <div className="flex items-center gap-2">
        {/* 실행 취소/다시 실행 */}
        <button
          onClick={handleUndo}
          disabled={!canUndo}
          className="btn-icon btn-secondary"
          title="실행 취소 (Ctrl+Z)"
        >
          <Undo2 className="w-5 h-5" />
        </button>
        <button
          onClick={handleRedo}
          disabled={!canRedo}
          className="btn-icon btn-secondary"
          title="다시 실행 (Ctrl+Y)"
        >
          <Redo2 className="w-5 h-5" />
        </button>

        <div className="divider-vertical" />

        {/* 저장 */}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="btn btn-secondary"
        >
          <Save className="w-4 h-4" />
          {isSaving ? '저장 중...' : '저장'}
        </button>

        {/* 다운로드 */}
        <button
          onClick={handleDownload}
          className="btn btn-primary"
        >
          <Download className="w-4 h-4" />
          다운로드
        </button>
      </div>
    </header>
  );
}
