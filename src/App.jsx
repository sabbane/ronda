import { useState, useEffect, useRef } from 'react';

import { LobbyClient } from 'boardgame.io/dist/esm/client.js';
import { Client as ReactClient } from 'boardgame.io/dist/esm/react.js';
import { Local, SocketIO } from 'boardgame.io/dist/esm/multiplayer.js';
import { RondaGame } from './game/game';
import { RandomBot } from 'boardgame.io/dist/esm/ai.js';
import { RondaBoard } from './components/Board';

import { useLanguage } from './contexts/LanguageContext';
import { Rules } from './components/Rules';
import { Volume2, VolumeX, Music } from 'lucide-react';
import { useSound } from './contexts/SoundContext';



const MOROCCAN_NAMES = [
  'Casablanca', 'Marrakech', 'Fes', 'Tangier', 'Rabat', 'Agadir', 'Chefchaouen',
  'Essaouira', 'Merzouga', 'Ouarzazate', 'Meknes', 'Tetouan', 'Atlas', 'Sahara',
  'Rif', 'Maghreb', 'Medina', 'Kasbah', 'MintTea', 'Tajine', 'Couscous', 'Zellij', 'JemaaElFna'
];

const getRandomMoroccanName = () => {
  const name = MOROCCAN_NAMES[Math.floor(Math.random() * MOROCCAN_NAMES.length)];
  const num = Math.floor(Math.random() * 90) + 10;
  return `${name}-${num}`;
};

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
    ? 'http://127.0.0.1:8000'
    : `https://ronda-backend.up.railway.app`
);

