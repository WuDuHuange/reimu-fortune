import { useState, useEffect, useMemo } from 'react';

export type TimeTheme = 'morning' | 'day' | 'evening' | 'night';

export interface ThemeColors {
  name: string;
  bgGradient: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  cardBg: string;
  headerBg: string;
}

const THEMES: Record<TimeTheme, ThemeColors> = {
  morning: {
    name: '清晨',
    bgGradient: 'from-rose-100 via-pink-50 to-orange-50',
    textPrimary: 'text-rose-900',
    textSecondary: 'text-rose-600',
    accent: 'bg-rose-600',
    cardBg: 'bg-white/95',
    headerBg: 'bg-rose-700',
  },
  day: {
    name: '白昼',
    bgGradient: 'from-red-50 via-orange-50 to-amber-50',
    textPrimary: 'text-red-900',
    textSecondary: 'text-red-600',
    accent: 'bg-red-700',
    cardBg: 'bg-white/95',
    headerBg: 'bg-red-700',
  },
  evening: {
    name: '黄昏',
    bgGradient: 'from-orange-200 via-amber-100 to-rose-200',
    textPrimary: 'text-orange-900',
    textSecondary: 'text-orange-700',
    accent: 'bg-orange-600',
    cardBg: 'bg-white/90',
    headerBg: 'bg-orange-700',
  },
  night: {
    name: '夜晚',
    bgGradient: 'from-slate-900 via-purple-900 to-indigo-900',
    textPrimary: 'text-purple-100',
    textSecondary: 'text-purple-300',
    accent: 'bg-purple-600',
    cardBg: 'bg-slate-800/95',
    headerBg: 'bg-purple-900',
  },
};

const getThemeFromHour = (hour: number): TimeTheme => {
  if (hour >= 5 && hour < 9) return 'morning';
  if (hour >= 9 && hour < 17) return 'day';
  if (hour >= 17 && hour < 20) return 'evening';
  return 'night';
};

export const useTimeTheme = () => {
  const [currentTheme, setCurrentTheme] = useState<TimeTheme>(() => {
    const hour = new Date().getHours();
    return getThemeFromHour(hour);
  });
  const [manualOverride, setManualOverride] = useState<TimeTheme | null>(null);

  // Update theme based on time
  useEffect(() => {
    const updateTheme = () => {
      if (!manualOverride) {
        const hour = new Date().getHours();
        setCurrentTheme(getThemeFromHour(hour));
      }
    };

    // Check every minute
    const interval = setInterval(updateTheme, 60000);
    return () => clearInterval(interval);
  }, [manualOverride]);

  // Get active theme (manual override takes priority)
  const activeTheme = manualOverride || currentTheme;
  const theme = THEMES[activeTheme];

  // Cycle through themes manually
  const cycleTheme = () => {
    const themes: TimeTheme[] = ['morning', 'day', 'evening', 'night'];
    const currentIndex = themes.indexOf(activeTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setManualOverride(themes[nextIndex]);
  };

  // Reset to auto theme
  const resetToAuto = () => {
    setManualOverride(null);
    const hour = new Date().getHours();
    setCurrentTheme(getThemeFromHour(hour));
  };

  return {
    theme,
    themeName: activeTheme,
    isManualOverride: manualOverride !== null,
    cycleTheme,
    resetToAuto,
    allThemes: THEMES,
  };
};
