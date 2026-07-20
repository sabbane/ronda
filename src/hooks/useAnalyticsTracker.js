import { useEffect, useRef } from 'react';
import { analyticsService } from '../services/analyticsService';

export const useAnalyticsTracker = ({
  gameStarted,
  matchID,
  rondaMode,
  numP,
  showGameOverOverlay,
  myTeamScore,
  oppTeamScore
}) => {
  const hasTrackedStart = useRef(false);
  const hasTrackedComplete = useRef(false);
  const startTimeRef = useRef(null);

  useEffect(() => {
    if (gameStarted) {
      if (!startTimeRef.current) {
        startTimeRef.current = Date.now();
      }

      if (!hasTrackedStart.current && matchID) {
        hasTrackedStart.current = true;
        analyticsService.trackEvent({
          matchID,
          type: 'game_started',
          mode: rondaMode || 'singleplayer',
          numPlayers: numP
        });
      }
    }
  }, [gameStarted, matchID, rondaMode, numP]);

  useEffect(() => {
    if (showGameOverOverlay && !hasTrackedComplete.current && matchID) {
      hasTrackedComplete.current = true;
      const duration = startTimeRef.current 
        ? Math.round((Date.now() - startTimeRef.current) / 1000) 
        : null;

      analyticsService.trackEvent({
        matchID,
        type: 'game_completed',
        mode: rondaMode || 'singleplayer',
        numPlayers: numP,
        duration,
        finalScores: [myTeamScore, oppTeamScore]
      });
    }
  }, [showGameOverOverlay, matchID, rondaMode, numP, myTeamScore, oppTeamScore]);
};
