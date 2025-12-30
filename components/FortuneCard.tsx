import React from 'react';
import { FortuneResponse } from '../types';

interface FortuneCardProps {
  fortune: FortuneResponse;
  query?: string;
  onReset: () => void;
}

// Get luck level styling
const getLuckStyle = (luck: string) => {
  if (luck.includes('大吉')) {
    return {
      gradient: 'from-yellow-400 via-amber-500 to-yellow-600',
      bgColor: 'bg-gradient-to-br from-yellow-50 to-amber-50',
      borderColor: 'border-yellow-500',
      textColor: 'text-yellow-700',
      glowColor: 'shadow-yellow-300/50',
      emoji: '🌟',
    };
  }
  if (luck.includes('中吉')) {
    return {
      gradient: 'from-emerald-400 via-green-500 to-emerald-600',
      bgColor: 'bg-gradient-to-br from-green-50 to-emerald-50',
      borderColor: 'border-green-500',
      textColor: 'text-green-700',
      glowColor: 'shadow-green-300/50',
      emoji: '🍀',
    };
  }
  if (luck.includes('小吉') || luck === '吉') {
    return {
      gradient: 'from-sky-400 via-blue-500 to-sky-600',
      bgColor: 'bg-gradient-to-br from-blue-50 to-sky-50',
      borderColor: 'border-blue-500',
      textColor: 'text-blue-700',
      glowColor: 'shadow-blue-300/50',
      emoji: '✨',
    };
  }
  if (luck.includes('末吉')) {
    return {
      gradient: 'from-violet-400 via-purple-500 to-violet-600',
      bgColor: 'bg-gradient-to-br from-purple-50 to-violet-50',
      borderColor: 'border-purple-500',
      textColor: 'text-purple-700',
      glowColor: 'shadow-purple-300/50',
      emoji: '🔮',
    };
  }
  if (luck.includes('凶')) {
    return {
      gradient: 'from-slate-400 via-gray-500 to-slate-600',
      bgColor: 'bg-gradient-to-br from-gray-50 to-slate-100',
      borderColor: 'border-gray-400',
      textColor: 'text-gray-600',
      glowColor: 'shadow-gray-300/50',
      emoji: '☁️',
    };
  }
  // Default red theme
  return {
    gradient: 'from-red-400 via-rose-500 to-red-600',
    bgColor: 'bg-gradient-to-br from-red-50 to-rose-50',
    borderColor: 'border-red-500',
    textColor: 'text-red-700',
    glowColor: 'shadow-red-300/50',
    emoji: '🎋',
  };
};

export const FortuneCard: React.FC<FortuneCardProps> = ({ fortune, query, onReset }) => {
  const style = getLuckStyle(fortune.luck);

  return (
    <div className={`relative w-full max-w-sm mx-auto animate-[fadeInUp_0.6s_ease-out]`}>
      {/* Decorative corners - Japanese style */}
      <div className="absolute -top-2 -left-2 w-8 h-8 border-t-4 border-l-4 border-red-800 rounded-tl-lg"></div>
      <div className="absolute -top-2 -right-2 w-8 h-8 border-t-4 border-r-4 border-red-800 rounded-tr-lg"></div>
      <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b-4 border-l-4 border-red-800 rounded-bl-lg"></div>
      <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-4 border-r-4 border-red-800 rounded-br-lg"></div>

      {/* Main Card */}
      <div className={`${style.bgColor} backdrop-blur-sm border-2 ${style.borderColor} rounded-lg shadow-2xl ${style.glowColor} overflow-hidden`}>
        
        {/* Top decorative bar */}
        <div className={`h-2 bg-gradient-to-r ${style.gradient}`}></div>

        {/* Card Content */}
        <div className="p-6">
          {/* Header with emoji and label */}
          <div className="text-center mb-4">
            <span className="text-3xl">{style.emoji}</span>
            <span className="inline-block ml-2 px-3 py-1 bg-red-800 text-white text-xs font-bold rounded-full">
              {query ? '愿望回应' : '今日运势'}
            </span>
          </div>

          {/* Main Luck Display */}
          <div className="relative mb-6">
            <div className={`text-6xl font-bold text-center bg-gradient-to-r ${style.gradient} bg-clip-text text-transparent py-4`}>
              {fortune.luck}
            </div>
            {/* Decorative line */}
            <div className="flex items-center justify-center gap-2 mt-2">
              <div className={`h-px w-12 bg-gradient-to-r from-transparent ${style.borderColor}`}></div>
              <span className="text-red-400">✦</span>
              <div className={`h-px w-12 bg-gradient-to-l from-transparent ${style.borderColor}`}></div>
            </div>
          </div>

          {/* Query display if exists */}
          {query && (
            <div className="mb-4 text-center">
              <p className="text-sm text-gray-500 italic">
                「{query}」
              </p>
            </div>
          )}

          {/* Fortune Comment */}
          <div className="relative mb-4 px-4">
            <div className="absolute top-0 left-0 text-4xl text-red-200 opacity-50">"</div>
            <p className={`${style.textColor} text-lg leading-relaxed text-center pt-4 pb-2`}>
              {fortune.comment}
            </p>
            <div className="absolute bottom-0 right-0 text-4xl text-red-200 opacity-50">"</div>
          </div>

          {/* Lucky Details Grid */}
          {(fortune.luckyItem || fortune.luckyDirection || fortune.luckyColor || fortune.luckyNumber) && (
            <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
              {fortune.luckyItem && (
                <div className="bg-white/60 rounded-lg p-2 text-center">
                  <span className="text-gray-500 text-xs">幸运物</span>
                  <p className={`${style.textColor} font-medium`}>🎁 {fortune.luckyItem}</p>
                </div>
              )}
              {fortune.luckyDirection && (
                <div className="bg-white/60 rounded-lg p-2 text-center">
                  <span className="text-gray-500 text-xs">幸运方位</span>
                  <p className={`${style.textColor} font-medium`}>🧭 {fortune.luckyDirection}</p>
                </div>
              )}
              {fortune.luckyColor && (
                <div className="bg-white/60 rounded-lg p-2 text-center">
                  <span className="text-gray-500 text-xs">幸运色</span>
                  <p className={`${style.textColor} font-medium`}>🎨 {fortune.luckyColor}</p>
                </div>
              )}
              {fortune.luckyNumber && (
                <div className="bg-white/60 rounded-lg p-2 text-center">
                  <span className="text-gray-500 text-xs">幸运数字</span>
                  <p className={`${style.textColor} font-medium`}>🔢 {fortune.luckyNumber}</p>
                </div>
              )}
            </div>
          )}

          {/* Reimu's Comment */}
          {fortune.reimuComment && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-xs text-red-400 font-medium mb-1">灵梦说：</p>
              <p className="text-red-700 text-sm italic">"{fortune.reimuComment}"</p>
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-dashed border-red-200 my-4"></div>

          {/* Action Button */}
          <div className="text-center">
            <button 
              onClick={onReset}
              className={`px-8 py-3 bg-gradient-to-r ${style.gradient} hover:opacity-90 text-white font-bold rounded-full transition-all transform hover:scale-105 shadow-lg`}
            >
              再抽一签
            </button>
          </div>

          {/* Footer note */}
          <p className="text-center text-xs text-gray-400 mt-4">
            — 博丽神社 —
          </p>
        </div>

        {/* Bottom decorative bar */}
        <div className={`h-2 bg-gradient-to-r ${style.gradient}`}></div>
      </div>

      {/* Add custom animation keyframes via style tag */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};
