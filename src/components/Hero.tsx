'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { ChevronLeft, ChevronRight, Wand2, Sparkles } from 'lucide-react';
import Link from 'next/link';

// 기본 배너 슬라이드 데이터
const defaultBannerSlides = [
  {
    id: 1,
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2000',
    title: 'AI 이미지로 만들기 좋은 굿즈',
    subtitle: '크리에이터와 함께! AI 프린트 샵',
    buttonText: 'AI 칩을 더해서 만들기!',
    buttonLink: '/create',
  },
  {
    id: 2,
    imageUrl: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=2000',
    title: '나만의 특별한 패션 아이템',
    subtitle: '티셔츠부터 후드까지, 당신만의 스타일을',
    buttonText: '패션 상품 보기',
    buttonLink: '/shop?category=fashion',
  },
  {
    id: 3,
    imageUrl: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?q=80&w=2000',
    title: '일상을 특별하게 만드는 굿즈',
    subtitle: '머그컵, 에코백, 스티커까지 다양하게',
    buttonText: '전체 상품 보기',
    buttonLink: '/shop',
  },
];

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [bannerSlides, setBannerSlides] = useState(defaultBannerSlides);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLElement>(null);

  // 스크롤 기반 Parallax 효과
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  // 마우스 기반 Parallax 효과
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current) return;
      const { clientX, clientY } = e;
      const { width, height } = heroRef.current.getBoundingClientRect();
      const x = (clientX / width - 0.5) * 20;
      const y = (clientY / height - 0.5) * 20;
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // localStorage에서 Hero 슬라이드 설정 로드
  useEffect(() => {
    const loadSlidesFromStorage = () => {
      const savedSlides = localStorage.getItem('hero_slides_config');
      if (savedSlides) {
        try {
          const slides = JSON.parse(savedSlides);
          if (slides && slides.length > 0) {
            setBannerSlides(slides);
          }
        } catch (e) {
          console.error('Failed to parse hero slides:', e);
        }
      }
    };

    loadSlidesFromStorage();

    // 관리자 페이지에서 저장할 때 이벤트 리스너로 갱신
    const handleUpdate = () => {
      loadSlidesFromStorage();
    };

    window.addEventListener('hero_slides_updated', handleUpdate);
    return () => window.removeEventListener('hero_slides_updated', handleUpdate);
  }, []);

  // 자동 슬라이드 (5초마다)
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
  };

  return (
    <section
      ref={heroRef}
      className="relative h-[75vh] lg:h-[85vh] overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Floating Elements (Decorative) */}
      <motion.div
        className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-indigo-500/20 to-amber-500/20 rounded-full blur-3xl"
        animate={{
          x: mousePosition.x,
          y: mousePosition.y,
        }}
        transition={{ type: 'spring', stiffness: 50 }}
      />
      <motion.div
        className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-tr from-amber-500/10 to-indigo-500/10 rounded-full blur-3xl"
        animate={{
          x: -mousePosition.x,
          y: -mousePosition.y,
        }}
        transition={{ type: 'spring', stiffness: 30 }}
      />

      {/* 슬라이드 이미지 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          className="absolute inset-0"
          style={{ y }}
        >
          {/* 배경 이미지 with Parallax */}
          <motion.div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${bannerSlides[currentSlide].imageUrl})`,
              transform: `scale(1.1) translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)`,
            }}
          />

          {/* 프리미엄 그라디언트 오버레이 */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/70 via-indigo-800/50 to-amber-900/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* 텍스트 콘텐츠 with Parallax */}
          <motion.div
            className="relative z-10 h-full flex items-center"
            style={{ opacity }}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
                className="max-w-3xl"
              >
                {/* 서브타이틀 Badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass-effect border border-white/20 mb-8 group cursor-default"
                >
                  <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                  <span className="text-sm font-semibold text-white">
                    {bannerSlides[currentSlide].subtitle}
                  </span>
                  <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                </motion.div>

                {/* 메인 타이틀 with Gradient */}
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-8 leading-[1.1] tracking-tight">
                  <span className="block drop-shadow-2xl">
                    {bannerSlides[currentSlide].title}
                  </span>
                </h1>

                {/* CTA 버튼 with Gradient */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  <Link
                    href={bannerSlides[currentSlide].buttonLink}
                    className="group inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-amber-500 hover:from-indigo-500 hover:to-amber-400 text-white rounded-full font-bold text-lg shadow-2xl hover:shadow-amber-500/50 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 relative overflow-hidden"
                  >
                    <span className="relative z-10">{bannerSlides[currentSlide].buttonText}</span>
                    <Wand2 className="w-5 h-5 relative z-10 group-hover:rotate-12 transition-transform" />
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  </Link>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* 이전/다음 버튼 - Premium Style */}
      <button
        onClick={goToPrevious}
        className="absolute left-6 lg:left-8 top-1/2 -translate-y-1/2 z-20 w-14 h-14 rounded-full glass-effect border border-white/20 hover:bg-white/30 transition-all flex items-center justify-center group shadow-xl hover:scale-110"
        aria-label="이전 슬라이드"
      >
        <ChevronLeft className="w-7 h-7 text-white group-hover:-translate-x-0.5 transition-transform" />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-6 lg:right-8 top-1/2 -translate-y-1/2 z-20 w-14 h-14 rounded-full glass-effect border border-white/20 hover:bg-white/30 transition-all flex items-center justify-center group shadow-xl hover:scale-110"
        aria-label="다음 슬라이드"
      >
        <ChevronRight className="w-7 h-7 text-white group-hover:translate-x-0.5 transition-transform" />
      </button>

      {/* 점(Dot) 네비게이션 - Premium Style */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex gap-2.5 bg-black/20 backdrop-blur-md px-4 py-3 rounded-full border border-white/10">
        {bannerSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-300 rounded-full ${
              index === currentSlide
                ? 'w-10 h-2.5 bg-gradient-to-r from-indigo-400 to-amber-400 shadow-lg shadow-indigo-500/50'
                : 'w-2.5 h-2.5 bg-white/40 hover:bg-white/60 hover:scale-125'
            }`}
            aria-label={`슬라이드 ${index + 1}로 이동`}
          />
        ))}
      </div>
    </section>
  );
}
