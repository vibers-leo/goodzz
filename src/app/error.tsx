'use client';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto px-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">문제가 발생했습니다</h2>
        <p className="text-gray-600 mb-8">{error.message || '페이지를 불러오는 중 오류가 발생했습니다.'}</p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors"
        >
          다시 시도
        </button>
      </div>
    </div>
  );
}
