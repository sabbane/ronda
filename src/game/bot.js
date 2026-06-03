import { RandomBot } from 'boardgame.io/dist/esm/ai.js';
import { getNextValue, getHandRank } from './game.js';

/**
 * Evaluates the greedy tactical score for playing a specific card from the bot's hand.
 * Higher scores represent better tactical moves.
 */
export const evaluateCardMove = (G, player, cardIndex) => {
  const hand = G.players[player]?.hand || [];
  if (cardIndex < 0 || cardIndex >= hand.length) return -999;

  const playedCard = hand[cardIndex];
  if (!playedCard) return -999;

  const currentVal = playedCard.value;
  let score = 0;

  // 1. Check table matches and Taawida opportunities
  const tableMatches = G.table.filter(c => c.value === currentVal);
  const hasTableMatch = tableMatches.length > 0;

  // Taawida transfer occurs if the opponent just did a Derba/Taawida on the same value (streak >= 2)
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
      // Taawida capture: Played card + transferring all cards in the opponent's streak
      const streakCardsCount = G.lastPlayedCard.streakCards ? G.lastPlayedCard.streakCards.length : 0;
      capturedCount = 1 + streakCardsCount;
    } else {
      // Normal capture: Played card + matched card from table
      capturedCount = 2;

      // Plus sequential captures on the table
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

    // A: Capture score: 1 point per card captured (since each card counts as 1 point at round end)
    score += capturedCount * 1.0;

    // B: Direct rules points
    if (isTaawidaTransfer) {
      const newStreak = G.lastPlayedCard.streak + 1;
      const points = newStreak === 3 ? 5 : 10;
      score += points; // Add +5 or +10 points directly
    } else {
      // Is it a Derba? (opponent just played this card, streak is 1)
      const isDerba = !!(
        G.lastPlayedCard &&
        G.lastPlayedCard.value === currentVal &&
        G.lastPlayedCard.player !== player &&
        G.lastPlayedCard.streak === 1
      );

      if (isDerba) {
        score += 1.0; // Derba itself awards +1 point

        // Scenario 1: Risk assessment. If opponent doesn't have a Ronda/Tringa, this is a safe Derba!
        const opponent = player === '0' ? '1' : '0';
        const opponentHand = G.players[opponent]?.hand || [];
        const opponentHandRank = getHandRank(opponentHand);
        const opponentHasRonda = opponentHandRank && (opponentHandRank.type === 'Ronda' || opponentHandRank.type === 'Tringa');

        if (!opponentHasRonda) {
          // Zero risk of counter! Prioritize safe Derbas heavily.
          score += 15.0;
        } else {
          // Opponent has a Ronda, so there is some risk of Taawida, but Derba is still excellent.
          score += 8.0;
        }
      }
    }

    // C: Missa (clearing the table)
    const tableCardsCaptured = isTaawidaTransfer ? 0 : (capturedCount - 1);
    const isMissa = !isTaawidaTransfer &&
                     (tableCardsCaptured === G.table.length) &&
                     (G.deck.length > 0 || G.players['0'].hand.length > 0);
    if (isMissa) {
      score += 4.0; // Missa (+1 point) + table clear bonus
    }

    // D: Special end-of-game rules
    const isLastCardOfGame = G.deck.length === 0 &&
                             G.players['0'].hand.length === 0 &&
                             G.players[player].hand.length === 1;
    if (isLastCardOfGame) {
      if (currentVal === 10) {
        score += 10.0; // King Finish (+5 pts) + high priority weight
      } else if (currentVal === 1) {
        score -= 10.0; // As Finish penalty (+5 to opponent, must avoid)
      }
    }
  } else {
    // No capture. The card must be dropped.
    // Check if the bot has a Ronda of this card. If so, dropping it is a great bait!
    const sameValueCardsInHand = hand.filter(c => c.value === currentVal).length;
    const hasSelfRonda = sameValueCardsInHand >= 2;

    if (hasSelfRonda) {
      score += 4.0; // Ronda bait bonus (safe, can counter or capture next turn)
    } else {
      // Penalize dropping a card that directly sets up a sequence on the table
      const nextVal = getNextValue(currentVal);
      if (nextVal !== null && G.table.some(c => c.value === nextVal)) {
        score -= 1.0; // Minor penalty
      }

      // Penalize dropping the last card of the game without capturing (Final Fail, +5 to opponent)
      const isLastCardOfGame = G.deck.length === 0 &&
                               G.players['0'].hand.length === 0 &&
                               G.players[player].hand.length === 1;
      if (isLastCardOfGame) {
        score -= 10.0; // Heavy penalty
      }
    }
  }

  return score;
};

export const enumerateMoves = (G, ctx, playerID) => {
  let gameG = G;
  let gameCtx = ctx;
  let player = playerID;

  // Handle both standard boardgame.io and simulation formats
  if (G && G.G) {
    gameG = G.G;
    gameCtx = G.ctx;
    player = G.playerID || playerID;
  } else if (!player) {
    player = gameCtx?.currentPlayer;
  }

  if (!gameG || !gameCtx || !player) return [];

  // STRICT GUARD: The bot must ONLY play for Player 1.
  // This prevents the bot from accidentally playing the human's first card.
  if (player !== '1') return [];

  // Do not play if the UI is busy with animations or announcements
  if (gameG.isAnimating || (gameG.announcements && gameG.announcements.length > 0) || (gameCtx.activePlayers && gameCtx.activePlayers[player] === 'waitForUI')) {
    return [];
  }

  // If a capture is pending, the only valid move is processCapture
  if (gameG.pendingCapture) {
    // Only the player who made the move can process it
    if (gameG.pendingCapture.player === player) {
      return [{ move: 'processCapture', args: [] }];
    }
    return [];
  }

  // Auto-deal if hands are empty and deck is not
  if (gameG.players['0'].hand.length === 0 && gameG.players['1'].hand.length === 0 && gameG.deck.length > 0) {
    return [{ move: 'dealCards', args: [] }];
  }

  // Normal turn: calculate the best moves using our smart tactical heuristic
  const hand = gameG.players[player]?.hand || [];
  if (hand.length === 0) return [];

  const evaluatedMoves = [];
  let maxScore = -Infinity;

  for (let i = 0; i < hand.length; i++) {
    const score = evaluateCardMove(gameG, player, i);
    const move = { move: 'playCard', args: [i] };
    evaluatedMoves.push({ move, score });
    if (score > maxScore) {
      maxScore = score;
    }
  }

  // Filter moves to only include those that achieve the maximum score
  // This allows the bot to choose randomly between equally-best moves.
  const bestMoves = evaluatedMoves
    .filter(item => item.score === maxScore)
    .map(item => item.move);

  return bestMoves;
};

export function rondaBot(opts) {
  return new RandomBot({
    enumerate: enumerateMoves,
    ...opts
  });
}
