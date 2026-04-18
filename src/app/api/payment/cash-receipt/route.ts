import { NextRequest, NextResponse } from 'next/server';
import { getOrderById, updateOrder } from '@/lib/orders';
import { requireRole, unauthorizedResponse } from '@/lib/auth-middleware';

const TOSS_SECRET = process.env.TOSS_SECRET_KEY || '';
const AUTH_HEADER = `Basic ${Buffer.from(`${TOSS_SECRET}:`).toString('base64')}`;

/**
 * POST: 현금영수증 발급 요청
 * 토스 페이먼츠 현금영수증 API 연동
 * https://docs.tosspayments.com/reference#현금영수증-발급
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireRole(request, ['customer', 'seller', 'admin']);
    if (!auth.authorized) return unauthorizedResponse(auth.error);

    const { orderId, type, registrationNumber } = await request.json();

    // type: 소득공제(개인) / 지출증빙(사업자)
    if (!orderId || !type || !registrationNumber) {
      return NextResponse.json(
        { error: 'orderId, type(소득공제/지출증빙), registrationNumber가 필요합니다.' },
        { status: 400 }
      );
    }

    const order = await getOrderById(orderId);
    if (!order) {
      return NextResponse.json({ error: '주문을 찾을 수 없습니다.' }, { status: 404 });
    }

    if (order.paymentStatus !== 'PAID') {
      return NextResponse.json({ error: '결제 완료된 주문만 현금영수증을 발급할 수 있습니다.' }, { status: 400 });
    }

    // 소유권 검증
    if (order.userId !== auth.userId && !auth.roles?.includes('admin')) {
      return NextResponse.json({ error: '본인 주문만 신청할 수 있습니다.' }, { status: 403 });
    }

    const couponDiscount = (order as any).couponDiscount || 0;
    const amount = order.totalAmount + order.shippingFee - couponDiscount;

    // 토스 현금영수증 발급 API
    const res = await fetch('https://api.tosspayments.com/v1/cash-receipts', {
      method: 'POST',
      headers: {
        Authorization: AUTH_HEADER,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        orderId: order.id,
        orderName: `GOODZZ 주문 ${order.id}`,
        customerIdentityNumber: registrationNumber.replace(/-/g, ''),
        type: type === '소득공제' ? 'INCOME' : 'EXPENDITURE',
        taxFreeAmount: 0,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      console.error('Toss cash receipt error:', err);
      return NextResponse.json({ error: err.message || '현금영수증 발급 실패' }, { status: 400 });
    }

    const receipt = await res.json();

    // 주문에 현금영수증 정보 저장
    await updateOrder(orderId, {
      cashReceipt: {
        receiptKey: receipt.receiptKey,
        type,
        registrationNumber: registrationNumber.replace(/\d(?=\d{4})/g, '*'), // 마스킹
        issueNumber: receipt.issueNumber,
        issueUrl: receipt.receiptUrl,
        issuedAt: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      message: '현금영수증이 발급되었습니다.',
      receipt: {
        issueNumber: receipt.issueNumber,
        receiptUrl: receipt.receiptUrl,
      },
    });
  } catch (error: any) {
    console.error('Cash receipt error:', error);
    return NextResponse.json({ error: error.message || '현금영수증 발급 실패' }, { status: 500 });
  }
}
