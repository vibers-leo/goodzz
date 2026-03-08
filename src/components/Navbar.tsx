"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, ShoppingCart, User, Menu, Heart, X, ArrowRight, LogIn, Wand2 } from "lucide-react";
import NotificationDropdown from "@/components/NotificationDropdown";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/store/useStore";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getAllCategories } from "@/lib/categories";

function AuthButton() {
  const { user, loginWithGoogle } = useAuth();
  
  if (!user) {
    return (
      <button 
        onClick={loginWithGoogle}
        className="flex items-center gap-2 text-sm font-bold text-gray-700 hover:text-black hover:bg-gray-100 px-3 py-2 rounded-lg transition-all"
      >
        <LogIn className="w-4 h-4" />
        로그인
      </button>
    );
  }

  return (
    <Link href="/mypage" className="flex items-center gap-2 text-gray-700 hover:text-black transition-colors">
      {user.photoURL ? (
        <Image src={user.photoURL} alt={user.displayName || "User"} width={32} height={32} className="w-8 h-8 rounded-full border border-gray-200" unoptimized />
      ) : (
        <User className="w-5 h-5" />
      )}
    </Link>
  );
}

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [expandedMobileCategory, setExpandedMobileCategory] = useState<string | null>(null);
  const router = useRouter();

  const cart = useStore((state) => state.cart);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Avoid hydration mismatch
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  const trendingKeywords = ["고양이", "사이버펑크", "오버핏", "여름 신상", "에코백"];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="shrink-0 flex items-center">
              <Link
                href="/"
                className="flex items-center gap-2"
              >
                <div className="w-9 h-9 bg-linear-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">M</span>
                </div>
                <span className="text-xl font-bold text-gray-900 hidden sm:block">마이AI프린트샵</span>
              </Link>
            </div>

            {/* Desktop Menu with Dropdowns */}
            <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
              {getAllCategories().map(cat => (
                <div
                  key={cat.slug}
                  className="relative group"
                  onMouseEnter={() => setHoveredCategory(cat.slug)}
                  onMouseLeave={() => setHoveredCategory(null)}
                >
                  <Link
                    href={`/shop?category=${cat.slug}`}
                    className="text-gray-600 hover:text-emerald-600 font-medium transition-colors inline-flex items-center gap-1"
                  >
                    {cat.label}
                    {cat.subcategories && cat.subcategories.length > 0 && (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </Link>

                  {/* 드롭다운 메뉴 */}
                  {cat.subcategories && cat.subcategories.length > 0 && hoveredCategory === cat.slug && (
                    <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50">
                      <Link
                        href={`/shop?category=${cat.slug}`}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 font-medium"
                      >
                        전체 보기
                      </Link>
                      <div className="border-t border-gray-100 my-1" />
                      {cat.subcategories.map(sub => (
                        <Link
                          key={sub.slug}
                          href={`/shop?category=${cat.slug}&subcategory=${sub.slug}`}
                          className="block px-4 py-2 text-sm text-gray-600 hover:bg-emerald-50 hover:text-emerald-600"
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <Link href="/create" className="text-gray-600 hover:text-emerald-600 font-medium transition-colors">
                AI 디자인
              </Link>
            </div>

            {/* Desktop Icons */}
            <div className="hidden md:flex items-center space-x-6">
              <button 
                onClick={() => setIsSearchOpen(true)}
                className="text-gray-600 hover:text-black transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
              <Link href="/mypage/designs" className="text-gray-600 hover:text-black transition-colors" title="나의 AI 디자인">
                <Wand2 className="w-5 h-5" />
              </Link>
              <Link href="/wishlist" className="text-gray-600 hover:text-black transition-colors">
                <Heart className="w-5 h-5" />
              </Link>
              <NotificationDropdown />
              <Link href="/cart" className="text-gray-600 hover:text-black transition-colors relative">
                <ShoppingCart className="w-5 h-5" />
                {mounted && cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center animate-in zoom-in">
                    {cartCount}
                  </span>
                )}
              </Link>
              
              {/* Auth Button */}
              <AuthButton />
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-600 hover:text-black p-2"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-b border-gray-100 overflow-hidden"
            >
              <div className="px-4 pt-2 pb-6 space-y-1">
                {getAllCategories().map(cat => (
                  <div key={cat.slug}>
                    {cat.subcategories && cat.subcategories.length > 0 ? (
                      <>
                        <button
                          onClick={() => setExpandedMobileCategory(expandedMobileCategory === cat.slug ? null : cat.slug)}
                          className="w-full flex items-center justify-between py-2 text-gray-700 font-bold"
                        >
                          <span>{cat.label}</span>
                          <svg
                            className={`w-4 h-4 transition-transform ${expandedMobileCategory === cat.slug ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        {expandedMobileCategory === cat.slug && (
                          <div className="pl-4 pb-2 space-y-1">
                            <Link
                              href={`/shop?category=${cat.slug}`}
                              className="block py-1.5 text-sm text-emerald-600 font-medium"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              전체 보기
                            </Link>
                            {cat.subcategories.map(sub => (
                              <Link
                                key={sub.slug}
                                href={`/shop?category=${cat.slug}&subcategory=${sub.slug}`}
                                className="block py-1.5 text-sm text-gray-600"
                                onClick={() => setIsMenuOpen(false)}
                              >
                                {sub.label}
                              </Link>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <Link
                        href={`/shop?category=${cat.slug}`}
                        className="block py-2 text-gray-700 font-bold"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {cat.label}
                      </Link>
                    )}
                  </div>
                ))}
                <Link href="/create" className="block py-2 text-gray-700 font-bold" onClick={() => setIsMenuOpen(false)}>AI 디자인</Link>
                <div className="pt-4 flex items-center space-x-6 border-t border-gray-100">
                  <button onClick={() => { setIsSearchOpen(true); setIsMenuOpen(false); }} className="text-gray-600">
                    <Search className="w-6 h-6" />
                  </button>
                  <Link href="/cart" className="text-gray-600 relative">
                    <ShoppingCart className="w-6 h-6" />
                    {mounted && cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                  <Link href="/mypage" className="text-gray-600">
                    <User className="w-6 h-6" />
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Global Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-white pt-16"
          >
            <div className="max-w-3xl mx-auto px-6">
              <div className="flex justify-between items-center mb-12">
                <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Search Products</span>
                <button 
                  onClick={() => setIsSearchOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-gray-900" />
                </button>
              </div>

              <form onSubmit={handleSearch} className="relative mb-12">
                <input 
                  autoFocus
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="무엇을 찾으시나요?"
                  className="w-full text-4xl md:text-5xl font-bold border-none bg-transparent placeholder:text-gray-100 focus:ring-0 text-gray-900 py-4"
                />
                <button type="submit" className="absolute right-0 top-1/2 -translate-y-1/2 p-4 text-gray-900">
                  <ArrowRight className="w-10 h-10" />
                </button>
              </form>

              <div className="space-y-6">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Trending Keywords</h3>
                <div className="flex flex-wrap gap-3">
                  {trendingKeywords.map((kw) => (
                    <button 
                      key={kw}
                      onClick={() => {
                        setSearchQuery(kw);
                        router.push(`/shop?q=${encodeURIComponent(kw)}`);
                        setIsSearchOpen(false);
                      }}
                      className="px-6 py-3 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-600 font-medium transition-all"
                    >
                      {kw}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
