'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { MessageCircleQuestion, Lock, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';

interface QA {
  id: string;
  userId: string;
  userName: string;
  subject: string;
  question: string;
  answer?: string;
  answeredAt?: string;
  isSecret: boolean;
  createdAt: string;
}

export default function ProductQASection({ productId }: { productId: string }) {
  const { user } = useAuth();
  const [qas, setQAs] = useState<QA[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [form, setForm] = useState({ subject: '', question: '', isSecret: false });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/qa?productId=${productId}`)
      .then(r => r.json())
      .then(d => { if (d.success) setQAs(d.qas); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [productId]);

  async function handleSubmit() {
    if (!user) { toast.error('로그인이 필요합니다.'); return; }
    if (!form.subject.trim() || !form.question.trim()) { toast.error('제목과 내용을 입력해주세요.'); return; }

    setSubmitting(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          productId,
          ...form,
          userName: user.displayName || '고객',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success('질문이 등록되었습니다.');
      setForm({ subject: '', question: '', isSecret: false });
      setShowForm(false);
      // 새로고침
      const refreshRes = await fetch(`/api/qa?productId=${productId}`);
      const refreshData = await refreshRes.json();
      if (refreshData.success) setQAs(refreshData.qas);
    } catch (err: any) {
      toast.error(err.message || '질문 등록 실패');
    } finally {
      setSubmitting(false);
    }
  }

  function canView(qa: QA) {
    if (!qa.isSecret) return true;
    return user?.uid === qa.userId;
  }

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <MessageCircleQuestion className="w-5 h-5 text-purple-600" />
          상품 Q&A <span className="text-sm font-normal text-gray-400">({qas.length})</span>
        </h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold hover:bg-purple-700"
        >
          질문하기
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-50 rounded-xl p-5 mb-6 space-y-4">
          <input
            value={form.subject}
            onChange={e => setForm({ ...form, subject: e.target.value })}
            placeholder="제목"
            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm"
          />
          <textarea
            value={form.question}
            onChange={e => setForm({ ...form, question: e.target.value })}
            placeholder="궁금한 점을 작성해주세요"
            rows={4}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm resize-none"
          />
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isSecret}
                onChange={e => setForm({ ...form, isSecret: e.target.checked })}
                className="rounded border-gray-300"
              />
              <Lock className="w-3.5 h-3.5" /> 비밀글
            </label>
            <div className="flex gap-2">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">취소</button>
              <button onClick={handleSubmit} disabled={submitting} className="px-5 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold hover:bg-purple-700 disabled:opacity-50">
                {submitting ? '등록 중...' : '등록'}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-10 text-gray-400 text-sm">로딩 중...</div>
      ) : qas.length === 0 ? (
        <div className="text-center py-10 text-gray-400 text-sm">아직 질문이 없습니다.</div>
      ) : (
        <div className="divide-y divide-gray-100">
          {qas.map(qa => (
            <div key={qa.id} className="py-4">
              <button
                onClick={() => canView(qa) ? setExpandedId(expandedId === qa.id ? null : qa.id) : toast.error('비밀글입니다.')}
                className="w-full text-left flex items-center gap-3"
              >
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${qa.answer ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {qa.answer ? '답변완료' : '대기중'}
                </span>
                {qa.isSecret && <Lock className="w-3.5 h-3.5 text-gray-400" />}
                <span className="flex-1 text-sm font-medium text-gray-800 truncate">
                  {canView(qa) ? qa.subject : '비밀글입니다.'}
                </span>
                <span className="text-xs text-gray-400">{qa.userName}</span>
                <span className="text-xs text-gray-300">{new Date(qa.createdAt).toLocaleDateString()}</span>
                {canView(qa) && (expandedId === qa.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />)}
              </button>

              {expandedId === qa.id && canView(qa) && (
                <div className="mt-3 ml-6 space-y-3">
                  <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap">{qa.question}</div>
                  {qa.answer && (
                    <div className="bg-purple-50 rounded-lg p-4 text-sm text-purple-900 border-l-4 border-purple-400">
                      <p className="text-xs font-bold text-purple-600 mb-1">사장님 답변</p>
                      <p className="whitespace-pre-wrap">{qa.answer}</p>
                      {qa.answeredAt && <p className="text-xs text-purple-400 mt-2">{new Date(qa.answeredAt).toLocaleDateString()}</p>}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
