import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';

const cardImages = import.meta.glob('../assets/cards/*.{svg,png}', { eager: true, query: '?url', import: 'default' });

const ASSETS_TO_LOAD = [
  ...Object.values(cardImages),
  '/assets/background-zellig.svg',
  '/felt.png',
  '/atlas_lion_logo.png',
  '/favicon.png',
  '/flag-fr.svg',
  '/flag-gb.svg',
  '/flag-ma.svg',
  '/assets/sounds/click.mp3',
  '/assets/sounds/card_deal.mp3',
  '/assets/sounds/card_place.mp3',
  '/assets/sounds/card_sweep.mp3',
  '/assets/sounds/missa_success.mp3',
  '/assets/sounds/missa_fail.mp3',
  '/assets/sounds/darba_success.mp3',
  '/assets/sounds/darba_fail.mp3',
  '/assets/sounds/ultimate_attack.mp3',
  '/assets/sounds/ronda_tringa.mp3',
  '/assets/sounds/ronda_tringa_fail.mp3',
  '/assets/sounds/clash.mp3',
  '/assets/sounds/clash_fail.mp3',
  '/assets/sounds/victory.mp3',
  '/assets/sounds/defeat.mp3',
  '/assets/sounds/casablanca_intro.mp3',
  '/assets/sounds/casablanca.mp3',
  '/assets/sounds/desert_night_intro.mp3',
  '/assets/sounds/desert_night.mp3',
  '/assets/splashscreen/splash_background_mobile.png',
  '/assets/splashscreen/ronda_banner.png',
  '/assets/splashscreen/1%20dheb-vector.png',
  '/assets/splashscreen/10%20dheb-vector.png',
  '/assets/splashscreen/11%20syouf-vector.png',
  '/assets/splashscreen/12%20jben-vector.png',
  '/assets/splashscreen/4%20syouf-vector.png'
];

const preloadAsset = (url, onProgress) => {
  return new Promise((resolve) => {
    if (url.endsWith('.mp3')) {
      const audio = new Audio();
      audio.src = url;
      audio.preload = 'auto';
      audio.oncanplaythrough = () => {
        onProgress();
        resolve();
      };
      audio.onerror = () => {
        onProgress();
        resolve();
      };
    } else {
      const img = new Image();
      img.src = url;
      img.onload = () => {
        onProgress();
        resolve();
      };
      img.onerror = () => {
        onProgress();
        resolve();
      };
    }
  });
};

