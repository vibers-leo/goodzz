import { NextRequest, NextResponse } from 'next/server';
import { getVendor } from '@/lib/vendors';

/**
 * GET /api/dev/test-lib-vendor?id=xxx
 * lib/vendors의 getVendor 함수 직접 테스트
 */
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Development only' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('id');

    if (!vendorId) {
      return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
    }

    console.log(`🔍 Testing lib/vendors getVendor with ID: ${vendorId}`);

    const vendor = await getVendor(vendorId);

    if (!vendor) {
      return NextResponse.json({
        success: false,
        found: false,
        message: 'getVendor returned null',
      });
    }

    return NextResponse.json({
      success: true,
      found: true,
      vendor,
    });
  } catch (error: any) {
    console.error('❌ Error testing lib getVendor:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}
