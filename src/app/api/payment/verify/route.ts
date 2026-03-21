import { NextRequest, NextResponse } from 'next/server';
import { PORTONE_CONFIG, PaymentResponse, Order } from '@/lib/payment';
import { getOrderById, updateOrder } from '@/lib/orders';
import { batchTransferToVendors } from '@/lib/portone-settlement';
import { getAllVendors } from '@/lib/vendors';
import { forwardOrderToWowPress } from '@/lib/wowpress/order-forwarder';

// 포트원 V2 API로 결제 검증
async function verifyPaymentWithPortone(paymentId: string): Promise<PaymentResponse | null> {
  try {
    // 포트원 V2 단건 조회 API
    const response = await fetch(
      `https://api.portone.io/v2/payments/${encodeURIComponent(paymentId)}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `PortOne ${PORTONE_CONFIG.apiSecret}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.error('Portone API error:', await response.text());
      return null;
    }

    const data = await response.json();
    
    // 결제 상태 매핑
    const statusMap: Record<string, PaymentResponse['status']> = {
      'PAID': 'PAID',
      'READY': 'PENDING',
      'FAILED': 'FAILED',
      'CANCELLED': 'CANCELLED',
      'PARTIAL_CANCELLED': 'REFUNDED',
    };

    return {
      paymentId: data.id,
      orderId: data.customData || data.orderName,
      status: statusMap[data.status] || 'PENDING',
      amount: data.amount?.total || 0,
      paidAt: data.paidAt,
      failReason: data.failReason,
    };
  } catch (error) {
    console.error('Payment verification error:', error);
    return null;
  }
}

// POST: 결제 완료 검증
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentId, orderId } = body;

    if (!paymentId || !orderId) {
      return NextResponse.json(
        { error: 'paymentId와 orderId가 필요합니다.' },
        { status: 400 }
      );
    }

    // DB에서 주문 조회
    const order = await getOrderById(orderId);
    if (!order) {
      return NextResponse.json(
        { error: '주문을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 이미 결제 완료된 경우
    if (order.paymentStatus === 'PAID') {
      return NextResponse.json({
        success: true,
        message: '이미 결제가 완료된 주문입니다.',
        order,
      });
    }

    // 포트원 API로 결제 검증
    let paymentVerified = false;
    let paymentData: PaymentResponse | null = null;

    if (PORTONE_CONFIG.apiSecret && !paymentId.startsWith('test-')) {
      paymentData = await verifyPaymentWithPortone(paymentId);
      
      if (!paymentData) {
        return NextResponse.json(
          { error: '결제 정보를 확인할 수 없습니다.' },
          { status: 400 }
        );
      }

      // 결제 금액 검증
      const expectedTotal = order.totalAmount + order.shippingFee;
      if (paymentData.amount !== expectedTotal) {
        console.error(
          `Payment amount mismatch: expected ${expectedTotal}, got ${paymentData.amount}`
        );
        return NextResponse.json(
          { error: '결제 금액이 일치하지 않습니다.' },
          { status: 400 }
        );
      }

      paymentVerified = paymentData.status === 'PAID';
    } else {
      // 테스트 모드 또는 API Secret 미설정 시: 결제 성공으로 간주 (개발용)
      console.log('⚠️ Development mode: Skipping actual payment verification');
      paymentVerified = true;
      paymentData = {
        paymentId,
        orderId,
        status: 'PAID',
        amount: order.totalAmount + order.shippingFee,
        paidAt: new Date().toISOString(),
      };
    }

    if (!paymentVerified) {
      return NextResponse.json(
        { error: '결제가 완료되지 않았습니다.' },
        { status: 400 }
      );
    }

    // DB 주문 상태 업데이트
    const updateSuccess = await updateOrder(orderId, {
      paymentId: paymentId,
      paymentStatus: 'PAID',
      orderStatus: 'PAID',
    });

    if (!updateSuccess) {
      throw new Error('Failed to update order in database');
    }

    // 최신 주문 데이터 다시 가져오기
    const updatedOrder = await getOrderById(orderId);

    console.log(`✅ Order ${orderId} payment verified and saved to DB`);

    // Phase 5: 배분정산 실행
    if (updatedOrder?.vendorOrders && updatedOrder.vendorOrders.length > 0) {
      try {
        console.log(`💰 Starting settlement for ${updatedOrder.vendorOrders.length} vendors...`);

        const vendors = await getAllVendors('approved');
        const vendorsMap = new Map(vendors.map(v => [v.id, v]));

        const settlementResults = await batchTransferToVendors(
          updatedOrder.vendorOrders,
          vendorsMap,
          orderId
        );

        console.log(`✅ Settlement completed for ${settlementResults.size} vendors`);

        // TODO: 판매자에게 이메일 알림 발송
        // await sendVendorNotifications(updatedOrder.vendorOrders, vendorsMap);
      } catch (error) {
        console.error('❌ Settlement error (order still completed):', error);
        // 정산 실패해도 주문은 완료됨 (정산은 나중에 재시도 가능)
      }
    }

    // Phase 6: WowPress 주문 전달 (비차단)
    if (updatedOrder) {
      try {
        await forwardOrderToWowPress(updatedOrder);
      } catch (error) {
        console.error('❌ WowPress forwarding error (non-blocking):', error);
        // WowPress 전달 실패해도 주문은 완료됨 (나중에 재시도 가능)
      }
    }

    return NextResponse.json({
      success: true,
      message: '결제가 완료되었습니다.',
      order: updatedOrder,
      payment: paymentData,
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: '결제 검증 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
