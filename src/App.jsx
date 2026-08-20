import { useState, useEffect } from 'react';
import { Client as ReactClient } from 'boardgame.io/dist/esm/react.js';
import { Local, SocketIO } from 'boardgame.io/dist/esm/multiplayer.js';
import { RondaGame } from './game/game';
import { RandomBot } from 'boardgame.io/dist/esm/ai.js';
import { RondaBoard } from './components/Board';

import { useLanguage } from './contexts/LanguageContext';
import { Rules } from './components/Rules';
import { useSound } from './contexts/SoundContext';
import { MainMenu } from './components/MainMenu';
import { useLobby } from './hooks/useLobby';
import { Splashscreen } from './components/Splashscreen';
import { StatsDashboard } from './components/StatsDashboard';
import { UsernameModal } from './components/UsernameModal';
import { ChallengeMenu } from './components/ChallengeMenu';
import { LeaderboardScreen } from './components/LeaderboardScreen';
import { challengeService } from './services/challengeService';

if (typeof window !== 'undefined') {
  window.isRondaBotGame = true;
}

const RondaClientBot = ReactClient({
  game: RondaGame,
  board: RondaBoard,
  numPlayers: 2,
  debug: false,
  multiplayer: Local({
    bots: {
      '1': class extends RandomBot {
        constructor(opts) {
          super({
            enumerate: RondaGame.ai.enumerate,
            ...opts
          });
        }
        async play(state, playerID) {
          if (!state || !state.G || !state.ctx) {
            return new Promise(() => {});
          }
          const { G, ctx } = state;

          const isBotActive = ctx.activePlayers 
            ? (playerID in ctx.activePlayers) 
            : (ctx.currentPlayer === playerID);

          if (G.isAnimating || (G.announcements && G.announcements.length > 0) || !isBotActive) {
            return new Promise(() => {});
          }

          const moves = RondaGame.ai.enumerate(G, ctx, playerID);
          if (!moves || moves.length === 0) {
            return new Promise(() => {});
          }

          const res = await super.play(state, playerID);
          return res;
        }
      }
    },
    botDelay: 2800
  }),
});

const socketServerUrl = import.meta.env.VITE_SERVER_URL || (
  import.meta.env.DEV
    ? 'http://localhost:8000' // aislop-ignore-line
    : `https://ronda-backend.up.railway.app` // aislop-ignore-line
);

const RondaClientOnline2 = ReactClient({
  game: RondaGame,
  board: RondaBoard,
  numPlayers: 2,
  debug: false,
  multiplayer: SocketIO({ server: socketServerUrl }),
});

const RondaClientOnline4 = ReactClient({
  game: RondaGame,
  board: RondaBoard,
  numPlayers: 4,
  debug: false,
  multiplayer: SocketIO({ server: socketServerUrl }),
});

