import React, { forwardRef } from 'react';

interface YinYangOrbProps {
  onClick: () => void;
  disabled: boolean;
}

export const YinYangOrb = forwardRef<HTMLDivElement, YinYangOrbProps>(({ onClick, disabled }, ref) => {
  return (
    <div className="relative group cursor-pointer" onClick={!disabled ? onClick : undefined}>
      {/* Glow effect */}
      <div className="absolute inset-0 bg-red-500 rounded-full blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
      
      {/* Main Orb Container */}
      <div 
        ref={ref}
        className="w-64 h-64 rounded-full relative overflow-hidden shadow-2xl border-4 border-red-900 bg-white"
        style={{
          background: 'linear-gradient(90deg, #ffffff 50%, #dc2626 50%)' // White left, Red right
        }}
      >
        {/* Top Circle (White) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-white rounded-full flex items-center justify-center">
             {/* Top Dot (Red) */}
            <div className="w-8 h-8 bg-dc2626 rounded-full bg-red-600"></div>
        </div>

        {/* Bottom Circle (Red) */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-red-600 rounded-full flex items-center justify-center">
             {/* Bottom Dot (White) */}
            <div className="w-8 h-8 bg-white rounded-full"></div>
        </div>
      </div>
      
      {/* Click Hint */}
      {!disabled && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-red-900 font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap bg-white/80 px-2 py-1 rounded shadow-sm backdrop-blur-sm">
          点击祈福
        </div>
      )}
    </div>
  );
});

YinYangOrb.displayName = 'YinYangOrb';