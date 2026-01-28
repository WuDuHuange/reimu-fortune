import React, { useMemo } from 'react';
import { FortuneRecord } from '../hooks/useFortuneHistory';

interface Badge {
  id: string;
  title: string;
  desc: string;
  achieved: boolean;
}

const normalizeLuck = (luck: string) => luck.replace(/\s+/g, '');

const checkAllLuck = (history: FortuneRecord[]) => {
  const target = ['大吉', '中吉', '小吉', '吉', '末吉', '凶', '大凶'];
  const set = new Set(history.map(h => normalizeLuck(h.fortune.luck)));
  return target.every(t => set.has(t));
};

const checkStreak7 = (history: FortuneRecord[]) => {
  if (history.length === 0) return false;
  const days = Array.from(new Set(history.map(h => {
    const d = new Date(h.timestamp);
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  })));
  days.sort();
  let best = 1;
  for (let i = 1; i < days.length; i++) {
    const prev = new Date(days[i - 1]);
    const cur = new Date(days[i]);
    const diff = (cur.getTime() - prev.getTime()) / 86400000;
    if (diff === 1) {
      best += 1;
      if (best >= 7) return true;
    } else {
      best = 1;
    }
  }
  return false;
};

const checkNightOwl = (history: FortuneRecord[]) => history.some(h => {
  const hour = new Date(h.timestamp).getHours();
  return hour < 5;
});

const checkBug = (history: FortuneRecord[]) => history.some(h => h.fortune.fortuneType === 'bug' || h.fortune.luck.includes('BUG'));

export const Achievements: React.FC<{ history: FortuneRecord[] }> = ({ history }) => {
  const badges: Badge[] = useMemo(() => [
    {
      id: 'all-luck',
      title: '七签集齐',
      desc: '集齐全部运势等级',
      achieved: checkAllLuck(history)
    },
    {
      id: 'streak-7',
      title: '七日签到',
      desc: '连续 7 天每日一签',
      achieved: checkStreak7(history)
    },
    {
      id: 'night-owl',
      title: '夜雀之友',
      desc: '在凌晨/深夜抽签',
      achieved: checkNightOwl(history)
    },
    {
      id: 'bug-sign',
      title: 'BUG签目击',
      desc: '抽到一次 BUG 签',
      achieved: checkBug(history)
    }
  ], [history]);

  return (
    <div className="fixed left-4 bottom-40 z-40 bg-white/90 backdrop-blur-md border border-red-100 rounded-lg shadow-lg p-3 w-60">
      <h3 className="text-sm font-bold text-red-700 mb-2">成就徽章</h3>
      <div className="space-y-2">
        {badges.map(badge => (
          <div key={badge.id} className={`flex items-start gap-2 text-sm p-2 rounded ${badge.achieved ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-100'}`}>
            <span>{badge.achieved ? '🏅' : '🔒'}</span>
            <div>
              <p className={`font-semibold ${badge.achieved ? 'text-green-700' : 'text-gray-700'}`}>{badge.title}</p>
              <p className="text-xs text-gray-500">{badge.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
