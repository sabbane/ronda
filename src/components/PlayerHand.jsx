import { Card } from './Card';
import { motion } from 'framer-motion';

export const PlayerHand = (props) => {
  const { hand, isCurrentPlayer, onPlayCard, hidden = false, dealDelay = 0, dealDelays = null, playedCardId = null, counterCardValue = null } = props;
  return (
    <div className="game-hand" dir="ltr">
        {hand.map((card, index) => {
          const isCounterCard = counterCardValue !== null && card.value === counterCardValue;
          const isSelectable = isCurrentPlayer && (counterCardValue === null || isCounterCard);

          return (
            <motion.div
              key={card.id}
              layoutId={`card-${card.id}`}
              initial={{ opacity: 0, y: -100, x: -100, rotate: -20 }}
              animate={{ opacity: 1, y: 0, x: 0, rotate: 0 }}
              exit={{}}
              transition={{ 
                type: "spring", 
                stiffness: 55, 
                damping: 14,
                delay: (dealDelays && dealDelays[index] !== undefined) ? dealDelays[index] : dealDelay + (index * 0.25)
              }}
              drag={isSelectable && !hidden ? true : false}
              dragSnapToOrigin
              dragConstraints={{ left: 0, right: 0, top: -500, bottom: 0 }}
              dragElastic={0.1}
              onDragEnd={(event, info) => {
                if (isSelectable && !hidden && info.offset.y < -100) {
                  onPlayCard(index);
                }
              }}
              whileDrag={{ scale: 1.1, zIndex: 100 }}
              className={`hand-card-container relative z-20 ${isSelectable && !hidden ? "cursor-grab active:cursor-grabbing" : ""} ${isCounterCard ? "ring-4 ring-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.8)] scale-105 border-amber-400" : ""}`}
            >
              <Card
                card={card}
                hidden={hidden && playedCardId !== card.id}
                onClick={isSelectable && !hidden ? () => onPlayCard(index) : undefined}
                className={isSelectable && !hidden && !isCounterCard ? "ring-4 ring-indigo-400 shadow-[0_0_25px_rgba(129,140,248,0.5)]" : ""}
              />
            </motion.div>
          );
        })}
    </div>
  );
};
