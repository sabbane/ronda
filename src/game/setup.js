import { generateDeck, shuffle } from './deck.js';
import { evaluateRondaTringa } from './rules.js';

export const setupGame = ({ ctx }, setupData) => {
  let deck;
  const matchID = ctx?.matchID;
  
  const isTestMode = setupData?.testMode === true || (matchID && /test/i.test(matchID));

  if (isTestMode) {
    deck = getRiggedTestDeck();
  } else {
    deck = shuffle(generateDeck());
  }

  const table = deck.splice(0, 4).map((card, i) => ({ ...card, slot: i }));
  const numP = ctx.numPlayers || 2;
  const playerIds = Array.from({ length: numP }, (_, i) => String(i));
  
  const isBotGame = (typeof window !== 'undefined' && window.isRondaBotGame === true) || 
                    (matchID && /bot/i.test(matchID)) ||
                    (setupData && setupData.isBotGame === true);

  const players = playerIds.reduce((acc, pID) => {
    const isBot = pID === '1' && isBotGame;
    let botName = '';
    if (isBot) {
      // Determine language dynamically if we are in the browser
      const isArabic = typeof window !== 'undefined' && (
        localStorage.getItem('ronda-lang') === 'ar' ||
        window.__rondaLanguage__ === 'ar' ||
        document.documentElement.lang === 'ar'
      );
      botName = isArabic ? 'الحاج' : 'El Haj';
    }
    acc[pID] = { hand: deck.splice(0, 3), captured: [], score: 0, name: botName };
    return acc;
  }, {});
  const matchesWon = playerIds.reduce((acc, pID) => {
    acc[pID] = 0;
    return acc;
  }, {});
  
  let G = {
    deck,
    table,
    players,
    lastCapture: null,
    lastPlayedCard: null,
    announcements: [],
    pendingCapture: null,
    isAnimating: true,
    isDealing: true,
    gameStarted: setupData ? (isTestMode || setupData.gameStarted === true) : true,
    endTurnAfterUI: false,
    gameStatus: null, // Custom game over state
    matchesWon, // Track overall games won
    teamNames: { TeamA: '', TeamB: '' },
    isBotGame,
    wantsPlayAgain: playerIds.reduce((acc, pID) => {
      acc[pID] = false;
      return acc;
    }, {}),
  };

  evaluateRondaTringa(G);

  return G;
};

const getRiggedTestDeck = () => {
  return [
    { value: 1, suit: 'dheb' }, { value: 2, suit: 'dheb' }, { value: 3, suit: 'dheb' }, { value: 4, suit: 'dheb' }, // Table
    { value: 5, suit: 'dheb' }, { value: 5, suit: 'jben' }, { value: 6, suit: 'dheb' }, // P0 R1
    { value: 7, suit: 'dheb' }, { value: 7, suit: 'jben' }, { value: 8, suit: 'dheb' }, // P1 R1
    { value: 9, suit: 'dheb' }, { value: 9, suit: 'jben' }, { value: 5, suit: 'zrawet' }, // P0 R2 (Swapped 6-jben for 5-zrawet)
    { value: 9, suit: 'syouf' }, { value: 9, suit: 'zrawet' }, { value: 8, suit: 'jben' }, // P1 R2
    { value: 1, suit: 'jben' }, { value: 6, suit: 'zrawet' }, { value: 10, suit: 'syouf' }, // P0 R3 (Swapped 1s/1z for end-cards)
    { value: 2, suit: 'jben' }, { value: 2, suit: 'syouf' }, { value: 10, suit: 'zrawet' }, // P1 R3 (Swapped 4-jben for 10-zrawet)
    { value: 3, suit: 'jben' }, { value: 3, suit: 'syouf' }, { value: 3, suit: 'zrawet' }, // P0 R4
    { value: 4, suit: 'syouf' }, { value: 4, suit: 'zrawet' }, { value: 6, suit: 'syouf' }, // P1 R4
    { value: 4, suit: 'jben' }, { value: 6, suit: 'jben' }, { value: 7, suit: 'syouf' }, // P0 R5 (Received 4-jben and 6-jben)
    { value: 7, suit: 'zrawet' }, { value: 2, suit: 'zrawet' }, { value: 8, suit: 'zrawet' }, // P1 R5 (Swapped 8s for end-card)
    
    // LAST ROUND (Indices 34-39)
    // P0: 12 (10d), 1 (1z), 10 (8s)
    { value: 10, suit: 'dheb' }, { value: 1, suit: 'zrawet' }, { value: 8, suit: 'syouf' },
    // P1: 12 (10j), 1 (1s), 5 (5s)
    { value: 10, suit: 'jben' }, { value: 1, suit: 'syouf' }, { value: 5, suit: 'syouf' }
  ].map(card => {
    const displayMap = { 8: 10, 9: 11, 10: 12 };
    return { 
      ...card, 
      displayValue: displayMap[card.value] || card.value, 
      id: `${card.suit}-${card.value}` 
    };
  });
};
