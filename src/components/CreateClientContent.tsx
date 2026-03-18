'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Wand2, ShoppingBag, ArrowRight, Palette, Layers, Zap } from 'lucide-react';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  price: number;
  thumbnail: string;
  category: string;
  badge?: string;
}

const AI_STYLES = [
  { id: 'Artistic', name: '예술적', icon: '🎨', desc: '유화/일러스트 스타일' },
  { id: 'Watercolor', name: '수채화', icon: '💧', desc: '부드러운 수채화 느낌' },
  { id: 'Cyberpunk', name: '사이버펑크', icon: '🌃', desc: '네온/미래 감성' },
  { id: 'Minimalist', name: '미니멀', icon: '▫️', desc: '깔끔한 라인 아트' },
  { id: '3D Render', name: '3D 렌더링', icon: '🧊', desc: '입체적인 3D 스타일' },
  { id: 'Pixar Style', name: '디즈니 풍', icon: '🧸', desc: '친근한 캐릭터 스타일' },
];

export default function CreateClientContent({ products }: { products: Product[] }) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [...new Set(products.map(p => p.category))];
  const filteredProducts = selectedCategory
    ? products.filter(p => p.category === selectedCategory)
    : products;

  return (
    <>
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-indigo-50 via-white to-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #D1FAE5 0%, transparent 50%), radial-gradient(circle at 80% 50%, #FEF3C7 0%, transparent 50%)' }} />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-bold mb-6">
              <Sparkles className="w-4 h-4" />
              Gemini Pro + Imagen 3
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">
              AI로 나만의<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-amber-500">
                커스텀 굿즈
              </span>를 만들어보세요
            </h1>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-10">
              아이디어를 텍스트로 입력하면, AI가 고품질 디자인을 생성합니다.
              원하는 상품에 바로 적용하고 주문까지 한번에!
            </p>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">
            3단계로 완성하는 나만의 굿즈
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Palette, step: '01', title: '상품 선택', desc: '아래에서 커스텀할 상품을 선택하세요', color: 'emerald' },
              { icon: Wand2, step: '02', title: 'AI 디자인 생성', desc: '텍스트로 설명하면 AI가 디자인을 만듭니다', color: 'blue' },
              { icon: ShoppingBag, step: '03', title: '주문 & 배송', desc: '마음에 드는 디자인으로 바로 주문하세요', color: 'amber' },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
                  item.color === 'emerald' ? 'bg-indigo-100' :
                  item.color === 'blue' ? 'bg-blue-100' : 'bg-amber-100'
                }`}>
                  <item.icon className={`w-7 h-7 ${
                    item.color === 'emerald' ? 'text-indigo-600' :
                    item.color === 'blue' ? 'text-blue-600' : 'text-amber-600'
                  }`} />
                </div>
                <div className="text-xs font-bold text-gray-400 mb-2">STEP {item.step}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Styles Preview */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">
            6가지 AI 스타일
          </h2>
          <p className="text-gray-500 text-center mb-10">
            Gemini Pro가 프롬프트를 최적화하고, Imagen 3가 고품질 이미지를 생성합니다
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {AI_STYLES.map((style, i) => (
              <motion.div
                key={style.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl p-4 text-center border border-gray-100 hover:shadow-md hover:border-indigo-200 transition-all cursor-default"
              >
                <div className="text-3xl mb-2">{style.icon}</div>
                <h3 className="font-bold text-gray-900 text-sm mb-1">{style.name}</h3>
                <p className="text-xs text-gray-400">{style.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Selector */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              커스텀할 상품을 선택하세요
            </h2>
            <p className="text-gray-500">상품을 선택하면 AI 디자인 에디터가 열립니다</p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                !selectedCategory
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              전체
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.map((product, i) => (
              <Link key={product.id} href={`/editor/${product.id}`}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.03 }}
                  className="group cursor-pointer"
                >
                  <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 mb-3">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 via-teal-50 to-amber-50 group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 bg-white/80 rounded-2xl flex items-center justify-center shadow-sm">
                        <ShoppingBag className="w-8 h-8 text-indigo-500" />
                      </div>
                    </div>
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/80 transition-all duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center">
                        <Wand2 className="w-8 h-8 text-white mx-auto mb-2" />
                        <span className="text-white font-bold text-sm">AI 디자인 시작</span>
                      </div>
                    </div>
                    {product.badge && (
                      <span className={`absolute top-3 left-3 px-2 py-1 rounded-md text-xs font-bold text-white z-10 ${
                        product.badge === 'BEST' ? 'bg-indigo-500' :
                        product.badge === 'HOT' ? 'bg-red-500' :
                        product.badge === 'NEW' ? 'bg-blue-500' : 'bg-gray-500'
                      }`}>
                        {product.badge}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-indigo-600 font-medium mb-1">{product.category}</p>
                    <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-lg font-bold text-gray-900 mt-1">
                      {product.price.toLocaleString()}원~
                    </p>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
