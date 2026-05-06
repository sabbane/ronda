import { Server, Origins } from 'boardgame.io/dist/cjs/server.js';
import { RondaGame } from './src/game/game.js';

const server = Server({
  games: [RondaGame],
  origins: [
    Origins.LOCALHOST,
    'https://ronda-frontend-development.up.railway.app',
    'https://ronda.up.railway.app',
    process.env.FRONTEND_URL || '*'
  ]
});

const PORT = process.env.PORT || 8000;
server.run(PORT, () => console.log(`Backend server running on port ${PORT}...`));
