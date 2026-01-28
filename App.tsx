import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { toPng } from 'html-to-image';
import { YinYangOrb, YinYangOrbRef } from './components/YinYangOrb';
import { SakuraEffect } from './components/SakuraEffect';
import { AudioControl } from './components/AudioControl';
import { FortuneHistory } from './components/FortuneHistory';
import { FortuneCard } from './components/FortuneCard';
import { ShareableFortuneCard } from './components/ShareableFortuneCard';
import { ThemeToggle } from './components/ThemeToggle';
import { getFortune } from './services/geminiService';
import { useAudio } from './hooks/useAudio';
import { useFortuneHistory } from './hooks/useFortuneHistory';
import { useTimeTheme } from './hooks/useTimeTheme';
import { useSaisen, DailyBonusResult, InterestResult } from './hooks/useSaisen';
import { FortuneResponse, ReimuState, ToneStyle, OrbMood, FateAlterationType } from './types';
import { Achievements } from './components/Achievements';
import { WeeklyReport } from './components/WeeklyReport';
import { SaisenDisplay, DailyBonusNotification, InterestNotification } from './components/SaisenDisplay';
import { FateAlteration, AlteredFortuneResult } from './components/FateAlteration';
import { ShrineSweeping } from './components/ShrineSweeping';
import { YoukaiExtermination } from './components/YoukaiExtermination';
import { DraggableCoin } from './components/DraggableCoin';

const loadingHints = [
  '灵梦在翻旧账本中…',
  '灵梦在找零钱…',
  '灵梦在擦拭御币…',
  '灵梦在收拾赛钱箱…',
  '灵梦在赶走乌鸦…',
];

const bugChanceDefault = 0.015;

