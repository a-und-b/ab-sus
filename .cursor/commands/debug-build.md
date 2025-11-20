# Debug Failed Vercel Build

Use this command when a Vercel deployment fails to diagnose and fix build errors.

## 1. Get Latest Failed Deployment

### List Recent Deployments

```
Use mcp_vercel_list_deployments:
- projectId: your-project-id
- teamId: your-team-id
- limit: 10
```

### Filter for Failed Deployments

Look for deployments with status:

- `ERROR`
- `FAILED`
- `CANCELED`

### Display Failed Deployment

```
❌ Failed Deployment Found:

**URL:** https://myapp-xyz789.vercel.app
**Branch:** feature/api-update
**Commit:** ghi789 - feat: update API endpoints
**Status:** ERROR
**Failed at:** 2025-01-15T07:00:00Z
**Duration:** 28 seconds (failed during build)
**Creator:** username
```

## 2. Fetch Build Logs

### Get Full Build Logs

```
Use mcp_vercel_get_deployment_build_logs:
- idOrUrl: [failed-deployment-id-or-url]
- teamId: your-team-id
- limit: 100
```

### Display Logs

Show the complete build log output, highlighting errors.

## 3. Analyze Errors

Parse logs to identify error patterns:

### TypeScript Errors

Pattern: `Type error:`, `TS2xxx:`

````
🔍 TypeScript Error Detected:

**Location:** src/components/UserProfile.tsx:25:10
**Error:** Property 'name' does not exist on type 'User'

Code Context:
  23 | export function UserProfile({ user }: Props) {
  24 |   return (
> 25 |     <div>{user.name}</div>
     |           ^^^^^^^^^
  26 |   );
  27 | }

**Root Cause:**
The User type is missing the 'name' property.

**Fix Options:**

1. Add property to type definition (types/user.ts):
   ```typescript
   export interface User {
     id: string;
     email: string;
     name: string; // Add this
   }
````

2. Or use existing property:

   ```typescript
   <div>{user.email}</div>
   ```

3. Or make it optional:
   ```typescript
   <div>{user.name ?? 'Unknown'}</div>
   ```

```

### Missing Dependencies

Pattern: `Module not found:`, `Cannot find module`

```

🔍 Missing Dependency Detected:

**Error:** Module not found: Can't resolve '@/lib/auth-utils'

**Root Cause:**

- File doesn't exist at expected path, OR
- Package not installed

**Fix Options:**

1. If file should exist, check path:
   - Expected: src/lib/auth-utils.ts
   - Verify file exists
   - Check import path is correct

2. If it's a package, install it:
   ```bash
   npm install auth-utils
   ```
3. Check tsconfig.json paths:
   ```json
   {
     "compilerOptions": {
       "paths": {
         "@/lib/*": ["./src/lib/*"]
       }
     }
   }
   ```

```

### Environment Variable Errors

Pattern: `is not defined`, `undefined`, `env`

```

🔍 Environment Variable Error:

**Error:** Error: API_KEY is not defined

**Root Cause:**
Required environment variable is not set in Vercel.

**Fix:**

1. Go to Vercel Dashboard:
   - Project Settings → Environment Variables
2. Add missing variable:
   - Name: API_KEY
   - Value: [your-api-key]
   - Environments: Select Production, Preview, Development
3. Redeploy:
   - Vercel will auto-redeploy after env var is added
   - Or manually trigger redeploy

**Required Environment Variables:**
Check .env.example for full list:
{{LIST_REQUIRED_ENV_VARS}}

```

### Build Command Failures

Pattern: `npm ERR!`, `ELIFECYCLE`, `exit code`

```

🔍 Build Command Failed:

**Error:**
npm ERR! code ELIFECYCLE
npm ERR! errno 1
npm ERR! myapp@1.0.0 build: `next build`
npm ERR! Exit status 1

**Root Cause:**
The build script failed during execution.

**Common Causes:**

1. **TypeScript errors** - Check output above
2. **ESLint errors** - Strict linting may fail build
3. **Missing files** - Build looking for non-existent files
4. **Memory issues** - Build ran out of memory

**Fix:**

1. Run build locally to reproduce:

   ```bash
   npm run build
   ```

2. Fix any errors shown

3. Verify locally:

   ```bash
   npm run quality-check
   npm run build
   ```

4. Push fix

```

### Next.js Specific Errors

Pattern: Next.js specific messages

```

🔍 Next.js Error Detected:

**Error:** Invalid: "use client" must be before any other imports

**Location:** src/components/SearchBar.tsx

**Root Cause:**
'use client' directive must be the first line of the file.

**Fix:**

```typescript
'use client';

import { useState } from 'react';
import { SearchIcon } from './icons';

export function SearchBar() {
  // component code
}
```

**Other Common Next.js Errors:**

1. **Server/Client Component Mismatch:**
   - Using hooks in Server Component
   - Fix: Add 'use client' directive

2. **Invalid Page Export:**
   - Missing default export
   - Fix: Export default async function

3. **Metadata in Client Component:**
   - Can't export metadata from Client Component
   - Fix: Move metadata to layout or parent Server Component

4. **Image Optimization:**
   - Remote image without domains config
   - Fix: Add domain to next.config.js

```

### Dependency Version Conflicts

Pattern: `peer dependency`, `version conflict`

