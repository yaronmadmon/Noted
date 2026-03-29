# AI Knowledge Compiler

## What This Product Does

An AI-powered research-to-deliverable tool. Users upload messy notes (handwriting photos, PDFs, voice memos, plain text) and get back structured, enriched, publish-ready documents like reports, study guides, and briefs.

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 with App Router |
| Styling | Tailwind CSS |
| Language | TypeScript |
| Database + Auth + Storage | Supabase |
| AI Model | Anthropic Claude API (`claude-sonnet-4-20250514`) |
| OCR (handwriting) | Google Cloud Vision API |
| Deployment | Vercel |

## Folder Structure

```
app/                  Next.js pages and API routes
app/api/              All backend API routes
components/           Reusable UI components
lib/                  Shared utilities (supabase client, prompts, helpers)
types/                TypeScript type definitions
```

## Current Build Phase

**PHASE 1 ONLY. Do not add Phase 2 features.**

## Phase 1 Features (build ONLY these)

- File upload — accept PDF, images (JPG/PNG), plain text, audio
- Intent Engine — 4 options: Study / Business / Book / Content
- AI compilation pipeline — sends content to Claude API, returns structured output
- Source traceability — every output paragraph links to its source
- Output display — shows compiled document with source highlighting
- Basic output templates — Report, Study Guide, Executive Brief
- Usage tracking — free tier limit of 15 compilations per month

## Critical Rules (always follow these)

- Never build features outside the Phase 1 list above
- Every AI-generated paragraph must include a `sourceRef` field
- Keep components small — one responsibility per component
- Use Supabase client from `lib/supabase.ts`, never create a new one
- All API keys must come from environment variables, never hardcoded
- Always use TypeScript types, never use `any`
- API routes live in `app/api/` using Next.js route handlers

## Environment Variables (stored in `.env.local`)

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
ANTHROPIC_API_KEY
GOOGLE_VISION_API_KEY
```

## AI Output Format

All Claude API responses must return JSON in this exact shape:

```json
{
  "title": "string",
  "sections": [
    {
      "heading": "string",
      "content": "string",
      "sourceRefs": ["string"]
    }
  ],
  "summary": "string"
}
```
