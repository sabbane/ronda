import { Client } from 'boardgame.io/client';
import { Local } from 'boardgame.io/multiplayer';
import { RondaGame } from './src/game/game.js';

const game = {
  ...RondaGame
};

const client = Client({ game, numPlayers: 2 });
client.start();

client.events.setActivePlayers({ all: 'gameOver' });

let state = client.getState();
console.log("Stage before:", state.ctx.activePlayers);
client.moves.restartGame();
state = client.getState();
console.log("Stage after:", state.ctx.activePlayers);
console.log("GameStatus:", state.G.gameStatus);
