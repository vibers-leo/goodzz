/**
 * 명함 템플릿 정의
 *
 * 각 템플릿은 텍스트와 도형의 위치, 스타일을 정의합니다.
 * 캔버스 크기는 1063x591px (90mm x 50mm @ 300 DPI)
 */

export interface TemplateElement {
  type: 'text' | 'rect' | 'line';
  text?: string;
  placeholder?: string; // 사용자가 채울 필드 (예: '{name}', '{title}')
  left: number;
  top: number;
  width?: number;
  height?: number;
  fontSize?: number;
  fontFamily?: string;
  fill?: string;
  backgroundColor?: string;
  strokeWidth?: number;
  stroke?: string;
  textAlign?: 'left' | 'center' | 'right';
  fontWeight?: string;
}

export interface BusinessCardTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  elements: TemplateElement[];
}

/**
 * 템플릿 1: 클래식
 * 전통적인 중앙 정렬 레이아웃
 */
const classicTemplate: BusinessCardTemplate = {
  id: 'classic',
  name: '클래식',
  description: '전통적인 중앙 정렬 레이아웃',
  thumbnail: '/templates/businesscard-classic.jpg',
  elements: [
    // 배경 테두리
    {
      type: 'rect',
      left: 30,
      top: 30,
      width: 1003,
      height: 531,
      fill: 'transparent',
      stroke: '#1e3a8a',
      strokeWidth: 2,
    },
    // 이름
    {
      type: 'text',
      placeholder: '{name}',
      text: '홍길동',
      left: 531.5,
      top: 200,
      fontSize: 32,
      fontFamily: 'Noto Sans KR, sans-serif',
      fill: '#000000',
      textAlign: 'center',
      fontWeight: 'bold',
    },
    // 직책
    {
      type: 'text',
      placeholder: '{title}',
      text: '대표이사',
      left: 531.5,
      top: 250,
      fontSize: 20,
      fontFamily: 'Noto Sans KR, sans-serif',
      fill: '#4b5563',
      textAlign: 'center',
    },
    // 구분선
    {
      type: 'rect',
      left: 380,
      top: 305,
      width: 303,
      height: 1,
      fill: '#d1d5db',
    },
    // 전화번호
    {
      type: 'text',
      placeholder: '{phone}',
      text: '010-1234-5678',
      left: 531.5,
      top: 340,
      fontSize: 16,
      fontFamily: 'Noto Sans KR, sans-serif',
      fill: '#6b7280',
      textAlign: 'center',
    },
    // 이메일
    {
      type: 'text',
      placeholder: '{email}',
      text: 'hello@example.com',
      left: 531.5,
      top: 375,
      fontSize: 16,
      fontFamily: 'Noto Sans KR, sans-serif',
      fill: '#6b7280',
      textAlign: 'center',
    },
  ],
};

/**
 * 템플릿 2: 모던
 * 비대칭 디자인과 굵은 타이포그래피
 */
