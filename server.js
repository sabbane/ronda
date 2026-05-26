import { Server, Origins } from 'boardgame.io/dist/cjs/server.js';
import { RondaGame } from './src/game/game.js';

const server = Server({
  games: [RondaGame],
  origins: [
    Origins.LOCALHOST,
    'http://127.0.0.1:5173',
    'http://localhost:5173',
    'https://ronda-frontend-development.up.railway.app',
    'https://ronda.up.railway.app',
    'https://playronda.ma',
    'https://www.playronda.ma',
    'https://games.playgama.net',
    'null'
  ]
});

// Forcefully override CORS to allow ANY origin (including null and PlayGama)
server.app.middleware.unshift(async (ctx, next) => {
  const origin = ctx.get('Origin') || '*';
  
  if (ctx.method === 'OPTIONS') {
    ctx.set('Access-Control-Allow-Origin', origin);
    ctx.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    ctx.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    ctx.status = 204;
    return;
  }
  
  await next();
  ctx.set('Access-Control-Allow-Origin', origin);
});

// ─── Custom REST endpoint: reset the test scenario match ─────────────────────
// POST /test/reset  →  deletes any existing test match and creates a fresh one
//                      with matchID "test-scenario-room", which makes the
//                      rigged deck active (matchID contains "test").
// Both /test/p1 and /test/p2 then join this exact, known match ID.


server.router.post('/test/reset', async (ctx) => {
  try {
    const PORT = process.env.PORT || 8000;
    const base = `http://127.0.0.1:${PORT}`;

    // 1) Try to create the match with the known ID.
    //    boardgame.io ignores the 'matchID' field in the body —
    //    so we fall back to deleting + re-creating via the lobby HTTP API.
    //    First, list all matches and delete any named "test-scenario-room".
    const listResp = await fetch(`${base}/games/ronda`);
    if (listResp.ok) {
      await listResp.json();
      // We can't delete by ID via the standard lobby API, but we can track
      // the last test matchID in memory and return it to the clients.
    }

    // 2) Create a fresh match (server assigns a random ID, but our matchID
    //    contains 'test' if the env var is set – see game.js rigged deck logic).
    const createResp = await fetch(`${base}/games/ronda/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        numPlayers: 2,
        setupData: { testMode: true },
      }),
    });

    if (!createResp.ok) {
      const errText = await createResp.text();
      ctx.status = 500;
      ctx.body = { ok: false, error: errText };
      return;
    }

    const data = await createResp.json();
    const matchID = data.matchID;

    // Store for subsequent /test/match-id requests
    server._testMatchID = matchID;

    ctx.body = { ok: true, matchID };
  } catch (err) {
    ctx.status = 500;
    ctx.body = { ok: false, error: String(err) };
  }
});

// GET /test/match-id  →  returns the current test matchID
server.router.get('/test/match-id', async (ctx) => {
  if (server._testMatchID) {
    ctx.body = { ok: true, matchID: server._testMatchID };
  } else {
    ctx.status = 404;
    ctx.body = { ok: false, error: 'No test match exists yet. POST /test/reset first.' };
  }
});

const PORT = process.env.PORT || 8000;
server.run(PORT, () => console.log(`Backend server running on port ${PORT}...`));
