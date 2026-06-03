import React from 'react';

export const Scoreboard = ({
  t,
  numP,
  language,
  G,
  myID,
  isMyTeamA,
  playClick,
  moves,
}) => {
  return (
    <>
      {/* Back to Menu Button */}
      <div className="absolute top-4 start-4 z-[60]">
        <button 
          onClick={() => {
            playClick();
            try { moves.playerLeft(); } catch { /* ignore */ }
            // Delay navigation to give the server time to broadcast G.playerLeft to P2
            setTimeout(() => window.dispatchEvent(new CustomEvent('ronda-menu')), 500);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800/80 hover:bg-slate-700 backdrop-blur-md text-slate-200 rounded-full border border-white/15 transition-all duration-75 active:translate-y-[2px] shadow-md group cursor-pointer"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="18" height="18" 
            viewBox="0 0 24 24" 
            fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            className="group-hover:-translate-x-1 transition-transform rtl:group-hover:translate-x-1"
          >
            <path d="m15 18-6-6 6-6"/>
          </svg>
          <span className="text-sm font-bold tracking-wider">{t('backToMenu')}</span>
        </button>
      </div>

      {/* Centered Team Score HUD (4-Player Mode) */}
      {numP === 4 && (
        <div className="absolute top-16 sm:top-4 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3 sm:gap-4 bg-slate-900/80 px-4 py-1.5 sm:px-5 sm:py-2 rounded-full border border-white/10 shadow-lg shadow-black/35 backdrop-blur-md transition-all">
          <span className="text-[10px] sm:text-xs font-extrabold text-amber-400 uppercase tracking-wider truncate max-w-[80px] sm:max-w-[120px]">
            {G.teamNames?.TeamA?.trim() || t('teamA')}
          </span>
          <div className="flex items-center gap-1.5 sm:gap-2 bg-black/45 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-lg border border-white/5 font-mono text-sm sm:text-base font-extrabold">
            <span className="text-amber-400">
              {((G.players['0']?.captured?.length) || 0) + ((G.players['0']?.score) || 0) +
               ((G.players['2']?.captured?.length) || 0) + ((G.players['2']?.score) || 0)}
            </span>
            <span className="text-slate-500 font-bold">:</span>
            <span className="text-purple-400">
              {((G.players['1']?.captured?.length) || 0) + ((G.players['1']?.score) || 0) +
               ((G.players['3']?.captured?.length) || 0) + ((G.players['3']?.score) || 0)}
            </span>
          </div>
          <span className="text-[10px] sm:text-xs font-extrabold text-purple-400 uppercase tracking-wider truncate max-w-[80px] sm:max-w-[120px]">
            {G.teamNames?.TeamB?.trim() || t('teamB')}
          </span>
        </div>
      )}
    </>
  );
};
