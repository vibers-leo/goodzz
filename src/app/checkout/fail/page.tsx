'use client';

import { useSearchParams, useRouter } from 'next/navigation';

export default function CheckoutFailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = searchParams.get('code');
  const message = searchParams.get('message');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8 max-w-md">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">😢</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">결제가 취소되었습니다</h1>
        <p className="text-gray-500 mb-2">{message || '결제 과정에서 문제가 발생했습니다.'}</p>
        {code && <p className="text-xs text-gray-400 mb-6">오류 코드: {code}</p>}
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => router.push('/checkout')}
            className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800"
          >
            다시 결제하기
          </button>
          <button
            onClick={() => router.push('/cart')}
            className="px-6 py-3 bg-white text-gray-700 rounded-xl font-bold border border-gray-200 hover:bg-gray-50"
          >
            장바구니로
          </button>
        </div>
      </div>
    </div>
  );
}
