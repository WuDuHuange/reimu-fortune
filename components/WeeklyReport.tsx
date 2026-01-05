import React, { useMemo } from 'react';
import { FortuneRecord } from '../hooks/useFortuneHistory';

interface WeeklyReportProps {
  open: boolean;
  history: FortuneRecord[];
  onClose: () => void;
}

const format = (ts: number) => {
  const d = new Date(ts);
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
};

export const WeeklyReport: React.FC<WeeklyReportProps> = ({ open, history, onClose }) => {
  const recent = useMemo(() => history.slice(0, 7), [history]);

  const reportText = useMemo(() => {
    return recent.map(r => {
      return `${format(r.timestamp)} | ${r.fortune.luck} | ${r.fortune.comment}`;
    }).join('\n');
  }, [recent]);

  const copyReport = async () => {
    try {
      await navigator.clipboard.writeText(reportText || '本周还没有抽签');
      alert('周报已复制');
    } catch (e) {
      alert('复制失败，请手动选择复制');
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose}></div>
      <div className="relative bg-white rounded-lg shadow-2xl w-11/12 max-w-2xl p-6 z-50">
        <h3 className="text-lg font-bold text-red-700 mb-3">本周运势报告</h3>
        {recent.length === 0 ? (
          <p className="text-sm text-gray-500">本周还没有记录，去抽一签吧！</p>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto text-sm">
            {recent.map(r => (
              <div key={r.id} className="p-2 rounded border border-red-100 bg-red-50/70">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{format(r.timestamp)}</span>
                  <span className="font-semibold text-red-700">{r.fortune.luck}</span>
                </div>
                <p className="text-gray-700 mt-1">{r.fortune.comment}</p>
              </div>
            ))}
          </div>
        )}
        <div className="mt-4 flex gap-3 justify-end">
          <button onClick={copyReport} className="px-4 py-2 rounded bg-orange-600 text-white text-sm hover:bg-orange-500">复制周报</button>
          <button onClick={onClose} className="px-4 py-2 rounded bg-gray-200 text-gray-700 text-sm hover:bg-gray-300">关闭</button>
        </div>
      </div>
    </div>
  );
};