const App = () => {
  const { language, changeLanguage, t } = useLanguage();
  const { isMuted, toggleMute, playClick, currentTrack, tracks, nextTrack, enableBGM } = useSound();
  
  const {
    mode, setMode,
    testMode,
    playerID,
    matchID,
    nickname, setNickname,
    multiplayerAction, setMultiplayerAction,
    isPrivate, setIsPrivate,
    maxPlayers, setMaxPlayers,
    matchNumPlayers,
    joinMode, setJoinMode,
    joinRoomId, setJoinRoomId,
    publicRooms,
    isLoadingRooms,
    gameKey,
    error, setError,
    credentials,
    isCheckingRoom,
    handleCreateRoom,
    handleJoinRoom,
    fetchPublicRooms
  } = useLobby();

  if (typeof window !== 'undefined') {
    // eslint-disable-next-line react-hooks/immutability
    window.isRondaBotGame = mode === 'bot';
  }

  const [showSplash, setShowSplash] = useState(() => {
    if (typeof window !== 'undefined' && window.navigator.webdriver) {
      return false;
    }
    return true;
  });

  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [pendingTargetMode, setPendingTargetMode] = useState(null);
  const [leaderboardPreviousMode, setLeaderboardPreviousMode] = useState(null);

  const handleRequireUsername = (targetMode) => {
    if (targetMode === 'leaderboard') {
      setLeaderboardPreviousMode(null);
    }
    setPendingTargetMode(targetMode);
    setShowUsernameModal(true);
  };

  const handleUsernameSubmit = async (name) => {
    await challengeService.updateDisplayName(name);
    setShowUsernameModal(false);
    if (pendingTargetMode) {
      if (pendingTargetMode === 'bot') {
        window.activeRondaChallengeId = null;
      }
      setMode(pendingTargetMode);
      setPendingTargetMode(null);
    }
  };

  useEffect(() => {
    if (!showSplash) {
      enableBGM();
    }
  }, [showSplash, enableBGM]);

  useEffect(() => {
    const handleUrlCheck = () => {
      const hash = window.location.hash;
      const params = new URLSearchParams(window.location.search);
      if (hash === '#/stats' || params.get('mode') === 'stats') {
        setMode('stats');
      }
    };
    handleUrlCheck();
    window.addEventListener('hashchange', handleUrlCheck);
    window.addEventListener('popstate', handleUrlCheck);
    return () => {
      window.removeEventListener('hashchange', handleUrlCheck);
      window.removeEventListener('popstate', handleUrlCheck);
    };
  }, [setMode]);

  if (showSplash) {
    return <Splashscreen onComplete={() => setShowSplash(false)} />;
  }

  if (mode === 'rules') {
    return <Rules onBack={() => {
      setMode(null);
      setError(null);
    }} />;
  }

  if (mode === 'stats') {
    return (
      <StatsDashboard
        onBack={() => {
          setMode(null);
          setError(null);
          try {
            const newUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
            window.history.replaceState({ path: newUrl }, '', newUrl);
          } catch { /* ignore */ }
        }}
      />
    );
  }
  if (mode === 'challenge_menu') {
    return (
      <>
        <ChallengeMenu
          t={t}
          playClick={playClick}
          onBack={() => {
            setMode(null);
            setError(null);
          }}
          onOpenLeaderboard={() => {
            setLeaderboardPreviousMode('challenge_menu');
            setMode('leaderboard');
          }}
          onStartChallenge={(chId) => {
            window.activeRondaChallengeId = chId;
            setMode('bot');
          }}
        />
        <UsernameModal
          isOpen={showUsernameModal}
          t={t}
          onSubmit={handleUsernameSubmit}
        />
      </>
    );
  }

  if (mode === 'leaderboard') {
    return (
      <>
        <LeaderboardScreen
          t={t}
          playClick={playClick}
          previousMode={leaderboardPreviousMode}
          onBack={() => {
            setMode(leaderboardPreviousMode || null);
            setLeaderboardPreviousMode(null);
            setError(null);
          }}
        />
        <UsernameModal
          isOpen={showUsernameModal}
          t={t}
          onSubmit={handleUsernameSubmit}
        />
      </>
    );
  }

  if (!mode) {
    return (
      <>
        <MainMenu
          language={language}
          changeLanguage={changeLanguage}
          t={t}
          isMuted={isMuted}
          toggleMute={toggleMute}
          playClick={playClick}
          currentTrack={currentTrack}
          tracks={tracks}
          nextTrack={nextTrack}
          nickname={nickname}
          setNickname={setNickname}
          multiplayerAction={multiplayerAction}
          setMultiplayerAction={setMultiplayerAction}
          isPrivate={isPrivate}
          setIsPrivate={setIsPrivate}
          maxPlayers={maxPlayers}
          setMaxPlayers={setMaxPlayers}
          joinMode={joinMode}
          setJoinMode={setJoinMode}
          joinRoomId={joinRoomId}
          setJoinRoomId={setJoinRoomId}
          publicRooms={publicRooms}
          fetchPublicRooms={fetchPublicRooms}
          isLoadingRooms={isLoadingRooms}
          error={error}
          setError={setError}
          isCheckingRoom={isCheckingRoom}
          handleCreateRoom={handleCreateRoom}
          handleJoinRoom={handleJoinRoom}
          setMode={(targetMode) => {
            if (targetMode === 'bot') {
              window.activeRondaChallengeId = null;
            }
            setMode(targetMode);
          }}
          onRequireUsername={handleRequireUsername}
        />
        <UsernameModal
          isOpen={showUsernameModal}
          t={t}
          onSubmit={handleUsernameSubmit}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {mode === 'bot' && (
        <RondaClientBot
          key={`bot-${gameKey}`}
          matchID={`bot-room-${gameKey}`}
          playerID="0"
          setupData={{ testMode: testMode || import.meta.env.VITE_TEST_MODE === 'true', gameStarted: true }}
          rondaMode="singleplayer"
        />
      )}
      {mode === 'online' && (credentials || testMode) && (
        matchNumPlayers === 4 ? (
          <RondaClientOnline4
            key={`online-${gameKey}`}
            matchID={matchID}
            playerID={playerID}
            credentials={credentials}
            setupData={{ testMode, gameStarted: false }}
            rondaMode={isPrivate ? "multiplayer_private" : "multiplayer_public"}
          />
        ) : (
          <RondaClientOnline2
            key={`online-${gameKey}`}
            matchID={matchID}
            playerID={playerID}
            credentials={credentials}
            setupData={{ testMode, gameStarted: false }}
            rondaMode={isPrivate ? "multiplayer_private" : "multiplayer_public"}
          />
        )
      )}
    </div>
  );
};

export default App;
