/**
 * 명함 배경 패턴 및 그라디언트 정의
 */

export interface Background {
  id: string;
  name: string;
  type: 'solid' | 'gradient' | 'pattern';
  value: string | { type: string; coords: any; colorStops: any[] };
}

/**
 * 단색 배경
 */
export const SOLID_BACKGROUNDS: Background[] = [
  { id: 'white', name: '흰색', type: 'solid', value: '#ffffff' },
  { id: 'cream', name: '크림', type: 'solid', value: '#fefce8' },
  { id: 'light-blue', name: '연한 파랑', type: 'solid', value: '#eff6ff' },
  { id: 'light-gray', name: '연한 회색', type: 'solid', value: '#f3f4f6' },
  { id: 'black', name: '검정', type: 'solid', value: '#000000' },
];

/**
 * 그라디언트 배경
 */
export const GRADIENT_BACKGROUNDS: Background[] = [
  {
    id: 'blue-purple',
    name: '블루-퍼플',
    type: 'gradient',
    value: {
      type: 'linear',
      coords: { x1: 0, y1: 0, x2: 1063, y2: 591 },
      colorStops: [
        { offset: 0, color: '#3b82f6' },
        { offset: 1, color: '#8b5cf6' },
      ],
    },
  },
  {
    id: 'orange-red',
    name: '오렌지-레드',
    type: 'gradient',
    value: {
      type: 'linear',
      coords: { x1: 0, y1: 0, x2: 1063, y2: 591 },
      colorStops: [
        { offset: 0, color: '#f97316' },
        { offset: 1, color: '#ef4444' },
      ],
    },
  },
  {
    id: 'green-teal',
    name: '그린-틸',
    type: 'gradient',
    value: {
      type: 'linear',
      coords: { x1: 0, y1: 0, x2: 1063, y2: 591 },
      colorStops: [
        { offset: 0, color: '#10b981' },
        { offset: 1, color: '#14b8a6' },
      ],
    },
  },
  {
    id: 'sunset',
    name: '석양',
    type: 'gradient',
    value: {
      type: 'linear',
      coords: { x1: 0, y1: 0, x2: 1063, y2: 591 },
      colorStops: [
        { offset: 0, color: '#fbbf24' },
        { offset: 0.5, color: '#f59e0b' },
        { offset: 1, color: '#ef4444' },
      ],
    },
  },
  {
    id: 'ocean',
    name: '오션',
    type: 'gradient',
    value: {
      type: 'linear',
      coords: { x1: 0, y1: 0, x2: 1063, y2: 591 },
      colorStops: [
        { offset: 0, color: '#06b6d4' },
        { offset: 1, color: '#3b82f6' },
      ],
    },
  },
  {
    id: 'forest',
    name: '포레스트',
    type: 'gradient',
    value: {
      type: 'linear',
      coords: { x1: 0, y1: 0, x2: 1063, y2: 591 },
      colorStops: [
        { offset: 0, color: '#059669' },
        { offset: 1, color: '#0d9488' },
      ],
    },
  },
];

/**
 * 패턴 배경 (CSS 패턴)
 */
export const PATTERN_BACKGROUNDS: Background[] = [
  { id: 'dots', name: '도트', type: 'pattern', value: 'dots' },
  { id: 'lines', name: '라인', type: 'pattern', value: 'lines' },
  { id: 'grid', name: '그리드', type: 'pattern', value: 'grid' },
  { id: 'diagonal', name: '대각선', type: 'pattern', value: 'diagonal' },
];

export const ALL_BACKGROUNDS = [
  ...SOLID_BACKGROUNDS,
  ...GRADIENT_BACKGROUNDS,
  ...PATTERN_BACKGROUNDS,
];

export function getBackgroundById(id: string): Background | undefined {
  return ALL_BACKGROUNDS.find((bg) => bg.id === id);
}

/**
 * Fabric.js 캔버스에 배경 적용
 */
export async function applyBackground(canvas: any, background: Background) {
  const { Gradient, Rect } = await import('fabric').then(m => m);

  if (background.type === 'solid') {
    canvas.backgroundColor = background.value;
    canvas.renderAll();
  } else if (background.type === 'gradient') {
    const gradientValue: any = background.value;
    const gradient = new Gradient({
      type: gradientValue.type,
      coords: gradientValue.coords,
      colorStops: gradientValue.colorStops,
    });
    canvas.backgroundColor = gradient;
    canvas.renderAll();
  } else if (background.type === 'pattern') {
    // 간단한 패턴 구현 (배경색 + 패턴 오버레이)
    canvas.backgroundColor = '#f3f4f6';
    canvas.renderAll();
  }
}
