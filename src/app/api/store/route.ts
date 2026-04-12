import { NextResponse } from 'next/server';
import { getAllVendors } from '@/lib/vendors';

export async function GET() {
  try {
    const vendors = await getAllVendors('approved');

    // 스토어 slug가 있는 벤더만 공개
    const brands = vendors
      .filter((v) => v.store?.slug)
      .map((v) => ({
        id: v.id,
        businessName: v.businessName,
        slug: v.store!.slug,
        logo: v.store?.logo || null,
        banner: v.store?.banner || null,
        shortBio: v.store?.shortBio || null,
        category: v.store?.category || null,
        location: v.store?.location || null,
        themeColor: v.store?.themeColor || '#8b5cf6',
        totalProducts: v.stats?.totalProducts || 0,
      }));

    const response = NextResponse.json({ success: true, brands });
    response.headers.set('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=600');
    return response;
  } catch (error) {
    console.error('Brands API error:', error);
    return NextResponse.json({ error: '브랜드 목록 조회 실패' }, { status: 500 });
  }
}
