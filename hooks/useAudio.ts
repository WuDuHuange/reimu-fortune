import { useRef, useState, useCallback } from 'react';

// Using free sound effect URLs (you can replace with your own)
const SOUNDS = {
  // Bell/shrine sound
  bell: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3',
  // Success chime
  success: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
  // Soft click
  click: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
};

type SoundType = keyof typeof SOUNDS;

export const useAudio = () => {
  const [isMuted, setIsMuted] = useState(false);
  const audioRefs = useRef<Map<SoundType, HTMLAudioElement>>(new Map());

  const getAudio = useCallback((type: SoundType): HTMLAudioElement => {
    if (!audioRefs.current.has(type)) {
      const audio = new Audio(SOUNDS[type]);
      audio.preload = 'auto';
      audioRefs.current.set(type, audio);
    }
    return audioRefs.current.get(type)!;
  }, []);

  const play = useCallback((type: SoundType, volume: number = 0.5) => {
    if (isMuted) return;
    
    try {
      const audio = getAudio(type);
      audio.volume = volume;
      audio.currentTime = 0;
      audio.play().catch(err => {
        // Ignore autoplay errors (user interaction required)
        console.log('Audio play failed:', err.message);
      });
    } catch (error) {
      console.log('Audio error:', error);
    }
  }, [isMuted, getAudio]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  return {
    play,
    isMuted,
    toggleMute,
  };
};
