'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Search, 
  Filter, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Loader2,
  Image as ImageIcon,
  User,
  Package,
  Eye
} from 'lucide-react';
import Image from 'next/image';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { DesignDraft } from '@/lib/designs';
import { toast } from 'sonner';

export default function DesignManager() {
  const [designs, setDesigns] = useState<DesignDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'draft' | 'submitted' | 'approved'>('all');
  const [selectedDesign, setSelectedDesign] = useState<DesignDraft | null>(null);

  const fetchDesigns = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'designs'), orderBy('updatedAt', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as DesignDraft[];
      setDesigns(data);
    } catch (error) {
      console.error('Error fetching designs:', error);
      toast.error('디자인 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDesigns();
  }, []);

  const updateStatus = async (id: string, status: DesignDraft['status']) => {
    try {
      const docRef = doc(db, 'designs', id);
      await updateDoc(docRef, { status, updatedAt: new Date().toISOString() });
      setDesigns(designs.map(d => d.id === id ? { ...d, status } : d));
      toast.success('디자인 상태가 변경되었습니다.');
    } catch (error) {
      toast.error('상태 변경에 실패했습니다.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      await deleteDoc(doc(db, 'designs', id));
      setDesigns(designs.filter(d => d.id !== id));
      toast.success('삭제되었습니다.');
    } catch (error) {
      toast.error('삭제에 실패했습니다.');
    }
  };

  const filteredDesigns = designs.filter(d => {
    const matchesSearch = 
      d.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.userId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || d.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">AI 디자인 관리</h2>
          <p className="text-sm text-gray-500 mt-1">사용자들이 생성한 AI 디자인 시안을 검토하고 관리합니다.</p>
        </div>
        <div className="flex gap-4">
           <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
             <input 
               type="text" 
               placeholder="상품명 또는 유저ID 검색"
               className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
           </div>
           <select 
             className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
             value={filter}
             onChange={(e) => setFilter(e.target.value as any)}
           >
             <option value="all">모든 상태</option>
             <option value="draft">저장됨(Draft)</option>
             <option value="submitted">주문요청</option>
             <option value="approved">승인됨</option>
           </select>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
             <Loader2 className="animate-spin text-emerald-500" size={32} />
             <p className="text-sm text-gray-500">데이터를 불러오는 중...</p>
          </div>
        ) : filteredDesigns.length === 0 ? (
          <div className="py-20 text-center text-gray-400 text-sm">
             저장된 디자인이 없습니다.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
             {filteredDesigns.map(design => (
               <div key={design.id} className="group flex flex-col bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all">
                  <div className="aspect-square relative bg-white">
                     <Image src={design.previewUrl} alt="Design" fill className="object-contain" unoptimized />
                     <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button 
                          onClick={() => setSelectedDesign(design)}
                          className="p-2 bg-white rounded-lg hover:bg-emerald-500 hover:text-white transition-all text-gray-700"
                        >
                          <Eye size={18} />
                        </button>
                        <a 
                          href={`/editor/${design.productId}?draft=${design.id}`}
                          target="_blank"
                          className="p-2 bg-white rounded-lg hover:bg-blue-500 hover:text-white transition-all text-gray-700"
                        >
                          <ExternalLink size={18} />
                        </a>
                        <button 
                          onClick={() => handleDelete(design.id)}
                          className="p-2 bg-white rounded-lg hover:bg-red-500 hover:text-white transition-all text-gray-700"
                        >
                          <Trash2 size={18} />
                        </button>
                     </div>
                     <div className="absolute top-3 left-3">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm ${
                          design.status === 'approved' ? 'bg-emerald-500 text-white' :
                          design.status === 'submitted' ? 'bg-blue-500 text-white' : 'bg-gray-500 text-white'
                        }`}>
                          {design.status === 'approved' ? '승인됨' : 
                           design.status === 'submitted' ? '제출됨' : '저장됨'}
                        </span>
                     </div>
                  </div>
                  
                  <div className="p-4 flex-1 flex flex-col">
                     <div className="flex items-start justify-between mb-2">
                        <div className="min-w-0">
                           <h3 className="text-sm font-bold text-gray-900 truncate">{design.productName}</h3>
                           <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-1">
                              <User size={10} /> <span className="truncate max-w-[100px]">{design.userId}</span>
                           </div>
                        </div>
                        <Sparkles size={14} className="text-emerald-500 shrink-0" />
                     </div>

                     <div className="mt-auto pt-3 border-t flex flex-col gap-2">
                        <div className="flex justify-between items-center text-[10px] text-gray-400">
                           <div className="flex items-center gap-1">
                              <Clock size={10} /> {new Date(design.updatedAt).toLocaleDateString()}
                           </div>
                           <Package size={10} />
                        </div>
                        <div className="flex gap-2">
                           <button 
                             onClick={() => updateStatus(design.id, 'approved')}
                             disabled={design.status === 'approved'}
                             className="flex-1 py-2 bg-white border border-emerald-100 text-emerald-600 rounded-lg text-xs font-bold hover:bg-emerald-50 disabled:opacity-50"
                           >
                             승인
                           </button>
                           <button 
                             onClick={() => updateStatus(design.id, 'submitted')}
                             disabled={design.status === 'submitted'}
                             className="flex-1 py-2 bg-white border border-blue-100 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-50 disabled:opacity-50"
                           >
                             요청
                           </button>
                        </div>
                     </div>
                  </div>
               </div>
             ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedDesign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedDesign(null)}>
           <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b flex justify-between items-center">
                 <h3 className="font-bold text-lg">시안 상세 검토</h3>
                 <button onClick={() => setSelectedDesign(null)} className="text-2xl">&times;</button>
              </div>
              <div className="p-8 flex gap-8">
                 <div className="w-1/2 aspect-square bg-gray-50 rounded-2xl overflow-hidden border relative">
                    <Image src={selectedDesign.previewUrl} alt="Design" fill className="object-contain" unoptimized />
                 </div>
                 <div className="w-1/2 space-y-6">
                    <div>
                       <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">상품 정보</label>
                       <p className="font-bold text-lg">{selectedDesign.productName}</p>
                       <p className="text-xs text-gray-500">ID: {selectedDesign.productId}</p>
                    </div>
                    <div>
                       <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">사용자 ID</label>
                       <p className="text-sm font-mono bg-gray-50 p-2 rounded-lg">{selectedDesign.userId}</p>
                    </div>
                    <div>
                       <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">편집 데이터</label>
                       <pre className="text-[10px] bg-gray-900 text-emerald-400 p-3 rounded-lg overflow-x-auto">
                          {JSON.stringify(selectedDesign.designData, null, 2)}
                       </pre>
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button 
                           onClick={() => updateStatus(selectedDesign.id, 'approved')}
                           className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all"
                        >
                           승인하기
                        </button>
                        <button 
                           onClick={() => setSelectedDesign(null)}
                           className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200 transition-all"
                        >
                           닫기
                        </button>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
