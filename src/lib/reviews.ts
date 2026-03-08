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

// 리뷰 타입 정의
export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  orderId?: string;
  rating: number; // 1 to 5
  content: string;
  images?: string[];
  createdAt: string;
  updatedAt: string;
}

// 리뷰 생성 데이터
export type CreateReviewInput = Omit<Review, 'id' | 'createdAt' | 'updatedAt'>;

// Firestore 컬렉션 참조
const reviewsCollection = collection(db, 'reviews');

// 문서 데이터를 Review 타입으로 변환
function docToReview(doc: DocumentData, id: string): Review {
  const data = doc;
  return {
    id,
    productId: data.productId || '',
    userId: data.userId || '',
    userName: data.userName || 'Unknown',
    orderId: data.orderId,
    rating: data.rating || 5,
    content: data.content || '',
    images: data.images || [],
    createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
  };
}

// ============ 리뷰 조회 ============

// 상품별 리뷰 조회
export async function getReviewsByProduct(productId: string): Promise<Review[]> {
  try {
    const q = query(
      reviewsCollection,
      where('productId', '==', productId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => docToReview(doc.data(), doc.id));
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }
}

// 사용자별 리뷰 조회
export async function getReviewsByUser(userId: string): Promise<Review[]> {
  try {
    const q = query(
      reviewsCollection,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => docToReview(doc.data(), doc.id));
  } catch (error) {
    console.error('Error fetching reviews by user:', error);
    return [];
  }
}

// 최신 리뷰 조회 (홈페이지용 - 높은 평점 우선)
export async function getLatestReviews(count: number = 6): Promise<Review[]> {
  try {
    // 높은 평점(4-5점) 최신순 리뷰 조회
    const q = query(
      reviewsCollection,
      where('rating', '>=', 4),
      orderBy('rating', 'desc'),
      orderBy('createdAt', 'desc'),
      limit(count)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => docToReview(doc.data(), doc.id));
  } catch (error) {
    // 복합 인덱스가 없을 경우 폴백: 최신순만으로 조회
    console.warn('Falling back to simple query for latest reviews:', error);
    try {
      const q = query(
        reviewsCollection,
        orderBy('createdAt', 'desc'),
        limit(count)
      );
      const snapshot = await getDocs(q);
      const reviews = snapshot.docs.map(doc => docToReview(doc.data(), doc.id));
      // 클라이언트에서 높은 평점 우선 정렬
      return reviews.sort((a, b) => b.rating - a.rating);
    } catch (fallbackError) {
      console.error('Error fetching latest reviews:', fallbackError);
      return [];
    }
  }
}

// ============ 리뷰 관리 ============

// 리뷰 생성
export async function createReview(input: CreateReviewInput): Promise<string | null> {
  try {
    const docRef = await addDoc(reviewsCollection, {
      ...input,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    // TODO: 상품의 평점 및 리뷰 수 업데이트 로직 추가 필요

    return docRef.id;
  } catch (error) {
    console.error('Error creating review:', error);
    return null;
  }
}

// 리뷰 삭제
export async function deleteReview(reviewId: string): Promise<boolean> {
  try {
    const docRef = doc(db, 'reviews', reviewId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error('Error deleting review:', error);
    return false;
  }
}
