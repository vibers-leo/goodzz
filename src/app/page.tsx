import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Footer from '@/components/Footer';
import HomeClientContent from '@/components/HomeClientContent';
import ReviewsSection from '@/components/ReviewsSection';
import Link from 'next/link';
import { getLatestReviews } from '@/lib/reviews';
import { Palette, Box, Clock, LayoutGrid, CheckCircle, Package } from 'lucide-react';

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

// 카테고리 — 소상공인 특화
const categories = [
  { name: '명함', href: '/shop?category=business-card', image: '/images/mockup-business-card.jpg', desc: '100장 15,000원~' },
  { name: '스티커', href: '/shop?category=sticker', image: '/images/mockup-sticker.jpg', desc: '50장 10,000원~' },
  { name: '전단지/리플렛', href: '/shop?category=flyer', image: '/images/mockup-flyer.jpg', desc: '100장 20,000원~' },
];

async function getHomeProducts() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3300';

  try {
    const [aiGoodsRes, bestRes] = await Promise.all([
      fetch(`${baseUrl}/api/products?type=new&limit=8`, { cache: 'no-store' }),
      fetch(`${baseUrl}/api/products?type=best&limit=8`, { cache: 'no-store' }),
    ]);

    const [aiGoodsData, bestData] = await Promise.all([
      aiGoodsRes.json(),
      bestRes.json(),
    ]);

    return {
      aiGoodsItems: aiGoodsData.success ? aiGoodsData.products : [],
      bestProducts: bestData.success ? bestData.products : [],
    };
  } catch (error) {
    console.error('Failed to fetch home products:', error);
    return {
      aiGoodsItems: [],
      bestProducts: [],
    };
  }
}

export default async function Home() {
  const { aiGoodsItems, bestProducts } = await getHomeProducts();

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <Hero />

      {/* 카테고리 섹션 */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-fadeInUp">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-4">
              가장 많이 찾는 굿즈
            </h2>
            <p className="text-gray-500 text-lg">사장님들이 가장 선호하는 베스트셀러 카테고리입니다.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {categories.map((cat, idx) => (
              <Link
                key={cat.name}
                href={cat.href}
                className="card card-hover overflow-hidden group flex flex-col animate-fadeInUp"
                style={{ animationDelay: `${idx * 0.15}s` }}
              >
                <div className="h-64 bg-gray-100 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10 transition-opacity group-hover:opacity-70" />
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-200 group-hover:scale-105 transition-transform duration-500">
                    {/* Placeholder for mockup image */}
                    <span className="text-gray-400 font-medium">실물 목업 이미지 ({cat.name})</span>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 z-20">
                    <h3 className="font-bold text-2xl text-white mb-1 drop-shadow-md">{cat.name}</h3>
                    <p className="text-white/90 text-sm font-medium">{cat.desc}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 사용 흐름 섹션 */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-primary-50/50 skew-x-12 translate-x-1/4 -z-10 blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-fadeInUp">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-16">
            굿쯔 제작, 단 4단계면 충분해요
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { num: 1, title: '카테고리 선택', icon: LayoutGrid },
              { num: 2, title: 'AI가 디자인', icon: Palette },
              { num: 3, title: '수량 선택 & 결제', icon: CheckCircle },
              { num: 4, title: '배송 완료', icon: Package },
            ].map((step, idx) => (
              <div key={idx} className="relative animate-fadeInUp" style={{ animationDelay: `${idx * 0.1}s` }}>
                {idx < 3 && (
                  <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-primary-200 to-transparent" />
                )}
                <div className="w-20 h-20 bg-white shadow-lg rounded-2xl flex items-center justify-center mx-auto mb-6 relative z-10 border border-gray-100 group hover:shadow-xl transition-all hover:-translate-y-1">
                  <div className="absolute inset-0 bg-primary-50 rounded-2xl scale-0 group-hover:scale-100 transition-transform duration-300 origin-center" />
                  <step.icon className="w-8 h-8 text-primary-600 relative z-10" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-lg">{step.num}. {step.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 왜 굿쯔? 섹션 */}
      <section className="py-24 bg-primary-900 text-white relative">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5 mix-blend-overlay"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fadeInUp">
          <h2 className="text-3xl lg:text-4xl font-extrabold mb-16 text-center text-white">
            사장님들이 굿쯔를 <span className="text-primary-400">선택하는 이유</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Palette, title: '디자이너 없이', desc: 'AI가 브랜드에 맞는\n디자인을 제안합니다' },
              { icon: Box, title: '소량 주문 OK', desc: '100장부터 가능,\n부담 없는 가격' },
              { icon: Clock, title: '빠른 배송', desc: '주문 후\n2~3일 내 도착' },
              { icon: LayoutGrid, title: '브랜드 일관성', desc: '로고/컬러 등록 시\n모든 굿즈에 자동 적용' },
            ].map(({ icon: Icon, title, desc }, idx) => (
              <div key={title} className="glass-panel text-center p-8 rounded-3xl border-white/10 hover:bg-white/10 transition-colors animate-fadeInUp" style={{ animationDelay: `${idx * 0.1}s` }}>
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-md">
                  <Icon className="w-7 h-7 text-primary-300" />
                </div>
                <h3 className="font-bold text-lg text-white mb-3">{title}</h3>
                <p className="text-sm text-gray-300 leading-relaxed">
                  {desc.split('\n').map((line, i) => (
                    <span key={i}>{line}{i === 0 && <br />}</span>
                  ))}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 제품 섹션 */}
      <HomeClientContent
        aiGoodsItems={aiGoodsItems}
        bestProducts={bestProducts}
      />

      {/* 리뷰 섹션 (하나만) */}
      <ReviewsSection />

      <Footer />
    </main>
  );
}
