import { useAnnouncements } from './useAnnouncements';
import { useBoardSounds } from './useBoardSounds';
import { useCaptureAnimation } from './useCaptureAnimation';

export const useBoardEvents = ({
  G,
  ctx,
  moves,
  myID,
  opponentID,
  numP,
  t,
}) => {
  const {
    activeEvent,
    setActiveEvent,
    eventQueue,
    setEventQueue,
    showGameOverOverlay,
    canCounterDarba
  } = useAnnouncements({ G, ctx, moves, myID, opponentID, numP, t });

  useBoardSounds({ G, myID, numP, activeEvent, showGameOverOverlay });

  const {
    captureSequence,
    captureStep,
    setCaptureStep,
    captureRects,
    setCaptureRects,
    getWrapperForCard
  } = useCaptureAnimation({ G, ctx, myID, moves, activeEvent });

  return {
    activeEvent,
    setActiveEvent,
    eventQueue,
    setEventQueue,
    canCounterDarba,
    showGameOverOverlay,
    captureSequence,
    captureStep,
    setCaptureStep,
    captureRects,
    setCaptureRects,
    getWrapperForCard,
  };
};
