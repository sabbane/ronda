import { describe, it, expect, beforeEach } from 'vitest';
import { CHALLENGES, getChallengeById } from './challenges';
import { challengeService } from '../services/challengeService';
import { platformBridge } from '../services/platformBridge';

let memoryStore = {};

const mockLocalStorage = {
  getItem: (key) => (Object.prototype.hasOwnProperty.call(memoryStore, key) ? memoryStore[key] : null),
  setItem: (key, val) => { memoryStore[key] = String(val); },
  removeItem: (key) => { delete memoryStore[key]; },
  clear: () => { memoryStore = {}; }
};

Object.defineProperty(globalThis, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
  configurable: true
});

describe('Challenges Evaluation Logic', () => {
  it('has exactly 2 initial challenges configured', () => {
    expect(CHALLENGES.length).toBe(2);
    expect(CHALLENGES[0].id).toBe('el_haj_defeat');
    expect(CHALLENGES[1].id).toBe('el_haj_lead_10');
  });

  it('evaluates Challenge 1 (el_haj_defeat) correctly', () => {
    const ch1 = getChallengeById('el_haj_defeat');
    expect(ch1).not.toBeNull();
    expect(ch1.points).toBe(50);

    // Won match
    expect(ch1.requirement({ didIWin: true, myScore: 11, oppScore: 9 })).toBe(true);
    // Lost match
    expect(ch1.requirement({ didIWin: false, myScore: 8, oppScore: 11 })).toBe(false);
  });

  it('evaluates Challenge 2 (el_haj_lead_10) correctly', () => {
    const ch2 = getChallengeById('el_haj_lead_10');
    expect(ch2).not.toBeNull();
    expect(ch2.points).toBe(150);

    // Won with 10+ points difference (15 - 5 = 10)
    expect(ch2.requirement({ didIWin: true, myScore: 15, oppScore: 5 })).toBe(true);
    // Won with 12 points difference
    expect(ch2.requirement({ didIWin: true, myScore: 18, oppScore: 6 })).toBe(true);
    // Won with only 5 points difference
    expect(ch2.requirement({ didIWin: true, myScore: 15, oppScore: 10 })).toBe(false);
    // Lost
    expect(ch2.requirement({ didIWin: false, myScore: 5, oppScore: 15 })).toBe(false);
  });
});

describe('PlatformBridge & Cloud Save', () => {
  it('detects standalone platform in standard web environment', () => {
    expect(platformBridge.getPlatformName()).toBe('standalone');
  });

  it('generates persistent unique player ID for auto-guest profile', () => {
    mockLocalStorage.clear();
    const id1 = challengeService.getPlayerId();
    expect(id1).toMatch(/^usr_/);
    const id2 = challengeService.getPlayerId();
    expect(id2).toBe(id1);
  });
});

describe('ChallengeService Local Storage & Score Management', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
  });

  it('gets and sets permanent singleplayer username', () => {
    expect(challengeService.getUsername()).toBe('');
    challengeService.setUsername('AtlasKing');
    expect(challengeService.getUsername()).toBe('AtlasKing');
  });

  it('tracks free play wins (+5 pts) and losses (-1 pt, floor 0)', async () => {
    challengeService.setUsername('TestPlayer');
    const win1 = await challengeService.submitFreePlayWin();
    expect(win1.totalPoints).toBe(5);

    const loss1 = await challengeService.submitFreePlayLoss();
    expect(loss1.totalPoints).toBe(4);

    // Test floor 0
    await challengeService.submitFreePlayLoss();
    await challengeService.submitFreePlayLoss();
    await challengeService.submitFreePlayLoss();
    await challengeService.submitFreePlayLoss();
    const lossFloor = await challengeService.submitFreePlayLoss();
    expect(lossFloor.totalPoints).toBe(0);
  });

  it('tracks multiplayer wins (+10 / +20 pts) and losses (-2 / -4 pts)', async () => {
    challengeService.setUsername('MultiplayerChampion');

    // 2-player win: +10 pts
    await challengeService.submitMultiplayerWin(2);
    expect(challengeService.getProgress().totalPoints).toBe(10);

    // 2-player loss: -2 pts
    const resLoss2p = await challengeService.submitMultiplayerLoss(2);
    expect(resLoss2p.pointsDeducted).toBe(2);
    expect(resLoss2p.progress.totalPoints).toBe(8);

    // 4-player win: +20 pts -> 28
    await challengeService.submitMultiplayerWin(4);
    expect(challengeService.getProgress().totalPoints).toBe(28);

    // 4-player loss: -4 pts -> 24
    const resLoss4p = await challengeService.submitMultiplayerLoss(4);
    expect(resLoss4p.pointsDeducted).toBe(4);
    expect(resLoss4p.progress.totalPoints).toBe(24);
  });

  it('handles challenge result submission and 1-hour cooldown timer', async () => {
    challengeService.setUsername('ChallengeMaster');

    // Cooldown initially 0
    expect(challengeService.getChallengeCooldown('el_haj_defeat')).toBe(0);

    // Submit C1 win
    const res1 = await challengeService.submitChallengeResult('el_haj_defeat', { didIWin: true, myScore: 11, oppScore: 9 });
    expect(res1.completedNow).toBe(true);
    expect(res1.pointsEarned).toBe(50);

    // Cooldown should be ~3600 seconds
    const cd1 = challengeService.getChallengeCooldown('el_haj_defeat');
    expect(cd1).toBeGreaterThan(3500);
    expect(cd1).toBeLessThanOrEqual(3600);

    // Duplicate submission of C1 should not re-award points
    const res1Duplicate = await challengeService.submitChallengeResult('el_haj_defeat', { didIWin: true, myScore: 11, oppScore: 9 });
    expect(res1Duplicate.completedNow).toBe(false);
    expect(res1Duplicate.pointsEarned).toBe(0);

    // Submit C2 win
    const res2 = await challengeService.submitChallengeResult('el_haj_lead_10', { didIWin: true, myScore: 20, oppScore: 5 });
    expect(res2.completedNow).toBe(true);
    expect(res2.pointsEarned).toBe(150);

    const finalProgress = challengeService.getProgress();
    expect(finalProgress.totalPoints).toBe(200); // 50 + 150
    expect(finalProgress.completed).toEqual(['el_haj_defeat', 'el_haj_lead_10']);
  });
});
