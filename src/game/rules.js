export const addScore = (G, player, amount) => {
  G.players[player].score += amount;
};

// In 4-player mode, captured cards are stored at the team captain (P0 for Team A, P1 for Team B).
export const getTeamCaptain = (playerID, numPlayers) => {
  if (numPlayers !== 4) return playerID;
  // Team A (0/2) -> 0; Team B (1/3) -> 1
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

const setupActiveClash = (G, numP, participants, clashingPlayers, ptsPool, clashType) => {
  G.activeClash = {
    participants,
    clashingPlayers,
    ptsPool,
    clashType
  };
  // 2p backward compatibility
  if (numP === 2) {
    G.activeClash.p0 = participants['0'];
    G.activeClash.p1 = participants['1'];
  }
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

  // Helper to check if players belong to different teams.
  // Team A: 0, 2 (even)
  // Team B: 1, 3 (odd)
  const hasOpposingTeams = (playersList) => {
    const teamA = playersList.some(pID => parseInt(pID, 10) % 2 === 0);
    const teamB = playersList.some(pID => parseInt(pID, 10) % 2 !== 0);
    return teamA && teamB;
  };

  if (tringaPlayers.length > 0) {
    if (tringaPlayers.length === 1) {
      // Single Tringa beats all Rondas
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
      // Multiple Tringas
      if (hasOpposingTeams(tringaPlayers)) {
        // Clash between opposing teams
        const ptsPool = (tringaPlayers.length * 5) + rondaPlayers.length;
        setupActiveClash(G, numP, participants, tringaPlayers, ptsPool, 'Tringa');
        G.announcements.push({
          player: 'none',
          type: 'Clash',
          clashType: 'Tringa',
          clashingPlayers: tringaPlayers
        });
      } else {
        // All Tringas are on the same team (teammates) -> No Clash, direct points
        tringaPlayers.forEach((pID, index) => {
          const extraPts = index === 0 ? rondaPlayers.length : 0;
          const pts = 5 + extraPts;
          addScore(G, pID, pts);
          G.announcements.push({
            player: pID,
            type: extraPts > 0 ? 'TringaWins' : 'Tringa',
            pts: pts
          });
        });
      }
    }
  } else {
    if (rondaPlayers.length === 1) {
      const winner = rondaPlayers[0];
      addScore(G, winner, 1);
      G.announcements.push({ player: winner, type: 'Ronda' });
    } else {
      // Multiple Rondas
      if (hasOpposingTeams(rondaPlayers)) {
        // Clash between opposing teams
        const ptsPool = rondaPlayers.length;
        setupActiveClash(G, numP, participants, rondaPlayers, ptsPool, 'Ronda');
        G.announcements.push({
          player: 'none',
          type: 'Clash',
          clashType: 'Ronda',
          clashingPlayers: rondaPlayers
        });
      } else {
        // All Rondas are on the same team (teammates) -> No Clash, direct points
        rondaPlayers.forEach(pID => {
          addScore(G, pID, 1);
          G.announcements.push({ player: pID, type: 'Ronda' });
        });
      }
    }
  }
};

export const resolveClash = (G) => {
  if (!G.activeClash) return;
  
  const { participants, clashingPlayers, ptsPool } = G.activeClash;
  
  // Tringa beats Ronda
  const hasTringa = clashingPlayers.some(pID => participants[pID].type === 'Tringa');
  const highestRankType = hasTringa ? 'Tringa' : 'Ronda';

  const topPlayers = clashingPlayers.filter(pID => participants[pID].type === highestRankType);

  // Max value among tied players wins
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
    
    // Total game round end if deck is empty
    if (G.deck.length === 0 && !G.gameStatus) {
      if (!G.matchesWon) {
        G.matchesWon = Array.from({ length: numP }, (_, i) => String(i))
          .reduce((acc, pID) => ({ ...acc, [pID]: 0 }), {});
      }

      // Remaining table cards go to the last capturer
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
        // Team A (0/2) vs Team B (1/3)
        const teamATotal = (G.players['0'].score + G.players['0'].captured.length) + 
                           (G.players['2'].score + G.players['2'].captured.length);
        const teamBTotal = (G.players['1'].score + G.players['1'].captured.length) + 
                           (G.players['3'].score + G.players['3'].captured.length);
                           
        let winner = 'Draw';
        if (teamATotal > teamBTotal) {
          winner = 'TeamA';
          G.matchesWon['0']++;
          G.matchesWon['2']++;
          G.matchesWon['3']++;
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
