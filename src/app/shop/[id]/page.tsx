
'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import ProductDetailClient from '@/components/ProductDetailClient';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/products/${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.success && data.product) {
          setProduct(data.product);
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-4">
        <p className="text-2xl font-bold text-gray-800">상품을 찾을 수 없습니다</p>
        <Link href="/shop" className="text-purple-600 font-bold hover:underline">쇼핑 목록으로</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12">
        <div className="text-sm text-gray-400 mb-8">
          <Link href="/shop" className="hover:text-gray-600">Shop</Link> &gt; {product.category} &gt; <span className="text-black font-medium">{product.name}</span>
        </div>
        <ProductDetailClient product={product} />
      </div>
    </div>
  );
}
