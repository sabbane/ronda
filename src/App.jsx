import React, { useState } from 'react';
import { Client } from 'boardgame.io/react';
import { Local, SocketIO } from 'boardgame.io/multiplayer';
import { RondaGame } from './game/game';
import { RandomBot } from 'boardgame.io/ai';
import { RondaBoard } from './components/Board';
import { AdSlot } from './components/AdSlot';
import { useLanguage } from './contexts/LanguageContext';

const RondaClientBot = Client({
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
    botDelay: 800
  }),
});

const serverUrl = import.meta.env.VITE_SERVER_URL || (typeof window !== 'undefined' ? `${window.location.protocol}//ronda-backend.up.railway.app` : 'http://localhost:8000');

const RondaClientOnline = Client({
  game: RondaGame,
  board: RondaBoard,
  numPlayers: 2,
  multiplayer: SocketIO({ server: serverUrl }),
});

const App = () => {
  const [mode, setMode] = useState(null); // 'bot' or 'online'
  const [playerID, setPlayerID] = useState('0');
  const [matchID, setMatchID] = useState('ronda-room-1');
  const [gameKey, setGameKey] = useState(0);
  const { language, changeLanguage, t } = useLanguage();

  React.useEffect(() => {
    const handleReset = () => setGameKey(prev => prev + 1);
    const handleMenu = () => setMode(null);
    window.addEventListener('ronda-reset', handleReset);
    window.addEventListener('ronda-menu', handleMenu);
    return () => {
      window.removeEventListener('ronda-reset', handleReset);
      window.removeEventListener('ronda-menu', handleMenu);
    };
  }, []);

  if (!mode) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white p-4 relative overflow-hidden">
        {/* Background Image with Moroccan Vibe */}
        <div 
          className="absolute inset-0 z-0 scale-105"
          style={{
            backgroundImage: "url('/assets/moroccan_background.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(0.4) saturate(1.1)'
          }}
        />

        <div className="bg-slate-900/80 backdrop-blur-xl p-8 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 text-center max-w-md w-full relative z-10">
          
          {/* Language Selector in Center */}
          <div className="flex justify-center gap-2 mb-8" dir="ltr">
            <button 
              onClick={() => changeLanguage('en')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 ${language === 'en' ? 'bg-amber-600 text-white shadow-[0_0_15px_rgba(217,119,6,0.5)]' : 'bg-white/10 text-slate-300 hover:bg-white/20'} backdrop-blur-md transition-all border border-white/10`}
            >
              <img src="https://flagcdn.com/w40/gb.png" alt="EN" className="w-4 h-3 object-cover rounded-sm" /> EN
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
                <div>
                  <label className="block text-xs text-slate-400 mb-1 text-left uppercase tracking-wider ml-1">{t('matchId')}</label>
                  <input 
                    type="text" 
                    value={matchID}
                    onChange={e => setMatchID(e.target.value)}
                    className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 w-full text-white font-mono focus:outline-none focus:border-amber-500/50 transition-colors"
                    placeholder={t('enterRoomId')}
                  />
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => { setPlayerID('0'); setMode('online'); }}
                    className="flex-1 bg-white/10 hover:bg-white/20 px-4 py-3 rounded-xl font-bold transition-all shadow-lg text-sm border border-white/5"
                  >
                    {t('host')}
                  </button>
                  <button 
                    onClick={() => { setPlayerID('1'); setMode('online'); }}
                    className="flex-1 bg-amber-600/20 hover:bg-amber-600/30 px-4 py-3 rounded-xl font-bold transition-all shadow-lg text-sm border border-amber-500/20 text-amber-200"
                  >
                    {t('join')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Ad Space at the bottom of the start screen */}
        <div className="absolute bottom-4 left-0 right-0 z-20">
          <AdSlot />
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
        />
      )}
      {mode === 'online' && (
        <RondaClientOnline 
          key={`online-${gameKey}`} 
          matchID={matchID} 
          playerID={playerID} 
        />
      )}
    </div>
  );
};

export default App;
