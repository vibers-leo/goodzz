'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Star, Truck, ShieldCheck, Wand2, X, RefreshCw, Download,
  Heart, ShoppingBag, Sliders, LayoutGrid, Type, Move,
  MessageSquare, AlertCircle, ChevronRight, Minus, Plus,
  ShoppingCart, Zap, Sparkles, CheckCircle2, Users, Loader2
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '@/lib/products';
import { calculateProductPrice, SelectedOptions, PRINT_METHODS } from '@/lib/pricing';
import { useRouter } from 'next/navigation';
import { shareToKakao, shareToTwitter, shareToFacebook, shareViaClipboard } from '@/lib/social-share';
import { Share2 } from 'lucide-react';
import Image from 'next/image';
import { uploadDesignImage } from '@/lib/designs';
import { db } from '@/lib/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import ReviewGrid from './reviews/ReviewGrid';
import ReviewModal from './ReviewModal';
import { useAuth } from '@/context/AuthContext';
import { Camera } from 'lucide-react';

interface ProductDetailClientProps {
  product: Product;
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const router = useRouter();
  const { addToCart } = useStore();
  const { user } = useAuth();
  
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  
  // AI & Order State
  const [orderMethod, setOrderMethod] = useState<'self' | 'request' | 'upload'>('self');
  const [isAiMode, setIsAiMode] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
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

