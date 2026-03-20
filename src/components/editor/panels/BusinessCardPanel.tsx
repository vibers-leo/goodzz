'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Plus, Upload, Image as ImageIcon, Sparkles, QrCode, Palette } from 'lucide-react';
import { useEditorStore } from '@/store/useEditorStore';
import { addTextToCanvas, addImageToCanvas } from '@/lib/fabric/object-helpers';
import { toast } from 'sonner';
import { businessCardTemplates } from '@/lib/templates/businesscard-templates';
import { applyTemplateToCanvas } from '@/lib/templates/apply-template';
import { generateContactQRCode, generateURLQRCode, QR_CODE_TEMPLATES } from '@/lib/qrcode-generator';
import { SOLID_BACKGROUNDS, GRADIENT_BACKGROUNDS, applyBackground } from '@/lib/backgrounds';

/**
 * 명함 정보 빠른 입력 패널
 *
 * 사용자가 명함에 들어갈 정보를 입력하고
 * "추가" 버튼을 누르면 캔버스에 텍스트가 추가됩니다.
 *
 * 기능:
 * - 이름, 직책, 전화번호, 이메일 입력
 * - 폰트 선택 (3가지)
 * - 색상 선택 (5가지)
 * - 주문하기 버튼
 */

const FONTS = [
  { id: 'noto-sans', name: 'Noto Sans KR', fontFamily: 'Noto Sans KR, sans-serif' },
  { id: 'nanum-gothic', name: '나눔고딕', fontFamily: 'Nanum Gothic, sans-serif' },
  { id: 'nanum-myeongjo', name: '나눔명조', fontFamily: 'Nanum Myeongjo, serif' },
  { id: 'black-han-sans', name: 'Black Han Sans', fontFamily: 'Black Han Sans, sans-serif' },
  { id: 'jua', name: '주아체', fontFamily: 'Jua, sans-serif' },
  { id: 'do-hyeon', name: '도현체', fontFamily: 'Do Hyeon, sans-serif' },
  { id: 'noto-serif', name: 'Noto Serif KR', fontFamily: 'Noto Serif KR, serif' },
  { id: 'gowun-batang', name: '고운 바탕', fontFamily: 'Gowun Batang, serif' },
  { id: 'poor-story', name: '가난한 이야기', fontFamily: 'Poor Story, cursive' },
  { id: 'single-day', name: '싱글데이', fontFamily: 'Single Day, cursive' },
];

const COLORS = [
  { id: 'black', name: '블랙', hex: '#000000' },
  { id: 'navy', name: '네이비', hex: '#1e3a8a' },
  { id: 'burgundy', name: '버건디', hex: '#7f1d1d' },
  { id: 'forest', name: '포레스트', hex: '#14532d' },
  { id: 'gold', name: '골드', hex: '#92400e' },
  { id: 'teal', name: '틸', hex: '#0d9488' },
  { id: 'purple', name: '퍼플', hex: '#7c3aed' },
  { id: 'pink', name: '핑크', hex: '#db2777' },
  { id: 'orange', name: '오렌지', hex: '#ea580c' },
  { id: 'blue', name: '블루', hex: '#2563eb' },
  { id: 'gray', name: '그레이', hex: '#4b5563' },
  { id: 'white', name: '화이트', hex: '#ffffff' },
];

// 필드별 기본 폰트 크기
const FIELD_FONT_SIZES = {
  name: 28,
  title: 18,
  phone: 16,
  email: 16,
  company: 20,
  website: 16,
  address: 14,
};

