import { describe, it, expect, beforeEach } from 'vitest';
import { CHALLENGES, getChallengeById } from './challenges';
import { challengeService } from '../services/challengeService';

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

describe('ChallengeService Local Storage & Score Management', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('gets and sets permanent singleplayer username', () => {
    expect(challengeService.getUsername()).toBe('');
    challengeService.setUsername('AtlasKing');
    expect(challengeService.getUsername()).toBe('AtlasKing');
  });

  it('tracks free play wins (+5 pts)', async () => {
    challengeService.setUsername('TestPlayer');
    const updated = await challengeService.submitFreePlayWin();
    expect(updated.freePlayWins).toBe(1);
    expect(updated.totalPoints).toBe(5);

    const updated2 = await challengeService.submitFreePlayWin();
    expect(updated2.freePlayWins).toBe(2);
    expect(updated2.totalPoints).toBe(10);
  });

  it('handles challenge result submission (+50 pts for C1, +150 pts for C2)', async () => {
    challengeService.setUsername('ChallengeMaster');

    // Submit C1 win
    const res1 = await challengeService.submitChallengeResult('el_haj_defeat', { didIWin: true, myScore: 11, oppScore: 9 });
    expect(res1.completedNow).toBe(true);
    expect(res1.pointsEarned).toBe(50);

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
