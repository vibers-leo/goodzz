import QRCode from 'qrcode';

/**
 * QR 코드 생성 옵션
 */
export interface QRCodeOptions {
  /** QR 코드 크기 (픽셀) */
  size?: number;
  /** 배경색 */
  backgroundColor?: string;
  /** 전경색 (QR 코드 색상) */
  foregroundColor?: string;
  /** 에러 수정 레벨 ('L', 'M', 'Q', 'H') */
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  /** 여백 크기 (블록 단위) */
  margin?: number;
}

/**
 * 텍스트로부터 QR 코드 이미지를 생성합니다.
 *
 * @param text QR 코드에 인코딩할 텍스트 (URL, 연락처 등)
 * @param options QR 코드 생성 옵션
 * @returns Data URL 형식의 QR 코드 이미지
 */
export async function generateQRCode(
  text: string,
  options: QRCodeOptions = {}
): Promise<string> {
  const {
    size = 300,
    backgroundColor = '#ffffff',
    foregroundColor = '#000000',
    errorCorrectionLevel = 'M',
    margin = 2,
  } = options;

  try {
    const dataURL = await QRCode.toDataURL(text, {
      width: size,
      color: {
        dark: foregroundColor,
        light: backgroundColor,
      },
      errorCorrectionLevel,
      margin,
    });

    return dataURL;
  } catch (error) {
    console.error('Failed to generate QR code:', error);
    throw new Error('QR 코드 생성에 실패했습니다.');
  }
}

/**
 * 연락처 정보로부터 vCard 형식의 QR 코드를 생성합니다.
 *
 * @param contact 연락처 정보
 * @param options QR 코드 생성 옵션
 * @returns Data URL 형식의 QR 코드 이미지
 */
export async function generateContactQRCode(
  contact: {
    name?: string;
    title?: string;
    company?: string;
    phone?: string;
    email?: string;
    website?: string;
    address?: string;
  },
  options: QRCodeOptions = {}
): Promise<string> {
  // vCard 3.0 형식
  const vcard = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    contact.name && `FN:${contact.name}`,
    contact.title && `TITLE:${contact.title}`,
    contact.company && `ORG:${contact.company}`,
    contact.phone && `TEL:${contact.phone}`,
    contact.email && `EMAIL:${contact.email}`,
    contact.website && `URL:${contact.website}`,
    contact.address && `ADR:;;${contact.address};;;`,
    'END:VCARD',
  ]
    .filter(Boolean)
    .join('\n');

  return generateQRCode(vcard, options);
}

/**
 * URL로부터 QR 코드를 생성합니다.
 *
 * @param url 인코딩할 URL
 * @param options QR 코드 생성 옵션
 * @returns Data URL 형식의 QR 코드 이미지
 */
export async function generateURLQRCode(
  url: string,
  options: QRCodeOptions = {}
): Promise<string> {
  // URL 유효성 검사
  try {
    new URL(url);
  } catch {
    // http/https 프로토콜이 없으면 추가
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
  }

  return generateQRCode(url, options);
}

/**
 * 미리 정의된 QR 코드 템플릿
 */
export const QR_CODE_TEMPLATES = {
  /** 기본 (흑백) */
  default: {
    backgroundColor: '#ffffff',
    foregroundColor: '#000000',
  },
  /** 네이비 */
  navy: {
    backgroundColor: '#ffffff',
    foregroundColor: '#1e3a8a',
  },
  /** 버건디 */
  burgundy: {
    backgroundColor: '#ffffff',
    foregroundColor: '#7f1d1d',
  },
  /** 포레스트 */
  forest: {
    backgroundColor: '#ffffff',
    foregroundColor: '#14532d',
  },
};
