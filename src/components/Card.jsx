import React from 'react';
import { motion } from 'framer-motion';

const getSuitIcon = (suit) => {
  switch (suit) {
    case 'coins': return '🪙';
    case 'cups': return '🍷';
    case 'swords': return '⚔️';
    case 'clubs': return '🏏';
    default: return '';
  }
};

const getSuitColor = (suit) => {
  switch (suit) {
    case 'coins': return 'text-yellow-500';
    case 'cups': return 'text-red-500';
    case 'swords': return 'text-blue-500';
    case 'clubs': return 'text-green-600';
    default: return 'text-gray-800';
  }
};

export const Card = ({ card, hidden = false, onClick, className = '' }) => {
  if (hidden) {
    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        className={`w-24 h-36 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-700 border-2 border-indigo-300 shadow-xl flex items-center justify-center ${className}`}
      >
        <div className="w-20 h-32 border-2 border-indigo-400/50 rounded-lg flex items-center justify-center">
          <span className="text-3xl opacity-50">✨</span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={onClick ? { scale: 1.05, y: -10 } : {}}
      whileTap={onClick ? { scale: 0.95 } : {}}
      onClick={onClick}
      className={`w-24 h-36 rounded-xl bg-slate-50 border-2 border-slate-200 shadow-lg flex flex-col justify-between p-2 cursor-pointer ${className}`}
    >
      <div className={`text-xl font-bold ${getSuitColor(card.suit)}`}>
        {card.displayValue}
      </div>
      <div className="text-4xl text-center self-center">
        {getSuitIcon(card.suit)}
      </div>
      <div className={`text-xl font-bold self-end rotate-180 ${getSuitColor(card.suit)}`}>
        {card.displayValue}
      </div>
    </motion.div>
  );
};
