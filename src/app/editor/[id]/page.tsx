'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { 
  Wand2, 
  Save, 
  ChevronLeft, 
  Download, 
  Layers, 
  Type, 
  Image as ImageIcon, 
  RefreshCw, 
  Check,
  Undo2,
  Redo2,
  Trash2,
  Send,
  Loader2,
  Sparkles,
  Maximize2,
  ShoppingCart,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  FlipHorizontal
} from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { getProductById, Product } from '@/lib/products';
import { getPrintConfig } from '@/lib/editor-config';
import { saveDesign, getDesignById, uploadDesignImage } from '@/lib/designs';
import { useAuth } from '@/context/AuthContext';
import { useStore } from '@/store/useStore';
import { toast } from 'sonner';

export default function DesignEditorPage() {
  const { id } = useParams(); // productId
  const searchParams = useSearchParams();
  const draftId = searchParams.get('draft');
  const { user } = useAuth();
  const router = useRouter();
  const addToCart = useStore((state) => state.addToCart);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Editor State
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentDesign, setCurrentDesign] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Transform State (Standard)
  const [scale, setScale] = useState(60);
  const [posX, setPosX] = useState(50);
  const [posY, setPosY] = useState(50);
  const [rotation, setRotation] = useState(0);
  
  // Face / Print Zone State
  const [activeFace, setActiveFace] = useState('front');
  const [backDesign, setBackDesign] = useState<string | null>(null);

  // Text Overlay State
  const [text, setText] = useState('');
  const [textScale, setTextScale] = useState(100);
  const [textPosX, setTextPosX] = useState(50);
  const [textPosY, setTextPosY] = useState(70);
  const [textColor, setTextColor] = useState('#000000');
  const [isTextActive, setIsTextActive] = useState(false);
  const [isMockupMode, setIsMockupMode] = useState(true);

  // Smart Guide State
  const [showVGuide, setShowVGuide] = useState(false);
  const [showHGuide, setShowHGuide] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState('Artistic');
  const [removeBackground, setRemoveBackground] = useState(false);
  const [generationMode, setGenerationMode] = useState<'real' | 'demo' | 'fallback' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const AI_STYLES = [
    { id: 'Artistic', name: '예술적', icon: '🎨' },
    { id: 'Watercolor', name: '수채화', icon: '💧' },
    { id: 'Cyberpunk', name: '네온/사이버', icon: '🌃' },
    { id: 'Minimalist', name: '미니멀', icon: '▫️' },
    { id: '3D Render', name: '3D 렌더링', icon: '🧊' },
    { id: 'Pixar Style', name: '디즈니 풍', icon: '🧸' },
  ];

  useEffect(() => {
    const init = async () => {
      if (!id) return;
      const p = await getProductById(id as string);
      if (p) {
        setProduct(p);
      } else {
        toast.error('상품을 찾을 수 없습니다.');
        router.push('/shop');
      }
      setLoading(false);
    };

    const loadDraft = async () => {
      if (draftId && user) {
        const draft = await getDesignById(draftId);
        if (draft) {
          setCurrentDesign(draft.previewUrl);
          if (draft.designData) {
            setScale(draft.designData.scale || 60);
            setPosX(draft.designData.posX || 50);
            setPosY(draft.designData.posY || 50);
            setRotation(draft.designData.rotation || 0);
            if (draft.designData.text) {
                setText(draft.designData.text);
                setIsTextActive(true);
                setTextScale(draft.designData.textScale || 100);
                setTextPosX(draft.designData.textPosX || 50);
                setTextPosY(draft.designData.textPosY || 70);
                setTextColor(draft.designData.textColor || '#000000');
            }
          }
        }
      }
    };

    init().then(() => loadDraft());
  }, [id, router, draftId, user]);

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt, 
          style: selectedStyle, 
          removeBackground 
        }),
      });
      const data = await response.json();
      if (data.url) {
        const newImage = data.url;
        setCurrentDesign(newImage);
        setGenerationMode(data.mode || 'real');

        // Add to history
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(newImage);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);

        if (data.mode === 'demo' || data.mode === 'fallback') {
          toast.info('데모 모드로 실행 중입니다', {
            description: 'AI 이미지 생성 API 키가 설정되지 않아 샘플 이미지를 표시합니다.'
          });
        } else {
          toast.success('제미나이 Pro가 새로운 디자인을 생성했습니다!', {
            description: 'Imagen 3 엔진을 통해 고품질 이미지가 생성되었습니다.'
          });
        }
      }
    } catch (error) {
      toast.error('이미지 생성 중 오류가 발생했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDrag = (event: any, info: any) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    let x = ((info.point.x - rect.left) / rect.width) * 100;
    let y = ((info.point.y - rect.top) / rect.height) * 100;
    
    const threshold = 1.5;
    if (Math.abs(x - 50) < threshold) { x = 50; setShowVGuide(true); } else { setShowVGuide(false); }
    if (Math.abs(y - 50) < threshold) { y = 50; setShowHGuide(true); } else { setShowHGuide(false); }

    setPosX(x);
    setPosY(y);
  };

  const handleDragEnd = () => {
    setShowVGuide(false);
    setShowHGuide(false);
  };

  const handleSaveDraft = async () => {
    if (!user || !product || !currentDesign) {
      toast.error('저장할 디자인이 없거나 로그인이 필요합니다.');
      return;
    }
    setIsSaving(true);
    
    try {
      let finalImageUrl = currentDesign;
      // If it's a data URL or an external URL, upload it to permanent storage
      if (currentDesign.startsWith('data:image') || (currentDesign.startsWith('http') && (currentDesign.includes('openai') || currentDesign.includes('unsplash') || currentDesign.includes('google')))) {
        const uploadedUrl = await uploadDesignImage(user.uid, currentDesign);
        if (uploadedUrl) finalImageUrl = uploadedUrl;
      }

      const designId = await saveDesign(user.uid, {
        productId: product.id,
        productName: product.name,
        previewUrl: finalImageUrl,
        designData: { 
          scale, posX, posY, rotation, 
          text, textScale, textPosX, textPosY, textColor, isTextActive 
        }
      });
      if (designId) {
        toast.success('작업물이 안전하게 저장되었습니다! 💾');
      }
    } catch (error) {
      console.error('Save draft error:', error);
      toast.error('디자인 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleOrder = async () => {
    if (!product || !currentDesign) return;
    setIsSaving(true);
    
    try {
        let finalImageUrl = currentDesign;
        // Check for data URLs (Gemini) or external URLs (other sources)
        if (currentDesign.startsWith('data:image') || (currentDesign.startsWith('http') && (currentDesign.includes('openai') || currentDesign.includes('unsplash') || currentDesign.includes('google')))) {
          const uploadedUrl = await uploadDesignImage(user?.uid || 'guest', currentDesign);
          if (uploadedUrl) finalImageUrl = uploadedUrl;
        }

        addToCart({
          productId: product.id,
          name: product.name,
          price: product.price,
          thumbnail: product.thumbnail,
          quantity: 1,
          customDesignUrl: finalImageUrl,
          selectedOptions: [
              { groupLabel: '디자인 방식', valueLabel: 'AI 실시간 커스텀' },
              { groupLabel: '텍스트 추가', valueLabel: isTextActive ? `활성화 (${text})` : '미사용' }
          ]
        });

        toast.success('선택하신 디자인이 장바구니에 담겼습니다!');
        router.push('/checkout');
    } catch (error) {
        toast.error('주문 처리 중 오류가 발생했습니다.');
    } finally {
        setIsSaving(false);
    }
  };

  const printConfig = product ? getPrintConfig(product.category) : null;
  const activeZone = printConfig?.zones.find(z => z.id === activeFace) || printConfig?.zones[0];
  const hasMultipleFaces = (printConfig?.zones.length || 0) > 1;

  const handleFaceToggle = () => {
    if (!hasMultipleFaces) return;
    // Swap current design with back design
    const nextFace = activeFace === 'front' ? 'back' : 'front';
    setBackDesign(currentDesign);
    setCurrentDesign(backDesign);
    setActiveFace(nextFace);
  };

  const handleExportPNG = async () => {
    if (!currentDesign || !product) return;
    try {
      const offscreen = document.createElement('canvas');
      const size = 2048;
      offscreen.width = size;
      offscreen.height = size;
      const ctx = offscreen.getContext('2d');
      if (!ctx) return;

      // Draw the product image
      const productImg = new window.Image();
      productImg.crossOrigin = 'anonymous';
      await new Promise<void>((resolve, reject) => {
        productImg.onload = () => resolve();
        productImg.onerror = reject;
        productImg.src = product.thumbnail;
      });
      ctx.drawImage(productImg, 0, 0, size, size);

      // Draw the design overlay
      const designImg = new window.Image();
      designImg.crossOrigin = 'anonymous';
      await new Promise<void>((resolve, reject) => {
        designImg.onload = () => resolve();
        designImg.onerror = reject;
        designImg.src = currentDesign;
      });

      const dw = (scale / 100) * size;
      const dh = (scale / 100) * size;
      const dx = (posX / 100) * size;
      const dy = (posY / 100) * size;

      ctx.save();
      ctx.translate(dx, dy);
      ctx.rotate((rotation * Math.PI) / 180);
      if (isMockupMode) {
        ctx.globalCompositeOperation = 'multiply';
        ctx.globalAlpha = 0.92;
      }
      ctx.drawImage(designImg, -dw / 2, -dh / 2, dw, dh);
      ctx.restore();

      offscreen.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${product.name}-design.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('PNG 이미지가 다운로드되었습니다!');
      }, 'image/png');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('이미지 내보내기 중 오류가 발생했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-emerald-500" size={40} />
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col overflow-hidden">
      {/* Top Navigation */}
      <header className="h-16 bg-white border-b flex justify-between items-center px-6 shrink-0 z-30 shadow-xs">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ChevronLeft size={20} />
          </button>
          <div className="flex flex-col">
            <h1 className="text-sm font-bold text-gray-900 leading-tight">제미나이 스튜디오 Pro</h1>
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">{product.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportPNG}
            disabled={!currentDesign}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            <Download size={14} /> PNG 내보내기
          </button>
          <button
            onClick={handleSaveDraft}
            disabled={isSaving || !currentDesign}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            저장하기
          </button>
          <button 
            onClick={handleOrder}
            disabled={!currentDesign || isSaving}
            className="flex items-center gap-2 px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 disabled:opacity-50"
          >
            <ShoppingCart size={14} /> 주문하기
          </button>
        </div>
      </header>

      {/* Demo Mode Banner */}
      {generationMode && generationMode !== 'real' && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center text-xs text-amber-700 font-medium shrink-0">
          데모 모드: 실제 AI 생성이 아닌 샘플 이미지가 표시됩니다. 실제 생성을 위해 GOOGLE_API_KEY를 설정하세요.
        </div>
      )}

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Left Toolbar - Hidden on mobile, shown as bottom bar instead */}
        <aside className="hidden md:flex w-16 bg-white border-r flex-col items-center py-6 gap-6 shrink-0 z-20 shadow-sm">
          {[
            { icon: Sparkles, label: 'AI 생성', id: 'ai' },
            { icon: ImageIcon, label: '이미지', id: 'image' },
            { icon: Type, label: '텍스트', id: 'text' },
            { icon: Layers, label: '레이어', id: 'layers' },
          ].map((item) => (
            <button 
                key={item.id} 
                className="group flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-emerald-50 transition-all relative"
            >
              <item.icon size={20} className="text-gray-400 group-hover:text-emerald-600 transition-colors" />
              <span className="text-[9px] font-bold text-gray-400 group-hover:text-emerald-700">{item.label}</span>
            </button>
          ))}
          <div className="mt-auto border-t pt-6 w-full flex flex-col items-center gap-4">
               <button 
                onClick={() => {
                  if (historyIndex > 0) {
                    const newIndex = historyIndex - 1;
                    setHistoryIndex(newIndex);
                    setCurrentDesign(history[newIndex]);
                  }
                }}
                disabled={historyIndex <= 0}
                className="text-gray-300 hover:text-gray-600 disabled:opacity-20"
               >
                <Undo2 size={18} />
               </button>
               <button 
                onClick={() => {
                  if (historyIndex < history.length - 1) {
                    const newIndex = historyIndex + 1;
                    setHistoryIndex(newIndex);
                    setCurrentDesign(history[newIndex]);
                  }
                }}
                disabled={historyIndex >= history.length - 1}
                className="text-gray-300 hover:text-gray-600 disabled:opacity-20"
               >
                <Redo2 size={18} />
               </button>
          </div>
        </aside>

        {/* Main Canvas Area */}
        <main className="flex-1 relative bg-[#F0F2F5] flex items-center justify-center p-4 sm:p-8 overflow-hidden">
            <div className="absolute inset-0 z-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
            
            <div className="relative group/canvas">
                <div 
                    ref={containerRef}
                    className="aspect-square bg-white shadow-2xl relative overflow-hidden preserve-3d"
                    style={{ width: 'min(600px, 90vw)', cursor: 'crosshair' }}
                >
                    {/* Smart Guides */}
                    <AnimatePresence>
                        {showVGuide && (
                            <motion.div 
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="absolute top-0 bottom-0 left-1/2 w-[1.5px] bg-blue-500 z-40 shadow-[0_0_8px_rgba(59,130,246,0.4)]" 
                            />
                        )}
                        {showHGuide && (
                            <motion.div 
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="absolute left-0 right-0 top-1/2 h-[1.5px] bg-blue-500 z-40 shadow-[0_0_8px_rgba(59,130,246,0.4)]" 
                            />
                        )}
                    </AnimatePresence>

                    {/* Product Mockup */}
                    <Image
                        src={product.thumbnail}
                        className="object-cover pointer-events-none"
                        alt="Background"
                        fill
                        unoptimized
                    />

                    {/* Print Zone Boundary */}
                    {activeZone && (
                        <div
                            className="absolute border-2 border-dashed border-blue-400/50 pointer-events-none z-30 rounded-sm"
                            style={{
                                left: `${activeZone.x}%`,
                                top: `${activeZone.y}%`,
                                width: `${activeZone.width}%`,
                                height: `${activeZone.height}%`,
                            }}
                        >
                            <span className="absolute -top-5 left-0 text-[9px] font-bold text-blue-500 bg-white/80 px-1.5 py-0.5 rounded">
                                {activeZone.label}
                            </span>
                        </div>
                    )}

                    {/* Design Overlay */}
                    <AnimatePresence>
                    {currentDesign && (
                        <motion.div
                            drag
                            dragConstraints={containerRef}
                            dragElastic={0}
                            onDrag={handleDrag}
                            onDragEnd={handleDragEnd}
                            style={{
                                position: 'absolute',
                                width: `${scale}%`,
                                left: `${posX}%`,
                                top: `${posY}%`,
                                rotate: `${rotation}deg`,
                                transform: 'translate(-50%, -50%)',
                                mixBlendMode: isMockupMode ? 'multiply' : 'normal',
                                opacity: isMockupMode ? 0.92 : 1
                            }}
                            className="cursor-move group z-10"
                        >
                            <Image
                                src={currentDesign}
                                className="w-full h-full object-cover"
                                alt="Current design"
                                width={600}
                                height={600}
                                unoptimized
                            />
                        </motion.div>
                    )}

                    {/* Text Overlay */}
                    {isTextActive && (
                        <motion.div
                            drag
                            dragConstraints={containerRef}
                            style={{
                                position: 'absolute',
                                left: `${textPosX}%`,
                                top: `${textPosY}%`,
                                transform: 'translate(-50%, -50%)',
                                fontSize: `${textScale}%`,
                                color: textColor,
                            }}
                            className="cursor-move group/text z-20 whitespace-nowrap"
                        >
                            <span className="font-black drop-shadow-sm select-none">
                                {text || '텍스트를 입력하세요'}
                            </span>
                            <div className="absolute top-[-30px] right-0 opacity-0 group-hover/text:opacity-100 transition-opacity">
                                <button onClick={() => setIsTextActive(false)} className="bg-white text-red-500 rounded-full p-1.5 shadow-lg"><Trash2 size={12} /></button>
                            </div>
                        </motion.div>
                    )}
                    </AnimatePresence>
                </div>
                
                {/* Floating Controls */}
                <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex items-center bg-white/90 backdrop-blur-md px-6 py-3 rounded-2xl shadow-xl border border-white/50 gap-6">
                    <div className="flex items-center gap-3 border-r pr-6">
                        <button onClick={() => setScale(s => Math.max(10, s - 10))} className="p-1 hover:bg-gray-100 rounded-md"><ZoomOut size={16} /></button>
                        <span className="text-xs font-bold w-10 text-center">{scale}%</span>
                        <button onClick={() => setScale(s => Math.min(150, s + 10))} className="p-1 hover:bg-gray-100 rounded-md"><ZoomIn size={16} /></button>
                    </div>
                    {/* Rotation Slider */}
                    <div className="flex items-center gap-2 border-r pr-6">
                        <input
                            type="range"
                            min={-180}
                            max={180}
                            value={rotation}
                            onChange={e => setRotation(Number(e.target.value))}
                            className="w-20 h-1 accent-emerald-600 cursor-pointer"
                        />
                        <span className="text-[10px] font-bold text-gray-500 w-10 text-center">{rotation}°</span>
                        <button
                            onClick={() => setRotation(0)}
                            className="p-1 hover:bg-gray-100 rounded-md text-gray-400 hover:text-gray-600"
                            title="회전 초기화"
                        >
                            <RotateCw size={14} />
                        </button>
                    </div>
                    {/* Front/Back Toggle */}
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
                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={isMockupMode} onChange={e => setIsMockupMode(e.target.checked)} className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500" />
                            <span className="text-xs font-bold text-gray-600">목업 모드</span>
                        </label>
                    </div>
                </div>
            </div>
            
            {/* Mobile Tool Selector - Only visible on small screens */}
            <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center bg-black/90 text-white px-2 py-2 rounded-2xl shadow-2xl z-50 gap-1 border border-white/10 backdrop-blur-md">
                {[
                    { icon: Sparkles, id: 'ai' },
                    { icon: ImageIcon, id: 'image' },
                    { icon: Type, id: 'text' },
                    { icon: Layers, id: 'layers' },
                ].map((item) => (
                    <button key={item.id} className="p-3 rounded-xl hover:bg-white/10 transition-colors">
                        <item.icon size={20} />
                    </button>
                ))}
                <div className="w-px h-6 bg-white/20 mx-1" />
                <button 
                  onClick={() => { if (historyIndex > 0) { const newIndex = historyIndex - 1; setHistoryIndex(newIndex); setCurrentDesign(history[newIndex]); }}} 
                  className="p-3 rounded-xl hover:bg-white/10 disabled:opacity-30"
                >
                    <Undo2 size={20} />
                </button>
            </div>
        </main>

        {/* Right Sidebar: Tools - Hidden on mobile, or toggleable */}
        <aside className="hidden md:flex w-80 bg-white border-l z-20 shadow-sm flex-col shrink-0">
          <div className="flex border-b">
            <button className="flex-1 py-4 text-xs font-bold text-emerald-600 border-b-2 border-emerald-600">AI 생성</button>
            <button className="flex-1 py-4 text-xs font-bold text-gray-400 hover:text-gray-600">텍스트 에디터</button>
          </div>

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
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">추천 스타일</p>
                  <div className="grid grid-cols-3 gap-2">
                    {AI_STYLES.map(style => (
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
                    className={`w-10 h-5 rounded-full relative transition-all ${removeBackground ? 'bg-indigo-600' : 'bg-gray-200'}`}
                  >
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${removeBackground ? 'right-1' : 'left-1'}`} />
                  </button>
                </div>

                <button 
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt}
                  className="w-full bg-linear-to-r from-emerald-600 to-teal-600 text-white font-bold py-4 rounded-xl hover:opacity-90 disabled:opacity-50 transition-all shadow-xl shadow-emerald-100 flex items-center justify-center gap-2"
                >
                  {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                  제미나이 Pro로 디자인 생성
                </button>
              </div>
            </div>

            {/* Generation History */}
            {history.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">이전 시안</h3>
                    <div className="grid grid-cols-3 gap-2">
                        {history.map((url, i) => (
                            <button 
                                key={i} 
                                onClick={() => {
                                    setCurrentDesign(url);
                                    setHistoryIndex(i);
                                }}
                                className={`aspect-square rounded-lg overflow-hidden border-2 transition-all relative ${historyIndex === i ? 'border-emerald-500 shadow-md' : 'border-transparent hover:border-gray-200'}`}
                            >
                                <Image src={url} className="w-full h-full object-cover" alt={`History ${i}`} fill unoptimized />
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Sub-tools placeholder */}
            <div className="space-y-4 pt-4 border-t">
                 <div className="bg-emerald-50 rounded-2xl p-4 flex items-center gap-3">
                    <div className="bg-emerald-600 text-white p-2 rounded-xl">
                        <Maximize2 size={16} />
                    </div>
                    <div>
                        <p className="text-[11px] font-bold text-emerald-800">화면 맞춤 기능</p>
                        <p className="text-[9px] text-emerald-600">디자인을 최적의 크기로 자동 조정합니다.</p>
                    </div>
                    <ChevronRight size={14} className="ml-auto text-emerald-400" />
                 </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
