'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Star, Trash2, Search, MessageSquare, Loader2, Reply } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export default function ReviewAdmin() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/reviews');
      const data = await res.json();
      if (data.success) {
        setReviews(data.reviews);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 이 리뷰를 삭제하시겠습니까?')) return;

    try {
      const res = await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('리뷰가 삭제되었습니다.');
        setReviews(reviews.filter(r => r.id !== id));
      } else {
        toast.error('삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('오류가 발생했습니다.');
    }
  };

  const handleReply = async (reviewId: string) => {
    if (!replyText.trim()) { toast.error('답변 내용을 입력해주세요.'); return; }
    try {
      const token = await user?.getIdToken();
      const res = await fetch('/api/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reviewId, replyContent: replyText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success('답변이 등록되었습니다.');
      setReplyingId(null);
      setReplyText('');
      setReviews(reviews.map(r => r.id === reviewId ? { ...r, replyContent: replyText, replyAt: new Date().toISOString() } : r));
    } catch (err: any) {
      toast.error(err.message || '답변 등록 실패');
    }
  };

  const filteredReviews = reviews.filter(r => 
    r.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.productName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-emerald-500" /></div>;

  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <MessageSquare size={20} className="text-emerald-500" /> 리뷰 관리
        </h2>
        <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
                type="text" 
                placeholder="리뷰 내용, 작성자 검색..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-[11px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
            <tr>
              <th className="px-4 py-3">작성자</th>
              <th className="px-4 py-3">상품명</th>
              <th className="px-4 py-3">평점</th>
              <th className="px-4 py-3 w-1/3">리뷰 내용</th>
              <th className="px-4 py-3">작성일</th>
              <th className="px-4 py-3 text-right">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-sm">
            {filteredReviews.length === 0 ? (
                <tr>
                    <td colSpan={6} className="text-center py-20 text-gray-400">데이터가 없습니다.</td>
                </tr>
            ) : (
                filteredReviews.map((review) => (
                    <tr key={review.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-4 py-4">
                            <span className="font-bold text-gray-900">{review.userName}</span>
                            <p className="text-[10px] text-gray-400 font-mono">{review.userId.slice(0, 8)}...</p>
                        </td>
                        <td className="px-4 py-4 max-w-[150px] truncate font-medium text-gray-600">
                            {review.productName || '상품 정보 없음'}
                        </td>
                        <td className="px-4 py-4">
                            <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} size={12} className={i < review.rating ? 'fill-current' : 'text-gray-200'} />
                            ))}
                            </div>
                        </td>
                        <td className="px-4 py-4">
                            <p className="text-gray-600 line-clamp-2 leading-relaxed">{review.content}</p>
                            {review.images && review.images.length > 0 && (
                                <div className="flex gap-1 mt-2">
                                    {review.images.map((img: string, i: number) => (
                                        <Image key={i} src={img} alt="" width={32} height={32} className="w-8 h-8 rounded border border-gray-100 object-cover" unoptimized />
                                    ))}
                                </div>
                            )}
                        </td>
                        <td className="px-4 py-4 text-xs text-gray-400">
                            {new Date(review.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => { setReplyingId(replyingId === review.id ? null : review.id); setReplyText(review.replyContent || ''); }}
                                className={`p-2 rounded-lg transition-all ${review.replyContent ? 'text-green-500 hover:bg-green-50' : 'text-gray-300 hover:text-blue-500 hover:bg-blue-50'}`}
                                title={review.replyContent ? '답변 수정' : '답변 달기'}
                              >
                                <Reply size={16} />
                              </button>
                              <button
                                onClick={() => handleDelete(review.id)}
                                className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                        </td>
                    </tr>
                    {replyingId === review.id && (
                      <tr>
                        <td colSpan={6} className="px-4 py-3 bg-blue-50/50">
                          <div className="flex gap-2">
                            <textarea
                              value={replyText}
                              onChange={e => setReplyText(e.target.value)}
                              placeholder="답변을 입력하세요..."
                              rows={2}
                              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none"
                            />
                            <div className="flex flex-col gap-1">
                              <button onClick={() => handleReply(review.id)} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700">등록</button>
                              <button onClick={() => setReplyingId(null)} className="px-3 py-1.5 text-gray-500 text-xs">취소</button>
                            </div>
                          </div>
                          {review.replyContent && (
                            <div className="mt-2 text-xs text-green-700 bg-green-50 p-2 rounded">
                              기존 답변: {review.replyContent}
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
