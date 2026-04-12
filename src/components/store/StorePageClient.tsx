'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MapPin, Globe, Instagram, Package, ShoppingBag, Search } from 'lucide-react';

interface StoreVendor {
  id: string;
  businessName: string;
  store: {
    slug?: string;
    logo?: string;
    banner?: string;
    description?: string;
    shortBio?: string;
    category?: string;
    location?: string;
    instagram?: string;
    website?: string;
    themeColor?: string;
  };
  stats: {
    totalProducts: number;
    totalOrders: number;
  };
}

interface StoreProduct {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  thumbnail: string;
  category: string;
  rating: number;
  reviewCount: number;
  badge?: string;
}

interface Props {
  vendor: StoreVendor;
  products: StoreProduct[];
}

export default function StorePageClient({ vendor, products }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const store = vendor.store || {};
  const themeColor = store.themeColor || '#8b5cf6';

  // 카테고리 추출
  const categories = ['all', ...new Set(products.map((p) => p.category))];

  // 필터링
  const filtered = products.filter((p) => {
    const matchSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = selectedCategory === 'all' || p.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* === 배너 === */}
      <div className="relative h-48 sm:h-64 md:h-72 bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
        {store.banner ? (
          <Image src={store.banner} alt="배너" fill className="object-cover opacity-80" />
        ) : (
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${themeColor}33, ${themeColor}11)` }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      {/* === 프로필 === */}
      <div className="max-w-6xl mx-auto px-4 -mt-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8"
        >
          <div className="flex flex-col sm:flex-row gap-6">
            {/* 로고 */}
            <div
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl flex-shrink-0 overflow-hidden border-4 border-white shadow-md -mt-16 sm:-mt-20 bg-white"
              style={{ borderColor: themeColor + '33' }}
            >
              {store.logo ? (
                <Image src={store.logo} alt={vendor.businessName} width={112} height={112} className="w-full h-full object-cover" />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center text-3xl font-black text-white"
                  style={{ backgroundColor: themeColor }}
                >
                  {vendor.businessName.charAt(0)}
                </div>
              )}
            </div>

            {/* 정보 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  {store.category && (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full mb-2 inline-block" style={{ backgroundColor: themeColor + '15', color: themeColor }}>
                      {store.category}
                    </span>
                  )}
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">{vendor.businessName}</h1>
                  {store.shortBio && <p className="text-gray-500 mt-1">{store.shortBio}</p>}
                </div>

                {/* 통계 */}
                <div className="flex gap-6 text-center">
                  <div>
                    <p className="text-xl font-bold text-gray-900">{vendor.stats.totalProducts}</p>
                    <p className="text-xs text-gray-500">상품</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-gray-900">{vendor.stats.totalOrders}</p>
                    <p className="text-xs text-gray-500">주문</p>
                  </div>
                </div>
              </div>

              {/* 메타 정보 */}
              <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-500">
                {store.location && (
                  <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {store.location}</span>
                )}
                {store.website && (
                  <a href={store.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-gray-900 transition-colors">
                    <Globe className="w-4 h-4" /> 웹사이트
                  </a>
                )}
                {store.instagram && (
                  <a href={`https://instagram.com/${store.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-gray-900 transition-colors">
                    <Instagram className="w-4 h-4" /> {store.instagram}
                  </a>
                )}
              </div>

              {/* 소개 */}
              {store.description && (
                <p className="mt-4 text-gray-600 text-sm leading-relaxed whitespace-pre-line">{store.description}</p>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* === 상품 영역 === */}
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* 검색 + 필터 */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="상품 검색..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-gray-400 focus:outline-none bg-white"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
                style={selectedCategory === cat ? { backgroundColor: themeColor } : undefined}
              >
                {cat === 'all' ? '전체' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* 상품 그리드 */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filtered.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link href={`/shop/${product.id}`} className="group block bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
                  <div className="aspect-square relative overflow-hidden bg-gray-100">
                    <Image
                      src={product.thumbnail}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {product.badge && (
                      <span className="absolute top-2 left-2 text-white text-xs font-bold px-2 py-1 rounded-full" style={{ backgroundColor: themeColor }}>
                        {product.badge}
                      </span>
                    )}
                  </div>
                  <div className="p-3 sm:p-4">
                    <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 group-hover:text-gray-600 transition-colors">
                      {product.name}
                    </h3>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-lg font-bold text-gray-900">₩{product.price.toLocaleString()}</span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-sm text-gray-400 line-through">₩{product.originalPrice.toLocaleString()}</span>
                      )}
                    </div>
                    {product.reviewCount > 0 && (
                      <div className="mt-1.5 flex items-center gap-1 text-xs text-gray-500">
                        <span className="text-yellow-500">★</span>
                        <span>{product.rating.toFixed(1)}</span>
                        <span>({product.reviewCount})</span>
                      </div>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">
              {searchQuery ? '검색 결과가 없습니다.' : '아직 등록된 상품이 없습니다.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
