import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Footer from '@/components/Footer';
import HomeClientContent from '@/components/HomeClientContent';
import ReviewsSection from '@/components/ReviewsSection';
import Link from 'next/link';
import { getLatestReviews } from '@/lib/reviews';

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

// 하드코딩 리뷰 (DB에 리뷰가 없을 때 폴백)
const FALLBACK_REVIEWS = [
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

// Firestore 리뷰를 HomeClientContent가 기대하는 형식으로 변환
function formatReviewForDisplay(review: { userName: string; rating: number; content: string; createdAt: string }) {
  const date = new Date(review.createdAt);
  return {
    name: review.userName,
    product: '', // Firestore 리뷰에는 productName이 없으므로 빈 문자열
    rating: review.rating,
    content: review.content,
    date: `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`,
  };
}

async function getHomeReviews() {
  try {
    const dbReviews = await getLatestReviews(6);
    if (dbReviews.length > 0) {
      return dbReviews.map(formatReviewForDisplay);
    }
  } catch (error) {
    console.error('Failed to fetch reviews from Firestore:', error);
  }
  // DB에 리뷰가 없거나 오류 시 하드코딩 폴백
  return FALLBACK_REVIEWS;
}

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
  const [{ aiGoodsItems, bestProducts, allProducts }, reviews] = await Promise.all([
    getHomeProducts(),
    getHomeReviews(),
  ]);

  return (
    <main className="min-h-screen bg-white selection:bg-emerald-100 selection:text-emerald-900">
      <Navbar />
      <Hero />

      {/* Category Quick Links */}
      <section className="py-8 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4 md:gap-8">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                href={cat.href}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 hover:bg-emerald-50 hover:text-emerald-700 transition-all text-gray-700 font-medium"
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
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
    </main>
  );
}
