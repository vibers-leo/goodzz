'use client';
import Link from 'next/link';
import { useEffect, useRef } from 'react';

export default function LandingHero() {
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    el.style.opacity = '0';
    const timer = setTimeout(() => {
      el.style.transition = 'opacity 0.8s ease';
      el.style.opacity = '1';
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-[100dvh] flex items-center pt-16"
      style={{
        backgroundImage: `
          radial-gradient(ellipse 80% 60% at 20% -10%, rgba(245,158,11,0.12) 0%, transparent 50%),
          radial-gradient(ellipse 60% 50% at 80% 110%, rgba(245,158,11,0.08) 0%, transparent 50%)
        `,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Text */}
          <div>
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-8"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <span className="w-2 h-2 bg-amber-400 rounded-full" />
              <span className="text-xs text-zinc-400" style={{ wordBreak: 'keep-all' }}>
                지금 47,200명이 굿즈를 만들고 있습니다
              </span>
            </div>

            <h1
              className="font-black text-5xl sm:text-6xl lg:text-7xl leading-tight tracking-tight text-white mb-6"
              style={{ fontFamily: "'Outfit', 'Pretendard', sans-serif", wordBreak: 'keep-all' }}
            >
              사진 한 장으로<br />
              <span className="text-amber-400">나만의 굿즈를.</span>
            </h1>

            <p
              className="text-zinc-400 text-lg leading-relaxed mb-10"
              style={{ maxWidth: '55ch', wordBreak: 'keep-all' }}
            >
              AI가 내 사진을 분석해 최적의 굿즈 시안을 만들어드립니다.
              명함부터 포스터, 스티커, 에코백까지. 주문부터 배송까지 3분이면 됩니다.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/create"
                className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-lg px-8 py-4 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                style={{ minHeight: 56 }}
              >
                {/* @ts-ignore */}
                <iconify-icon icon="solar:magic-stick-3-bold" />
                사진으로 굿즈 만들기
              </Link>
              <Link
                href="/shop"
                className="flex items-center justify-center gap-2 text-white font-semibold text-lg px-8 py-4 rounded-xl transition-all duration-300 hover:border-zinc-600"
                style={{
                  minHeight: 56,
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                상품 구경하기
                {/* @ts-ignore */}
                <iconify-icon icon="solar:arrow-right-linear" />
              </Link>
            </div>

            {/* Stats */}
            <div
              className="flex items-center gap-6 mt-10 pt-10"
              style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div>
                <div className="font-black text-2xl text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  47,200<span className="text-amber-400">+</span>
                </div>
                <div className="text-xs text-zinc-500">총 주문 건수</div>
              </div>
              <div className="w-px h-10 bg-zinc-800" />
              <div>
                <div className="font-black text-2xl text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  4.87<span className="text-amber-400">/5</span>
                </div>
                <div className="text-xs text-zinc-500">고객 만족도</div>
              </div>
              <div className="w-px h-10 bg-zinc-800" />
              <div>
                <div className="font-black text-2xl text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  3<span className="text-amber-400">분</span>
                </div>
                <div className="text-xs text-zinc-500">평균 주문 완료</div>
              </div>
            </div>
          </div>

          {/* Right: Floating Product Card */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="animate-[float_6s_ease-in-out_infinite] relative">
              <div
                className="rounded-3xl p-5 w-80 sm:w-96"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
                }}
              >
                <div className="rounded-2xl overflow-hidden mb-4 bg-zinc-800" style={{ aspectRatio: '1/1' }}>
                  <img
                    src="https://images.unsplash.com/photo-1597484661643-2f5fef640dd1?auto=format&fit=crop&q=80&w=800"
                    alt="굿즈 미리보기"
                    className="w-full h-full object-cover"
                    loading="eager"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-white text-sm">나만의 에코백</div>
                    <div className="text-zinc-400 text-xs mt-0.5">AI 시안 완성 · 즉시 주문 가능</div>
                  </div>
                  <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
                    {/* @ts-ignore */}
                    <iconify-icon icon="solar:cart-large-4-bold" class="text-zinc-950 text-lg" />
                  </div>
                </div>
              </div>

              {/* Floating badges */}
              <div
                className="absolute -top-4 -right-4 rounded-2xl px-3 py-2 flex items-center gap-2"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                {/* @ts-ignore */}
                <iconify-icon icon="solar:star-bold" class="text-amber-400 text-base" />
                <span className="text-white text-xs font-semibold">AI 자동 시안</span>
              </div>
              <div
                className="absolute -bottom-4 -left-4 rounded-2xl px-3 py-2 flex items-center gap-2"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                {/* @ts-ignore */}
                <iconify-icon icon="solar:delivery-bold" class="text-amber-400 text-base" />
                <span className="text-white text-xs font-semibold">국내외 배송</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
