import { QueryConstraint, query, collection, getDocs, limit, where, documentId, doc } from 'firebase/firestore';
import { db } from './firebase';

/**
 * 인메모리 캐시 (간단한 구현)
 * 프로덕션에서는 Redis 등 사용 권장
 */
class SimpleCache {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private ttl: number = 5 * 60 * 1000; // 5분 기본 TTL

  set(key: string, data: any, customTtl?: number) {
    this.cache.set(key, {
      data,
      timestamp: Date.now() + (customTtl || this.ttl),
    });
  }

  get(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    // TTL 체크
    if (Date.now() > cached.timestamp) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  invalidate(key: string) {
    this.cache.delete(key);
  }

  invalidatePattern(pattern: string) {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  clear() {
    this.cache.clear();
  }
}

export const cache = new SimpleCache();

/**
 * 캐시를 사용하는 Firestore 쿼리 래퍼
 */
export async function cachedQuery<T>(
  cacheKey: string,
  queryFn: () => Promise<T>,
  ttl?: number
): Promise<T> {
  // 캐시 확인
  const cached = cache.get(cacheKey);
  if (cached !== null) {
    console.log(`✅ Cache HIT: ${cacheKey}`);
    return cached;
  }

  console.log(`⚠️ Cache MISS: ${cacheKey}`);

  // 쿼리 실행
  const result = await queryFn();

  // 캐시 저장
  cache.set(cacheKey, result, ttl);

  return result;
}

/**
 * Firestore 쿼리 최적화 유틸리티
 */
export const QueryOptimizer = {
  /**
   * 페이지네이션을 위한 커서 기반 쿼리
   */
  async paginatedQuery<T>(
    collectionName: string,
    constraints: QueryConstraint[],
    pageSize: number = 20
  ): Promise<{
    data: T[];
    hasMore: boolean;
    lastDoc: any;
  }> {
    const q = query(
      collection(db, collectionName),
      ...constraints,
      limit(pageSize + 1) // +1로 다음 페이지 존재 여부 확인
    );

    const snapshot = await getDocs(q);
    const docs = snapshot.docs;

    const hasMore = docs.length > pageSize;
    const data = docs.slice(0, pageSize).map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as T[];

    const lastDoc = hasMore ? docs[pageSize - 1] : null;

    return { data, hasMore, lastDoc };
  },

  /**
   * 배치 쿼리 (여러 ID를 한 번에 조회)
   */
  async batchGetByIds<T>(
    collectionName: string,
    ids: string[]
  ): Promise<Map<string, T>> {
    const result = new Map<string, T>();

    if (ids.length === 0) {
      return result;
    }

    // Firestore는 한 번에 10개씩만 in 연산자 지원
    const chunks = chunkArray(ids, 10);

    for (const chunk of chunks) {
      const q = query(
        collection(db, collectionName),
        where(documentId(), 'in', chunk)
      );

      const snapshot = await getDocs(q);

      snapshot.forEach((docSnapshot) => {
        result.set(docSnapshot.id, {
          id: docSnapshot.id,
          ...docSnapshot.data(),
        } as T);
      });
    }

    console.log(`✅ Batch query: Fetched ${result.size}/${ids.length} documents from ${collectionName}`);

    return result;
  },

  /**
   * 통계 쿼리 최적화 (캐싱)
   */
  async getCachedStats(
    statsKey: string,
    statsFn: () => Promise<any>,
    ttl: number = 10 * 60 * 1000 // 10분
  ): Promise<any> {
    return cachedQuery(`stats:${statsKey}`, statsFn, ttl);
  },
};

/**
 * 배열을 청크로 분할
 */
function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Firestore 쿼리 성능 모니터링
 */
export function measureQueryPerformance<T>(
  queryName: string,
  queryFn: () => Promise<T>
): Promise<T> {
  return new Promise(async (resolve, reject) => {
    const startTime = performance.now();

    try {
      const result = await queryFn();
      const endTime = performance.now();
      const duration = endTime - startTime;

      // 성능 로깅
      if (duration > 1000) {
        console.warn(
          `⚠️ Slow query detected: ${queryName} took ${duration.toFixed(2)}ms`
        );
      } else {
        console.log(`✅ Query ${queryName} took ${duration.toFixed(2)}ms`);
      }

      resolve(result);
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      console.error(
        `❌ Query ${queryName} failed after ${duration.toFixed(2)}ms:`,
        error
      );
      reject(error);
    }
  });
}

/**
 * 캐시 무효화 헬퍼
 */
export const CacheInvalidator = {
  // 상품 관련 캐시 무효화
  invalidateProducts: () => {
    cache.invalidatePattern('^products:');
  },

  // 주문 관련 캐시 무효화
  invalidateOrders: () => {
    cache.invalidatePattern('^orders:');
  },

  // 판매자 관련 캐시 무효화
  invalidateVendors: () => {
    cache.invalidatePattern('^vendors:');
  },

  // 통계 캐시 무효화
  invalidateStats: () => {
    cache.invalidatePattern('^stats:');
  },

  // 모든 캐시 무효화
  invalidateAll: () => {
    cache.clear();
  },
};
