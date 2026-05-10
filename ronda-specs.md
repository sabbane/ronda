# Ronda Kartenspiel - Spezifikationsdokument

Dieses Dokument beschreibt die technische Umsetzung des marokkanischen Kartenspiels **Ronda** in der **Antigravity** Umgebung.

## 1. Projektbeschreibung
Ronda ist ein klassisches marokkanisches Kartenspiel für 2 Spieler (oder Teams). Ziel ist es, durch das Stechen von Karten und Sondersituationen die meisten Punkte zu erzielen. Die App bietet ein flüssiges Gameplay mit React, boardgame.io und Animationen.

## 2. Technologie-Stack
*   **Frontend:** React.js (Vite)
*   **State-Management:** [boardgame.io](https://boardgame.io/)
*   **Styling:** Tailwind CSS (für Layout & Design)
*   **Animationen:** Framer Motion (für Kartenbewegungen)
*   **PWA:** vite-plugin-pwa (für Offline-Support und Installation)
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
*   **Derba (Zug):** Eine Karte stechen, die der Gegner gerade erst abgelegt hat (+1 Punkt/Karte). (Früher: Bounti)
*   **Taawida:** Wird nach einer Derba angesagt, wenn der Schlagabtausch auf demselben Rang fortgesetzt wird:
    *   Folgekarte nach Derba (2. Konter): +5 Punkte.
    *   Nächste Folgekarte (3. Konter): +10 Punkte.
*   **As Finish:** Wenn ein Spieler mit einer Karte sticht, die den gleichen Wert wie die Karte hat, die der Gegner gerade abgelegt hat (Derba), und dies die letzte Karte des Spielers ist, erhält er zusätzliche Punkte (+5).
*   **King Finish:** Wenn der Spieler, der die letzte Karte im Spiel spielt, mit einer 12 (König) als allerletzte Karte sticht, erhält er +5 Punkte.
*   **Ronda & Tringa (Hand):**
    *   **Ronda:** Zwei gleiche Karten auf der Hand. (+1 Punkt bei Einzelansage)
    *   **Tringa:** Drei gleiche Karten auf der Hand. (+5 Punkte bei Einzelansage)
    *   **Popup-Ankündigung:** Haben beide Spieler eine Ronda oder Tringa, erscheint zu Beginn der Runde ein Popup, das diese Situation (Clash) für beide ankündigt.
    *   **Clash-Auflösung (am Ende der Runde):**
        *   **Ronda vs. Ronda:** Der Spieler mit der höheren Ronda gewinnt 2 Karten (bzw. Punkte).
        *   **Ronda vs. Tringa:** Der Spieler mit Tringa gewinnt 6 Karten.
        *   **Tringa vs. Tringa:** Der Spieler mit der höheren Tringa gewinnt 10 Karten.
*   **Endabrechnung:** Jeder Spieler zählt seine gewonnenen Karten. Punkte aus Sondersituationen (oder gewonnene Extrakarten) werden addiert.

### 3.4 Karten-Assets & Design
Die App verwendet reale Bilddateien für die spanischen Spielkarten:
*   **Speicherort:** `public/cards/`
*   **Format:** PNG (transparent)
*   **Dateinamen-Konvention:** `{Value}-{Suit}.png` (z.B. `01-oros.png`)
*   **Suit-Mapping:** `coins` -> `oros`, `cups` -> `copas`, `swords` -> `espadas`, `clubs` -> `bastos`.
*   **UI-Features:**
    *   **Captured Stack:** Gewonnene Karten werden visuell als Stapel beim Spieler/Gegner angezeigt.
    *   **Capture Highlight:** Die gespielte Karte wird während eines Captures hervorgehoben (`ring-4 ring-yellow-400`).
    *   **Hintergrund:** Ein dezentes Spiel-Hintergrundbild (`game_background.png`).
    *   **Navigation:** Ein "Back to Menu" Button ermöglicht die Rückkehr zum Hauptmenü während des Spiels.

## 4. Architektur-Features
### 4.1 Internationalisierung (i18n)
Die App unterstützt mehrere Sprachen über einen `LanguageContext`:
*   **Sprachen:** Englisch (EN), Französisch (FR), Arabisch (AR).
*   **RTL-Support:** Automatische Anpassung der Textrichtung (`dir="rtl"`) für Arabisch.

### 4.2 Monetarisierung
Integration von Werbeflächen über eine dedizierte `AdSlot`-Komponente zur Umsatzgenerierung.

### 4.3 Bot- & Spiel-Logik
*   **RandomBot:** Agiert nur für Spieler 1, wartet auf UI-Animationen und priorisiert Captures.
*   **Stages:** Nutzung von `waitForUI` zur Synchronisation zwischen Game-Engine und Frontend-Animationen.

### 4.4 Online-Multiplayer & Rematches
Die App unterstützt Echtzeit-Multiplayer über einen dedizierten Server:
*   **Backend:** Node.js Server (`server.js`) basierend auf `boardgame.io/server`.
*   **Lobby-Management:** Nutzung des `LobbyClient` zur Prüfung des Raum-Status vor dem Beitritt.
    *   **Slot-Validierung:** Das System prüft, ob ein Slot bereits durch einen aktiven oder verbundenen Spieler (`isConnected`) belegt ist.
*   **Rematches:** Das Spiel nutzt einen manuellen `G.gameStatus` anstatt `endIf`. Dies ermöglicht es Spielern, in derselben Match-ID beliebig viele Runden hintereinander zu spielen ("Play Again").
*   **Match-Tracking:** Die Gesamtzahl der gewonnenen Spiele pro Session wird in `G.matchesWon` getrackt und im Game-Over-Overlay angezeigt.
*   **Thematische Raumnamen:** Automatische Generierung von marokkanischen Raumnamen (z.B. `Marrakech-42`).
*   **URL-Synchronisation:** Die Match-ID wird mit der URL synchronisiert (`?room=...`), was den direkten Beitritt über einen Link ermöglicht.
*   **Test-Infrastruktur:** Dedizierte Server-Endpoints (`/test/reset`, `/test/match-id`) ermöglichen eine präzise Koordination von Test-Szenarien über verschiedene Browser-Kontexte hinweg.

### 4.5 Community & Support
*   **Donate Button:** Integration einer `DonateButton`-Komponente zur Unterstützung der Entwicklung.

### 4.6 Testing & Qualitätssicherung
*   **Unit-Tests:** Prüfung der Kern-Spiellogik (Sequenzen, Scoring, Clash) in `game.test.js`.
*   **E2E-Tests:** End-to-End-Tests des Multiplayers mit **Playwright**. 
    *   Simulation von zwei Browser-Kontexten (Host & Joiner).
    *   Spezifische Tests für Verbindungstabilität und Test-Modus-Koordination.

## 5. Projektstruktur
```text
/src
  /components
    Board.jsx       # Haupt-Spielfeld & Event-Handling (inkl. Rematch-UI)
    Card.jsx        # Karten-Komponente
    AdSlot.jsx      # Werbe-Integration
    DonateButton.jsx # Spenden-Funktion
  /contexts
    LanguageContext.jsx # i18n & Sprachsteuerung
  /game
    game.js         # Kern-Spiellogik (inkl. Rematch-Logik & State-Reset)
    bot.js          # KI-Verhalten
    game.test.js    # Unit-Tests für Spielregeln
  App.jsx           # Einstiegspunkt, Lobby-Logik, URL-Sync & Online-Client
/tests
  multiplayer.spec.js # Playwright E2E-Tests
server.js           # Backend-Server für Online-Multiplayer
/public
  /cards            # Bilddateien der Karten
  /assets           # UI-Assets (Hintergrund, etc.)
```

## 6. PWA Anforderungen
Um die App als Progressive Web App (PWA) nutzbar zu machen, werden folgende Features implementiert:
*   **Manifest:** Eine `manifest.json` für App-Name, Icons und Branding-Farben.
*   **Service Worker:** Automatisches Caching der Assets für Offline-Verfügbarkeit.
*   **Installierbarkeit:** Unterstützung für die Installation auf dem Homescreen (Mobile & Desktop).
*   **Update Management:** Automatisches Hintergrund-Update (Strategie: "autoUpdate").

## 7. Aktueller Status
*   [x] Core Game Logic (Stechen, Sequenzen, Missa, Derba)
*   [x] Ronda/Tringa Clash-Logik & Popup-Ankündigungen
*   [x] Rematch-System (beliebig viele Spiele in einem Raum)
*   [x] Match-Wins Tracking (Gesamtscore der Session)
*   [x] Tisch leeren am Spielende (Karten an letzten Stecher)
*   [x] Internationalisierung (EN, FR, AR) & RTL-Support
*   [x] Integration realer Karten-Assets & Capture-Animationen
*   [x] Online-Multiplayer (Host/Join System mit Slot-Validierung)
*   [x] URL-basierter Beitritt (`?room=...`)
*   [x] Match-ID Sharing-Funktionalität (Navigator + Clipboard)
*   [x] Test-Infrastruktur (Server-Endpoints für koordinierte Tests)
*   [x] Unit-Tests für die Spielregeln
*   [x] E2E-Multiplayer-Tests (`Playwright`)
*   [x] Werbe-Integration (`AdSlot`) & Donate-Button
*   [x] Bot-Integration (Animation-aware)
*   [x] "As Finish" & "Final Fail" Regeln implementiert
*   [ ] PWA-Integration (Manifest & Service Worker)
*   [ ] Erweiterte KI-Heuristik
*   [ ] Verfeinerte KI-Logik