import React, { createContext, useState, useContext } from 'react';

export const translations = {
  en: {
    singleplayer: "Singleplayer",
    playVsBot: "Play vs AI Bot",
    onlineMultiplayer: "Online Multiplayer",
    matchId: "Match ID",
    enterRoomId: "Enter Room ID",
    logo: "RONDA",
    host: "Host",
    join: "Join",
    opponent: "Opponent",
    you: "You",
    yourTurn: "(Your Turn)",
    cards: "Cards:",
    tableEmpty: "Table is empty",
    gameOver: "Game Over!",
    itsADraw: "It's a draw!",
    youWon: "You won!",
    opponentWon: "Opponent won!",
    playAgain: "Play Again",
    mainMenu: "Main Menu",
    cardsRemaining: "Cards remaining",
    played: "Played",
    roundOver: "Round Over!",
    totalGames: "Total Wins",
    shareText: "Join my Ronda game!",
    linkCopied: "Link copied to clipboard!",
    donateBtn: "Buy us a Mint Tea",
    donateMsg: "Enjoying the game? Buy the dev team a cup of Mint Tea!",
    connecting: "Connecting...",
    connectingDetail: "Waiting for the game server to respond.",
    roomOccupied: "Room is occupied, please choose another name.",
    roomFull: "Room is full.",
    backToMenu: "Back to Menu",
    shareLink: "Copy Invitation Link",
    announcements: {
      ronda: "Ronda! (+1) - {name}",
      tringa: "Tringa! (+5) - {name}",
      missa: "Missa! (+1) - {name}",
      derba: "Derba! (+1) - {name}",
      taawida: "Taawida! - {name}",
      counterAttackTitle: "Counter Attack",
      counterAttackDesc: "Derba is countered",
      ultimateCounterTitle: "Ultimate Counter",
      ultimateCounterDesc: "Ultimate Counter-Attack",
      clash: "Clash! Both have Ronda!",
      clashWon: "Clash won with {type}! (+{pts}) - {name}",
      clashDraw: "Clash Draw!",
      kingFinish: "👑 King Finish! (+5)",
      tringaWins: "Tringa beats Ronda! (+6) - {name}",
      finalFailTitle: "Final Fail",
      finalFailDesc: "Missed the last card! (+5 for opponent)",
      asFinishTitle: "As Finish",
      asFinishDesc: "Captured with Ace! (+5 for opponent)"
    }
  },
  fr: {
    singleplayer: "Un Joueur",
    playVsBot: "Jouer contre l'IA",
    onlineMultiplayer: "Multijoueur en Ligne",
    matchId: "ID du Match",
    enterRoomId: "Entrer l'ID",
    logo: "RONDA",
    host: "Créer",
    join: "Rejoindre",
    opponent: "Adversaire",
    you: "Vous",
    yourTurn: "(À ton tour)",
    cards: "Cartes :",
    tableEmpty: "La table est vide",
    gameOver: "Partie Terminée !",
    itsADraw: "Égalité !",
    youWon: "Vous avez gagné !",
    opponentWon: "L'adversaire a gagné !",
    playAgain: "Rejouer",
    mainMenu: "Menu Principal",
    cardsRemaining: "Cartes restantes",
    played: "Jouée",
    roundOver: "Manche Terminée !",
    totalGames: "Victoires Totales",
    shareText: "Rejoins ma partie de Ronda !",
    linkCopied: "Lien copié dans le presse-papiers !",
    donateBtn: "Offrez-nous un Thé à la Menthe",
    donateMsg: "Vous aimez le jeu ? Offrez un thé à l'équipe de développement !",
    connecting: "Connexion...",
    connectingDetail: "En attente d'une réponse du serveur de jeu.",
    roomOccupied: "La salle est occupée, veuillez choisir un autre nom.",
    roomFull: "La salle est pleine.",
    backToMenu: "Retour au Menu",
    shareLink: "Copier le lien d'invitation",
    announcements: {
      ronda: "Ronda ! (+1) - {name}",
      tringa: "Tringa ! (+5) - {name}",
      missa: "Missa ! (+1) - {name}",
      derba: "Derba ! (+1) - {name}",
      taawida: "Taawida ! - {name}",
      counterAttackTitle: "Contre-Attaque",
      counterAttackDesc: "Derba est contrée",
      ultimateCounterTitle: "Contre Ultime",
      ultimateCounterDesc: "Contre-attaque ultime",
      clash: "Clash ! Les deux ont Ronda !",
      clashWon: "Clash gagné avec {type} ! (+{pts}) - {name}",
      clashDraw: "Clash : Égalité !",
      kingFinish: "👑 King Finish ! (+5)",
      tringaWins: "La Tringa bat la Ronda ! (+6) - {name}",
      finalFailTitle: "Échec Final",
      finalFailDesc: "Dernière carte manquée ! (+5 pour l'adversaire)",
      asFinishTitle: "As Finish",
      asFinishDesc: "A gagné avec l'As ! (+5 pour l'adversaire)"
    }
  },
  de: {
    singleplayer: "Einzelspieler",
    playVsBot: "Gegen KI spielen",
    onlineMultiplayer: "Online-Mehrspieler",
    matchId: "Match-ID",
    enterRoomId: "Raum-ID eingeben",
    logo: "RONDA",
    host: "Erstellen",
    join: "Beitreten",
    opponent: "Gegner",
    you: "Du",
    yourTurn: "(Du bist dran)",
    cards: "Karten:",
    tableEmpty: "Der Tisch ist leer",
    gameOver: "Spiel vorbei!",
    itsADraw: "Unentschieden!",
    youWon: "Du hast gewonnen!",
    opponentWon: "Der Gegner hat gewonnen!",
    playAgain: "Nochmal spielen",
    mainMenu: "Hauptmenü",
    cardsRemaining: "Verbleibende Karten",
    played: "Gespielt",
    roundOver: "Runde vorbei!",
    totalGames: "Gesamtsiege",
    shareText: "Tritt meinem Ronda-Spiel bei!",
    linkCopied: "Link in die Zwischenablage kopiert!",
    donateBtn: "Spendier uns einen Minztee",
    donateMsg: "Gefällt dir das Spiel? Spendier dem Team einen Minztee!",
    connecting: "Verbindung wird hergestellt...",
    connectingDetail: "Warten auf Antwort vom Spielserver.",
    roomOccupied: "Raum ist besetzt, bitte wähle einen anderen Namen.",
    roomFull: "Raum ist voll.",
    backToMenu: "Zurück zum Menü",
    shareLink: "Einladungslink kopieren",
    announcements: {
      ronda: "Ronda! (+1) - {name}",
      tringa: "Tringa! (+5) - {name}",
      missa: "Missa! (+1) - {name}",
      derba: "Derba! (+1) - {name}",
      taawida: "Taawida! - {name}",
      counterAttackTitle: "Gegenangriff",
      counterAttackDesc: "Derba wurde gekontert",
      ultimateCounterTitle: "Ultimativer Konter",
      ultimateCounterDesc: "Ultimativer Gegenangriff",
      clash: "Clash! Beide haben Ronda!",
      clashWon: "Clash gewonnen mit {type}! (+{pts}) - {name}",
      clashDraw: "Clash Unentschieden!",
      kingFinish: "👑 King Finish! (+5)",
      tringaWins: "Tringa schlägt Ronda! (+6) - {name}",
      finalFailTitle: "Finaler Fehlschlag",
      finalFailDesc: "Letzte Karte verpasst! (+5 für den Gegner)",
      asFinishTitle: "As-Finish",
      asFinishDesc: "Mit dem Ass gewonnen! (+5 für den Gegner)"
    }
  },
  ar: {
    singleplayer: "لاعب واحد",
    playVsBot: "اللعب ضد الذكاء الاصطناعي",
    onlineMultiplayer: "اللعب عبر الإنترنت",
    matchId: "رقم الغرفة",
    enterRoomId: "أدخل رقم الغرفة",
    logo: "روندا",
    host: "إنشاء",
    join: "انضمام",
    opponent: "الخصم",
    you: "أنت",
    yourTurn: "(دورك)",
    cards: "البطاقات:",
    tableEmpty: "الطاولة فارغة",
    gameOver: "انتهت اللعبة!",
    itsADraw: "تعادل!",
    youWon: "لقد فزت!",
    opponentWon: "فاز الخصم!",
    playAgain: "العب مرة أخرى",
    mainMenu: "القائمة الرئيسية",
    cardsRemaining: "البطاقات المتبقية",
    played: "لعبت",
    roundOver: "انتهت الجولة!",
    totalGames: "إجمالي الانتصارات",
    shareText: "انضم إلى لعبة روندا الخاصة بي!",
    linkCopied: "تم نسخ الرابط إلى الحافظة!",
    donateBtn: "اهدي الفريق كاس د أتاي بالنعناع",
    donateMsg: "عجباتك اللعبة؟ اهدي الفريق المطور كاس د أتاي!",
    connecting: "جاري الاتصال...",
    connectingDetail: "في انتظار استجابة خادم اللعبة.",
    roomOccupied: "الغرفة محجوزة، يرجى اختيار اسم آخر.",
    roomFull: "الغرفة ممتلئة.",
    backToMenu: "العودة للقائمة",
    shareLink: "نسخ رابط الدعوة",
    announcements: {
      ronda: "روندا (+1) - {name}",
      tringa: "ترينجا (+5) - {name}",
      missa: "ميسة (+1) - {name}",
      derba: "ضربة (+1) - {name}",
      taawida: "تعويدة - {name}",
      counterAttackTitle: "هجوم مضاد",
      counterAttackDesc: "تم صد الضربة",
      ultimateCounterTitle: "صد نهائي",
      ultimateCounterDesc: "هجوم مضاد نهائي",
      clash: "إصطدام الروندات",
      clashWon: "فوز في التصادم بـ {type}! (+{pts}) - {name}",
      clashDraw: "تعادل في التصادم",
      kingFinish: "👑 نهاية الملك! (+5)",
      tringaWins: "ترينجا تغلب روندا! (+6) - {name}",
      finalFailTitle: "خيبة الختام",
      finalFailDesc: "فشل في الورقة الأخيرة! (+5 للخصم)",
      asFinishTitle: "نهاية بالآص",
      asFinishDesc: "ربح بالآص في الأخير! (+5 للخصم)"
    }
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('ronda-lang') || 'en';
  });

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('ronda-lang', lang);
  };

  const t = (key, params = {}) => {
    const keys = key.split('.');
    let value = translations[language];
    for (const k of keys) {
      if (value[k] === undefined) return key;
      value = value[k];
    }

    if (typeof value === 'string' && Object.keys(params).length > 0) {
      return Object.keys(params).reduce((str, paramKey) => {
        return str.replace(`{${paramKey}}`, params[paramKey]);
      }, value);
    }
    return value;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      <div dir={language === 'ar' ? 'rtl' : 'ltr'}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
