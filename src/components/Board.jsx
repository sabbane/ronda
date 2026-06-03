import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { adService } from '../services/AdService';
import { useSound } from '../contexts/SoundContext';
import { useBoardEvents } from '../hooks/useBoardEvents';

import { WaitingLobby } from './WaitingLobby';
import { Scoreboard } from './Scoreboard';
import { GameTable } from './GameTable';
import { Popups } from './Popups';
import { GameOverDisplay } from './GameOverDisplay';
import { PlayerSeats } from './PlayerSeats';
import { PlayerPanel } from './PlayerPanel';
import { AdOverlay } from './AdOverlay';

export const RondaBoard = ({ G, ctx, moves, playerID, matchID, isConnected, matchData }) => {
  const { language, t } = useLanguage();
  const myID = playerID || '0';
  const opponentID = myID === '0' ? '1' : '0';
  const numP = G.players ? Object.keys(G.players).length : 2;
  const leftID = numP === 4 ? String((parseInt(myID) + 3) % 4) : '';
  const topID = numP === 4 ? String((parseInt(myID) + 2) % 4) : '';
  const rightID = numP === 4 ? String((parseInt(myID) + 1) % 4) : '';

  const [isProcessing, setIsProcessing] = React.useState(false);
  const [isAdPlaying, setIsAdPlaying] = React.useState(false);
  const [opponentLeft, setOpponentLeft] = React.useState(false);
  const isLeavingRef = React.useRef(false);

  const boardContainerRef = React.useRef(null);
  const [shouldScroll, setShouldScroll] = React.useState(false);

  // Invoke the modular game events & side effects coordinator hook
  const {
    activeEvent,
    canCounterDerba,
    showGameOverOverlay,
    captureSequence,
    captureStep,
    captureRects,
    getWrapperForCard,
  } = useBoardEvents({
    G,
    ctx,
    moves,
    myID,
    opponentID,
    numP,
    t,
    language,
  });

  const {
    isMuted,
    toggleMute,
    currentTrack,
    tracks,
    nextTrack,
    playClick
  } = useSound();

  // Scroll and overflow adjustments
  React.useEffect(() => {
    const checkOverflow = () => {
      const container = boardContainerRef.current;
      if (container) {
        const hasOverflow = container.scrollHeight > window.innerHeight + 10;
        setShouldScroll(hasOverflow);
      }
    };

    checkOverflow();
    const t1 = setTimeout(checkOverflow, 100);
    const t2 = setTimeout(checkOverflow, 500);

    window.addEventListener('resize', checkOverflow);

    const observer = new MutationObserver(() => {
      checkOverflow();
      setTimeout(checkOverflow, 100);
    });
    const container = boardContainerRef.current;
    if (container) {
      observer.observe(container, { childList: true, subtree: true, attributes: true });
    }

    return () => {
      window.removeEventListener('resize', checkOverflow);
      observer.disconnect();
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [G, activeEvent]);

  // Sync player lobby data & setup
  React.useEffect(() => {
    adService.sendGameReady();
  }, []);

  React.useEffect(() => {
    if (isLeavingRef.current) return;
    const savedNickname = localStorage.getItem('ronda_nickname') || 'Spieler';
    const isInLobbyStage = G.gameStarted === false || ctx.activePlayers?.[myID] === 'lobby';
    if (isConnected && isInLobbyStage && G.players && G.players[myID] && G.players[myID].name !== savedNickname) {
      moves.setPlayerName(savedNickname);
    }
  }, [myID, G.players, moves, isConnected, ctx.activePlayers, G.gameStarted]);

  React.useEffect(() => {
    if (!isConnected || !matchData || !G.players || G.gameStarted) return;

    matchData.forEach((player) => {
      const pID = String(player.id);
      const isOccupiedInLobby = !!player.name;
      const nameInGame = G.players[pID]?.name || '';

      if (!isOccupiedInLobby && nameInGame !== '') {
        moves.clearPlayerSeat(pID);
      }
    });
  }, [isConnected, matchData, G.players, G.gameStarted, moves]);

  React.useEffect(() => {
    if (G.hostLeft === true && myID === '1' && G.gameStarted === false) {
      window.dispatchEvent(new CustomEvent('ronda-host-left'));
    }
  }, [G.hostLeft, myID, G.gameStarted]);

  const isMultiplayer = isConnected !== undefined;

  // Handle opponent disconnection and exit cleanups
  React.useEffect(() => {
    if (!G.gameStarted || !isMultiplayer || opponentLeft) return;
    if (G.playerLeft && G.playerLeft[opponentID] === true) {
      setOpponentLeft(true);
    }
  }, [G.playerLeft, opponentID, G.gameStarted, isMultiplayer, opponentLeft]);

  React.useEffect(() => {
    if (!G.gameStarted || !isMultiplayer || opponentLeft || !matchData) return;
    const opponentData = matchData.find(p => String(p.id) === String(opponentID));
    if (opponentData && opponentData.isConnected === false) {
      setOpponentLeft(true);
    }
  }, [matchData, opponentID, G.gameStarted, isMultiplayer, opponentLeft]);

  React.useEffect(() => {
    if (!G.gameStarted || !isMultiplayer) return;
    const handleBeforeUnload = () => {
      try { moves.playerLeft(); } catch { /* ignore */ }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [G.gameStarted, isMultiplayer, moves]);

  // Third party ad events
  React.useEffect(() => {
    const handleAdStart = () => setIsAdPlaying(true);
    const handleAdComplete = () => setIsAdPlaying(false);

    window.addEventListener('ronda-ad-started', handleAdStart);
    window.addEventListener('ronda-ad-completed', handleAdComplete);

    return () => {
      window.removeEventListener('ronda-ad-started', handleAdStart);
      window.removeEventListener('ronda-ad-completed', handleAdComplete);
    };
  }, []);

  const isCurrentPlayer = (id) => {
    const isTurn = ctx.currentPlayer === id;
    const inStage = ctx.activePlayers && ctx.activePlayers[id];
    return isTurn && !inStage && !G.isAnimating && !G.announcements?.length;
  };

  const handlePlayCard = (cardIndex) => {
    if (isProcessing) return;

    if (canCounterDerba) {
      const card = G.players[myID]?.hand?.[cardIndex];
      if (card && card.value === activeEvent.currentVal) {
        setIsProcessing(true);
        moves.counterDerba(cardIndex);
        setTimeout(() => {
          setIsProcessing(false);
        }, 200);
        return;
      }
    }
    
    if (G.isAnimating || (G.announcements && G.announcements.length > 0)) return;
    
    setIsProcessing(true);
    setTimeout(() => {
      moves.playCard(cardIndex);
      setIsProcessing(false);
    }, 400);
  };

  // Precompute game-over scores and team details for display
  let winner = null;
  if (G.gameStatus) {
    winner = G.gameStatus.winner !== undefined ? G.gameStatus.winner : 'Draw';
  }

  const isMyTeamA = myID === '0' || myID === '2';
  const didIWin = G.gameStatus
    ? (numP === 2
        ? G.gameStatus.winner === myID
        : (G.gameStatus.winner === 'TeamA' ? isMyTeamA : G.gameStatus.winner === 'TeamB' ? !isMyTeamA : false))
    : false;

  const myTeamName = numP === 4
    ? (isMyTeamA
        ? (G.teamNames?.TeamA?.trim() || `${G.players['0']?.name || 'Player 1'} & ${G.players['2']?.name || 'Player 3'}`)
        : (G.teamNames?.TeamB?.trim() || `${G.players['1']?.name || 'Player 2'} & ${G.players['3']?.name || 'Player 4'}`))
    : (G.players[myID]?.name || t('you'));

  const oppTeamName = numP === 4
    ? (isMyTeamA
        ? (G.teamNames?.TeamB?.trim() || `${G.players['1']?.name || 'Player 2'} & ${G.players['3']?.name || 'Player 4'}`)
        : (G.teamNames?.TeamA?.trim() || `${G.players['0']?.name || 'Player 1'} & ${G.players['2']?.name || 'Player 3'}`))
    : (G.players[opponentID]?.name || t('opponent'));

  const myTeamScore = numP === 4
    ? (G.gameStatus ? (isMyTeamA ? G.gameStatus.p0Score : G.gameStatus.p1Score) : 0)
    : (G.gameStatus ? G.gameStatus[`p${myID}Score`] : 0);

  const oppTeamScore = numP === 4
    ? (G.gameStatus ? (isMyTeamA ? G.gameStatus.p1Score : G.gameStatus.p0Score) : 0)
    : (G.gameStatus ? G.gameStatus[`p${opponentID}Score`] : 0);

  const myTeamMatchesWon = numP === 4
    ? (G.matchesWon ? (isMyTeamA ? G.matchesWon['0'] : G.matchesWon['1']) : 0)
    : (G.matchesWon ? G.matchesWon[myID] : 0);

  const oppTeamMatchesWon = numP === 4
    ? (G.matchesWon ? (isMyTeamA ? G.matchesWon['1'] : G.matchesWon['0']) : 0)
    : (G.matchesWon ? G.matchesWon[opponentID] : 0);

  if (G.gameStarted === false) {
    const handleLeaveLobby = () => {
      playClick();
      isLeavingRef.current = true;
      if (myID === '0') {
        moves.hostLeft();
      } else {
        moves.setPlayerName('');
      }
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('ronda-menu'));
      }, 100);
    };

    return (
      <WaitingLobby
        G={G}
        ctx={ctx}
        moves={moves}
        myID={myID}
        opponentID={opponentID}
        matchID={matchID}
        language={language}
        t={t}
        playClick={playClick}
        onLeave={handleLeaveLobby}
        nextTrack={nextTrack}
        toggleMute={toggleMute}
        isMuted={isMuted}
        currentTrack={currentTrack}
        tracks={tracks}
      />
    );
  }

  const playedCardId = G.isAnimating ? (G.pendingCapture?.playedCardId || G.lastPlayedCard?.streakCards?.[0]?.id) : null;

  return (
    <div 
      ref={boardContainerRef}
      className={`min-h-[100dvh] game-board-container custom-scrollbar flex flex-col items-center justify-between md:justify-center pt-16 pb-4 px-2 sm:py-4 sm:px-4 font-sans text-slate-100 relative ${shouldScroll ? 'overflow-y-auto' : 'overflow-hidden'}`}
    >
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

      {/* Scoreboard and HUD */}
      <Scoreboard
        t={t}
        numP={numP}
        language={language}
        G={G}
        myID={myID}
        isMyTeamA={isMyTeamA}
        playClick={playClick}
        moves={moves}
      />

      {/* Central Event Notification Overlay */}
      <Popups activeEvent={activeEvent} />

      {/* Game Over & Opponent Left Overlays */}
      <GameOverDisplay
        showGameOverOverlay={showGameOverOverlay}
        opponentLeft={opponentLeft}
        didIWin={didIWin}
        t={t}
        winner={winner}
        myTeamMatchesWon={myTeamMatchesWon}
        oppTeamMatchesWon={oppTeamMatchesWon}
        myTeamName={myTeamName}
        oppTeamName={oppTeamName}
        myTeamScore={myTeamScore}
        oppTeamScore={oppTeamScore}
        playClick={playClick}
        setIsAdPlaying={setIsAdPlaying}
        moves={moves}
        language={language}
      />

      {/* Opponent / Partner / Seats Area */}
      <PlayerSeats
        numP={numP}
        G={G}
        myID={myID}
        opponentID={opponentID}
        leftID={leftID}
        topID={topID}
        rightID={rightID}
        t={t}
        language={language}
        isCurrentPlayer={isCurrentPlayer}
        playedCardId={playedCardId}
      />

      {/* Central felt card-table */}
      <GameTable
        G={G}
        myID={myID}
        numP={numP}
        t={t}
        captureRects={captureRects}
        captureSequence={captureSequence}
        captureStep={captureStep}
        getWrapperForCard={getWrapperForCard}
        playedCardId={playedCardId}
      />

      {/* Bottom controls panel & player hand */}
      <PlayerPanel
        G={G}
        myID={myID}
        t={t}
        isCurrentPlayer={isCurrentPlayer}
        canCounterDerba={canCounterDerba}
        isProcessing={isProcessing}
        handlePlayCard={handlePlayCard}
        playedCardId={playedCardId}
        activeEvent={activeEvent}
      />

      {/* Glassmorphic ad playing blocker overlay */}
      <AdOverlay
        isAdPlaying={isAdPlaying}
        t={t}
      />
    </div>
  );
};
