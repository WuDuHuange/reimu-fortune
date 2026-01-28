import React, { forwardRef, useState, useEffect, useCallback, useImperativeHandle, useRef } from 'react';
import { OrbMood, ORB_FACES } from '../types';
import { OrbFace } from './OrbFace';
import { SpeechBubble, IDLE_MESSAGES, CLICK_SPAM_MESSAGES } from './SpeechBubble';
import '../styles/orb-animations.css';

interface YinYangOrbProps {
  onClick: () => void;
  disabled: boolean;
  mood?: OrbMood;
  onMoodChange?: (mood: OrbMood) => void;
}

export interface YinYangOrbRef {
  setMood: (mood: OrbMood) => void;
  triggerAnimation: (anim: string) => void;
  showBubble: (message: string) => void;
}

export const YinYangOrb = forwardRef<YinYangOrbRef, YinYangOrbProps>(({ 
  onClick, 
  disabled, 
  mood: externalMood,
  onMoodChange 
}, ref) => {
  const [internalMood, setInternalMood] = useState<OrbMood>('idle');
  const [animation, setAnimation] = useState<string>('orb-slow-spin');
  const [bubbleMessage, setBubbleMessage] = useState<string>('');
  const [showBubble, setShowBubble] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [glowClass, setGlowClass] = useState('');
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const mood = externalMood ?? internalMood;

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    setMood: (newMood: OrbMood) => {
      setInternalMood(newMood);
      onMoodChange?.(newMood);
      updateAnimationForMood(newMood);
    },
    triggerAnimation: (anim: string) => {
      setAnimation(anim);
      setTimeout(() => updateAnimationForMood(mood), 500);
    },
    showBubble: (message: string) => {
      setBubbleMessage(message);
      setShowBubble(true);
    },
  }));

  // Update animation based on mood
  const updateAnimationForMood = useCallback((currentMood: OrbMood) => {
    switch (currentMood) {
      case 'idle':
        setAnimation('orb-slow-spin');
        setGlowClass('');
        break;
      case 'hungry':
        setAnimation('orb-float');
        setGlowClass('');
        break;
      case 'rich':
        setAnimation('orb-spin-happy');
        setGlowClass('orb-glow-gold');
        setTimeout(() => {
          setAnimation('orb-slow-spin');
          setGlowClass('');
        }, 1500);
        break;
      case 'poor':
        setAnimation('orb-head-shake');
        setGlowClass('orb-grayscale');
        setTimeout(() => {
          setAnimation('orb-slow-spin');
          setGlowClass('');
        }, 1000);
        break;
      case 'angry':
        setAnimation('orb-shake-angry');
        setGlowClass('orb-glow-red');
        break;
      case 'smug':
        setAnimation('orb-reverse-spin');
        setGlowClass('');
        break;
      case 'shy':
        setAnimation('orb-turn-away');
        setGlowClass('');
        break;
      case 'happy':
        setAnimation('orb-nod');
        setGlowClass('');
        break;
      case 'shocked':
        setAnimation('orb-shake');
        setGlowClass('');
        break;
      case 'error':
        setAnimation('orb-glitch');
        setGlowClass('');
        break;
    }
  }, []);

  // Handle click with spam detection
  const handleClick = useCallback(() => {
    if (disabled) return;
    
    setClickCount(prev => prev + 1);
    setAnimation('orb-jelly');
    setTimeout(() => updateAnimationForMood(mood), 500);
    
    // Reset click count after 2 seconds of no clicks
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
    }
    clickTimerRef.current = setTimeout(() => {
      setClickCount(0);
    }, 2000);

    // Check for click spam
    if (clickCount >= 5) {
      const spamMsg = CLICK_SPAM_MESSAGES[Math.floor(Math.random() * CLICK_SPAM_MESSAGES.length)];
      setBubbleMessage(spamMsg);
      setShowBubble(true);
      setInternalMood('angry');
      updateAnimationForMood('angry');
      setClickCount(0);
      setTimeout(() => {
        setInternalMood('idle');
        updateAnimationForMood('idle');
      }, 2000);
      return;
    }

    onClick();
  }, [disabled, onClick, clickCount, mood, updateAnimationForMood]);

  // Idle message timer
  useEffect(() => {
    const startIdleTimer = () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(() => {
        if (mood === 'idle' && !disabled) {
          const idleMsg = IDLE_MESSAGES[Math.floor(Math.random() * IDLE_MESSAGES.length)];
          setBubbleMessage(idleMsg);
          setShowBubble(true);
        }
        startIdleTimer();
      }, 15000 + Math.random() * 15000); // 15-30 seconds
    };

    startIdleTimer();
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [mood, disabled]);

  // Update animation when mood changes
  useEffect(() => {
    updateAnimationForMood(mood);
  }, [mood, updateAnimationForMood]);

  return (
    <div className="relative group cursor-pointer" ref={containerRef}>
      {/* Speech Bubble */}
      <SpeechBubble
        message={bubbleMessage}
        visible={showBubble}
        position="right"
        autoHide={5000}
        onHide={() => setShowBubble(false)}
      />

      {/* Glow effect */}
      <div className={`absolute inset-0 rounded-full blur-xl transition-all duration-500 ${
        glowClass === 'orb-glow-gold' ? 'bg-amber-400 opacity-50' :
        glowClass === 'orb-glow-red' ? 'bg-red-500 opacity-50' :
        'bg-red-500 opacity-0 group-hover:opacity-30'
      }`}></div>
      
      {/* Main Orb Container */}
      <div 
        onClick={handleClick}
        className={`
          w-64 h-64 rounded-full relative overflow-hidden shadow-2xl border-4 border-red-900 bg-white
          transition-all duration-300
          ${animation}
          ${glowClass}
        `}
        style={{
          background: 'linear-gradient(90deg, #ffffff 50%, #dc2626 50%)'
        }}
      >
        {/* Top Circle (White) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-white rounded-full flex items-center justify-center">
          <div className="w-8 h-8 bg-red-600 rounded-full"></div>
        </div>

        {/* Bottom Circle (Red) */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-red-600 rounded-full flex items-center justify-center">
          <div className="w-8 h-8 bg-white rounded-full"></div>
        </div>

        {/* Face overlay */}
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="bg-white/80 backdrop-blur-sm px-3 py-2 rounded-lg shadow-inner">
            <OrbFace mood={mood} />
          </div>
        </div>
      </div>
      
      {/* Click Hint */}
      {!disabled && mood === 'idle' && (
        <div className="absolute top-full mt-4 left-1/2 -translate-x-1/2 text-red-900 font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap bg-white/80 px-3 py-1 rounded shadow-sm backdrop-blur-sm text-sm">
          点击祈福
        </div>
      )}

      {/* Question bubble for smug mood */}
      {mood === 'smug' && (
        <div className="absolute -top-2 -right-2 text-2xl question-bubble">❓</div>
      )}
    </div>
  );
});

YinYangOrb.displayName = 'YinYangOrb';