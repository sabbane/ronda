import { motion } from 'framer-motion';
import { PlayerHand } from './PlayerHand';
import backRed from '../assets/cards/card_back_red.png';
import backBlue from '../assets/cards/card_back_blue.png';

export const PlayerSeats = ({
  numP,
  G,
  opponentID,
  leftID,
  topID,
  rightID,
  t,
  isCurrentPlayer,
  playedCardId,
}) => {
  const isArabic = t('opponent') === 'الخصم';
  const isTest = G?.isTestMode || (typeof window !== 'undefined' && /^\/test\//i.test(window.location.pathname));
  const oppName = G?.players?.[opponentID]?.name || (isTest && opponentID === '1' ? (isArabic ? 'الحاج' : 'El Haj') : t('opponent'));
  const topIsTeamA = topID === '0' || topID === '2';

  return (
    <>
      {numP === 2 ? (
        /* 2-Player Mode: Top Opponent */
        <div className="w-full max-w-4xl relative z-20 shrink-0 top-partner-hand">
          <div className="flex justify-between items-center px-4 sm:px-8 mb-0 sm:mb-2">
            <div className="text-base sm:text-lg font-medium text-slate-400 flex items-center gap-3">
              {oppName}
              {isCurrentPlayer(opponentID) && (
                <span className="flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-purple-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
                </span>
              )}
            </div>
            <div className="flex gap-4 items-center">
              <div className="relative w-8 h-12">
                {G.players[opponentID]?.captured.map((card) => (
                  <motion.div
                    key={`cap-opp-${card.id}`}
                    layoutId={`card-${card.id}`}
                    transition={{ type: "spring", stiffness: 40, damping: 12, mass: 1.2 }}
                    className="absolute inset-0 bg-purple-900/50 border border-purple-700/50 rounded-sm shadow-sm overflow-hidden"
                  >
                    <img src={backBlue} alt="Captured Card" className="w-full h-full object-cover" />
                  </motion.div>
                ))}
              </div>
              <div className="bg-slate-800 px-4 py-1 rounded-full text-sm border border-slate-700 shadow-inner flex items-center gap-2">
                <span className="text-slate-400">{t('cards')}</span> 
                <span className="font-bold text-lg text-purple-400 inline-block w-6 text-center">
                  {((G.players && G.players[opponentID]?.captured?.length) || 0) + ((G.players && G.players[opponentID]?.score) || 0)}
                </span>
              </div>
            </div>
          </div>
          <PlayerHand 
            hand={(G.players && G.players[opponentID]?.hand) || []} 
            isCurrentPlayer={false} 
            hidden={true}
            dealDelays={[0.6, 1.8, 3.0]}
            playedCardId={playedCardId}
            backType={G.teamColors ? G.teamColors.TeamB : "blue"}
          />
        </div>
      ) : (
        /* 4-Player Mode: Seats Layout */
        <>
          {/* 4-Player Top: Partner */}
          <div className="w-full max-w-4xl relative z-20 shrink-0 top-partner-hand">
            {(() => {
              const topName = G.players[topID]?.name || t('playerSeatName', { num: parseInt(topID) + 1 });
              const topScore = ((G.players[topID]?.captured?.length) || 0) + ((G.players[topID]?.score) || 0);
              const topColor = topIsTeamA ? 'text-amber-400' : 'text-purple-400';
              return (
                <div className="flex justify-between items-center px-4 sm:px-8 mb-0 sm:mb-2">
                  <div className={`text-base sm:text-lg font-bold flex items-center gap-3 ${isCurrentPlayer(topID) ? topColor : 'text-slate-400'}`}>
                    {topName}
                    {isCurrentPlayer(topID) && (
                      <span className="flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                      </span>
                    )}
                  </div>
                  <div className="flex gap-4 items-center">
                    <div className="relative w-8 h-12">
                      {G.players[topID]?.captured.map((card) => (
                        <motion.div
                          key={`cap-partner-${card.id}`}
                          layoutId={`card-${card.id}`}
                          transition={{ type: "spring", stiffness: 40, damping: 12, mass: 1.2 }}
                          className={`absolute inset-0 ${topIsTeamA ? 'bg-amber-900/50 border border-amber-700/50' : 'bg-purple-900/50 border border-purple-700/50'} rounded-sm shadow-sm overflow-hidden`}
                        >
                          <img src={topIsTeamA ? backRed : backBlue} alt="Captured Card" className="w-full h-full object-cover" />
                        </motion.div>
                      ))}
                    </div>
                    <div className={`bg-slate-800 px-4 py-1 rounded-full text-sm border border-slate-700 shadow-inner flex items-center gap-2`}>
                      <span className="text-slate-400">{t('cards')}</span>
                      <span className={`font-bold text-lg ${topIsTeamA ? 'text-amber-400' : 'text-purple-400'} inline-block w-6 text-center`}>
                        {topScore}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}
             <PlayerHand
              hand={(G.players && G.players[topID]?.hand) || []}
              isCurrentPlayer={false}
              hidden={true}
              dealDelays={[0.6, 1.8, 3.0]}
              playedCardId={playedCardId}
              backType={G.teamColors ? (topIsTeamA ? G.teamColors.TeamA : G.teamColors.TeamB) : (topIsTeamA ? "red" : "blue")}
            />
          </div>

          {/* Left Seat */}
          {(() => {
            const leftIsTeamA = leftID === '0' || leftID === '2';
            const leftName = G.players[leftID]?.name || t('playerSeatName', { num: parseInt(leftID) + 1 });
            const leftScore = ((G.players[leftID]?.captured?.length) || 0) + ((G.players[leftID]?.score) || 0);
            const leftScoreBadge = leftIsTeamA
              ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
              : 'bg-purple-500/10 text-purple-300 border-purple-500/20';
            const leftNameColor = isCurrentPlayer(leftID) ? (leftIsTeamA ? 'text-amber-400 animate-pulse' : 'text-purple-400 animate-pulse') : 'text-slate-300';
            return (
              <div className={`fixed left-1.5 sm:left-4 top-[45%] -translate-y-1/2 z-20 flex flex-col items-center gap-1.5 sm:gap-2 bg-slate-900/80 p-1.5 sm:p-3.5 rounded-xl sm:rounded-2xl border ${isCurrentPlayer(leftID) ? (leftIsTeamA ? 'border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.35)] ring-2 ring-amber-500/20' : 'border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.35)] ring-2 ring-purple-500/20') : 'border-white/5'} backdrop-blur-md max-w-[74px] sm:max-w-[90px] w-full text-center transition-all animate-fade-in`}>
                <div className={`text-[9px] sm:text-[10px] font-bold truncate max-w-[64px] sm:max-w-[80px] ${leftNameColor}`}>
                  {leftName}
                </div>
                {(() => {
                  const leftIsTeamA = leftID === '0' || leftID === '2';
                  const leftColor = G.teamColors ? (leftIsTeamA ? G.teamColors.TeamA : G.teamColors.TeamB) : 'blue';
                  return (
                    <PlayerHand
                      hand={(G.players && G.players[leftID]?.hand) || []}
                      isCurrentPlayer={false}
                      hidden={true}
                      layout="vertical"
                      customRotate={90}
                      dealDelays={[0.6, 1.8, 3.0]}
                      playedCardId={playedCardId}
                      backType={leftColor}
                      containerClassName="game-hand-vertical flex flex-col -space-y-3 items-center justify-center my-0.5 select-none pointer-events-none"
                    />
                  );
                })()}
                <div className={`text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${leftScoreBadge} relative`}>
                  {leftScore} pts
                  <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-0">
                    {G.players[leftID]?.captured.map((card) => (
                      <motion.div
                        key={`cap-left-${card.id}`}
                        layoutId={`card-${card.id}`}
                        className="w-full h-full"
                      />
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Right Seat */}
          {(() => {
            const rightIsTeamA = rightID === '0' || rightID === '2';
            const rightName = G.players[rightID]?.name || t('playerSeatName', { num: parseInt(rightID) + 1 });
            const rightScore = ((G.players[rightID]?.captured?.length) || 0) + ((G.players[rightID]?.score) || 0);
            const rightScoreBadge = rightIsTeamA
              ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
              : 'bg-purple-500/10 text-purple-300 border-purple-500/20';
            const rightNameColor = isCurrentPlayer(rightID) ? (rightIsTeamA ? 'text-amber-400 animate-pulse' : 'text-purple-400 animate-pulse') : 'text-slate-300';
            return (
              <div className={`fixed right-1.5 sm:right-4 top-[45%] -translate-y-1/2 z-20 flex flex-col items-center gap-1.5 sm:gap-2 bg-slate-900/80 p-1.5 sm:p-3.5 rounded-xl sm:rounded-2xl border ${isCurrentPlayer(rightID) ? (rightIsTeamA ? 'border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.35)] ring-2 ring-amber-500/20' : 'border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.35)] ring-2 ring-purple-500/20') : 'border-white/5'} backdrop-blur-md max-w-[74px] sm:max-w-[90px] w-full text-center transition-all animate-fade-in`}>
                <div className={`text-[9px] sm:text-[10px] font-bold truncate max-w-[64px] sm:max-w-[80px] ${rightNameColor}`}>
                  {rightName}
                </div>
                {(() => {
                  const rightIsTeamA = rightID === '0' || rightID === '2';
                  const rightColor = G.teamColors ? (rightIsTeamA ? G.teamColors.TeamA : G.teamColors.TeamB) : 'blue';
                  return (
                    <PlayerHand
                      hand={(G.players && G.players[rightID]?.hand) || []}
                      isCurrentPlayer={false}
                      hidden={true}
                      layout="vertical"
                      customRotate={-90}
                      dealDelays={[0.6, 1.8, 3.0]}
                      playedCardId={playedCardId}
                      backType={rightColor}
                      containerClassName="game-hand-vertical flex flex-col -space-y-3 items-center justify-center my-0.5 select-none pointer-events-none"
                    />
                  );
                })()}
                <div className={`text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${rightScoreBadge} relative`}>
                  {rightScore} pts
                  <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-0">
                    {G.players[rightID]?.captured.map((card) => (
                      <motion.div
                        key={`cap-right-${card.id}`}
                        layoutId={`card-${card.id}`}
                        className="w-full h-full"
                      />
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}
        </>
      )}
    </>
  );
};
