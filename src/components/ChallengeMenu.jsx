import { useState, useEffect } from 'react';
import { CHALLENGES } from '../game/challenges';
import { challengeService } from '../services/challengeService';
import { ChallengeCard } from './ChallengeCard';

export const ChallengeMenu = ({ onStartChallenge, onOpenLeaderboard, onBack, playClick, t }) => {
  const [progress, setProgress] = useState({ completed: [], totalPoints: 0 });
  const [username, setUsername] = useState('');

  useEffect(() => {
    setProgress(challengeService.getProgress());
    setUsername(challengeService.getUsername());
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center text-white relative overflow-y-auto bg-slate-950 p-4">
      <div className="flex-1 flex flex-col w-full items-center justify-center max-w-lg z-10 py-6">
        <div
          className="p-6 rounded-3xl border-2 border-amber-400/30 text-center w-full relative shadow-2xl flex flex-col gap-6"
          style={{ backgroundColor: 'rgba(30, 58, 138, 0.85)' }}
        >
          {/* Header */}
          <div className="flex justify-between items-center border-b border-white/10 pb-4">
            <div className="flex flex-col text-left">
              <span className="text-lg font-black text-white truncate max-w-[180px]">
                {username || 'Player'}
              </span>
            </div>
            <button
              onClick={() => {
                playClick();
                if (onOpenLeaderboard) onOpenLeaderboard();
              }}
              className="flex items-center gap-2 bg-black/40 hover:bg-black/60 px-3.5 py-1.5 rounded-xl border border-amber-400/30 hover:border-amber-400/60 transition-all cursor-pointer active:scale-95 shadow-md"
              title={t('viewLeaderboard') || 'Click to view Leaderboard'}
            >
              <span className="text-base">🏆</span>
              <span className="text-sm font-black text-amber-300 font-mono">
                {progress.totalPoints} Pts
              </span>
            </button>
          </div>

          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-amber-300">
              {t('challengesTab') || 'Challenges'}
            </h2>
            <span className="text-xs font-semibold text-slate-300">
              {progress.completed.length} / {CHALLENGES.length} {t('completed') || 'Completed'}
            </span>
          </div>

          {/* Challenges List */}
          <div className="flex flex-col gap-4 text-left">
            {CHALLENGES.map((ch) => {
              const isCompleted = progress.completed.includes(ch.id);
              const isUnlocked =
                !ch.prerequisiteId || progress.completed.includes(ch.prerequisiteId);

              return (
                <ChallengeCard
                  key={ch.id}
                  challenge={ch}
                  isUnlocked={isUnlocked}
                  isCompleted={isCompleted}
                  t={t}
                  playClick={playClick}
                  onStartChallenge={onStartChallenge}
                />
              );
            })}
          </div>

          {/* Back Button */}
          <div className="pt-2 border-t border-white/10">
            <button
              onClick={() => {
                playClick();
                onBack();
              }}
              className="w-full btn-moroccan-secondary py-3 rounded-xl font-bold text-sm cursor-pointer active:scale-95 transition-transform"
            >
              {t('backToMenu') || 'Back to Main Menu'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
