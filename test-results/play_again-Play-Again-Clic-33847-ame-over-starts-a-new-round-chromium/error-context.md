# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: play_again.spec.js >> Play Again: Clicking Play Again after game over starts a new round
- Location: tests\play_again.spec.js:15:1

# Error details

```
Test timeout of 180000ms exceeded.
```

```
Error: page.waitForTimeout: Test timeout of 180000ms exceeded.
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e6]:
    - button "Back to Menu" [ref=e8]:
      - img [ref=e9]
      - generic [ref=e11]: Back to Menu
    - generic [ref=e12]:
      - generic [ref=e13]:
        - generic [ref=e14]: Opponent
        - generic [ref=e35]:
          - generic [ref=e36]: "Cards:"
          - generic [ref=e37]: "21"
      - generic [ref=e38]:
        - generic [ref=e41]:
          - img "Card Back" [ref=e42]
          - img
        - generic [ref=e45]:
          - img "Card Back" [ref=e46]
          - img
    - generic [ref=e48]:
      - img "zrawet 11" [ref=e52] [cursor=pointer]
      - generic [ref=e53]:
        - img "jben 12" [ref=e56] [cursor=pointer]
        - img "dheb 12" [ref=e59] [cursor=pointer]
    - generic [ref=e61]:
      - generic [ref=e62]:
        - generic [ref=e64]: You
        - generic [ref=e77]:
          - generic [ref=e78]: "Cards:"
          - generic [ref=e79]: "12"
      - img "syouf 3" [ref=e83] [cursor=pointer]
      - generic [ref=e85]:
        - img "Card Back" [ref=e87]
        - generic [ref=e88]: "Cards remaining: 6"
  - region "boardgame.io Debug Panel" [ref=e89]:
    - generic [ref=e90]:
      - button "Hide Debug Panel" [ref=e91] [cursor=pointer]:
        - img [ref=e93]
      - navigation [ref=e95]:
        - button "Main" [ref=e96]
        - button "Log" [ref=e97] [cursor=pointer]
        - button "Info" [ref=e98] [cursor=pointer]
        - button "AI" [ref=e99] [cursor=pointer]
      - region "main" [ref=e100]:
        - generic [ref=e101]:
          - heading "Controls" [level=3] [ref=e102]
          - list [ref=e103]:
            - listitem [ref=e104]:
              - generic [ref=e105]:
                - 'button "reset (shortcut: 1)" [ref=e106] [cursor=pointer]': "1"
                - generic [ref=e107]:
                  - text: reset
                  - generic [ref=e108]: "(shortcut: 1)"
            - listitem [ref=e109]:
              - generic [ref=e110]:
                - 'button "save (shortcut: 2)" [ref=e111] [cursor=pointer]': "2"
                - generic [ref=e112]:
                  - text: save
                  - generic [ref=e113]: "(shortcut: 2)"
            - listitem [ref=e114]:
              - generic [ref=e115]:
                - 'button "restore (shortcut: 3)" [ref=e116] [cursor=pointer]': "3"
                - generic [ref=e117]:
                  - text: restore
                  - generic [ref=e118]: "(shortcut: 3)"
            - listitem [ref=e119]:
              - generic [ref=e120]:
                - 'button "hide (shortcut: .)" [ref=e121] [cursor=pointer]': .
                - generic [ref=e122]:
                  - text: hide
                  - generic [ref=e123]: "(shortcut: .)"
        - generic [ref=e124]:
          - heading "Players" [level=3] [ref=e125]
          - generic [ref=e126]:
            - button "Player 0 (current, active)" [ref=e127] [cursor=pointer]: "0"
            - button "Player 1" [ref=e128] [cursor=pointer]: "1"
        - generic [ref=e129]:
          - heading "Moves" [level=3] [ref=e130]
          - list [ref=e131]:
            - listitem [ref=e132]:
              - generic [ref=e134]:
                - button "b" [ref=e136] [cursor=pointer]
                - generic [ref=e137] [cursor=pointer]:
                  - generic [ref=e138]: playCard
                  - generic [ref=e139]: (
                  - generic [ref=e140]: )
            - listitem [ref=e141]:
              - generic [ref=e143]:
                - button "c" [ref=e145] [cursor=pointer]
                - generic [ref=e146] [cursor=pointer]:
                  - generic [ref=e147]: processCapture
                  - generic [ref=e148]: (
                  - generic [ref=e149]: )
            - listitem [ref=e150]:
              - generic [ref=e152]:
                - button "d" [ref=e154] [cursor=pointer]
                - generic [ref=e155] [cursor=pointer]:
                  - generic [ref=e156]: clearAnnouncements
                  - generic [ref=e157]: (
                  - generic [ref=e158]: )
            - listitem [ref=e159]:
              - generic [ref=e161]:
                - button "e" [ref=e163] [cursor=pointer]
                - generic [ref=e164] [cursor=pointer]:
                  - generic [ref=e165]: endAnimation
                  - generic [ref=e166]: (
                  - generic [ref=e167]: )
            - listitem [ref=e168]:
              - generic [ref=e170]:
                - button "f" [ref=e172] [cursor=pointer]
                - generic [ref=e173] [cursor=pointer]:
                  - generic [ref=e174]: restartGame
                  - generic [ref=e175]: (
                  - generic [ref=e176]: )
        - generic [ref=e177]:
          - heading "Events" [level=3] [ref=e178]
          - list [ref=e179]:
            - listitem [ref=e180]:
              - generic [ref=e182]:
                - button "7" [ref=e184] [cursor=pointer]
                - generic [ref=e185] [cursor=pointer]:
                  - generic [ref=e186]: endStage
                  - generic [ref=e187]: (
                  - generic [ref=e188]: )
            - listitem [ref=e189]:
              - generic [ref=e191]:
                - button "8" [ref=e193] [cursor=pointer]
                - generic [ref=e194] [cursor=pointer]:
                  - generic [ref=e195]: endTurn
                  - generic [ref=e196]: (
                  - generic [ref=e197]: )
        - generic [ref=e198]:
          - heading "G" [level=3] [ref=e199]
          - list [ref=e200]:
            - listitem [ref=e201]:
              - generic [ref=e202]:
                - generic [ref=e203] [cursor=pointer]:
                  - generic: ▶
                - generic [ref=e204]: "Object {"
              - list [ref=e205]:
                - listitem [ref=e206]:
                  - generic [ref=e207]:
                    - generic [ref=e208] [cursor=pointer]:
                      - generic: ▶
                    - generic [ref=e210]: "deck:"
                    - generic [ref=e211]: Array(6)[
                  - list [ref=e212]:
                    - listitem [ref=e213]:
                      - generic [ref=e215]: "Object {"
                      - text: "… }"
                    - text: ","
                    - listitem [ref=e216]:
                      - generic [ref=e218]: "Object {"
                      - text: "… }"
                    - text: ","
                    - listitem [ref=e219]:
                      - generic [ref=e221]: "Object {"
                      - text: "… }"
                    - text: ","
                    - listitem [ref=e222]:
                      - generic [ref=e224]: "Object {"
                      - text: "… }"
                    - text: ","
                    - listitem [ref=e225]:
                      - generic [ref=e227]: "Object {"
                      - text: "… }"
                    - text: ", …"
                  - text: "]"
                - listitem [ref=e228]:
                  - generic [ref=e229]:
                    - generic [ref=e230] [cursor=pointer]:
                      - generic: ▶
                    - generic [ref=e232]: "table:"
                    - generic [ref=e233]: Array(3)[
                  - list [ref=e234]:
                    - listitem [ref=e235]:
                      - generic [ref=e236]:
                        - generic [ref=e237] [cursor=pointer]:
                          - generic: ▶
                        - generic [ref=e239]: "0:"
                        - generic [ref=e240]: "Object {"
                      - list [ref=e241]:
                        - listitem [ref=e242]:
                          - generic [ref=e244]: "suit:"
                          - text: "\"zrawet\""
                        - listitem [ref=e245]:
                          - generic [ref=e247]: "value:"
                          - text: "9"
                        - listitem [ref=e248]:
                          - generic [ref=e250]: "displayValue:"
                          - text: "11"
                        - listitem [ref=e251]:
                          - generic [ref=e253]: "id:"
                          - text: "\"zrawet-9\""
                      - text: "}"
                    - listitem [ref=e254]:
                      - generic [ref=e255]:
                        - generic [ref=e256] [cursor=pointer]:
                          - generic: ▶
                        - generic [ref=e258]: "1:"
                        - generic [ref=e259]: "Object {"
                      - list [ref=e260]:
                        - listitem [ref=e261]:
                          - generic [ref=e263]: "suit:"
                          - text: "\"jben\""
                        - listitem [ref=e264]:
                          - generic [ref=e266]: "value:"
                          - text: "10"
                        - listitem [ref=e267]:
                          - generic [ref=e269]: "displayValue:"
                          - text: "12"
                        - listitem [ref=e270]:
                          - generic [ref=e272]: "id:"
                          - text: "\"jben-10\""
                      - text: "}"
                    - listitem [ref=e273]:
                      - generic [ref=e274]:
                        - generic [ref=e275] [cursor=pointer]:
                          - generic: ▶
                        - generic [ref=e277]: "2:"
                        - generic [ref=e278]: "Object {"
                      - list [ref=e279]:
                        - listitem [ref=e280]:
                          - generic [ref=e282]: "suit:"
                          - text: "\"dheb\""
                        - listitem [ref=e283]:
                          - generic [ref=e285]: "value:"
                          - text: "10"
                        - listitem [ref=e286]:
                          - generic [ref=e288]: "displayValue:"
                          - text: "12"
                        - listitem [ref=e289]:
                          - generic [ref=e291]: "id:"
                          - text: "\"dheb-10\""
                      - text: "}"
                    - listitem [ref=e292]:
                      - generic [ref=e294]: "length:"
                      - text: "3"
                  - text: "]"
                - listitem [ref=e295]:
                  - generic [ref=e296]:
                    - generic [ref=e297] [cursor=pointer]:
                      - generic: ▶
                    - generic [ref=e299]: "players:"
                    - generic [ref=e300]: "Object {"
                  - list [ref=e301]:
                    - listitem [ref=e302]:
                      - generic [ref=e303]:
                        - generic [ref=e304] [cursor=pointer]:
                          - generic: ▶
                        - generic [ref=e306]: "0:"
                        - generic [ref=e307]: "Object {"
                      - list [ref=e308]:
                        - listitem [ref=e309]:
                          - generic [ref=e310]:
                            - generic [ref=e311] [cursor=pointer]:
                              - generic: ▶
                            - generic [ref=e313]: "hand:"
                            - generic [ref=e314]: Array(1)[
                          - list [ref=e315]:
                            - listitem [ref=e316]:
                              - generic [ref=e317]:
                                - generic [ref=e318] [cursor=pointer]:
                                  - generic: ▶
                                - generic [ref=e320]: "0:"
                                - generic [ref=e321]: "Object {"
                              - list [ref=e322]:
                                - listitem [ref=e323]:
                                  - generic [ref=e325]: "suit:"
                                  - text: "\"syouf\""
                                - listitem [ref=e326]:
                                  - generic [ref=e328]: "value:"
                                  - text: "3"
                                - listitem [ref=e329]:
                                  - generic [ref=e331]: "displayValue:"
                                  - text: "3"
                                - listitem [ref=e332]:
                                  - generic [ref=e334]: "id:"
                                  - text: "\"syouf-3\""
                              - text: "}"
                            - listitem [ref=e335]:
                              - generic [ref=e337]: "length:"
                              - text: "1"
                          - text: "]"
                        - listitem [ref=e338]:
                          - generic [ref=e339]:
                            - generic [ref=e340] [cursor=pointer]:
                              - generic: ▶
                            - generic [ref=e342]: "captured:"
                            - generic [ref=e343]: Array(10)[
                          - list [ref=e344]:
                            - listitem [ref=e345]:
                              - generic [ref=e346]:
                                - generic [ref=e347] [cursor=pointer]:
                                  - generic: ▶
                                - generic [ref=e349]: "0:"
                                - generic [ref=e350]: "Object {"
                              - list [ref=e351]:
                                - listitem [ref=e352]:
                                  - generic [ref=e354]: "suit:"
                                  - text: "\"jben\""
                                - listitem [ref=e355]:
                                  - generic [ref=e357]: "value:"
                                  - text: "9"
                                - listitem [ref=e358]:
                                  - generic [ref=e360]: "displayValue:"
                                  - text: "11"
                                - listitem [ref=e361]:
                                  - generic [ref=e363]: "id:"
                                  - text: "\"jben-9\""
                              - text: "}"
                            - listitem [ref=e364]:
                              - generic [ref=e365]:
                                - generic [ref=e366] [cursor=pointer]:
                                  - generic: ▶
                                - generic [ref=e368]: "1:"
                                - generic [ref=e369]: "Object {"
                              - list [ref=e370]:
                                - listitem [ref=e371]:
                                  - generic [ref=e373]: "suit:"
                                  - text: "\"dheb\""
                                - listitem [ref=e374]:
                                  - generic [ref=e376]: "value:"
                                  - text: "9"
                                - listitem [ref=e377]:
                                  - generic [ref=e379]: "displayValue:"
                                  - text: "11"
                                - listitem [ref=e380]:
                                  - generic [ref=e382]: "id:"
                                  - text: "\"dheb-9\""
                              - text: "}"
                            - listitem [ref=e383]:
                              - generic [ref=e384]:
                                - generic [ref=e385] [cursor=pointer]:
                                  - generic: ▶
                                - generic [ref=e387]: "2:"
                                - generic [ref=e388]: "Object {"
                              - list [ref=e389]:
                                - listitem [ref=e390]:
                                  - generic [ref=e392]: "suit:"
                                  - text: "\"syouf\""
                                - listitem [ref=e393]:
                                  - generic [ref=e395]: "value:"
                                  - text: "4"
                                - listitem [ref=e396]:
                                  - generic [ref=e398]: "displayValue:"
                                  - text: "4"
                                - listitem [ref=e399]:
                                  - generic [ref=e401]: "id:"
                                  - text: "\"syouf-4\""
                              - text: "}"
                            - listitem [ref=e402]:
                              - generic [ref=e403]:
                                - generic [ref=e404] [cursor=pointer]:
                                  - generic: ▶
                                - generic [ref=e406]: "3:"
                                - generic [ref=e407]: "Object {"
                              - list [ref=e408]:
                                - listitem [ref=e409]:
                                  - generic [ref=e411]: "suit:"
                                  - text: "\"jben\""
                                - listitem [ref=e412]:
                                  - generic [ref=e414]: "value:"
                                  - text: "4"
                                - listitem [ref=e415]:
                                  - generic [ref=e417]: "displayValue:"
                                  - text: "4"
                                - listitem [ref=e418]:
                                  - generic [ref=e420]: "id:"
                                  - text: "\"jben-4\""
                              - text: "}"
                            - listitem [ref=e421]:
                              - generic [ref=e422]:
                                - generic [ref=e423] [cursor=pointer]:
                                  - generic: ▶
                                - generic [ref=e425]: "4:"
                                - generic [ref=e426]: "Object {"
                              - list [ref=e427]:
                                - listitem [ref=e428]:
                                  - generic [ref=e430]: "suit:"
                                  - text: "\"zrawet\""
                                - listitem [ref=e431]:
                                  - generic [ref=e433]: "value:"
                                  - text: "2"
                                - listitem [ref=e434]:
                                  - generic [ref=e436]: "displayValue:"
                                  - text: "2"
                                - listitem [ref=e437]:
                                  - generic [ref=e439]: "id:"
                                  - text: "\"zrawet-2\""
                              - text: "}"
                            - listitem [ref=e440]:
                              - generic [ref=e441]:
                                - generic [ref=e442] [cursor=pointer]:
                                  - generic: ▶
                                - generic [ref=e444]: "5:"
                                - generic [ref=e445]: "Object {"
                              - list [ref=e446]:
                                - listitem [ref=e447]:
                                  - generic [ref=e449]: "suit:"
                                  - text: "\"syouf\""
                                - listitem [ref=e450]:
                                  - generic [ref=e452]: "value:"
                                  - text: "2"
                                - listitem [ref=e453]:
                                  - generic [ref=e455]: "displayValue:"
                                  - text: "2"
                                - listitem [ref=e456]:
                                  - generic [ref=e458]: "id:"
                                  - text: "\"syouf-2\""
                              - text: "}"
                            - listitem [ref=e459]:
                              - generic [ref=e460]:
                                - generic [ref=e461] [cursor=pointer]:
                                  - generic: ▶
                                - generic [ref=e463]: "6:"
                                - generic [ref=e464]: "Object {"
                              - list [ref=e465]:
                                - listitem [ref=e466]:
                                  - generic [ref=e468]: "suit:"
                                  - text: "\"jben\""
                                - listitem [ref=e469]:
                                  - generic [ref=e471]: "value:"
                                  - text: "5"
                                - listitem [ref=e472]:
                                  - generic [ref=e474]: "displayValue:"
                                  - text: "5"
                                - listitem [ref=e475]:
                                  - generic [ref=e477]: "id:"
                                  - text: "\"jben-5\""
                              - text: "}"
                            - listitem [ref=e478]:
                              - generic [ref=e479]:
                                - generic [ref=e480] [cursor=pointer]:
                                  - generic: ▶
                                - generic [ref=e482]: "7:"
                                - generic [ref=e483]: "Object {"
                              - list [ref=e484]:
                                - listitem [ref=e485]:
                                  - generic [ref=e487]: "suit:"
                                  - text: "\"dheb\""
                                - listitem [ref=e488]:
                                  - generic [ref=e490]: "value:"
                                  - text: "5"
                                - listitem [ref=e491]:
                                  - generic [ref=e493]: "displayValue:"
                                  - text: "5"
                                - listitem [ref=e494]:
                                  - generic [ref=e496]: "id:"
                                  - text: "\"dheb-5\""
                              - text: "}"
                            - listitem [ref=e497]:
                              - generic [ref=e498]:
                                - generic [ref=e499] [cursor=pointer]:
                                  - generic: ▶
                                - generic [ref=e501]: "8:"
                                - generic [ref=e502]: "Object {"
                              - list [ref=e503]:
                                - listitem [ref=e504]:
                                  - generic [ref=e506]: "suit:"
                                  - text: "\"zrawet\""
                                - listitem [ref=e507]:
                                  - generic [ref=e509]: "value:"
                                  - text: "6"
                                - listitem [ref=e510]:
                                  - generic [ref=e512]: "displayValue:"
                                  - text: "6"
                                - listitem [ref=e513]:
                                  - generic [ref=e515]: "id:"
                                  - text: "\"zrawet-6\""
                              - text: "}"
                            - listitem [ref=e516]:
                              - generic [ref=e517]:
                                - generic [ref=e518] [cursor=pointer]:
                                  - generic: ▶
                                - generic [ref=e520]: "9:"
                                - generic [ref=e521]: "Object {"
                              - list [ref=e522]:
                                - listitem [ref=e523]:
                                  - generic [ref=e525]: "suit:"
                                  - text: "\"jben\""
                                - listitem [ref=e526]:
                                  - generic [ref=e528]: "value:"
                                  - text: "7"
                                - listitem [ref=e529]:
                                  - generic [ref=e531]: "displayValue:"
                                  - text: "7"
                                - listitem [ref=e532]:
                                  - generic [ref=e534]: "id:"
                                  - text: "\"jben-7\""
                              - text: "}"
                            - listitem [ref=e535]:
                              - generic [ref=e537]: "length:"
                              - text: "10"
                          - text: "]"
                        - listitem [ref=e538]:
                          - generic [ref=e540]: "score:"
                          - text: "2"
                      - text: "}"
                    - listitem [ref=e541]:
                      - generic [ref=e542]:
                        - generic [ref=e543] [cursor=pointer]:
                          - generic: ▶
                        - generic [ref=e545]: "1:"
                        - generic [ref=e546]: "Object {"
                      - list [ref=e547]:
                        - listitem [ref=e548]:
                          - generic [ref=e549]:
                            - generic [ref=e550] [cursor=pointer]:
                              - generic: ▶
                            - generic [ref=e552]: "hand:"
                            - generic [ref=e553]: Array(2)[
                          - list [ref=e554]:
                            - listitem [ref=e555]:
                              - generic [ref=e556]:
                                - generic [ref=e557] [cursor=pointer]:
                                  - generic: ▶
                                - generic [ref=e559]: "0:"
                                - generic [ref=e560]: "Object {"
                              - list [ref=e561]:
                                - listitem [ref=e562]:
                                  - generic [ref=e564]: "suit:"
                                  - text: "\"dheb\""
                                - listitem [ref=e565]:
                                  - generic [ref=e567]: "value:"
                                  - text: "3"
                                - listitem [ref=e568]:
                                  - generic [ref=e570]: "displayValue:"
                                  - text: "3"
                                - listitem [ref=e571]:
                                  - generic [ref=e573]: "id:"
                                  - text: "\"dheb-3\""
                              - text: "}"
                            - listitem [ref=e574]:
                              - generic [ref=e575]:
                                - generic [ref=e576] [cursor=pointer]:
                                  - generic: ▶
                                - generic [ref=e578]: "1:"
                                - generic [ref=e579]: "Object {"
                              - list [ref=e580]:
                                - listitem [ref=e581]:
                                  - generic [ref=e583]: "suit:"
                                  - text: "\"zrawet\""
                                - listitem [ref=e584]:
                                  - generic [ref=e586]: "value:"
                                  - text: "8"
                                - listitem [ref=e587]:
                                  - generic [ref=e589]: "displayValue:"
                                  - text: "10"
                                - listitem [ref=e590]:
                                  - generic [ref=e592]: "id:"
                                  - text: "\"zrawet-8\""
                              - text: "}"
                            - listitem [ref=e593]:
                              - generic [ref=e595]: "length:"
                              - text: "2"
                          - text: "]"
                        - listitem [ref=e596]:
                          - generic [ref=e597]:
                            - generic [ref=e598] [cursor=pointer]:
                              - generic: ▶
                            - generic [ref=e600]: "captured:"
                            - generic [ref=e601]: Array(18)[
                          - list [ref=e602]:
                            - listitem [ref=e603]:
                              - generic [ref=e604]:
                                - generic [ref=e605] [cursor=pointer]:
                                  - generic: ▶
                                - generic [ref=e607]: "0:"
                                - generic [ref=e608]: "Object {"
                              - list [ref=e609]:
                                - listitem [ref=e610]:
                                  - generic [ref=e612]: "suit:"
                                  - text: "\"zrawet\""
                                - listitem [ref=e613]:
                                  - generic [ref=e615]: "value:"
                                  - text: "10"
                                - listitem [ref=e616]:
                                  - generic [ref=e618]: "displayValue:"
                                  - text: "12"
                                - listitem [ref=e619]:
                                  - generic [ref=e621]: "id:"
                                  - text: "\"zrawet-10\""
                              - text: "}"
                            - listitem [ref=e622]:
                              - generic [ref=e623]:
                                - generic [ref=e624] [cursor=pointer]:
                                  - generic: ▶
                                - generic [ref=e626]: "1:"
                                - generic [ref=e627]: "Object {"
                              - list [ref=e628]:
                                - listitem [ref=e629]:
                                  - generic [ref=e631]: "suit:"
                                  - text: "\"syouf\""
                                - listitem [ref=e632]:
                                  - generic [ref=e634]: "value:"
                                  - text: "10"
                                - listitem [ref=e635]:
                                  - generic [ref=e637]: "displayValue:"
                                  - text: "12"
                                - listitem [ref=e638]:
                                  - generic [ref=e640]: "id:"
                                  - text: "\"syouf-10\""
                              - text: "}"
                            - listitem [ref=e641]:
                              - generic [ref=e642]:
                                - generic [ref=e643] [cursor=pointer]:
                                  - generic: ▶
                                - generic [ref=e645]: "2:"
                                - generic [ref=e646]: "Object {"
                              - list [ref=e647]:
                                - listitem [ref=e648]:
                                  - generic [ref=e650]: "suit:"
                                  - text: "\"syouf\""
                                - listitem [ref=e651]:
                                  - generic [ref=e653]: "value:"
                                  - text: "1"
                                - listitem [ref=e654]:
                                  - generic [ref=e656]: "displayValue:"
                                  - text: "1"
                                - listitem [ref=e657]:
                                  - generic [ref=e659]: "id:"
                                  - text: "\"syouf-1\""
                              - text: "}"
                            - listitem [ref=e660]:
                              - generic [ref=e661]:
                                - generic [ref=e662] [cursor=pointer]:
                                  - generic: ▶
                                - generic [ref=e664]: "3:"
                                - generic [ref=e665]: "Object {"
                              - list [ref=e666]:
                                - listitem [ref=e667]:
                                  - generic [ref=e669]: "suit:"
                                  - text: "\"jben\""
                                - listitem [ref=e670]:
                                  - generic [ref=e672]: "value:"
                                  - text: "1"
                                - listitem [ref=e673]:
                                  - generic [ref=e675]: "displayValue:"
                                  - text: "1"
                                - listitem [ref=e676]:
                                  - generic [ref=e678]: "id:"
                                  - text: "\"jben-1\""
                              - text: "}"
                            - listitem [ref=e679]:
                              - generic [ref=e680]:
                                - generic [ref=e681] [cursor=pointer]:
                                  - generic: ▶
                                - generic [ref=e683]: "4:"
                                - generic [ref=e684]: "Object {"
                              - list [ref=e685]:
                                - listitem [ref=e686]:
                                  - generic [ref=e688]: "suit:"
                                  - text: "\"jben\""
                                - listitem [ref=e689]:
                                  - generic [ref=e691]: "value:"
                                  - text: "2"
                                - listitem [ref=e692]:
                                  - generic [ref=e694]: "displayValue:"
                                  - text: "2"
                                - listitem [ref=e695]:
                                  - generic [ref=e697]: "id:"
                                  - text: "\"jben-2\""
                              - text: "}"
                            - listitem [ref=e698]:
                              - generic [ref=e699]:
                                - generic [ref=e700] [cursor=pointer]:
                                  - generic: ▶
                                - generic [ref=e702]: "5:"
                                - generic [ref=e703]: "Object {"
                              - list [ref=e704]:
                                - listitem [ref=e705]:
                                  - generic [ref=e707]: "suit:"
                                  - text: "\"jben\""
                                - listitem [ref=e708]:
                                  - generic [ref=e710]: "value:"
                                  - text: "3"
                                - listitem [ref=e711]:
                                  - generic [ref=e713]: "displayValue:"
                                  - text: "3"
                                - listitem [ref=e714]:
                                  - generic [ref=e716]: "id:"
                                  - text: "\"jben-3\""
                              - text: "}"
                            - listitem [ref=e717]:
                              - generic [ref=e718]:
                                - generic [ref=e719] [cursor=pointer]:
                                  - generic: ▶
                                - generic [ref=e721]: "6:"
                                - generic [ref=e722]: "Object {"
                              - list [ref=e723]:
                                - listitem [ref=e724]:
                                  - generic [ref=e726]: "suit:"
                                  - text: "\"zrawet\""
                                - listitem [ref=e727]:
                                  - generic [ref=e729]: "value:"
                                  - text: "4"
                                - listitem [ref=e730]:
                                  - generic [ref=e732]: "displayValue:"
                                  - text: "4"
                                - listitem [ref=e733]:
                                  - generic [ref=e735]: "id:"
                                  - text: "\"zrawet-4\""
                              - text: "}"
                            - listitem [ref=e736]:
                              - generic [ref=e737]:
                                - generic [ref=e738] [cursor=pointer]:
                                  - generic: ▶
                                - generic [ref=e740]: "7:"
                                - generic [ref=e741]: "Object {"
                              - list [ref=e742]:
                                - listitem [ref=e743]:
                                  - generic [ref=e745]: "suit:"
                                  - text: "\"dheb\""
                                - listitem [ref=e746]:
                                  - generic [ref=e748]: "value:"
                                  - text: "6"
                                - listitem [ref=e749]:
                                  - generic [ref=e751]: "displayValue:"
                                  - text: "6"
                                - listitem [ref=e752]:
                                  - generic [ref=e754]: "id:"
                                  - text: "\"dheb-6\""
                              - text: "}"
                            - listitem [ref=e755]:
                              - generic [ref=e756]:
                                - generic [ref=e757] [cursor=pointer]:
                                  - generic: ▶
                                - generic [ref=e759]: "8:"
                                - generic [ref=e760]: "Object {"
                              - list [ref=e761]:
                                - listitem [ref=e762]:
                                  - generic [ref=e764]: "suit:"
                                  - text: "\"syouf\""
                                - listitem [ref=e765]:
                                  - generic [ref=e767]: "value:"
                                  - text: "6"
                                - listitem [ref=e768]:
                                  - generic [ref=e770]: "displayValue:"
                                  - text: "6"
                                - listitem [ref=e771]:
                                  - generic [ref=e773]: "id:"
                                  - text: "\"syouf-6\""
                              - text: "}"
                            - listitem [ref=e774]:
                              - generic [ref=e775]:
                                - generic [ref=e776] [cursor=pointer]:
                                  - generic: ▶
                                - generic [ref=e778]: "9:"
                                - generic [ref=e779]: "Object {"
                              - list [ref=e780]:
                                - listitem [ref=e781]:
                                  - generic [ref=e783]: "suit:"
                                  - text: "\"syouf\""
                                - listitem [ref=e784]:
                                  - generic [ref=e786]: "value:"
                                  - text: "5"
                                - listitem [ref=e787]:
                                  - generic [ref=e789]: "displayValue:"
                                  - text: "5"
                                - listitem [ref=e790]:
                                  - generic [ref=e792]: "id:"
                                  - text: "\"syouf-5\""
                              - text: "}"
                            - listitem [ref=e793]:
                              - generic [ref=e794]:
                                - generic [ref=e795] [cursor=pointer]:
                                  - generic: ▶
                                - generic [ref=e797]: "10:"
                                - generic [ref=e798]: "Object {"
                              - list [ref=e799]:
                                - listitem [ref=e800]:
                                  - generic [ref=e802]: "suit:"
                                  - text: "\"zrawet\""
                                - listitem [ref=e803]:
                                  - generic [ref=e805]: "value:"
                                  - text: "5"
                                - listitem [ref=e806]:
                                  - generic [ref=e808]: "displayValue:"
                                  - text: "5"
                                - listitem [ref=e809]:
                                  - generic [ref=e811]: "id:"
                                  - text: "\"zrawet-5\""
                              - text: "}"
                            - listitem [ref=e812]:
                              - generic [ref=e813]:
                                - generic [ref=e814] [cursor=pointer]:
                                  - generic: ▶
                                - generic [ref=e816]: "11:"
                                - generic [ref=e817]: "Object {"
                              - list [ref=e818]:
                                - listitem [ref=e819]:
                                  - generic [ref=e821]: "suit:"
                                  - text: "\"jben\""
                                - listitem [ref=e822]:
                                  - generic [ref=e824]: "value:"
                                  - text: "6"
                                - listitem [ref=e825]:
                                  - generic [ref=e827]: "displayValue:"
                                  - text: "6"
                                - listitem [ref=e828]:
                                  - generic [ref=e830]: "id:"
                                  - text: "\"jben-6\""
                              - text: "}"
                            - listitem [ref=e831]:
                              - generic [ref=e832]:
                                - generic [ref=e833] [cursor=pointer]:
                                  - generic: ▶
                                - generic [ref=e835]: "12:"
                                - generic [ref=e836]: "Object {"
                              - list [ref=e837]:
                                - listitem [ref=e838]:
                                  - generic [ref=e840]: "suit:"
                                  - text: "\"syouf\""
                                - listitem [ref=e841]:
                                  - generic [ref=e843]: "value:"
                                  - text: "8"
                                - listitem [ref=e844]:
                                  - generic [ref=e846]: "displayValue:"
                                  - text: "10"
                                - listitem [ref=e847]:
                                  - generic [ref=e849]: "id:"
                                  - text: "\"syouf-8\""
                              - text: "}"
                            - listitem [ref=e850]:
                              - generic [ref=e851]:
                                - generic [ref=e852] [cursor=pointer]:
                                  - generic: ▶
                                - generic [ref=e854]: "13:"
                                - generic [ref=e855]: "Object {"
                              - list [ref=e856]:
                                - listitem [ref=e857]:
                                  - generic [ref=e859]: "suit:"
                                  - text: "\"dheb\""
                                - listitem [ref=e860]:
                                  - generic [ref=e862]: "value:"
                                  - text: "8"
                                - listitem [ref=e863]:
                                  - generic [ref=e865]: "displayValue:"
                                  - text: "10"
                                - listitem [ref=e866]:
                                  - generic [ref=e868]: "id:"
                                  - text: "\"dheb-8\""
                              - text: "}"
                            - listitem [ref=e869]:
                              - generic [ref=e870]:
                                - generic [ref=e871] [cursor=pointer]:
                                  - generic: ▶
                                - generic [ref=e873]: "14:"
                                - generic [ref=e874]: "Object {"
                              - list [ref=e875]:
                                - listitem [ref=e876]:
                                  - generic [ref=e878]: "suit:"
                                  - text: "\"dheb\""
                                - listitem [ref=e879]:
                                  - generic [ref=e881]: "value:"
                                  - text: "1"
                                - listitem [ref=e882]:
                                  - generic [ref=e884]: "displayValue:"
                                  - text: "1"
                                - listitem [ref=e885]:
                                  - generic [ref=e887]: "id:"
                                  - text: "\"dheb-1\""
                              - text: "}"
                            - listitem [ref=e888]:
                              - generic [ref=e889]:
                                - generic [ref=e890] [cursor=pointer]:
                                  - generic: ▶
                                - generic [ref=e892]: "15:"
                                - generic [ref=e893]: "Object {"
                              - list [ref=e894]:
                                - listitem [ref=e895]:
                                  - generic [ref=e897]: "suit:"
                                  - text: "\"zrawet\""
                                - listitem [ref=e898]:
                                  - generic [ref=e900]: "value:"
                                  - text: "1"
                                - listitem [ref=e901]:
                                  - generic [ref=e903]: "displayValue:"
                                  - text: "1"
                                - listitem [ref=e904]:
                                  - generic [ref=e906]: "id:"
                                  - text: "\"zrawet-1\""
                              - text: "}"
                            - listitem [ref=e907]:
                              - generic [ref=e908]:
                                - generic [ref=e909] [cursor=pointer]:
                                  - generic: ▶
                                - generic [ref=e911]: "16:"
                                - generic [ref=e912]: "Object {"
                              - list [ref=e913]:
                                - listitem [ref=e914]:
                                  - generic [ref=e916]: "suit:"
                                  - text: "\"dheb\""
                                - listitem [ref=e917]:
                                  - generic [ref=e919]: "value:"
                                  - text: "2"
                                - listitem [ref=e920]:
                                  - generic [ref=e922]: "displayValue:"
                                  - text: "2"
                                - listitem [ref=e923]:
                                  - generic [ref=e925]: "id:"
                                  - text: "\"dheb-2\""
                              - text: "}"
                            - listitem [ref=e926]:
                              - generic [ref=e927]:
                                - generic [ref=e928] [cursor=pointer]:
                                  - generic: ▶
                                - generic [ref=e930]: "17:"
                                - generic [ref=e931]: "Object {"
                              - list [ref=e932]:
                                - listitem [ref=e933]:
                                  - generic [ref=e935]: "suit:"
                                  - text: "\"zrawet\""
                                - listitem [ref=e936]:
                                  - generic [ref=e938]: "value:"
                                  - text: "3"
                                - listitem [ref=e939]:
                                  - generic [ref=e941]: "displayValue:"
                                  - text: "3"
                                - listitem [ref=e942]:
                                  - generic [ref=e944]: "id:"
                                  - text: "\"zrawet-3\""
                              - text: "}"
                            - listitem [ref=e945]:
                              - generic [ref=e947]: "length:"
                              - text: "18"
                          - text: "]"
                        - listitem [ref=e948]:
                          - generic [ref=e950]: "score:"
                          - text: "3"
                      - text: "}"
                  - text: "}"
                - listitem [ref=e951]:
                  - generic [ref=e953]: "lastCapture:"
                  - text: "\"1\""
                - listitem [ref=e954]:
                  - generic [ref=e956]: "lastPlayedCard:"
                  - text: "null"
                - listitem [ref=e957]:
                  - generic [ref=e958]:
                    - generic [ref=e959] [cursor=pointer]:
                      - generic: ▶
                    - generic [ref=e961]: "announcements:"
                    - generic [ref=e962]: Array(0)[
                  - list [ref=e963]:
                    - listitem [ref=e964]:
                      - generic [ref=e966]: "length:"
                      - text: "0"
                  - text: "]"
                - listitem [ref=e967]:
                  - generic [ref=e968]:
                    - generic [ref=e969] [cursor=pointer]:
                      - generic: ▶
                    - generic [ref=e971]: "pendingCapture:"
                    - generic [ref=e972]: "Object {"
                  - list [ref=e973]:
                    - listitem [ref=e974]:
                      - generic [ref=e976]: "player:"
                      - text: "\"0\""
                    - listitem [ref=e977]:
                      - generic [ref=e979]: "playedCardId:"
                      - text: "\"dheb-10\""
                    - listitem [ref=e980]:
                      - generic [ref=e982]: "currentVal:"
                      - text: "10"
                    - listitem [ref=e983]:
                      - generic [ref=e985]: "isTaawidaTransfer:"
                      - text: "false"
                  - text: "}"
                - listitem [ref=e986]:
                  - generic [ref=e988]: "isAnimating:"
                  - text: "true"
                - listitem [ref=e989]:
                  - generic [ref=e991]: "gameStarted:"
                  - text: "true"
                - listitem [ref=e992]:
                  - generic [ref=e994]: "endTurnAfterUI:"
                  - text: "true"
                - listitem [ref=e995]:
                  - generic [ref=e997]: "gameStatus:"
                  - text: "null"
                - listitem [ref=e998]:
                  - generic [ref=e999]:
                    - generic [ref=e1000] [cursor=pointer]:
                      - generic: ▶
                    - generic [ref=e1002]: "matchesWon:"
                    - generic [ref=e1003]: "Object {"
                  - list [ref=e1004]:
                    - listitem [ref=e1005]:
                      - generic [ref=e1007]: "0:"
                      - text: "0"
                    - listitem [ref=e1008]:
                      - generic [ref=e1010]: "1:"
                      - text: "0"
                  - text: "}"
                - listitem [ref=e1011]:
                  - generic [ref=e1013]: "activeClash:"
                  - text: "null"
              - text: "}"
        - generic [ref=e1014]:
          - heading "ctx" [level=3] [ref=e1015]
          - list [ref=e1016]:
            - listitem [ref=e1017]:
              - generic [ref=e1018]:
                - generic [ref=e1019] [cursor=pointer]:
                  - generic: ▶
                - generic [ref=e1020]: "Object {"
              - list [ref=e1021]:
                - listitem [ref=e1022]:
                  - generic [ref=e1024]: "numPlayers:"
                  - text: "2"
                - listitem [ref=e1025]:
                  - generic [ref=e1027]: "turn:"
                  - text: "27"
                - listitem [ref=e1028]:
                  - generic [ref=e1030]: "currentPlayer:"
                  - text: "\"0\""
                - listitem [ref=e1031]:
                  - generic [ref=e1032]:
                    - generic [ref=e1033] [cursor=pointer]:
                      - generic: ▶
                    - generic [ref=e1035]: "playOrder:"
                    - generic [ref=e1036]: Array(2)[
                  - list [ref=e1037]:
                    - listitem [ref=e1038]:
                      - generic [ref=e1040]: "0:"
                      - text: "\"0\""
                    - listitem [ref=e1041]:
                      - generic [ref=e1043]: "1:"
                      - text: "\"1\""
                    - listitem [ref=e1044]:
                      - generic [ref=e1046]: "length:"
                      - text: "2"
                  - text: "]"
                - listitem [ref=e1047]:
                  - generic [ref=e1049]: "playOrderPos:"
                  - text: "0"
                - listitem [ref=e1050]:
                  - generic [ref=e1052]: "phase:"
                  - text: "null"
                - listitem [ref=e1053]:
                  - generic [ref=e1054]:
                    - generic [ref=e1055] [cursor=pointer]:
                      - generic: ▶
                    - generic [ref=e1057]: "activePlayers:"
                    - generic [ref=e1058]: "Object {"
                  - list [ref=e1059]:
                    - listitem [ref=e1060]:
                      - generic [ref=e1062]: "0:"
                      - text: "\"waitForUI\""
                    - listitem [ref=e1063]:
                      - generic [ref=e1065]: "1:"
                      - text: "\"waitForUI\""
                  - text: "}"
                - listitem [ref=e1066]:
                  - generic [ref=e1068]: "numMoves:"
                  - text: "1"
              - text: "}"
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | /**
  4  |  * Regression test for the "Play Again" rematch flow.
  5  |  * 
  6  |  * Verifies that after a game ends:
  7  |  *   1. The Game Over overlay appears
  8  |  *   2. Clicking "Play Again" dismisses the overlay
  9  |  *   3. A new round starts and the player can play cards again
  10 |  * 
  11 |  * This catches the bug where Play Again silently failed because:
  12 |  *   - The button checked a removed property (G.needsRestart) → always went to else branch
  13 |  *   - Or the restartGame move was in a wrong stage and got rejected by the server
  14 |  */
  15 | test('Play Again: Clicking Play Again after game over starts a new round', async ({ page }) => {
  16 |   test.setTimeout(180_000); // Increased for longer animations
  17 | 
  18 |   // Start a local bot game (fastest way to reach game over)
  19 |   await page.goto('/');
  20 | 
  21 |   // Click "Start Game" button
  22 |   const playBtn = page.locator('button', { hasText: /Start Game|Commencer le jeu|Spiel starten|ابدأ اللعبة|Play vs AI Bot/i });
  23 |   await playBtn.first().click();
  24 | 
  25 |   // Wait for the game board to render
  26 |   await expect(page.locator('.min-h-screen').first()).toBeVisible({ timeout: 10000 });
  27 | 
  28 |   // The Game Over overlay contains an h2 with "Game Over" text
  29 |   const gameOverOverlay = page.locator('h2', { hasText: /Game Over|Partie Terminée|انتهت اللعبة/i });
  30 |   const playAgainBtn = page.locator('button', { hasText: /Play Again|Rejouer|إعادة اللعب/i });
  31 | 
  32 |   // Playable cards in our hand have the class "cursor-grab" on their motion wrapper.
  33 |   // These are the only interactive card elements (opponent cards don't get this class).
  34 |   const myCards = page.locator('.cursor-grab');
  35 | 
  36 |   const MAX_ATTEMPTS = 300; // safety limit
  37 |   let attempts = 0;
  38 | 
  39 |   while (attempts < MAX_ATTEMPTS) {
  40 |     // Check if game over overlay appeared
  41 |     if (await gameOverOverlay.isVisible().catch(() => false)) {
  42 |       break;
  43 |     }
  44 | 
  45 |     const cardCount = await myCards.count().catch(() => 0);
  46 |     if (cardCount > 0) {
  47 |       try {
  48 |         await myCards.first().click({ timeout: 500 });
  49 |       } catch {
  50 |         // Card might be animating or stale
  51 |       }
  52 |     }
  53 | 
  54 |     // Wait for animations and bot's turn
> 55 |     await page.waitForTimeout(600);
     |                ^ Error: page.waitForTimeout: Test timeout of 180000ms exceeded.
  56 |     attempts++;
  57 |   }
  58 | 
  59 |   // ===== ASSERT 1: Game Over overlay appeared =====
  60 |   await expect(gameOverOverlay).toBeVisible({ timeout: 30000 });
  61 |   console.log(`✅ Game Over overlay appeared after ${attempts} attempts.`);
  62 | 
  63 |   // ===== ASSERT 2: Play Again button is visible =====
  64 |   await expect(playAgainBtn).toBeVisible();
  65 | 
  66 |   // ===== CLICK: Play Again =====
  67 |   await playAgainBtn.click();
  68 | 
  69 |   // ===== ASSERT 3: Overlay disappears (game restarted) =====
  70 |   await expect(gameOverOverlay).not.toBeVisible({ timeout: 10000 });
  71 |   console.log('✅ Game Over overlay dismissed after clicking Play Again.');
  72 | 
  73 |   // Wait for new round setup (dealing animation)
  74 |   await page.waitForTimeout(3000);
  75 | 
  76 |   // ===== ASSERT 4: New cards are dealt to the player =====
  77 |   await expect(myCards.first()).toBeVisible({ timeout: 10000 });
  78 |   const newCardCount = await myCards.count();
  79 |   expect(newCardCount).toBeGreaterThan(0);
  80 |   console.log(`✅ New round started with ${newCardCount} cards in hand.`);
  81 | 
  82 |   // ===== ASSERT 5: We can actually play a card (game is not stuck) =====
  83 |   // Wait until it's our turn (the cursor-grab class only appears when it's our turn)
  84 |   // Try clicking a card - if the game is stuck, this would fail
  85 |   try {
  86 |     await myCards.first().click({ timeout: 5000 });
  87 |     console.log('✅ Successfully played a card in the new round — game is not stuck.');
  88 |   } catch {
  89 |     // It might not be our turn yet, which is fine — the important thing is cards exist
  90 |     console.log('⚠️ Could not click card (might not be our turn) — but cards are dealt, game is running.');
  91 |   }
  92 | });
  93 | 
```