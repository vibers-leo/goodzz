'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import Link from 'next/link';
import {
  LayoutDashboard, Package, TrendingUp, DollarSign, Plus,
  ExternalLink, Loader2, BarChart3, Eye, ShoppingBag, Settings
} from 'lucide-react';
import { toast } from 'sonner';
import type { Creator, CreatorProduct } from '@/lib/creators';

export default function CreatorDashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [creator, setCreator] = useState<Creator | null>(null);
  const [products, setProducts] = useState<CreatorProduct[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/creators/register');
      return;
    }

    const fetchData = async () => {
      if (!user) return;

      try {
        const [creatorRes, productsRes, statsRes] = await Promise.all([
          fetch(`/api/creators?uid=${user.uid}`),
          fetch(`/api/creators?uid=${user.uid}&products=true`),
          fetch(`/api/creators?uid=${user.uid}&stats=true`),
        ]);

        const creatorData = await creatorRes.json();
        const productsData = await productsRes.json();
        const statsData = await statsRes.json();

        if (creatorData.success && creatorData.creator) {
          setCreator(creatorData.creator);
        } else {
          router.push('/creators/register');
          return;
        }

        if (productsData.success) setProducts(productsData.products || []);
        if (statsData.success) setStats(statsData.stats);
      } catch (error) {
        console.error('Dashboard data error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) fetchData();
  }, [user, loading, router]);

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-emerald-500" size={40} />
      </div>
    );
  }

  if (!creator) return null;

  const tabs = [
    { id: 'overview', label: '대시보드', icon: LayoutDashboard },
    { id: 'products', label: '내 상품', icon: Package },
    { id: 'analytics', label: '판매 분석', icon: BarChart3 },
    { id: 'settings', label: '설정', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xl font-bold text-emerald-600">M</Link>
            <div>
              <h1 className="text-lg font-bold text-gray-900">{creator.shopName}</h1>
              <p className="text-xs text-gray-400">크리에이터 대시보드</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/creators/${creator.handle}`}
              target="_blank"
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold hover:bg-gray-50"
            >
              <Eye size={14} /> 내 샵 보기 <ExternalLink size={12} />
            </Link>
            <Link
              href="/editor/new"
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700"
            >
              <Plus size={14} /> 새 상품 만들기
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-100'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-500">총 판매</span>
                  <ShoppingBag className="text-blue-500" size={18} />
                </div>
                <p className="text-2xl font-bold">{stats?.totalSales || 0}건</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-500">총 매출</span>
                  <TrendingUp className="text-emerald-500" size={18} />
                </div>
                <p className="text-2xl font-bold text-emerald-600">{(stats?.totalRevenue || 0).toLocaleString()}원</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-500">누적 수익</span>
                  <DollarSign className="text-amber-500" size={18} />
                </div>
                <p className="text-2xl font-bold text-amber-600">{(stats?.totalEarnings || 0).toLocaleString()}원</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-500">등록 상품</span>
                  <Package className="text-purple-500" size={18} />
                </div>
                <p className="text-2xl font-bold">{stats?.productCount || 0}개</p>
              </div>
            </div>

            {/* Recent Products */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold">최근 상품</h2>
                <button onClick={() => setActiveTab('products')} className="text-sm text-emerald-600 font-bold hover:underline">
                  전체 보기
                </button>
              </div>

              {products.length === 0 ? (
                <div className="text-center py-16">
                  <Package className="mx-auto text-gray-300 mb-4" size={48} />
                  <p className="text-gray-500 mb-4">아직 등록된 상품이 없습니다.</p>
                  <Link
                    href="/create"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700"
                  >
                    <Plus size={16} /> 첫 상품 만들기
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {products.slice(0, 8).map((product) => (
                    <div key={product.id} className="group">
                      <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden relative mb-3">
                        <Image
                          src={product.designUrl}
                          alt={product.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                          unoptimized
                        />
                      </div>
                      <p className="text-sm font-bold text-gray-900 truncate">{product.title}</p>
                      <p className="text-sm text-emerald-600 font-bold">{product.price.toLocaleString()}원</p>
                      <p className="text-xs text-gray-400">{product.salesCount}개 판매</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Payout Info */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-8 text-white">
              <h3 className="text-lg font-bold mb-2">정산 안내</h3>
              <p className="text-emerald-100 text-sm mb-4">
                매월 15일에 전월 판매 대금이 정산됩니다. 최소 출금 금액은 10,000원입니다.
              </p>
              <div className="flex gap-6">
                <div>
                  <p className="text-emerald-200 text-xs">정산 대기 금액</p>
                  <p className="text-2xl font-bold">{(stats?.pendingPayout || 0).toLocaleString()}원</p>
                </div>
                <div>
                  <p className="text-emerald-200 text-xs">수익 배분율</p>
                  <p className="text-2xl font-bold">{100 - (creator.commissionRate || 30)}%</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">내 상품 관리</h2>
              <Link
                href="/create"
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700"
              >
                <Plus size={14} /> 새 상품
              </Link>
            </div>

            {products.length === 0 ? (
              <p className="text-center py-16 text-gray-400">등록된 상품이 없습니다.</p>
            ) : (
              <div className="space-y-4">
                {products.map((product) => (
                  <div key={product.id} className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden relative shrink-0">
                      <Image src={product.designUrl} alt={product.title} fill className="object-cover" unoptimized />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 truncate">{product.title}</p>
                      <p className="text-sm text-gray-500">{product.price.toLocaleString()}원</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{product.salesCount}개 판매</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${product.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                        {product.isActive ? '판매중' : '비활성'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-bold mb-6">판매 분석</h2>
            <div className="text-center py-16 text-gray-400">
              <BarChart3 className="mx-auto mb-4" size={48} />
              <p>판매 데이터가 쌓이면 분석 차트가 표시됩니다.</p>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 max-w-2xl">
            <h2 className="text-lg font-bold mb-6">샵 설정</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">샵 이름</label>
                <input type="text" defaultValue={creator.shopName} className="w-full px-4 py-3 border border-gray-200 rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">자기소개</label>
                <textarea defaultValue={creator.bio} className="w-full px-4 py-3 border border-gray-200 rounded-xl h-32 resize-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Instagram</label>
                <input type="text" defaultValue={creator.socialLinks?.instagram} placeholder="@username" className="w-full px-4 py-3 border border-gray-200 rounded-xl" />
              </div>
              <button className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700">
                변경사항 저장
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
