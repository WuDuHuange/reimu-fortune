import React, { forwardRef } from 'react';
import { FortuneResponse } from '../types';

interface ShareableFortuneCardProps {
  fortune: FortuneResponse;
  query?: string;
}

// Simplified styles for image export (no Tailwind classes that cause issues)
const getLuckColors = (luck: string) => {
  if (luck.includes('大吉')) return { bg: '#fef9c3', border: '#eab308', text: '#a16207', accent: '#facc15' };
  if (luck.includes('中吉')) return { bg: '#dcfce7', border: '#22c55e', text: '#166534', accent: '#4ade80' };
  if (luck.includes('小吉') || luck === '吉') return { bg: '#dbeafe', border: '#3b82f6', text: '#1d4ed8', accent: '#60a5fa' };
  if (luck.includes('末吉')) return { bg: '#f3e8ff', border: '#a855f7', text: '#7c3aed', accent: '#c084fc' };
  if (luck.includes('凶')) return { bg: '#f1f5f9', border: '#64748b', text: '#475569', accent: '#94a3b8' };
  return { bg: '#fee2e2', border: '#ef4444', text: '#b91c1c', accent: '#f87171' };
};

export const ShareableFortuneCard = forwardRef<HTMLDivElement, ShareableFortuneCardProps>(
  ({ fortune, query }, ref) => {
    const colors = getLuckColors(fortune.luck);
    const today = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });

    return (
      <div
        ref={ref}
        style={{
          width: '400px',
          padding: '24px',
          backgroundColor: colors.bg,
          border: `3px solid ${colors.border}`,
          borderRadius: '16px',
          fontFamily: '"Noto Serif JP", serif',
          boxSizing: 'border-box',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <div style={{ 
            fontSize: '14px', 
            color: '#991b1b',
            backgroundColor: '#fef2f2',
            padding: '4px 12px',
            borderRadius: '9999px',
            display: 'inline-block',
            marginBottom: '8px',
          }}>
            博丽神社
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>{today}</div>
        </div>

        {/* Main Luck */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '20px',
          padding: '16px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}>
          <div style={{ 
            fontSize: '48px', 
            fontWeight: 'bold',
            color: colors.text,
            marginBottom: '8px',
          }}>
            {fortune.luck}
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}>
            <div style={{ width: '40px', height: '1px', backgroundColor: colors.border }}></div>
            <span style={{ color: colors.accent }}>✦</span>
            <div style={{ width: '40px', height: '1px', backgroundColor: colors.border }}></div>
          </div>
        </div>

        {/* Query if exists */}
        {query && (
          <div style={{ 
            textAlign: 'center', 
            marginBottom: '12px',
            fontSize: '13px',
            color: '#6b7280',
            fontStyle: 'italic',
          }}>
            「{query}」
          </div>
        )}

        {/* Fortune Comment */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '16px',
          textAlign: 'center',
        }}>
          <p style={{ 
            color: colors.text, 
            fontSize: '15px', 
            lineHeight: '1.6',
            margin: 0,
          }}>
            {fortune.comment}
          </p>
        </div>

        {/* Lucky Details */}
        {(fortune.luckyItem || fortune.luckyDirection || fortune.luckyColor || fortune.luckyNumber) && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
            marginBottom: '16px',
          }}>
            {fortune.luckyItem && (
              <div style={{ 
                backgroundColor: 'white', 
                padding: '8px', 
                borderRadius: '8px',
                textAlign: 'center',
                fontSize: '12px',
              }}>
                <div style={{ color: '#9ca3af' }}>幸运物</div>
                <div style={{ color: colors.text, fontWeight: '500' }}>🎁 {fortune.luckyItem}</div>
              </div>
            )}
            {fortune.luckyDirection && (
              <div style={{ 
                backgroundColor: 'white', 
                padding: '8px', 
                borderRadius: '8px',
                textAlign: 'center',
                fontSize: '12px',
              }}>
                <div style={{ color: '#9ca3af' }}>幸运方位</div>
                <div style={{ color: colors.text, fontWeight: '500' }}>🧭 {fortune.luckyDirection}</div>
              </div>
            )}
            {fortune.luckyColor && (
              <div style={{ 
                backgroundColor: 'white', 
                padding: '8px', 
                borderRadius: '8px',
                textAlign: 'center',
                fontSize: '12px',
              }}>
                <div style={{ color: '#9ca3af' }}>幸运色</div>
                <div style={{ color: colors.text, fontWeight: '500' }}>🎨 {fortune.luckyColor}</div>
              </div>
            )}
            {fortune.luckyNumber && (
              <div style={{ 
                backgroundColor: 'white', 
                padding: '8px', 
                borderRadius: '8px',
                textAlign: 'center',
                fontSize: '12px',
              }}>
                <div style={{ color: '#9ca3af' }}>幸运数字</div>
                <div style={{ color: colors.text, fontWeight: '500' }}>🔢 {fortune.luckyNumber}</div>
              </div>
            )}
          </div>
        )}

        {/* Reimu Comment */}
        {fortune.reimuComment && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '16px',
          }}>
            <div style={{ fontSize: '11px', color: '#f87171', marginBottom: '4px' }}>灵梦说：</div>
            <div style={{ fontSize: '13px', color: '#b91c1c', fontStyle: 'italic' }}>
              "{fortune.reimuComment}"
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ 
          textAlign: 'center', 
          fontSize: '11px', 
          color: '#9ca3af',
          borderTop: '1px dashed #e5e7eb',
          paddingTop: '12px',
        }}>
          — 博丽神社 · 每日一签 —
        </div>
      </div>
    );
  }
);

ShareableFortuneCard.displayName = 'ShareableFortuneCard';
