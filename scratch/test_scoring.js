
import { checkRoundEnd, resolveClash, addScore } from '../src/game/game.js';

const testScoring = () => {
    // Scenario: Player 1 (me) wins 27 to 22
    let G = {
        players: {
            '0': { hand: [], captured: new Array(15).fill({}), score: 7 }, // Opponent: 15 + 7 = 22
            '1': { hand: [], captured: new Array(25).fill({}), score: 2 }, // Me: 25 + 2 = 27
        },
        deck: [],
        table: [],
        lastCapture: '1',
        matchesWon: { '0': 0, '1': 0 }
    };

    checkRoundEnd(G);

    console.log("Game Status:", G.gameStatus);
    console.log("Matches Won:", G.matchesWon);

    if (G.gameStatus.p1Score === 27 && G.gameStatus.p0Score === 22 && G.gameStatus.winner === '1') {
        console.log("✅ Scoring Logic Correct!");
    } else {
        console.log("❌ Scoring Logic FAILED!");
    }
};

testScoring();
