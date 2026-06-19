import React from 'react';

export const useAnnouncements = ({
  G,
  ctx,
  moves,
  myID,
  opponentID,
  numP,
  t
}) => {
  const [activeEvent, setActiveEvent] = React.useState(null);
  const lastActiveEventClearedAt = React.useRef(0);
  const [eventQueue, setEventQueue] = React.useState([]);
  const processedAnnouncements = React.useRef(new Set());

  const getPlayerName = (pID) => {
    const name = G.players?.[pID]?.name;
    if (name) return name;
    if (pID === opponentID && numP === 2) {
      const isArabic = t('opponent') === 'الخصم';
      const isTest = G.isTestMode || (typeof window !== 'undefined' && /^\/test\//i.test(window.location.pathname));
      if (isTest && pID === '1') {
        return isArabic ? 'الحاج' : 'El Haj';
      }
    }
    if (pID === myID) return t('you');
    return pID === opponentID ? t('opponent') : `Player ${Number(pID) + 1}`;
  };

  React.useEffect(() => {
    if (!G.gameStarted) {
      processedAnnouncements.current.clear();
      setTimeout(() => {
        setEventQueue([]);
      }, 0);
      return;
    }
    if (G.announcements && G.announcements.length > 0) {
      G.announcements.forEach((ann, idx) => {
        const annId = `${ctx.turn}-${idx}-${ann.type}-${ann.player}`;
        if (!processedAnnouncements.current.has(annId)) {
          processedAnnouncements.current.add(annId);
          
          const isMe = ann.player === myID;
          
          // Resolve announcer name
          let announcerName;
          let opponentName;
          if (numP === 2) {
            if (ann.player === myID) {
              announcerName = getPlayerName(myID);
              opponentName = getPlayerName(opponentID);
            } else {
              announcerName = getPlayerName(opponentID);
              opponentName = getPlayerName(myID);
            }
          } else {
            announcerName = getPlayerName(ann.player);
            const prevPlayerID = String((Number(ann.player) + 3) % 4);
            opponentName = getPlayerName(prevPlayerID);
          }
          
          // Resolve victim or failing player name
          const failingPlayerID = G.lastPlayedCard?.player || opponentID;
          let failingPlayerName;
          if (numP === 2) {
            if (failingPlayerID === myID) {
              failingPlayerName = getPlayerName(myID);
            } else {
              failingPlayerName = getPlayerName(opponentID);
            }
          } else {
            failingPlayerName = getPlayerName(failingPlayerID);
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
          if (ann.type === 'Darba') {
            const numPVal = ctx.numPlayers || 2;
            if (numPVal === 4) {
              const isHitterMyTeam = (ann.player === myID) || 
                (myID === '0' && ann.player === '2') || (myID === '2' && ann.player === '0') ||
                (myID === '1' && ann.player === '3') || (myID === '3' && ann.player === '1');
              
              const victimID = String((Number(ann.player) + 3) % 4);
              const isVictimMyTeam = (victimID === myID) ||
                (myID === '0' && victimID === '2') || (myID === '2' && victimID === '0') ||
                (myID === '1' && victimID === '3') || (myID === '3' && victimID === '1');

              const hitterName = G.players[ann.player]?.name || `Player ${Number(ann.player) + 1}`;
              const victimName = G.players[victimID]?.name || `Player ${Number(victimID) + 1}`;

              if (isHitterMyTeam) {
                if (myID === ann.player) {
                  customText = t('announcements.darbaMe4', { oppName: victimName });
                } else {
                  customText = t('announcements.darbaTeammate4', { hitterName, oppName: victimName });
                }
              } else {
                if (myID === victimID) {
                  customText = t('announcements.darbaOpponent4', { oppName: hitterName });
                } else if (isVictimMyTeam) {
                  customText = t('announcements.darbaTeammateOpponent4', { hitterName, victimName });
                } else {
                  customText = t('announcements.darbaOther4', { hitterName, victimName });
                }
              }
            } else {
              customText = isMe ? t('announcements.darbaMe', { oppName: opponentName }) : t('announcements.darbaOpponent', { oppName: announcerName });
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
              let joinedNames;
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
            const isWinnerMyTeam = (ann.player === myID) || 
              (numP === 4 && (
                (myID === '0' && ann.player === '2') || (myID === '2' && ann.player === '0') ||
                (myID === '1' && ann.player === '3') || (myID === '3' && ann.player === '1')
              ));
            if (isWinnerMyTeam) {
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
          if (ann.type === 'Ace Finish') {
            customTitle = t('announcements.asFinishTitle');
            customText = isMe ? t('announcements.asFinishMe', { oppName: failingPlayerName }) : t('announcements.asFinishOpponent', { oppName: announcerName });
            customIcon = "🂱";
          }

          let variant = "info";
          const allPointEvents = ['Ronda', 'Tringa', 'Missa', 'Darba', 'Taawida', 'Clash Won', 'King Finish', 'TringaWins', 'Final Fail', 'Ace Finish'];

          if (allPointEvents.includes(ann.type)) {
            const isTeamEvent = (ann.player === myID) || 
              (numP === 4 && (
                (myID === '0' && ann.player === '2') || (myID === '2' && ann.player === '0') ||
                (myID === '1' && ann.player === '3') || (myID === '3' && ann.player === '1')
              ));
            variant = isTeamEvent ? "success" : "danger";
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [G.announcements, myID, ctx.turn, G.gameStarted]);

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

  // Auto-clear active event
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

  // End animation stage after delay
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

  const hasPendingAnnouncements = eventQueue.length > 0 || !!activeEvent;
  const isGameOverState = !!(G?.gameStatus && ctx.activePlayers?.[myID] === 'gameOver');
  const showGameOverOverlay = isGameOverState && !hasPendingAnnouncements;

  const canCounterDarba = React.useMemo(() => {
    if (!activeEvent || (activeEvent.type !== 'Darba' && activeEvent.type !== 'Taawida')) return false;
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
    showGameOverOverlay,
    canCounterDarba
  };
};
