import { useEffect, useState } from 'react';
import { useBoardState } from '../hooks/useBoardState';

import { WaitingLobby } from './WaitingLobby';
import { Scoreboard } from './Scoreboard';
import { GameTable } from './GameTable';
import { Popups } from './Popups';
import { GameOverDisplay } from './GameOverDisplay';
import { PlayerSeats } from './PlayerSeats';
import { PlayerPanel } from './PlayerPanel';
import { AdOverlay } from './AdOverlay';

export const DebugRondaBoard = (props) => {
  const { G, ctx, moves, myID } = props;
  const { debugTableCount, debugCapture } = props;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.latestGameState = { G, ctx };
    }
  }, [G, ctx]);

  const {
    language,
    t,
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

  const {
    displayG,
    displayGetWrapperForCard,
    debugCaptureStep,
    displayCaptureSequence,
    displayCaptureRects
  } = useDebugSetup(G, debugTableCount, debugCapture, getWrapperForCard, captureSequence);

  if (displayG.gameStarted === false) {
    return (
      <WaitingLobby
        G={G}
        ctx={ctx}
        moves={moves}
        myID={myID}
        opponentID={opponentID}
        matchID={props.matchID}
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
    <DebugRondaBoardLayout
      boardContainerRef={boardContainerRef}
      shouldScroll={shouldScroll}
      t={t}
      numP={numP}
      language={language}
      G={G}
      myID={myID}
      isMyTeamA={isMyTeamA}
      playClick={playClick}
      moves={moves}
      activeEvent={activeEvent}
      showGameOverOverlay={showGameOverOverlay}
      opponentLeft={opponentLeft}
      didIWin={didIWin}
      winner={winner}
      myTeamMatchesWon={myTeamMatchesWon}
      oppTeamMatchesWon={oppTeamMatchesWon}
      myTeamName={myTeamName}
      oppTeamName={oppTeamName}
      myTeamScore={myTeamScore}
      oppTeamScore={oppTeamScore}
      setIsAdPlaying={setIsAdPlaying}
      opponentID={opponentID}
      leftID={leftID}
      topID={topID}
      rightID={rightID}
      isCurrentPlayer={isCurrentPlayer}
      playedCardId={playedCardId}
      displayG={displayG}
      displayCaptureRects={displayCaptureRects}
      displayCaptureSequence={displayCaptureSequence}
      displayCaptureStep={debugCapture ? debugCaptureStep : captureStep}
      displayGetWrapperForCard={displayGetWrapperForCard}
      canCounterDarba={canCounterDarba}
      isProcessing={isProcessing}
      handlePlayCard={handlePlayCard}
      isAdPlaying={isAdPlaying}
      debugCapture={debugCapture}
      captureRects={captureRects}
      captureSequence={captureSequence}
      captureStep={captureStep}
      getWrapperForCard={getWrapperForCard}
    />
  );
};

const DebugRondaBoardLayout = ({
  boardContainerRef,
  shouldScroll,
  t,
  numP,
  language,
  G,
  myID,
  isMyTeamA,
  playClick,
  moves,
  activeEvent,
  showGameOverOverlay,
  opponentLeft,
  didIWin,
  winner,
  myTeamMatchesWon,
  oppTeamMatchesWon,
  myTeamName,
  oppTeamName,
  myTeamScore,
  oppTeamScore,
  setIsAdPlaying,
  opponentID,
  leftID,
  topID,
  rightID,
  isCurrentPlayer,
  playedCardId,
  displayG,
  displayCaptureRects,
  displayCaptureSequence,
  displayCaptureStep,
  displayGetWrapperForCard,
  canCounterDarba,
  isProcessing,
  handlePlayCard,
  isAdPlaying,
  debugCapture,
  captureRects
}) => {
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

      <Popups activeEvent={activeEvent} />

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
        G={G}
        playerID={myID}
      />

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

      <GameTable
        G={displayG}
        myID={myID}
        numP={numP}
        t={t}
        captureRects={debugCapture ? displayCaptureRects : captureRects}
        captureSequence={displayCaptureSequence}
        captureStep={displayCaptureStep}
        getWrapperForCard={displayGetWrapperForCard}
        playedCardId={playedCardId}
      />

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

      <AdOverlay
        isAdPlaying={isAdPlaying}
        t={t}
      />
    </div>
  );
};

const useDebugSetup = (G, debugTableCount, debugCapture, getWrapperForCard, captureSequence) => {
  const displayG = debugTableCount ? {
    ...G,
    table: Array.from({ length: parseInt(debugTableCount, 10) }, (_, i) => ({
      id: `dheb-${i + 1}`,
      value: (i % 10) + 1,
      displayValue: (i % 10) + 1,
      suit: 'dheb'
    })),
    ...(debugCapture ? {
      pendingCapture: {
        player: '0',
        playedCardId: `dheb-${debugTableCount}`,
        currentVal: 1,
        isTaawidaTransfer: false
      },
      isAnimating: true
    } : {})
  } : G;

  const displayGetWrapperForCard = debugCapture ? (cardId) => {
    if (cardId === `dheb-${debugTableCount}`) {
      return `dheb-1`;
    }
    return cardId;
  } : getWrapperForCard;

  const [debugCaptureStep, setDebugCaptureStep] = useState(0);
  useEffect(() => {
    if (debugCapture) {
      if (displayG.gameStarted) {
        const timer = setInterval(() => {
          setDebugCaptureStep(prev => prev + 1);
        }, 1000);
        return () => clearInterval(timer);
      } else {
        const timer = setTimeout(() => {
          setDebugCaptureStep(0);
        }, 0);
        return () => clearTimeout(timer);
      }
    }
  }, [debugCapture, displayG.gameStarted]);

  const displayCaptureSequence = debugCapture ? Array.from({ length: parseInt(debugTableCount, 10) }, (_, i) => `dheb-${i + 1}`) : captureSequence;

  const [displayCaptureRects, setDisplayCaptureRects] = useState({});
  useEffect(() => {
    if (debugCapture && displayG.gameStarted && displayG.table.length > 0) {
      const timer = setTimeout(() => {
        const rects = {};
        displayG.table.forEach(card => {
          const el = document.getElementById(`table-wrapper-${card.id}`);
          if (el) rects[card.id] = el.getBoundingClientRect();
        });
        if (Object.keys(rects).length > 0) {
          setDisplayCaptureRects(rects);
        }
      }, 300);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debugCapture, displayG.gameStarted, displayG.table.length]);

  return {
    displayG,
    displayGetWrapperForCard,
    debugCaptureStep,
    displayCaptureSequence,
    displayCaptureRects
  };
};
