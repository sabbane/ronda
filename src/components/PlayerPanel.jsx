import { motion } from 'framer-motion';
import { PlayerHand } from './PlayerHand';
import { Volume2, VolumeX, Music } from 'lucide-react';
import { useSound } from '../contexts/SoundContext';
import backCard from '../assets/cards/back.png';

export const PlayerPanel = ({
  G,
  myID,
  t,
  isCurrentPlayer,
  canCounterDarba,
  isProcessing,
  handlePlayCard,
  playedCardId,
  activeEvent,
}) => {
  const {
    isMuted,
    toggleMute,
    currentTrack,
    tracks,
    nextTrack,
    playClick
  } = useSound();

  return (
    <div className="w-full max-w-4xl relative z-20 shrink-0">
      <div className="flex justify-between items-center px-4 sm:px-8 mt-0 sm:mt-2">
        <div className="flex items-center gap-3">
          <div className={`text-lg font-medium ${isCurrentPlayer(myID) ? 'text-indigo-400' : 'text-slate-400'}`}>
            {G.players[myID]?.name || t('you')}
            {' '}{isCurrentPlayer(myID) && t('yourTurn')}
          </div>
          {isCurrentPlayer(myID) && (
            <span className="flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
            </span>
          )}
        </div>
        <div className="flex gap-4 items-center">
          <div className="relative w-8 h-12">
            {G.players[myID]?.captured.map((card) => (
              <motion.div
                key={`cap-me-${card.id}`}
                layoutId={`card-${card.id}`}
                transition={{ type: "spring", stiffness: 40, damping: 12, mass: 1.2 }}
                className="absolute inset-0 bg-indigo-900/50 border border-indigo-700/50 rounded-sm shadow-sm"
              />
            ))}
          </div>
          <div className="bg-slate-800 px-4 py-1 rounded-full text-sm border border-slate-700 shadow-inner flex items-center gap-2">
            <span className="text-slate-400">{t('cards')}</span>
            <span className="font-bold text-lg text-indigo-400">
              {((G.players && G.players[myID]?.captured?.length) || 0) + ((G.players && G.players[myID]?.score) || 0)}
            </span>
          </div>
        </div>
      </div>
      
      <PlayerHand 
        hand={(G.players && G.players[myID]?.hand) || []} 
        isCurrentPlayer={(isCurrentPlayer(myID) || canCounterDarba) && !isProcessing} 
        onPlayCard={handlePlayCard} 
        dealDelays={[0.0, 1.2, 2.4]}
        playedCardId={playedCardId}
        counterCardValue={canCounterDarba ? activeEvent.currentVal : null}
      />

      {/* Deck Info & Sound Toggle - Moved below player hand to prevent overlap on mobile */}
      <div className="flex justify-between items-center px-2 sm:px-8 mt-4 sm:mt-6 pb-4 sm:pb-6 w-full">
        <div className="flex items-center gap-2 bg-slate-800/80 backdrop-blur px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-slate-700 shadow-lg z-20">
          <div className="w-5 h-7 sm:w-6 sm:h-8 rounded-md border border-slate-200/30 shadow overflow-hidden flex-shrink-0 bg-white">
            <img src={backCard} alt="Card Back" className="w-full h-full object-cover" />
          </div>
          <span className="text-slate-300 font-medium text-xs sm:text-sm">{t('cardsRemaining')}: {G.deck.length}</span>
        </div>

        {/* Sound & Music Controls */}
        <div className="flex items-center gap-2 z-20">
          {/* Music Selector Button */}
          <button 
            onClick={() => { playClick(); nextTrack(); }}
            className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-slate-800/80 hover:bg-slate-700 backdrop-blur-md text-slate-200 rounded-full border border-slate-700 transition-all duration-75 active:translate-y-[2px] shadow-md cursor-pointer"
            title={tracks && tracks[currentTrack] ? `${t('changeTrack')}: ${tracks[currentTrack].name}` : t('changeTrack')}
          >
            <div className="relative flex items-center justify-center">
              <Music 
                size={16} 
                className={tracks && tracks[currentTrack]?.name === "No Sound" ? "text-slate-400" : "text-amber-400 animate-pulse"} 
              />
              {tracks && tracks[currentTrack]?.name === "No Sound" && (
                <div className="absolute w-[20px] h-[1.5px] bg-red-400 rotate-45 rounded-sm shadow-sm" />
              )}
            </div>
            <span className="text-slate-300 font-medium text-xs sm:text-sm">{tracks && tracks[currentTrack] ? tracks[currentTrack].name : t('music')}</span>
          </button>

          {/* Sound Toggle Button */}
          <button 
            onClick={toggleMute}
            className="flex items-center justify-center p-2.5 sm:p-3 bg-slate-800/80 hover:bg-slate-700 backdrop-blur-md text-slate-200 rounded-full border border-slate-700 transition-all duration-75 active:translate-y-[2px] shadow-md cursor-pointer"
            title={isMuted ? t('unmuteSound') : t('muteSound')}
          >
            {isMuted ? <VolumeX size={16} className="text-red-400" /> : <Volume2 size={16} className="text-emerald-400" />}
          </button>
        </div>
      </div>
    </div>
  );
};
