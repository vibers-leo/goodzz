export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number; // For discount display
  thumbnail: string;
  category: string;
  badge?: string; // e.g., 'BEST', 'NEW'
  reviewCount: number;
  rating: number;
}

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: '프리미엄 코튼 오버핏 반팔티',
    price: 18900,
    originalPrice: 25000,
    thumbnail: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=600',
    category: '의류',
    badge: 'BEST',
    reviewCount: 128,
    rating: 4.8,
  },
  {
    id: 'p2',
    name: '베이직 머그컵 (11oz)',
    price: 8900,
    thumbnail: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&q=80&w=600',
    category: '홈/리빙',
    reviewCount: 85,
    rating: 4.7,
  },
  {
    id: 'p3',
    name: '캔버스 에코백',
    price: 12500,
    originalPrice: 15000,
    thumbnail: 'https://images.unsplash.com/photo-1597484661643-2f5fef640dd1?auto=format&fit=crop&q=80&w=600',
    category: '잡화',
    badge: 'NEW',
    reviewCount: 12,
    rating: 4.9,
  },
  {
    id: 'p4',
    name: '아이폰 투명 젤리 케이스',
    price: 15000,
    thumbnail: 'https://images.unsplash.com/photo-1601593346740-925612772716?auto=format&fit=crop&q=80&w=600',
    category: '테크',
    reviewCount: 243,
    rating: 4.6,
  },
  {
    id: 'p5',
    name: '베이직 기모 후드티',
    price: 32000,
    originalPrice: 45000,
    thumbnail: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=600',
    category: '의류',
    badge: 'HOT',
    reviewCount: 310,
    rating: 4.9,
  },
  {
    id: 'p6',
    name: '메탈 핀 버튼 세트',
    price: 5000,
    thumbnail: 'https://images.unsplash.com/photo-1623190638510-188b307ec3c5?auto=format&fit=crop&q=80&w=600',
    category: '굿즈',
    reviewCount: 45,
    rating: 4.5,
  },
  { 
    id: 'p7', 
    name: '오가닉 코튼 맨투맨', 
    price: 45210, 
    thumbnail: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&q=80&w=600', 
    category: '의류', 
    reviewCount: 10, 
    rating: 5 
  },
  { 
    id: 'p8', 
    name: '포켓 반팔 티셔츠', 
    price: 15840, 
    thumbnail: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=600', 
    category: '의류', 
    reviewCount: 15, 
    rating: 4.5 
  },
  { 
    id: 'p9', 
    name: '데이리 투톤 에코백', 
    price: 18000, 
    thumbnail: 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&q=80&w=600', 
    category: '잡화', 
    badge: 'BEST', 
    reviewCount: 100, 
    rating: 4.8 
  },
  { 
    id: 'p10', 
    name: '프리미엄 무선 노트', 
    price: 5280, 
    thumbnail: 'https://images.unsplash.com/photo-1531346878377-244bb688229b?auto=format&fit=crop&q=80&w=600', 
    category: '문구', 
    reviewCount: 50, 
    rating: 4.7 
  },
  { 
    id: 'p11', 
    name: '다이컷 데코 스티커', 
    price: 11440, 
    thumbnail: 'https://images.unsplash.com/photo-1578357078586-491adf1aa5ba?auto=format&fit=crop&q=80&w=600', 
    category: '스티커', 
    reviewCount: 20, 
    rating: 4.5 
  },
  { 
    id: 'p12', 
    name: '렌티큘러 포토카드', 
    price: 15730, 
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600', 
    category: '굿즈', 
    reviewCount: 30, 
    rating: 4.9 
  },
  { 
    id: 'p13', 
    name: '아크릴 등신대/스탠드', 
    price: 41140, 
    thumbnail: 'https://plus.unsplash.com/premium_photo-1681412205562-b901a1bdc908?auto=format&fit=crop&q=80&w=600', 
    category: '인테리어', 
    reviewCount: 5, 
    rating: 4.0 
  },
  { 
    id: 'p14', 
    name: '레트로 컬러 머그', 
    price: 12000, 
    thumbnail: 'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?auto=format&fit=crop&q=80&w=600', 
    category: '홈/리빙', 
    badge: 'HOT', 
    reviewCount: 8, 
    rating: 4.2 
  },
  { 
    id: 'p15', 
    name: '무광 하드 케이스', 
    price: 18000, 
    thumbnail: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&q=80&w=600', 
    category: '테크', 
    reviewCount: 200, 
    rating: 4.9 
  },
  { 
    id: 'p16', 
    name: '투명 리유저블 텀블러', 
    price: 14000, 
    thumbnail: 'https://images.unsplash.com/photo-1447050519965-9831a29352e4?auto=format&fit=crop&q=80&w=600', 
    category: '홈/리빙', 
    reviewCount: 120, 
    rating: 4.8 
  },
  { 
    id: 'p17', 
    name: '타포린 쇼퍼백', 
    price: 21550, 
    thumbnail: 'https://images.unsplash.com/photo-1534003294336-d00d720d20d9?auto=format&fit=crop&q=80&w=600', 
    category: '패션', 
    reviewCount: 40, 
    rating: 4.7 
  },
  { 
    id: 'p18', 
    name: '하드커버 바인더', 
    price: 25000, 
    thumbnail: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600', 
    category: '인쇄', 
    reviewCount: 15, 
    rating: 4.5 
  },
  { 
    id: 'p19', 
    name: '프리미엄 무광 명함', 
    price: 9900, 
    thumbnail: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=600', 
    category: '인쇄', 
    reviewCount: 60, 
    rating: 4.6 
  },
  { 
    id: 'p20', 
    name: '마스킹 테이프', 
    price: 8800, 
    thumbnail: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=600', 
    category: '스티커', 
    reviewCount: 90, 
    rating: 4.9 
  }
];
