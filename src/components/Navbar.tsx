"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, ShoppingCart, User, Menu, Heart, X, LogIn, Wand2 } from "lucide-react";
import NotificationDropdown from "@/components/NotificationDropdown";
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
        className="btn btn-secondary btn-sm"
      >
        <LogIn className="w-4 h-4" />
        로그인
      </button>
    );
  }

  return (
    <Link href="/mypage" className="text-gray-600 hover:text-gray-900 transition-colors">
      {user.photoURL ? (
        <Image
          src={user.photoURL}
          alt={user.displayName || "User"}
          width={32}
          height={32}
          className="w-8 h-8 rounded-full border border-gray-200"
          unoptimized
        />
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
  const router = useRouter();

  const cart = useStore((state) => state.cart);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

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

  return (
    <>
      {/* Stripe-style Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <span className="text-lg font-semibold text-gray-900 hidden sm:block">
                마이AI프린트샵
              </span>
            </Link>

            {/* Desktop Menu - 심플하게 */}
            <div className="hidden md:flex items-center gap-1">
              {getAllCategories().map(cat => (
                <div
                  key={cat.slug}
                  className="relative group"
                  onMouseEnter={() => setHoveredCategory(cat.slug)}
                  onMouseLeave={() => setHoveredCategory(null)}
                >
                  <Link
                    href={`/shop?category=${cat.slug}`}
                    className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors rounded-md hover:bg-gray-50"
                  >
                    {cat.label}
                  </Link>

                  {/* 드롭다운 */}
                  {cat.subcategories && cat.subcategories.length > 0 && hoveredCategory === cat.slug && (
                    <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                      <Link
                        href={`/shop?category=${cat.slug}`}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-medium"
                      >
                        전체 보기
                      </Link>
                      <div className="border-t border-gray-100 my-1" />
                      {cat.subcategories.map(sub => (
                        <Link
                          key={sub.slug}
                          href={`/shop?category=${cat.slug}&subcategory=${sub.slug}`}
                          className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <Link
                href="/create"
                className="px-3 py-2 text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors rounded-md hover:bg-purple-50"
              >
                AI 디자인
              </Link>
            </div>

            {/* Desktop Icons - 미니멀하게 */}
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
              <Link
                href="/mypage/designs"
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                title="나의 AI 디자인"
              >
                <Wand2 className="w-5 h-5" />
              </Link>
              <Link
                href="/wishlist"
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
              >
                <Heart className="w-5 h-5" />
              </Link>
              <NotificationDropdown />
              <Link
                href="/cart"
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors relative"
              >
                <ShoppingCart className="w-5 h-5" />
                {mounted && cartCount > 0 && (
                  <span className="absolute top-0 right-0 bg-purple-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                    {cartCount}
                  </span>
                )}
              </Link>
              <AuthButton />
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-4 py-4 space-y-2">
              {getAllCategories().map(cat => (
                <Link
                  key={cat.slug}
                  href={`/shop?category=${cat.slug}`}
                  className="block py-2 text-gray-700 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {cat.label}
                </Link>
              ))}
              <Link
                href="/create"
                className="block py-2 text-purple-600 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                AI 디자인
              </Link>
              <div className="pt-4 flex items-center gap-4 border-t border-gray-200">
                <button onClick={() => { setIsSearchOpen(true); setIsMenuOpen(false); }}>
                  <Search className="w-6 h-6 text-gray-600" />
                </button>
                <Link href="/cart" className="relative">
                  <ShoppingCart className="w-6 h-6 text-gray-600" />
                  {mounted && cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Link>
                <Link href="/mypage">
                  <User className="w-6 h-6 text-gray-600" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Search Overlay - 미니멀하게 */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-white">
          <div className="max-w-3xl mx-auto px-6 pt-24">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">검색</h2>
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
                className="w-full text-4xl font-bold border-none bg-transparent placeholder:text-gray-200 focus:ring-0 text-gray-900 py-4 focus-ring"
              />
            </form>
          </div>
        </div>
      )}
    </>
  );
}
