import { Client } from 'boardgame.io/client';
import { RondaGame, evaluateRondaTringa } from './game.js';
import { expect, test, describe } from 'vitest';

describe('RondaGame - Extended Requirements', () => {
  const setupCustomGame = (setupOverrides) => {
    return {
      ...RondaGame,
      setup: (ctx) => {
        const G = RondaGame.setup(ctx);
        // Clear all elements to start from a clean slate
        G.table = [];
        G.players['0'].hand = [];
        G.players['1'].hand = [];
        G.players['0'].score = 0;
        G.players['1'].score = 0;
        G.lastPlayedCard = null;
        G.lastCapture = null;
        G.announcements = [];
        G.isAnimating = false;
        G.endTurnAfterUI = false;
        G.activeClash = null;
        // Apply overrides
        return setupOverrides(G, ctx);
      }
    };
  };

  const advanceUI = (client) => {
    const state = client.getState();
    if (state.G.isAnimating || (state.G.announcements && state.G.announcements.length > 0)) {
      client.moves.endAnimation();
      client.moves.clearAnnouncements();
    }
  };

  test('Sequential Capture: Playing a 7 should capture 7, 8, 9 if present', () => {
    const game = setupCustomGame((G) => {
      G.table = [
        { suit: 'swords', value: 7, id: 's7' },
        { suit: 'swords', value: 8, id: 's8' },
        { suit: 'swords', value: 9, id: 's9' },
      ];
      G.players['0'].hand = [{ suit: 'cups', value: 7, id: 'c7' }];
      return G;
    });

    const client = Client({ game });
    client.moves.playCard(0);
    client.moves.processCapture();
    advanceUI(client);

    const state = client.getState();
    // Should have captured 7, 8, 9
    expect(state.G.players['0'].captured.length).toBe(4); // Played 7 + Captured 7, 8, 9
    expect(state.G.table.length).toBe(0);
  });

  test('Missa: Clearing the table should award +1 point', () => {
    const game = setupCustomGame((G) => {
      G.table = [{ suit: 'swords', value: 5, id: 's5' }];
      G.players['0'].hand = [{ suit: 'cups', value: 5, id: 'c5' }];
      return G;
    });

    const client = Client({ game });
    client.moves.playCard(0);
    client.moves.processCapture();
    
    const state = client.getState();
    const missaAnnouncement = state.G.announcements.find(a => a.type === 'Missa');
    expect(missaAnnouncement).toBeDefined();
    expect(state.G.players['0'].score).toBe(1);
  });

  test('Bount: Matching the opponents last card should award +1 point', () => {
    const game = setupCustomGame((G) => {
      G.players['0'].hand = [{ suit: 'swords', value: 3, id: 's3' }, { suit: 'coins', value: 1, id: 'c1' }];
      G.players['1'].hand = [{ suit: 'cups', value: 3, id: 'c3' }, { suit: 'clubs', value: 1, id: 'cl1' }];
      return G;
    });

    const client = Client({ game });
    
    // Player 0 plays 3
    client.moves.playCard(0);
    advanceUI(client);

    // Player 1 matches 3
    client.moves.playCard(0);
    client.moves.processCapture();
    
    const state = client.getState();
    const bountAnnouncement = state.G.announcements.find(a => a.type === 'Bount');
    expect(bountAnnouncement).toBeDefined();
    // Bount (+1) + Missa (+1) = 2
    expect(state.G.players['1'].score).toBe(2);
    expect(state.G.players['0'].score).toBe(-2);
  });

  test('Ronda Detection: Starting a round with a pair should award +1 point', () => {
    const game = setupCustomGame((G) => {
      G.players['0'].hand = [
        { suit: 'swords', value: 7, id: 's7' },
        { suit: 'cups', value: 7, id: 'c7' },
        { suit: 'coins', value: 1, id: 'co1' }
      ];
      G.players['1'].hand = [
        { suit: 'swords', value: 1, id: 's1' },
        { suit: 'cups', value: 2, id: 'c2' },
        { suit: 'coins', value: 3, id: 'co3' }
      ];
      evaluateRondaTringa(G); // Explicitly call because G.players was overridden
      return G;
    });

    const client = Client({ game });
    const state = client.getState();
    
    expect(state.G.announcements.find(a => a.type === 'Ronda' && a.player === '0')).toBeDefined();
    expect(state.G.players['0'].score).toBe(1);
  });

  test('Clash Resolution: Two Rondas should trigger a clash and resolve at round end', () => {
    const game = setupCustomGame((G) => {
      G.players['0'].hand = [{ value: 7, id: 's7' }, { value: 7, id: 'c7' }, { value: 1, id: 'co1' }];
      G.players['1'].hand = [{ value: 5, id: 's5' }, { value: 5, id: 'c5' }, { value: 2, id: 'co2' }];
      evaluateRondaTringa(G); // Explicitly call because G.players was overridden
      return G;
    });

    const client = Client({ game });
    let state = client.getState();
    
    // Initial state check: Both players in waitForUI because of Clash announcement
    expect(state.G.activeClash).toBeDefined();
    expect(state.G.announcements.find(a => a.type === 'Clash')).toBeDefined();
    
    // Clear initial UI block
    advanceUI(client);
    
    expect(client.getState().G.players['0'].score).toBe(0); // No points yet!

    // Player 0 plays 1st card
    client.moves.playCard(0); advanceUI(client);
    // Player 1 plays 1st card
    client.moves.playCard(0); advanceUI(client);
    // Player 0 plays 2nd card
    client.moves.playCard(0); advanceUI(client);
    // Player 1 plays 2nd card
    client.moves.playCard(0); advanceUI(client);
    // Player 0 plays 3rd card
    client.moves.playCard(0); advanceUI(client);
    // Player 1 plays 3rd card
    client.moves.playCard(0); advanceUI(client);
    
    // Now both hands are empty, resolveClash should have been called.
    // We need to advance UI one last time to process the Clash result announcement
    advanceUI(client);
    
    state = client.getState();
    // After round end, Player 0 (higher Ronda: 7 vs 5) should have won the clash (+5)
    expect(state.G.players['0'].score).toBe(5);
    expect(state.G.announcements.length).toBe(0);
  });

  test('End Game: Winner is determined by captured cards + bonuses', () => {
    const game = setupCustomGame((G) => {
      G.players['0'].captured = new Array(25).fill({}); // 25 cards
      G.players['1'].captured = new Array(15).fill({}); // 15 cards
      G.players['0'].score = 5;
      G.players['1'].score = 0;
      G.deck = [];
      G.players['0'].hand = [];
      G.players['1'].hand = [];
      return G;
    });

    const client = Client({ game });
    const state = client.getState();
    
    expect(state.ctx.gameover).toBeDefined();
    expect(state.ctx.gameover.winner).toBe('0');
    expect(state.ctx.gameover.p0Score).toBe(30); // 25 + 5
  });
});
