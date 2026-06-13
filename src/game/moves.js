import { INVALID_MOVE } from 'boardgame.io/dist/esm/core.js';
import { addScore, checkRoundEnd } from './rules.js';
import { executeCapture } from './capture.js';
import { setupGame } from './setup.js';

const setActivePlayersWaitForUI = (G, events) => {
  if (G.isBotGame) {
    events.setActivePlayers({ value: { '0': 'waitForUI' } });
  } else {
    events.setActivePlayers({ all: 'waitForUI' });
  }
};

export const checkWaitForUI = (G, events) => {
  if (G.announcements.length > 0 || G.isAnimating) {
    if (G.announcements.length > 0 && !G._announcementIdIncremented) {
      G.announcementId = (G.announcementId || 0) + 1;
      G._announcementIdIncremented = true;
    }
    G.endTurnAfterUI = true;
    setActivePlayersWaitForUI(G, events);
    return true;
  }

  if (G.gameStatus) {
    events.setActivePlayers({ all: 'gameOver' });
    return true;
  }

  return false;
};

export const setPlayerName = ({ G, playerID }, name) => {
  const pID = playerID || '0';
  if (G.players[pID]) {
    G.players[pID].name = name;
  }
};

export const clearPlayerSeat = ({ G }, targetPlayerID) => {
  if (G.players[targetPlayerID]) {
    G.players[targetPlayerID].name = '';
  }
};

export const setTeamName = ({ G }, { team, name }) => {
  if (G.teamNames) {
    G.teamNames[team] = name;
  }
};

export const startGameLobby = ({ G, events }) => {
  G.gameStarted = true;
  events.setActivePlayers({ all: null });
  if ((G.announcements && G.announcements.length > 0) || G.isAnimating) {
    G.endTurnAfterUI = false;
    setActivePlayersWaitForUI(G, events);
  }
};

export const startGameTop = ({ G, events }) => {
  G.gameStarted = true;
  if ((G.announcements && G.announcements.length > 0) || G.isAnimating) {
    G.endTurnAfterUI = false;
    setActivePlayersWaitForUI(G, events);
  }
};

export const hostLeft = ({ G }) => {
  G.hostLeft = true;
};

export const playerLeft = ({ G, playerID }) => {
  console.log('[Game] playerLeft move fired by', playerID);
  if (!G.playerLeft) G.playerLeft = {};
  G.playerLeft[playerID] = true;
};

export const playCard = ({ G, ctx, events, playerID }, cardIndex) => {
  if (G.pendingCapture) return INVALID_MOVE;

  const player = (playerID !== undefined && playerID !== null) ? playerID : ctx.currentPlayer;
  if (player !== ctx.currentPlayer) return INVALID_MOVE;

  const hand = G.players[player].hand;
  if (cardIndex < 0 || cardIndex >= hand.length) return INVALID_MOVE;
  const playedCard = hand[cardIndex];

  if (!playedCard) return INVALID_MOVE;

  G.announcements = [];
  G._announcementIdIncremented = false;
  G.isDealing = false;

  hand.splice(cardIndex, 1);

  let currentVal = playedCard.value;
  const occupiedSlots = G.table.map(c => c.slot).filter(s => s !== undefined);
  let nextSlot = 0;
  while (occupiedSlots.includes(nextSlot)) {
    nextSlot++;
  }
  playedCard.slot = nextSlot;
  G.table.push(playedCard);
  
  let matchIndex = G.table.findIndex(c => c.value === currentVal && c.id !== playedCard.id);
  
  if (matchIndex !== -1 || (G.lastPlayedCard && G.lastPlayedCard.value === currentVal && G.lastPlayedCard.player !== player && G.lastPlayedCard.streak >= 2)) {
    const isTaawidaTransfer = matchIndex === -1;
    G.pendingCapture = {
      player: player,
      playedCardId: playedCard.id,
      currentVal: currentVal,
      isTaawidaTransfer: isTaawidaTransfer
    };
    G.isAnimating = true;

    if (isTaawidaTransfer) {
      const newStreak = G.lastPlayedCard.streak + 1;
      G.announcements.push({ player, type: 'Taawida', streak: newStreak, currentVal: currentVal });
    } else {
      if (G.lastPlayedCard && G.lastPlayedCard.value === currentVal && G.lastPlayedCard.player !== player) {
        const newStreak = (G.lastPlayedCard.streak || 1) + 1;
        if (newStreak === 2) {
          G.announcements.push({ player, type: 'Darba', opponent: G.lastPlayedCard.player, currentVal: currentVal });
        } else if (newStreak === 4) {
          G.announcements.push({ player, type: 'Taawida', streak: newStreak, currentVal: currentVal });
        }
      }
    }

    checkWaitForUI(G, events);
  } else {
    G.lastPlayedCard = { 
      value: currentVal, 
      player: player, 
      streak: 1, 
      awardedPoints: 0, 
      streakCards: [playedCard] 
    };
    G.isAnimating = true;
    
    const allHandsEmpty = Object.keys(G.players).every(pID => G.players[pID].hand.length === 0);
    if (G.deck.length === 0 && allHandsEmpty) {
      const numPFF = Object.keys(G.players).length;
      const opponentFF = numPFF === 2 ? (player === '0' ? '1' : '0') : String((parseInt(player) + 1) % numPFF);
      addScore(G, opponentFF, 5);
      G.announcements.push({ player: opponentFF, type: 'Final Fail' });
    }

    checkRoundEnd(G);
    if (!checkWaitForUI(G, events)) {
      events.endTurn();
    }
  }
};

