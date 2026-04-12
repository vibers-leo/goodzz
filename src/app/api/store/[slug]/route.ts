import { NextRequest, NextResponse } from 'next/server';
import { getVendorBySlug } from '@/lib/vendors';
import { getProducts } from '@/lib/products';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const vendor = await getVendorBySlug(slug);

    if (!vendor) {
      return NextResponse.json({ error: '스토어를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 해당 벤더의 활성 상품 조회
    const allProducts = await getProducts({ isActive: true });
    const products = allProducts.filter((p) => p.vendorId === vendor.id);

    // 민감정보 제거
    const safeVendor = {
      id: vendor.id,
      businessName: vendor.businessName,
      store: vendor.store || {},
      stats: {
        totalProducts: products.length,
        totalOrders: vendor.stats?.totalOrders || 0,
      },
    };

    const response = NextResponse.json({ success: true, vendor: safeVendor, products });
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    return response;
  } catch (error) {
    console.error('Store API error:', error);
    return NextResponse.json({ error: '스토어 조회 실패' }, { status: 500 });
  }
}
