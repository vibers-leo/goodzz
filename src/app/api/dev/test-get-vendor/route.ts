import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

/**
 * GET /api/dev/test-get-vendor?id=xxx
 * getVendor 함수 테스트
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

    console.log(`🔍 Testing getVendor with ID: ${vendorId}`);

    const vendorRef = doc(db, 'vendors', vendorId);
    console.log(`📄 Document reference created`);

    const vendorDoc = await getDoc(vendorRef);
    console.log(`📖 getDoc completed. Exists: ${vendorDoc.exists()}`);

    if (!vendorDoc.exists()) {
      return NextResponse.json({
        success: false,
        exists: false,
        message: 'Document does not exist',
      });
    }

    const data = vendorDoc.data();
    console.log(`✅ Document data retrieved`);

    return NextResponse.json({
      success: true,
      exists: true,
      vendor: { id: vendorDoc.id, ...data },
    });
  } catch (error: any) {
    console.error('❌ Error in test-get-vendor:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}
