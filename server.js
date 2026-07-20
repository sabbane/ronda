import { Server, Origins } from 'boardgame.io/dist/cjs/server.js';
import { RondaGame } from './src/game/game.js';
import fs from 'fs';
import path from 'path';

const scratchDir = path.join(process.cwd(), 'scratch');
if (!fs.existsSync(scratchDir)) {
  fs.mkdirSync(scratchDir, { recursive: true });
}
const analyticsPath = path.join(scratchDir, 'analytics.json');

let analyticsData = { events: [] };
try {
  if (fs.existsSync(analyticsPath)) {
    analyticsData = JSON.parse(fs.readFileSync(analyticsPath, 'utf8'));
    if (!Array.isArray(analyticsData.events)) {
      analyticsData.events = [];
    }
  }
} catch (err) {
  console.error('[Analytics] Failed to load database:', err);
}

const saveAnalytics = () => {
  try {
    fs.writeFileSync(analyticsPath, JSON.stringify(analyticsData, null, 2), 'utf8');
  } catch (err) {
    console.error('[Analytics] Failed to save database:', err);
  }
};

const getBody = (ctx) => {
  if (ctx.request.body) return ctx.request.body;
  return new Promise((resolve) => {
    let data = '';
    ctx.req.on('data', chunk => { data += chunk; });
    ctx.req.on('end', () => {
      try {
        resolve(JSON.parse(data));
      } catch {
        resolve({});
      }
    });
  });
};

const verifyToken = (ctx) => {
  const authHeader = ctx.get('Authorization') || '';
  const token = authHeader.replace('Bearer ', '').trim();
  if (!token) return false;
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf8');
    const parts = decoded.split(':');
    parts.pop(); // Remove timestamp
    const password = parts.join(':');
    const adminPassword = process.env.ADMIN_STATS_PASSWORD || 'fkpLU46:';
    return password === adminPassword;
  } catch {
    return false;
  }
};

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

// Custom REST endpoint to reset the test scenario match


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

// Analytics APIs
server.router.post('/api/analytics/event', async (ctx) => {
  try {
    const body = await getBody(ctx);
    const { matchID, type, mode, numPlayers, platform, language, duration, finalScores } = body;
    
    if (!type || !mode) {
      ctx.status = 400;
      ctx.body = { ok: false, error: 'Missing type or mode' };
      return;
    }

    if (mode.startsWith('multiplayer')) {
      const isDuplicate = analyticsData.events.some(
        e => e.matchID === matchID && e.type === type
      );
      if (isDuplicate) {
        ctx.body = { ok: true, status: 'ignored_duplicate' };
        return;
      }
    }

    const newEvent = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      matchID: matchID || `local-${Date.now()}`,
      type,
      mode,
      numPlayers: numPlayers || 2,
      platform: platform || 'desktop',
      language: language || 'en',
      duration: duration || null,
      finalScores: finalScores || null
    };

    analyticsData.events.push(newEvent);
    saveAnalytics();

    ctx.body = { ok: true, event: newEvent };
  } catch (err) {
    ctx.status = 500;
    ctx.body = { ok: false, error: String(err) };
  }
});

server.router.post('/api/analytics/auth', async (ctx) => {
  try {
    const body = await getBody(ctx);
    const { password } = body;
    const adminPassword = process.env.ADMIN_STATS_PASSWORD || 'fkpLU46:';

    if (password === adminPassword) {
      const token = Buffer.from(`${password}:${Date.now()}`).toString('base64');
      ctx.body = { ok: true, token };
    } else {
      ctx.status = 401;
      ctx.body = { ok: false, error: 'Invalid password' };
    }
  } catch (err) {
    ctx.status = 500;
    ctx.body = { ok: false, error: String(err) };
  }
});

server.router.get('/api/analytics/stats', async (ctx) => {
  if (!verifyToken(ctx)) {
    ctx.status = 401;
    ctx.body = { ok: false, error: 'Unauthorized' };
    return;
  }

  try {
    const events = analyticsData.events || [];
    const starts = events.filter(e => e.type === 'game_started');
    const completions = events.filter(e => e.type === 'game_completed');

    const totalStarts = starts.length;
    const totalCompletions = completions.length;

    const startsByMode = { singleplayer: 0, multiplayer_private: 0, multiplayer_public: 0 };
    const completionsByMode = { singleplayer: 0, multiplayer_private: 0, multiplayer_public: 0 };

    starts.forEach(e => {
      if (startsByMode[e.mode] !== undefined) startsByMode[e.mode]++;
    });
    completions.forEach(e => {
      if (completionsByMode[e.mode] !== undefined) completionsByMode[e.mode]++;
    });

    const completionRate = totalStarts > 0 ? Math.round((totalCompletions / totalStarts) * 100) : 0;

    const platforms = {};
    const languages = {};
    const playersCountDist = { 2: 0, 4: 0 };

    starts.forEach(e => {
      platforms[e.platform] = (platforms[e.platform] || 0) + 1;
      languages[e.language] = (languages[e.language] || 0) + 1;
      const np = e.numPlayers === 4 ? 4 : 2;
      playersCountDist[np]++;
    });

    let totalDuration = 0;
    let completedCountWithDuration = 0;
    completions.forEach(e => {
      if (e.duration) {
        totalDuration += e.duration;
        completedCountWithDuration++;
      }
    });
    const avgDuration = completedCountWithDuration > 0 ? Math.round(totalDuration / completedCountWithDuration) : 0;

    const trends = {};
    events.forEach(e => {
      const dateStr = new Date(e.timestamp).toISOString().split('T')[0];
      if (!trends[dateStr]) {
        trends[dateStr] = { starts: 0, completions: 0 };
      }
      if (e.type === 'game_started') trends[dateStr].starts++;
      if (e.type === 'game_completed') trends[dateStr].completions++;
    });

    ctx.body = {
      ok: true,
      summary: {
        totalStarts,
        totalCompletions,
        completionRate,
        avgDuration,
        startsByMode,
        completionsByMode,
        platforms,
        languages,
        playersCountDist
      },
      trends
    };
  } catch (err) {
    ctx.status = 500;
    ctx.body = { ok: false, error: String(err) };
  }
});

const PORT = process.env.PORT || 8000;
server.run(PORT, () => console.log(`Backend server running on port ${PORT}...`));
