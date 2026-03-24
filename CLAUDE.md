# MyAIPrintShop - Claude Code 워크플로우 가이드

## 프로젝트 개요

AI로 커스텀 굿즈(명함, 스티커, 티셔츠, 에코백 등)를 디자인하고 제작/판매하는 멀티벤더 이커머스 플랫폼.
Firebase Auth + Firestore + PortOne 결제 + Gemini AI 디자인 + Fabric.js 에디터 기반.

- 도메인: myaiprintshop.co.kr
- 개발 서버: `http://localhost:3300`
- 패키지명: `@vibers/myaiprintshop`

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프레임워크 | Next.js 16 (App Router) |
| 언어 | TypeScript (strict) |
| 스타일링 | Tailwind CSS v4 (globals.css 디자인 토큰) |
| 인증 | Firebase Auth (Google 소셜 로그인) |
| DB | Firestore |
| 결제 | PortOne (@portone/browser-sdk) |
| AI 생성 | Google Gemini Pro + Imagen 3 (@google/generative-ai) |
| 에디터 | Fabric.js 6 (캔버스 기반 디자인 에디터) |
| 상태관리 | Zustand 5 (장바구니, 위시리스트, 에디터) |
| 애니메이션 | Framer Motion |
| 검색 | Fuse.js (퍼지 검색) |
| 테스트 | Vitest + React Testing Library |
| 아이콘 | Lucide React |
| 토스트 | Sonner |
| 폰트 | Geist (로컬), Pretendard (CDN), Inter + 한글 폰트 (Google Fonts) |

---

## 주요 파일 구조

```
src/
├── app/
│   ├── page.tsx              # 홈 (Hero + 추천 상품)
│   ├── layout.tsx            # 루트 레이아웃 (AuthProvider, CartSync)
│   ├── shop/                 # 상품 목록 / 상세
│   ├── create/               # AI 디자인 생성 페이지
│   ├── editor/               # Fabric.js 디자인 에디터
│   ├── cart/                 # 장바구니
│   ├── checkout/             # 주문서 + PortOne 결제
│   ├── order/                # 주문 완료
│   ├── mypage/               # 마이페이지 (주문내역, 쿠폰)
│   ├── creators/             # 크리에이터 마켓플레이스
│   ├── showcase/             # AI 디자인 갤러리/커뮤니티
│   ├── admin/                # 관리자 대시보드
│   ├── partner/              # 파트너 페이지
│   ├── developers/           # 개발자/SDK 문서
│   ├── academy/              # 아카데미
│   ├── embed/                # 임베드 뷰
│   ├── export-voucher/       # 수출바우처
│   ├── wishlist/             # 위시리스트
│   └── api/
│       ├── admin/            # 관리자 API (stats, vendors, settlements)
│       ├── auth/             # 인증 (check-admin)
│       ├── creators/         # 크리에이터 API
│       ├── cron/             # 정산 크론
│       ├── generate/         # AI 이미지 생성
│       ├── orders/           # 주문 CRUD
│       ├── payment/          # PortOne 결제 처리
│       ├── products/         # 상품 CRUD
│       ├── reviews/          # 리뷰 API
│       ├── sdk/              # SDK API
│       ├── vendors/          # 멀티벤더 API
│       └── wowpress/         # 와우프레스 연동
│
├── components/
│   ├── Navbar.tsx            # 글로벌 네비게이션
│   ├── Footer.tsx            # 푸터
│   ├── Hero.tsx              # 홈 히어로 섹션
│   ├── ProductCard.tsx       # 상품 카드
│   ├── ProductDetailClient.tsx # 상품 상세 클라이언트
│   ├── CartSync.tsx          # 장바구니 동기화
│   ├── NotificationDropdown.tsx # 실시간 알림
│   ├── admin/                # 관리자 컴포넌트 (7개)
│   ├── editor/               # 에디터 컴포넌트
│   │   ├── FabricCanvas.tsx  # Fabric.js 캔버스 래퍼
│   │   ├── EditorHeader.tsx  # 에디터 상단바
│   │   ├── CanvasToolbar.tsx # 캔버스 도구바
│   │   └── panels/           # 사이드바 패널 (AI, 텍스트, 이미지, 레이어 등)
│   └── embed/                # 임베드 컴포넌트
│
├── lib/
│   ├── firebase.ts           # Firebase 클라이언트 SDK
│   ├── firebase-admin.ts     # Firebase Admin SDK
│   ├── auth-middleware.ts    # API 인증 미들웨어
│   ├── payment.ts            # PortOne 결제 로직
│   ├── portone-settlement.ts # 정산 시스템
│   ├── settlement-automation.ts # 정산 자동화
│   ├── products.ts           # 상품 Firestore 쿼리
│   ├── orders.ts             # 주문 로직
│   ├── vendors.ts            # 멀티벤더 로직
│   ├── creators.ts           # 크리에이터 로직
│   ├── pricing.ts            # 가격/할인 계산
│   ├── cart.ts               # 장바구니 로직
│   ├── reviews.ts            # 리뷰 로직
│   ├── designs.ts            # 디자인 저장/로드
│   ├── fabric/               # Fabric.js 유틸 (canvas, export, history, snap 등)
│   ├── templates/            # 명함 등 디자인 템플릿
│   ├── wowpress/             # 와우프레스 API 연동 (주문 전달, 스펙 매핑)
│   └── query-optimizer.ts    # Firestore 쿼리 최적화 + 캐시
│
├── store/
│   ├── useStore.ts           # Zustand: 장바구니, 위시리스트
│   └── useEditorStore.ts     # Zustand: 에디터 상태
│
├── context/
│   └── AuthContext.tsx        # Firebase Auth 컨텍스트
│
├── hooks/
│   ├── useAuth.ts            # 인증 훅
│   ├── useFuzzySearch.ts     # Fuse.js 검색 훅
│   └── useSearchHistory.ts   # 검색 기록 훅
│
├── middleware.ts              # Next.js 미들웨어 (인증 보호)
├── sdk/                       # 외부 임베드용 SDK 빌드
└── __tests__/                 # Vitest 테스트
```

