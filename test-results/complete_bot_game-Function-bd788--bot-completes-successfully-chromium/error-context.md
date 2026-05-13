# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: complete_bot_game.spec.js >> Functional Test: Complete Game vs AI >> A full game against the bot completes successfully
- Location: tests\complete_bot_game.spec.js:9:3

# Error details

```
Error: expect(received).toBeGreaterThan(expected)

Expected: > 15
Received:   14
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e6]:
    - button "Back to Menu" [ref=e8]:
      - img [ref=e9]
      - generic [ref=e11]: Back to Menu
    - generic:
      - generic:
        - generic: ⚔️
        - heading "Clash Won!" [level=3]
        - paragraph: Clash won with Ronda! (+2) - You
    - generic [ref=e13]:
      - heading "Game Over!" [level=2] [ref=e14]
      - generic [ref=e15]: Opponent won!
      - generic [ref=e16]: "Total Wins: 0 - 1"
      - generic [ref=e17]:
        - generic [ref=e18]:
          - generic [ref=e19]: You
          - generic [ref=e20]: "22"
        - generic [ref=e22]:
          - generic [ref=e23]: Opponent
          - generic [ref=e24]: "25"
      - generic [ref=e25]:
        - button "Play Again" [ref=e26]
        - button "Main Menu" [ref=e27]
      - generic [ref=e29]:
        - paragraph [ref=e30]: Enjoying the game? Buy the dev team a cup of Mint Tea!
        - link "Buy us a Mint Tea" [ref=e31] [cursor=pointer]:
          - /url: https://buy.stripe.com/aFaeVcaaC9KM9CU4NQ73G00
          - img [ref=e32]
          - generic [ref=e34]: Buy us a Mint Tea
          - img [ref=e35]
    - generic [ref=e38]:
      - generic [ref=e39]: Opponent
      - generic [ref=e64]:
        - generic [ref=e65]: "Cards:"
        - generic [ref=e66]: "25"
    - generic [ref=e70]: Table is empty
    - generic [ref=e72]:
      - generic [ref=e74]: You
      - generic [ref=e95]:
        - generic [ref=e96]: "Cards:"
        - generic [ref=e97]: "22"
    - generic [ref=e99]:
      - generic [ref=e101]: ✨
      - generic [ref=e102]: "Cards remaining: 0"
  - region "boardgame.io Debug Panel" [ref=e103]:
    - generic [ref=e104]:
      - button "Hide Debug Panel" [ref=e105] [cursor=pointer]:
        - img [ref=e107]
      - navigation [ref=e109]:
        - button "Main" [ref=e110]
        - button "Log" [ref=e111] [cursor=pointer]
        - button "Info" [ref=e112] [cursor=pointer]
        - button "AI" [ref=e113] [cursor=pointer]
      - region "main" [ref=e114]:
        - generic [ref=e115]:
          - heading "Controls" [level=3] [ref=e116]
          - list [ref=e117]:
            - listitem [ref=e118]:
              - generic [ref=e119]:
                - 'button "reset (shortcut: 1)" [ref=e120] [cursor=pointer]': "1"
                - generic [ref=e121]:
                  - text: reset
                  - generic [ref=e122]: "(shortcut: 1)"
            - listitem [ref=e123]:
              - generic [ref=e124]:
                - 'button "save (shortcut: 2)" [ref=e125] [cursor=pointer]': "2"
                - generic [ref=e126]:
                  - text: save
                  - generic [ref=e127]: "(shortcut: 2)"
            - listitem [ref=e128]:
              - generic [ref=e129]:
                - 'button "restore (shortcut: 3)" [ref=e130] [cursor=pointer]': "3"
                - generic [ref=e131]:
                  - text: restore
                  - generic [ref=e132]: "(shortcut: 3)"
            - listitem [ref=e133]:
              - generic [ref=e134]:
                - 'button "hide (shortcut: .)" [ref=e135] [cursor=pointer]': .
                - generic [ref=e136]:
                  - text: hide
                  - generic [ref=e137]: "(shortcut: .)"
        - generic [ref=e138]:
          - heading "Players" [level=3] [ref=e139]
          - generic [ref=e140]:
            - button "Player 0 (active)" [ref=e141] [cursor=pointer]: "0"
            - button "Player 1 (current)" [ref=e142] [cursor=pointer]: "1"
        - generic [ref=e143]:
          - heading "Moves" [level=3] [ref=e144]
          - list [ref=e145]:
            - listitem [ref=e146]:
              - generic [ref=e148]:
                - button "b" [ref=e150] [cursor=pointer]
                - generic [ref=e151] [cursor=pointer]:
                  - generic [ref=e152]: playCard
                  - generic [ref=e153]: (
                  - generic [ref=e154]: )
            - listitem [ref=e155]:
              - generic [ref=e157]:
                - button "c" [ref=e159] [cursor=pointer]
                - generic [ref=e160] [cursor=pointer]:
                  - generic [ref=e161]: processCapture
                  - generic [ref=e162]: (
                  - generic [ref=e163]: )
            - listitem [ref=e164]:
              - generic [ref=e166]:
                - button "d" [ref=e168] [cursor=pointer]
                - generic [ref=e169] [cursor=pointer]:
                  - generic [ref=e170]: clearAnnouncements
                  - generic [ref=e171]: (
                  - generic [ref=e172]: )
            - listitem [ref=e173]:
              - generic [ref=e175]:
                - button "e" [ref=e177] [cursor=pointer]
                - generic [ref=e178] [cursor=pointer]:
                  - generic [ref=e179]: endAnimation
                  - generic [ref=e180]: (
                  - generic [ref=e181]: )
            - listitem [ref=e182]:
              - generic [ref=e184]:
                - button "f" [ref=e186] [cursor=pointer]
                - generic [ref=e187] [cursor=pointer]:
                  - generic [ref=e188]: restartGame
                  - generic [ref=e189]: (
                  - generic [ref=e190]: )
        - generic [ref=e191]:
          - heading "Events" [level=3] [ref=e192]
          - list [ref=e193]:
            - listitem [ref=e194]:
              - generic [ref=e196]:
                - button "7" [ref=e198] [cursor=pointer]
                - generic [ref=e199] [cursor=pointer]:
                  - generic [ref=e200]: endStage
                  - generic [ref=e201]: (
                  - generic [ref=e202]: )
            - listitem [ref=e203]:
              - generic [ref=e205]:
                - button "8" [ref=e207] [cursor=pointer]
                - generic [ref=e208] [cursor=pointer]:
                  - generic [ref=e209]: endTurn
                  - generic [ref=e210]: (
                  - generic [ref=e211]: )
        - generic [ref=e212]:
          - heading "G" [level=3] [ref=e213]
          - list [ref=e214]:
            - listitem [ref=e215]:
              - generic [ref=e216]:
                - generic [ref=e217] [cursor=pointer]:
                  - generic: ▶
                - generic [ref=e218]: "Object {"
              - list [ref=e219]:
                - listitem [ref=e220]:
                  - generic [ref=e221]:
                    - generic [ref=e222] [cursor=pointer]:
                      - generic: ▶
                    - generic [ref=e224]: "deck:"
                    - generic [ref=e225]: Array(0)[
                  - list
                  - text: "]"
                - listitem [ref=e226]:
                  - generic [ref=e227]:
                    - generic [ref=e228] [cursor=pointer]:
                      - generic: ▶
                    - generic [ref=e230]: "table:"
                    - generic [ref=e231]: Array(0)[
                  - list [ref=e232]:
                    - listitem [ref=e233]:
                      - generic [ref=e235]: "length:"
                      - text: "0"
                  - text: "]"
                - listitem [ref=e236]:
                  - generic [ref=e237]:
                    - generic [ref=e238] [cursor=pointer]:
                      - generic: ▶
                    - generic [ref=e240]: "players:"
                    - generic [ref=e241]: "Object {"
                  - list [ref=e242]:
                    - listitem [ref=e243]:
                      - generic [ref=e244]:
                        - generic [ref=e245] [cursor=pointer]:
                          - generic: ▶
                        - generic [ref=e247]: "0:"
                        - generic [ref=e248]: "Object {"
                      - list [ref=e249]:
                        - listitem [ref=e250]:
                          - generic [ref=e251]:
                            - generic [ref=e252] [cursor=pointer]:
                              - generic: ▶
                            - generic [ref=e254]: "hand:"
                            - generic [ref=e255]: Array(0)[
                          - list [ref=e256]:
                            - listitem [ref=e257]:
                              - generic [ref=e259]: "length:"
                              - text: "0"
                          - text: "]"
                        - listitem [ref=e260]:
                          - generic [ref=e261]:
                            - generic [ref=e262] [cursor=pointer]:
                              - generic: ▶
                            - generic [ref=e264]: "captured:"
                            - generic [ref=e265]: Array(18)[
                          - list [ref=e266]:
                            - listitem [ref=e267]:
                              - generic [ref=e268]:
                                - generic [ref=e269] [cursor=pointer]:
                                  - generic: ▶
                                - generic [ref=e271]: "0:"
                                - generic [ref=e272]: "Object {"
                              - list [ref=e273]:
                                - listitem [ref=e274]:
                                  - generic [ref=e276]: "suit:"
                                  - text: "\"syouf\""
                                - listitem [ref=e277]:
                                  - generic [ref=e279]: "value:"
                                  - text: "5"
                                - listitem [ref=e280]:
                                  - generic [ref=e282]: "displayValue:"
                                  - text: "5"
                                - listitem [ref=e283]:
                                  - generic [ref=e285]: "id:"
                                  - text: "\"syouf-5\""
                              - text: "}"
                            - listitem [ref=e286]:
                              - generic [ref=e287]:
                                - generic [ref=e288] [cursor=pointer]:
                                  - generic: ▶
                                - generic [ref=e290]: "1:"
                                - generic [ref=e291]: "Object {"
                              - list [ref=e292]:
                                - listitem [ref=e293]:
                                  - generic [ref=e295]: "suit:"
                                  - text: "\"zrawet\""
                                - listitem [ref=e296]:
                                  - generic [ref=e298]: "value:"
                                  - text: "5"
                                - listitem [ref=e299]:
                                  - generic [ref=e301]: "displayValue:"
                                  - text: "5"
                                - listitem [ref=e302]:
                                  - generic [ref=e304]: "id:"
                                  - text: "\"zrawet-5\""
                              - text: "}"
                            - listitem [ref=e305]:
                              - generic [ref=e306]:
                                - generic [ref=e307] [cursor=pointer]:
                                  - generic: ▶
                                - generic [ref=e309]: "2:"
                                - generic [ref=e310]: "Object {"
                              - list [ref=e311]:
                                - listitem [ref=e312]:
                                  - generic [ref=e314]: "suit:"
                                  - text: "\"syouf\""
                                - listitem [ref=e315]:
                                  - generic [ref=e317]: "value:"
                                  - text: "4"
                                - listitem [ref=e318]:
                                  - generic [ref=e320]: "displayValue:"
                                  - text: "4"
                                - listitem [ref=e321]:
                                  - generic [ref=e323]: "id:"
                                  - text: "\"syouf-4\""
                              - text: "}"
                            - listitem [ref=e324]:
                              - generic [ref=e325]:
                                - generic [ref=e326] [cursor=pointer]:
                                  - generic: ▶
                                - generic [ref=e328]: "3:"
                                - generic [ref=e329]: "Object {"
                              - list [ref=e330]:
                                - listitem [ref=e331]:
                                  - generic [ref=e333]: "suit:"
                                  - text: "\"dheb\""
                                - listitem [ref=e334]:
                                  - generic [ref=e336]: "value:"
                                  - text: "4"
                                - listitem [ref=e337]:
                                  - generic [ref=e339]: "displayValue:"
                                  - text: "4"
                                - listitem [ref=e340]:
                                  - generic [ref=e342]: "id:"
                                  - text: "\"dheb-4\""
                              - text: "}"
                            - listitem [ref=e343]:
                              - generic [ref=e344]:
                                - generic [ref=e345] [cursor=pointer]:
                                  - generic: ▶
                                - generic [ref=e347]: "4:"
                                - generic [ref=e348]: "Object {"
                              - list [ref=e349]:
                                - listitem [ref=e350]:
                                  - generic [ref=e352]: "suit:"
                                  - text: "\"syouf\""
                                - listitem [ref=e353]:
                                  - generic [ref=e355]: "value:"
                                  - text: "8"
                                - listitem [ref=e356]:
                                  - generic [ref=e358]: "displayValue:"
                                  - text: "10"
                                - listitem [ref=e359]:
                                  - generic [ref=e361]: "id:"
                                  - text: "\"syouf-8\""
                              - text: "}"
                            - listitem [ref=e362]:
                              - generic [ref=e363]:
                                - generic [ref=e364] [cursor=pointer]:
                                  - generic: ▶
                                - generic [ref=e366]: "5:"
                                - generic [ref=e367]: "Object {"
                              - list [ref=e368]:
                                - listitem [ref=e369]:
                                  - generic [ref=e371]: "suit:"
                                  - text: "\"jben\""
                                - listitem [ref=e372]:
                                  - generic [ref=e374]: "value:"
                                  - text: "8"
                                - listitem [ref=e375]:
                                  - generic [ref=e377]: "displayValue:"
                                  - text: "10"
                                - listitem [ref=e378]:
                                  - generic [ref=e380]: "id:"
                                  - text: "\"jben-8\""
                              - text: "}"
                            - listitem [ref=e381]:
                              - generic [ref=e382]:
                                - generic [ref=e383] [cursor=pointer]:
                                  - generic: ▶
                                - generic [ref=e385]: "6:"
                                - generic [ref=e386]: "Object {"
                              - list [ref=e387]:
                                - listitem [ref=e388]:
                                  - generic [ref=e390]: "suit:"
                                  - text: "\"syouf\""
                                - listitem [ref=e391]:
                                  - generic [ref=e393]: "value:"
                                  - text: "1"
                                - listitem [ref=e394]:
                                  - generic [ref=e396]: "displayValue:"
                                  - text: "1"
                                - listitem [ref=e397]:
                                  - generic [ref=e399]: "id:"
                                  - text: "\"syouf-1\""
                              - text: "}"
                            - listitem [ref=e400]:
                              - generic [ref=e401]:
                                - generic [ref=e402] [cursor=pointer]:
                                  - generic: ▶
                                - generic [ref=e404]: "7:"
                                - generic [ref=e405]: "Object {"
                              - list [ref=e406]:
                                - listitem [ref=e407]:
                                  - generic [ref=e409]: "suit:"
                                  - text: "\"zrawet\""
                                - listitem [ref=e410]:
                                  - generic [ref=e412]: "value:"
                                  - text: "1"
                                - listitem [ref=e413]:
                                  - generic [ref=e415]: "displayValue:"
                                  - text: "1"
                                - listitem [ref=e416]:
                                  - generic [ref=e418]: "id:"
                                  - text: "\"zrawet-1\""
                              - text: "}"
                            - listitem [ref=e419]:
                              - generic [ref=e420]:
                                - generic [ref=e421] [cursor=pointer]:
                                  - generic: ▶
                                - generic [ref=e423]: "8:"
                                - generic [ref=e424]: "Object {"
                              - list [ref=e425]:
                                - listitem [ref=e426]:
                                  - generic [ref=e428]: "suit:"
                                  - text: "\"jben\""
                                - listitem [ref=e429]:
                                  - generic [ref=e431]: "value:"
                                  - text: "3"
                                - listitem [ref=e432]:
                                  - generic [ref=e434]: "displayValue:"
                                  - text: "3"
                                - listitem [ref=e435]:
                                  - generic [ref=e437]: "id:"
                                  - text: "\"jben-3\""
                              - text: "}"
                            - listitem [ref=e438]:
                              - generic [ref=e439]:
                                - generic [ref=e440] [cursor=pointer]:
                                  - generic: ▶
                                - generic [ref=e442]: "9:"
                                - generic [ref=e443]: "Object {"
                              - list [ref=e444]:
                                - listitem [ref=e445]:
                                  - generic [ref=e447]: "suit:"
                                  - text: "\"zrawet\""
                                - listitem [ref=e448]:
                                  - generic [ref=e450]: "value:"
                                  - text: "3"
                                - listitem [ref=e451]:
                                  - generic [ref=e453]: "displayValue:"
                                  - text: "3"
                                - listitem [ref=e454]:
                                  - generic [ref=e456]: "id:"
                                  - text: "\"zrawet-3\""
                              - text: "}"
                            - listitem [ref=e457]:
                              - generic [ref=e458]:
                                - generic [ref=e459] [cursor=pointer]:
                                  - generic: ▶
                                - generic [ref=e461]: "10:"
                                - generic [ref=e462]: "Object {"
                              - list [ref=e463]:
                                - listitem [ref=e464]:
                                  - generic [ref=e466]: "suit:"
                                  - text: "\"dheb\""
                                - listitem [ref=e467]:
                                  - generic [ref=e469]: "value:"
                                  - text: "7"
                                - listitem [ref=e470]:
                                  - generic [ref=e472]: "displayValue:"
                                  - text: "7"
                                - listitem [ref=e473]:
                                  - generic [ref=e475]: "id:"
                                  - text: "\"dheb-7\""
                              - text: "}"
                            - listitem [ref=e476]:
                              - generic [ref=e477]:
                                - generic [ref=e478] [cursor=pointer]:
                                  - generic: ▶
                                - generic [ref=e480]: "11:"
                                - generic [ref=e481]: "Object {"
                              - list [ref=e482]:
                                - listitem [ref=e483]:
                                  - generic [ref=e485]: "suit:"
                                  - text: "\"jben\""
                                - listitem [ref=e486]:
                                  - generic [ref=e488]: "value:"
                                  - text: "7"
                                - listitem [ref=e489]:
                                  - generic [ref=e491]: "displayValue:"
                                  - text: "7"
                                - listitem [ref=e492]:
                                  - generic [ref=e494]: "id:"
                                  - text: "\"jben-7\""
                              - text: "}"
                            - listitem [ref=e495]:
                              - generic [ref=e496]:
                                - generic [ref=e497] [cursor=pointer]:
                                  - generic: ▶
                                - generic [ref=e499]: "12:"
                                - generic [ref=e500]: "Object {"
                              - list [ref=e501]:
                                - listitem [ref=e502]:
                                  - generic [ref=e504]: "suit:"
                                  - text: "\"dheb\""
                                - listitem [ref=e505]:
                                  - generic [ref=e507]: "value:"
                                  - text: "10"
                                - listitem [ref=e508]:
                                  - generic [ref=e510]: "displayValue:"
                                  - text: "12"
                                - listitem [ref=e511]:
                                  - generic [ref=e513]: "id:"
                                  - text: "\"dheb-10\""
                              - text: "}"
                            - listitem [ref=e514]:
                              - generic [ref=e515]:
                                - generic [ref=e516] [cursor=pointer]:
                                  - generic: ▶
                                - generic [ref=e518]: "13:"
                                - generic [ref=e519]: "Object {"
                              - list [ref=e520]:
                                - listitem [ref=e521]:
                                  - generic [ref=e523]: "suit:"
                                  - text: "\"zrawet\""
                                - listitem [ref=e524]:
                                  - generic [ref=e526]: "value:"
                                  - text: "10"
                                - listitem [ref=e527]:
                                  - generic [ref=e529]: "displayValue:"
                                  - text: "12"
                                - listitem [ref=e530]:
                                  - generic [ref=e532]: "id:"
                                  - text: "\"zrawet-10\""
                              - text: "}"
                            - listitem [ref=e533]:
                              - generic [ref=e534]:
                                - generic [ref=e535] [cursor=pointer]:
                                  - generic: ▶
                                - generic [ref=e537]: "14:"
                                - generic [ref=e538]: "Object {"
                              - list [ref=e539]:
                                - listitem [ref=e540]:
                                  - generic [ref=e542]: "suit:"
                                  - text: "\"syouf\""
                                - listitem [ref=e543]:
                                  - generic [ref=e545]: "value:"
                                  - text: "7"
                                - listitem [ref=e546]:
                                  - generic [ref=e548]: "displayValue:"
                                  - text: "7"
                                - listitem [ref=e549]:
                                  - generic [ref=e551]: "id:"
                                  - text: "\"syouf-7\""
                              - text: "}"
                            - listitem [ref=e552]:
                              - generic [ref=e553]:
                                - generic [ref=e554] [cursor=pointer]:
                                  - generic: ▶
                                - generic [ref=e556]: "15:"
                                - generic [ref=e557]: "Object {"
                              - list [ref=e558]:
                                - listitem [ref=e559]:
                                  - generic [ref=e561]: "suit:"
                                  - text: "\"zrawet\""
                                - listitem [ref=e562]:
                                  - generic [ref=e564]: "value:"
                                  - text: "7"
                                - listitem [ref=e565]:
                                  - generic [ref=e567]: "displayValue:"
                                  - text: "7"
                                - listitem [ref=e568]:
                                  - generic [ref=e570]: "id:"
                                  - text: "\"zrawet-7\""
                              - text: "}"
                            - listitem [ref=e571]:
                              - generic [ref=e572]:
                                - generic [ref=e573] [cursor=pointer]:
                                  - generic: ▶
                                - generic [ref=e575]: "16:"
                                - generic [ref=e576]: "Object {"
                              - list [ref=e577]:
                                - listitem [ref=e578]:
                                  - generic [ref=e580]: "suit:"
                                  - text: "\"zrawet\""
                                - listitem [ref=e581]:
                                  - generic [ref=e583]: "value:"
                                  - text: "8"
                                - listitem [ref=e584]:
                                  - generic [ref=e586]: "displayValue:"
                                  - text: "10"
                                - listitem [ref=e587]:
                                  - generic [ref=e589]: "id:"
                                  - text: "\"zrawet-8\""
                              - text: "}"
                            - listitem [ref=e590]:
                              - generic [ref=e591]:
                                - generic [ref=e592] [cursor=pointer]:
                                  - generic: ▶
                                - generic [ref=e594]: "17:"
                                - generic [ref=e595]: "Object {"
                              - list [ref=e596]:
                                - listitem [ref=e597]:
                                  - generic [ref=e599]: "suit:"
                                  - text: "\"dheb\""
                                - listitem [ref=e600]:
                                  - generic [ref=e602]: "value:"
                                  - text: "8"
                                - listitem [ref=e603]:
                                  - generic [ref=e605]: "displayValue:"
                                  - text: "10"
                                - listitem [ref=e606]:
                                  - generic [ref=e608]: "id:"
                                  - text: "\"dheb-8\""
                              - text: "}"
                            - listitem [ref=e609]:
                              - generic [ref=e611]: "length:"
                              - text: "18"
                          - text: "]"
                        - listitem [ref=e612]:
                          - generic [ref=e614]: "score:"
                          - text: "4"
                      - text: "}"
                    - listitem [ref=e615]:
                      - generic [ref=e616]:
                        - generic [ref=e617] [cursor=pointer]:
                          - generic: ▶
                        - generic [ref=e619]: "1:"
                        - generic [ref=e620]: "Object {"
                      - list [ref=e621]:
                        - listitem [ref=e622]:
                          - generic [ref=e623]:
                            - generic [ref=e624] [cursor=pointer]:
                              - generic: ▶
                            - generic [ref=e626]: "hand:"
                            - generic [ref=e627]: Array(0)[
                          - list [ref=e628]:
                            - listitem [ref=e629]:
                              - generic [ref=e631]: "length:"
                              - text: "0"
                          - text: "]"
                        - listitem [ref=e632]:
                          - generic [ref=e633]:
                            - generic [ref=e634] [cursor=pointer]:
                              - generic: ▶
                            - generic [ref=e636]: "captured:"
                            - generic [ref=e637]: Array(22)[
                          - list [ref=e638]:
                            - listitem [ref=e639]:
                              - generic [ref=e640]:
                                - generic [ref=e641] [cursor=pointer]:
                                  - generic: ▶
                                - generic [ref=e643]: "0:"
                                - generic [ref=e644]: "Object {"
                              - list [ref=e645]:
                                - listitem [ref=e646]:
                                  - generic [ref=e648]: "suit:"
                                  - text: "\"zrawet\""
                                - listitem [ref=e649]:
                                  - generic [ref=e651]: "value:"
                                  - text: "2"
                                - listitem [ref=e652]:
                                  - generic [ref=e654]: "displayValue:"
                                  - text: "2"
                                - listitem [ref=e655]:
                                  - generic [ref=e657]: "id:"
                                  - text: "\"zrawet-2\""
                              - text: "}"
                            - listitem [ref=e658]:
                              - generic [ref=e659]:
                                - generic [ref=e660] [cursor=pointer]:
                                  - generic: ▶
                                - generic [ref=e662]: "1:"
                                - generic [ref=e663]: "Object {"
                              - list [ref=e664]:
                                - listitem [ref=e665]:
                                  - generic [ref=e667]: "suit:"
                                  - text: "\"jben\""
                                - listitem [ref=e668]:
                                  - generic [ref=e670]: "value:"
                                  - text: "2"
                                - listitem [ref=e671]:
                                  - generic [ref=e673]: "displayValue:"
                                  - text: "2"
                                - listitem [ref=e674]:
                                  - generic [ref=e676]: "id:"
                                  - text: "\"jben-2\""
                              - text: "}"
                            - listitem [ref=e677]:
                              - generic [ref=e678]:
                                - generic [ref=e679] [cursor=pointer]:
                                  - generic: ▶
                                - generic [ref=e681]: "2:"
                                - generic [ref=e682]: "Object {"
                              - list [ref=e683]:
                                - listitem [ref=e684]:
                                  - generic [ref=e686]: "suit:"
                                  - text: "\"dheb\""
                                - listitem [ref=e687]:
                                  - generic [ref=e689]: "value:"
                                  - text: "3"
                                - listitem [ref=e690]:
                                  - generic [ref=e692]: "displayValue:"
                                  - text: "3"
                                - listitem [ref=e693]:
                                  - generic [ref=e695]: "id:"
                                  - text: "\"dheb-3\""
                              - text: "}"
                            - listitem [ref=e696]:
                              - generic [ref=e697]:
                                - generic [ref=e698] [cursor=pointer]:
                                  - generic: ▶
                                - generic [ref=e700]: "3:"
                                - generic [ref=e701]: "Object {"
                              - list [ref=e702]:
                                - listitem [ref=e703]:
                                  - generic [ref=e705]: "suit:"
                                  - text: "\"jben\""
                                - listitem [ref=e706]:
                                  - generic [ref=e708]: "value:"
                                  - text: "10"
                                - listitem [ref=e709]:
                                  - generic [ref=e711]: "displayValue:"
                                  - text: "12"
                                - listitem [ref=e712]:
                                  - generic [ref=e714]: "id:"
                                  - text: "\"jben-10\""
                              - text: "}"
                            - listitem [ref=e715]:
                              - generic [ref=e716]:
                                - generic [ref=e717] [cursor=pointer]:
                                  - generic: ▶
                                - generic [ref=e719]: "4:"
                                - generic [ref=e720]: "Object {"
                              - list [ref=e721]:
                                - listitem [ref=e722]:
                                  - generic [ref=e724]: "suit:"
                                  - text: "\"syouf\""
                                - listitem [ref=e725]:
                                  - generic [ref=e727]: "value:"
                                  - text: "10"
                                - listitem [ref=e728]:
                                  - generic [ref=e730]: "displayValue:"
                                  - text: "12"
                                - listitem [ref=e731]:
                                  - generic [ref=e733]: "id:"
                                  - text: "\"syouf-10\""
                              - text: "}"
                            - listitem [ref=e734]:
                              - generic [ref=e735]:
                                - generic [ref=e736] [cursor=pointer]:
                                  - generic: ▶
                                - generic [ref=e738]: "5:"
                                - generic [ref=e739]: "Object {"
                              - list [ref=e740]:
                                - listitem [ref=e741]:
                                  - generic [ref=e743]: "suit:"
                                  - text: "\"jben\""
                                - listitem [ref=e744]:
                                  - generic [ref=e746]: "value:"
                                  - text: "6"
                                - listitem [ref=e747]:
                                  - generic [ref=e749]: "displayValue:"
                                  - text: "6"
                                - listitem [ref=e750]:
                                  - generic [ref=e752]: "id:"
                                  - text: "\"jben-6\""
                              - text: "}"
                            - listitem [ref=e753]:
                              - generic [ref=e754]:
                                - generic [ref=e755] [cursor=pointer]:
                                  - generic: ▶
                                - generic [ref=e757]: "6:"
                                - generic [ref=e758]: "Object {"
                              - list [ref=e759]:
                                - listitem [ref=e760]:
                                  - generic [ref=e762]: "suit:"
                                  - text: "\"dheb\""
                                - listitem [ref=e763]:
                                  - generic [ref=e765]: "value:"
                                  - text: "6"
                                - listitem [ref=e766]:
                                  - generic [ref=e768]: "displayValue:"
                                  - text: "6"
                                - listitem [ref=e769]:
                                  - generic [ref=e771]: "id:"
                                  - text: "\"dheb-6\""
                              - text: "}"
                            - listitem [ref=e772]:
                              - generic [ref=e773]:
                                - generic [ref=e774] [cursor=pointer]:
                                  - generic: ▶
                                - generic [ref=e776]: "7:"
                                - generic [ref=e777]: "Object {"
                              - list [ref=e778]:
                                - listitem [ref=e779]:
                                  - generic [ref=e781]: "suit:"
                                  - text: "\"syouf\""
                                - listitem [ref=e782]:
                                  - generic [ref=e784]: "value:"
                                  - text: "2"
                                - listitem [ref=e785]:
                                  - generic [ref=e787]: "displayValue:"
                                  - text: "2"
                                - listitem [ref=e788]:
                                  - generic [ref=e790]: "id:"
                                  - text: "\"syouf-2\""
                              - text: "}"
                            - listitem [ref=e791]:
                              - generic [ref=e792]:
                                - generic [ref=e793] [cursor=pointer]:
                                  - generic: ▶
                                - generic [ref=e795]: "8:"
                                - generic [ref=e796]: "Object {"
                              - list [ref=e797]:
                                - listitem [ref=e798]:
                                  - generic [ref=e800]: "suit:"
                                  - text: "\"dheb\""
                                - listitem [ref=e801]:
                                  - generic [ref=e803]: "value:"
                                  - text: "2"
                                - listitem [ref=e804]:
                                  - generic [ref=e806]: "displayValue:"
                                  - text: "2"
                                - listitem [ref=e807]:
                                  - generic [ref=e809]: "id:"
                                  - text: "\"dheb-2\""
                              - text: "}"
                            - listitem [ref=e810]:
                              - generic [ref=e811]:
                                - generic [ref=e812] [cursor=pointer]:
                                  - generic: ▶
                                - generic [ref=e814]: "9:"
                                - generic [ref=e815]: "Object {"
                              - list [ref=e816]:
                                - listitem [ref=e817]:
                                  - generic [ref=e819]: "suit:"
                                  - text: "\"jben\""
                                - listitem [ref=e820]:
                                  - generic [ref=e822]: "value:"
                                  - text: "5"
                                - listitem [ref=e823]:
                                  - generic [ref=e825]: "displayValue:"
                                  - text: "5"
                                - listitem [ref=e826]:
                                  - generic [ref=e828]: "id:"
                                  - text: "\"jben-5\""
                              - text: "}"
                            - listitem [ref=e829]:
                              - generic [ref=e830]:
                                - generic [ref=e831] [cursor=pointer]:
                                  - generic: ▶
                                - generic [ref=e833]: "10:"
                                - generic [ref=e834]: "Object {"
                              - list [ref=e835]:
                                - listitem [ref=e836]:
                                  - generic [ref=e838]: "suit:"
                                  - text: "\"dheb\""
                                - listitem [ref=e839]:
                                  - generic [ref=e841]: "value:"
                                  - text: "5"
                                - listitem [ref=e842]:
                                  - generic [ref=e844]: "displayValue:"
                                  - text: "5"
                                - listitem [ref=e845]:
                                  - generic [ref=e847]: "id:"
                                  - text: "\"dheb-5\""
                              - text: "}"
                            - listitem [ref=e848]:
                              - generic [ref=e849]:
                                - generic [ref=e850] [cursor=pointer]:
                                  - generic: ▶
                                - generic [ref=e852]: "11:"
                                - generic [ref=e853]: "Object {"
                              - list [ref=e854]:
                                - listitem [ref=e855]:
                                  - generic [ref=e857]: "suit:"
                                  - text: "\"dheb\""
                                - listitem [ref=e858]:
                                  - generic [ref=e860]: "value:"
                                  - text: "9"
                                - listitem [ref=e861]:
                                  - generic [ref=e863]: "displayValue:"
                                  - text: "11"
                                - listitem [ref=e864]:
                                  - generic [ref=e866]: "id:"
                                  - text: "\"dheb-9\""
                              - text: "}"
                            - listitem [ref=e867]:
                              - generic [ref=e868]:
                                - generic [ref=e869] [cursor=pointer]:
                                  - generic: ▶
                                - generic [ref=e871]: "12:"
                                - generic [ref=e872]: "Object {"
                              - list [ref=e873]:
                                - listitem [ref=e874]:
                                  - generic [ref=e876]: "suit:"
                                  - text: "\"zrawet\""
                                - listitem [ref=e877]:
                                  - generic [ref=e879]: "value:"
                                  - text: "9"
                                - listitem [ref=e880]:
                                  - generic [ref=e882]: "displayValue:"
                                  - text: "11"
                                - listitem [ref=e883]:
                                  - generic [ref=e885]: "id:"
                                  - text: "\"zrawet-9\""
                              - text: "}"
                            - listitem [ref=e886]:
                              - generic [ref=e887]:
                                - generic [ref=e888] [cursor=pointer]:
                                  - generic: ▶
                                - generic [ref=e890]: "13:"
                                - generic [ref=e891]: "Object {"
                              - list [ref=e892]:
                                - listitem [ref=e893]:
                                  - generic [ref=e895]: "suit:"
                                  - text: "\"dheb\""
                                - listitem [ref=e896]:
                                  - generic [ref=e898]: "value:"
                                  - text: "1"
                                - listitem [ref=e899]:
                                  - generic [ref=e901]: "displayValue:"
                                  - text: "1"
                                - listitem [ref=e902]:
                                  - generic [ref=e904]: "id:"
                                  - text: "\"dheb-1\""
                              - text: "}"
                            - listitem [ref=e905]:
                              - generic [ref=e906]:
                                - generic [ref=e907] [cursor=pointer]:
                                  - generic: ▶
                                - generic [ref=e909]: "14:"
                                - generic [ref=e910]: "Object {"
                              - list [ref=e911]:
                                - listitem [ref=e912]:
                                  - generic [ref=e914]: "suit:"
                                  - text: "\"jben\""
                                - listitem [ref=e915]:
                                  - generic [ref=e917]: "value:"
                                  - text: "1"
                                - listitem [ref=e918]:
                                  - generic [ref=e920]: "displayValue:"
                                  - text: "1"
                                - listitem [ref=e921]:
                                  - generic [ref=e923]: "id:"
                                  - text: "\"jben-1\""
                              - text: "}"
                            - listitem [ref=e924]:
                              - generic [ref=e925]:
                                - generic [ref=e926] [cursor=pointer]:
                                  - generic: ▶
                                - generic [ref=e928]: "15:"
                                - generic [ref=e929]: "Object {"
                              - list [ref=e930]:
                                - listitem [ref=e931]:
                                  - generic [ref=e933]: "suit:"
                                  - text: "\"syouf\""
                                - listitem [ref=e934]:
                                  - generic [ref=e936]: "value:"
                                  - text: "6"
                                - listitem [ref=e937]:
                                  - generic [ref=e939]: "displayValue:"
                                  - text: "6"
                                - listitem [ref=e940]:
                                  - generic [ref=e942]: "id:"
                                  - text: "\"syouf-6\""
                              - text: "}"
                            - listitem [ref=e943]:
                              - generic [ref=e944]:
                                - generic [ref=e945] [cursor=pointer]:
                                  - generic: ▶
                                - generic [ref=e947]: "16:"
                                - generic [ref=e948]: "Object {"
                              - list [ref=e949]:
                                - listitem [ref=e950]:
                                  - generic [ref=e952]: "suit:"
                                  - text: "\"zrawet\""
                                - listitem [ref=e953]:
                                  - generic [ref=e955]: "value:"
                                  - text: "6"
                                - listitem [ref=e956]:
                                  - generic [ref=e958]: "displayValue:"
                                  - text: "6"
                                - listitem [ref=e959]:
                                  - generic [ref=e961]: "id:"
                                  - text: "\"zrawet-6\""
                              - text: "}"
                            - listitem [ref=e962]:
                              - generic [ref=e963]:
                                - generic [ref=e964] [cursor=pointer]:
                                  - generic: ▶
                                - generic [ref=e966]: "17:"
                                - generic [ref=e967]: "Object {"
                              - list [ref=e968]:
                                - listitem [ref=e969]:
                                  - generic [ref=e971]: "suit:"
                                  - text: "\"jben\""
                                - listitem [ref=e972]:
                                  - generic [ref=e974]: "value:"
                                  - text: "9"
                                - listitem [ref=e975]:
                                  - generic [ref=e977]: "displayValue:"
                                  - text: "11"
                                - listitem [ref=e978]:
                                  - generic [ref=e980]: "id:"
                                  - text: "\"jben-9\""
                              - text: "}"
                            - listitem [ref=e981]:
                              - generic [ref=e982]:
                                - generic [ref=e983] [cursor=pointer]:
                                  - generic: ▶
                                - generic [ref=e985]: "18:"
                                - generic [ref=e986]: "Object {"
                              - list [ref=e987]:
                                - listitem [ref=e988]:
                                  - generic [ref=e990]: "suit:"
                                  - text: "\"syouf\""
                                - listitem [ref=e991]:
                                  - generic [ref=e993]: "value:"
                                  - text: "9"
                                - listitem [ref=e994]:
                                  - generic [ref=e996]: "displayValue:"
                                  - text: "11"
                                - listitem [ref=e997]:
                                  - generic [ref=e999]: "id:"
                                  - text: "\"syouf-9\""
                              - text: "}"
                            - listitem [ref=e1000]:
                              - generic [ref=e1001]:
                                - generic [ref=e1002] [cursor=pointer]:
                                  - generic: ▶
                                - generic [ref=e1004]: "19:"
                                - generic [ref=e1005]: "Object {"
                              - list [ref=e1006]:
                                - listitem [ref=e1007]:
                                  - generic [ref=e1009]: "suit:"
                                  - text: "\"jben\""
                                - listitem [ref=e1010]:
                                  - generic [ref=e1012]: "value:"
                                  - text: "4"
                                - listitem [ref=e1013]:
                                  - generic [ref=e1015]: "displayValue:"
                                  - text: "4"
                                - listitem [ref=e1016]:
                                  - generic [ref=e1018]: "id:"
                                  - text: "\"jben-4\""
                              - text: "}"
                            - listitem [ref=e1019]:
                              - generic [ref=e1020]:
                                - generic [ref=e1021] [cursor=pointer]:
                                  - generic: ▶
                                - generic [ref=e1023]: "20:"
                                - generic [ref=e1024]: "Object {"
                              - list [ref=e1025]:
                                - listitem [ref=e1026]:
                                  - generic [ref=e1028]: "suit:"
                                  - text: "\"zrawet\""
                                - listitem [ref=e1029]:
                                  - generic [ref=e1031]: "value:"
                                  - text: "4"
                                - listitem [ref=e1032]:
                                  - generic [ref=e1034]: "displayValue:"
                                  - text: "4"
                                - listitem [ref=e1035]:
                                  - generic [ref=e1037]: "id:"
                                  - text: "\"zrawet-4\""
                              - text: "}"
                            - listitem [ref=e1038]:
                              - generic [ref=e1039]:
                                - generic [ref=e1040] [cursor=pointer]:
                                  - generic: ▶
                                - generic [ref=e1042]: "21:"
                                - generic [ref=e1043]: "Object {"
                              - list [ref=e1044]:
                                - listitem [ref=e1045]:
                                  - generic [ref=e1047]: "suit:"
                                  - text: "\"syouf\""
                                - listitem [ref=e1048]:
                                  - generic [ref=e1050]: "value:"
                                  - text: "3"
                                - listitem [ref=e1051]:
                                  - generic [ref=e1053]: "displayValue:"
                                  - text: "3"
                                - listitem [ref=e1054]:
                                  - generic [ref=e1056]: "id:"
                                  - text: "\"syouf-3\""
                              - text: "}"
                            - listitem [ref=e1057]:
                              - generic [ref=e1059]: "length:"
                              - text: "22"
                          - text: "]"
                        - listitem [ref=e1060]:
                          - generic [ref=e1062]: "score:"
                          - text: "3"
                      - text: "}"
                  - text: "}"
                - listitem [ref=e1063]:
                  - generic [ref=e1065]: "lastCapture:"
                  - text: "\"1\""
                - listitem [ref=e1066]:
                  - generic [ref=e1068]: "lastPlayedCard:"
                  - text: "null"
                - listitem [ref=e1069]:
                  - generic [ref=e1070]:
                    - generic [ref=e1071] [cursor=pointer]:
                      - generic: ▶
                    - generic [ref=e1073]: "announcements:"
                    - generic [ref=e1074]: Array(0)[
                  - list [ref=e1075]:
                    - listitem [ref=e1076]:
                      - generic [ref=e1078]: "length:"
                      - text: "0"
                  - text: "]"
                - listitem [ref=e1079]:
                  - generic [ref=e1081]: "pendingCapture:"
                  - text: "null"
                - listitem [ref=e1082]:
                  - generic [ref=e1084]: "isAnimating:"
                  - text: "false"
                - listitem [ref=e1085]:
                  - generic [ref=e1087]: "gameStarted:"
                  - text: "true"
                - listitem [ref=e1088]:
                  - generic [ref=e1090]: "endTurnAfterUI:"
                  - text: "true"
                - listitem [ref=e1091]:
                  - generic [ref=e1092]:
                    - generic [ref=e1093] [cursor=pointer]:
                      - generic: ▶
                    - generic [ref=e1095]: "gameStatus:"
                    - generic [ref=e1096]: "Object {"
                  - list [ref=e1097]:
                    - listitem [ref=e1098]:
                      - generic [ref=e1100]: "winner:"
                      - text: "\"1\""
                    - listitem [ref=e1101]:
                      - generic [ref=e1103]: "p0Score:"
                      - text: "22"
                    - listitem [ref=e1104]:
                      - generic [ref=e1106]: "p1Score:"
                      - text: "25"
                  - text: "}"
                - listitem [ref=e1107]:
                  - generic [ref=e1108]:
                    - generic [ref=e1109] [cursor=pointer]:
                      - generic: ▶
                    - generic [ref=e1111]: "matchesWon:"
                    - generic [ref=e1112]: "Object {"
                  - list [ref=e1113]:
                    - listitem [ref=e1114]:
                      - generic [ref=e1116]: "0:"
                      - text: "0"
                    - listitem [ref=e1117]:
                      - generic [ref=e1119]: "1:"
                      - text: "1"
                  - text: "}"
                - listitem [ref=e1120]:
                  - generic [ref=e1122]: "activeClash:"
                  - text: "null"
              - text: "}"
        - generic [ref=e1123]:
          - heading "ctx" [level=3] [ref=e1124]
          - list [ref=e1125]:
            - listitem [ref=e1126]:
              - generic [ref=e1127]:
                - generic [ref=e1128] [cursor=pointer]:
                  - generic: ▶
                - generic [ref=e1129]: "Object {"
              - list [ref=e1130]:
                - listitem [ref=e1131]:
                  - generic [ref=e1133]: "numPlayers:"
                  - text: "2"
                - listitem [ref=e1134]:
                  - generic [ref=e1136]: "turn:"
                  - text: "36"
                - listitem [ref=e1137]:
                  - generic [ref=e1139]: "currentPlayer:"
                  - text: "\"1\""
                - listitem [ref=e1140]:
                  - generic [ref=e1141]:
                    - generic [ref=e1142] [cursor=pointer]:
                      - generic: ▶
                    - generic [ref=e1144]: "playOrder:"
                    - generic [ref=e1145]: Array(2)[
                  - list [ref=e1146]:
                    - listitem [ref=e1147]:
                      - generic [ref=e1149]: "0:"
                      - text: "\"0\""
                    - listitem [ref=e1150]:
                      - generic [ref=e1152]: "1:"
                      - text: "\"1\""
                    - listitem [ref=e1153]:
                      - generic [ref=e1155]: "length:"
                      - text: "2"
                  - text: "]"
                - listitem [ref=e1156]:
                  - generic [ref=e1158]: "playOrderPos:"
                  - text: "1"
                - listitem [ref=e1159]:
                  - generic [ref=e1161]: "phase:"
                  - text: "null"
                - listitem [ref=e1162]:
                  - generic [ref=e1163]:
                    - generic [ref=e1164] [cursor=pointer]:
                      - generic: ▶
                    - generic [ref=e1166]: "activePlayers:"
                    - generic [ref=e1167]: "Object {"
                  - list [ref=e1168]:
                    - listitem [ref=e1169]:
                      - generic [ref=e1171]: "0:"
                      - text: "\"gameOver\""
                    - listitem [ref=e1172]:
                      - generic [ref=e1174]: "1:"
                      - text: "\"gameOver\""
                  - text: "}"
                - listitem [ref=e1175]:
                  - generic [ref=e1177]: "numMoves:"
                  - text: "2"
              - text: "}"
```

