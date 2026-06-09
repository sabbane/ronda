import React from 'react';

export const useLobbySync = (opts) => {
  const { isConnected, G, ctx, myID, moves, matchData, isLeavingRef } = opts;
  React.useEffect(() => {
    if (isLeavingRef && isLeavingRef.current) return;
    const savedNickname = localStorage.getItem('ronda_nickname') || 'Player';
    const isInLobbyStage = G.gameStarted === false || ctx.activePlayers?.[myID] === 'lobby';
    if (isConnected && isInLobbyStage && G.players && G.players[myID] && G.players[myID].name !== savedNickname) {
      moves.setPlayerName(savedNickname);
    }
  }, [myID, G.players, moves, isConnected, ctx.activePlayers, G.gameStarted, isLeavingRef]);

  React.useEffect(() => {
    if (!isConnected || !matchData || !G.players || G.gameStarted) return;

    matchData.forEach((player) => {
      const pID = String(player.id);
      const isOccupiedInLobby = !!player.name;
      const nameInGame = G.players[pID]?.name || '';

      if (!isOccupiedInLobby && nameInGame !== '') {
        moves.clearPlayerSeat(pID);
      }
    });
  }, [isConnected, matchData, G.players, G.gameStarted, moves]);
};
