import React from 'react';
import { PlayerHand } from './PlayerHand';
import { Card } from './Card';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';

export const RondaBoard = ({ G, ctx, moves, playerID }) => {
  const myID = playerID || '0';
  const opponentID = myID === '0' ? '1' : '0';
  const [activeEvent, setActiveEvent] = React.useState(null);
  const [isProcessing, setIsProcessing] = React.useState(false);

  const isCurrentPlayer = (id) => ctx.currentPlayer === id;

  const handlePlayCard = (cardIndex) => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    // Add a slight delay before playing to let the user see their selection
    setTimeout(() => {
      moves.playCard(cardIndex);
      setIsProcessing(false);
    }, 400);
  };

  const [eventQueue, setEventQueue] = React.useState([]);
  const processedAnnouncements = React.useRef(new Set());

  // Watch for new announcements and add them to a queue
  React.useEffect(() => {
    if (G.announcements && G.announcements.length > 0) {
      G.announcements.forEach((ann, idx) => {
        const annId = `${ctx.turn}-${idx}-${ann.type}-${ann.player}`;
        if (!processedAnnouncements.current.has(annId)) {
          processedAnnouncements.current.add(annId);
          
          const isMe = ann.player === myID;
          const name = isMe ? "You" : "Opponent";
          
          let customText = "";
          if (ann.type === 'Ronda') customText = `${name} ${isMe ? 'have' : 'has'} Ronda! (+1)`;
          if (ann.type === 'Tringa') customText = `${name} ${isMe ? 'have' : 'has'} Tringa! (+5)`;
          if (ann.type === 'Messa') customText = `${name} cleared the table! (+1)`;
          if (ann.type === 'Bounti') customText = `${name} scored a Bounti! (+1)`;

          setEventQueue(prev => [...prev, { ...ann, displayText: customText, id: annId }]);
        }
      });
    }
  }, [G.announcements, myID, ctx.turn]);

  // Process the event queue sequentially
  React.useEffect(() => {
    if (!activeEvent && eventQueue.length > 0) {
      const next = eventQueue[0];
      setActiveEvent(next);
      setEventQueue(prev => prev.slice(1));
    }
  }, [eventQueue, activeEvent]);

  // Automatically clear the active event after 2.5 seconds
  React.useEffect(() => {
    if (activeEvent) {
      const timer = setTimeout(() => setActiveEvent(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [activeEvent]);

  // Deal cards automatically after a delay when hands are empty and queue is clear
  React.useEffect(() => {
    if (
      G.players['0'].hand.length === 0 && 
      G.players['1'].hand.length === 0 && 
      G.deck.length > 0 &&
      eventQueue.length === 0 &&
      !activeEvent &&
      !G.pendingCapture
    ) {
      // Add a slight delay before dealing to let the table state breathe
      const timer = setTimeout(() => {
        moves.dealCards();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [G.players, G.deck.length, eventQueue.length, activeEvent, G.pendingCapture, moves]);

  // Handle pending captures to allow the played card to rest on the table
  React.useEffect(() => {
    if (G.pendingCapture) {
      const timer = setTimeout(() => {
        moves.processCapture();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [G.pendingCapture, moves]);

  let winner = null;
  if (ctx.gameover) {
    winner = ctx.gameover.winner !== undefined ? ctx.gameover.winner : 'Draw';
  }

  return (
    <LayoutGroup>
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-between p-4 font-sans text-slate-100 relative overflow-hidden">
        
        {/* Central Event Notification */}
        <AnimatePresence>
          {activeEvent && (
            <motion.div
              key={activeEvent.id}
              initial={{ opacity: 0, scale: 0.5, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.5, y: -20 }}
              className="fixed inset-0 flex items-center justify-center pointer-events-none z-50"
            >
              <div className="bg-indigo-600/90 backdrop-blur-md px-12 py-6 rounded-3xl shadow-[0_0_50px_rgba(79,70,229,0.5)] border-2 border-indigo-400 text-center transform -rotate-2">
                <motion.div
                  initial={{ rotate: -10 }}
                  animate={{ rotate: 10 }}
                  transition={{ repeat: Infinity, repeatType: "reverse", duration: 0.5 }}
                  className="text-6xl mb-2"
                >
                  {activeEvent.type === 'Messa' ? '🧹' : activeEvent.type === 'Bounti' ? '🎯' : '✨'}
                </motion.div>
                <h3 className="text-4xl font-black italic tracking-tighter uppercase mb-1">
                  {activeEvent.type}!
                </h3>
                <p className="text-xl font-medium text-indigo-100 opacity-90">
                  {activeEvent.displayText || activeEvent.text}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Side Announcements (Legacy) */}
        <div className="absolute top-1/4 left-8 flex flex-col gap-4 pointer-events-none z-40 hidden md:flex">
          <AnimatePresence>
            {G.announcements?.map((ann, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-slate-800/80 backdrop-blur text-white px-4 py-2 rounded-lg shadow-lg border border-slate-700 text-sm"
              >
                {ann.text}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Game Over Overlay */}
        <AnimatePresence>
          {ctx.gameover && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            >
              <motion.div 
                initial={{ scale: 0.8, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-slate-800 p-12 rounded-3xl border border-slate-700 shadow-2xl text-center"
              >
                <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  Game Over!
                </h2>
                <div className="text-2xl mb-8 font-medium">
                  {winner === 'Draw' ? "It's a draw!" : winner === myID ? "You won!" : "Opponent won!"}
                </div>
                <div className="flex gap-8 justify-center text-xl bg-slate-900/50 p-6 rounded-2xl border border-slate-700/50">
                  <div className="flex flex-col items-center">
                    <span className="text-sm text-slate-400 mb-1">You</span>
                    <span className="text-3xl font-bold text-indigo-400">{ctx.gameover.p0Score}</span>
                  </div>
                  <div className="w-px bg-slate-700"></div>
                  <div className="flex flex-col items-center">
                    <span className="text-sm text-slate-400 mb-1">Opponent</span>
                    <span className="text-3xl font-bold text-purple-400">{ctx.gameover.p1Score}</span>
                  </div>
                </div>
                <button 
                  onClick={() => window.location.reload()}
                  className="mt-8 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-full font-bold transition-colors shadow-lg"
                >
                  Play Again
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Opponent Area */}
        <div className="w-full max-w-4xl">
          <div className="flex justify-between items-center px-8 mb-2">
            <div className="text-lg font-medium text-slate-400 flex items-center gap-3">
              Opponent
              {isCurrentPlayer(opponentID) && (
                <span className="flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-purple-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
                </span>
              )}
            </div>
            <div className="flex gap-4 items-center">
              <div className="relative w-8 h-12">
                {G.players[opponentID]?.captured.map((card) => (
                  <motion.div
                    key={`cap-${card.id}`}
                    layoutId={card.id}
                    className="absolute inset-0 bg-purple-900/50 border border-purple-700/50 rounded-sm shadow-sm"
                  />
                ))}
              </div>
              <div className="bg-slate-800 px-4 py-1 rounded-full text-sm border border-slate-700 shadow-inner flex items-center gap-2">
                <span className="text-slate-400">Cards:</span> 
                <span className="font-bold text-lg text-purple-400">
                  {(G.players[opponentID]?.captured.length || 0) + (G.players[opponentID]?.score || 0)}
                </span>
              </div>
            </div>
          </div>
          <PlayerHand 
            hand={G.players[opponentID]?.hand || []} 
            isCurrentPlayer={false} 
            hidden={true}
            dealDelay={0.75}
          />
        </div>

        {/* Table Area */}
        <div className="flex-1 w-full flex items-center justify-center my-4 relative">
          <div className="relative w-full max-w-4xl h-80 bg-emerald-900/40 rounded-3xl border-4 border-emerald-800/50 shadow-2xl shadow-emerald-900/20 backdrop-blur-sm flex flex-wrap gap-4 p-8 items-center justify-center">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/felt.png')] opacity-10 rounded-3xl mix-blend-overlay pointer-events-none"></div>
            
            <AnimatePresence>
              {G.table.map((card, idx) => (
                <motion.div
                  key={card.id}
                  layoutId={card.id}
                  initial={{ opacity: 0, scale: 0.5, rotate: Math.random() * 20 - 10, y: -200 }}
                  animate={{ opacity: 1, scale: 1, rotate: Math.random() * 10 - 5, y: 0 }}
                  exit={{ opacity: 0, scale: 1.5, filter: 'blur(10px)' }}
                  transition={{ 
                    duration: 0.6, 
                    type: "spring", 
                    stiffness: 100,
                    delay: idx * 0.15 
                  }}
                >
                  <Card card={card} className="shadow-2xl hover:scale-105 transition-transform" />
                </motion.div>
              ))}
            </AnimatePresence>
            
            {G.table.length === 0 && (
              <div className="text-emerald-700/50 text-3xl font-bold uppercase tracking-widest absolute">
                Table is empty
              </div>
            )}
          </div>
        </div>

        {/* Player Area */}
        <div className="w-full max-w-4xl">
          <div className="flex justify-between items-center px-8 mt-2">
            <div className="flex items-center gap-3">
              <div className={`text-lg font-medium ${isCurrentPlayer(myID) ? 'text-indigo-400' : 'text-slate-400'}`}>
                You {isCurrentPlayer(myID) && "(Your Turn)"}
              </div>
              {isCurrentPlayer(myID) && (
                <span className="flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                </span>
              )}
            </div>
            <div className="flex gap-4 items-center">
              <div className="relative w-8 h-12">
                {G.players[myID]?.captured.map((card) => (
                  <motion.div
                    key={`cap-${card.id}`}
                    layoutId={card.id}
                    className="absolute inset-0 bg-indigo-900/50 border border-indigo-700/50 rounded-sm shadow-sm"
                  />
                ))}
              </div>
              <div className="bg-slate-800 px-4 py-1 rounded-full text-sm border border-slate-700 shadow-inner flex items-center gap-2">
                <span className="text-slate-400">Cards:</span> 
                <span className="font-bold text-lg text-indigo-400">
                  {(G.players[myID]?.captured.length || 0) + (G.players[myID]?.score || 0)}
                </span>
              </div>
            </div>
          </div>
          <PlayerHand 
            hand={G.players[myID]?.hand || []} 
            isCurrentPlayer={isCurrentPlayer(myID) && !isProcessing} 
            onPlayCard={handlePlayCard} 
          />
        </div>
        
        {/* Deck Info */}
        <div className="fixed bottom-4 left-4 flex items-center gap-2 bg-slate-800/80 backdrop-blur px-4 py-2 rounded-full border border-slate-700 shadow-lg">
          <div className="w-6 h-8 bg-indigo-600 rounded border border-indigo-400 shadow flex items-center justify-center">
            <span className="text-[10px]">✨</span>
          </div>
          <span className="text-slate-300 font-medium">Cards remaining: {G.deck.length}</span>
        </div>
      </div>
    </LayoutGroup>
  );
};
