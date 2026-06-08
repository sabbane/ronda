import { motion, AnimatePresence } from 'framer-motion';

export const Popups = ({ activeEvent }) => {
  return (
    <AnimatePresence>
      {activeEvent && (() => {
        const isBigEvent = activeEvent.streak >= 3 || activeEvent.type === 'King Finish' || activeEvent.type === 'Final Fail' || activeEvent.type === 'As Finish';
        return (
          <motion.div 
            key={activeEvent.id}
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
          >
            {/* Nuclear Flash for Ultimate Counter (Streak 4) */}
            {activeEvent.streak === 4 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 1, 0] }}
                transition={{ duration: 0.5, times: [0, 0.1, 0.4, 1] }}
                className="fixed inset-0 bg-white z-[101]"
              />
            )}

            <motion.div
              initial={{ scale: 0.5, y: 20, rotate: -5 }}
              animate={
                activeEvent.streak === 4 
                  ? { 
                      scale: [0.5, 1.5, 1.2], 
                      rotate: [0, -10, 10, -10, 5],
                      x: [0, -25, 25, -25, 25, 0], // Extreme Screen shake
                      y: [0, -15, 15, -15, 15, 0]
                    }
                  : activeEvent.streak === 3
                  ? {
                      scale: [0.5, 1.3, 1],
                      y: [20, -30, 0], // Punch impact
                      rotate: [0, 5, 0]
                    }
                  : { scale: 1, y: 0, rotate: 0 }
              }
              transition={
                activeEvent.streak === 4 
                  ? { duration: 0.6, ease: "easeOut" }
                  : { type: "spring", stiffness: 400, damping: 12 }
              }
              className={`
                flex flex-col items-center text-center backdrop-blur-2xl
                ${isBigEvent ? 'p-10 md:p-16 rounded-[4rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] border-8' : 'p-6 md:p-10 rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.3)] border-4'}
                ${
                  activeEvent.streak === 4 ? 'bg-orange-600/95 border-yellow-400' : 
                  activeEvent.displayVariant === 'success' ? 'bg-emerald-600/95 border-emerald-400 shadow-emerald-500/40' :
                  activeEvent.displayVariant === 'danger' ? 'bg-rose-600/95 border-rose-400 shadow-rose-500/40' :
                  'bg-indigo-600/90 border-indigo-400'
                }
              `}
            >
              <motion.div
                animate={
                  activeEvent.streak === 4 
                    ? { 
                        scale: [1, 2.5, 1], 
                        filter: ["drop-shadow(0 0 0px #fff)", "drop-shadow(0 0 30px #fff)", "drop-shadow(0 0 0px #fff)"] 
                      }
                    : { scale: [1, 1.2, 1], rotate: [0, -10, 10, 0] }
                }
                transition={{ repeat: Infinity, duration: activeEvent.streak === 4 ? 0.2 : 0.8 }}
                className={`
                  ${isBigEvent ? 'text-8xl md:text-[12rem] mb-6' : 'text-6xl md:text-8xl mb-3'}
                `}
              >
                {activeEvent.displayIcon || '✨'}
              </motion.div>
              <h3 className={`
                font-black italic tracking-tighter uppercase mb-2
                ${isBigEvent ? 'text-5xl md:text-8xl' : 'text-3xl md:text-5xl'}
                ${activeEvent.streak === 4 ? 'text-yellow-100 drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]' : 'text-white'}
              `}>
                {activeEvent.displayTitle || activeEvent.type}!
              </h3>
              <p className={`
                font-bold text-indigo-50 opacity-100
                ${isBigEvent ? 'text-2xl md:text-4xl' : 'text-lg md:text-2xl'}
              `}>
                {activeEvent.displayText || activeEvent.text}
              </p>
            </motion.div>
          </motion.div>
        );
      })()}
    </AnimatePresence>
  );
};
