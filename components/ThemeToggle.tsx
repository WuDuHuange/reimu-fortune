import React from 'react';
import { TimeTheme } from '../hooks/useTimeTheme';

interface ThemeToggleProps {
  themeName: TimeTheme;
  isManualOverride: boolean;
  onCycle: () => void;
  onReset: () => void;
}

const themeIcons: Record<TimeTheme, string> = {
  morning: '🌅',
  day: '☀️',
  evening: '🌇',
  night: '🌙',
};

const themeLabels: Record<TimeTheme, string> = {
  morning: '清晨',
  day: '白昼',
  evening: '黄昏',
  night: '夜晚',
};

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  themeName, 
  isManualOverride, 
  onCycle, 
  onReset 
}) => {
  return (
    <div className="fixed top-4 left-4 z-50 flex items-center gap-2">
      <button
        onClick={onCycle}
        className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm border-2 border-red-300 shadow-lg flex items-center justify-center hover:bg-red-50 transition-all hover:scale-105"
        title={`当前主题: ${themeLabels[themeName]} (点击切换)`}
      >
        <span className="text-lg">{themeIcons[themeName]}</span>
      </button>
      
      {isManualOverride && (
        <button
          onClick={onReset}
          className="text-xs px-2 py-1 rounded bg-white/80 backdrop-blur-sm border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
          title="恢复自动主题"
        >
          自动
        </button>
      )}
    </div>
  );
};
