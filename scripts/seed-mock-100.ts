import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, writeBatch, doc } from 'firebase/firestore';

// Firebase Client 초기화
const firebaseConfig = {
  apiKey: "AIzaSyBniRDTvu-VyRsrRjZ7tABCJPPMcS0w9yk",
  authDomain: "myaiprintshop.firebaseapp.com",
  projectId: "myaiprintshop",
  storageBucket: "myaiprintshop.firebasestorage.app",
  messagingSenderId: "436157113796",
  appId: "1:436157113796:web:0f1c03b91632a5e0aff091"
};

if (!getApps().length) {
  initializeApp(firebaseConfig);
}

const db = getFirestore();

// Unsplash 이미지 풀 (카테고리별 다양한 이미지)
const imagePool = {
  print: {
    namecard: [
      'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800',
      'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800',
      'https://images.unsplash.com/photo-1620287341260-ab5d5b730b9f?w=800',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'
    ],
    sticker: [
      'https://images.unsplash.com/photo-1611224885990-ab7363d1f2f9?w=800',
      'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800',
      'https://images.unsplash.com/photo-1626544827763-d516dce335e2?w=800',
      'https://images.unsplash.com/photo-1618172193622-ae2d025f4032?w=800'
    ],
    poster: [
      'https://images.unsplash.com/photo-1586339277861-b0b167d2f48a?w=800',
      'https://images.unsplash.com/photo-1605289355680-75fb41239154?w=800',
      'https://images.unsplash.com/photo-1586281380117-5a60ae2050cc?w=800',
      'https://images.unsplash.com/photo-1578301978018-3005759f48f7?w=800'
    ],
    banner: [
      'https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?w=800',
      'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=800',
      'https://images.unsplash.com/photo-1563089145-599997674d42?w=800'
    ]
  },
  goods: {
    frame: [
      'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=800',
      'https://images.unsplash.com/photo-1582037928769-181f2644ecb7?w=800',
      'https://images.unsplash.com/photo-1551732998-9b4ac81e1036?w=800',
      'https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=800'
    ],
    stationery: [
      'https://images.unsplash.com/photo-1564982170-c594d3b5f0b1?w=800',
      'https://images.unsplash.com/photo-1577705998148-6da4f3963bc8?w=800',
      'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=800',
      'https://images.unsplash.com/photo-1568209865332-a15790aed756?w=800'
    ],
    fancy: [
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800',
      'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800',
      'https://images.unsplash.com/photo-1573769842084-d0b8b78e7f88?w=800',
      'https://images.unsplash.com/photo-1563203369-26f2e4a5ccf7?w=800'
    ]
  },
  fashion: {
    tshirt: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800',
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800',
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800'
    ],
    hoodie: [
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800',
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800',
      'https://images.unsplash.com/photo-1620799139834-6b8f844fbe61?w=800'
    ],
    bag: [
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800',
      'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800',
      'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800'
    ]
  },
  store: [
    'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=800',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
    'https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=800'
  ]
};

