import React from 'react';
import { Card } from './Card';
import { motion, AnimatePresence } from 'framer-motion';

export const PlayerHand = ({ hand, isCurrentPlayer, onPlayCard, hidden = false, dealDelay = 0 }) => {
  return (
    <div className="flex justify-center gap-4 py-8">
      <AnimatePresence>
        {hand.map((card, index) => (
          <motion.div
            key={hidden ? `hidden-${index}` : card.id}
            layoutId={hidden ? undefined : card.id}
            initial={{ opacity: 0, y: -100, x: -100, rotate: -20 }}
            animate={{ opacity: 1, y: 0, x: 0, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.5 }}
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
              hidden={hidden}
              onClick={() => {
                // Keep click support as well
                if (isCurrentPlayer && !hidden) {
                  onPlayCard(index);
                }
              }}
              className={isCurrentPlayer && !hidden ? "hover:ring-4 hover:ring-indigo-400" : ""}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
