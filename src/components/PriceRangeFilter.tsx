'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, SlidersHorizontal } from 'lucide-react';

interface PriceRangeFilterProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
}

export default function PriceRangeFilter({ min, max, value, onChange }: PriceRangeFilterProps) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = Number(e.target.value);
    const newValue: [number, number] = [Math.min(newMin, localValue[1]), localValue[1]];
    setLocalValue(newValue);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = Number(e.target.value);
    const newValue: [number, number] = [localValue[0], Math.max(newMax, localValue[0])];
    setLocalValue(newValue);
  };

  const handleMouseUp = () => {
    onChange(localValue);
  };

  const percentage = (val: number) => ((val - min) / (max - min)) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-5 border-2 border-gray-100 shadow-sm"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-amber-500 rounded-xl flex items-center justify-center">
          <SlidersHorizontal className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">가격 범위</h3>
      </div>

      {/* Range Slider */}
      <div className="relative h-2 mb-6">
        {/* Track */}
        <div className="absolute w-full h-2 bg-gray-200 rounded-full" />

        {/* Active Range */}
        <div
          className="absolute h-2 bg-gradient-to-r from-indigo-600 to-amber-500 rounded-full"
          style={{
            left: `${percentage(localValue[0])}%`,
            right: `${100 - percentage(localValue[1])}%`,
          }}
        />

        {/* Min Slider */}
        <input
          type="range"
          min={min}
          max={max}
          step={1000}
          value={localValue[0]}
          onChange={handleMinChange}
          onMouseUp={handleMouseUp}
          onTouchEnd={handleMouseUp}
          className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-600 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-indigo-600 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:shadow-lg [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white"
        />

        {/* Max Slider */}
        <input
          type="range"
          min={min}
          max={max}
          step={1000}
          value={localValue[1]}
          onChange={handleMaxChange}
          onMouseUp={handleMouseUp}
          onTouchEnd={handleMouseUp}
          className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-amber-500 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:shadow-lg [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white"
        />
      </div>

      {/* Price Display */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl px-4 py-3 border border-indigo-200">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-indigo-600" />
            <div>
              <p className="text-xs text-indigo-600 font-semibold mb-0.5">최소</p>
              <p className="text-lg font-bold text-indigo-900">
                {localValue[0].toLocaleString()}원
              </p>
            </div>
          </div>
        </div>

        <div className="text-gray-400 font-bold">~</div>

        <div className="flex-1 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl px-4 py-3 border border-amber-200">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-amber-600" />
            <div>
              <p className="text-xs text-amber-600 font-semibold mb-0.5">최대</p>
              <p className="text-lg font-bold text-amber-900">
                {localValue[1].toLocaleString()}원
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Presets */}
      <div className="mt-4 flex gap-2 flex-wrap">
        {[
          { label: '전체', range: [min, max] as [number, number] },
          { label: '~1만원', range: [min, 10000] as [number, number] },
          { label: '1~3만원', range: [10000, 30000] as [number, number] },
          { label: '3만원~', range: [30000, max] as [number, number] },
        ].map((preset) => (
          <button
            key={preset.label}
            onClick={() => {
              setLocalValue(preset.range);
              onChange(preset.range);
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              localValue[0] === preset.range[0] && localValue[1] === preset.range[1]
                ? 'bg-gradient-to-r from-indigo-600 to-amber-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
