import { CHALLENGES } from '../game/challenges';

const USERNAME_KEY = 'ronda_singleplayer_username';
const PROGRESS_KEY = 'ronda_challenge_progress';

const getApiUrl = () => {
  if (typeof window === 'undefined') return 'http://localhost:8000';
  const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  if (isDev) return 'http://localhost:8000';
  return import.meta.env.VITE_SERVER_URL || 'https://ronda-backend.up.railway.app';
};

export const challengeService = {
  getUsername: () => {
    if (typeof localStorage === 'undefined' || !localStorage) return '';
    return localStorage.getItem(USERNAME_KEY) || '';
  },

  setUsername: (name) => {
    if (typeof localStorage === 'undefined' || !localStorage) return;
    const trimmed = (name || '').trim();
    if (trimmed) {
      localStorage.setItem(USERNAME_KEY, trimmed);
    }
  },

  getProgress: () => {
    const defaultData = { completed: [], totalPoints: 0, freePlayWins: 0, multiplayerWins: 0 };
    if (typeof localStorage === 'undefined' || !localStorage) return defaultData;
    try {
      const raw = localStorage.getItem(PROGRESS_KEY);
      if (!raw) return defaultData;
      const parsed = JSON.parse(raw);
      return {
        completed: Array.isArray(parsed.completed) ? parsed.completed : [],
        totalPoints: typeof parsed.totalPoints === 'number' ? parsed.totalPoints : 0,
        freePlayWins: typeof parsed.freePlayWins === 'number' ? parsed.freePlayWins : 0,
        multiplayerWins: typeof parsed.multiplayerWins === 'number' ? parsed.multiplayerWins : 0
      };
    } catch {
      return defaultData;
    }
  },

  saveProgress: (progress) => {
    if (typeof localStorage === 'undefined' || !localStorage) return;
    try {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
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

  submitChallengeResult: async (challengeId, matchStats) => {
    const challenge = CHALLENGES.find(c => c.id === challengeId);
    if (!challenge) return { completedNow: false, pointsEarned: 0 };

    const progress = challengeService.getProgress();
    const isAlreadyCompleted = progress.completed.includes(challengeId);
    const meetsRequirements = challenge.requirement(matchStats);

    if (meetsRequirements && !isAlreadyCompleted) {
      progress.completed.push(challengeId);
      progress.totalPoints += challenge.points;
      challengeService.saveProgress(progress);

      const username = challengeService.getUsername();
      if (username) {
        await challengeService.sendLeaderboardScore(username, challenge.points, `challenge_${challengeId}`);
      }
      return { completedNow: true, pointsEarned: challenge.points };
    }

    return { completedNow: false, pointsEarned: 0 };
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
