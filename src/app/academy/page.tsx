"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import { PlayCircle, BookOpen, User, Star, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const categories = [
  { name: "프롬프트 기초", count: 12 },
  { name: "스타일 가이드", count: 8 },
  { name: "수익화 전략", count: 5 },
  { name: "툴 활용법", count: 15 },
];

const featuredCourses = [
  {
    id: 1,
    title: "AI 아트 시작하기: 기초부터 마스터까지",
    instructor: "ArtMaster",
    duration: "45분",
    level: "초급",
    thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600",
    tags: ["Midjourney", "DALL-E"],
  },
  {
    id: 2,
    title: "판매를 부르는 굿즈 디자인 패턴",
    instructor: "DesignLab",
    duration: "60분",
    level: "중급",
    thumbnail: "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?auto=format&fit=crop&q=80&w=600",
    tags: ["Pattern", "Merch"],
  },
  {
    id: 3,
    title: "나만의 브랜드로 월 100만원 만들기",
    instructor: "MoneyMaker",
    duration: "30분",
    level: "고급",
    thumbnail: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=600",
    tags: ["Business", "Marketing"],
  },
];

export default function AcademyPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="md:w-1/2 space-y-6">
              <span className="text-blue-600 font-bold tracking-widest uppercase text-sm">GOODZZ Academy</span>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                AI 크리에이터를 위한 <br />
                <span className="text-gray-400">성장의 모든 것</span>
              </h1>
              <p className="text-xl text-gray-600">
                프롬프트 작성법부터 수익화 전략까지.<br />
                검증된 크리에이터들의 노하우를 무료로 배워보세요.
              </p>
              <div className="flex gap-4 pt-4">
                <button className="px-8 py-4 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-all flex items-center gap-2">
                  <PlayCircle className="w-5 h-5" />
                  무료 강의 시작하기
                </button>
              </div>
            </div>
            <div className="md:w-1/2 relative">
                <div className="aspect-video bg-gray-200 rounded-2xl overflow-hidden shadow-2xl relative group cursor-pointer">
                    <Image src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1000" className="object-cover transition-transform duration-700 group-hover:scale-105" alt="Academy Hero" fill />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/50 group-hover:scale-110 transition-transform">
                            <PlayCircle className="w-8 h-8 text-white fill-current" />
                        </div>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none">
                  {categories.map((cat) => (
                      <button key={cat.name} className="px-6 py-3 bg-white border border-gray-200 rounded-xl hover:border-blue-500 hover:text-blue-600 whitespace-nowrap transition-all group">
                          <span className="font-bold">{cat.name}</span>
                          <span className="ml-2 text-xs text-gray-400 group-hover:text-blue-400 bg-gray-50 px-2 py-0.5 rounded-full">{cat.count}</span>
                      </button>
                  ))}
              </div>
          </div>
      </section>

      {/* Popular Courses */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-10">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">인기 강의</h2>
                    <p className="text-gray-500">지금 가장 핫한 크리에이터 팁을 만나보세요.</p>
                </div>
                <Link href="#" className="font-bold text-gray-900 flex items-center gap-1 hover:gap-2 transition-all">
                    전체보기 <ArrowRight className="w-4 h-4" />
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {featuredCourses.map((course) => (
                    <div key={course.id} className="group relative bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1">
                        <div className="aspect-video bg-gray-100 relative overflow-hidden">
                            <Image src={course.thumbnail} alt={course.title} className="object-cover group-hover:scale-105 transition-transform duration-500" fill />
                            <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded font-bold">
                                {course.level}
                            </div>
                            <div className="absolute bottom-4 right-4 bg-black/80 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                                <PlayCircle className="w-3 h-3" /> {course.duration}
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="flex flex-wrap gap-2 mb-3">
                                {course.tags.map(tag => (
                                    <span key={tag} className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">#{tag}</span>
                                ))}
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                                {course.title}
                            </h3>
                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                                        <User className="w-3 h-3 text-gray-500" />
                                    </div>
                                    <span className="text-sm text-gray-600">{course.instructor}</span>
                                </div>
                                <div className="flex items-center gap-1 text-yellow-500">
                                    <Star className="w-4 h-4 fill-current" />
                                    <span className="text-sm font-bold text-gray-900">4.9</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* Newsletter / CTA */}
      <section className="py-20 bg-black text-white mb-20 mx-4 rounded-3xl">
          <div className="max-w-4xl mx-auto text-center px-4">
              <BookOpen className="w-12 h-12 mx-auto mb-6 text-gray-400" />
              <h2 className="text-3xl md:text-4xl font-bold mb-6">더 많은 노하우가 필요하신가요?</h2>
              <p className="text-gray-400 mb-8 max-w-xl mx-auto">
                  매주 발행되는 크리에이터 뉴스레터를 구독하고<br />
                  가장 트렌디한 AI 디자인 팁을 받아보세요.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                  <input 
                    type="email" 
                    placeholder="이메일 주소를 입력하세요" 
                    className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button className="bg-blue-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors">
                      구독하기
                  </button>
              </div>
          </div>
      </section>
    </main>
  );
}
