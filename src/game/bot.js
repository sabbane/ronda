import { RandomBot } from 'boardgame.io/ai';

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

  const hand = gameG.players[player]?.hand || [];
  let moves = [];
  
  for (let i = 0; i < hand.length; i++) {
    moves.push({ move: 'playCard', args: [i] });
  }
  return moves;
};

// Exporting the bot class or configured instance
export const rondaBot = (opts) => new RandomBot({
  enumerate: enumerateMoves,
  ...opts
});
