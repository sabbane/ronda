import React, { useState } from 'react';
import { Client } from 'boardgame.io/react';
import { Local, SocketIO } from 'boardgame.io/multiplayer';
import { RondaGame } from './game/game';
import { RandomBot } from 'boardgame.io/ai';
import { RondaBoard } from './components/Board';

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

  if (!mode) {
    return (
      <div className="bg-slate-950 min-h-screen flex items-center justify-center text-white p-4">
        <div className="bg-slate-900 p-8 rounded-3xl shadow-2xl border border-slate-800 text-center max-w-md w-full">
          <h1 className="text-6xl font-black mb-8 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 tracking-tighter">RONDA</h1>
          
          <div className="flex flex-col gap-6">
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50">
              <h2 className="text-xl font-bold mb-4 text-slate-300">Singleplayer</h2>
              <button 
                onClick={() => setMode('bot')}
                className="w-full bg-indigo-600 hover:bg-indigo-500 px-6 py-4 rounded-xl font-bold transition-colors text-lg shadow-lg"
              >
                Play vs AI Bot
              </button>
            </div>

            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50">
              <h2 className="text-xl font-bold mb-4 text-slate-300">Online Multiplayer</h2>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1 text-left">Match ID</label>
                  <input 
                    type="text" 
                    value={matchID}
                    onChange={e => setMatchID(e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 w-full text-white font-mono focus:outline-none focus:border-purple-500 transition-colors"
                    placeholder="Enter Room ID"
                  />
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => { setPlayerID('0'); setMode('online'); }}
                    className="flex-1 bg-purple-600 hover:bg-purple-500 px-4 py-3 rounded-xl font-bold transition-colors shadow-lg text-sm"
                  >
                    Join as P1 (Host)
                  </button>
                  <button 
                    onClick={() => { setPlayerID('1'); setMode('online'); }}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 px-4 py-3 rounded-xl font-bold transition-colors shadow-lg text-sm"
                  >
                    Join as P2 (Guest)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-950 min-h-screen">
      {mode === 'bot' && <RondaClientBot playerID="0" />}
      {mode === 'online' && <RondaClientOnline matchID={matchID} playerID={playerID} />}
    </div>
  );
};

export default App;
