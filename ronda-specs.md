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
2.  **Runden:** Wenn alle Handkarten gespielt sind, werden 3 neue Karten vom Deck ausgegeben, bis das Deck leer ist.
3.  **Züge:** Ein Spieler spielt eine Karte aus:
    *   **Stechen:** Gleicher Wert auf dem Tisch sticht die Karte.
    *   **Sequenzen:** Nach einem Stich können folgende aufsteigende Karten ebenfalls aufgenommen werden (z.B. 4 sticht 4, dann 5, 6...).
    *   **Ablegen:** Keine passende Karte auf dem Tisch -> Karte wird auf den Tisch gelegt.

### 3.3 Scoring & Sondersituationen
Die Punkte werden während des Spiels und am Ende berechnet:
*   **Missa (Tisch):** Den Tisch komplett leer räumen (+1 Punkt/Karte). (Früher: Messa)
*   **Derba (Zug):** Eine Karte stechen, die der Gegner gerade erst abgelegt hat (+1 Punkt/Karte). (Früher: Bounti)
*   **Ronda & Tringa (Hand):**
    *   **Ronda:** Zwei gleiche Karten auf der Hand.
    *   **Tringa:** Drei gleiche Karten auf der Hand.
    *   **Popup-Ankündigung:** Haben beide Spieler eine Ronda oder Tringa, erscheint zu Beginn der Runde ein Popup, das diese Situation (Clash) für beide ankündigt.
    *   **Clash-Auflösung (am Ende der Runde):**
        *   **Ronda vs. Ronda:** Der Spieler mit der höheren Ronda gewinnt 5 Karten (bzw. Punkte).
        *   **Ronda vs. Tringa:** Der Spieler mit Tringa gewinnt 5 Karten.
        *   **Tringa vs. Tringa:** Der Spieler mit der höheren Tringa gewinnt 5 Karten.
*   **Endabrechnung:** Jeder Spieler zählt seine gewonnenen Karten. Punkte aus Sondersituationen (oder gewonnene Extrakarten) werden addiert.

### 3.4 Karten-Assets & Design
Die App verwendet reale Bilddateien für die spanischen Spielkarten:
*   **Speicherort:** `public/cards/`
*   **Format:** PNG (transparent)
*   **Dateinamen-Konvention:** `{Value}-{Suit}.png` (z.B. `01-oros.png`)
*   **Suit-Mapping:**
    *   `coins` -> `oros`
    *   `cups` -> `copas`
    *   `swords` -> `espadas`
    *   `clubs` -> `bastos`
*   **Besonderheiten:**
    *   Die Karte **01-oros** (1 Lass Flouss) verwendet ein spezielles Design von `vector.ma`.
    *   Die Kartenrückseite ist als `back.png` gespeichert.

## 4. Bot-Architektur
*   **Aktueller Status:** Ein `RandomBot` ist implementiert, der nur für Spieler 1 agiert.
*   **Logik:** Der Bot wartet, bis Animationen und Ankündigungen abgeschlossen sind (`waitForUI` Stage). Er priorisiert das Abschließen von Captures (`processCapture`).
*   **Geplante Logik:** Ein Heuristik-Bot, der Stiche gegenüber einfachem Abwerfen priorisiert und versucht, Sequenzen zu maximieren.

## 5. Projektstruktur
```text
/src
  /game
    game.js        # Kern-Spiellogik (RondaGame Objekt) inkl. Stages & Animation-State
    bot.js         # KI-Enumerate & Bot-Konfiguration
  /components
    Board.jsx      # Haupt-Spielfeld (Handling von Animationen & UI-Events)
    Card.jsx       # Visuelle Darstellung einer Karte
    PlayerHand.jsx # UI für Spieler-Karten
  App.jsx          # Game-Client Integration
/public
  /cards           # Bilddateien der Karten
```

## 6. PWA Anforderungen
Um die App als Progressive Web App (PWA) nutzbar zu machen, werden folgende Features implementiert:
*   **Manifest:** Eine `manifest.json` für App-Name, Icons und Branding-Farben.
*   **Service Worker:** Automatisches Caching der Assets für Offline-Verfügbarkeit.
*   **Installierbarkeit:** Unterstützung für die Installation auf dem Homescreen (Mobile & Desktop).
*   **Branding:** Theme-Farben passend zum Slate/Indigo Design.

## 7. Aktueller Status
*   [x] Core Game Logic (Stechen, Sequenzen, Missa, Derba)
*   [x] Hand-Ankündigungen (Ronda, Tringa)
*   [x] Ronda/Tringa Clash-Logik (Vergleich & 5-Karten-Bonus)
*   [x] Zweistufiger Capture-Prozess für flüssige Animationen
*   [x] Synchronisations-Mechanismus (`waitForUI`) für Bot und UI
*   [x] Integration realer Karten-Assets (Baraja Española)
*   [x] Basis-UI mit Tailwind
*   [x] Bot-Integration (Random, Animation-aware)
*   [ ] PWA-Integration (Manifest & Service Worker)
*   [ ] Erweiterte Animationen (Framer Motion)
*   [ ] Verfeinerte KI-Logik