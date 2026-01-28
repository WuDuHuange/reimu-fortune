import React, { useState, useEffect, useCallback, useRef } from 'react';

interface Leaf {
  id: number;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  speed: number;
  type: 'leaf' | 'dust' | 'coin';
  emoji: string; // 固定 emoji，避免闪烁
}

interface ShrineSweeingProps {
  onSweep: () => { amount: number; isCrit: boolean } | null;
  dailyCount: number;
  dailyLimit: number;
  enabled: boolean;
}

const LEAF_EMOJIS = ['🍂', '🍁', '🌿', '💨'];
const DUST_EMOJIS = ['💫', '✨', '🌟'];

// 随机选择 emoji（仅在创建时调用）
const getRandomEmoji = (type: 'leaf' | 'dust' | 'coin'): string => {
  if (type === 'coin') return '💰';
  if (type === 'leaf') return LEAF_EMOJIS[Math.floor(Math.random() * LEAF_EMOJIS.length)];
  return DUST_EMOJIS[Math.floor(Math.random() * DUST_EMOJIS.length)];
};

export const ShrineSweeping: React.FC<ShrineSweeingProps> = ({
  onSweep,
  dailyCount,
  dailyLimit,
  enabled,
}) => {
  const [leaves, setLeaves] = useState<Leaf[]>([]);
  const [rewards, setRewards] = useState<{ id: number; x: number; y: number; amount: number; isCrit: boolean }[]>([]);
  const [critAnimation, setCritAnimation] = useState<{ x: number; y: number } | null>(null);
  const [isSweepMode, setIsSweepMode] = useState(false); // 扫帚模式
  const [sweepCooldown, setSweepCooldown] = useState(0); // 一键清扫冷却
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null); // 扫帚光标位置
  const containerRef = useRef<HTMLDivElement>(null);
  const leafIdRef = useRef(0);
  const rewardIdRef = useRef(0);
  const animationRef = useRef<number | null>(null);

  // Spawn leaves periodically
  useEffect(() => {
    if (!enabled || dailyCount >= dailyLimit) return;

    const spawnLeaf = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      
      const isCoinChance = Math.random() < 0.005; // 0.5% 硬币概率
      const type: 'leaf' | 'dust' | 'coin' = isCoinChance 
        ? 'coin' 
        : (Math.random() < 0.7 ? 'leaf' : 'dust');
      
      const newLeaf: Leaf = {
        id: leafIdRef.current++,
        x: Math.random() * (rect.width - 60) + 30,
        y: -50,
        rotation: Math.random() * 360,
        scale: 0.9 + Math.random() * 0.3,
        speed: 0.8 + Math.random() * 1.2,
        type,
        emoji: getRandomEmoji(type), // 创建时固定 emoji
      };
      
      setLeaves(prev => [...prev.slice(-20), newLeaf]);
    };

    const interval = setInterval(spawnLeaf, 1500 + Math.random() * 1500);
    return () => clearInterval(interval);
  }, [enabled, dailyCount, dailyLimit]);

  // Animate leaves falling (优化：使用 ref 避免频繁创建)
  useEffect(() => {
    if (leaves.length === 0) return;

    const animate = () => {
      setLeaves(prev => prev
        .map(leaf => ({
          ...leaf,
          y: leaf.y + leaf.speed,
          x: leaf.x + Math.sin(leaf.y / 40) * 0.8,
          rotation: leaf.rotation + 0.5,
        }))
        .filter(leaf => {
          if (!containerRef.current) return false;
          return leaf.y < containerRef.current.getBoundingClientRect().height + 50;
        })
      );
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [leaves.length > 0]);

  // 冷却计时器
  useEffect(() => {
    if (sweepCooldown <= 0) return;
    const timer = setInterval(() => {
      setSweepCooldown(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [sweepCooldown]);

  // Handle leaf click/tap
  const handleLeafClick = useCallback((leaf: Leaf, e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    
    const result = onSweep();
    if (!result) return;

    // Remove the clicked leaf
    setLeaves(prev => prev.filter(l => l.id !== leaf.id));

    // Show reward popup
    const newReward = {
      id: rewardIdRef.current++,
      x: leaf.x,
      y: leaf.y,
      amount: result.amount,
      isCrit: result.isCrit,
    };
    setRewards(prev => [...prev, newReward]);

    // Show crit animation
    if (result.isCrit) {
      setCritAnimation({ x: leaf.x, y: leaf.y });
      setTimeout(() => setCritAnimation(null), 1500);
    }

    // Remove reward popup after animation
    setTimeout(() => {
      setRewards(prev => prev.filter(r => r.id !== newReward.id));
    }, 800);
  }, [onSweep]);

  // 扫帚模式 - 滑过清扫
  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // 更新光标位置（无论是否在扫帚模式）
    if (isSweepMode) {
      setCursorPos({ x: e.clientX, y: e.clientY });
    }
    
    if (!isSweepMode) return;
    
    // 检查附近的叶子
    setLeaves(prev => {
      const swept: Leaf[] = [];
      const remaining = prev.filter(leaf => {
        const distance = Math.sqrt(Math.pow(leaf.x - x, 2) + Math.pow(leaf.y - y, 2));
        if (distance < 60) { // 增大清扫范围
          swept.push(leaf);
          return false;
        }
        return true;
      });
      
      // 触发奖励
      swept.forEach(leaf => {
        const result = onSweep();
        if (result) {
          const newReward = {
            id: rewardIdRef.current++,
            x: leaf.x,
            y: leaf.y,
            amount: result.amount,
            isCrit: result.isCrit,
          };
          setRewards(r => [...r, newReward]);
          setTimeout(() => {
            setRewards(r => r.filter(rr => rr.id !== newReward.id));
          }, 800);
        }
      });
      
      return remaining;
    });
  }, [isSweepMode, onSweep]);

  // 开始扫帚模式
  const startSweepMode = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSweepMode(true);
    setCursorPos({ x: e.clientX, y: e.clientY });
    // 捕获指针，防止移到其他元素时中断
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }, []);

  // 结束扫帚模式
  const stopSweepMode = useCallback((e?: React.PointerEvent) => {
    setIsSweepMode(false);
    setCursorPos(null);
    if (e) {
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    }
  }, []);

  // 一键清扫
  const handleBulkSweep = useCallback(() => {
    if (sweepCooldown > 0 || leaves.length === 0) return;
    
    const toSweep = leaves.slice(0, 5);
    toSweep.forEach((leaf, index) => {
      setTimeout(() => {
        const result = onSweep();
        if (result) {
          setLeaves(prev => prev.filter(l => l.id !== leaf.id));
          const newReward = {
            id: rewardIdRef.current++,
            x: leaf.x,
            y: leaf.y,
            amount: result.amount,
            isCrit: result.isCrit,
          };
          setRewards(r => [...r, newReward]);
          setTimeout(() => {
            setRewards(r => r.filter(rr => rr.id !== newReward.id));
          }, 800);
        }
      }, index * 100);
    });
    
    setSweepCooldown(10);
  }, [leaves, sweepCooldown, onSweep]);

  if (!enabled) return null;

  return (
    <div 
      ref={containerRef}
      className={`fixed inset-0 overflow-hidden ${isSweepMode ? 'z-[100] cursor-none' : 'z-20 pointer-events-none'}`}
      onPointerMove={handlePointerMove}
      onPointerUp={stopSweepMode}
      onPointerCancel={stopSweepMode}
    >
      {/* Falling leaves */}
      {leaves.map(leaf => (
        <div
          key={leaf.id}
          className={`absolute pointer-events-auto select-none ${
            leaf.type === 'coin' ? 'animate-pulse z-30' : 'z-20'
          }`}
          style={{
            left: leaf.x,
            top: leaf.y,
            transform: `rotate(${leaf.rotation}deg) scale(${leaf.scale})`,
            transition: 'transform 0.1s ease-out',
          }}
          onClick={(e) => handleLeafClick(leaf, e)}
          onTouchStart={(e) => handleLeafClick(leaf, e)}
        >
          {/* 扩大点击区域 */}
          <div className="relative w-12 h-12 flex items-center justify-center cursor-pointer hover:scale-150 transition-transform duration-150">
            <span className="text-3xl drop-shadow-md">
              {leaf.emoji}
            </span>
          </div>
        </div>
      ))}

      {/* Reward popups */}
      {rewards.map(reward => (
        <div
          key={reward.id}
          className={`absolute pointer-events-none z-40 animate-float-up font-bold ${
            reward.isCrit ? 'text-amber-500 text-2xl' : 'text-green-600 text-lg'
          }`}
          style={{
            left: reward.x,
            top: reward.y,
          }}
        >
          +{reward.amount}
          {reward.isCrit && ' 💎'}
        </div>
      ))}

      {/* Crit animation */}
      {critAnimation && (
        <div
          className="absolute pointer-events-none z-50"
          style={{
            left: critAnimation.x - 60,
            top: critAnimation.y - 60,
            width: 120,
            height: 120,
          }}
        >
          <div className="w-full h-full rounded-full bg-amber-400/40 animate-ping flex items-center justify-center">
            <span className="text-5xl">✨</span>
          </div>
        </div>
      )}

      {/* 控制面板 */}
      <div className="fixed bottom-4 left-4 pointer-events-auto bg-white/95 backdrop-blur-sm rounded-xl px-4 py-3 shadow-lg border border-gray-200">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-xl">🧹</span>
          <div>
            <div className="text-sm font-medium text-gray-700">
              扫除进度
            </div>
            <div className="text-xs text-gray-500">
              {dailyCount}/{dailyLimit}
            </div>
          </div>
        </div>
        
        {/* 进度条 */}
        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
          <div 
            className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-300"
            style={{ width: `${(dailyCount / dailyLimit) * 100}%` }}
          />
        </div>

        {dailyCount < dailyLimit ? (
          <div className="flex gap-2">
            {/* 扫帚模式 */}
            <button
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all touch-none ${
                isSweepMode 
                  ? 'bg-amber-500 text-white shadow-inner animate-pulse' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onPointerDown={startSweepMode}
            >
              {isSweepMode ? '✨划动中...' : '🧹长按扫'}
            </button>
            
            {/* 一键清扫 */}
            <button
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                sweepCooldown > 0 || leaves.length === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
              onClick={handleBulkSweep}
              disabled={sweepCooldown > 0 || leaves.length === 0}
            >
              {sweepCooldown > 0 ? `${sweepCooldown}s` : `扫×${Math.min(5, leaves.length)}`}
            </button>
          </div>
        ) : (
          <p className="text-xs text-green-600 font-medium">✓ 今日扫除完成~</p>
        )}
      </div>

      {/* 扫帚模式视觉提示 - 跟随光标的扫帚图标 */}
      {isSweepMode && cursorPos && (
        <div 
          className="fixed pointer-events-none z-[101] transition-transform duration-75"
          style={{
            left: cursorPos.x - 30,
            top: cursorPos.y - 30,
          }}
        >
          <div className="relative">
            {/* 扫帚图标 */}
            <span className="text-5xl drop-shadow-lg animate-bounce" style={{ animationDuration: '0.3s' }}>🧹</span>
            {/* 清扫范围指示器 */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border-2 border-amber-400/50 border-dashed animate-spin" style={{ animationDuration: '3s' }} />
          </div>
        </div>
      )}

      {/* 扫帚模式全屏遮罩提示 */}
      {isSweepMode && (
        <div className="fixed inset-0 bg-amber-100/10 pointer-events-none z-[99]">
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg animate-pulse">
            🧹 扫帚模式 - 滑动清扫落叶！松开停止
          </div>
        </div>
      )}

      <style>{`
        @keyframes float-up {
          0% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          50% {
            opacity: 1;
            transform: translateY(-20px) scale(1.2);
          }
          100% {
            opacity: 0;
            transform: translateY(-50px) scale(0.8);
          }
        }
        .animate-float-up {
          animation: float-up 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
};
