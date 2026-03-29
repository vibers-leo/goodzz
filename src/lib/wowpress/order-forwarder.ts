/**
 * WowPress 주문 포워더
 *
 * GOODZZ에서 생성된 주문을 WowPress로 자동 전달합니다.
 *
 * 프로세스:
 * 1. 결제 완료 후 호출 (payment/verify 웹훅에서)
 * 2. 주문에서 WowPress 상품 필터링
 * 3. WowPress 스펙으로 변환
 * 4. WowPress API로 주문 전송
 * 5. 결과 로깅 (성공/실패)
 */

import { getWowPressClient } from './api-client';
import { mapOrderToWowPressSpec, validateWowPressSpec, formatSpecPreview } from './spec-mapper';
import { db } from '@/lib/firebase';
import { updateOrder } from '@/lib/orders';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

/**
 * WowPress 벤더 ID (Firestore vendors 컬렉션에 등록된 ID)
 */
export const WOWPRESS_VENDOR_ID = 'VENDOR_WOWPRESS';

/**
 * 주문을 WowPress로 전달
 *
 * @param order - GOODZZ 주문 객체
 * @returns 전달 성공 여부
 */
export async function forwardOrderToWowPress(order: any): Promise<void> {
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`🚀 WowPress 주문 전달 시작: ${order.id}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  // 1. WowPress 상품이 포함된 vendorOrder 찾기
  const wowpressOrders = order.vendorOrders?.filter(
    (vo: any) => vo.vendorId === WOWPRESS_VENDOR_ID
  );

  if (!wowpressOrders || wowpressOrders.length === 0) {
    console.log('ℹ️  WowPress 상품이 없습니다. 건너뜁니다.');
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
    return;
  }

  console.log(`📦 WowPress 주문 ${wowpressOrders.length}개 발견`);

  const client = getWowPressClient();

  // 2. 각 vendorOrder 처리
  for (const vendorOrder of wowpressOrders) {
    try {
      const orderItem = vendorOrder.items[0]; // 첫 번째 아이템 (보통 1개)

      console.log(`\n📝 주문 아이템: ${orderItem.name}`);

      // 3. WowPress 스펙으로 변환
      const spec = mapOrderToWowPressSpec(order, {
        id: orderItem.productId,
        price: orderItem.price,
        printMethod: 'dtg', // 기본값 (상품 정보에서 가져와야 함)
      });

      // 4. 스펙 검증
      const validation = validateWowPressSpec(spec);
      if (!validation.valid) {
        throw new Error(`스펙 검증 실패: ${validation.errors.join(', ')}`);
      }

      // 5. 스펙 프리뷰 로깅
      console.log('\n' + formatSpecPreview(spec));

      // 6. WowPress로 주문 전송
      console.log('\n📤 WowPress API로 주문 전송 중...');

      const result = await client.submitOrder(spec);

      console.log(`✅ WowPress 주문 성공: ${result.orderno}`);

      // 7. 성공 로그 저장
      await addDoc(collection(db, 'wowpress_order_logs'), {
        myOrderId: order.id,
        wowpressOrderNo: result.orderno,
        vendorOrderId: vendorOrder.id,
        status: 'forwarded',
        spec: spec,
        response: result,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      // 8. vendorOrder에 externalOrderId 및 상태 업데이트
      await updateOrder(order.id, {
        [`vendorOrders.${wowpressOrders.findIndex((vo: any) => vo.vendorId === vendorOrder.vendorId)}.externalOrderId`]: result.orderno,
        [`vendorOrders.${wowpressOrders.findIndex((vo: any) => vo.vendorId === vendorOrder.vendorId)}.status`]: 'confirmed',
      } as any);

      console.log(`💾 주문 상태 업데이트 완료: ${result.orderno}`);

    } catch (error) {
      console.error(`\n❌ 주문 전달 실패:`, error);

      // 실패 로그 저장
      await addDoc(collection(db, 'wowpress_order_logs'), {
        myOrderId: order.id,
        vendorOrderId: vendorOrder.id,
        status: 'failed',
        error: (error as Error).message,
        stack: (error as Error).stack,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      // TODO: 실패 알림 전송 (관리자 이메일, Slack 등)
      // await sendAdminAlert({
      //   type: 'wowpress_order_failed',
      //   orderId: order.id,
      //   error: (error as Error).message,
      // });

      // TODO: 재시도 스케줄링
      // await scheduleRetry(order.id, {
      //   maxRetries: 3,
      //   retryDelay: 60000, // 1분 후
      // });

      // 에러를 던지지 않음 - WowPress 전달 실패가 주문 완료를 방해하지 않도록
      console.log('⚠️  WowPress 전달 실패 (비차단)');
    }
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`✅ WowPress 주문 전달 완료`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
}

/**
 * WowPress 주문 상태 동기화
 *
 * WowPress에서 주문 상태를 조회하여 GOODZZ 주문 업데이트
 */
export async function syncWowPressOrderStatus(myOrderId: string): Promise<boolean> {
  console.log(`🔄 WowPress 주문 상태 동기화 시작: ${myOrderId}`);

  try {
    // 1. GOODZZ 주문 조회
    const { getOrderById } = await import('@/lib/orders');
    const order = await getOrderById(myOrderId);
    if (!order) throw new Error('주문을 찾을 수 없습니다.');

    // 2. WowPress 주문 번호(externalOrderId) 찾기
    const wowpressVendorOrder = order.vendorOrders?.find(
      (vo: any) => vo.vendorId === WOWPRESS_VENDOR_ID && vo.externalOrderId
    );

    if (!wowpressVendorOrder) {
      console.log('ℹ️  WowPress 주문 번호가 없습니다.');
      return false;
    }

    const externalOrderId = wowpressVendorOrder.externalOrderId;
    const client = getWowPressClient();

    // 3. WowPress API로 상태 조회
    const wpStatus = await client.getOrderStatus(externalOrderId);
    console.log(`📦 WowPress 상태: ${wpStatus.status}, 송장: ${wpStatus.trackingNumber || '없음'}`);

    // 4. 상태 매핑
    let newStatus: any = order.orderStatus;
    if (wpStatus.status === 'printing') newStatus = 'PREPARING';
    else if (wpStatus.status === 'shipped') newStatus = 'SHIPPED';
    else if (wpStatus.status === 'delivered') newStatus = 'DELIVERED';
    else if (wpStatus.status === 'cancelled') newStatus = 'CANCELLED';

    // 5. 주문 업데이트
    const updateData: any = {};
    const voIndex = order.vendorOrders.findIndex((vo: any) => vo.vendorId === WOWPRESS_VENDOR_ID);

    if (newStatus !== order.orderStatus) {
      updateData.orderStatus = newStatus;
    }

    if (wpStatus.trackingNumber) {
      updateData[`vendorOrders.${voIndex}.trackingNumber`] = wpStatus.trackingNumber;
      updateData[`vendorOrders.${voIndex}.carrier`] = wpStatus.carrier || '대한통운';
      
      // 전체 주문 상태도 배송중으로 업데이트
      if (order.orderStatus !== 'SHIPPED' && order.orderStatus !== 'DELIVERED') {
        updateData.orderStatus = 'SHIPPED';
      }
    }

    if (Object.keys(updateData).length > 0) {
      await updateOrder(myOrderId, updateData);
      console.log(`✅ 주문 상태 업데이트 완료: ${myOrderId} -> ${newStatus}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`❌ 주문 상태 동기화 실패 (${myOrderId}):`, error);
    return false;
  }
}

