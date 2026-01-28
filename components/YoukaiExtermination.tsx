import React, { useState, useEffect, useCallback, useRef } from 'react';

interface YoukaiExterminationProps {
  onComplete: (success: boolean) => void;
  onClose: () => void;
}

const YOUKAI_NAMES = ['露米娅', '大妖精', '小�的', '琪露诺', '莉格露'];
const YOUKAI_EMOJIS = ['🌑', '🧚', '😈', '❄️', '🦗'];

export const YoukaiExtermination: React.FC<YoukaiExterminationProps> = ({
  onComplete,
  onClose,
}) => {
  const [youkaiIndex] = useState(() => Math.floor(Math.random() * YOUKAI_NAMES.length));
  const [circles, setCircles] = useState<{ id: number; x: number; y: number; lit: boolean }[]>([]);
  const [clickCount, setClickCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(3);
  const [phase, setPhase] = useState<'intro' | 'battle' | 'result'>('intro');
  const [success, setSuccess] = useState(false);
  const circleIdRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const targetClicks = 5;

  // Generate circles
  const generateCircle = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const padding = 60;
    
    const newCircle = {
      id: circleIdRef.current++,
      x: padding + Math.random() * (rect.width - padding * 2),
      y: padding + Math.random() * (rect.height - padding * 2),
      lit: false,
    };
    
    setCircles(prev => [...prev.slice(-4), newCircle]);
    
    // Light up after random delay
    setTimeout(() => {
      setCircles(prev => prev.map(c => 
        c.id === newCircle.id ? { ...c, lit: true } : c
      ));
    }, 200 + Math.random() * 300);
  }, []);

  // Start battle
  const startBattle = () => {
    setPhase('battle');
    setClickCount(0);
    setTimeLeft(3);
    generateCircle();
  };

  // Timer
  useEffect(() => {
    if (phase !== 'battle') return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0.1) {
          clearInterval(timer);
          setPhase('result');
          setSuccess(clickCount >= targetClicks);
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [phase, clickCount]);

  // Generate new circles during battle
  useEffect(() => {
    if (phase !== 'battle') return;

    const interval = setInterval(() => {
      generateCircle();
    }, 400);

    return () => clearInterval(interval);
  }, [phase, generateCircle]);

  // Handle circle click
  const handleCircleClick = (circleId: number, isLit: boolean) => {
    if (!isLit || phase !== 'battle') return;
    
    setCircles(prev => prev.filter(c => c.id !== circleId));
    setClickCount(prev => {
      const newCount = prev + 1;
      if (newCount >= targetClicks) {
        setPhase('result');
        setSuccess(true);
      }
      return newCount;
    });
  };

  // Handle result
  const handleResult = () => {
    onComplete(success);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div 
        ref={containerRef}
        className="bg-gradient-to-b from-indigo-900 to-purple-900 rounded-2xl shadow-2xl max-w-md w-full aspect-square relative overflow-hidden"
      >
        {/* Intro phase */}
        {phase === 'intro' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6">
            <div className="text-6xl mb-4 animate-bounce">
              {YOUKAI_EMOJIS[youkaiIndex]}
            </div>
            <h2 className="text-2xl font-bold mb-2">
              {YOUKAI_NAMES[youkaiIndex]}出现了！
            </h2>
            <p className="text-indigo-200 text-center mb-6">
              在 3 秒内点击 {targetClicks} 个亮起的圆圈来退治妖怪！
            </p>
            <button
              onClick={startBattle}
              className="px-8 py-3 bg-red-600 text-white rounded-full font-bold text-lg hover:bg-red-500 transition-colors animate-pulse"
            >
              开始退治！
            </button>
          </div>
        )}

        {/* Battle phase */}
        {phase === 'battle' && (
          <>
            {/* Timer bar */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gray-800">
              <div 
                className="h-full bg-gradient-to-r from-green-400 to-yellow-400 transition-all duration-100"
                style={{ width: `${(timeLeft / 3) * 100}%` }}
              />
            </div>

            {/* Progress */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white font-bold text-xl">
              {clickCount} / {targetClicks}
            </div>

            {/* Circles */}
            {circles.map(circle => (
              <div
                key={circle.id}
                className={`
                  absolute w-16 h-16 rounded-full cursor-pointer transition-all duration-200
                  ${circle.lit 
                    ? 'bg-yellow-400 shadow-lg shadow-yellow-400/50 scale-100' 
                    : 'bg-gray-700 scale-75 opacity-50'
                  }
                `}
                style={{
                  left: circle.x - 32,
                  top: circle.y - 32,
                }}
                onClick={() => handleCircleClick(circle.id, circle.lit)}
              >
                {circle.lit && (
                  <div className="absolute inset-0 flex items-center justify-center text-2xl animate-ping">
                    ✦
                  </div>
                )}
              </div>
            ))}
          </>
        )}

        {/* Result phase */}
        {phase === 'result' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6">
            {success ? (
              <>
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-2xl font-bold mb-2 text-green-400">退治成功！</h2>
                <p className="text-indigo-200 mb-2">
                  {YOUKAI_NAMES[youkaiIndex]}被击退了！
                </p>
                <div className="text-3xl font-bold text-amber-400 mb-6">
                  +500 赛钱
                </div>
              </>
            ) : (
              <>
                <div className="text-6xl mb-4">😵</div>
                <h2 className="text-2xl font-bold mb-2 text-red-400">退治失败</h2>
                <p className="text-indigo-200 mb-6">
                  这种程度的妖怪都打不过……
                </p>
              </>
            )}
            <button
              onClick={handleResult}
              className="px-8 py-3 bg-white text-purple-900 rounded-full font-bold hover:bg-gray-100 transition-colors"
            >
              {success ? '收下奖励' : '下次努力'}
            </button>
          </div>
        )}

        {/* Close button */}
        {phase === 'intro' && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/60 hover:text-white"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};
