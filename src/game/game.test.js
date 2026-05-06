import { Client } from 'boardgame.io/client';
import { RondaGame, evaluateRondaTringa, checkRoundEnd } from './game.js';
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
    let state = client.getState();
    
    // 1. Process animations
    if (state.G.isAnimating && state.ctx.activePlayers?.[state.ctx.currentPlayer] === 'waitForUI') {
      client.moves.endAnimation();
      state = client.getState();
    }
    
    // 2. Process announcements
    if (state.G.announcements.length > 0 && state.ctx.activePlayers?.[state.ctx.currentPlayer] === 'waitForUI') {
      client.moves.clearAnnouncements();
      state = client.getState();
    }

    // 3. Recursive check: if a move triggered another animation/announcement (like in onBegin)
    if (state.ctx.activePlayers?.[state.ctx.currentPlayer] === 'waitForUI' && (state.G.isAnimating || state.G.announcements.length > 0)) {
      advanceUI(client);
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

  test('Derba: Matching the opponents last card should award +1 point', () => {
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
    const derbaAnnouncement = state.G.announcements.find(a => a.type === 'Derba');
    expect(derbaAnnouncement).toBeDefined();
    // Derba (+1) + Missa (+1) = 2
    expect(state.G.players['1'].score).toBe(2);
    expect(state.G.players['0'].score).toBe(0); // No subtraction anymore
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
    const G = RondaGame.setup({ ctx: { numPlayers: 2 } });
    G.table = [];
    G.players['0'].score = 0;
    G.players['1'].score = 0;
    G.players['0'].hand = [{ value: 7, id: 's7' }, { value: 7, id: 'c7' }, { value: 1, id: 'co1' }];
    G.players['1'].hand = [{ value: 5, id: 's5' }, { value: 5, id: 'c5' }, { value: 2, id: 'co2' }];
    G.deck = [];
    
    // 1. Initial detection
    evaluateRondaTringa(G);
    expect(G.activeClash).toBeDefined();
    expect(G.activeClash.p0.value).toBe(7);
    expect(G.activeClash.p1.value).toBe(5);
    
    // 2. Play all cards (simulate empty hands)
    G.players['0'].hand = [];
    G.players['1'].hand = [];
    
    // 3. Resolve
    checkRoundEnd(G);
    
    // Player 0 (7) > Player 1 (5)
    expect(G.players['0'].score).toBe(5);
    expect(G.activeClash).toBe(null);
  });



  test('End Game: Winner is determined by captured cards + bonuses', () => {
    const game = setupCustomGame((G) => {
      G.players['0'].captured = new Array(25).fill({}); 
      G.players['1'].captured = new Array(15).fill({}); 
      G.players['0'].score = 45; // Directly over 41
      G.players['1'].score = 0;
      G.deck = [];
      G.players['0'].hand = [];
      G.players['1'].hand = [];
      return G;
    });

    const client = Client({ game });
    const state = client.getState();
    
    // Create a mutable copy of G to avoid "read-only" errors in Vitest
    const mutableG = JSON.parse(JSON.stringify(state.G));
    checkRoundEnd(mutableG);
    
    expect(mutableG.gameStatus).toBeDefined();
    expect(mutableG.gameStatus.winner).toBe('0');
    expect(mutableG.matchesWon['0']).toBe(1);
  });
});
