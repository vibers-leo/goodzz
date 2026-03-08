import { Product, PricingOptionGroup } from './products';

export const PRINT_METHODS = {
  dtg: { name: 'DTG (디지털 직접 인쇄)', description: '고해상도 풀컬러, 소량 적합', minQty: 1, extraCost: 0 },
  screen: { name: '스크린 인쇄', description: '대량 생산에 적합, 선명한 색감', minQty: 30, extraCost: -500 },
  sublimation: { name: '승화전사', description: '폴리에스터 소재 전용, 올오버 프린트', minQty: 1, extraCost: 2000 },
  embroidery: { name: '자수', description: '고급스러운 질감, 로고에 적합', minQty: 10, extraCost: 3000 },
  uv: { name: 'UV 인쇄', description: '하드 소재(폰케이스, 아크릴 등)', minQty: 1, extraCost: 1000 },
  laser: { name: '레이저 각인', description: '금속/나무 소재, 미니멀 디자인', minQty: 1, extraCost: 1500 },
};

export interface SelectedOptions {
  [groupId: string]: string; // valueId
}

/**
 * 선택된 옵션들에 따라 최종 가격을 계산합니다.
 * 공식: (기본가 + 추가금액합산) * 가중치합산(또는 곱)
 */
export function calculateProductPrice(
  product: Product,
  selectedOptions: SelectedOptions,
  quantity: number = 1
): number {
  const { price: basePrice, options, volumePricing } = product;
  const groups = options?.groups;

  if (!groups || groups.length === 0) {
    // 상품 기본 옵션이 없는 경우에도 수량 할인은 적용 가능
    const discountedBase = applyVolumeDiscount(basePrice, quantity, volumePricing);
    return Math.round(discountedBase);
  }

  let totalPrice = basePrice;
  let multiplier = 1;

  groups.forEach((group) => {
    const selectedValueId = selectedOptions[group.id];
    if (!selectedValueId) return;

    const value = group.values.find((v) => v.id === selectedValueId);
    if (!value) return;

    if (value.priceAdded) {
      totalPrice += value.priceAdded;
    }

    if (value.priceMultiplier) {
      multiplier *= value.priceMultiplier;
    }
  });

  const finalUnitPrice = totalPrice * multiplier;
  
  // 수량 할인 적용
  const discountedPrice = applyVolumeDiscount(finalUnitPrice, quantity, volumePricing);

  return Math.round(discountedPrice);
}

function applyVolumeDiscount(unitPrice: number, quantity: number, tiers?: Product['volumePricing']): number {
  if (!tiers || tiers.length === 0) return unitPrice;

  // 가장 많이 일치하는 수량 구간 찾기
  const sortedTiers = [...tiers].sort((a, b) => b.minQuantity - a.minQuantity);
  const applicableTier = sortedTiers.find(tier => quantity >= tier.minQuantity);

  if (applicableTier) {
    return unitPrice * (1 - applicableTier.discountRate);
  }

  return unitPrice;
}

/**
 * 수량 할인 가격을 계산합니다.
 * volumePricing의 discount는 퍼센트 값 (예: 10 = 10% 할인)
 */
export function calculateVolumePrice(basePrice: number, quantity: number, volumePricing?: { minQty: number; discount: number }[]): number {
  if (!volumePricing || volumePricing.length === 0) return basePrice;
  // Sort by minQty descending to find the highest applicable tier
  const sorted = [...volumePricing].sort((a, b) => b.minQty - a.minQty);
  const tier = sorted.find(t => quantity >= t.minQty);
  if (!tier) return basePrice;
  return Math.round(basePrice * (1 - tier.discount / 100));
}
