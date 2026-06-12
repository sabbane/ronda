import { motion, AnimatePresence } from 'framer-motion';
import { Card } from './Card';

export const GameTable = ({
  G,
  myID,
  numP,
  t,
  captureRects,
  captureSequence,
  captureStep,
  getWrapperForCard,
}) => {
  return (
    <div className="w-full flex items-center justify-center my-0.5 sm:my-2 relative z-10 shrink-0" dir="ltr">
      <div className={`game-table bg-emerald-900/40 border-green-700/90 shadow-2xl shadow-green-900/30 ${numP === 4 ? 'game-table-4player' : ''}`} data-test-id="game-table">
        <div className="absolute inset-0 bg-[url('/felt.png')] opacity-10 rounded-3xl mix-blend-overlay pointer-events-none"></div>
        
        <AnimatePresence>
          {G.table.map((baseCard) => {
            // If this base wrapper is supposed to be empty because its card moved, we render just the empty wrapper
            const isBaseCardMoved = G.pendingCapture && getWrapperForCard(baseCard.id) !== baseCard.id;
            
            // Find all cards that belong in this wrapper right now
            const cardsInWrapper = G.table.filter(c => getWrapperForCard(c.id) === baseCard.id);

            return (
              <div
                id={`table-wrapper-${baseCard.id}`}
                key={`table-wrapper-${baseCard.id}`}
                className="game-card-container"
              >
                {!isBaseCardMoved && cardsInWrapper.map(card => {
                  const isNormalDropCheck = !G.pendingCapture && G.lastPlayedCard?.streakCards?.length === 1 && G.lastPlayedCard.streakCards[0].id === card.id && G.isAnimating;
                  const isPlayedBadge = (G.pendingCapture?.playedCardId === card.id) || isNormalDropCheck;
                  
                  let animX = 0;
                  let animY = 0;
                  let animScale = 1;
                  let animZ = isPlayedBadge ? 50 : 1;
                  let transition = { duration: 0.3, type: "spring", stiffness: 100 };
                  
                  if (G.pendingCapture && Object.keys(captureRects).length > 0 && captureRects[card.id]) {
                    const isPlayedCard = card.id === G.pendingCapture.playedCardId;
                    const seqIndex = captureSequence.indexOf(card.id);
                    const isCollected = seqIndex !== -1 && seqIndex < captureStep;
                    
                    if (isPlayedCard || isCollected) {
                      const targetStep = Math.min(captureStep, captureSequence.length - 1);
                      const targetId = captureSequence[targetStep];
                      const targetRect = captureRects[targetId];
                      
                      // playedCard mounts in sequence[0] wrapper, others in their own wrapper
                      const sourceRectId = isPlayedCard ? captureSequence[0] : card.id;
                      const sourceRect = captureRects[sourceRectId];
                      
                      if (targetRect && sourceRect) {
                        let stackIndex = 0;
                        if (isPlayedCard) {
                          stackIndex = captureStep + 1;
                        } else if (isCollected) {
                          stackIndex = captureStep - seqIndex;
                        }
                        
                        const offsetX = -(stackIndex * 6);
                        const offsetY = (stackIndex * 6);

                        animX = (targetRect.left - sourceRect.left) + offsetX;
                        animY = (targetRect.top - sourceRect.top) + offsetY;
                        animZ = 60 + stackIndex;
                        transition = { duration: 1.0, type: "tween", ease: "easeInOut" };
                      }
                    } else if (seqIndex === captureStep) {
                      animScale = 1.05;
                      animZ = 40;
                    }
                  }

                  const playedByMe = G.pendingCapture ? G.pendingCapture.player === myID : G.lastPlayedCard?.player === myID;
                  const fallbackY = playedByMe ? 200 : -200;

                  return (
                    <motion.div
                      key={`table-card-${card.id}`}
                      layoutId={`card-${card.id}`}
                      initial={isPlayedBadge ? false : { opacity: 0, scale: 0.5, y: fallbackY }}
                      animate={{ opacity: 1, scale: animScale, x: animX, y: animY }}
                      exit={{ opacity: 0, scale: 1.5, filter: 'blur(10px)' }}
                      style={{ zIndex: animZ }}
                      className={`absolute inset-0 w-full h-full ${isPlayedBadge ? "z-50" : ""}`}
                      transition={transition}
                    >
                      <Card 
                        card={card} 
                        className={`shadow-2xl ${isPlayedBadge ? 'ring-4 ring-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.6)]' : 'transition-transform hover:scale-105'}`} 
                      />
                    </motion.div>
                  );
                })}
              </div>
            );
          })}
        </AnimatePresence>
        
        {G.table.length === 0 && (
          <div className="text-emerald-700/50 text-3xl font-bold uppercase tracking-widest absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            {t('tableEmpty')}
          </div>
        )}
      </div>
    </div>
  );
};
