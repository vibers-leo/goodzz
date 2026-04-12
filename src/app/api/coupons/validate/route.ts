import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const amount = Number(request.nextUrl.searchParams.get('amount') || 0);

  if (!code) {
    return NextResponse.json({ error: '쿠폰 코드를 입력해주세요.' }, { status: 400 });
  }

  try {
    const db = await getAdminFirestore();
    const snap = await db.collection('coupons').where('code', '==', code.toUpperCase()).get();

    if (snap.empty) {
      return NextResponse.json({ error: '존재하지 않는 쿠폰 코드입니다.' }, { status: 404 });
    }

    const doc = snap.docs[0];
    const coupon = doc.data();

    if (!coupon.active) {
      return NextResponse.json({ error: '비활성화된 쿠폰입니다.' }, { status: 400 });
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return NextResponse.json({ error: '만료된 쿠폰입니다.' }, { status: 400 });
    }

    if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ error: '사용 한도를 초과한 쿠폰입니다.' }, { status: 400 });
    }

    if (coupon.minOrderAmount > 0 && amount < coupon.minOrderAmount) {
      return NextResponse.json({ error: `₩${coupon.minOrderAmount.toLocaleString()} 이상 주문 시 사용 가능합니다.` }, { status: 400 });
    }

    const discount = coupon.discountType === 'fixed'
      ? coupon.discountValue
      : Math.round(amount * coupon.discountValue / 100);

    return NextResponse.json({
      success: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        description: coupon.description,
      },
      discount,
    });
  } catch (error) {
    console.error('Coupon validate error:', error);
    return NextResponse.json({ error: '쿠폰 확인에 실패했습니다.' }, { status: 500 });
  }
}
