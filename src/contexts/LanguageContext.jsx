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
      ronda: "{name} has Ronda! (+1)",
      tringa: "{name} has Tringa! (+5)",
      missa: "{name} cleared the table! (+1)",
      derba: "{name} scored a Derba! (+1)",
      taawida: "{name} scored a Taawida!",
      clash: "Clash! Both have cards!",
      clashWon: "{name} won Clash with {type}! (+{pts})",
      clashDraw: "Clash Draw!",
      kingFinish: "👑 King Finish! (+5)",
      tringaBeatsRonda: "{name}'s Tringa beats Ronda! (+6)"
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
    roomOccupied: "La salle ist occupée, veuillez choisir un autre nom.",
    roomFull: "La salle est pleine.",
    backToMenu: "Retour au Menu",
    shareLink: "Copier le lien d'invitation",
    announcements: {
      ronda: "{name} a Ronda ! (+1)",
      tringa: "{name} a Tringa ! (+5)",
      missa: "{name} a fait Missa ! (+1)",
      derba: "{name} a fait Derba ! (+1)",
      taawida: "{name} a fait Taawida !",
      clash: "Clash ! Les deux ont des cartes !",
      clashWon: "{name} a gagné le Clash avec {type} ! (+{pts})",
      clashDraw: "Clash : Égalité !",
      kingFinish: "👑 King Finish ! (+5)",
      tringaBeatsRonda: "La Tringa de {name} bat la Ronda ! (+6)"
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
      ronda: " روندا (+1) ",
      tringa: " ترينجا (+5) ",
      missa: " ميسة (+1) ",
      derba: " ضربة (+1) ",
      taawida: " تعويدة ",
      clash: "إصطدام الروندات",
      clashWon: "فاز بالتصادم بـ {type}! (+{pts}) {name}",
      clashDraw: "تعادل في التصادم",
      kingFinish: "👑 نهاية الملك! (+5)",
      tringaBeatsRonda: "ترينجا {name} تغلب روندا! (+6)"
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
