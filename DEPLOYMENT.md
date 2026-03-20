# 🚀 Vercel 배포 가이드

MyAIPrintShop을 Vercel에 배포하는 방법입니다.

## 📋 배포 전 체크리스트

### 1. 환경 변수 준비

Vercel 대시보드에서 다음 환경 변수를 설정해야 합니다:

#### 필수 환경 변수

```bash
# Firebase Client SDK
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=myaiprintshop.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=myaiprintshop
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=myaiprintshop.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Google AI (Gemini/Imagen 3)
GOOGLE_API_KEY=your-google-ai-api-key

# Site URL (프로덕션)
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
```

#### 선택 환경 변수 (결제 기능 활성화 시)

```bash
# PortOne 결제 (V2)
NEXT_PUBLIC_PORTONE_STORE_ID=your-store-id
NEXT_PUBLIC_PORTONE_CHANNEL_KEY=your-channel-key
PORTONE_API_SECRET=your-api-secret
```

#### 선택 환경 변수 (Firebase Admin SDK 사용 시)

```bash
# Firebase Admin SDK (서버 사이드)
FIREBASE_ADMIN_CLIENT_EMAIL=your-service-account@myaiprintshop.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
```

---

## 🌐 Vercel 배포 방법

### 방법 1: Vercel CLI로 배포 (추천)

```bash
# 1. Vercel CLI 설치 (처음 한 번만)
npm install -g vercel

# 2. Vercel 로그인
vercel login

# 3. 프로젝트 링크 (처음 한 번만)
vercel link

# 4. 환경 변수 설정 (Vercel 대시보드에서)
# https://vercel.com/your-team/your-project/settings/environment-variables

# 5. 배포
vercel --prod
```

### 방법 2: GitHub 연동으로 자동 배포

1. GitHub에 코드 푸시
2. Vercel 대시보드에서 "Import Project"
3. GitHub 저장소 선택
4. 환경 변수 설정
5. Deploy 클릭

---

## ⚙️ 빌드 설정

`vercel.json` 파일이 이미 설정되어 있습니다:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "installCommand": "npm install"
}
```

---

## 🔥 Firebase 설정

### 1. Firebase Hosting (선택사항)

Vercel 대신 Firebase Hosting을 사용하려면:

```bash
# Firebase CLI 설치
npm install -g firebase-tools

# Firebase 로그인
firebase login

# Firebase 초기화
firebase init hosting

# 빌드 후 배포
npm run build
firebase deploy --only hosting
```

### 2. Firestore 인덱스 및 보안 규칙 배포

프로젝트에 `firestore.indexes.json` 파일이 생성되어 있습니다. Firebase CLI로 배포하세요:

```bash
# Firebase 로그인
firebase login

# Firestore 인덱스 배포
firebase deploy --only firestore:indexes --project myaiprintshop

# Firestore 보안 규칙 배포 (선택)
firebase deploy --only firestore:rules --project myaiprintshop
```

**중요**: 빌드 중 발견된 Firestore 인덱스가 필요합니다:
- `reviews` 컬렉션: `rating` (DESC) + `createdAt` (DESC)
- `products` 컬렉션: `category` (ASC) + `createdAt` (DESC)
- `orders` 컬렉션: `userId` (ASC) + `createdAt` (DESC)
- `orders` 컬렉션: `vendorId` (ASC) + `createdAt` (DESC)

위 명령으로 인덱스를 자동 생성하거나, Firebase Console에서 수동으로 생성할 수 있습니다.

---

## 🎯 도메인 설정

### Vercel 커스텀 도메인

1. Vercel 대시보드 → Settings → Domains
2. 도메인 추가 (예: myaiprintshop.co.kr)
3. DNS 설정에 A 레코드 추가:
   ```
   A    @    76.76.21.21
   CNAME www  cname.vercel-dns.com
   ```

---

## 🐛 문제 해결

### 빌드 오류 시

```bash
# 로컬에서 빌드 테스트
npm run build

# 캐시 클리어 후 재시도
rm -rf .next
npm run build
```

### 환경 변수 오류 시

- Vercel 대시보드에서 환경 변수를 다시 확인
- `NEXT_PUBLIC_` 접두사 확인
- 따옴표 없이 값만 입력

### Firebase 연결 오류 시

- Firebase Console에서 웹 앱 설정 확인
- API 키가 정확한지 확인
- Firestore 보안 규칙 확인

---

## 📊 성능 최적화

### 1. 이미지 최적화

Next.js Image 컴포넌트 사용 (이미 적용됨)

### 2. 폰트 최적화

- Inter 폰트: Google Fonts에서 자동 최적화
- 한글 폰트: subset으로 최적화됨

### 3. 번들 크기 최적화

```bash
# 번들 분석
npm run build
npx @next/bundle-analyzer
```

---

## ✅ 배포 후 체크리스트

- [ ] 홈페이지 로딩 확인
- [ ] Firebase 로그인 테스트
- [ ] AI 이미지 생성 테스트
- [ ] 명함 에디터 작동 확인
- [ ] 상품 목록 로딩 확인
- [ ] 장바구니 기능 테스트
- [ ] 모바일 반응형 확인
- [ ] 성능 측정 (Lighthouse)

---

## 🔗 유용한 링크

- [Vercel 대시보드](https://vercel.com/dashboard)
- [Firebase Console](https://console.firebase.google.com/)
- [Next.js 배포 문서](https://nextjs.org/docs/deployment)
- [Vercel 환경 변수 가이드](https://vercel.com/docs/concepts/projects/environment-variables)

---

**배포 완료 후 프로덕션 URL을 `.env.local`의 `NEXT_PUBLIC_SITE_URL`에 업데이트하세요!**
