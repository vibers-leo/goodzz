import { NextRequest, NextResponse } from 'next/server';
import { getPointBalance, getPointHistory, earnPoints, usePoints, adminAdjustPoints } from '@/lib/points';
import { requireRole, unauthorizedResponse } from '@/lib/auth-middleware';

// GET: 포인트 잔액 + 내역 조회
export async function GET(request: NextRequest) {
  try {
    const auth = await requireRole(request, ['customer', 'seller', 'admin']);
    if (!auth.authorized) return unauthorizedResponse(auth.error);

    const userId = request.nextUrl.searchParams.get('userId') || auth.userId!;

    // 다른 유저의 포인트는 admin만
    if (userId !== auth.userId && !auth.roles?.includes('admin')) {
      return NextResponse.json({ error: '접근 권한이 없습니다.' }, { status: 403 });
    }

    const [balance, history] = await Promise.all([
      getPointBalance(userId),
      getPointHistory(userId),
    ]);

    return NextResponse.json({ success: true, balance, history });
  } catch (error) {
    console.error('Points GET error:', error);
    return NextResponse.json({ error: '포인트 조회 실패' }, { status: 500 });
  }
}

// POST: 포인트 적립/사용/관리자 조정
export async function POST(request: NextRequest) {
  try {
    const auth = await requireRole(request, ['customer', 'seller', 'admin']);
    if (!auth.authorized) return unauthorizedResponse(auth.error);

    const { action, userId, amount, reason, relatedType, relatedId } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: '유효한 금액이 필요합니다.' }, { status: 400 });
    }

    const targetUserId = userId || auth.userId!;

    switch (action) {
      case 'earn': {
        const success = await earnPoints(targetUserId, amount, reason || '포인트 적립', relatedType, relatedId);
        if (!success) return NextResponse.json({ error: '포인트 적립 실패' }, { status: 500 });
        return NextResponse.json({ success: true, message: `${amount}P 적립되었습니다.` });
      }

      case 'use': {
        if (targetUserId !== auth.userId) {
          return NextResponse.json({ error: '본인 포인트만 사용할 수 있습니다.' }, { status: 403 });
        }
        const success = await usePoints(targetUserId, amount, reason || '포인트 사용', relatedType, relatedId);
        if (!success) return NextResponse.json({ error: '포인트가 부족합니다.' }, { status: 400 });
        return NextResponse.json({ success: true, message: `${amount}P 사용되었습니다.` });
      }

      case 'admin': {
        if (!auth.roles?.includes('admin')) {
          return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
        }
        const adjustAmount = (await request.json()).direction === 'deduct' ? -amount : amount;
        const success = await adminAdjustPoints(targetUserId, adjustAmount, reason || '관리자 조정');
        if (!success) return NextResponse.json({ error: '포인트 조정 실패' }, { status: 500 });
        return NextResponse.json({ success: true, message: `포인트가 조정되었습니다.` });
      }

      default:
        return NextResponse.json({ error: 'action은 earn, use, admin 중 하나여야 합니다.' }, { status: 400 });
    }
  } catch (error) {
    console.error('Points POST error:', error);
    return NextResponse.json({ error: '포인트 처리 실패' }, { status: 500 });
  }
}
