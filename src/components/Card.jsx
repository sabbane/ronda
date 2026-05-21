
import { motion } from 'framer-motion';

const cardImages = import.meta.glob('../assets/cards/*.{svg,png}', { eager: true, query: '?url', import: 'default' });

const getCardImage = (filename) => {
  return cardImages[`../assets/cards/${filename}`] || null;
};

export const Card = ({ card, hidden = false, onClick, className = '' }) => {
  if (hidden) {
    const value = (card.displayValue !== undefined ? card.displayValue : card.value).toString();
    const suit = `${card.suit}-vector`;
    const imagePath = getCardImage(`${value} ${suit}.svg`);

    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        className={`w-16 h-24 sm:w-20 sm:h-32 md:w-24 md:h-36 rounded-xl bg-white border-2 border-slate-200 shadow-xl overflow-hidden flex-shrink-0 ${className} relative`}
      >
        <div className="w-full h-full p-1 bg-slate-50 flex items-center justify-center">
          <img 
            src={getCardImage('back.png')} 
            alt="Card Back" 
            className="w-full h-full object-contain"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML = '<div class="text-xs font-bold text-slate-300 transform -rotate-45">RONDA</div>';
            }}
          />
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

  // card.suit is now one of: dheb, jben, syouf, zrawet
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
      className={`w-16 h-24 sm:w-20 sm:h-32 md:w-24 md:h-36 rounded-xl bg-white border-2 border-slate-200 shadow-lg overflow-hidden cursor-pointer flex-shrink-0 ${className}`}
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

