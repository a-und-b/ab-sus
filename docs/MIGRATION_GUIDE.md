# Migrations-Leitfaden: LocalStorage zu Supabase

Dieser Leitfaden beschreibt die Schritte, um die App "Production Ready" zu machen.

## 1. Supabase Setup
1.  Erstelle ein Projekt auf [supabase.com](https://supabase.com).
2.  Gehe zum **SQL Editor** und führe das Skript aus `docs/DATA_MODEL.md` aus.
3.  Gehe zu **Project Settings > API** und kopiere:
    *   Project URL
    *   `anon` public key

## 2. Projekt Vorbereitung
1.  Installiere den Supabase Client:
    ```bash
    npm install @supabase/supabase-js
    ```
2.  Erstelle eine `.env` Datei (falls noch nicht vorhanden) und ergänze:
    ```
    VITE_SUPABASE_URL=deine_url
    VITE_SUPABASE_ANON_KEY=dein_key
    API_KEY=dein_gemini_key
    ```

## 3. Code Refactoring (`src/services/dataService.ts`)

Der `DataService` muss von synchronen Methoden auf **asynchrone Promises** umgestellt werden.

**Beispiel alt (synchron):**
```typescript
getAll(): Participant[] {
  return [...this.participants];
}
```

**Beispiel neu (asynchron mit Supabase):**
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);

async getAll(): Promise<Participant[]> {
  const { data, error } = await supabase.from('participants').select('*');
  if (error) throw error;
  // Mapping von snake_case zu camelCase nötig!
  return data.map(row => ({
    id: row.id,
    name: row.name,
    avatarStyle: row.avatar_style,
    // ... restliche Felder
  }));
}
```

### Wichtige Anpassungen in Components
Da `getAll` nun ein Promise zurückgibt, müssen alle `useEffect` Hooks in `AdminPage.tsx` und `GuestPage.tsx` angepasst werden:

**Alt:**
```typescript
const data = dataService.getAll();
setParticipants(data);
```

**Neu:**
```typescript
dataService.getAll().then(data => setParticipants(data));
// oder mit async/await in useEffect
```

## 4. E-Mail Versand (Resend Integration)

Für den echten E-Mail-Versand sollte nicht das Frontend direkt SMTP nutzen.
Empfehlung: **Supabase Edge Function**.

1.  Erstelle eine Edge Function `send-email`.
2.  Nutze die Resend API Node.js Library darin.
3.  Rufe diese Function im `dataService.sendEmailBatch` auf:
    ```typescript
    await supabase.functions.invoke('send-email', {
      body: { to: p.email, subject, html: body }
    });
    ```

## 5. Deployment
1.  Pushe den Code auf GitHub.
2.  Verbinde das Repo mit **Vercel**.
3.  Trage alle Environment Variables (`VITE_SUPABASE_...`) in den Vercel Project Settings ein.
4.  Deploy! 🚀
