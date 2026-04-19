'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { MapPin, Plus, Star, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Address {
  id: string;
  label: string;
  name: string;
  phone: string;
  postalCode: string;
  address: string;
  addressDetail: string;
  isDefault: boolean;
}

export default function AddressesPage() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ label: '', name: '', phone: '', postalCode: '', address: '', addressDetail: '', isDefault: false });
  const [submitting, setSubmitting] = useState(false);

  async function fetchAddresses() {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/addresses', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setAddresses(data.addresses);
    } catch {}
    finally { setLoading(false); }
  }

  useEffect(() => { fetchAddresses(); }, [user]);

  async function handleSubmit() {
    if (!user || !form.name || !form.phone || !form.address) {
      toast.error('수령인, 연락처, 주소는 필수입니다.');
      return;
    }
    setSubmitting(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(editId ? { action: 'update', addressId: editId, ...form } : form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(data.message);
      setShowForm(false);
      setEditId(null);
      setForm({ label: '', name: '', phone: '', postalCode: '', address: '', addressDetail: '', isDefault: false });
      fetchAddresses();
    } catch (err: any) {
      toast.error(err.message || '처리 실패');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!user || !confirm('삭제하시겠습니까?')) return;
    const token = await user.getIdToken();
    const res = await fetch('/api/addresses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ action: 'delete', addressId: id }),
    });
    const data = await res.json();
    if (res.ok) { toast.success(data.message); fetchAddresses(); }
  }

  function startEdit(addr: Address) {
    setForm(addr);
    setEditId(addr.id);
    setShowForm(true);
  }

  if (!user) return <div className="min-h-screen flex items-center justify-center text-gray-500">로그인이 필요합니다.</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="h-16" />
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">배송지 관리</h1>
          <button
            onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ label: '', name: '', phone: '', postalCode: '', address: '', addressDetail: '', isDefault: false }); }}
            className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold hover:bg-purple-700"
          >
            <Plus className="w-4 h-4" /> 새 배송지
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl p-6 mb-6 border border-gray-200 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">라벨</label>
                <input value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} placeholder="집, 회사 등" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">수령인 *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm" />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">연락처 *</label>
              <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="010-0000-0000" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">우편번호</label>
                <input value={form.postalCode} onChange={e => setForm({ ...form, postalCode: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm" />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-gray-500 mb-1 block">주소 *</label>
                <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm" />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">상세주소</label>
              <input value={form.addressDetail} onChange={e => setForm({ ...form, addressDetail: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input type="checkbox" checked={form.isDefault} onChange={e => setForm({ ...form, isDefault: e.target.checked })} className="rounded" />
                기본 배송지로 설정
              </label>
              <div className="flex gap-2">
                <button onClick={() => { setShowForm(false); setEditId(null); }} className="px-4 py-2 text-sm text-gray-500">취소</button>
                <button onClick={handleSubmit} disabled={submitting} className="px-5 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold disabled:opacity-50">
                  {submitting ? '저장 중...' : editId ? '수정' : '저장'}
                </button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-10 text-gray-400">로딩 중...</div>
        ) : addresses.length === 0 ? (
          <div className="text-center py-16">
            <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">저장된 배송지가 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {addresses.map(addr => (
              <div key={addr.id} className="bg-white rounded-xl p-5 border border-gray-100 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {addr.isDefault && (
                      <span className="flex items-center gap-1 text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                        <Star className="w-3 h-3" /> 기본
                      </span>
                    )}
                    {addr.label && <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">{addr.label}</span>}
                    <span className="text-sm font-bold text-gray-800">{addr.name}</span>
                    <span className="text-xs text-gray-400">{addr.phone}</span>
                  </div>
                  <p className="text-sm text-gray-600">{addr.postalCode && `(${addr.postalCode}) `}{addr.address} {addr.addressDetail}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => startEdit(addr)} className="p-2 text-gray-400 hover:text-gray-700"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(addr.id)} className="p-2 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
