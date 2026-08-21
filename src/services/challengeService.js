import { CHALLENGES } from '../game/challenges';
import { platformBridge } from './platformBridge';

const USERNAME_KEY = 'ronda_singleplayer_username';
const PROGRESS_KEY = 'ronda_challenge_progress';
const PLAYER_ID_KEY = 'ronda_player_id';
const PROFILE_KEY = 'ronda_player_profile';

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

  getProfile: () => {
    if (typeof localStorage === 'undefined' || !localStorage) {
      return { displayName: 'Gast', discriminator: 1001, isGuest: true };
    }
    try {
      const raw = localStorage.getItem(PROFILE_KEY);
      if (raw) return JSON.parse(raw);
      const legacyUsername = localStorage.getItem(USERNAME_KEY);
      if (legacyUsername && !legacyUsername.startsWith('Gast_') && legacyUsername !== 'Gast') {
        const disc = Math.floor(1000 + Math.random() * 9000);
        const legacyProfile = { displayName: legacyUsername, discriminator: disc, isGuest: false };
        localStorage.setItem(PROFILE_KEY, JSON.stringify(legacyProfile));
        return legacyProfile;
      }
      const defaultGuest = {
        displayName: 'Gast',
        discriminator: Math.floor(1000 + Math.random() * 9000),
        isGuest: true
      };
      localStorage.setItem(PROFILE_KEY, JSON.stringify(defaultGuest));
      return defaultGuest;
    } catch {
      return { displayName: 'Gast', discriminator: 1001, isGuest: true };
    }
  },

  getDisplayName: () => {
    const profile = challengeService.getProfile();
    return profile.displayName || 'Gast';
  },

  getDiscriminator: () => {
    const profile = challengeService.getProfile();
    return profile.discriminator || null;
  },

  isGuest: () => {
    const profile = challengeService.getProfile();
    return Boolean(profile.isGuest);
  },

  hasCustomName: () => {
    const profile = challengeService.getProfile();
    return !profile.isGuest && Boolean(profile.displayName) && profile.displayName !== 'Gast';
  },

  getFullHandle: () => {
    const profile = challengeService.getProfile();
    const name = profile.displayName || 'Gast';
    if (profile.discriminator) {
      return `${name}#${profile.discriminator}`;
    }
    return name;
  },

  // Legacy helper
  getUsername: () => {
    return challengeService.getDisplayName();
  },

  setUsername: (name) => {
    const trimmed = (name || '').trim();
    if (!trimmed) return;
    if (typeof localStorage !== 'undefined' && localStorage) {
      localStorage.setItem(USERNAME_KEY, trimmed);
      const profile = challengeService.getProfile();
      profile.displayName = trimmed;
      profile.isGuest = false;
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    }
    const playerId = challengeService.getPlayerId();
    const progress = challengeService.getProgress();
    platformBridge.savePlayer(playerId, trimmed, progress);
  },

  updateDisplayName: async (name) => {
    const playerId = challengeService.getPlayerId();
    const res = await platformBridge.updateDisplayName(playerId, name);
    if (res?.ok && res.player) {
      const p = res.player;
      if (typeof localStorage !== 'undefined' && localStorage) {
        const profile = {
          displayName: p.displayName,
          discriminator: p.discriminator,
          isGuest: false
        };
        localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
        localStorage.setItem(USERNAME_KEY, p.displayName);
      }
      return { ok: true, player: p };
    }
    return { ok: false, error: res?.error || 'UPDATE_FAILED' };
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
      const displayName = challengeService.getDisplayName();
      platformBridge.savePlayer(playerId, displayName, progress);
    } catch (e) {
      console.error('[ChallengeService] Failed to save progress:', e);
    }
  },

  submitFreePlayWin: async () => {
    const progress = challengeService.getProgress();
    progress.freePlayWins = (progress.freePlayWins || 0) + 1;
    progress.totalPoints += 5;
    challengeService.saveProgress(progress);
    await challengeService.sendLeaderboardScore(5, 'free_play');
    return progress;
  },

  submitFreePlayLoss: async () => {
    const progress = challengeService.getProgress();
    progress.totalPoints = Math.max(0, progress.totalPoints - 1);
    challengeService.saveProgress(progress);
    await challengeService.sendLeaderboardScore(-1, 'free_play_loss');
    return progress;
  },

  submitMultiplayerWin: async (numPlayers = 2) => {
    const pointsToAdd = numPlayers === 4 ? 20 : 10;
    const source = numPlayers === 4 ? 'multiplayer_4p' : 'multiplayer_2p';

    const progress = challengeService.getProgress();
    progress.multiplayerWins = (progress.multiplayerWins || 0) + 1;
    progress.totalPoints += pointsToAdd;
    challengeService.saveProgress(progress);
    await challengeService.sendLeaderboardScore(pointsToAdd, source);
    return { pointsAdded: pointsToAdd, progress };
  },

  submitMultiplayerLoss: async (numPlayers = 2) => {
    const pointsToDeduct = numPlayers === 4 ? 4 : 2;
    const source = numPlayers === 4 ? 'multiplayer_4p_loss' : 'multiplayer_2p_loss';

    const progress = challengeService.getProgress();
    progress.totalPoints = Math.max(0, progress.totalPoints - pointsToDeduct);
    challengeService.saveProgress(progress);
    await challengeService.sendLeaderboardScore(-pointsToDeduct, source);
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

      if (!isAlreadyCompleted) {
        await challengeService.sendLeaderboardScore(challenge.points, `challenge_${challengeId}`);
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
        const profile = {
          displayName: p.displayName || p.username || 'Player',
          discriminator: p.discriminator || null,
          isGuest: Boolean(p.isGuest)
        };
        localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
        localStorage.setItem(USERNAME_KEY, profile.displayName);
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

  sendLeaderboardScore: async (pointsToAdd, source) => {
    try {
      const baseUrl = getApiUrl();
      const playerId = challengeService.getPlayerId();
      const displayName = challengeService.getDisplayName();
      const discriminator = challengeService.getDiscriminator();
      await fetch(`${baseUrl}/api/leaderboard/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, displayName, discriminator, pointsToAdd, source })
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

  fetchPlayerRank: async (playerId) => {
    const targetId = playerId || challengeService.getPlayerId();
    try {
      const entries = await challengeService.fetchLeaderboard('monthly');
      const idx = entries.findIndex(e => e.playerId === targetId);
      if (idx !== -1) {
        return { rank: idx + 1, points: entries[idx].points };
      }
      return { rank: null, points: challengeService.getProgress().totalPoints };
    } catch {
      return { rank: null, points: challengeService.getProgress().totalPoints };
    }
  }
};
