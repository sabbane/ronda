/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext, useEffect } from 'react';
import { soundService } from '../services/SoundService';

const SoundContext = createContext();

export const SoundProvider = ({ children }) => {
  const [isMuted, setIsMuted] = useState(soundService.muted);
  const [currentTrack, setCurrentTrack] = useState(soundService.currentTrackIndex);

  // Synchronize initial state
  useEffect(() => {
    soundService.muted = isMuted;
  }, [isMuted]);

  // Satisfy autoplay policies by triggering initialization on the very first user gesture anywhere
  useEffect(() => {
    const handleGesture = async () => {
      if (!isMuted) {
        try {
          await soundService.initContext();
        } catch (e) {
          console.warn('Autoplay gesture initialization failed:', e);
        }
      }
      cleanup();
    };

    const cleanup = () => {
      window.removeEventListener('click', handleGesture);
      window.removeEventListener('pointerdown', handleGesture);
      window.removeEventListener('keydown', handleGesture);
    };

    window.addEventListener('click', handleGesture);
    window.addEventListener('pointerdown', handleGesture);
    window.addEventListener('keydown', handleGesture);

    return cleanup;
  }, [isMuted]);

  const toggleMute = () => {
    setIsMuted(prev => {
      const newVal = !prev;
      soundService.muted = newVal;
      return newVal;
    });
  };

  const changeTrack = async (idx) => {
    const finalIdx = await soundService.changeTrack(idx);
    setCurrentTrack(finalIdx);
  };

  const nextTrack = async () => {
    const finalIdx = await soundService.nextTrack();
    setCurrentTrack(finalIdx);
  };

  const playClick = () => {
    if (!isMuted) soundService.playClick();
  };

  const playCardDeal = () => {
    if (!isMuted) soundService.playCardDeal();
  };

  const playCardPlace = () => {
    if (!isMuted) soundService.playCardPlace();
  };

  const playCardSweep = () => {
    if (!isMuted) soundService.playCardSweep();
  };

  const playMissa = (isSuccess) => {
    if (!isMuted) soundService.playMissa(isSuccess);
  };

  const playDerba = (isSuccess) => {
    if (!isMuted) soundService.playDerba(isSuccess);
  };

  const playRondaTringa = (isSuccess) => {
    if (!isMuted) soundService.playRondaTringa(isSuccess);
  };

  const playUltimateAttack = () => {
    if (!isMuted) soundService.playUltimateAttack();
  };

  const playClash = (isSuccess) => {
    if (!isMuted) soundService.playClash(isSuccess);
  };

  const playVictory = () => {
    if (!isMuted) soundService.playVictory();
  };

  const playDefeat = () => {
    if (!isMuted) soundService.playDefeat();
  };

  return (
    <SoundContext.Provider
      value={{
        isMuted,
        toggleMute,
        currentTrack,
        tracks: soundService.tracks,
        changeTrack,
        nextTrack,
        playClick,
        playCardDeal,
        playCardPlace,
        playCardSweep,
        playMissa,
        playDerba,
        playUltimateAttack,
        playRondaTringa,
        playClash,
        playVictory,
        playDefeat
      }}
    >
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = () => {
  const context = useContext(SoundContext);
  if (context === undefined) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return context;
};
