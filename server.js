import { Server, Origins } from 'boardgame.io/dist/cjs/server.js';
import { RondaGame } from './src/game/game.js';
import fs from 'fs';
import path from 'path';
import { Client } from 'boardgame.io/dist/cjs/client.js';
import { SocketIO } from 'boardgame.io/dist/cjs/multiplayer.js';
import { moroccanNames, europeanNames, teamNames } from './src/game/botNames.js';

const server = Server({
  games: [RondaGame],
  origins: [
    Origins.LOCALHOST,
    'http://127.0.0.1:5173',
    'http://localhost:5173',
    'https://ronda-frontend-development.up.railway.app',
    'https://ronda.up.railway.app',
    'https://playronda.ma',
    'https://www.playronda.ma',
    'https://games.playgama.net',
    'null'
  ]
});

// Forcefully override CORS to allow ANY origin (including null and PlayGama)
server.app.middleware.unshift(async (ctx, next) => {
  const origin = ctx.get('Origin') || '*';
  
  if (ctx.method === 'OPTIONS') {
    ctx.set('Access-Control-Allow-Origin', origin);
    ctx.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    ctx.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    ctx.status = 204;
    return;
  }
  
  await next();
  ctx.set('Access-Control-Allow-Origin', origin);
});

// Custom REST endpoint to reset the test scenario match


