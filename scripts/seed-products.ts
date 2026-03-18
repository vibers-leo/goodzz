import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { MOCK_PRODUCTS } from '../src/lib/mock-data';

// Firebase Admin SDK 초기화 (서버 사이드, 환경변수 사용)
if (!getApps().length) {
  const serviceAccount = {
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID || 'myaiprintshop',
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };

  initializeApp({
    credential: cert(serviceAccount as any),
  });
}

const db = getFirestore();

// 카테고리별 Subcategory 매핑
function getSubcategory(category: string, name: string): string | null {
  if (category === '의류') {
    if (name.includes('티') || name.includes('반팔')) return '티셔츠';
    if (name.includes('후드') || name.includes('맨투맨')) return '후드/맨투맨';
    return '상의';
  }
  if (category === '굿즈' || category === '잡화') {
    if (name.includes('에코백')) return '에코백';
    if (name.includes('버튼') || name.includes('핀')) return '뱃지/버튼';
    return '팬시';
  }
  if (category === '인쇄') {
    if (name.includes('사원증') || name.includes('카드')) return '명함/카드';
    if (name.includes('책자')) return '리플렛/팜플렛';
    return '기타인쇄물';
  }
  return null;
}

// 카테고리별 태그 생성
function getTagsForCategory(category: string, badge?: string): string[] {
  const tags: string[] = ['AI 커스텀'];
  if (badge) tags.push(badge);

  const categoryTags: Record<string, string[]> = {
    의류: ['패션', '의류', '커스텀'],
    '홈/리빙': ['홈데코', '리빙', '인테리어'],
    잡화: ['액세서리', '패션소품'],
    테크: ['전자기기', '액세서리'],
    굿즈: ['굿즈', '팬시'],
    문구: ['문구', '오피스'],
    인쇄: ['인쇄물', '비즈니스'],
  };

  if (categoryTags[category]) {
    tags.push(...categoryTags[category]);
  }
  return tags;
}

// 카테고리별 옵션 생성
function getOptionsForCategory(category: string) {
  if (category === '의류') {
    return {
      sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      colors: [
        { name: 'White', hex: '#FFFFFF' },
        { name: 'Black', hex: '#000000' },
        { name: 'Navy', hex: '#001F3F' },
        { name: 'Gray', hex: '#AAAAAA' },
      ],
      groups: [
        {
          id: 'opt_size',
          name: 'Size',
          label: '사이즈',
          type: 'select',
          required: true,
          values: [
            { id: 's_xs', label: 'XS', priceAdded: 0 },
            { id: 's_s', label: 'S', priceAdded: 0 },
            { id: 's_m', label: 'M', priceAdded: 0 },
            { id: 's_l', label: 'L', priceAdded: 0 },
            { id: 's_xl', label: 'XL', priceAdded: 1000 },
            { id: 's_xxl', label: 'XXL', priceAdded: 2000 },
          ],
        },
        {
          id: 'opt_color',
          name: 'Color',
          label: '색상',
          type: 'select',
          required: true,
          values: [
            { id: 'c_white', label: 'White', priceAdded: 0 },
            { id: 'c_black', label: 'Black', priceAdded: 0 },
            { id: 'c_navy', label: 'Navy', priceAdded: 500 },
            { id: 'c_gray', label: 'Gray', priceAdded: 500 },
          ],
        },
      ],
    };
  }

  if (category === '홈/리빙' || category === '굿즈') {
    return {
      colors: [
        { name: 'White', hex: '#FFFFFF' },
        { name: 'Beige', hex: '#F5F5DC' },
        { name: 'Mint', hex: '#98FF98' },
      ],
      groups: [
        {
          id: 'opt_quantity',
          name: 'Quantity',
          label: '수량',
          type: 'select',
          required: false,
          values: [
            { id: 'q_1', label: '1개', priceAdded: 0 },
            { id: 'q_2', label: '2개 세트', priceAdded: -1000 },
            { id: 'q_5', label: '5개 세트', priceAdded: -3000 },
          ],
        },
      ],
    };
  }

  return {
    groups: [
      {
        id: 'opt_material',
        name: 'Material',
        label: '소재',
        type: 'select',
        required: true,
        values: [
          { id: 'v1', label: '기본', priceAdded: 0 },
          { id: 'v2', label: '프리미엄', priceAdded: 3000 },
        ],
      },
    ],
  };
}

// Mock 데이터를 Firestore 포맷으로 변환
function convertMockToFirestore(mock: typeof MOCK_PRODUCTS[0]) {
  return {
    id: mock.id,
    name: mock.name,
    price: mock.price,
    originalPrice: mock.originalPrice || mock.price + Math.floor(Math.random() * 5000) + 2000,
    thumbnail: mock.thumbnail,
    images: [mock.thumbnail],
    category: mock.category,
    subcategory: getSubcategory(mock.category, mock.name),
    badge: mock.badge || null,
    tags: getTagsForCategory(mock.category, mock.badge),
    description: `${mock.name}을(를) AI로 원하는 디자인으로 커스터마이징하세요. 고품질 소재와 프리미엄 인쇄로 특별한 나만의 아이템을 제작할 수 있습니다.`,
    options: getOptionsForCategory(mock.category),
    stock: Math.floor(Math.random() * 150) + 50,
    isActive: true,
    reviewCount: mock.reviewCount,
    rating: mock.rating,
    volumePricing: [
      { minQuantity: 10, discountRate: 0.1 },
      { minQuantity: 50, discountRate: 0.2 },
      { minQuantity: 100, discountRate: 0.3 },
    ],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };
}

async function seedProducts() {
  console.log('🌱 Firestore 상품 데이터 시딩 시작...\n');

  // 기존 데이터 확인
  const productsRef = db.collection('products');
  const snapshot = await productsRef.get();

  if (!snapshot.empty) {
    console.warn(`⚠️  Warning: products collection already has ${snapshot.size} documents.`);
    console.log('   Continuing will add/update products with the same IDs.\n');
  }

  let successCount = 0;
  let errorCount = 0;

  for (const mock of MOCK_PRODUCTS) {
    try {
      const data = convertMockToFirestore(mock);
      await db.collection('products').doc(mock.id).set(data);
      console.log(`  ✅ ${mock.id.padEnd(4)} - ${mock.name}`);
      successCount++;
    } catch (error) {
      console.error(`  ❌ ${mock.id} 실패:`, error);
      errorCount++;
    }
  }

  console.log(`\n📊 시딩 완료!`);
  console.log(`  - 성공: ${successCount}개`);
  console.log(`  - 실패: ${errorCount}개`);
  console.log(`  - 총계: ${MOCK_PRODUCTS.length}개\n`);

  if (successCount > 0) {
    console.log('✨ Firebase Console에서 확인하세요:');
    console.log('   https://console.firebase.google.com/project/myaiprintshop/firestore\n');
  }
}

seedProducts()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\nSeeding failed:', error);
    process.exit(1);
  });
