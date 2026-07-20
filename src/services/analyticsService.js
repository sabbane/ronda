const API_URL = import.meta.env.VITE_SERVER_URL || (
  import.meta.env.DEV
    ? 'http://localhost:8000' // aislop-ignore-line
    : `https://ronda-backend.up.railway.app` // aislop-ignore-line
);

const getPlatform = () => {
  if (typeof window === 'undefined') return 'desktop';
  if (window.playgamaInitialized || window.bridge) {
    return 'playgama';
  }
  if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
    return 'pwa';
  }
  const ua = window.navigator.userAgent || '';
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
};

const getLanguage = () => {
  if (typeof window === 'undefined') return 'en';
  const lang = localStorage.getItem('ronda_lang') || window.navigator.language || 'en';
  const baseLang = lang.substring(0, 2).toLowerCase();
  // We only support 'fr', 'en', 'ar'
  if (['fr', 'en', 'ar'].includes(baseLang)) {
    return baseLang;
  }
  return 'en';
};

export const analyticsService = {
  async trackEvent({ matchID, type, mode, numPlayers, duration, finalScores }) {
    try {
      const payload = {
        matchID,
        type,
        mode,
        numPlayers,
        platform: getPlatform(),
        language: getLanguage(),
        duration: duration || null,
        finalScores: finalScores || null
      };

      const resp = await fetch(`${API_URL}/api/analytics/event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!resp.ok) {
        console.error('[Analytics] Failed to log event:', await resp.text());
      }
    } catch (err) {
      console.error('[Analytics] Network error logging event:', err);
    }
  },

  async verifyPassword(password) {
    const resp = await fetch(`${API_URL}/api/analytics/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });

    if (!resp.ok) {
      const errData = await resp.json().catch(() => ({}));
      throw new Error(errData.error || 'Authentication failed');
    }

    const data = await resp.json();
    if (data.token) {
      sessionStorage.setItem('ronda_admin_token', data.token);
    }
    return data.token;
  },

  async getStats() {
    const token = sessionStorage.getItem('ronda_admin_token');
    if (!token) throw new Error('Not authenticated');

    const resp = await fetch(`${API_URL}/api/analytics/stats`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!resp.ok) {
      if (resp.status === 401) {
        sessionStorage.removeItem('ronda_admin_token');
        throw new Error('Unauthorized');
      }
      const errData = await resp.json().catch(() => ({}));
      throw new Error(errData.error || 'Failed to fetch stats');
    }

    return resp.json();
  },

  logout() {
    sessionStorage.removeItem('ronda_admin_token');
  },

  isAuthenticated() {
    return !!sessionStorage.getItem('ronda_admin_token');
  }
};
