import { useState } from 'react';
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

const RondaClientBot = ReactClient({
  game: RondaGame,
  board: RondaBoard,
  numPlayers: 2,
  multiplayer: Local({
    bots: {
      '1': class extends RandomBot {
        constructor(opts) {
          super({
            enumerate: RondaGame.ai.enumerate,
            ...opts
          });
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
  multiplayer: SocketIO({ server: socketServerUrl }),
});

const RondaClientOnline4 = ReactClient({
  game: RondaGame,
  board: RondaBoard,
  numPlayers: 4,
  multiplayer: SocketIO({ server: socketServerUrl }),
});

const App = () => {
  const { language, changeLanguage, t } = useLanguage();
  const { isMuted, toggleMute, playClick, currentTrack, tracks, nextTrack } = useSound();
  
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

  const [showSplash, setShowSplash] = useState(() => {
    if (typeof window !== 'undefined' && window.navigator.webdriver) {
      return false;
    }
    return true;
  });

  if (showSplash) {
    return <Splashscreen onComplete={() => setShowSplash(false)} />;
  }

  if (mode === 'rules') {
    return <Rules onBack={() => {
      setMode(null);
      setError(null);
    }} />;
  }

  if (!mode) {
    return (
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
        setMode={setMode}
      />
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {mode === 'bot' && (
        <RondaClientBot
          key={`bot-${gameKey}`}
          matchID={`bot-room-${gameKey}`}
          playerID="0"
          setupData={{ testMode, gameStarted: true }}
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
          />
        ) : (
          <RondaClientOnline2
            key={`online-${gameKey}`}
            matchID={matchID}
            playerID={playerID}
            credentials={credentials}
            setupData={{ testMode, gameStarted: false }}
          />
        )
      )}
    </div>
  );
};

export default App;
