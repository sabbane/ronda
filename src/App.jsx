import { useState, useEffect } from 'react';

import { LobbyClient } from 'boardgame.io/dist/esm/client.js';
import { Client as ReactClient } from 'boardgame.io/dist/esm/react.js';
import { Local, SocketIO } from 'boardgame.io/dist/esm/multiplayer.js';
import { RondaGame } from './game/game';
import { RandomBot } from 'boardgame.io/dist/esm/ai.js';
import { RondaBoard } from './components/Board';

import { useLanguage } from './contexts/LanguageContext';
import { Rules } from './components/Rules';
import { useSound } from './contexts/SoundContext';
import { MainMenu } from './components/MainMenu';

const RondaClientBot = ReactClient({
  game: RondaGame,
  board: RondaBoard,
  numPlayers: 2,
  multiplayer: Local({
    bots: {
      '1': class extends RandomBot {
        constructor(opts) {
          super({
            enumerate: RondaGame.ai.enumerate,
            ...opts
          });
        }
      }
    },
    botDelay: 2800
  }),
});

const restServerUrl = import.meta.env.VITE_SERVER_URL || (
  import.meta.env.DEV
    ? 'http://127.0.0.1:8000' // aislop-ignore-line
    : `https://ronda-backend.up.railway.app` // aislop-ignore-line
);

const socketServerUrl = import.meta.env.VITE_SERVER_URL || (
  import.meta.env.DEV
    ? 'http://localhost:8000' // aislop-ignore-line
    : `https://ronda-backend.up.railway.app` // aislop-ignore-line
);

const lobbyClient = new LobbyClient({ server: restServerUrl });

const RondaClientOnline2 = ReactClient({
  game: RondaGame,
  board: RondaBoard,
  numPlayers: 2,
  multiplayer: SocketIO({ server: socketServerUrl }),
});

const RondaClientOnline4 = ReactClient({
  game: RondaGame,
  board: RondaBoard,
  numPlayers: 4,
  multiplayer: SocketIO({ server: socketServerUrl }),
});