  // Bulk Order Inquiry State
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkForm, setBulkForm] = useState({ name: '', phone: '', email: '', quantity: '', message: '' });
  const [bulkSubmitting, setBulkSubmitting] = useState(false);

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkForm.name || !bulkForm.phone || !bulkForm.email || !bulkForm.quantity) {
      toast.error('필수 항목을 모두 입력해주세요.');
      return;
    }
    setBulkSubmitting(true);
    try {
      await addDoc(collection(db, 'bulk_inquiries'), {
        productId: product.id,
        productName: product.name,
        name: bulkForm.name,
        phone: bulkForm.phone,
        email: bulkForm.email,
        quantity: parseInt(bulkForm.quantity),
        message: bulkForm.message,
        status: 'pending',
        createdAt: Timestamp.now(),
      });
      toast.success('대량주문 문의가 접수되었습니다!');
      setShowBulkModal(false);
      setBulkForm({ name: '', phone: '', email: '', quantity: '', message: '' });
    } catch (error) {
      console.error('Bulk inquiry error:', error);
      toast.error('문의 접수 중 오류가 발생했습니다.');
    } finally {
      setBulkSubmitting(false);
    }
  };

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
            variations: variations,
            baseUnitPrice: currentPrice,
            volumePricing: product.volumePricing || null
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
          <Image
            src={product.thumbnail}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            priority
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
                    <Image
                      src={generatedImage}
                      className="object-contain mix-blend-multiply drop-shadow-sm opacity-90 transition-opacity duration-300"
                      alt="AI Design"
                      fill
                      sizes="50vw"
                      unoptimized
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
      <div className="space-y-6">
        <div className="pb-6 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-gray-900 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest">
              {product.category}
            </span>
            {product.printMethod && PRINT_METHODS[product.printMethod] && (
              <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wider">
                {PRINT_METHODS[product.printMethod].name}
              </span>
            )}
            <div className="flex items-center gap-1 ml-auto">
              <Star size={14} className="text-amber-400 fill-current" />
              <span className="text-sm font-black text-gray-900">{product.rating || 4.9}</span>
              <span className="text-xs text-gray-400 font-medium">(120+ reviews)</span>
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>
            {product.name}
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed max-w-lg">
            {product.description || '최고급 소재와 AI 기술이 만나 탄생한 커스텀 제품입니다. 세상에 단 하나뿐인 디자인을 지금 바로 완성해보세요.'}
          </p>
        </div>

        {/* Volume Pricing Table */}
        {product.volumePricing && product.volumePricing.length > 0 && (
          <div className="bg-gradient-to-br from-blue-50 to-emerald-50 rounded-2xl p-5 border border-blue-100">
            <div className="flex items-center gap-2 mb-3">
              <Users size={16} className="text-blue-600" />
              <h3 className="text-sm font-black text-gray-900">대량 구매 할인</h3>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 border-b border-blue-100">
                  <th className="text-left py-2 font-bold">수량</th>
                  <th className="text-center py-2 font-bold">할인율</th>
                  <th className="text-right py-2 font-bold">개당 가격</th>
                </tr>
              </thead>
              <tbody>
                {[...product.volumePricing]
                  .sort((a, b) => a.minQuantity - b.minQuantity)
                  .map((tier, idx) => {
                    const discountPercent = Math.round(tier.discountRate * 100);
                    const discountedPrice = Math.round(currentPrice * (1 - tier.discountRate));
                    const isActive = quantity >= tier.minQuantity;
                    return (
                      <tr
                        key={idx}
                        className={`border-b border-blue-50 last:border-0 transition-colors ${
                          isActive ? 'bg-emerald-50/50' : ''
                        }`}
                      >
                        <td className="py-2 text-left">
                          <span className={`font-bold ${isActive ? 'text-emerald-700' : 'text-gray-700'}`}>
                            {tier.minQuantity}개 이상
                          </span>
                        </td>
                        <td className="py-2 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${
                            isActive
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {discountPercent}% OFF
                          </span>
                        </td>
                        <td className="py-2 text-right">
                          <span className={`font-bold ${isActive ? 'text-emerald-700' : 'text-gray-700'}`}>
                            {discountedPrice.toLocaleString()}원
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}

        {/* Dynamic Pricing Options */}
        {product.options?.groups && (
          <div className="grid grid-cols-1 gap-6">
            {product.options.groups.map(group => (
              <div key={group.id} className="space-y-3">
                <div className="flex justify-between items-end">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">
                    {group.label} {group.required && <span className="text-red-500">*</span>}
                  </label>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">필수 선택</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {group.values.map(val => (
                    <button
                      key={val.id}
                      onClick={() => setSelectedGroups(prev => ({ ...prev, [group.id]: val.id }))}
                      className={`p-3 rounded-2xl text-left border-2 transition-all relative ${
                        selectedGroups[group.id] === val.id 
                          ? 'border-gray-900 bg-white shadow-sm' 
                          : 'border-gray-50 hover:border-gray-200 bg-gray-50/50'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-xs font-bold ${selectedGroups[group.id] === val.id ? 'text-gray-900' : 'text-gray-500'}`}>
                          {val.label}
                        </span>
                        {val.id === selectedGroups[group.id] && <CheckCircle2 size={14} className="text-gray-900" />}
                      </div>
                      {val.priceAdded && val.priceAdded !== 0 ? (
                        <p className={`text-[10px] font-bold ${selectedGroups[group.id] === val.id ? 'text-gray-900' : 'text-gray-400'}`}>
                          +{val.priceAdded.toLocaleString()}원
                        </p>
                      ) : (
                        <p className="text-[10px] text-gray-400">추가 금액 없음</p>
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
              { id: 'self', label: '셀프 디자인', sub: '무료 AI 디자인', icon: <Sparkles className="w-4 h-4 text-indigo-500" /> },
              { id: 'request', label: '디자인 의뢰', sub: '전문가 손길', icon: <Wand2 className="w-4 h-4 text-blue-500" /> },
              { id: 'upload', label: '파일 업로드', sub: '직접 디자인', icon: <Download className="w-4 h-4 text-gray-500" /> }
            ].map((method) => (
              <button
                key={method.id}
                onClick={() => setOrderMethod(method.id as any)}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
                  orderMethod === method.id 
                    ? 'border-indigo-600 bg-indigo-50 shadow-sm' 
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
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-black rounded-2xl flex items-center justify-center gap-2 hover:from-indigo-700 hover:to-indigo-600 transition-all shadow-lg shadow-indigo-200"
              >
                {isAiMode ? '에디터 닫기' : '무료 셀프 디자인 에디터 실행'}
                {!isAiMode && <ChevronRight size={18} />}
              </button>

              {isAiMode && (
                <div className="mt-4 bg-gray-50 rounded-3xl p-6 border border-gray-100 space-y-4">
                   <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">제미나이 디자인 프롬프트</label>
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
                             className="flex-1 accent-indigo-600"
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
          <div className="bg-gray-50 rounded-[2rem] p-6 border border-gray-100 space-y-4">
             <div className="flex justify-between items-center cursor-pointer group" onClick={() => setShowPriceDetails(!showPriceDetails)}>
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 group-hover:text-gray-900 transition-colors">
                  상세 견적 보기
                  <ChevronRight size={14} className={`transition-transform duration-300 ${showPriceDetails ? 'rotate-90' : ''}`} />
                </div>
                <div className="text-right">
                  <motion.p 
                      key={currentPrice * quantity * variations}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-3xl font-black text-gray-900 tracking-tight"
                      style={{ fontFamily: "'Outfit', sans-serif" }}
                  >
                      {((currentPrice * quantity * variations) * 1.1).toLocaleString()}원
                      <span className="text-[10px] font-bold text-gray-400 ml-2 uppercase tracking-widest">Inc. VAT</span>
                  </motion.p>
                </div>
             </div>

             <AnimatePresence>
                {showPriceDetails && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden space-y-2.5 pt-4 border-t border-dashed border-gray-200"
                  >
                    {[
                      { label: '상품 기본 단가', val: currentPrice * quantity * variations },
                      { label: '제작 및 출력 공정비', val: orderMethod === 'self' ? 0 : 5000 },
                      { label: '부가가치세 (10%)', val: (currentPrice * quantity * variations) * 0.1 }
                    ].map((item, idx) => (
                      <div key={idx} className="flex justify-between text-xs">
                        <span className="text-gray-400 font-medium">{item.label}</span>
                        <span className="font-bold text-gray-900">+{item.val.toLocaleString()}원</span>
                      </div>
                    ))}
                    <div className="pt-2 mt-2 border-t border-gray-100 flex justify-between text-xs">
                       <span className="text-gray-900 font-black">최종 합계</span>
                       <span className="text-blue-600 font-black tracking-tight leading-none text-sm">
                         {((currentPrice * quantity * variations) * 1.1).toLocaleString()}원
                       </span>
                    </div>
                  </motion.div>
                )}
             </AnimatePresence>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
            <button 
              onClick={handleAddToCart} 
              className="bg-white text-gray-900 border-2 border-gray-900 font-bold py-5 rounded-[2rem] hover:bg-gray-50 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <ShoppingCart size={20} /> 장바구니
            </button>
            <button 
              onClick={() => { handleAddToCart(); router.push('/checkout'); }} 
              className="bg-gray-900 text-white font-bold py-5 rounded-[2rem] hover:bg-gray-800 transition-all flex items-center justify-center gap-2 active:scale-[0.98] shadow-xl shadow-gray-200"
            >
              <Zap size={20} className="fill-current" /> 바로구매
            </button>
          </div>

          {/* Social Share Buttons */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">공유</span>
            <div className="flex gap-2">
              <button
                onClick={() => shareToKakao({
                  title: product.name,
                  description: product.description || 'GOODZZ에서 만나보세요',
                  imageUrl: product.thumbnail,
                  url: `${typeof window !== 'undefined' ? window.location.origin : ''}/shop/${product.id}`,
                })}
                className="w-10 h-10 bg-[#FEE500] rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
                title="카카오톡 공유"
              >
                <span className="text-[#3C1E1E] text-xs font-bold">K</span>
              </button>
              <button
                onClick={() => shareToTwitter({
                  title: product.name,
                  description: product.description || '',
                  url: `${typeof window !== 'undefined' ? window.location.origin : ''}/shop/${product.id}`,
                })}
                className="w-10 h-10 bg-black rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
                title="X(Twitter) 공유"
              >
                <span className="text-white text-xs font-bold">X</span>
              </button>
              <button
                onClick={() => shareToFacebook({
                  title: product.name,
                  description: product.description || '',
                  url: `${typeof window !== 'undefined' ? window.location.origin : ''}/shop/${product.id}`,
                })}
                className="w-10 h-10 bg-[#1877F2] rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
                title="Facebook 공유"
              >
                <span className="text-white text-xs font-bold">f</span>
              </button>
              <button
                onClick={async () => {
                  const url = `${window.location.origin}/shop/${product.id}`;
                  await shareViaClipboard(url);
                  toast.success('링크가 복사되었습니다!');
                }}
                className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                title="링크 복사"
              >
                <Share2 size={14} className="text-gray-600" />
              </button>
            </div>
          </div>

          {/* Bulk Order Inquiry Button */}
          <button
            onClick={() => setShowBulkModal(true)}
            className="w-full py-4 bg-blue-50 text-blue-700 font-bold rounded-2xl hover:bg-blue-100 transition-all flex items-center justify-center gap-2 border border-blue-200"
          >
            <Users size={18} /> 대량주문 문의
          </button>
        </div>
      </div>

      {/* Bulk Order Inquiry Modal */}
      <AnimatePresence>
        {showBulkModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBulkModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden overflow-y-auto max-h-[90vh]"
            >
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-black text-gray-900">대량주문 문의</h2>
                    <p className="text-gray-500 text-sm mt-1">{product.name}</p>
                  </div>
                  <button onClick={() => setShowBulkModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleBulkSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500">이름 <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={bulkForm.name}
                      onChange={(e) => setBulkForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="담당자명"
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500">연락처 <span className="text-red-500">*</span></label>
                    <input
                      type="tel"
                      required
                      value={bulkForm.phone}
                      onChange={(e) => setBulkForm(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="010-0000-0000"
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500">이메일 <span className="text-red-500">*</span></label>
                    <input
                      type="email"
                      required
                      value={bulkForm.email}
                      onChange={(e) => setBulkForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="example@email.com"
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500">희망 수량 <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={bulkForm.quantity}
                      onChange={(e) => setBulkForm(prev => ({ ...prev, quantity: e.target.value }))}
                      placeholder="100"
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500">문의 내용</label>
                    <textarea
                      value={bulkForm.message}
                      onChange={(e) => setBulkForm(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="추가 요청사항이나 문의 내용을 작성해주세요"
                      rows={4}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={bulkSubmitting}
                    className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {bulkSubmitting ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        접수 중...
                      </>
                    ) : (
                      <>
                        <MessageSquare size={20} />
                        문의 접수하기
                      </>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reviews Section (NEW PREMIUM GRID) */}
      <div className="mt-32 border-t border-gray-100 pt-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-primary-600 text-[10px] font-black uppercase tracking-widest mb-3">
                  <Star size={12} className="fill-current" /> Customer Satisfaction
              </div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">사장님들의 <span className="text-primary-600">리얼 후기</span></h2>
              <p className="text-gray-400 text-sm mt-2 leading-relaxed max-w-md">
                  실제 구매 고객님들이 직접 디자인하고 제작한 상품들의<br />
                  생생한 후기와 퀄리티를 확인해보세요.
              </p>
            </div>
            
            <button 
                onClick={() => setShowReviewModal(true)}
                className="group px-8 py-4 bg-gray-900 text-white rounded-2xl text-xs font-black hover:bg-primary-600 transition-all duration-300 shadow-xl flex items-center gap-3"
            >
                <Camera size={16} className="group-hover:rotate-12 transition-transform" />
                포토 후기 작성하기
            </button>
        </div>

        <ReviewGrid reviews={reviews} isLoading={reviewsLoading} />
      </div>

      {/* Review Write Modal */}
      <ReviewModal 
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        productId={product.id}
        productName={product.name}
        userId={user?.uid || 'anonymous'}
        userName={user?.displayName || '익명'}
        onSuccess={() => {
            // Re-fetch reviews
            const fetchReviews = async () => {
                setReviewsLoading(true);
                try {
                  const res = await fetch(`/api/reviews?productId=${product.id}`);
                  const data = await res.json();
                  if (data.success) setReviews(data.reviews);
                } catch (error) {
                  console.error('Error fetching reviews:', error);
                } finally {
                  setReviewsLoading(false);
                }
              };
              fetchReviews();
        }}
      />
    </div>
  );
}
