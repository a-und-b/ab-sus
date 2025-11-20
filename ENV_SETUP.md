# Environment Variables Guide

## Local Development

Create a `.env` file in the project root:

```bash
# Supabase
VITE_SUPABASE_URL=https://ohsvzndgmefzvxyxubyq.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9oc3Z6bmRnbWVmenZ4eXh1YnlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2Mzk1ODcsImV4cCI6MjA3OTIxNTU4N30.U4GruS9l87XAul1LEZ0S7rqnZAe5yTUwKYQ-PsLkIYg
```

## Supabase Edge Function Secrets

Set these in Supabase Dashboard > Edge Functions > Secrets or via CLI:

```bash
supabase secrets set GEMINI_API_KEY=your_gemini_api_key_here
supabase secrets set RESEND_API_KEY=your_resend_api_key_here
```

## Vercel Environment Variables

Set these in Vercel Project Settings > Environment Variables:

- `VITE_SUPABASE_URL` = `https://ohsvzndgmefzvxyxubyq.supabase.co`
- `VITE_SUPABASE_ANON_KEY` = (same as above)