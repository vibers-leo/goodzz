import { NextRequest, NextResponse } from 'next/server';
import { getPayment, mapTossStatus } from '@/lib/toss-payments';
import { getOrderById, updateOrder } from '@/lib/orders';

/**
 * 토스 페이먼츠 웹훅 핸들러
 * https://docs.tosspayments.com/guides/webhook
 *
 * 토스는 결제 상태 변경 시 웹훅을 전송합니다.
 * successUrl 리다이렉트와 별개로, 백업/보장 용도로 사용합니다.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventType, data } = body;

    console.log(`[Toss Webhook] ${eventType}`, data);

    // 결제 완료 이벤트
    if (eventType === 'PAYMENT_STATUS_CHANGED') {
      const { paymentKey, orderId, status } = data;

      if (!paymentKey || !orderId) {
        return NextResponse.json({ error: 'Missing paymentKey or orderId' }, { status: 400 });
      }

      // 토스 API로 결제 상태 직접 확인 (웹훅 데이터 신뢰하지 않음)
      const payment = await getPayment(paymentKey);
      const appStatus = mapTossStatus(payment.status);

      const order = await getOrderById(orderId);
      if (!order) {
        console.warn(`[Toss Webhook] Order not found: ${orderId}`);
        return NextResponse.json({ success: true });
      }

      // 이미 처리된 주문이면 스킵
      if (order.paymentStatus === 'PAID' && appStatus === 'PAID') {
        return NextResponse.json({ success: true, message: 'Already processed' });
      }

      // 취소/환불 처리
      if (appStatus === 'CANCELLED' || appStatus === 'REFUNDED') {
        await updateOrder(orderId, {
          paymentStatus: appStatus,
          orderStatus: 'CANCELLED',
        });
        console.log(`[Toss Webhook] Order ${orderId} cancelled/refunded`);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Toss Webhook] Error:', error);
    return NextResponse.json({ success: true }); // 토스에게 항상 200 응답
  }
}
