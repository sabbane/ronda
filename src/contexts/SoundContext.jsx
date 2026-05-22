/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext, useEffect } from 'react';
import { soundService } from '../services/SoundService';

const SoundContext = createContext();

export const SoundProvider = ({ children }) => {
  const [isMuted, setIsMuted] = useState(soundService.muted);

  // Synchronize initial state
  useEffect(() => {
    soundService.muted = isMuted;
  }, [isMuted]);

  const toggleMute = () => {
    setIsMuted(prev => {
      const newVal = !prev;
      soundService.muted = newVal;
      return newVal;
    });
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
        playClick,
        playCardDeal,
        playCardPlace,
        playCardSweep,
        playMissa,
        playDerba,
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