```

🔍 Dependency Conflict Detected:

**Error:**
npm ERR! peer dep missing: react@^18.0.0

**Root Cause:**
Package requires React 18, but project has React 17.

**Fix:**

1. Update React:

   ```bash
   npm install react@^18.0.0 react-dom@^18.0.0
   ```

2. Check for breaking changes in React 18

3. Update code if needed

4. Test thoroughly

5. Commit and push:
   ```bash
   git add package.json package-lock.json
   git commit -m "chore: upgrade to React 18"
   git push
   ```

```

## 4. Search Documentation

### Search for Error Pattern

```

Use mcp_vercel_search_vercel_documentation:

- topic: [error-keyword or topic]
- tokens: 2500

```

Search topics based on error:
- TypeScript errors → "typescript configuration"
- Environment variables → "environment variables"
- Build failures → "build configuration"
- Image errors → "image optimization"
- API routes → "api routes"

### Display Relevant Documentation

Show relevant sections from Vercel docs that might help.

## 5. Suggest Specific Fixes

Based on the error analysis, provide step-by-step fix:

```

🔧 Recommended Fix:

**Step 1:** Add missing property to User type

Edit: types/user.ts

```typescript
export interface User {
  id: string;
  email: string;
  name: string; // Add this property
  createdAt: Date;
}
```

**Step 2:** Verify locally

```bash
# Type check
npm run type-check

# Build locally
npm run build
```

**Step 3:** Commit and push

```bash
git add types/user.ts
git commit -m "fix(types): add name property to User type"
git push
```

**Step 4:** Monitor new deployment

Wait 30 seconds, then check:

```bash
Use @check-deployment command
```

**Expected Result:**
✅ Build should succeed with the type fix

```

## 6. Provide Testing Instructions

### Test Fix Locally

```

Before pushing, verify the fix works:

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Run type checking:**

   ```bash
   tsc --noEmit
   ```

3. **Run linting:**

   ```bash
   eslint --fix .
   ```

4. **Build locally:**

   ```bash
   npm run build
   ```

5. **Test the app:**

   ```bash
   npm run dev
   ```

   Verify the specific feature that was failing.

6. **Run full quality check:**
   ```bash
   npm run lint && npm run type-check
   ```

✅ All checks should pass before pushing.

```

## 7. Fix and Retry

### Guide Through Fix Process

1. **Apply the fix** (show exact code changes)
2. **Test locally** (verify fix works)
3. **Commit changes** (with proper message)
4. **Push to GitHub** (trigger new deployment)
5. **Monitor deployment** (use @check-deployment)

### After Pushing

```

Fix pushed! Monitoring deployment...

Give Vercel 30 seconds to trigger, then checking status...

[Wait 30 seconds]

Checking latest deployment...

```

### Check New Deployment

```

Use mcp_vercel_list_deployments:

- projectId: your-project-id
- teamId: your-team-id
- limit: 1

```

Report result:

```

✅ New deployment succeeded!

**URL:** https://myapp-abc123.vercel.app
**Status:** READY
**Duration:** 45 seconds
**Branch:** feature/api-update

The fix resolved the build error. Deployment is now live.

```

Or if still failing:

```

❌ Deployment still failing

Fetching new build logs to diagnose...
[Repeat analysis process]

```

## 8. Common Issues & Solutions

### Issue: Out of Memory

```

**Error:** JavaScript heap out of memory

**Solution:**
Increase Node.js memory in build settings or optimize build.

In package.json:

```json
{
  "scripts": {
    "build": "NODE_OPTIONS='--max_old_space_size=4096' next build"
  }
}
```

```

### Issue: Build Timeout

```

**Error:** Build exceeded maximum duration

**Solution:**

1. Optimize build process
2. Remove unnecessary dependencies
3. Use Next.js caching
4. Consider Pro plan for longer build times

```

### Issue: Git LFS Files

```

**Error:** Git LFS file failed to download

**Solution:**

1. Verify LFS files are properly tracked
2. Check Vercel has access to LFS
3. Or move large files to external storage

````

## 9. Update Memory Bank

After fixing, update `memory-bank/deployment-status.md`:

```markdown
## Recent Deployments

### 2025-01-15

1. **❌ ERROR** feature/api-update (7:00 AM) - Failed
   - Error: TypeScript compilation error
   - Fix: Added missing 'name' property to User type
   - Resolution: Fixed and redeployed successfully

2. **✅ READY** feature/api-update (7:15 AM) - Success
   - Commit: ijk456 - fix(types): add name property to User type
   - URL: https://myapp-abc123.vercel.app
   - Duration: 45s
````

## 10. Summary Report

```
🔧 Build Debug Complete!

**Original Error:** TypeScript compilation error
**Location:** src/components/UserProfile.tsx:25
**Root Cause:** Missing 'name' property in User type

**Fix Applied:**
- Added 'name: string' to User interface
- Tested locally - all checks passed
- Pushed fix and redeployed

**Result:** ✅ Build successful

**New Deployment:**
- URL: https://myapp-abc123.vercel.app
- Status: READY
- Duration: 45 seconds

**Updated Files:**
- types/user.ts (added property)
- memory-bank/deployment-status.md (logged incident)

The issue is resolved and the app is deployed successfully!
```

## Prevention Tips

To avoid similar build failures:

1. **Always build locally first:** `npm run build`
2. **Run quality checks:** `npm run lint && npm run type-check`
3. **Test in development:** Catch errors early
4. **Use TypeScript strict mode:** Catch type errors
5. **Set up pre-commit hooks:** Prevent bad commits
6. **Monitor deployments:** Catch failures quickly
7. **Document env vars:** Keep `.env.example` updated
8. **Update dependencies carefully:** Test after updates
