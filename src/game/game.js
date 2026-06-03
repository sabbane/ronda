import { INVALID_MOVE } from 'boardgame.io/dist/esm/core.js';
import { enumerateMoves } from './bot.js';


export const getNextValue = (val) => {
  if (val < 10) return val + 1;
  return null;
};

const generateDeck = () => {
  const suits = ['dheb', 'jben', 'syouf', 'zrawet'];
  const displayMap = { 8: 10, 9: 11, 10: 12 };
  return suits.flatMap(suit => 
    Array.from({ length: 10 }, (_, i) => {
      const value = i + 1;
      return {
        suit,
        value,
        displayValue: displayMap[value] || value,
        id: `${suit}-${value}`
      };
    })
  );
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

// In 4-player mode, captured cards are stored at the team captain (P0 for Team A, P1 for Team B).
export const getTeamCaptain = (playerID, numPlayers) => {
  if (numPlayers !== 4) return playerID;
  // Team A: players 0 & 2 → captain 0
  // Team B: players 1 & 3 → captain 1
  return parseInt(playerID) % 2 === 0 ? '0' : '1';
};

export const getHandRank = (hand) => {
  if (!hand?.length) return null;

  const counts = hand.reduce((acc, card) => {
    acc[card.value] = (acc[card.value] || 0) + 1;
    return acc;
  }, {});

  const entries = Object.entries(counts).map(([val, count]) => ({
    value: parseInt(val, 10),
    count
  }));

  const tringa = entries.find(e => e.count === 3);
  if (tringa) return { type: 'Tringa', value: tringa.value };

  const rondas = entries.filter(e => e.count === 2);
  if (rondas.length > 0) {
    const maxValue = Math.max(...rondas.map(r => r.value));
    return { type: 'Ronda', value: maxValue };
  }

  return null;
};

export const evaluateRondaTringa = (G) => {
  const numP = Object.keys(G.players).length;
  
  const { participants, tringaPlayers, rondaPlayers } = Array.from({ length: numP }, (_, i) => String(i))
    .reduce((acc, pID) => {
      const pRank = getHandRank(G.players[pID]?.hand);
      if (pRank) {
        acc.participants[pID] = pRank;
        if (pRank.type === 'Tringa') {
          acc.tringaPlayers.push(pID);
        } else {
          acc.rondaPlayers.push(pID);
        }
      }
      return acc;
    }, { participants: {}, tringaPlayers: [], rondaPlayers: [] });

  const clashingPlayers = [...tringaPlayers, ...rondaPlayers];
  if (clashingPlayers.length === 0) {
    return;
  }

  // Case A: At least one Tringa is present
  if (tringaPlayers.length > 0) {
    if (tringaPlayers.length === 1) {
      // Single Tringa beats all Rondas immediately!
      const winner = tringaPlayers[0];
      const hasBeatRondas = rondaPlayers.length > 0;
      const pts = 5 + rondaPlayers.length;
      addScore(G, winner, pts);
      G.announcements.push({ 
        player: winner, 
        type: hasBeatRondas ? 'TringaWins' : 'Tringa', 
        pts: pts 
      });
    } else {
      // Multiple Tringas clash (Rondas are ignored)
      const ptsPool = (tringaPlayers.length * 5) + rondaPlayers.length;
      G.activeClash = {
        participants,
        clashingPlayers: tringaPlayers,
        ptsPool,
        clashType: 'Tringa'
      };
      // Set backward compatibility for 2 players
      if (numP === 2) {
        G.activeClash.p0 = participants['0'];
        G.activeClash.p1 = participants['1'];
      }
      G.announcements.push({
        player: 'none',
        type: 'Clash',
        clashType: 'Tringa',
        clashingPlayers: tringaPlayers
      });
    }
  } else {
    // Case B: Only Rondas are present
    if (rondaPlayers.length === 1) {
      // Only a single Ronda: award immediately
      const winner = rondaPlayers[0];
      addScore(G, winner, 1);
      G.announcements.push({ player: winner, type: 'Ronda' });
    } else {
      // Multiple Rondas clash
      const ptsPool = rondaPlayers.length;
      G.activeClash = {
        participants,
        clashingPlayers: rondaPlayers,
        ptsPool,
        clashType: 'Ronda'
      };
      // Set backward compatibility for 2 players
      if (numP === 2) {
        G.activeClash.p0 = participants['0'];
        G.activeClash.p1 = participants['1'];
      }
      G.announcements.push({
        player: 'none',
        type: 'Clash',
        clashType: 'Ronda',
        clashingPlayers: rondaPlayers
      });
    }
  }
};

export const resolveClash = (G) => {
  if (!G.activeClash) return;
  
  const { participants, clashingPlayers, ptsPool } = G.activeClash;
  
  // 1. Determine highest rank type present (Tringa beats Ronda)
  const hasTringa = clashingPlayers.some(pID => participants[pID].type === 'Tringa');
  const highestRankType = hasTringa ? 'Tringa' : 'Ronda';

  const topPlayers = clashingPlayers.filter(pID => participants[pID].type === highestRankType);

  // 2. Find max card value among top players
  const maxVal = Math.max(...topPlayers.map(pID => participants[pID].value));
  const winners = topPlayers.filter(pID => participants[pID].value === maxVal);

  const winner = winners.length === 1 ? winners[0] : 'Draw';
  
  if (winner !== 'Draw') {
    addScore(G, winner, ptsPool);
    const winnerRank = participants[winner];
    G.announcements.push({ 
      player: winner, 
      type: 'Clash Won', 
      text: `Won Clash with ${winnerRank.type}! (+${ptsPool})`,
      pts: ptsPool,
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
  const numP = Object.keys(G.players).length;
  const allEmpty = Object.keys(G.players).every(pID => !G.players[pID].hand || G.players[pID].hand.length === 0);

  if (allEmpty) {
    resolveClash(G);
    
    // If deck is also empty, the game (round) is totally over
    if (G.deck.length === 0 && !G.gameStatus) {
      if (!G.matchesWon) {
        G.matchesWon = Array.from({ length: numP }, (_, i) => String(i))
          .reduce((acc, pID) => ({ ...acc, [pID]: 0 }), {});
      }

      // Give remaining table cards to the last player who captured
      if (G.table.length > 0 && G.lastCapture !== null) {
        G.players[G.lastCapture].captured.push(...G.table);
        G.table = [];
      }

      if (numP === 2) {
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
      } else {
        // 4 Players: Team A (0 & 2) vs Team B (1 & 3)
        const teamATotal = (G.players['0'].score + G.players['0'].captured.length) + 
                           (G.players['2'].score + G.players['2'].captured.length);
        const teamBTotal = (G.players['1'].score + G.players['1'].captured.length) + 
                           (G.players['3'].score + G.players['3'].captured.length);
                           
        let winner = 'Draw';
        if (teamATotal > teamBTotal) {
          winner = 'TeamA';
          G.matchesWon['0']++;
          G.matchesWon['2']++;
        } else if (teamBTotal > teamATotal) {
          winner = 'TeamB';
          G.matchesWon['1']++;
          G.matchesWon['3']++;
        }
        G.gameStatus = { winner, p0Score: teamATotal, p1Score: teamBTotal };
      }
    }
  }
};

const checkWaitForUI = (G, events) => {
  // If there are announcements OR an animation is running, we MUST go into waitForUI stage
  // to let the frontend finish its visual work before the next turn starts or before the game ends.
  if (G.announcements.length > 0 || G.isAnimating) {
    if (G.announcements.length > 0 && !G._announcementIdIncremented) {
      G.announcementId = (G.announcementId || 0) + 1;
      G._announcementIdIncremented = true;
    }
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

const executeCapture = (G, events) => {
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
    let hadMissa = false;
    if (isTaawidaTransfer) {
      const newStreak = G.lastPlayedCard.streak + 1;
      const scoreToAdd = newStreak === 3 ? 5 : 10;
      const opponent = G.lastPlayedCard.player;
      G.players[opponent].score -= G.lastPlayedCard.awardedPoints || 0;
      if (G.lastPlayedCard.hadMissa) {
        G.players[opponent].score -= 1;
        addScore(G, player, 1);
        G.announcements.push({ player, type: 'Missa' });
        hadMissa = true;
      }
      const cardsToTransfer = G.lastPlayedCard.capturedCardsInTurn || G.lastPlayedCard.streakCards || [];
      G.players[opponent].captured = G.players[opponent].captured.filter(c => !cardsToTransfer.some(tc => tc.id === c.id));
      capturedCards.push(...cardsToTransfer);
      addScore(G, player, scoreToAdd);
      if (!G.announcements.some(a => a.type === 'Taawida' && a.streak === newStreak)) {
        G.announcements.push({ player, type: 'Taawida', streak: newStreak, currentVal: currentVal });
      }
      G.lastPlayedCard = {
        value: currentVal,
        player: player,
        streak: newStreak,
        awardedPoints: scoreToAdd,
        streakCards: [...(G.lastPlayedCard.streakCards || []), playedCard],
        capturedCardsInTurn: [...capturedCards],
        hadMissa
      };
    } else {
      let matchedCard = G.table.splice(matchIndex, 1)[0];
      capturedCards.push(matchedCard);
      let newStreak = 1;
      let awardedPoints = 0;
      let streakCards = [];
      if (G.lastPlayedCard && G.lastPlayedCard.value === currentVal && G.lastPlayedCard.player !== player) {
        newStreak = (G.lastPlayedCard.streak || 1) + 1;
        if (newStreak === 2) {
          awardedPoints = 1;
          addScore(G, player, awardedPoints);
          if (!G.announcements.some(a => a.type === 'Derba')) {
            G.announcements.push({ player, type: 'Derba', opponent: G.lastPlayedCard.player, currentVal: currentVal });
          }
          streakCards = [matchedCard, playedCard];
        } else if (newStreak === 4) {
          awardedPoints = 10;
          const opponent = G.lastPlayedCard.player;
          G.players[opponent].score -= G.lastPlayedCard.awardedPoints || 0;
          if (G.lastPlayedCard.hadMissa) {
            G.players[opponent].score -= 1;
            addScore(G, player, 1);
            G.announcements.push({ player, type: 'Missa' });
            hadMissa = true;
          }
          const cardsToTransfer = G.lastPlayedCard.capturedCardsInTurn || G.lastPlayedCard.streakCards || [];
          G.players[opponent].captured = G.players[opponent].captured.filter(c => !cardsToTransfer.some(tc => tc.id === c.id));
          capturedCards.push(...cardsToTransfer);
          streakCards = [...(G.lastPlayedCard.streakCards || []), matchedCard, playedCard];
          addScore(G, player, awardedPoints);
          if (!G.announcements.some(a => a.type === 'Taawida' && a.streak === newStreak)) {
            G.announcements.push({ player, type: 'Taawida', streak: newStreak, currentVal: currentVal });
          }
        }
      }
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
      if (newStreak > 1) {
        G.lastPlayedCard = {
          value: currentVal,
          player: player,
          streak: newStreak,
          awardedPoints,
          streakCards,
          capturedCardsInTurn: [...capturedCards],
          hadMissa: false
        };
      } else {
        G.lastPlayedCard = null;
      }
    }
    G.players[player].captured.push(...capturedCards);
    G.lastCapture = player;
    G.isAnimating = true;
    const anyHandHasCards = Object.keys(G.players).some(pID => G.players[pID].hand.length > 0);
    if (!isTaawidaTransfer && G.table.length === 0 && (G.deck.length > 0 || anyHandHasCards)) {
      addScore(G, player, 1);
      G.announcements.push({ player, type: 'Missa' });
      hadMissa = true;
      if (G.lastPlayedCard) {
        G.lastPlayedCard.hadMissa = true;
      }
    }
    const allHandsAreEmpty = Object.keys(G.players).every(pID => G.players[pID].hand.length === 0);
    if (currentVal === 10 && G.deck.length === 0 && allHandsAreEmpty) { 
      addScore(G, player, 5); 
      G.announcements.push({ player, type: 'King Finish' }); 
    }
    if (currentVal === 1 && G.deck.length === 0 && allHandsAreEmpty) { 
      const numP4 = Object.keys(G.players).length;
      const asOpponent = numP4 === 2 ? (player === '0' ? '1' : '0') : String((parseInt(player) + 1) % numP4);
      addScore(G, asOpponent, 5); 
      G.announcements.push({ player: asOpponent, type: 'As Finish' }); 
    }
  }
  checkRoundEnd(G);
};


export const RondaGame = {
  name: 'ronda',
  minPlayers: 2,
  maxPlayers: 4,
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
        const displayMap = { 8: 10, 9: 11, 10: 12 };
        return { 
          ...card, 
          displayValue: displayMap[card.value] || card.value, 
          id: `${card.suit}-${card.value}` 
        };
      });
    } else {
      // NORMAL SHUFFLED DECK
      deck = shuffle(generateDeck());
    }


    const table = deck.splice(0, 4);
    const numP = ctx.numPlayers || 2;
    const playerIds = Array.from({ length: numP }, (_, i) => String(i));
    const players = playerIds.reduce((acc, pID) => {
      acc[pID] = { hand: deck.splice(0, 3), captured: [], score: 0, name: '' };
      return acc;
    }, {});
    const matchesWon = playerIds.reduce((acc, pID) => {
      acc[pID] = 0;
      return acc;
    }, {});
    
    let G = {
      deck,
      table,
      players,
      lastCapture: null,
      lastPlayedCard: null,
      announcements: [],
      pendingCapture: null,
      isAnimating: true,
      isDealing: true,
      gameStarted: setupData ? (isTestMode || setupData.gameStarted === true) : true,
      endTurnAfterUI: false,
      gameStatus: null, // Custom game over state
      matchesWon, // Track overall games won
      teamNames: { TeamA: '', TeamB: '' },
    };

    evaluateRondaTringa(G);

    return G;
  },

  moves: {
    startGame: {
      move: ({ G, events }) => {
        G.gameStarted = true;
        if ((G.announcements && G.announcements.length > 0) || G.isAnimating) {
          G.endTurnAfterUI = false;
          events.setActivePlayers({ all: 'waitForUI' });
        }
      },
      noLimit: true
    },
    setPlayerName: {
      move: ({ G, playerID }, name) => {
        const pID = playerID || '0';
        if (G.players[pID]) {
          G.players[pID].name = name;
        }
      },
      noLimit: true
    },
    clearPlayerSeat: {
      move: ({ G }, targetPlayerID) => {
        if (G.players[targetPlayerID]) {
          G.players[targetPlayerID].name = '';
        }
      },
      noLimit: true
    },
    setTeamName: {
      move: ({ G }, { team, name }) => {
        if (G.teamNames) {
          G.teamNames[team] = name;
        }
      },
      noLimit: true
    },
    hostLeft: {
      move: ({ G }) => {
        G.hostLeft = true;
      },
      noLimit: true
    },
    playerLeft: {
      move: ({ G, playerID }) => {
        console.log('[Game] playerLeft move fired by', playerID);
        if (!G.playerLeft) G.playerLeft = {};
        G.playerLeft[playerID] = true;
      },
      noLimit: true
    },
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
      G._announcementIdIncremented = false;
      G.isDealing = false;

      hand.splice(cardIndex, 1);

      let currentVal = playedCard.value;
      
      // Always put card on table first to animate it flying to table
      G.table.push(playedCard);
      
      let matchIndex = G.table.findIndex(c => c.value === currentVal && c.id !== playedCard.id);
      
      if (matchIndex !== -1 || (G.lastPlayedCard && G.lastPlayedCard.value === currentVal && G.lastPlayedCard.player !== player && G.lastPlayedCard.streak >= 2)) {
        // Mark for capture or Taawida transfer
        const isTaawidaTransfer = matchIndex === -1;
        G.pendingCapture = {
          player: player,
          playedCardId: playedCard.id,
          currentVal: currentVal,
          isTaawidaTransfer: isTaawidaTransfer
        };
        G.isAnimating = true;

        // Push Derba or Taawida announcements early so the client can display the popup 
        // exactly when the card lands on the table, before subsequent collection starts.
        if (isTaawidaTransfer) {
          const newStreak = G.lastPlayedCard.streak + 1;
          G.announcements.push({ player, type: 'Taawida', streak: newStreak, currentVal: currentVal });
        } else {
          if (G.lastPlayedCard && G.lastPlayedCard.value === currentVal && G.lastPlayedCard.player !== player) {
            const newStreak = (G.lastPlayedCard.streak || 1) + 1;
            if (newStreak === 2) {
              G.announcements.push({ player, type: 'Derba', opponent: G.lastPlayedCard.player, currentVal: currentVal });
            } else if (newStreak === 4) {
              G.announcements.push({ player, type: 'Taawida', streak: newStreak, currentVal: currentVal });
            }
          }
        }

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
        const allHandsEmpty = Object.keys(G.players).every(pID => G.players[pID].hand.length === 0);
        if (G.deck.length === 0 && allHandsEmpty) {
          const numPFF = Object.keys(G.players).length;
          const opponentFF = numPFF === 2 ? (player === '0' ? '1' : '0') : String((parseInt(player) + 1) % numPFF);
          addScore(G, opponentFF, 5);
          G.announcements.push({ player: opponentFF, type: 'Final Fail' });
        }

        checkRoundEnd(G);
        if (!checkWaitForUI(G, events)) {
          events.endTurn();
        }
      }
    },
    processCapture: ({ G, events }) => {
      return executeCapture(G, events);
    },
    counterDerba: ({ G, ctx, events, playerID }, cardIndex) => {
      if (!G.pendingCapture) return INVALID_MOVE;
      const victim = (playerID !== undefined && playerID !== null) ? playerID : ctx.currentPlayer;
      if (victim === G.pendingCapture.player) return INVALID_MOVE;

      const currentVal = G.pendingCapture.currentVal;
      const hand = G.players[victim].hand;
      if (cardIndex < 0 || cardIndex >= hand.length) return INVALID_MOVE;
      const playedCard = hand[cardIndex];
      if (!playedCard || playedCard.value !== currentVal) return INVALID_MOVE;

      // 1. Process the pending capture first
      const captureRes = executeCapture(G, events);
      if (captureRes === INVALID_MOVE) return INVALID_MOVE;

      // 2. Clear previous announcements (since we countered it!)
      G.announcements = [];
      G._announcementIdIncremented = false;

      // 3. Take card out of hand and throw it on table
      hand.splice(cardIndex, 1);
      G.table.push(playedCard);

      // 4. Force turn transition to the victim
      events.endTurn();

      // 5. Establish new pending capture for this Taawida counter
      G.pendingCapture = {
        player: victim,
        playedCardId: playedCard.id,
        currentVal: currentVal,
        isTaawidaTransfer: true
      };
      G.isAnimating = true;

      // 6. Push the new Taawida announcement
      const newStreak = G.lastPlayedCard.streak + 1;
      G.announcements.push({ player: victim, type: 'Taawida', streak: newStreak, currentVal: currentVal });

      checkWaitForUI(G, events);
    },
  },


  turn: {
    onBegin: ({ G, events }) => {
      if (G.gameStarted === false) {
        events.setActivePlayers({ all: 'lobby' });
        return;
      }
      if (G.pendingCapture) {
        if ((G.announcements && G.announcements.length > 0) || G.isAnimating) {
          events.setActivePlayers({ all: 'waitForUI' });
        }
        return;
      }
      // 1. Auto-deal ONLY if all hands are completely empty and deck has cards
      const numP = Object.keys(G.players).length;
      const allHandsEmpty = Object.keys(G.players).every(pID => !G.players[pID].hand || G.players[pID].hand.length === 0);
      
      if (allHandsEmpty && G.deck.length > 0) {
        Array.from({ length: numP }, (_, i) => String(i)).forEach(pID => {
          G.players[pID].hand = G.deck.splice(0, 3);
        });
        G.lastPlayedCard = null; // Clear last played card so Derba doesn't carry over to a new round
        G.isAnimating = true;
        G.isDealing = true;
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
      lobby: {
        moves: {
          setPlayerName: {
            move: ({ G, playerID }, name) => {
              const pID = playerID || '0';
              if (G.players[pID]) {
                G.players[pID].name = name;
              }
            },
            noLimit: true
          },
          clearPlayerSeat: {
            move: ({ G }, targetPlayerID) => {
              if (G.players[targetPlayerID]) {
                G.players[targetPlayerID].name = '';
              }
            },
            noLimit: true
          },
          setTeamName: {
            move: ({ G }, { team, name }) => {
              if (G.teamNames) {
                G.teamNames[team] = name;
              }
            },
            noLimit: true
          },
          startGame: {
            move: ({ G, events }) => {
              G.gameStarted = true;
              events.setActivePlayers({ all: null });
              if ((G.announcements && G.announcements.length > 0) || G.isAnimating) {
                G.endTurnAfterUI = false;
                events.setActivePlayers({ all: 'waitForUI' });
              }
            },
            noLimit: true
          },
          hostLeft: {
            move: ({ G }) => {
              G.hostLeft = true;
            },
            noLimit: true
          },
          playerLeft: {
            move: ({ G, playerID }) => {
              console.log('[Game] playerLeft move fired (lobby stage) by', playerID);
              if (!G.playerLeft) G.playerLeft = {};
              G.playerLeft[playerID] = true;
            },
            noLimit: true
          }
        }
      },
      waitForUI: {
        moves: {
          processCapture: ({ G, ctx, events }) => {
            // Reference the global processCapture logic
            const moves = RondaGame.moves;
            return moves.processCapture({ G, ctx, events });
          },
          counterDerba: ({ G, ctx, events, playerID }, cardIndex) => {
            const moves = RondaGame.moves;
            return moves.counterDerba({ G, ctx, events, playerID }, cardIndex);
          },
          clearAnnouncements: ({ G, events }, announcementId) => {
            if (announcementId !== undefined && announcementId !== null && G.announcementId !== announcementId) {
              return; // Ignore stale clear request
            }
            G.announcements = [];
            G._announcementIdIncremented = false;
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
            G.isDealing = false;
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
          },
          playerLeft: {
            move: ({ G, playerID }) => {
              console.log('[Game] playerLeft move fired (waitForUI stage) by', playerID);
              if (!G.playerLeft) G.playerLeft = {};
              G.playerLeft[playerID] = true;
            },
            noLimit: true
          }
        }
      },
      gameOver: {
        moves: {
          restartGame: ({ G, ctx, events }) => {
            // Preserve overall match wins, player nicknames, and custom team names dynamically
            const numP = Object.keys(G.players).length;
            const preservedTeamNames = G.teamNames ? { ...G.teamNames } : { TeamA: '', TeamB: '' };
            
            const playerIds = Array.from({ length: numP }, (_, i) => String(i));
            
            const matches = playerIds.reduce((acc, pID) => {
              acc[pID] = G.matchesWon ? (G.matchesWon[pID] || 0) : 0;
              return acc;
            }, {});

            const names = playerIds.reduce((acc, pID) => {
              acc[pID] = G.players && G.players[pID] ? G.players[pID].name : '';
              return acc;
            }, {});

            const fresh = RondaGame.setup({ ctx });

            // Wipe all existing keys from G, then copy fresh state in.
            // This ensures no stale properties survive the reset.
            Object.keys(G).forEach(key => delete G[key]);
            Object.assign(G, fresh);

            // Restore overall match wins, nicknames, team names, and ensure the game starts directly
            G.matchesWon = matches;
            G.teamNames = preservedTeamNames;
            G.gameStarted = true;
            
            playerIds.forEach(pID => {
              if (G.players && G.players[pID]) {
                G.players[pID].name = names[pID];
              }
            });

            // Clear any stages so players can play cards
            events.setActivePlayers({ all: null });

            // If the new round starts with announcements (Ronda/Tringa), 
            // we must enter waitForUI stage so players can clear them.
            if (G.announcements.length > 0 || G.isAnimating) {
              events.setActivePlayers({ all: 'waitForUI' });
            }
          },
          playerLeft: {
            move: ({ G, playerID }) => {
              console.log('[Game] playerLeft move fired (gameOver stage) by', playerID);
              if (!G.playerLeft) G.playerLeft = {};
              G.playerLeft[playerID] = true;
            },
            noLimit: true
          }
        }
      }
    }
  },

  endIf: () => {
    // We do NOT return a value here, because returning a value tells boardgame.io
    // to permanently lock the match, preventing any rematches in the same room.
    // Instead, we manage the game over state via G.gameStatus.
  },

  ai: {
    enumerate: enumerateMoves
  }
};
