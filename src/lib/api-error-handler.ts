import { NextResponse } from 'next/server';

export enum ErrorCode {
  // Authentication & Authorization
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INVALID_TOKEN = 'INVALID_TOKEN',

  // Validation
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  MISSING_FIELD = 'MISSING_FIELD',
  INVALID_FORMAT = 'INVALID_FORMAT',

  // Resources
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  RESOURCE_CONFLICT = 'RESOURCE_CONFLICT',

  // Business Logic
  INSUFFICIENT_STOCK = 'INSUFFICIENT_STOCK',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  SETTLEMENT_FAILED = 'SETTLEMENT_FAILED',
  VENDOR_NOT_APPROVED = 'VENDOR_NOT_APPROVED',

  // System
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_API_ERROR = 'EXTERNAL_API_ERROR',
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  code: ErrorCode;
  details?: any;
  timestamp: string;
}

/**
 * API 에러 응답을 생성합니다.
 */
export function errorResponse(
  message: string,
  code: ErrorCode,
  status: number = 500,
  details?: any
): NextResponse<ApiErrorResponse> {
  const response: ApiErrorResponse = {
    success: false,
    error: message,
    code,
    timestamp: new Date().toISOString(),
  };

  if (details) {
    response.details = details;
  }

  // 에러 로깅
  logError(code, message, details);

  return NextResponse.json(response, { status });
}

/**
 * 에러를 로깅합니다.
 */
function logError(code: ErrorCode, message: string, details?: any) {
  const logLevel = getLogLevel(code);
  const logMessage = `[${code}] ${message}`;

  switch (logLevel) {
    case 'error':
      console.error(logMessage, details || '');
      break;
    case 'warn':
      console.warn(logMessage, details || '');
      break;
    case 'info':
      console.info(logMessage, details || '');
      break;
  }

  // TODO: 프로덕션에서는 외부 로깅 서비스로 전송
  // - Sentry, Datadog, CloudWatch 등
  // - 중요 에러는 관리자에게 알림 (Slack, Email)
}

/**
 * 에러 코드에 따른 로그 레벨을 반환합니다.
 */
function getLogLevel(code: ErrorCode): 'error' | 'warn' | 'info' {
  switch (code) {
    // 시스템 에러 - error
    case ErrorCode.INTERNAL_ERROR:
    case ErrorCode.DATABASE_ERROR:
    case ErrorCode.EXTERNAL_API_ERROR:
    case ErrorCode.SETTLEMENT_FAILED:
      return 'error';

    // 비즈니스 로직 에러 - warn
    case ErrorCode.INSUFFICIENT_STOCK:
    case ErrorCode.PAYMENT_FAILED:
    case ErrorCode.VENDOR_NOT_APPROVED:
    case ErrorCode.RESOURCE_CONFLICT:
      return 'warn';

    // 클라이언트 에러 - info
    case ErrorCode.UNAUTHORIZED:
    case ErrorCode.FORBIDDEN:
    case ErrorCode.VALIDATION_ERROR:
    case ErrorCode.NOT_FOUND:
    default:
      return 'info';
  }
}

/**
 * 일반적인 에러 응답 헬퍼 함수들
 */
export const ApiError = {
  unauthorized: (message = '인증이 필요합니다.') =>
    errorResponse(message, ErrorCode.UNAUTHORIZED, 401),

  forbidden: (message = '접근 권한이 없습니다.') =>
    errorResponse(message, ErrorCode.FORBIDDEN, 403),

  notFound: (resource: string = '리소스') =>
    errorResponse(`${resource}를 찾을 수 없습니다.`, ErrorCode.NOT_FOUND, 404),

  validation: (message: string, details?: any) =>
    errorResponse(message, ErrorCode.VALIDATION_ERROR, 400, details),

  conflict: (message: string) =>
    errorResponse(message, ErrorCode.RESOURCE_CONFLICT, 409),

  internal: (message = '서버 오류가 발생했습니다.', details?: any) =>
    errorResponse(message, ErrorCode.INTERNAL_ERROR, 500, details),

  database: (operation: string, details?: any) =>
    errorResponse(
      `데이터베이스 ${operation} 중 오류가 발생했습니다.`,
      ErrorCode.DATABASE_ERROR,
      500,
      details
    ),

  externalApi: (service: string, details?: any) =>
    errorResponse(
      `외부 서비스(${service}) 연동 중 오류가 발생했습니다.`,
      ErrorCode.EXTERNAL_API_ERROR,
      502,
      details
    ),
};

/**
 * Try-catch 블록을 표준화합니다.
 */
export async function withErrorHandler<T>(
  fn: () => Promise<T>,
  context: string
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    console.error(`Error in ${context}:`, error);
    throw error;
  }
}
