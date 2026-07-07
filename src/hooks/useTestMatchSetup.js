import { useEffect } from 'react';

const restServerUrl = import.meta.env.VITE_SERVER_URL || (
  import.meta.env.DEV
    ? 'http://127.0.0.1:8000' // aislop-ignore-line
    : `https://ronda-backend.up.railway.app` // aislop-ignore-line
);

// Helper function to fetch test match ID
const fetchTestMatchID = async (pID, numP = 2) => {
  if (pID === '0') {
    const endpoint = numP === 4 ? '/test/reset4' : '/test/reset';
    const resp = await fetch(`${restServerUrl}${endpoint}`, { method: 'POST' });
    const data = await resp.json();
    if (!data.ok || !data.matchID) {
      throw new Error('Server could not create test match');
    }
    return data.matchID;
  }

  for (let attempts = 0; attempts < 20; attempts++) {
    try {
      const resp = await fetch(`${restServerUrl}/test/match-id`);
      if (resp.ok) {
        const data = await resp.json();
        if (data.ok && data.matchID) {
          return data.matchID;
        }
      }
    } catch { /* ignore */ }
    await new Promise(r => setTimeout(r, 500));
  }
  throw new Error('P2 could not find a test match. Open /test/p1 first.');
};

let lastSetupPath = null;

export const useTestMatchSetup = ({
  setMatchID,
  setPlayerID,
  setMatchNumPlayers,
  setMode,
  setTestMode,
  setMultiplayerAction,
  setJoinMode
}) => {
  useEffect(() => {
    const isAppInTestMode = import.meta.env.VITE_TEST_MODE === 'true';
    const path = window.location.pathname;

    const setupTestMatch = async (pID, numP) => {
      try {
        const testMatchID = await fetchTestMatchID(pID, numP);
        console.log(`[TestMode] P${pID === '0' ? '1' : '2'}: test match resolved:`, testMatchID);
        setMatchID(testMatchID);
        setPlayerID(pID);
        setMatchNumPlayers(numP);
        setMode('online');
        setTestMode(true);
      } catch (err) {
        console.error('[TestMode] Setup error:', err);
      }
    };

    if (isAppInTestMode) {
      if (path === '/test/p1' || path === '/test/p2' || path === '/test/p1_4') {
        if (lastSetupPath === path) return;
        lastSetupPath = path;
        const pID = path === '/test/p2' ? '1' : '0';
        const numP = path === '/test/p1_4' ? 4 : 2;
        setupTestMatch(pID, numP);
      } else {
        lastSetupPath = null;
      }
    } else {
      const params = new URLSearchParams(window.location.search);
      const roomParam = params.get('room');
      if (roomParam) {
        setMatchID(roomParam);
        setMultiplayerAction('join');
        setJoinMode('private');
      }
    }
  }, [setMatchID, setPlayerID, setMatchNumPlayers, setMode, setTestMode, setMultiplayerAction, setJoinMode]);
};
