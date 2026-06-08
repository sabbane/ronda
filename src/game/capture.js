import { INVALID_MOVE } from 'boardgame.io/dist/esm/core.js';
import { getNextValue } from './deck.js';
import { addScore, checkRoundEnd } from './rules.js';

const transferPreviousStreak = (G, player, capturedCards) => {
  const opponent = G.lastPlayedCard.player;
  G.players[opponent].score -= G.lastPlayedCard.awardedPoints || 0;
  let hadMissa = false;
  if (G.lastPlayedCard.hadMissa) {
    G.players[opponent].score -= 1;
    addScore(G, player, 1);
    G.announcements.push({ player, type: 'Missa' });
    hadMissa = true;
  }
  const cardsToTransfer = G.lastPlayedCard.capturedCardsInTurn || G.lastPlayedCard.streakCards || [];
  G.players[opponent].captured = G.players[opponent].captured.filter(c => !cardsToTransfer.some(tc => tc.id === c.id));
  capturedCards.push(...cardsToTransfer);
  return hadMissa;
};

const processTaawidaCapture = (G, player, playedCard, currentVal, capturedCards) => {
  const newStreak = G.lastPlayedCard.streak + 1;
  const scoreToAdd = newStreak === 3 ? 5 : 10;
  const hadMissa = transferPreviousStreak(G, player, capturedCards);
  addScore(G, player, scoreToAdd);
  if (!G.announcements.some(a => a.type === 'Taawida' && a.streak === newStreak)) {
    G.announcements.push({ player, type: 'Taawida', streak: newStreak, currentVal: currentVal });
  }
  G.lastPlayedCard = {
    value: currentVal,
    player: player,
    streak: newStreak,
    awardedPoints: scoreToAdd,
    streakCards: [...(G.lastPlayedCard.streakCards || []), playedCard],
    capturedCardsInTurn: [...capturedCards],
    hadMissa
  };
  return hadMissa;
};

const processNormalCapture = (G, player, playedCard, currentVal, capturedCards, matchIndex) => {
  let hadMissa = false;
  let matchedCard = G.table.splice(matchIndex, 1)[0];
  capturedCards.push(matchedCard);
  let newStreak = 1;
  let awardedPoints = 0;
  let streakCards = [];
  if (G.lastPlayedCard && G.lastPlayedCard.value === currentVal && G.lastPlayedCard.player !== player) {
    newStreak = (G.lastPlayedCard.streak || 1) + 1;
    if (newStreak === 2) {
      awardedPoints = 1;
      addScore(G, player, awardedPoints);
      if (!G.announcements.some(a => a.type === 'Derba')) {
        G.announcements.push({ player, type: 'Derba', opponent: G.lastPlayedCard.player, currentVal: currentVal });
      }
      streakCards = [matchedCard, playedCard];
    } else if (newStreak === 4) {
      awardedPoints = 10;
      hadMissa = transferPreviousStreak(G, player, capturedCards);
      streakCards = [...(G.lastPlayedCard.streakCards || []), matchedCard, playedCard];
      addScore(G, player, awardedPoints);
      if (!G.announcements.some(a => a.type === 'Taawida' && a.streak === newStreak)) {
        G.announcements.push({ player, type: 'Taawida', streak: newStreak, currentVal: currentVal });
      }
    }
  }
  let nextVal = getNextValue(currentVal);
  while (nextVal !== null) {
    let nextMatchIndex = G.table.findIndex(c => c.value === nextVal);
    if (nextMatchIndex !== -1) {
      capturedCards.push(G.table.splice(nextMatchIndex, 1)[0]);
      nextVal = getNextValue(nextVal);
    } else {
      break;
    }
  }
  if (newStreak > 1) {
    G.lastPlayedCard = {
      value: currentVal,
      player: player,
      streak: newStreak,
      awardedPoints,
      streakCards,
      capturedCardsInTurn: [...capturedCards],
      hadMissa: false
    };
  } else {
    G.lastPlayedCard = null;
  }
  return hadMissa;
};

export const executeCapture = (G) => {
  if (!G.pendingCapture) return INVALID_MOVE;
  const player = G.pendingCapture.player;
  const { playedCardId, currentVal, isTaawidaTransfer } = G.pendingCapture;
  G.pendingCapture = null;
  const playedCardIndex = G.table.findIndex(c => c.id === playedCardId);
  if (playedCardIndex === -1) return INVALID_MOVE;
  const playedCard = G.table.splice(playedCardIndex, 1)[0];
  const capturedCards = [playedCard];
  let matchIndex = G.table.findIndex(c => c.value === currentVal);
  if (matchIndex !== -1 || isTaawidaTransfer) {
    if (isTaawidaTransfer) {
      processTaawidaCapture(G, player, playedCard, currentVal, capturedCards);
    } else {
      processNormalCapture(G, player, playedCard, currentVal, capturedCards, matchIndex);
    }
    G.players[player].captured.push(...capturedCards);
    G.lastCapture = player;
    G.isAnimating = true;
    const anyHandHasCards = Object.keys(G.players).some(pID => G.players[pID].hand.length > 0);
    if (!isTaawidaTransfer && G.table.length === 0 && (G.deck.length > 0 || anyHandHasCards)) {
      addScore(G, player, 1);
      G.announcements.push({ player, type: 'Missa' });
      if (G.lastPlayedCard) {
        G.lastPlayedCard.hadMissa = true;
      }
    }
    const allHandsAreEmpty = Object.keys(G.players).every(pID => G.players[pID].hand.length === 0);
    if (currentVal === 10 && G.deck.length === 0 && allHandsAreEmpty) { 
      addScore(G, player, 5); 
      G.announcements.push({ player, type: 'King Finish' }); 
    }
    if (currentVal === 1 && G.deck.length === 0 && allHandsAreEmpty) { 
      const numP4 = Object.keys(G.players).length;
      const asOpponent = numP4 === 2 ? (player === '0' ? '1' : '0') : String((parseInt(player) + 1) % numP4);
      addScore(G, asOpponent, 5); 
      G.announcements.push({ player: asOpponent, type: 'As Finish' }); 
    }
  }
  checkRoundEnd(G);
};