export default function BusinessCardPanel() {
  const router = useRouter();
  const { canvasRef, activeFace, setActiveFace } = useEditorStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    title: '',
    company: '',
    phone: '',
    email: '',
    website: '',
    address: '',
    font: FONTS[0].id,
    color: COLORS[0].id,
  });

  const [textStyle, setTextStyle] = useState({
    bold: false,
    italic: false,
    underline: false,
    charSpacing: 0,
    lineHeight: 1.2,
    shadow: false,
    stroke: false,
    strokeWidth: 1,
  });

  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // 선택된 폰트와 색상 객체 가져오기
  const selectedFont = FONTS.find(f => f.id === formData.font) || FONTS[0];
  const selectedColor = COLORS.find(c => c.id === formData.color) || COLORS[0];

  /**
   * 캔버스에 텍스트 추가
   */
  const handleAddField = async (field: keyof typeof FIELD_FONT_SIZES) => {
    const value = formData[field];
    if (!value || !canvasRef) return;

    try {
      const textOptions: any = {
        text: value,
        fontFamily: selectedFont.fontFamily,
        fontSize: FIELD_FONT_SIZES[field],
        fill: selectedColor.hex,
        fontWeight: textStyle.bold ? 'bold' : 'normal',
        fontStyle: textStyle.italic ? 'italic' : 'normal',
        underline: textStyle.underline,
        charSpacing: textStyle.charSpacing * 10, // Fabric uses 1/1000 em
        lineHeight: textStyle.lineHeight,
      };

      // 그림자 효과
      if (textStyle.shadow) {
        textOptions.shadow = {
          color: 'rgba(0, 0, 0, 0.3)',
          blur: 5,
          offsetX: 2,
          offsetY: 2,
        };
      }

      // 외곽선 효과
      if (textStyle.stroke) {
        textOptions.stroke = selectedColor.hex === '#000000' ? '#ffffff' : '#000000';
        textOptions.strokeWidth = textStyle.strokeWidth;
      }

      await addTextToCanvas(canvasRef, textOptions);

      // 입력 필드 비우기
      setFormData(prev => ({ ...prev, [field]: '' }));
    } catch (error) {
      console.error('Failed to add text:', error);
    }
  };

  /**
   * 이미지/로고 업로드 핸들러
   */
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !canvasRef) return;

    // 파일 타입 검증
    if (!file.type.startsWith('image/')) {
      toast.error('이미지 파일만 업로드 가능합니다.');
      return;
    }

    // 파일 크기 검증 (5MB 제한)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('이미지 크기는 5MB 이하여야 합니다.');
      return;
    }

    setIsUploadingImage(true);

    try {
      // 파일을 Data URL로 변환
      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataURL = e.target?.result as string;

        try {
          // 캔버스에 이미지 추가
          await addImageToCanvas(canvasRef, dataURL, {
            maxWidth: 200,
            maxHeight: 200,
          });
          toast.success('이미지가 추가되었습니다!');
        } catch (error) {
          console.error('Failed to add image:', error);
          toast.error('이미지 추가 중 오류가 발생했습니다.');
        } finally {
          setIsUploadingImage(false);
        }
      };

      reader.onerror = () => {
        toast.error('이미지 읽기 실패');
        setIsUploadingImage(false);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Failed to upload image:', error);
      toast.error('이미지 업로드 실패');
      setIsUploadingImage(false);
    }

    // 파일 input 리셋
    if (event.target) {
      event.target.value = '';
    }
  };

  /**
   * 파일 선택 대화상자 열기
   */
  const handleSelectImage = () => {
    fileInputRef.current?.click();
  };

  /**
   * 드래그 앤 드롭 이벤트 핸들러
   */
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);

    const file = e.dataTransfer.files?.[0];
    if (!file || !canvasRef) return;

    // 파일 타입 검증
    if (!file.type.startsWith('image/')) {
      toast.error('이미지 파일만 업로드 가능합니다.');
      return;
    }

    // 파일 크기 검증 (5MB 제한)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('이미지 크기는 5MB 이하여야 합니다.');
      return;
    }

    setIsUploadingImage(true);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const dataURL = event.target?.result as string;

        try {
          await addImageToCanvas(canvasRef, dataURL, {
            maxWidth: 200,
            maxHeight: 200,
          });
          toast.success('이미지가 추가되었습니다!');
        } catch (error) {
          console.error('Failed to add image:', error);
          toast.error('이미지 추가 중 오류가 발생했습니다.');
        } finally {
          setIsUploadingImage(false);
        }
      };

      reader.onerror = () => {
        toast.error('이미지 읽기 실패');
        setIsUploadingImage(false);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Failed to process dropped file:', error);
      toast.error('이미지 처리 실패');
      setIsUploadingImage(false);
    }
  };

  /**
   * 템플릿 적용 핸들러
   */
  const handleApplyTemplate = async (templateId: string) => {
    if (!canvasRef) {
      toast.error('캔버스가 준비되지 않았습니다.');
      return;
    }

    const template = businessCardTemplates.find((t) => t.id === templateId);
    if (!template) {
      toast.error('템플릿을 찾을 수 없습니다.');
      return;
    }

    try {
      // 현재 입력된 데이터로 템플릿 적용
      const userData = {
        name: formData.name || '홍길동',
        title: formData.title || '대표이사',
        company: formData.company || '(주)마이에이아이프린트샵',
        phone: formData.phone || '010-1234-5678',
        email: formData.email || 'hello@example.com',
        website: formData.website || 'www.example.com',
        address: formData.address || '',
      };

      await applyTemplateToCanvas(canvasRef, template, userData);
      toast.success(`${template.name} 템플릿이 적용되었습니다!`);
    } catch (error) {
      console.error('Failed to apply template:', error);
      toast.error('템플릿 적용 중 오류가 발생했습니다.');
    }
  };

  /**
   * QR 코드 생성 핸들러
   */
  const handleGenerateQRCode = async (type: 'contact' | 'url') => {
    if (!canvasRef) {
      toast.error('캔버스가 준비되지 않았습니다.');
      return;
    }

    try {
      let qrCodeDataURL: string;

      if (type === 'contact') {
        // 연락처 vCard QR 코드
        qrCodeDataURL = await generateContactQRCode(
          {
            name: formData.name,
            title: formData.title,
            company: formData.company,
            phone: formData.phone,
            email: formData.email,
            website: formData.website,
            address: formData.address,
          },
          {
            size: 300,
            foregroundColor: selectedColor.hex,
            errorCorrectionLevel: 'H', // 높은 에러 수정 레벨
          }
        );
        toast.success('연락처 QR 코드가 생성되었습니다!');
      } else {
        // URL QR 코드
        const url = formData.website || 'https://example.com';
        qrCodeDataURL = await generateURLQRCode(url, {
          size: 300,
          foregroundColor: selectedColor.hex,
          errorCorrectionLevel: 'M',
        });
        toast.success('웹사이트 QR 코드가 생성되었습니다!');
      }

      // QR 코드를 캔버스에 추가
      await addImageToCanvas(canvasRef, qrCodeDataURL, {
        maxWidth: 150,
        maxHeight: 150,
      });
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      toast.error('QR 코드 생성에 실패했습니다.');
    }
  };

  /**
   * 배경 적용 핸들러
   */
  const handleApplyBackground = async (backgroundId: string) => {
    if (!canvasRef) {
      toast.error('캔버스가 준비되지 않았습니다.');
      return;
    }

    try {
      const background = [...SOLID_BACKGROUNDS, ...GRADIENT_BACKGROUNDS].find(
        (bg) => bg.id === backgroundId
      );

      if (!background) {
        toast.error('배경을 찾을 수 없습니다.');
        return;
      }

      await applyBackground(canvasRef, background);
      toast.success(`${background.name} 배경이 적용되었습니다!`);
    } catch (error) {
      console.error('Failed to apply background:', error);
      toast.error('배경 적용 중 오류가 발생했습니다.');
    }
  };

  /**
   * 주문하기 버튼 클릭 핸들러
   */
  const handleOrder = async () => {
    // 로그인 확인
    const { user } = await import('@/context/AuthContext').then(m => {
      const AuthContext = m.useAuth;
      return { user: null }; // 임시
    });

    // 로그인 필요
    if (!canvasRef) {
      toast.error('캔버스가 준비되지 않았습니다.');
      return;
    }

    // 캔버스에 객체가 있는지 확인
    const objects = canvasRef.getObjects();
    const hasContent = objects.some((obj: any) =>
      !obj._isBgMockup && !obj._isPrintZone
    );

    if (!hasContent) {
      toast.error('명함에 내용을 추가해주세요!');
      return;
    }

    toast.success('명함 주문 페이지로 이동합니다!');

    // 명함 카테고리의 상품 목록 페이지로 이동
    // 실제로는 디자인을 저장하고 해당 디자인 ID와 함께 주문 페이지로 이동해야 함
    router.push('/shop?category=businesscard');
  };

  return (
    <div className="p-6 space-y-6">
      {/* 헤더 */}
      <div>
        <h2 className="text-lg font-bold mb-2">명함 정보 입력</h2>
        <p className="text-sm text-gray-500">
          정보를 입력하고 캔버스에 추가하세요
        </p>
      </div>

      {/* 앞면/뒷면 전환 */}
      <div className="face-tabs">
        <button
          onClick={() => setActiveFace('front')}
          className={`face-tab ${activeFace === 'front' ? 'active' : ''}`}
        >
          앞면
        </button>
        <button
          onClick={() => setActiveFace('back')}
          className={`face-tab ${activeFace === 'back' ? 'active' : ''}`}
        >
          뒷면
        </button>
      </div>

      {/* 템플릿 선택 */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
        <label className="block text-sm font-medium mb-3 text-gray-700 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-600" />
          빠른 템플릿 적용
        </label>
        <div className="grid grid-cols-3 gap-2">
          {businessCardTemplates.map((template) => (
            <button
              key={template.id}
              onClick={() => handleApplyTemplate(template.id)}
              className="group relative aspect-[9/5] rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-500 transition-all hover:scale-105 bg-white shadow-sm hover:shadow-md"
              title={template.description}
            >
              {/* 템플릿 이름 */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center p-2">
                  <div className="text-xs font-medium text-gray-700 group-hover:text-blue-600">
                    {template.name}
                  </div>
                  <div className="text-[10px] text-gray-400 mt-1 line-clamp-2">
                    {template.description}
                  </div>
                </div>
              </div>

              {/* 호버 오버레이 */}
              <div className="absolute inset-0 bg-blue-600 bg-opacity-0 group-hover:bg-opacity-10 transition-all flex items-center justify-center">
                <span className="text-xs text-blue-600 opacity-0 group-hover:opacity-100 font-medium">
                  적용하기
                </span>
              </div>
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-3">
          💡 템플릿을 선택하면 입력한 정보가 자동으로 배치됩니다
        </p>
      </div>

      <div className="border-t pt-4" />

      {/* 폰트 선택 */}
      <div>
        <label className="input-label">폰트</label>
        <select
          value={formData.font}
          onChange={(e) => setFormData({ ...formData, font: e.target.value })}
          className="input-field"
        >
          {FONTS.map(font => (
            <option key={font.id} value={font.id}>
              {font.name}
            </option>
          ))}
        </select>
      </div>

      {/* 색상 선택 */}
      <div>
        <label className="input-label">색상</label>
        <div className="color-grid">
          {COLORS.map(color => (
            <button
              key={color.id}
              onClick={() => setFormData({ ...formData, color: color.id })}
              className={`color-swatch ${
                formData.color === color.id ? 'selected' : ''
              } ${color.id === 'white' ? 'white-color' : ''}`}
              style={{ backgroundColor: color.hex }}
              title={color.name}
              aria-label={`색상: ${color.name}`}
            />
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          선택된 색상: {selectedColor.name}
        </p>
      </div>

      {/* 텍스트 스타일 */}
      <div>
        <label className="input-label">텍스트 스타일</label>

        {/* 굵기/기울임/밑줄 */}
        <div className="toggle-btn-group mb-3">
          <button
            onClick={() => setTextStyle({ ...textStyle, bold: !textStyle.bold })}
            className={`toggle-btn font-bold ${textStyle.bold ? 'active' : ''}`}
            title="굵게"
          >
            B
          </button>
          <button
            onClick={() => setTextStyle({ ...textStyle, italic: !textStyle.italic })}
            className={`toggle-btn italic ${textStyle.italic ? 'active' : ''}`}
            title="기울임"
          >
            I
          </button>
          <button
            onClick={() => setTextStyle({ ...textStyle, underline: !textStyle.underline })}
            className={`toggle-btn underline ${textStyle.underline ? 'active' : ''}`}
            title="밑줄"
          >
            U
          </button>
          <button
            onClick={() => setTextStyle({ ...textStyle, shadow: !textStyle.shadow })}
            className={`toggle-btn ${textStyle.shadow ? 'active' : ''}`}
            title="그림자"
          >
            S
          </button>
          <button
            onClick={() => setTextStyle({ ...textStyle, stroke: !textStyle.stroke })}
            className={`toggle-btn ${textStyle.stroke ? 'active' : ''}`}
            title="외곽선"
          >
            O
          </button>
        </div>

        {/* 글자 간격 */}
        <div className="mb-3">
          <div className="flex-between mb-1">
            <label className="text-small text-muted">글자 간격</label>
            <span className="text-small text-muted">{textStyle.charSpacing}</span>
          </div>
          <input
            type="range"
            min="-5"
            max="10"
            step="0.5"
            value={textStyle.charSpacing}
            onChange={(e) => setTextStyle({ ...textStyle, charSpacing: parseFloat(e.target.value) })}
            className="range-slider"
          />
        </div>

        {/* 줄 간격 */}
        <div className="mb-3">
          <div className="flex-between mb-1">
            <label className="text-small text-muted">줄 간격</label>
            <span className="text-small text-muted">{textStyle.lineHeight.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min="0.8"
            max="2.0"
            step="0.1"
            value={textStyle.lineHeight}
            onChange={(e) => setTextStyle({ ...textStyle, lineHeight: parseFloat(e.target.value) })}
            className="range-slider"
          />
        </div>

        {/* 외곽선 두께 (stroke 활성화 시에만) */}
        {textStyle.stroke && (
          <div>
            <div className="flex-between mb-1">
              <label className="text-small text-muted">외곽선 두께</label>
              <span className="text-small text-muted">{textStyle.strokeWidth}px</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={textStyle.strokeWidth}
              onChange={(e) => setTextStyle({ ...textStyle, strokeWidth: parseInt(e.target.value) })}
              className="range-slider"
            />
          </div>
        )}
      </div>

      <div className="border-t pt-4" />

      {/* 이름 입력 */}
      <div>
        <label className="input-label">
          이름
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && formData.name) {
                handleAddField('name');
              }
            }}
            placeholder="홍길동"
            className="flex-1 input-field"
          />
          <button
            onClick={() => handleAddField('name')}
            disabled={!formData.name}
            className="btn btn-primary"
            title="캔버스에 추가"
          >
            <Plus className="w-4 h-4" />
            추가
          </button>
        </div>
      </div>

      {/* 직책 입력 */}
      <div>
        <label className="input-label">
          직책
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && formData.title) {
                handleAddField('title');
              }
            }}
            placeholder="대표이사"
            className="flex-1 input-field"
          />
          <button
            onClick={() => handleAddField('title')}
            disabled={!formData.title}
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4" />
            추가
          </button>
        </div>
      </div>

      {/* 회사명 입력 */}
      <div>
        <label className="input-label">
          회사명
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && formData.company) {
                handleAddField('company');
              }
            }}
            placeholder="(주)마이에이아이프린트샵"
            className="flex-1 input-field"
          />
          <button
            onClick={() => handleAddField('company')}
            disabled={!formData.company}
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4" />
            추가
          </button>
        </div>
      </div>

      {/* 전화번호 입력 */}
      <div>
        <label className="input-label">
          전화번호
        </label>
        <div className="flex gap-2">
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && formData.phone) {
                handleAddField('phone');
              }
            }}
            placeholder="010-1234-5678"
            className="flex-1 input-field"
          />
          <button
            onClick={() => handleAddField('phone')}
            disabled={!formData.phone}
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4" />
            추가
          </button>
        </div>
      </div>

      {/* 이메일 입력 */}
      <div>
        <label className="input-label">
          이메일
        </label>
        <div className="flex gap-2">
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && formData.email) {
                handleAddField('email');
              }
            }}
            placeholder="hello@example.com"
            className="flex-1 input-field"
          />
          <button
            onClick={() => handleAddField('email')}
            disabled={!formData.email}
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4" />
            추가
          </button>
        </div>
      </div>

      {/* 웹사이트 입력 */}
      <div>
        <label className="input-label">
          웹사이트
        </label>
        <div className="flex gap-2">
          <input
            type="url"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && formData.website) {
                handleAddField('website');
              }
            }}
            placeholder="www.example.com"
            className="flex-1 input-field"
          />
          <button
            onClick={() => handleAddField('website')}
            disabled={!formData.website}
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4" />
            추가
          </button>
        </div>
      </div>

      {/* 주소 입력 */}
      <div>
        <label className="input-label">
          주소
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && formData.address) {
                handleAddField('address');
              }
            }}
            placeholder="서울시 강남구..."
            className="flex-1 input-field"
          />
          <button
            onClick={() => handleAddField('address')}
            disabled={!formData.address}
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4" />
            추가
          </button>
        </div>
      </div>

      {/* 배경 선택 */}
      <div className="pt-4 border-t">
        <label className="block text-sm font-medium mb-3 text-gray-700 flex items-center gap-2">
          <Palette className="w-4 h-4" />
          배경 색상
        </label>

        <div className="space-y-3">
          {/* 단색 배경 */}
          <div>
            <p className="text-xs text-gray-500 mb-2">단색</p>
            <div className="grid grid-cols-5 gap-2">
              {SOLID_BACKGROUNDS.map((bg) => (
                <button
                  key={bg.id}
                  onClick={() => handleApplyBackground(bg.id)}
                  className="aspect-square rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:scale-110 transition-all shadow-sm hover:shadow-md"
                  style={{ backgroundColor: bg.value as string }}
                  title={bg.name}
                />
              ))}
            </div>
          </div>

          {/* 그라디언트 배경 */}
          <div>
            <p className="text-xs text-gray-500 mb-2">그라디언트</p>
            <div className="grid grid-cols-3 gap-2">
              {GRADIENT_BACKGROUNDS.map((bg: any) => {
                const gradValue = bg.value;
                const colors = gradValue.colorStops.map((cs: any) => cs.color).join(', ');
                return (
                  <button
                    key={bg.id}
                    onClick={() => handleApplyBackground(bg.id)}
                    className="aspect-square rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:scale-110 transition-all shadow-sm hover:shadow-md"
                    style={{
                      background: `linear-gradient(135deg, ${colors})`,
                    }}
                    title={bg.name}
                  />
                );
              })}
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-3">
          💡 배경을 선택하면 명함 전체에 색상이 적용됩니다
        </p>
      </div>

      {/* 이미지/로고 업로드 */}
      <div className="pt-4 border-t">
        <label className="block text-sm font-medium mb-3 text-gray-700">
          <ImageIcon className="w-4 h-4 inline mr-2" />
          이미지/로고 추가
        </label>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />

        {/* Upload button with drag & drop */}
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={handleSelectImage}
          className={`dropzone ${isDraggingOver ? 'dragging' : ''} ${isUploadingImage ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isUploadingImage ? (
            <>
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-sm text-gray-600">업로드 중...</span>
            </>
          ) : isDraggingOver ? (
            <>
              <Upload className="w-6 h-6 text-blue-600" />
              <span className="text-sm text-blue-600 font-medium">
                여기에 이미지를 놓으세요
              </span>
            </>
          ) : (
            <>
              <Upload className="w-6 h-6 text-gray-400" />
              <span className="text-sm text-gray-600">
                클릭하거나 드래그하여 이미지 선택
              </span>
              <span className="text-xs text-gray-400">
                PNG, JPG, SVG (최대 5MB)
              </span>
            </>
          )}
        </div>

        <p className="text-xs text-gray-500 mt-2">
          💡 회사 로고나 명함 배경 이미지를 추가할 수 있습니다
        </p>
      </div>

      {/* QR 코드 생성 */}
      <div className="pt-4 border-t">
        <label className="block text-sm font-medium mb-3 text-gray-700 flex items-center gap-2">
          <QrCode className="w-4 h-4" />
          QR 코드 생성
        </label>

        <div className="grid grid-cols-2 gap-2">
          {/* 연락처 QR 코드 */}
          <button
            onClick={() => handleGenerateQRCode('contact')}
            className="px-4 py-3 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg hover:from-purple-100 hover:to-pink-100 hover:border-purple-400 transition-all flex flex-col items-center gap-2 group"
          >
            <QrCode className="w-5 h-5 text-purple-600 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-medium text-purple-700">
              연락처 QR
            </span>
            <span className="text-[10px] text-purple-500">
              vCard 저장
            </span>
          </button>

          {/* 웹사이트 QR 코드 */}
          <button
            onClick={() => handleGenerateQRCode('url')}
            className="px-4 py-3 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-lg hover:from-blue-100 hover:to-cyan-100 hover:border-blue-400 transition-all flex flex-col items-center gap-2 group"
          >
            <QrCode className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-medium text-blue-700">
              웹사이트 QR
            </span>
            <span className="text-[10px] text-blue-500">
              URL 링크
            </span>
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-3">
          💡 QR 코드를 스캔하면 연락처 저장 또는 웹사이트 방문이 가능합니다
        </p>
      </div>

      {/* 주문하기 버튼 */}
      <div className="pt-4 border-t">
        <button
          onClick={handleOrder}
          className="w-full btn btn-success btn-lg"
        >
          <ShoppingCart className="w-5 h-5" />
          주문하기
        </button>
        <p className="text-xs text-gray-500 mt-2 text-center">
          디자인을 저장한 후 주문할 수 있습니다
        </p>
      </div>
    </div>
  );
}
