import { RandomBot } from 'boardgame.io/ai';

const enumerateMoves = (G, ctx, playerID) => {
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

  // Do not play if the UI is busy with animations or announcements
  if (gameG.isAnimating || (gameG.announcements && gameG.announcements.length > 0) || (gameCtx.activePlayers && gameCtx.activePlayers[player] === 'waitForUI')) {
    return [];
  }

  // Normal move logic follows
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

  // Normal turn: suggest playing any card in hand
  const hand = gameG.players[player]?.hand || [];
  let moves = [];
  
  for (let i = 0; i < hand.length; i++) {
    moves.push({ move: 'playCard', args: [i] });
  }
  return moves;
};

export function rondaBot(opts) {
  return new RandomBot({
    enumerate: enumerateMoves,
    ...opts
  });
}
