import { useState, useEffect, useCallback } from 'react';
import { SaisenData, TitleInfo, TitleLevel, TITLES } from '../types';

const STORAGE_KEY = 'reimu_saisen_data';
const DAILY_SWEEP_LIMIT = 100;
const DAILY_YOUKAI_LIMIT = 3;
const INTEREST_RATE = 0.05;
const INTEREST_THRESHOLD_DAYS = 3;

const getDateKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const getDefaultData = (): SaisenData => ({
  balance: 0,
  totalDonated: 0,
  lastLoginDate: '',
  consecutiveDays: 0,
  lastInterestDate: '',
  noSpendDays: 0,
  dailySweepCount: 0,
  dailyYoukaiCount: 0,
  unlockedItems: [],
});

export interface DailyBonusResult {
  amount: number;
  isNewDay: boolean;
  message: string;
  consecutiveDays: number;
}

export interface InterestResult {
  earned: number;
  message: string;
}

export function useSaisen() {
  const [data, setData] = useState<SaisenData>(getDefaultData);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as SaisenData;
        setData(parsed);
      }
    } catch (e) {
      console.error('Failed to load saisen data', e);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [data, isLoaded]);

  // Get current title based on total donated
  const getCurrentTitle = useCallback((): TitleInfo => {
    for (let i = TITLES.length - 1; i >= 0; i--) {
      if (data.totalDonated >= TITLES[i].minDonation) {
        return TITLES[i];
      }
    }
    return TITLES[0];
  }, [data.totalDonated]);

  // Get next title info
  const getNextTitle = useCallback((): TitleInfo | null => {
    const current = getCurrentTitle();
    const nextLevel = (current.level + 1) as TitleLevel;
    return TITLES.find(t => t.level === nextLevel) || null;
  }, [getCurrentTitle]);

  // Check and apply daily login bonus
  const checkDailyBonus = useCallback((): DailyBonusResult | null => {
    const today = getDateKey();
    if (data.lastLoginDate === today) {
      return null; // Already claimed today
    }

    const amount = Math.floor(Math.random() * 401) + 100; // 100~500
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
    
    const isConsecutive = data.lastLoginDate === yesterdayKey;
    const newConsecutiveDays = isConsecutive ? data.consecutiveDays + 1 : 1;

    let message: string;
    if (amount < 200) {
      message = '切，只有这点吗？连茶叶都买不起。';
    } else if (amount < 400) {
      message = '还算凑合吧，勉强够买点心。';
    } else {
      message = '看来今天会有好事发生呢（指我有钱了）。';
    }

    setData(prev => ({
      ...prev,
      balance: prev.balance + amount,
      lastLoginDate: today,
      consecutiveDays: newConsecutiveDays,
      dailySweepCount: 0, // Reset daily counters
      dailyYoukaiCount: 0,
    }));

    return {
      amount,
      isNewDay: true,
      message,
      consecutiveDays: newConsecutiveDays,
    };
  }, [data.lastLoginDate, data.consecutiveDays]);

  // Check and apply interest (if 3+ days without spending)
  const checkInterest = useCallback((): InterestResult | null => {
    if (data.noSpendDays < INTEREST_THRESHOLD_DAYS || data.balance <= 0) {
      return null;
    }

    const today = getDateKey();
    if (data.lastInterestDate === today) {
      return null; // Already applied today
    }

    const earned = Math.floor(data.balance * INTEREST_RATE);
    if (earned <= 0) return null;

    setData(prev => ({
      ...prev,
      balance: prev.balance + earned,
      lastInterestDate: today,
    }));

    return {
      earned,
      message: `八云蓝帮你理财赚了 ${earned} 赛钱的利息~`,
    };
  }, [data.noSpendDays, data.balance, data.lastInterestDate]);

  // Add saisen (income)
  const addSaisen = useCallback((amount: number, source?: string) => {
    setData(prev => ({
      ...prev,
      balance: prev.balance + amount,
    }));
  }, []);

  // Spend saisen (expense) - returns false if insufficient
  const spendSaisen = useCallback((amount: number): boolean => {
    if (data.balance < amount) {
      return false;
    }
    setData(prev => ({
      ...prev,
      balance: prev.balance - amount,
      totalDonated: prev.totalDonated + amount,
      noSpendDays: 0, // Reset no-spend counter
    }));
    return true;
  }, [data.balance]);

  // Sweep action - returns reward amount or null if limit reached
  const doSweep = useCallback((): { amount: number; isCrit: boolean } | null => {
    if (data.dailySweepCount >= DAILY_SWEEP_LIMIT) {
      return null;
    }

    const isCrit = Math.random() < 0.005; // 0.5% crit chance
    const amount = isCrit ? 1000 : Math.floor(Math.random() * 5) + 1;

    setData(prev => ({
      ...prev,
      balance: prev.balance + amount,
      dailySweepCount: prev.dailySweepCount + 1,
    }));

    return { amount, isCrit };
  }, [data.dailySweepCount]);

  // Youkai extermination - returns result or null if limit reached
  const doYoukaiExtermination = useCallback((success: boolean): { amount: number; success: boolean } | null => {
    if (data.dailyYoukaiCount >= DAILY_YOUKAI_LIMIT) {
      return null;
    }

    const amount = success ? 500 : 0;

    setData(prev => ({
      ...prev,
      balance: prev.balance + amount,
      dailyYoukaiCount: prev.dailyYoukaiCount + 1,
    }));

    return { amount, success };
  }, [data.dailyYoukaiCount]);

  // Unlock an item
  const unlockItem = useCallback((itemId: string) => {
    if (data.unlockedItems.includes(itemId)) return;
    setData(prev => ({
      ...prev,
      unlockedItems: [...prev.unlockedItems, itemId],
    }));
  }, [data.unlockedItems]);

  // Check if item is unlocked
  const isItemUnlocked = useCallback((itemId: string) => {
    return data.unlockedItems.includes(itemId);
  }, [data.unlockedItems]);

  // Check if can afford
  const canAfford = useCallback((amount: number) => {
    return data.balance >= amount;
  }, [data.balance]);

  // Progress to next title
  const getTitleProgress = useCallback(() => {
    const current = getCurrentTitle();
    const next = getNextTitle();
    if (!next) return { current, next: null, progress: 100, remaining: 0 };
    
    const range = next.minDonation - current.minDonation;
    const progress = ((data.totalDonated - current.minDonation) / range) * 100;
    const remaining = next.minDonation - data.totalDonated;
    
    return { current, next, progress: Math.min(progress, 100), remaining };
  }, [getCurrentTitle, getNextTitle, data.totalDonated]);

  return {
    // Data
    balance: data.balance,
    totalDonated: data.totalDonated,
    consecutiveDays: data.consecutiveDays,
    dailySweepCount: data.dailySweepCount,
    dailySweepLimit: DAILY_SWEEP_LIMIT,
    dailyYoukaiCount: data.dailyYoukaiCount,
    dailyYoukaiLimit: DAILY_YOUKAI_LIMIT,
    unlockedItems: data.unlockedItems,
    isLoaded,

    // Title
    getCurrentTitle,
    getNextTitle,
    getTitleProgress,

    // Actions
    checkDailyBonus,
    checkInterest,
    addSaisen,
    spendSaisen,
    doSweep,
    doYoukaiExtermination,
    unlockItem,
    isItemUnlocked,
    canAfford,
  };
}
