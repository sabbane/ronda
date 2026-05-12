# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: complete_multiplayer_game.spec.js >> Functional Test: Complete Multiplayer Game >> Two human players can complete a full game
- Location: tests\complete_multiplayer_game.spec.js:6:3

# Error details

```
Test timeout of 240000ms exceeded.
```

# Page snapshot

```yaml
- generic [ref=e6]:
  - button "Back to Menu" [ref=e8]:
    - img [ref=e9]
    - generic [ref=e11]: Back to Menu
  - generic [ref=e12]:
    - generic [ref=e13]:
      - generic [ref=e14]: Opponent
      - generic [ref=e30]:
        - generic [ref=e31]: "Cards:"
        - generic [ref=e32]: "14"
    - generic [ref=e33]:
      - img "Card Back" [ref=e37]
      - img "Card Back" [ref=e41]
  - generic [ref=e42]:
    - img "jben 7" [ref=e45] [cursor=pointer]
    - img "syouf 3" [ref=e48] [cursor=pointer]
    - img "zrawet 12" [ref=e51] [cursor=pointer]
    - img "syouf 6" [ref=e54] [cursor=pointer]
    - img "zrawet 5" [ref=e57] [cursor=pointer]
    - generic [ref=e58]:
      - img "syouf 7" [ref=e60] [cursor=pointer]
      - generic [ref=e61]: Played
  - generic [ref=e62]:
    - generic [ref=e63]:
      - generic [ref=e65]: You (Your Turn)
      - generic [ref=e71]:
        - generic [ref=e72]: "Cards:"
        - generic [ref=e73]: "0"
    - img "jben 2" [ref=e77] [cursor=pointer]
  - insertion [ref=e80]
  - generic [ref=e82]:
    - generic [ref=e84]: ✨
    - generic [ref=e85]: "Cards remaining: 18"
```