export const Splashscreen = ({ onComplete }) => {
  const { t } = useLanguage();
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    let loadedCount = 0;
    const totalCount = ASSETS_TO_LOAD.length;
    let isMounted = true;

    // Minimum 5 seconds loading timer
    const minTimer = new Promise((resolve) => setTimeout(resolve, 5000));

    const onProgress = () => {
      if (!isMounted) return;
      loadedCount++;
      const currentPercent = Math.min(Math.floor((loadedCount / totalCount) * 105), 100);
      setProgress(currentPercent);

      // Dynamically update localized Moroccan-themed loading status based on progress
      if (currentPercent < 30) {
        setStatusText(t('loading.cards') || 'Loading Medina cards...');
      } else if (currentPercent < 60) {
        setStatusText(t('loading.sounds') || 'Tuning instruments...');
      } else if (currentPercent < 90) {
        setStatusText(t('loading.environment') || 'Preparing the Zellij table...');
      } else {
        setStatusText(t('loading.complete') || 'Entering Medina...');
      }
    };

    const loadAll = async () => {
      // Load assets in chunks to avoid slamming the browser/network connections
      const chunkSize = 6;
      for (let i = 0; i < ASSETS_TO_LOAD.length; i += chunkSize) {
        const chunk = ASSETS_TO_LOAD.slice(i, i + chunkSize);
        await Promise.all(chunk.map(url => preloadAsset(url, onProgress)));
      }
      
      // Wait for both assets to load and the minimum 5-second timer to fire
      await minTimer;

      if (isMounted) {
        setIsFadingOut(true);
        setTimeout(() => {
          if (isMounted) onComplete();
        }, 800); // match framer-motion exit duration
      }
    };

    loadAll();

    return () => {
      isMounted = false;
    };
  }, [onComplete, t]);

  return (
    <AnimatePresence>
      {!isFadingOut && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-950 font-sans text-slate-100 overflow-hidden select-none"
        >
          {/* Subtle Zellij Backdrop (Desktop/Tablet) */}
          <div
            className="hidden sm:block absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: "url('/assets/background-zellig.svg')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'brightness(0.35) saturate(1.2)'
            }}
          />

          {/* Mobile Splash Background */}
          <div
            className="block sm:hidden absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: "url('/assets/splashscreen/splash_background_mobile.png')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />

          {/* Glowing background radial blur */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-radial from-amber-500/10 to-transparent blur-3xl pointer-events-none rounded-full" />

          {/* Central Content */}
          <div className="relative z-10 flex flex-col items-center justify-between max-w-sm w-full h-full min-h-[100dvh] pt-6 px-6 pb-2 text-center">
            {/* Top Block: Logo and Loader */}
            <div className="flex flex-col items-center justify-center flex-1 w-full mt-4">
              {/* Logo Container (Unanimated) */}
              <div className="mb-8 w-full">
                <img
                  src="/assets/splashscreen/ronda_banner.png"
                  alt="Ronda"
                  className="h-[40dvh] min-h-[220px] max-h-[450px] w-auto max-w-full object-contain mx-auto -mt-6 sm:-mt-10 drop-shadow-[0_4px_10px_rgba(0,0,0,0.6)]"
                />
                
                {/* Horizontal Row of Card Images */}
                <div className="flex justify-center items-center gap-1.5 sm:gap-2 -mt-4 sm:-mt-8 mb-4 w-full">
                  <img
                    src="/assets/splashscreen/10 dheb-vector.png"
                    alt="10 Dheb"
                    className="h-[7dvh] min-h-[48px] max-h-20 w-auto object-contain shadow-md rounded border border-white/10 bg-white"
                  />
                  <img
                    src="/assets/splashscreen/11 syouf-vector.png"
                    alt="11 Syouf"
                    className="h-[7dvh] min-h-[48px] max-h-20 w-auto object-contain shadow-md rounded border border-white/10 bg-white"
                  />
                  <img
                    src="/assets/splashscreen/1 dheb-vector.png"
                    alt="1 Dheb"
                    className="h-[7dvh] min-h-[48px] max-h-20 w-auto object-contain shadow-md rounded border border-white/10 bg-white"
                  />
                  <img
                    src="/assets/splashscreen/12 jben-vector.png"
                    alt="12 Jben"
                    className="h-[7dvh] min-h-[48px] max-h-20 w-auto object-contain shadow-md rounded border border-white/10 bg-white"
                  />
                  <img
                    src="/assets/splashscreen/4 syouf-vector.png"
                    alt="4 Syouf"
                    className="h-[7dvh] min-h-[48px] max-h-20 w-auto object-contain shadow-md rounded border border-white/10 bg-white"
                  />
                </div>

                <p className="text-amber-400/90 text-[10px] tracking-[0.2em] font-extrabold uppercase mt-2 drop-shadow-sm">
                  A Timeless Moroccan Classic
                </p>
              </div>

              {/* Custom Loading Bar Container */}
              <div className="w-full bg-slate-900/60 border border-white/5 rounded-full p-1.5 backdrop-blur-md shadow-inner shadow-black/50 mb-4">
                <div className="relative h-3 w-full bg-black/40 rounded-full overflow-hidden">
                  {/* Glowing Progress bar */}
                  <motion.div
                    className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-400 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.5)]"
                    style={{ width: `${progress}%` }}
                    layout
                    transition={{ type: 'spring', stiffness: 60, damping: 15 }}
                  />
                </div>
              </div>

              {/* Status and Percentage */}
              <div className="flex flex-col items-center gap-1.5 h-12">
                <span className="text-sm font-bold text-amber-300/95 tracking-wide drop-shadow">
                  {progress}%
                </span>
                <motion.span
                  key={statusText}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-xs font-semibold text-amber-400/90 uppercase tracking-widest drop-shadow-sm"
                >
                  {statusText}
                </motion.span>
              </div>
            </div>

            {/* Bottom Block: Presented By */}
            <div className="w-full flex flex-col items-center mt-auto pb-0">
              {/* Presented By Logo */}
              <div className="mt-2 flex flex-col items-center gap-1">
                <span className="text-[11px] uppercase tracking-[0.25em] text-amber-500/85 font-extrabold drop-shadow-sm">
                  presented by
                </span>
                <img
                  src="/atlas_lion_logo.png"
                  alt="Logo"
                  className="h-[15dvh] min-h-[80px] max-h-[160px] w-auto object-contain opacity-80"
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
