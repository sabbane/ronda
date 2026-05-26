import React from 'react';
import { PlayerHand } from './PlayerHand';
import { Card } from './Card';
import { motion, AnimatePresence } from 'framer-motion';
import backCard from '../assets/cards/back.png';

import { useLanguage } from '../contexts/LanguageContext';
import { adService } from '../services/AdService';
import { useSound } from '../contexts/SoundContext';
import { Volume2, VolumeX, Music, Copy } from 'lucide-react';

export const RondaBoard = ({ G, ctx, moves, playerID, matchID, isConnected }) => {

  const { language, t } = useLanguage();
  const moroccanSymbols = [
    // Khamsa (Hand of Fatima)
    ({ color }) => (
      <svg viewBox="0 0 64 80" fill={color} xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
        <path d="M32 2 C28 2 26 6 26 10 L26 30 C22 28 18 28 16 32 C14 36 16 40 20 41 L20 55 C20 62 25 68 32 68 C39 68 44 62 44 55 L44 41 C48 40 50 36 48 32 C46 28 42 28 38 30 L38 10 C38 6 36 2 32 2 Z M22 12 C20 12 18 14 18 16 L18 36 C17 36 14 35 13 33 C12 30 14 27 17 28 L17 14 C17 11 19 10 21 10 C23 10 24 11 24 13 Z M42 12 C44 12 46 14 46 16 L46 36 C47 36 50 35 51 33 C52 30 50 27 47 28 L47 14 C47 11 45 10 43 10 C41 10 40 11 40 13 Z"/>
        <circle cx="32" cy="45" r="5"/>
      </svg>
    ),
    // 8-pointed star (Moroccan Zellige)
    ({ color }) => (
      <svg viewBox="0 0 64 64" fill={color} xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
        <polygon points="32,4 37,24 56,19 41,32 56,45 37,40 32,60 27,40 8,45 23,32 8,19 27,24"/>
        <polygon points="32,4 37,24 56,19 41,32 56,45 37,40 32,60 27,40 8,45 23,32 8,19 27,24" transform="rotate(22.5 32 32)" opacity="0.6"/>
      </svg>
    ),
    // Crescent Moon
    ({ color }) => (
      <svg viewBox="0 0 64 64" fill={color} xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
        <path d="M32 6 C18 6 8 17 8 32 C8 47 18 58 32 58 C40 58 47 54 51 48 C47 50 42 51 38 49 C27 45 20 34 23 22 C25 14 31 8 38 6 C36 6 34 6 32 6 Z"/>
      </svg>
    ),
    // Moroccan Lantern (Fanar)
    ({ color }) => (
      <svg viewBox="0 0 40 70" fill={color} xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
        <rect x="17" y="0" width="6" height="8" rx="2"/>
        <polygon points="20,8 5,18 5,55 20,62 35,55 35,18"/>
        <line x1="5" y1="25" x2="35" y2="25" stroke="black" strokeWidth="1.5" opacity="0.3"/>
        <line x1="5" y1="35" x2="35" y2="35" stroke="black" strokeWidth="1.5" opacity="0.3"/>
        <line x1="5" y1="45" x2="35" y2="45" stroke="black" strokeWidth="1.5" opacity="0.3"/>
        <polygon points="20,62 10,68 30,68" />
      </svg>
    ),
    // Arabesque / Geometric flower
    ({ color }) => (
      <svg viewBox="0 0 64 64" fill={color} xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
        <circle cx="32" cy="32" r="10"/>
        {[0,45,90,135,180,225,270,315].map((angle, i) => (
          <ellipse key={i} cx="32" cy="32" rx="6" ry="16"
            transform={`rotate(${angle} 32 32)`} opacity="0.75"/>
        ))}
      </svg>
    ),
  ];
  const [confettiConfig] = React.useState(() => {
    const colors = ['#fde047', '#f97316', '#34d399', '#f472b6', '#a78bfa', '#38bdf8', '#fb7185', '#4ade80'];
    return [...Array(40)].map((_, i) => ({
      left: `${Math.random() * 100}vw`,
      scale: Math.random() * 0.6 + 0.4,
      rotateTo: Math.random() * 720 - 360,
      xTo: `+=${Math.random() * 120 - 60}px`,
      duration: Math.random() * 4 + 3,
      delay: Math.random() * 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      symbolIndex: i % 5,
    }));
  });
  const myID = playerID || '0';
  const opponentID = myID === '0' ? '1' : '0';
  const [activeEvent, setActiveEvent] = React.useState(null);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [isAdPlaying, setIsAdPlaying] = React.useState(false);
  const isLeavingRef = React.useRef(false);

  const {
    isMuted,
    toggleMute,
    currentTrack,
    tracks,
    nextTrack,
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
  } = useSound();

  React.useEffect(() => {
    adService.sendGameReady();
  }, []);

  React.useEffect(() => {
    if (isLeavingRef.current) {
      console.log('[Board] Skipping setPlayerName because player is leaving.');
      return;
    }
    const savedNickname = localStorage.getItem('ronda_nickname') || 'Spieler';
    const isInLobbyStage = G.gameStarted === false || ctx.activePlayers?.[myID] === 'lobby';
    console.log('[Board] myID:', myID, 'matchID:', matchID, 'savedNickname:', savedNickname, 'currentNameInG:', G.players?.[myID]?.name, 'isConnected:', isConnected, 'isInLobbyStage:', isInLobbyStage, 'gameStarted:', G.gameStarted, 'activePlayers:', ctx.activePlayers);
    if (isConnected && isInLobbyStage && G.players && G.players[myID] && G.players[myID].name !== savedNickname) {
      console.log('[Board] calling setPlayerName with:', savedNickname);
      moves.setPlayerName(savedNickname);
    }
  }, [myID, G.players, moves, isConnected, ctx.activePlayers, G.gameStarted]);

  React.useEffect(() => {
    if (G.hostLeft === true && myID === '1' && G.gameStarted === false) {
      window.dispatchEvent(new CustomEvent('ronda-host-left'));
    }
  }, [G.hostLeft, myID, G.gameStarted]);

  React.useEffect(() => {
    const handleAdStart = () => {
      console.log('[Board] Ad started. Pausing game interactions.');
      setIsAdPlaying(true);
    };
    const handleAdComplete = () => {
      console.log('[Board] Ad completed. Resuming game.');
      setIsAdPlaying(false);
    };

    window.addEventListener('ronda-ad-started', handleAdStart);
    window.addEventListener('ronda-ad-completed', handleAdComplete);

    return () => {
      window.removeEventListener('ronda-ad-started', handleAdStart);
      window.removeEventListener('ronda-ad-completed', handleAdComplete);
    };
  }, []);

  // 1. Play card deal sound when new cards are dealt (total cards in hands increase)
  const p0HandLength = G.players['0']?.hand?.length || 0;
  const p1HandLength = G.players['1']?.hand?.length || 0;
  const totalHandCards = p0HandLength + p1HandLength;
  const prevHandCards = React.useRef(totalHandCards);
  
  React.useEffect(() => {
    if (totalHandCards > prevHandCards.current) {
      playCardDeal();
    }
    prevHandCards.current = totalHandCards;
  }, [totalHandCards, playCardDeal]);

  // 2. Play card place sound when a card is played onto the table (table cards increase by 1)
  const tableLength = G.table?.length || 0;
  const prevTableLength = React.useRef(tableLength);

  React.useEffect(() => {
    if (tableLength > prevTableLength.current) {
      if (tableLength - prevTableLength.current === 1) {
        playCardPlace();
      }
    }
    prevTableLength.current = tableLength;
  }, [tableLength, playCardPlace]);

  // 3. Play card sweep sound when cards are captured (total captured cards increase)
  const p0Captured = G.players['0']?.captured?.length || 0;
  const p1Captured = G.players['1']?.captured?.length || 0;
  const totalCaptured = p0Captured + p1Captured;
  const prevCaptured = React.useRef(totalCaptured);

  React.useEffect(() => {
    if (totalCaptured > prevCaptured.current) {
      playCardSweep();
    }
    prevCaptured.current = totalCaptured;
  }, [totalCaptured, playCardSweep]);

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
        if (streak >= 3) {
          playRondaTringa(isSuccess);
        } else {
          playDerba(isSuccess);
        }
      } else if (type === 'Clash') {
        playClash(isSuccess);
      } else if (['Ronda', 'Tringa', 'TringaWins', 'Clash Won', 'King Finish', 'As Finish', 'Final Fail'].includes(type)) {
        playRondaTringa(isSuccess);
      }
    }
  }, [activeEvent, playMissa, playDerba, playRondaTringa, playClash]);

  // 5. Play Victory / Defeat sound when the game ends
  const isGameOver = !!(G.gameStatus && ctx.activePlayers?.[myID] === 'gameOver');
  const prevIsGameOver = React.useRef(isGameOver);

  React.useEffect(() => {
    if (isGameOver && !prevIsGameOver.current) {
      const gameWinner = G.gameStatus?.winner !== undefined ? G.gameStatus.winner : 'Draw';
      if (gameWinner === myID) {
        playVictory();
      } else {
        playDefeat();
      }
    }
    prevIsGameOver.current = isGameOver;
  }, [isGameOver, G.gameStatus, myID, playVictory, playDefeat]);

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
          const oppName = G.players[opponentID]?.name || t('opponent');
          
          let customText = "";
          let customTitle = ann.type;
          let customIcon = "✨";

          if (ann.type === 'Ronda') customText = isMe ? t('announcements.rondaMe', { oppName }) : t('announcements.rondaOpponent', { oppName });
          if (ann.type === 'Tringa') customText = isMe ? t('announcements.tringaMe', { oppName }) : t('announcements.tringaOpponent', { oppName });
          if (ann.type === 'Missa') {
            customText = isMe ? t('announcements.missaMe', { oppName }) : t('announcements.missaOpponent', { oppName });
            customIcon = "🧹";
          }
          if (ann.type === 'Derba') {
            customText = isMe ? t('announcements.derbaMe', { oppName }) : t('announcements.derbaOpponent', { oppName });
            customIcon = "🎯";
          }
          if (ann.type === 'Taawida') {
            if (ann.streak === 3) {
              customTitle = t('announcements.counterAttackTitle');
              customText = isMe ? t('announcements.counterAttackMe', { oppName }) : t('announcements.counterAttackOpponent', { oppName });
              customIcon = "🥊"; // Punch for counter
            } else if (ann.streak === 4) {
              customTitle = t('announcements.ultimateCounterTitle');
              customText = isMe ? t('announcements.ultimateCounterMe', { oppName }) : t('announcements.ultimateCounterOpponent', { oppName });
              customIcon = "☢️"; // Nuclear for ultimate
            }
          }
          if (ann.type === 'Clash') {
            customText = ann.clashType === 'Tringa' ? t('announcements.clashTringa') : t('announcements.clashRonda');
            customIcon = "⚔️";
          }
          if (ann.type === 'Clash Won') {
            const type = ann.rankType || (ann.text && typeof ann.text === 'string' ? (ann.text.match(/with (.*)!/) || [])[1] : '');
            const pts = ann.pts || (type === 'Tringa' ? 10 : 2);
            if (isMe) {
              customTitle = t('announcements.clashWonTitle');
              customText = type === 'Tringa' ? t('announcements.clashWonTringaMe', { pts, oppName }) : t('announcements.clashWonRondaMe', { pts, oppName });
            } else {
              customTitle = t('announcements.clashLostTitle');
              customText = type === 'Tringa' ? t('announcements.clashWonTringaOpp', { pts, oppName }) : t('announcements.clashWonRondaOpp', { pts, oppName });
            }
            customIcon = "⚔️";
          }
          if (ann.type === 'Clash Draw') {
            customText = t('announcements.clashDraw');
            customIcon = "🤝";
          }
          if (ann.type === 'King Finish') {
            customText = isMe ? t('announcements.kingFinishMe', { oppName }) : t('announcements.kingFinishOpponent', { oppName });
            customIcon = "👑";
          }
          if (ann.type === 'TringaWins') {
            customText = isMe ? t('announcements.tringaWinsMe', { oppName }) : t('announcements.tringaWinsOpponent', { oppName });
            customTitle = "Tringa Wins";
            customIcon = "🏆";
          }
          if (ann.type === 'Final Fail') {
            customTitle = t('announcements.finalFailTitle');
            customText = isMe ? t('announcements.finalFailMe', { oppName }) : t('announcements.finalFailOpponent', { oppName });
            customIcon = "📉";
          }
          if (ann.type === 'As Finish') {
            customTitle = t('announcements.asFinishTitle');
            customText = isMe ? t('announcements.asFinishMe', { oppName }) : t('announcements.asFinishOpponent', { oppName });
            customIcon = "🂱";
          }

          // Determine color variant based on who gets points
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [G.announcements, myID, ctx.turn]);

  // Process the event queue sequentially with a pause between popups
  React.useEffect(() => {
    if (!activeEvent && eventQueue.length > 0) {
      const timer = setTimeout(() => {
        const next = eventQueue[0];
        setActiveEvent(next);
        setEventQueue(prev => prev.slice(1));
      }, 500);
      return () => clearTimeout(timer);
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
      // Wait 800ms for the popup's exit animation to fully complete before clearing announcements on server
      const timer = setTimeout(() => {
        moves.clearAnnouncements();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [eventQueue.length, activeEvent, G.announcements, ctx.activePlayers, myID, moves]);

  // Handle animation wait (flying cards and dealing)
  React.useEffect(() => {
    if (G.isAnimating && !G.pendingCapture && ctx.activePlayers && ctx.activePlayers[myID] === 'waitForUI') {
      // Dealing new cards: last 3 cards settle at 1.25s delay + ~1s spring = ~2.25s.
      // Use 3.5s to be safe. Normal card flight only needs 1.5s.
      const isDealPhase = !G.lastPlayedCard;
      const delay = isDealPhase ? 3000 : 1500;
      const timer = setTimeout(() => {
        moves.endAnimation();
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [G.isAnimating, G.pendingCapture, G.lastPlayedCard, ctx.activePlayers, myID, moves]);



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
          // eslint-disable-next-line react-hooks/set-state-in-effect
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  if (G.gameStarted === false) {
    const inviteLink = `${window.location.protocol}//${window.location.host}${window.location.pathname}?room=${matchID || ''}`;
    const p0Name = G.players['0']?.name || 'Host';
    const p1Name = G.players['1']?.name || '';
    const hasGuestJoined = !!p1Name.trim();

    const handleShare = async () => {
      playClick();
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'Ronda',
            text: t('shareText') || 'Join my Ronda game!',
            url: inviteLink
          });
        } catch (err) {
          console.error('Share failed:', err);
        }
      } else {
        navigator.clipboard.writeText(inviteLink);
        alert(t('linkCopied') || 'Link copied to clipboard!');
      }
    };

    const handleLeaveLobby = () => {
      playClick();
      isLeavingRef.current = true;
      if (myID === '1') {
        moves.setPlayerName('');
      } else if (myID === '0') {
        moves.hostLeft();
      }
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('ronda-menu'));
      }, 100);
    };

    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center p-4 font-sans text-slate-100 relative overflow-y-auto overflow-x-hidden">
        <div 
          className="fixed inset-0 pointer-events-none"
          style={{
            backgroundImage: "url('/assets/background-zellig.svg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(0.45) saturate(1.05)',
            zIndex: 0
          }}
        />

        {/* Back to Menu Button */}
        <div className="absolute top-4 start-4 z-[60]">
          <button 
            onClick={handleLeaveLobby}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800/80 hover:bg-slate-700 backdrop-blur-md text-slate-200 rounded-full border border-white/10 transition-all active:scale-95 shadow-lg group cursor-pointer"
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

        {/* Music & Sound in Lobby */}
        <div className="absolute top-4 end-4 z-[60] flex items-center gap-2">
          <button 
            onClick={() => { playClick(); nextTrack(); }}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 backdrop-blur-md text-slate-200 rounded-full border border-white/10 transition-all active:scale-95 shadow-lg cursor-pointer"
          >
            <Music size={14} className="text-amber-400 animate-pulse" />
            <span className="text-slate-300 font-medium text-xs hidden sm:inline">{tracks && tracks[currentTrack] ? tracks[currentTrack].name : "Musik"}</span>
          </button>
          <button 
            onClick={toggleMute}
            className="flex items-center justify-center p-2 bg-slate-800/80 hover:bg-slate-700 backdrop-blur-md text-slate-200 rounded-full border border-white/10 transition-all active:scale-95 shadow-lg cursor-pointer"
          >
            {isMuted ? <VolumeX size={14} className="text-red-400" /> : <Volume2 size={14} className="text-emerald-400" />}
          </button>
        </div>

        {/* Main Lobby Glass Box */}
        <div className="bg-slate-900/80 backdrop-blur-2xl p-6 sm:p-10 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 text-center max-w-xl w-full relative z-10 my-8">
          <h1 className="text-4xl sm:text-5xl font-black mb-1 text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-500 tracking-tighter drop-shadow-2xl">
            {language === 'de' ? 'Spiel-Lobby' : 'Game Lobby'}
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mb-6 sm:mb-8 font-medium tracking-wide uppercase">
            {language === 'de' ? 'Warten auf Spieler...' : 'Waiting for players...'}
          </p>

          {/* Invitation / Room ID Card */}
          <div className="bg-black/40 border border-white/5 rounded-2xl p-4 mb-6 sm:mb-8 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400 uppercase tracking-widest font-bold">{language === 'de' ? 'Raum-ID' : 'Room ID'}</span>
              <span className="text-sm font-mono font-bold text-amber-300 bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/20 flex items-center gap-2">
                {matchID}
                <button
                  onClick={() => navigator.clipboard.writeText(matchID)}
                  className="p-1 hover:bg-amber-500/20 rounded-full transition-colors"
                  title={language === 'de' ? 'Kopieren' : 'Copy'}
                >
                  <Copy size={14} className="text-amber-300" />
                </button>
              </span>
            </div>
          </div>

          {/* Players Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
            {/* Player 0 (Host) Slot */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col items-center relative overflow-hidden group shadow-lg">
              <div className="absolute top-3 right-3 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full">
                Host
              </div>
              <div className="w-16 h-16 rounded-full bg-amber-600/20 border border-amber-500/30 flex items-center justify-center mb-3 text-amber-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              </div>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">{language === 'de' ? 'Spieler 1' : 'Player 1'}</span>
              
              {myID === '0' ? (
                <input
                  type="text"
                  maxLength={15}
                  value={G.players['0']?.name || ''}
                  onChange={(e) => moves.setPlayerName(e.target.value)}
                  className="bg-black/50 border border-white/10 rounded-xl px-3 py-1.5 text-center text-white text-sm font-bold focus:outline-none focus:border-amber-500/50 w-full"
                  placeholder={language === 'de' ? 'Dein Name' : 'Your name'}
                />
              ) : (
                <span className="text-base font-bold text-slate-200">{p0Name || 'Host'}</span>
              )}
            </div>

            {/* Player 1 (Guest) Slot */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col items-center relative overflow-hidden group shadow-lg">
              <div className="absolute top-3 right-3 bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full">
                {language === 'de' ? 'Gast' : 'Guest'}
              </div>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 ${hasGuestJoined ? 'bg-purple-600/20 border border-purple-500/30 text-purple-400' : 'bg-white/5 border border-white/5 text-slate-600 animate-pulse'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              </div>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">{language === 'de' ? 'Spieler 2' : 'Player 2'}</span>
              
              {!hasGuestJoined ? (
                <span className="text-xs font-semibold text-slate-500 animate-pulse uppercase tracking-wider py-1">
                  {language === 'de' ? 'Warte auf Gegner...' : 'Waiting for guest...'}
                </span>
              ) : myID === '1' ? (
                <input
                  type="text"
                  maxLength={15}
                  value={G.players['1']?.name || ''}
                  onChange={(e) => moves.setPlayerName(e.target.value)}
                  className="bg-black/50 border border-white/10 rounded-xl px-3 py-1.5 text-center text-white text-sm font-bold focus:outline-none focus:border-amber-500/50 w-full"
                  placeholder={language === 'de' ? 'Dein Name' : 'Your name'}
                />
              ) : (
                <span className="text-base font-bold text-slate-200">{p1Name}</span>
              )}
            </div>
          </div>

          {/* Lobby Controls */}
          <div className="border-t border-white/5 pt-6 flex flex-col gap-4">
            {myID === '0' ? (
              <button
                disabled={!hasGuestJoined || !G.players['0']?.name?.trim() || !G.players['1']?.name?.trim()}
                onClick={() => { playClick(); moves.startGame(); }}
                className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:opacity-30 disabled:pointer-events-none px-6 py-4 rounded-xl font-bold transition-all transform hover:scale-[1.02] active:scale-[0.98] text-lg shadow-xl cursor-pointer"
              >
                {language === 'de' ? 'Spiel starten' : 'Start Game'}
              </button>
            ) : (
              <div className="bg-black/20 border border-white/5 rounded-xl py-3 px-4 flex items-center justify-center gap-2.5">
                <span className="w-3.5 h-3.5 rounded-full border-2 border-t-purple-400 border-white/10 animate-spin"></span>
                <span className="text-xs font-semibold text-purple-300 uppercase tracking-wider">
                  {language === 'de' ? 'Warte auf Spielstart durch Host...' : 'Waiting for host to start...'}
                </span>
              </div>
            )}

            <button
              onClick={handleLeaveLobby}
              className="w-full bg-white/5 hover:bg-white/10 py-3 rounded-xl font-bold transition-all text-sm border border-white/5 text-slate-400 hover:text-slate-300 cursor-pointer"
            >
              {language === 'de' ? 'Raum verlassen' : 'Leave Lobby'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const playedCardId = G.isAnimating ? (G.pendingCapture?.playedCardId || G.lastPlayedCard?.streakCards?.[0]?.id) : null;

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-2 sm:p-4 font-sans text-slate-100 relative overflow-hidden">
        <div 
          className="fixed inset-0 pointer-events-none"
          style={{
            backgroundImage: "url('/assets/background-zellig.svg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(0.3) saturate(0.95)',
            zIndex: 0
          }}
        />

        {/* Back to Menu Button */}
        <div className="absolute top-4 start-4 z-[60]">
          <button 
            onClick={() => { playClick(); window.dispatchEvent(new CustomEvent('ronda-menu')); }}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800/80 hover:bg-slate-700 backdrop-blur-md text-slate-200 rounded-full border border-white/10 transition-all active:scale-95 shadow-lg group cursor-pointer"
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


        {/* Game Over / Round Over Overlay */}
        <AnimatePresence>
          {(G.gameStatus && ctx.activePlayers?.[myID] === 'gameOver') && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            >
              {winner === myID && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  {confettiConfig.map((confetti, i) => {
                    const Symbol = moroccanSymbols[confetti.symbolIndex];
                    return (
                      <motion.div
                        key={i}
                        initial={{ 
                          top: -80, 
                          left: confetti.left,
                          scale: confetti.scale,
                          rotate: 0,
                          opacity: 0.85,
                        }}
                        animate={{ 
                          top: '110vh',
                          rotate: confetti.rotateTo,
                          x: confetti.xTo,
                        }}
                        transition={{ 
                          duration: confetti.duration, 
                          repeat: Infinity, 
                          ease: 'linear',
                          delay: confetti.delay,
                        }}
                        className="absolute w-8 h-8 sm:w-10 sm:h-10"
                        style={{ filter: `drop-shadow(0 0 4px ${confetti.color}88)` }}
                      >
                        <Symbol color={confetti.color} />
                      </motion.div>
                    );
                  })}
                </div>
              )}
              <motion.div 
                initial={winner === myID ? { scale: 0.5, rotate: -5, y: 50 } : { scale: 0.8, y: 50 }}
                animate={winner === myID ? { scale: [0.5, 1.1, 1], rotate: 0, y: 0 } : { scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="bg-slate-800 pt-8 pb-10 px-12 rounded-3xl border border-slate-700 shadow-2xl text-center relative z-10 max-w-lg w-full mx-4"
              >
                <h2 className="text-5xl font-bold mb-3 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent leading-tight">
                  {t('gameOver')}
                </h2>
                <div className="text-3xl mb-4 font-bold">
                  {winner === 'Draw' 
                    ? <motion.span 
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        className="text-amber-400 flex flex-col gap-2 items-center"
                      >
                        <span>🤝 {t('itsADraw')} 🤝</span>
                      </motion.span>
                    : winner === myID 
                      ? <span className="text-emerald-400 flex flex-col gap-2 items-center">
                          <span>🎉 {t('youWon')} 🎉</span>
                        </span>
                      : (winner === null 
                          ? t('roundOver') 
                          : <span className="text-rose-400 flex flex-col gap-3 items-center">
                              <span>💔 {t('youLost')} 💔</span>
                              <motion.span 
                                animate={{ y: [0, -5, 0] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                className="text-base sm:text-lg text-slate-300 mt-2 font-normal italic"
                              >
                                {t('rematchMotivation')}
                              </motion.span>
                            </span>)
                  }
                </div>
                <div className="text-lg text-slate-400 mb-8 font-semibold uppercase tracking-widest">
                  {t('totalGames') || 'Total Games'}: {G.matchesWon ? G.matchesWon[myID] : 0} - {G.matchesWon ? G.matchesWon[opponentID] : 0}
                </div>
                <div className="flex gap-8 justify-center text-xl bg-slate-900/50 p-6 rounded-2xl border border-slate-700/50">
                  <div className="flex flex-col items-center">
                    <span className="text-sm text-slate-400 mb-1">{G.players[myID]?.name || t('you')}</span>
                    <span className="text-3xl font-bold text-indigo-400">
                      {G.gameStatus ? G.gameStatus[`p${myID}Score`] : 0}
                    </span>
                  </div>
                  <div className="w-px bg-slate-700"></div>
                  <div className="flex flex-col items-center">
                    <span className="text-sm text-slate-400 mb-1">{G.players[opponentID]?.name || t('opponent')}</span>
                    <span className="text-3xl font-bold text-purple-400">
                      {G.gameStatus ? G.gameStatus[`p${opponentID}Score`] : 0}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                  <button 
                    onClick={() => {
                      playClick();
                      adService.showInterstitial({
                        onBeforeAd: () => setIsAdPlaying(true),
                        onComplete: () => {
                          setIsAdPlaying(false);
                          moves.restartGame();
                        }
                      });
                    }}
                    className="px-8 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-full font-bold transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-amber-900/40 border border-amber-400/30 cursor-pointer"
                  >
                    {t('playAgain')}
                  </button>
                  <button 
                    onClick={() => {
                      playClick();
                      adService.showInterstitial({
                        onBeforeAd: () => setIsAdPlaying(true),
                        onComplete: () => {
                          setIsAdPlaying(false);
                          window.dispatchEvent(new CustomEvent('ronda-menu'));
                        }
                      });
                    }}
                    className="px-8 py-3 bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-full font-bold transition-all transform hover:scale-105 active:scale-95 shadow-lg border border-slate-600 cursor-pointer"
                  >
                    {t('mainMenu')}
                  </button>
                </div>

              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>



        {/* Opponent Area */}
        <div className="w-full max-w-4xl relative z-20 shrink-0">
          <div className="flex justify-between items-center px-4 sm:px-8 mb-0 sm:mb-2">
            <div className="text-base sm:text-lg font-medium text-slate-400 flex items-center gap-3">
              {G.players[opponentID]?.name || t('opponent')}
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
        <div className="w-full flex items-center justify-center my-0.5 sm:my-2 relative z-10 shrink-0" dir="ltr">
          <div className="game-table bg-emerald-900/40 border-green-700/90 shadow-2xl shadow-green-900/30" data-test-id="game-table">
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
                    className="game-card-container"
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
                {G.players[myID]?.name || t('you')} {isCurrentPlayer(myID) && t('yourTurn')}
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

          {/* Deck Info & Sound Toggle - Moved below player hand to prevent overlap on mobile */}
          <div className="flex justify-between items-center px-2 sm:px-8 mt-4 sm:mt-6 pb-4 sm:pb-6 w-full">
            <div className="flex items-center gap-2 bg-slate-800/80 backdrop-blur px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-slate-700 shadow-lg z-20">
              <div className="w-5 h-7 sm:w-6 sm:h-8 rounded-md border border-slate-200/30 shadow overflow-hidden flex-shrink-0 bg-white">
                <img src={backCard} alt="Card Back" className="w-full h-full object-cover" />
              </div>
              <span className="text-slate-300 font-medium text-xs sm:text-sm">{t('cardsRemaining')}: {G.deck.length}</span>
            </div>

            {/* Sound & Music Controls */}
            <div className="flex items-center gap-2 z-20">
              {/* Music Selector Button */}
              <button 
                onClick={() => { playClick(); nextTrack(); }}
                className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-slate-800/80 hover:bg-slate-700 backdrop-blur-md text-slate-200 rounded-full border border-slate-700 transition-all active:scale-95 shadow-lg cursor-pointer"
                title={tracks && tracks[currentTrack] ? `Track wechseln: ${tracks[currentTrack].name}` : "Track wechseln"}
              >
                <Music size={16} className="text-amber-400 animate-pulse" />
                <span className="text-slate-300 font-medium text-xs sm:text-sm">{tracks && tracks[currentTrack] ? tracks[currentTrack].name : "Musik"}</span>
              </button>

              {/* Sound Toggle Button */}
              <button 
                onClick={toggleMute}
                className="flex items-center justify-center p-2.5 sm:p-3 bg-slate-800/80 hover:bg-slate-700 backdrop-blur-md text-slate-200 rounded-full border border-slate-700 transition-all active:scale-95 shadow-lg cursor-pointer"
                title={isMuted ? "Unmute Sound" : "Mute Sound"}
              >
                {isMuted ? <VolumeX size={16} className="text-red-400" /> : <Volume2 size={16} className="text-emerald-400" />}
              </button>
            </div>
          </div>
        </div>

        {/* Ad Playing / Loading Glassmorphic Overlay */}
        <AnimatePresence>
          {isAdPlaying && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-md"
            >
              <div className="relative flex flex-col items-center p-8 rounded-3xl bg-slate-900/60 border border-white/10 shadow-2xl max-w-sm text-center">
                {/* Modern Ripple/Pulse Loading Ring */}
                <div className="relative w-16 h-16 mb-4 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 animate-spin"></div>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400 animate-pulse">
                    <rect width="20" height="15" x="2" y="7" rx="2" ry="2"/>
                    <path d="M17 2H7v5h10V2Z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-100 uppercase tracking-wider mb-2">
                  {t('adLoading')}
                </h3>
                <p className="text-sm text-slate-400">
                  {t('rematchMotivation')}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
    </div>
  );
};
