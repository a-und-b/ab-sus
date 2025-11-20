# Sprint Start (>30 min feature work)

Use this command for substantial feature work that takes more than 30 minutes.

## 1. Pre-flight Checks

### Run Quality Checks

Ensure working directory is clean and quality checks pass:

```bash
npm run lint && npm run type-check
```

If checks fail, fix issues before proceeding.

### Check Latest Deployment

```
Use mcp_vercel_list_deployments:
- projectId: your-project-id
- teamId: your-team-id
- limit: 1
```

Confirm production is stable before starting work.

## 2. GitHub Issue Sync

### Fetch Assigned Issues

```
Use mcp_github_list_issues:
- owner: a-und-b
- repo: ab-sus
- assignee: @me
- state: open
- sort: updated
- direction: desc
```

Present list of open issues assigned to me.

### Select or Create Issue

**Option A:** Select from existing issues
**Option B:** Select from backlog (`memory-bank/backlog.md`)
**Option C:** Create new issue

If creating new issue:

```
Use mcp_github_create_issue:
- owner: a-und-b
- repo: ab-sus
- title: [clear, actionable title]
- body: [detailed description with acceptance criteria]
- labels: [feature/bug/enhancement]
- assignees: [@me]
```

### Update Active Context

Update `memory-bank/active-context.md`:

```markdown
## Active Work

### Current Task

**Issue:** #[number] - [title]
**Branch:** [branch-name]
**Started:** [ISO timestamp]
**Status:** In Progress

### Description

[What we're building]

### Acceptance Criteria

- [ ] Criterion 1
- [ ] Criterion 2

### Next Steps

1. First step
2. Second step
```

## 3. Context Review

Read and summarize relevant context from memory bank:

### Project Brief

- `memory-bank/project-brief.md` - Overall project goals

### Technical Context

- `memory-bank/technical-context.md` - Stack, dependencies, setup

### System Patterns

- `memory-bank/system-patterns.md` - Existing patterns to follow

### Search for Similar Implementations

```
Use mcp_github_search_code if applicable:
- q: [relevant search terms] repo:a-und-b/ab-sus
```

Find existing patterns or similar features.

## 4. Comprehensive Planning

Create a detailed plan:

### Subtasks Breakdown

1. **Task 1:** [description]
   - Files to create/modify
   - Dependencies
2. **Task 2:** [description]
   - Files to create/modify
   - Dependencies
3. **Task 3:** [description]
   - Files to create/modify
   - Dependencies

### Files to Create/Modify

List all files that will change:

- `path/to/file1.ts` - What changes
- `path/to/file2.tsx` - What changes
- `path/to/file3.ts` - New file for...

### Testing Approach

- Unit tests needed?
- Integration tests needed?
- Manual testing plan?

### Commit Strategy

Plan commits (aim for atomic, logical commits):

1. Commit 1: [what it includes]
2. Commit 2: [what it includes]
3. Commit 3: [what it includes]

### Potential Challenges

- Challenge 1: [description and approach]
- Challenge 2: [description and approach]

## 5. Create Feature Branch

```
Use mcp_github_create_branch:
- owner: a-und-b
- repo: ab-sus
- branch: feature/[issue-number]-[short-description]
- from_branch: main
```

Branch naming examples:

- `feature/42-user-authentication`
- `fix/38-button-alignment`
- `refactor/45-api-restructure`

Update `memory-bank/active-context.md` with branch name.

## 6. Ready to Build

Confirm plan with user and begin implementation.

Follow these principles:

- Refer to system patterns from memory bank
- Follow Next.js best practices from rules
- Write tests alongside features
- Commit frequently with good messages
- Keep issue updated with progress

## 7. During Development

### Keep Issue Updated

Periodically add comments to issue:

```
Use mcp_github_add_issue_comment:
- owner: a-und-b
- repo: ab-sus
- issue_number: [number]
- body: [progress update]
```

### Update Active Context

Keep `memory-bank/active-context.md` current with:

- Progress on subtasks
- Challenges encountered
- Decisions made
- Next steps

## 8. When Complete

Use the `@wrapup` command to:

- Run quality checks
- Update memory bank
- Commit changes
- Update issue
- Create PR
- Check deployment
