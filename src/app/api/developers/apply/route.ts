import { NextRequest, NextResponse } from 'next/server';
import { createApiPartner } from '@/lib/api-auth';
import { ApiError } from '@/lib/api-error-handler';
import { validateEmail } from '@/lib/validation';

/**
 * POST /api/developers/apply
 *
 * API 파트너 신청 (API 키 발급)
 *
 * Request Body:
 * - name: string (required) - 회사/개인 이름
 * - email: string (required) - 이메일
 * - purpose: string (optional) - 사용 목적
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, purpose } = body;

    // 유효성 검증
    if (!name || name.trim().length === 0) {
      return ApiError.validation('이름은 필수입니다.');
    }

    if (!email || !validateEmail(email)) {
      return ApiError.validation('올바른 이메일 형식이 아닙니다.');
    }

    // API 파트너 생성 (기본 tier: free)
    const { partnerId, apiKey } = await createApiPartner({
      name,
      email,
      tier: 'free',
    });

    // TODO: 환영 이메일 발송
    // await sendWelcomeEmail(email, apiKey);

    return NextResponse.json({
      success: true,
      message: 'API 키가 발급되었습니다. 이메일을 확인해주세요.',
      data: {
        partnerId,
        apiKey,
        tier: 'free',
        rateLimit: {
          requestsPerHour: 100,
          requestsPerDay: 1000,
        },
        documentation: {
          quickStart: '/developers/docs/quickstart',
          apiReference: '/developers/docs/api',
          examples: '/developers/docs/examples',
        },
      },
    });
  } catch (error) {
    console.error('Developer apply error:', error);
    return ApiError.internal('API 키 발급 중 오류가 발생했습니다.', error);
  }
}
