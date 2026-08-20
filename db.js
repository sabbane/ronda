import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { validateDisplayName } from './src/utils/nameSanitizer.js';

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
          display_name VARCHAR(20) NOT NULL,
          discriminator SMALLINT,
          is_guest BOOLEAN DEFAULT false,
          total_points INTEGER DEFAULT 0,
          free_play_wins INTEGER DEFAULT 0,
          multiplayer_wins INTEGER DEFAULT 0,
          completed_challenges JSONB DEFAULT '[]'::jsonb,
          cooldowns JSONB DEFAULT '{}'::jsonb,
          platform VARCHAR(32) DEFAULT 'standalone',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          last_active_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS idx_users_handle ON players(display_name, discriminator);

        CREATE TABLE IF NOT EXISTS leaderboard_entries (
          id SERIAL PRIMARY KEY,
          player_id VARCHAR(64) REFERENCES players(id) ON DELETE CASCADE,
          display_name VARCHAR(20) NOT NULL,
          discriminator SMALLINT,
          period_key VARCHAR(32) NOT NULL,
          points INTEGER DEFAULT 0,
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE(player_id, period_key)
        );
        CREATE INDEX IF NOT EXISTS idx_leaderboard_rank ON leaderboard_entries(period_key, points DESC);

        CREATE TABLE IF NOT EXISTS transfer_codes (
          code VARCHAR(16) PRIMARY KEY,
          player_id VARCHAR(64) REFERENCES players(id) ON DELETE CASCADE,
          expires_at TIMESTAMPTZ NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);

      // Seed initial data from JSON if empty
      const countRes = await client.query('SELECT COUNT(*) FROM players');
      if (parseInt(countRes.rows[0].count, 10) === 0 && Object.keys(jsonPlayers).length > 0) {
        console.log('[DB] Migrating existing JSON players into PostgreSQL...');
        for (const p of Object.values(jsonPlayers)) {
          const dName = p.displayName || p.username || `Gast_${Math.floor(1000 + Math.random() * 9000)}`;
          const disc = p.discriminator ?? (p.isGuest ? null : Math.floor(1000 + Math.random() * 9000));
          await client.query(`
            INSERT INTO players (id, display_name, discriminator, is_guest, total_points, free_play_wins, multiplayer_wins, completed_challenges, cooldowns, platform, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            ON CONFLICT (id) DO NOTHING
          `, [
            p.id, dName.substring(0, 20), disc, p.isGuest ?? false,
            p.totalPoints || 0, p.freePlayWins || 0, p.multiplayerWins || 0,
            JSON.stringify(p.completed || []), JSON.stringify(p.cooldowns || {}),
            p.platform || 'standalone', p.updatedAt || new Date().toISOString()
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
  createGuestUser: async (playerId, platform = 'standalone') => {
    const randomGuestNum = Math.floor(1000 + Math.random() * 9000);
    const displayName = `Gast_${randomGuestNum}`;
    return await dbService.syncPlayer(playerId, displayName, platform, { isGuest: true, discriminator: null });
  },

  updateDisplayName: async (playerId, rawName) => {
    const check = validateDisplayName(rawName);
    if (!check.valid) {
      return { ok: false, error: check.error };
    }
    const cleanName = check.sanitized;

    if (pool) {
      // Find a non-colliding discriminator (1000-9999)
      let discriminator = Math.floor(1000 + Math.random() * 9000);
      let attempts = 0;
      while (attempts < 10) {
        const collision = await pool.query(
          'SELECT id FROM players WHERE LOWER(display_name) = LOWER($1) AND discriminator = $2 AND id != $3',
          [cleanName, discriminator, playerId]
        );
        if (collision.rows.length === 0) break;
        discriminator = Math.floor(1000 + Math.random() * 9000);
        attempts++;
      }

      const res = await pool.query(`
        INSERT INTO players (id, display_name, discriminator, is_guest, last_active_at, updated_at)
        VALUES ($1, $2, $3, false, NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET
          display_name = EXCLUDED.display_name,
          discriminator = EXCLUDED.discriminator,
          is_guest = false,
          last_active_at = NOW(),
          updated_at = NOW()
        RETURNING *;
      `, [playerId, cleanName, discriminator]);

      // Also update display_name on any existing leaderboard rows
      await pool.query(`
        UPDATE leaderboard_entries
        SET display_name = $1, discriminator = $2, updated_at = NOW()
        WHERE player_id = $3;
      `, [cleanName, discriminator, playerId]);

      const row = res.rows[0];
      return {
        ok: true,
        player: {
          id: row.id,
          displayName: row.display_name,
          discriminator: row.discriminator,
          isGuest: row.is_guest,
          totalPoints: row.total_points,
          freePlayWins: row.free_play_wins,
          multiplayerWins: row.multiplayer_wins,
          completed: row.completed_challenges,
          cooldowns: row.cooldowns,
          platform: row.platform,
          lastActiveAt: row.last_active_at,
          updatedAt: row.updated_at
        }
      };
    }

    // JSON Fallback
    let discriminator = Math.floor(1000 + Math.random() * 9000);
    const existing = jsonPlayers[playerId] || {
      id: playerId, totalPoints: 0, freePlayWins: 0, multiplayerWins: 0,
      completed: [], cooldowns: {}, platform: 'standalone', createdAt: new Date().toISOString()
    };
    existing.displayName = cleanName;
    existing.discriminator = discriminator;
    existing.isGuest = false;
    existing.lastActiveAt = new Date().toISOString();
    existing.updatedAt = new Date().toISOString();
    jsonPlayers[playerId] = existing;
    saveJson(playersJsonPath, jsonPlayers);
    return { ok: true, player: existing };
  },

  syncPlayer: async (playerId, displayName, platform, data) => {
    const isGuest = data?.isGuest ?? (displayName && displayName.startsWith('Gast_'));
    const cleanName = (displayName || `Gast_${Math.floor(1000 + Math.random() * 9000)}`).substring(0, 20);
    const discriminator = isGuest ? null : (data?.discriminator ?? Math.floor(1000 + Math.random() * 9000));

    if (pool) {
      const now = new Date().toISOString();
      const res = await pool.query(`
        INSERT INTO players (id, display_name, discriminator, is_guest, total_points, free_play_wins, multiplayer_wins, completed_challenges, cooldowns, platform, last_active_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET
          display_name = COALESCE(NULLIF(EXCLUDED.display_name, ''), players.display_name),
          discriminator = COALESCE(EXCLUDED.discriminator, players.discriminator),
          is_guest = COALESCE(EXCLUDED.is_guest, players.is_guest),
          platform = EXCLUDED.platform,
          total_points = COALESCE(EXCLUDED.total_points, players.total_points),
          free_play_wins = COALESCE(EXCLUDED.free_play_wins, players.free_play_wins),
          multiplayer_wins = COALESCE(EXCLUDED.multiplayer_wins, players.multiplayer_wins),
          completed_challenges = COALESCE(EXCLUDED.completed_challenges, players.completed_challenges),
          cooldowns = COALESCE(EXCLUDED.cooldowns, players.cooldowns),
          last_active_at = NOW(),
          updated_at = NOW()
        RETURNING *;
      `, [
        playerId, cleanName, discriminator, isGuest,
        data?.totalPoints ?? 0, data?.freePlayWins ?? 0, data?.multiplayerWins ?? 0,
        JSON.stringify(data?.completed || []), JSON.stringify(data?.cooldowns || {}),
        platform || 'standalone'
      ]);
      const row = res.rows[0];
      return {
        id: row.id,
        displayName: row.display_name,
        discriminator: row.discriminator,
        isGuest: row.is_guest,
        totalPoints: row.total_points,
        freePlayWins: row.free_play_wins,
        multiplayerWins: row.multiplayer_wins,
        completed: row.completed_challenges,
        cooldowns: row.cooldowns,
        platform: row.platform,
        lastActiveAt: row.last_active_at,
        updatedAt: row.updated_at
      };
    }

    // JSON Fallback
    const now = new Date().toISOString();
    const existing = jsonPlayers[playerId] || {
      id: playerId, displayName: cleanName, discriminator, isGuest,
      totalPoints: 0, freePlayWins: 0, multiplayerWins: 0,
      completed: [], cooldowns: {}, platform: platform || 'standalone',
      createdAt: now
    };
    if (displayName) existing.displayName = cleanName;
    if (typeof isGuest === 'boolean') existing.isGuest = isGuest;
    if (discriminator !== undefined) existing.discriminator = discriminator;
    if (platform) existing.platform = platform;
    if (data) {
      if (typeof data.totalPoints === 'number') existing.totalPoints = data.totalPoints;
      if (typeof data.freePlayWins === 'number') existing.freePlayWins = data.freePlayWins;
      if (typeof data.multiplayerWins === 'number') existing.multiplayerWins = data.multiplayerWins;
      if (Array.isArray(data.completed)) existing.completed = data.completed;
      if (data.cooldowns && typeof data.cooldowns === 'object') existing.cooldowns = data.cooldowns;
    }
    existing.lastActiveAt = now;
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
        displayName: row.display_name,
        discriminator: row.discriminator,
        isGuest: row.is_guest,
        totalPoints: row.total_points,
        freePlayWins: row.free_play_wins,
        multiplayerWins: row.multiplayer_wins,
        completed: row.completed_challenges,
        cooldowns: row.cooldowns,
        platform: row.platform,
        lastActiveAt: row.last_active_at,
        updatedAt: row.updated_at
      };
    }
    return jsonPlayers[playerId] || null;
  },

  touchPlayerActivity: async (playerId) => {
    if (pool) {
      await pool.query('UPDATE players SET last_active_at = NOW() WHERE id = $1', [playerId]);
    } else if (jsonPlayers[playerId]) {
      jsonPlayers[playerId].lastActiveAt = new Date().toISOString();
      saveJson(playersJsonPath, jsonPlayers);
    }
  },

  cleanupInactiveGuests: async (days = 30) => {
    if (pool) {
      const res = await pool.query(`
        DELETE FROM players
        WHERE is_guest = true AND total_points = 0
        AND last_active_at < NOW() - ($1 || ' days')::interval;
      `, [days]);
      console.log(`[DB] Cleaned up ${res.rowCount} inactive guest accounts.`);
      return res.rowCount;
    }
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    let deletedCount = 0;
    for (const [id, p] of Object.entries(jsonPlayers)) {
      const lastActive = p.lastActiveAt ? new Date(p.lastActiveAt).getTime() : 0;
      if (p.isGuest && (p.totalPoints || 0) === 0 && lastActive < cutoff) {
        delete jsonPlayers[id];
        deletedCount++;
      }
    }
    if (deletedCount > 0) saveJson(playersJsonPath, jsonPlayers);
    return deletedCount;
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
        displayName: row.display_name,
        discriminator: row.discriminator,
        isGuest: row.is_guest,
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

  submitLeaderboardScore: async (playerId, displayName, discriminator, pointsToAdd) => {
    const now = new Date();
    const monthKey = `monthly_${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const cleanName = (displayName || 'Player').substring(0, 20);

    if (pool) {
      for (const periodKey of [monthKey, 'alltime']) {
        await pool.query(`
          INSERT INTO leaderboard_entries (player_id, display_name, discriminator, period_key, points, updated_at)
          VALUES ($1, $2, $3, $4, GREATEST(0, $5), NOW())
          ON CONFLICT (player_id, period_key) DO UPDATE SET
            display_name = EXCLUDED.display_name,
            discriminator = EXCLUDED.discriminator,
            points = GREATEST(0, leaderboard_entries.points + $5),
            updated_at = NOW()
        `, [playerId, cleanName, discriminator, periodKey, pointsToAdd]);
      }
      return { ok: true };
    }

    // JSON Fallback
    const mKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    if (!jsonLeaderboard.monthly[mKey]) jsonLeaderboard.monthly[mKey] = [];
    const updateList = (list) => {
      const existing = list.find(e => e.playerId === playerId);
      if (existing) {
        existing.points = Math.max(0, (existing.points || 0) + pointsToAdd);
        existing.displayName = cleanName;
        existing.discriminator = discriminator;
        existing.updatedAt = now.toISOString();
      } else if (pointsToAdd > 0) {
        list.push({ playerId, displayName: cleanName, discriminator, points: pointsToAdd, updatedAt: now.toISOString() });
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
        SELECT player_id as "playerId", display_name as "displayName", discriminator, points, updated_at as "updatedAt"
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
