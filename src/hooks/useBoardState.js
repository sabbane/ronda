import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { adService } from '../services/AdService';
import { useSound } from '../contexts/SoundContext';
import { useBoardEvents } from './useBoardEvents';
import { useScrollAdjustments } from './useScrollAdjustments';
import { useLobbySync } from './useLobbySync';
import { useMultiplayerCleanup } from './useMultiplayerCleanup';

const getTeamDetails = (G, numP, myID, opponentID, isMyTeamA, t) => {
  const winner = G.gameStatus ? (G.gameStatus.winner !== undefined ? G.gameStatus.winner : 'Draw') : null;
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

  return { winner, didIWin, myTeamName, oppTeamName, myTeamScore, oppTeamScore, myTeamMatchesWon, oppTeamMatchesWon };
};

const checkCurrentPlayer = (id, G, ctx) => {
  const isTurn = ctx.currentPlayer === id;
  const inStage = ctx.activePlayers && ctx.activePlayers[id];
  return isTurn && !inStage && !G.isAnimating && !G.announcements?.length;
};

const playCardMove = (opts) => {
  const { cardIndex, G, myID, moves, activeEvent, canCounterDerba, isProcessing, setIsProcessing } = opts;
  if (isProcessing) return;
  if (canCounterDerba) {
    const card = G.players[myID]?.hand?.[cardIndex];
    if (card && card.value === activeEvent.currentVal) {
      setIsProcessing(true);
      moves.counterDerba(cardIndex);
      setTimeout(() => setIsProcessing(false), 200);
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

const leaveLobbyRoom = (myID, moves, playClick, isLeavingRef) => {
  playClick();
  isLeavingRef.current = true;
  if (myID === '0') {
    moves.hostLeft();
  } else {
    moves.setPlayerName('');
  }
  setTimeout(() => {
    window.dispatchEvent(new CustomEvent('ronda-menu'));
  }, 600);
};

export const useBoardState = (props) => {
  const { G, ctx, moves, playerID, isConnected, matchData } = props;
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
  const [shouldScroll, setShouldScroll] = React.useState(false);
  const isLeavingRef = React.useRef(false);
  const boardContainerRef = React.useRef(null);

  const {
    activeEvent, canCounterDerba, showGameOverOverlay,
    captureSequence, captureStep, captureRects, getWrapperForCard
  } = useBoardEvents({ G, ctx, moves, myID, opponentID, numP, t, language });

  const { isMuted, toggleMute, currentTrack, tracks, nextTrack, playClick } = useSound();

  useScrollAdjustments(boardContainerRef, G, activeEvent, setShouldScroll);
  
  React.useEffect(() => {
    adService.sendGameReady();
  }, []);

  useLobbySync({ isConnected, G, ctx, myID, moves, matchData, isLeavingRef });

  React.useEffect(() => {
    if (G.hostLeft === true && myID === '1' && G.gameStarted === false) {
      window.dispatchEvent(new CustomEvent('ronda-host-left'));
    }
  }, [G.hostLeft, myID, G.gameStarted]);

  useMultiplayerCleanup({ isConnected, G, opponentID, opponentLeft, setOpponentLeft, matchData, moves });

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

  const isCurrentPlayer = (id) => checkCurrentPlayer(id, G, ctx);

  const handlePlayCard = (cardIndex) => {
    playCardMove({ cardIndex, G, myID, moves, activeEvent, canCounterDerba, isProcessing, setIsProcessing });
  };

  const isMyTeamA = myID === '0' || myID === '2';
  const teamDetails = getTeamDetails(G, numP, myID, opponentID, isMyTeamA, t);

  const handleLeaveLobby = () => leaveLobbyRoom(myID, moves, playClick, isLeavingRef);

  const playedCardId = G.isAnimating ? (G.pendingCapture?.playedCardId || G.lastPlayedCard?.streakCards?.[0]?.id) : null;

  return {
    language, t, myID, opponentID, numP, leftID, topID, rightID,
    isProcessing, isAdPlaying, setIsAdPlaying, opponentLeft, boardContainerRef, shouldScroll,
    activeEvent, canCounterDerba, showGameOverOverlay, captureSequence, captureStep, captureRects, getWrapperForCard,
    isMuted, toggleMute, currentTrack, tracks, nextTrack, playClick,
    isCurrentPlayer, handlePlayCard, handleLeaveLobby, playedCardId, isMyTeamA, ...teamDetails
  };
};
