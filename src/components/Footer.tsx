'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, MapPin, Clock, Instagram, Youtube } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Brand & Contact */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4 opacity-50 grayscale brightness-200">
              <Image 
                src="/logo.png" 
                alt="GOODZZ" 
                width={100} 
                height={30} 
                className="h-6 w-auto object-contain"
              />
            </div>
            <p className="text-gray-400 mb-6 max-w-md leading-relaxed">
              소상공인과 브랜드를 위한 AI 굿즈 제작 플랫폼. 
              디자이너 없이도 고퀄리티 굿즈를 소량으로 부담 없이 제작하세요.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-primary-500" />
                <span className="font-medium text-white">고객센터: 010-4866-5805</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-primary-500" />
                <span>평일 09:00 - 18:00 / 점심 12:00 - 13:00</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-primary-500" />
                <span>support@goodzz.co.kr</span>
              </div>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-4">바로가기</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="hover:text-primary-400 transition-colors">홈</Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-primary-400 transition-colors">전체 상품</Link>
              </li>
              <li>
                <Link href="/create" className="hover:text-primary-400 transition-colors">AI 디자인</Link>
              </li>
              <li>
                <Link href="/mypage" className="hover:text-primary-400 transition-colors">마이페이지</Link>
              </li>
            </ul>
          </div>
          
          {/* Info Links */}
          <div>
            <h4 className="text-white font-bold mb-4">고객지원</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/faq" className="hover:text-primary-400 transition-colors">자주 묻는 질문</Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-primary-400 transition-colors">이용약관</Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-primary-400 transition-colors">개인정보처리방침</Link>
              </li>
              <li>
                <Link href="/refund" className="hover:text-primary-400 transition-colors">환불/배송 정책</Link>
              </li>
            </ul>
            
            {/* Social Links */}
            <div className="flex gap-3 mt-6">
              <a href="https://instagram.com/goodzz_official" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
            <div className="text-center md:text-left">
              <p>사업자: 부산 | 대표자: 김준형 | 사업자등록번호: 545-16-01046</p>
              <p>통신판매업신고번호: 2025-경남양산-0846호</p>
              <p>주소: 부산광역시 수영구 수영로 47 2층</p>
            </div>
            <p className="text-gray-600">
              © 2026 GOODZZ. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
