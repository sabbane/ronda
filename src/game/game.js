import { INVALID_MOVE } from 'boardgame.io/dist/esm/core.js';

export const getNextValue = (val) => {
  if (val < 10) return val + 1;
  return null;
};

const generateDeck = () => {
  const suits = ['dheb', 'jben', 'syouf', 'zrawet'];
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
  G.players[player].score += amount;
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
    if (p0Rank.type !== p1Rank.type) {
      // Tringa vs Ronda: Resolve immediately
      const winner = p0Rank.type === 'Tringa' ? '0' : '1';
      const pts = 6;
      addScore(G, winner, pts);
      G.announcements.push({ 
        player: winner, 
        type: 'TringaWins', 
        pts: pts 
      });
      G.activeClash = null;
    } else {
      G.activeClash = { p0: p0Rank, p1: p1Rank };
      G.announcements.push({ player: 'none', type: 'Clash', clashType: p0Rank.type });
    }
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
  let pts = 2; // Default for Ronda vs Ronda
  
  if (p0.type === 'Tringa' && p1.type === 'Ronda') {
    winner = '0';
    pts = 6;
  } else if (p1.type === 'Tringa' && p0.type === 'Ronda') {
    winner = '1';
    pts = 6;
  } else {
    if (p0.type === 'Tringa' && p1.type === 'Tringa') pts = 10;
    
    if (p0.value > p1.value) winner = '0';
    else if (p1.value > p0.value) winner = '1';
    else winner = 'Draw'; 
  }
  
  if (winner && winner !== 'Draw') {
    addScore(G, winner, pts);
    const winnerRank = G.activeClash['p' + winner];
    G.announcements.push({ 
      player: winner, 
      type: 'Clash Won', 
      text: `Won Clash with ${winnerRank.type}! (+${pts})`,
      pts: pts,
      rankType: winnerRank.type
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
    
    // If deck is also empty, the game (round) is totally over
    if (G.deck.length === 0 && !G.gameStatus) {
      if (!G.matchesWon) {
        G.matchesWon = { '0': 0, '1': 0 };
      }

      // Give remaining table cards to the last player who captured
      if (G.table.length > 0 && G.lastCapture !== null) {
        G.players[G.lastCapture].captured.push(...G.table);
        G.table = [];
      }

      const p0Total = G.players['0'].score + G.players['0'].captured.length;
      const p1Total = G.players['1'].score + G.players['1'].captured.length;
      let winner = 'Draw';
      if (p0Total > p1Total) {
        winner = '0';
        G.matchesWon['0']++;
      }
      else if (p1Total > p0Total) {
        winner = '1';
        G.matchesWon['1']++;
      }
      
      G.gameStatus = { winner, p0Score: p0Total, p1Score: p1Total };
    }
  }
};

const checkWaitForUI = (G, events) => {
  // If there are announcements OR an animation is running, we MUST go into waitForUI stage
  // to let the frontend finish its visual work before the next turn starts or before the game ends.
  if (G.announcements.length > 0 || G.isAnimating) {
    G.endTurnAfterUI = true;
    events.setActivePlayers({ all: 'waitForUI' });
    return true;
  }

  // If the game ended and there are no more animations/announcements, go directly to gameOver stage.
  // This ensures the Play Again button works immediately when the overlay appears.
  if (G.gameStatus) {
    events.setActivePlayers({ all: 'gameOver' });
    return true;
  }

  return false;
};


export const RondaGame = {
  name: 'ronda',
  setup: ({ ctx }, setupData) => {
    let deck;
    const matchID = ctx?.matchID;
    
    // Test mode is activated when:
    //   1. setupData.testMode = true  (set by POST /test/reset in server.js → lobbyClient.createMatch)
    //   2. matchID contains "test"    (fallback for direct URL access during development)
    const isTestMode = setupData?.testMode === true || (matchID && /test/i.test(matchID));

    if (isTestMode) {
      // RIGGED DECK FOR TEST SCENARIOS
      deck = [
        { value: 1, suit: 'dheb' }, { value: 2, suit: 'dheb' }, { value: 3, suit: 'dheb' }, { value: 4, suit: 'dheb' }, // Table
        { value: 5, suit: 'dheb' }, { value: 5, suit: 'jben' }, { value: 6, suit: 'dheb' }, // P0 R1
        { value: 7, suit: 'dheb' }, { value: 7, suit: 'jben' }, { value: 8, suit: 'dheb' }, // P1 R1
        { value: 9, suit: 'dheb' }, { value: 9, suit: 'jben' }, { value: 5, suit: 'zrawet' }, // P0 R2 (Swapped 6-jben for 5-zrawet)
        { value: 9, suit: 'syouf' }, { value: 9, suit: 'zrawet' }, { value: 8, suit: 'jben' }, // P1 R2
        { value: 1, suit: 'jben' }, { value: 6, suit: 'zrawet' }, { value: 10, suit: 'syouf' }, // P0 R3 (Swapped 1s/1z for end-cards)
        { value: 2, suit: 'jben' }, { value: 2, suit: 'syouf' }, { value: 10, suit: 'zrawet' }, // P1 R3 (Swapped 4-jben for 10-zrawet)
        { value: 3, suit: 'jben' }, { value: 3, suit: 'syouf' }, { value: 3, suit: 'zrawet' }, // P0 R4
        { value: 4, suit: 'syouf' }, { value: 4, suit: 'zrawet' }, { value: 6, suit: 'syouf' }, // P1 R4
        { value: 4, suit: 'jben' }, { value: 6, suit: 'jben' }, { value: 7, suit: 'syouf' }, // P0 R5 (Received 4-jben and 6-jben)
        { value: 7, suit: 'zrawet' }, { value: 2, suit: 'zrawet' }, { value: 8, suit: 'zrawet' }, // P1 R5 (Swapped 8s for end-card)
        
        // LAST ROUND (Indices 34-39)
        // P0: 12 (10d), 1 (1z), 10 (8s)
        { value: 10, suit: 'dheb' }, { value: 1, suit: 'zrawet' }, { value: 8, suit: 'syouf' },
        // P1: 12 (10j), 1 (1s), 5 (5s)
        { value: 10, suit: 'jben' }, { value: 1, suit: 'syouf' }, { value: 5, suit: 'syouf' }
      ].map(card => {
        let displayValue = card.value;
        if (card.value === 8) displayValue = 10;
        if (card.value === 9) displayValue = 11;
        if (card.value === 10) displayValue = 12;
        return { ...card, displayValue, id: `${card.suit}-${card.value}` };
      });
    } else {
      // NORMAL SHUFFLED DECK
      deck = shuffle(generateDeck());
    }


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
      pendingCapture: null,
      isAnimating: true,
      gameStarted: true,
      endTurnAfterUI: false,
      gameStatus: null, // Custom game over state
      matchesWon: { '0': 0, '1': 0 }, // Track overall games won
    };

    evaluateRondaTringa(G);

    return G;
  },

  moves: {
    playCard: ({ G, ctx, events, playerID }, cardIndex) => {
      if (G.pendingCapture) return INVALID_MOVE;

      // Ensure the move is executed by the player whose turn it actually is.
      // In tests where playerID might be undefined/null, we fall back to currentPlayer.
      const player = (playerID !== undefined && playerID !== null) ? playerID : ctx.currentPlayer;
      if (player !== ctx.currentPlayer) return INVALID_MOVE;


      const hand = G.players[player].hand;
      if (cardIndex < 0 || cardIndex >= hand.length) return INVALID_MOVE;
      const playedCard = hand[cardIndex];

      if (!playedCard) return INVALID_MOVE;


      // Clear announcements at the start of a move so they don't loop
      G.announcements = [];

      hand.splice(cardIndex, 1);

      let currentVal = playedCard.value;
      
      // Always put card on table first to animate it flying to table
      G.table.push(playedCard);
      
      let matchIndex = G.table.findIndex(c => c.value === currentVal && c.id !== playedCard.id);
      
      if (matchIndex !== -1 || (G.lastPlayedCard && G.lastPlayedCard.value === currentVal && G.lastPlayedCard.player !== player && G.lastPlayedCard.streak >= 2)) {
        // Mark for capture or Taawida transfer
        G.pendingCapture = {
          player: player,
          playedCardId: playedCard.id,
          currentVal: currentVal,
          isTaawidaTransfer: matchIndex === -1
        };
        G.isAnimating = true;
        checkWaitForUI(G, events);
      } else {
        // Normal drop, starts a new potential streak
        G.lastPlayedCard = { 
          value: currentVal, 
          player: player, 
          streak: 1, 
          awardedPoints: 0, 
          streakCards: [playedCard] 
        };
        G.isAnimating = true;
        
        // Final Fail Rule: if the last card of the game is played and does not capture
        if (G.deck.length === 0 && G.players['0'].hand.length === 0 && G.players['1'].hand.length === 0) {
          const opponent = player === '0' ? '1' : '0';
          addScore(G, opponent, 5);
          G.announcements.push({ player: opponent, type: 'Final Fail' });
        }

        checkRoundEnd(G);
        if (!checkWaitForUI(G, events)) {
          events.endTurn();
        }
      }
    },
    processCapture: ({ G, ctx, events }) => {
      if (!G.pendingCapture) return INVALID_MOVE;
      const player = G.pendingCapture.player;
      const { playedCardId, currentVal, isTaawidaTransfer } = G.pendingCapture;
      G.pendingCapture = null;
      const playedCardIndex = G.table.findIndex(c => c.id === playedCardId);
      if (playedCardIndex === -1) return INVALID_MOVE;
      const playedCard = G.table.splice(playedCardIndex, 1)[0];
      const capturedCards = [playedCard];
      let matchIndex = G.table.findIndex(c => c.value === currentVal);
      if (matchIndex !== -1 || isTaawidaTransfer) {
        if (isTaawidaTransfer) {
          const newStreak = G.lastPlayedCard.streak + 1;
          const scoreToAdd = newStreak === 3 ? 5 : 10;
          const opponent = G.lastPlayedCard.player;
          G.players[opponent].score -= G.lastPlayedCard.awardedPoints || 0;
          const cardsToTransfer = G.lastPlayedCard.streakCards || [];
          G.players[opponent].captured = G.players[opponent].captured.filter(c => !cardsToTransfer.some(tc => tc.id === c.id));
          capturedCards.push(...cardsToTransfer);
          addScore(G, player, scoreToAdd);
          G.announcements.push({ player, type: 'Taawida', streak: newStreak });
          G.lastPlayedCard = { value: currentVal, player: player, streak: newStreak, awardedPoints: scoreToAdd, streakCards: [...cardsToTransfer, playedCard] };
        } else {
          let matchedCard = G.table.splice(matchIndex, 1)[0];
          capturedCards.push(matchedCard);
          if (G.lastPlayedCard && G.lastPlayedCard.value === currentVal && G.lastPlayedCard.player !== player) {
            const newStreak = (G.lastPlayedCard.streak || 1) + 1;
            let awardedPoints = 0;
            let streakCards = [];
            if (newStreak === 2) { awardedPoints = 1; addScore(G, player, awardedPoints); G.announcements.push({ player, type: 'Derba' }); streakCards = [matchedCard, playedCard]; }
            else if (newStreak === 4) {
              awardedPoints = 10;
              const opponent = G.lastPlayedCard.player;
              G.players[opponent].score -= G.lastPlayedCard.awardedPoints || 0;
              const cardsToTransfer = G.lastPlayedCard.streakCards || [];
              G.players[opponent].captured = G.players[opponent].captured.filter(c => !cardsToTransfer.some(tc => tc.id === c.id));
              capturedCards.push(...cardsToTransfer);
              streakCards = [...cardsToTransfer, matchedCard, playedCard];
              addScore(G, player, awardedPoints);
              G.announcements.push({ player, type: 'Taawida', streak: newStreak });
            }
            G.lastPlayedCard = { value: currentVal, player: player, streak: newStreak, awardedPoints, streakCards };
          } else { G.lastPlayedCard = null; }
          let nextVal = getNextValue(currentVal);
          while (nextVal !== null) {
            let nextMatchIndex = G.table.findIndex(c => c.value === nextVal);
            if (nextMatchIndex !== -1) { capturedCards.push(G.table.splice(nextMatchIndex, 1)[0]); nextVal = getNextValue(nextVal); }
            else break;
          }
        }
        G.players[player].captured.push(...capturedCards);
        G.lastCapture = player;
        G.isAnimating = true;
        if (!isTaawidaTransfer && G.table.length === 0 && (G.deck.length > 0 || G.players['0'].hand.length > 0)) { addScore(G, player, 1); G.announcements.push({ player, type: 'Missa' }); }
        if (currentVal === 10 && G.deck.length === 0 && G.players['0'].hand.length === 0 && G.players['1'].hand.length === 0) { addScore(G, player, 5); G.announcements.push({ player, type: 'King Finish' }); }
        if (currentVal === 1 && G.deck.length === 0 && G.players['0'].hand.length === 0 && G.players['1'].hand.length === 0) { const opponent = player === '0' ? '1' : '0'; addScore(G, opponent, 5); G.announcements.push({ player: opponent, type: 'As Finish' }); }
      }
      checkRoundEnd(G);
      checkWaitForUI(G, events);
    },
  },


  turn: {
    onBegin: ({ G, ctx, events }) => {
      // 1. Auto-deal ONLY if both hands are completely empty and deck has cards
      const p0HandEmpty = !G.players['0'].hand || G.players['0'].hand.length === 0;
      const p1HandEmpty = !G.players['1'].hand || G.players['1'].hand.length === 0;
      
      if (p0HandEmpty && p1HandEmpty && G.deck.length > 0) {
        G.players['0'].hand = G.deck.splice(0, 3);
        G.players['1'].hand = G.deck.splice(0, 3);
        G.lastPlayedCard = null; // Clear last played card so Derba doesn't carry over to a new round
        G.isAnimating = true;
        evaluateRondaTringa(G);
      }

      // 2. If there are announcements or animations, wait for UI
      // This also handles the case where setup() added announcements (Ronda/Tringa)
      // but couldn't set the active players itself.
      if ((G.announcements && G.announcements.length > 0) || G.isAnimating) {
        G.endTurnAfterUI = false;
        events.setActivePlayers({ all: 'waitForUI' });
      }
    },
    stages: {
      waitForUI: {
        moves: {
          processCapture: ({ G, ctx, events }) => {
            // Reference the global processCapture logic
            const moves = RondaGame.moves;
            return moves.processCapture({ G, ctx, events });
          },
          clearAnnouncements: ({ G, events }) => {
            G.announcements = [];
            if (G.isAnimating) return;
            if (G.gameStatus) {
              events.setActivePlayers({ all: 'gameOver' });
            } else {
              events.setActivePlayers({ all: null });
              if (G.endTurnAfterUI) {
                G.endTurnAfterUI = false;
                events.endTurn();
              }
            }
          },
          endAnimation: ({ G, events }) => {
            // Guard: only process if still animating (idempotent in multiplayer)
            if (!G.isAnimating) return;
            G.isAnimating = false;
            if (G.gameStatus) {
              // Game is over - transition to gameOver stage for all players
              events.setActivePlayers({ all: 'gameOver' });
            } else if (G.announcements.length === 0) {
              events.setActivePlayers({ all: null });
              // Guard: only endTurn once
              if (G.endTurnAfterUI) {
                G.endTurnAfterUI = false;
                events.endTurn();
              }
            }
            // If there are still announcements, do nothing:
            // clearAnnouncements will handle the transition when they are cleared.
          }
        }
      },
      gameOver: {
        moves: {
          restartGame: ({ G, ctx, events }) => {
            // Preserve overall match wins
            const matches0 = G.matchesWon ? G.matchesWon['0'] : 0;
            const matches1 = G.matchesWon ? G.matchesWon['1'] : 0;

            const fresh = RondaGame.setup({ ctx });

            // Wipe all existing keys from G, then copy fresh state in.
            // This ensures no stale properties survive the reset.
            for (const key of Object.keys(G)) {
              delete G[key];
            }
            Object.assign(G, fresh);

            // Restore overall match wins
            G.matchesWon = { '0': matches0, '1': matches1 };

            // Clear any stages so players can play cards
            events.setActivePlayers({ all: null });

            // If the new round starts with announcements (Ronda/Tringa), 
            // we must enter waitForUI stage so players can clear them.
            if (G.announcements.length > 0 || G.isAnimating) {
              events.setActivePlayers({ all: 'waitForUI' });
            }
          }
        }
      }
    }
  },

  endIf: ({ G, ctx }) => {
    // We do NOT return a value here, because returning a value tells boardgame.io
    // to permanently lock the match, preventing any rematches in the same room.
    // Instead, we manage the game over state via G.gameStatus.
  },

  ai: {
    enumerate: (G, ctx, playerID) => {
      const player = playerID || ctx.currentPlayer;
      
      // 1. Check if we are in a wait state or it's not the bot's turn
      const inWaitStage = ctx.activePlayers && ctx.activePlayers[player] === 'waitForUI';
      if (G.isAnimating || (G.announcements && G.announcements.length > 0) || inWaitStage || player !== '1') {
        return [];
      }
 
      const hand = G.players[player]?.hand || [];
      
      // 2. Handle pending capture first
      if (G.pendingCapture) {
        // The frontend (Board.jsx) will dispatch processCapture after the animation completes.
        // The bot should simply wait.
        return [];
      }
 
      // 3. Play a card
      let moves = [];
      for (let i = 0; i < hand.length; i++) {
        moves.push({ move: 'playCard', args: [i] });
      }
      return moves;
    }
  }
};
