import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

/**
 * GET /api/dev/check-vendors
 * vendors 컬렉션 직접 조회
 */
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Development only' }, { status: 403 });
  }

  try {
    console.log('🔍 Checking vendors collection...');

    const vendorsRef = collection(db, 'vendors');
    const snapshot = await getDocs(vendorsRef);

    console.log(`📊 Found ${snapshot.size} vendors`);

    const vendors = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      success: true,
      count: snapshot.size,
      vendors,
    });
  } catch (error: any) {
    console.error('❌ Error checking vendors:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
