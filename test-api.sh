#!/bin/bash

BASE_URL="http://localhost:3300"

echo "🧪 API 테스트 시작..."
echo ""

# 1. 공개 API 테스트 (인증 불필요)
echo "1️⃣ GET /api/vendors (공개 - approved만)"
curl -s "$BASE_URL/api/vendors" | jq -C '.' || echo "서버가 아직 준비되지 않았습니다"
echo ""
echo ""

# 2. 권한 테스트 - 비로그인 사용자
echo "2️⃣ POST /api/vendors (비로그인 - 실패 예상)"
curl -s -X POST "$BASE_URL/api/vendors" \
  -H "Content-Type: application/json" \
  -d '{
    "businessName": "테스트 판매자",
    "ownerName": "홍길동",
    "email": "test@test.com",
    "phone": "010-1234-5678",
    "bankAccount": {
      "bankName": "우리은행",
      "accountNumber": "1002-123-456789",
      "accountHolder": "홍길동"
    }
  }' | jq -C '.'
echo ""
echo ""

# 3. 개발 모드 토큰으로 테스트
echo "3️⃣ POST /api/vendors (개발 모드 토큰 - 성공 예상)"
curl -s -X POST "$BASE_URL/api/vendors" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-user-123" \
  -d '{
    "businessName": "테스트 판매자 1",
    "ownerName": "홍길동",
    "email": "test@test.com",
    "phone": "010-1234-5678",
    "bankAccount": {
      "bankName": "우리은행",
      "accountNumber": "1002-123-456789",
      "accountHolder": "홍길동"
    }
  }' | jq -C '.'
echo ""
echo ""

# 4. Admin API 테스트 (status 파라미터)
echo "4️⃣ GET /api/vendors?status=pending (비로그인 - 실패 예상)"
curl -s "$BASE_URL/api/vendors?status=pending" | jq -C '.'
echo ""
echo ""

echo "✅ 테스트 완료!"
