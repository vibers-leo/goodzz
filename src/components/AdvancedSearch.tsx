'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Clock, TrendingUp, Sparkles } from 'lucide-react';
import { useSearchHistory } from '@/hooks/useSearchHistory';

interface AdvancedSearchProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (value: string) => void;
  placeholder?: string;
}

export default function AdvancedSearch({
  value,
  onChange,
  onSearch,
  placeholder = '상품 검색 (오타도 OK!)',
}: AdvancedSearchProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { history, addSearch, removeSearch, clearHistory } = useSearchHistory();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = (query: string) => {
    if (query.trim()) {
      addSearch(query);
      onSearch(query);
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(value);
    }
  };

  const handleSelectHistory = (query: string) => {
    onChange(query);
    handleSearch(query);
  };

  const handleClear = () => {
    onChange('');
    onSearch('');
    inputRef.current?.focus();
  };

  // 인기 검색어 (하드코딩, 실제로는 API에서 가져올 수 있음)
  const popularSearches = ['티셔츠', '머그컵', '에코백', '스티커', 'AI 디자인'];

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Search Input */}
      <div
        className={`relative flex items-center bg-white rounded-2xl border-2 transition-all ${
          isFocused
            ? 'border-indigo-500 shadow-lg shadow-indigo-500/20'
            : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <div className="pl-5 flex items-center">
          <Search className={`w-5 h-5 transition-colors ${isFocused ? 'text-indigo-600' : 'text-gray-400'}`} />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            setIsFocused(true);
            setShowSuggestions(true);
          }}
          onBlur={() => {
            setIsFocused(false);
            // 약간의 지연을 두어 클릭 이벤트가 처리되도록 함
            setTimeout(() => setShowSuggestions(false), 200);
          }}
          placeholder={placeholder}
          className="flex-1 px-4 py-4 bg-transparent text-gray-900 placeholder-gray-400 outline-none font-medium"
        />

        <div className="pr-3 flex items-center gap-2">
          {value && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              onClick={handleClear}
              className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-gray-600" />
            </motion.button>
          )}

          <button
            onClick={() => handleSearch(value)}
            className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg"
          >
            검색
          </button>
        </div>
      </div>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestions && (history.length > 0 || popularSearches.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 w-full bg-white rounded-2xl border-2 border-gray-200 shadow-xl overflow-hidden z-50"
          >
            {/* Recent Searches */}
            {history.length > 0 && (
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-bold text-gray-900">최근 검색</span>
                  </div>
                  <button
                    onClick={clearHistory}
                    className="text-xs text-gray-500 hover:text-red-500 font-semibold transition-colors"
                  >
                    전체 삭제
                  </button>
                </div>
                <div className="space-y-1">
                  {history.slice(0, 5).map((query, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between group hover:bg-indigo-50 rounded-lg px-3 py-2 cursor-pointer transition-colors"
                      onClick={() => handleSelectHistory(query)}
                    >
                      <div className="flex items-center gap-3">
                        <Search className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700 group-hover:text-indigo-600 transition-colors">
                          {query}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeSearch(query);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4 text-gray-400 hover:text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Searches */}
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-bold text-gray-900">인기 검색어</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {popularSearches.map((query, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectHistory(query)}
                    className="px-4 py-2 bg-gradient-to-r from-indigo-50 to-amber-50 hover:from-indigo-100 hover:to-amber-100 text-indigo-700 rounded-full text-sm font-semibold transition-all border border-indigo-200"
                  >
                    <span className="mr-1.5">#</span>
                    {query}
                  </button>
                ))}
              </div>
            </div>

            {/* Tip */}
            <div className="px-4 py-3 bg-gradient-to-r from-indigo-50 to-amber-50 border-t border-indigo-100">
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-gray-600">
                  <span className="font-bold text-indigo-700">똑똑한 검색:</span> 오타가 있어도 찾아드립니다! (예: "테샷" → "티셔츠")
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
