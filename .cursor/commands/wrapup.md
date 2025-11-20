# Wrap Up Work

Use this command when completing work to ensure everything is properly finalized.

## 1. Quality Checks

### Run Full Quality Suite

```bash
npm run lint && npm run type-check
```

This typically includes:

- Code formatting
- Linting
- Type checking
- Tests

### Fix Any Issues

If quality checks fail:

1. Read error messages carefully
2. Fix errors one at a time
3. Re-run quality checks after each fix
4. Don't proceed until all checks pass

## 2. Update Memory Bank

### Update Progress

Add completed work to `memory-bank/progress.md`:

```markdown
### [Today's Date - YYYY-MM-DD]

- ✅ #[issue] - [title] [PR #[pr-number]]
  - [Brief description of what was done]
  - [Impact or key changes]
```

### Update Active Context

Update `memory-bank/active-context.md`:

**If work is complete:**

- Clear current task section
- Move to "Recently Completed"

**If work is ongoing:**

- Update status and progress
- Update next steps

### Update System Patterns (if applicable)

If new patterns were established, add to `memory-bank/system-patterns.md`:

```markdown
### [New Pattern Name]

[Description of pattern]

Example:
[Code example]

When to use:

- [Scenario 1]
- [Scenario 2]
```

## 3. Commit Changes

### Create Commit

Use conventional commit format:

```
<type>(<scope>): <subject> (#issue-number)

<body>

<footer>
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance

**Example:**

```
feat(auth): implement user login (#42)

Add user authentication with email and password.

- Add login form component
- Add authentication API route
- Add session management with NextAuth
- Update navigation to show user state

Closes #42
```

**Breaking Changes:**

If introducing breaking changes, include in footer:

```
BREAKING CHANGE: Authentication endpoint response format changed
```

## 4. GitHub Issue Update

### Add Progress Comment

```
Use mcp_github_add_issue_comment:
- owner: a-und-b
- repo: ab-sus
- issue_number: [number]
- body: |
    Work completed! 🎉

    **Changes:**
    - [Change 1]
    - [Change 2]
    - [Change 3]

    **Testing:**
    - [x] Manual testing completed
    - [x] All quality checks pass
    - [x] Deployment verified

    Preview: [deployment URL]
```

### Close Issue (if complete)

If feature is fully complete:

```
Use mcp_github_update_issue:
- owner: a-und-b
- repo: ab-sus
- issue_number: [number]
- state: closed
```

### Or Update Labels (if partial)

If work continues:

```
Use mcp_github_update_issue:
- owner: a-und-b
- repo: ab-sus
- issue_number: [number]
- labels: [in-progress, feature, etc.]
```

## 5. Push Changes

Push changes to GitHub:

```bash
git push origin [branch-name]
```

## 6. Deployment Check

### Wait for Vercel Webhook

Give Vercel 30 seconds to trigger deployment.

### Check Deployment Status

```
Use mcp_vercel_list_deployments:
- projectId: your-project-id
- teamId: your-team-id
- limit: 1
```

### Handle Deployment States

**If Status is READY (✅):**

- Success! Deployment is live
- Access preview URL
- Report URL to user
- Update `memory-bank/deployment-status.md`

**If Status is ERROR (❌):**

- Deployment failed
- Fetch build logs:

```
Use mcp_vercel_get_deployment_build_logs:
- idOrUrl: [deployment-id]
- teamId: your-team-id
- limit: 100
```

- Analyze errors
- Identify issue (TypeScript, dependencies, env vars, etc.)
- Fix the issue
- Push fix
- Wait and check new deployment

**If Status is BUILDING (⏳):**

- Still building
- Report progress to user
- Can check again in a moment

## 7. Create Pull Request (if on feature branch)

### Create PR

```
Use mcp_github_create_pull_request:
- owner: a-und-b
- repo: ab-sus
- title: [Clear title summarizing changes]
- head: [feature-branch-name]
- base: main
- body: |
    ## Description
    [What this PR does and why]

    ## Changes
    - [Change 1]
    - [Change 2]
    - [Change 3]

    ## Testing
    - [x] Manual testing completed
    - [x] All tests pass
    - [x] Linting passes
    - [x] Type checking passes
    - [x] Deployed and verified

    ## Screenshots
    [If UI changes, include screenshots]

    ## Related Issues
    Closes #[issue-number]
    Related to #[other-issue]
- draft: false
```

### PR Best Practices

- Clear, descriptive title
- Detailed description of changes
- Link to issues (Closes #N)
- Include testing checklist
- Add screenshots for UI changes
- Request reviews from team members

## 8. Update Deployment Status

Update `memory-bank/deployment-status.md`:

```markdown
## Latest Preview Deployment

- **URL:** [preview-url]
- **Status:** ✅ READY
- **Last Deployed:** [ISO timestamp]
- **Branch:** [branch-name]
- **Commit:** [commit-sha] - [commit-message]
- **Deployed By:** [user]

## Recent Deployments

### [Today's Date]

1. **✅ READY** [branch-name] ([time])
   - Commit: [sha] - [message]
   - URL: [url]
   - Duration: [duration]
```

## 9. Summary

Provide a comprehensive summary:

```
✅ Work Completed!

**Issue:** #[number] - [title]
**Branch:** [branch-name]
**Commits:** [number] commit(s)

**Changes:**
- [Change 1]
- [Change 2]

**Quality:** All checks passed ✅
**Deployment:** [status] - [url]
**PR:** #[pr-number] - [pr-url]

**Next Steps:**
- [If any follow-up needed]
```

## 10. Cleanup (Optional)

For complete features:

- Archive or update issue
- Update project board if used
- Notify team members if needed
- Update documentation if needed

## Common Issues & Solutions

### Quality Checks Failing

**Problem:** Tests, linting, or type errors
**Solution:**

1. Read error messages
2. Fix errors systematically
3. Re-run checks
4. Don't commit until clean

### Deployment Failed

**Problem:** Build errors in Vercel
**Solution:**

1. Fetch and analyze build logs
2. Identify error type
3. Fix locally and test `npm run build`
4. Push fix
5. Monitor new deployment

### Merge Conflicts

**Problem:** Branch conflicts with main
**Solution:**

1. Pull latest main
2. Resolve conflicts
3. Re-run quality checks
4. Push resolved changes

### Forgot to Link Issue

**Problem:** Commit doesn't reference issue
**Solution:**

1. Amend commit message if not pushed
2. Or ensure PR links to issue
3. Or add issue link in PR description