/**
 * 모든 활성 주문 상태 동기화
 * (관리자 페이지나 크론 앱에서 호출)
 */
export async function syncActiveOrders(): Promise<{ success: number; failed: number }> {
  console.log('🔄 모든 활성 WowPress 주문 동기화 중...');
  
  const { getOrders } = await import('@/lib/orders');
  // 배송 완료되지 않은 주문들 조회
  const activeOrders = await getOrders();
  const targetOrders = activeOrders.filter(o => 
    (o.orderStatus === 'PAID' || o.orderStatus === 'PREPARING' || o.orderStatus === 'SHIPPED') &&
    o.vendorOrders?.some((vo: any) => vo.vendorId === WOWPRESS_VENDOR_ID && vo.externalOrderId)
  ) || [];

  console.log(`🔎 대상 주문 ${targetOrders.length}개 발견`);

  let successCount = 0;
  let failedCount = 0;

  for (const order of targetOrders) {
    const success = await syncWowPressOrderStatus(order.id);
    if (success) successCount++;
    else failedCount++;
  }

  return { success: successCount, failed: failedCount };
}

/**
 * 실패한 주문 재시도
 */
export async function retryFailedOrders(): Promise<void> {
  console.log('🔄 실패한 WowPress 주문 재시도 중...');

  try {
    const { collection, query, where, getDocs } = await import('firebase/firestore');
    const logsRef = collection(db, 'wowpress_order_logs');
    const q = query(logsRef, where('status', '==', 'failed'), where('retryCount', '<', 3));
    const snapshot = await getDocs(q);

    console.log(`🔎 재시도 대상 ${snapshot.size}건 발견`);

    for (const logDoc of snapshot.docs) {
      const logData = logDoc.data();
      const { getOrderById } = await import('@/lib/orders');
      const order = await getOrderById(logData.myOrderId);
      
      if (order) {
        console.log(`🚀 주문 재시도: ${order.id}`);
        await forwardOrderToWowPress(order);
        
        // 로그 업데이트
        const { doc, updateDoc } = await import('firebase/firestore');
        await updateDoc(doc(db, 'wowpress_order_logs', logDoc.id), {
          retryCount: (logData.retryCount || 0) + 1,
          updatedAt: Timestamp.now()
        });
      }
    }
  } catch (error) {
    console.error('재시도 프로세스 실패:', error);
  }
}
