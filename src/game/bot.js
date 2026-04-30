import { MCTSBot } from 'boardgame.io/ai';

const enumerateMoves = (G, ctx, playerID) => {
  let gameG = G;
  let gameCtx = ctx;
  let player = playerID;

  if (G && G.G) {
    gameG = G.G;
    gameCtx = G.ctx;
    player = G.playerID;
  } else if (!player) {
    player = gameCtx?.currentPlayer;
  }

  if (!gameG || !gameCtx || !player) return [];

  // Wait if there are announcements or animations to be shown by the UI
  if ((gameG.announcements && gameG.announcements.length > 0) || gameG.isAnimating) {
    return [];
  }

  if (gameG.pendingCapture) {
    return [{ move: 'processCapture', args: [] }];
  }

  if (gameG.players['0'].hand.length === 0 && gameG.players['1'].hand.length === 0 && gameG.deck.length > 0) {
    return [{ move: 'dealCards', args: [] }];
  }

  const hand = gameG.players[player]?.hand || [];
  let moves = [];
  
  for (let i = 0; i < hand.length; i++) {
    moves.push({ move: 'playCard', args: [i] });
  }
  return moves;
};

export function rondaBot(opts) {
  return new MCTSBot({
    enumerate: enumerateMoves,
    iterations: 200,
    playoutDepth: 5,
    objectives: (G, ctx, playerID) => {
      return {
        captured: {
          weight: 1,
          checker: (G) => G.players[playerID].captured.length
        },
        score: {
          weight: 1,
          checker: (G) => G.players[playerID].score
        }
      };
    },
    ...opts
  });
}
