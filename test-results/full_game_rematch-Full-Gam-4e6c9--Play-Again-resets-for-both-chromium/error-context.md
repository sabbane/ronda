# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: full_game_rematch.spec.js >> Full Game Rematch: Round ends correctly and Play Again resets for both
- Location: tests\full_game_rematch.spec.js:3:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('h2')
Expected: visible
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 15000ms
  - waiting for locator('h2')

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e6]:
    - button "Back to Menu" [ref=e8]:
      - img [ref=e9]
      - generic [ref=e11]: Back to Menu
    - insertion [ref=e14]:
      - iframe [ref=e16]:
        
    - generic [ref=e17]:
      - generic [ref=e18]:
        - generic [ref=e19]: Opponent
        - generic [ref=e22]:
          - generic [ref=e23]: "Cards:"
          - generic [ref=e24]: "0"
      - generic [ref=e25]:
        - img "Card Back" [ref=e29]
        - img "Card Back" [ref=e33]
    - generic [ref=e35]:
      - img "swords 2" [ref=e38] [cursor=pointer]
      - img "cups 1" [ref=e41] [cursor=pointer]
      - img "clubs 1" [ref=e44] [cursor=pointer]
      - img "coins 2" [ref=e47] [cursor=pointer]
    - generic [ref=e48]:
      - generic [ref=e49]:
        - generic [ref=e51]: You (Your Turn)
        - generic [ref=e57]:
          - generic [ref=e58]: "Cards:"
          - generic [ref=e59]: "0"
      - generic [ref=e60]:
        - img "swords 1" [ref=e63] [cursor=pointer]
        - img "cups 2" [ref=e66] [cursor=pointer]
    - generic [ref=e67]:
      - generic [ref=e69]: ✨
      - generic [ref=e70]: "Cards remaining: 0"
  - region "boardgame.io Debug Panel" [ref=e71]:
    - generic [ref=e72]:
      - button "Hide Debug Panel" [ref=e73] [cursor=pointer]:
        - img [ref=e75]
      - navigation [ref=e77]:
        - button "Main" [ref=e78]
        - button "Log" [ref=e79] [cursor=pointer]
        - button "Info" [ref=e80] [cursor=pointer]
        - button "AI" [ref=e81] [cursor=pointer]
      - region "main" [ref=e82]:
        - generic [ref=e83]:
          - heading "Controls" [level=3] [ref=e84]
          - list [ref=e85]:
            - listitem [ref=e86]:
              - generic [ref=e87]:
                - 'button "reset (shortcut: 1)" [ref=e88] [cursor=pointer]': "1"
                - generic [ref=e89]:
                  - text: reset
                  - generic [ref=e90]: "(shortcut: 1)"
            - listitem [ref=e91]:
              - generic [ref=e92]:
                - 'button "save (shortcut: 2)" [ref=e93] [cursor=pointer]': "2"
                - generic [ref=e94]:
                  - text: save
                  - generic [ref=e95]: "(shortcut: 2)"
            - listitem [ref=e96]:
              - generic [ref=e97]:
                - 'button "restore (shortcut: 3)" [ref=e98] [cursor=pointer]': "3"
                - generic [ref=e99]:
                  - text: restore
                  - generic [ref=e100]: "(shortcut: 3)"
            - listitem [ref=e101]:
              - generic [ref=e102]:
                - 'button "hide (shortcut: .)" [ref=e103] [cursor=pointer]': .
                - generic [ref=e104]:
                  - text: hide
                  - generic [ref=e105]: "(shortcut: .)"
        - generic [ref=e106]:
          - heading "Players" [level=3] [ref=e107]
          - generic [ref=e108]:
            - button "Player 0 (current, active)" [ref=e109] [cursor=pointer]: "0"
            - button "Player 1" [ref=e110] [cursor=pointer]: "1"
        - generic [ref=e111]:
          - heading "Moves" [level=3] [ref=e112]
          - list [ref=e113]:
            - listitem [ref=e114]:
              - generic [ref=e116]:
                - button "b" [ref=e118] [cursor=pointer]
                - generic [ref=e119] [cursor=pointer]:
                  - generic [ref=e120]: restartGame
                  - generic [ref=e121]: (
                  - generic [ref=e122]: )
            - listitem [ref=e123]:
              - generic [ref=e125]:
                - button "c" [ref=e127] [cursor=pointer]
                - generic [ref=e128] [cursor=pointer]:
                  - generic [ref=e129]: playCard
                  - generic [ref=e130]: (
                  - generic [ref=e131]: )
            - listitem [ref=e132]:
              - generic [ref=e134]:
                - button "d" [ref=e136] [cursor=pointer]
                - generic [ref=e137] [cursor=pointer]:
                  - generic [ref=e138]: processCapture
                  - generic [ref=e139]: (
                  - generic [ref=e140]: )
            - listitem [ref=e141]:
              - generic [ref=e143]:
                - button "e" [ref=e145] [cursor=pointer]
                - generic [ref=e146] [cursor=pointer]:
                  - generic [ref=e147]: clearAnnouncements
                  - generic [ref=e148]: (
                  - generic [ref=e149]: )
            - listitem [ref=e150]:
              - generic [ref=e152]:
                - button "f" [ref=e154] [cursor=pointer]
                - generic [ref=e155] [cursor=pointer]:
                  - generic [ref=e156]: endAnimation
                  - generic [ref=e157]: (
                  - generic [ref=e158]: )
        - generic [ref=e159]:
          - heading "Events" [level=3] [ref=e160]
          - list [ref=e161]:
            - listitem [ref=e162]:
              - generic [ref=e164]:
                - button "8" [ref=e166] [cursor=pointer]
                - generic [ref=e167] [cursor=pointer]:
                  - generic [ref=e168]: endTurn
                  - generic [ref=e169]: (
                  - generic [ref=e170]: )
        - generic [ref=e171]:
          - heading "G" [level=3] [ref=e172]
          - list [ref=e173]:
            - listitem [ref=e174]:
              - generic [ref=e175]:
                - generic [ref=e176] [cursor=pointer]:
                  - generic: ▶
                - generic [ref=e177]: "Object {"
              - list [ref=e178]:
                - listitem [ref=e179]:
                  - generic [ref=e180]:
                    - generic [ref=e181] [cursor=pointer]:
                      - generic: ▶
                    - generic [ref=e183]: "deck:"
                    - generic [ref=e184]: Array(0)[
                  - list [ref=e185]:
                    - listitem [ref=e186]:
                      - generic [ref=e188]: "length:"
                      - text: "0"
                  - text: "]"
                - listitem [ref=e189]:
                  - generic [ref=e190]:
                    - generic [ref=e191] [cursor=pointer]:
                      - generic: ▶
                    - generic [ref=e193]: "table:"
                    - generic [ref=e194]: Array(4)[
                  - list [ref=e195]:
                    - listitem [ref=e196]:
                      - generic [ref=e197]:
                        - generic [ref=e198] [cursor=pointer]:
                          - generic: ▶
                        - generic [ref=e200]: "0:"
                        - generic [ref=e201]: "Object {"
                      - list [ref=e202]:
                        - listitem [ref=e203]:
                          - generic [ref=e205]: "suit:"
                          - text: "\"swords\""
                        - listitem [ref=e206]:
                          - generic [ref=e208]: "value:"
                          - text: "2"
                        - listitem [ref=e209]:
                          - generic [ref=e211]: "displayValue:"
                          - text: "2"
                        - listitem [ref=e212]:
                          - generic [ref=e214]: "id:"
                          - text: "\"swords-2\""
                      - text: "}"
                    - listitem [ref=e215]:
                      - generic [ref=e216]:
                        - generic [ref=e217] [cursor=pointer]:
                          - generic: ▶
                        - generic [ref=e219]: "1:"
                        - generic [ref=e220]: "Object {"
                      - list [ref=e221]:
                        - listitem [ref=e222]:
                          - generic [ref=e224]: "suit:"
                          - text: "\"cups\""
                        - listitem [ref=e225]:
                          - generic [ref=e227]: "value:"
                          - text: "1"
                        - listitem [ref=e228]:
                          - generic [ref=e230]: "displayValue:"
                          - text: "1"
                        - listitem [ref=e231]:
                          - generic [ref=e233]: "id:"
                          - text: "\"cups-1\""
                      - text: "}"
                    - listitem [ref=e234]:
                      - generic [ref=e235]:
                        - generic [ref=e236] [cursor=pointer]:
                          - generic: ▶
                        - generic [ref=e238]: "2:"
                        - generic [ref=e239]: "Object {"
                      - list [ref=e240]:
                        - listitem [ref=e241]:
                          - generic [ref=e243]: "suit:"
                          - text: "\"clubs\""
                        - listitem [ref=e244]:
                          - generic [ref=e246]: "value:"
                          - text: "1"
                        - listitem [ref=e247]:
                          - generic [ref=e249]: "displayValue:"
                          - text: "1"
                        - listitem [ref=e250]:
                          - generic [ref=e252]: "id:"
                          - text: "\"clubs-1\""
                      - text: "}"
                    - listitem [ref=e253]:
                      - generic [ref=e254]:
                        - generic [ref=e255] [cursor=pointer]:
                          - generic: ▶
                        - generic [ref=e257]: "3:"
                        - generic [ref=e258]: "Object {"
                      - list [ref=e259]:
                        - listitem [ref=e260]:
                          - generic [ref=e262]: "suit:"
                          - text: "\"coins\""
                        - listitem [ref=e263]:
                          - generic [ref=e265]: "value:"
                          - text: "2"
                        - listitem [ref=e266]:
                          - generic [ref=e268]: "displayValue:"
                          - text: "2"
                        - listitem [ref=e269]:
                          - generic [ref=e271]: "id:"
                          - text: "\"coins-2\""
                      - text: "}"
                    - listitem [ref=e272]:
                      - generic [ref=e274]: "length:"
                      - text: "4"
                  - text: "]"
                - listitem [ref=e275]:
                  - generic [ref=e276]:
                    - generic [ref=e277] [cursor=pointer]:
                      - generic: ▶
                    - generic [ref=e279]: "players:"
                    - generic [ref=e280]: "Object {"
                  - list [ref=e281]:
                    - listitem [ref=e282]:
                      - generic [ref=e283]:
                        - generic [ref=e284] [cursor=pointer]:
                          - generic: ▶
                        - generic [ref=e286]: "0:"
                        - generic [ref=e287]: "Object {"
                      - list [ref=e288]:
                        - listitem [ref=e289]:
                          - generic [ref=e290]:
                            - generic [ref=e291] [cursor=pointer]:
                              - generic: ▶
                            - generic [ref=e293]: "hand:"
                            - generic [ref=e294]: Array(2)[
                          - list [ref=e295]:
                            - listitem [ref=e296]:
                              - generic [ref=e297]:
                                - generic [ref=e298] [cursor=pointer]:
                                  - generic: ▶
                                - generic [ref=e300]: "0:"
                                - generic [ref=e301]: "Object {"
                              - list [ref=e302]:
                                - listitem [ref=e303]:
                                  - generic [ref=e305]: "suit:"
                                  - text: "\"swords\""
                                - listitem [ref=e306]:
                                  - generic [ref=e308]: "value:"
                                  - text: "1"
                                - listitem [ref=e309]:
                                  - generic [ref=e311]: "displayValue:"
                                  - text: "1"
                                - listitem [ref=e312]:
                                  - generic [ref=e314]: "id:"
                                  - text: "\"swords-1\""
                              - text: "}"
                            - listitem [ref=e315]:
                              - generic [ref=e316]:
                                - generic [ref=e317] [cursor=pointer]:
                                  - generic: ▶
                                - generic [ref=e319]: "1:"
                                - generic [ref=e320]: "Object {"
                              - list [ref=e321]:
                                - listitem [ref=e322]:
                                  - generic [ref=e324]: "suit:"
                                  - text: "\"cups\""
                                - listitem [ref=e325]:
                                  - generic [ref=e327]: "value:"
                                  - text: "2"
                                - listitem [ref=e328]:
                                  - generic [ref=e330]: "displayValue:"
                                  - text: "2"
                                - listitem [ref=e331]:
                                  - generic [ref=e333]: "id:"
                                  - text: "\"cups-2\""
                              - text: "}"
                            - listitem [ref=e334]:
                              - generic [ref=e336]: "length:"
                              - text: "2"
                          - text: "]"
                        - listitem [ref=e337]:
                          - generic [ref=e338]:
                            - generic [ref=e339] [cursor=pointer]:
                              - generic: ▶
                            - generic [ref=e341]: "captured:"
                            - generic [ref=e342]: Array(0)[
                          - list [ref=e343]:
                            - listitem [ref=e344]:
                              - generic [ref=e346]: "length:"
                              - text: "0"
                          - text: "]"
                        - listitem [ref=e347]:
                          - generic [ref=e349]: "score:"
                          - text: "0"
                      - text: "}"
                    - listitem [ref=e350]:
                      - generic [ref=e351]:
                        - generic [ref=e352] [cursor=pointer]:
                          - generic: ▶
                        - generic [ref=e354]: "1:"
                        - generic [ref=e355]: "Object {"
                      - list [ref=e356]:
                        - listitem [ref=e357]:
                          - generic [ref=e358]:
                            - generic [ref=e359] [cursor=pointer]:
                              - generic: ▶
                            - generic [ref=e361]: "hand:"
                            - generic [ref=e362]: Array(2)[
                          - list [ref=e363]:
                            - listitem [ref=e364]:
                              - generic [ref=e365]:
                                - generic [ref=e366] [cursor=pointer]:
                                  - generic: ▶
                                - generic [ref=e368]: "0:"
                                - generic [ref=e369]: "Object {"
                              - list [ref=e370]:
                                - listitem [ref=e371]:
                                  - generic [ref=e373]: "suit:"
                                  - text: "\"coins\""
                                - listitem [ref=e374]:
                                  - generic [ref=e376]: "value:"
                                  - text: "1"
                                - listitem [ref=e377]:
                                  - generic [ref=e379]: "displayValue:"
                                  - text: "1"
                                - listitem [ref=e380]:
                                  - generic [ref=e382]: "id:"
                                  - text: "\"coins-1\""
                              - text: "}"
                            - listitem [ref=e383]:
                              - generic [ref=e384]:
                                - generic [ref=e385] [cursor=pointer]:
                                  - generic: ▶
                                - generic [ref=e387]: "1:"
                                - generic [ref=e388]: "Object {"
                              - list [ref=e389]:
                                - listitem [ref=e390]:
                                  - generic [ref=e392]: "suit:"
                                  - text: "\"clubs\""
                                - listitem [ref=e393]:
                                  - generic [ref=e395]: "value:"
                                  - text: "2"
                                - listitem [ref=e396]:
                                  - generic [ref=e398]: "displayValue:"
                                  - text: "2"
                                - listitem [ref=e399]:
                                  - generic [ref=e401]: "id:"
                                  - text: "\"clubs-2\""
                              - text: "}"
                            - listitem [ref=e402]:
                              - generic [ref=e404]: "length:"
                              - text: "2"
                          - text: "]"
                        - listitem [ref=e405]:
                          - generic [ref=e406]:
                            - generic [ref=e407] [cursor=pointer]:
                              - generic: ▶
                            - generic [ref=e409]: "captured:"
                            - generic [ref=e410]: Array(0)[
                          - list [ref=e411]:
                            - listitem [ref=e412]:
                              - generic [ref=e414]: "length:"
                              - text: "0"
                          - text: "]"
                        - listitem [ref=e415]:
                          - generic [ref=e417]: "score:"
                          - text: "0"
                      - text: "}"
                  - text: "}"
                - listitem [ref=e418]:
                  - generic [ref=e420]: "lastCapture:"
                  - text: "null"
                - listitem [ref=e421]:
                  - generic [ref=e423]: "lastPlayedCard:"
                  - text: "null"
                - listitem [ref=e424]:
                  - generic [ref=e425]:
                    - generic [ref=e426] [cursor=pointer]:
                      - generic: ▶
                    - generic [ref=e428]: "announcements:"
                    - generic [ref=e429]: Array(0)[
                  - list [ref=e430]:
                    - listitem [ref=e431]:
                      - generic [ref=e433]: "length:"
                      - text: "0"
                  - text: "]"
                - listitem [ref=e434]:
                  - generic [ref=e436]: "pendingCapture:"
                  - text: "null"
                - listitem [ref=e437]:
                  - generic [ref=e439]: "isAnimating:"
                  - text: "false"
                - listitem [ref=e440]:
                  - generic [ref=e442]: "gameStarted:"
                  - text: "true"
                - listitem [ref=e443]:
                  - generic [ref=e445]: "needsRestart:"
                  - text: "false"
                - listitem [ref=e446]:
                  - generic [ref=e448]: "endTurnAfterUI:"
                  - text: "false"
              - text: "}"
        - generic [ref=e449]:
          - heading "ctx" [level=3] [ref=e450]
          - list [ref=e451]:
            - listitem [ref=e452]:
              - generic [ref=e453]:
                - generic [ref=e454] [cursor=pointer]:
                  - generic: ▶
                - generic [ref=e455]: "Object {"
              - list [ref=e456]:
                - listitem [ref=e457]:
                  - generic [ref=e459]: "numPlayers:"
                  - text: "2"
                - listitem [ref=e460]:
                  - generic [ref=e462]: "turn:"
                  - text: "1"
                - listitem [ref=e463]:
                  - generic [ref=e465]: "currentPlayer:"
                  - text: "\"0\""
                - listitem [ref=e466]:
                  - generic [ref=e467]:
                    - generic [ref=e468] [cursor=pointer]:
                      - generic: ▶
                    - generic [ref=e470]: "playOrder:"
                    - generic [ref=e471]: Array(2)[
                  - list [ref=e472]:
                    - listitem [ref=e473]:
                      - generic [ref=e475]: "0:"
                      - text: "\"0\""
                    - listitem [ref=e476]:
                      - generic [ref=e478]: "1:"
                      - text: "\"1\""
                    - listitem [ref=e479]:
                      - generic [ref=e481]: "length:"
                      - text: "2"
                  - text: "]"
                - listitem [ref=e482]:
                  - generic [ref=e484]: "playOrderPos:"
                  - text: "0"
                - listitem [ref=e485]:
                  - generic [ref=e487]: "phase:"
                  - text: "null"
                - listitem [ref=e488]:
                  - generic [ref=e490]: "activePlayers:"
                  - text: "null"
                - listitem [ref=e491]:
                  - generic [ref=e493]: "numMoves:"
                  - text: "0"
              - text: "}"
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test('Full Game Rematch: Round ends correctly and Play Again resets for both', async ({ browser }) => {
  4  |   const roomID = `fullgame-${Math.floor(Math.random() * 1000)}`;
  5  |   
  6  |   const contextA = await browser.newContext();
  7  |   const pageA = await contextA.newPage();
  8  |   await pageA.goto('http://localhost:5173');
  9  |   await pageA.fill('input[type="text"]', roomID);
  10 |   await pageA.click('button:has-text("Host")');
  11 | 
  12 |   const contextB = await browser.newContext();
  13 |   const pageB = await contextB.newPage();
  14 |   await pageB.goto('http://localhost:5173');
  15 |   await pageB.fill('input[type="text"]', roomID);
  16 |   await pageB.click('button:has-text("Join")');
  17 | 
  18 |   // Wait for initial deal
  19 |   await pageA.waitForTimeout(3000);
  20 | 
  21 |   // Play until both hands are empty (2 cards each)
  22 |   for (let i = 0; i < 2; i++) {
  23 |     // Player A (Turn 0)
  24 |     const cardA = pageA.locator('img[alt*="coins"], img[alt*="cups"]').first();
  25 |     await cardA.click();
  26 |     await pageA.waitForTimeout(2000); // Wait for turn transition
  27 | 
  28 |     // Player B (Turn 1)
  29 |     const cardB = pageB.locator('img[alt*="coins"], img[alt*="cups"]').first();
  30 |     await cardB.click();
  31 |     await pageB.waitForTimeout(2000);
  32 |   }
  33 | 
  34 |   // Check overlay (should appear now as deck and hands are empty)
> 35 |   await expect(pageA.locator('h2')).toBeVisible({ timeout: 15000 });
     |                                     ^ Error: expect(locator).toBeVisible() failed
  36 |   await expect(pageB.locator('h2')).toBeVisible({ timeout: 15000 });
  37 | 
  38 |   console.log('Round Over overlay visible for both players.');
  39 | 
  40 |   // Click Play Again on Host
  41 |   await pageA.click('button:has-text("Play Again")');
  42 | 
  43 |   // Verify it disappears for BOTH
  44 |   await expect(pageA.locator('h2')).not.toBeVisible({ timeout: 10000 });
  45 |   await expect(pageB.locator('h2')).not.toBeVisible({ timeout: 10000 });
  46 | 
  47 |   // Verify new cards are dealt (deck should be fresh)
  48 |   await expect(pageA.locator('img').nth(2)).toBeVisible();
  49 |   
  50 |   console.log('Rematch successful: Game restarted for both.');
  51 | });
  52 | 
```