'use client';

import React, { useState, useEffect } from 'react';
import { Package, Search, Loader2, ArrowRight, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { Order } from '@/lib/payment';
import { toast } from 'sonner';
import ReviewModal from '@/components/ReviewModal';

export default function OrderHistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Review Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedProductForReview, setSelectedProductForReview] = useState<any>(null);

  useEffect(() => {
    const fetchUserOrders = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(`/api/orders?userId=${user.uid}`);
        const data = await response.json();
        if (data.success) {
          setOrders(data.orders);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast.error('주문 내역을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchUserOrders();
    }
  }, [user, authLoading]);

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING: '결제대기',
      PAID: '결제완료',
      PREPARING: '제작중',
      SHIPPED: '배송중',
      DELIVERED: '배송완료',
      CANCELLED: '취소됨',
    };
    return labels[status] || status;
  };

  const filteredOrders = orders.filter(order => 
    order.items.some(item => item.productName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    order.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenReviewModal = (order: Order, item: any) => {
    setSelectedProductForReview({
      orderId: order.id,
      productId: item.productId,
      productName: item.productName
    });
    setIsReviewModalOpen(true);
  };

  if (authLoading || (loading && user)) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="animate-spin text-emerald-500" size={40} />
        <p className="text-gray-500">주문 내역을 불러오는 중입니다...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
        <Package className="mx-auto text-gray-300 mb-4" size={48} />
        <p className="text-gray-500 mb-6">로그인이 필요한 서비스입니다.</p>
        <button 
          onClick={() => window.location.href = '/'} // 메인에서 로그인 유도
          className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-emerald-700 transition-colors"
        >
          로그인하러 가기
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">주문/배송 조회</h1>
        <div className="relative w-full md:w-64">
             <input 
              type="text" 
              placeholder="상품명 또는 주문번호 검색" 
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
             />
             <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
        </div>
      </div>

      <div className="space-y-6">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <Package className="mx-auto text-gray-200 mb-4" size={60} />
            <p className="text-gray-400">주문 내역이 없습니다.</p>
            <Link href="/shop" className="text-emerald-600 font-bold mt-4 inline-block hover:underline">
              쇼핑하러 가기 →
            </Link>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order.id} className="bg-white overflow-hidden rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
                <div className="bg-gray-50 px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-2 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-gray-900">{new Date(order.createdAt).toLocaleDateString()}</span>
                      <span className="text-gray-300">|</span>
                      <span className="font-mono text-sm text-gray-500">{order.id}</span>
                    </div>
                    <Link href={`/mypage/orders/${order.id}`} className="text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                        주문상세 보기 <ArrowRight size={14} />
                    </Link>
                </div>
                
                <div className="p-6">
                  {order.items.map((item, idx) => (
                    <div key={idx} className={`flex gap-4 ${idx > 0 ? 'mt-6 pt-6 border-t border-gray-50' : ''}`}>
                        <div className="w-20 h-20 bg-gray-50 rounded-lg overflow-hidden shrink-0 border border-gray-100 relative">
                            <Image
                              src={item.options?.customDesign || 'https://via.placeholder.com/150'}
                              alt={item.productName}
                              className="object-cover"
                              fill
                              unoptimized
                            />
                            {item.options?.customDesign && (
                              <div className="absolute top-1 right-1 bg-white/80 p-0.5 rounded shadow-sm">
                                <span className="text-[8px] font-bold text-emerald-600">AI</span>
                              </div>
                            )}
                        </div>
                        <div className="flex-1 flex flex-col justify-center min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                 <span className={`text-[10px] font-bold px-2 py-0.5 rounded shadow-sm ${
                                     ['DELIVERED', 'SHIPPED'].includes(order.orderStatus) ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-50 text-blue-700'
                                 }`}>
                                    {getStatusLabel(order.orderStatus)}
                                 </span>
                            </div>
                            <h3 className="font-bold text-gray-900 truncate">{item.productName}</h3>
                            <p className="text-gray-500 text-xs mt-0.5">
                              {item.options?.color && `${item.options.color} / `}
                              {item.options?.size && `${item.options.size} / `}
                              {item.quantity}개
                            </p>
                            <p className="font-bold text-gray-900 mt-2">{item.price.toLocaleString()}원</p>
                        </div>
                        <div className="hidden md:flex flex-col justify-center gap-2">
                             {order.shippingInfo.trackingNumber ? (
                               <a 
                                href={`https://tracker.delivery/track/${order.shippingInfo.carrier || '대한통운'}/${order.shippingInfo.trackingNumber}`}
                                target="_blank"
                                className="px-4 py-2 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-1"
                               >
                                배송조회 <ExternalLink size={12} />
                               </a>
                             ) : (
                               <button disabled className="px-4 py-2 border border-gray-100 rounded-lg text-xs font-bold text-gray-300 cursor-not-allowed">
                                 준비중
                               </button>
                             )}
                             {order.orderStatus === 'DELIVERED' && (
                                <button 
                                  onClick={() => handleOpenReviewModal(order, item)}
                                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 shadow-sm transition-all active:scale-95"
                                >
                                    리뷰작성
                                </button>
                             )}
                        </div>
                    </div>
                  ))}
                </div>
            </div>
          ))
        )}
      </div>

      {/* Review Modal */}
      {selectedProductForReview && user && (
        <ReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          orderId={selectedProductForReview.orderId}
          productId={selectedProductForReview.productId}
          productName={selectedProductForReview.productName}
          userId={user.uid}
          userName={user.displayName || '고객'}
        />
      )}
    </div>
  );
}
