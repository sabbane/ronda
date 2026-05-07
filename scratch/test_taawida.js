import { RondaGame } from '../src/game/game.js';
import { Client } from 'boardgame.io/client';

const game = {
  ...RondaGame,
  setup: (ctx) => {
    const G = RondaGame.setup(ctx);
    G.table = [];
    G.players['0'].hand = [{ suit: 'swords', value: 5, id: 's5_1' }, { suit: 'coins', value: 5, id: 'c5_1' }, { suit: 'cups', value: 7, id: 'cu7' }];
    G.players['1'].hand = [{ suit: 'clubs', value: 5, id: 'cl5_1' }, { suit: 'bastos', value: 5, id: 'b5_1' }, { suit: 'swords', value: 8, id: 's8' }];
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

// P0 plays 5
client.moves.playCard(0);
advanceUI(client);

// P1 plays 5 (Derba)
client.moves.playCard(0);
client.moves.processCapture();
console.log("After P1 Derba:", client.getState().G.announcements);
console.log("P1 Score:", client.getState().G.players['1'].score);
console.log("Last played card:", client.getState().G.lastPlayedCard);
advanceUI(client);

// P0 plays 5 (Taawida)
client.moves.playCard(0);
console.log("After P0 Taawida:", client.getState().G.announcements);
console.log("P0 Score:", client.getState().G.players['0'].score);
console.log("Last played card:", client.getState().G.lastPlayedCard);
advanceUI(client);

// P1 plays 5 (Taawida)
client.moves.playCard(0);
client.moves.processCapture();
console.log("After P1 Taawida:", client.getState().G.announcements);
console.log("P1 Score:", client.getState().G.players['1'].score);
console.log("Last played card:", client.getState().G.lastPlayedCard);