const modernTemplate: BusinessCardTemplate = {
  id: 'modern',
  name: '모던',
  description: '비대칭 디자인과 굵은 타이포그래피',
  thumbnail: '/templates/businesscard-modern.jpg',
  elements: [
    // 왼쪽 색상 블록
    {
      type: 'rect',
      left: 0,
      top: 0,
      width: 300,
      height: 591,
      fill: '#1e3a8a',
    },
    // 이름 (왼쪽 블록)
    {
      type: 'text',
      placeholder: '{name}',
      text: '홍길동',
      left: 150,
      top: 250,
      fontSize: 28,
      fontFamily: 'Noto Sans KR, sans-serif',
      fill: '#ffffff',
      textAlign: 'center',
      fontWeight: 'bold',
    },
    // 직책 (왼쪽 블록)
    {
      type: 'text',
      placeholder: '{title}',
      text: '대표이사',
      left: 150,
      top: 295,
      fontSize: 16,
      fontFamily: 'Noto Sans KR, sans-serif',
      fill: '#e5e7eb',
      textAlign: 'center',
    },
    // 회사명 (오른쪽)
    {
      type: 'text',
      placeholder: '{company}',
      text: '(주)마이에이아이프린트샵',
      left: 360,
      top: 150,
      fontSize: 22,
      fontFamily: 'Noto Sans KR, sans-serif',
      fill: '#000000',
      textAlign: 'left',
      fontWeight: 'bold',
    },
    // 전화번호 (오른쪽)
    {
      type: 'text',
      placeholder: '{phone}',
      text: '010-1234-5678',
      left: 360,
      top: 300,
      fontSize: 16,
      fontFamily: 'Noto Sans KR, sans-serif',
      fill: '#374151',
      textAlign: 'left',
    },
    // 이메일 (오른쪽)
    {
      type: 'text',
      placeholder: '{email}',
      text: 'hello@example.com',
      left: 360,
      top: 340,
      fontSize: 16,
      fontFamily: 'Noto Sans KR, sans-serif',
      fill: '#374151',
      textAlign: 'left',
    },
    // 웹사이트 (오른쪽)
    {
      type: 'text',
      placeholder: '{website}',
      text: 'www.example.com',
      left: 360,
      top: 380,
      fontSize: 16,
      fontFamily: 'Noto Sans KR, sans-serif',
      fill: '#374151',
      textAlign: 'left',
    },
  ],
};

/**
 * 템플릿 3: 미니멀
 * 깔끔한 여백과 심플한 디자인
 */
const minimalTemplate: BusinessCardTemplate = {
  id: 'minimal',
  name: '미니멀',
  description: '깔끔한 여백과 심플한 디자인',
  thumbnail: '/templates/businesscard-minimal.jpg',
  elements: [
    // 이름 (왼쪽 상단)
    {
      type: 'text',
      placeholder: '{name}',
      text: '홍길동',
      left: 80,
      top: 100,
      fontSize: 36,
      fontFamily: 'Nanum Myeongjo, serif',
      fill: '#000000',
      textAlign: 'left',
      fontWeight: 'bold',
    },
    // 직책 (이름 아래)
    {
      type: 'text',
      placeholder: '{title}',
      text: '대표이사',
      left: 80,
      top: 150,
      fontSize: 18,
      fontFamily: 'Noto Sans KR, sans-serif',
      fill: '#6b7280',
      textAlign: 'left',
    },
    // 수평선
    {
      type: 'rect',
      left: 80,
      top: 420,
      width: 903,
      height: 1,
      fill: '#e5e7eb',
    },
    // 전화번호 (하단)
    {
      type: 'text',
      placeholder: '{phone}',
      text: '010-1234-5678',
      left: 80,
      top: 455,
      fontSize: 14,
      fontFamily: 'Noto Sans KR, sans-serif',
      fill: '#9ca3af',
      textAlign: 'left',
    },
    // 이메일 (하단)
    {
      type: 'text',
      placeholder: '{email}',
      text: 'hello@example.com',
      left: 80,
      top: 485,
      fontSize: 14,
      fontFamily: 'Noto Sans KR, sans-serif',
      fill: '#9ca3af',
      textAlign: 'left',
    },
    // 회사명 (하단 오른쪽)
    {
      type: 'text',
      placeholder: '{company}',
      text: '(주)마이에이아이프린트샵',
      left: 983,
      top: 470,
      fontSize: 14,
      fontFamily: 'Noto Sans KR, sans-serif',
      fill: '#9ca3af',
      textAlign: 'right',
    },
  ],
};

export const businessCardTemplates: BusinessCardTemplate[] = [
  classicTemplate,
  modernTemplate,
  minimalTemplate,
];

export function getTemplateById(id: string): BusinessCardTemplate | undefined {
  return businessCardTemplates.find((t) => t.id === id);
}
