import React, { useState } from 'react';
import { FortuneRecord } from '../hooks/useFortuneHistory';

interface FortuneHistoryProps {
  history: FortuneRecord[];
  onClear: () => void;
  onRemove: (id: string) => void;
}

export const FortuneHistory: React.FC<FortuneHistoryProps> = ({ 
  history, 
  onClear, 
  onRemove 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getLuckColor = (luck: string) => {
    if (luck.includes('大吉')) return 'text-yellow-600 bg-yellow-50';
    if (luck.includes('中吉') || luck.includes('吉')) return 'text-green-600 bg-green-50';
    if (luck.includes('小吉')) return 'text-blue-600 bg-blue-50';
    if (luck.includes('凶')) return 'text-gray-600 bg-gray-100';
    return 'text-red-600 bg-red-50';
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 w-12 h-12 rounded-full bg-red-700 text-white shadow-lg flex items-center justify-center hover:bg-red-600 transition-all hover:scale-105"
        title="抽签记录"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        {history.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 text-red-900 text-xs font-bold rounded-full flex items-center justify-center">
            {history.length > 9 ? '9+' : history.length}
          </span>
        )}
      </button>

      {/* History Panel */}
      <div 
        className={`fixed inset-y-0 right-0 w-80 max-w-full bg-white/95 backdrop-blur-md shadow-2xl z-40 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-4 bg-red-700 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <span>📜</span> 抽签记录
            </h2>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-red-600 rounded"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {history.length > 0 && (
            <button
              onClick={onClear}
              className="mt-2 text-sm text-red-200 hover:text-white underline"
            >
              清空全部记录
            </button>
          )}
        </div>

        {/* Records List */}
        <div className="overflow-y-auto h-[calc(100%-80px)] p-4">
          {history.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p className="text-4xl mb-2">🎋</p>
              <p>还没有抽签记录</p>
              <p className="text-sm mt-1">去试试手气吧！</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((record) => (
                <div 
                  key={record.id}
                  className="bg-white border border-red-100 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow relative group"
                >
                  {/* Delete button */}
                  <button
                    onClick={() => onRemove(record.id)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>

                  {/* Luck badge */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded text-sm font-bold ${getLuckColor(record.fortune.luck)}`}>
                      {record.fortune.luck}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatDate(record.timestamp)}
                    </span>
                  </div>

                  {/* Query if exists */}
                  {record.query && (
                    <p className="text-xs text-gray-500 mb-1 truncate">
                      🙏 {record.query}
                    </p>
                  )}

                  {/* Comment preview */}
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {record.fortune.comment}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};
