import React from 'react';
import { motion } from 'framer-motion';



export const Card = ({ card, hidden = false, onClick, className = '' }) => {
  if (hidden) {
    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        className={`w-24 h-36 rounded-xl bg-slate-800 border-2 border-slate-700 shadow-xl overflow-hidden ${className}`}
      >
        <img 
          src="/cards/back.png" 
          alt="Card Back" 
          className="w-full h-full object-cover"
        />
      </motion.div>
    );
  }

  const suitMap = {
    coins: 'dheb-vector',
    cups: 'jben-vector',
    swords: 'espadas',
    clubs: 'zrawet-vector'
  };

  const suit = suitMap[card.suit] || card.suit;
  const isVector = card.suit === 'clubs' || card.suit === 'cups' || card.suit === 'coins';
  const value = isVector 
    ? card.displayValue.toString() 
    : card.displayValue.toString().padStart(2, '0');
  
  const extension = isVector ? 'svg' : 'png';
  const separator = isVector ? ' ' : '-';
  const imagePath = `/cards/${value}${separator}${suit}.${extension}`;

  return (
    <motion.div
      whileHover={onClick ? { scale: 1.05, y: -10 } : {}}
      whileTap={onClick ? { scale: 0.95 } : {}}
      onClick={onClick}
      className={`w-24 h-36 rounded-xl bg-white border-2 border-slate-200 shadow-lg overflow-hidden cursor-pointer ${className}`}
    >
      <img 
        src={imagePath} 
        alt={`${card.suit} ${card.displayValue}`} 
        className="w-full h-full object-cover"
        onError={(e) => {
          console.error(`Failed to load image: ${imagePath}`);
          e.target.onerror = null;
          e.target.src = 'https://via.placeholder.com/150x210?text=Card';
        }}
      />
    </motion.div>
  );
};

