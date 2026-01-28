import React, { useState } from 'react';
import { TitleInfo } from '../types';

interface SaisenDisplayProps {
  balance: number;
  title: TitleInfo;
  nextTitle: TitleInfo | null;
  progress: number;
  remaining: number;
  consecutiveDays: number;
  onOpenShop?: () => void;
}

export const SaisenDisplay: React.FC<SaisenDisplayProps> = ({
  balance,
  title,
  nextTitle,
  progress,
  remaining,
  consecutiveDays,
  onOpenShop,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const getTitleColor = () => {
    switch (title.level) {
      case 0: return 'text-gray-500';
      case 1: return 'text-green-600';
      case 2: return 'text-blue-600';
      case 3: return 'text-purple-600';
      case 4: return 'text-amber-500';
      default: return 'text-gray-700';
    }
  };

  const getTitleBadgeColor = () => {
    switch (title.level) {
      case 0: return 'bg-gray-100 border-gray-300';
      case 1: return 'bg-green-50 border-green-300';
      case 2: return 'bg-blue-50 border-blue-300';
      case 3: return 'bg-purple-50 border-purple-300';
      case 4: return 'bg-gradient-to-r from-amber-100 to-yellow-100 border-amber-400';
      default: return 'bg-gray-100 border-gray-300';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-40">
      {/* Main display */}
      <div 
        className={`
          ${getTitleBadgeColor()} border-2 rounded-xl px-4 py-3 shadow-lg 
          backdrop-blur-sm cursor-pointer transition-all hover:scale-105
        `}
        onClick={() => setShowTooltip(!showTooltip)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {/* Title */}
        <div className={`text-xs font-medium ${getTitleColor()} flex items-center gap-1`}>
          {title.level === 4 && <span>👑</span>}
          {title.level === 3 && <span>💰</span>}
          {title.level === 2 && <span>🍵</span>}
          {title.level === 1 && <span>🚶</span>}
          {title.level === 0 && <span>👻</span>}
          <span>{title.name}</span>
        </div>
        
        {/* Balance */}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-amber-600 text-lg">💴</span>
          <span className="font-bold text-xl text-gray-800">
            {balance.toLocaleString()}
          </span>
        </div>

        {/* Consecutive days */}
        {consecutiveDays > 1 && (
          <div className="text-xs text-orange-500 mt-1">
            🔥 连续 {consecutiveDays} 天
          </div>
        )}
      </div>

      {/* Tooltip with details */}
      {showTooltip && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 p-4 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Title info */}
          <div className="mb-3">
            <div className={`font-bold ${getTitleColor()}`}>{title.name}</div>
            <div className="text-xs text-gray-500">{title.description}</div>
          </div>

          {/* Progress to next title */}
          {nextTitle && (
            <div className="mb-3">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>下一称号：{nextTitle.name}</span>
                <span>还需 ¥{remaining.toLocaleString()}</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-500"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            </div>
          )}

          {title.level === 4 && (
            <div className="text-center text-amber-600 text-sm font-medium">
              ✨ 已达最高称号 ✨
            </div>
          )}

          {/* Quick actions */}
          {onOpenShop && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenShop();
              }}
              className="w-full mt-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
            >
              🏪 打开商店
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// Daily bonus notification component
interface DailyBonusNotificationProps {
  amount: number;
  message: string;
  consecutiveDays: number;
  onClose: () => void;
}

export const DailyBonusNotification: React.FC<DailyBonusNotificationProps> = ({
  amount,
  message,
  consecutiveDays,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center animate-in zoom-in duration-300"
        onClick={e => e.stopPropagation()}
      >
        <div className="text-5xl mb-4 animate-bounce">💴</div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">每日香火钱</h3>
        <div className="text-3xl font-bold text-amber-600 mb-3">
          +{amount} 赛钱
        </div>
        <p className="text-gray-600 text-sm mb-4">{message}</p>
        {consecutiveDays > 1 && (
          <div className="text-orange-500 text-sm mb-4">
            🔥 连续签到 {consecutiveDays} 天！
          </div>
        )}
        <button
          onClick={onClose}
          className="w-full py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors"
        >
          收下
        </button>
      </div>
    </div>
  );
};

// Interest notification
interface InterestNotificationProps {
  amount: number;
  message: string;
  onClose: () => void;
}

export const InterestNotification: React.FC<InterestNotificationProps> = ({
  amount,
  message,
  onClose,
}) => {
  return (
    <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-right duration-300">
      <div className="bg-blue-50 border border-blue-200 rounded-xl shadow-lg p-4 max-w-xs">
        <div className="flex items-start gap-3">
          <span className="text-2xl">🦊</span>
          <div>
            <div className="font-medium text-blue-800">理财收益</div>
            <div className="text-blue-600 text-sm">{message}</div>
            <div className="text-blue-700 font-bold mt-1">+{amount} 赛钱</div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};
