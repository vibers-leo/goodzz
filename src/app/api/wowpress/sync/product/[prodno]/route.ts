import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-middleware';
import { getWowPressClient } from '@/lib/wowpress/api-client';
import { createProduct } from '@/lib/products';
import { WOWPRESS_VENDOR_ID } from '@/lib/wowpress/order-forwarder';
import { db } from '@/lib/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

/**
 * POST /api/wowpress/sync/product/[prodno]
 *
 * WowPress 상품을 MyAIPrintShop 카탈로그에 동기화
 *
 * 권한: Admin only
 *
 * 프로세스:
 * 1. WowPress API에서 상품 정보 조회
 * 2. MyAIPrintShop products 컬렉션에 상품 생성
 * 3. wowpress_products 캐시에 매핑 정보 저장
 *
 * 사용 예시:
 * ```bash
 * curl -X POST http://localhost:3300/api/wowpress/sync/product/WOW001 \
 *   -H "Authorization: Bearer <admin-token>"
 * ```
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ prodno: string }> }
) {
  // 1. 관리자 권한 확인
  const { authorized, roles } = await requireRole(request, ['admin']);

  if (!authorized || !roles?.includes('admin')) {
    return NextResponse.json(
      {
        success: false,
        error: 'Unauthorized',
        message: '관리자만 접근 가능합니다',
      },
      { status: 401 }
    );
  }

  try {
    const { prodno } = await context.params;

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`🔄 WowPress 상품 동기화 시작: ${prodno}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    // 2. WowPress API에서 상품 정보 조회
    const client = getWowPressClient();
    const wowProduct = await client.getProduct(prodno);

    console.log(`✅ WowPress 상품 조회 완료: ${wowProduct.prodname}`);

    // 3. MyAIPrintShop 상품 생성
    const productId = await createProduct({
      name: wowProduct.prodname,
      description: `${wowProduct.category} - WowPress 제품\n\n${
        wowProduct.spec?.description || '전문 인쇄소의 고품질 인쇄 서비스'
      }`,
      price: wowProduct.basePrice,
      thumbnail: wowProduct.thumbnail || '/images/placeholder-product.jpg',
      images: wowProduct.thumbnail ? [wowProduct.thumbnail] : [],
      category: wowProduct.category || 'print',
      subcategory: 'wowpress',
      vendorId: WOWPRESS_VENDOR_ID,
      vendorName: 'WowPress',
      stock: 9999, // WowPress는 주문 제작이므로 재고 무제한
      isActive: true,
      reviewCount: 0,
      rating: 0,
      // TODO: WowPress 스펙을 options.groups로 변환
      options: {
        groups: [],
      },
      metadata: {
        source: 'wowpress',
        wowpressProdno: prodno,
        syncedAt: new Date().toISOString(),
      },
    });

    console.log(`✅ MyAIPrintShop 상품 생성 완료: ${productId}`);

    // 4. wowpress_products 캐시에 매핑 저장
    await addDoc(collection(db, 'wowpress_products'), {
      prodno,
      prodname: wowProduct.prodname,
      category: wowProduct.category,
      basePrice: wowProduct.basePrice,
      spec: wowProduct.spec,
      myProductId: productId,
      lastSyncedAt: Timestamp.now(),
    });

    console.log(`✅ WowPress 캐시 저장 완료`);

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`✅ 동기화 완료`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    return NextResponse.json({
      success: true,
      message: '상품이 성공적으로 동기화되었습니다',
      data: {
        prodno,
        productId,
        productName: wowProduct.prodname,
        price: wowProduct.basePrice,
      },
    });
  } catch (error) {
    console.error('\n❌ WowPress 상품 동기화 실패:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Product sync failed',
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/wowpress/sync/product/[prodno]
 *
 * WowPress 상품 정보 조회 (동기화 미리보기)
 *
 * 권한: Admin only
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ prodno: string }> }
) {
  // 관리자 권한 확인
  const { authorized, roles } = await requireRole(request, ['admin']);

  if (!authorized || !roles?.includes('admin')) {
    return NextResponse.json(
      {
        success: false,
        error: 'Unauthorized',
      },
      { status: 401 }
    );
  }

  try {
    const { prodno } = await context.params;

    // WowPress API에서 상품 정보 조회
    const client = getWowPressClient();
    const wowProduct = await client.getProduct(prodno);

    return NextResponse.json({
      success: true,
      data: wowProduct,
    });
  } catch (error) {
    console.error('WowPress 상품 조회 실패:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch product',
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
