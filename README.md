# 💍 Leonie & Moritz – Hochzeitswebseite

Schritt-für-Schritt Anleitung zum Deployment auf Vercel.

---

## 🚀 Online stellen in ~5 Minuten

### Schritt 1: GitHub-Konto

Falls noch kein Konto vorhanden: [github.com](https://github.com) → „Sign up" (kostenlos).

### Schritt 2: Diesen Ordner auf GitHub hochladen

1. Auf [github.com/new](https://github.com/new) ein neues Repository anlegen
   - Name: `leonie-moritz-wedding`
   - Sichtbarkeit: **Private** (empfohlen!)
   - „Create repository" klicken
2. Den angezeigten Anweisungen folgen, um die Dateien aus diesem Ordner hochzuladen.
   Alternativ: die GitHub-Desktop-App ([desktop.github.com](https://desktop.github.com)) nutzen – einfach den Ordner reinziehen.

### Schritt 3: Vercel-Konto

1. [vercel.com](https://vercel.com) → „Sign up" → „Continue with GitHub"
2. GitHub-Konto verknüpfen

### Schritt 4: Projekt deployen

1. Im Vercel-Dashboard: „Add New Project"
2. Das GitHub-Repository `leonie-moritz-wedding` auswählen
3. Framework: **Next.js** (wird automatisch erkannt)
4. „Deploy" klicken

→ Nach ~1 Minute ist die Seite live unter z. B. `leonie-moritz-wedding.vercel.app`

### Schritt 5 (optional): Eigene Domain

Eine eigene Domain (z. B. `leonie-und-moritz.de`) kauft ihr bei:
- [Namecheap.com](https://namecheap.com) (~10 €/Jahr)
- [Strato.de](https://strato.de)
- [Hetzner.com](https://hetzner.com/de/domainregistration)

Im Vercel-Dashboard unter „Settings → Domains" könnt ihr die Domain dann eintragen.
Vercel zeigt euch die DNS-Einträge, die ihr beim Domain-Anbieter eintragt.

---

## 🗄️ Anmeldungen dauerhaft speichern (empfohlen)

Aktuell speichert die API die Anmeldungen im Arbeitsspeicher – sie gehen verloren, wenn der Server neu startet. Für echten Betrieb braucht ihr eine Datenbank.

### Einfachste Option: Supabase (kostenlos)

1. Konto anlegen auf [supabase.com](https://supabase.com)
2. Neues Projekt anlegen → Region: `eu-central-1` (Frankfurt)
3. In der Supabase-Konsole zwei Tabellen anlegen:

```sql
-- Anmeldungen
create table rsvps (
  id bigint generated always as identity primary key,
  name text not null,
  email text not null,
  guests int default 1,
  message text,
  activities text[],
  created_at timestamptz default now()
);

-- Votes
create table votes (
  activity_id text primary key,
  count int default 0
);
```

4. Im Supabase-Dashboard unter „Settings → API" die URL und den `anon key` kopieren
5. In Vercel unter „Settings → Environment Variables" eintragen:
   - `NEXT_PUBLIC_SUPABASE_URL` = eure Supabase-URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = euer Supabase-Key

Meldet euch dann gern wieder – ich passe die `pages/api/rsvp.js` und `votes.js` entsprechend an, sodass alles mit Supabase verbunden ist. Das ist eine kleine Änderung.

---

## 🔐 Admin-Zugang

Die gespeicherten Anmeldungen könnt ihr abrufen unter:

```
https://eure-domain.vercel.app/api/rsvp?secret=EUER_PASSWORT
```

Das Passwort setzt ihr in Vercel unter **Settings → Environment Variables**:

```
ADMIN_SECRET = einSicheresPasswort123
```

---

## 📁 Dateistruktur

```
leonie-moritz/
├── pages/
│   ├── _app.js          # App-Wrapper, Fonts, Meta-Tags
│   ├── index.js         # Die komplette Webseite
│   └── api/
│       ├── rsvp.js      # API für Anmeldungen
│       └── votes.js     # API für Herzchen-Votes
├── styles/
│   └── globals.css      # Globales CSS (Reset)
├── next.config.js
├── package.json
└── README.md            # Diese Datei
```

---

## 🛠️ Lokal testen (optional)

Node.js installieren (https://nodejs.org), dann im Terminal:

```bash
cd leonie-moritz
npm install
npm run dev
```

→ Seite läuft auf http://localhost:3000
