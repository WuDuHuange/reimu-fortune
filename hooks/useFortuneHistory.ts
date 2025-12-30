import { useState, useEffect, useCallback } from 'react';
import { FortuneResponse } from '../types';

export interface FortuneRecord {
  id: string;
  fortune: FortuneResponse;
  query: string;
  timestamp: number;
}

const STORAGE_KEY = 'reimu_fortune_history';
const MAX_RECORDS = 30;

export const useFortuneHistory = () => {
  const [history, setHistory] = useState<FortuneRecord[]>([]);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load fortune history:', error);
    }
  }, []);

  // Save to localStorage whenever history changes
  const saveToStorage = useCallback((records: FortuneRecord[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (error) {
      console.error('Failed to save fortune history:', error);
    }
  }, []);

  // Add a new fortune record
  const addRecord = useCallback((fortune: FortuneResponse, query: string) => {
    const newRecord: FortuneRecord = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      fortune,
      query,
      timestamp: Date.now(),
    };

    setHistory(prev => {
      const updated = [newRecord, ...prev].slice(0, MAX_RECORDS);
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  // Clear all history
  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Remove a single record
  const removeRecord = useCallback((id: string) => {
    setHistory(prev => {
      const updated = prev.filter(record => record.id !== id);
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  return {
    history,
    addRecord,
    clearHistory,
    removeRecord,
  };
};
