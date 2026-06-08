import { useEffect, useCallback } from 'react';
import { LobbyClient } from 'boardgame.io/dist/esm/client.js';
import { RondaGame } from '../game/game';

const restServerUrl = import.meta.env.VITE_SERVER_URL || (
  import.meta.env.DEV
    ? 'http://127.0.0.1:8000' // aislop-ignore-line
    : `https://ronda-backend.up.railway.app` // aislop-ignore-line
);

const lobbyClient = new LobbyClient({ server: restServerUrl });

export const useLobbyListeners = ({
  mode,
  matchID,
  playerID,
  credentials,
  nickname,
  setCredentials,
  setPlayerID,
  setGameKey,
  setMode,
  setError,
  setTestMode,
  setMultiplayerAction,
  t
}) => {
  const handleReset = useCallback(() => {
    setGameKey(prev => prev + 1);
  }, [setGameKey]);

  const handleMenu = useCallback(() => {
    const activeMode = mode;
    const activeMatchID = matchID;
    const activePlayerID = playerID;
    const activeCredentials = credentials;

    setMode(null);
    setError(null);
    setTestMode(false);
    setMultiplayerAction(null);
    setGameKey(prev => prev + 1);

    setTimeout(() => {
      if (activeMode === 'online' && activeMatchID && activePlayerID) {
        lobbyClient.leaveMatch(RondaGame.name, activeMatchID, {
          playerID: activePlayerID,
          credentials: activeCredentials
        }).catch(err => console.error('Failed to leave match via lobbyClient:', err));
      }
      setCredentials(null);
    }, 100);

    try {
      const newUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
      window.history.replaceState({ path: newUrl }, '', newUrl);
    } catch { /* ignore */ }
  }, [mode, matchID, playerID, credentials, setCredentials, setGameKey, setMode, setError, setTestMode, setMultiplayerAction]);

  const handleHostLeft = useCallback(() => {
    const activeMode = mode;
    const activeMatchID = matchID;
    const activePlayerID = playerID;
    const activeCredentials = credentials;

    setMode(null);
    setTestMode(false);
    setMultiplayerAction(null);
    setGameKey(prev => prev + 1);
    setError(t('hostLeftError'));

    setTimeout(() => {
      if (activeMode === 'online' && activeMatchID && activePlayerID) {
        lobbyClient.leaveMatch(RondaGame.name, activeMatchID, {
          playerID: activePlayerID,
          credentials: activeCredentials
        }).catch(err => console.error('Failed to leave match as guest:', err));
      }
      setCredentials(null);
    }, 100);

    try {
      const newUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
      window.history.replaceState({ path: newUrl }, '', newUrl);
    } catch { /* ignore */ }
  }, [mode, matchID, playerID, credentials, setCredentials, setGameKey, setMode, setError, setTestMode, setMultiplayerAction, t]);

  const handleSwitchSeat = useCallback(async (event) => {
    const newPlayerID = event.detail?.newPlayerID;
    if (!newPlayerID) return;

    console.log('[App] handleSwitchSeat requested:', playerID, '->', newPlayerID);

    try {
      if (mode === 'online' && matchID && playerID) {
        await lobbyClient.leaveMatch(RondaGame.name, matchID, {
          playerID,
          credentials
        }).catch(err => console.error('Failed to leave old seat during switch:', err));
      }

      const joinData = await lobbyClient.joinMatch(RondaGame.name, matchID, {
        playerID: newPlayerID,
        playerName: nickname || 'Player'
      });

      setCredentials(joinData.playerCredentials);
      setPlayerID(newPlayerID);
      setGameKey(prev => prev + 1);
      console.log('[App] handleSwitchSeat completed successfully. Switched to slot:', newPlayerID);
    } catch (err) {
      console.error('[App] Failed to switch seat:', err);
      setError(t('joinError') || 'Failed to switch seat');
    }
  }, [mode, matchID, playerID, credentials, nickname, setCredentials, setPlayerID, setGameKey, setError, t]);

  useEffect(() => {
    window.addEventListener('ronda-reset', handleReset);
    return () => window.removeEventListener('ronda-reset', handleReset);
  }, [handleReset]);

  useEffect(() => {
    window.addEventListener('ronda-menu', handleMenu);
    return () => window.removeEventListener('ronda-menu', handleMenu);
  }, [handleMenu]);

  useEffect(() => {
    window.addEventListener('ronda-host-left', handleHostLeft);
    return () => window.removeEventListener('ronda-host-left', handleHostLeft);
  }, [handleHostLeft]);

  useEffect(() => {
    window.addEventListener('ronda-switch-seat', handleSwitchSeat);
    return () => window.removeEventListener('ronda-switch-seat', handleSwitchSeat);
  }, [handleSwitchSeat]);
};
