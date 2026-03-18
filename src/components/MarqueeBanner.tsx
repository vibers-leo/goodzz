'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Star, TrendingUp, Award, Sparkles } from 'lucide-react';

interface MarqueeItem {
  id: string;
  type: 'review' | 'stat' | 'badge';
  content: string;
  author?: string;
  rating?: number;
  icon?: 'star' | 'trending' | 'award' | 'sparkles';
}

const defaultMarqueeItems: MarqueeItem[] = [
  {
    id: '1',
    type: 'review',
    content: 'AI로 만든 디자인이 너무 예뻐요! 주변에서 어디서 샀냐고 물어봐요',
    author: '김*현',
    rating: 5,
  },
  {
    id: '2',
    type: 'stat',
    content: '🎉 이번 주 주문 200건 돌파!',
    icon: 'trending',
  },
  {
    id: '3',
    type: 'review',
    content: '프린팅 퀄리티가 생각보다 훨씬 좋아서 놀랐어요. 재주문할게요!',
    author: '이*진',
    rating: 5,
  },
  {
    id: '4',
    type: 'badge',
    content: '⭐ 고객 만족도 98% 달성',
    icon: 'award',
  },
  {
    id: '5',
    type: 'review',
    content: '거실에 걸어놨는데 분위기가 확 바뀌었어요. AI가 그린 그림이라고 하니까 다들 신기해해요',
    author: '박*수',
    rating: 5,
  },
  {
    id: '6',
    type: 'stat',
    content: '✨ AI 이미지 생성 10,000+ 완료',
    icon: 'sparkles',
  },
  {
    id: '7',
    type: 'review',
    content: '배송도 빠르고 포장도 꼼꼼해서 좋았어요. 다음에 또 이용할게요!',
    author: '최*영',
    rating: 5,
  },
  {
    id: '8',
    type: 'badge',
    content: '🏆 베스트 AI 프린트 샵 선정',
    icon: 'award',
  },
];

const iconMap = {
  star: Star,
  trending: TrendingUp,
  award: Award,
  sparkles: Sparkles,
};

export default function MarqueeBanner() {
  const [isPaused, setIsPaused] = useState(false);
  const [marqueeItems, setMarqueeItems] = useState(defaultMarqueeItems);

  // Duplicate items for seamless loop
  const duplicatedItems = [...marqueeItems, ...marqueeItems];

  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-r from-indigo-50 via-white to-amber-50 border-y border-indigo-100/50 py-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(99, 102, 241, 0.15) 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }} />
      </div>

      {/* Marquee Container */}
      <div
        className="relative flex gap-8"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <motion.div
          className="flex gap-8 min-w-full"
          animate={{
            x: isPaused ? 0 : [0, -50 * duplicatedItems.length * 8],
          }}
          transition={{
            duration: 60,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          {duplicatedItems.map((item, index) => (
            <MarqueeCard key={`${item.id}-${index}`} item={item} />
          ))}
        </motion.div>
      </div>

      {/* Gradient Overlays (edge fade effect) */}
      <div className="absolute left-0 top-0 h-full w-32 bg-gradient-to-r from-indigo-50 to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 h-full w-32 bg-gradient-to-l from-amber-50 to-transparent pointer-events-none" />
    </div>
  );
}

function MarqueeCard({ item }: { item: MarqueeItem }) {
  const IconComponent = item.icon ? iconMap[item.icon] : Star;

  if (item.type === 'review') {
    return (
      <div className="flex-shrink-0 max-w-md px-6 py-4 bg-white/70 backdrop-blur-sm rounded-2xl border border-indigo-100/50 shadow-sm hover:shadow-md transition-all group cursor-default">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-indigo-500 to-amber-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
            {item.author?.charAt(0) || 'U'}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-gray-900 text-sm">{item.author}</span>
              {item.rating && (
                <div className="flex gap-0.5">
                  {Array.from({ length: item.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              )}
            </div>
            <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">
              "{item.content}"
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (item.type === 'stat' || item.type === 'badge') {
    return (
      <div className="flex-shrink-0 px-8 py-4 bg-gradient-to-r from-indigo-500/90 to-amber-500/90 rounded-full border border-white/20 shadow-lg backdrop-blur-sm group hover:scale-105 transition-transform cursor-default">
        <div className="flex items-center gap-3">
          {IconComponent && (
            <IconComponent className="w-5 h-5 text-white flex-shrink-0" />
          )}
          <span className="font-bold text-white text-sm whitespace-nowrap">
            {item.content}
          </span>
        </div>
      </div>
    );
  }

  return null;
}
