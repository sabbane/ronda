import React from 'react';

export const useCaptureAnimation = ({
  G,
  ctx,
  myID,
  moves,
  activeEvent
}) => {
  // Compute capture animation sequence
  const captureSequence = React.useMemo(() => {
    if (!G.pendingCapture) return [];
    let sequence = [];
    let val = G.pendingCapture.currentVal;
    let matchIndex = G.table.findIndex(c => c.value === val && c.id !== G.pendingCapture.playedCardId);
    if (matchIndex !== -1) {
      sequence.push(G.table[matchIndex].id);
      let nextVal = val < 10 ? val + 1 : null;
      while (nextVal !== null) {
        let nextMatchIndex = G.table.findIndex(c => c.value === nextVal);
        if (nextMatchIndex !== -1) {
          sequence.push(G.table[nextMatchIndex].id);
          nextVal = nextVal < 10 ? nextVal + 1 : null;
        } else break;
      }
    }
    return sequence;
  }, [G.pendingCapture, G.table]);

  const [captureStep, setCaptureStep] = React.useState(0);
  const [captureRects, setCaptureRects] = React.useState({});

  const getWrapperForCard = (cardId) => {
    if (!G.pendingCapture || captureSequence.length === 0) return cardId;
    if (cardId === G.pendingCapture.playedCardId) return captureSequence[0];
    return cardId;
  };

  React.useEffect(() => {
    let timerId;
    const isDerbaActive = activeEvent && (activeEvent.type === 'Derba' || activeEvent.type === 'Taawida');
    
    if (G.pendingCapture) {
      if (captureSequence.length > 0) {
        if (Object.keys(captureRects).length === 0) {
          const rects = {};
          G.table.forEach(card => {
            const el = document.getElementById(`table-wrapper-${card.id}`);
            if (el) rects[card.id] = el.getBoundingClientRect();
          });
          setTimeout(() => {
            setCaptureRects(rects);
          }, 0);
        }
      } else if (!isDerbaActive) {
        const isOnline = !!ctx.multiplayer;
        const isMyCapture = G.pendingCapture.player === myID;
        if (isMyCapture || (!isOnline && myID === '0')) {
          timerId = setTimeout(() => {
            if (G.pendingCapture) moves.processCapture();
          }, 1500);
        }
      }
    } else {
      setTimeout(() => {
        setCaptureStep(0);
        setCaptureRects({});
      }, 0);
    }
    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [G.pendingCapture, captureSequence, captureRects, G.table, ctx.multiplayer, myID, moves, activeEvent, captureStep]);

  // Progress animation sequence
  React.useEffect(() => {
    let timerId;
    const isDerbaActive = activeEvent && (activeEvent.type === 'Derba' || activeEvent.type === 'Taawida');
    
    if (G.pendingCapture && captureSequence.length > 0 && Object.keys(captureRects).length > 0 && !isDerbaActive) {
      if (captureStep < captureSequence.length) {
        timerId = setTimeout(() => {
          setCaptureStep(prev => prev + 1);
        }, 1000);
      } else {
        const isOnline = !!ctx.multiplayer;
        const isMyCapture = G.pendingCapture?.player === myID;
        if (isMyCapture || (!isOnline && myID === '0')) {
          timerId = setTimeout(() => {
            if (G.pendingCapture) moves.processCapture();
          }, 0);
        }
      }
    }
    return () => clearTimeout(timerId);
  }, [captureStep, captureSequence.length, captureRects, G.pendingCapture, ctx.multiplayer, moves, myID, activeEvent]);

  return {
    captureSequence,
    captureStep,
    setCaptureStep,
    captureRects,
    setCaptureRects,
    getWrapperForCard
  };
};