server.router.post('/test/reset', async (ctx) => {
  try {
    const PORT = process.env.PORT || 8000;
    const base = `http://127.0.0.1:${PORT}`;

    // 1) Try to create the match with the known ID.
    //    boardgame.io ignores the 'matchID' field in the body —
    //    so we fall back to deleting + re-creating via the lobby HTTP API.
    //    First, list all matches and delete any named "test-scenario-room".
    const listResp = await fetch(`${base}/games/ronda`);
    if (listResp.ok) {
      await listResp.json();
      // We can't delete by ID via the standard lobby API, but we can track
      // the last test matchID in memory and return it to the clients.
    }

    // 2) Create a fresh match (server assigns a random ID, but our matchID
    //    contains 'test' if the env var is set – see game.js rigged deck logic).
    const createResp = await fetch(`${base}/games/ronda/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        numPlayers: 2,
        setupData: { testMode: true },
      }),
    });

    if (!createResp.ok) {
      const errText = await createResp.text();
      ctx.status = 500;
      ctx.body = { ok: false, error: errText };
      return;
    }

    const data = await createResp.json();
    const matchID = data.matchID;

    // Store for subsequent /test/match-id requests
    server._testMatchID = matchID;

    ctx.body = { ok: true, matchID };
  } catch (err) {
    ctx.status = 500;
    ctx.body = { ok: false, error: String(err) };
  }
});

server.router.post('/test/reset4', async (ctx) => {
  try {
    const PORT = process.env.PORT || 8000;
    const base = `http://127.0.0.1:${PORT}`;

    const createResp = await fetch(`${base}/games/ronda/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        numPlayers: 4,
        setupData: { testMode: true, gameStarted: false },
      }),
    });

    if (!createResp.ok) {
      const errText = await createResp.text();
      ctx.status = 500;
      ctx.body = { ok: false, error: errText };
      return;
    }

    const data = await createResp.json();
    const matchID = data.matchID;

    server._testMatchID = matchID;

    ctx.body = { ok: true, matchID };
  } catch (err) {
    ctx.status = 500;
    ctx.body = { ok: false, error: String(err) };
  }
});

// GET /test/match-id  →  returns the current test matchID
server.router.get('/test/match-id', async (ctx) => {
  if (server._testMatchID) {
    ctx.body = { ok: true, matchID: server._testMatchID };
  } else {
    ctx.status = 404;
    ctx.body = { ok: false, error: 'No test match exists yet. POST /test/reset first.' };
  }
});



const generateBotName = () => {
  if (Math.random() < 0.90) {
    return moroccanNames[Math.floor(Math.random() * moroccanNames.length)];
  } else {
    return europeanNames[Math.floor(Math.random() * europeanNames.length)];
  }
};

const credentialsPath = path.join(process.cwd(), 'scratch', 'bot_credentials.json');

let botCredentials = {};
try {
  const scratchDir = path.join(process.cwd(), 'scratch');
  if (!fs.existsSync(scratchDir)) {
    fs.mkdirSync(scratchDir, { recursive: true });
  }
  if (fs.existsSync(credentialsPath)) {
    botCredentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
  }
} catch (err) {
  console.error('[Bot System] Failed to read bot credentials:', err);
}

const saveCredentials = () => {
  try {
    fs.writeFileSync(credentialsPath, JSON.stringify(botCredentials, null, 2), 'utf8');
  } catch (err) {
    console.error('[Bot System] Failed to save bot credentials:', err);
  }
};

const activeBotClients = new Map();

const getCaptureSequenceLength = (G) => {
  if (!G.pendingCapture) return 0;
  let count = 0;
  let val = G.pendingCapture.currentVal;
  let matchIndex = G.table.findIndex(c => c.value === val && c.id !== G.pendingCapture.playedCardId);
  if (matchIndex !== -1) {
    count++;
    let nextVal = val < 10 ? val + 1 : null;
    while (nextVal !== null) {
      let nextMatchIndex = G.table.findIndex(c => c.value === nextVal);
      if (nextMatchIndex !== -1) {
        count++;
        nextVal = nextVal < 10 ? nextVal + 1 : null;
      } else break;
    }
  }
  return count;
};

const startBotClient = (port, matchID, playerID, credentials, botName) => {
  const clientKey = `${matchID}-${playerID}`;
  if (activeBotClients.has(clientKey)) {
    return;
  }

  console.log(`[Bot ${clientKey}] Starting bot client for ${botName}...`);
  const client = Client({
    game: RondaGame,
    multiplayer: SocketIO({ server: `http://127.0.0.1:${port}` }),
    matchID,
    playerID,
    credentials,
  });

  client.start();
  activeBotClients.set(clientKey, client);

  let nameSynced = false;
  let teamNameChecked = false;
  let timerId = null;

  client.subscribe(state => {
    if (!state) return;
    const { G, ctx } = state;

    // Sync bot name into G.players[playerID].name
    if (!nameSynced && G.players && G.players[playerID] && G.players[playerID].name !== botName) {
      nameSynced = true;
      try {
        client.moves.setPlayerName(botName);
      } catch (err) {
        console.error(`[Bot ${clientKey}] Failed to set name:`, err);
        nameSynced = false;
      }
    }

    // Check if Team B name needs to be set (4-player mode, lobby phase, first bot in Team B, Team B name is empty)
    if (!teamNameChecked && ctx.numPlayers === 4 && G.gameStarted === false && (playerID === '1' || playerID === '3') && G.teamNames && G.teamNames.TeamB === '') {
      const otherSlot = playerID === '1' ? '3' : '1';
      const isOtherEmpty = !G.players || !G.players[otherSlot] || !G.players[otherSlot].name;
      
      if (isOtherEmpty) {
        teamNameChecked = true;
        const shouldSet = G.isTestMode === true || Math.random() < 0.5;
        if (shouldSet) {
          const chosenName = teamNames[Math.floor(Math.random() * teamNames.length)];
          const delay = G.isTestMode === true ? 1000 : (Math.random() * 5000 + 5000);
          console.log(`[Bot ${clientKey}] Decided to set Team B name to "${chosenName}" after ${delay.toFixed(0)}ms`);
          
          setTimeout(() => {
            const latestState = client.getState();
            if (latestState && latestState.G && latestState.G.gameStarted === false && latestState.G.teamNames && latestState.G.teamNames.TeamB === '' && activeBotClients.has(clientKey)) {
              try {
                client.moves.setTeamName({ team: 'TeamB', name: chosenName });
              } catch (err) {
                console.error(`[Bot ${clientKey}] Failed to set team name:`, err);
              }
            }
          }, delay);
        } else {
          console.log(`[Bot ${clientKey}] Decided NOT to set Team B name (50% roll failed)`);
        }
      }
    }

    // Stop bot if the host left the game
    if (G.playerLeft && G.playerLeft['0'] === true) {
      if (activeBotClients.has(clientKey)) {
        console.log(`[Bot ${clientKey}] Host left, stopping bot client.`);
        activeBotClients.delete(clientKey);
        try {
          client.stop();
        } catch (err) {
          console.error(`[Bot ${clientKey}] Error stopping client:`, err);
        }
        if (botCredentials[clientKey]) {
          delete botCredentials[clientKey];
          saveCredentials();
        }
      }
      return;
    }

    // Auto-consent to rematch challenges
    const isBotInGameOverStage = ctx.activePlayers && ctx.activePlayers[playerID] === 'gameOver';
    if (isBotInGameOverStage && G.wantsPlayAgain && G.wantsPlayAgain['0'] === true && !G.wantsPlayAgain[playerID]) {
      console.log(`[Bot ${clientKey}] Accepting rematch challenge...`);
      try {
        client.moves.restartGame();
      } catch (err) {
        console.error(`[Bot ${clientKey}] Failed to accept rematch:`, err);
      }
      return;
    }

    // Do not allow normal play moves if game is not started or is already over
    if (!G.gameStarted || G.gameStatus) {
      if (timerId) {
        clearTimeout(timerId);
        timerId = null;
      }
      return;
    }

    const isBotActive = ctx.activePlayers
      ? (playerID in ctx.activePlayers)
      : (ctx.currentPlayer === playerID);

    if (!isBotActive) {
      if (timerId) {
        clearTimeout(timerId);
        timerId = null;
      }
      return;
    }

    // Do not schedule or run the timer if the UI is busy animating or announcements are active,
    // unless this bot itself has a pending capture to resolve (which is resolved automatically via processCapture).
    const isUIBusy = G.isAnimating || (G.announcements && G.announcements.length > 0) || (ctx.activePlayers && ctx.activePlayers[playerID] === 'waitForUI');
    const isMyPendingCapture = G.pendingCapture && G.pendingCapture.player === playerID;

    if (isUIBusy && !isMyPendingCapture) {
      if (timerId) {
        clearTimeout(timerId);
        timerId = null;
      }
      return;
    }

    if (isMyPendingCapture) {
      if (timerId) {
        clearTimeout(timerId);
        timerId = null;
      }
    } else {
      if (timerId) return;
    }

    // Delay: 0.2 to 1.0 seconds for capture/Darba moves and the last card, 1.0 to 3.0 seconds otherwise
    const hand = G.players && G.players[playerID] ? G.players[playerID].hand : [];
    const isLastCard = hand.length === 1;

    let isCaptureMove = false;
    let isProcessCaptureMove = false;
    const botMoves = RondaGame.ai.enumerate(G, ctx, playerID);
    if (botMoves && botMoves.length > 0) {
      const nextMove = botMoves[0];
      console.log(`[Bot ${clientKey}] botMoves length: ${botMoves.length}, nextMove: ${JSON.stringify(nextMove)}`);
      if (nextMove.move === 'playCard') {
        const cardIdx = nextMove.args[0];
        const playedCard = hand[cardIdx];
        if (playedCard) {
          const currentVal = playedCard.value;
          const hasTableMatch = G.table.some(c => c.value === currentVal);
          const isTaawidaTransfer = !!(
            G.lastPlayedCard &&
            G.lastPlayedCard.value === currentVal &&
            G.lastPlayedCard.player !== playerID &&
            G.lastPlayedCard.streak >= 2
          );
          if (hasTableMatch || isTaawidaTransfer) {
            isCaptureMove = true;
          }
        }
      } else if (nextMove.move === 'processCapture') {
        isProcessCaptureMove = true;
      }
    }

    let delay;
    if (isProcessCaptureMove) {
      const seqLen = getCaptureSequenceLength(G);
      delay = seqLen > 0 ? (seqLen * 1000 + 1000) : 1500;
      console.log(`[Bot ${clientKey}] Scheduling processCapture in ${delay}ms (seqLen: ${seqLen})`);
    } else {
      delay = (isLastCard || isCaptureMove) ? (Math.random() * 800 + 200) : (Math.random() * 2000 + 1000);
      console.log(`[Bot ${clientKey}] Scheduling standard move in ${delay.toFixed(0)}ms`);
    }

    timerId = setTimeout(() => {
      timerId = null;
      const currentState = client.getState();
      if (!currentState) return;
      const { G: currentG, ctx: currentCtx } = currentState;

      const currentActive = currentCtx.activePlayers
        ? (playerID in currentCtx.activePlayers)
        : (currentCtx.currentPlayer === playerID);

      if (!currentActive) return;

      const moves = RondaGame.ai.enumerate(currentG, currentCtx, playerID);
      if (moves && moves.length > 0) {
        const move = moves[0];
        console.log(`[Bot ${clientKey}] Playing move:`, move.move, move.args);
        try {
          client.moves[move.move](...move.args);
        } catch (err) {
          console.error(`[Bot ${clientKey}] Move execution failed:`, err);
        }
      }
    }, delay);
  });
};

const joinBot = async (port, matchID, playerID) => {
  const botName = generateBotName();
  console.log(`[Bot Monitor] Joining bot ${botName} to match ${matchID} at playerID ${playerID}`);
  try {
    const resp = await fetch(`http://127.0.0.1:${port}/games/ronda/${matchID}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        playerID,
        playerName: botName
      })
    });

    if (resp.ok) {
      const data = await resp.json();
      const credentials = data.playerCredentials;
      const clientKey = `${matchID}-${playerID}`;
      
      botCredentials[clientKey] = {
        name: botName,
        credentials,
        isBot: true,
        joinedAt: Date.now()
      };
      saveCredentials();

      startBotClient(port, matchID, playerID, credentials, botName);
    } else {
      console.error(`[Bot Monitor] Failed to join bot to match ${matchID}:`, await resp.text());
    }
  } catch (err) {
    console.error(`[Bot Monitor] Error joining bot to match ${matchID}:`, err);
  }
};

const lobbyTimes = new Map();

const monitorMatchmaking = async (port) => {
  try {
    const resp = await fetch(`http://127.0.0.1:${port}/games/ronda`);
    if (!resp.ok) return;
    const { matches } = await resp.json();

    const activeMatchIDs = new Set(matches.map(m => m.matchID));

    // Cleanup lobbyTimes
    for (const matchID of lobbyTimes.keys()) {
      if (!activeMatchIDs.has(matchID)) {
        lobbyTimes.delete(matchID);
      }
    }

    // Cleanup orphaned bot clients whose matches are no longer active
    for (const [clientKey, botClient] of activeBotClients.entries()) {
      const lastHyphenIndex = clientKey.lastIndexOf('-');
      const matchID = lastHyphenIndex !== -1 ? clientKey.substring(0, lastHyphenIndex) : clientKey;
      if (!activeMatchIDs.has(matchID)) {
        console.log(`[Bot Monitor] Cleaning up orphaned bot client ${clientKey}`);
        try {
          botClient.stop();
        } catch (err) {
          console.error(`[Bot Monitor] Error stopping orphaned client ${clientKey}:`, err);
        }
        activeBotClients.delete(clientKey);
        if (botCredentials[clientKey]) {
          delete botCredentials[clientKey];
          saveCredentials();
        }
      }
    }

    for (const match of matches) {
      if (match.matchID.startsWith('test-match-')) {
        continue;
      }
      if (match.setupData && match.setupData.noBots === true) {
        continue;
      }

      if (match.gameover) {
        lobbyTimes.delete(match.matchID);
        continue;
      }

      // Check if all players are joined
      const numPlayers = match.players.length;
      const allJoined = match.players.every(p => p.name && p.name.trim() !== '');

      // Check if the match has started
      let gameStarted = false;
      try {
        const result = await server.db.fetch(match.matchID, { state: true });
        if (result && result.state && result.state.G) {
          gameStarted = !!result.state.G.gameStarted;
        }
      } catch (err) {
        console.error(`[Bot Monitor] Error fetching state for match ${match.matchID}:`, err);
      }

      if (allJoined || gameStarted) {
        lobbyTimes.delete(match.matchID);
        continue;
      }

      // Track lobby time
      if (!lobbyTimes.has(match.matchID)) {
        const isTest = match.setupData?.testMode || /test/i.test(match.matchID);
        
        // Random timeouts: 2-player: 7-30s. 4-player: 7-15s, 15-30s, 30-50s
        const timeouts = numPlayers === 2
          ? [ isTest ? 3000 : (Math.random() * 23000 + 7000) ]
          : [
              isTest ? 2000 : (Math.random() * 8000 + 7000),
              isTest ? 4000 : (Math.random() * 15000 + 15000),
              isTest ? 6000 : (Math.random() * 20000 + 30000)
            ];

        lobbyTimes.set(match.matchID, {
          createdAt: Date.now(),
          maxPlayers: numPlayers,
          botsAdded: new Set(),
          timeouts,
          firstBotJoinedAt: null
        });
      }

      const lobbyInfo = lobbyTimes.get(match.matchID);
      const elapsed = Date.now() - lobbyInfo.createdAt;

      // Handle Bot Inactivity Auto-Leave:
      if (lobbyInfo.firstBotJoinedAt) {
        const botElapsed = Date.now() - lobbyInfo.firstBotJoinedAt;
        if (botElapsed >= 60000) {
          const bots = Array.from(lobbyInfo.botsAdded).sort();
          for (let idx = 0; idx < bots.length; idx++) {
            const botSlot = bots[idx];
            const leaveTime = 60000 + idx * 10000;
            if (botElapsed >= leaveTime) {
              const clientKey = `${match.matchID}-${botSlot}`;
              const botClient = activeBotClients.get(clientKey);
              if (botClient) {
                console.log(`[Bot Monitor] Bot ${clientKey} leaving due to host inactivity.`);
                try {
                  botClient.moves.clearPlayerSeat(String(botSlot));
                } catch (err) {
                  console.error(`[Bot Monitor] Failed to clear seat for bot ${clientKey}:`, err);
                }
                botClient.stop();
                activeBotClients.delete(clientKey);
              }
              lobbyInfo.botsAdded.delete(botSlot);
              if (botCredentials[clientKey]) {
                delete botCredentials[clientKey];
                saveCredentials();
              }
            }
          }
        }
      }

      if (numPlayers === 2) {
        if (elapsed >= lobbyInfo.timeouts[0] && !match.players[1].name) {
          if (!lobbyInfo.botsAdded.has(1)) {
            lobbyInfo.botsAdded.add(1);
            if (!lobbyInfo.firstBotJoinedAt) lobbyInfo.firstBotJoinedAt = Date.now();
            await joinBot(port, match.matchID, '1');
          }
        }
      } else if (numPlayers === 4) {
        const slots = [1, 2, 3];
        for (let i = 0; i < slots.length; i++) {
          const slotIndex = slots[i];
          const delay = lobbyInfo.timeouts[i];
          if (elapsed >= delay && !match.players[slotIndex].name) {
            if (!lobbyInfo.botsAdded.has(slotIndex)) {
              lobbyInfo.botsAdded.add(slotIndex);
              if (!lobbyInfo.firstBotJoinedAt) lobbyInfo.firstBotJoinedAt = Date.now();
              await joinBot(port, match.matchID, String(slotIndex));
            }
          }
        }
      }
    }
  } catch (err) {
    console.error('[Bot Monitor] Error in monitor loop:', err);
  }
};

const restoreActiveBots = async (port) => {
  const keys = Object.keys(botCredentials);
  for (const key of keys) {
    const lastHyphenIndex = key.lastIndexOf('-');
    const matchID = lastHyphenIndex !== -1 ? key.substring(0, lastHyphenIndex) : key;
    const playerID = lastHyphenIndex !== -1 ? key.substring(lastHyphenIndex + 1) : '';
    try {
      const resp = await fetch(`http://127.0.0.1:${port}/games/ronda/${matchID}`);
      if (resp.ok) {
        const match = await resp.json();
        if (match.gameover) {
          delete botCredentials[key];
        } else {
          const player = match.players.find(p => String(p.id) === playerID);
          if (player && player.name) {
            console.log(`[Bot Monitor] Restoring active bot for match ${matchID}, player ${playerID}`);
            startBotClient(port, matchID, playerID, botCredentials[key].credentials, player.name);
          } else {
            delete botCredentials[key];
          }
        }
      } else {
        delete botCredentials[key];
      }
    } catch (err) {
      console.error(`[Bot Monitor] Failed to restore key ${key}:`, err);
    }
  }
  saveCredentials();
};

const startMatchmakingMonitor = (port) => {
  setTimeout(() => restoreActiveBots(port), 2000);
  setInterval(() => monitorMatchmaking(port), 1500);
};

const PORT = process.env.PORT || 8000;
server.run(PORT, () => {
  console.log(`Backend server running on port ${PORT}...`);
  startMatchmakingMonitor(PORT);
});
