'use client';

import { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

// 간단한 배너 슬라이드 데이터
const bannerSlides = [
  {
    id: 1,
    title: 'AI로 디자인하고\n바로 제작하는',
    highlight: '프린트샵',
    subtitle: '상상을 현실로 만드는 가장 쉬운 방법',
    buttonText: '지금 시작하기',
    buttonLink: '/create',
    bgGradient: 'from-purple-50 to-blue-50',
  },
  {
    id: 2,
    title: '나만의 스타일,\n나만의',
    highlight: '패션',
    subtitle: '티셔츠부터 후드까지, 당신만의 브랜드를 만드세요',
    buttonText: '패션 상품 보기',
    buttonLink: '/shop?category=fashion',
    bgGradient: 'from-blue-50 to-indigo-50',
  },
  {
    id: 3,
    title: '특별한 순간을\n더 특별하게',
    highlight: '커스텀 굿즈',
    subtitle: '머그컵, 에코백, 스티커까지 원하는 모든 것',
    buttonText: '전체 상품 보기',
    buttonLink: '/shop',
    bgGradient: 'from-indigo-50 to-purple-50',
  },
];

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // 자동 슬라이드 (7초마다)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
    }, 7000);

    return () => clearInterval(interval);
  }, []);

  const slide = bannerSlides[currentSlide];

  return (
    <section className={`relative min-h-[80vh] flex items-center bg-gradient-to-br ${slide.bgGradient} transition-all duration-1000`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="max-w-4xl">
          {/* 메인 타이틀 - Stripe 스타일 */}
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-gray-900 mb-6 leading-[1.1] tracking-tight">
            {slide.title.split('\n').map((line, i) => (
              <span key={i} className="block">
                {line}{' '}
                {i === slide.title.split('\n').length - 1 && (
                  <span className="text-gradient-purple">{slide.highlight}</span>
                )}
              </span>
            ))}
          </h1>

          {/* 서브타이틀 */}
          <p className="text-xl md:text-2xl text-gray-600 mb-10 leading-relaxed">
            {slide.subtitle}
          </p>

          {/* CTA 버튼 */}
          <div className="flex flex-wrap gap-4">
            <Link
              href={slide.buttonLink}
              className="btn btn-primary btn-lg group"
            >
              {slide.buttonText}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/shop"
              className="btn btn-secondary btn-lg"
            >
              둘러보기
            </Link>
          </div>

          {/* 신뢰 배지 - 간단하게 */}
          <div className="mt-16 flex flex-wrap items-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span>24시간 빠른 제작</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span>무료 배송</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span>100% 환불 보장</span>
            </div>
          </div>
        </div>
      </div>

      {/* 점 네비게이션 - 미니멀하게 */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {bannerSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`transition-all duration-300 rounded-full ${
              index === currentSlide
                ? 'w-8 h-2 bg-purple-600'
                : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
            }`}
            aria-label={`슬라이드 ${index + 1}로 이동`}
          />
        ))}
      </div>
    </section>
  );
}
