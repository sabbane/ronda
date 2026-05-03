import React, { useState } from 'react';
import { Client } from 'boardgame.io/react';
import { Local } from 'boardgame.io/multiplayer';
import { RondaGame } from './game/game';
import { rondaBot } from './game/bot';
import { RondaBoard } from './components/Board';

const RondaClient = Client({
  game: RondaGame,
  board: RondaBoard,
  numPlayers: 2,
  multiplayer: Local({ 
    bots: { '1': rondaBot },
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
