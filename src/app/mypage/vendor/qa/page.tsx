'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { MessageCircleQuestion, Check, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface QA {
  id: string;
  productId: string;
  userName: string;
  subject: string;
  question: string;
  answer?: string;
  isSecret: boolean;
  createdAt: string;
}

export default function VendorQAPage() {
  const { user } = useAuth();
  const [qas, setQAs] = useState<QA[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyId, setReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const token = await user.getIdToken();
        const res = await fetch('/api/qa?unanswered=true', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) setQAs(data.qas);
      } catch { toast.error('Q&A 조회 실패'); }
      finally { setLoading(false); }
    })();
  }, [user]);

  async function handleReply(qaId: string) {
    if (!replyText.trim()) { toast.error('답변을 입력해주세요.'); return; }
    setSubmitting(true);
    try {
      const token = await user?.getIdToken();
      const res = await fetch('/api/qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action: 'answer', qaId, answer: replyText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success('답변이 등록되었습니다.');
      setQAs(qas.filter(q => q.id !== qaId));
      setReplyId(null);
      setReplyText('');
    } catch (err: any) {
      toast.error(err.message || '답변 등록 실패');
    } finally {
      setSubmitting(false);
    }
  }

  if (!user) return <div className="min-h-screen flex items-center justify-center text-gray-500">로그인이 필요합니다.</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="h-16" />
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <MessageCircleQuestion className="w-6 h-6 text-purple-600" /> 상품 Q&A 답변
        </h1>
        <p className="text-sm text-gray-400 mb-8">답변 대기 중인 질문 {qas.length}건</p>

        {loading ? (
          <div className="text-center py-16 text-gray-400">로딩 중...</div>
        ) : qas.length === 0 ? (
          <div className="text-center py-16">
            <Check className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <p className="text-gray-400">답변 대기 중인 질문이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {qas.map(qa => (
              <div key={qa.id} className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Clock className="w-3 h-3" /> 대기중
                      </span>
                      <span className="text-xs text-gray-400">{qa.userName}</span>
                      <span className="text-xs text-gray-300">{new Date(qa.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h3 className="font-bold text-gray-800">{qa.subject}</h3>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 whitespace-pre-wrap mb-4">{qa.question}</div>

                {replyId === qa.id ? (
                  <div className="space-y-3">
                    <textarea
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      placeholder="답변을 입력하세요..."
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm resize-none focus:border-purple-400 focus:outline-none"
                    />
                    <div className="flex justify-end gap-2">
                      <button onClick={() => { setReplyId(null); setReplyText(''); }} className="px-4 py-2 text-sm text-gray-500">취소</button>
                      <button
                        onClick={() => handleReply(qa.id)}
                        disabled={submitting}
                        className="px-5 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold hover:bg-purple-700 disabled:opacity-50"
                      >
                        {submitting ? '등록 중...' : '답변 등록'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setReplyId(qa.id)}
                    className="px-4 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm font-bold hover:bg-purple-100 border border-purple-200"
                  >
                    답변 달기
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
