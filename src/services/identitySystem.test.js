import { describe, it, expect, beforeEach } from 'vitest';
import { validateDisplayName, sanitizeDisplayName } from '../utils/nameSanitizer';
import { dbService } from '../../db.js';
import { challengeService } from './challengeService';

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

describe('Name Sanitization and Validation', () => {
  it('strips invisible and zero-width characters', () => {
    const dirty = 'Atlas\u200B\u200C\uFEFF';
    expect(sanitizeDisplayName(dirty)).toBe('Atlas');
  });

  it('validates string lengths between 3 and 20 characters', () => {
    expect(validateDisplayName('AB').valid).toBe(false);
    expect(validateDisplayName('AB').error).toBe('NAME_LENGTH_INVALID');

    expect(validateDisplayName('Atlas').valid).toBe(true);
    expect(validateDisplayName('Atlas_King_Of_Medina_2026').valid).toBe(false);
  });

  it('rejects disallowed profanity terms', () => {
    expect(validateDisplayName('Admin').valid).toBe(false);
    expect(validateDisplayName('Admin').error).toBe('NAME_PROFANITY_DETECTED');
    expect(validateDisplayName('BadFuckUser').valid).toBe(false);
    expect(validateDisplayName('CleanPlayer').valid).toBe(true);
  });
});

describe('Modern Identity & Discriminator System', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
  });

  it('creates guest users with Gast_XXXX prefix and is_guest: true', async () => {
    const guest = await dbService.createGuestUser('usr_test_guest_1');
    expect(guest.displayName).toMatch(/^Gast_\d{4}$/);
    expect(guest.isGuest).toBe(true);
    expect(guest.discriminator).toBeNull();
  });

  it('assigns 4-digit discriminators (1000-9999) to registered users', async () => {
    const res = await dbService.updateDisplayName('usr_player_1', 'Meister');
    expect(res.ok).toBe(true);
    expect(res.player.displayName).toBe('Meister');
    expect(res.player.isGuest).toBe(false);
    expect(res.player.discriminator).toBeGreaterThanOrEqual(1000);
    expect(res.player.discriminator).toBeLessThanOrEqual(9999);
  });

  it('allows two players to have the same display_name with distinct IDs and discriminators', async () => {
    const resA = await dbService.updateDisplayName('usr_player_a', 'Atlas');
    const resB = await dbService.updateDisplayName('usr_player_b', 'Atlas');

    expect(resA.ok).toBe(true);
    expect(resB.ok).toBe(true);
    expect(resA.player.displayName).toBe('Atlas');
    expect(resB.player.displayName).toBe('Atlas');
    expect(resA.player.id).toBe('usr_player_a');
    expect(resB.player.id).toBe('usr_player_b');
  });

  it('tracks leaderboard scores independently per player_id even with identical display names', async () => {
    const idA = `usr_player_a_${Date.now()}`;
    const idB = `usr_player_b_${Date.now()}`;

    await dbService.submitLeaderboardScore(idA, 'Atlas', 1234, 50);
    await dbService.submitLeaderboardScore(idB, 'Atlas', 5678, 100);

    const lb = await dbService.getLeaderboard('monthly');
    const entryA = lb.entries.find(e => e.playerId === idA);
    const entryB = lb.entries.find(e => e.playerId === idB);

    expect(entryA).toBeDefined();
    expect(entryB).toBeDefined();
    expect(entryA.displayName).toBe('Atlas');
    expect(entryB.displayName).toBe('Atlas');
    expect(entryA.discriminator).toBe(1234);
    expect(entryB.discriminator).toBe(5678);
    expect(entryA.points).toBe(50);
    expect(entryB.points).toBe(100);
  });
});
