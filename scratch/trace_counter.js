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
    // Setup 5s for both players to enable the scenario
    G.players['0'].hand = [{ suit: 'swords', value: 5, id: 's5_1' }, { suit: 'coins', value: 5, id: 'c5_1' }];
    G.players['1'].hand = [{ suit: 'clubs', value: 5, id: 'cl5_1' }, { suit: 'bastos', value: 5, id: 'b5_1' }];
    return G;
  }
};

// Create two clients connected via local in-memory transport
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

console.log("--- Initial State ---");
console.log("Current Player:", client0.getState().ctx.currentPlayer); // Should be '0'
console.log("Hand P0:", client0.getState().G.players['0'].hand.map(c => c.value));
console.log("Hand P1:", client0.getState().G.players['1'].hand.map(c => c.value));

// 1. P0 plays their first 5
console.log("\n>>> P0 plays 5...");
client0.moves.playCard(0);
await advanceUI(client0);
console.log("Current Player:", client0.getState().ctx.currentPlayer); // Should be '1'
console.log("Table:", client0.getState().G.table.map(c => c.value));

// 2. P1 plays their first 5 (Derba!)
console.log("\n>>> P1 plays 5 (Derba!)...");
client1.moves.playCard(0);
await sync(); // Let the card land, but DO NOT advanceUI yet (since P0 will counter immediately!)
console.log("Current Player:", client0.getState().ctx.currentPlayer); // Should be '1'
console.log("G.pendingCapture player:", client0.getState().G.pendingCapture?.player);
console.log("Announcements:", client0.getState().G.announcements.map(a => a.type));

// 3. P0 counters with their second 5!
console.log("\n>>> P0 counters immediately with second 5...");
client0.moves.counterDerba(0);
await sync(); // Let the card land, but DO NOT advanceUI yet (since P1 will counter immediately!)
console.log("Current Player:", client0.getState().ctx.currentPlayer); // Should be '0'
console.log("G.pendingCapture player:", client0.getState().G.pendingCapture?.player);
console.log("Announcements:", client0.getState().G.announcements.map(a => a.type));

// 4. P1 counters with their second 5 (Ultimate Attack)!
console.log("\n>>> P1 counters immediately with second 5 (Ultimate Attack!)...");
client1.moves.counterDerba(0);
await sync(); // Let the card land, now let's advance UI normally (since no one else has cards to counter!)
console.log("Current Player:", client0.getState().ctx.currentPlayer); // Should be '1'
console.log("G.pendingCapture player:", client0.getState().G.pendingCapture?.player);
console.log("Announcements:", client0.getState().G.announcements.map(a => a.type));

// 5. Ultimate Attack settles, processCapture is called (normally triggered by card sweeping ending)
console.log("\n>>> Sweeping finishes, processCapture called...");
client1.moves.processCapture();
await advanceUI(client1); // Advance UI fully to let announcements clear and turn transition naturally
console.log("Current Player:", client0.getState().ctx.currentPlayer); // Who is at turn?
console.log("Announcements:", client0.getState().G.announcements.map(a => a.type));
console.log("G.pendingCapture:", client0.getState().G.pendingCapture);