const socketServerUrl = import.meta.env.VITE_SERVER_URL || (
  import.meta.env.DEV
    ? 'http://localhost:8000'
    : `https://ronda-backend.up.railway.app`
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
    return params.get('room') || getRandomMoroccanName();
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

  const modeRef = useRef(mode);
  const matchIDRef = useRef(matchID);
  const playerIDRef = useRef(playerID);
  const credentialsRef = useRef(credentials);
  const languageRef = useRef(language);
  const nicknameRef = useRef(nickname);

  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { matchIDRef.current = matchID; }, [matchID]);
  useEffect(() => { playerIDRef.current = playerID; }, [playerID]);
  useEffect(() => { credentialsRef.current = credentials; }, [credentials]);
  useEffect(() => { languageRef.current = language; }, [language]);
  useEffect(() => { nicknameRef.current = nickname; }, [nickname]);

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
      // Find the first available player slot starting from index 1
      let availablePlayerID = null;
      for (let i = 1; i < match.players.length; i++) {
        const slot = match.players[i];
        if (!slot.name || !slot.isConnected) {
          availablePlayerID = String(i);
          break;
        }
      }

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
          // A room is joinable if there is at least one free slot (index >= 1)
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
    const handleMenu = () => {
      const mode = modeRef.current;
      const matchID = matchIDRef.current;
      const playerID = playerIDRef.current;
      const credentials = credentialsRef.current;

      setMode(null);
      setError(null);
      setTestMode(false);
      setMultiplayerAction(null);
      setGameKey(prev => prev + 1);

      setTimeout(() => {
        if (mode === 'online' && matchID && playerID) {
          lobbyClient.leaveMatch(RondaGame.name, matchID, {
            playerID,
            credentials
          }).catch(err => console.error('Failed to leave match via lobbyClient:', err));
        }
        setCredentials(null);
      }, 100);

      try {
        const newUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
        window.history.replaceState({ path: newUrl }, '', newUrl);
      } catch { /* ignore */ }
    };

    const handleHostLeft = () => {
      const mode = modeRef.current;
      const matchID = matchIDRef.current;
      const playerID = playerIDRef.current;
      const credentials = credentialsRef.current;

      setMode(null);
      setTestMode(false);
      setMultiplayerAction(null);
      setGameKey(prev => prev + 1);
      setError(t('hostLeftError'));

      setTimeout(() => {
        if (mode === 'online' && matchID && playerID) {
          lobbyClient.leaveMatch(RondaGame.name, matchID, {
            playerID,
            credentials
          }).catch(err => console.error('Failed to leave match as guest:', err));
        }
        setCredentials(null);
      }, 100);

      try {
        const newUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
        window.history.replaceState({ path: newUrl }, '', newUrl);
      } catch { /* ignore */ }
    };

    window.addEventListener('ronda-reset', handleReset);
    window.addEventListener('ronda-menu', handleMenu);
    window.addEventListener('ronda-host-left', handleHostLeft);

    const handleSwitchSeat = async (event) => {
      const newPlayerID = event.detail?.newPlayerID;
      if (!newPlayerID) return;

      const currentMode = modeRef.current;
      const currentMatchID = matchIDRef.current;
      const currentPlayerID = playerIDRef.current;
      const currentCredentials = credentialsRef.current;
      const currentNickname = nicknameRef.current || 'Spieler';

      console.log('[App] handleSwitchSeat requested:', currentPlayerID, '->', newPlayerID);

      try {
        // 1. Leave the old slot if we have one
        if (currentMode === 'online' && currentMatchID && currentPlayerID) {
          await lobbyClient.leaveMatch(RondaGame.name, currentMatchID, {
            playerID: currentPlayerID,
            credentials: currentCredentials
          }).catch(err => console.error('Failed to leave old seat during switch:', err));
        }

        // 2. Join the new slot
        const joinData = await lobbyClient.joinMatch(RondaGame.name, currentMatchID, {
          playerID: newPlayerID,
          playerName: currentNickname
        });

        // 3. Update state
        setCredentials(joinData.playerCredentials);
        setPlayerID(newPlayerID);
        setGameKey(prev => prev + 1); // Clean remount of the board client
        console.log('[App] handleSwitchSeat completed successfully. Switched to slot:', newPlayerID);
      } catch (err) {
        console.error('[App] Failed to switch seat:', err);
        setError(t('joinError') || 'Fehler beim Sitzplatzwechsel');
      }
    };

    window.addEventListener('ronda-switch-seat', handleSwitchSeat);

    const isAppInTestMode = import.meta.env.VITE_TEST_MODE === 'true';
    const path = window.location.pathname;
    console.log('[App] mount: pathname:', path, 'isAppInTestMode:', isAppInTestMode);
    const BACKEND = restServerUrl;

    const setupTestMatch = async (pID) => {
      try {
        let matchID;

        if (pID === '0') {
          const resp = await fetch(`${BACKEND}/test/reset`, { method: 'POST' });
          const data = await resp.json();
          if (!data.ok || !data.matchID) throw new Error('Server could not create test match');
          matchID = data.matchID;
          console.log('[TestMode] P1: fresh test match created:', matchID);
        } else {
          let attempts = 0;
          while (attempts < 20) {
            try {
              const resp = await fetch(`${BACKEND}/test/match-id`);
              if (resp.ok) {
                const data = await resp.json();
                if (data.ok && data.matchID) { matchID = data.matchID; break; }
              }
            } catch { /* ignore */ }
            await new Promise(r => setTimeout(r, 500));
            attempts++;
          }
          if (!matchID) throw new Error('P2 could not find a test match. Open /test/p1 first.');
          console.log('[TestMode] P2: joining existing match:', matchID);
        }

        setMatchID(matchID);
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
    }

    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam && !isAppInTestMode) {
      setMatchID(roomParam);
      setMultiplayerAction('join');
      setJoinMode('private');
    }

    return () => {
      window.removeEventListener('ronda-reset', handleReset);
      window.removeEventListener('ronda-menu', handleMenu);
      window.removeEventListener('ronda-host-left', handleHostLeft);
      window.removeEventListener('ronda-switch-seat', handleSwitchSeat);
    };
  }, []);


  if (mode === 'rules') {
    return <Rules onBack={() => {
      setMode(null);
      setError(null);
    }} />;
  }

  if (!mode) {
    return (
      <div className="min-h-screen flex flex-col items-center text-white bg-blue-600 bg-opacity-70 relative overflow-hidden overflow-y-auto">
        {/* Background removed */}
        {/* Title moved inside card */}
        <div className="flex-1 flex flex-col w-full items-center justify-center p-4 z-30 pt-4 pb-8 menu-container">
          <div className="p-8 rounded-3xl shadow-[0_0_60px_rgba(30,58,138,0.35)] border-2 border-amber-400/30 text-center max-w-lg w-full relative menu-card" style={{backgroundColor: 'rgba(30, 58, 138, 0.7)'}}>
            <h1 className="text-7xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-rose-500 tracking-tighter drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] menu-logo">{t('logo')}</h1>

             {/* Language & Sound Selector in Center */}
            <div className="flex flex-col items-center gap-3 mb-8 menu-selectors" dir="ltr">
              {/* Language Selector row */}
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => { playClick(); changeLanguage('en'); }}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 ${language === 'en' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.5)] border-amber-400/50' : 'bg-white/10 text-slate-300 hover:bg-white/20'} backdrop-blur-md transition-all border border-white/10 cursor-pointer`}
                >
                  <img src="https://flagcdn.com/w40/gb.png" alt="EN" className="w-4 h-3 object-cover rounded-sm" /> EN
                </button>
                <button
                  onClick={() => { playClick(); changeLanguage('fr'); }}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 ${language === 'fr' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.5)] border-amber-400/50' : 'bg-white/10 text-slate-300 hover:bg-white/20'} backdrop-blur-md transition-all border border-white/10 cursor-pointer`}
                >
                  <img src="https://flagcdn.com/w40/fr.png" alt="FR" className="w-4 h-3 object-cover rounded-sm" /> FR
                </button>
                <button
                  onClick={() => { playClick(); changeLanguage('ar'); }}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 ${language === 'ar' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.5)] border-amber-400/50' : 'bg-white/10 text-slate-300 hover:bg-white/20'} backdrop-blur-md transition-all border border-white/10 cursor-pointer`}
                >
                  <img src="https://flagcdn.com/w40/ma.png" alt="AR" className="w-4 h-3 object-cover rounded-sm" /> AR
                </button>
              </div>

              {/* Music and Mute controls row */}
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => { playClick(); nextTrack(); }}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 bg-white/10 text-slate-300 hover:bg-white/20 backdrop-blur-md transition-all border border-white/10 cursor-pointer`}
                  title={tracks && tracks[currentTrack] ? `Track wechseln: ${tracks[currentTrack].name}` : "Track wechseln"}
                >
                  <Music size={14} className="text-amber-400 animate-pulse" />
                  <span>{tracks && tracks[currentTrack] ? tracks[currentTrack].name : "Musik"}</span>
                </button>
                <button
                  onClick={toggleMute}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 bg-white/10 text-slate-300 hover:bg-white/20 backdrop-blur-md transition-all border border-white/10 cursor-pointer`}
                  title={isMuted ? "Unmute Sound" : "Mute Sound"}
                >
                  {isMuted ? <VolumeX size={14} className="text-red-400" /> : <Volume2 size={14} className="text-emerald-400" />}
                  <span>{isMuted ? "Muted" : "Sound"}</span>
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-6 menu-sections">
              {multiplayerAction === null ? (
                <>
                  {/* Singleplayer Box */}
                  <div className="bg-black/30 p-6 rounded-2xl border border-emerald-500/10 menu-box backdrop-blur-sm">
                    <h2 className="text-sm font-extrabold mb-4 text-amber-200/90 uppercase tracking-widest">{t('singleplayer')}</h2>
                    <button
                      onClick={() => { playClick(); setMode('bot'); }}
                      className="w-full bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 px-6 py-4 rounded-xl font-bold transition-all transform hover:scale-[1.02] active:scale-[0.98] text-lg shadow-[0_0_25px_rgba(244,63,94,0.35)] cursor-pointer menu-btn-large border border-rose-400/20"
                    >
                      {t('playVsBot')}
                    </button>
                  </div>

                  {/* Online Multiplayer Box */}
                  <div className="bg-black/30 p-6 rounded-2xl border border-emerald-500/10 menu-box backdrop-blur-sm">
                    <h2 className="text-sm font-extrabold mb-4 text-amber-200/90 uppercase tracking-widest">{t('onlineMultiplayer')}</h2>
                    <div className="flex flex-col gap-3">
                      <button
                        onClick={() => { playClick(); setMultiplayerAction('create'); }}
                        className="w-full bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 px-5 py-3.5 rounded-xl font-bold transition-all transform hover:scale-[1.01] active:scale-[0.99] text-base shadow-[0_0_20px_rgba(14,165,233,0.35)] cursor-pointer menu-btn-medium border border-sky-400/20"
                      >
                        {t('createRoom')}
                      </button>
                      <button
                        onClick={() => { playClick(); setMultiplayerAction('join'); }}
                        className="w-full bg-slate-900/50 hover:bg-slate-950/60 px-5 py-3.5 rounded-xl font-bold transition-all transform hover:scale-[1.01] active:scale-[0.99] text-base border border-sky-500/25 text-sky-200 hover:text-white cursor-pointer menu-btn-medium"
                      >
                        {t('joinRoom')}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                /* Dynamic Merged Panel for Room Creation / Joining */
                <div className="border-2 border-amber-400/30 p-6 rounded-3xl shadow-2xl relative text-left menu-subpanel" style={{backgroundColor: 'rgba(30, 58, 138, 0.7)'}}>
                  <h2 className="text-2xl font-extrabold mb-6 text-amber-300 border-b border-white/10 pb-3 flex justify-between items-center">
                    <span>
                      {multiplayerAction === 'create' ? t('createRoom') : t('joinRoom')}
                    </span>
                    <span className="text-xs font-mono text-slate-500 uppercase tracking-wider bg-slate-950/60 px-2.5 py-1 rounded-md border border-white/5">
                      Multiplayer
                    </span>
                  </h2>

                  {error && (
                    <div className="bg-red-500/10 border border-red-500/40 text-red-200 px-4 py-3 rounded-xl text-xs font-medium mb-5 animate-pulse">
                      {error}
                    </div>
                  )}

                  {multiplayerAction === 'create' ? (
                    /* CREATE ROOM VIEW */
                    <div className="flex flex-col gap-4">
                      {/* Name input */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">{t('yourNickname')}</label>
                        <input
                          type="text"
                          value={nickname}
                          maxLength={15}
                          onChange={e => setNickname(e.target.value)}
                          className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-medium focus:outline-none focus:border-amber-500/50 transition-colors"
                          placeholder={t('enterNickname')}
                        />
                      </div>


                      {/* Room Privacy Choice */}
                      <div className="flex flex-col gap-1.5 mt-1">
                        <label className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">{t('roomPrivacy')}</label>
                        <div className="grid grid-cols-2 gap-2 bg-black/40 p-1 rounded-xl border border-white/5">
                          <button
                            type="button"
                            onClick={() => { playClick(); setIsPrivate(false); }}
                            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${!isPrivate ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md border border-amber-400/30' : 'text-slate-400 hover:text-white'}`}
                          >
                            {t('public')}
                          </button>
                          <button
                            type="button"
                            onClick={() => { playClick(); setIsPrivate(true); }}
                            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${isPrivate ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md border border-amber-400/30' : 'text-slate-400 hover:text-white'}`}
                          >
                            {t('private')}
                          </button>
                        </div>
                      </div>

                      {/* Player Count Choice */}
                      <div className="flex flex-col gap-1.5 mt-1">
                        <label className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">
                          {language === 'de' ? 'Spieleranzahl' : language === 'fr' ? 'Nombre de Joueurs' : language === 'ar' ? 'عدد اللاعبين' : 'Player Count'}
                        </label>
                        <div className="grid grid-cols-2 gap-2 bg-black/40 p-1 rounded-xl border border-white/5">
                          <button
                            type="button"
                            onClick={() => { playClick(); setMaxPlayers(2); }}
                            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${maxPlayers === 2 ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md border border-amber-400/30' : 'text-slate-400 hover:text-white'}`}
                          >
                            2 {language === 'de' ? 'Spieler' : language === 'fr' ? 'Joueurs' : language === 'ar' ? 'لاعبين' : 'Players'}
                          </button>
                          <button
                            type="button"
                            onClick={() => { playClick(); setMaxPlayers(4); }}
                            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${maxPlayers === 4 ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md border border-amber-400/30' : 'text-slate-400 hover:text-white'}`}
                          >
                            4 {language === 'de' ? 'Spieler (Team)' : language === 'fr' ? 'Joueurs (Équipe)' : language === 'ar' ? 'لاعبين (فريق)' : 'Players (Team)'}
                          </button>
                        </div>
                      </div>

                      {/* Create and Cancel buttons */}
                      <div className="flex gap-3 mt-4 border-t border-white/5 pt-4">
                        <button
                          onClick={() => { playClick(); setMultiplayerAction(null); setError(null); }}
                          className="flex-1 bg-slate-900/40 hover:bg-slate-900/60 px-4 py-3 rounded-xl font-bold transition-all text-sm border border-emerald-500/20 text-slate-300 text-center cursor-pointer"
                        >
                          {t('cancel')}
                        </button>
                        <button
                          disabled={isCheckingRoom}
                          onClick={() => { playClick(); handleCreateRoom(); }}
                          className="flex-1 bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 disabled:opacity-50 px-4 py-3 rounded-xl font-bold transition-all shadow-lg shadow-rose-900/30 text-sm text-center cursor-pointer border border-rose-400/20"
                        >
                          {isCheckingRoom ? '...' : t('create')}
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* JOIN ROOM VIEW */
                    <div className="flex flex-col gap-4">
                      {/* Name input */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">{t('yourNickname')}</label>
                        <input
                          type="text"
                          value={nickname}
                          maxLength={15}
                          onChange={e => setNickname(e.target.value)}
                          className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-medium focus:outline-none focus:border-amber-500/50 transition-colors"
                          placeholder={t('enterNickname')}
                        />
                      </div>

                      {/* Join mode tabs */}
                      <div className="grid grid-cols-2 gap-2 bg-black/40 p-1 rounded-xl border border-white/5 mt-1">
                        <button
                          type="button"
                          onClick={() => { playClick(); setJoinMode('public'); }}
                          className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${joinMode === 'public' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md border border-amber-400/30' : 'text-slate-400 hover:text-white'}`}
                        >
                          {t('publicRooms')}
                        </button>
                        <button
                          type="button"
                          onClick={() => { playClick(); setJoinMode('private'); }}
                          className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${joinMode === 'private' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md border border-amber-400/30' : 'text-slate-400 hover:text-white'}`}
                        >
                          {t('privateRoom')}
                        </button>
                      </div>

                      {joinMode === 'public' ? (
                        /* PUBLIC ROOMS BROWSER */
                        <div className="flex flex-col gap-2 mt-2">
                          <div className="flex justify-between items-center mb-1">
                            <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">{t('openRooms')}</label>
                            <button
                              onClick={() => { playClick(); fetchPublicRooms(); }}
                              className="text-[10px] text-amber-400/80 hover:text-amber-300 font-semibold uppercase tracking-wider cursor-pointer"
                            >
                              {t('refresh')}
                            </button>
                          </div>

                          {isLoadingRooms ? (
                            <div className="py-8 text-center text-slate-400 text-sm animate-pulse flex items-center justify-center gap-2 bg-black/20 rounded-xl border border-white/5">
                              <span className="w-4 h-4 rounded-full border-2 border-t-amber-400 border-white/10 animate-spin"></span>
                              {t('searchingRooms')}
                            </div>
                          ) : publicRooms.length === 0 ? (
                            <div className="py-8 text-center text-slate-500 text-sm bg-black/20 rounded-xl border border-white/5 px-4">
                              {t('noRoomsFound')}
                            </div>
                          ) : (
                            <div className="max-h-[160px] overflow-y-auto flex flex-col gap-2 pr-1 custom-scrollbar menu-rooms-list">
                              {publicRooms.map(room => {
                                const hostPlayer = room.players[0];
                                const hostName = hostPlayer ? (hostPlayer.name || 'Host') : 'Host';
                                return (
                                  <div
                                    key={room.matchID}
                                    className="flex justify-between items-center p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-all"
                                  >
                                    <div className="flex flex-col">
                                      <span className="text-xs font-mono font-bold text-amber-200">{room.matchID}</span>
                                      <span className="text-[10px] text-slate-400 mt-0.5">Host: {hostName}</span>
                                    </div>
                                    <button
                                      onClick={() => { playClick(); handleJoinRoom(room.matchID); }}
                                      className="px-3.5 py-1.5 bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white rounded-lg text-xs font-bold shadow-md border border-rose-400/20 transition-all active:scale-95 cursor-pointer"
                                    >
                                      {t('join')}
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ) : (
                        /* PRIVATE ROOM JOIN INPUT */
                        <div className="flex flex-col gap-1.5 mt-2">
                          <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">{t('matchId')}</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={joinRoomId}
                              onChange={e => setJoinRoomId(e.target.value)}
                              className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-mono focus:outline-none focus:border-amber-500/50 transition-colors"
                              placeholder={t('enterRoomId')}
                              required
                            />
                            <button
                              disabled={isCheckingRoom || !joinRoomId.trim()}
                              onClick={() => { playClick(); handleJoinRoom(joinRoomId.trim()); }}
                              className="bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 disabled:opacity-50 px-5 py-3 rounded-xl font-bold transition-all shadow-md border border-rose-400/20 text-sm cursor-pointer"
                            >
                              {isCheckingRoom ? '...' : t('join')}
                            </button>
                          </div>
                        </div>

                      )}

                      {/* Cancel button */}
                      <div className="flex mt-4 border-t border-white/5 pt-4">
                        <button
                          onClick={() => { playClick(); setMultiplayerAction(null); setError(null); }}
                          className="w-full bg-slate-900/40 hover:bg-slate-900/60 px-4 py-3 rounded-xl font-bold transition-all text-sm border border-emerald-500/20 text-slate-300 text-center cursor-pointer"
                        >
                          {t('back')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Rules and Contact Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 menu-footer-row">
                <button
                  onClick={() => { playClick(); setMode('rules'); }}
                  className="flex-1 bg-blue-900/40 hover:bg-blue-800/60 p-4 rounded-2xl font-bold transition-all border border-blue-800/30 flex items-center justify-center gap-2 text-blue-200 hover:text-white cursor-pointer menu-footer-btn shadow-[0_0_10px_rgba(30,58,138,0.2)]"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
                  {t('rulesBtn')}
                </button>
              </div>
            </div>
          </div>

          {/* Version - TRULY OUTSIDE the box */}
          <div className="flex flex-col items-center gap-4 mt-6 z-30 menu-version">
            <span className="text-[10px] text-slate-500 font-medium tracking-widest uppercase opacity-50">
              v{import.meta.env.VITE_APP_VERSION}
            </span>
          </div>
        </div>


      </div>
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
