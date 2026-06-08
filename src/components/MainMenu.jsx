import { Volume2, VolumeX, Music } from 'lucide-react';

export const MainMenu = ({
  language,
  changeLanguage,
  t,
  isMuted,
  toggleMute,
  playClick,
  currentTrack,
  tracks,
  nextTrack,
  nickname,
  setNickname,
  multiplayerAction,
  setMultiplayerAction,
  isPrivate,
  setIsPrivate,
  maxPlayers,
  setMaxPlayers,
  joinMode,
  setJoinMode,
  joinRoomId,
  setJoinRoomId,
  publicRooms,
  fetchPublicRooms,
  isLoadingRooms,
  error,
  setError,
  isCheckingRoom,
  handleCreateRoom,
  handleJoinRoom,
  setMode,
}) => {
  return (
    <div className="min-h-screen flex flex-col items-center text-white bg-blue-600 bg-opacity-70 relative overflow-hidden overflow-y-auto">
      <div className="flex-1 flex flex-col w-full items-center justify-center p-4 z-30 pt-4 pb-8 menu-container">
        <div className="p-6 sm:p-8 rounded-3xl shadow-[0_0_60px_rgba(30,58,138,0.35)] border-2 border-amber-400/30 text-center max-w-lg w-full relative menu-card flex flex-col justify-between min-h-[82vh] sm:min-h-0" style={{backgroundColor: 'rgba(30, 58, 138, 0.7)'}}>
          <h1 className="text-7xl font-black mb-4 text-[#D69E2E] tracking-tighter drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] menu-logo">{t('logo')}</h1>

           {/* Language & Sound Selector in Center */}
          <div className="flex flex-col items-center gap-3 mb-8 menu-selectors" dir="ltr">
            {/* Language Selector row */}
            <div className="flex justify-center gap-2">
              <button
                onClick={() => { playClick(); changeLanguage('en'); }}
                className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 border transition-all duration-75 cursor-pointer ${language === 'en' ? 'bg-amber-600 border-2 border-amber-300 text-white shadow-inner translate-y-[2px]' : 'bg-white/10 border-white/10 text-slate-300 hover:bg-white/20 active:translate-y-[2px]'}`}
              >
                <img src="/flag-gb.svg" alt="EN" className="w-4 h-3 object-cover rounded-sm" /> EN
              </button>
              <button
                onClick={() => { playClick(); changeLanguage('fr'); }}
                className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 border transition-all duration-75 cursor-pointer ${language === 'fr' ? 'bg-amber-600 border-2 border-amber-300 text-white shadow-inner translate-y-[2px]' : 'bg-white/10 border-white/10 text-slate-300 hover:bg-white/20 active:translate-y-[2px]'}`}
              >
                <img src="/flag-fr.svg" alt="FR" className="w-4 h-3 object-cover rounded-sm" /> FR
              </button>
              <button
                onClick={() => { playClick(); changeLanguage('ar'); }}
                className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 border transition-all duration-75 cursor-pointer ${language === 'ar' ? 'bg-amber-600 border-2 border-amber-300 text-white shadow-inner translate-y-[2px]' : 'bg-white/10 border-white/10 text-slate-300 hover:bg-white/20 active:translate-y-[2px]'}`}
              >
                <img src="/flag-ma.svg" alt="AR" className="w-4 h-3 object-cover rounded-sm" /> AR
              </button>
            </div>

            {/* Music and Mute controls row */}
            <div className="flex justify-center gap-2">
              <button
                onClick={() => { playClick(); nextTrack(); }}
                className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 bg-white/10 border border-white/10 text-slate-300 hover:bg-white/20 backdrop-blur-md transition-all duration-75 active:translate-y-[2px] cursor-pointer`}
                title={tracks && tracks[currentTrack] ? `${t('changeTrack')}: ${tracks[currentTrack].name}` : t('changeTrack')}
              >
                <div className="relative flex items-center justify-center">
                  <Music 
                    size={14} 
                    className={tracks && tracks[currentTrack]?.name === "No Sound" ? "text-slate-400" : "text-amber-400 animate-pulse"} 
                  />
                  {tracks && tracks[currentTrack]?.name === "No Sound" && (
                    <div className="absolute w-[18px] h-[1.5px] bg-red-400 rotate-45 rounded-sm shadow-sm" />
                  )}
                </div>
                <span>{tracks && tracks[currentTrack] ? tracks[currentTrack].name : t('music')}</span>
              </button>
              <button
                onClick={toggleMute}
                className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 bg-white/10 border border-white/10 text-slate-300 hover:bg-white/20 backdrop-blur-md transition-all duration-75 active:translate-y-[2px] cursor-pointer`}
                title={isMuted ? t('unmuteSound') : t('muteSound')}
              >
                {isMuted ? <VolumeX size={14} className="text-red-400" /> : <Volume2 size={14} className="text-emerald-400" />}
                <span>{isMuted ? t('muted') : t('sound')}</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-6 menu-sections">
            {multiplayerAction === null ? (
              <>
                {/* Singleplayer Box */}
                <div className="bg-black/30 p-6 rounded-2xl border border-amber-500/10 menu-box backdrop-blur-sm">
                  <h2 className="text-sm font-extrabold mb-4 text-amber-200/90 uppercase tracking-widest">{t('singleplayer')}</h2>
                  <button
                    onClick={() => { playClick(); setMode('bot'); }}
                    className="w-full btn-moroccan-gold px-6 py-4 rounded-xl font-bold text-lg cursor-pointer menu-btn-large"
                  >
                    {t('playVsBot')}
                  </button>
                </div>

                {/* Online Multiplayer Box */}
                <div className="bg-black/30 p-6 rounded-2xl border border-amber-500/10 menu-box backdrop-blur-sm">
                  <h2 className="text-sm font-extrabold mb-4 text-amber-200/90 uppercase tracking-widest">{t('onlineMultiplayer')}</h2>
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => { playClick(); setMultiplayerAction('create'); }}
                      className="w-full btn-moroccan-primary px-5 py-3.5 rounded-xl font-bold text-base cursor-pointer menu-btn-medium"
                    >
                      {t('createRoom')}
                    </button>
                    <button
                      onClick={() => { playClick(); setMultiplayerAction('join'); }}
                      className="w-full btn-moroccan-secondary px-5 py-3.5 rounded-xl font-bold text-base cursor-pointer menu-btn-medium"
                    >
                      {t('joinRoom')}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* Dynamic Merged Panel for Room Creation / Joining */
              <div className="border-2 border-amber-400/30 p-6 rounded-3xl shadow-2xl relative text-left menu-subpanel" style={{backgroundColor: 'rgba(30, 58, 138, 0.7)'}}>
                <h2 className="text-2xl font-extrabold mb-6 text-amber-300 border-b border-white/10 pb-3 flex justify-between items-center">
                  <span>
                    {multiplayerAction === 'create' ? t('createRoom') : t('joinRoom')}
                  </span>
                  <span className="text-xs font-mono text-slate-500 uppercase tracking-wider bg-slate-950/60 px-2.5 py-1 rounded-md border border-white/5">
                    Multiplayer
                  </span>
                </h2>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/40 text-red-200 px-4 py-3 rounded-xl text-xs font-medium mb-5 animate-pulse">
                    {error}
                  </div>
                )}

                {multiplayerAction === 'create' ? (
                  /* CREATE ROOM VIEW */
                  <div className="flex flex-col gap-4">
                    {/* Name input */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">{t('yourNickname')}</label>
                      <input
                        type="text"
                        value={nickname}
                        maxLength={15}
                        onChange={e => setNickname(e.target.value)}
                        className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-medium focus:outline-none focus:border-amber-500/50 transition-colors"
                        placeholder={t('enterNickname')}
                      />
                    </div>

                    {/* Room Privacy Choice */}
                    <div className="flex flex-col gap-1.5 mt-1">
                      <label className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">{t('roomPrivacy')}</label>
                      <div className="grid grid-cols-2 gap-2 bg-black/40 p-1 rounded-xl border border-white/5">
                        <button
                          type="button"
                          onClick={() => { playClick(); setIsPrivate(false); }}
                          className={`py-2 px-3 rounded-lg text-xs font-bold transition-all duration-75 cursor-pointer border ${!isPrivate ? 'bg-amber-600 border-amber-400 text-white shadow-inner translate-y-[1.5px]' : 'bg-transparent border-transparent text-slate-400 hover:text-white hover:bg-white/5 active:translate-y-[1.5px]'}`}
                        >
                          {t('public')}
                        </button>
                        <button
                          type="button"
                          onClick={() => { playClick(); setIsPrivate(true); }}
                          className={`py-2 px-3 rounded-lg text-xs font-bold transition-all duration-75 cursor-pointer border ${isPrivate ? 'bg-amber-600 border-amber-400 text-white shadow-inner translate-y-[1.5px]' : 'bg-transparent border-transparent text-slate-400 hover:text-white hover:bg-white/5 active:translate-y-[1.5px]'}`}
                        >
                          {t('private')}
                        </button>
                      </div>
                    </div>

                    {/* Player Count Choice */}
                    <div className="flex flex-col gap-1.5 mt-1">
                      <label className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">
                        {t('playerCount')}
                      </label>
                      <div className="grid grid-cols-2 gap-2 bg-black/40 p-1 rounded-xl border border-white/5">
                        <button
                          type="button"
                          onClick={() => { playClick(); setMaxPlayers(2); }}
                          className={`py-2 px-3 rounded-lg text-xs font-bold transition-all duration-75 cursor-pointer border ${maxPlayers === 2 ? 'bg-amber-600 border-amber-400 text-white shadow-inner translate-y-[1.5px]' : 'bg-transparent border-transparent text-slate-400 hover:text-white hover:bg-white/5 active:translate-y-[1.5px]'}`}
                        >
                          {t('playersCount2')}
                        </button>
                        <button
                          type="button"
                          onClick={() => { playClick(); setMaxPlayers(4); }}
                          className={`py-2 px-3 rounded-lg text-xs font-bold transition-all duration-75 cursor-pointer border ${maxPlayers === 4 ? 'bg-amber-600 border-amber-400 text-white shadow-inner translate-y-[1.5px]' : 'bg-transparent border-transparent text-slate-400 hover:text-white hover:bg-white/5 active:translate-y-[1.5px]'}`}
                        >
                          {t('playersCount4')}
                        </button>
                      </div>
                    </div>

                    {/* Create and Cancel buttons */}
                    <div className="flex gap-3 mt-4 border-t border-white/5 pt-4">
                      <button
                        onClick={() => { playClick(); setMultiplayerAction(null); setError(null); }}
                        className="flex-1 btn-moroccan-secondary px-4 py-3 rounded-xl font-bold text-sm text-center cursor-pointer"
                      >
                        {t('cancel')}
                      </button>
                      <button
                        disabled={isCheckingRoom}
                        onClick={() => { playClick(); handleCreateRoom(); }}
                        className="flex-1 btn-moroccan-primary disabled:opacity-50 px-4 py-3 rounded-xl font-bold text-sm text-center cursor-pointer"
                      >
                        {isCheckingRoom ? '...' : t('create')}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* JOIN ROOM VIEW */
                  <div className="flex flex-col gap-4">
                    {/* Name input */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">{t('yourNickname')}</label>
                      <input
                        type="text"
                        value={nickname}
                        maxLength={15}
                        onChange={e => setNickname(e.target.value)}
                        className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-medium focus:outline-none focus:border-amber-500/50 transition-colors"
                        placeholder={t('enterNickname')}
                      />
                    </div>

                    {/* Join mode tabs */}
                    <div className="grid grid-cols-2 gap-2 bg-black/40 p-1 rounded-xl border border-white/5 mt-1">
                      <button
                        type="button"
                        onClick={() => { playClick(); setJoinMode('public'); }}
                        className={`py-2 px-3 rounded-lg text-xs font-bold transition-all duration-75 cursor-pointer border ${joinMode === 'public' ? 'bg-amber-600 border-amber-400 text-white shadow-inner translate-y-[1.5px]' : 'bg-transparent border-transparent text-slate-400 hover:text-white hover:bg-white/5 active:translate-y-[1.5px]'}`}
                      >
                        {t('publicRooms')}
                      </button>
                      <button
                        type="button"
                        onClick={() => { playClick(); setJoinMode('private'); }}
                        className={`py-2 px-3 rounded-lg text-xs font-bold transition-all duration-75 cursor-pointer border ${joinMode === 'private' ? 'bg-amber-600 border-amber-400 text-white shadow-inner translate-y-[1.5px]' : 'bg-transparent border-transparent text-slate-400 hover:text-white hover:bg-white/5 active:translate-y-[1.5px]'}`}
                      >
                        {t('privateRoom')}
                      </button>
                    </div>

                    {joinMode === 'public' ? (
                      /* PUBLIC ROOMS BROWSER */
                      <div className="flex flex-col gap-2 mt-2">
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">{t('openRooms')}</label>
                          <button
                            onClick={() => { playClick(); fetchPublicRooms(); }}
                            className="text-[10px] text-amber-400/80 hover:text-amber-300 font-semibold uppercase tracking-wider cursor-pointer"
                          >
                            {t('refresh')}
                          </button>
                        </div>

                        {isLoadingRooms ? (
                          <div className="py-8 text-center text-slate-400 text-sm animate-pulse flex items-center justify-center gap-2 bg-black/20 rounded-xl border border-white/5">
                            <span className="w-4 h-4 rounded-full border-2 border-t-amber-400 border-white/10 animate-spin"></span>
                            {t('searchingRooms')}
                          </div>
                        ) : publicRooms.length === 0 ? (
                          <div className="py-8 text-center text-slate-500 text-sm bg-black/20 rounded-xl border border-white/5 px-4">
                            {t('noRoomsFound')}
                          </div>
                        ) : (
                          <div className="max-h-[160px] overflow-y-auto flex flex-col gap-2 pr-1 custom-scrollbar menu-rooms-list">
                            {publicRooms.map(room => {
                              const hostPlayer = room.players[0];
                              const hostName = hostPlayer ? (hostPlayer.name || 'Host') : 'Host';
                              return (
                                <div
                                  key={room.matchID}
                                  className="flex justify-between items-center p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-all"
                                >
                                  <div className="flex flex-col">
                                    <span className="text-xs font-mono font-bold text-amber-200">{room.matchID}</span>
                                    <span className="text-[10px] text-slate-400 mt-0.5">Host: {hostName}</span>
                                  </div>
                                  <button
                                    onClick={() => { playClick(); handleJoinRoom(room.matchID); }}
                                    className="px-3.5 py-1.5 btn-moroccan-primary rounded-lg text-xs font-bold cursor-pointer"
                                  >
                                    {t('join')}
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ) : (
                      /* PRIVATE ROOM JOIN INPUT */
                      <div className="flex flex-col gap-1.5 mt-2">
                        <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">{t('matchId')}</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={joinRoomId}
                            onChange={e => setJoinRoomId(e.target.value)}
                            className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-mono focus:outline-none focus:border-amber-500/50 transition-colors"
                            placeholder={t('enterRoomId')}
                            required
                          />
                          <button
                            disabled={isCheckingRoom || !joinRoomId.trim()}
                            onClick={() => { playClick(); handleJoinRoom(joinRoomId.trim()); }}
                            className="btn-moroccan-primary disabled:opacity-50 px-5 py-3 rounded-xl font-bold text-sm cursor-pointer"
                          >
                            {isCheckingRoom ? '...' : t('join')}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Cancel button */}
                    <div className="flex mt-4 border-t border-white/5 pt-4">
                      <button
                        onClick={() => { playClick(); setMultiplayerAction(null); setError(null); }}
                        className="w-full btn-moroccan-secondary px-4 py-3 rounded-xl font-bold text-sm text-center cursor-pointer"
                      >
                        {t('back')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Rules Button - Low Contrast Blended Footer */}
            <div className="flex w-full mt-2.5">
              <button
                onClick={() => { playClick(); setMode('rules'); }}
                className="w-full py-2 rounded-xl font-bold text-sm cursor-pointer flex items-center justify-center gap-1.5 border border-[#D69E2E]/10 bg-[#D69E2E]/5 text-[#D69E2E]/60 hover:bg-[#D69E2E]/10 hover:text-[#D69E2E] transition-all duration-75 active:translate-y-[1px]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-60"><circle cx="12" cy="12" r="4"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
                {t('rulesBtn')}
              </button>
            </div>
          </div>
        </div>

        {/* Version */}
        <div className="flex flex-col items-center gap-4 mt-6 z-30 menu-version">
          <span className="text-[10px] text-slate-500 font-medium tracking-widest uppercase opacity-50">
            v{import.meta.env.VITE_APP_VERSION}
          </span>
        </div>
      </div>
    </div>
  );
};
