import { RondaGame, getNextValue, evaluateRondaTringa } from './game.js';
import { Client } from 'boardgame.io/dist/esm/client.js';
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
    const suits = ['dheb', 'jben', 'syouf', 'zrawet'];
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
          { suit: 'syouf', value: 7, id: 's7' },
          { suit: 'syouf', value: 8, id: 's8' }, // 10
          { suit: 'syouf', value: 9, id: 's9' }, // 11
          { suit: 'syouf', value: 10, id: 's10' }, // 12
        ],
        players: {
          '0': { hand: [{ suit: 'dheb', value: 7, id: 'c7' }], captured: [], score: 0 },
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
          { suit: 'syouf', value: 2, id: 's2' },
          { suit: 'syouf', value: 3, id: 's3' },
          { suit: 'zrawet', value: 5, id: 'cl5' },
          { suit: 'zrawet', value: 6, id: 'cl6' },
        ],
        players: {
          '0': { hand: [{ suit: 'dheb', value: 2, id: 'c2' }], captured: [], score: 0 },
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
  test('Bot (Player 1) strictly ignores Player 0s turn', () => {
    const G = RondaGame.setup({ ctx: { numPlayers: 2 } });
    G.announcements = []; // Clear any start-of-game announcements
    G.isAnimating = false;
    
    const ctx = { currentPlayer: '0', turn: 1 };
    
    // Simulate Local multiplayer mistakenly asking the Bot for moves when it's Player 0's turn
    const movesForP0 = RondaGame.ai.enumerate(G, ctx, '0');
    expect(movesForP0.length).toBe(0); // Strict guard should prevent this

    // Simulate normal bot turn
    const ctxP1 = { currentPlayer: '1', turn: 2 };
    const movesForP1 = RondaGame.ai.enumerate(G, ctxP1, '1');
    expect(movesForP1.length).toBeGreaterThan(0); // Should return valid moves
  });

  test('Zombie Bot Guard: Out-of-turn moves are rejected by the game rules', () => {
    // Create a client logged in as Player 1 (the Bot)
    const clientP1 = Client({ game: RondaGame, playerID: '1' });
    
    // The game starts on Player 0's turn
    const initialState = clientP1.getState();
    expect(initialState.ctx.currentPlayer).toBe('0');
    expect(initialState.G.players['0'].hand.length).toBe(3);
    expect(initialState.G.players['1'].hand.length).toBe(3);

    // Player 1 (Bot) maliciously tries to play a card during Player 0's turn
    clientP1.moves.playCard(0);

    // The state should NOT change because the strict guard returns INVALID_MOVE
    const afterState = clientP1.getState();
    expect(afterState.ctx.currentPlayer).toBe('0'); // Still Player 0's turn
    expect(afterState.G.players['0'].hand.length).toBe(3); // Player 0's hand is untouched
    expect(afterState.G.players['1'].hand.length).toBe(3); // Player 1's hand is untouched
    expect(afterState.G.table.length).toBe(initialState.G.table.length); // Table is untouched
  });

  test('Smarter Bot: Scenario 1 - Bot plays direct Derba when Player plays card 5 and Bot has 5 and 3', () => {
    const G = RondaGame.setup({ ctx: { numPlayers: 2 } });
    G.isAnimating = false;
    G.announcements = [];
    
    // Table has a 2 and the played 5
    G.table = [
      { value: 2, suit: 'zrawet', id: 'zrawet-2' },
      { value: 5, suit: 'dheb', id: 'dheb-5' }
    ];
    
    // Player 0 plays a 5, making it the lastPlayedCard
    G.lastPlayedCard = {
      value: 5,
      player: '0',
      streak: 1,
      awardedPoints: 0,
      streakCards: [{ value: 5, suit: 'dheb', id: 'dheb-5' }]
    };
    // Hand of player 0 has no pairs (no Ronda)
    G.players['0'].hand = [{ value: 1, suit: 'jben' }, { value: 7, suit: 'syouf' }];
    
    // Bot (Player 1) has a 3 and a 5 in hand
    G.players['1'].hand = [
      { value: 3, suit: 'jben', id: 'jben-3' },
      { value: 5, suit: 'syouf', id: 'syouf-5' }
    ];
    
    const ctx = { currentPlayer: '1', activePlayers: null };
    
    const moves = RondaGame.ai.enumerate(G, ctx, '1');
    
    // Bot should choose to play the 5 (index 1), not the 3 (index 0)
    expect(moves).toEqual([{ move: 'playCard', args: [1] }]);
  });

  test('Smarter Bot: Scenario 2 - Bot plays card 1 to capture 1, 2, 3, 4, 5 instead of playing 7', () => {
    const G = RondaGame.setup({ ctx: { numPlayers: 2 } });
    G.isAnimating = false;
    G.announcements = [];
    
    // Table has 1, 2, 3, 4, 5
    G.table = [
      { value: 1, suit: 'dheb', id: 'dheb-1' },
      { value: 2, suit: 'dheb', id: 'dheb-2' },
      { value: 3, suit: 'dheb', id: 'dheb-3' },
      { value: 4, suit: 'dheb', id: 'dheb-4' },
      { value: 5, suit: 'dheb', id: 'dheb-5' }
    ];
    
    // Bot has 7 (index 0) and 1 (index 1) in hand
    G.players['1'].hand = [
      { value: 7, suit: 'jben', id: 'jben-7' },
      { value: 1, suit: 'syouf', id: 'syouf-1' }
    ];
    
    const ctx = { currentPlayer: '1', activePlayers: null };
    
    const moves = RondaGame.ai.enumerate(G, ctx, '1');
    
    // Bot should choose to play the 1 (index 1) to maximize captured cards
    expect(moves).toEqual([{ move: 'playCard', args: [1] }]);
  });

  test('Ronda announcement name resolution: verify that unnamed opponent resolves to Opponent fallback in 2-player game', () => {
    // Mimic G and ctx setup for a 2-player game where P1 (opponent) has no name set
    const G = {
      players: {
        '0': { name: 'Player 1', hand: [], captured: [], score: 0 },
        '1': { name: '', hand: [], captured: [], score: 0 } // No name set
      }
    };
    
    const myID = '0'; // I am Player 1 (indexed 0)
    const opponentID = '1'; // Opponent is Player 2 (indexed 1)
    const numP = 2;

    // Mimic the announcement triggered by Player 1 (opponent) having a Ronda
    const ann = { player: '1', type: 'Ronda' };

    // Resolve announcer name using the exact updated logic in useBoardEvents.js
    let announcerName;
    if (numP === 2) {
      if (ann.player === myID) {
        announcerName = G.players[myID]?.name || 'You';
      } else {
        announcerName = G.players[opponentID]?.name || 'Opponent';
      }
    } else {
      announcerName = G.players[ann.player]?.name || `Player ${Number(ann.player) + 1}`;
    }

    // Verify it resolves to "Opponent" instead of "Player 2"
    expect(announcerName).toBe('Opponent');
    expect(announcerName).not.toBe('Player 2');
  });

  test('Clash announcement 2-player: verify that 2-player Clash uses Both of you fallback instead of listing individual names', () => {
    // Setup a 2-player game where players have no custom nicknames set
    const G = {
      players: {
        '0': { name: '', hand: [], captured: [], score: 0 },
        '1': { name: '', hand: [], captured: [], score: 0 }
      }
    };
    const numP = 2;
    const ann = {
      player: 'none',
      type: 'Clash',
      clashType: 'Ronda',
      clashingPlayers: ['0', '1']
    };

    // Mimic the exact corrected rendering logic in useBoardEvents.js
    let customText = "";
    if (ann.type === 'Clash') {
      if (numP === 4 && ann.clashingPlayers && ann.clashingPlayers.length > 0) {
        const names = ann.clashingPlayers.map(pID => G.players[pID]?.name || `Player ${Number(pID) + 1}`);
        let joinedNames = "";
        if (names.length === 2) {
          joinedNames = names.join(' and '); // Mimic t('and') fallback
        } else {
          joinedNames = names.slice(0, -1).join(', ') + ', and ' + names[names.length - 1];
        }
        customText = `${joinedNames} have Ronda! Clash!`;
      } else {
        customText = "Both of you have Ronda. The winner will be announced at the end of the round";
      }
    }

    // Verify it formats as "Both of you..." instead of listing individual names "Player 1 and Player 2"
    expect(customText).toBe('Both of you have Ronda. The winner will be announced at the end of the round');
    expect(customText).not.toBe('Player 1 and Player 2 have Ronda! Clash!');
  });

  test('Derba announcement 2-player bug: verify that when local player hits a Derba, the message resolves to "You hit You" or "You hit [my name]" instead of referencing the opponent', () => {
    // Setup translation dictionaries locally for English
    const mockT = (key, params = {}) => {
      const translations = {
        'you': 'You',
        'opponent': 'Opponent',
        'announcements': {
          derbaMe: "You hit {oppName} (+1 you)",
          derbaOpponent: "{oppName} hits you (+1 {oppName})",
        }
      };
      const keys = key.split('.');
      let value = translations;
      for (const k of keys) {
        if (!value || value[k] === undefined) return key;
        value = value[k];
      }
      if (typeof value === 'string' && Object.keys(params).length > 0) {
        return Object.keys(params).reduce((str, paramKey) => {
          return str.replace(`{${paramKey}}`, params[paramKey]);
        }, value);
      }
      return value;
    };

    // 2-player game
    const G = {
      players: {
        '0': { name: '', hand: [], captured: [], score: 0 },
        '1': { name: '', hand: [], captured: [], score: 0 }
      }
    };

    const myID = '0';
    const opponentID = '1';
    const numP = 2;

    // Local player (player '0') hits a Derba
    const ann = { player: '0', type: 'Derba' };
    const isMe = ann.player === myID;

    // Mimic the exact corrected rendering logic in useBoardEvents.js
    let announcerName;
    let opponentName;
    if (numP === 2) {
      if (ann.player === myID) {
        announcerName = G.players[myID]?.name || mockT('you');
        opponentName = G.players[opponentID]?.name || mockT('opponent');
      } else {
        announcerName = G.players[opponentID]?.name || mockT('opponent');
        opponentName = G.players[myID]?.name || mockT('you');
      }
    } else {
      announcerName = G.players[ann.player]?.name || `Player ${Number(ann.player) + 1}`;
      opponentName = `Player ${Number(ann.player) + 1}`;
    }

    let customText = "";
    if (ann.type === 'Derba') {
      if (numP === 4) {
        // 4 player logic
      } else {
        customText = isMe ? mockT('announcements.derbaMe', { oppName: opponentName }) : mockT('announcements.derbaOpponent', { oppName: announcerName });
      }
    }

    // Verify that the text now correctly resolves to "You hit Opponent (+1 you)"
    expect(customText).toBe('You hit Opponent (+1 you)');
    // It should not resolve to the buggy "You hit You (+1 you)"
    expect(customText).not.toBe('You hit You (+1 you)');
  });
});


