import { NextRequest, NextResponse } from 'next/server';
import { getOrders } from '@/lib/orders';
import { requireAdmin, unauthorizedResponse } from '@/lib/auth-middleware';

/**
 * GET: 주문 CSV 내보내기 (관리자 전용)
 * 엑셀 호환 CSV 포맷으로 주문 데이터 다운로드
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.authorized) return unauthorizedResponse(auth.error);

    const status = request.nextUrl.searchParams.get('status') || undefined;
    const paymentStatus = request.nextUrl.searchParams.get('paymentStatus') || undefined;

    const orders = await getOrders({
      status: status as any,
      paymentStatus: paymentStatus as any,
    });

    // BOM + CSV 헤더 (엑셀 한글 깨짐 방지)
    const BOM = '\uFEFF';
    const headers = [
      '주문번호', '주문일시', '주문자', '연락처', '이메일',
      '우편번호', '주소', '상세주소', '배송메모',
      '상품명', '수량', '상품금액', '배송비', '쿠폰할인', '총결제금액',
      '결제상태', '주문상태', '결제수단',
      '운송장번호', '택배사',
      '벤더', '관리자메모',
    ].join(',');

    const rows = orders.map((order) => {
      const items = order.items.map(i => `${i.productName || i.name}(${i.quantity})`).join(' / ');
      const couponDiscount = (order as any).couponDiscount || 0;
      const totalPaid = order.totalAmount + order.shippingFee - couponDiscount;
      const vendorNames = order.vendorOrders?.map(v => v.vendorName).join(' / ') || '-';

      return [
        order.id,
        order.createdAt,
        order.shippingInfo?.name || '-',
        order.shippingInfo?.phone || '-',
        order.shippingInfo?.email || '-',
        order.shippingInfo?.postalCode || '-',
        `"${(order.shippingInfo?.address || '-').replace(/"/g, '""')}"`,
        `"${(order.shippingInfo?.addressDetail || '-').replace(/"/g, '""')}"`,
        `"${(order.shippingInfo?.memo || '').replace(/"/g, '""')}"`,
        `"${items}"`,
        order.items.reduce((sum, i) => sum + i.quantity, 0),
        order.totalAmount,
        order.shippingFee,
        couponDiscount,
        totalPaid,
        order.paymentStatus,
        order.orderStatus,
        (order as any).paymentMethod || '-',
        order.shippingInfo?.trackingNumber || '-',
        order.shippingInfo?.carrier || '-',
        `"${vendorNames}"`,
        `"${((order as any).adminMemo || '').replace(/"/g, '""')}"`,
      ].join(',');
    });

    const csv = BOM + headers + '\n' + rows.join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="goodzz-orders-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Order export error:', error);
    return NextResponse.json({ error: '주문 내보내기 실패' }, { status: 500 });
  }
}
