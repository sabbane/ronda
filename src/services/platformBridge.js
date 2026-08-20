const getApiUrl = () => {
  if (typeof window === 'undefined') return 'http://localhost:8000';
  const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  if (isDev) return 'http://localhost:8000';
  return import.meta.env.VITE_SERVER_URL || 'https://ronda-backend.up.railway.app';
};

export const platformBridge = {
  getPlatformName: () => {
    if (typeof window === 'undefined') return 'standalone';
    if (window.CrazyGamesSDK || window.CrazyGames) return 'crazygames';
    if (window.PlayGamaBridge || window.playgama) return 'playgama';
    if (window.GameDistribution || window.gamedistribution) return 'gamedistribution';
    return 'standalone';
  },

  init: async () => {
    const platform = platformBridge.getPlatformName();
    if (platform === 'crazygames' && window.CrazyGames?.SDK) {
      try {
        await window.CrazyGames.SDK.init();
      } catch (err) {
        console.warn('[PlatformBridge] CrazyGames init failed:', err);
      }
    }
    return platform;
  },

  getPlayer: async (playerId) => {
    if (!playerId) return null;
    try {
      const baseUrl = getApiUrl();
      const res = await fetch(`${baseUrl}/api/player/${playerId}`);
      if (!res.ok) return null;
      const data = await res.json();
      return data.player || null;
    } catch (err) {
      console.warn('[PlatformBridge] getPlayer failed (offline fallback):', err);
      return null;
    }
  },

  updateDisplayName: async (playerId, displayName) => {
    if (!playerId || !displayName) return { ok: false, error: 'INVALID_INPUT' };
    try {
      const baseUrl = getApiUrl();
      const res = await fetch(`${baseUrl}/api/player/name`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, displayName })
      });
      return await res.json();
    } catch (err) {
      console.warn('[PlatformBridge] updateDisplayName failed:', err);
      return { ok: false, error: 'NETWORK_ERROR' };
    }
  },

  savePlayer: async (playerId, displayName, data) => {
    if (!playerId) return null;
    const platform = platformBridge.getPlatformName();
    try {
      const baseUrl = getApiUrl();
      const res = await fetch(`${baseUrl}/api/player/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, displayName, platform, data })
      });
      if (!res.ok) return null;
      const json = await res.json();
      return json.player || null;
    } catch (err) {
      console.warn('[PlatformBridge] savePlayer failed (offline mode):', err);
      return null;
    }
  },

  generateTransferCode: async (playerId) => {
    if (!playerId) return null;
    try {
      const baseUrl = getApiUrl();
      const res = await fetch(`${baseUrl}/api/player/transfer/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId })
      });
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      console.warn('[PlatformBridge] generateTransferCode failed:', err);
      return null;
    }
  },

  claimTransferCode: async (code) => {
    if (!code) return null;
    try {
      const baseUrl = getApiUrl();
      const res = await fetch(`${baseUrl}/api/player/transfer/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      console.warn('[PlatformBridge] claimTransferCode failed:', err);
      return null;
    }
  }
};
