'use client';

import { motion } from 'framer-motion';
import { Sparkles, ChevronRight, Star } from 'lucide-react';
import Link from 'next/link';
import ProductCard from './ProductCard';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  thumbnail: string;
  category: string;
  badge?: string;
  reviewCount: number;
  rating: number;
}

interface Review {
  name: string;
  product: string;
  rating: number;
  content: string;
  date: string;
}

interface Props {
  aiGoodsItems: Product[];
  bestProducts: Product[];
  allProducts: Product[];
  reviews: Review[];
}

export default function HomeClientContent({ aiGoodsItems, bestProducts, allProducts, reviews }: Props) {
  return (
    <>
      {/* AI 이미지로 만들기 좋은 굿즈 */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Sparkles className="w-7 h-7 text-amber-500" />
                AI 이미지로 만들기 좋은 굿즈
              </h2>
              <p className="text-gray-500 mt-2">AI 디자이너가 추천하는 커스텀 굿즈</p>
            </div>
            <Link href="/shop" className="hidden md:flex items-center gap-1 text-indigo-600 font-semibold hover:gap-2 transition-all">
              전체보기 <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {aiGoodsItems.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Link href="/shop" className="inline-flex items-center gap-1 text-indigo-600 font-semibold">
              전체보기 <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 베스트 상품 */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
                🏆 베스트 상품
              </h2>
              <p className="text-gray-500 mt-2">가장 인기있는 상품들을 만나보세요</p>
            </div>
            <Link href="/shop?sort=best" className="hidden md:flex items-center gap-1 text-indigo-600 font-semibold hover:gap-2 transition-all">
              전체보기 <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
            {bestProducts.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* 전체 상품 */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                📦 전체 상품
              </h2>
              <p className="text-gray-500 mt-2">다양한 카테고리의 상품을 둘러보세요</p>
            </div>
            <Link href="/shop" className="hidden md:flex items-center gap-1 text-indigo-600 font-semibold hover:gap-2 transition-all">
              전체보기 <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
            {allProducts.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* 고객 리뷰 */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              💬 구매인증 고객 리뷰
            </h2>
            <p className="text-gray-500">실제 구매 고객님들의 생생한 후기</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {reviews.map((review, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-1 mb-3">
                  {Array(review.rating).fill(0).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 leading-relaxed">{review.content}</p>
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <span className="font-semibold text-gray-900">{review.name}</span>
                    <span className="text-gray-400 mx-2">·</span>
                    <span className="text-indigo-600">{review.product}</span>
                  </div>
                  <span className="text-gray-400">{review.date}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-emerald-500 to-teal-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              지금 바로 AI와 함께<br />나만의 굿즈를 만들어보세요
            </h2>
            <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
              아이디어만 있으면 됩니다. 제작부터 배송까지 모든 것을 저희가 처리합니다.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/shop"
                className="px-8 py-4 bg-white text-indigo-600 rounded-full font-bold text-lg hover:shadow-lg transition-all"
              >
                상품 둘러보기
              </Link>
              <Link
                href="/create"
                className="px-8 py-4 bg-transparent text-white border-2 border-white rounded-full font-bold text-lg hover:bg-white/10 transition-all"
              >
                AI 디자이너에게 부탁하기
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
