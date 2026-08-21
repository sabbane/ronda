import React from 'react';
import { challengeService } from '../services/challengeService';

export const useLobbySync = (opts) => {
  const { isConnected, G, ctx, myID, moves, matchData, isLeavingRef } = opts;
  React.useEffect(() => {
    if (isLeavingRef && isLeavingRef.current) return;
    const currentName = challengeService.getDisplayName() || 'Player';
    const isInLobbyStage = G.gameStarted === false || ctx.activePlayers?.[myID] === 'lobby';
    if (isConnected && isInLobbyStage && G.players && G.players[myID] && G.players[myID].name !== currentName) {
      moves.setPlayerName(currentName);
    }
  }, [myID, G.players, moves, isConnected, ctx.activePlayers, G.gameStarted, isLeavingRef]);

  React.useEffect(() => {
    if (!isConnected || !matchData || !G.players || G.gameStarted) return;

    matchData.forEach((player) => {
      const pID = String(player.id);
      const isOccupiedInLobby = !!player.name;
      const nameInGame = G.players[pID]?.name || '';

      if (pID !== myID && !isOccupiedInLobby && nameInGame !== '') {
        moves.clearPlayerSeat(pID);
      }
    });
  }, [isConnected, matchData, G.players, G.gameStarted, moves, myID]);
};
