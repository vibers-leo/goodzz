import type { BusinessCardTemplate, TemplateElement } from './businesscard-templates';

// Fabric.js 동적 import
let fabricModule: typeof import('fabric') | null = null;

async function getFabric() {
  if (!fabricModule) {
    fabricModule = await import('fabric');
  }
  return fabricModule;
}

/**
 * 명함 템플릿을 캔버스에 적용합니다.
 *
 * @param canvas Fabric.js 캔버스 인스턴스
 * @param template 적용할 템플릿
 * @param data 사용자 데이터 (이름, 직책 등)
 */
export async function applyTemplateToCanvas(
  canvas: any,
  template: BusinessCardTemplate,
  data?: Record<string, string>
) {
  const { Textbox, Rect } = await getFabric();

  // 기존 객체 모두 제거 (배경/프린트존 제외)
  const objects = canvas.getObjects();
  objects.forEach((obj: any) => {
    if (!obj._isBgMockup && !obj._isPrintZone) {
      canvas.remove(obj);
    }
  });

  // 템플릿 요소 추가
  for (const element of template.elements) {
    if (element.type === 'text') {
      // 텍스트 객체
      let text = element.text || '';

      // 플레이스홀더 치환
      if (element.placeholder && data) {
        const key = element.placeholder.replace(/[{}]/g, '');
        if (data[key]) {
          text = data[key];
        }
      }

      const textbox = new Textbox(text, {
        left: element.left,
        top: element.top,
        fontSize: element.fontSize || 16,
        fontFamily: element.fontFamily || 'Noto Sans KR, sans-serif',
        fill: element.fill || '#000000',
        textAlign: element.textAlign || 'left',
        fontWeight: element.fontWeight || 'normal',
        width: element.width || 200,
      });

      canvas.add(textbox);
    } else if (element.type === 'rect') {
      // 사각형 객체
      const rect = new Rect({
        left: element.left,
        top: element.top,
        width: element.width || 100,
        height: element.height || 100,
        fill: element.fill || element.backgroundColor || 'transparent',
        stroke: element.stroke,
        strokeWidth: element.strokeWidth || 0,
        selectable: element.fill !== 'transparent', // 투명한 테두리는 선택 불가
      });

      canvas.add(rect);
      canvas.sendToBack(rect); // 배경으로 보내기
    }
  }

  canvas.renderAll();
}

/**
 * 캔버스 전체를 초기화합니다.
 */
export function clearCanvas(canvas: any) {
  const objects = canvas.getObjects();
  objects.forEach((obj: any) => {
    if (!obj._isBgMockup && !obj._isPrintZone) {
      canvas.remove(obj);
    }
  });
  canvas.renderAll();
}
