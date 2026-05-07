// Test: Simulate multiplayer score synchronization issue
// The bug: In multiplayer, does G.gameStatus get calculated correctly?
// Key question: are captured cards counted at time of checkRoundEnd?

import { checkRoundEnd } from '../src/game/game.js';

console.log("=== MULTIPLAYER SCORE SYNC TEST ===\n");

// Simulate the state at the END of processCapture in multiplayer
// Player 1 (guest) just played the last card and captured
function simulateEndGame(scenario) {
  console.log(`\n--- ${scenario.label} ---`);
  
  const G = {
    players: {
      '0': { 
        hand: [], 
        captured: [...scenario.p0Captured], 
        score: scenario.p0Score 
      },
      '1': { 
        hand: [], 
        captured: [...scenario.p1Captured], 
        score: scenario.p1Score 
      },
    },
    deck: [],
    table: [],
    lastCapture: scenario.lastCapture,
    matchesWon: { '0': 0, '1': 0 },
    gameStatus: null,
    activeClash: null,
    announcements: []
  };
  
  const p0Before = G.players['0'].score + G.players['0'].captured.length;
  const p1Before = G.players['1'].score + G.players['1'].captured.length;
  console.log(`P0 (live display during game): captured=${G.players['0'].captured.length} + score=${G.players['0'].score} = ${p0Before}`);
  console.log(`P1 (live display during game): captured=${G.players['1'].captured.length} + score=${G.players['1'].score} = ${p1Before}`);
  
  checkRoundEnd(G);
  
  if (G.gameStatus) {
    console.log(`\nG.gameStatus.p0Score = ${G.gameStatus.p0Score}`);
    console.log(`G.gameStatus.p1Score = ${G.gameStatus.p1Score}`);
    console.log(`Winner: Player ${G.gameStatus.winner}`);
    
    // For Player 1 (guest): myID='1', opponentID='0'
    const myID = '1';
    const opponentID = '0';
    console.log(`\nPlayer 1 (guest) sees:`);
    console.log(`  "You" (p${myID}Score): ${G.gameStatus[`p${myID}Score`]}`);
    console.log(`  "Opponent" (p${opponentID}Score): ${G.gameStatus[`p${opponentID}Score`]}`);
    
    const match = G.gameStatus[`p${myID}Score`] === p1Before && G.gameStatus[`p${opponentID}Score`] === p0Before;
    console.log(match ? "✅ Overlay shows correct values!" : "❌ MISMATCH - overlay would show wrong values!");
  } else {
    console.log("❌ gameStatus is null!");
  }
}

simulateEndGame({
  label: "User's actual scenario: P1 wins ~27 to ~20",
  p0Captured: new Array(17).fill({ id: 'x', suit: 'coins', value: 1 }),
  p0Score: 3,
  p1Captured: new Array(22).fill({ id: 'y', suit: 'swords', value: 1 }),
  p1Score: 5,
  lastCapture: '1'
});

simulateEndGame({
  label: "Edge case: P0 wins with King Finish",
  p0Captured: new Array(19).fill({ id: 'x', suit: 'coins', value: 1 }),
  p0Score: 8, // 3 regular + 5 King Finish
  p1Captured: new Array(15).fill({ id: 'y', suit: 'swords', value: 1 }),
  p1Score: 5,
  lastCapture: '0'
});
