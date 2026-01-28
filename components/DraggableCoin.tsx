import React, { useState, useRef, useCallback, useEffect } from 'react';

interface DraggableCoinProps {
  onDonate: (amount: number) => void;
  orbPosition: { x: number; y: number; width: number; height: number } | null;
  onHoverOrb: (hovering: boolean) => void;
}

const COIN_VALUES = [100, 500, 1000, 5000];

export const DraggableCoin: React.FC<DraggableCoinProps> = ({
  onDonate,
  orbPosition,
  onHoverOrb,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [selectedValue, setSelectedValue] = useState(100);
  const [isNearOrb, setIsNearOrb] = useState(false);
  const [showSelector, setShowSelector] = useState(false);
  const [donateAnimation, setDonateAnimation] = useState(false);
  const coinRef = useRef<HTMLDivElement>(null);
  const startPosRef = useRef({ x: 0, y: 0 });
  const initialPosRef = useRef({ x: 0, y: 0 });

  // Check if coin is near orb
  const checkOrbProximity = useCallback((coinX: number, coinY: number) => {
    if (!orbPosition) return false;
    
    const orbCenterX = orbPosition.x + orbPosition.width / 2;
    const orbCenterY = orbPosition.y + orbPosition.height / 2;
    const distance = Math.sqrt(
      Math.pow(coinX - orbCenterX, 2) + Math.pow(coinY - orbCenterY, 2)
    );
    
    return distance < orbPosition.width / 2 + 50;
  }, [orbPosition]);

  // Handle drag start
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    startPosRef.current = { x: clientX, y: clientY };
    initialPosRef.current = { ...position };
  };

  // Handle drag move
  const handleDragMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging) return;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const deltaX = clientX - startPosRef.current.x;
    const deltaY = clientY - startPosRef.current.y;
    
    const newX = initialPosRef.current.x + deltaX;
    const newY = initialPosRef.current.y + deltaY;
    
    setPosition({ x: newX, y: newY });
    
    // Check proximity to orb
    if (coinRef.current) {
      const rect = coinRef.current.getBoundingClientRect();
      const coinCenterX = rect.left + rect.width / 2;
      const coinCenterY = rect.top + rect.height / 2;
      const near = checkOrbProximity(coinCenterX, coinCenterY);
      setIsNearOrb(near);
      onHoverOrb(near);
    }
  }, [isDragging, checkOrbProximity, onHoverOrb]);

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    
    if (isNearOrb) {
      // Donate!
      setDonateAnimation(true);
      setTimeout(() => {
        onDonate(selectedValue);
        setDonateAnimation(false);
        setPosition({ x: 0, y: 0 });
      }, 300);
    } else {
      // Return to original position
      setPosition({ x: 0, y: 0 });
    }
    
    setIsNearOrb(false);
    onHoverOrb(false);
  }, [isDragging, isNearOrb, selectedValue, onDonate, onHoverOrb]);

  // Global event listeners
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchmove', handleDragMove);
      window.addEventListener('touchend', handleDragEnd);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleDragMove);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);

  const getCoinEmoji = (value: number) => {
    if (value >= 5000) return '💰';
    if (value >= 1000) return '🪙';
    if (value >= 500) return '🥇';
    return '🔘';
  };

  return (
    <div className="fixed bottom-20 right-4 z-30">
      {/* Value selector */}
      {showSelector && !isDragging && (
        <div className="absolute bottom-full right-0 mb-2 bg-white rounded-xl shadow-lg p-2 flex gap-1 animate-in fade-in slide-in-from-bottom-2">
          {COIN_VALUES.map(value => (
            <button
              key={value}
              onClick={() => {
                setSelectedValue(value);
                setShowSelector(false);
              }}
              className={`
                px-3 py-2 rounded-lg text-sm font-medium transition-colors
                ${selectedValue === value 
                  ? 'bg-amber-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              {value}
            </button>
          ))}
        </div>
      )}

      {/* Draggable coin */}
      <div
        ref={coinRef}
        className={`
          w-16 h-16 rounded-full cursor-grab active:cursor-grabbing
          flex items-center justify-center text-3xl
          transition-all duration-200 select-none
          ${isDragging ? 'scale-110 shadow-2xl' : 'shadow-lg hover:scale-105'}
          ${isNearOrb ? 'scale-125' : ''}
          ${donateAnimation ? 'scale-0 opacity-0' : ''}
        `}
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
          boxShadow: isNearOrb 
            ? '0 0 30px rgba(251, 191, 36, 0.8)' 
            : '0 4px 15px rgba(0, 0, 0, 0.2)',
        }}
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
        onClick={() => !isDragging && setShowSelector(!showSelector)}
      >
        <span className="drop-shadow">{getCoinEmoji(selectedValue)}</span>
      </div>

      {/* Value label */}
      <div className={`
        absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold
        px-2 py-1 rounded-full shadow transition-all
        ${isDragging ? 'opacity-0' : 'opacity-100'}
      `}>
        {selectedValue}
      </div>

      {/* Hint */}
      {!isDragging && (
        <div className="absolute top-full mt-2 right-0 text-xs text-gray-500 whitespace-nowrap">
          拖到阴阳玉投币
        </div>
      )}
    </div>
  );
};
