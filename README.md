# Selbst & Selig - Weihnachtsfeier App 🎄

Eine Web-Anwendung zur Verwaltung der Weihnachtsfeier für Solo-Selbstständige ("Selbst & Selig"). Die App ermöglicht einladungsbasiertes Gästemanagement, Buffet-Organisation (Potluck-Prinzip) und KI-gestützte Features.

## 🚀 Status

**Production Ready!** The app is now fully migrated and deployed.

- **Backend:** Supabase (PostgreSQL database, Auth, Edge Functions)
- **Hosting:** Vercel
- **Deployment:** https://ab-m8iijasl2-a-und-bs-projects.vercel.app
- **Database:** Real-time sync across all users
- **Authentication:** Supabase Auth (email/password for admin)
- **AI Features:** Secured via Edge Functions (Gemini API)
- **Email:** Ready for Resend integration via Edge Function

## 🛠 Tech Stack

- **Frontend:** React 19, TypeScript, Vite
- **Backend:** Supabase (PostgreSQL, Auth, Edge Functions)
- **Styling:** Tailwind CSS (Custom Theme: Xmas Green/Red/Gold)
- **Icons:** Lucide React
- **Charts:** Recharts
- **AI:** Google Gemini API (secured via Edge Function)
- **Email:** Resend (via Edge Function)
- **Maps:** Google Maps Embed
- **Hosting:** Vercel
- **Quality:** ESLint, Prettier, Vitest

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
    See `ENV_SETUP.md` for complete guide. Quick start:
    ```bash
    VITE_SUPABASE_URL=https://ohsvzndgmefzvxyxubyq.supabase.co
    VITE_SUPABASE_ANON_KEY=your_key_here
    ```

## 🎨 Features

### Für Gäste

- **Personalisierte Landing Page:** Begrüßung mit Namen via URL-Hash (`#/p/:id`).
- **Onboarding Wizard:** Schritt-für-Schritt Abfrage von Status, Begleitung und Buffet-Beitrag.
- **Buffet-Planer:** Übersicht aller Mitbringsel, um Dopplungen zu vermeiden.
- **Avatar-Generator:** KI-generierte Knet-Optik Avatare oder DiceBear-Integration.
- **Info-Bereich:** Programm, Ort (Karte), Kalender-Export (.ics).

### Für Organisatoren (Admin)

- **Dashboard:** Wichtige KPIs (Zusagen, Offen, Wichteln) und Diagramme.
- **Gästeliste:** Sortierbare Tabelle, CSV Import/Export, Detail-Ansicht.
- **Event Setup:** Konfiguration aller Texte, Zeiten, Limits und Features (z.B. +1 erlauben).
- **E-Mail Center:** Vorlagen-Editor mit Platzhaltern und Simulations-Konsole für den Versand.

## 📂 Projektstruktur

- `components/`: Wiederverwendbare UI-Komponenten (Layout, Avatar, Chatbot, etc.).
- `pages/`: Hauptansichten (`GuestPage`, `AdminPage`).
- `services/`: Backend-Integration (`dataService.ts`, `supabase.ts`)
- `supabase/functions/`: Edge Functions für AI & Email
- `types.ts`: TypeScript Definitionen
- `supabase-types.ts`: Auto-generated from database schema

## 📚 Dokumentation

- **[Deployment Summary](DEPLOYMENT.md)** - Complete deployment checklist & URLs
- **[Environment Setup](ENV_SETUP.md)** - How to configure environment variables
- [Datenmodell & SQL Schema](docs/DATA_MODEL.md)
- [Architektur](docs/ARCHITECTURE.md)
- [Migrations-Leitfaden (Supabase)](docs/MIGRATION_GUIDE.md)

## 🚦 Development Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
npm run format   # Format code with Prettier
npm run test     # Run tests with Vitest
```
