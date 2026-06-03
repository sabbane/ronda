import React from 'react';
import { useSound } from '../contexts/SoundContext';

export const useBoardEvents = ({
  G,
  ctx,
  moves,
  myID,
  opponentID,
  numP,
  t,
  language,
}) => {
  const [activeEvent, setActiveEvent] = React.useState(null);
  const lastActiveEventClearedAt = React.useRef(0);
  const [eventQueue, setEventQueue] = React.useState([]);
  const processedAnnouncements = React.useRef(new Set());

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

  // 1. Play card deal sound once when new cards are dealt
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

  // 2. Play card place sound when a card is played onto the table
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
  }, [tableLength, playCardPlace, G.gameStarted]);

  // 3. Play card sweep sound when cards are captured
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

  // 4. Play announcement chime sound when activeEvent popups appear
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

  // 5. Play Victory / Defeat sound when the game ends
  const hasPendingAnnouncements = eventQueue.length > 0 || !!activeEvent;
  const isGameOverState = !!(G?.gameStatus && ctx.activePlayers?.[myID] === 'gameOver');
  const showGameOverOverlay = isGameOverState && !hasPendingAnnouncements;
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

  // Watch for new announcements and add them to a queue
  React.useEffect(() => {
    if (!G.gameStarted) {
      processedAnnouncements.current.clear();
      setEventQueue([]);
      return;
    }
    if (G.announcements && G.announcements.length > 0) {
      G.announcements.forEach((ann, idx) => {
        const annId = `${ctx.turn}-${idx}-${ann.type}-${ann.player}`;
        if (!processedAnnouncements.current.has(annId)) {
          processedAnnouncements.current.add(annId);
          
          const isMe = ann.player === myID;
          
          // Dynamically resolve the player's name who actually triggered the announcement
          let announcerName;
          let opponentName;
          if (numP === 2) {
            if (ann.player === myID) {
              announcerName = G.players[myID]?.name || t('you');
              opponentName = G.players[opponentID]?.name || t('opponent');
            } else {
              announcerName = G.players[opponentID]?.name || t('opponent');
              opponentName = G.players[myID]?.name || t('you');
            }
          } else {
            announcerName = G.players[ann.player]?.name || `Player ${Number(ann.player) + 1}`;
            opponentName = `Player ${Number(ann.player) + 1}`;
          }
          
          // Helper for victim name or failing player name in Final Fail / As Finish
          const failingPlayerID = G.lastPlayedCard?.player || opponentID;
          let failingPlayerName;
          if (numP === 2) {
            if (failingPlayerID === myID) {
              failingPlayerName = G.players[myID]?.name || t('you');
            } else {
              failingPlayerName = G.players[opponentID]?.name || t('opponent');
            }
          } else {
            failingPlayerName = G.players[failingPlayerID]?.name || `Player ${Number(failingPlayerID) + 1}`;
          }
          
          let customText = "";
          let customTitle = ann.type;
          let customIcon = "✨";

          if (ann.type === 'Ronda') customText = isMe ? t('announcements.rondaMe') : t('announcements.rondaOpponent', { oppName: announcerName });
          if (ann.type === 'Tringa') customText = isMe ? t('announcements.tringaMe') : t('announcements.tringaOpponent', { oppName: announcerName });
          if (ann.type === 'Missa') {
            customText = isMe ? t('announcements.missaMe') : t('announcements.missaOpponent', { oppName: announcerName });
            customIcon = "🧹";
          }
          if (ann.type === 'Derba') {
            const numP = ctx.numPlayers || 2;
            if (numP === 4) {
              if (language === 'ar') {
                const isHitterMyTeam = (ann.player === myID) || 
                  (myID === '0' && ann.player === '2') || (myID === '2' && ann.player === '0') ||
                  (myID === '1' && ann.player === '3') || (myID === '3' && ann.player === '1');
                
                if (isHitterMyTeam) {
                  if (myID === ann.player) {
                    customText = "ضربتي الخصم (+1 لكم)";
                  } else {
                    customText = "ضربنا الخصم (+1 لكم)";
                  }
                } else {
                  const victimID = String((Number(ann.player) + 3) % 4);
                  if (myID === victimID) {
                    customText = "الخصم ضربك (+1 للخصم)";
                  } else {
                    customText = "الخصم ضربنا (+1 للخصم)";
                  }
                }
              } else {
                const hitterName = G.players[ann.player]?.name || `Player ${Number(ann.player) + 1}`;
                const victimID = String((Number(ann.player) + 3) % 4);
                const victimName = G.players[victimID]?.name || `Player ${Number(victimID) + 1}`;

                if (myID === ann.player) {
                  customText = t('announcements.derbaMe4', { oppName: victimName });
                } else if (myID === victimID) {
                  customText = t('announcements.derbaOpponent4', { oppName: hitterName });
                } else {
                  customText = t('announcements.derbaOther4', { hitterName, victimName });
                }
              }
            } else {
              customText = isMe ? t('announcements.derbaMe', { oppName: opponentName }) : t('announcements.derbaOpponent', { oppName: announcerName });
            }
            customIcon = "👊";
          }
          if (ann.type === 'Taawida') {
            if (ann.streak === 3) {
              customTitle = t('announcements.counterAttackTitle');
              customText = isMe ? t('announcements.counterAttackMe', { oppName: opponentName }) : t('announcements.counterAttackOpponent', { oppName: announcerName });
              customIcon = "🥊";
            } else if (ann.streak === 4) {
              customTitle = t('announcements.ultimateCounterTitle');
              customText = isMe ? t('announcements.ultimateCounterMe') : t('announcements.ultimateCounterOpponent', { oppName: announcerName });
              customIcon = "☢️";
            }
          }
          if (ann.type === 'Clash') {
            if (numP === 4 && ann.clashingPlayers && ann.clashingPlayers.length > 0) {
              const names = ann.clashingPlayers.map(pID => G.players[pID]?.name || `Player ${Number(pID) + 1}`);
              let joinedNames = "";
              if (names.length === 2) {
                joinedNames = names.join(` ${t('and') || '&'} `);
              } else {
                joinedNames = names.slice(0, -1).join(', ') + `, ${t('and') || '&'} ` + names[names.length - 1];
              }
              customText = ann.clashType === 'Tringa'
                ? (t('announcements.clashTringaMulti', { names: joinedNames }) || `${joinedNames} have Tringa! Clash!`)
                : (t('announcements.clashRondaMulti', { names: joinedNames }) || `${joinedNames} have Ronda! Clash!`);
            } else {
              customText = ann.clashType === 'Tringa' ? t('announcements.clashTringa') : t('announcements.clashRonda');
            }
            customIcon = "⚔️";
          }
          if (ann.type === 'Clash Won') {
            const type = ann.rankType || (ann.text && typeof ann.text === 'string' ? (ann.text.match(/with (.*)!/) || [])[1] : '');
            const pts = ann.pts || (type === 'Tringa' ? 10 : 2);
            if (isMe) {
              customTitle = t('announcements.clashWonTitle');
              customText = type === 'Tringa' ? t('announcements.clashWonTringaMe', { pts }) : t('announcements.clashWonRondaMe', { pts });
            } else {
              customTitle = t('announcements.clashLostTitle');
              customText = type === 'Tringa' ? t('announcements.clashWonTringaOpp', { pts, oppName: announcerName }) : t('announcements.clashWonRondaOpp', { pts, oppName: announcerName });
            }
            customIcon = "⚔️";
          }
          if (ann.type === 'Clash Draw') {
            customText = t('announcements.clashDraw');
            customIcon = "🤝";
          }
          if (ann.type === 'King Finish') {
            customText = isMe ? t('announcements.kingFinishMe') : t('announcements.kingFinishOpponent', { oppName: announcerName });
            customIcon = "👑";
          }
          if (ann.type === 'TringaWins') {
            customText = isMe ? t('announcements.tringaWinsMe', { oppName: opponentName }) : t('announcements.tringaWinsOpponent', { oppName: announcerName });
            customTitle = "Tringa Wins";
            customIcon = "🏆";
          }
          if (ann.type === 'Final Fail') {
            customTitle = t('announcements.finalFailTitle');
            customText = isMe ? t('announcements.finalFailMe', { oppName: failingPlayerName }) : t('announcements.finalFailOpponent', { oppName: announcerName });
            customIcon = "📉";
          }
          if (ann.type === 'As Finish') {
            customTitle = t('announcements.asFinishTitle');
            customText = isMe ? t('announcements.asFinishMe', { oppName: failingPlayerName }) : t('announcements.asFinishOpponent', { oppName: announcerName });
            customIcon = "🂱";
          }

          let variant = "info";
          const allPointEvents = ['Ronda', 'Tringa', 'Missa', 'Derba', 'Taawida', 'Clash Won', 'King Finish', 'TringaWins', 'Final Fail', 'As Finish'];

          if (allPointEvents.includes(ann.type)) {
            variant = isMe ? "success" : "danger";
          }

          setEventQueue(prev => [...prev, { 
            ...ann, 
            displayText: customText || ann.text, 
            displayTitle: customTitle,
            displayIcon: customIcon,
            displayVariant: variant,
            id: annId 
          }]);
        }
      });
    }
  }, [G.announcements, myID, ctx.turn, G.gameStarted]);

  // Process the event queue sequentially with a pause between popups
  React.useEffect(() => {
    const isDealingAnimating = G.isAnimating && G.isDealing;
    
    if (!activeEvent && eventQueue.length > 0 && !isDealingAnimating) {
      const timeSinceLastClear = Date.now() - lastActiveEventClearedAt.current;
      const delay = timeSinceLastClear < 500 ? 500 - timeSinceLastClear : 0;

      const timer = setTimeout(() => {
        const next = eventQueue[0];
        setActiveEvent(next);
        setEventQueue(prev => prev.slice(1));
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [eventQueue, activeEvent, G.isAnimating, G.isDealing]);

  // Automatically clear the active event after 2.5 seconds
  React.useEffect(() => {
    if (activeEvent) {
      const timer = setTimeout(() => {
        setActiveEvent(null);
        lastActiveEventClearedAt.current = Date.now();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [activeEvent]);

  React.useEffect(() => {
    if (
      eventQueue.length === 0 && 
      !activeEvent && 
      G.announcements && 
      G.announcements.length > 0 &&
      ctx.activePlayers && 
      ctx.activePlayers[myID] === 'waitForUI'
    ) {
      const currentId = G.announcementId;
      const timer = setTimeout(() => {
        moves.clearAnnouncements(currentId);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [eventQueue.length, activeEvent, G.announcements, ctx.activePlayers, myID, moves, G.announcementId]);

  // Handle animation wait (flying cards and dealing)
  React.useEffect(() => {
    if (G.isAnimating && !G.pendingCapture && ctx.activePlayers && ctx.activePlayers[myID] === 'waitForUI') {
      const isDealPhase = G.isDealing;
      const delay = isDealPhase ? 3400 : 1500;
      const timer = setTimeout(() => {
        moves.endAnimation();
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [G.isAnimating, G.pendingCapture, G.isDealing, ctx.activePlayers, myID, moves]);

  // Capture animations sequence logic
  const captureSequence = React.useMemo(() => {
    if (!G.pendingCapture) return [];
    let sequence = [];
    let val = G.pendingCapture.currentVal;
    let matchIndex = G.table.findIndex(c => c.value === val && c.id !== G.pendingCapture.playedCardId);
    if (matchIndex !== -1) {
      sequence.push(G.table[matchIndex].id);
      let nextVal = val < 10 ? val + 1 : null;
      while (nextVal !== null) {
        let nextMatchIndex = G.table.findIndex(c => c.value === nextVal);
        if (nextMatchIndex !== -1) {
          sequence.push(G.table[nextMatchIndex].id);
          nextVal = nextVal < 10 ? nextVal + 1 : null;
        } else break;
      }
    }
    return sequence;
  }, [G.pendingCapture, G.table]);

  const [captureStep, setCaptureStep] = React.useState(0);
  const [captureRects, setCaptureRects] = React.useState({});

  const getWrapperForCard = (cardId) => {
    if (!G.pendingCapture || captureSequence.length === 0) return cardId;
    if (cardId === G.pendingCapture.playedCardId) return captureSequence[0];
    return cardId;
  };

  React.useEffect(() => {
    let timerId;
    const isDerbaActive = activeEvent && (activeEvent.type === 'Derba' || activeEvent.type === 'Taawida');
    
    if (G.pendingCapture) {
      if (captureSequence.length > 0) {
        if (Object.keys(captureRects).length === 0) {
          const rects = {};
          G.table.forEach(card => {
            const el = document.getElementById(`table-wrapper-${card.id}`);
            if (el) rects[card.id] = el.getBoundingClientRect();
          });
          setCaptureRects(rects);
        }
      } else if (!isDerbaActive) {
        const isOnline = !!ctx.multiplayer;
        const isMyCapture = G.pendingCapture.player === myID;
        if (isMyCapture || (!isOnline && myID === '0')) {
          timerId = setTimeout(() => {
            if (G.pendingCapture) moves.processCapture();
          }, 1500);
        }
      }
    } else {
      if (captureStep !== 0) setCaptureStep(0);
      if (Object.keys(captureRects).length !== 0) setCaptureRects({});
    }
    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [G.pendingCapture, captureSequence, captureRects, G.table, ctx.multiplayer, myID, moves, activeEvent]);

  // Progress the animation sequence
  React.useEffect(() => {
    let timerId;
    const isDerbaActive = activeEvent && (activeEvent.type === 'Derba' || activeEvent.type === 'Taawida');
    
    if (G.pendingCapture && captureSequence.length > 0 && Object.keys(captureRects).length > 0 && !isDerbaActive) {
      if (captureStep < captureSequence.length) {
        timerId = setTimeout(() => {
          setCaptureStep(prev => prev + 1);
        }, 1000);
      } else {
        const isOnline = !!ctx.multiplayer;
        const isMyCapture = G.pendingCapture?.player === myID;
        if (isMyCapture || (!isOnline && myID === '0')) {
          timerId = setTimeout(() => {
            if (G.pendingCapture) moves.processCapture();
          }, 0);
        }
      }
    }
    return () => clearTimeout(timerId);
  }, [captureStep, captureSequence.length, captureRects, G.pendingCapture, ctx.multiplayer, moves, myID, activeEvent]);

  const canCounterDerba = React.useMemo(() => {
    if (!activeEvent || (activeEvent.type !== 'Derba' && activeEvent.type !== 'Taawida')) return false;
    const isVictim = activeEvent.player !== myID;
    if (!isVictim) return false;
    const matchVal = activeEvent.currentVal;
    const hasMatch = G.players?.[myID]?.hand?.some(c => c.value === matchVal);
    return !!hasMatch;
  }, [activeEvent, myID, G.players]);

  return {
    activeEvent,
    setActiveEvent,
    eventQueue,
    setEventQueue,
    canCounterDerba,
    showGameOverOverlay,
    captureSequence,
    captureStep,
    setCaptureStep,
    captureRects,
    setCaptureRects,
    getWrapperForCard,
  };
};
