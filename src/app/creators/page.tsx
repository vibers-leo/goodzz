'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import { Palette, Share2, TrendingUp, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const steps = [
  {
    icon: <Palette className="w-8 h-8 text-blue-500" />,
    title: "AI와 함께 디자인",
    description: "상상력을 텍스트로 입력하여 독창적인 아트워크를 만듭니다."
  },
  {
    icon: <Share2 className="w-8 h-8 text-purple-500" />,
    title: "상품 등록",
    description: "완성된 디자인을 원하는 굿즈 타입에 등록하고 공개하세요."
  },
  {
    icon: <TrendingUp className="w-8 h-8 text-green-500" />,
    title: "판매 및 정산",
    description: "주문이 발생하면 제작부터 배송까지 저희가 책임지고, 수익을 정산해드립니다."
  }
];

export default function CreatorsPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-linear-to-b from-gray-50 to-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-6xl font-bold text-gray-900 mb-6"
            >
              당신의 상상력이 <br />
              <span className="text-blue-600">수익이 되는 곳</span>
            </motion.h1>
            <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xl text-gray-600 leading-relaxed"
            >
              디자인 기술이 없어도 괜찮습니다. AI와 함께라면 누구나 크리에이터가 될 수 있습니다.
              지금 바로 자신만의 브랜드를 시작하세요.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 + 0.2 }}
                className="text-center space-y-4"
              >
                <div className="w-16 h-16 bg-white shadow-xl rounded-2xl flex items-center justify-center mx-auto mb-6 border border-gray-100">
                    {step.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Join Section */}
      <section className="py-24 bg-black text-white rounded-[60px] mx-4 my-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="flex-1 space-y-8">
                <h2 className="text-3xl md:text-5xl font-bold">크리에이터를 위한 <br/> 완벽한 생태계</h2>
                <div className="space-y-4">
                    {[
                        "재고 부담 제로 (주문 후 즉시 제작)",
                        "디자인 도용 방지 시스템",
                        "투명한 실시간 판매 대시보드",
                        "글로벌 마켓 플레이스 노출"
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <CheckCircle2 className="w-6 h-6 text-blue-400" />
                            <span className="text-lg text-gray-300">{item}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex-1">
                <div className="aspect-video bg-gray-800 rounded-3xl overflow-hidden relative border border-white/10">
                     {/* Mock high-end UI preview */}
                     <div className="absolute inset-0 p-8 flex flex-col justify-end bg-linear-to-t from-blue-600/20 to-transparent">
                         <div className="w-full h-2/3 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 space-y-4">
                             <div className="flex justify-between items-center">
                                 <span className="text-sm font-bold opacity-50 uppercase tracking-widest">Dashboard</span>
                                 <span className="px-2 py-1 bg-green-500 text-[10px] rounded-full">LIVE</span>
                             </div>
                             <div className="h-8 bg-white/10 rounded-lg w-3/4" />
                             <div className="grid grid-cols-2 gap-4">
                                 <div className="h-16 bg-white/10 rounded-xl" />
                                 <div className="h-16 bg-white/10 rounded-xl" />
                             </div>
                         </div>
                     </div>
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-24 text-center">
         <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold mb-8">이제 당신의 차례입니다.</h2>
            <Link
                href="/creators/register"
                className="inline-flex items-center px-12 py-5 bg-blue-600 text-white rounded-full font-bold text-xl hover:bg-blue-700 transition-all hover:scale-105"
            >
                크리에이터 신청하기 <ArrowRight className="ml-2 w-6 h-6" />
            </Link>
            <p className="mt-6 text-gray-500">결제나 등록 비용은 전혀 없습니다.</p>
         </div>
      </section>

      <footer className="py-12 border-t border-gray-100 text-center text-gray-500 text-sm">
        <p>© 2024 Myaiprintshop. All rights reserved.</p>
      </footer>
    </main>
  );
}
