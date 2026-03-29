# AI Knowledge Compiler

Upload messy notes — handwriting photos, PDFs, voice memos, or plain text — and get back structured, publish-ready documents like study guides, executive briefs, and reports. Every output paragraph links back to its source.

## Tech Stack

- **Framework** — Next.js 14 (App Router)
- **Language** — TypeScript
- **Styling** — Tailwind CSS
- **Database / Auth / Storage** — Supabase
- **AI** — Anthropic Claude (`claude-sonnet-4-20250514`)
- **OCR** — Google Cloud Vision API
- **Deployment** — Vercel

## Setup

### 1. Clone and install

```bash
git clone https://github.com/yaronmadmon/Noted.git
cd Noted
npm install
```

### 2. Environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local` with your keys:

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase dashboard → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase dashboard → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase dashboard → Project Settings → API |
| `ANTHROPIC_API_KEY` | console.anthropic.com |
| `GOOGLE_VISION_API_KEY` | console.cloud.google.com → Cloud Vision API |

### 3. Supabase setup

Run the SQL in `supabase-schema.sql` in your Supabase SQL Editor, then create a private storage bucket named `uploads`.

Set your Auth redirect URL in Supabase → Authentication → URL Configuration:
- Site URL: `http://localhost:3000`
- Redirect URL: `http://localhost:3000/api/auth/callback`

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
app/                  Pages and API routes
app/api/              Backend API routes
components/           Reusable UI components
lib/                  Utilities (Supabase, Claude, prompts, helpers)
types/                TypeScript type definitions
```
