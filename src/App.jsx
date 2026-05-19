import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LobbyClient } from 'boardgame.io/dist/esm/client.js';
import { Client as ReactClient } from 'boardgame.io/dist/esm/react.js';
import { Local, SocketIO } from 'boardgame.io/dist/esm/multiplayer.js';
import { RondaGame } from './game/game';
import { RandomBot } from 'boardgame.io/dist/esm/ai.js';
import { RondaBoard } from './components/Board';

import { useLanguage } from './contexts/LanguageContext';
import { Rules } from './components/Rules';

const LoadingScreen = () => {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
      <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-6"></div>
      <h2 className="text-2xl font-bold text-amber-200 mb-2">{t('connecting') || 'Connecting...'}</h2>
      <p className="text-slate-400 mb-8 max-w-xs">{t('connectingDetail') || 'Waiting for the game server to respond.'}</p>
      <button
        onClick={() => window.dispatchEvent(new CustomEvent('ronda-menu'))}
        className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full text-sm font-medium transition-colors border border-slate-700"
      >
        {t('backToMenu') || 'Back to Menu'}
      </button>
    </div>
  );
};

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

const serverUrl = import.meta.env.VITE_SERVER_URL || (
  import.meta.env.DEV
    ? 'http://localhost:8000'
    : `${window.location.protocol}//ronda-backend.up.railway.app`
);

const lobbyClient = new LobbyClient({ server: serverUrl });

const RondaClientOnline = ReactClient({
  game: RondaGame,
  board: RondaBoard,
  numPlayers: 2,
  multiplayer: SocketIO({ server: serverUrl }),
});



