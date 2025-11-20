# Sync Backlog from GitHub

Use this command to synchronize your memory bank with the latest GitHub issues.

## 1. Fetch Open Issues

### Get All Open Issues

```
Use mcp_github_list_issues:
- owner: a-und-b
- repo: ab-sus
- state: open
- sort: updated
- direction: desc
- perPage: 100
```

### Categorize Issues

Organize issues by:

- **Priority:** labels like `high-priority`, `critical`
- **Type:** `bug`, `feature`, `enhancement`, `documentation`, `chore`
- **Assignment:** assigned to me, assigned to others, unassigned
- **Status:** `in-progress`, `blocked`, `needs-review`

## 2. Update Memory Bank Backlog

Overwrite `memory-bank/backlog.md` with current issue data:

```markdown
# Backlog

**Last Updated:** [ISO timestamp]
**Source:** GitHub Issues

## High Priority

- [ ] #42 - Add user authentication [feature, high-priority] (@username)
- [ ] #38 - Fix critical security issue [bug, critical, security] (@username)

## Features

### Planned Features

- [ ] #45 - Implement dashboard [feature] (@username)
- [ ] #47 - Add export functionality [feature] (unassigned)

### Enhancement Requests

- [ ] #50 - Improve search performance [enhancement] (unassigned)

## Bugs

### Critical Bugs

- [ ] #48 - Login fails on mobile [bug, critical] (@username)

### Normal Bugs

- [ ] #49 - Button alignment issue [bug, ui] (unassigned)

## Technical Debt

- [ ] #51 - Refactor auth service [tech-debt, refactor] (unassigned)

## Documentation

- [ ] #52 - Update API docs [documentation] (unassigned)

## Chores

- [ ] #53 - Upgrade dependencies [chore] (unassigned)

## Ideas / Future Considerations

- [ ] #54 - Add dark mode [idea, enhancement] (unassigned)

## Assigned to Me

- #42 - Add user authentication [feature, high-priority]
- #45 - Implement dashboard [feature]
- #48 - Login fails on mobile [bug, critical]

## Stale Issues

Issues with no updates in 30+ days:

- [ ] #30 - Old feature request [feature] (unassigned) - Last updated: 45 days ago
- [ ] #28 - Minor UI tweak [enhancement] (unassigned) - Last updated: 60 days ago

## Summary

- **Total Open Issues:** 12
- **High Priority:** 2
- **Assigned to Me:** 3
- **Unassigned:** 7
- **Bugs:** 2
- **Features:** 4
```

## 3. Fetch Recently Closed Issues

### Get Closed Issues

```
Use mcp_github_list_issues:
- owner: a-und-b
- repo: ab-sus
- state: closed
- sort: updated
- direction: desc
- perPage: 20
```

### Update Progress

Update `memory-bank/progress.md` with recently closed issues:

```markdown
## Recently Completed

### 2025-01-15

- ✅ #42 - Add user authentication [PR #60]
  - Implemented login/logout functionality
  - Added session management
- ✅ #38 - Fix button alignment [PR #59]
  - Fixed CSS flexbox issue
  - Works across all browsers

### 2025-01-14

- ✅ #40 - Update documentation [PR #58]
  - Added API reference
  - Updated setup instructions
```

## 4. Analyze Issue Metrics

Calculate and report metrics:

### Issue Counts

```
Total Open Issues: X
High Priority: X
Critical Bugs: X
Assigned to Me: X
Unassigned: X
```

### By Type

```
Features: X
Bugs: X
Enhancements: X
Documentation: X
Technical Debt: X
Chores: X
```

### By Label

List issues grouped by common labels.

### Stale Issues

Identify issues with no activity in 30+ days:

- Issue #N - Title - Last updated: X days ago

## 5. Highlight Important Items

### My Assigned Issues

Show all issues assigned to me with status:

```
You have 3 assigned issues:

1. **#42 - Add user authentication** [feature, high-priority]
   - Created: 3 days ago
   - Last updated: 1 hour ago
   - Status: In Progress

2. **#48 - Login fails on mobile** [bug, critical]
   - Created: 1 day ago
   - Last updated: 1 day ago
   - Status: Needs Investigation

3. **#45 - Implement dashboard** [feature]
   - Created: 1 week ago
   - Last updated: 2 days ago
   - Status: Blocked (waiting on API)
```

### High Priority Unassigned

```
High priority issues needing assignment:

- #38 - Fix critical security issue [bug, critical, security]
  - Unassigned, needs immediate attention
```

### Blocked Issues

```
Blocked issues:

- #45 - Implement dashboard [feature] (@username)
  - Blocked by: Waiting on API changes
```

## 6. Provide Recommendations

### Suggested Next Steps

Based on the backlog, suggest:

1. **Urgent:** Critical bugs or high-priority items
2. **Important:** Features in progress
3. **Quick Wins:** Small, unassigned issues
4. **Cleanup:** Stale issues to close or update

Example:

```
🚨 **Urgent attention needed:**
- #48 - Login fails on mobile (critical bug)

📋 **Continue work on:**
- #42 - Add user authentication (in progress)

✅ **Quick wins available:**
- #49 - Button alignment issue (easy fix, 15 min)

🧹 **Stale issues to review:**
- #30 - Old feature request (close or update?)
```

## 7. Check for Issues Needing Updates

### Issues Without Labels

```
Issues missing labels:
- #XX - [title]
```

### Issues Without Assignees (high priority)

```
High priority issues needing assignment:
- #XX - [title] [high-priority]
```

### Issues Without Description

```
Issues needing better description:
- #XX - [title] (no description)
```

## 8. Report Summary

Provide a comprehensive summary:

```
✅ Backlog Synced Successfully!

**Synced from GitHub Issues**
Last Updated: [timestamp]

**Open Issues:**
- Total: 12
- High Priority: 2
- Assigned to Me: 3
- Critical Bugs: 1

**Recently Closed:** 5 issues closed in last 7 days

**Updated Files:**
- memory-bank/backlog.md
- memory-bank/progress.md

**Action Items:**
🚨 1 critical bug needs attention
📋 3 issues assigned to you
🧹 2 stale issues to review
```

## 9. Optional: Clean Up Stale Issues

For issues with no activity in 30+ days, suggest:

1. **Close if no longer relevant**
2. **Update with current status**
3. **Re-prioritize if still needed**
4. **Add "stale" label**

Offer to help update or close stale issues.

## 10. Sync Frequency

Recommend running this command:

- **Daily:** When actively developing
- **Weekly:** For maintenance mode
- **Before sprint planning:** To review backlog
- **After major milestones:** To clean up completed work

## Benefits of Regular Syncing

1. **Accurate Context:** AI has latest issue data
2. **Better Planning:** See full backlog when planning work
3. **Track Progress:** See what's been completed
4. **Identify Gaps:** Find unassigned or stale issues
5. **Team Coordination:** Know what others are working on
