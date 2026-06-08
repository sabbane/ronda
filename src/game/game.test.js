import { Client } from 'boardgame.io/dist/esm/client.js';
import { Local } from 'boardgame.io/dist/esm/multiplayer.js';
import { RondaGame } from './game.js';
import { evaluateRondaTringa, checkRoundEnd } from './rules.js';
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
        { suit: 'syouf', value: 7, id: 's7' },
        { suit: 'syouf', value: 8, id: 's8' },
        { suit: 'syouf', value: 9, id: 's9' },
      ];
      G.players['0'].hand = [{ suit: 'jben', value: 7, id: 'c7' }];
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
      G.table = [{ suit: 'syouf', value: 5, id: 's5' }];
      G.players['0'].hand = [{ suit: 'jben', value: 5, id: 'c5' }];
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
      G.players['0'].hand = [{ suit: 'syouf', value: 3, id: 's3' }, { suit: 'dheb', value: 1, id: 'c1' }];
      G.players['1'].hand = [{ suit: 'jben', value: 3, id: 'c3' }, { suit: 'zrawet', value: 1, id: 'cl1' }];
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

  test('Taawida: Continuous matching should award +5 and +10 points', () => {
    const game = setupCustomGame((G) => {
      G.players['0'].hand = [{ suit: 'syouf', value: 3, id: 's3' }, { suit: 'dheb', value: 3, id: 'co3' }];
      G.players['1'].hand = [{ suit: 'jben', value: 3, id: 'c3' }, { suit: 'zrawet', value: 3, id: 'cl3' }];
      return G;
    });

    const client = Client({ game });
    
    // Player 0 plays 3
    client.moves.playCard(0);
    advanceUI(client);

    // Player 1 matches 3 (Derba)
    client.moves.playCard(0);
    client.moves.processCapture();
    
    let state = client.getState();
    expect(state.G.announcements.find(a => a.type === 'Derba')).toBeDefined();
    expect(state.G.players['1'].score).toBe(2); // Derba (+1) + Missa (+1)
    
    advanceUI(client);
    
    // Player 0 plays 3 (Taawida +5)
    client.moves.playCard(0);
    client.moves.processCapture();
    
    state = client.getState();
    expect(state.G.announcements.find(a => a.type === 'Taawida')).toBeDefined();
    // P0 gets 5 pts for Taawida, plus Missa transfer (+1)
    expect(state.G.players['0'].score).toBe(6);
    
    advanceUI(client);
    
    // Player 1 plays 3 (Taawida +10)
    client.moves.playCard(0);
    client.moves.processCapture();

    state = client.getState();
    // P1 had 2 points. Lost 1 point during P0's Taawida (Derba deduction). 
    // Now P1 gets +10 points for Taawida. Score = 2 - 1 + 10 = 11.
    expect(state.G.players['1'].score).toBe(11); 
    // P0 loses the 5 points from their Taawida. Score = 0.
    expect(state.G.players['0'].score).toBe(0);
    // P1 captured array should contain all 4 cards
    expect(state.G.players['1'].captured.length).toBe(4);
    expect(state.G.players['0'].captured.length).toBe(0);
  });

  test('Taawida: Score transfer 1 to 4 -> 9 to 1 scenario', () => {
    const game = setupCustomGame((G) => {
      // Start with 1 point each
      G.players['0'].score = 1;
      G.players['1'].score = 1;
      G.players['0'].hand = [{ suit: 'dheb', value: 5, id: 'd5-1' }, { suit: 'dheb', value: 5, id: 'd5-2' }];
      G.players['1'].hand = [{ suit: 'jben', value: 5, id: 'j5-1' }];
      G.table = [{ suit: 'syouf', value: 2, id: 's2' }]; // Distraction card on table
      return G;
    });

    const client = Client({ game });

    // 1. P0 plays 5
    client.moves.playCard(0);
    advanceUI(client);
    
    // 2. P1 plays 5 (Derba +1)
    client.moves.playCard(0);
    client.moves.processCapture();
    
    let state = client.getState();
    // P1 score: 1 (init) + 1 (Derba) = 2. 
    // Card count: P1 captured 2 cards (5 from P0, 5 from P1).
    // User calculates "Total" (score + cards) = 2 + 2 = 4.
    expect(state.G.players['1'].score).toBe(2);
    expect(state.G.players['1'].captured.length).toBe(2);
    
    advanceUI(client);

    // 3. P0 plays 5 (Taawida +5)
    client.moves.playCard(0);
    client.moves.processCapture();
    
    state = client.getState();
    // P1 loses Derba point: 2 - 1 = 1.
    // P1 loses 2 captured cards.
    expect(state.G.players['1'].score).toBe(1);
    expect(state.G.players['1'].captured.length).toBe(0);
    
    // P0 score: 1 (init) + 5 (Taawida) = 6.
    // P0 captured cards: 2 (from P1) + 1 (just played) = 3.
    // User calculation: 6 + 3 = 9.
    expect(state.G.players['0'].score).toBe(6);
    expect(state.G.players['0'].captured.length).toBe(3);
  });

  test('Ronda Detection: Starting a round with a pair should award +1 point', () => {
    const game = setupCustomGame((G) => {
      G.players['0'].hand = [
        { suit: 'syouf', value: 7, id: 's7' },
        { suit: 'jben', value: 7, id: 'c7' },
        { suit: 'dheb', value: 1, id: 'co1' }
      ];
      G.players['1'].hand = [
        { suit: 'syouf', value: 1, id: 's1' },
        { suit: 'jben', value: 2, id: 'c2' },
        { suit: 'dheb', value: 3, id: 'co3' }
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
    expect(G.players['0'].score).toBe(2);
    expect(G.activeClash).toBe(null);
  });



  test('End Game: Score calculation correctly adds captured cards, bonuses, and King Finish', () => {
    const game = setupCustomGame((G) => {
      // Player 0: 20 captured, 3 bonus score. Last card is King, captures King on table.
      G.players['0'].captured = new Array(20).fill({ id: 'c0' }); 
      G.players['1'].captured = new Array(10).fill({ id: 'c1' }); 
      G.players['0'].score = 3; 
      G.players['1'].score = 5; 
      
      G.table = [{ suit: 'syouf', value: 10, id: 's10' }]; // 12 on table
      G.lastCapture = '1'; // Player 1 made the last capture before this
      
      G.deck = [];
      G.players['0'].hand = [{ suit: 'dheb', value: 10, id: 'c10' }]; // 12 in hand (Last card)
      G.players['1'].hand = [];
      return G;
    });

    const client = Client({ game });
    
    // Player 0 plays 12 (King) - this is the last card of the game
    client.moves.playCard(0);
    client.moves.processCapture();
    
    const state = client.getState();
    
    expect(state.G.gameStatus).toBeDefined();
    
    // Player 0:
    // Started with 20 captured.
    // Captured 2 cards (hand King + table King) -> 22 captured.
    // Started with 3 score.
    // Got +5 for King Finish -> 8 score.
    // Total = 22 + 8 = 30.
    expect(state.G.gameStatus.p0Score).toBe(30);
    
    // Player 1:
    // Started with 10 captured.
    // Hand was empty, deck was empty.
    // But Player 1 was NOT the last capturer (Player 0 just captured).
    // Wait! Player 0 just captured, so G.lastCapture is now '0'.
    // So Player 1 gets no table cards.
    // Score was 5.
    // Total = 10 + 5 = 15.
    expect(state.G.gameStatus.p1Score).toBe(15);
    
    expect(state.G.gameStatus.winner).toBe('0');
  });

  test('King Finish: Capturing with a 12 as the very last card awards 5 points', () => {
    const game = setupCustomGame((G) => {
      G.table = [{ suit: 'syouf', value: 10, id: 's10' }]; // 12 on table
      G.deck = [];
      G.players['0'].hand = [{ suit: 'dheb', value: 10, id: 'c10' }]; // 12 in hand
      G.players['1'].hand = []; // Opponent empty
      return G;
    });

    const client = Client({ game });
    
    // Player 0 plays 12
    client.moves.playCard(0);
    client.moves.processCapture();
    
    const state = client.getState();
    expect(state.G.announcements.find(a => a.type === 'King Finish')).toBeDefined();
    expect(state.G.players['0'].score).toBe(5); // +5 for King Finish
  });

  test('Clash: Ronda vs Tringa should resolve immediately', () => {
    const game = setupCustomGame((G) => {
      G.players['0'].hand = [{ suit: 'dheb', value: 5, id: 'd5-1' }, { suit: 'jben', value: 5, id: 'j5-1' }]; // Ronda
      G.players['1'].hand = [{ suit: 'syouf', value: 1, id: 's1' }, { suit: 'zrawet', value: 1, id: 'z1' }, { suit: 'dheb', value: 1, id: 'd1' }]; // Tringa
      evaluateRondaTringa(G); // Re-evaluate with new hands
      return G;
    });

    const client = Client({ game });
    const state = client.getState();

    // Check if Tringa player (P1) got 6 points immediately
    expect(state.G.players['1'].score).toBe(6);
    expect(state.G.announcements.find(a => a.type === 'TringaWins')).toBeDefined();
    expect(state.G.activeClash).toBeNull();
  });

  test('Final Fail: Missing the last capture awards 5 points to the opponent', () => {
    const game = setupCustomGame((G) => {
      G.deck = [];
      G.players['0'].hand = [{ suit: 'dheb', value: 1, id: 'd1' }];
      G.players['1'].hand = [];
      G.table = [{ suit: 'jben', value: 5, id: 'j5' }]; // No match for d1
      return G;
    });

    const client = Client({ game });
    
    // P0 plays 1, misses capture (Final card of game)
    client.moves.playCard(0);
    
    const state = client.getState();
    // P1 (opponent) should get 5 points
    expect(state.G.players['1'].score).toBe(5);
    expect(state.G.announcements.find(a => a.type === 'Final Fail')).toBeDefined();
  });

  test('As Finish: Capturing with Ace as the last card awards 5 points to the opponent', () => {
    const game = setupCustomGame((G) => {
      G.deck = [];
      G.players['0'].hand = [{ suit: 'dheb', value: 1, id: 'd1' }];
      G.players['1'].hand = [];
      G.table = [{ suit: 'jben', value: 1, id: 'j1' }]; // Match for d1
      return G;
    });

    const client = Client({ game });
    
    // P0 plays 1, captures j1 (Final card of game)
    client.moves.playCard(0);
    client.moves.processCapture();
    
    const state = client.getState();
    // P1 (opponent) should get 5 points
    expect(state.G.players['1'].score).toBe(5);
    expect(state.G.announcements.find(a => a.type === 'As Finish')).toBeDefined();
  });

  test('Taawida: Player 1 counters immediately after Player 2s Derba + Missa on 10, winning all cards and points', () => {
    const game = setupCustomGame((G) => {
      // Start with 1 point each
      G.players['0'].score = 1;
      G.players['1'].score = 1;
      
      // Player 1 (Player 0): 10, 10, 5
      G.players['0'].hand = [
        { suit: 'dheb', value: 8, id: 'p0-10-1' }, // displayValue 10
        { suit: 'jben', value: 8, id: 'p0-10-2' }, // displayValue 10
        { suit: 'dheb', value: 5, id: 'p0-5' }
      ];
      
      // Player 2 (Player 1): 6, 10, 2
      G.players['1'].hand = [
        { suit: 'dheb', value: 6, id: 'p1-6' },
        { suit: 'syouf', value: 8, id: 'p1-10' }, // displayValue 10
        { suit: 'dheb', value: 2, id: 'p1-2' }
      ];
      
      // Table: 11, 12
      G.table = [
        { suit: 'dheb', value: 9, id: 't11' }, // displayValue 11
        { suit: 'dheb', value: 10, id: 't12' } // displayValue 12
      ];
      
      // Keep some cards in deck so it doesn't trigger Final Fail
      G.deck = [
        { suit: 'zrawet', value: 4, id: 'deck-1' },
        { suit: 'zrawet', value: 7, id: 'deck-2' }
      ];
      
      return G;
    });

    const client = Client({ game });

    // 1. Player 1 plays 10
    client.moves.playCard(0); // Plays p0-10-1
    advanceUI(client);

    // 2. Player 2 plays 10 (Derba + Missa on the table cards 10, 11, 12)
    client.moves.playCard(1); // Plays p1-10 (which is at index 1 of [6, 10, 2])
    client.moves.processCapture();
    advanceUI(client);

    // 3. Player 1 counters immediately with their second 10 (Taawida)
    client.moves.playCard(0); // Plays p0-10-2 (which is at index 0 of [10, 5])
    client.moves.processCapture();
    advanceUI(client);

    const state = client.getState();

    // Player 2's points and cards should be completely reset/cancelled to initial state (1 point, 0 captured cards)
    expect(state.G.players['1'].score).toBe(1);
    expect(state.G.players['1'].captured.length).toBe(0);

    // Player 1 should win all points and cards:
    // Score: 1 (start) + 5 (Taawida) + 1 (Missa) = 7 points
    // Captured cards: 5 cards (the three 10s, 11, and 12)
    // Total points (Score + Captured Cards) = 7 + 5 = 12 points
    expect(state.G.players['0'].score).toBe(7);
    expect(state.G.players['0'].captured.length).toBe(5);

    const p0Total = state.G.players['0'].score + state.G.players['0'].captured.length;
    expect(p0Total).toBe(12);

    const p1Total = state.G.players['1'].score + state.G.players['1'].captured.length;
    expect(p1Total).toBe(1);
  });

  test('Counter-Derba: Rapid recursive counters down to empty hands must transition turn correctly without engine crash', async () => {
    const game = setupCustomGame((G) => {
      G.deck = [
        { suit: 'dheb', value: 1, id: 'deck-1' },
        { suit: 'jben', value: 2, id: 'deck-2' },
        { suit: 'syouf', value: 3, id: 'deck-3' },
        { suit: 'zrawet', value: 4, id: 'deck-4' },
        { suit: 'dheb', value: 6, id: 'deck-5' },
        { suit: 'jben', value: 7, id: 'deck-6' }
      ];
      // Setup two 5s for each player to enable the recursive counter chain
      G.players['0'].hand = [
        { suit: 'syouf', value: 5, id: 's5_1' },
        { suit: 'dheb', value: 5, id: 'c5_1' }
      ];
      G.players['1'].hand = [
        { suit: 'jben', value: 5, id: 'cl5_1' },
        { suit: 'zrawet', value: 5, id: 'b5_1' }
      ];
      return G;
    });

    // Create two clients connected via local in-memory transport
    const client0 = Client({ game, numPlayers: 2, playerID: '0', multiplayer: Local() });
    const client1 = Client({ game, numPlayers: 2, playerID: '1', multiplayer: Local() });

    client0.start();
    client1.start();

    // Helper to wait a tiny bit to let Local transport sync
    const sync = () => new Promise(r => setTimeout(r, 50));

    const advanceLocalUI = async (client) => {
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

    // 1. P0 plays their first 5
    client0.moves.playCard(0);
    await advanceLocalUI(client0);
    await sync();

    // 2. P1 plays their first 5 (triggers Derba)
    client1.moves.playCard(0);
    await sync();

    // 3. P0 counters immediately with second 5
    client0.moves.counterDerba(0);
    await sync();

    // 4. P1 counters immediately with second 5 (Ultimate Attack)
    client1.moves.counterDerba(0);
    await sync();

    // 5. Ultimate Attack settles: processCapture is called
    client1.moves.processCapture();
    await sync();
    
    // 6. Clear announcements and animations to allow turn to transition normally
    await advanceLocalUI(client1);
    await sync();

    const state = client1.getState();
    
    expect(state.ctx.currentPlayer).toBe('0');
    expect(state.G.pendingCapture).toBeNull();
    // Verify deterministic gameplay scores (P1 won Ultimate Attack, P0's Taawida 3 was subtracted)
    expect(state.G.players['1'].score).toBe(11);
    expect(state.G.players['0'].score).toBe(0);

    client0.stop();
    client1.stop();
  });
});
