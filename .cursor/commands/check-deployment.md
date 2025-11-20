# Check Vercel Deployment Status

Use this command to monitor Vercel deployments and check their status.

## 1. List Recent Deployments

### Fetch Deployments

```
Use mcp_vercel_list_deployments:
- projectId: your-project-id
- teamId: your-team-id
- limit: 5
```

### Display Deployment Summary

Show table format:

```
Recent Deployments:

1. ✅ READY - https://myapp-abc123.vercel.app
   Branch: feature/user-auth
   Commit: def456 - feat: add login form
   Created: 10 minutes ago
   Duration: 45s

2. ✅ READY - https://myapp.com
   Branch: main (Production)
   Commit: abc123 - feat: add dashboard
   Created: 2 hours ago
   Duration: 52s

3. ❌ ERROR - https://myapp-xyz789.vercel.app
   Branch: feature/api-update
   Commit: ghi789 - feat: update API endpoints
   Created: 3 hours ago
   Failed after: 28s

4. ✅ READY - https://myapp-prev01.vercel.app
   Branch: fix/button-style
   Commit: jkl012 - fix: button alignment
   Created: 5 hours ago
   Duration: 41s

5. ✅ READY - https://myapp-prev02.vercel.app
   Branch: docs/api-reference
   Commit: mno345 - docs: add API documentation
   Created: 1 day ago
   Duration: 38s
```

## 2. Get Latest Deployment Details

### Fetch Detailed Information

```
Use mcp_vercel_get_deployment:
- idOrUrl: [latest-deployment-id-or-url]
- teamId: your-team-id
```

### Display Full Details

```
Latest Deployment Details:

**Status:** READY ✅
**URL:** https://myapp-abc123.vercel.app
**Branch:** feature/user-auth
**Commit:** def456 - feat: add login form
**Creator:** username
**Created:** 2025-01-15T10:30:00Z
**Duration:** 45 seconds

**Environment:** Preview
**Framework:** Next.js
**Node Version:** 20.x

**Build Configuration:**
- Build Command: npm run build
- Output Directory: .next
- Install Command: npm install
```

## 3. Check Build Logs (if deployment failed)

### Detect Failed Deployments

If deployment status is `ERROR` or `FAILED`:

```
⚠️ Deployment Failed!

Fetching build logs to diagnose...
```

### Fetch Build Logs

```
Use mcp_vercel_get_deployment_build_logs:
- idOrUrl: [failed-deployment-id]
- teamId: your-team-id
- limit: 100
```

### Analyze Errors

Look for common error patterns:

**TypeScript Errors:**

```
Type error: Property 'name' does not exist on type 'User'
  > 25 | const userName = user.name;
```

**Missing Dependencies:**

```
Module not found: Can't resolve 'some-package'
```

**Environment Variables:**

```
Error: API_KEY is not defined
```

**Build Command Failures:**

```
npm ERR! code ELIFECYCLE
npm ERR! errno 1
```

**Next.js Errors:**

```
Error: Page /api/users not found
Invalid: "use client" must be before any other imports
```

### Provide Diagnosis

```
🔍 Build Error Diagnosed:

**Error Type:** TypeScript Error
**Location:** src/components/UserProfile.tsx:25
**Issue:** Property 'name' does not exist on type 'User'

**Likely Cause:**
Type definition is missing the 'name' property

**Suggested Fix:**
1. Add 'name' property to User type in types/user.ts:

   interface User {
     id: string;
     email: string;
     name: string; // Add this
   }

2. Or fix the code to use existing property:

   const userName = user.email;

3. Run locally to verify:
   npm run type-check
   npm run build

4. Commit and push fix
```

### Search Documentation (if needed)

For complex errors, search Vercel docs:

```
Use mcp_vercel_search_vercel_documentation:
- topic: [error-related-topic]
- tokens: 2500
```

Example topics:

- "build errors"
- "environment variables"
- "typescript configuration"
- "next.js image optimization"

## 4. Update Memory Bank

Update `memory-bank/deployment-status.md`:

