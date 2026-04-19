'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Package, Truck, Home, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import { Order } from '@/lib/payment';
import Navbar from '@/components/Navbar';

function OrderCompleteContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      // 주문 정보 조회
      fetch(`/api/orders?orderId=${orderId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.order) {
            setOrder(data.order);
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [orderId]);

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-32 pb-20 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Success Animation */}
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="text-center mb-12"
          >
            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-12 h-12 text-emerald-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              주문이 완료되었습니다!
            </h1>
            <p className="text-gray-500">
              주문해주셔서 감사합니다. 제작이 시작되면 알려드릴게요.
            </p>
          </motion.div>

          {/* Order Info Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8"
          >
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-100">
              <div>
                <p className="text-sm text-gray-500 mb-1">주문번호</p>
                <p className="text-xl font-bold text-gray-900">{orderId || 'N/A'}</p>
              </div>
              <span className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-bold">
                결제 완료
              </span>
            </div>

            {/* Order Progress */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">결제 완료</p>
                    <p className="text-xs text-gray-500">주문이 접수되었습니다</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <Package className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-400">제작 중</p>
                    <p className="text-xs text-gray-400">준비 중...</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <Truck className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-400">배송 중</p>
                    <p className="text-xs text-gray-400">준비 중...</p>
                  </div>
                </div>
              </div>
              {/* Progress Bar */}
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full w-1/3 bg-emerald-500 rounded-full" />
              </div>
            </div>

            {/* Order Details */}
            {order && (
              <>
                <div className="space-y-4 mb-6">
                  <h3 className="font-bold text-gray-900">주문 상품</h3>
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                      <div>
                        <p className="font-medium text-gray-900">{item.productName}</p>
                        <p className="text-sm text-gray-500">
                          {item.options?.size && `${item.options.size} / `}
                          {item.options?.color && `${item.options.color} / `}
                          {item.quantity}개
                        </p>
                      </div>
                      <p className="font-bold text-gray-900">
                        {(item.price * item.quantity).toLocaleString()}원
                      </p>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 pt-4 border-t border-gray-100 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>상품 금액</span>
                    <span>{order.totalAmount.toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>배송비</span>
                    <span>{order.shippingFee === 0 ? '무료' : `${order.shippingFee.toLocaleString()}원`}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-gray-900 pt-2">
                    <span>총 결제 금액</span>
                    <span className="text-emerald-600">
                      {(order.totalAmount + order.shippingFee).toLocaleString()}원
                    </span>
                  </div>
                </div>

                {/* Shipping Info */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h3 className="font-bold text-gray-900 mb-3">배송 정보</h3>
                  <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                    <p><span className="text-gray-500">받는 분:</span> {order.shippingInfo.name}</p>
                    <p><span className="text-gray-500">연락처:</span> {order.shippingInfo.phone}</p>
                    <p><span className="text-gray-500">주소:</span> {order.shippingInfo.address} {order.shippingInfo.addressDetail}</p>
                    {order.shippingInfo.memo && (
                      <p><span className="text-gray-500">배송 메모:</span> {order.shippingInfo.memo}</p>
                    )}
                  </div>
                </div>
              </>
            )}
          </motion.div>

          {/* Action Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-2 gap-4"
          >
            <Link 
              href="/mypage/orders"
              className="flex items-center justify-center gap-2 px-6 py-4 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Package className="w-5 h-5" />
              주문 내역 보기
            </Link>
            <Link 
              href="/shop"
              className="flex items-center justify-center gap-2 px-6 py-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
              쇼핑 계속하기
            </Link>
          </motion.div>

          {/* Help Message */}
          <p className="text-center text-gray-400 text-sm mt-8">
            문의사항이 있으시면 고객센터 <span className="font-bold">010-4866-5805</span>로 연락주세요.
          </p>
        </div>
      </div>
    </main>
  );
}

export default function OrderCompletePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    }>
      <OrderCompleteContent />
    </Suspense>
  );
}
