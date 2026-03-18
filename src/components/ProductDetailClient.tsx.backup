'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Star, Truck, ShieldCheck, Wand2, X, RefreshCw, Download, 
  Heart, ShoppingBag, Sliders, LayoutGrid, Type, Move, 
  MessageSquare, AlertCircle, ChevronRight, Minus, Plus, 
  ShoppingCart, Zap, Sparkles, CheckCircle2 
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '@/lib/products';
import { calculateProductPrice, SelectedOptions } from '@/lib/pricing';
import { useRouter } from 'next/navigation';
import { uploadDesignImage } from '@/lib/designs';

interface ProductDetailClientProps {
  product: Product;
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const router = useRouter();
  const { addToCart } = useStore();
  
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  
  // AI & Order State
  const [orderMethod, setOrderMethod] = useState<'self' | 'request' | 'upload'>('self');
  const [isAiMode, setIsAiMode] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [variations, setVariations] = useState(1); // 건수
  
  // Transform State for AI Image
  const [scale, setScale] = useState(50);
  const [posX, setPosX] = useState(50);
  const [posY, setPosY] = useState(50);
  const [showPriceDetails, setShowPriceDetails] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Dynamic Options State
  const [selectedGroups, setSelectedGroups] = useState<SelectedOptions>(() => {
    const initial: SelectedOptions = {};
    product.options?.groups?.forEach(group => {
      if (group.values.length > 0) {
        initial[group.id] = group.values[0].id;
      }
    });
    return initial;
  });

