import React from 'react';
import { Copy, Music, Volume2, VolumeX } from 'lucide-react';

export const WaitingLobby = ({
  G,
  ctx,
  moves,
  myID,
  opponentID,
  matchID,
  language,
  t,
  playClick,
  onLeave,
  nextTrack,
  toggleMute,
  isMuted,
  currentTrack,
  tracks
}) => {
  const inviteLink = `${window.location.protocol}//${window.location.host}${window.location.pathname}?room=${matchID || ''}`;
  const numP = ctx.numPlayers || 2;
  const allPlayersJoined = Array.from({ length: numP }, (_, i) => String(i)).every(pID => !!G.players[pID]?.name?.trim());

  const handleShare = async () => {
    playClick();
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Ronda',
          text: t('shareText') || 'Join my Ronda game!',
          url: inviteLink
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      navigator.clipboard.writeText(inviteLink);
      alert(t('linkCopied') || 'Link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-4 font-sans text-slate-100 relative overflow-y-auto overflow-x-hidden">
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: "url('/assets/background-zellig.svg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.45) saturate(1.05)',
          zIndex: 0
        }}
      />

      {/* Back to Menu Button */}
      <div className="absolute top-4 start-4 z-[60]">
        <button 
          onClick={onLeave}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800/80 hover:bg-slate-700 backdrop-blur-md text-slate-200 rounded-full border border-white/15 transition-all duration-75 active:translate-y-[2px] shadow-md group cursor-pointer"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="18" height="18" 
            viewBox="0 0 24 24" 
            fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            className="group-hover:-translate-x-1 transition-transform rtl:group-hover:translate-x-1"
          >
            <path d="m15 18-6-6 6-6"/>
          </svg>
          <span className="text-sm font-bold tracking-wider">{t('backToMenu')}</span>
        </button>
      </div>

      {/* Music & Sound in Lobby */}
      <div className="absolute top-4 end-4 z-[60] flex items-center gap-2">
        <button 
          onClick={() => { playClick(); nextTrack(); }}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 backdrop-blur-md text-slate-200 rounded-full border border-white/15 transition-all duration-75 active:translate-y-[2px] shadow-md cursor-pointer"
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
          <span className="text-slate-300 font-medium text-xs hidden sm:inline">{tracks && tracks[currentTrack] ? tracks[currentTrack].name : "Musik"}</span>
        </button>
        <button 
          onClick={toggleMute}
          className="flex items-center justify-center p-2 bg-slate-800/80 hover:bg-slate-700 backdrop-blur-md text-slate-200 rounded-full border border-white/15 transition-all duration-75 active:translate-y-[2px] shadow-md cursor-pointer"
        >
          {isMuted ? <VolumeX size={14} className="text-red-400" /> : <Volume2 size={14} className="text-emerald-400" />}
        </button>
      </div>

      {/* Main Lobby Glass Box */}
      <div className="bg-slate-900/80 backdrop-blur-2xl p-6 sm:p-10 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 text-center max-w-xl w-full relative z-10 my-4 flex flex-col justify-between min-h-[82vh] sm:min-h-0">
        <h1 className="text-4xl sm:text-5xl font-black mb-1 text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-500 tracking-tighter drop-shadow-2xl">
          {language === 'de' ? 'Spiel-Lobby' : 'Game Lobby'}
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm mb-6 sm:mb-8 font-medium tracking-wide uppercase">
          {language === 'de' ? 'Warten auf Spieler...' : 'Waiting for players...'}
        </p>

        {/* Invitation / Room ID Card */}
        <div className="bg-black/40 border border-white/5 rounded-2xl p-4 mb-6 sm:mb-8 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-400 uppercase tracking-widest font-bold">{language === 'de' ? 'Raum-ID' : 'Room ID'}</span>
            <span className="text-sm font-mono font-bold text-amber-300 bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/20 flex items-center gap-2">
              {matchID}
              <button
                onClick={() => navigator.clipboard.writeText(matchID)}
                className="p-1 hover:bg-amber-500/20 rounded-full transition-colors"
                title={language === 'de' ? 'Kopieren' : 'Copy'}
              >
                <Copy size={14} className="text-amber-300" />
              </button>
            </span>
          </div>
        </div>

        {/* Players Grid */}
        {numP === 2 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
            {['0', '1'].map((pID) => {
              const isHost = pID === '0';
              const pName = G.players[pID]?.name || '';
              const hasJoined = isHost || !!pName.trim();
              const isLocalPlayer = myID === pID;
              const role = isHost ? 'Host' : (language === 'de' ? 'Gegner' : language === 'fr' ? 'Adversaire' : language === 'ar' ? 'خصم' : 'Opponent');
              const badgeColor = isHost ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-purple-500/20 text-purple-300 border-purple-500/30';
              const iconBg = hasJoined ? (isHost ? 'bg-amber-600/20 border-amber-500/30 text-amber-400' : 'bg-purple-600/20 border-purple-500/30 text-purple-400') : 'bg-white/5 border border-white/5 text-slate-600 animate-pulse';

              return (
                <div key={pID} className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col items-center relative overflow-hidden group shadow-lg">
                  <div className={`absolute top-3 right-3 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${badgeColor}`}>
                    {role}
                  </div>
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 ${iconBg}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  </div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">
                    {language === 'de' ? `Spieler ${parseInt(pID) + 1}` : `Player ${parseInt(pID) + 1}`}
                  </span>
                  {!hasJoined ? (
                    <span className="text-xs font-semibold text-slate-500 animate-pulse uppercase tracking-wider py-1">
                      {language === 'de' ? 'Warte...' : 'Waiting...'}
                    </span>
                  ) : isLocalPlayer ? (
                    <input
                      type="text"
                      maxLength={15}
                      value={G.players[pID]?.name || ''}
                      onChange={(e) => moves.setPlayerName(e.target.value)}
                      className="bg-black/50 border border-white/10 rounded-xl px-3 py-1.5 text-center text-white text-sm font-bold focus:outline-none focus:border-amber-500/50 w-full animate-fade-in"
                      placeholder={language === 'de' ? 'Dein Name' : 'Your name'}
                    />
                  ) : (
                    <span className="text-base font-bold text-slate-200">{pName || 'Host'}</span>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* 4 Players layout divided into Team A vs Team B */
          <div className="flex flex-col gap-8 mb-8 text-start select-none">
            {/* TEAM A Column */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-5 shadow-inner">
              {/* Team A Header / Name Input */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 pb-3 border-b border-white/5">
                <span className="text-sm font-extrabold text-amber-300 uppercase tracking-widest flex items-center gap-2">
                  🛡️ {language === 'de' ? 'Team A' : 'Team A'}
                </span>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-xs text-slate-400 whitespace-nowrap">{language === 'de' ? 'Team Name:' : 'Team Name:'}</span>
                  <input
                    type="text"
                    maxLength={20}
                    value={G.teamNames?.TeamA || ''}
                    readOnly={myID !== '0' && myID !== '2'}
                    onChange={(e) => moves.setTeamName({ team: 'TeamA', name: e.target.value })}
                    placeholder={language === 'de' ? 'Team A Name...' : 'Enter Team A Name...'}
                    className={`bg-black/35 border ${myID === '0' || myID === '2' ? 'border-amber-500/30 focus:border-amber-500/60 focus:outline-none' : 'border-white/5 pointer-events-none'} rounded-lg px-2.5 py-1 text-white text-xs font-bold w-full sm:w-48`}
                  />
                </div>
              </div>
              {/* Team A Player cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {['0', '2'].map((pID) => {
                  const isHost = pID === '0';
                  const pName = G.players[pID]?.name || '';
                  const hasJoined = isHost || !!pName.trim();
                  const isLocalPlayer = myID === pID;
                  const role = isHost ? 'Host' : (language === 'de' ? 'Partner (A)' : 'Partner (A)');
                  const badgeColor = 'bg-amber-500/20 text-amber-300 border border-amber-500/30';
                  const iconBg = hasJoined ? 'bg-amber-600/20 border border-amber-500/30 text-amber-400' : 'bg-white/5 border border-white/5 text-slate-600 animate-pulse';

                  return (
                    <div key={pID} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center relative overflow-hidden group shadow-lg">
                      <div className={`absolute top-3 right-3 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${badgeColor}`}>
                        {role}
                      </div>
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2.5 ${iconBg}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                      </div>
                      <span className="text-[9px] text-slate-400 uppercase tracking-widest font-bold mb-1">
                        {language === 'de' ? `Spieler ${parseInt(pID) + 1}` : `Player ${parseInt(pID) + 1}`}
                      </span>
                      {!hasJoined ? (
                        <button
                          onClick={() => {
                            playClick();
                            window.dispatchEvent(new CustomEvent('ronda-switch-seat', { detail: { newPlayerID: pID } }));
                          }}
                          className="mt-1 w-full bg-amber-500/10 hover:bg-amber-500/25 text-amber-300 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border border-amber-500/25 active:translate-y-[1px] cursor-pointer text-center"
                        >
                          {language === 'de' ? 'Team A beitreten' : 'Join Team A'}
                        </button>
                      ) : isLocalPlayer ? (
                        <input
                          type="text"
                          maxLength={15}
                          value={G.players[pID]?.name || ''}
                          onChange={(e) => moves.setPlayerName(e.target.value)}
                          className="bg-black/50 border border-white/10 rounded-xl px-3 py-1.5 text-center text-white text-sm font-bold focus:outline-none focus:border-amber-500/50 w-full animate-fade-in"
                          placeholder={language === 'de' ? 'Dein Name' : 'Your name'}
                        />
                      ) : (
                        <span className="text-base font-bold text-slate-200">{pName || 'Host'}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* TEAM B Column */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-5 shadow-inner">
              {/* Team B Header / Name Input */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 pb-3 border-b border-white/5">
                <span className="text-sm font-extrabold text-purple-300 uppercase tracking-widest flex items-center gap-2">
                  ⚔️ {language === 'de' ? 'Team B' : 'Team B'}
                </span>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-xs text-slate-400 whitespace-nowrap">{language === 'de' ? 'Team Name:' : 'Team Name:'}</span>
                  <input
                    type="text"
                    maxLength={20}
                    value={G.teamNames?.TeamB || ''}
                    readOnly={myID !== '1' && myID !== '3'}
                    onChange={(e) => moves.setTeamName({ team: 'TeamB', name: e.target.value })}
                    placeholder={language === 'de' ? 'Team B Name...' : 'Enter Team B Name...'}
                    className={`bg-black/35 border ${myID === '1' || myID === '3' ? 'border-purple-500/30 focus:border-purple-500/60 focus:outline-none' : 'border-white/5 pointer-events-none'} rounded-lg px-2.5 py-1 text-white text-xs font-bold w-full sm:w-48`}
                  />
                </div>
              </div>
              {/* Team B Player cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {['1', '3'].map((pID) => {
                  const pName = G.players[pID]?.name || '';
                  const hasJoined = !!pName.trim();
                  const isLocalPlayer = myID === pID;
                  const role = pID === '1' ? (language === 'de' ? 'Gegner 1 (B)' : 'Opponent 1 (B)') : (language === 'de' ? 'Gegner 2 (B)' : 'Opponent 2 (B)');
                  const badgeColor = 'bg-purple-500/20 text-purple-300 border-purple-500/30';
                  const iconBg = hasJoined ? 'bg-purple-600/20 border-purple-500/30 text-purple-400' : 'bg-white/5 border border-white/5 text-slate-600 animate-pulse';

                  return (
                    <div key={pID} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center relative overflow-hidden group shadow-lg">
                      <div className={`absolute top-3 right-3 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${badgeColor}`}>
                        {role}
                      </div>
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2.5 ${iconBg}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                      </div>
                      <span className="text-[9px] text-slate-400 uppercase tracking-widest font-bold mb-1">
                        {language === 'de' ? `Spieler ${parseInt(pID) + 1}` : `Player ${parseInt(pID) + 1}`}
                      </span>
                      {!hasJoined ? (
                        <button
                          onClick={() => {
                            playClick();
                            window.dispatchEvent(new CustomEvent('ronda-switch-seat', { detail: { newPlayerID: pID } }));
                          }}
                          className="mt-1 w-full bg-purple-500/10 hover:bg-purple-500/25 text-purple-300 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border border-purple-500/25 active:translate-y-[1px] cursor-pointer text-center"
                        >
                          {language === 'de' ? 'Team B beitreten' : 'Join Team B'}
                        </button>
                      ) : isLocalPlayer ? (
                        <input
                          type="text"
                          maxLength={15}
                          value={G.players[pID]?.name || ''}
                          onChange={(e) => moves.setPlayerName(e.target.value)}
                          className="bg-black/50 border border-white/10 rounded-xl px-3 py-1.5 text-center text-white text-sm font-bold focus:outline-none focus:border-amber-500/50 w-full animate-fade-in"
                          placeholder={language === 'de' ? 'Dein Name' : 'Your name'}
                        />
                      ) : (
                        <span className="text-base font-bold text-slate-200">{pName}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Lobby Controls */}
        <div className="border-t border-white/5 pt-6 flex flex-col gap-4">
          {myID === '0' ? (
            <button
              disabled={!allPlayersJoined}
              onClick={() => { playClick(); moves.startGame(); }}
              className="w-full btn-moroccan-gold disabled:opacity-60 disabled:pointer-events-none px-6 py-4 rounded-xl font-bold text-lg cursor-pointer"
            >
              {language === 'de' ? 'Spiel starten' : 'Start Game'}
            </button>
          ) : (
            <div className="bg-black/20 border border-white/5 rounded-xl py-3 px-4 flex items-center justify-center gap-2.5">
              <span className="w-3.5 h-3.5 rounded-full border-2 border-t-purple-400 border-white/10 animate-spin"></span>
              <span className="text-xs font-semibold text-purple-300 uppercase tracking-wider">
                {language === 'de' ? 'Warte auf Spielstart durch Host...' : 'Waiting for host to start...'}
              </span>
            </div>
          )}

          <button
            onClick={onLeave}
            className="w-full bg-white/5 hover:bg-white/10 py-3 rounded-xl font-bold transition-all text-sm border border-white/5 text-slate-400 hover:text-slate-300 cursor-pointer"
          >
            {language === 'de' ? 'Verlassen' : 'Leave Lobby'}
          </button>
        </div>
      </div>
    </div>
  );
};
