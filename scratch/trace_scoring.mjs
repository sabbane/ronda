// Trace the complete scoring chain
import { checkRoundEnd, addScore } from '../src/game/game.js';

const testCases = [
  {
    label: "User's scenario: ~27 vs ~20 with King Finish",
    G: {
      players: {
        '0': { hand: [], captured: new Array(19).fill({ id: 'c' }), score: 3 }, // 22 total
        '1': { hand: [], captured: new Array(22).fill({ id: 'c' }), score: 5 }, // 27 total
      },
      deck: [],
      table: [],
      lastCapture: '1',
      matchesWon: { '0': 0, '1': 0 },
      gameStatus: null,
      activeClash: null,
      announcements: []
    }
  },
  {
    label: "King Finish: Player 0 gets +5 extra",
    G: {
      players: {
        '0': { hand: [], captured: new Array(19).fill({ id: 'c' }), score: 8 }, // 19 + 8 = 27
        '1': { hand: [], captured: new Array(15).fill({ id: 'c' }), score: 5 }, // 15 + 5 = 20
      },
      deck: [],
      table: [],
      lastCapture: '0',
      matchesWon: { '0': 0, '1': 0 },
      gameStatus: null,
      activeClash: null,
      announcements: []
    }
  }
];

for (const { label, G } of testCases) {
  console.log(`\n--- ${label} ---`);
  console.log(`P0 before: score=${G.players['0'].score}, captured=${G.players['0'].captured.length}, total=${G.players['0'].score + G.players['0'].captured.length}`);
  console.log(`P1 before: score=${G.players['1'].score}, captured=${G.players['1'].captured.length}, total=${G.players['1'].score + G.players['1'].captured.length}`);
  
  checkRoundEnd(G);
  
  console.log(`gameStatus:`, G.gameStatus);
  
  if (G.gameStatus) {
    const { p0Score, p1Score, winner } = G.gameStatus;
    const myID = '1'; // Simulate being player 1 (guest)
    const opponentID = '0';
    console.log(`As Player 1 (You): p${myID}Score = ${G.gameStatus[`p${myID}Score`]}`);
    console.log(`As Player 1 (Opponent): p${opponentID}Score = ${G.gameStatus[`p${opponentID}Score`]}`);
    console.log(`Winner: ${winner}`);
  }
}
