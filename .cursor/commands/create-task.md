# Create Task/Issue

Use this command to create a new GitHub issue for tracking work.

## 1. Gather Information

### Task Title

Get a clear, concise, actionable title:

**Good Examples:**

- "Add user authentication with email"
- "Fix button alignment on mobile"
- "Improve search performance"
- "Update API documentation"

**Bad Examples:**

- "Users" (too vague)
- "Fix bug" (not specific)
- "Make it better" (not actionable)

### Task Description

Get detailed information:

**What needs to be done?**

- Clear description of the feature/fix/improvement
- Context and background
- Why this is needed

**Acceptance Criteria:**

- What defines "done"?
- Specific, testable criteria
- List format preferred

**Technical Notes (optional):**

- Implementation approach
- Technologies to use
- Considerations or constraints

### Example Description

```markdown
## Description

Implement user authentication using email and password. Users should be able to register, login, and logout. Sessions should persist across page refreshes.

## Acceptance Criteria

- [ ] User can register with email and password
- [ ] User can login with credentials
- [ ] User can logout
- [ ] Session persists across page refreshes
- [ ] Invalid credentials show appropriate error
- [ ] Passwords are hashed and secured

## Technical Notes

- Use NextAuth.js for authentication
- Store sessions in database (PostgreSQL)
- Implement proper password hashing (bcrypt)
- Add rate limiting to prevent brute force
- Consider adding email verification (future enhancement)

## Related

- Blocks: #40 (User profile page needs auth)
- Related to: #38 (Password reset feature)
```

## 2. Select Labels

Choose appropriate labels:

### Type Labels

- `feature` - New functionality
- `bug` - Something isn't working
- `enhancement` - Improvement to existing feature
- `documentation` - Documentation updates
- `refactor` - Code restructuring
- `test` - Adding or updating tests
- `chore` - Maintenance tasks

### Priority Labels

- `critical` - Must be fixed immediately
- `high-priority` - Should be done soon
- `low-priority` - Can wait

### Status Labels

- `needs-triage` - Needs review/prioritization
- `ready` - Ready to be worked on
- `in-progress` - Currently being worked on
- `blocked` - Blocked by something
- `needs-review` - Needs code review

### Domain Labels

- `frontend` - UI/UX work
- `backend` - API/server work
- `database` - Database changes
- `security` - Security-related
- `performance` - Performance optimization

## 3. Select Assignee

Options:

- **Assign to me:** `@me` or your username
- **Assign to teammate:** specific username
- **Leave unassigned:** Let team pick it up later

Default: Assign to me if planning to work on it.

## 4. Select Milestone (optional)

If project uses milestones:

- Next release (v1.2.0)
- Sprint milestone (Sprint 5)
- Feature milestone (User Management)

## 5. Create Issue

```
Use mcp_github_create_issue:
- owner: a-und-b
- repo: ab-sus
- title: [Clear, actionable title]
- body: [Detailed description with acceptance criteria]
- labels: [feature, high-priority, etc.]
- assignees: [@me or specific username]
- milestone: [milestone number, if applicable]
```

Example:

```
mcp_github_create_issue({
  owner: 'a-und-b',
  repo: 'ab-sus',
  title: 'Add user authentication with email',
  body: `## Description

Implement user authentication using email and password. Users should be able to register, login, and logout. Sessions should persist across page refreshes.

## Acceptance Criteria

- [ ] User can register with email and password
- [ ] User can login with credentials
- [ ] User can logout
- [ ] Session persists across page refreshes
- [ ] Invalid credentials show appropriate error
- [ ] Passwords are hashed and secured

## Technical Notes

- Use NextAuth.js for authentication
- Store sessions in database (PostgreSQL)
- Implement proper password hashing (bcrypt)
- Add rate limiting to prevent brute force

## Related

Blocks: #40
Related to: #38
`,
  labels: ['feature', 'authentication', 'high-priority'],
  assignees: ['@me']
})
```

## 6. Update Memory Bank

Add the new issue to `memory-bank/backlog.md`:

```markdown
## Features

### Planned Features

- [ ] #[NEW-NUMBER] - [Title] [labels] (@assignee)
```

If assigned to me and planning to work on it immediately, also update `memory-bank/active-context.md`.

## 7. Confirm Creation

Report success:

```
✅ Issue Created Successfully!

**Issue:** #42 - Add user authentication with email
**URL:** https://github.com/a-und-b/ab-sus/issues/42
**Labels:** feature, authentication, high-priority
**Assigned to:** @me

**Next Steps:**
Would you like to start work on this issue now?

Use @start-sprint to begin working on this issue.
```

## 8. Optional: Start Work Immediately

Ask if user wants to start work:

```
Options:
1. Start work now (@start-sprint)
2. Add to backlog for later
3. Create more issues
```

If starting work:

- Transition to @start-sprint command
- Use the newly created issue
- Create feature branch
- Begin implementation

## Issue Templates

### Feature Request Template

```markdown
## Description

[Clear description of the feature]

## Motivation

[Why is this feature needed? What problem does it solve?]

## Acceptance Criteria

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Technical Approach

[Proposed implementation approach]

## Alternatives Considered

[Other approaches considered and why they were not chosen]

## Related Issues

- Related to: #XX
- Blocks: #XX
- Blocked by: #XX
```

### Bug Report Template

```markdown
## Description

[Clear description of the bug]

## Steps to Reproduce

1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

## Expected Behavior

[What should happen]

## Actual Behavior

[What actually happens]

## Screenshots

[If applicable, add screenshots]

## Environment

- Browser: [e.g. Chrome 120]
- Device: [e.g. iPhone 14]
- OS: [e.g. iOS 17]

## Error Messages
```

[Any error messages or console logs]

```

## Additional Context

[Any other context about the problem]
```

### Refactoring Template

```markdown
## Description

[What code needs to be refactored and why]

## Current State

[Description or code snippet of current implementation]

## Proposed Changes

[Description of how it should be refactored]

## Benefits

- Benefit 1
- Benefit 2

## Risks

- Risk 1 and mitigation
- Risk 2 and mitigation

## Acceptance Criteria

- [ ] Code is refactored
- [ ] All tests still pass
- [ ] No functionality changes
- [ ] Performance maintained or improved
```

## Best Practices

1. **Be Specific:** Clear, actionable titles
2. **Add Context:** Explain why, not just what
3. **Acceptance Criteria:** Make "done" clear
4. **Use Labels:** Categorize properly
5. **Link Related Issues:** Show dependencies
6. **Assign Appropriately:** Know who should work on it
7. **Add Technical Notes:** Help future implementer
8. **Use Templates:** Ensure consistency
9. **Include Examples:** Screenshots, code snippets
10. **Keep Updated:** Update as understanding evolves

## When to Create Issues

### Always Create Issues For:

- New features
- Bugs that need tracking
- Technical debt items
- Significant refactoring
- Documentation needs
- Enhancements or improvements

### Don't Need Issues For:

- Typo fixes
- Minor formatting changes
- One-line code fixes
- Obvious quick wins (< 5 minutes)

## After Creating Issue

The issue is now tracked in GitHub and will:

- Appear in @sync-backlog updates
- Be available for @start-sprint selection
- Show up in project board (if configured)
- Send notifications to watchers
- Be searchable and linkable in commits/PRs
