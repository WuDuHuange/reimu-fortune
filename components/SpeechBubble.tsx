import React, { useState, useEffect } from 'react';

interface SpeechBubbleProps {
  message: string;
  visible: boolean;
  position?: 'top' | 'right' | 'bottom';
  autoHide?: number; // ms to auto-hide, 0 = no auto-hide
  onHide?: () => void;
}

export const SpeechBubble: React.FC<SpeechBubbleProps> = ({
  message,
  visible,
  position = 'right',
  autoHide = 3000,
  onHide,
}) => {
  const [show, setShow] = useState(visible);

  useEffect(() => {
    setShow(visible);
    if (visible && autoHide > 0) {
      const timer = setTimeout(() => {
        setShow(false);
        onHide?.();
      }, autoHide);
      return () => clearTimeout(timer);
    }
  }, [visible, autoHide, onHide]);

  if (!show || !message) return null;

  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'bottom-full left-1/2 -translate-x-1/2 mb-2';
      case 'bottom':
        return 'top-full left-1/2 -translate-x-1/2 mt-2';
      case 'right':
      default:
        return 'left-full top-1/2 -translate-y-1/2 ml-4';
    }
  };

  const getTailClasses = () => {
    switch (position) {
      case 'top':
        return 'top-full left-1/2 -translate-x-1/2 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white';
      case 'bottom':
        return 'bottom-full left-1/2 -translate-x-1/2 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-white';
      case 'right':
      default:
        return 'right-full top-1/2 -translate-y-1/2 border-t-8 border-b-8 border-r-8 border-t-transparent border-b-transparent border-r-white';
    }
  };

  return (
    <div 
      className={`
        absolute ${getPositionClasses()}
        animate-in fade-in slide-in-from-left-2 duration-300
        z-50
      `}
    >
      <div className="relative bg-white rounded-lg px-4 py-2 shadow-lg border border-gray-200 max-w-[200px]">
        <p className="text-sm text-gray-800 whitespace-pre-wrap">{message}</p>
        {/* Speech bubble tail */}
        <div className={`absolute w-0 h-0 ${getTailClasses()}`}></div>
      </div>
    </div>
  );
};

// Idle messages for the orb to say
export const IDLE_MESSAGES = [
  '喂，电费也是要钱的。',
  '今天的茶叶快喝完了……',
  '有空的话去扫扫落叶吧。',
  '（打哈欠）',
  '赛钱赛钱~',
];

export const CLICK_SPAM_MESSAGES = [
  '别戳了，再戳也不会掉金币的！',
  '这里又不是街机厅！',
  '手指不累吗？',
  '……你是在按摩吗？',
];

export const BAD_FORTUNE_MESSAGES = [
  '（默默转过身去）',
  '呃……这个嘛……',
  '不是我的问题哦~',
];

export const GOOD_FORTUNE_MESSAGES = [
  '哼哼，这就是博丽神社的实力！',
  '记得来还愿哦~',
  '今天心情不错~',
];