---

## Firestore 데이터 구조

```
products/{productId}       # 상품 (카테고리, 가격, 옵션, printMethod)
orders/{orderId}           # 주문 (배송지, 결제정보, 상태)
users/{userId}             # 사용자 프로필
reviews/{reviewId}         # 리뷰 (별점, 사진, 상품 연결)
creators/{creatorId}       # 크리에이터 프로필
vendors/{vendorId}         # 벤더 (멀티벤더 시스템)
designs/{designId}         # AI 생성 디자인
showcase/{showcaseId}      # 쇼케이스 갤러리
settlements/{settlementId} # 정산 내역
notifications/{notifId}    # 실시간 알림
```

---

## 핵심 비즈니스 로직

### 결제 플로우
```
/checkout → PortOne SDK 호출 → /api/payment/verify → Firestore 주문 생성 → /order/complete
```

### AI 디자인 플로우
```
/create → Gemini Pro 프롬프트 → Imagen 3 이미지 생성 → /editor/[id] (Fabric.js 편집) → 상품에 적용
```

### 멀티벤더 정산
```
주문 완료 → vendors별 매출 집계 → /api/cron/settlements (자동) → 정산 내역 생성
```

### 와우프레스 연동
```
주문 확인 → lib/wowpress/spec-mapper.ts (인쇄 스펙 변환) → order-forwarder.ts (제작 의뢰)
```

---

## 주요 명령어

```bash
# 개발
bun run dev --filter=@vibers/myaiprintshop    # 개발 서버 (localhost:3300)
bun run build --filter=@vibers/myaiprintshop   # 프로덕션 빌드
bun run test --filter=@vibers/myaiprintshop    # Vitest 테스트
bun run test:ui --filter=@vibers/myaiprintshop # Vitest UI

# 데이터 시딩
bun run seed --filter=@vibers/myaiprintshop          # 상품 시드
bun run seed:reviews --filter=@vibers/myaiprintshop   # 리뷰 시드
bun run seed:mock100 --filter=@vibers/myaiprintshop   # 100개 목업 시드

# SDK
bun run build:sdk --filter=@vibers/myaiprintshop  # 임베드 SDK 빌드

# 벤더 마이그레이션
bun run migrate:vendors --filter=@vibers/myaiprintshop
```

---

## 환경변수

`.env.local` 필수 항목:
- `NEXT_PUBLIC_FIREBASE_*` — Firebase 클라이언트 설정 (6개)
- `FIREBASE_ADMIN_*` — Firebase Admin 서비스 계정
- `NEXT_PUBLIC_PORTONE_STORE_ID` / `CHANNEL_KEY` — PortOne 결제
- `GOOGLE_GENERATIVE_AI_API_KEY` — Gemini AI
- `NEXT_PUBLIC_SITE_URL` — 사이트 URL

---

## 관련 기술 문서

> 아래 문서들은 상세 구현 가이드로, 관련 작업 시 반드시 참조

- [DEPLOYMENT.md](./DEPLOYMENT.md) — 배포 가이드
- [LEGAL_COMPLIANCE.md](./LEGAL_COMPLIANCE.md) — 법적 준수 사항 (전자상거래법, 개인정보)
- [MIGRATION_PLAN.md](./MIGRATION_PLAN.md) — 마이그레이션 계획
- [PLAN_AND_STATUS.md](./PLAN_AND_STATUS.md) — 개발 로드맵 & 완료 기능 상세
- [docs/E2E-TESTING-GUIDE.md](./docs/E2E-TESTING-GUIDE.md) — E2E 테스트 가이드
- [docs/MULTI-VENDOR-SYSTEM.md](./docs/MULTI-VENDOR-SYSTEM.md) — 멀티벤더 시스템 아키텍처
- [docs/VENDOR-DASHBOARD-FRONTEND.md](./docs/VENDOR-DASHBOARD-FRONTEND.md) — 벤더 대시보드 프론트엔드
- [docs/VENDOR-DASHBOARD-IMPLEMENTATION.md](./docs/VENDOR-DASHBOARD-IMPLEMENTATION.md) — 벤더 대시보드 구현
- [docs/와우프레스_협업.md](./docs/와우프레스_협업.md) — 와우프레스 인쇄 업체 연동

---

## 개발 규칙

### 코드 스타일
- 한글 우선: 모든 UI 텍스트와 주석은 한국어
- TypeScript strict mode 필수
- Tailwind CSS v4 유틸리티 클래스 사용 (globals.css 디자인 토큰 참조)
- 디자인 시스템: [DESIGN_GUIDE.md](./DESIGN_GUIDE.md) 참조

### Git 규칙
- 커밋 메시지: 한글 (feat:, fix:, refactor:, chore: 접두사), [TCC] 태그
- `git add .` 사용 금지 — 항상 특정 파일 지정
- 커밋 전 `git pull origin main` 실행
- 기본 브랜치: main

### 배포
- 현재: Vercel
- 최종: NCP Docker (server.vibers.co.kr)

---

## 상위 브랜드
- 회사: 계발자들 (Vibers) — vibers.co.kr
- 모노레포: `nextjs/` (Turborepo, 13개 앱)
