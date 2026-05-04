import React, { useEffect } from 'react';

export const AdSlot = ({ className = '' }) => {
  useEffect(() => {
    // In a real AdSense implementation, you would push to the adsbygoogle array here
    // try {
    //   (window.adsbygoogle = window.adsbygoogle || []).push({});
    // } catch (err) {
    //   console.error(err);
    // }
  }, []);

  return (
    <div className={`flex justify-center items-center my-2 ${className}`}>
      {/* Mobile: 320x50, Desktop: 728x90 */}
      <div 
        className="bg-black/40 border border-white/10 rounded-lg flex items-center justify-center text-white/30 text-xs tracking-widest uppercase shadow-inner w-[320px] h-[50px] md:w-[728px] md:h-[90px] backdrop-blur-md"
      >
        <span className="md:hidden">Ad Space (320x50)</span>
        <span className="hidden md:inline">Ad Space (728x90)</span>
      </div>
    </div>
  );
};
