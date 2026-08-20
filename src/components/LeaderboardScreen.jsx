import { useState, useEffect } from 'react';
import { challengeService } from '../services/challengeService';
import { LeaderboardView } from './LeaderboardView';
import { AccountSyncModal } from './AccountSyncModal';

export const LeaderboardScreen = ({ onBack, playClick, t, previousMode }) => {
  const [handle, setHandle] = useState('');
  const [playerId, setPlayerId] = useState('');
  const [points, setPoints] = useState(0);
  const [showSyncModal, setShowSyncModal] = useState(false);

  const refreshProfile = () => {
    setHandle(challengeService.getFullHandle());
    setPlayerId(challengeService.getPlayerId());
    setPoints(challengeService.getProgress().totalPoints || 0);
  };

  useEffect(() => {
    refreshProfile();
  }, []);

  const backButtonLabel = previousMode === 'challenge_menu'
    ? (t('back') || 'Back')
    : (t('backToMenu') || 'Back to Main Menu');

  return (
    <div className="min-h-screen flex flex-col items-center text-white relative overflow-y-auto bg-slate-950 p-4">
      <div className="flex-1 flex flex-col w-full items-center justify-center max-w-lg z-10 py-6">
        <div
          className="p-6 sm:p-8 rounded-3xl border-2 border-amber-400/30 text-center w-full relative shadow-2xl flex flex-col gap-5"
          style={{ backgroundColor: 'rgba(30, 58, 138, 0.85)' }}
        >
          {/* Header */}
          <div className="flex justify-between items-center border-b border-white/10 pb-4">
            <div className="flex items-center gap-2 text-left">
              <span className="text-lg font-black text-white truncate max-w-[170px]" title={handle}>
                {handle || 'Player'}
              </span>
              <button
                onClick={() => { playClick(); setShowSyncModal(true); }}
                className="p-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/30 border border-amber-400/30 text-amber-300 text-xs font-bold transition-all cursor-pointer"
                title={t('syncAccount') || 'Sync Account'}
              >
                🔄
              </button>
            </div>
            <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-xl border border-amber-400/30">
              <span className="text-base">🏆</span>
              <span className="text-sm font-black text-amber-300 font-mono">
                {points} Pts
              </span>
            </div>
          </div>

          {/* Leaderboard Dual-Tab List */}
          <LeaderboardView t={t} username={handle} myPlayerId={playerId} />

          {/* Back Button */}
          <div className="pt-2 border-t border-white/10">
            <button
              onClick={() => {
                playClick();
                onBack();
              }}
              className="w-full btn-moroccan-secondary py-3 rounded-xl font-bold text-sm cursor-pointer active:scale-95 transition-transform"
            >
              {backButtonLabel}
            </button>
          </div>
        </div>
      </div>

      <AccountSyncModal
        isOpen={showSyncModal}
        onClose={() => setShowSyncModal(false)}
        t={t}
        playClick={playClick}
        onSyncSuccess={refreshProfile}
      />
    </div>
  );
};
