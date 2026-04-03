// GOODZZ API 클라이언트
// 백엔드: goodzz.co.kr (Firestore)

import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "https://goodzz.co.kr/api";

interface ApiOptions {
  method?: string;
  body?: Record<string, unknown>;
}

export async function apiFetch<T>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const { method = "GET", body } = options;
  const token = await SecureStore.getItemAsync('userToken');

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (response.status === 401) {
    await SecureStore.deleteItemAsync('userToken');
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    throw new Error(`API 오류: ${response.status}`);
  }

  return response.json();
}

// 굿즈 목록 조회
export async function fetchGoods(category?: string) {
  const params = category ? `?category=${category}` : "";
  return apiFetch(`/goods${params}`);
}

// 굿즈 상세 조회
export async function fetchGoodsDetail(id: string) {
  return apiFetch(`/goods/${id}`);
}

// 장바구니 조회
export async function fetchCart() {
  return apiFetch("/cart");
}

// 주문 목록 조회
export async function fetchOrders() {
  return apiFetch("/orders");
}