```markdown
# Deployment Status

**Last Updated:** [ISO timestamp]

## Production

- **URL:** https://myapp.com
- **Status:** ✅ READY
- **Last Deployed:** 2025-01-15T08:00:00Z
- **Branch:** main
- **Commit:** abc123 - feat: add dashboard
- **Deployed By:** username

## Latest Preview Deployment

- **URL:** https://myapp-abc123.vercel.app
- **Status:** ✅ READY
- **Last Deployed:** 2025-01-15T10:30:00Z
- **Branch:** feature/user-auth
- **Commit:** def456 - feat: add login form
- **Deployed By:** username

## Recent Deployments

### 2025-01-15

1. **✅ READY** feature/user-auth (10:30 AM)
   - Commit: def456 - feat: add login form
   - URL: https://myapp-abc123.vercel.app
   - Duration: 45s

2. **✅ READY** main (8:00 AM)
   - Commit: abc123 - feat: add dashboard
   - URL: https://myapp.com (Production)
   - Duration: 52s

3. **❌ ERROR** feature/api-update (7:00 AM)
   - Commit: ghi789 - feat: update API endpoints
   - Failed after: 28s
   - Error: TypeScript compilation failed

## Failed Deployments

Last Failed: 2025-01-15T07:00:00Z

- Branch: feature/api-update
- Error: TypeScript errors in src/api/users.ts
- Status: Fixed and redeployed
```

## 5. Access Preview Deployment

### Generate Shareable URL (if protected)

For deployments with Vercel Authentication:

```
Use mcp_vercel_get_access_to_vercel_url:
- url: https://myapp-abc123.vercel.app
```

Returns a shareable URL with authentication bypass (valid 23 hours).

### Test Deployment

```
Use mcp_vercel_web_fetch_vercel_url:
- url: https://myapp-abc123.vercel.app/api/health
```

Fetch and verify deployment is responding correctly.

## 6. Deployment Health Check

Perform basic health checks:

### Check Homepage

```
Verifying homepage loads...
GET https://myapp-abc123.vercel.app
Status: 200 OK ✅
```

### Check API Endpoints (if applicable)

```
Verifying API endpoints...
GET https://myapp-abc123.vercel.app/api/health
Status: 200 OK ✅
```

### Report Status

```
✅ Deployment Health: Good

- Homepage: ✅ Loads successfully
- API Health: ✅ Responding
- Build Time: 45s (normal)
- No console errors detected
```

## 7. Compare with Production

If checking a preview deployment:

```
Comparison with Production:

**Preview:** https://myapp-abc123.vercel.app
- Branch: feature/user-auth
- Commit: def456 (3 commits ahead)
- Status: ✅ READY

**Production:** https://myapp.com
- Branch: main
- Commit: abc123
- Status: ✅ READY

**Changes in Preview:**
1. feat: add login form (def456)
2. feat: add authentication API (bcd123)
3. feat: add session management (cde234)
```

## 8. Provide Recommendations

Based on deployment status:

### If All Deployments Successful

```
✅ All deployments are healthy!

**Latest Preview:** https://myapp-abc123.vercel.app
- Ready for testing
- No build errors

**Production:** https://myapp.com
- Stable and running
- Last deployed 2 hours ago

**Recommendation:**
- Test preview deployment
- If satisfied, create PR to merge to main
```

### If Recent Deployment Failed

```
⚠️ Recent deployment failed!

**Failed Deployment:** feature/api-update
**Error:** TypeScript compilation errors
**Failed:** 3 hours ago

**Recommendation:**
1. Review build logs above
2. Fix TypeScript errors
3. Test build locally: npm run build
4. Push fix and monitor new deployment

Use @debug-build command for detailed analysis.
```

### If No Recent Deployments

```
ℹ️ No recent deployments

**Last Deployment:** 2 days ago
**Status:** READY

**Recommendation:**
- If you have local changes, push them
- Vercel will automatically deploy
```

## 9. Monitor Build Queue

If deployment is building:

```
⏳ Deployment in progress...

**Status:** BUILDING
**Started:** 30 seconds ago
**Branch:** feature/user-auth

Vercel is currently building your deployment.
Check again in a moment for final status.
```

## 10. Summary Report

Provide comprehensive summary:

```
📊 Deployment Status Report

**Last Checked:** 2025-01-15T10:35:00Z

**Production:**
✅ READY - https://myapp.com
Last deployed 2 hours ago

**Latest Preview:**
✅ READY - https://myapp-abc123.vercel.app
Deployed 5 minutes ago from feature/user-auth

**Recent Activity:**
- 3 successful deployments today
- 1 failed deployment (TypeScript errors, now fixed)
- Average build time: 45 seconds

**Action Items:**
- ✅ Test latest preview deployment
- ✅ Review build performance (normal)
- No issues require attention

**Updated Files:**
- memory-bank/deployment-status.md
```

## When to Use This Command

- **After pushing code:** Check if deployment succeeded
- **Before meetings:** Get current deployment status
- **When debugging:** Understand what's deployed where
- **Regular monitoring:** Daily check of deployment health
- **After reports of issues:** Verify deployment status
