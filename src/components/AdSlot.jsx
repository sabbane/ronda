import React, { useEffect } from 'react';

export const AdSlot = ({ className = '', slotId = 'REPLACE_WITH_YOUR_SLOT_ID' }) => {
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  return (
    <div className={`flex justify-center items-center my-2 ${className}`}>
      {/* Google AdSense Ins Tag */}
      <ins 
        className="adsbygoogle"
        style={{ display: 'block', minWidth: '320px', minHeight: '50px' }}
        data-ad-client="ca-pub-8144886963015414"
        data-ad-slot={slotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
};
