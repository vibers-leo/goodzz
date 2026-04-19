'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StorePageClient from '@/components/store/StorePageClient';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function StorePage() {
  const { slug } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/store/${slug}`)
      .then(r => r.json())
      .then(d => { if (d.success) setData(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-2xl font-bold text-gray-800">스토어를 찾을 수 없습니다</p>
        <Link href="/brands" className="text-purple-600 font-bold hover:underline">브랜드 목록으로</Link>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <StorePageClient vendor={data.vendor} products={data.products} />
      <Footer />
    </>
  );
}
