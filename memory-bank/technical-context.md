# Technical Context

**Last Updated:** 2025-11-20T11:42:22.604Z

## Stack

### Frontend Framework

- **Next.js:** latest
- **React:** 19.2.0
- **Router:** App Router

### Language

- **TypeScript:** 5.8.2

### Package Manager

- **npm**

## Dependencies

### Core Dependencies

- **@google/genai:** ^1.30.0
- **cursor-kicker:** ^0.1.2
- **lucide-react:** ^0.554.0
- **react:** ^19.2.0
- **react-dom:** ^19.2.0
- **recharts:** ^3.4.1

### Development Tools

- **Linter:** ESLint
- **Formatter:** Prettier
- **Testing:** None

## Database

To be configured

## Authentication

To be configured

## External Services

To be documented

## GitHub Repository

- **Owner:** a-und-b
- **Repo:** ab-sus
- **Default Branch:** main
- **Repository URL:** https://github.com/a-und-b/ab-sus

## Vercel Deployment

- **Project ID:** your-project-id
- **Team ID:** your-team-id
- **Production URL:** https://your-app.vercel.app
- **Framework:** Next.js
- **Build Command:** npm run build
- **Output Directory:** .next

## Quality Commands

```bash
# Full quality check
npm run lint && npm run type-check

# Individual commands
prettier --write .
eslint --fix .
tsc --noEmit
npm test
```

## Environment Variables

Required environment variables (set in Vercel dashboard):

To be documented as they are added

## Build Configuration

Standard Next.js build configuration

## Project Structure

```
pages/         # Next.js Pages Router
  _app.tsx     # App wrapper
  index.tsx    # Homepage
components/    # React components
lib/          # Utility functions
public/       # Static assets
```

## Key Directories

- `app/` - Application routes and pages
- `components/` - Reusable React components
- `lib/` - Utility functions and helpers

## Development Workflow

1. Clone repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env.local`
4. Run development server: `npm run dev`
5. Run quality checks: `npm run lint && npm run type-check`

## Deployment Workflow

1. Push to feature branch
2. Vercel automatically creates preview deployment
3. Review preview deployment
4. Create PR to main
5. Merge to main triggers production deployment

## MCP Integration

### GitHub MCP

- ✅ Configured and available
- Used for issue tracking, PR management, code search

### Vercel MCP

- ✅ Configured and available
- Used for deployment monitoring, build log debugging

### Supabase MCP

- ❌ Not configured
