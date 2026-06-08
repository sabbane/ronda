import { RandomBot } from 'boardgame.io/dist/esm/ai.js';
import { getNextValue } from './deck.js';
import { getHandRank } from './rules.js';

// Greedy evaluation score for playing a card
export const evaluateCardMove = (G, player, cardIndex) => {
  const hand = G.players[player]?.hand || [];
  if (cardIndex < 0 || cardIndex >= hand.length) return -999;

  const playedCard = hand[cardIndex];
  if (!playedCard) return -999;

  const currentVal = playedCard.value;
  let score = 0;

  const tableMatches = G.table.filter(c => c.value === currentVal);
  const hasTableMatch = tableMatches.length > 0;

  // Taawida check: opponent did a Derba/Taawida on this value
  const isTaawidaTransfer = !!(
    G.lastPlayedCard &&
    G.lastPlayedCard.value === currentVal &&
    G.lastPlayedCard.player !== player &&
    G.lastPlayedCard.streak >= 2
  );

  const isCapture = hasTableMatch || isTaawidaTransfer;

  if (isCapture) {
    let capturedCount;

    if (isTaawidaTransfer) {
      const streakCardsCount = G.lastPlayedCard.streakCards ? G.lastPlayedCard.streakCards.length : 0;
      capturedCount = 1 + streakCardsCount;
    } else {
      capturedCount = 2;

      // Sequential captures (e.g. 7 catches 7, then 8, 9...)
      let tempTable = G.table.filter(c => c.value !== currentVal);
      let nextVal = getNextValue(currentVal);
      while (nextVal !== null) {
        const nextMatchIndex = tempTable.findIndex(c => c.value === nextVal);
        if (nextMatchIndex !== -1) {
          capturedCount += 1;
          tempTable.splice(nextMatchIndex, 1);
          nextVal = getNextValue(nextVal);
        } else {
          break;
        }
      }
    }

    score += capturedCount * 1.0;

    if (isTaawidaTransfer) {
      const newStreak = G.lastPlayedCard.streak + 1;
      const points = newStreak === 3 ? 5 : 10;
      score += points;
    } else {
      const isDerba = !!(
        G.lastPlayedCard &&
        G.lastPlayedCard.value === currentVal &&
        G.lastPlayedCard.player !== player &&
        G.lastPlayedCard.streak === 1
      );

      if (isDerba) {
        score += 1.0;

        // Check if opponent can counter-attack
        const opponent = player === '0' ? '1' : '0';
        const opponentHand = G.players[opponent]?.hand || [];
        const opponentHandRank = getHandRank(opponentHand);
        const opponentHasRonda = opponentHandRank && (opponentHandRank.type === 'Ronda' || opponentHandRank.type === 'Tringa');

        if (!opponentHasRonda) {
          score += 15.0; // Safe Derba
        } else {
          score += 8.0; // Risky Derba
        }
      }
    }

    // Missa bonus
    const tableCardsCaptured = isTaawidaTransfer ? 0 : (capturedCount - 1);
    const isMissa = !isTaawidaTransfer &&
                     (tableCardsCaptured === G.table.length) &&
                     (G.deck.length > 0 || G.players['0'].hand.length > 0);
    if (isMissa) {
      score += 4.0;
    }

    // King / Ace finish rules
    const isLastCardOfGame = G.deck.length === 0 &&
                             G.players['0'].hand.length === 0 &&
                             G.players[player].hand.length === 1;
    if (isLastCardOfGame) {
      if (currentVal === 10) {
        score += 10.0;
      } else if (currentVal === 1) {
        score -= 10.0;
      }
    }
  } else {
    const sameValueCardsInHand = hand.filter(c => c.value === currentVal).length;
    const hasSelfRonda = sameValueCardsInHand >= 2;

    if (hasSelfRonda) {
      score += 4.0; // Ronda baiting (safe to drop)
    } else {
      const nextVal = getNextValue(currentVal);
      if (nextVal !== null && G.table.some(c => c.value === nextVal)) {
        score -= 1.0; // Avoid setting up table sequence
      }

      // Avoid Final Fail penalty
      const isLastCardOfGame = G.deck.length === 0 &&
                               G.players['0'].hand.length === 0 &&
                               G.players[player].hand.length === 1;
      if (isLastCardOfGame) {
        score -= 10.0;
      }
    }
  }

  return score;
};

export const enumerateMoves = (G, ctx, playerID) => {
  let gameG = G;
  let gameCtx = ctx;
  let player = playerID;

  if (G && G.G) {
    gameG = G.G;
    gameCtx = G.ctx;
    player = G.playerID || playerID;
  } else if (!player) {
    player = gameCtx?.currentPlayer;
  }

  if (!gameG || !gameCtx || !player) return [];

  // Bot only plays for Player 1
  if (player !== '1') return [];

  // Wait if UI is busy
  if (gameG.isAnimating || (gameG.announcements && gameG.announcements.length > 0) || (gameCtx.activePlayers && gameCtx.activePlayers[player] === 'waitForUI')) {
    return [];
  }

  if (gameG.pendingCapture) {
    if (gameG.pendingCapture.player === player) {
      return [{ move: 'processCapture', args: [] }];
    }
    return [];
  }

  if (gameG.players['0'].hand.length === 0 && gameG.players['1'].hand.length === 0 && gameG.deck.length > 0) {
    return [{ move: 'dealCards', args: [] }];
  }

  const hand = gameG.players[player]?.hand || [];
  if (hand.length === 0) return [];

  const evaluatedMoves = hand.map((_, i) => ({
    move: { move: 'playCard', args: [i] },
    score: evaluateCardMove(gameG, player, i)
  }));

  const maxScore = Math.max(...evaluatedMoves.map(item => item.score));

  return evaluatedMoves
    .filter(item => item.score === maxScore)
    .map(item => item.move);
};

export function rondaBot(opts) {
  return new RandomBot({
    enumerate: enumerateMoves,
    ...opts
  });
}
