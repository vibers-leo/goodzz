/**
 * 배송비 정책 엔진
 * 벤더별/상품별/조건별 배송비 계산
 */

export interface ShippingPolicy {
  id?: string;
  vendorId: string;
  type: 'free' | 'fixed' | 'conditional' | 'weight' | 'quantity';
  baseCost: number;                     // 기본 배송비
  freeThreshold?: number;              // 무료배송 기준 금액
  extraCosts?: ShippingExtraCost[];    // 추가 배송비 (도서산간 등)
  weightRates?: WeightRate[];          // 무게별 요금
  quantityRates?: QuantityRate[];      // 수량별 요금
}

export interface ShippingExtraCost {
  region: 'jeju' | 'island' | 'mountain';
  label: string;
  cost: number;
}

export interface WeightRate {
  maxWeight: number;   // kg
  cost: number;
}

export interface QuantityRate {
  maxQuantity: number;
  cost: number;
}

// 도서산간 지역 우편번호 대역
const JEJU_POSTCODES = ['63'];
const ISLAND_POSTCODES = ['23', '25', '32', '33', '40', '52', '53', '54', '55', '56', '57', '58', '59'];

function getRegionType(postalCode: string): 'jeju' | 'island' | 'general' {
  const prefix2 = postalCode.substring(0, 2);
  if (JEJU_POSTCODES.includes(prefix2)) return 'jeju';
  // 도서산간은 더 세밀한 판별 필요하지만 기본 대역으로 처리
  return 'general';
}

// 기본 배송비 정책 (벤더가 별도 설정하지 않은 경우)
export const DEFAULT_SHIPPING_POLICY: ShippingPolicy = {
  vendorId: 'default',
  type: 'conditional',
  baseCost: 3000,
  freeThreshold: 50000,
  extraCosts: [
    { region: 'jeju', label: '제주도', cost: 3000 },
    { region: 'island', label: '도서산간', cost: 5000 },
  ],
};

/**
 * 배송비 계산
 */
export function calculateShipping(
  policy: ShippingPolicy,
  orderAmount: number,
  postalCode: string,
  totalWeight?: number,
  totalQuantity?: number,
): number {
  let cost = 0;

  switch (policy.type) {
    case 'free':
      cost = 0;
      break;

    case 'fixed':
      cost = policy.baseCost;
      break;

    case 'conditional':
      cost = (policy.freeThreshold && orderAmount >= policy.freeThreshold) ? 0 : policy.baseCost;
      break;

    case 'weight':
      if (policy.weightRates && totalWeight) {
        const rate = policy.weightRates.find(r => totalWeight <= r.maxWeight);
        cost = rate ? rate.cost : policy.baseCost;
      } else {
        cost = policy.baseCost;
      }
      break;

    case 'quantity':
      if (policy.quantityRates && totalQuantity) {
        const rate = policy.quantityRates.find(r => totalQuantity <= r.maxQuantity);
        cost = rate ? rate.cost : policy.baseCost;
      } else {
        cost = policy.baseCost;
      }
      break;
  }

  // 도서산간 추가 배송비
  if (policy.extraCosts && postalCode) {
    const region = getRegionType(postalCode);
    if (region !== 'general') {
      const extra = policy.extraCosts.find(e => e.region === region);
      if (extra) cost += extra.cost;
    }
  }

  return cost;
}

/**
 * 멀티벤더 주문의 총 배송비 계산
 * 벤더별로 각각 배송비를 계산해서 합산
 */
export function calculateMultiVendorShipping(
  vendorPolicies: Map<string, ShippingPolicy>,
  vendorAmounts: Map<string, number>,
  postalCode: string,
): { total: number; breakdown: { vendorId: string; cost: number }[] } {
  const breakdown: { vendorId: string; cost: number }[] = [];
  let total = 0;

  for (const [vendorId, amount] of vendorAmounts.entries()) {
    const policy = vendorPolicies.get(vendorId) || DEFAULT_SHIPPING_POLICY;
    const cost = calculateShipping(policy, amount, postalCode);
    breakdown.push({ vendorId, cost });
    total += cost;
  }

  return { total, breakdown };
}
