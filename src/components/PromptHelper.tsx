'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Copy, Wand2, Heart, Flame, Zap, Star } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface PromptTemplate {
  id: string;
  category: string;
  title: string;
  prompt: string;
  icon: any;
  color: string;
}

const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: '1',
    category: '캐릭터',
    title: '귀여운 동물',
    prompt: '귀여운 강아지 캐릭터, 큰 눈, 파스텔 톤, 따뜻한 느낌, 일러스트 스타일',
    icon: Heart,
    color: 'from-pink-500 to-pink-600',
  },
  {
    id: '2',
    category: '캐릭터',
    title: '판타지 생물',
    prompt: '환상적인 유니콘, 무지개 갈기, 별이 빛나는 배경, 마법 같은 분위기',
    icon: Sparkles,
    color: 'from-purple-500 to-purple-600',
  },
  {
    id: '3',
    category: '패턴',
    title: '기하학 패턴',
    prompt: '현대적인 기하학 패턴, 미니멀한 디자인, 블루와 골드 컬러, 반복 패턴',
    icon: Zap,
    color: 'from-blue-500 to-blue-600',
  },
  {
    id: '4',
    category: '패턴',
    title: '꽃 패턴',
    prompt: '우아한 꽃 패턴, 빈티지 스타일, 부드러운 파스텔 컬러, 수채화 느낌',
    icon: Star,
    color: 'from-indigo-500 to-indigo-600',
  },
  {
    id: '5',
    category: '일러스트',
    title: '도시 풍경',
    prompt: '미래 도시 풍경, 네온 불빛, 사이버펑크 스타일, 보라색과 분홍색 톤',
    icon: Flame,
    color: 'from-amber-500 to-amber-600',
  },
  {
    id: '6',
    category: '일러스트',
    title: '자연 풍경',
    prompt: '평화로운 산 풍경, 일몰, 따뜻한 색감, 미니멀 일러스트, 부드러운 그라디언트',
    icon: Heart,
    color: 'from-green-500 to-green-600',
  },
  {
    id: '7',
    category: '추상',
    title: '우주 테마',
    prompt: '우주 공간, 은하수, 별빛, 신비로운 분위기, 파란색과 보라색 그라디언트',
    icon: Sparkles,
    color: 'from-indigo-500 to-purple-600',
  },
  {
    id: '8',
    category: '추상',
    title: '액체 아트',
    prompt: '흐르는 액체 아트, 마블링 효과, 골드와 에메랄드 컬러, 추상 미술',
    icon: Wand2,
    color: 'from-teal-500 to-teal-600',
  },
];

interface PromptHelperProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPrompt: (prompt: string) => void;
}

export default function PromptHelper({ isOpen, onClose, onSelectPrompt }: PromptHelperProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');

  const categories = ['전체', ...Array.from(new Set(PROMPT_TEMPLATES.map(t => t.category)))];

  const filteredTemplates = selectedCategory === '전체'
    ? PROMPT_TEMPLATES
    : PROMPT_TEMPLATES.filter(t => t.category === selectedCategory);

  const handleCopy = (prompt: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(prompt);
    toast.success('프롬프트를 복사했습니다! 📋');
  };

  const handleSelect = (prompt: string) => {
    onSelectPrompt(prompt);
    onClose();
    toast.success('프롬프트가 입력되었습니다! ✨', {
      description: '이제 "생성하기" 버튼을 눌러보세요',
    });
  };

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
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl max-h-[85vh] overflow-auto bg-white rounded-3xl shadow-2xl z-50"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 rounded-t-3xl z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Wand2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-extrabold text-gray-900">프롬프트 도우미</h2>
                    <p className="text-sm text-gray-500">마음에 드는 템플릿을 선택하거나 참고하세요!</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Category Filter */}
              <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                      selectedCategory === cat
                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Templates Grid */}
            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-4">
                {filteredTemplates.map((template, index) => {
                  const IconComponent = template.icon;
                  return (
                    <motion.div
                      key={template.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleSelect(template.prompt)}
                      className="group cursor-pointer bg-gradient-to-br from-gray-50 to-white rounded-2xl p-5 border-2 border-gray-100 hover:border-indigo-300 hover:shadow-lg transition-all"
                    >
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div className={`w-12 h-12 bg-gradient-to-r ${template.color} rounded-xl flex items-center justify-center flex-shrink-0 shadow-md`}>
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                              {template.title}
                            </h3>
                            <button
                              onClick={(e) => handleCopy(template.prompt, e)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-gray-100 rounded-lg"
                            >
                              <Copy className="w-4 h-4 text-gray-400 hover:text-indigo-600" />
                            </button>
                          </div>
                          <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                            {template.prompt}
                          </p>
                          <div className="mt-3 flex items-center gap-2">
                            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                              {template.category}
                            </span>
                            <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                              클릭하여 사용하기
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Empty State */}
              {filteredTemplates.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-400 text-lg">해당 카테고리에 템플릿이 없습니다.</p>
                </div>
              )}
            </div>

            {/* Footer Tip */}
            <div className="sticky bottom-0 bg-gradient-to-br from-indigo-50 to-amber-50 border-t border-indigo-100 px-6 py-4 rounded-b-3xl">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-gray-700">
                  <p className="font-semibold text-indigo-900 mb-1">💡 프로 팁</p>
                  <p>
                    템플릿을 참고하여 자신만의 프롬프트를 만들어보세요!
                    <br />
                    "스타일, 색상, 분위기, 주제"를 구체적으로 설명할수록 더 좋은 결과를 얻을 수 있습니다.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
