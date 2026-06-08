import React from 'react';

export const useScrollAdjustments = (boardContainerRef, G, activeEvent, setShouldScroll) => {
  React.useEffect(() => {
    const checkOverflow = () => {
      const container = boardContainerRef.current;
      if (container) {
        const hasOverflow = container.scrollHeight > window.innerHeight + 10;
        setShouldScroll(hasOverflow);
      }
    };

    checkOverflow();
    const t1 = setTimeout(checkOverflow, 100);
    const t2 = setTimeout(checkOverflow, 500);

    window.addEventListener('resize', checkOverflow);

    const observer = new MutationObserver(() => {
      checkOverflow();
      setTimeout(checkOverflow, 100);
    });
    const container = boardContainerRef.current;
    if (container) {
      observer.observe(container, { childList: true, subtree: true, attributes: true });
    }

    return () => {
      window.removeEventListener('resize', checkOverflow);
      observer.disconnect();
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [G, activeEvent, boardContainerRef, setShouldScroll]);
};