const getSpecialOccasion = (now: Date, birthday?: string): string => {
  const m = now.getMonth() + 1;
  const d = now.getDate();
  const mmdd = `${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  if (mmdd === '01-01') return '元旦特别签';
  if (mmdd === '12-31') return '除夕特别签';
  if (birthday && birthday === mmdd) return '生日特别签';
  return '';
};

export default function App() {
  // Core state
  const [state, setState] = useState<ReimuState>({ status: 'idle', fortune: null });
  const [query, setQuery] = useState('');
  const [tone, setTone] = useState<ToneStyle>('温柔');
  const [birthday, setBirthday] = useState<string>('');
  const [specialOccasion, setSpecialOccasion] = useState('');
  const [altAdvice, setAltAdvice] = useState<string | null>(null);
  const [loadingTip, setLoadingTip] = useState<string>('正在沟通神灵...');
  const [showReport, setShowReport] = useState(false);
  
  // Saisen system state
  const [orbMood, setOrbMood] = useState<OrbMood>('idle');
  const [dailyBonus, setDailyBonus] = useState<DailyBonusResult | null>(null);
  const [interestNotif, setInterestNotif] = useState<InterestResult | null>(null);
  const [showFateAlteration, setShowFateAlteration] = useState(false);
  const [alteredFortune, setAlteredFortune] = useState<AlteredFortuneResult | null>(null);
  const [showYoukaiGame, setShowYoukaiGame] = useState(false);
  const [orbPosition, setOrbPosition] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [isGeneratingShare, setIsGeneratingShare] = useState(false);
  
  // Refs
  const orbRef = useRef<YinYangOrbRef>(null);
  const orbContainerRef = useRef<HTMLDivElement>(null);
  const shareCardRef = useRef<HTMLDivElement>(null);

  // Hooks
  const { play, isMuted, toggleMute } = useAudio();
  const { history, addRecord, clearHistory, removeRecord } = useFortuneHistory();
  const { theme, themeName, isManualOverride, cycleTheme, resetToAuto } = useTimeTheme();
  const saisen = useSaisen();

  // Update orb position for draggable coin
  useEffect(() => {
    const updateOrbPosition = () => {
      if (orbContainerRef.current) {
        const rect = orbContainerRef.current.getBoundingClientRect();
        setOrbPosition({
          x: rect.left,
          y: rect.top,
          width: rect.width,
          height: rect.height,
        });
      }
    };
    
    updateOrbPosition();
    window.addEventListener('resize', updateOrbPosition);
    window.addEventListener('scroll', updateOrbPosition);
    return () => {
      window.removeEventListener('resize', updateOrbPosition);
      window.removeEventListener('scroll', updateOrbPosition);
    };
  }, []);

  // Load persisted settings
  useEffect(() => {
    const savedTone = localStorage.getItem('toneStyle') as ToneStyle | null;
    const savedBirthday = localStorage.getItem('birthday');
    if (savedTone) setTone(savedTone);
    if (savedBirthday) setBirthday(savedBirthday);
  }, []);

  useEffect(() => {
    localStorage.setItem('toneStyle', tone);
  }, [tone]);

  useEffect(() => {
    if (birthday) localStorage.setItem('birthday', birthday);
  }, [birthday]);

  // Check daily bonus and interest on load
  useEffect(() => {
    if (!saisen.isLoaded) return;
    
    const bonus = saisen.checkDailyBonus();
    if (bonus) {
      setDailyBonus(bonus);
      setOrbMood('rich');
      play('success', 0.3);
      setTimeout(() => setOrbMood('idle'), 2000);
    }

    const interest = saisen.checkInterest();
    if (interest) {
      setTimeout(() => setInterestNotif(interest), bonus ? 3000 : 500);
    }
  }, [saisen.isLoaded]);

  // Random youkai event
  useEffect(() => {
    if (!saisen.isLoaded || saisen.dailyYoukaiCount >= saisen.dailyYoukaiLimit) return;
    
    const checkYoukaiEvent = () => {
      if (Math.random() < 0.05 && state.status === 'idle' && !showYoukaiGame) {
        setShowYoukaiGame(true);
      }
    };
    
    const interval = setInterval(checkYoukaiEvent, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, [saisen.isLoaded, saisen.dailyYoukaiCount, saisen.dailyYoukaiLimit, state.status, showYoukaiGame]);

  // GSAP animations
  const shakeOrb = () => {
    if (!window.gsap || !orbContainerRef.current) return;
    window.gsap.to(orbContainerRef.current, {
      x: () => (Math.random() - 0.5) * 20,
      y: () => (Math.random() - 0.5) * 20,
      rotation: () => (Math.random() - 0.5) * 10,
      duration: 0.1,
      repeat: -1,
      yoyo: true,
      ease: 'power1.inOut'
    });
  };

  const stopShake = () => {
    if (!window.gsap || !orbContainerRef.current) return;
    window.gsap.killTweensOf(orbContainerRef.current);
    window.gsap.to(orbContainerRef.current, { x: 0, y: 0, rotation: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)' });
  };

  // Handle fortune draw
  const handleDrawFortune = async () => {
    if (state.status === 'shaking') return;

    setAltAdvice(null);
    setAlteredFortune(null);
    setLoadingTip(loadingHints[Math.floor(Math.random() * loadingHints.length)]);

    const occasion = getSpecialOccasion(new Date(), birthday);
    setSpecialOccasion(occasion);

    play('bell', 0.4);
    setState({ status: 'shaking', fortune: null });
    setOrbMood('smug');
    shakeOrb();

    try {
      const fortune = await getFortune(query, { tone, specialOccasion: occasion, bugChance: bugChanceDefault });
      stopShake();
      play('success', 0.3);
      addRecord(fortune, query);
      setState({ status: 'result', fortune });
      
      // Set orb mood based on fortune
      if (fortune.luck.includes('大凶') || fortune.luck.includes('凶')) {
        setOrbMood('shy');
      } else if (fortune.luck.includes('大吉')) {
        setOrbMood('happy');
      } else {
        setOrbMood('idle');
      }
    } catch (error: any) {
      stopShake();
      setOrbMood('angry');
      setState({ status: 'error', fortune: null, errorMessage: error.message || '神灵保持沉默... (网络错误)' });
    }
  };

  const reset = () => {
    setState({ status: 'idle', fortune: null });
    setQuery('');
    setAltAdvice(null);
    setAlteredFortune(null);
    setOrbMood('idle');
  };

  const handleAltChoice = (type: 'obey' | 'defy') => {
    if (!state.fortune) return;
    const text = type === 'obey'
      ? state.fortune.altAdviceObey || state.fortune.reimuComment || '按灵梦说的去做吧。'
      : state.fortune.altAdviceDefy || '不听？那就看你造化了。';
    setAltAdvice(text);
  };

  const handleShareCard = async () => {
    if (!shareCardRef.current || !state.fortune) return;
    setIsGeneratingShare(true);
    
    try {
      // Wait for rendering
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const dataUrl = await toPng(shareCardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
      });
      
      const link = document.createElement('a');
      link.download = `reimu-fortune-${Date.now()}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error('Share image failed', e);
      alert('生成图片失败，请重试');
    } finally {
      setIsGeneratingShare(false);
    }
  };

  // Saisen handlers
  const handleCoinDonate = useCallback((amount: number) => {
    if (!saisen.canAfford(amount)) {
      setOrbMood('angry');
      orbRef.current?.showBubble('你没有这么多钱！');
      setTimeout(() => setOrbMood('idle'), 1500);
      return;
    }
    
    const success = saisen.spendSaisen(amount);
    if (success) {
      play('success', 0.2);
      
      if (amount >= 100000) {
        // System overload easter egg
        setOrbMood('error');
        orbRef.current?.showBubble('收到巨额款项，系统过载处理中...\n（其实是灵梦数钱数晕过去了）');
        setTimeout(() => setOrbMood('happy'), 5000);
      } else if (amount < 100) {
        setOrbMood('poor');
        orbRef.current?.showBubble('就这？');
        setTimeout(() => setOrbMood('idle'), 1500);
      } else {
        setOrbMood('rich');
        orbRef.current?.triggerAnimation('orb-spin-happy');
        if (amount >= 1000) {
          orbRef.current?.showBubble('哼哼，不错嘛~');
        }
        setTimeout(() => setOrbMood('idle'), 2000);
      }
    }
  }, [saisen, play]);

  const handleOrbHover = useCallback((hovering: boolean) => {
    if (hovering && orbMood === 'idle') {
      setOrbMood('hungry');
    } else if (!hovering && orbMood === 'hungry') {
      setOrbMood('idle');
    }
  }, [orbMood]);

  const handleSweep = useCallback(() => {
    return saisen.doSweep();
  }, [saisen]);

  const handleFateAlterationPurchase = useCallback((cost: number, type: FateAlterationType) => {
    return saisen.spendSaisen(cost);
  }, [saisen]);

  const handleFateAlterationComplete = useCallback((result: AlteredFortuneResult) => {
    setAlteredFortune(result);
    setShowFateAlteration(false);
    
    if (result.intervention === 'yukari') {
      setOrbMood('shocked');
      setTimeout(() => setOrbMood('idle'), 3000);
    } else if (result.intervention === 'suika') {
      setOrbMood('happy');
      setTimeout(() => setOrbMood('idle'), 3000);
    } else {
      setOrbMood('smug');
      setTimeout(() => setOrbMood('idle'), 2000);
    }
  }, []);

  const handleYoukaiComplete = useCallback((success: boolean) => {
    saisen.doYoukaiExtermination(success);
    if (success) {
      setOrbMood('happy');
      orbRef.current?.showBubble('干得不错！');
    } else {
      setOrbMood('poor');
      orbRef.current?.showBubble('这种程度都不行吗...');
    }
    setTimeout(() => setOrbMood('idle'), 2000);
  }, [saisen]);

  // Check if fortune is bad (eligible for fate alteration)
  const isBadFortune = state.fortune && (
    state.fortune.luck.includes('凶') || 
    state.fortune.luck === '末吉'
  );

  const titleProgress = saisen.getTitleProgress();
  const weeklyFortunes = useMemo(() => history.slice(0, 7), [history]);

  return (
    <div className={`min-h-screen flex flex-col items-center py-12 px-4 relative overflow-hidden bg-gradient-to-br ${theme.bgGradient} transition-colors duration-1000`}>
      
      {/* Theme Toggle Button */}
      <ThemeToggle 
        themeName={themeName}
        isManualOverride={isManualOverride}
        onCycle={cycleTheme}
        onReset={resetToAuto}
      />

      {/* Audio Control Button */}
      <AudioControl isMuted={isMuted} onToggle={toggleMute} />

      {/* Saisen Display */}
      <SaisenDisplay
        balance={saisen.balance}
        title={titleProgress.current}
        nextTitle={titleProgress.next}
        progress={titleProgress.progress}
        remaining={titleProgress.remaining}
        consecutiveDays={saisen.consecutiveDays}
      />

      {/* Sakura Falling Effect */}
      <SakuraEffect />

      {/* Shrine Sweeping Game */}
      <ShrineSweeping
        onSweep={handleSweep}
        dailyCount={saisen.dailySweepCount}
        dailyLimit={saisen.dailySweepLimit}
        enabled={state.status === 'idle'}
      />

      {/* Draggable Coin */}
      <DraggableCoin
        onDonate={handleCoinDonate}
        orbPosition={orbPosition}
        onHoverOrb={handleOrbHover}
      />

      {/* Decorative Torii Gate Top */}
      <div className={`absolute top-0 left-0 w-full h-4 ${theme.headerBg} shadow-md transition-colors duration-1000`}></div>
      <div className={`absolute top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-4xl h-3 ${theme.headerBg} rounded-full shadow-sm transition-colors duration-1000`}></div>

      {/* Header */}
      <header className="text-center mb-8 mt-8 z-10">
        <h1 className={`text-4xl md:text-6xl font-bold ${theme.textPrimary} tracking-wider drop-shadow-sm mb-2 transition-colors duration-1000`}>
          博丽神社
        </h1>
        <p className={`${theme.textSecondary} font-medium text-lg transition-colors duration-1000`}>博丽灵梦的每日一签</p>
      </header>

      {/* Controls */}
      <div className="w-full max-w-md mb-4 grid grid-cols-2 gap-3 z-10">
        <div className={`flex flex-col text-sm ${theme.textSecondary}`}>
          <label className="mb-1">语气调节</label>
          <select
            value={tone}
            onChange={(e) => setTone(e.target.value as ToneStyle)}
            className="w-full px-3 py-2 rounded border border-red-200 bg-white/90 text-red-800 focus:outline-none focus:border-red-500"
          >
            <option value="毒舌">毒舌灵梦</option>
            <option value="温柔">温柔灵梦</option>
            <option value="摆烂">摆烂灵梦</option>
          </select>
        </div>
        <div className={`flex flex-col text-sm ${theme.textSecondary}`}>
          <label className="mb-1">生日 (MM-DD)</label>
          <input
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
            placeholder="06-14"
            className="w-full px-3 py-2 rounded border border-red-200 bg-white/90 text-red-800 focus:outline-none focus:border-red-500"
          />
        </div>
      </div>

      {/* Main Interaction Area */}
      <main className="flex-grow flex flex-col items-center justify-center w-full max-w-md z-10">
        
        {/* Input Field */}
        <div className={`mb-8 w-full transition-opacity duration-300 ${state.status !== 'idle' ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="在此输入你的愿望（可选）..."
            className="w-full px-4 py-3 text-center bg-white/90 border-2 border-red-200 rounded-full focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-200 text-red-900 placeholder-red-300 shadow-sm transition-all"
            disabled={state.status !== 'idle'}
          />
        </div>

        {/* The Orb */}
        <div className="mb-12 relative" ref={orbContainerRef}>
          <YinYangOrb 
            ref={orbRef} 
            onClick={handleDrawFortune} 
            disabled={state.status === 'shaking'}
            mood={orbMood}
            onMoodChange={setOrbMood}
          />
        </div>

        {/* Status Message / Result */}
        <div className="w-full min-h-[220px] flex flex-col items-center">
          
          {state.status === 'idle' && (
            <div className="text-center animate-pulse">
              <p className={`${theme.textPrimary} text-xl font-medium transition-colors duration-1000`}>点击阴阳玉，抽取运势。</p>
              <p className={`${theme.textSecondary} text-sm mt-2 transition-colors duration-1000`}>（非常欢迎赛钱）</p>
            </div>
          )}

          {state.status === 'shaking' && (
            <div className="text-center">
              <p className={`${theme.textPrimary} text-2xl font-bold animate-bounce transition-colors duration-1000`}>{loadingTip}</p>
            </div>
          )}

          {state.status === 'result' && state.fortune && (
            <>
              {specialOccasion && (
                <div className="mb-2 px-3 py-1 bg-amber-100 text-amber-700 text-xs rounded-full">{specialOccasion}</div>
              )}

              <div className="w-full">
                <FortuneCard 
                  fortune={alteredFortune ? { ...state.fortune, luck: alteredFortune.newLuck } : state.fortune} 
                  query={query} 
                  onReset={reset} 
                />
              </div>

              {/* Hidden shareable card for image generation */}
              <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
                <ShareableFortuneCard
                  ref={shareCardRef}
                  fortune={alteredFortune ? { ...state.fortune, luck: alteredFortune.newLuck } : state.fortune}
                  query={query}
                />
              </div>

              {/* Altered fortune annotation */}
              {alteredFortune && (
                <div className="mt-3 p-4 bg-red-50 border-l-4 border-red-500 rounded w-full">
                  <p className="text-sm font-medium text-red-800">灵梦批注：</p>
                  <p className="text-red-700 mt-1">{alteredFortune.annotation}</p>
                  {alteredFortune.intervention && (
                    <p className={`mt-2 text-sm ${
                      alteredFortune.intervention === 'yukari' ? 'text-purple-600' : 'text-orange-600'
                    }`}>
                      {alteredFortune.interventionMessage}
                    </p>
                  )}
                </div>
              )}

              {/* Fate alteration prompt */}
              {isBadFortune && !alteredFortune && (
                <div className="mt-4 p-3 bg-gray-100 border border-gray-300 rounded-lg w-full text-center">
                  <p className="text-sm text-gray-600 mb-2">对神明的指示不满意？或许有些误会……</p>
                  <button
                    onClick={() => setShowFateAlteration(true)}
                    className="px-4 py-2 bg-amber-500 text-white rounded-full text-sm font-medium hover:bg-amber-600 transition-colors"
                  >
                    🪙 改命服务
                  </button>
                </div>
              )}

              {/* Interaction choices */}
              <div className="mt-4 flex gap-3">
                <button onClick={() => handleAltChoice('obey')} className="px-4 py-2 rounded-full bg-red-700 text-white text-sm shadow hover:bg-red-600">听灵梦的</button>
                <button onClick={() => handleAltChoice('defy')} className="px-4 py-2 rounded-full bg-gray-700 text-white text-sm shadow hover:bg-gray-600">我就不听</button>
              </div>
              {altAdvice && (
                <div className="mt-3 px-4 py-2 bg-white/80 border border-red-200 rounded text-sm text-red-700 w-full text-center">
                  {altAdvice}
                </div>
              )}

              {/* Cameo */}
              {state.fortune.cameo && (
                <div className="mt-3 px-4 py-3 bg-indigo-50 border border-indigo-200 rounded w-full text-sm text-indigo-700">
                  <strong>{state.fortune.cameo.emoji || '✨'} {state.fortune.cameo.name}</strong>：{state.fortune.cameo.comment}
                </div>
              )}

              {/* Share & weekly */}
              <div className="mt-4 flex flex-wrap gap-3 justify-center">
                <button 
                  onClick={handleShareCard} 
                  disabled={isGeneratingShare}
                  className="px-4 py-2 rounded-full bg-green-700 text-white text-sm shadow hover:bg-green-600 disabled:opacity-50 disabled:cursor-wait"
                >
                  {isGeneratingShare ? '生成中...' : '生成分享卡片'}
                </button>
                <button onClick={() => setShowReport(true)} className="px-4 py-2 rounded-full bg-orange-600 text-white text-sm shadow hover:bg-orange-500">导出本周运势</button>
              </div>
            </>
          )}

          {state.status === 'error' && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              <strong className="font-bold">出错了！</strong>
              <span className="block sm:inline"> {state.errorMessage}</span>
              <button onClick={reset} className="mt-2 text-sm underline">重试</button>
            </div>
          )}
        </div>
      </main>

      {/* Fortune History Panel */}
      <FortuneHistory 
        history={history} 
        onClear={clearHistory} 
        onRemove={removeRecord} 
      />

      <Achievements history={history} />

      {/* Footer */}
      <footer className={`mt-8 text-center ${theme.textSecondary} text-sm opacity-70 transition-colors duration-1000`}>
        <p>© 博丽神社。所有赛钱都将用于购买茶点。</p>
      </footer>

      {/* Modals */}
      <WeeklyReport 
        open={showReport}
        history={weeklyFortunes}
        onClose={() => setShowReport(false)}
      />

      {/* Daily Bonus Notification */}
      {dailyBonus && (
        <DailyBonusNotification
          amount={dailyBonus.amount}
          message={dailyBonus.message}
          consecutiveDays={dailyBonus.consecutiveDays}
          onClose={() => setDailyBonus(null)}
        />
      )}

      {/* Interest Notification */}
      {interestNotif && (
        <InterestNotification
          amount={interestNotif.earned}
          message={interestNotif.message}
          onClose={() => setInterestNotif(null)}
        />
      )}

      {/* Fate Alteration Modal */}
      {showFateAlteration && state.fortune && (
        <FateAlteration
          fortune={state.fortune}
          balance={saisen.balance}
          onPurchase={handleFateAlterationPurchase}
          onComplete={handleFateAlterationComplete}
          onClose={() => setShowFateAlteration(false)}
        />
      )}

      {/* Youkai Extermination Game */}
      {showYoukaiGame && (
        <YoukaiExtermination
          onComplete={handleYoukaiComplete}
          onClose={() => setShowYoukaiGame(false)}
        />
      )}
    </div>
  );
}
