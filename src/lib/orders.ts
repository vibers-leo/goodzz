import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  Timestamp,
  DocumentData
} from 'firebase/firestore';
import { db } from './firebase';
import { Order, OrderStatus, PaymentStatus } from './payment';

// Firestore 컬렉션 참조
const ordersCollection = collection(db, 'orders');

// 문서 데이터를 Order 타입으로 변환
function docToOrder(data: DocumentData, id: string): Order {
  return {
    id,
    userId: data.userId,
    items: data.items || [],
    totalAmount: data.totalAmount || 0,
    shippingFee: data.shippingFee || 0,
    platformFee: data.platformFee,
    vendorOrders: data.vendorOrders,
    shippingInfo: data.shippingInfo || {},
    paymentId: data.paymentId,
    paymentStatus: data.paymentStatus || 'PENDING',
    orderStatus: data.orderStatus || 'PENDING',
    createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
  };
}

// ============ 주문 조회 ============

// 전체 주문 목록 조회 (관리자용)
// 복합 인덱스 없이 동작하도록 전체 조회 후 JS에서 필터/정렬
export async function getOrders(options?: {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  userId?: string;
  limitCount?: number;
}): Promise<Order[]> {
  try {
    const snapshot = await getDocs(ordersCollection);
    let orders = snapshot.docs.map(d => docToOrder(d.data(), d.id));

    // 필터링
    if (options?.status) {
      orders = orders.filter(o => o.orderStatus === options.status);
    }
    if (options?.paymentStatus) {
      orders = orders.filter(o => o.paymentStatus === options.paymentStatus);
    }
    if (options?.userId) {
      orders = orders.filter(o => o.userId === options.userId);
    }

    // 최신순 정렬
    orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // 개수 제한
    if (options?.limitCount) {
      orders = orders.slice(0, options.limitCount);
    }

    return orders;
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
}

// 단일 주문 조회
export async function getOrderById(orderId: string): Promise<Order | null> {
  try {
    const docRef = doc(db, 'orders', orderId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    return docToOrder(docSnap.data(), docSnap.id);
  } catch (error) {
    console.error('Error fetching order:', error);
    return null;
  }
}

// 사용자별 주문 조회
export async function getOrdersByUser(userId: string): Promise<Order[]> {
  return getOrders({ userId });
}

// ============ 주문 관리 ============

// 주문 생성
export async function createOrder(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> {
  try {
    const docRef = await addDoc(ordersCollection, {
      ...order,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating order:', error);
    return null;
  }
}

// 주문 상태 업데이트
export async function updateOrderStatus(
  orderId: string, 
  status: OrderStatus
): Promise<boolean> {
  try {
    const docRef = doc(db, 'orders', orderId);
    await updateDoc(docRef, {
      orderStatus: status,
      updatedAt: Timestamp.now(),
    });
    return true;
  } catch (error) {
    console.error('Error updating order status:', error);
    return false;
  }
}

// 결제 상태 업데이트
export async function updatePaymentStatus(
  orderId: string, 
  status: PaymentStatus,
  paymentId?: string
): Promise<boolean> {
  try {
    const docRef = doc(db, 'orders', orderId);
    const updateData: any = {
      paymentStatus: status,
      updatedAt: Timestamp.now(),
    };
    
    if (paymentId) {
      updateData.paymentId = paymentId;
    }
    
    await updateDoc(docRef, updateData);
    return true;
  } catch (error) {
    console.error('Error updating payment status:', error);
    return false;
  }
}

// 배송 정보 업데이트 (운송장 번호 등)
export async function updateShippingInfo(
  orderId: string,
  trackingNumber: string,
  carrier?: string
): Promise<boolean> {
  try {
    const docRef = doc(db, 'orders', orderId);
    await updateDoc(docRef, {
      'shippingInfo.trackingNumber': trackingNumber,
      'shippingInfo.carrier': carrier || '대한통운',
      orderStatus: 'SHIPPED',
      updatedAt: Timestamp.now(),
    });
    return true;
  } catch (error) {
    console.error('Error updating shipping info:', error);
    return false;
  }
}

// 주문 정보 업데이트 (범용)
export async function updateOrder(
  orderId: string,
  updateData: Partial<Order>
): Promise<boolean> {
  try {
    const docRef = doc(db, 'orders', orderId);
    const data = {
      ...updateData,
      updatedAt: Timestamp.now(),
    } as any;
    
    // id 필드는 업데이트하지 않음
    delete data.id;
    
    await updateDoc(docRef, data);
    return true;
  } catch (error) {
    console.error('Error updating order:', error);
    return false;
  }
}

// ============ 주문 통계 ============

// 주문 통계 조회 (관리자용)
export async function getOrderStats(): Promise<{
  total: number;
  pending: number;
  paid: number;
  preparing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
}> {
  try {
    const orders = await getOrders();
    
    return {
      total: orders.length,
      pending: orders.filter(o => o.orderStatus === 'PENDING').length,
      paid: orders.filter(o => o.orderStatus === 'PAID').length,
      preparing: orders.filter(o => o.orderStatus === 'PREPARING').length,
      shipped: orders.filter(o => o.orderStatus === 'SHIPPED').length,
      delivered: orders.filter(o => o.orderStatus === 'DELIVERED').length,
      cancelled: orders.filter(o => o.orderStatus === 'CANCELLED').length,
    };
  } catch (error) {
    console.error('Error fetching order stats:', error);
    return {
      total: 0,
      pending: 0,
      paid: 0,
      preparing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };
  }
}
