import { NextRequest, NextResponse } from 'next/server';
import {
  registerCreator,
  getCreatorByUid,
  getCreatorByHandle,
  getAllCreators,
  updateCreatorProfile,
  getCreatorProducts,
  getCreatorProductsByHandle,
  createCreatorProduct,
  getCreatorStats,
} from '@/lib/creators';

// GET: 크리에이터 목록 또는 특정 크리에이터 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const handle = searchParams.get('handle');
    const uid = searchParams.get('uid');
    const products = searchParams.get('products');
    const stats = searchParams.get('stats');

    // 특정 크리에이터 통계
    if (stats && uid) {
      const creatorStats = await getCreatorStats(uid);
      return NextResponse.json({ success: true, stats: creatorStats });
    }

    // 크리에이터 상품 목록
    if (products && (handle || uid)) {
      const creatorProducts = handle
        ? await getCreatorProductsByHandle(handle)
        : await getCreatorProducts(uid!);
      return NextResponse.json({ success: true, products: creatorProducts });
    }

    // 핸들로 크리에이터 조회
    if (handle) {
      const creator = await getCreatorByHandle(handle);
      if (!creator) {
        return NextResponse.json({ error: '크리에이터를 찾을 수 없습니다.' }, { status: 404 });
      }
      return NextResponse.json({ success: true, creator });
    }

    // UID로 크리에이터 조회
    if (uid) {
      const creator = await getCreatorByUid(uid);
      if (!creator) {
        return NextResponse.json({ success: true, creator: null });
      }
      return NextResponse.json({ success: true, creator });
    }

    // 전체 크리에이터 목록
    const creators = await getAllCreators({ onlyActive: true, limitCount: 50 });
    return NextResponse.json({ success: true, creators });
  } catch (error) {
    console.error('Creators API error:', error);
    return NextResponse.json({ error: '크리에이터 조회 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

// POST: 크리에이터 등록 또는 상품 등록
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'register') {
      const { uid, handle, displayName, shopName, bio, profileImage } = body;
      if (!uid || !handle || !displayName || !shopName) {
        return NextResponse.json({ error: '필수 정보가 누락되었습니다.' }, { status: 400 });
      }

      // Validate handle format
      if (!/^[a-z0-9_-]{3,20}$/.test(handle)) {
        return NextResponse.json({
          error: '핸들은 3~20자의 영문 소문자, 숫자, 하이픈, 언더스코어만 사용 가능합니다.',
        }, { status: 400 });
      }

      await registerCreator({ uid, handle, displayName, shopName, bio: bio || '', profileImage: profileImage || '' });
      return NextResponse.json({ success: true, message: '크리에이터 등록이 완료되었습니다.' });
    }

    if (action === 'create_product') {
      const { creatorUid, creatorHandle, productId, title, description, designUrl, price, baseProductPrice, category, tags } = body;
      if (!creatorUid || !title || !designUrl || !price) {
        return NextResponse.json({ error: '필수 정보가 누락되었습니다.' }, { status: 400 });
      }

      const id = await createCreatorProduct({
        creatorUid,
        creatorHandle: creatorHandle || '',
        productId: productId || '',
        title,
        description: description || '',
        designUrl,
        price,
        baseProductPrice: baseProductPrice || 0,
        category: category || '',
        tags: tags || [],
      });

      if (!id) {
        return NextResponse.json({ error: '상품 등록에 실패했습니다.' }, { status: 500 });
      }
      return NextResponse.json({ success: true, productId: id });
    }

    return NextResponse.json({ error: '유효하지 않은 액션입니다.' }, { status: 400 });
  } catch (error: any) {
    console.error('Creators POST error:', error);
    return NextResponse.json({ error: error.message || '처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

// PATCH: 크리에이터 프로필 업데이트
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { uid, ...updates } = body;

    if (!uid) {
      return NextResponse.json({ error: 'UID가 필요합니다.' }, { status: 400 });
    }

    const success = await updateCreatorProfile(uid, updates);
    if (!success) {
      return NextResponse.json({ error: '프로필 업데이트에 실패했습니다.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: '프로필이 업데이트되었습니다.' });
  } catch (error) {
    console.error('Creators PATCH error:', error);
    return NextResponse.json({ error: '업데이트 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