export const processCapture = ({ G }) => {
  return executeCapture(G);
};

export const counterDarba = ({ G, ctx, events, playerID }, cardIndex) => {
  if (!G.pendingCapture) return INVALID_MOVE;
  const victim = (playerID !== undefined && playerID !== null) ? playerID : ctx.currentPlayer;
  if (victim === G.pendingCapture.player) return INVALID_MOVE;

  const currentVal = G.pendingCapture.currentVal;
  const hand = G.players[victim].hand;
  if (cardIndex < 0 || cardIndex >= hand.length) return INVALID_MOVE;
  const playedCard = hand[cardIndex];
  if (!playedCard || playedCard.value !== currentVal) return INVALID_MOVE;

  const captureRes = executeCapture(G);
  if (captureRes === INVALID_MOVE) return INVALID_MOVE;

  G.announcements = [];
  G._announcementIdIncremented = false;

  hand.splice(cardIndex, 1);
  const occupiedSlots = G.table.map(c => c.slot).filter(s => s !== undefined);
  let nextSlot = 0;
  while (occupiedSlots.includes(nextSlot)) {
    nextSlot++;
  }
  playedCard.slot = nextSlot;
  G.table.push(playedCard);

  events.endTurn();

  G.pendingCapture = {
    player: victim,
    playedCardId: playedCard.id,
    currentVal: currentVal,
    isTaawidaTransfer: true
  };
  G.isAnimating = true;

  const newStreak = G.lastPlayedCard.streak + 1;
  G.announcements.push({ player: victim, type: 'Taawida', streak: newStreak, currentVal: currentVal });

  checkWaitForUI(G, events);
};

export const clearAnnouncements = ({ G, events }, announcementId) => {
  if (announcementId !== undefined && announcementId !== null && G.announcementId !== announcementId) {
    return;
  }
  G.announcements = [];
  G._announcementIdIncremented = false;
  if (G.isAnimating) return;
  if (G.gameStatus) {
    events.setActivePlayers({ all: 'gameOver' });
  } else {
    events.setActivePlayers({ all: null });
    if (G.endTurnAfterUI) {
      G.endTurnAfterUI = false;
      events.endTurn();
    }
  }
};

export const endAnimation = ({ G, events }) => {
  if (!G.isAnimating) return;
  G.isAnimating = false;
  G.isDealing = false;
  if (G.gameStatus) {
    events.setActivePlayers({ all: 'gameOver' });
  } else if (G.announcements.length === 0) {
    events.setActivePlayers({ all: null });
    if (G.endTurnAfterUI) {
      G.endTurnAfterUI = false;
      events.endTurn();
    }
  }
};

export const restartGame = ({ G, ctx, events }) => {
  const numP = Object.keys(G.players).length;
  const preservedTeamNames = G.teamNames ? { ...G.teamNames } : { TeamA: '', TeamB: '' };
  const playerIds = Array.from({ length: numP }, (_, i) => String(i));
  const matches = G.matchesWon ? { ...G.matchesWon } : {};

  const names = playerIds.reduce((acc, pID) => {
    acc[pID] = G.players && G.players[pID] ? G.players[pID].name : '';
    return acc;
  }, {});

  const fresh = setupGame({ ctx });

  Object.keys(G).forEach(key => delete G[key]);
  Object.assign(G, fresh);

  G.matchesWon = matches;
  G.teamNames = preservedTeamNames;
  G.gameStarted = true;
  
  playerIds.forEach(pID => {
    if (G.players && G.players[pID]) {
      G.players[pID].name = names[pID];
    }
  });

  events.setActivePlayers({ all: null });

  if (G.announcements.length > 0 || G.isAnimating) {
    if (G.isBotGame) {
      events.setActivePlayers({ value: { '0': 'waitForUI' } });
    } else {
      events.setActivePlayers({ all: 'waitForUI' });
    }
  }
};
