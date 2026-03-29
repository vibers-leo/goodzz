import { NextResponse } from 'next/server';
import { syncActiveOrders } from '@/lib/wowpress/order-forwarder';

export async function GET() {
  console.log('API: WowPress 주문 상태 동기화 요청 수신');
  
  try {
    const result = await syncActiveOrders();
    
    return NextResponse.json({
      success: true,
      message: '동기화 완료',
      stats: result
    });
  } catch (error) {
    console.error('API: 동기화 실패:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
