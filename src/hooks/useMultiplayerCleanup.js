import React from 'react';

export const useMultiplayerCleanup = ({
  isConnected,
  G,
  opponentID,
  opponentLeft,
  setOpponentLeft,
  matchData,
  moves
}) => {
  const isMultiplayer = isConnected !== undefined;

  React.useEffect(() => {
    if (!G.gameStarted || !isMultiplayer || opponentLeft) return;
    if (G.playerLeft && G.playerLeft[opponentID] === true) {
      setOpponentLeft(true);
    }
  }, [G.playerLeft, opponentID, G.gameStarted, isMultiplayer, opponentLeft, setOpponentLeft]);

  React.useEffect(() => {
    if (!G.gameStarted || !isMultiplayer || opponentLeft || !matchData) return;
    const opponentData = matchData.find(p => String(p.id) === String(opponentID));
    if (opponentData && opponentData.isConnected === false) {
      setOpponentLeft(true);
    }
  }, [matchData, opponentID, G.gameStarted, isMultiplayer, opponentLeft, setOpponentLeft]);

  React.useEffect(() => {
    if (!G.gameStarted || !isMultiplayer) return;
    const handleBeforeUnload = () => {
      try { moves.playerLeft(); } catch { /* ignore */ }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [G.gameStarted, isMultiplayer, moves]);
};
