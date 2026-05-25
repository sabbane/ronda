import { LobbyClient } from 'boardgame.io/dist/esm/client.js';

const lobbyClient = new LobbyClient({ server: 'http://localhost:8000' });

async function test() {
  try {
    const matchID = `test-room-${Date.now()}`;
    console.log('Creating match...', matchID);
    const matchInfo = await lobbyClient.createMatch('ronda', {
      numPlayers: 2,
      setupData: { gameStarted: false },
      matchID: matchID
    });
    console.log('Match created successfully. MatchInfo:', matchInfo);

    console.log('Joining match...');
    const res = await lobbyClient.joinMatch('ronda', matchInfo.matchID, {
      playerID: '0',
      playerName: 'RondaLegend'
    });
    console.log('Joined match successfully. Res keys:', Object.keys(res));
    console.log('Full JSON:', JSON.stringify(res));
  } catch (err) {
    console.error('Error encountered:', err);
  }
}

test();