// 100개 상품 데이터
const products = [
  // ========== 인쇄 카테고리 (40개) ==========
  // 명함 (8개)
  { name: '프리미엄 코팅 명함 100매', price: 8900, category: 'print', subcategory: '명함', desc: '무광/유광 코팅 선택, 고급 용지 사용', type: 'namecard' },
  { name: '양면 컬러 명함 200매', price: 15000, category: 'print', subcategory: '명함', desc: '양면 풀컬러 인쇄, 빠른 배송', type: 'namecard' },
  { name: '고급 엠보싱 명함 100매', price: 25000, category: 'print', subcategory: '명함', desc: '엠보싱 효과, 프리미엄 느낌', type: 'namecard' },
  { name: '스페셜 금박 명함 50매', price: 35000, category: 'print', subcategory: '명함', desc: '금박 인쇄, 최고급 용지', type: 'namecard' },
  { name: '미니 명함 200매', price: 12000, category: 'print', subcategory: '명함', desc: '작은 사이즈, 휴대 편리', type: 'namecard' },
  { name: '라운드 명함 100매', price: 11000, category: 'print', subcategory: '명함', desc: '라운드 코너, 세련된 느낌', type: 'namecard' },
  { name: '크라프트 명함 100매', price: 9500, category: 'print', subcategory: '명함', desc: '친환경 크라프트지', type: 'namecard' },
  { name: '투명 PVC 명함 50매', price: 28000, category: 'print', subcategory: '명함', desc: '투명 소재, 독특한 디자인', type: 'namecard' },

  // 스티커 (8개)
  { name: '방수 비닐 스티커 50매', price: 12000, category: 'print', subcategory: '스티커', desc: '방수 코팅, 실외 사용 가능', type: 'sticker' },
  { name: '원형 스티커 100매', price: 8500, category: 'print', subcategory: '스티커', desc: '다양한 사이즈, 칼선 무료', type: 'sticker' },
  { name: '커스텀 홀로그램 스티커 30매', price: 18000, category: 'print', subcategory: '스티커', desc: '홀로그램 효과, 특별한 느낌', type: 'sticker' },
  { name: '투명 스티커 50매', price: 10000, category: 'print', subcategory: '스티커', desc: '투명 비닐, 고급스러운 느낌', type: 'sticker' },
  { name: '라벨 스티커 200매', price: 15000, category: 'print', subcategory: '스티커', desc: '상품 라벨용, 깔끔한 마감', type: 'sticker' },
  { name: '캐릭터 스티커 세트 100매', price: 20000, category: 'print', subcategory: '스티커', desc: 'AI 디자인 캐릭터, 귀여운 느낌', type: 'sticker' },
  { name: '네임 스티커 50매', price: 7000, category: 'print', subcategory: '스티커', desc: '이름표용, 유치원/학교용', type: 'sticker' },
  { name: '데코 스티커 믹스팩', price: 16000, category: 'print', subcategory: '스티커', desc: '다양한 디자인 50종', type: 'sticker' },

  // 포스터 (6개)
  { name: 'A3 고화질 포스터', price: 6500, category: 'print', subcategory: '포스터', desc: '선명한 컬러, 고급 아트지', type: 'poster' },
  { name: 'A2 대형 포스터', price: 12000, category: 'print', subcategory: '포스터', desc: '큰 사이즈, 인테리어용', type: 'poster' },
  { name: 'B1 초대형 포스터', price: 25000, category: 'print', subcategory: '포스터', desc: '매장 홍보용, 고급 인쇄', type: 'poster' },
  { name: '캔버스 포스터 A3', price: 18000, category: 'print', subcategory: '포스터', desc: '캔버스 재질, 고급스러움', type: 'poster' },
  { name: '접착식 포스터 A2', price: 15000, category: 'print', subcategory: '포스터', desc: '벽지처럼 부착 가능', type: 'poster' },
  { name: '양면 포스터 A3', price: 11000, category: 'print', subcategory: '포스터', desc: '양면 인쇄, 스탠드형 가능', type: 'poster' },

  // 현수막/배너 (5개)
  { name: '실외용 현수막 1m x 3m', price: 35000, category: 'print', subcategory: '현수막/배너', desc: '방수 원단, 튼튼한 마감', type: 'banner' },
  { name: '배너 스탠드 60cm x 180cm', price: 45000, category: 'print', subcategory: '현수막/배너', desc: '접이식 스탠드 포함', type: 'banner' },
  { name: '메쉬 현수막 2m x 4m', price: 55000, category: 'print', subcategory: '현수막/배너', desc: '바람 통과, 야외 설치용', type: 'banner' },
  { name: '실내 배너 80cm x 200cm', price: 28000, category: 'print', subcategory: '현수막/배너', desc: '고급 원단, 실내 전용', type: 'banner' },
  { name: 'X배너 60cm x 160cm', price: 32000, category: 'print', subcategory: '현수막/배너', desc: 'X자 거치대 포함', type: 'banner' },

  // 리플렛/팜플렛 (5개)
  { name: 'A4 양면 리플렛 100부', price: 18000, category: 'print', subcategory: '리플렛/팜플렛', desc: '고급 코팅지, 선명한 인쇄', type: 'poster' },
  { name: '3단 접지 리플렛 200부', price: 32000, category: 'print', subcategory: '리플렛/팜플렛', desc: '3단 접지, 휴대 편리', type: 'poster' },
  { name: 'DM 엽서 500부', price: 25000, category: 'print', subcategory: '리플렛/팜플렛', desc: 'DM 발송용, 대량 할인', type: 'poster' },
  { name: '카탈로그 20P', price: 45000, category: 'print', subcategory: '리플렛/팜플렛', desc: '제본 포함, 고급 인쇄', type: 'poster' },
  { name: '브로셔 8P 100부', price: 28000, category: 'print', subcategory: '리플렛/팜플렛', desc: '중철 제본, 회사 소개용', type: 'poster' },

  // 엽서/메세지카드 (4개)
  { name: '감성 엽서 세트 20장', price: 9500, category: 'print', subcategory: '엽서/메세지카드', desc: '특별한 메시지 전달', type: 'poster' },
  { name: '생일 축하 카드 10장', price: 7000, category: 'print', subcategory: '엽서/메세지카드', desc: '생일용, 봉투 포함', type: 'poster' },
  { name: '감사 카드 50장', price: 12000, category: 'print', subcategory: '엽서/메세지카드', desc: '고객 감사용, 고급 용지', type: 'poster' },
  { name: 'DIY 엽서 30장', price: 8000, category: 'print', subcategory: '엽서/메세지카드', desc: '빈 엽서, 직접 꾸미기', type: 'poster' },

  // 포토카드 (4개)
  { name: '고화질 포토카드 20매', price: 7800, category: 'print', subcategory: '포토카드', desc: '생생한 컬러, 반영구 보관', type: 'poster' },
  { name: '홀로그램 포토카드 10매', price: 12000, category: 'print', subcategory: '포토카드', desc: '홀로그램 효과, 특별함', type: 'poster' },
  { name: '포토카드 홀더 세트', price: 5500, category: 'print', subcategory: '포토카드', desc: '투명 홀더 10개 포함', type: 'poster' },
  { name: '미니 포토카드 50매', price: 9000, category: 'print', subcategory: '포토카드', desc: '작은 사이즈, 휴대 편리', type: 'poster' },

  // ========== 굿즈 카테고리 (30개) ==========
  // 액자류 (10개)
  { name: '캔버스 액자 A4', price: 21550, category: 'goods', subcategory: '굿즈', desc: '고급 캔버스, 나무 프레임', type: 'frame' },
  { name: '행잉 액자 20x30cm', price: 25410, category: 'goods', subcategory: '굿즈', desc: '원목 테두리, 매트한 질감', type: 'frame' },
  { name: '아크릴 액자 A3', price: 18000, category: 'goods', subcategory: '굿즈', desc: '투명 아크릴, 깔끔한 느낌', type: 'frame' },
  { name: '우드 액자 30x40cm', price: 32000, category: 'goods', subcategory: '굿즈', desc: '원목 프레임, 고급스러움', type: 'frame' },
  { name: '메탈 액자 A4', price: 15000, category: 'goods', subcategory: '굿즈', desc: '메탈 프레임, 모던한 느낌', type: 'frame' },
  { name: '갤러리 액자 50x70cm', price: 48000, category: 'goods', subcategory: '굿즈', desc: '갤러리급 품질, 대형 사이즈', type: 'frame' },
  { name: '탁상 액자 10x15cm', price: 8500, category: 'goods', subcategory: '굿즈', desc: '책상용, 가족 사진용', type: 'frame' },
  { name: '폴라로이드 액자', price: 12000, category: 'goods', subcategory: '굿즈', desc: '폴라로이드 스타일, 귀여움', type: 'frame' },
  { name: '자석 액자 A5', price: 9800, category: 'goods', subcategory: '굿즈', desc: '냉장고 부착용', type: 'frame' },
  { name: 'LED 액자 A4', price: 35000, category: 'goods', subcategory: '굿즈', desc: 'LED 조명 내장, 밝은 느낌', type: 'frame' },

  // 문구류 (10개)
  { name: '고급 양장 노트 A5', price: 12800, category: 'goods', subcategory: '문구', desc: '180페이지, 고급 용지', type: 'stationery' },
  { name: '스프링 노트 B5', price: 8500, category: 'goods', subcategory: '문구', desc: '스프링 제본, 필기 편함', type: 'stationery' },
  { name: '다이어리 2026', price: 15000, category: 'goods', subcategory: '문구', desc: '연간 다이어리, 고급 표지', type: 'stationery' },
  { name: '메모패드 200매', price: 6000, category: 'goods', subcategory: '문구', desc: '접착식, 다양한 컬러', type: 'stationery' },
  { name: '플래너 세트', price: 18000, category: 'goods', subcategory: '문구', desc: '월간/주간 플래너 포함', type: 'stationery' },
  { name: '스티커 노트 세트', price: 9500, category: 'goods', subcategory: '문구', desc: '5종 세트, 다양한 사이즈', type: 'stationery' },
  { name: '클립보드 A4', price: 7500, category: 'goods', subcategory: '문구', desc: '튼튼한 플라스틱, 서류 정리용', type: 'stationery' },
  { name: '북마크 세트 10개', price: 5000, category: 'goods', subcategory: '문구', desc: 'AI 디자인, 감성 북마크', type: 'stationery' },
  { name: '데스크 매트', price: 14000, category: 'goods', subcategory: '문구', desc: '가죽 재질, 고급스러움', type: 'stationery' },
  { name: '필통 세트', price: 11000, category: 'goods', subcategory: '문구', desc: '캔버스 재질, 넉넉한 수납', type: 'stationery' },

  // 팬시류 (10개)
  { name: '에어팟 케이스', price: 10010, category: 'goods', subcategory: '팬시', desc: '나만의 디자인, 실리콘 소재', type: 'fancy' },
  { name: '아크릴톡', price: 6930, category: 'goods', subcategory: '팬시', desc: '투명 아크릴, 양면 인쇄', type: 'fancy' },
  { name: '틴케이스', price: 5920, category: 'goods', subcategory: '팬시', desc: '추억 보관함, 고급 느낌', type: 'fancy' },
  { name: '마우스패드', price: 8500, category: 'goods', subcategory: '팬시', desc: '논슬립, 세련된 디자인', type: 'fancy' },
  { name: '텀블러 500ml', price: 18900, category: 'goods', subcategory: '팬시', desc: '보온보냉, 스테인리스', type: 'fancy' },
  { name: '파우치', price: 9900, category: 'goods', subcategory: '팬시', desc: '캔버스 소재, 넉넉한 수납', type: 'fancy' },
  { name: '키링', price: 5500, category: 'goods', subcategory: '팬시', desc: '아크릴 재질, 양면 인쇄', type: 'fancy' },
  { name: '폰케이스', price: 12000, category: 'goods', subcategory: '팬시', desc: '다양한 기종, 충격 방지', type: 'fancy' },
  { name: '그립톡', price: 4500, category: 'goods', subcategory: '팬시', desc: '접착식, 거치대 기능', type: 'fancy' },
  { name: '코스터 4개 세트', price: 8000, category: 'goods', subcategory: '팬시', desc: '코르크 재질, 흡수력 우수', type: 'fancy' },

  // ========== 패션 카테고리 (20개) ==========
  // 티셔츠 (8개)
  { name: '반팔 티셔츠 면100%', price: 15840, category: 'fashion', subcategory: '티셔츠', desc: '17수 티셔츠, 디지털 프린팅', type: 'tshirt' },
  { name: '오버핏 티셔츠', price: 18000, category: 'fashion', subcategory: '티셔츠', desc: '여유있는 핏, 편안함', type: 'tshirt' },
  { name: '라운드넥 긴팔 티셔츠', price: 19800, category: 'fashion', subcategory: '티셔츠', desc: '사계절용, 면100%', type: 'tshirt' },
  { name: 'V넥 티셔츠', price: 16500, category: 'fashion', subcategory: '티셔츠', desc: '슬림핏, 깔끔한 느낌', type: 'tshirt' },
  { name: '폴로 티셔츠', price: 22000, category: 'fashion', subcategory: '티셔츠', desc: '카라 티셔츠, 고급스러움', type: 'tshirt' },
  { name: '롱슬리브 티셔츠', price: 20000, category: 'fashion', subcategory: '티셔츠', desc: '긴팔, 레이어드용', type: 'tshirt' },
  { name: '나그랑 티셔츠', price: 17500, category: 'fashion', subcategory: '티셔츠', desc: '어깨 라인 특별함', type: 'tshirt' },
  { name: '크롭 티셔츠', price: 16000, category: 'fashion', subcategory: '티셔츠', desc: '짧은 기장, 여성용', type: 'tshirt' },

  // 후드/후드집업 (6개)
  { name: '맨투맨', price: 45210, category: 'fashion', subcategory: '후드/후드집업', desc: '디지털 프린팅, 고급 원단', type: 'hoodie' },
  { name: '후드티', price: 48000, category: 'fashion', subcategory: '후드/후드집업', desc: '기모 안감, 따뜻함', type: 'hoodie' },
  { name: '후드집업', price: 52000, category: 'fashion', subcategory: '후드/후드집업', desc: '지퍼형, 편리함', type: 'hoodie' },
  { name: '크롭 후드', price: 42000, category: 'fashion', subcategory: '후드/후드집업', desc: '짧은 기장, 스타일리시', type: 'hoodie' },
  { name: '오버핏 맨투맨', price: 47000, category: 'fashion', subcategory: '후드/후드집업', desc: '여유로운 핏', type: 'hoodie' },
  { name: '무지 후드티', price: 39000, category: 'fashion', subcategory: '후드/후드집업', desc: '심플한 디자인', type: 'hoodie' },

  // 에코백 (6개)
  { name: '캔버스 에코백', price: 11000, category: 'fashion', subcategory: '에코백', desc: '튼튼한 캔버스, 대용량', type: 'bag' },
  { name: '숄더백 에코백', price: 13000, category: 'fashion', subcategory: '에코백', desc: '어깨끈 길이 조절 가능', type: 'bag' },
  { name: '크로스백 에코백', price: 15000, category: 'fashion', subcategory: '에코백', desc: '크로스 착용 가능', type: 'bag' },
  { name: '미니 에코백', price: 9000, category: 'fashion', subcategory: '에코백', desc: '작은 사이즈, 간편함', type: 'bag' },
  { name: '빅사이즈 에코백', price: 14000, category: 'fashion', subcategory: '에코백', desc: '대용량, 장보기용', type: 'bag' },
  { name: '린넨 에코백', price: 16000, category: 'fashion', subcategory: '에코백', desc: '린넨 소재, 고급스러움', type: 'bag' },

  // ========== 우리가게 카테고리 (10개) ==========
  { name: 'LED 아크릴 간판', price: 120000, category: 'store', subcategory: '간판', desc: 'LED 조명 내장, 내구성 강함', type: 'store' },
  { name: '야외 간판 대형', price: 180000, category: 'store', subcategory: '간판', desc: '방수 처리, 야외용', type: 'store' },
  { name: '네온사인 간판', price: 250000, category: 'store', subcategory: '간판', desc: '네온 효과, 감성적', type: 'store' },
  { name: '입체 간판', price: 150000, category: 'store', subcategory: '간판', desc: '3D 입체 효과', type: 'store' },
  { name: '아크릴 메뉴판', price: 45000, category: 'store', subcategory: '메뉴판', desc: '위생적, 세련된 디자인', type: 'store' },
  { name: '탁상 메뉴판', price: 28000, category: 'store', subcategory: '메뉴판', desc: '테이블용, 교체 편리', type: 'store' },
  { name: '벽걸이 메뉴판', price: 35000, category: 'store', subcategory: '메뉴판', desc: '벽 부착형, 깔끔함', type: 'store' },
  { name: '롤업 스탠드배너', price: 38000, category: 'store', subcategory: '스탠드배너/엑스배너', desc: '이동 편리, 조립 간편', type: 'store' },
  { name: 'X배너 대형', price: 42000, category: 'store', subcategory: '스탠드배너/엑스배너', desc: 'X자 거치대, 안정적', type: 'store' },
  { name: '배너 스탠드 세트', price: 65000, category: 'store', subcategory: '스탠드배너/엑스배너', desc: '2개 세트, 할인가', type: 'store' },
];

