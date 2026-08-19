import pg from 'pg';
import fs from 'fs';
import path from 'path';

const { Pool } = pg;

const scratchDir = path.join(process.cwd(), 'scratch');
if (!fs.existsSync(scratchDir)) {
  fs.mkdirSync(scratchDir, { recursive: true });
}
const playersJsonPath = path.join(scratchDir, 'players.json');
const leaderboardJsonPath = path.join(scratchDir, 'leaderboard.json');

const databaseUrl = process.env.DATABASE_URL;
let pool = null;

if (databaseUrl) {
  try {
    const isLocal = databaseUrl.includes('localhost') || databaseUrl.includes('127.0.0.1');
    pool = new Pool({
      connectionString: databaseUrl,
      ssl: isLocal ? false : { rejectUnauthorized: false }
    });
    console.log('[DB] PostgreSQL pool configured with DATABASE_URL.');
  } catch (err) {
    console.error('[DB] Failed to initialize PostgreSQL pool:', err);
  }
} else {
  console.log('[DB] DATABASE_URL not set - running with local JSON fallback.');
}

const loadJson = (filePath, fallback) => {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
  } catch { /* ignore */ }
  return fallback;
};

const saveJson = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error(`[DB] Failed to save ${filePath}:`, err);
  }
};

let jsonPlayers = loadJson(playersJsonPath, {});
let jsonLeaderboard = loadJson(leaderboardJsonPath, { monthly: {}, alltime: [] });
const jsonTransferCodes = {};

