# Plan: Optimize Admin UI and Hosts Management

## Overview
This plan outlines improvements to the Admin UI and the hosts management system to make them more user-friendly, maintainable, and feature-rich.

## Current State Analysis

### Hosts Field
- Currently stored as a simple string: `"Holger, Daniela, Finn und Judith"`
- Single text input in Event Setup tab
- Used in email templates via `{{hosts}}` variable
- No structured data (no emails, roles, or individual management)

### Admin UI Issues (from TODO)
- Page scrolling/jumping when switching tabs
- No visual feedback for some actions
- Hosts field is basic text input only

## Goals

1. **Improve Hosts Management**
   - Convert hosts from string to structured array
   - Allow adding/removing individual hosts
   - Store host name, email (optional), and role
   - Display hosts nicely in admin UI
   - Maintain backward compatibility with existing string format

2. **Optimize Admin UI**
   - Fix page scroll/jump issues when switching tabs
   - Improve visual hierarchy and spacing
   - Add better loading states
   - Enhance form validation and feedback
   - Improve mobile responsiveness

## Implementation Plan

### Phase 1: Hosts Data Structure Enhancement

#### 1.1 Update Types
- [ ] Add `Host` interface to `types.ts`:
  ```typescript
  export interface Host {
    id: string;
    name: string;
    email?: string;
    role?: string; // e.g., "Organizer", "Co-host"
  }
  ```
- [ ] Update `EventConfig` to support both string (backward compat) and array:
  ```typescript
  hosts: string | Host[]; // Support both formats during migration
  ```

#### 1.2 Update Data Service
- [ ] Add migration logic in `configFromDb()` to convert string hosts to array format
- [ ] Add helper function to format hosts array back to string for email templates
- [ ] Update `configToDb()` to handle both formats

#### 1.3 Update Admin UI - Hosts Section
- [ ] Replace single text input with:
  - List of host cards showing name, email, role
  - "Add Host" button
  - Edit/Delete buttons for each host
  - Modal/form for adding/editing hosts
- [ ] Add validation (name required, email format if provided)
- [ ] Show formatted hosts string preview for email templates

### Phase 2: Admin UI Optimizations

#### 2.1 Fix Scroll/Jump Issues
- [ ] Add `scroll-behavior: smooth` to CSS
- [ ] Prevent default scroll on tab change
- [ ] Use `useEffect` to scroll to top smoothly when tab changes
- [ ] Consider using React Router or hash-based navigation for tabs

#### 2.2 Improve Visual Hierarchy
- [ ] Add consistent spacing between sections
- [ ] Improve card styling and shadows
- [ ] Better typography hierarchy
- [ ] Consistent button styles and sizes

#### 2.3 Loading States
- [ ] Add loading spinner/skeleton for data fetching
- [ ] Disable forms during save operations
- [ ] Show progress indicators for long operations (e.g., email sending)

#### 2.4 Form Validation & Feedback
- [ ] Add inline validation for required fields
- [ ] Show error messages below inputs
- [ ] Improve success feedback (toast notifications)
- [ ] Add confirmation dialogs for destructive actions

#### 2.5 Mobile Responsiveness
- [ ] Test and fix mobile layout issues
- [ ] Improve table responsiveness (horizontal scroll or card view)
- [ ] Optimize modal sizes for mobile
- [ ] Touch-friendly button sizes

### Phase 3: Email Template Integration

#### 3.1 Update Email Variable
- [ ] Keep `{{hosts}}` variable working (format array to string)
- [ ] Add new variables:
  - `{{hostsNames}}` - Just names: "Holger, Daniela, Finn und Judith"
  - `{{hostsList}}` - Formatted list with emails if available
  - `{{hostsCount}}` - Number of hosts

#### 3.2 Update Email Preview
- [ ] Show how hosts will appear in emails
- [ ] Test with different host configurations

## Technical Details

### Hosts Migration Strategy

**Option A: Gradual Migration (Recommended)**
- Support both string and array formats
- Convert string to array on first config load
- Save as array going forward
- Format array to string for display/emails

**Option B: One-time Migration**
- Add migration script to convert all existing hosts strings to arrays
- Update all code to use array format only

### Backward Compatibility

1. **Database**: Support reading both formats
2. **Email Templates**: Always format hosts array to readable string
3. **API**: Accept both formats, normalize to array internally

## UI Mockup Ideas

### Hosts Management Section
```
┌─────────────────────────────────────────┐
│ Gastgeber                                │
│                                          │
│ ┌─────────────────────────────────────┐ │
│ │ 👤 Holger Will                      │ │
│ │    holger@example.com               │ │
│ │    [Edit] [Delete]                  │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ 👤 Daniela Schmidt                  │ │
│ │    daniela@example.com              │ │
│ │    [Edit] [Delete]                  │ │
│ └─────────────────────────────────────┘ │
│                                          │
│ [+ Gastgeber hinzufügen]                │
│                                          │
│ Vorschau für E-Mails:                   │
│ "Holger, Daniela, Finn und Judith"      │
└─────────────────────────────────────────┘
```

### Host Editor Modal
```
┌─────────────────────────────────────┐
│ Gastgeber hinzufügen/bearbeiten     │
│                                      │
│ Name *                               │
│ [________________________]          │
│                                      │
│ E-Mail (optional)                    │
│ [________________________]           │
│                                      │
│ Rolle (optional)                     │
│ [Organisator ▼]                      │
│                                      │
│ [Abbrechen]  [Speichern]            │
└─────────────────────────────────────┘
```

## Testing Checklist

- [ ] Hosts can be added, edited, and deleted
- [ ] Existing hosts string is converted to array on load
- [ ] Email templates still work with `{{hosts}}` variable
- [ ] No scroll jump when switching tabs
- [ ] Forms validate correctly
- [ ] Loading states appear during async operations
- [ ] Mobile layout works correctly
- [ ] Backward compatibility maintained

## Success Criteria

1. ✅ Hosts can be managed individually (add/edit/delete)
2. ✅ No page jumping when switching tabs
3. ✅ Better visual feedback for all actions
4. ✅ Improved mobile experience
5. ✅ Email templates continue to work
6. ✅ Backward compatibility maintained

## Future Enhancements (Out of Scope)

- Host avatars
- Host permissions/roles
- Multiple event support
- Host activity logging
- Host-specific email templates

