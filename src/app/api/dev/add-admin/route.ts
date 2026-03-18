import { NextRequest, NextResponse } from 'next/server';
import { addRole } from '@/lib/users';

/**
 * POST /api/dev/add-admin
 * 개발 모드 전용: 사용자에게 admin 역할 추가
 */
export async function POST(request: NextRequest) {
  // 프로덕션에서는 차단
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { success: false, error: 'This endpoint is only available in development mode' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    await addRole(userId, 'admin');

    return NextResponse.json({
      success: true,
      message: `Admin role added to user: ${userId}`,
    });
  } catch (error: any) {
    console.error('❌ Error adding admin role:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to add admin role',
      },
      { status: 500 }
    );
  }
}
