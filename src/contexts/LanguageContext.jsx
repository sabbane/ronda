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
    announcements: {
      ronda: "{name} has Ronda! (+1)",
      tringa: "{name} has Tringa! (+5)",
      missa: "{name} cleared the table! (+1)",
      derba: "{name} scored a Derba! (+1)",
      clash: "Clash! Both have cards!",
      clashWon: "{name} won Clash with {type}! (+5)",
      clashDraw: "Clash Draw!"
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
    announcements: {
      ronda: "{name} a Ronda ! (+1)",
      tringa: "{name} a Tringa ! (+5)",
      missa: "{name} a fait Missa ! (+1)",
      derba: "{name} a fait Derba ! (+1)",
      clash: "Clash ! Les deux ont des cartes !",
      clashWon: "{name} a gagné le Clash avec {type} ! (+5)",
      clashDraw: "Clash : Égalité !"
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
    announcements: {
      ronda: "عنده روندا! (+1) {name}",
      tringa: "عنده ترينجا! (+5) {name}",
      missa: "مسح الطاولة! (+1) {name}",
      derba: "دار ضربة! (+1) {name}",
      clash: "تصادم! كلاهما لديه بطاقات!",
      clashWon: "فاز بالتصادم بـ {type}! (+5) {name}",
      clashDraw: "تعادل في التصادم!"
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