const App = () => {
  const getRoomFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get('room') || getRandomMoroccanName();
  };

  const [mode, setMode] = useState(null); // 'bot' or 'online'
  const [testMode, setTestMode] = useState(false);
  const [playerID, setPlayerID] = useState('0');
  const [matchID, setMatchID] = useState(getRoomFromUrl);
  const [gameKey, setGameKey] = useState(0);
  const [error, setError] = useState(null);
  const [isCheckingRoom, setIsCheckingRoom] = useState(false);
  const { language, changeLanguage, t } = useLanguage();

  const updateUrl = (id) => {
    const newUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?room=${id}`;
    window.history.replaceState({ path: newUrl }, '', newUrl);
  };

  const handleOnlineAction = async (targetPlayerID) => {
    setIsCheckingRoom(true);
    setError(null);
    try {
      // Fetch current match state from server
      const match = await lobbyClient.getMatch(RondaGame.name, matchID);
      
      if (match) {
        // Match exists, check if the slot we want is taken
        const pID = parseInt(targetPlayerID);
        const player = match.players[pID];
        
        // A slot is taken if it has a name or is explicitly marked as connected
        const isSlotTaken = !!(player.name || player.isConnected);
        
        if (isSlotTaken) {
          if (targetPlayerID === '0') {
            setError(t('roomOccupied'));
          } else {
            setError(t('roomFull'));
          }
          setIsCheckingRoom(false);
          return;
        }
      }
      
      if (!match) {
        if (targetPlayerID === '0') {
          // Create match if hosting and doesn't exist
          await lobbyClient.createMatch(RondaGame.name, {
            numPlayers: 2,
            unlisted: false,
            setupData: { testMode },
            matchID: matchID
          });
        } else {
          // Trying to join a non-existent room
          setError("Room not found. Host a game first!");
          setIsCheckingRoom(false);
          return;
        }
      }
      
      setPlayerID(targetPlayerID);
      setMode('online');
    } catch (err) {
      console.error('Room check error:', err);
      // If error is 404 (not found), that's fine for hosting
      if (targetPlayerID === '0') {
        try {
          await lobbyClient.createMatch(RondaGame.name, {
            numPlayers: 2,
            unlisted: false,
            setupData: { testMode },
            matchID: matchID
          });
          setPlayerID('0');
          setMode('online');
        } catch (createErr) {
          console.error('Create match error:', createErr);
          setError("Failed to create room. Is the server running?");
        }
      } else {
        setError("Room not found. Host a game first!");
      }
    } finally {
      setIsCheckingRoom(false);
    }
  };

  useEffect(() => {
    const handleReset = () => setGameKey(prev => prev + 1);
    const handleMenu = () => {
      setMode(null);
      setError(null);
      setTestMode(false);
      setGameKey(prev => prev + 1);
    };
    window.addEventListener('ronda-reset', handleReset);
    window.addEventListener('ronda-menu', handleMenu);

    const isAppInTestMode = import.meta.env.VITE_TEST_MODE === 'true';
    const params = new URLSearchParams(window.location.search);
    const path = window.location.pathname;

    const BACKEND = serverUrl;

    const setupTestMatch = async (pID) => {
      try {
        let matchID;

        if (pID === '0') {
          // P1 (host): create a fresh test match via our custom endpoint.
          // This guarantees the rigged deck is applied (setupData.testMode=true).
          const resp = await fetch(`${BACKEND}/test/reset`, { method: 'POST' });
          const data = await resp.json();
          if (!data.ok || !data.matchID) throw new Error('Server could not create test match');
          matchID = data.matchID;
          console.log('[TestMode] P1: fresh test match created:', matchID);
        } else {
          // P2 (guest): poll the server for the match ID that P1 already created.
          let attempts = 0;
          while (attempts < 20) {
            try {
              const resp = await fetch(`${BACKEND}/test/match-id`);
              if (resp.ok) {
                const data = await resp.json();
                if (data.ok && data.matchID) { matchID = data.matchID; break; }
              }
            } catch (_) {}
            await new Promise(r => setTimeout(r, 500));
            attempts++;
          }
          if (!matchID) throw new Error('P2 could not find a test match. Open /test/p1 first.');
          console.log('[TestMode] P2: joining existing match:', matchID);
        }

        setMatchID(matchID);
        setPlayerID(pID);
        setMode('online');
        setTestMode(true);
      } catch (err) {
        console.error('[TestMode] Setup error:', err);
      }
    };

    // Test routes are only active when the app is explicitly started in test mode
    if (isAppInTestMode) {
      if (path === '/test/p1') {
        setupTestMatch('0');
      } else if (path === '/test/p2') {
        setupTestMatch('1');
      }
    }

    // If URL has a room, set it
    const room = params.get('room');
    if (room) {
      setMatchID(room);
    }

    return () => {
      window.removeEventListener('ronda-reset', handleReset);
      window.removeEventListener('ronda-menu', handleMenu);
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
      <div className="min-h-screen flex flex-col items-center text-white relative overflow-hidden overflow-y-auto">
        {/* Background Image with Moroccan Vibe */}
        <div
          className="fixed inset-0 z-0 scale-105"
          style={{
            backgroundImage: "url('/assets/moroccan_background.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(0.4) saturate(1.1)'
          }}
        />

        <div className="flex-1 flex flex-col w-full items-center justify-center p-4 z-30 pt-12 pb-8">
          <div className="bg-slate-900/80 backdrop-blur-xl p-8 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 text-center max-w-md w-full relative">


            {/* Language Selector in Center */}
            <div className="flex justify-center gap-2 mb-8" dir="ltr">
              <button
                onClick={() => changeLanguage('en')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 ${language === 'en' ? 'bg-amber-600 text-white shadow-[0_0_15px_rgba(217,119,6,0.5)]' : 'bg-white/10 text-slate-300 hover:bg-white/20'} backdrop-blur-md transition-all border border-white/10`}
              >
                <img src="https://flagcdn.com/w40/gb.png" alt="EN" className="w-4 h-3 object-cover rounded-sm" /> EN
              </button>
              <button
                onClick={() => changeLanguage('de')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 ${language === 'de' ? 'bg-amber-600 text-white shadow-[0_0_15px_rgba(217,119,6,0.5)]' : 'bg-white/10 text-slate-300 hover:bg-white/20'} backdrop-blur-md transition-all border border-white/10`}
              >
                <img src="https://flagcdn.com/w40/de.png" alt="DE" className="w-4 h-3 object-cover rounded-sm" /> DE
              </button>
              <button
                onClick={() => changeLanguage('fr')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 ${language === 'fr' ? 'bg-amber-600 text-white shadow-[0_0_15px_rgba(217,119,6,0.5)]' : 'bg-white/10 text-slate-300 hover:bg-white/20'} backdrop-blur-md transition-all border border-white/10`}
              >
                <img src="https://flagcdn.com/w40/fr.png" alt="FR" className="w-4 h-3 object-cover rounded-sm" /> FR
              </button>
              <button
                onClick={() => changeLanguage('ar')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 ${language === 'ar' ? 'bg-amber-600 text-white shadow-[0_0_15px_rgba(217,119,6,0.5)]' : 'bg-white/10 text-slate-300 hover:bg-white/20'} backdrop-blur-md transition-all border border-white/10`}
              >
                <img src="https://flagcdn.com/w40/ma.png" alt="AR" className="w-4 h-3 object-cover rounded-sm" /> AR
              </button>
            </div>

            <h1 className="text-7xl font-black mb-8 text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-500 tracking-tighter drop-shadow-2xl">
              {t('logo')}
            </h1>

            <div className="flex flex-col gap-6">
              <div className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
                <h2 className="text-xl font-bold mb-4 text-amber-200/80 uppercase tracking-widest text-sm">{t('singleplayer')}</h2>
                <button
                  onClick={() => setMode('bot')}
                  className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 px-6 py-4 rounded-xl font-bold transition-all transform hover:scale-[1.02] active:scale-[0.98] text-lg shadow-xl"
                >
                  {t('playVsBot')}
                </button>
              </div>

              <div className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
                <h2 className="text-xl font-bold mb-4 text-amber-200/80 uppercase tracking-widest text-sm">{t('onlineMultiplayer')}</h2>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="block text-xs text-slate-400 mb-1 text-left uppercase tracking-wider ml-1">{t('matchId')}</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={matchID}
                        onChange={e => {
                          setMatchID(e.target.value);
                          updateUrl(e.target.value);
                        }}
                        className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-mono focus:outline-none focus:border-amber-500/50 transition-colors"
                        placeholder={t('enterRoomId')}
                      />
                      <button
                        onClick={async () => {
                          const link = `${window.location.protocol}//${window.location.host}${window.location.pathname}?room=${matchID}`;
                          if (navigator.share) {
                            try {
                              await navigator.share({
                                title: 'Ronda',
                                text: t('shareText') || 'Join my Ronda game!',
                                url: link
                              });
                            } catch (err) {
                              console.error('Share failed:', err);
                            }
                          } else {
                            navigator.clipboard.writeText(link);
                            alert(t('linkCopied') || 'Link copied to clipboard!');
                          }
                        }}
                        className="bg-slate-800 hover:bg-slate-700 p-3 rounded-xl border border-white/10 text-amber-400 transition-all active:scale-95"
                        title={t('shareLink') || 'Share Invitation Link'}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                      </button>
                    </div>
                  </div>
                  {error && (
                    <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-xl text-xs font-medium animate-pulse">
                      {error}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      disabled={isCheckingRoom}
                      onClick={() => handleOnlineAction('0')}
                      className="flex-1 bg-white/10 hover:bg-white/20 disabled:opacity-50 px-4 py-3 rounded-xl font-bold transition-all shadow-lg text-sm border border-white/5"
                    >
                      {isCheckingRoom && playerID === '0' ? '...' : t('host')}
                    </button>
                    <button
                      disabled={isCheckingRoom}
                      onClick={() => handleOnlineAction('1')}
                      className="flex-1 bg-amber-600/20 hover:bg-amber-600/30 disabled:opacity-50 px-4 py-3 rounded-xl font-bold transition-all shadow-lg text-sm border border-amber-500/20 text-amber-200"
                    >
                      {isCheckingRoom && playerID === '1' ? '...' : t('join')}
                    </button>
                  </div>
                </div>
              </div>

              {/* Rules and Contact Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => setMode('rules')}
                  className="flex-1 bg-white/5 hover:bg-white/10 p-4 rounded-2xl font-bold transition-all border border-white/10 backdrop-blur-sm flex items-center justify-center gap-2 text-amber-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
                  {t('rulesBtn')}
                </button>
                
                <a
                  href="https://www.facebook.com/profile.php?id=61589185596057"
                  target="_blank"
                  rel="noopener noreferrer"
                  title={t('contactUs')}
                  className="flex-1 bg-[#1877F2]/10 hover:bg-[#1877F2]/20 p-4 rounded-2xl font-bold transition-all border border-[#1877F2]/30 backdrop-blur-sm flex items-center justify-center gap-2 text-[#1877F2] hover:text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                  {t('contactUs')}
                </a>
              </div>
            </div>
          </div>

          {/* Version - TRULY OUTSIDE the box */}
          <div className="flex flex-col items-center gap-4 mt-6 z-30">
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
          setupData={{ testMode }}
        />
      )}
      {mode === 'online' && (
        <RondaClientOnline
          key={`online-${gameKey}`}
          matchID={matchID}
          playerID={playerID}
          setupData={{ testMode }}
        />
      )}
    </div>
  );
};

export default App;
