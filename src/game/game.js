import { INVALID_MOVE } from 'boardgame.io/core';

export const getNextValue = (val) => {
  if (val < 10) return val + 1;
  return null;
};

const generateDeck = () => {
  const suits = ['coins', 'cups', 'swords', 'clubs'];
  const deck = [];
  suits.forEach((suit) => {
    for (let i = 1; i <= 10; i++) {
      let displayValue = i;
      if (i === 8) displayValue = 10;
      if (i === 9) displayValue = 11;
      if (i === 10) displayValue = 12;
      deck.push({ suit, value: i, displayValue, id: `${suit}-${i}` });
    }
  });
  return deck;
};

const shuffle = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const addScore = (G, player, amount) => {
  const opponent = player === '0' ? '1' : '0';
  G.players[player].score += amount;
  G.players[opponent].score -= amount;
};

export const getHandRank = (hand) => {
  if (!hand || hand.length === 0) return null;
  const counts = {};
  hand.forEach(c => counts[c.value] = (counts[c.value] || 0) + 1);
  let type = null;
  let value = 0;
  for (const [valStr, count] of Object.entries(counts)) {
    const val = parseInt(valStr);
    if (count === 3) {
      type = 'Tringa';
      value = val;
    } else if (count === 2 && (!type || type === 'Ronda')) {
      type = 'Ronda';
      value = Math.max(value, val); // Higher Ronda wins if multiple
    }
  }
  return type ? { type, value } : null;
};

export const evaluateRondaTringa = (G) => {
  const p0Rank = getHandRank(G.players['0'].hand);
  const p1Rank = getHandRank(G.players['1'].hand);

  if (p0Rank && p1Rank) {
    G.activeClash = { p0: p0Rank, p1: p1Rank };
    G.announcements.push({ player: 'none', type: 'Clash', text: 'Clash! Both have cards!' });
  } else if (p0Rank) {
    addScore(G, '0', p0Rank.type === 'Tringa' ? 5 : 1);
    G.announcements.push({ player: '0', type: p0Rank.type });
  } else if (p1Rank) {
    addScore(G, '1', p1Rank.type === 'Tringa' ? 5 : 1);
    G.announcements.push({ player: '1', type: p1Rank.type });
  }
};

export const resolveClash = (G) => {
  if (!G.activeClash) return;
  
  const { p0, p1 } = G.activeClash;
  let winner = null;
  
  if (p0.type === 'Tringa' && p1.type === 'Ronda') winner = '0';
  else if (p1.type === 'Tringa' && p0.type === 'Ronda') winner = '1';
  else {
    if (p0.value > p1.value) winner = '0';
    else if (p1.value > p0.value) winner = '1';
    else winner = 'Draw'; 
  }
  
  if (winner && winner !== 'Draw') {
    addScore(G, winner, 5);
    const winnerRank = G.activeClash['p' + winner];
    G.announcements.push({ 
      player: winner, 
      type: 'Clash Won', 
      text: `Won Clash with ${winnerRank.type}! (+5)` 
    });
  } else {
    G.announcements.push({ 
      player: 'none', 
      type: 'Clash Draw', 
      text: `Clash Draw!` 
    });
  }
  
  G.activeClash = null;
};

export const checkRoundEnd = (G) => {
  if (G.players['0'].hand.length === 0 && G.players['1'].hand.length === 0) {
    resolveClash(G);
  }
};

const checkWaitForUI = (G, events) => {
  // If there are announcements OR an animation is running, we MUST go into waitForUI stage
  // to let the frontend finish its visual work before the next turn starts.
  if (G.announcements.length > 0 || G.isAnimating) {
    G.endTurnAfterUI = true;
    events.setActivePlayers({ all: 'waitForUI' });
    return true;
  }
  return false;
};


