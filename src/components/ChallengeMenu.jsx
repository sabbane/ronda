import { useState, useEffect } from 'react';
import { CHALLENGES } from '../game/challenges';
import { challengeService } from '../services/challengeService';
import { ChallengeCard } from './ChallengeCard';
import { LeaderboardView } from './LeaderboardView';

export const ChallengeMenu = ({ onStartChallenge, onBack, playClick, t }) => {
  const [activeTab, setActiveTab] = useState('challenges');
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
              <span className="text-[10px] uppercase font-bold text-amber-300 tracking-wider">
                {t('singleplayerPlayer') || 'Player'}
              </span>
              <span className="text-lg font-black text-white truncate max-w-[180px]">
                {username || 'Player'}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-xl border border-amber-400/30">
              <span className="text-base">🏆</span>
              <span className="text-sm font-black text-amber-300 font-mono">
                {progress.totalPoints} Pts
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="grid grid-cols-2 gap-2 bg-black/40 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => { playClick(); setActiveTab('challenges'); }}
              className={`py-2.5 px-3 rounded-lg text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'challenges'
                  ? 'bg-amber-600 border border-amber-400 text-white shadow-inner'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🎯 {t('challengesTab') || 'Challenges'}
            </button>
            <button
              onClick={() => { playClick(); setActiveTab('leaderboard'); }}
              className={`py-2.5 px-3 rounded-lg text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'leaderboard'
                  ? 'bg-amber-600 border border-amber-400 text-white shadow-inner'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🏆 {t('leaderboardTab') || 'Leaderboard'}
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'challenges' ? (
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
          ) : (
            <LeaderboardView t={t} username={username} />
          )}

          {/* Back Button */}
          <div className="pt-2 border-t border-white/10">
            <button
              onClick={() => { playClick(); onBack(); }}
              className="w-full btn-moroccan-secondary py-3 rounded-xl font-bold text-sm cursor-pointer"
            >
              {t('backToMenu') || 'Back to Main Menu'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
