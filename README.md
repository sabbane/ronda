# 🃏 Ronda Championship

Ronda Championship is a modern, high-performance, and visually stunning web implementation of **Ronda**—the traditional, classical card game from Morocco. 

Built with **React**, **Vite**, **boardgame.io**, **Framer Motion**, and a customized **Web Audio Engine**, this project provides a premium, responsive gaming experience across mobile and desktop devices. It is fully packaged as an offline-capable **Progressive Web App (PWA)**, optimized for seamless installation and range-requests on both iOS (Safari/WebKit) and Android systems.

---

## ✨ Key Features

* **🤖 Smart Tactical Singleplayer Bot**: 
  * Powered by a rule-based tactical decision-making matrix (`bot.js`).
  * Calculates optimal card drop strategies, plans high-yielding captures, baits human players with safe drops, and avoids end-of-game penalty traps (like *As Finish* or *Final Fail*).
  * Plays at realistic human speeds for a natural pairing experience.

* **🌐 Realtime Socket.io Online Multiplayer**:
  * Realtime matchmaking client supporting both 2-Player duels and 4-Player cooperative team matches.
  * Public rooms directory browser and unlisted private room sharing via dynamic URL parameters.
  * Interactive seating grids that allow players to switch seats dynamically in the waiting lobby.

* **🎵 Authentic Moroccan Audio Engine**:
  * Employs resource cloning and element preloading inside `SoundService` for **absolute zero-latency sound effects**.
  * Supports rich polyphonic overlaps (rapid staggered card dealing, sweeps, and click chimes) without micro-stutters or Garbage Collection spikes.
  * Native exclusion of audio binaries from PWA manifests to guarantee 100% functional audio range-requests on Safari.

* **🎨 Sleek Zellige Moroccan Aesthetics**:
  * Immersive dark-mode visual interface decorated with traditional Moroccan geometric zellige patterns.
  * Moroccan-themed physical 3D button presets (Terracotta, Mediterranean Blue, Emerald Green, Slate, and Gold).
  * Procedurally generated victory confetti showers composed of vectors depicting authentic cultural symbols (Khamsa, crescent moons, and Moroccan lanterns).

* **🏗️ Decoupled, Modular Codebase**:
  * Shrunk and optimized core coordinates (e.g., `Board.jsx` and `App.jsx` are under 380 lines of code!).
  * Side-effects, UI event tickers, sound playbacks, and sequential timers are cleanly decoupled into custom React hooks (`useBoardEvents.js`).

---

## 📜 Ronda Game Rules Summary

Ronda is played with a 40-card Spanish deck (4 suits: *dheb* (coins), *jben* (cups), *syouf* (swords), and *zrawet* (clubs), valued 1-7 and 10-12).

1. **Dealing**: Each player receives 3 cards, and 4 cards are placed face-up on the table.
2. **Capturing**: A player captures cards by playing a card of the same value. They can also sequentially sweep subsequent cards (e.g. playing a 5 captures a 5 on the table, plus any 6, 7, 10, 11, 12 present).
3. **Darba (+1 pt)**: Play a card of the same value that the previous opponent *just* played.
4. **Taawida (+5 or +10 pts)**: Play a matching card immediately after an opponent hits a Darba on your turn (counters are recursive!).
5. **Missa (+1 pt)**: Clearing all cards from the table.
6. **King Finish / As Finish (+5 pts)**: Play the 12 (King) or 1 (Ace) as the very last card of the round to secure final victory points.

---

## 🚀 Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed (v18+ recommended).

### Installation

Clone the repository and install the dependencies:

```bash
git clone https://github.com/yourusername/ronda-championship.git
cd ronda-championship
npm install
```

### Development Scripts

* **Start the Client (Vite Dev Server)**:
  ```bash
  npm run dev
  ```
  Runs the frontend client locally on `http://localhost:5173`.

* **Start the Matchmaking Backend (Server)**:
  ```bash
  npm run start:backend
  ```
  Launches the boardgame.io game lobby coordinator and Socket.io server on `http://localhost:8000`.

* **Run Client + Server in Test Mode (Rigged Rig)**:
  ```bash
  # In Terminal 1 (Start Server in Rigged mode)
  npm run start:backend:test

  # In Terminal 2 (Start Client in Rigged mode)
  npm run dev:test
  ```
  Navigating to `/test/p1` and `/test/p2` allows local developers to simulate complex clash-draws and double-darba counters with deterministic pre-dealt test hands.

---

## 🧪 Testing & Verification

* **Unit Testing**:
  The core game engines, state mutations, announcements parser, and clash resolvers are covered by 23 robust test scenarios.
  ```bash
  npm run test
  ```

* **Production Compilations**:
  Vite compiled bundles, PWAs, asset maps, and Service Workers can be built with:
  ```bash
  npm run build
  ```

---

## 🛠️ Technology Stack

* **Frontend Framework**: [React 19](https://react.dev/) + [Vite](https://vite.dev/)
* **Game Engine Core**: [boardgame.io](https://boardgame.io/) (multiplayer synchronization, local simulated turn engines, state machine)
* **Styling & Design**: [TailwindCSS 4](https://tailwindcss.com/) + CSS variables
* **Animations**: [Framer Motion](https://www.framer.com/motion/)
* **Icons**: [Lucide React](https://lucide.dev/)
* **Testing Library**: [Vitest](https://vitest.dev/)
