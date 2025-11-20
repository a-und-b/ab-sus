# Datenmodell & SQL Schema

Dieses Dokument beschreibt die TypeScript-Interfaces und das korrespondierende SQL-Schema für die Supabase-Datenbank.

## TypeScript Interfaces (`types.ts`)

Die Anwendung basiert auf drei Haupt-Entitäten:

1.  **Participant (Teilnehmer):** Speichert Status, Profildaten, Essen und Logistik-Infos.
2.  **EventConfig:** Globale Einstellungen (Titel, Zeit, Ort, Limits).
3.  **EmailTemplate:** Vorlagen für den Versand.

## Supabase SQL Schema

Kopiere dieses Skript in den **SQL Editor** von Supabase, um die Datenbankstruktur anzulegen.

```sql
-- 1. Tabelle für Teilnehmer
create table participants (
  id text primary key,              -- Wir nutzen die generierten IDs (z.B. 'a3f7k9m2') als Key
  name text not null,
  email text not null,
  status text default 'pending',    -- 'attending', 'declined', 'maybe', 'pending'

  -- Profildaten
  avatar_style text,
  avatar_seed text,
  avatar_image text,                -- Base64 String (Vorsicht: kann groß werden, evtl. Storage nutzen wenn >1MB)

  -- Begleitung
  plus_one text,
  plus_one_allergies text,

  -- Buffet & Logistik
  food jsonb,                       -- Speichert das FoodItem Objekt: {name, category, isVegan...}
  show_name_in_buffet boolean default true,
  allergies text,
  is_secret_santa boolean default false,
  wants_invoice boolean default false,
  contribution text,                -- Aktiver Beitrag (Gedicht etc.)
  notes text,

  updated_at timestamptz default now()
);

-- 2. Tabelle für Konfiguration (Single Row Pattern)
create table event_config (
  id int primary key generated always as identity,
  title text,
  subtitle text,
  date_text text,                   -- '18. Dezember 2025'
  time_text text,                   -- '17:00 Uhr'
  location text,
  max_guests int,
  allow_plus_one boolean,
  secret_santa_limit int,
  dietary_options text[],           -- Array von Strings
  cost text,
  hosts text,
  program text,
  contact_email text,
  rsvp_deadline date
);

-- Initiale Konfiguration einfügen (Dummy Werte, werden im Admin überschrieben)
insert into event_config (title, max_guests) values ('Selbst & Selig', 30);

-- 3. Tabelle für E-Mail Vorlagen
create table email_templates (
  id text primary key,
  name text,
  subject text,
  body text,
  trigger_type text,
  description text
);

-- 4. Tabelle für E-Mail Logs
create table email_logs (
  id uuid primary key default gen_random_uuid(),
  template_name text,
  recipient_count int,
  recipients_preview text,
  status text,
  created_at timestamptz default now()
);

-- SICHERHEIT (Row Level Security)
-- Für dieses Event-Szenario halten wir es simpel:
-- Da die URLs "geheim" sind (Security by Obscurity für Gäste), erlauben wir Zugriff via API Key.
-- In einer strengeren App müsste hier echte Auth hin.

alter table participants enable row level security;
alter table event_config enable row level security;
alter table email_templates enable row level security;
alter table email_logs enable row level security;

-- Public Access Policy (Vorsicht: Erlaubt jedem mit API Key Lesen/Schreiben)
-- Für den Start ausreichend, später auf Authenticated Users einschränken.
create policy "Enable all access for public" on participants for all using (true) with check (true);
create policy "Enable all access for public" on event_config for all using (true) with check (true);
create policy "Enable all access for public" on email_templates for all using (true) with check (true);
create policy "Enable all access for public" on email_logs for all using (true) with check (true);
```

## Mapping Hinweise

Beim Umbau des `dataService.ts` ist auf folgendes Mapping zu achten:

- TypeScript `camelCase` -> SQL `snake_case` (z.B. `avatarStyle` -> `avatar_style`).
- Das `food` Objekt in TypeScript kann in Supabase direkt in eine `jsonb` Spalte gespeichert werden.
- `lastUpdated` in TypeScript entspricht `updated_at` in SQL.