export const RondaGame = {
  name: 'ronda',
  setup: ({ ctx }) => {
    let deck = shuffle(generateDeck());
    const table = deck.splice(0, 4);
    const players = {
      '0': { hand: deck.splice(0, 3), captured: [], score: 0 },
      '1': { hand: deck.splice(0, 3), captured: [], score: 0 },
    };
    
    let G = {
      deck,
      table,
      players,
      lastCapture: null,
      lastPlayedCard: null,
      announcements: [],
      endTurnAfterUI: false,
      isAnimating: false
    };

    evaluateRondaTringa(G);

    return G;
  },

  moves: {
    dealCards: ({ G, ctx, events }) => {
      if (G.players['0'].hand.length === 0 && G.players['1'].hand.length === 0 && G.deck.length > 0) {
        G.announcements = [];
        G.players['0'].hand = G.deck.splice(0, 3);
        G.players['1'].hand = G.deck.splice(0, 3);
        
        G.isAnimating = true;
        evaluateRondaTringa(G);
        if (G.announcements.length > 0 || G.isAnimating) {
          G.endTurnAfterUI = false;
          events.setActivePlayers({ all: 'waitForUI' });
        }
      }
    },
    playCard: ({ G, ctx, events }, cardIndex) => {
      if (G.pendingCapture) return INVALID_MOVE;

      const player = ctx.currentPlayer;
      const hand = G.players[player].hand;
      const playedCard = hand[cardIndex];

      if (!playedCard) return INVALID_MOVE;

      // Clear announcements at the start of a move so they don't loop
      G.announcements = [];

      hand.splice(cardIndex, 1);

      let currentVal = playedCard.value;
      
      // Always put card on table first to animate it flying to table
      G.table.push(playedCard);
      
      let matchIndex = G.table.findIndex(c => c.value === currentVal && c.id !== playedCard.id);
      
      if (matchIndex !== -1) {
        // Mark for capture, but don't do it yet so UI has time to show it
        G.pendingCapture = {
          player: player,
          playedCardId: playedCard.id,
          currentVal: currentVal
        };
      } else {
        G.lastPlayedCard = { value: currentVal, player: player };
        G.isAnimating = true;
        checkRoundEnd(G);
        if (!checkWaitForUI(G, events)) {
          events.endTurn();
        }
      }
    },

    processCapture: ({ G, ctx, events }) => {
      if (!G.pendingCapture) return;
      
      const { player, playedCardId, currentVal } = G.pendingCapture;
      G.pendingCapture = null;
      
      const playedCardIndex = G.table.findIndex(c => c.id === playedCardId);
      if (playedCardIndex === -1) return; // safety check
      const playedCard = G.table.splice(playedCardIndex, 1)[0];
      const capturedCards = [playedCard];
      
      let matchIndex = G.table.findIndex(c => c.value === currentVal);
      
      if (matchIndex !== -1) {
        if (G.lastPlayedCard && G.lastPlayedCard.value === currentVal && G.lastPlayedCard.player !== player) {
          addScore(G, player, 1);
          G.announcements.push({ player, type: 'Bount' });
        }

        let matchedCard = G.table.splice(matchIndex, 1)[0];
        capturedCards.push(matchedCard);
        
        let nextVal = getNextValue(currentVal);
        while (nextVal !== null) {
          let nextMatchIndex = G.table.findIndex(c => c.value === nextVal);
          if (nextMatchIndex !== -1) {
            capturedCards.push(G.table.splice(nextMatchIndex, 1)[0]);
            nextVal = getNextValue(nextVal);
          } else {
            break;
          }
        }
        
        G.players[player].captured.push(...capturedCards);
        G.lastCapture = player;
        G.lastPlayedCard = null;
        G.isAnimating = true;

        if (G.table.length === 0 && (G.deck.length > 0 || G.players['0'].hand.length > 0)) {
          addScore(G, player, 1);
          G.announcements.push({ player, type: 'Missa' });
        }
      }
      
      checkRoundEnd(G);
      if (!checkWaitForUI(G, events)) {
        events.endTurn();
      }
    },
    clearAnnouncements: ({ G, events }) => {
      G.announcements = [];
      if (!G.isAnimating) {
        events.setActivePlayers({ all: null });
        if (G.endTurnAfterUI) {
          G.endTurnAfterUI = false;
          events.endTurn();
        }
      }
    },
    endAnimation: ({ G, events }) => {
      G.isAnimating = false;
      if (G.announcements.length === 0) {
        events.setActivePlayers({ all: null });
        if (G.endTurnAfterUI) {
          G.endTurnAfterUI = false;
          events.endTurn();
        }
      }
    }
  },

  turn: {
    onBegin: ({ G, events }) => {
      if (G.announcements && G.announcements.length > 0) {
        G.endTurnAfterUI = false;
        events.setActivePlayers({ all: 'waitForUI' });
      }
    },
    stages: {
      waitForUI: {
        // Moves are now inherited from main moves list
      }
    }
  },

  endIf: ({ G, ctx }) => {
    if (!G.players || !G.players['0'] || !G.players['1']) return;

    if (G.players['0'].hand.length === 0 && G.players['1'].hand.length === 0 && G.deck.length === 0) {
      let p0Cards = G.players['0'].captured.length;
      let p1Cards = G.players['1'].captured.length;
      
      if (G.lastCapture === '0') {
        p0Cards += G.table.length;
      } else if (G.lastCapture === '1') {
        p1Cards += G.table.length;
      }
      
      let p0Total = p0Cards + G.players['0'].score;
      let p1Total = p1Cards + G.players['1'].score;

      if (p0Total > p1Total) {
        return { winner: '0', score: p0Total, p0Score: p0Total, p1Score: p1Total };
      } else if (p1Total > p0Total) {
        return { winner: '1', score: p1Total, p0Score: p0Total, p1Score: p1Total };
      } else {
        return { draw: true, score: p0Total, p0Score: p0Total, p1Score: p1Total };
      }
    }
  },

  ai: {
    enumerate: (G, ctx, playerID) => {
      const player = playerID || ctx.currentPlayer;
      const hand = G.players[player]?.hand || [];
      
      if (G.pendingCapture) {
        if (G.pendingCapture.player === player) {
          return [{ move: 'processCapture' }];
        }
        return [];
      }

      if (G.players['0'].hand.length === 0 && G.players['1'].hand.length === 0 && G.deck.length > 0) {
        return [{ move: 'dealCards' }];
      }

      let moves = [];
      for (let i = 0; i < hand.length; i++) {
        moves.push({ move: 'playCard', args: [i] });
      }
      return moves;
    }
  }
};
