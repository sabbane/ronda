import { test, expect } from '@playwright/test';

test.describe('Multiplayer Lobby: Bot Team Name Trigger', () => {
  test('first bot joining Team B should automatically set a Team B name', async ({ page }) => {
    // 1. Navigate to homepage
    await page.goto('/?botFallback=true');

    // 2. Select English
    const enButton = page.locator('button', { hasText: /^EN$/i });
    if (await enButton.isVisible().catch(() => false)) await enButton.click();

    // 3. Create Room
    await page.locator('button', { hasText: /Create Room/i }).first().click();
    await page.locator('input[placeholder*="name" i]').first().fill('HostPlayer');

    // 4. Select 4 Players
    const fourPlayersBtn = page.locator('button', { hasText: /4 Players/i }).first();
    await expect(fourPlayersBtn).toBeVisible({ timeout: 5000 });
    await fourPlayersBtn.click();

    // 5. Create
    await page.locator('button', { hasText: /^Public$/i }).first().click();
    await page.locator('button', { hasText: /^Create$/i }).first().click();

    // 6. Wait for Game Lobby
    await expect(page.locator('h1', { hasText: /Game Lobby/i })).toBeVisible({ timeout: 15000 });

    // 7. Wait for the first bot (Slot 1 / Team B) to join
    const slot1Seat = page.locator('div', { has: page.locator('div', { hasText: /Opponent 1/i }) }).first();
    const slot1NameSpan = slot1Seat.locator('span.text-slate-200').first();
    // Bot should join within 10 seconds in test mode
    await expect(slot1NameSpan).toBeVisible({ timeout: 10000 });
    const botName = await slot1NameSpan.innerText();
    console.log(`[Test Log] Bot "${botName}" joined Team B slot 1.`);

    // 8. Assert Team B name input updates to a valid Team B name
    const teamBInput = page.locator('input[placeholder*="Team B" i]').first();
    await expect(teamBInput).toBeVisible();

    // The team name should be set within 4 seconds of the bot joining
    const validNames = [
      "AtlasLions", "Raja", "RCA", "TheStars", "Morocco", "ProPlayers", "Warriors", "Titans", "RondaKings",
      "WAC", "Wydad", "TheSquad", "MaghrebGamers", "NoobSlayers", "Shadows", "TheLegends", "Strangers", "DimaDima",
      "DimaWAC", "DimaRCA", "DimaRaja", "FAR", "FUS", "KACM", "MAT", "MCO", "HUSA", "IRTIZNIT", "USM", "LesCoquins",
      "LesChevaliers", "Vampires", "Tigres", "LEquipe", "LesAigles", "Lions"
    ];
    
    // We expect the value of Team B name input to match one of the valid names
    console.log('[Test Log] Awaiting Team B name input value...');
    await expect(async () => {
      const valB = await teamBInput.inputValue();
      console.log(`[Test Log] Current Team B input value: "${valB}"`);
      expect(validNames).toContain(valB);
    }).toPass({ timeout: 8000 });

    // Assert Team A input remains empty
    const teamAInput = page.locator('input[placeholder*="Team A" i]').first();
    const valA = await teamAInput.inputValue();
    expect(valA).toBe('');

    console.log('✅ Success: Team B name set successfully and Team A remained empty.');
  });
});
