import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StorePageClient from '@/components/store/StorePageClient';

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function fetchStore(slug: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3300';
    const res = await fetch(`${baseUrl}/api/store/${slug}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    return data.success ? data : null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await fetchStore(slug);
  if (!data) return { title: '스토어를 찾을 수 없습니다' };

  const { vendor } = data;
  const storeName = vendor.businessName;
  const desc = vendor.store?.shortBio || `${storeName}의 브랜드 굿즈 스토어`;

  return {
    title: `${storeName} 스토어`,
    description: desc,
    openGraph: {
      title: `${storeName} | GOODZZ`,
      description: desc,
      images: vendor.store?.banner ? [{ url: vendor.store.banner }] : undefined,
    },
  };
}

export default async function StorePage({ params }: PageProps) {
  const { slug } = await params;
  const data = await fetchStore(slug);
  if (!data) notFound();

  return (
    <>
      <Navbar />
      <StorePageClient vendor={data.vendor} products={data.products} />
      <Footer />
    </>
  );
}
