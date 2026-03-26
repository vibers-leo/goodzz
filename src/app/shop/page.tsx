
import React from 'react';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';
import { getAllCategories, getCategoryBySlug } from '@/lib/categories';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';

interface ShopPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ searchParams }: ShopPageProps): Promise<Metadata> {
  const resolvedSearchParams = await searchParams;
  const category = resolvedSearchParams.category as string | undefined;
  const query = resolvedSearchParams.q as string | undefined;

  const currentCategory = category ? getCategoryBySlug(category) : null;

  let title = "상품 전체보기";
  let description = "사장님을 위한 맞춤형 브랜드 굿즈. 명함, 스티커, 전단지 등 굿쯔(GOODZZ).";

  if (query) {
    title = `"${query}" 검색 결과`;
    description = `"${query}" 검색 결과 - GOODZZ(굿쯔)`;
  } else if (currentCategory) {
    title = currentCategory.label;
    description = `${currentCategory.label} 카테고리 - AI로 디자인한 커스텀 ${currentCategory.label} 상품을 만나보세요.`;
  }

  return {
    title,
    description,
    openGraph: {
      title: `${title} | GOODZZ(굿쯔)`,
      description,
    },
  };
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams.q as string | undefined;
  const category = resolvedSearchParams.category as string | undefined;
  const subcategory = resolvedSearchParams.subcategory as string | undefined;

  // 현재 선택된 카테고리 정보
  const currentCategory = category ? getCategoryBySlug(category) : null;

  // Fetch products from API
  let products = [];
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3300';
    let apiUrl = `${baseUrl}/api/products`;
    
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (category) params.append('category', category);
    if (subcategory) params.append('subcategory', subcategory);
    if (query) params.append('type', 'search');
    
    const res = await fetch(`${apiUrl}?${params.toString()}`, { cache: 'no-store' });
    const data = await res.json();
    if (data.success) {
      products = data.products;
    }
  } catch (error) {
    console.error('Error fetching products:', error);
  }

  const filteredProducts = products;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white pt-16">
        {/* Header / Banner */}
      <div className="bg-gradient-to-br from-primary-900 via-primary-800 to-accent-900 py-24 border-b border-white/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5 mix-blend-overlay"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary-500 opacity-30 rounded-full mix-blend-screen blur-[100px] animate-float" />
        <div className="container mx-auto px-4 text-center relative z-10 animate-fadeInUp">
          {query ? (
              <div>
                <span className="text-accent-300 font-bold mb-3 block uppercase tracking-widest text-sm flex items-center justify-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent-400" />
                  Search Results
                  <div className="w-1.5 h-1.5 rounded-full bg-accent-400" />
                </span>
                <h1 className="text-4xl md:text-6xl font-extrabold text-white inline-block drop-shadow-lg">
                    "{query}"
                </h1>
              </div>
          ) : (
              <>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 drop-shadow-md tracking-tight">
                    브랜드 굿즈 직접 만들기
                </h1>
                <p className="text-primary-100 max-w-2xl mx-auto text-lg md:text-xl font-medium leading-relaxed">
                    사장님을 위한 맞춤형 브랜드 굿즈. <br className="hidden md:block" />
                    수량은 가볍게, 퀄리티는 완벽하게 제작해드립니다.
                </p>
              </>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Category Tabs */}
        {!query && (
            <div className="mb-8">
              {/* 상위 카테고리 */}
              <div className="flex overflow-x-auto pb-4 gap-3 no-scrollbar">
                <Link
                  href="/shop"
                  className={`px-6 py-2.5 rounded-full whitespace-nowrap text-sm font-bold transition-all ${
                    !category
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                      : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-600'
                  }`}
                >
                  전체
                </Link>
                {getAllCategories().map(cat => {
                    const isActive = category === cat.slug;
                    return (
                      <Link
                        key={cat.slug}
                        href={`/shop?category=${cat.slug}`}
                        className={`px-6 py-2.5 rounded-full whitespace-nowrap text-sm font-bold transition-all ${
                            isActive
                            ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                            : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-600'
                        }`}
                      >
                        {cat.label}
                      </Link>
                    );
                })}
              </div>

              {/* 하위 카테고리 (현재 카테고리에 서브카테고리가 있을 때만 표시) */}
              {currentCategory && currentCategory.subcategories && currentCategory.subcategories.length > 0 && (
                <div className="flex overflow-x-auto gap-2 no-scrollbar mt-4 pl-4 border-l-4 border-primary-300">
                  <Link
                    href={`/shop?category=${category}`}
                    className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-semibold transition-all ${
                      !subcategory
                        ? 'bg-primary-100 text-primary-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-primary-50 hover:text-primary-600'
                    }`}
                  >
                    전체
                  </Link>
                  {currentCategory.subcategories.map(sub => {
                    const isActive = subcategory === sub.slug;
                    return (
                      <Link
                        key={sub.slug}
                        href={`/shop?category=${category}&subcategory=${sub.slug}`}
                        className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-semibold transition-all ${
                          isActive
                            ? 'bg-primary-100 text-primary-700'
                            : 'bg-gray-100 text-gray-600 hover:bg-primary-50 hover:text-primary-600'
                        }`}
                      >
                        {sub.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
        )}

        {/* Product Grid with Masonry Layout */}
        <div className="columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
          {filteredProducts.map((product: any, index: number) => (
            <div key={product.id} className="break-inside-avoid mb-6">
              <ProductCard product={product} index={index} />
            </div>
          ))}
        </div>
        
        {filteredProducts.length === 0 && (
            <div className="py-20 text-center">
                <p className="text-2xl font-bold text-gray-300">검색 결과가 없습니다.</p>
                <p className="text-gray-400 mt-2">다른 검색어를 입력해보세요.</p>
            </div>
        )}
      </div>
      </div>
      <Footer />
    </>
  );
}
