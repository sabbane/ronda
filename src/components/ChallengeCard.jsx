export const ChallengeCard = ({
  challenge,
  isUnlocked,
  isCompleted,
  t,
  onStartChallenge,
  playClick
}) => {
  const title = t(challenge.titleKey) || challenge.id;
  const desc = t(challenge.descKey) || '';

  return (
    <div
      className={`p-5 rounded-2xl border transition-all flex flex-col justify-between backdrop-blur-md ${
        isCompleted
          ? 'bg-emerald-950/40 border-emerald-500/40 shadow-lg'
          : isUnlocked
          ? 'bg-black/40 border-amber-500/30 hover:border-amber-400/60 shadow-md'
          : 'bg-black/20 border-white/5 opacity-60'
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-400/20 flex items-center justify-center text-xl">
            {isCompleted ? '✅' : isUnlocked ? '🎯' : '🔒'}
          </div>
          <div>
            <h3 className="text-base font-bold text-white leading-snug">{title}</h3>
            <span className="text-xs font-semibold text-amber-300">
              +{challenge.points} Pts
            </span>
          </div>
        </div>
        {isCompleted && (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            {t('completed') || 'Completed'}
          </span>
        )}
      </div>

      <p className="text-xs text-slate-300 mb-4 line-clamp-2 leading-relaxed">
        {desc}
      </p>

      <button
        disabled={!isUnlocked}
        onClick={() => {
          playClick();
          onStartChallenge(challenge.id);
        }}
        className={`w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
          !isUnlocked
            ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
            : isCompleted
            ? 'bg-emerald-600/80 hover:bg-emerald-600 text-white'
            : 'btn-moroccan-gold text-slate-900'
        }`}
      >
        {!isUnlocked
          ? (t('locked') || 'Locked')
          : isCompleted
          ? (t('playAgain') || 'Play Again')
          : (t('startChallenge') || 'Start Challenge')}
      </button>
    </div>
  );
};
