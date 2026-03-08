'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Edit3, 
  Trash2, 
  ShoppingCart, 
  Clock, 
  Package, 
  ChevronRight,
  Loader2,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { getUserDesigns, DesignDraft, deleteDesign } from '@/lib/designs';
import { getProductById } from '@/lib/products';
import { useStore } from '@/store/useStore';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function MyDesignsPage() {
  const { user, loading: authLoading } = useAuth();
  const [designs, setDesigns] = useState<DesignDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const addToCart = useStore((state) => state.addToCart);

  useEffect(() => {
    const fetchDesigns = async () => {
      if (user) {
        const data = await getUserDesigns(user.uid);
        setDesigns(data);
      }
      setLoading(false);
    };

    if (!authLoading) {
      if (!user) {
        router.push('/');
        return;
      }
      fetchDesigns();
    }
  }, [user, authLoading, router]);

  const handleDelete = async (id: string) => {
    if (!confirm('작업물을 영구 삭제하시겠습니까?')) return;
    
    const success = await deleteDesign(id);
    if (success) {
      setDesigns(designs.filter(d => d.id !== id));
      toast.success('삭제되었습니다.');
    }
  };

  const handleOrderDirect = async (design: DesignDraft) => {
    try {
      // 실제 상품 가격 조회
      const product = await getProductById(design.productId);

      if (!product) {
        toast.error('상품 정보를 찾을 수 없습니다.');
        return;
      }

      addToCart({
        productId: design.productId,
        name: design.productName,
        price: product.price,
        thumbnail: design.previewUrl,
        quantity: 1,
        customDesignUrl: design.previewUrl,
        size: 'Standard',
        color: 'Standard'
      });
      toast.success('장바구니에 담겼습니다! 🛒');
      router.push('/cart');
    } catch (error) {
      toast.error('주문 처리 중 오류가 발생했습니다.');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <Loader2 className="animate-spin text-emerald-500 mb-4" size={40} />
        <p className="text-gray-500 font-medium">나의 AI 디자인을 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">나의 AI 디자인</h1>
          <p className="text-gray-500 text-sm mt-1">에디터에서 저장한 나만의 디자인 작업물입니다.</p>
        </div>
        <Link href="/shop" className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-50 flex items-center gap-2">
            새로 만들기 <Sparkles size={14} />
        </Link>
      </div>

      {designs.length === 0 ? (
        <div className="text-center py-32 bg-white rounded-3xl border border-dashed border-gray-200">
           <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
             <AlertCircle className="text-gray-300" size={32} />
           </div>
           <p className="text-gray-500 font-bold text-lg">아직 저장된 디자인이 없습니다.</p>
           <p className="text-gray-400 text-sm mt-1 mb-8">고급 에디터에서 자유롭게 디자인하고 수시로 저장해 보세요.</p>
           <Link href="/shop" className="text-emerald-600 font-bold hover:underline">상품 둘러보기 →</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {designs.map((design) => (
            <div key={design.id} className="group bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all hover:-translate-y-1">
               <div className="aspect-square relative overflow-hidden bg-gray-50">
                  <Image src={design.previewUrl} className="object-cover transition-transform group-hover:scale-110 duration-700" alt="Design Preview" fill unoptimized />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-xs">
                     <Link 
                       href={`/editor/${design.productId}?draft=${design.id}`}
                       className="p-3 bg-white text-gray-900 rounded-2xl hover:bg-emerald-500 hover:text-white transition-all scale-90 group-hover:scale-100 duration-300"
                     >
                       <Edit3 size={20} />
                     </Link>
                     <button 
                        onClick={() => handleDelete(design.id)}
                        className="p-3 bg-white text-gray-900 rounded-2xl hover:bg-red-500 hover:text-white transition-all scale-90 group-hover:scale-100 duration-300 delay-75"
                     >
                       <Trash2 size={20} />
                     </button>
                  </div>
                  <div className="absolute top-4 left-4">
                     <span className="bg-emerald-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg">AI DESIGN</span>
                  </div>
               </div>
               
               <div className="p-5">
                  <div className="flex justify-between items-start mb-4">
                     <div>
                        <h3 className="font-bold text-gray-900 truncate max-w-[180px]">{design.productName}</h3>
                        <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-1">
                          <Clock size={10} /> {new Date(design.updatedAt).toLocaleDateString()} 수정됨
                        </p>
                     </div>
                     <button 
                        onClick={() => handleOrderDirect(design)}
                        className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors"
                        title="장바구니 담기"
                     >
                        <ShoppingCart size={16} />
                     </button>
                  </div>
                  
                  <Link 
                    href={`/editor/${design.productId}?draft=${design.id}`}
                    className="w-full py-3 bg-gray-50 text-gray-600 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-gray-900 hover:text-white transition-all"
                  >
                    편집 이어가기 <ChevronRight size={14} />
                  </Link>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