  const currentPrice = calculateProductPrice(product, selectedGroups, quantity);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(`/api/reviews?productId=${product.id}`);
        const data = await res.json();
        if (data.success) {
          setReviews(data.reviews);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setReviewsLoading(false);
      }
    };
    fetchReviews();
  }, [product.id]);

  const handleDrag = (event: any, info: any) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((info.point.x - rect.left) / rect.width) * 100;
    const y = ((info.point.y - rect.top) / rect.height) * 100;
    setPosX(Math.max(0, Math.min(100, x)));
    setPosY(Math.max(0, Math.min(100, y)));
  };

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, productId: product.id })
      });
      const data = await response.json();
      if (data.url) {
        setGeneratedImage(data.url);
        toast.success('제미나이 디자인이 생성되었습니다! ✨', {
          description: 'Imagen 3 엔진이 고해상도 시안을 완성했습니다.'
        });
      } else {
        toast.error('디자인 생성에 실패했습니다.');
      }
    } catch (error) {
      toast.error('오류가 발생했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddToCart = async () => {
    // Capture dynamic options with deep detail
    const serializedOptions = product.options?.groups?.map(group => {
        const valId = selectedGroups[group.id];
        const val = group.values.find(v => v.id === valId);
        return {
            groupId: group.id,
            groupLabel: group.label,
            valueId: valId,
            valueLabel: val?.label || '선택 안됨',
            priceAdded: val?.priceAdded || 0,
            priceMultiplier: val?.priceMultiplier || 1
        };
    }) || [];

    // Permanent storage for design if exists
    let stableImageUrl = generatedImage;
    if (generatedImage && generatedImage.startsWith('data:image')) {
        try {
          const uploadPromise = uploadDesignImage('temp-user', generatedImage);
          toast.promise(uploadPromise, {
              loading: 'AI 디자인을 서버에 보관 중...',
              success: '디자인 보관 완료!',
              error: '디자인 보관 실패'
          });
          const uploadedUrl = await uploadPromise;
          if (uploadedUrl) stableImageUrl = uploadedUrl;
        } catch (err) {
          console.error('Storage error:', err);
        }
    }

    const { addToCart: storeAddToCart } = useStore.getState();
    storeAddToCart({
        productId: product.id,
        name: product.name,
        price: currentPrice * (variations || 1), // Multiplied by variations
        thumbnail: product.thumbnail,
        quantity: quantity,
        color: selectedColor || 'Standard',
        size: selectedSize || 'Standard',
        customDesignUrl: stableImageUrl || undefined,
        selectedOptions: serializedOptions,
        metadata: {
            orderMethod: orderMethod,
            variations: variations
        }
    });

    toast.success('장바구니에 담았습니다!', {
        description: generatedImage ? '나만의 AI 디자인이 포함되었습니다.' : `${orderMethod === 'self' ? '셀프 디자인' : '기본'} 주문 - ${quantity}개`,
        icon: '🛍️'
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
      {/* Left: Canvas / Image Section */}
      <div className="space-y-4 top-24 sticky">
        <div 
            ref={containerRef}
            className="aspect-square bg-gray-100 rounded-2xl overflow-hidden border border-gray-100 relative group shadow-inner select-none"
        >
          <img
            src={product.thumbnail}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          
          {generatedImage && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <motion.div 
                    drag={isAiMode}
                    dragMomentum={false}
                    onDrag={handleDrag}
                    className="absolute pointer-events-auto"
                    style={{
                        left: `${posX}%`,
                        top: `${posY}%`,
                        width: `${scale}%`,
                        height: 'auto',
                        aspectRatio: '1/1',
                        transform: 'translate(-50%, -50%)',
                        touchAction: 'none'
                    }}
                >
                    <img 
                      src={generatedImage} 
                      className="w-full h-full object-contain mix-blend-multiply drop-shadow-sm opacity-90 transition-opacity duration-300"
                      alt="AI Design"
                    />
                    {isAiMode && (
                        <div className="absolute inset-0 border-2 border-dashed border-blue-500/50 rounded-lg pointer-events-none animate-pulse">
                            <div className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-blue-600 rounded-full shadow-sm" />
                            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-600 rounded-full shadow-sm" />
                            <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 bg-blue-600 rounded-full shadow-sm" />
                            <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-blue-600 rounded-full shadow-sm" />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                <Move className="w-3 h-3" />
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
          )}

          {isGenerating && (
             <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px] flex items-center justify-center z-20">
                 <div className="bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3">
                    <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                    <span className="font-bold text-gray-800">제미나이 Pro 디자인 중...</span>
                 </div>
             </div>
          )}

          {product.badge && (
            <div className="absolute top-4 left-4 bg-black text-white px-3 py-1 text-sm font-bold rounded-full z-10">
              {product.badge}
            </div>
          )}
        </div>
      </div>

      {/* Right: Product Info & Options */}
      <div className="space-y-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
              {product.category}
            </span>
            <div className="flex items-center gap-0.5 text-amber-400">
              <Star size={12} fill="currentColor" />
              <span className="text-xs font-bold text-gray-900">{product.rating || 4.9}</span>
            </div>
          </div>
          <h1 className="text-3xl font-black text-gray-900 leading-tight mb-2">
            {product.name}
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            {product.description || '최고급 소재와 AI 기술이 만나 탄생한 커스텀 제품입니다.'}
          </p>
        </div>

        {/* Dynamic Pricing Options */}
        {product.options?.groups && (
          <div className="space-y-6">
            {product.options.groups.map(group => (
              <div key={group.id} className="space-y-3">
                <label className="text-sm font-black text-gray-900 flex items-center gap-2">
                  {group.label}
                  {group.required && <span className="text-red-500 text-xs">*</span>}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {group.values.map(val => (
                    <button
                      key={val.id}
                      onClick={() => setSelectedGroups(prev => ({ ...prev, [group.id]: val.id }))}
                      className={`p-3 rounded-xl text-left border-2 transition-all ${
                        selectedGroups[group.id] === val.id 
                          ? 'border-emerald-600 bg-emerald-50 shadow-md' 
                          : 'border-gray-100 hover:border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className={`text-xs font-bold ${selectedGroups[group.id] === val.id ? 'text-emerald-700' : 'text-gray-600'}`}>
                          {val.label}
                        </span>
                        {val.id === selectedGroups[group.id] && <CheckCircle2 size={12} className="text-emerald-600" />}
                      </div>
                      {val.priceAdded && val.priceAdded !== 0 && (
                        <p className="text-[10px] text-gray-400 mt-1">
                          +{val.priceAdded.toLocaleString()}원
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Order Method Selection (Matches real site) */}
        <div className="space-y-4">
          <label className="text-sm font-black text-gray-900 flex items-center gap-2">
            주문 방식 <span className="text-red-500 text-xs">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'self', label: '셀프 디자인', sub: '무료 AI 디자인', icon: <Sparkles className="w-4 h-4 text-emerald-500" /> },
              { id: 'request', label: '디자인 의뢰', sub: '전문가 손길', icon: <Wand2 className="w-4 h-4 text-blue-500" /> },
              { id: 'upload', label: '파일 업로드', sub: '직접 디자인', icon: <Download className="w-4 h-4 text-gray-500" /> }
            ].map((method) => (
              <button
                key={method.id}
                onClick={() => setOrderMethod(method.id as any)}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
                  orderMethod === method.id 
                    ? 'border-emerald-600 bg-emerald-50 shadow-sm' 
                    : 'border-gray-100 bg-white hover:border-gray-200'
                }`}
              >
                <div className="mb-2">{method.icon}</div>
                <span className="text-xs font-bold text-gray-900">{method.label}</span>
                <span className="text-[10px] text-gray-400 mt-0.5">{method.sub}</span>
              </button>
            ))}
          </div>
        </div>

        {/* AI Studio Section (Only for Self Design) */}
        <AnimatePresence>
          {orderMethod === 'self' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mt-6"
            >
              <button 
                onClick={() => setIsAiMode(!isAiMode)}
                className="w-full py-4 bg-emerald-600 text-white font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
              >
                {isAiMode ? '에디터 닫기' : '무료 셀프 디자인 에디터 실행'}
                {!isAiMode && <ChevronRight size={18} />}
              </button>

              {isAiMode && (
                <div className="mt-4 bg-gray-50 rounded-3xl p-6 border border-gray-100 space-y-4">
                   <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">제미나이 디자인 프롬프트</label>
                        <textarea 
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          placeholder="어떤 디자인을 원하시나요? (예: 귀여운 고양이 캐릭터, 모던한 기하학 패턴...)"
                          className="w-full p-4 border border-gray-200 rounded-2xl text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none min-h-[100px] resize-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <button 
                          onClick={handleGenerate}
                          disabled={!prompt || isGenerating}
                          className="col-span-2 bg-black text-white font-bold py-4 rounded-2xl hover:bg-gray-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {isGenerating ? <RefreshCw className="animate-spin" size={18} /> : <Sparkles size={18} />}
                          제미나이 AI 디자인 생성
                        </button>
                      </div>
                      {generatedImage && (
                        <div className="flex items-center gap-2 pt-2">
                           <input 
                             type="range" min="10" max="100" value={scale} 
                             onChange={(e) => setScale(parseInt(e.target.value))}
                             className="flex-1 accent-emerald-600"
                           />
                           <span className="text-[10px] font-bold text-gray-500 w-8">{scale}%</span>
                        </div>
                      )}
                   </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quantity and Variations (Matches real site) */}
        <div className="pt-6 border-t border-gray-100 space-y-4">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400">수량 (개)</label>
              <div className="flex items-center justify-between bg-gray-50 p-3 rounded-2xl border border-gray-100">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm border border-gray-100 hover:bg-gray-50">
                  <Minus size={14} />
                </button>
                <span className="font-black text-lg">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm border border-gray-100 hover:bg-gray-50">
                  <Plus size={14} />
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400">건수 (종류)</label>
              <div className="flex items-center justify-between bg-gray-50 p-3 rounded-2xl border border-gray-100">
                <button onClick={() => setVariations(Math.max(1, variations - 1))} className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm border border-gray-100 hover:bg-gray-50">
                  <Minus size={14} />
                </button>
                <span className="font-black text-lg">{variations}</span>
                <button onClick={() => setVariations(variations + 1)} className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm border border-gray-100 hover:bg-gray-50">
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Pricing Details & Summary */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100 space-y-3">
             <div className="flex justify-between items-center cursor-pointer group" onClick={() => setShowPriceDetails(!showPriceDetails)}>
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 group-hover:text-gray-600 transition-colors">
                  가격 상세 보기
                  <ChevronRight size={12} className={`transition-transform ${showPriceDetails ? 'rotate-90' : ''}`} />
                </div>
                <div className="text-right">
                  <motion.p 
                      key={currentPrice * quantity * variations}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-2xl font-black text-gray-900"
                  >
                      {((currentPrice * quantity * variations) * 1.1).toLocaleString()}원
                      <span className="text-[10px] font-normal text-gray-400 ml-1">(VAT 별도)</span>
                  </motion.p>
                </div>
             </div>

             <AnimatePresence>
                {showPriceDetails && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden space-y-2 pt-2 border-t border-dashed border-gray-100"
                  >
                    {[
                      { label: '상품 기본액', val: currentPrice * quantity * variations },
                      { label: '출력 인쇄비', val: orderMethod === 'self' ? 0 : 5000 },
                      { label: '부가세 (10%)', val: (currentPrice * quantity * variations) * 0.1 }
                    ].map((item, idx) => (
                      <div key={idx} className="flex justify-between text-[11px]">
                        <span className="text-gray-400">{item.label}</span>
                        <span className="font-bold text-gray-600">+{item.val.toLocaleString()}원</span>
                      </div>
                    ))}
                  </motion.div>
                )}
             </AnimatePresence>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button onClick={handleAddToCart} className="bg-black text-white font-bold py-5 rounded-3xl hover:bg-gray-800 transition-all flex items-center justify-center gap-2">
              <ShoppingCart size={20} /> 장바구니
            </button>
            <button onClick={() => { handleAddToCart(); router.push('/checkout'); }} className="bg-emerald-600 text-white font-bold py-5 rounded-3xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-2">
              <Zap size={20} /> 바로구매
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
