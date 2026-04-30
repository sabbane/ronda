import { Client } from 'boardgame.io/client';
import { RondaGame } from './game.js';
import { expect, test, describe } from 'vitest';

describe('RondaGame - Bounti Rule', () => {
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
        // Apply overrides
        return setupOverrides(G, ctx);
      }
    };
  };

  test('Bounti is awarded when a player matches the last played card from the opponent', () => {
    const game = setupCustomGame((G) => {
      // Give 2 cards to avoid hand emptying and triggering turn.onEnd (which clears announcements)
      G.players['0'].hand = [
        { suit: 'coins', value: 5, displayValue: 5, id: 'coins-5' },
        { suit: 'swords', value: 1, displayValue: 1, id: 'swords-1' }
      ];
      G.players['1'].hand = [
        { suit: 'cups', value: 5, displayValue: 5, id: 'cups-5' },
        { suit: 'clubs', value: 1, displayValue: 1, id: 'clubs-1' }
      ];
      G.deck = [];
      return G;
    });

    const client = Client({ game });

    // Player 0 plays a 5 (no match, places on table)
    client.moves.playCard(0);
    
    let state = client.getState();
    expect(state.G.table.length).toBe(1);
    expect(state.G.lastPlayedCard).toEqual({ value: 5, player: '0' });

    // Player 1 plays a 5 (matches Player 0's 5)
    client.moves.playCard(0);
    state = client.getState();

    // Check announcements for Bounti
    const bountiAnnouncement = state.G.announcements.find(a => a.type === 'Bounti');
    expect(bountiAnnouncement).toBeDefined();
    expect(bountiAnnouncement.player).toBe('1');
    
    // Player 1 should get +1 for Bounti and +1 for Messa (table is empty)
    expect(state.G.players['1'].score).toBe(2);
    expect(state.G.players['0'].score).toBe(-2);
  });

  test('Bounti is NOT awarded if the matched card is not the last played card', () => {
    const game = setupCustomGame((G) => {
      G.players['0'].hand = [
        { suit: 'coins', value: 5, displayValue: 5, id: 'coins-5' },
        { suit: 'swords', value: 5, displayValue: 5, id: 'swords-5' }
      ];
      G.players['1'].hand = [
        { suit: 'cups', value: 7, displayValue: 7, id: 'cups-7' }, // Use 7 to avoid sequential capture with 5!
        { suit: 'clubs', value: 1, displayValue: 1, id: 'clubs-1' }
      ];
      G.deck = [];
      return G;
    });

    const client = Client({ game });

    // Player 0 plays a 5
    client.moves.playCard(0);
    
    // Player 1 plays a 7
    client.moves.playCard(0);

    let state = client.getState();
    expect(state.G.table.length).toBe(2);
    expect(state.G.lastPlayedCard).toEqual({ value: 7, player: '1' });

    // Player 0 plays a 5 (matches the 5 on table, but last played card was 7)
    client.moves.playCard(0); // This is index 0 of remaining hand, which is 'swords-5'
    state = client.getState();

    // Player 0 should not get a Bounti because lastPlayedCard was 7
    const bountiAnnouncement = state.G.announcements.find(a => a.type === 'Bounti');
    expect(bountiAnnouncement).toBeUndefined();

    // Player 0 gets no Bounti, table doesn't clear (7 is left), so no Messa.
    expect(state.G.players['0'].score).toBe(0);
  });

  test('Bounti is NOT awarded if a match happens but lastPlayedCard is null (e.g., matching a card that was not just played)', () => {
    const game = setupCustomGame((G) => {
      // Table already has a 7
      G.table = [{ suit: 'swords', value: 7, displayValue: 7, id: 'swords-7' }];
      G.players['0'].hand = [
        { suit: 'cups', value: 5, displayValue: 5, id: 'cups-5' }
      ];
      G.players['1'].hand = [
        { suit: 'clubs', value: 7, displayValue: 7, id: 'clubs-7' }
      ];
      return G;
    });

    const client = Client({ game });

    // Player 0 plays a 5
    client.moves.playCard(0);
    
    // Player 1 plays a 7, which matches the 7 on the table.
    // But lastPlayedCard is 5 from Player 0, not 7!
    client.moves.playCard(0);

    let state = client.getState();
    const bountiAnnouncement = state.G.announcements.find(a => a.type === 'Bounti');
    expect(bountiAnnouncement).toBeUndefined();
  });
});
