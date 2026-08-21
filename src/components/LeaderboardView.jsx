import { useState, useEffect, useCallback } from 'react';
import { challengeService } from '../services/challengeService';

export const LeaderboardView = ({ t, username, myPlayerId }) => {
  const [period, setPeriod] = useState('monthly');
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    const data = await challengeService.fetchLeaderboard(period);
    setEntries(data);
    setLoading(false);
  }, [period]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getRankBadge = (rank) => {
    if (rank === 0) return '🥇';
    if (rank === 1) return '🥈';
    if (rank === 2) return '🥉';
    return `#${rank + 1}`;
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="grid grid-cols-2 gap-2 bg-black/40 p-1 rounded-xl border border-white/10">
        <button
          type="button"
          onClick={() => setPeriod('monthly')}
          className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            period === 'monthly'
              ? 'bg-amber-600 border border-amber-400 text-white shadow-inner'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          {t('monthlySeason') || 'Monthly Season'}
        </button>
        <button
          type="button"
          onClick={() => setPeriod('alltime')}
          className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            period === 'alltime'
              ? 'bg-amber-600 border border-amber-400 text-white shadow-inner'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          {t('allTimeLeaderboard') || 'All-Time'}
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400 text-xs animate-pulse flex items-center justify-center gap-2">
          <span className="w-4 h-4 rounded-full border-2 border-t-amber-400 border-white/10 animate-spin"></span>
          {t('loadingLeaderboard') || 'Loading Leaderboard...'}
        </div>
      ) : entries.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-xs bg-black/20 rounded-xl border border-white/5 p-4">
          {t('noLeaderboardEntries') || 'No records found yet for this season. Be the first to score!'}
        </div>
      ) : (
        <div className="max-h-[300px] overflow-y-auto flex flex-col gap-2 pr-1 custom-scrollbar">
          {entries.map((entry, idx) => {
            const displayName = entry.displayName || entry.username || 'Player';
            const isMe = (myPlayerId && entry.playerId === myPlayerId) ||
                         (username && displayName.toLowerCase() === username.toLowerCase());
            return (
              <div
                key={`${entry.playerId || entry.username}-${idx}`}
                className={`flex justify-between items-center p-3 rounded-xl border transition-all ${
                  isMe
                    ? 'bg-amber-500/20 border-amber-400/50 text-amber-200'
                    : 'bg-white/5 border-white/5 text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 text-center font-bold text-sm">
                    {getRankBadge(idx)}
                  </span>
                  <div className="flex items-center gap-1.5 truncate max-w-[140px] sm:max-w-[200px]">
                    <span className="font-semibold text-xs sm:text-sm truncate">
                      {displayName}
                    </span>
                    {entry.discriminator && (
                      <span className="text-[10px] text-slate-400 font-mono">
                        #{entry.discriminator}
                      </span>
                    )}
                  </div>
                </div>
                <span className="font-mono font-extrabold text-xs sm:text-sm text-amber-300">
                  {entry.points} Pts
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
