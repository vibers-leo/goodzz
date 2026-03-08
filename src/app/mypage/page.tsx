'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Package, Truck, Gift, ChevronRight, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Order } from '@/lib/payment';

export default function MyPageDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [recentOrder, setRecentOrder] = useState<Order | null>(null);
  const [stats, setStats] = useState({ shipping: 0, coupons: 3, points: '2,500' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(`/api/orders?userId=${user.uid}`);
        const data = await response.json();
        if (data.success && data.orders.length > 0) {
          const orders = data.orders as Order[];
          setRecentOrder(orders[0]); // 가장 최근 주문
          
          // 배송 중 상태 카운트
          const shippingCount = orders.filter(o => ['SHIPPED', 'PREPARING'].includes(o.orderStatus)).length;
          setStats(prev => ({ ...prev, shipping: shippingCount }));
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchDashboardData();
    }
  }, [user, authLoading]);

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING: '결제대기',
      PAID: '결제완료',
      PREPARING: '배송준비',
      SHIPPED: '배송중',
      DELIVERED: '배송완료',
      CANCELLED: '취소됨',
    };
    return labels[status] || status;
  };

  if (authLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="animate-spin text-emerald-500" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
          <p className="text-gray-500 text-sm mt-1">
            {user ? `${user.displayName || '회원'}님, 안녕하세요!` : '로그인이 필요합니다.'}
          </p>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        {[
            { label: '배송중/준비중', value: stats.shipping, icon: Truck, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: '보유 쿠폰', value: stats.coupons, icon: Gift, color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: '포인트', value: `${stats.points}P`, icon: Package, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map((stat) => (
            <div key={stat.label} className="bg-white p-6 rounded-2xl border border-gray-100 flex flex-col items-center justify-center gap-2 hover:shadow-lg transition-all hover:-translate-y-1">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.bg} ${stat.color} mb-1`}>
                    <stat.icon size={24} />
                </div>
                <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-tighter">{stat.label}</span>
            </div>
        ))}
      </div> 

      {/* Recent Activity */}
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold text-gray-900 text-lg">최근 주문 내역</h2>
            <Link href="/mypage/orders" className="text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 group">
                전체보기 <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
        </div>

        <div className="space-y-4">
            {recentOrder ? (
                <div className="flex gap-4 p-5 rounded-2xl bg-gray-50/50 border border-gray-100 group hover:border-emerald-200 transition-colors">
                    <div className="w-20 h-20 bg-white rounded-xl overflow-hidden shrink-0 border border-gray-100 shadow-sm relative">
                        <Image
                          src={recentOrder.items[0].options?.customDesign || 'https://via.placeholder.com/150'}
                          className="object-cover"
                          alt="Recent product"
                          fill
                          unoptimized
                        />
                        {recentOrder.items[0].options?.customDesign && (
                          <div className="absolute top-1 right-1 bg-emerald-500 text-white p-0.5 rounded text-[8px] font-bold">AI</div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                            <div className="min-w-0">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded shadow-sm ${
                                  ['SHIPPED', 'DELIVERED'].includes(recentOrder.orderStatus) ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-50 text-blue-700'
                                }`}>
                                   {getStatusLabel(recentOrder.orderStatus)}
                                </span>
                                <h3 className="font-bold text-gray-900 mt-2 truncate max-w-full">
                                  {recentOrder.items[0].productName} {recentOrder.items.length > 1 && `외 ${recentOrder.items.length - 1}건`}
                                </h3>
                                <p className="text-xs text-gray-400 mt-1 font-mono">
                                  {new Date(recentOrder.createdAt).toLocaleDateString()} 주문 ({recentOrder.id.slice(0, 12)}...)
                                </p>
                            </div>
                            <Link 
                                href="/mypage/orders"
                                className="text-xs font-bold text-gray-400 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-white hover:text-gray-900 hover:border-gray-900 transition-all flex items-center gap-1 shrink-0"
                            >
                                주문상세 <ArrowRight size={12} />
                            </Link>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <Package className="mx-auto text-gray-300 mb-3" size={40} />
                    <p className="text-gray-400 text-sm">최근 주문 내역이 없습니다.</p>
                    <Link href="/shop" className="text-emerald-600 font-bold mt-4 inline-block hover:underline text-sm">
                        쇼핑하러 가기
                    </Link>
                </div>
            )}
        </div>
      </div>

      {/* Recommended Section (Visual Only) */}
      <div className="bg-linear-to-r from-emerald-600 to-teal-600 p-8 rounded-3xl text-white flex justify-between items-center relative overflow-hidden group">
          <div className="relative z-10">
              <h2 className="text-xl font-bold mb-2">프리미엄 AI 디자인 리뷰 이벤트</h2>
              <p className="text-emerald-100 text-sm opacity-90">구매 후 정성스러운 후기를 남겨주시면 5,000P를 드립니다.</p>
              <button className="mt-4 bg-white text-emerald-600 px-5 py-2 rounded-xl text-sm font-bold shadow-lg hover:bg-emerald-50 transition-colors">
                  리뷰 작성하기
              </button>
          </div>
          <div className="absolute right-[-20px] top-[-20px] opacity-20 rotate-12 group-hover:scale-110 transition-transform duration-700">
              <Gift size={160} />
          </div>
      </div>
    </div>
  );
}
