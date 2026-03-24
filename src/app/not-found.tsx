import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50 text-center p-6">
      <h1 className="text-9xl font-black mb-4 opacity-10 text-gray-900">404</h1>
      <h2 className="text-3xl font-bold text-gray-900 mb-4">페이지를 찾을 수 없습니다</h2>
      <p className="text-gray-600 mb-10 max-w-md">
        요청하신 페이지를 찾을 수 없습니다. <br />
        입력하신 주소가 정확한지 다시 한번 확인해 주세요.
      </p>
      <div className="flex gap-4">
        <Link
          href="/"
          className="px-8 py-3 bg-emerald-600 text-white hover:bg-emerald-700 transition rounded-xl text-sm font-medium"
        >
          홈으로 돌아가기
        </Link>
        <Link
          href="/shop"
          className="px-8 py-3 border border-gray-300 hover:bg-gray-100 transition rounded-xl text-sm font-medium"
        >
          상품 둘러보기
        </Link>
      </div>
    </div>
  );
}
