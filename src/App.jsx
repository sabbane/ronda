import React, { useState } from 'react';
import { Client } from 'boardgame.io/react';
import { Local } from 'boardgame.io/multiplayer';
import { RondaGame } from './game/game';
import { RandomBot } from 'boardgame.io/ai';
import { RondaBoard } from './components/Board';

const RondaClient = Client({

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


const App = () => {
  return (
    <div className="bg-slate-950 min-h-screen">
      <RondaClient playerID="0" />
    </div>
  );
};

export default App;
