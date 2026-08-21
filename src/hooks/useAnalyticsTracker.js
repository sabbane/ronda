import { useEffect, useRef } from 'react';
import { analyticsService } from '../services/analyticsService';
import { getChallengeById } from '../game/challenges';

export const useAnalyticsTracker = ({
  gameStarted,
  matchID,
  rondaMode,
  numP,
  showGameOverOverlay,
  myTeamScore,
  oppTeamScore,
  didIWin
}) => {
  const hasTrackedStart = useRef(false);
  const hasTrackedComplete = useRef(false);
  const startTimeRef = useRef(null);

  const effectiveNumPlayers = (rondaMode === 'singleplayer' || !numP) ? 1 : numP;
  const challengeId = typeof window !== 'undefined' ? window.activeRondaChallengeId || null : null;

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
          numPlayers: effectiveNumPlayers,
          challengeId
        });
      }
    }
  }, [gameStarted, matchID, rondaMode, effectiveNumPlayers, challengeId]);

  useEffect(() => {
    if (showGameOverOverlay && !hasTrackedComplete.current && matchID) {
      hasTrackedComplete.current = true;
      const duration = startTimeRef.current 
        ? Math.round((Date.now() - startTimeRef.current) / 1000) 
        : null;

      let challengeSuccess = null;
      if (challengeId) {
        const ch = getChallengeById(challengeId);
        if (ch && typeof ch.requirement === 'function') {
          challengeSuccess = ch.requirement({
            didIWin: !!didIWin,
            myScore: myTeamScore || 0,
            oppScore: oppTeamScore || 0
          });
        }
      }

      analyticsService.trackEvent({
        matchID,
        type: 'game_completed',
        mode: rondaMode || 'singleplayer',
        numPlayers: effectiveNumPlayers,
        duration,
        finalScores: [myTeamScore, oppTeamScore],
        challengeId,
        challengeSuccess
      });
    }
  }, [showGameOverOverlay, matchID, rondaMode, effectiveNumPlayers, myTeamScore, oppTeamScore, didIWin, challengeId]);
};
