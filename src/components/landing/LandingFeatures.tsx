'use client';
import { useEffect, useRef } from 'react';

const FEATURES = [
  {
    icon: 'solar:magic-stick-3-bold',
    title: 'AI가 시안을 자동으로 만들어드립니다',
    desc: '사진을 올리면 AI가 상품별 적정 사이즈, 배치, 색상까지 자동으로 조정합니다. 디자인을 몰라도 됩니다.',
    large: true,
    image: 'https://picsum.photos/seed/goodzz-ai-feature/800/450',
  },
  {
    icon: 'solar:clock-circle-bold',
    title: '3분 내 주문 완료',
    desc: '사진 업로드부터 결제까지 단 3분. 복잡한 절차 없이 즉시 주문할 수 있습니다.',
    stat: '3분',
    statSub: '이내',
  },
  {
    icon: 'solar:box-bold',
    title: '100가지 이상의 굿즈',
    desc: '명함, 스티커, 포스터, 에코백, 마스킹테이프까지. 원하는 거의 모든 굿즈를 한 곳에서.',
    chips: [
      { icon: 'solar:card-2-bold', label: '명함' },
      { icon: 'solar:sticker-bold', label: '스티커' },
      { icon: 'solar:bag-4-bold', label: '에코백' },
    ],
  },
  {
    icon: 'solar:delivery-bold',
    title: '전국 어디서든, 해외까지 배송',
    desc: '제작 완료 후 평균 2-5일 내 수령. 국내는 물론 전 세계 주요 도시로 배송해드립니다.',
    large: true,
    badges: ['국내 2-3일 내', '해외 7-14일 내', '실시간 배송 추적'],
  },
];

const glassStyle = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
};

export default function LandingFeatures() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const cards = sectionRef.current.querySelectorAll('.bento-card');
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) (e.target as HTMLElement).style.cssText += 'opacity:1;transform:translateY(0)';
      }),
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    cards.forEach((card) => {
      (card as HTMLElement).style.cssText = 'opacity:0;transform:translateY(2rem);transition:opacity 0.7s cubic-bezier(0.16,1,0.3,1),transform 0.7s cubic-bezier(0.16,1,0.3,1)';
      observer.observe(card);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <section id="features" className="py-32" ref={sectionRef}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bento-card mb-16">
          <p className="text-amber-400 text-sm font-semibold uppercase tracking-widest mb-4">왜 GOODZZ인가</p>
          <h2
            className="font-black text-4xl sm:text-5xl text-white leading-tight mb-4"
            style={{ fontFamily: "'Outfit','Pretendard',sans-serif", wordBreak: 'keep-all' }}
          >
            굿즈를 쉽게 만드는<br />가장 빠른 방법
          </h2>
          <p className="text-zinc-400 text-lg leading-relaxed" style={{ maxWidth: '55ch', wordBreak: 'keep-all' }}>
            복잡한 디자인 툴 없이도, AI가 내 이미지를 분석해 제품에 최적화된 시안을 즉시 제안합니다.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Large: AI Design */}
          <div
            className="bento-card rounded-3xl p-8 md:col-span-2 group cursor-default transition-all duration-300 hover:-translate-y-1"
            style={{ ...glassStyle }}
          >
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6"
              style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
              {/* @ts-ignore */}
              <iconify-icon icon="solar:magic-stick-3-bold" class="text-amber-400 text-2xl" />
            </div>
            <h3 className="font-bold text-2xl text-white mb-3" style={{ wordBreak: 'keep-all' }}>AI가 시안을 자동으로 만들어드립니다</h3>
            <p className="text-zinc-400 leading-relaxed mb-6" style={{ wordBreak: 'keep-all' }}>
              사진을 올리면 AI가 상품별 적정 사이즈, 배치, 색상까지 자동으로 조정합니다. 디자인을 몰라도 됩니다.
            </p>
            <div className="rounded-2xl overflow-hidden bg-zinc-800/50" style={{ aspectRatio: '16/9' }}>
              <img
                src="https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&q=80&w=800"
                alt="AI 시안 생성"
                className="w-full h-full object-cover opacity-70"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>

          {/* Small: Speed */}
          <div
            className="bento-card rounded-3xl p-8 transition-all duration-300 hover:-translate-y-1"
            style={glassStyle}
          >
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6"
              style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
              {/* @ts-ignore */}
              <iconify-icon icon="solar:clock-circle-bold" class="text-amber-400 text-2xl" />
            </div>
            <h3 className="font-bold text-xl text-white mb-3" style={{ wordBreak: 'keep-all' }}>3분 내 주문 완료</h3>
            <p className="text-zinc-400 text-sm leading-relaxed" style={{ wordBreak: 'keep-all' }}>
              사진 업로드부터 결제까지 단 3분. 복잡한 절차 없이 즉시 주문할 수 있습니다.
            </p>
            <div className="mt-6 flex items-end gap-2">
              <span className="font-black text-5xl text-amber-400" style={{ fontFamily: "'Outfit',sans-serif" }}>3</span>
              <span className="text-zinc-500 text-sm pb-1">분<br />이내</span>
            </div>
          </div>

          {/* Small: Products */}
          <div
            className="bento-card rounded-3xl p-8 transition-all duration-300 hover:-translate-y-1"
            style={glassStyle}
          >
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6"
              style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
              {/* @ts-ignore */}
              <iconify-icon icon="solar:box-bold" class="text-amber-400 text-2xl" />
            </div>
            <h3 className="font-bold text-xl text-white mb-3" style={{ wordBreak: 'keep-all' }}>100가지 이상의 굿즈</h3>
            <p className="text-zinc-400 text-sm leading-relaxed" style={{ wordBreak: 'keep-all' }}>
              명함부터 에코백까지. 원하는 거의 모든 굿즈를 한 곳에서.
            </p>
            <div className="mt-6 grid grid-cols-3 gap-2">
              {[
                { icon: 'solar:card-2-bold', label: '명함' },
                { icon: 'solar:sticker-bold', label: '스티커' },
                { icon: 'solar:bag-4-bold', label: '에코백' },
              ].map((chip) => (
                <div key={chip.label} className="rounded-xl p-2 flex flex-col items-center gap-1" style={glassStyle}>
                  {/* @ts-ignore */}
                  <iconify-icon icon={chip.icon} class="text-amber-400 text-lg" />
                  <span className="text-zinc-500 text-xs">{chip.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Large: Delivery */}
          <div
            className="bento-card rounded-3xl p-8 md:col-span-2 transition-all duration-300 hover:-translate-y-1"
            style={glassStyle}
          >
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6"
              style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
              {/* @ts-ignore */}
              <iconify-icon icon="solar:delivery-bold" class="text-amber-400 text-2xl" />
            </div>
            <h3 className="font-bold text-2xl text-white mb-3" style={{ wordBreak: 'keep-all' }}>전국 어디서든, 해외까지 배송</h3>
            <p className="text-zinc-400 leading-relaxed mb-6" style={{ wordBreak: 'keep-all' }}>
              제작 완료 후 평균 2-5일 내 수령. 국내는 물론 전 세계 주요 도시로 배송해드립니다.
            </p>
            <div className="flex gap-3 flex-wrap">
              {['국내 2-3일 내', '해외 7-14일 내', '실시간 배송 추적'].map((badge) => (
                <div key={badge} className="flex items-center gap-2 px-3 py-2 rounded-xl" style={glassStyle}>
                  {/* @ts-ignore */}
                  <iconify-icon icon="solar:check-circle-bold" class="text-amber-400 text-sm" />
                  <span className="text-zinc-300 text-sm">{badge}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
