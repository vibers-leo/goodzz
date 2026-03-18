import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, Timestamp } from 'firebase/firestore';

/**
 * GET /api/dev/test-firestore
 * Firestore 연결 테스트
 */
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Development only' }, { status: 403 });
  }

  try {
    console.log('🔍 Testing Firestore connection...');

    // 1. Write test
    const testRef = collection(db, 'test_connection');
    const testDoc = {
      message: 'Test document',
      timestamp: Timestamp.now(),
    };

    console.log('📝 Attempting to write test document...');
    const docRef = await addDoc(testRef, testDoc);
    console.log(`✅ Document written with ID: ${docRef.id}`);

    // 2. Read test
    console.log('📖 Attempting to read documents...');
    const snapshot = await getDocs(collection(db, 'test_connection'));
    console.log(`📊 Found ${snapshot.size} documents`);

    const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json({
      success: true,
      message: 'Firestore connection test completed',
      writeResult: {
        id: docRef.id,
        success: true,
      },
      readResult: {
        count: snapshot.size,
        documents: docs,
      },
    });
  } catch (error: any) {
    console.error('❌ Firestore test failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}
