import React, { useState, useRef, useEffect } from 'react';
import { YinYangOrb } from './components/YinYangOrb';
<<<<<<< HEAD
import { getFortune } from './services/geminiService';
=======
import { SakuraEffect } from './components/SakuraEffect';
import { AudioControl } from './components/AudioControl';
import { FortuneHistory } from './components/FortuneHistory';
import { FortuneCard } from './components/FortuneCard';
import { ThemeToggle } from './components/ThemeToggle';
import { getFortune } from './services/geminiService';
import { useAudio } from './hooks/useAudio';
import { useFortuneHistory } from './hooks/useFortuneHistory';
import { useTimeTheme } from './hooks/useTimeTheme';
>>>>>>> main
import { FortuneResponse, ReimuState } from './types';

export default function App() {
  const [state, setState] = useState<ReimuState>({ status: 'idle', fortune: null });
  const [query, setQuery] = useState('');
  const orbRef = useRef<HTMLDivElement>(null);
<<<<<<< HEAD
=======
  const { play, isMuted, toggleMute } = useAudio();
  const { history, addRecord, clearHistory, removeRecord } = useFortuneHistory();
  const { theme, themeName, isManualOverride, cycleTheme, resetToAuto } = useTimeTheme();
>>>>>>> main
  
  // Initialize GSAP timelines if needed, or just use simple tweens
  const shakeOrb = () => {
    if (!window.gsap || !orbRef.current) return;
    
    // Create a shake animation
    window.gsap.to(orbRef.current, {
      x: () => (Math.random() - 0.5) * 20,
      y: () => (Math.random() - 0.5) * 20,
      rotation: () => (Math.random() - 0.5) * 10,
      duration: 0.1,
      repeat: -1,
      yoyo: true,
      ease: "power1.inOut"
    });
  };

  const stopShake = () => {
    if (!window.gsap || !orbRef.current) return;
    window.gsap.killTweensOf(orbRef.current);
    window.gsap.to(orbRef.current, { x: 0, y: 0, rotation: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" });
  };

  const handleDrawFortune = async () => {
    if (state.status === 'shaking') return;

<<<<<<< HEAD
=======
    play('bell', 0.4);
>>>>>>> main
    setState({ status: 'shaking', fortune: null });
    shakeOrb();

    try {
      // Fetch fortune from Gemini with the user's query
      const fortune = await getFortune(query);
      
      // Stop shaking and show result
      stopShake();
<<<<<<< HEAD
=======
      play('success', 0.3);
      addRecord(fortune, query);
>>>>>>> main
      setState({ status: 'result', fortune });
    } catch (error: any) {
      stopShake();
      // Use the actual error message thrown from the service
      setState({ 
        status: 'error', 
        fortune: null, 
        errorMessage: error.message || "神灵保持沉默... (网络错误)" 
      });
    }
  };

  const reset = () => {
    setState({ status: 'idle', fortune: null });
    setQuery(''); // Optional: clear query on reset
  };

  return (
<<<<<<< HEAD
    <div className="min-h-screen flex flex-col items-center py-12 px-4 relative overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/shigan.png')]">
      
      {/* Decorative Torii Gate Top (Abstract) */}
      <div className="absolute top-0 left-0 w-full h-4 bg-red-700 shadow-md"></div>
      <div className="absolute top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-4xl h-3 bg-red-700 rounded-full shadow-sm"></div>

      {/* Header */}
      <header className="text-center mb-8 mt-8 z-10">
        <h1 className="text-4xl md:text-6xl font-bold text-red-800 tracking-wider drop-shadow-sm mb-2">
          博丽神社
        </h1>
        <p className="text-red-600 font-medium text-lg">博丽灵梦的每日一签</p>
=======
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

      {/* Sakura Falling Effect */}
      <SakuraEffect />

      {/* Decorative Torii Gate Top (Abstract) */}
      <div className={`absolute top-0 left-0 w-full h-4 ${theme.headerBg} shadow-md transition-colors duration-1000`}></div>
      <div className={`absolute top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-4xl h-3 ${theme.headerBg} rounded-full shadow-sm transition-colors duration-1000`}></div>

      {/* Header */}
      <header className="text-center mb-8 mt-8 z-10">
        <h1 className={`text-4xl md:text-6xl font-bold ${theme.textPrimary} tracking-wider drop-shadow-sm mb-2 transition-colors duration-1000`}>
          博丽神社
        </h1>
        <p className={`${theme.textSecondary} font-medium text-lg transition-colors duration-1000`}>博丽灵梦的每日一签</p>
>>>>>>> main
      </header>

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
        <div className="mb-12 relative">
           <YinYangOrb 
             ref={orbRef} 
             onClick={handleDrawFortune} 
             disabled={state.status === 'shaking'} 
           />
        </div>

        {/* Status Message / Result */}
        <div className="w-full min-h-[200px] flex flex-col items-center">
          
          {state.status === 'idle' && (
            <div className="text-center animate-pulse">
<<<<<<< HEAD
              <p className="text-red-800 text-xl font-medium">点击阴阳玉，抽取运势。</p>
              <p className="text-red-500 text-sm mt-2">（非常欢迎赛钱）</p>
=======
              <p className={`${theme.textPrimary} text-xl font-medium transition-colors duration-1000`}>点击阴阳玉，抽取运势。</p>
              <p className={`${theme.textSecondary} text-sm mt-2 transition-colors duration-1000`}>（非常欢迎赛钱）</p>
>>>>>>> main
            </div>
          )}

          {state.status === 'shaking' && (
            <div className="text-center">
<<<<<<< HEAD
              <p className="text-red-800 text-2xl font-bold animate-bounce">正在沟通神灵...</p>
=======
              <p className={`${theme.textPrimary} text-2xl font-bold animate-bounce transition-colors duration-1000`}>正在沟通神灵...</p>
>>>>>>> main
            </div>
          )}

          {state.status === 'result' && state.fortune && (
<<<<<<< HEAD
            <div className="bg-white/95 backdrop-blur-sm border-2 border-red-800 p-8 rounded-lg shadow-xl w-full text-center transform transition-all duration-500 hover:scale-105">
              <div className="mb-4">
                <span className="inline-block px-4 py-1 bg-red-800 text-white text-sm font-bold rounded-full mb-2">
                  {query ? '愿望回应' : '今日运势'}
                </span>
                <h2 className="text-5xl font-bold text-red-900 mb-4 border-b-2 border-red-100 pb-4">
                  {state.fortune.luck}
                </h2>
              </div>
              <p className="text-slate-700 text-lg leading-relaxed italic mb-6">
                "{state.fortune.comment}"
              </p>
              <button 
                onClick={reset}
                className="px-6 py-2 bg-red-800 hover:bg-red-700 text-white font-bold rounded transition-colors"
              >
                再抽一次
              </button>
            </div>
=======
            <FortuneCard 
              fortune={state.fortune} 
              query={query} 
              onReset={reset} 
            />
>>>>>>> main
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

<<<<<<< HEAD
      {/* Footer */}
      <footer className="mt-8 text-center text-red-400 text-sm">
=======
      {/* Fortune History Panel */}
      <FortuneHistory 
        history={history} 
        onClear={clearHistory} 
        onRemove={removeRecord} 
      />

      {/* Footer */}
      <footer className={`mt-8 text-center ${theme.textSecondary} text-sm opacity-70 transition-colors duration-1000`}>
>>>>>>> main
        <p>© 博丽神社。所有赛钱都将用于购买茶点。</p>
      </footer>
    </div>
  );
}