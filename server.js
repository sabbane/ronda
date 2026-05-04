import { Server, Origins } from 'boardgame.io/dist/cjs/server.js';
import { RondaGame } from './src/game/game.js';

const server = Server({
  games: [RondaGame],
  origins: [
    Origins.LOCALHOST,
    // Add your railway frontend URL here once deployed, e.g., 'https://ronda-frontend.up.railway.app'
    process.env.FRONTEND_URL || '*'
  ]
});

const PORT = process.env.PORT || 8000;
server.run(PORT, () => console.log(`Backend server running on port ${PORT}...`));
