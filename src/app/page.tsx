import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Footer from '@/components/Footer';
import HomeClientContent from '@/components/HomeClientContent';
import ReviewsSection from '@/components/ReviewsSection';
import MarqueeBanner from '@/components/MarqueeBanner';
import FloatingActions from '@/components/FloatingActions';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  thumbnail: string;
  category: string;
  badge?: string;
  reviewCount: number;
  rating: number;
}

// 카테고리
const categories = [
  { name: '인쇄', href: '/shop?category=print', icon: '🖨️' },
  { name: '굿즈/팬시', href: '/shop?category=goods', icon: '✨' },
  { name: '패션/어패럴', href: '/shop?category=fashion', icon: '👕' },
  { name: '우리가게', href: '/shop?category=store', icon: '🏪' },
  { name: '주문제작', href: '/shop?category=custom', icon: '🎨' },
  { name: 'AI 레시피', href: '/shop?category=recipe', icon: '📚' },
];

// 고객 리뷰
const reviews = [
  {
    name: '김*현',
    product: '에코백',
    rating: 5,
    content: 'AI로 만든 디자인이 너무 예뻐요! 주변에서 어디서 샀냐고 물어봐요 ㅎㅎ',
    date: '2026.01.05'
  },
  {
    name: '이*진',
    product: '반팔 티셔츠',
    rating: 5,
    content: '프린팅 퀄리티가 생각보다 훨씬 좋아서 놀랐어요. 재주문할게요!',
    date: '2026.01.03'
  },
  {
    name: '박*수',
    product: '캔버스 액자',
    rating: 5,
    content: '거실에 걸어놨는데 분위기가 확 바뀌었어요. AI가 그린 그림이라고 하니까 다들 신기해해요.',
    date: '2025.12.28'
  },
];

async function getHomeProducts() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3300';

  try {
    // 3개의 API 요청 병렬 처리
    const [aiGoodsRes, bestRes, allRes] = await Promise.all([
      fetch(`${baseUrl}/api/products?type=new&limit=8`, { cache: 'no-store' }),
      fetch(`${baseUrl}/api/products?type=best&limit=6`, { cache: 'no-store' }),
      fetch(`${baseUrl}/api/products?limit=6`, { cache: 'no-store' }),
    ]);

    const [aiGoodsData, bestData, allData] = await Promise.all([
      aiGoodsRes.json(),
      bestRes.json(),
      allRes.json(),
    ]);

    return {
      aiGoodsItems: aiGoodsData.success ? aiGoodsData.products : [],
      bestProducts: bestData.success ? bestData.products : [],
      allProducts: allData.success ? allData.products : [],
    };
  } catch (error) {
    console.error('Failed to fetch home products:', error);
    return {
      aiGoodsItems: [],
      bestProducts: [],
      allProducts: [],
    };
  }
}

export default async function Home() {
  const { aiGoodsItems, bestProducts, allProducts } = await getHomeProducts();

  return (
    <main className="min-h-screen bg-white selection:bg-indigo-100 selection:text-indigo-900">
      <Navbar />
      <Hero />

      {/* Marquee Banner - 새로운 프리미엄 요소 */}
      <MarqueeBanner />

      {/* Category Quick Links - 업그레이드된 스타일 */}
      <section className="py-10 bg-gradient-to-b from-white to-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-3 md:gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                href={cat.href}
                className="group flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-white hover:bg-gradient-to-r hover:from-indigo-50 hover:to-amber-50 border border-gray-200 hover:border-indigo-200 transition-all text-gray-700 hover:text-indigo-700 font-semibold shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
              >
                <span className="text-xl group-hover:scale-110 transition-transform">{cat.icon}</span>
                <span className="text-sm">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Client Component로 전달하여 animation 유지 */}
      <HomeClientContent
        aiGoodsItems={aiGoodsItems}
        bestProducts={bestProducts}
        allProducts={allProducts}
        reviews={reviews}
      />

      {/* 고객 리뷰 섹션 */}
      <ReviewsSection />

      <Footer />

      {/* Floating Action Button - 새로운 프리미엄 요소 */}
      <FloatingActions />
    </main>
  );
}
