'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Ruler } from 'lucide-react';

interface SizeGuideProps {
  isOpen: boolean;
  onClose: () => void;
  category?: string;
}

const sizeData: Record<string, any> = {
  fashion: {
    title: '의류 사이즈 가이드',
    measurements: ['가슴둘레', '어깨너비', '총기장', '소매길이'],
    sizes: [
      { size: 'XS', chest: '86-89', shoulder: '40', length: '63', sleeve: '56' },
      { size: 'S', chest: '90-93', shoulder: '42', length: '66', sleeve: '58' },
      { size: 'M', chest: '94-97', shoulder: '44', length: '69', sleeve: '60' },
      { size: 'L', chest: '98-101', shoulder: '46', length: '72', sleeve: '62' },
      { size: 'XL', chest: '102-105', shoulder: '48', length: '75', sleeve: '64' },
      { size: '2XL', chest: '106-110', shoulder: '50', length: '78', sleeve: '66' },
    ],
    tips: [
      '측정 방법: 편평한 곳에 제품을 놓고 측정해주세요.',
      '사이즈는 1-2cm 정도 차이가 있을 수 있습니다.',
      '신축성 있는 소재는 착용 시 늘어날 수 있습니다.',
    ],
  },
  print: {
    title: '인쇄물 사이즈 가이드',
    measurements: ['가로', '세로', '용도'],
    sizes: [
      { size: 'A6', width: '105mm', height: '148mm', use: '엽서, 카드' },
      { size: 'A5', width: '148mm', height: '210mm', use: '전단, 리플렛' },
      { size: 'A4', width: '210mm', height: '297mm', use: '일반 문서' },
      { size: 'A3', width: '297mm', height: '420mm', use: '포스터, 도면' },
      { size: 'B5', width: '182mm', height: '257mm', use: '노트, 책자' },
    ],
    tips: [
      '여백: 최소 3mm 이상 여백을 두고 디자인해주세요.',
      '해상도: 인쇄물은 300dpi 이상을 권장합니다.',
      '재단: 재단선 밖 3mm 영역도 디자인에 포함해주세요.',
    ],
  },
  goods: {
    title: '굿즈 사이즈 가이드',
    measurements: ['가로', '세로', '깊이'],
    sizes: [
      { size: '머그컵', width: '80mm', height: '95mm', depth: '-' },
      { size: '텀블러', width: '75mm', height: '200mm', depth: '-' },
      { size: '에코백', width: '350mm', height: '400mm', depth: '120mm' },
      { size: '파우치', width: '200mm', height: '150mm', depth: '50mm' },
      { size: '스티커', width: '50-100mm', height: '50-100mm', depth: '-' },
    ],
    tips: [
      '실물은 이미지와 약간의 색상 차이가 있을 수 있습니다.',
      '커스텀 디자인은 상품 특성에 맞게 배치됩니다.',
      '세탁 가능 제품은 낮은 온도로 손세탁을 권장합니다.',
    ],
  },
};

export default function SizeGuide({ isOpen, onClose, category = 'fashion' }: SizeGuideProps) {
  const guide = sizeData[category] || sizeData.fashion;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl max-h-[90vh] overflow-auto bg-white rounded-3xl shadow-2xl z-50 p-8"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Ruler className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold text-gray-900">{guide.title}</h2>
                  <p className="text-sm text-gray-500">정확한 사이즈 확인으로 만족스러운 쇼핑!</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Size Table */}
            <div className="overflow-x-auto mb-6">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-indigo-50 to-amber-50">
                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-900 rounded-tl-xl">사이즈</th>
                    {guide.measurements.map((measurement: string, idx: number) => (
                      <th key={idx} className={`px-4 py-3 text-center text-sm font-bold text-gray-900 ${idx === guide.measurements.length - 1 ? 'rounded-tr-xl' : ''}`}>
                        {measurement}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {guide.sizes.map((sizeRow: any, idx: number) => (
                    <tr key={idx} className={`border-b border-gray-100 hover:bg-indigo-50/30 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                      <td className="px-4 py-4 font-bold text-indigo-600">{sizeRow.size}</td>
                      {Object.keys(sizeRow).filter(key => key !== 'size').map((key, keyIdx) => (
                        <td key={keyIdx} className="px-4 py-4 text-center text-gray-700 text-sm">
                          {sizeRow[key]}
                          {(category === 'fashion' || category === 'print') && keyIdx < 2 ? 'cm' : ''}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Tips */}
            <div className="bg-gradient-to-br from-amber-50 to-indigo-50 rounded-2xl p-6 border border-indigo-100">
              <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                사이즈 측정 및 주의사항
              </h3>
              <ul className="space-y-2">
                {guide.tips.map((tip: string, idx: number) => (
                  <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-indigo-600 font-bold mt-0.5">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Footer */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={onClose}
                className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-bold rounded-full hover:shadow-lg transition-all hover:scale-105"
              >
                확인
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
