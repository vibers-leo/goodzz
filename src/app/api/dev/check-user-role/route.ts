import { NextRequest, NextResponse } from 'next/server';
import { getUserRole } from '@/lib/users';

/**
 * GET /api/dev/check-user-role?userId=xxx
 * 사용자 역할 확인
 */
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Development only' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 });
    }

    const roles = await getUserRole(userId);

    return NextResponse.json({
      success: true,
      userId,
      roles,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
