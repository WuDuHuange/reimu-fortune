import React, { useState, useEffect, useCallback, useRef } from 'react';

interface Leaf {
  id: number;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  speed: number;
  type: 'leaf' | 'dust' | 'coin';
}

interface ShrineSweeingProps {
  onSweep: () => { amount: number; isCrit: boolean } | null;
  dailyCount: number;
  dailyLimit: number;
  enabled: boolean;
}

const LEAF_EMOJIS = ['🍂', '🍁', '🌿', '💨'];
const DUST_EMOJIS = ['💫', '✨', '🌟'];

export const ShrineSweeping: React.FC<ShrineSweeingProps> = ({
  onSweep,
  dailyCount,
  dailyLimit,
  enabled,
}) => {
  const [leaves, setLeaves] = useState<Leaf[]>([]);
  const [rewards, setRewards] = useState<{ id: number; x: number; y: number; amount: number; isCrit: boolean }[]>([]);
  const [critAnimation, setCritAnimation] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const leafIdRef = useRef(0);
  const rewardIdRef = useRef(0);

  // Spawn leaves periodically
  useEffect(() => {
    if (!enabled || dailyCount >= dailyLimit) return;

    const spawnLeaf = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      
      const isCoinChance = Math.random() < 0.002; // Very rare coin
      
      const newLeaf: Leaf = {
        id: leafIdRef.current++,
        x: Math.random() * (rect.width - 40),
        y: -40,
        rotation: Math.random() * 360,
        scale: 0.8 + Math.random() * 0.4,
        speed: 1 + Math.random() * 2,
        type: isCoinChance ? 'coin' : (Math.random() < 0.7 ? 'leaf' : 'dust'),
      };
      
      setLeaves(prev => [...prev.slice(-15), newLeaf]); // Keep max 15 leaves
    };

    const interval = setInterval(spawnLeaf, 2000 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, [enabled, dailyCount, dailyLimit]);

  // Animate leaves falling
  useEffect(() => {
    if (leaves.length === 0) return;

    const animate = () => {
      setLeaves(prev => prev
        .map(leaf => ({
          ...leaf,
          y: leaf.y + leaf.speed,
          x: leaf.x + Math.sin(leaf.y / 30) * 0.5,
          rotation: leaf.rotation + 1,
        }))
        .filter(leaf => {
          if (!containerRef.current) return false;
          return leaf.y < containerRef.current.getBoundingClientRect().height + 40;
        })
      );
    };

    const frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [leaves]);

  // Handle leaf click
  const handleLeafClick = useCallback((leaf: Leaf, e: React.MouseEvent) => {
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
    }, 1000);
  }, [onSweep]);

  // Clean up old rewards
  useEffect(() => {
    const cleanup = setInterval(() => {
      setRewards(prev => prev.slice(-10));
    }, 5000);
    return () => clearInterval(cleanup);
  }, []);

  if (!enabled) return null;

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-20 overflow-hidden"
    >
      {/* Falling leaves */}
      {leaves.map(leaf => (
        <div
          key={leaf.id}
          className="absolute cursor-pointer pointer-events-auto transition-transform hover:scale-125"
          style={{
            left: leaf.x,
            top: leaf.y,
            transform: `rotate(${leaf.rotation}deg) scale(${leaf.scale})`,
          }}
          onClick={(e) => handleLeafClick(leaf, e)}
        >
          <span className={`text-2xl select-none ${leaf.type === 'coin' ? 'animate-pulse' : ''}`}>
            {leaf.type === 'coin' 
              ? '💰' 
              : leaf.type === 'leaf'
                ? LEAF_EMOJIS[Math.floor(Math.random() * LEAF_EMOJIS.length)]
                : DUST_EMOJIS[Math.floor(Math.random() * DUST_EMOJIS.length)]
            }
          </span>
        </div>
      ))}

      {/* Reward popups */}
      {rewards.map(reward => (
        <div
          key={reward.id}
          className={`absolute pointer-events-none animate-float-up ${
            reward.isCrit ? 'text-amber-500 font-bold text-xl' : 'text-green-600 font-medium'
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
          className="absolute pointer-events-none animate-ping"
          style={{
            left: critAnimation.x - 50,
            top: critAnimation.y - 50,
            width: 100,
            height: 100,
          }}
        >
          <div className="w-full h-full rounded-full bg-amber-400/50 flex items-center justify-center">
            <span className="text-4xl">✨</span>
          </div>
        </div>
      )}

      {/* Progress indicator */}
      <div className="fixed bottom-4 left-4 pointer-events-auto bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg text-sm">
        <div className="flex items-center gap-2">
          <span>🧹</span>
          <span className="text-gray-700">
            扫除进度：{dailyCount}/{dailyLimit}
          </span>
        </div>
        {dailyCount >= dailyLimit && (
          <p className="text-xs text-gray-500 mt-1">今日扫除已完成~</p>
        )}
      </div>

      <style>{`
        @keyframes float-up {
          0% {
            opacity: 1;
            transform: translateY(0);
          }
          100% {
            opacity: 0;
            transform: translateY(-40px);
          }
        }
        .animate-float-up {
          animation: float-up 1s ease-out forwards;
        }
      `}</style>
    </div>
  );
};
