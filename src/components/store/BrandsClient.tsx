'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, Store, MapPin, Package } from 'lucide-react';

interface Brand {
  id: string;
  businessName: string;
  slug: string;
  logo: string | null;
  banner: string | null;
  shortBio: string | null;
  category: string | null;
  location: string | null;
  themeColor: string;
  totalProducts: number;
}

export default function BrandsClient({ brands }: { brands: Brand[] }) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', ...new Set(brands.map((b) => b.category).filter(Boolean) as string[])];

  const filtered = brands.filter((b) => {
    const matchSearch = !search || b.businessName.toLowerCase().includes(search.toLowerCase());
    const matchCategory = selectedCategory === 'all' || b.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50">
      {/* 헤더 */}
      <div className="max-w-6xl mx-auto px-4 pt-12 pb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">브랜드 디렉토리</h1>
          <p className="text-gray-500 text-lg">GOODZZ에 입점한 브랜드들을 만나보세요</p>
        </motion.div>

        {/* 검색 + 필터 */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="브랜드 검색..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-purple-400 focus:outline-none bg-white"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {cat === 'all' ? '전체' : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 브랜드 그리드 */}
      <div className="max-w-6xl mx-auto px-4 pb-20">
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((brand, i) => (
              <motion.div
                key={brand.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  href={`/store/${brand.slug}`}
                  className="group block bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300"
                >
                  {/* 배너 */}
                  <div className="h-32 relative overflow-hidden">
                    {brand.banner ? (
                      <Image src={brand.banner} alt="" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${brand.themeColor}44, ${brand.themeColor}11)` }} />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  </div>

                  {/* 프로필 */}
                  <div className="p-5 -mt-8 relative">
                    <div
                      className="w-14 h-14 rounded-xl overflow-hidden border-3 border-white shadow-md mb-3"
                      style={{ borderColor: brand.themeColor + '33' }}
                    >
                      {brand.logo ? (
                        <Image src={brand.logo} alt={brand.businessName} width={56} height={56} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-lg font-black text-white" style={{ backgroundColor: brand.themeColor }}>
                          {brand.businessName.charAt(0)}
                        </div>
                      )}
                    </div>

                    <h3 className="font-bold text-lg text-gray-900 group-hover:text-purple-600 transition-colors">
                      {brand.businessName}
                    </h3>
                    {brand.shortBio && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{brand.shortBio}</p>
                    )}

                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                      {brand.category && (
                        <span className="px-2 py-0.5 rounded-full" style={{ backgroundColor: brand.themeColor + '15', color: brand.themeColor }}>
                          {brand.category}
                        </span>
                      )}
                      {brand.location && (
                        <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" /> {brand.location}</span>
                      )}
                      <span className="flex items-center gap-0.5"><Package className="w-3 h-3" /> {brand.totalProducts}개</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Store className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">
              {search ? '검색 결과가 없습니다.' : '아직 입점한 브랜드가 없습니다.'}
            </p>
            <p className="text-gray-400 mt-2">판매자 신청 후 스토어를 개설해보세요!</p>
          </div>
        )}
      </div>
    </div>
  );
}
