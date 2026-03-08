'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useStore } from '@/store/useStore';
import { Heart, ShoppingBag, X, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function WishlistPage() {
  const { wishlist, toggleWishlist } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="min-h-screen bg-white"></div>;

  if (wishlist.length === 0) {
    return (
      <>
        <Navbar />
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 pt-32">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <Heart className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">위시리스트가 비어있습니다</h2>
        <p className="text-gray-500 mb-8">마음에 드는 상품을 찜해보세요!</p>
        <Link 
            href="/shop" 
            className="px-8 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors font-bold"
        >
            쇼핑하러 가기
        </Link>
      </div>
      <Footer />
    </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 pt-32">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">위시리스트 ({wishlist.length})</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
        {wishlist.map((item) => (
          <div key={item.productId} className="group relative">
            <div className="aspect-square w-full overflow-hidden rounded-2xl bg-gray-100 border border-gray-100 relative mb-4">
                <Image
                    src={item.thumbnail}
                    alt={item.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                
                <button 
                    onClick={(e) => {
                        e.preventDefault();
                        toggleWishlist(item);
                        toast.info('위시리스트에서 삭제되었습니다.');
                    }}
                    className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full text-red-500 hover:bg-white shadow-sm transition-all"
                >
                    <Heart className="w-5 h-5 fill-current" />
                </button>

                <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex justify-center pb-6">
                     <Link
                        href={`/shop/${item.productId}`} 
                        className="bg-black text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
                     >
                        상품 보러가기 <ArrowRight className="w-4 h-4" />
                     </Link>
                </div>
            </div>
            
            <div>
                 <p className="text-xs text-gray-500 mb-1">{item.category}</p>
                 <h3 className="text-lg font-bold text-gray-900 line-clamp-1">
                    <Link href={`/shop/${item.productId}`}>
                        <span aria-hidden="true" className="absolute inset-0" />
                        {item.name}
                    </Link>
                 </h3>
                 <p className="text-gray-900 font-bold mt-1">
                    {item.price.toLocaleString()}원
                 </p>
            </div>
          </div>
        ))}
      </div>
    </div>
    <Footer />
  </>
  );
}
