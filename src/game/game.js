import { enumerateMoves } from './bot.js';
import { evaluateRondaTringa } from './rules.js';
import { setupGame } from './setup.js';
import {
  setPlayerName,
  clearPlayerSeat,
  setTeamName,
  startGameTop,
  startGameLobby,
  hostLeft,
  playerLeft,
  playCard,
  processCapture,
  counterDerba,
  clearAnnouncements,
  endAnimation,
  restartGame
} from './moves.js';

// Re-export functions to maintain backward compatibility for tests and bot.js
export { getNextValue } from './deck.js';
export { addScore, getTeamCaptain, getHandRank, evaluateRondaTringa, checkRoundEnd } from './rules.js';
export { executeCapture } from './capture.js';

export const RondaGame = {
  name: 'ronda',
  minPlayers: 2,
  maxPlayers: 4,
  setup: setupGame,

  moves: {
    startGame: {
      move: startGameTop,
      noLimit: true
    },
    setPlayerName: {
      move: setPlayerName,
      noLimit: true
    },
    clearPlayerSeat: {
      move: clearPlayerSeat,
      noLimit: true
    },
    setTeamName: {
      move: setTeamName,
      noLimit: true
    },
    hostLeft: {
      move: hostLeft,
      noLimit: true
    },
    playerLeft: {
      move: playerLeft,
      noLimit: true
    },
    playCard,
    processCapture,
    counterDerba
  },

  turn: {
    onBegin: ({ G, events }) => {
      if (G.gameStarted === false) {
        events.setActivePlayers({ all: 'lobby' });
        return;
      }
      if (G.pendingCapture) {
        if ((G.announcements && G.announcements.length > 0) || G.isAnimating) {
          events.setActivePlayers({ all: 'waitForUI' });
        }
        return;
      }
      
      const numP = Object.keys(G.players).length;
      const allHandsEmpty = Object.keys(G.players).every(pID => !G.players[pID].hand || G.players[pID].hand.length === 0);
      
      if (allHandsEmpty && G.deck.length > 0) {
        Array.from({ length: numP }, (_, i) => String(i)).forEach(pID => {
          G.players[pID].hand = G.deck.splice(0, 3);
        });
        G.lastPlayedCard = null;
        G.isAnimating = true;
        G.isDealing = true;
        evaluateRondaTringa(G);
      }

      if ((G.announcements && G.announcements.length > 0) || G.isAnimating) {
        G.endTurnAfterUI = false;
        events.setActivePlayers({ all: 'waitForUI' });
      }
    },
    stages: {
      lobby: {
        moves: {
          setPlayerName: {
            move: setPlayerName,
            noLimit: true
          },
          clearPlayerSeat: {
            move: clearPlayerSeat,
            noLimit: true
          },
          setTeamName: {
            move: setTeamName,
            noLimit: true
          },
          startGame: {
            move: startGameLobby,
            noLimit: true
          },
          hostLeft: {
            move: hostLeft,
            noLimit: true
          },
          playerLeft: {
            move: playerLeft,
            noLimit: true
          }
        }
      },
      waitForUI: {
        moves: {
          processCapture,
          counterDerba,
          clearAnnouncements,
          endAnimation,
          playerLeft: {
            move: playerLeft,
            noLimit: true
          }
        }
      },
      gameOver: {
        moves: {
          restartGame,
          playerLeft: {
            move: playerLeft,
            noLimit: true
          }
        }
      }
    }
  },

  endIf: () => {
    // Avoid returning state to prevent boardgame.io permanently locking the room (managed via G.gameStatus)
  },

  ai: {
    enumerate: enumerateMoves
  }
};
