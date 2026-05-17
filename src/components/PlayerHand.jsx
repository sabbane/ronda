import React from 'react';
import { Card } from './Card';
import { motion } from 'framer-motion';

export const PlayerHand = ({ hand, isCurrentPlayer, onPlayCard, hidden = false, dealDelay = 0, playedCardId = null }) => {
  return (
    <div className="flex justify-center gap-2 sm:gap-4 py-2 sm:py-8 min-h-[7.5rem] sm:min-h-[12.5rem] md:min-h-[13.5rem]" dir="ltr">
        {hand.map((card, index) => (
          <motion.div
            key={card.id}
            className="relative z-20"
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
            className={isCurrentPlayer && !hidden ? "cursor-grab active:cursor-grabbing" : ""}
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
