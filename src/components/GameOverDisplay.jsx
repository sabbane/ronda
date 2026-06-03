import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { adService } from '../services/AdService';

export const GameOverDisplay = ({
  showGameOverOverlay,
  opponentLeft,
  didIWin,
  t,
  winner,
  myTeamMatchesWon,
  oppTeamMatchesWon,
  myTeamName,
  oppTeamName,
  myTeamScore,
  oppTeamScore,
  playClick,
  setIsAdPlaying,
  moves,
  language,
}) => {
  const moroccanSymbols = [
    // Khamsa (Hand of Fatima)
    ({ color }) => (
      <svg viewBox="0 0 64 80" fill={color} xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
        <path d="M32 2 C28 2 26 6 26 10 L26 30 C22 28 18 28 16 32 C14 36 16 40 20 41 L20 55 C20 62 25 68 32 68 C39 68 44 62 44 55 L44 41 C48 40 50 36 48 32 C46 28 42 28 38 30 L38 10 C38 6 36 2 32 2 Z M22 12 C20 12 18 14 18 16 L18 36 C17 36 14 35 13 33 C12 30 14 27 17 28 L17 14 C17 11 19 10 21 10 C23 10 24 11 24 13 Z M42 12 C44 12 46 14 46 16 L46 36 C47 36 50 35 51 33 C52 30 50 27 47 28 L47 14 C47 11 45 10 43 10 C41 10 40 11 40 13 Z"/>
        <circle cx="32" cy="45" r="5"/>
      </svg>
    ),
    // 8-pointed star (Moroccan Zellige)
    ({ color }) => (
      <svg viewBox="0 0 64 64" fill={color} xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
        <polygon points="32,4 37,24 56,19 41,32 56,45 37,40 32,60 27,40 8,45 23,32 8,19 27,24"/>
        <polygon points="32,4 37,24 56,19 41,32 56,45 37,40 32,60 27,40 8,45 23,32 8,19 27,24" transform="rotate(22.5 32 32)" opacity="0.6"/>
      </svg>
    ),
    // Crescent Moon
    ({ color }) => (
      <svg viewBox="0 0 64 64" fill={color} xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
        <path d="M32 6 C18 6 8 17 8 32 C8 47 18 58 32 58 C40 58 47 54 51 48 C47 50 42 51 38 49 C27 45 20 34 23 22 C25 14 31 8 38 6 C36 6 34 6 32 6 Z"/>
      </svg>
    ),
    // Moroccan Lantern (Fanar)
    ({ color }) => (
      <svg viewBox="0 0 40 70" fill={color} xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
        <rect x="17" y="0" width="6" height="8" rx="2"/>
        <polygon points="20,8 5,18 5,55 20,62 35,55 35,18"/>
        <line x1="5" y1="25" x2="35" y2="25" stroke="black" strokeWidth="1.5" opacity="0.3"/>
        <line x1="5" y1="35" x2="35" y2="35" stroke="black" strokeWidth="1.5" opacity="0.3"/>
        <line x1="5" y1="45" x2="35" y2="45" stroke="black" strokeWidth="1.5" opacity="0.3"/>
        <polygon points="20,62 10,68 30,68" />
      </svg>
    ),
    // Arabesque / Geometric flower
    ({ color }) => (
      <svg viewBox="0 0 64 64" fill={color} xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
        <circle cx="32" cy="32" r="10"/>
        {[0,45,90,135,180,225,270,315].map((angle, i) => (
          <ellipse key={i} cx="32" cy="32" rx="6" ry="16"
            transform={`rotate(${angle} 32 32)`} opacity="0.75"/>
        ))}
      </svg>
    ),
  ];

  const [confettiConfig] = React.useState(() => {
    const colors = ['#fde047', '#f97316', '#34d399', '#f472b6', '#a78bfa', '#38bdf8', '#fb7185', '#4ade80'];
    return [...Array(40)].map((_, i) => ({
      left: `${Math.random() * 100}vw`,
      scale: Math.random() * 0.6 + 0.4,
      rotateTo: Math.random() * 720 - 360,
      xTo: `+=${Math.random() * 120 - 60}px`,
      duration: Math.random() * 4 + 3,
      delay: Math.random() * 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      symbolIndex: i % 5,
    }));
  });

  const getOpponentLeftTitle = () => t('opponentLeftTitle');
  const getOpponentLeftMsg = () => t('opponentLeftMsg');

  return (
    <>
      {/* Game Over / Round Over Overlay */}
      <AnimatePresence>
        {showGameOverOverlay && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          >
            {didIWin && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {confettiConfig.map((confetti, i) => {
                  const Symbol = moroccanSymbols[confetti.symbolIndex];
                  return (
                    <motion.div
                      key={i}
                      initial={{ 
                         top: -80, 
                         left: confetti.left,
                         scale: confetti.scale,
                         rotate: 0,
                         opacity: 0.85,
                      }}
                      animate={{ 
                         top: '110vh',
                         rotate: confetti.rotateTo,
                         x: confetti.xTo,
                      }}
                      transition={{ 
                         duration: confetti.duration, 
                         repeat: Infinity, 
                         ease: 'linear',
                         delay: confetti.delay,
                      }}
                      className="absolute w-8 h-8 sm:w-10 sm:h-10"
                      style={{ filter: `drop-shadow(0 0 4px ${confetti.color}88)` }}
                    >
                      <Symbol color={confetti.color} />
                    </motion.div>
                  );
                })}
              </div>
            )}
            <motion.div 
              initial={didIWin ? { scale: 0.5, rotate: -5, y: 50 } : { scale: 0.8, y: 50 }}
              animate={didIWin ? { scale: [0.5, 1.1, 1], rotate: 0, y: 0 } : { scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="bg-slate-800 pt-8 pb-10 px-12 rounded-3xl border border-slate-700 shadow-2xl text-center relative z-10 max-w-lg w-full mx-4"
            >
              <h2 className="text-5xl font-bold mb-3 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent leading-tight">
                {t('gameOver')}
              </h2>
              <div className="text-3xl mb-4 font-bold">
                {winner === 'Draw' 
                  ? <motion.span 
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      className="text-amber-400 flex flex-col gap-2 items-center"
                    >
                      <span>🤝 {t('itsADraw')} 🤝</span>
                    </motion.span>
                  : didIWin 
                    ? <span className="text-emerald-400 flex flex-col gap-2 items-center">
                        <span>🎉 {t('youWon')} 🎉</span>
                      </span>
                    : (winner === null 
                        ? t('roundOver') 
                        : <span className="text-rose-400 flex flex-col gap-3 items-center">
                            <span>💔 {t('youLost')} 💔</span>
                            <motion.span 
                              animate={{ y: [0, -5, 0] }}
                              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                              className="text-base sm:text-lg text-slate-300 mt-2 font-normal italic"
                            >
                              {t('rematchMotivation')}
                            </motion.span>
                          </span>)
              }
              </div>
              <div className="text-lg text-slate-400 mb-8 font-semibold uppercase tracking-widest">
                {t('totalGames') || 'Total Games'}: {myTeamMatchesWon} - {oppTeamMatchesWon}
              </div>
              <div className="flex gap-8 justify-center text-xl bg-slate-900/50 p-6 rounded-2xl border border-slate-700/50">
                <div className="flex flex-col items-center">
                  <span className="text-sm text-slate-400 mb-1">{myTeamName}</span>
                  <span className="text-3xl font-bold text-indigo-400">
                    {myTeamScore}
                  </span>
                </div>
                <div className="w-px bg-slate-700"></div>
                <div className="flex flex-col items-center">
                  <span className="text-sm text-slate-400 mb-1">{oppTeamName}</span>
                  <span className="text-3xl font-bold text-purple-400">
                    {oppTeamScore}
                  </span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <button 
                  onClick={() => {
                    playClick();
                    adService.showInterstitial({
                      onBeforeAd: () => setIsAdPlaying(true),
                      onComplete: () => {
                        setIsAdPlaying(false);
                        moves.restartGame();
                      }
                    });
                  }}
                  className="btn-moroccan-primary px-8 py-3.5 rounded-2xl font-bold text-base cursor-pointer"
                >
                  {t('playAgain')}
                </button>
                <button 
                  onClick={() => {
                    playClick();
                    adService.showInterstitial({
                      onBeforeAd: () => setIsAdPlaying(true),
                      onComplete: () => {
                        setIsAdPlaying(false);
                        window.dispatchEvent(new CustomEvent('ronda-menu'));
                      }
                    });
                  }}
                  className="btn-moroccan-secondary px-8 py-3.5 rounded-2xl font-bold text-base cursor-pointer"
                >
                  {t('mainMenu')}
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Opponent Left Overlay */}
      <AnimatePresence>
        {opponentLeft && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-center justify-center bg-black/85 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="bg-slate-800 pt-8 pb-10 px-12 rounded-3xl border border-slate-700 shadow-2xl text-center relative z-10 max-w-lg w-full mx-4"
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-rose-400 to-amber-400 bg-clip-text text-transparent leading-tight">
                {getOpponentLeftTitle()}
              </h2>
              <p className="text-slate-300 text-base sm:text-lg mb-8 font-medium">
                {getOpponentLeftMsg()}
              </p>
              <div className="flex justify-center mt-6">
                <button 
                  onClick={() => {
                    playClick();
                    window.dispatchEvent(new CustomEvent('ronda-menu'));
                  }}
                  className="btn-moroccan-primary px-8 py-3.5 rounded-2xl font-bold text-base cursor-pointer"
                >
                  {t('mainMenu')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
