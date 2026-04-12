'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Store, ArrowLeft, Save, Loader2, ExternalLink, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import ImageUploader from '@/components/vendor/ImageUploader';

const CATEGORIES = [
  '카페', '베이커리', '플라워샵', '레스토랑', '의류', '주얼리',
  '핸드메이드', '디자인스튜디오', '팝업스토어', '기타',
];

const THEME_COLORS = [
  '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
  '#ec4899', '#6366f1', '#14b8a6', '#f97316', '#000000',
];

export default function StoreProfilePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [vendorId, setVendorId] = useState('');
  const [form, setForm] = useState({
    slug: '',
    shortBio: '',
    description: '',
    category: '',
    location: '',
    instagram: '',
    website: '',
    themeColor: '#8b5cf6',
    logo: [] as string[],
    banner: [] as string[],
  });

  useEffect(() => {
    if (!user) return;
    fetch('/api/vendors')
      .then((r) => r.json())
      .then((data) => {
        const vendor = data.vendors?.find((v: any) => v.ownerId === user.uid);
        if (!vendor) {
          toast.error('판매자 정보를 찾을 수 없습니다.');
          router.push('/mypage/vendor');
          return;
        }
        setVendorId(vendor.id);
        const s = vendor.store || {};
        setForm({
          slug: s.slug || '',
          shortBio: s.shortBio || '',
          description: s.description || '',
          category: s.category || '',
          location: s.location || '',
          instagram: s.instagram || '',
          website: s.website || '',
          themeColor: s.themeColor || '#8b5cf6',
          logo: s.logo ? [s.logo] : [],
          banner: s.banner ? [s.banner] : [],
        });
      })
      .catch(() => toast.error('정보 로딩 실패'))
      .finally(() => setLoading(false));
  }, [user, router]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();

    if (!form.slug) {
      toast.error('스토어 URL은 필수입니다.');
      return;
    }

    // slug 유효성 체크
    if (!/^[a-z0-9-]+$/.test(form.slug)) {
      toast.error('스토어 URL은 영문 소문자, 숫자, 하이픈(-)만 사용 가능합니다.');
      return;
    }

    setSaving(true);
    try {
      const token = await user?.getIdToken();
      const res = await fetch(`/api/vendors/${vendorId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          store: {
            slug: form.slug,
            shortBio: form.shortBio,
            description: form.description,
            category: form.category,
            location: form.location,
            instagram: form.instagram,
            website: form.website,
            themeColor: form.themeColor,
            logo: form.logo[0] || null,
            banner: form.banner[0] || null,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '저장 실패');

      toast.success('스토어 프로필이 저장되었습니다!');
    } catch (err: any) {
      toast.error(err.message || '저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl border-2 border-gray-200 flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> 돌아가기
            </button>
            {form.slug && (
              <a
                href={`/store/${form.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-600 font-semibold rounded-xl border-2 border-purple-200 flex items-center gap-2"
              >
                <Eye className="w-4 h-4" /> 스토어 미리보기
              </a>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Store className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900">스토어 프로필 설정</h1>
              <p className="text-gray-600">나만의 브랜드 스토어를 꾸며보세요</p>
            </div>
          </div>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSave}
          className="space-y-8"
        >
          {/* 기본 정보 */}
          <section className="bg-white rounded-2xl p-6 border border-gray-200 space-y-5">
            <h3 className="font-bold text-lg">기본 정보</h3>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                스토어 URL <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm">goodzz.co.kr/store/</span>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none"
                  placeholder="my-brand"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">영문 소문자, 숫자, 하이픈만 사용 가능합니다.</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">한줄 소개</label>
              <input
                type="text"
                value={form.shortBio}
                onChange={(e) => setForm({ ...form, shortBio: e.target.value })}
                maxLength={60}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none"
                placeholder="커피와 디자인이 만나는 공간"
              />
              <p className="text-xs text-gray-400 text-right mt-1">{form.shortBio.length}/60</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">브랜드 소개</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none resize-none"
                placeholder="브랜드 스토리를 들려주세요..."
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">업종</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none"
                >
                  <option value="">선택하세요</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">지역</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none"
                  placeholder="서울 성수동"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Instagram</label>
                <input
                  type="text"
                  value={form.instagram}
                  onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none"
                  placeholder="@my_brand"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">웹사이트</label>
                <input
                  type="url"
                  value={form.website}
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none"
                  placeholder="https://mybrand.com"
                />
              </div>
            </div>
          </section>

          {/* 비주얼 */}
          <section className="bg-white rounded-2xl p-6 border border-gray-200 space-y-5">
            <h3 className="font-bold text-lg">비주얼</h3>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">브랜드 컬러</label>
              <div className="flex gap-3 flex-wrap">
                {THEME_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setForm({ ...form, themeColor: color })}
                    className={`w-10 h-10 rounded-full border-3 transition-transform ${
                      form.themeColor === color ? 'scale-110 ring-2 ring-offset-2 ring-gray-400' : 'border-gray-200 hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">로고 이미지</label>
              <ImageUploader images={form.logo} onChange={(imgs) => setForm({ ...form, logo: imgs })} max={1} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">배너 이미지</label>
              <ImageUploader images={form.banner} onChange={(imgs) => setForm({ ...form, banner: imgs })} max={1} />
              <p className="text-xs text-gray-500 mt-1">권장: 1200×400px 이상, 가로로 긴 이미지</p>
            </div>
          </section>

          {/* 미리보기 */}
          {form.slug && (
            <section className="bg-white rounded-2xl p-6 border border-gray-200">
              <h3 className="font-bold text-lg mb-4">미리보기</h3>
              <div className="rounded-xl overflow-hidden border border-gray-200">
                {/* 미니 배너 */}
                <div className="h-24 relative" style={{ background: `linear-gradient(135deg, ${form.themeColor}44, ${form.themeColor}11)` }}>
                  {form.banner[0] && (
                    <img src={form.banner[0]} alt="" className="w-full h-full object-cover opacity-80" />
                  )}
                </div>
                <div className="p-4 flex items-center gap-3 -mt-6">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold border-2 border-white shadow-sm overflow-hidden"
                    style={{ backgroundColor: form.themeColor }}
                  >
                    {form.logo[0] ? (
                      <img src={form.logo[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      'B'
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-sm">브랜드명</p>
                    {form.shortBio && <p className="text-xs text-gray-500">{form.shortBio}</p>}
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-3">
                스토어 URL: <span className="font-mono text-purple-600">goodzz.co.kr/store/{form.slug}</span>
              </p>
            </section>
          )}

          {/* 저장 */}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-500 hover:to-orange-400 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {saving ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> 저장 중...</>
            ) : (
              <><Save className="w-5 h-5" /> 스토어 프로필 저장</>
            )}
          </button>
        </motion.form>
      </div>
    </div>
  );
}
