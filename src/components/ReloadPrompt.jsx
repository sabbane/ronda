import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

function ReloadPrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered: ' + r);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  if (!offlineReady && !needRefresh) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-2rem)] max-w-md">
      <div className="bg-slate-900/90 border border-amber-500/30 backdrop-blur-md p-4 rounded-2xl shadow-2xl flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-start gap-4">
          <div className="bg-amber-500/20 p-2 rounded-xl">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-amber-200 font-bold text-sm uppercase tracking-wider">
              {needRefresh ? 'Update verfügbar' : 'Bereit für Offline-Nutzung'}
            </h3>
            <p className="text-slate-400 text-xs mt-1 leading-relaxed">
              {needRefresh 
                ? 'Eine neue Version von Ronda ist bereit. Jetzt aktualisieren, um die neuesten Features zu nutzen!' 
                : 'Die App wurde für die Offline-Nutzung optimiert.'}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {needRefresh && (
            <button
              onClick={() => {
                updateServiceWorker(true);
                // Fallback: Falls der SW nicht sofort neu lädt
                setTimeout(() => {
                  window.location.reload();
                }, 1500);
              }}
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold py-2.5 rounded-xl transition-all active:scale-95 shadow-lg shadow-amber-500/20"
            >
              Jetzt aktualisieren
            </button>
          )}
          <button
            onClick={() => close()}
            className="flex-1 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold py-2.5 rounded-xl transition-all border border-white/5"
          >
            Später
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReloadPrompt;
