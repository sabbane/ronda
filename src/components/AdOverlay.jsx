import { motion, AnimatePresence } from 'framer-motion';

export const AdOverlay = ({ isAdPlaying, t }) => {
  return (
    <AnimatePresence>
      {isAdPlaying && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-md"
        >
          <div className="relative flex flex-col items-center p-8 rounded-3xl bg-slate-900/60 border border-white/10 shadow-2xl max-w-sm text-center">
            {/* Modern Ripple/Pulse Loading Ring */}
            <div className="relative w-16 h-16 mb-4 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20"></div>
              <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 animate-spin"></div>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400 animate-pulse">
                <rect width="20" height="15" x="2" y="7" rx="2" ry="2"/>
                <path d="M17 2H7v5h10V2Z"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-100 uppercase tracking-wider mb-2">
              {t('adLoading')}
            </h3>
            <p className="text-sm text-slate-400">
              {t('rematchMotivation')}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
