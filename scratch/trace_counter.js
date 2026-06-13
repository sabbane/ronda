import { RondaGame } from '../src/game/game.js';
import { Client } from 'boardgame.io/dist/esm/client.js';
import { Local } from 'boardgame.io/dist/esm/multiplayer.js';

const game = {
  ...RondaGame,
  setup: (ctx) => {
    const G = RondaGame.setup({ ctx: { ...ctx, numPlayers: 2 } }, { testMode: true });
    G.gameStarted = false;
    G.isAnimating = false;
    G.table = [];
    G.announcements = [];
    G._announcementIdIncremented = false;
    G.players['0'].hand = [{ suit: 'swords', value: 5, id: 's5_1' }, { suit: 'coins', value: 5, id: 'c5_1' }];
    G.players['1'].hand = [{ suit: 'clubs', value: 5, id: 'cl5_1' }, { suit: 'bastos', value: 5, id: 'b5_1' }];
    return G;
  }
};

const client0 = Client({ game, numPlayers: 2, playerID: '0', multiplayer: Local() });
const client1 = Client({ game, numPlayers: 2, playerID: '1', multiplayer: Local() });

client0.start();
client1.start();

// Helper to wait a tiny bit to let Local transport sync
const sync = () => new Promise(r => setTimeout(r, 50));

const advanceUI = async (client) => {
  await sync();
  let state = client.getState();
  
  // 1. If animating in waitForUI stage, end the animation
  if (state.G.isAnimating && state.ctx.activePlayers?.[state.ctx.currentPlayer] === 'waitForUI') {
    client.moves.endAnimation();
    await sync();
    state = client.getState();
  }
  
  // 2. If announcements are active in waitForUI stage (and no animation is blocking), clear them
  if (state.G.announcements.length > 0 && !state.G.isAnimating && state.ctx.activePlayers?.[state.ctx.currentPlayer] === 'waitForUI') {
    client.moves.clearAnnouncements(state.G.announcementId);
    await sync();
    state = client.getState();
  }
};

await sync();

// Start the game officially to transition out of the lobby stage
client0.moves.startGame();
await sync();

// 1. P0 plays their first 5
client0.moves.playCard(0);
await advanceUI(client0);

// 2. P1 plays their first 5 (Darba!)
client1.moves.playCard(0);
await sync(); // Let the card land, but DO NOT advanceUI yet (since P0 will counter immediately!)

// 3. P0 counters with their second 5!
client0.moves.counterDarba(0);
await sync(); // Let the card land, but DO NOT advanceUI yet (since P1 will counter immediately!)

// 4. P1 counters with their second 5 (Ultimate Attack)!
client1.moves.counterDarba(0);
await sync(); // Let the card land, now let's advance UI normally (since no one else has cards to counter!)

// 5. Ultimate Attack settles, processCapture is called (normally triggered by card sweeping ending)
client1.moves.processCapture();
await advanceUI(client1); // Advance UI fully to let announcements clear and turn transition naturally