async function seedMockData() {
  console.log('🌱 Mock 데이터 100개 생성 시작...\n');

  let batch = writeBatch(db);
  let batchCount = 0;
  let totalCount = 0;

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const id = `mock_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`;

    // 이미지 선택
    let imageUrl = '';
    if (product.category === 'print') {
      const typeImages = imagePool.print[product.type as keyof typeof imagePool.print] || imagePool.print.namecard;
      imageUrl = typeImages[i % typeImages.length];
    } else if (product.category === 'goods') {
      const typeImages = imagePool.goods[product.type as keyof typeof imagePool.goods] || imagePool.goods.frame;
      imageUrl = typeImages[i % typeImages.length];
    } else if (product.category === 'fashion') {
      const typeImages = imagePool.fashion[product.type as keyof typeof imagePool.fashion] || imagePool.fashion.tshirt;
      imageUrl = typeImages[i % typeImages.length];
    } else {
      imageUrl = imagePool.store[i % imagePool.store.length];
    }

    const docRef = doc(db, 'products', id);
    batch.set(docRef, {
      id,
      name: product.name,
      price: product.price,
      originalPrice: Math.random() > 0.7 ? product.price + Math.floor(Math.random() * 5000) : null,
      category: product.category,
      subcategory: product.subcategory,
      description: product.desc,
      thumbnail: imageUrl,
      images: [imageUrl],
      stock: Math.floor(Math.random() * 150) + 50,
      rating: 4.0 + Math.random(),
      reviewCount: Math.floor(Math.random() * 100) + 5,
      isBest: Math.random() > 0.85,
      isNew: Math.random() > 0.7,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    batchCount++;
    totalCount++;

    // Firestore batch는 500개 제한, 250개마다 커밋
    if (batchCount === 250) {
      await batch.commit();
      console.log(`✓ ${totalCount}개 상품 저장 완료`);
      batch = writeBatch(db);
      batchCount = 0;
    }

    // 진행상황 출력
    if ((i + 1) % 10 === 0) {
      console.log(`  📦 ${i + 1}개 준비 완료...`);
    }
  }

  // 남은 데이터 커밋
  if (batchCount > 0) {
    await batch.commit();
  }

  console.log(`\n✅ 총 ${totalCount}개 Mock 상품 생성 완료!\n`);

  console.log('📊 카테고리별 분포:');
  console.log('  🖨️  인쇄: 40개');
  console.log('  ✨ 굿즈/팬시: 30개');
  console.log('  👕 패션/어패럴: 20개');
  console.log('  🏪 우리가게: 10개');
  console.log('  ━━━━━━━━━━━━━━━');
  console.log('  📦 총계: 100개\n');
}

seedMockData()
  .then(() => {
    console.log('🎉 시딩 완료! 이제 /shop 페이지에서 확인하세요.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ 시딩 실패:', error);
    process.exit(1);
  });
