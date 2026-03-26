/**
 * 카테고리 통합 관리
 * URL slug와 실제 DB 카테고리명 매핑 + 하위 카테고리 지원
 */

export interface SubCategory {
  slug: string; // 하위 카테고리 URL slug
  label: string; // UI에 표시되는 한글 레이블
  dbValue: string; // Firestore에 저장되는 실제 카테고리명
}

export interface Category {
  slug: string; // URL에 사용되는 영문 slug
  label: string; // UI에 표시되는 한글 레이블
  dbValues: string[]; // Firestore에 저장된 실제 카테고리명 (복수 가능)
  subcategories?: SubCategory[]; // 하위 카테고리 (선택사항)
}

export const CATEGORIES: Category[] = [
  {
    slug: 'business-card',
    label: '명함',
    dbValues: ['명함']
  },
  {
    slug: 'sticker',
    label: '스티커',
    dbValues: ['스티커']
  },
  {
    slug: 'flyer',
    label: '전단지/리플렛',
    dbValues: ['전단지', '리플렛', '팜플렛']
  },
  {
    slug: 'eco-bag',
    label: '에코백',
    dbValues: ['에코백']
  },
  {
    slug: 'shopping-bag',
    label: '쇼핑백',
    dbValues: ['쇼핑백']
  },
  {
    slug: 'packaging',
    label: '포장박스',
    dbValues: ['포장박스', '패키지']
  }
];

// Slug로 카테고리 찾기
export function getCategoryBySlug(slug: string): Category | undefined {
  return CATEGORIES.find(cat => cat.slug === slug);
}

// Slug로 DB 카테고리명 배열 가져오기
export function getDbCategories(slug: string): string[] {
  const category = getCategoryBySlug(slug);
  return category ? category.dbValues : [];
}

// 모든 카테고리의 slug와 label 가져오기 (네비게이션용)
export function getAllCategories(): Array<{ slug: string; label: string; subcategories?: SubCategory[] }> {
  return CATEGORIES.map(cat => ({
    slug: cat.slug,
    label: cat.label,
    subcategories: cat.subcategories
  }));
}

// 서브카테고리 slug로 DB 값 찾기
export function getSubCategoryDbValue(categorySlug: string, subSlug: string): string | undefined {
  const category = getCategoryBySlug(categorySlug);
  if (!category || !category.subcategories) return undefined;

  const sub = category.subcategories.find(s => s.slug === subSlug);
  return sub?.dbValue;
}

// 모든 서브카테고리 포함한 카테고리 트리 가져오기
export function getCategoryTree(): Category[] {
  return CATEGORIES;
}
