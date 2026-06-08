import { useState, useEffect } from 'react';
import { LobbyClient } from 'boardgame.io/dist/esm/client.js';
import { RondaGame } from '../game/game';
import { useLanguage } from '../contexts/LanguageContext';
import { useLobbyListeners } from './useLobbyListeners';
import { useTestMatchSetup } from './useTestMatchSetup';

const restServerUrl = import.meta.env.VITE_SERVER_URL || (
  import.meta.env.DEV
    ? 'http://127.0.0.1:8000' // aislop-ignore-line
    : `https://ronda-backend.up.railway.app` // aislop-ignore-line
);

const lobbyClient = new LobbyClient({ server: restServerUrl });

// Helper function to update URL query param
const updateUrl = (id) => {
  try {
    const newUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?room=${id}`;
    window.history.replaceState({ path: newUrl }, '', newUrl);
  } catch {
    // Ignore errors in sandboxed iframes (like PlayGama)
  }
};

// Helper function to handle lobby match creation APIs
const createRoomMatch = async (maxPlayers, isPrivate, testMode, nickname) => {
  localStorage.setItem('ronda_nickname', nickname);
  const match = await lobbyClient.createMatch(RondaGame.name, {
    numPlayers: maxPlayers,
    unlisted: isPrivate,
    setupData: { gameStarted: false, testMode }
  });
  const realMatchID = match.matchID;
  const joinData = await lobbyClient.joinMatch(RondaGame.name, realMatchID, {
    playerID: '0',
    playerName: nickname
  });
  return { realMatchID, joinData };
};

// Helper function to handle lobby match joining APIs
const joinRoomMatch = async (targetMatchID, nickname) => {
  localStorage.setItem('ronda_nickname', nickname);
  const match = await lobbyClient.getMatch(RondaGame.name, targetMatchID);
  if (!match) {
    throw new Error('roomNotFound');
  }
  const availablePlayerIndex = match.players.slice(1).findIndex(slot => !slot.name || !slot.isConnected);
  const availablePlayerID = availablePlayerIndex !== -1 ? String(availablePlayerIndex + 1) : null;

  if (availablePlayerID === null) {
    throw new Error('roomFull');
  }

  const joinData = await lobbyClient.joinMatch(RondaGame.name, targetMatchID, {
    playerID: availablePlayerID,
    playerName: nickname
  });
  return { joinData, availablePlayerID, playersCount: match.players.length };
};

// Helper to list open public rooms
const getPublicRoomsMatches = async () => {
  const resp = await lobbyClient.listMatches(RondaGame.name);
  if (resp && resp.matches) {
    return resp.matches.filter(m => {
      if (m.unlisted) return false;
      return m.players.slice(1).some(p => !p.name || !p.isConnected);
    });
  }
  return [];
};

const executeCreateRoom = async (opts) => {
  const { maxPlayers, isPrivate, testMode, nickname, setCredentials, setPlayerID, setMatchID, setMatchNumPlayers, setMode, setError, setIsCheckingRoom, t } = opts;
  if (!nickname.trim()) return setError(t('enterNameError'));
  setIsCheckingRoom(true);
  setError(null);
  try {
    const { realMatchID, joinData } = await createRoomMatch(maxPlayers, isPrivate, testMode, nickname);
    setCredentials(joinData.playerCredentials);
    setPlayerID('0');
    setMatchID(realMatchID);
    setMatchNumPlayers(maxPlayers);
    setMode('online');
    updateUrl(realMatchID);
  } catch {
    setError(t('createRoomError'));
  } finally {
    setIsCheckingRoom(false);
  }
};

const executeJoinRoom = async (opts) => {
  const { targetMatchID, nickname, setCredentials, setPlayerID, setMatchID, setMatchNumPlayers, setMode, setError, setIsCheckingRoom, t } = opts;
  if (!nickname.trim()) return setError(t('enterNameError'));
  setIsCheckingRoom(true);
  setError(null);
  try {
    const { joinData, availablePlayerID, playersCount } = await joinRoomMatch(targetMatchID, nickname);
    setCredentials(joinData.playerCredentials);
    setPlayerID(availablePlayerID);
    setMatchID(targetMatchID);
    setMatchNumPlayers(playersCount);
    setMode('online');
    updateUrl(targetMatchID);
  } catch (err) {
    setError(err.message === 'roomNotFound' ? t('roomNotFoundError') : (err.message === 'roomFull' ? t('roomFullError') : t('joinError')));
  } finally {
    setIsCheckingRoom(false);
  }
};

const executeFetchPublicRooms = async ({ setPublicRooms, setIsLoadingRooms, setError, t }) => {
  setIsLoadingRooms(true);
  setError(null);
  try {
    setPublicRooms(await getPublicRoomsMatches());
  } catch {
    setError(t('fetchRoomsError'));
  } finally {
    setIsLoadingRooms(false);
  }
};

export const useLobby = () => {
  const [mode, setMode] = useState(null); // 'bot', 'online', 'rules' or null
  const [testMode, setTestMode] = useState(false);
  const [playerID, setPlayerID] = useState('0');
  const [matchID, setMatchID] = useState(() => new URLSearchParams(window.location.search).get('room') || '');
  const [nickname, setNickname] = useState(() => localStorage.getItem('ronda_nickname') || '');
  const [multiplayerAction, setMultiplayerAction] = useState(null); // 'create' | 'join' | null
  const [isPrivate, setIsPrivate] = useState(false);
  const [maxPlayers, setMaxPlayers] = useState(2);
  const [matchNumPlayers, setMatchNumPlayers] = useState(2);
  const [joinMode, setJoinMode] = useState('public'); // 'public' | 'private'
  const [joinRoomId, setJoinRoomId] = useState('');
  const [publicRooms, setPublicRooms] = useState([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);
  const [gameKey, setGameKey] = useState(0);
  const [error, setError] = useState(null);
  const [credentials, setCredentials] = useState(null);
  const [isCheckingRoom, setIsCheckingRoom] = useState(false);
  
  const { t } = useLanguage();

  const handleCreateRoom = () => executeCreateRoom({
    maxPlayers, isPrivate, testMode, nickname, setCredentials, setPlayerID, setMatchID, setMatchNumPlayers, setMode, setError, setIsCheckingRoom, t
  });

  const handleJoinRoom = (targetMatchID) => executeJoinRoom({
    targetMatchID, nickname, setCredentials, setPlayerID, setMatchID, setMatchNumPlayers, setMode, setError, setIsCheckingRoom, t
  });

  const fetchPublicRooms = () => executeFetchPublicRooms({
    setPublicRooms, setIsLoadingRooms, setError, t
  });

  useLobbyListeners({
    mode, matchID, playerID, credentials, nickname,
    setCredentials, setPlayerID, setGameKey, setMode, setError, setTestMode, setMultiplayerAction, t
  });

  useEffect(() => {
    if (multiplayerAction === 'join' && joinMode === 'public') {
      fetchPublicRooms();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [multiplayerAction, joinMode]);

  useTestMatchSetup({ setMatchID, setPlayerID, setMatchNumPlayers, setMode, setTestMode, setMultiplayerAction, setJoinMode });

  return {
    mode, setMode, testMode, setTestMode, playerID, setPlayerID, matchID, setMatchID,
    nickname, setNickname, multiplayerAction, setMultiplayerAction, isPrivate, setIsPrivate,
    maxPlayers, setMaxPlayers, matchNumPlayers, setMatchNumPlayers, joinMode, setJoinMode,
    joinRoomId, setJoinRoomId, publicRooms, setPublicRooms, isLoadingRooms, setIsLoadingRooms,
    gameKey, setGameKey, error, setError, credentials, setCredentials, isCheckingRoom, setIsCheckingRoom,
    handleCreateRoom, handleJoinRoom, fetchPublicRooms
  };
};
