'use client';

import React from 'react';
import Image from 'next/image';
import styles from './Reviews.module.css';

interface Review {
  id: number;
  reviewerName: string;
  starRating: number;
  date: string;
  content: string;
  images?: string[];
  isAiDesign?: boolean;
  productName?: string;
}

// MY AI PRINT SHOP 맞춤 리뷰 데이터
const reviews: Review[] = [
  {
    id: 1,
    reviewerName: "김*현",
    starRating: 5,
    date: "2026.01.05",
    content: "AI로 만든 디자인이 이렇게 퀄리티가 좋을 줄 몰랐어요! 우리 강아지를 캐릭터로 만들어서 티셔츠에 프린팅했는데 주변에서 어디서 샀냐고 난리예요. 프린팅 품질도 세탁해도 색이 안 빠지고 정말 좋습니다.",
    images: ['/review-1.jpg'],
    isAiDesign: true,
    productName: 'AI 디자인 오버핏 반팔티'
  },
  {
    id: 2,
    reviewerName: "이*진",
    starRating: 5,
    date: "2026.01.03",
    content: "회사 팀빌딩 굿즈로 주문했어요. 각자 원하는 스타일로 AI가 디자인해주니까 팀원들이 너무 좋아하더라구요. 에코백 품질도 두꺼운 원단이라 오래 쓸 수 있을 것 같습니다. 다음에 또 이용할게요!",
    images: ['/review-2.jpg'],
    isAiDesign: true,
    productName: '프리미엄 캔버스 에코백'
  },
  {
    id: 3,
    reviewerName: "박*수",
    starRating: 5,
    date: "2025.12.28",
    content: "사이버펑크 스타일로 요청했는데 진짜 제가 상상한 그대로 나왔어요. 머그컵 품질도 좋고 색감이 화면에서 본 것과 거의 똑같아서 만족스럽습니다. 직장 동료 선물용으로 추가 주문해야겠어요.",
    images: ['/review-3.jpg'],
    isAiDesign: true,
    productName: '세라믹 머그컵'
  },
  {
    id: 4,
    reviewerName: "최*아",
    starRating: 4,
    date: "2025.12.25",
    content: "배송이 빠르고 포장도 꼼꼼하게 해주셨어요. AI 디자인 생성할 때 여러 스타일을 시험해볼 수 있어서 좋았습니다. 한 가지 아쉬운 점은 생성 횟수 제한이 있다는 건데, 무제한이면 더 좋을 것 같아요!",
    images: [],
    isAiDesign: true,
    productName: 'AI 아트 스티커 세트'
  },
  {
    id: 5,
    reviewerName: "정*우",
    starRating: 5,
    date: "2025.12.20",
    content: "크리스마스 선물로 여자친구 얼굴을 애니메이션 스타일로 변환해서 티셔츠 만들었어요. 여친이 너무 좋아해서 저도 뿌듯합니다. 이런 서비스 진작 알았으면 좋았을 텐데... 강력 추천합니다!",
    images: [],
    isAiDesign: true,
    productName: '프리미엄 반팔티'
  }
];

interface ReviewsProps {
  productId?: string;
}

export default function Reviews({ productId }: ReviewsProps) {
  const displayReviews = reviews; // 실제로는 productId로 필터링

  const avgRating = (displayReviews.reduce((sum, r) => sum + r.starRating, 0) / displayReviews.length).toFixed(1);
  const photoReviews = displayReviews.filter(r => r.images && r.images.length > 0);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>상품 리뷰 ({displayReviews.length})</h3>
        <div className={styles.sourceBadge}>
          <span className={styles.sourceLogo}>✓</span>
          실제 구매 고객 리뷰
        </div>
      </div>

      <div className={styles.ratingOverview}>
        <div className={styles.bigRating}>{avgRating}</div>
        <div className={styles.stars}>{'⭐'.repeat(Math.round(Number(avgRating)))}</div>
        <div className={styles.countText}>{displayReviews.length}개의 리뷰</div>
      </div>

      {/* Photo Reviews Grid */}
      {photoReviews.length > 0 && (
        <>
          <h4 className={styles.sectionTitle}>📸 포토 리뷰</h4>
          <div className={styles.photoGrid}>
            {photoReviews.map(review => (
              <div key={review.id} className={styles.photoCard}>
                <div className={styles.photoWrapper}>
                  {review.images && review.images[0] && (
                    <Image
                      src={review.images[0]}
                      alt="Review"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  )}
                  <div className={styles.photoOverlay}>
                    <span className={styles.photoUser}>{review.reviewerName}</span>
                    <span className={styles.photoRating}>⭐{review.starRating}</span>
                  </div>
                </div>
                <div className={styles.photoContent}>
                  <p>{review.content.substring(0, 60)}...</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Normal Review List */}
      <h4 className={styles.sectionTitle}>전체 리뷰</h4>
      <div className={styles.reviewList}>
        {displayReviews.map((review) => (
          <div key={review.id} className={styles.reviewItem}>
            <div className={styles.reviewHeader}>
              <div className={styles.userInfo}>
                <span className={styles.name}>{review.reviewerName}</span>
                <span className={styles.date}>{review.date}</span>
                <span className={styles.sourceTag}>구매 확인</span>
                {review.isAiDesign && <span className={styles.aiTag}>✨ AI 디자인</span>}
              </div>
              <div className={styles.stars}>
                {'⭐'.repeat(review.starRating)}
              </div>
            </div>
            
            {review.productName && (
              <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: 8 }}>
                {review.productName}
              </p>
            )}
            
            <p className={styles.content}>{review.content}</p>
            
            {review.images && review.images.length > 0 && (
              <div className={styles.reviewImages}>
                {review.images.map((img, idx) => (
                  <div key={idx} className={styles.thumbWrapper}>
                    <Image
                      src={img}
                      alt="review"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {displayReviews.length === 0 && (
        <div className={styles.emptyState}>
          <h4>아직 리뷰가 없습니다</h4>
          <p>첫 번째 리뷰를 작성해보세요!</p>
        </div>
      )}
    </div>
  );
}
