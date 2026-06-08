import React from 'react';
import { useSound } from '../contexts/SoundContext';

export const useBoardSounds = ({
  G,
  myID,
  numP,
  activeEvent,
  showGameOverOverlay
}) => {
  const {
    playCardDeal,
    playCardPlace,
    playCardSweep,
    playMissa,
    playDerba,
    playDerbaDouble,
    playUltimateAttack,
    playRondaTringa,
    playClash,
    playVictory,
    playDefeat
  } = useSound();

  // Play deal sound
  const totalHandCards = Object.values(G.players || {}).reduce((sum, p) => sum + (p?.hand?.length || 0), 0);
  const prevHandCards = React.useRef(0);

  React.useEffect(() => {
    if (!G.gameStarted) {
      prevHandCards.current = 0;
      return;
    }
    if (totalHandCards > prevHandCards.current) {
      playCardDeal();
    }
    prevHandCards.current = totalHandCards;
  }, [totalHandCards, playCardDeal, G.gameStarted]);

  // Play placement sound
  const tableLength = G.table?.length || 0;
  const prevTableLength = React.useRef(0);

  React.useEffect(() => {
    if (!G.gameStarted) {
      prevTableLength.current = G.table?.length || 0;
      return;
    }
    if (tableLength > prevTableLength.current) {
      if (tableLength - prevTableLength.current === 1) {
        playCardPlace();
      }
    }
    prevTableLength.current = tableLength;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableLength, playCardPlace, G.gameStarted]);

  // Play sweep sound
  const p0Captured = G.players['0']?.captured?.length || 0;
  const p1Captured = G.players['1']?.captured?.length || 0;
  const totalCaptured = p0Captured + p1Captured;
  const prevCaptured = React.useRef(0);

  React.useEffect(() => {
    if (!G.gameStarted) {
      prevCaptured.current = 0;
      return;
    }
    if (totalCaptured > prevCaptured.current) {
      playCardSweep();
    }
    prevCaptured.current = totalCaptured;
  }, [totalCaptured, playCardSweep, G.gameStarted]);

  // Play sound for event popups
  React.useEffect(() => {
    if (activeEvent) {
      const type = activeEvent.type;
      const streak = activeEvent.streak;
      const isSuccess = activeEvent.displayVariant === 'success';
      
      if (type === 'Missa') {
        playMissa(isSuccess);
      } else if (type === 'Derba') {
        playDerba(isSuccess);
      } else if (type === 'Taawida') {
        if (streak === 4) {
          playUltimateAttack();
        } else {
          playDerbaDouble(isSuccess);
        }
      } else if (type === 'Clash' || type === 'Clash Draw') {
        playClash(true);
      } else if (['Ronda', 'Tringa', 'TringaWins', 'Clash Won', 'King Finish', 'As Finish', 'Final Fail'].includes(type)) {
        playRondaTringa(isSuccess);
      }
    }
  }, [activeEvent, playMissa, playDerba, playDerbaDouble, playUltimateAttack, playRondaTringa, playClash]);

  // Play victory or defeat sound at game end
  const prevIsGameOver = React.useRef(false);

  React.useEffect(() => {
    if (showGameOverOverlay && !prevIsGameOver.current) {
      const winner = G?.gameStatus?.winner !== undefined ? G.gameStatus.winner : 'Draw';
      if (winner === 'Draw') {
        playClash(true);
      } else {
        const isMyTeamA = myID === '0' || myID === '2';
        const didIWin = numP === 2
          ? winner === myID
          : (winner === 'TeamA' ? isMyTeamA : winner === 'TeamB' ? !isMyTeamA : false);

        if (didIWin) {
          playVictory();
        } else {
          playDefeat();
        }
      }
    }
    prevIsGameOver.current = showGameOverOverlay;
  }, [showGameOverOverlay, G?.gameStatus, myID, numP, playVictory, playDefeat, playClash]);
};
