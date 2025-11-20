# Quick Task Kickoff (<30 min)

Use this command for quick tasks that take less than 30 minutes.

## 1. Status Check

### Check GitHub Issues

Check if this task has a GitHub issue:

```
Use mcp_github_list_issues to fetch:
- owner: a-und-b
- repo: ab-sus
- assignee: @me
- state: open
```

If no issue exists and the task is substantial, suggest creating one.

### Check Latest Deployment

```
Use mcp_vercel_list_deployments to fetch:
- projectId: your-project-id
- teamId: your-team-id
- limit: 1
```

Report current deployment status (READY, ERROR, BUILDING).

## 2. Context Review

Read the following memory bank files for context:

- `memory-bank/active-context.md` - Current work status
- `memory-bank/system-patterns.md` - Relevant patterns for this task

## 3. Quick Plan

Create a minimal plan:

- What files need to be modified?
- What's the quick approach?
- Any dependencies or prerequisites?

Keep it brief - this is a quick task.

## 4. Execute

Implement the changes following:

- Project patterns from memory bank
- Cursor rules for Next.js and quality
- TypeScript best practices

## 5. Quality Check

Before committing, run:

```bash
npm run lint && npm run type-check
```

Fix any errors that arise.

## 6. Commit

Create commit with conventional format:

```
<type>(<scope>): <description> (#issue-number if exists)
```

Examples:

- `fix(ui): resolve button alignment`
- `feat(api): add user endpoint (#42)`
- `docs: update README with setup instructions`

## 7. Update Memory Bank (if needed)

For quick tasks, minimal updates:

- Update `memory-bank/active-context.md` if this changes current context
- No need to update progress for very small changes

## 8. Done!

Quick task complete. Report what was done and any relevant links.
