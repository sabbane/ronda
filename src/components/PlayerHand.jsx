
import { Card } from './Card';
import { motion } from 'framer-motion';

export const PlayerHand = ({ hand, isCurrentPlayer, onPlayCard, hidden = false, dealDelay = 0, playedCardId = null }) => {
  return (
    <div className="game-hand" dir="ltr">
        {hand.map((card, index) => (
          <motion.div
            key={card.id}
            layoutId={`card-${card.id}`}
            initial={{ opacity: 0, y: -100, x: -100, rotate: -20 }}
            animate={{ opacity: 1, y: 0, x: 0, rotate: 0 }}
            exit={{}}
            transition={{ 
              type: "spring", 
              stiffness: 70, 
              damping: 15,
              delay: dealDelay + (index * 0.25)
            }}
            drag={isCurrentPlayer && !hidden ? true : false}
            dragSnapToOrigin
            dragConstraints={{ left: 0, right: 0, top: -500, bottom: 0 }}
            dragElastic={0.1}
            onDragEnd={(event, info) => {
              if (isCurrentPlayer && !hidden && info.offset.y < -100) {
                onPlayCard(index);
              }
            }}
            whileDrag={{ scale: 1.1, zIndex: 100 }}
            className={`hand-card-container relative z-20 ${isCurrentPlayer && !hidden ? "cursor-grab active:cursor-grabbing" : ""}`}
          >
            <Card
              card={card}
              hidden={hidden && playedCardId !== card.id}
              onClick={isCurrentPlayer && !hidden ? () => onPlayCard(index) : undefined}
              className={isCurrentPlayer && !hidden ? "ring-4 ring-indigo-400 shadow-[0_0_25px_rgba(129,140,248,0.5)]" : ""}
            />
          </motion.div>
        ))}
    </div>
  );
};
