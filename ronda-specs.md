# Ronda Kartenspiel - Spezifikationsdokument

Dieses Dokument beschreibt die technische Umsetzung des marokkanischen Kartenspiels **Ronda** in der **Antigravity** Umgebung.

## 1. Projektbeschreibung
Ronda ist ein klassisches marokkanisches Kartenspiel für 2 Spieler (oder Teams). Ziel ist es, durch das Stechen von Karten und Sondersituationen die meisten Punkte zu erzielen. Die App bietet ein flüssiges Gameplay mit React, boardgame.io und Animationen.
Offizielle Website: [https://www.playronda.ma](https://www.playronda.ma)

## 2. Technologie-Stack
*   **Frontend:** React.js (Vite)
*   **State-Management:** [boardgame.io](https://boardgame.io/)
*   **Styling:** Tailwind CSS v4 (für Layout & Design)
*   **Animationen:** Framer Motion (für Kartenbewegungen)
*   **PWA:** vite-plugin-pwa (für Offline-Support und Installation)
*   **Single-File Bundling:** vite-plugin-singlefile (für die PlayGama-Plattform-Inlining)
*   **Icons:** Lucide React

## 3. Spielregeln & Implementierung
### 3.1 Karten & Deck
*   **Deck:** 40 spanische Karten.
*   **Werte:** 1 bis 10 (intern), wobei 8 als 10, 9 als 11 und 10 als 12 angezeigt werden.
*   **Mapping:**
    *   Karten 1-7: Anzeige 1-7
    *   Karte 8: Anzeige 10 (Sota)
    *   Karte 9: Anzeige 11 (Caballo)
    *   Karte 10: Anzeige 12 (Rey)

### 3.2 Gameplay-Loop
1.  **Start:** 4 Karten offen auf den Tisch, 3 Karten auf die Hand jedes Spielers.
2.  **Automatisches Geben:** Wenn beide Spieler keine Handkarten mehr haben und das Deck nicht leer ist, werden zu Beginn des neuen Zugs (`onBegin`) automatisch 3 neue Karten pro Spieler ausgegeben.
3.  **Züge:** Ein Spieler spielt eine Karte aus:
    *   **Stechen:** Gleicher Wert auf dem Tisch sticht die Karte. Der Prozess ist zweistufig (`playCard` -> Animation -> `processCapture`), um flüssige UI-Bewegungen zu ermöglichen.
    *   **Sequenzen:** Nach einem Stich können folgende aufsteigende Karten ebenfalls aufgenommen werden (z.B. 4 sticht 4, dann 5, 6...).
    *   **Ablegen:** Keine passende Karte auf dem Tisch -> Karte wird auf den Tisch gelegt.
4.  **Rundenende (Tisch leeren):** Wenn das Deck und alle Handkarten leer sind, werden alle verbleibenden Karten auf dem Tisch dem Spieler zugesprochen, der zuletzt einen Stich gemacht hat.

### 3.3 Scoring & Sondersituationen
Die Punkte werden während des Spiels und am Ende berechnet. Das Scoring ist additiv (Punkte werden dem Spieler gutgeschrieben):
*   **Missa (Tisch):** Den Tisch komplett leer räumen (+1 Punkt/Karte). (Früher: Messa)
*   **Darba (Zug):** Eine Karte stechen, die der Gegner gerade erst abgelegt hat (+1 Punkt/Karte). (Früher: Bounti)
*   **Taawida (Counter-Attack):** Wird nach einer Darba angesagt, wenn der Schlagabtausch auf demselben Rang fortgesetzt wird:
    *   **Konter (Taawida):** 3. Karte des gleichen Ranges (+5 Punkte & Transfer der vorherigen Karten).
    *   **Ultimativer Konter:** 4. Karte des gleichen Ranges (+10 Punkte & Transfer der vorherigen Karten).
*   **Final Fail:** Wenn die allerletzte Karte des Spiels ausgespielt wird, ohne einen Stich zu machen, erhält der Gegner +5 Punkte.
*   **As Finish:** Wenn die allerletzte Karte des Spiels ein Ass (Wert 1) ist und einen Stich macht, erhält der Gegner +5 Punkte.
*   **King Finish:** Wenn die allerletzte Karte des Spiels ein König (Wert 12) ist und einen Stich macht, erhält der Spieler +5 Punkte.
*   **Ronda & Tringa (Hand):**
    *   **Ronda:** Zwei gleiche Karten auf der Hand. (+1 Punkt bei Einzelansage)
    *   **Tringa:** Drei gleiche Karten auf der Hand. (+5 Punkte bei Einzelansage)
    *   **Popup-Ankündigung:** Haben beide Spieler eine Ronda oder Tringa, erscheint zu Beginn der Runde ein Popup, das diese Situation (Clash) für beide ankündigt.
    *   **Clash-Auflösung:**
        *   **Ronda vs. Ronda:** Der Spieler mit der höheren Ronda gewinnt 2 Karten (bzw. Punkte).
        *   **Ronda vs. Tringa:** Der Spieler mit Tringa gewinnt sofort 6 Karten.
        *   **Tringa vs. Tringa:** Der Spieler mit der höheren Tringa gewinnt 10 Karten.
*   **Endabrechnung:** Jeder Spieler zählt seine gewonnenen Karten. Punkte aus Sondersituationen (oder gewonnene Extrakarten) werden addiert.

### 3.4 Karten-Assets & Design
Die App verwendet reale Bilddateien für die spanischen Spielkarten sowie hochauflösende Hintergründe:
*   **Speicherort:** `src/assets/cards/` (Karten) und `src/assets/` (Hintergründe). Die Assets wurden in den `src`-Ordner verschoben, damit sie über das ES-Modulsystem importiert und für Offline-Builds (z. B. PlayGama) vollautomatisch als Base64-Strings in das HTML-Dokument inlined werden können.
*   **Format:** PNG (transparent)
*   **Dateinamen-Konvention:** `{Value}-{Suit}.png` (z.B. `01-dheb.png`)
*   **Suits:** Die Suits sind sowohl intern im Code als auch in den Dateinamen marokkanisch benannt: `dheb` (Gold), `jben` (Becher), `syouf` (Schwerter), `zrawet` (Keulen).
*   **UI-Features & Optimierungen:**
    *   **Responsive Viewport Fitting:** CSS-Optimierungen für Kartenskalierungen bei geringer Viewport-Höhe auf Mobilgeräten. Reduziertes Tisch-Padding auf 0.5rem stellt sicher, dass mindestens 3 Karten nebeneinander auf dem Tisch liegen, ohne in eine neue Reihe umzubrechen.
    *   **4-Spieler-Layout-Optimierung:** Die Karten des oberen Partners wurden auf 3.5rem x 5.25rem verkleinert und die maximale Breite der Partnertabelle begrenzt, um ausreichend Platz für die Seiten-Spieler-Sitze auf Mobilgeräten freizuhalten.
    *   **Statisches Slot-Layout für Tischkarten:** Um das unerwünschte horizontale Verrutschen ("Sliding") von Tischkarten bei der Entnahme/Stechen benachbarter Karten zu verhindern, wurde ein stabiles CSS-Grid-Spielfeld in `GameTable.jsx` eingeführt. Jeder Tischkarte wird beim Austeilen (`setup.js`) oder Ausspielen (`moves.js`) ein fixer `slot`-Index (nächster freier Slot ab 0) zugewiesen. Leere Positionen werden mit unsichtbaren Platzhaltern (`.game-table-slot-placeholder`) gefüllt, wodurch besetzte Karten ihre absolute Position im Grid stets beibehalten.
    *   **Presented-By-Branding:** Der Splashscreen (`Splashscreen.jsx`) präsentiert ein vergrößertes Vektor-Logo (`logo.svg`, Höhe von 20 auf 40 erhöht) für eine wirkungsvollere Markenpräsenz.

## 4. Architektur-Features
### 4.1 Internationalisierung (i18n)
Die App unterstützt mehrere Sprachen über einen `LanguageContext`:
*   **Sprachen:** Englisch (EN), Französisch (FR), Arabisch (AR). (Das System wurde modularisiert; Übersetzungen befinden sich nun ausgelagert in separaten Dateien unter `src/contexts/translations/` für bessere Wartbarkeit).
*   **RTL-Support:** Automatische Anpassung der Textrichtung (`dir="rtl"`) für Arabisch.
*   **Spielerspezifische Ankündigungen:** Dynamische Unterscheidung zwischen Spieler ("You") und Gegner ("Opponent") in allen Event-Popups und Sprachen.

### 4.2 Monetarisierung & Werbung
Das Spiel setzt auf eine dedizierte `AdService`-Schicht (`src/services/AdService.js`) als zentrale Abstraktionsebene für Werbung:
*   **AdService:** Erkennt beim Start automatisch die aktuelle Plattform (`web`, `pwa` / Google Play Store, `playgama`) und wählt das passende SDK.
*   **Interstitial Ads (Google H5 Games Ads):** Nach Spielende (Game Over) werden Video-Anzeigen über das `adBreak`-API von Google ausgeliefert, bevor der Spieler "Play Again" oder "Main Menu" ausführen kann. Beide Buttons warten auf das `onComplete`-Callback des SDKs.
*   **PlayGama SDK:** Falls das Spiel auf PlayGama läuft, wird automatisch das PlayGama-eigene Ad-SDK angesteuert.
*   **Audio-Integration & Full Game Pause (Event-Driven):** Wenn eine Werbung startet (über Google H5 oder PlayGama), löst der `AdService` ein globales Custom Event (`ronda-ad-started`) aus. Dies führt zu:
    *   **UI Lock:** Die React-Spielfläche fängt das Event auf und blendet ein Full-Screen Glassmorphism-Overlay ein, welches sämtliche Benutzerinteraktionen blockiert. Das komplette Spiel ist somit pausiert.
    *   **Audio Silence:** Der `SoundService` fängt das Event ebenfalls ab, pausiert die Hintergrundmusik und blockiert über einen internen `adPlaying`-State die Ausführung jeglicher Soundeffekte.
    *   Sobald die Werbung beendet ist (`ronda-ad-completed`), wird das Overlay entfernt und die Audiowiedergabe nahtlos fortgesetzt (unter Respektierung des vorherigen Mute-Status). Die Architektur ist dadurch vollständig entkoppelt.
*   **Ausfallsicherheit:** Ein 45-Sekunden-Timeout und ein Offline-Check (`navigator.onLine`) stellen sicher, dass das Spiel auch bei aktivem AdBlocker oder ohne Internetverbindung reibungslos weiterläuft.
*   **Lade-Overlay:** Während die Werbung lädt, zeigt der Game Over Screen einen Lade-Indikator an, um die Buttons zu sperren und einen sauberen UX-Flow zu gewährleisten.
*   **Banner-Werbung:** Zusätzliche Werbeflächen über die dedizierte `AdSlot`-Komponente.

### 4.3 Spiel- & Bot-Logik
*   **Modularisierung der Spiellogik:** Um die Wartbarkeit und Testbarkeit zu verbessern, wurde die Kern-Spiellogik aus dem monolithischen `game.js` in eigenständige Submodule unter `/src/game/` aufgeteilt:
    *   `deck.js`: Initialisierung des 40 spanischen Kartendecks sowie marokkanisches Suit-Mapping.
    *   `capture.js`: Logik für Stechen, Sequenzberechnungen und Transferregeln.
    *   `rules.js`: Auswertung von Sondersituationen (Missa, Ronda, Tringa, Clash, King/As Finish, Endabrechnung).
    *   `moves.js`: boardgame.io Aktionen (`playCard`, `processCapture`, `counterDarba`, Lobby-Verwaltung, Rematch, etc.).
    *   `setup.js`: Initialer State-Entwurf.
    *   `game.js`: Haupt-Einstiegspunkt für boardgame.io, der die Submodule orchestriert.
*   **RandomBot:** Agiert nur für Spieler 1, wartet auf UI-Animationen und priorisiert Captures.
    *   **Sicherheitsprüfungen im Move-Enumerator:** Der Bot-Enumerator (`enumerateMoves` in `src/game/bot.js`) enthält nun explizite Guards (`player === gameCtx.currentPlayer` und `!gameG.gameStatus`), um Züge außerhalb des eigenen Zugs oder nach Spielende zuverlässig abzufangen.
*   **Stages & Timing:** Nutzung von `waitForUI` und angepassten Bot-Verzögerungen (`botDelay`) zur exakten Synchronisation zwischen Game-Engine, Popups und Frontend-Animationen.

### 4.4 Online-Multiplayer & Infrastruktur
Die App unterstützt Echtzeit-Multiplayer über einen dedizierten Server:
*   **Backend:** Node.js Server (`server.js`) basierend auf `boardgame.io/server`.
*   **CORS & Sandbox-Kompatibilität:** Im Backend wurde das Koa-CORS-Middleware überschrieben, um `null` als Origin zu erlauben. Dies ist zwingend erforderlich, da PlayGama in einem stark sandboxed Iframe ohne `allow-same-origin` ausgeführt wird und Anfragen mit `Origin: null` sendet.
*   **URL-Mapping:** Dynamische Auflösung der Backend-URL für lokale und produktive Umgebungen.
*   **Containerisierung:** 
    *   `Dockerfile.frontend`: Multi-Stage Build für das React Frontend.
    *   `Dockerfile.backend`: Node.js Umgebung für den Spielserver.
*   **Lobby-Management:** Nutzung des `LobbyClient` zur Prüfung des Raum-Status vor dem Beitritt.
*   **Rematches:** Das Spiel nutzt einen manuellen `G.gameStatus` anstatt `endIf`. Dies ermöglicht es Spielern, in derselben Match-ID beliebig viele Runden hintereinander zu spielen ("Play Again").
*   **Match-Tracking:** Die Gesamtzahl der gewonnenen Spiele pro Session wird in `G.matchesWon` getrackt.
*   **Lobby-System:** Vor Spielstart sind beide Spieler in einer Lobby-Phase. Dort können sie ihren Namen setzen (`setPlayerName`). Nur der Host kann das Spiel starten (`startGame`). Ein `hostLeft`-Flag sorgt dafür, dass der verbleibende Spieler sauber informiert wird, wenn der Host die Lobby verlässt.
*   **Test-Infrastruktur:** Dedizierte Server-Endpoints (`/test/reset`, `/test/match-id`) ermöglichen eine präzise Koordination von Test-Szenarien.

### 4.5 Community & Support
*   **Donate Button:** Integration einer `DonateButton`-Komponente ("Buy us a Mint Tea").
*   **Social Media:** Direkter Link zur Facebook-Community für Support und Feedback.

### 4.6 Testing, Qualitätssicherung & Performance
*   **Unit-Tests:** Prüfung der Kern-Spiellogik (Sequenzen, Scoring, Clash) in `game.test.js`.
*   **E2E-Tests:** End-to-End-Tests des Multiplayers, des Spiellayouts und der Slot-Stabilität mit **Playwright**.
*   **Layout-Validierung:** Der E2E-Test `table_cards_row_fit.spec.js` prüft auf Mobilgeräten, dass die Karten auf dem Tisch in einer horizontalen Reihe bleiben (Y-Differenz unter 10px).
*   **Anti-Sliding-Verifizierung:** Der Test `table_cards_sliding_wrong_behavior.spec.js` stellt sicher, dass verbleibende Tischkarten nach einem gegnerischen Stich ihre absoluten Koordinaten (X-Wert) im Grid beibehalten und nicht verrutschen.
*   **Layout-Debugging via URL-Parameter:** Zur manuellen Verifizierung von Layouts und Skalierungseffekten unterstützt die Anwendung das URL-Argument `?debug_table=<Anzahl>` (in `Board.jsx` ausgelesen). Damit lässt sich die Anzahl der auf dem Tisch gerenderten Karten zu Testzwecken manipulieren.
*   **Performance-Benchmarks:** Das Tool `latency_benchmark.spec.js` misst die Antwortzeiten des Live-Servers.
*   **Asset-Preloading:** Karten-Assets und das neue Vektor-Logo (`logo.svg`) werden vorab geladen (Preload im HTML und Splashscreen), um Latenzen oder Flackern bei der Kartenausgabe und beim Laden zu vermeiden.

### 4.7 Audiosystem (HTML5 Audio mit echten Sound-Assets)
Um das Spielgefühl immersiv zu gestalten, wurde das Audiosystem auf echte Audio-Assets umgestellt (`src/services/SoundService.js`):
*   **HTML5 Audio (MP3):** Anstelle der früheren prozeduralen Web Audio API Synthese werden alle Sounds jetzt über den nativen `<audio>`-Tag des Browsers mit MP3-Dateien aus `public/assets/sounds/` abgespielt. Dieser Ansatz vereinfacht die Konfiguration und ermöglicht hochwertige, maßgeschneiderte Sound-Designs.
*   **3 BGM-Tracks mit Track-Auswahl:**
    Der Spieler kann über einen Musik-Wechsler-Button direkt neben der Mute-Taste zwischen drei Optionen wechseln. Die aktive Track-Auswahl wird in `localStorage` (`ronda_bgm_track`) persistiert.
    1.  *Track 0: "Casablanca"* — `casablanca.mp3`, loop, 50% Lautstärke.
    2.  *Track 1: "Desert Night"* — `desert_night.mp3`, loop, 65% Lautstärke.
    3.  *Track 2: "No Sound"* — Kein BGM, nur Soundeffekte (für Spieler, die Stille bevorzugen).
*   **10+ Soundeffekte (SFX) als MP3-Dateien:**
    1.  *UI Click:* `click.mp3`
    2.  *Card Deal:* `card_deal.mp3`
    3.  *Card Place:* `card_place.mp3`
    4.  *Card Sweep:* `card_sweep.mp3`
    5.  *Missa:* `missa_success.mp3` / `missa_fail.mp3` (je nach Ausgang)
    6.  *Darba:* `darba_success.mp3` / `darba_fail.mp3`
    7.  *Ultimate Attack (Taawida):* `ultimate_attack.mp3`
    8.  *Ronda/Tringa:* `ronda_tringa.mp3` / `ronda_tringa_fail.mp3`
    9.  *Clash:* `clash.mp3` / `clash_fail.mp3`
    10. *Victory:* `victory.mp3`
    11. *Defeat:* `defeat.mp3`
*   **SFX-Preload-Cache (Performance-Optimierung):** Um Latenzen und Garbage-Collection-Ruckler beim dynamischen Instanziieren von Sounds zu vermeiden, werden alle 15 SFX-Dateien beim App-Start im `sfxCache` über `audio.preload = 'auto'` vorab geladen.
*   **Zero-Latency Node Cloning:** `_playSFX()` nutzt das Klonen der vorgeladenen HTML5-Audionodes (`cached.cloneNode()`). Dadurch können Soundeffekte überlappungsfrei, zeitgleich und ohne nennenswerte Ladeverzögerungen oder HTTP-Requests abgespielt werden.
*   **Robustes Autoplay-Verhalten:** Bei einem fehlerhaften BGM-Start (z.B. aufgrund restriktiver Browser-Richtlinien) wird der interne Status `bgmPlaying = false` zurückgesetzt. Dies ermöglicht einen automatischen BGM-Startversuch bei der nächsten Benutzerinteraktion.
*   **Doppelschlag-Effekt bei Taawida (Darba Double SFX):** Die Methode `playDarba(isSuccess, double)` nimmt nun einen optionalen Parameter entgegen. Wenn `double = true`, wird der Darba-Effekt nach 250ms automatisch ein zweites Mal gestartet. Dies wird über den Context-Helper `playDarbaDouble` z.B. bei einem Taawida Streak von 3 verwendet.
*   **iOS Safari PWA Audio-Fix (Excluding MP3s):** Um den bekannten Bug in iOS Safari zu umgehen, bei dem PWA-precached Mediendateien aufgrund fehlerhafter Range-Requests nicht abgespielt werden, wurden sämtliche `.mp3`-Dateien in `vite.config.js` via Workbox `globIgnores` vom precaching ausgeschlossen.
*   **Reaktive Sound-Trigger:** In `src/components/Board.jsx` überwachen declarative `useEffect`-Hooks den Spielstatus und lösen die passenden SFX aus.
*   **Mute-Option & Persistenz:** Der Mute-Status wird in `localStorage` (`ronda_muted`) gespeichert und steuert sowohl BGM als auch alle SFX.
*   **Autoplay-Policy:** BGM startet nach der ersten Benutzerinteraktion über `initContext()`.
*   **Ad-Pausierung (Event-Driven):** Bei Werbeeinblendung (über `ronda-ad-started`/`ronda-ad-completed` Custom Events) wird die BGM automatisch pausiert und danach fortgesetzt.

### 4.8 React Hooks & UI-Architektur
Die Benutzeroberfläche und die Event-Synchronisierung wurden vollständig entkoppelt. Alle React-Seiteneffekte, UI-Timings und Zustandssynchronisationen wurden aus den Komponenten in modulare Hooks (`/src/hooks/`) ausgelagert:
*   **`useAnnouncements`**: Verwaltet die Warteschlange und Anzeigedauer von Event-Popups (Missa, Clash, Ronda etc.) in Abstimmung mit boardgame.io.
*   **`useBoardSounds`**: Löst reaktiv Soundeffekte aus (Karten ausgeben, stechen, Match-Ende), basierend auf Zustandsänderungen.
*   **`useCaptureAnimation`**: Steuert die visuellen Karten-Fluganimationen.
*   **`useBoardState`**: Kapselt den UI-Zustand des Spieltisches (Kartenauswahl, Interaktions-Locking).
*   **`useLobby`**, **`useLobbyListeners`**, **`useLobbySync`**, **`useMultiplayerCleanup`**: Steuern das Multiplayer-Socket-Handling, Lobby-Synchronisationen und die Speicherbereinigung.
*   **`useScrollAdjustments`**: Verhindert Scroll-Bounces auf iOS-Browsern/PWAs.
*   **`useTestMatchSetup`**: Richtet Testräume für Playwright-E2E-Tests ein.

## 5. Projektstruktur
```text
/src
  /assets           # UI-Assets (Hintergrundbilder, Icons & Kartenbilder für Inlining)
    /cards          # Bilddateien der spanischen Karten
  /components
    Board.jsx       # Haupt-Spielfeld & Event-Handling (inkl. Rematch-UI & Ad-Trigger)
    Card.jsx        # Karten-Komponente (mit Glow & Preload-Logik aus src/assets/cards)
    GameTable.jsx   # Tisch-Komponente (CSS Grid mit stabiler Slot-Belegung und Platzhaltern)
    MainMenu.jsx    # Ausgelagertes Hauptmenü (Navigation, Play-Buttons, Branding)
    Splashscreen.jsx # Ladebildschirm mit vergrößerter Presented-By-Logo-Präsentation
    AdSlot.jsx      # Banner-Werbe-Integration
    DonateButton.jsx # Spenden-Funktion
    Rules.jsx       # Spielanleitung (Modal)
  /contexts
    LanguageContext.jsx # i18n & Sprachsteuerung (dünner Wrapper für modulare Übersetzungen)
    /translations   # Modulare Übersetzungsdateien
      en.js         # Englische Übersetzungen
      fr.js         # Französische Übersetzungen
      ar.js         # Arabische Übersetzungen
  /hooks            # Custom Hooks zur Entkopplung von UI, State & Events
    useAnnouncements.js     # Warteschlange & Steuerung der Popups (Ronda, Missa etc.)
    useBoardSounds.js       # Reaktive Soundeffekte-Auslösung
    useCaptureAnimation.js  # Steuerung visueller Stech-Animationen
    useBoardState.js        # Lokaler UI-Zustand des Spieltisches
    useLobby.js             # Lobby-Operationen und Statusverwaltung
    useLobbyListeners.js    # Multiplayer-Socket-Verbindungen & Listener
    useLobbySync.js         # Lobby-Synchronisation zum Server
    useMultiplayerCleanup.js # Sichere Socket- & Listener-Bereinigung bei Unmount
    useScrollAdjustments.js  # Beseitigung von Scroll-Bounces auf Mobilgeräten
    useTestMatchSetup.js    # Vorbereitung von Match-Räumen für E2E-Testing
  /services
    SoundService.js # Audiosystem mit preloaded SFX-Cache und Track-Steuerung
    AdService.js    # Plattform-Adapter für Google H5 Ads & PlayGama SDK
  /game
    game.js         # Haupt-Einstiegspunkt und Orchestrierung für boardgame.io
    bot.js          # KI-Verhalten
    setup.js        # Initialisierung des Spielzustands (Zuweisung stabiler Slot-Indizes)
    deck.js         # Kartendeck & marokkanische Suit-Mappings
    capture.js      # Logik für Stechen & Sequenzen
    rules.js        # Spielregeln, Scoring & Sondersituationen
    moves.js        # boardgame.io Züge (Slot-Zuweisung für neu gelegte Karten) und Lobby-Aktionen
    game.test.js    # Unit-Tests für Spielregeln
  App.jsx           # Einstiegspunkt, Lobby-Logik, URL-Sync & Online-Client
/tests
  multiplayer.spec.js                  # Playwright E2E-Tests (Kernspiel-Flow)
  complete_multiplayer_game.spec.js    # E2E Vollständige Spielpartie
  complete_bot_game.spec.js            # E2E Bot-Spiel komplett
  lobby_leave.spec.js                  # E2E Lobby-Verlassen-Szenarien
  lobby_navigation.spec.js             # E2E Lobby-Navigation
  public_rooms.spec.js                 # E2E Öffentliche Raumlisten
  multiplayer_4_players.spec.js        # E2E 4-Spieler-Lobby
  multiplayer_play_again.spec.js       # E2E Play Again Flow
  opponent_leave_during_game.spec.js   # E2E Gegner verlässt Spiel
  main_menu_responsiveness.spec.js     # E2E Responsivität des Menüs
  no_scroll.spec.js                    # E2E Scroll-Verhalten
  player_cards_size.spec.js            # E2E Kartengrößen-Test
  singleplayer_start.spec.js           # E2E Einzelspieler-Start
  connection_stability.spec.js         # E2E Verbindungsstabilität
  table_cards_row_fit.spec.js          # E2E Mobile-Tischkarten Zeilenumbruch-Verifizierung
  table_cards_sliding_wrong_behavior.spec.js # E2E Mobile-Tischkarten Layoutstabilität (Anti-Sliding)
  latency_benchmark.spec.js            # Performance Benchmarks
server.js           # Backend-Server für Online-Multiplayer
Dockerfile.frontend # Docker-Konfiguration für das Frontend
Dockerfile.backend  # Docker-Konfiguration für das Backend
/public
  /assets           # Statische Assets für Web/PWA-Builds (z. B. logo.svg)
```

## 6. Plattform-Vertriebsstrategie
Das Spiel wird auf drei Plattformen parallel angeboten, alle aus derselben Codebasis:

### 6.1 Eigene Webseite (`playronda.ma`)
*   Klassischer Vite-Produktions-Build (`npm run build`), gehostet via Railway.app.
*   Monetarisierung über **Google H5 Games Ads** (Interstitials nach Spielende) und Banner-Slots (`AdSlot`).

### 6.2 PlayGama (HTML5-Spieleplattform)
*   **Export-Format:** Export als statische, selbsttragende HTML5-`.zip`-Datei (Inhalt des `dist-playgama/`-Ordners).
*   **Single-File Inlining:** Durch Nutzung von `vite-plugin-singlefile` wird das gesamte Frontend (JS, CSS, SVGs, Spielkarten, Hintergrundbilder) in eine einzige `index.html` gepackt. Dies verhindert Dateipfad-Fehler und CORS-Verstöße innerhalb des PlayGama-Iframes.
*   **Frühe SDK-Initialisierung:** Das PlayGama Bridge SDK wird über ein benutzerdefiniertes Vite-Plugin direkt in den `<head>` injiziert und über ein schlankes, unabhängiges Inline-Skript initialisiert, noch bevor React geladen wird. Dies löst das `game_ready`-Event sofort aus und vermeidet Lade-Timeouts.
*   **Diagnose-UI:** Falls das PlayGama-SDK durch Werbeblocker (AdBlock, uBlock) oder Brave Shields blockiert wird, fängt das Skript dies ab und rendert ein modulares Overlay, welches den Spieler zur temporären Deaktivierung auffordert.
*   **AdService Integration:** Der `AdService` steuert bei PlayGama vollautomatisch das plattformspezifische Werbe-SDK an, um Interstitial-Anzeigen bei Game Over einzublenden.

### 6.3 Google Play Store (Android App)
*   **Trusted Web Activity (TWA)** via **Google Bubblewrap**: Die PWA (`playronda.ma`) wird in eine native Android-App (`.aab`) verpackt.
*   **Automatische Updates:** Deployments auf der Webseite werden sofort in der Play Store App reflektiert.
*   **Monetarisierung:** Werbeanzeigen über Google H5 Games Ads.

### 6.4 PWA-Konfiguration (gemeinsame Basis)
*   **Manifest:** Vollständige `manifest.json` für App-Branding und Startbildschirme.
*   **Service Worker:** `vite-plugin-pwa` mit `autoUpdate`-Strategie für Offline-Support und nahtlose Updates.
*   **Versionsmanagement:** Die App-Version (aktuell `0.9.4`) wird automatisch aus der `package.json` in den Build-Prozess injiziert.
*   **Workbox Precaching & iOS Safari Fix:** Um den iOS Safari Bug beim Abspielen gecachter Audiodateien zu umgehen (Range-Requests auf Service-Worker-Ressourcen schlagen fehl), sind alle `.mp3`-Dateien vom PWA-Precaching über `globIgnores` ausgeschlossen (einschließlich `logo.svg`).
 
## 7. Aktueller Status
*   [x] Core Game Logic (Stechen, Sequenzen, Missa, Darba)
*   [x] Taawida-System (Konter & Ultimativer Konter mit Karten-Transfer)
*   [x] Ronda/Tringa Clash-Logik & Tringa vs. Ronda Sofort-Auflösung
*   [x] "As Finish", "King Finish" & "Final Fail" Regeln implementiert
*   [x] Rematch-System (beliebig viele Spiele in einem Raum)
*   [x] Match-Wins Tracking (Gesamtscore der Session)
*   [x] Tisch leeren am Spielende (Karten an letzten Stecher)
*   [x] Internationalisierung (EN, FR, DE, AR) & RTL-Support mit spielerspezifischen Ankündigungen
*   [x] Mobile-First Optimierung (100dvh, Layout-Shrinking, Glow-Effekte)
*   [x] Performance-Optimierung (Karten-Preloading & Z-Index Schutz)
*   [x] Integration realer Karten-Assets (Marokkanische Suits)
*   [x] Online-Multiplayer (Host/Join System mit Slot-Validierung)
*   [x] URL-basierter Beitritt (`?room=...`)
*   [x] Match-ID Sharing-Funktionalität (Navigator + Clipboard)
*   [x] Test-Infrastruktur (Server-Endpoints für koordinierte Tests)
*   [x] Unit-Tests für die Spielregeln
*   [x] E2E-Multiplayer-Tests & Latency-Benchmarks
*   [x] Werbe-Integration (`AdSlot` Banner & `AdService` Interstitial nach Spielende)
*   [x] Google H5 Games Ads (Interstitials für Web & Google Play Store)
*   [x] AdService Adapter (Plattformerkennung: web / pwa / playgama)
*   [x] Bot-Integration (Animation-aware & Timing-geschützt)
*   [x] Rules-Dialog ("How to Play") integriert
*   [x] Facebook-Community Link integriert
*   [x] PWA-Integration (Manifest & Service Worker)
*   [x] Multi-Platform-Buildsystem (`npm run build:web`, `build:playgama`, `build:all`) mit SDK-Injektion per Vite-Plugin
*   [x] Google AdSense Publisher-ID Automatisierung (über `.env.web` & Vite-Plugin)
*   [x] PlayGama: Vollständige Single-File-Integrierbarkeit (Base64-Karten und -Hintergründe)
*   [x] PlayGama: Früh-Initialisierung des SDKs mit AdBlock-UI in der `index.html`
*   [x] PlayGama: CORS Backend-Unterstützung für WebSocket-Verbindungen von `null`-Origins
*   [x] PlayGama: Spiel als HTML5-ZIP hochgeladen und verifiziert
*   [x] Lobby-System (Spielernamen, gameStarted-Flag, hostLeft-Erkennung)
*   [x] Neue E2E-Tests (Lobby Leave, Lobby Navigation, Public Rooms)
*   [x] Zero-Weight Web Audio API Audiosystem (10 taktile Soundeffekte, Mute-Toggle, LocalStorage Persistenz)
*   [x] Audiosystem auf echte MP3-Assets umgestellt (HTML5 Audio, kein Web Audio API Overhead mehr)
*   [x] Vollständige Ad-Pausierung (Game & Sound) via Event-Driven Architecture (`ronda-ad-started` / `ronda-ad-completed`)
*   [x] 3 BGM-Tracks (Casablanca, Desert Night, No Sound) mit Track-Wechsler-Button & LocalStorage Persistenz
*   [x] 11 SFX-Sound-Assets (MP3) für alle Spielereignisse (inkl. Success/Fail-Varianten)
*   [x] SFX-Preload-Cache zur Beseitigung von Audiolatenzen und UI-Rucklern (Zero-Latency Node Cloning)
*   [x] iOS Safari PWA Audio-Fix (MP3-Ausschluss aus Workbox Precaching)
*   [x] Modulare Internationalisierung mit separaten Übersetzungsdateien (`en.js`, `fr.js`, `ar.js` unter `/translations`)
*   [x] Hauptmenü in eigenständige Komponente ausgelagert (`MainMenu.jsx`)
*   [x] SoundService: Doppelschlag-Effekt bei Taawida (Darba Double SFX nach 250ms Delay)
*   [x] Modularisierung der Spiellogik in Submodule (deck, capture, rules, moves, setup)
*   [x] Entkopplung von UI-Zuständen und Event-Handlern über Custom Hooks (/src/hooks/)
*   [x] Mobile-Layout: Zeilenumbruch-Schutz der Tischkarten (mindestens 3 Karten in einer Reihe auf Handys)
*   [x] Mobile/Desktop Layout: Stabiler Slot-Grid-Tisch für Karten zur Vermeidung von Verschiebungen (Anti-Sliding)
*   [x] Splashscreen: "Presented By" Vektorlogo-Präsentation (logo.svg, vergrößert)
*   [x] Bot-Engine: Sicherheitsüberprüfungen im Move-Enumerator (Turn- & Status-Guards)
*   [x] Layout-Validierung: Automatisierter Playwright-Test für Karten-Einzeiligkeits-Garantie und Slot-Koordinatenstabilität (Anti-Sliding)
*   [x] Erweiterte E2E-Test-Suite (21 Spec-Dateien: Lobby, Multiplayer, Bot, Responsiveness, Layout, Anti-Sliding, etc.)
*   [ ] Google Play Store: Bubblewrap TWA-Packaging & Store-Listing
*   [ ] Erweiterte KI-Heuristik