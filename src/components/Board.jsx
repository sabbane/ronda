import { useEffect } from 'react';
import { useBoardState } from '../hooks/useBoardState';

import { WaitingLobby } from './WaitingLobby';
import { Scoreboard } from './Scoreboard';
import { GameTable } from './GameTable';
import { Popups } from './Popups';
import { GameOverDisplay } from './GameOverDisplay';
import { PlayerSeats } from './PlayerSeats';
import { PlayerPanel } from './PlayerPanel';
import { AdOverlay } from './AdOverlay';

export const RondaBoard = (props) => {
  const { G, ctx, moves, matchID } = props;
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.latestGameState = { G, ctx };
    }
  }, [G, ctx]);
  
  const {
    language,
    t,
    myID,
    opponentID,
    numP,
    leftID,
    topID,
    rightID,
    isProcessing,
    isAdPlaying,
    setIsAdPlaying,
    opponentLeft,
    boardContainerRef,
    shouldScroll,
    activeEvent,
    canCounterDarba,
    showGameOverOverlay,
    captureSequence,
    captureStep,
    captureRects,
    getWrapperForCard,
    isMuted,
    toggleMute,
    currentTrack,
    tracks,
    nextTrack,
    playClick,
    isCurrentPlayer,
    handlePlayCard,
    winner,
    isMyTeamA,
    didIWin,
    myTeamName,
    oppTeamName,
    myTeamScore,
    oppTeamScore,
    myTeamMatchesWon,
    oppTeamMatchesWon,
    handleLeaveLobby,
    playedCardId
  } = useBoardState(props);

  const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const debugTableCount = params?.get('debug_table');
  const displayG = debugTableCount ? {
    ...G,
    table: Array.from({ length: parseInt(debugTableCount, 10) }, (_, i) => ({
      id: `dheb-${(i % 10) + 1}`,
      value: (i % 10) + 1,
      displayValue: (i % 10) + 1,
      suit: 'dheb'
    }))
  } : G;

  if (displayG.gameStarted === false) {
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
        G={displayG}
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
        canCounterDarba={canCounterDarba}
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
