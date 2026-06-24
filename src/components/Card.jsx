import { useState } from 'react';
import { motion } from 'framer-motion';

const cardImages = import.meta.glob('../assets/cards/*.{svg,png}', { eager: true, query: '?url', import: 'default' });

const getCardImage = (filename) => {
  return cardImages[`../assets/cards/${filename}`] || null;
};

export const Card = ({ card, hidden = false, onClick, className = '', backType = 'default' }) => {
  const [backError, setBackError] = useState(false);
  const [faceError, setFaceError] = useState(false);

  const getCardBackImage = () => {
    if (backType === 'red') return getCardImage('card_back_red.png');
    if (backType === 'blue') return getCardImage('card_back_blue.png');
    return getCardImage('back.png');
  };

  if (hidden) {
    const value = (card.displayValue !== undefined ? card.displayValue : card.value).toString();
    const suit = `${card.suit}-vector`;
    const imagePath = getCardImage(`${value} ${suit}.svg`);

    return (
      <motion.div
        whileHover={onClick ? { scale: 1.05 } : {}}
        whileTap={onClick ? { scale: 0.95 } : {}}
        onClick={onClick}
        className={`game-card shadow-xl ${className}`}
      >
        <div className="w-full h-full flex items-center justify-center">
          {backError ? (
            <div className="text-xs font-bold text-slate-300 transform -rotate-45 select-none">RONDA</div>
          ) : (
            <img 
              src={getCardBackImage()} 
              alt="Card Back" 
              className="w-full h-full object-contain"
              onError={() => setBackError(true)}
            />
          )}
          {/* Preload the actual card face to prevent flashing on slow networks */}
          <img 
            src={imagePath} 
            alt="preload" 
            style={{ position: 'absolute', width: 1, height: 1, opacity: 0.01, pointerEvents: 'none' }} 
            aria-hidden="true"
          />
        </div>
      </motion.div>
    );
  }

  const suit = `${card.suit}-vector`;
  const value = (card.displayValue !== undefined ? card.displayValue : card.value).toString();
  
  const extension = 'svg';
  const separator = ' ';
  const imagePath = getCardImage(`${value}${separator}${suit}.${extension}`);

  return (
    <motion.div
      data-testid={`card-${card.suit}-${card.value}`}
      whileHover={onClick ? { scale: 1.05, y: -10 } : {}}
      whileTap={onClick ? { scale: 0.95 } : {}}
      onClick={onClick}
      className={`game-card bg-white dark:bg-[#f4ecc2] shadow-lg cursor-pointer ${className}`}
    >
      {faceError ? (
        <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center bg-slate-100 border border-slate-300 select-none">
          <span className="text-xs font-black text-slate-700">{value}</span>
          <span className="text-[9px] font-bold text-slate-500 uppercase">{card.suit}</span>
        </div>
      ) : (
        <img 
          src={imagePath} 
          alt={`${card.suit} ${card.displayValue}`} 
          className="w-full h-full object-contain"
          onError={() => {
            console.error(`Failed to load image: ${imagePath}`);
            setFaceError(true);
          }}
        />
      )}
    </motion.div>
  );
};
