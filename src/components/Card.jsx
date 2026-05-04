import React from 'react';
import { motion } from 'framer-motion';



export const Card = ({ card, hidden = false, onClick, className = '' }) => {
  if (hidden) {
    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        className={`w-24 h-36 rounded-xl bg-white border-2 border-slate-200 shadow-xl overflow-hidden ${className}`}
      >
        <div className="w-full h-full p-1 bg-slate-50 flex items-center justify-center">
          <img 
            src="/cards/back.png" 
            alt="Card Back" 
            className="w-full h-full object-contain"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML = '<div class="text-xs font-bold text-slate-300 transform -rotate-45">RONDA</div>';
            }}
          />
        </div>
      </motion.div>
    );
  }

  const suitMap = {
    coins: 'dheb-vector',
    cups: 'jben-vector',
    swords: 'syouf-vector',
    clubs: 'zrawet-vector'
  };

  const suit = suitMap[card.suit] || card.suit;
  const isVector = true; // All suits are now using vector SVG cards
  const value = card.displayValue.toString();
  
  const extension = 'svg';
  const separator = ' ';
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