export const initDatabase = async () => {
  if (!pool) return;
  try {
    const client = await pool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS players (
          id VARCHAR(64) PRIMARY KEY,
          username VARCHAR(64) NOT NULL,
          total_points INTEGER DEFAULT 0,
          free_play_wins INTEGER DEFAULT 0,
          multiplayer_wins INTEGER DEFAULT 0,
          completed_challenges JSONB DEFAULT '[]'::jsonb,
          cooldowns JSONB DEFAULT '{}'::jsonb,
          platform VARCHAR(32) DEFAULT 'standalone',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS leaderboard_entries (
          id SERIAL PRIMARY KEY,
          username VARCHAR(64) NOT NULL,
          period_key VARCHAR(32) NOT NULL,
          points INTEGER DEFAULT 0,
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE(username, period_key)
        );
        CREATE INDEX IF NOT EXISTS idx_leaderboard_rank ON leaderboard_entries(period_key, points DESC);

        CREATE TABLE IF NOT EXISTS transfer_codes (
          code VARCHAR(16) PRIMARY KEY,
          player_id VARCHAR(64) REFERENCES players(id) ON DELETE CASCADE,
          expires_at TIMESTAMPTZ NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);

      // Seed initial data from JSON if table empty
      const countRes = await client.query('SELECT COUNT(*) FROM players');
      if (parseInt(countRes.rows[0].count, 10) === 0 && Object.keys(jsonPlayers).length > 0) {
        console.log('[DB] Migrating existing JSON players into PostgreSQL...');
        for (const p of Object.values(jsonPlayers)) {
          await client.query(`
            INSERT INTO players (id, username, total_points, free_play_wins, multiplayer_wins, completed_challenges, cooldowns, platform, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            ON CONFLICT (id) DO NOTHING
          `, [
            p.id,
            p.username || '',
            p.totalPoints || 0,
            p.freePlayWins || 0,
            p.multiplayerWins || 0,
            JSON.stringify(p.completed || []),
            JSON.stringify(p.cooldowns || {}),
            p.platform || 'standalone',
            p.updatedAt || new Date().toISOString()
          ]);
        }
      }

      console.log('[DB] PostgreSQL tables and indexes initialized successfully.');
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('[DB] Database initialization failed:', err);
  }
};

export const dbService = {
  syncPlayer: async (playerId, username, platform, data) => {
    if (pool) {
      const now = new Date().toISOString();
      const res = await pool.query(`
        INSERT INTO players (id, username, total_points, free_play_wins, multiplayer_wins, completed_challenges, cooldowns, platform, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (id) DO UPDATE SET
          username = COALESCE(NULLIF(EXCLUDED.username, ''), players.username),
          platform = EXCLUDED.platform,
          total_points = COALESCE(EXCLUDED.total_points, players.total_points),
          free_play_wins = COALESCE(EXCLUDED.free_play_wins, players.free_play_wins),
          multiplayer_wins = COALESCE(EXCLUDED.multiplayer_wins, players.multiplayer_wins),
          completed_challenges = COALESCE(EXCLUDED.completed_challenges, players.completed_challenges),
          cooldowns = COALESCE(EXCLUDED.cooldowns, players.cooldowns),
          updated_at = EXCLUDED.updated_at
        RETURNING *;
      `, [
        playerId,
        username || '',
        data?.totalPoints ?? 0,
        data?.freePlayWins ?? 0,
        data?.multiplayerWins ?? 0,
        JSON.stringify(data?.completed || []),
        JSON.stringify(data?.cooldowns || {}),
        platform || 'standalone',
        now
      ]);
      const row = res.rows[0];
      return {
        id: row.id,
        username: row.username,
        totalPoints: row.total_points,
        freePlayWins: row.free_play_wins,
        multiplayerWins: row.multiplayer_wins,
        completed: row.completed_challenges,
        cooldowns: row.cooldowns,
        platform: row.platform,
        updatedAt: row.updated_at
      };
    }

    // JSON Fallback
    const now = new Date().toISOString();
    const existing = jsonPlayers[playerId] || {
      id: playerId,
      username: username || '',
      totalPoints: 0,
      freePlayWins: 0,
      multiplayerWins: 0,
      completed: [],
      cooldowns: {},
      platform: platform || 'standalone',
      createdAt: now
    };
    if (username) existing.username = username;
    if (platform) existing.platform = platform;
    if (data) {
      if (typeof data.totalPoints === 'number') existing.totalPoints = data.totalPoints;
      if (typeof data.freePlayWins === 'number') existing.freePlayWins = data.freePlayWins;
      if (typeof data.multiplayerWins === 'number') existing.multiplayerWins = data.multiplayerWins;
      if (Array.isArray(data.completed)) existing.completed = data.completed;
      if (data.cooldowns && typeof data.cooldowns === 'object') existing.cooldowns = data.cooldowns;
    }
    existing.updatedAt = now;
    jsonPlayers[playerId] = existing;
    saveJson(playersJsonPath, jsonPlayers);
    return existing;
  },

  getPlayer: async (playerId) => {
    if (pool) {
      const res = await pool.query('SELECT * FROM players WHERE id = $1', [playerId]);
      if (res.rows.length === 0) return null;
      const row = res.rows[0];
      return {
        id: row.id,
        username: row.username,
        totalPoints: row.total_points,
        freePlayWins: row.free_play_wins,
        multiplayerWins: row.multiplayer_wins,
        completed: row.completed_challenges,
        cooldowns: row.cooldowns,
        platform: row.platform,
        updatedAt: row.updated_at
      };
    }
    return jsonPlayers[playerId] || null;
  },

  generateTransferCode: async (playerId) => {
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    const code = `RND-${randomDigits}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    if (pool) {
      await pool.query(`
        INSERT INTO transfer_codes (code, player_id, expires_at)
        VALUES ($1, $2, $3)
      `, [code, playerId, expiresAt.toISOString()]);
      return { ok: true, code, expiresAt: expiresAt.getTime() };
    }

    jsonTransferCodes[code] = { playerId, expiresAt: expiresAt.getTime() };
    return { ok: true, code, expiresAt: expiresAt.getTime() };
  },

  claimTransferCode: async (code) => {
    if (pool) {
      const res = await pool.query(`
        SELECT tc.*, p.*
        FROM transfer_codes tc
        JOIN players p ON tc.player_id = p.id
        WHERE tc.code = $1 AND tc.expires_at > NOW()
      `, [code]);
      if (res.rows.length === 0) return null;
      const row = res.rows[0];
      await pool.query('DELETE FROM transfer_codes WHERE code = $1', [code]);
      return {
        id: row.player_id,
        username: row.username,
        totalPoints: row.total_points,
        freePlayWins: row.free_play_wins,
        multiplayerWins: row.multiplayer_wins,
        completed: row.completed_challenges,
        cooldowns: row.cooldowns,
        platform: row.platform
      };
    }

    const item = jsonTransferCodes[code];
    if (!item || Date.now() > item.expiresAt) {
      delete jsonTransferCodes[code];
      return null;
    }
    const player = jsonPlayers[item.playerId];
    delete jsonTransferCodes[code];
    return player || null;
  },

  submitLeaderboardScore: async (username, pointsToAdd) => {
    const now = new Date();
    const monthKey = `monthly_${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    if (pool) {
      for (const periodKey of [monthKey, 'alltime']) {
        await pool.query(`
          INSERT INTO leaderboard_entries (username, period_key, points, updated_at)
          VALUES ($1, $2, GREATEST(0, $3), NOW())
          ON CONFLICT (username, period_key) DO UPDATE SET
            points = GREATEST(0, leaderboard_entries.points + $3),
            updated_at = NOW()
        `, [username, periodKey, pointsToAdd]);
      }
      return { ok: true };
    }

    // JSON Fallback
    const mKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    if (!jsonLeaderboard.monthly[mKey]) jsonLeaderboard.monthly[mKey] = [];
    const updateList = (list) => {
      const existing = list.find(e => e.username.toLowerCase() === username.toLowerCase());
      if (existing) {
        existing.points = Math.max(0, (existing.points || 0) + pointsToAdd);
        existing.updatedAt = now.toISOString();
      } else if (pointsToAdd > 0) {
        list.push({ username, points: pointsToAdd, updatedAt: now.toISOString() });
      }
      list.sort((a, b) => b.points - a.points);
    };
    updateList(jsonLeaderboard.monthly[mKey]);
    updateList(jsonLeaderboard.alltime);
    saveJson(leaderboardJsonPath, jsonLeaderboard);
    return { ok: true };
  },

  getLeaderboard: async (period = 'monthly') => {
    const now = new Date();
    const monthKey = `monthly_${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const periodKey = period === 'monthly' ? monthKey : 'alltime';

    if (pool) {
      const res = await pool.query(`
        SELECT username, points, updated_at as "updatedAt"
        FROM leaderboard_entries
        WHERE period_key = $1
        ORDER BY points DESC
        LIMIT 20
      `, [periodKey]);
      return { ok: true, period, monthKey, entries: res.rows };
    }

    // JSON Fallback
    const rawMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const entries = period === 'monthly'
      ? (jsonLeaderboard.monthly[rawMonthKey] || [])
      : (jsonLeaderboard.alltime || []);
    return { ok: true, period, monthKey: rawMonthKey, entries: entries.slice(0, 20) };
  }
};
