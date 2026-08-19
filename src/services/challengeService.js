import { CHALLENGES } from '../game/challenges';
import { platformBridge } from './platformBridge';

const USERNAME_KEY = 'ronda_singleplayer_username';
const PROGRESS_KEY = 'ronda_challenge_progress';
const PLAYER_ID_KEY = 'ronda_player_id';

const getApiUrl = () => {
  if (typeof window === 'undefined') return 'http://localhost:8000';
  const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  if (isDev) return 'http://localhost:8000';
  return import.meta.env.VITE_SERVER_URL || 'https://ronda-backend.up.railway.app';
};

export const challengeService = {
  getPlayerId: () => {
    if (typeof localStorage === 'undefined' || !localStorage) return 'guest_dev';
    let id = localStorage.getItem(PLAYER_ID_KEY);
    if (!id) {
      id = `usr_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
      localStorage.setItem(PLAYER_ID_KEY, id);
    }
    return id;
  },

  getUsername: () => {
    if (typeof localStorage === 'undefined' || !localStorage) return '';
    return localStorage.getItem(USERNAME_KEY) || '';
  },

  setUsername: (name) => {
    if (typeof localStorage === 'undefined' || !localStorage) return;
    const trimmed = (name || '').trim();
    if (trimmed) {
      localStorage.setItem(USERNAME_KEY, trimmed);
      const playerId = challengeService.getPlayerId();
      const progress = challengeService.getProgress();
      platformBridge.savePlayer(playerId, trimmed, progress);
    }
  },

  getProgress: () => {
    const defaultData = { completed: [], totalPoints: 0, freePlayWins: 0, multiplayerWins: 0, cooldowns: {} };
    if (typeof localStorage === 'undefined' || !localStorage) return defaultData;
    try {
      const raw = localStorage.getItem(PROGRESS_KEY);
      if (!raw) return defaultData;
      const parsed = JSON.parse(raw);
      return {
        completed: Array.isArray(parsed.completed) ? parsed.completed : [],
        totalPoints: typeof parsed.totalPoints === 'number' ? parsed.totalPoints : 0,
        freePlayWins: typeof parsed.freePlayWins === 'number' ? parsed.freePlayWins : 0,
        multiplayerWins: typeof parsed.multiplayerWins === 'number' ? parsed.multiplayerWins : 0,
        cooldowns: (parsed.cooldowns && typeof parsed.cooldowns === 'object') ? parsed.cooldowns : {}
      };
    } catch {
      return defaultData;
    }
  },

  saveProgress: (progress) => {
    if (typeof localStorage === 'undefined' || !localStorage) return;
    try {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
      const playerId = challengeService.getPlayerId();
      const username = challengeService.getUsername();
      platformBridge.savePlayer(playerId, username, progress);
    } catch (e) {
      console.error('[ChallengeService] Failed to save progress:', e);
    }
  },

  submitFreePlayWin: async () => {
    const username = challengeService.getUsername();
    const progress = challengeService.getProgress();
    progress.freePlayWins = (progress.freePlayWins || 0) + 1;
    progress.totalPoints += 5;
    challengeService.saveProgress(progress);

    if (username) {
      await challengeService.sendLeaderboardScore(username, 5, 'free_play');
    }
    return progress;
  },

  submitFreePlayLoss: async () => {
    const username = challengeService.getUsername();
    const progress = challengeService.getProgress();
    progress.totalPoints = Math.max(0, progress.totalPoints - 1);
    challengeService.saveProgress(progress);

    if (username) {
      await challengeService.sendLeaderboardScore(username, -1, 'free_play_loss');
    }
    return progress;
  },

  submitMultiplayerWin: async (numPlayers = 2) => {
    const pointsToAdd = numPlayers === 4 ? 20 : 10;
    const source = numPlayers === 4 ? 'multiplayer_4p' : 'multiplayer_2p';

    const username = challengeService.getUsername();
    const progress = challengeService.getProgress();
    progress.multiplayerWins = (progress.multiplayerWins || 0) + 1;
    progress.totalPoints += pointsToAdd;
    challengeService.saveProgress(progress);

    if (username) {
      await challengeService.sendLeaderboardScore(username, pointsToAdd, source);
    }
    return { pointsAdded: pointsToAdd, progress };
  },

  submitMultiplayerLoss: async (numPlayers = 2) => {
    const pointsToDeduct = numPlayers === 4 ? 4 : 2;
    const source = numPlayers === 4 ? 'multiplayer_4p_loss' : 'multiplayer_2p_loss';

    const username = challengeService.getUsername();
    const progress = challengeService.getProgress();
    progress.totalPoints = Math.max(0, progress.totalPoints - pointsToDeduct);
    challengeService.saveProgress(progress);

    if (username) {
      await challengeService.sendLeaderboardScore(username, -pointsToDeduct, source);
    }
    return { pointsDeducted: pointsToDeduct, progress };
  },

  submitChallengeResult: async (challengeId, matchStats) => {
    const challenge = CHALLENGES.find(c => c.id === challengeId);
    if (!challenge) return { completedNow: false, pointsEarned: 0 };

    const progress = challengeService.getProgress();
    const isAlreadyCompleted = progress.completed.includes(challengeId);
    const meetsRequirements = challenge.requirement(matchStats);

    if (meetsRequirements) {
      progress.cooldowns = { ...(progress.cooldowns || {}), [challengeId]: Date.now() + 60 * 60 * 1000 };

      if (!isAlreadyCompleted) {
        progress.completed.push(challengeId);
        progress.totalPoints += challenge.points;
      }
      challengeService.saveProgress(progress);

      const username = challengeService.getUsername();
      if (username && !isAlreadyCompleted) {
        await challengeService.sendLeaderboardScore(username, challenge.points, `challenge_${challengeId}`);
      }
      return { completedNow: !isAlreadyCompleted, pointsEarned: isAlreadyCompleted ? 0 : challenge.points };
    }

    return { completedNow: false, pointsEarned: 0 };
  },

  getChallengeCooldown: (challengeId) => {
    const progress = challengeService.getProgress();
    const expireTime = progress.cooldowns?.[challengeId];
    if (!expireTime) return 0;
    const remainingMs = expireTime - Date.now();
    return remainingMs > 0 ? Math.ceil(remainingMs / 1000) : 0;
  },

  generateTransferCode: async () => {
    const playerId = challengeService.getPlayerId();
    return await platformBridge.generateTransferCode(playerId);
  },

  claimTransferCode: async (code) => {
    const res = await platformBridge.claimTransferCode(code);
    if (res?.ok && res.player) {
      const p = res.player;
      if (typeof localStorage !== 'undefined' && localStorage) {
        localStorage.setItem(PLAYER_ID_KEY, p.id);
        if (p.username) localStorage.setItem(USERNAME_KEY, p.username);
        const progress = {
          completed: p.completed || [],
          totalPoints: p.totalPoints || 0,
          freePlayWins: p.freePlayWins || 0,
          multiplayerWins: p.multiplayerWins || 0,
          cooldowns: p.cooldowns || {}
        };
        localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
      }
      return { ok: true, player: p };
    }
    return { ok: false, error: res?.error || 'Invalid code' };
  },

  sendLeaderboardScore: async (username, pointsToAdd, source) => {
    try {
      const baseUrl = getApiUrl();
      await fetch(`${baseUrl}/api/leaderboard/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, pointsToAdd, source })
      });
    } catch (err) {
      console.warn('[ChallengeService] Server sync failed (offline mode):', err);
    }
  },

  fetchLeaderboard: async (period = 'monthly') => {
    try {
      const baseUrl = getApiUrl();
      const res = await fetch(`${baseUrl}/api/leaderboard?period=${period}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      return data.entries || [];
    } catch (err) {
      console.warn('[ChallengeService] Failed to fetch leaderboard:', err);
      return [];
    }
  },

  fetchPlayerRank: async (username) => {
    if (!username) return { rank: null, points: challengeService.getProgress().totalPoints };
    try {
      const entries = await challengeService.fetchLeaderboard('monthly');
      const idx = entries.findIndex(e => e.username.toLowerCase() === username.toLowerCase());
      if (idx !== -1) {
        return { rank: idx + 1, points: entries[idx].points };
      }
      return { rank: null, points: challengeService.getProgress().totalPoints };
    } catch {
      return { rank: null, points: challengeService.getProgress().totalPoints };
    }
  }
};
