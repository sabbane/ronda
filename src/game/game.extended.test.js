import { RondaGame, getNextValue, evaluateRondaTringa } from './game.js';
import { Client } from 'boardgame.io/client';
import { expect, test, describe } from 'vitest';

describe('Ronda Game Logic - Deep Testing', () => {
  
  const advanceUI = (client) => {
    const state = client.getState();
    if (state.G.isAnimating || (state.G.announcements && state.G.announcements.length > 0)) {
      client.moves.endAnimation();
      client.moves.clearAnnouncements();
    }
  };

  test('getNextValue follows the Ronda sequence (1-7, 10-12)', () => {

    // Note: Internally values are 1-10. 1-7 are literal, 8=10, 9=11, 10=12.
    expect(getNextValue(1)).toBe(2);
    expect(getNextValue(7)).toBe(8); // 7 -> 10 (which is 8)
    expect(getNextValue(8)).toBe(9); // 10 -> 11 (which is 9)
    expect(getNextValue(9)).toBe(10); // 11 -> 12 (which is 10)
    expect(getNextValue(10)).toBe(null); // 12 is the end
  });

  test('Deck generation has 40 cards with correct distribution', () => {
    const G = RondaGame.setup({ ctx: { numPlayers: 2 } });
    // Total cards = deck (30) + table (4) + hands (3+3) = 40
    const totalCards = G.deck.length + G.table.length + G.players['0'].hand.length + G.players['1'].hand.length;
    expect(totalCards).toBe(40);

    const allCards = [...G.deck, ...G.table, ...G.players['0'].hand, ...G.players['1'].hand];
    const suits = ['coins', 'cups', 'swords', 'clubs'];
    suits.forEach(suit => {
      const suitCards = allCards.filter(c => c.suit === suit);
      expect(suitCards.length).toBe(10);
      
      const values = suitCards.map(c => c.value).sort((a, b) => a - b);
      expect(values).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });
  });

  test('Complex Sequence Capture: 7 captures 7, 10, 11, 12', () => {
    const customGame = {
      ...RondaGame,
      setup: () => ({
        ...RondaGame.setup({ ctx: { numPlayers: 2 } }),
        table: [
          { suit: 'swords', value: 7, id: 's7' },
          { suit: 'swords', value: 8, id: 's8' }, // 10
          { suit: 'swords', value: 9, id: 's9' }, // 11
          { suit: 'swords', value: 10, id: 's10' }, // 12
        ],
        players: {
          '0': { hand: [{ suit: 'coins', value: 7, id: 'c7' }], captured: [], score: 0 },
          '1': { hand: [], captured: [], score: 0 }
        }
      })
    };

    const client = Client({ game: customGame });
    client.moves.playCard(0);
    client.moves.processCapture();

    const state = client.getState();
    expect(state.G.players['0'].captured.length).toBe(5); // 1 played + 4 captured
    expect(state.G.table.length).toBe(0);
  });

  test('Tringa (3 of a kind) detection and scoring (+5)', () => {
    const G = {
      players: {
        '0': { hand: [{ value: 5 }, { value: 5 }, { value: 5 }], score: 0 },
        '1': { hand: [{ value: 1 }, { value: 2 }, { value: 3 }], score: 0 }
      },
      announcements: []
    };
    evaluateRondaTringa(G);
    expect(G.players['0'].score).toBe(5);
    expect(G.announcements[0].type).toBe('Tringa');
  });

  test('Multiple Sequence Captures on different values should only capture the matching sequence', () => {
    const customGame = {
      ...RondaGame,
      setup: () => ({
        ...RondaGame.setup({ ctx: { numPlayers: 2 } }),
        table: [
          { suit: 'swords', value: 2, id: 's2' },
          { suit: 'swords', value: 3, id: 's3' },
          { suit: 'clubs', value: 5, id: 'cl5' },
          { suit: 'clubs', value: 6, id: 'cl6' },
        ],
        players: {
          '0': { hand: [{ suit: 'coins', value: 2, id: 'c2' }], captured: [], score: 0 },
          '1': { hand: [], captured: [], score: 0 }
        }
      })
    };

    const client = Client({ game: customGame });
    advanceUI(client);
    client.moves.playCard(0);
    client.moves.processCapture();
    advanceUI(client);

    const state = client.getState();
    // Should capture 2 and 3, but NOT 5 and 6
    expect(state.G.players['0'].captured.length).toBe(3); // 1 played + 2 captured
    expect(state.G.table.length).toBe(2);
    expect(state.G.table.some(c => c.value === 5)).toBe(true);
  });
});
