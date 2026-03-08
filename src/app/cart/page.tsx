'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useStore } from '@/store/useStore';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Tag } from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

function getVolumeDiscountedPrice(item: { price: number; quantity: number; metadata?: Record<string, any> }): number {
  const volumePricing = item.metadata?.volumePricing;
  const baseUnitPrice = item.metadata?.baseUnitPrice;
  if (!volumePricing || !baseUnitPrice) return item.price;

  const sorted = [...volumePricing].sort((a: any, b: any) => b.minQuantity - a.minQuantity);
  const tier = sorted.find((t: any) => item.quantity >= t.minQuantity);
  if (tier) {
    return Math.round(baseUnitPrice * (1 - (tier as any).discountRate));
  }
  return baseUnitPrice;
}

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="min-h-screen bg-white"></div>; // Prevent hydration error

  const subtotal = cart.reduce((acc, item) => {
    const effectivePrice = getVolumeDiscountedPrice(item);
    return acc + effectivePrice * item.quantity;
  }, 0);
  const shipping = subtotal > 50000 ? 0 : 3000;
  const total = subtotal + shipping;

  if (cart.length === 0) {
    return (
      <>
        <Navbar />
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 pt-32">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <ShoppingBag className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">장바구니가 비어있습니다</h2>
        <p className="text-gray-500 mb-8">나만의 굿즈를 디자인하고 담아보세요!</p>
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
      <h1 className="text-3xl font-bold text-gray-900 mb-8">장바구니 ({cart.length})</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <div 
                key={item.cartId} 
                className="flex gap-4 md:gap-6 p-4 border border-gray-100 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Image */}
              <div className="relative w-24 h-24 md:w-32 md:h-32 bg-gray-50 rounded-xl overflow-hidden shrink-0 border border-gray-100">
                <Image src={item.thumbnail} alt={item.name} fill sizes="128px" className="object-cover" />
                
                {/* Custom Design Overlay */}
                {item.customDesignUrl && (
                     <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                         <div className="relative w-2/3 h-2/3">
                           <Image
                              src={item.customDesignUrl}
                              className="object-contain mix-blend-multiply opacity-90"
                              alt="Custom"
                              fill
                              sizes="128px"
                              unoptimized
                           />
                         </div>
                     </div>
                )}
                
                {item.customDesignUrl && (
                    <div className="absolute bottom-1 right-1 bg-purple-100 text-purple-700 text-[10px] px-1.5 py-0.5 rounded font-bold">
                        AI Design
                    </div>
                )}
              </div>

              {/* Details */}
              <div className="flex-1 flex flex-col justify-between py-1">
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{item.name}</h3>
                    <button 
                        onClick={() => {
                            removeFromCart(item.cartId);
                            toast.error('상품이 삭제되었습니다.');
                        }}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {item.color} / {item.size}
                  </p>
                  <p className="font-semibold text-gray-900 mt-1">
                    {item.price.toLocaleString()}원
                  </p>
                </div>

                {/* Quantity Control */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center border border-gray-200 rounded-lg">
                        <button 
                            onClick={() => updateQuantity(item.cartId, -1)}
                            className="p-1 hover:bg-gray-50 text-gray-600 rounded-l-lg"
                        >
                            <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <button 
                            onClick={() => updateQuantity(item.cartId, 1)}
                            className="p-1 hover:bg-gray-50 text-gray-600 rounded-r-lg"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 rounded-2xl p-6 lg:p-8 sticky top-24 space-y-6">
            <h2 className="text-xl font-bold text-gray-900">주문 예상 금액</h2>
            
            <div className="space-y-4 text-sm">
                <div className="flex justify-between text-gray-600">
                    <span>총 상품금액</span>
                    <span>{subtotal.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between text-gray-600">
                    <span>배송비</span>
                    <span>{shipping === 0 ? '무료' : `${shipping.toLocaleString()}원`}</span>
                </div>
                {shipping > 0 && subtotal < 50000 && (
                    <p className="text-xs text-blue-600 text-right">
                        {(50000 - subtotal).toLocaleString()}원 더 담으면 무료배송!
                    </p>
                )}
            </div>

            <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
                <span className="font-bold text-gray-900">결제 예정 금액</span>
                <span className="text-2xl font-bold text-blue-600">{total.toLocaleString()}원</span>
            </div>

            <Link 
                href="/checkout"
                className="w-full bg-black text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
            >
                주문하기 <ArrowRight className="w-5 h-5" />
            </Link>
            
            <p className="text-xs text-gray-400 text-center">
                쿠폰/포인트는 다음 단계에서 적용할 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
    <Footer />
  </>
  );
}
