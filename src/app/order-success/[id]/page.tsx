'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, Package, Truck, ArrowLeft, ShoppingBag, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { getOrderById } from '@/lib/orders';

export default function OrderSuccessPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      if (!id) return;
      try {
        const orderData = await getOrderById(id as string);
        setOrder(orderData);
      } catch (error) {
        console.error('Failed to fetch order:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div 
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center"
        >
          <ShoppingBag className="w-8 h-8 text-primary-600" />
        </motion.div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">주문 정보를 찾을 수 없습니다.</h1>
        <Link href="/" className="btn btn-primary">홈으로 돌아가기</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-primary-600 p-10 text-center text-white relative">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.2 }}
              className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle2 className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-3xl font-black mb-2">주문이 완료되었습니다!</h1>
            <p className="text-primary-100 font-medium">소중한 사진으로 세상에 하나뿐인 굿즈를 만듭니다.</p>
          </div>

          <div className="p-8 sm:p-12">
            {/* Order Summary */}
            <div className="flex flex-col md:flex-row gap-8 mb-12 items-center">
              <div className="w-48 h-48 bg-gray-100 rounded-3xl overflow-hidden shadow-inner border-8 border-gray-50 shrink-0">
                <img 
                  src={order.items[0]?.options?.customDesign || order.items[0]?.thumbnail} 
                  alt="Order Item" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 text-center md:text-left">
                <div className="text-sm font-bold text-primary-600 mb-1">ORDER #{order.id.slice(-6).toUpperCase()}</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{order.items[0]?.productName}</h2>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
                  <div className="bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                    <span className="text-xs text-gray-400 block">수량</span>
                    <span className="font-bold text-gray-900">{order.items[0]?.quantity}개</span>
                  </div>
                  <div className="bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                    <span className="text-xs text-gray-400 block">결제 금액</span>
                    <span className="font-bold text-gray-900">{(order.totalAmount + order.shippingFee).toLocaleString()}원</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress */}
            <div className="border-t border-gray-100 pt-10 mb-10">
              <h3 className="text-lg font-bold text-gray-900 mb-8 flex items-center gap-2">
                <Package className="w-5 h-5 text-primary-500" /> 제작 및 배송 진행 상황
              </h3>
              <div className="relative">
                <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-100" />
                <div className="relative flex justify-between">
                  {[
                    { icon: CheckCircle2, label: '결제 완료', color: 'text-primary-600', bg: 'bg-primary-600' },
                    { icon: Palette, label: '제작 대기', color: 'text-primary-600', bg: 'bg-primary-100' },
                    { icon: Truck, label: '배송 완료', color: 'text-gray-300', bg: 'bg-gray-100' },
                  ].map((step, i) => (
                    <div key={i} className="flex flex-col items-center relative z-10 w-24">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${step.bg}`}>
                        <step.icon className={`w-5 h-5 ${i <= 1 ? 'text-white' : 'text-gray-400'}`} />
                      </div>
                      <span className={`text-xs font-bold ${step.color}`}>{step.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-8 bg-primary-50 p-4 rounded-xl border border-primary-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Wand2 className="w-5 h-5 text-primary-600" />
                  <p className="text-sm text-primary-700 font-medium">
                    {order.vendorOrders?.[0]?.vendorName
                      ? `${order.vendorOrders[0].vendorName}에서 상품을 준비 중입니다.`
                      : '생산소로 고해상도 도안이 전송되었습니다.'}
                  </p>
                </div>
                {order.vendorOrders?.[0]?.externalOrderId && (
                  <span className="text-[10px] bg-white px-2 py-1 rounded-md border border-primary-200 text-primary-500 font-mono">
                    ID: {order.vendorOrders[0].externalOrderId}
                  </span>
                )}
              </div>
            </div>

            {/* Shipping Info */}
            <div className="bg-gray-50 rounded-3xl p-8 mb-10 border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4">배송 정보</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">수령인</span>
                  <span className="font-medium text-gray-900">{order.shippingInfo?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">연락처</span>
                  <span className="font-medium text-gray-900">{order.shippingInfo?.phone}</span>
                </div>
                <div className="flex justify-between text-right">
                  <span className="text-gray-400 grow">배송지</span>
                  <span className="font-medium text-gray-900 max-w-[200px]">{order.shippingInfo?.address}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/" className="flex-1 flex items-center justify-center gap-2 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-colors">
                <ShoppingBag className="w-5 h-5" /> 추가 주문하기
              </Link>
              <button onClick={() => window.print()} className="flex-1 py-4 bg-white border border-gray-200 text-gray-700 rounded-2xl font-bold hover:bg-gray-50 transition-colors">
                영수증 보기
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Icons
function Palette(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20a8 8 0 1 0-8-8 8 8 0 0 0 8 8Z" />
      <path d="M12 12V2" />
      <path d="M12 12H21" />
      <path d="M12 12 5 5" />
      <circle cx="12" cy="12" r="1" />
    </svg>
  );
}

function Wand2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.21 1.21 0 0 0 1.72 0L21.64 5.36a1.21 1.21 0 0 0 0-1.72Z" />
      <path d="m14 7 3 3" />
      <path d="M5 6v4" />
      <path d="M19 14v4" />
      <path d="M10 2v2" />
      <path d="M7 8H3" />
      <path d="M21 16h-4" />
      <path d="M11 3H9" />
    </svg>
  );
}
