# Selbst & Selig - Weihnachtsfeier App 🎄

Eine Web-Anwendung zur Verwaltung der Weihnachtsfeier für Solo-Selbstständige ("Selbst & Selig"). Die App ermöglicht einladungsbasiertes Gästemanagement, Buffet-Organisation (Potluck-Prinzip) und KI-gestützte Features.

## 🚀 Status Quo
Aktuell befindet sich die App im **Prototyp-Status**.
*   **Datenhaltung:** `localStorage` (Browser-basiert). Änderungen sind nur lokal sichtbar.
*   **Authentifizierung:** Simuliert (Admin-Passwort hardcoded).
*   **Hosting:** Client-Side Only.

**Nächster Schritt:** Migration zu Supabase (Backend) & Vercel (Hosting) für den Produktivbetrieb.

## 🛠 Tech Stack

*   **Frontend:** React 18, TypeScript, Vite
*   **Styling:** Tailwind CSS (Custom Theme: Xmas Green/Red/Gold)
*   **Icons:** Lucide React
*   **Charts:** Recharts
*   **AI:** Google Gemini API (`@google/genai`) für Chatbot & Avatar-Generierung
*   **Maps:** Google Maps Embed

## 🏃‍♂️ Quick Start

1.  **Abhängigkeiten installieren:**
    ```bash
    npm install
    ```

2.  **Entwicklungsserver starten:**
    ```bash
    npm run dev
    ```

3.  **Environment Variables:**
    Erstelle eine `.env` Datei im Root-Verzeichnis für die KI-Features:
    ```
    API_KEY=dein_google_gemini_api_key
    ```

## 🎨 Features

### Für Gäste
*   **Personalisierte Landing Page:** Begrüßung mit Namen via URL-Hash (`#/p/:id`).
*   **Onboarding Wizard:** Schritt-für-Schritt Abfrage von Status, Begleitung und Buffet-Beitrag.
*   **Buffet-Planer:** Übersicht aller Mitbringsel, um Dopplungen zu vermeiden.
*   **Avatar-Generator:** KI-generierte Knet-Optik Avatare oder DiceBear-Integration.
*   **Info-Bereich:** Programm, Ort (Karte), Kalender-Export (.ics).

### Für Organisatoren (Admin)
*   **Dashboard:** Wichtige KPIs (Zusagen, Offen, Wichteln) und Diagramme.
*   **Gästeliste:** Sortierbare Tabelle, CSV Import/Export, Detail-Ansicht.
*   **Event Setup:** Konfiguration aller Texte, Zeiten, Limits und Features (z.B. +1 erlauben).
*   **E-Mail Center:** Vorlagen-Editor mit Platzhaltern und Simulations-Konsole für den Versand.

## 📂 Projektstruktur

*   `src/components`: Wiederverwendbare UI-Komponenten (Layout, Avatar, Chatbot, etc.).
*   `src/pages`: Hauptansichten (`GuestPage`, `AdminPage`).
*   `src/services`: `dataService.ts` (Aktuell: LocalStorage Wrapper -> Muss für Supabase ersetzt werden).
*   `src/types.ts`: TypeScript Definitionen und Demo-Daten.

## 📚 Dokumentation

Detaillierte Infos für die Weiterentwicklung findest du im `docs/` Ordner:

*   [Datenmodell & SQL Schema](docs/DATA_MODEL.md)
*   [Architektur](docs/ARCHITECTURE.md)
*   [Migrations-Leitfaden (Supabase)](docs/MIGRATION_GUIDE.md)
