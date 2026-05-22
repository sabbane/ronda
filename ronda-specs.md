# Ronda Kartenspiel - Spezifikationsdokument

Dieses Dokument beschreibt die technische Umsetzung des marokkanischen Kartenspiels **Ronda** in der **Antigravity** Umgebung.

## 1. Projektbeschreibung
Ronda ist ein klassisches marokkanisches Kartenspiel für 2 Spieler (oder Teams). Ziel ist es, durch das Stechen von Karten und Sondersituationen die meisten Punkte zu erzielen. Die App bietet ein flüssiges Gameplay mit React, boardgame.io und Animationen.
Offizielle Website: [https://www.playronda.ma](https://www.playronda.ma)

## 2. Technologie-Stack
*   **Frontend:** React.js (Vite)
*   **State-Management:** [boardgame.io](https://boardgame.io/)
*   **Styling:** Tailwind CSS (für Layout & Design)
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
*   **Derba (Zug):** Eine Karte stechen, die der Gegner gerade erst abgelegt hat (+1 Punkt/Karte). (Früher: Bounti)
*   **Taawida (Counter-Attack):** Wird nach einer Derba angesagt, wenn der Schlagabtausch auf demselben Rang fortgesetzt wird:
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
    *   **Mobile-First Layout:** Nutzung von `100dvh` und dynamischen Paddings für optimale Darstellung auf mobilen Browsern.
    *   **Visuelles Feedback:** Ankündigungen nutzen farbcodierte Varianten (Success/Danger). Aktive Handkarten des Spielers am Zug werden mit einem sanften Glow-Effekt hervorgehoben.
    *   **Animations- & Z-Index-Schutz:** Angepasste Hierarchien (Z-Index) und Timing-Schutz in der Deal-Phase verhindern Kartenüberlappungen und Anzeigefehler.
    *   **Rules Dialog:** Eine integrierte "How to Play" Anleitung erklärt die Regeln und Sondersituationen.
    *   **Navigation:** Ein "Back to Menu" Button ermöglicht die Rückkehr zum Hauptmenü während des Spiels.

## 4. Architektur-Features
### 4.1 Internationalisierung (i18n)
Die App unterstützt mehrere Sprachen über einen `LanguageContext`:
*   **Sprachen:** Englisch (EN), Französisch (FR), Deutsch (DE), Arabisch (AR).
*   **RTL-Support:** Automatische Anpassung der Textrichtung (`dir="rtl"`) für Arabisch.
*   **Spielerspezifische Ankündigungen:** Dynamische Unterscheidung zwischen Spieler ("You") und Gegner ("Opponent") in allen Event-Popups und Sprachen.

### 4.2 Monetarisierung & Werbung
Das Spiel setzt auf eine dedizierte `AdService`-Schicht (`src/services/AdService.js`) als zentrale Abstraktionsebene für Werbung:
*   **AdService:** Erkennt beim Start automatisch die aktuelle Plattform (`web`, `pwa` / Google Play Store, `playgama`) und wählt das passende SDK.
*   **Interstitial Ads (Google H5 Games Ads):** Nach Spielende (Game Over) werden Video-Anzeigen über das `adBreak`-API von Google ausgeliefert, bevor der Spieler "Play Again" oder "Main Menu" ausführen kann. Beide Buttons warten auf das `onComplete`-Callback des SDKs.
*   **PlayGama SDK:** Falls das Spiel auf PlayGama läuft, wird automatisch das PlayGama-eigene Ad-SDK angesteuert.
*   **Ausfallsicherheit:** Ein 45-Sekunden-Timeout und ein Offline-Check (`navigator.onLine`) stellen sicher, dass das Spiel auch bei aktivem AdBlocker oder ohne Internetverbindung reibungslos weiterläuft.
*   **Lade-Overlay:** Während die Werbung lädt, zeigt der Game Over Screen einen Lade-Indikator an, um die Buttons zu sperren und einen sauberen UX-Flow zu gewährleisten.
*   **Banner-Werbung:** Zusätzliche Werbeflächen über die dedizierte `AdSlot`-Komponente.

### 4.3 Bot- & Spiel-Logik
*   **RandomBot:** Agiert nur für Spieler 1, wartet auf UI-Animationen und priorisiert Captures.
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
*   **Test-Infrastruktur:** Dedizierte Server-Endpoints (`/test/reset`, `/test/match-id`) ermöglichen eine präzise Koordination von Test-Szenarien.

### 4.5 Community & Support
*   **Donate Button:** Integration einer `DonateButton`-Komponente ("Buy us a Mint Tea").
*   **Social Media:** Direkter Link zur Facebook-Community für Support und Feedback.

### 4.6 Testing, Qualitätssicherung & Performance
*   **Unit-Tests:** Prüfung der Kern-Spiellogik (Sequenzen, Scoring, Clash) in `game.test.js`.
*   **E2E-Tests:** End-to-End-Tests des Multiplayers mit **Playwright**. 
*   **Performance-Benchmarks:** Das Tool `latency_benchmark.spec.js` misst die Antwortzeiten des Live-Servers.
*   **Asset-Preloading:** Karten-Assets werden vorab geladen (Preload im HTML und verstecktes Rendern in den Komponenten), um Latenzen oder Flackern bei der Kartenausgabe zu vermeiden.

### 4.7 Audiosystem (Procedural Sound & Music Synthesis)
Um das Spielgefühl immersiv zu gestalten und Sondersituationen dramatisch zu untermalen, wurde ein hochauflösendes Audiosystem (`src/services/SoundService.js`) implementiert:
*   **Procedural Web Audio API:** Anstelle von großen statischen Audio-Dateien (MP3/WAV) werden alle Soundeffekte und die Hintergrundmusik in Echtzeit über Oszillatoren, Filter, Delay-Lines und Gain-Nodes vollsynthetisiert. Dadurch beträgt der Speicher-Overhead **0 KB** und die 100%ige Offline-Fähigkeit sowie die Kompatibilität mit dem Single-File-Build für PlayGama bleibt perfekt gewahrt.
*   **Generative Hintergrundmusik (BGM):**
    *   *Ambient-Akkord-Pad:* Ein tiefer, weicher Pad-Synthesizer (leicht detunierte Dreieckswellen mit einem 320Hz Tiefpassfilter), der alle 8 Sekunden sanft zwischen Akkorden einer andalusischen Kadenz in A-Moll crossfaded (`Am -> Fmaj7 -> Cmaj -> Gmaj`), um ein nahtloses marokkanisches Klangbett zu legen.
    *   *Generativer Pluck-Synthesizer:* Ein auf ~110 BPM synchronisierter Sequenzer, der auf den Beats mit einer Wahrscheinlichkeit von 28% zarte Zupftöne einstreut. Die Tonhöhen werden aus der andanlusisch-pentatonischen A-Moll-Skala gelost und harmonisch auf den aktiven Pad-Akkord abgestimmt.
    *   *Saiten-Simulation & Echo:* Ein dynamischer Tiefpassfilter-Sweep (1,8kHz auf 380Hz in 0,15s) simuliert das physikalische Abklingverhalten einer gezupften Oud-Saite. Die Töne fließen durch eine Feedback-Delay-Line mit punktierter Achtelverzögerung (0,41s) und erzeugen eine immersive, raumfüllende Hall-Atmosphäre.
*   **10 Soundeffekte:**
    1.  *UI Click:* Kurzer, sauberer Frequenzsweep für Interaktionen.
    2.  *Card Deal:* Ein Bandpass-gefiltertes Rauschen mit exponentiellem Abklingen, um das Reiben von Papier nachzuahmen.
    3.  *Card Place:* Eine Kombination aus tiefem Sinus-Thud (Holzklopfen) und kurzem Hochpass-Rauschen (Karten-Snap).
    4.  *Card Sweep:* Drei aufeinanderfolgende, überlappende Rausch-Bursts und ein abschließendes Platziergeräusch, um das Zusammenziehen von Karten zu vertonen.
    5.  *Missa-Ankündigung:* Aufsteigendes C-Dur-Arpeggio mit weichem Dreiecks-Oszillator.
    6.  *Derba-Ankündigung:* Absteigender, druckvoller Arcade-Stinger.
    7.  *Ronda/Tringa-Ankündigung:* Aufsteigende pentatonische Tonleiter mit glockenspielartigem Charakter.
    8.  *Clash-Ankündigung:* Metallischer Klirr-Sound (Kombination unharmonischer hoher Frequenzen) gefolgt von einem Bandschwert-Swoosh.
    9.  *Victory-Melodie:* Triumphaler, fröhlicher C-Dur-Akkordverlauf mit warmen Dreiecks- und Sinustönen.
    10. *Defeat-Melodie:* Schwermütige, absteigende Moll-Tonfolge.
*   **Reaktive Sound-Trigger:** In `src/components/Board.jsx` überwachen declarative `useEffect`-Hooks den Spielstatus (Handkartenlänge, Tischkartenanzahl, eroberte Karten, Popups, GameOver-Status) und lösen die Sounds lippensynchron aus. Alle Event-Sounds passen sich tonal an den Spielausgang an (Dur/hell bei Erfolg, Moll/tief bei gegnerischem Punkterfolg).
*   **Mute-Option & Persistenz:** Ein Sound-Toggle (Speaker-Icon) ist sowohl im Hauptmenü (neben den Flaggen) als auch direkt auf dem Spielfeld (gegenüber der Restkartenanzeige am unteren Rand) platziert. Der Zustand (Muted/Unmuted) wird persistiert in `localStorage` (`ronda_muted`) und steuert das An- und Ausschalten von Soundeffekten und der Hintergrundmusik in Echtzeit.
*   **Autoplay-Policy & Gesten-Trigger:** Die Initialisierung der Audio-Pipeline erfolgt absolut regelkonform. Neben dem lazy Trigger durch Schaltflächen-Klicks lauscht ein globaler Einmal-Event-Listener (`click`, `pointerdown`, `keydown`) im `SoundProvider` auf die allererste Interaktion des Benutzers auf dem gesamten Bildschirm, um die BGM augenblicklich und geräuschlos zu starten.

## 5. Projektstruktur
```text
/src
  /assets           # UI-Assets (Hintergrundbilder, Icons & Kartenbilder für Inlining)
    /cards          # Bilddateien der spanischen Karten
  /components
    Board.jsx       # Haupt-Spielfeld & Event-Handling (inkl. Rematch-UI & Ad-Trigger)
    Card.jsx        # Karten-Komponente (mit Glow & Preload-Logik aus src/assets/cards)
    AdSlot.jsx      # Banner-Werbe-Integration
    DonateButton.jsx # Spenden-Funktion
    Rules.jsx       # Spielanleitung (Modal)
  /contexts
    LanguageContext.jsx # i18n & Sprachsteuerung
  /services
    AdService.js    # Plattform-Adapter für Google H5 Ads & PlayGama SDK
  /game
    game.js         # Kern-Spiellogik (inkl. Rematch-Logik & State-Reset)
    bot.js          # KI-Verhalten
    game.test.js    # Unit-Tests für Spielregeln
  App.jsx           # Einstiegspunkt, Lobby-Logik, URL-Sync & Online-Client
/tests
  multiplayer.spec.js # Playwright E2E-Tests
  latency_benchmark.spec.js # Performance Benchmarks
server.js           # Backend-Server für Online-Multiplayer
Dockerfile.frontend # Docker-Konfiguration für das Frontend
Dockerfile.backend  # Docker-Konfiguration für das Backend
/public
  /assets           # Statische Assets für Web/PWA-Builds (Fallback)
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
*   Monetarisi### 6.4 PWA-Konfiguration (gemeinsame Basis)
*   **Manifest:** Vollständige `manifest.json` für App-Branding und Startbildschirme.
*   **Service Worker:** `vite-plugin-pwa` mit `autoUpdate`-Strategie für Offline-Support und nahtlose Updates.
*   **Versionsmanagement:** Die App-Version (aktuell `0.8.8`) wird automatisch aus der `package.json` in den Build-Prozess injiziert.
 
## 7. Aktueller Status
*   [x] Core Game Logic (Stechen, Sequenzen, Missa, Derba)
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
*   [x] Zero-Weight Web Audio API Audiosystem (10 taktile Soundeffekte, Mute-Toggle, LocalStorage Persistenz)
*   [ ] Google Play Store: Bubblewrap TWA-Packaging & Store-Listing
*   [ ] Erweiterte KI-Heuristik