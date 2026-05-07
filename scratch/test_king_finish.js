import { RondaGame } from '../src/game/game.js';
import { Client } from 'boardgame.io/client';

const game = {
  ...RondaGame,
  setup: (ctx) => {
    const G = RondaGame.setup(ctx);
    G.table = [{ suit: 'swords', value: 10, id: 's10' }]; // King on table
    G.deck = []; // Empty deck
    // Give players their final card
    G.players['0'].hand = [{ suit: 'coins', value: 10, id: 'c10' }];
    G.players['1'].hand = []; // P1 already played their last card
    return G;
  }
};

const client = Client({ game });

const advanceUI = (client) => {
  let state = client.getState();
  if (state.G.isAnimating && state.ctx.activePlayers?.[state.ctx.currentPlayer] === 'waitForUI') {
    client.moves.endAnimation();
    state = client.getState();
  }
  if (state.G.announcements.length > 0 && state.ctx.activePlayers?.[state.ctx.currentPlayer] === 'waitForUI') {
    client.moves.clearAnnouncements();
    state = client.getState();
  }
  if (state.ctx.activePlayers?.[state.ctx.currentPlayer] === 'waitForUI' && (state.G.isAnimating || state.G.announcements.length > 0)) {
    advanceUI(client);
  }
};

// P0 plays last card (12 / value 10)
client.moves.playCard(0);
client.moves.processCapture();

console.log("Announcements:", client.getState().G.announcements);
console.log("P0 Score:", client.getState().G.players['0'].score);
