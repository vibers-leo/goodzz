#!/bin/bash

BASE_URL="http://localhost:3300"

echo "=== 🧪 MyAIPrintShop API 테스트 ===" && echo ""

# 1. 공개 API
echo "1️⃣ GET /api/vendors (공개)"
curl -s "$BASE_URL/api/vendors"
echo "" && echo ""

# 2. 비로그인 사용자 차단
echo "2️⃣ POST /api/vendors (비로그인 - 401 예상)"
curl -s -X POST "$BASE_URL/api/vendors" \
  -H "Content-Type: application/json" \
  -d '{"businessName":"테스트"}'
echo "" && echo ""

# 3. 개발 모드 토큰으로 판매자 신청
echo "3️⃣ POST /api/vendors (개발 모드 토큰 - 성공 예상)"
curl -s -X POST "$BASE_URL/api/vendors" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-user-vendor1" \
  -d '{
    "businessName": "테스트 판매자 1",
    "ownerName": "홍길동",
    "email": "vendor1@test.com",
    "phone": "010-1234-5678",
    "bankAccount": {
      "bankName": "우리은행",
      "accountNumber": "1002-123-456789",
      "accountHolder": "홍길동"
    }
  }'
echo "" && echo ""

# 4. Admin API (status 파라미터) - 비로그인
echo "4️⃣ GET /api/vendors?status=pending (비로그인 - 401 예상)"
curl -s "$BASE_URL/api/vendors?status=pending"
echo "" && echo ""

echo "✅ 테스트 완료!"
