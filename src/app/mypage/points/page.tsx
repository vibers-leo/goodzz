'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Coins, ArrowUp, ArrowDown, Gift } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface PointTx {
  id: string;
  amount: number;
  balance: number;
  type: string;
  reason: string;
  createdAt: string;
}

export default function PointsPage() {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState<PointTx[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const token = await user.getIdToken();
        const res = await fetch('/api/points', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setBalance(data.balance);
          setHistory(data.history);
        }
      } catch { toast.error('포인트 조회 실패'); }
      finally { setLoading(false); }
    })();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">로그인이 필요합니다.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="h-16" />
      <div className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-8">포인트</h1>

        {/* 잔액 카드 */}
        <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl p-8 text-white mb-8">
          <p className="text-purple-200 text-sm mb-1">사용 가능 포인트</p>
          <div className="flex items-end gap-2">
            <Coins className="w-8 h-8" />
            <span className="text-4xl font-bold">{balance.toLocaleString()}</span>
            <span className="text-xl mb-0.5">P</span>
          </div>
          <div className="mt-6 flex gap-3">
            <div className="bg-white/10 rounded-xl px-4 py-3 flex-1 text-center">
              <p className="text-xs text-purple-200">구매 적립</p>
              <p className="text-sm font-bold">결제금액 1%</p>
            </div>
            <div className="bg-white/10 rounded-xl px-4 py-3 flex-1 text-center">
              <p className="text-xs text-purple-200">리뷰 작성</p>
              <p className="text-sm font-bold">500P~1,000P</p>
            </div>
          </div>
        </div>

        {/* 내역 */}
        <h2 className="text-lg font-bold mb-4">적립/사용 내역</h2>
        {loading ? (
          <div className="text-center py-10 text-gray-400">로딩 중...</div>
        ) : history.length === 0 ? (
          <div className="text-center py-16">
            <Gift className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">아직 포인트 내역이 없습니다.</p>
            <Link href="/shop" className="text-purple-600 text-sm font-bold mt-2 inline-block">쇼핑하러 가기</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map(tx => (
              <div key={tx.id} className="bg-white rounded-xl p-4 flex items-center justify-between border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.amount > 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                    {tx.amount > 0 ? <ArrowUp className="w-4 h-4 text-green-600" /> : <ArrowDown className="w-4 h-4 text-red-500" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{tx.reason}</p>
                    <p className="text-xs text-gray-400">{new Date(tx.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()}P
                  </p>
                  <p className="text-xs text-gray-400">잔액 {tx.balance.toLocaleString()}P</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
