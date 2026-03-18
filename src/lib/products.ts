import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  DocumentData
} from 'firebase/firestore';
import { db } from './firebase';

// 상품 타입 정의
// 자동 견적을 위한 상세 옵션 타입
export interface PricingOptionValue {
  id: string;
  label: string;
  priceAdded?: number;     // 추가 금액 (예: +1000)
  priceMultiplier?: number; // 가중치 (예: x1.2)
  hex?: string;            // 색상 코드 (선택)
}

export interface PricingOptionGroup {
  id: string;
  name: string;
  label: string;
  type: 'select' | 'radio' | 'dimension' | 'number';
  description?: string;
  values: PricingOptionValue[];
  required?: boolean;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number; // 기본 가격
  originalPrice?: number;
  thumbnail: string;
  images?: string[];
  category: string;
  subcategory?: string;
  badge?: 'BEST' | 'NEW' | 'HOT' | 'SALE';
  tags?: string[];
  options?: {
    sizes?: string[]; // (하위 호환 유지)
    colors?: { name: string; hex: string }[]; // (하위 호환 유지)
    groups?: PricingOptionGroup[]; // 새 자동 견적 시스템 옵션
  };
  stock: number;
  isActive: boolean;
  reviewCount: number;
  rating: number;
  volumePricing?: {
    minQuantity: number;
    discountRate: number; // 0.1 means 10% discount
  }[];
  // Multi-vendor fields (Phase 5)
  vendorId: string; // vendors 컬렉션 ID
  vendorName?: string; // 캐시 (판매자명)
  vendorType: 'platform' | 'marketplace'; // 'platform' = MyAIPrintShop 직판
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

// 상품 생성 데이터 (id 제외)
export type CreateProductInput = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateProductInput = Partial<Omit<Product, 'id' | 'createdAt'>>;

// Firestore 컬렉션 참조
const productsCollection = collection(db, 'products');

// 문서 데이터를 Product 타입으로 변환
function docToProduct(doc: DocumentData, id: string): Product {
  const data = doc;
  return {
    id,
    name: data.name || '',
    description: data.description,
    price: data.price || 0,
    originalPrice: data.originalPrice,
    thumbnail: data.thumbnail || '',
    images: data.images || [],
    category: data.category || '',
    subcategory: data.subcategory,
    badge: data.badge,
    tags: data.tags || [],
    options: data.options,
    stock: data.stock || 0,
    isActive: data.isActive ?? true,
    reviewCount: data.reviewCount || 0,
    rating: data.rating || 0,
    volumePricing: data.volumePricing,
    // Multi-vendor fields (Phase 5)
    vendorId: data.vendorId || 'PLATFORM_DEFAULT',
    vendorName: data.vendorName || 'MyAIPrintShop',
    vendorType: data.vendorType || 'platform',
    createdAt: data.createdAt?.toDate?.() || new Date(),
    updatedAt: data.updatedAt?.toDate?.() || new Date(),
  };
}

// ============ 상품 조회 ============

// 전체 상품 목록 조회
// 복합 인덱스 없이 동작하도록 전체 조회 후 JS에서 필터/정렬
export async function getProducts(options?: {
  category?: string | string[]; // 단일 카테고리 또는 카테고리 배열
  isActive?: boolean;
  sortBy?: 'createdAt' | 'price' | 'rating' | 'reviewCount';
  sortOrder?: 'asc' | 'desc';
  limitCount?: number;
}): Promise<Product[]> {
  try {
    const snapshot = await getDocs(productsCollection);
    let products = snapshot.docs.map(d => docToProduct(d.data(), d.id));

    // 필터링
    if (options?.isActive !== undefined) {
      products = products.filter(p => p.isActive === options.isActive);
    }
    if (options?.category) {
      // 배열이면 포함 여부 확인, 문자열이면 정확히 일치
      if (Array.isArray(options.category)) {
        products = products.filter(p => options.category!.includes(p.category));
      } else {
        products = products.filter(p => p.category === options.category);
      }
    }

    // 정렬
    const sortBy = options?.sortBy || 'createdAt';
    const sortOrder = options?.sortOrder || 'desc';
    products.sort((a, b) => {
      const aVal = a[sortBy] instanceof Date ? (a[sortBy] as Date).getTime() : (a[sortBy] as number);
      const bVal = b[sortBy] instanceof Date ? (b[sortBy] as Date).getTime() : (b[sortBy] as number);
      return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
    });

    // 개수 제한
    if (options?.limitCount) {
      products = products.slice(0, options.limitCount);
    }

    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

// 단일 상품 조회
export async function getProductById(productId: string): Promise<Product | null> {
  try {
    const docRef = doc(db, 'products', productId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    return docToProduct(docSnap.data(), docSnap.id);
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

// 카테고리별 상품 조회
export async function getProductsByCategory(category: string): Promise<Product[]> {
  return getProducts({ category, isActive: true });
}

// 베스트 상품 조회
export async function getBestProducts(count: number = 6): Promise<Product[]> {
  return getProducts({ isActive: true, sortBy: 'reviewCount', sortOrder: 'desc', limitCount: count });
}

// 신상품 조회
export async function getNewProducts(count: number = 8): Promise<Product[]> {
  return getProducts({ isActive: true, sortBy: 'createdAt', sortOrder: 'desc', limitCount: count });
}

// 상품 검색
export async function searchProducts(searchQuery: string): Promise<Product[]> {
  try {
    // Firestore는 전문 검색을 지원하지 않으므로, 
    // 클라이언트 사이드에서 필터링하거나 Algolia 등을 사용해야 함
    // 여기서는 간단히 전체 상품을 가져와서 필터링
    const products = await getProducts({ isActive: true });
    const query = searchQuery.toLowerCase();
    
    return products.filter(product => 
      product.name.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query) ||
      product.tags?.some(tag => tag.toLowerCase().includes(query))
    );
  } catch (error) {
    console.error('Error searching products:', error);
    return [];
  }
}

// ============ 상품 관리 (관리자용) ============

// 상품 생성
export async function createProduct(input: CreateProductInput): Promise<string | null> {
  try {
    const docRef = await addDoc(productsCollection, {
      ...input,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating product:', error);
    return null;
  }
}

// 상품 수정
export async function updateProduct(productId: string, input: UpdateProductInput): Promise<boolean> {
  try {
    const docRef = doc(db, 'products', productId);
    await updateDoc(docRef, {
      ...input,
      updatedAt: Timestamp.now(),
    });
    return true;
  } catch (error) {
    console.error('Error updating product:', error);
    return false;
  }
}

// 상품 삭제
export async function deleteProduct(productId: string): Promise<boolean> {
  try {
    const docRef = doc(db, 'products', productId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error('Error deleting product:', error);
    return false;
  }
}

// 상품 활성화/비활성화
export async function toggleProductActive(productId: string, isActive: boolean): Promise<boolean> {
  return updateProduct(productId, { isActive });
}

// ============ 카테고리 ============

export const PRODUCT_CATEGORIES = {
  print: '인쇄',
  goods: '굿즈/팬시',
  fashion: '패션/어패럴',
  store: '우리가게',
  custom: '주문제작',
  recipe: 'AI 레시피',
} as const;

export type ProductCategory = keyof typeof PRODUCT_CATEGORIES;