# Test source

```ts
  20  |     // 2. Click "Play vs AI Bot" button
  21  |     const playBtn = page.locator('button', { hasText: /Play vs AI Bot|Jouer contre l\'IA|Gegen KI spielen|العب ضد الذكاء الاصطناعي/i });
  22  |     await expect(playBtn.first()).toBeVisible();
  23  |     await playBtn.first().click();
  24  | 
  25  |     // 3. Wait for the game board to render
  26  |     const mainContainer = page.locator('.min-h-screen').first();
  27  |     await expect(mainContainer).toBeVisible({ timeout: 10000 });
  28  |     console.log('Game board loaded.');
  29  |     
  30  |     // --- NEW CHECKS TO DETECT THE RENDERING BUG ---
  31  |     // At the start of a standard game, there should be exactly 4 cards on the table.
  32  |     // We locate img elements inside the table area (the emerald felt container).
  33  |     // The table is identified by its emerald background class.
  34  |     const tableArea = page.locator('.bg-emerald-900\\/40').first();
  35  |     const tableCardImgs = tableArea.locator('img');
  36  |     
  37  |     console.log('Verifying initial game state rendering...');
  38  |     // Wait for initial dealing animations
  39  |     await page.waitForTimeout(3000); 
  40  |     
  41  |     const tableCount = await tableCardImgs.count();
  42  |     // Hand cards are the ones with cursor-grab (the player's interactive cards)
  43  |     const handCards = page.locator('.cursor-grab');
  44  |     const handCount = await handCards.count();
  45  |     
  46  |     console.log(`Diagnostic: Table card imgs: ${tableCount}, Player hand cards (cursor-grab): ${handCount}`);
  47  |     
  48  |     // The "Invisible Table" bug manifests as 0 cards on the table
  49  |     if (tableCount !== 4) {
  50  |       console.error(`FAILURE: Expected 4 cards on table, but found ${tableCount}.`);
  51  |       // Try to log the inner HTML for more context
  52  |       const tableHTML = await tableArea.innerHTML().catch(() => 'Could not get innerHTML');
  53  |       console.error('Table area innerHTML preview:', tableHTML.substring(0, 500));
  54  |     }
  55  | 
  56  |     // Ensure they are actually visible to the user
  57  |     for (let i = 0; i < tableCount; i++) {
  58  |       const isVisible = await tableCardImgs.nth(i).isVisible();
  59  |       if (!isVisible) {
  60  |         console.error(`FAILURE: Table card img ${i} is in the DOM but NOT visible.`);
  61  |       }
  62  |     }
  63  |     
  64  |     // Hard assertion to fail the test and catch the bug
  65  |     expect(tableCount, 'Table should have exactly 4 card images').toBe(4);
  66  |     expect(handCount, 'Player hand should have exactly 3 interactive cards').toBe(3);
  67  |     
  68  |     const tableEmptyMsg = page.locator('text=/TABLE EMPTY|TISCH LEER|TABLE VIDE/i');
  69  |     await expect(tableEmptyMsg).not.toBeVisible();
  70  |     console.log('✅ Rendering check passed: 4 table cards and 3 hand cards visible.');
  71  |     // ----------------------------------------------
  72  | 
  73  | 
  74  |     // The Game Over overlay contains an h2 with "Game Over" text
  75  |     const gameOverOverlay = page.locator('h2', { hasText: /Game Over|Partie Terminée|Spielende|انتهت اللعبة/i });
  76  |     
  77  |     // Playable cards in our hand have the class "cursor-grab" on their motion wrapper.
  78  |     const myCards = page.locator('.cursor-grab');
  79  | 
  80  |     const MAX_ATTEMPTS = 400; // safety limit to prevent infinite loops
  81  |     let attempts = 0;
  82  |     let cardsPlayedByUs = 0;
  83  | 
  84  |     console.log('Starting to play cards automatically...');
  85  | 
  86  |     while (attempts < MAX_ATTEMPTS) {
  87  |       // Check if game over overlay appeared
  88  |       if (await gameOverOverlay.isVisible().catch(() => false)) {
  89  |         console.log(`Game Over overlay detected after ${attempts} attempts!`);
  90  |         break;
  91  |       }
  92  | 
  93  |       const cardCount = await myCards.count().catch(() => 0);
  94  |       if (cardCount > 0) {
  95  |         try {
  96  |           // Play the first available card in our hand
  97  |           await myCards.first().click({ timeout: 500 });
  98  |           cardsPlayedByUs++;
  99  |           // Give the game a slightly longer moment to process the move and animate before the next loop
  100 |           await page.waitForTimeout(800); 
  101 |         } catch {
  102 |           // Card might be animating, not clickable yet, or it's not our turn
  103 |         }
  104 |       }
  105 | 
  106 |       // Short wait before checking again
  107 |       await page.waitForTimeout(300);
  108 |       attempts++;
  109 |     }
  110 | 
  111 |     // ===== ASSERTIONS =====
  112 |     
  113 |     // 1. We should have reached the Game Over screen
  114 |     await expect(gameOverOverlay).toBeVisible({ timeout: 10000 });
  115 |     console.log('✅ Success: Reached the Game Over screen.');
  116 | 
  117 |     // 2. We should have attempted to play cards. 
  118 |     // In a full game, we should play exactly 20 cards. But since we might click multiple times,
  119 |     // cardsPlayedByUs might be >= 20. We just want to ensure it's a significant number.
> 120 |     expect(cardsPlayedByUs).toBeGreaterThan(15);
      |                             ^ Error: expect(received).toBeGreaterThan(expected)
  121 |     console.log(`✅ Success: Played approximately ${cardsPlayedByUs} cards during the game.`);
  122 | 
  123 |     // 3. Play Again button is visible
  124 |     const playAgainBtn = page.locator('button', { hasText: /Play Again|Rejouer|Erneut spielen|إعادة اللعب/i });
  125 |     await expect(playAgainBtn).toBeVisible();
  126 |     console.log('✅ Success: "Play Again" button is visible and ready for a new round.');
  127 |   });
  128 | });
  129 | 
```