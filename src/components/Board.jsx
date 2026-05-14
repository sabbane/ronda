import React from 'react';
import { PlayerHand } from './PlayerHand';
import { Card } from './Card';
import { motion, AnimatePresence } from 'framer-motion';

import { DonateButton } from './DonateButton';
import { useLanguage } from '../contexts/LanguageContext';

export const RondaBoard = ({ G, ctx, moves, playerID }) => {

  const { t } = useLanguage();
  const myID = playerID || '0';
  const opponentID = myID === '0' ? '1' : '0';
  const [activeEvent, setActiveEvent] = React.useState(null);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const cardRefs = React.useRef(new Map());

  const isCurrentPlayer = (id) => {
    const isTurn = ctx.currentPlayer === id;
    const inStage = ctx.activePlayers && ctx.activePlayers[id];
    return isTurn && !inStage && !G.isAnimating && !G.announcements?.length;
  };


  const handlePlayCard = (cardIndex) => {
    if (isProcessing || G.isAnimating || (G.announcements && G.announcements.length > 0)) return;
    
    setIsProcessing(true);
    // Add a slight delay before playing to let the user see their selection
    setTimeout(() => {
      moves.playCard(cardIndex);
      setIsProcessing(false);
    }, 400);
  };


  const [eventQueue, setEventQueue] = React.useState([]);
  const processedAnnouncements = React.useRef(new Set());

  // Watch for new announcements and add them to a queue
  React.useEffect(() => {
    if (G.announcements && G.announcements.length > 0) {
      G.announcements.forEach((ann, idx) => {
        const annId = `${ctx.turn}-${idx}-${ann.type}-${ann.player}`;
        if (!processedAnnouncements.current.has(annId)) {
          processedAnnouncements.current.add(annId);
          
          const isMe = ann.player === myID;
          const name = isMe ? t('you') : t('opponent');
          
          let customText = "";
          let customTitle = ann.type;
          let customIcon = "✨";

          if (ann.type === 'Ronda') customText = t('announcements.ronda', { name });
          if (ann.type === 'Tringa') customText = t('announcements.tringa', { name });
          if (ann.type === 'Missa') {
            customText = t('announcements.missa', { name });
            customIcon = "🧹";
          }
          if (ann.type === 'Derba') {
            customText = t('announcements.derba', { name });
            customIcon = "🎯";
          }
          if (ann.type === 'Taawida') {
            if (ann.streak === 3) {
              customTitle = t('announcements.counterAttackTitle');
              customText = t('announcements.counterAttackDesc');
              customIcon = "🥊"; // Punch for counter
            } else if (ann.streak === 4) {
              customTitle = t('announcements.ultimateCounterTitle');
              customText = t('announcements.ultimateCounterDesc');
              customIcon = "☢️"; // Nuclear for ultimate
            } else {
              customText = t('announcements.taawida', { name });
            }
          }
          if (ann.type === 'Clash') {
            customText = t('announcements.clash');
            customIcon = "⚔️";
          }
          if (ann.type === 'Clash Won') {
            const type = ann.rankType || (ann.text && typeof ann.text === 'string' ? (ann.text.match(/with (.*)!/) || [])[1] : '');
            const pts = ann.pts || 5;
            customText = t('announcements.clashWon', { name, type, pts });
            customIcon = "⚔️";
          }
          if (ann.type === 'Clash Draw') {
            customText = t('announcements.clashDraw');
            customIcon = "🤝";
          }
          if (ann.type === 'King Finish') {
            customText = t('announcements.kingFinish', { name });
            customIcon = "👑";
          }
          if (ann.type === 'TringaWins') {
            customText = t('announcements.tringaWins', { name });
            customTitle = "Tringa Wins";
            customIcon = "🏆";
          }
          if (ann.type === 'Final Fail') {
            customTitle = t('announcements.finalFailTitle');
            customText = t('announcements.finalFailDesc');
            customIcon = "📉";
          }
          if (ann.type === 'As Finish') {
            customTitle = t('announcements.asFinishTitle');
            customText = t('announcements.asFinishDesc');
            customIcon = "🂱";
          }

          // Determine color variant based on who gets points
          let variant = "info";
          const pointEvents = ['Ronda', 'Tringa', 'Missa', 'Derba', 'Taawida', 'Clash Won', 'King Finish', 'TringaWins'];
          const failEvents = ['Final Fail', 'As Finish'];

          if (pointEvents.includes(ann.type)) {
            variant = isMe ? "success" : "danger";
          } else if (failEvents.includes(ann.type)) {
            // If I fail, it's danger (red). If opponent fails, it's success (green).
            variant = isMe ? "danger" : "success";
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
  }, [G.announcements, myID, ctx.turn]);

  // Process the event queue sequentially
  React.useEffect(() => {
    if (!activeEvent && eventQueue.length > 0) {
      const next = eventQueue[0];
      setActiveEvent(next);
      setEventQueue(prev => prev.slice(1));
    }
  }, [eventQueue, activeEvent]);

  // Automatically clear the active event after 2.5 seconds
  React.useEffect(() => {
    if (activeEvent) {
      const timer = setTimeout(() => setActiveEvent(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [activeEvent]);

  // Tell the game state we are done displaying events so the bot can resume
  React.useEffect(() => {
    if (
      eventQueue.length === 0 && 
      !activeEvent && 
      G.announcements && 
      G.announcements.length > 0 &&
      ctx.activePlayers && 
      ctx.activePlayers[myID] === 'waitForUI'
    ) {
      moves.clearAnnouncements();
    }
  }, [eventQueue.length, activeEvent, G.announcements, ctx.activePlayers, myID, moves]);

  // Handle animation wait (flying cards)
  React.useEffect(() => {
    if (G.isAnimating && !G.pendingCapture && ctx.activePlayers && ctx.activePlayers[myID] === 'waitForUI') {
      const timer = setTimeout(() => {
        moves.endAnimation();
      }, 1500); // 1.5s wait for animations
      return () => clearTimeout(timer);
    }
  }, [G.isAnimating, G.pendingCapture, ctx.activePlayers, myID, moves]);



  // Dealing cards is now handled automatically in the game logic (turn.onBegin)


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
    // playedCard is ALWAYS rendered in sequence[0]'s wrapper to fly there directly
    if (cardId === G.pendingCapture.playedCardId) return captureSequence[0];
    // ALL OTHER CARDS stay in their OWN wrappers!
    return cardId;
  };

  React.useEffect(() => {
    let timerId;
    if (G.pendingCapture) {
      if (captureSequence.length > 0) {
        // Only capture rects once at the start
        if (Object.keys(captureRects).length === 0) {
          const rects = {};
          G.table.forEach(card => {
            const el = document.getElementById(`table-wrapper-${card.id}`);
            if (el) rects[card.id] = el.getBoundingClientRect();
          });
          setCaptureRects(rects);
        }
      } else {
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
  }, [G.pendingCapture, captureSequence, captureRects, G.table, ctx.multiplayer, myID, moves]);

  // Progress the animation sequence
  React.useEffect(() => {
    let timerId;
    if (G.pendingCapture && captureSequence.length > 0 && Object.keys(captureRects).length > 0) {
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
          }, 1000);
        }
      }
    }
    return () => clearTimeout(timerId);
  }, [captureStep, captureSequence.length, captureRects, G.pendingCapture, ctx.multiplayer, moves, myID]);

  let winner = null;
  if (G.gameStatus) {
    winner = G.gameStatus.winner !== undefined ? G.gameStatus.winner : 'Draw';
  }

  const playedCardId = G.isAnimating ? (G.pendingCapture?.playedCardId || G.lastPlayedCard?.streakCards?.[0]?.id) : null;

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-2 sm:p-4 font-sans text-slate-100 relative overflow-y-auto overflow-x-hidden">
        {/* Subtle Game Background */}
        <div 
          className="fixed inset-0 pointer-events-none"
          style={{
            backgroundImage: "url('/assets/game_background.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(0.7)',
            zIndex: 0
          }}
        />

        {/* Back to Menu Button */}
        <div className="absolute top-4 start-4 z-[60]">
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('ronda-menu'))}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800/80 hover:bg-slate-700 backdrop-blur-md text-slate-200 rounded-full border border-white/10 transition-all active:scale-95 shadow-lg group"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="18" height="18" 
              viewBox="0 0 24 24" 
              fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              className="group-hover:-translate-x-1 transition-transform rtl:group-hover:translate-x-1"
            >
            <path d="m15 18-6-6 6-6"/>
            </svg>
            <span className="text-sm font-bold uppercase tracking-wider">{t('backToMenu')}</span>
          </button>
        </div>
        
        {/* Central Event Notification Overlay */}
        <AnimatePresence>
          {activeEvent && (() => {
            const isBigEvent = activeEvent.streak >= 3 || activeEvent.type === 'King Finish' || activeEvent.type === 'Final Fail' || activeEvent.type === 'As Finish';
            return (
              <motion.div 
                key={activeEvent.id}
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
              >
                {/* Nuclear Flash for Ultimate Counter (Streak 4) */}
                {activeEvent.streak === 4 && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 1, 0] }}
                    transition={{ duration: 0.5, times: [0, 0.1, 0.4, 1] }}
                    className="fixed inset-0 bg-white z-[101]"
                  />
                )}

                <motion.div
                  initial={{ scale: 0.5, y: 20, rotate: -5 }}
                  animate={
                    activeEvent.streak === 4 
                      ? { 
                          scale: [0.5, 1.5, 1.2], 
                          rotate: [0, -10, 10, -10, 5],
                          x: [0, -25, 25, -25, 25, 0], // Extreme Screen shake
                          y: [0, -15, 15, -15, 15, 0]
                        }
                      : activeEvent.streak === 3
                      ? {
                          scale: [0.5, 1.3, 1],
                          y: [20, -30, 0], // Punch impact
                          rotate: [0, 5, 0]
                        }
                      : { scale: 1, y: 0, rotate: 0 }
                  }
                  transition={
                    activeEvent.streak === 4 
                      ? { duration: 0.6, ease: "easeOut" }
                      : { type: "spring", stiffness: 400, damping: 12 }
                  }
                  className={`
                    flex flex-col items-center text-center backdrop-blur-2xl
                    ${isBigEvent ? 'p-10 md:p-16 rounded-[4rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] border-8' : 'p-6 md:p-10 rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.3)] border-4'}
                    ${
                      activeEvent.streak === 4 ? 'bg-orange-600/95 border-yellow-400' : 
                      activeEvent.displayVariant === 'success' ? 'bg-emerald-600/95 border-emerald-400 shadow-emerald-500/40' :
                      activeEvent.displayVariant === 'danger' ? 'bg-rose-600/95 border-rose-400 shadow-rose-500/40' :
                      'bg-indigo-600/90 border-indigo-400'
                    }
                  `}
                >
                  <motion.div
                    animate={
                      activeEvent.streak === 4 
                        ? { 
                            scale: [1, 2.5, 1], 
                            filter: ["drop-shadow(0 0 0px #fff)", "drop-shadow(0 0 30px #fff)", "drop-shadow(0 0 0px #fff)"] 
                          }
                        : { scale: [1, 1.2, 1], rotate: [0, -10, 10, 0] }
                    }
                    transition={{ repeat: Infinity, duration: activeEvent.streak === 4 ? 0.2 : 0.8 }}
                    className={`
                      ${isBigEvent ? 'text-8xl md:text-[12rem] mb-6' : 'text-6xl md:text-8xl mb-3'}
                    `}
                  >
                    {activeEvent.displayIcon || '✨'}
                  </motion.div>
                  <h3 className={`
                    font-black italic tracking-tighter uppercase mb-2
                    ${isBigEvent ? 'text-5xl md:text-8xl' : 'text-3xl md:text-5xl'}
                    ${activeEvent.streak === 4 ? 'text-yellow-100 drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]' : 'text-white'}
                  `}>
                    {activeEvent.displayTitle || activeEvent.type}!
                  </h3>
                  <p className={`
                    font-bold text-indigo-50 opacity-100
                    ${isBigEvent ? 'text-2xl md:text-4xl' : 'text-lg md:text-2xl'}
                  `}>
                    {activeEvent.displayText || activeEvent.text}
                  </p>
                </motion.div>
              </motion.div>
            );
          })()}
        </AnimatePresence>

        {/* Side Announcements (Legacy) */}
        <div className="absolute top-1/4 start-8 flex flex-col gap-4 pointer-events-none z-40 hidden md:flex">
          <AnimatePresence>
            {G.announcements?.map((ann, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-slate-800/80 backdrop-blur text-white px-4 py-2 rounded-lg shadow-lg border border-slate-700 text-sm"
              >
                {ann.text}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Game Over / Round Over Overlay */}
        <AnimatePresence>
          {(G.gameStatus && ctx.activePlayers?.[myID] === 'gameOver') && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            >
              <motion.div 
                initial={{ scale: 0.8, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-slate-800 p-12 rounded-3xl border border-slate-700 shadow-2xl text-center"
              >
                <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  {t('gameOver')}
                </h2>
                <div className="text-2xl mb-2 font-medium">
                  {winner === 'Draw' ? t('itsADraw') : winner === myID ? t('youWon') : (winner === null ? t('roundOver') : t('opponentWon'))}
                </div>
                <div className="text-lg text-slate-400 mb-8 font-semibold uppercase tracking-widest">
                  {t('totalGames') || 'Total Games'}: {G.matchesWon ? G.matchesWon[myID] : 0} - {G.matchesWon ? G.matchesWon[opponentID] : 0}
                </div>
                <div className="flex gap-8 justify-center text-xl bg-slate-900/50 p-6 rounded-2xl border border-slate-700/50">
                  <div className="flex flex-col items-center">
                    <span className="text-sm text-slate-400 mb-1">{t('you')}</span>
                    <span className="text-3xl font-bold text-indigo-400">
                      {G.gameStatus ? G.gameStatus[`p${myID}Score`] : 0}
                    </span>
                  </div>
                  <div className="w-px bg-slate-700"></div>
                  <div className="flex flex-col items-center">
                    <span className="text-sm text-slate-400 mb-1">{t('opponent')}</span>
                    <span className="text-3xl font-bold text-purple-400">
                      {G.gameStatus ? G.gameStatus[`p${opponentID}Score`] : 0}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                  <button 
                    onClick={() => {
                      moves.restartGame();
                    }}
                    className="px-8 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-full font-bold transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-amber-900/40 border border-amber-400/30"
                  >
                    {t('playAgain')}
                  </button>
                  <button 
                    onClick={() => window.dispatchEvent(new CustomEvent('ronda-menu'))}
                    className="px-8 py-3 bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-full font-bold transition-all transform hover:scale-105 active:scale-95 shadow-lg border border-slate-600"
                  >
                    {t('mainMenu')}
                  </button>
                </div>
                
                <div className="mt-8 pt-8 border-t border-slate-700/50">
                  <DonateButton showMessage={true} />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>



        {/* Opponent Area */}
        <div className="w-full max-w-4xl relative z-20 shrink-0">
          <div className="flex justify-between items-center px-4 sm:px-8 mb-0 sm:mb-2">
            <div className="text-base sm:text-lg font-medium text-slate-400 flex items-center gap-3">
              {t('opponent')}
              {isCurrentPlayer(opponentID) && (
                <span className="flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-purple-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
                </span>
              )}
            </div>
            <div className="flex gap-4 items-center">
              <div className="relative w-8 h-12">
                {G.players[opponentID]?.captured.map((card) => (
                  <motion.div
                    key={`cap-opp-${card.id}`}
                    layoutId={`card-${card.id}`}
                    transition={{ type: "spring", stiffness: 40, damping: 12, mass: 1.2 }}
                    className="absolute inset-0 bg-purple-900/50 border border-purple-700/50 rounded-sm shadow-sm"
                  />
                ))}
              </div>
              <div className="bg-slate-800 px-4 py-1 rounded-full text-sm border border-slate-700 shadow-inner flex items-center gap-2">
                <span className="text-slate-400">{t('cards')}</span> 
                <span className="font-bold text-lg text-purple-400">
                  {((G.players && G.players[opponentID]?.captured?.length) || 0) + ((G.players && G.players[opponentID]?.score) || 0)}
                </span>
              </div>
            </div>
          </div>
          <PlayerHand 
            hand={(G.players && G.players[opponentID]?.hand) || []} 
            isCurrentPlayer={false} 
            hidden={true}
            dealDelay={0.75}
            playedCardId={playedCardId}
          />
        </div>

        {/* Table Area - Min height for exactly 2 rows, grows on 3rd row */}
        <div className="w-full flex items-center justify-center my-1 sm:my-2 relative z-10 shrink-0" dir="ltr">
          <div className="relative w-full max-w-4xl min-h-[14rem] sm:min-h-[21rem] md:min-h-[23rem] bg-emerald-900/40 rounded-3xl border-4 border-emerald-800/50 shadow-2xl shadow-emerald-900/20 backdrop-blur-sm flex flex-wrap gap-1 sm:gap-3 p-2 sm:p-6 items-center justify-center">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/felt.png')] opacity-10 rounded-3xl mix-blend-overlay pointer-events-none"></div>
            
            <AnimatePresence>
              {G.table.map((baseCard) => {
                // If this base wrapper is supposed to be empty because its card moved, we render just the empty wrapper
                const isBaseCardMoved = G.pendingCapture && getWrapperForCard(baseCard.id) !== baseCard.id;
                
                // Find all cards that belong in this wrapper right now
                const cardsInWrapper = G.table.filter(c => getWrapperForCard(c.id) === baseCard.id);

                return (
                  <div
                    id={`table-wrapper-${baseCard.id}`}
                    key={`table-wrapper-${baseCard.id}`}
                    className="w-16 h-24 sm:w-20 sm:h-32 md:w-24 md:h-36 shrink-0 relative"
                  >
                    {!isBaseCardMoved && cardsInWrapper.map(card => {
                      const isNormalDropCheck = !G.pendingCapture && G.lastPlayedCard?.streakCards?.length === 1 && G.lastPlayedCard.streakCards[0].id === card.id && G.isAnimating;
                      const isPlayedBadge = (G.pendingCapture?.playedCardId === card.id) || isNormalDropCheck;
                      
                      let animX = 0;
                      let animY = 0;
                      let animScale = 1;
                      let animZ = isPlayedBadge ? 50 : 1;
                      let transition = { duration: 0.3, type: "spring", stiffness: 100 };
                      
                      if (G.pendingCapture && Object.keys(captureRects).length > 0 && captureRects[card.id]) {
                        const isPlayedCard = card.id === G.pendingCapture.playedCardId;
                        const seqIndex = captureSequence.indexOf(card.id);
                        const isCollected = seqIndex !== -1 && seqIndex < captureStep;
                        
                        if (isPlayedCard || isCollected) {
                          const targetStep = Math.min(captureStep, captureSequence.length - 1);
                          const targetId = captureSequence[targetStep];
                          const targetRect = captureRects[targetId];
                          
                          // playedCard mounts in sequence[0] wrapper, others in their own wrapper
                          const sourceRectId = isPlayedCard ? captureSequence[0] : card.id;
                          const sourceRect = captureRects[sourceRectId];
                          
                          if (targetRect && sourceRect) {
                            let stackIndex = 0;
                            if (isPlayedCard) {
                              stackIndex = captureStep + 1;
                            } else if (isCollected) {
                              stackIndex = captureStep - seqIndex;
                            }
                            
                            const offsetX = -(stackIndex * 6);
                            const offsetY = (stackIndex * 6);

                            animX = (targetRect.left - sourceRect.left) + offsetX;
                            animY = (targetRect.top - sourceRect.top) + offsetY;
                            animZ = 60 + stackIndex;
                            transition = { duration: 1.0, type: "tween", ease: "easeInOut" };
                          }
                        } else if (seqIndex === captureStep) {
                          animScale = 1.05;
                          animZ = 40;
                        }
                      }


                      const playedByMe = G.pendingCapture ? G.pendingCapture.player === myID : G.lastPlayedCard?.player === myID;
                      const fallbackY = playedByMe ? 200 : -200;

                      return (
                        <motion.div
                          key={`table-card-${card.id}`}
                          layoutId={`card-${card.id}`}
                          initial={isPlayedBadge ? false : { opacity: 0, scale: 0.5, y: fallbackY }}
                          animate={{ opacity: 1, scale: animScale, x: animX, y: animY }}
                          exit={{ opacity: 0, scale: 1.5, filter: 'blur(10px)' }}
                          style={{ zIndex: animZ }}
                          className={`absolute inset-0 w-full h-full ${isPlayedBadge ? "z-50" : ""}`}
                          transition={transition}
                        >
                          <Card 
                            card={card} 
                            className={`shadow-2xl ${isPlayedBadge ? 'ring-4 ring-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.6)]' : 'transition-transform hover:scale-105'}`} 
                          />
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: isPlayedBadge ? 1 : 0, y: isPlayedBadge ? 0 : 10 }}
                            className="absolute -top-10 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 font-black px-3 py-1 rounded-full text-xs whitespace-nowrap shadow-lg uppercase tracking-wider pointer-events-none"
                          >
                            {t('played')}
                          </motion.div>
                        </motion.div>
                      );
                    })}
                  </div>
                );
              })}
            </AnimatePresence>
            
            {G.table.length === 0 && (
              <div className="text-emerald-700/50 text-3xl font-bold uppercase tracking-widest absolute">
                {t('tableEmpty')}
              </div>
            )}
          </div>
        </div>

        {/* Player Area */}
        <div className="w-full max-w-4xl relative z-20 shrink-0">
          <div className="flex justify-between items-center px-4 sm:px-8 mt-0 sm:mt-2">
            <div className="flex items-center gap-3">
              <div className={`text-lg font-medium ${isCurrentPlayer(myID) ? 'text-indigo-400' : 'text-slate-400'}`}>
                {t('you')} {isCurrentPlayer(myID) && t('yourTurn')}
              </div>
              {isCurrentPlayer(myID) && (
                <span className="flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                </span>
              )}
            </div>
            <div className="flex gap-4 items-center">
              <div className="relative w-8 h-12">
                {G.players[myID]?.captured.map((card) => (
                  <motion.div
                    key={`cap-me-${card.id}`}
                    layoutId={`card-${card.id}`}
                    transition={{ type: "spring", stiffness: 40, damping: 12, mass: 1.2 }}
                    className="absolute inset-0 bg-indigo-900/50 border border-indigo-700/50 rounded-sm shadow-sm"
                  />
                ))}
              </div>
              <div className="bg-slate-800 px-4 py-1 rounded-full text-sm border border-slate-700 shadow-inner flex items-center gap-2">
                <span className="text-slate-400">{t('cards')}</span> 
                <span className="font-bold text-lg text-indigo-400">
                  {((G.players && G.players[myID]?.captured?.length) || 0) + ((G.players && G.players[myID]?.score) || 0)}
                </span>
              </div>
            </div>
          </div>
          <PlayerHand 
            hand={(G.players && G.players[myID]?.hand) || []} 
            isCurrentPlayer={isCurrentPlayer(myID) && !isProcessing} 
            onPlayCard={handlePlayCard} 
            playedCardId={playedCardId}
          />

          {/* Deck Info - Moved below player hand to prevent overlap on mobile */}
          <div className="flex justify-start px-2 sm:px-8 mt-4 sm:mt-6 pb-4 sm:pb-6">
            <div className="flex items-center gap-2 bg-slate-800/80 backdrop-blur px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-slate-700 shadow-lg z-20">
              <div className="w-5 h-7 sm:w-6 sm:h-8 bg-indigo-600 rounded border border-indigo-400 shadow flex items-center justify-center">
                <span className="text-[10px]">✨</span>
              </div>
              <span className="text-slate-300 font-medium text-xs sm:text-sm">{t('cardsRemaining')}: {G.deck.length}</span>
            </div>
          </div>
        </div>
    </div>
  );
};