const App = () => {
  const [mode, setMode] = useState(null); // 'bot' or 'online'
  const [testMode, setTestMode] = useState(false);
  const [playerID, setPlayerID] = useState('0');
  const [matchID, setMatchID] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('room') || '';
  });
  const [nickname, setNickname] = useState(() => {
    return localStorage.getItem('ronda_nickname') || '';
  });
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
  
  const { language, changeLanguage, t } = useLanguage();
  const { isMuted, toggleMute, playClick, currentTrack, tracks, nextTrack } = useSound();
  const updateUrl = (id) => {
    try {
      const newUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?room=${id}`;
      window.history.replaceState({ path: newUrl }, '', newUrl);
    } catch {
      // Ignore errors in sandboxed iframes (like PlayGama)
    }
  };

  const handleCreateRoom = async () => {
    if (!nickname.trim()) {
      setError(t('enterNameError'));
      return;
    }
    setIsCheckingRoom(true);
    setError(null);
    try {
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
      setCredentials(joinData.playerCredentials);
      setPlayerID('0');
      setMatchID(realMatchID);
      setMatchNumPlayers(maxPlayers);
      setMode('online');
      updateUrl(realMatchID);
    } catch (err) {
      console.error('Failed to create match:', err);
      setError(t('createRoomError'));
    } finally {
      setIsCheckingRoom(false);
    }
  };

  const handleJoinRoom = async (targetMatchID) => {
    console.log('[App] handleJoinRoom called: targetMatchID:', targetMatchID, 'nickname:', nickname);
    if (!nickname.trim()) {
      setError(t('enterNameError'));
      return;
    }
    setIsCheckingRoom(true);
    setError(null);
    try {
      localStorage.setItem('ronda_nickname', nickname);
      const match = await lobbyClient.getMatch(RondaGame.name, targetMatchID);
      if (!match) {
        setError(t('roomNotFoundError'));
        setIsCheckingRoom(false);
        return;
      }
      const availablePlayerIndex = match.players.slice(1).findIndex(slot => !slot.name || !slot.isConnected);
      const availablePlayerID = availablePlayerIndex !== -1 ? String(availablePlayerIndex + 1) : null;

      if (availablePlayerID === null) {
        setError(t('roomFullError'));
        setIsCheckingRoom(false);
        return;
      }

      const joinData = await lobbyClient.joinMatch(RondaGame.name, targetMatchID, {
        playerID: availablePlayerID,
        playerName: nickname
      });
      setCredentials(joinData.playerCredentials);
      setPlayerID(availablePlayerID);
      setMatchID(targetMatchID);
      setMatchNumPlayers(match.players.length);
      setMode('online');
      updateUrl(targetMatchID);
    } catch (err) {
      console.error('Failed to join match:', err);
      setError(t('joinError'));
    } finally {
      setIsCheckingRoom(false);
    }
  };

  const fetchPublicRooms = async () => {
    setIsLoadingRooms(true);
    setError(null);
    try {
      const resp = await lobbyClient.listMatches(RondaGame.name);
      if (resp && resp.matches) {
        const openMatches = resp.matches.filter(m => {
          if (m.unlisted) return false;
          const isSlotAvailable = m.players.slice(1).some(p => !p.name || !p.isConnected);
          return isSlotAvailable;
        });
        setPublicRooms(openMatches);
      }
    } catch (err) {
      console.error('Failed to list matches:', err);
      setError(t('fetchRoomsError'));
    } finally {
      setIsLoadingRooms(false);
    }
  };

  useEffect(() => {
    if (multiplayerAction === 'join' && joinMode === 'public') {
      fetchPublicRooms();
    }
  }, [multiplayerAction, joinMode]);

  useEffect(() => {
    const handleReset = () => setGameKey(prev => prev + 1);
    window.addEventListener('ronda-reset', handleReset);
    return () => window.removeEventListener('ronda-reset', handleReset);
  }, []);

  useEffect(() => {
    const handleMenu = () => {
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
    };

    window.addEventListener('ronda-menu', handleMenu);
    return () => window.removeEventListener('ronda-menu', handleMenu);
  }, [mode, matchID, playerID, credentials]);

  useEffect(() => {
    const handleHostLeft = () => {
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
    };

    window.addEventListener('ronda-host-left', handleHostLeft);
    return () => window.removeEventListener('ronda-host-left', handleHostLeft);
  }, [mode, matchID, playerID, credentials, t]);

  useEffect(() => {
    const handleSwitchSeat = async (event) => {
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
    };

    window.addEventListener('ronda-switch-seat', handleSwitchSeat);
    return () => window.removeEventListener('ronda-switch-seat', handleSwitchSeat);
  }, [mode, matchID, playerID, credentials, nickname, t]);

  useEffect(() => {
    const isAppInTestMode = import.meta.env.VITE_TEST_MODE === 'true';
    const path = window.location.pathname;

    const setupTestMatch = async (pID) => {
      try {
        let testMatchID;
        if (pID === '0') {
          const resp = await fetch(`${restServerUrl}/test/reset`, { method: 'POST' });
          const data = await resp.json();
          if (!data.ok || !data.matchID) throw new Error('Server could not create test match');
          testMatchID = data.matchID;
          console.log('[TestMode] P1: fresh test match created:', testMatchID);
        } else {
          let attempts = 0;
          while (attempts < 20) {
            try {
              const resp = await fetch(`${restServerUrl}/test/match-id`);
              if (resp.ok) {
                const data = await resp.json();
                if (data.ok && data.matchID) { testMatchID = data.matchID; break; }
              }
            } catch { /* ignore */ }
            await new Promise(r => setTimeout(r, 500));
            attempts++;
          }
          if (!testMatchID) throw new Error('P2 could not find a test match. Open /test/p1 first.');
          console.log('[TestMode] P2: joining existing match:', testMatchID);
        }

        setMatchID(testMatchID);
        setPlayerID(pID);
        setMatchNumPlayers(2);
        setMode('online');
        setTestMode(true);
      } catch (err) {
        console.error('[TestMode] Setup error:', err);
      }
    };

    if (isAppInTestMode) {
      if (path === '/test/p1') {
        setupTestMatch('0');
      } else if (path === '/test/p2') {
        setupTestMatch('1');
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
  }, []);

  if (mode === 'rules') {
    return <Rules onBack={() => {
      setMode(null);
      setError(null);
    }} />;
  }

  if (!mode) {
    return (
      <MainMenu
        language={language}
        changeLanguage={changeLanguage}
        t={t}
        isMuted={isMuted}
        toggleMute={toggleMute}
        playClick={playClick}
        currentTrack={currentTrack}
        tracks={tracks}
        nextTrack={nextTrack}
        nickname={nickname}
        setNickname={setNickname}
        multiplayerAction={multiplayerAction}
        setMultiplayerAction={setMultiplayerAction}
        isPrivate={isPrivate}
        setIsPrivate={setIsPrivate}
        maxPlayers={maxPlayers}
        setMaxPlayers={setMaxPlayers}
        joinMode={joinMode}
        setJoinMode={setJoinMode}
        joinRoomId={joinRoomId}
        setJoinRoomId={setJoinRoomId}
        publicRooms={publicRooms}
        fetchPublicRooms={fetchPublicRooms}
        isLoadingRooms={isLoadingRooms}
        error={error}
        setError={setError}
        isCheckingRoom={isCheckingRoom}
        handleCreateRoom={handleCreateRoom}
        handleJoinRoom={handleJoinRoom}
        setMode={setMode}
      />
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {mode === 'bot' && (
        <RondaClientBot
          key={`bot-${gameKey}`}
          matchID={`bot-room-${gameKey}`}
          playerID="0"
          setupData={{ testMode, gameStarted: true }}
        />
      )}
      {mode === 'online' && (credentials || testMode) && (
        matchNumPlayers === 4 ? (
          <RondaClientOnline4
            key={`online-${gameKey}`}
            matchID={matchID}
            playerID={playerID}
            credentials={credentials}
            setupData={{ testMode, gameStarted: false }}
          />
        ) : (
          <RondaClientOnline2
            key={`online-${gameKey}`}
            matchID={matchID}
            playerID={playerID}
            credentials={credentials}
            setupData={{ testMode, gameStarted: false }}
          />
        )
      )}
    </div>
  );
};

export default App;
