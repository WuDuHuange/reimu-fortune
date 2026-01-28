import React from 'react';
import { OrbMood, ORB_FACES } from '../types';

interface OrbFaceProps {
  mood: OrbMood;
  className?: string;
}

export const OrbFace: React.FC<OrbFaceProps> = ({ mood, className = '' }) => {
  const face = ORB_FACES[mood];
  
  // Color based on mood
  const getColor = () => {
    switch (mood) {
      case 'rich':
      case 'happy':
        return 'text-amber-500';
      case 'angry':
        return 'text-red-600';
      case 'poor':
        return 'text-gray-500';
      case 'error':
        return 'text-red-500 animate-pulse';
      case 'shocked':
        return 'text-purple-600';
      default:
        return 'text-gray-800';
    }
  };

  return (
    <div 
      className={`
        font-mono text-2xl font-bold select-none
        transition-all duration-300 ease-out
        ${getColor()}
        ${className}
      `}
      style={{
        textShadow: mood === 'rich' ? '0 0 10px gold' : 'none',
        filter: mood === 'error' ? 'blur(1px)' : 'none',
      }}
    >
      {face}
    </div>
  );
};
