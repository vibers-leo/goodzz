'use client';

import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Hero() {
  return (
    <section className="relative bg-background overflow-hidden">
      {/* Background Aurora / Glow */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-300 opacity-20 rounded-full mix-blend-multiply blur-3xl animate-float" />
        <div className="absolute top-1/4 right-1/4 w-[30rem] h-[30rem] bg-accent-300 opacity-20 rounded-full mix-blend-multiply blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[40rem] h-[40rem] bg-yellow-200 opacity-20 rounded-full mix-blend-multiply blur-3xl animate-float" style={{ animationDelay: '4s' }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, type: 'spring', stiffness: 100 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-bold mb-8 shadow-sm">
              <Sparkles className="w-4 h-4" />
              미친 퀄리티의 AI 디자인
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 mb-8 leading-[1.15] tracking-tight">
              사장님, 브랜드 굿즈{' '}
              <br className="hidden sm:block" />
              <span className="text-gradient">직접 만들어보세요</span>
            </h1>

            <p className="text-lg md:text-xl text-gray-500 mb-10 leading-relaxed max-w-2xl mx-auto">
              AI가 디자인하고, 굿쯔가 만들어드립니다.
              <br />
              소량도 OK! 부담 없이 브랜드 맞춤 제작을 시작하세요.
            </p>
          </motion.div>

          {/* CTA 버튼 */}
          <motion.div 
            className="flex flex-col sm:flex-row justify-center items-center gap-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Link
              href="/create"
              className="btn btn-primary btn-lg group w-full sm:w-auto px-8 py-4 text-lg"
            >
              무료로 시작하기
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/shop"
              className="btn btn-secondary btn-lg glass-panel hover:bg-white w-full sm:w-auto px-8 py-4 text-lg"
            >
              둘러보기
            </Link>
          </motion.div>

          {/* 신뢰 배지 */}
          <motion.div 
            className="mt-16 flex flex-wrap justify-center items-center gap-6 md:gap-10 text-sm text-gray-500 font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            <div className="flex items-center gap-2 glass-panel px-4 py-2 rounded-full">
              <div className="w-2 h-2 rounded-full bg-accent-500 animate-pulse"></div>
              <span>24시간 빠른 제작</span>
            </div>
            <div className="flex items-center gap-2 glass-panel px-4 py-2 rounded-full">
              <div className="w-2 h-2 rounded-full bg-accent-500 animate-pulse"></div>
              <span>무료 배송</span>
            </div>
            <div className="flex items-center gap-2 glass-panel px-4 py-2 rounded-full">
              <div className="w-2 h-2 rounded-full bg-accent-500 animate-pulse"></div>
              <span>100% 만족 보장</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
