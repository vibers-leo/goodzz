/**
 * 입력 유효성 검증 유틸리티
 */

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * 이메일 형식 검증
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 휴대폰 번호 형식 검증 (한국)
 */
export function validatePhone(phone: string): boolean {
  const phoneRegex = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * 사업자등록번호 형식 검증 (한국)
 */
export function validateBusinessNumber(number: string): boolean {
  const cleanNumber = number.replace(/[-\s]/g, '');
  if (cleanNumber.length !== 10) return false;

  // 체크섬 검증
  const checkDigits = [1, 3, 7, 1, 3, 7, 1, 3, 5];
  let sum = 0;

  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanNumber[i]) * checkDigits[i];
  }

  sum += Math.floor((parseInt(cleanNumber[8]) * 5) / 10);
  const checkDigit = (10 - (sum % 10)) % 10;

  return checkDigit === parseInt(cleanNumber[9]);
}

/**
 * 계좌번호 형식 검증 (간단한 검증)
 */
export function validateAccountNumber(accountNumber: string): boolean {
  const cleanNumber = accountNumber.replace(/[-\s]/g, '');
  return /^\d{10,14}$/.test(cleanNumber);
}

/**
 * 판매자 신청 정보 검증
 */
export function validateVendorApplication(data: {
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  bankAccount: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
  businessNumber?: string;
}): ValidationResult {
  const errors: string[] = [];

  // 필수 필드 검증
  if (!data.businessName || data.businessName.trim().length === 0) {
    errors.push('상호명은 필수입니다.');
  }

  if (!data.ownerName || data.ownerName.trim().length === 0) {
    errors.push('대표자명은 필수입니다.');
  }

  if (!data.email || !validateEmail(data.email)) {
    errors.push('올바른 이메일 형식이 아닙니다.');
  }

  if (!data.phone || !validatePhone(data.phone)) {
    errors.push('올바른 휴대폰 번호 형식이 아닙니다. (예: 010-1234-5678)');
  }

  if (!data.bankAccount.bankName) {
    errors.push('은행명은 필수입니다.');
  }

  if (!data.bankAccount.accountNumber || !validateAccountNumber(data.bankAccount.accountNumber)) {
    errors.push('올바른 계좌번호 형식이 아닙니다.');
  }

  if (!data.bankAccount.accountHolder) {
    errors.push('예금주명은 필수입니다.');
  }

  // 선택 필드 검증
  if (data.businessNumber && !validateBusinessNumber(data.businessNumber)) {
    errors.push('올바른 사업자등록번호 형식이 아닙니다.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * 주문 정보 검증
 */
export function validateOrder(data: {
  items: any[];
  totalAmount: number;
  shippingFee: number;
  shippingInfo: {
    name: string;
    phone: string;
    address: string;
    email?: string;
  };
}): ValidationResult {
  const errors: string[] = [];

  // 상품 검증
  if (!data.items || data.items.length === 0) {
    errors.push('주문 상품이 없습니다.');
  } else {
    data.items.forEach((item, index) => {
      if (!item.productId) {
        errors.push(`상품 ${index + 1}: 상품 ID가 없습니다.`);
      }
      if (!item.quantity || item.quantity <= 0) {
        errors.push(`상품 ${index + 1}: 수량은 1개 이상이어야 합니다.`);
      }
      if (!item.price || item.price < 0) {
        errors.push(`상품 ${index + 1}: 올바른 가격이 아닙니다.`);
      }
    });
  }

  // 금액 검증
  if (!data.totalAmount || data.totalAmount < 0) {
    errors.push('올바른 총 금액이 아닙니다.');
  }

  if (data.shippingFee < 0) {
    errors.push('올바른 배송비가 아닙니다.');
  }

  // 배송 정보 검증
  if (!data.shippingInfo.name || data.shippingInfo.name.trim().length === 0) {
    errors.push('수령인 이름은 필수입니다.');
  }

  if (!data.shippingInfo.phone || !validatePhone(data.shippingInfo.phone)) {
    errors.push('올바른 연락처 형식이 아닙니다.');
  }

  if (!data.shippingInfo.address || data.shippingInfo.address.trim().length === 0) {
    errors.push('배송 주소는 필수입니다.');
  }

  if (data.shippingInfo.email && !validateEmail(data.shippingInfo.email)) {
    errors.push('올바른 이메일 형식이 아닙니다.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * 상품 정보 검증
 */
export function validateProduct(data: {
  name: string;
  price: number;
  category: string;
  stock?: number;
  vendorId: string;
}): ValidationResult {
  const errors: string[] = [];

  if (!data.name || data.name.trim().length === 0) {
    errors.push('상품명은 필수입니다.');
  } else if (data.name.length > 100) {
    errors.push('상품명은 100자 이하여야 합니다.');
  }

  if (!data.price || data.price <= 0) {
    errors.push('가격은 0원보다 커야 합니다.');
  }

  if (!data.category || data.category.trim().length === 0) {
    errors.push('카테고리는 필수입니다.');
  }

  if (data.stock !== undefined && data.stock < 0) {
    errors.push('재고는 0개 이상이어야 합니다.');
  }

  if (!data.vendorId || data.vendorId.trim().length === 0) {
    errors.push('판매자 ID는 필수입니다.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * 수수료율 검증
 */
export function validateCommissionRate(rate: number): ValidationResult {
  const errors: string[] = [];

  if (rate < 0 || rate > 1) {
    errors.push('수수료율은 0%에서 100% 사이여야 합니다.');
  }

  if (rate < 0.05) {
    errors.push('수수료율은 최소 5% 이상이어야 합니다.');
  }

  if (rate > 0.3) {
    errors.push('수수료율은 최대 30% 이하여야 합니다.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * 정산 금액 검증
 */
export function validateSettlement(data: {
  orderAmount: number;
  commission: number;
  vendorAmount: number;
}): ValidationResult {
  const errors: string[] = [];

  if (data.orderAmount <= 0) {
    errors.push('주문 금액은 0원보다 커야 합니다.');
  }

  if (data.commission < 0) {
    errors.push('수수료는 0원 이상이어야 합니다.');
  }

  if (data.vendorAmount < 0) {
    errors.push('정산 금액은 0원 이상이어야 합니다.');
  }

  // 금액 일치 검증
  const expectedVendorAmount = data.orderAmount - data.commission;
  if (Math.abs(data.vendorAmount - expectedVendorAmount) > 0.01) {
    errors.push(
      `정산 금액이 일치하지 않습니다. (예상: ${expectedVendorAmount}원, 실제: ${data.vendorAmount}원)`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * 문자열 길이 검증
 */
export function validateLength(
  value: string,
  min: number,
  max: number,
  fieldName: string
): ValidationResult {
  const errors: string[] = [];

  if (value.length < min) {
    errors.push(`${fieldName}은(는) 최소 ${min}자 이상이어야 합니다.`);
  }

  if (value.length > max) {
    errors.push(`${fieldName}은(는) 최대 ${max}자 이하여야 합니다.`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * 숫자 범위 검증
 */
export function validateRange(
  value: number,
  min: number,
  max: number,
  fieldName: string
): ValidationResult {
  const errors: string[] = [];

  if (value < min) {
    errors.push(`${fieldName}은(는) ${min} 이상이어야 합니다.`);
  }

  if (value > max) {
    errors.push(`${fieldName}은(는) ${max} 이하여야 합니다.`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
