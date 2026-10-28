# Admin Mobile Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the admin dashboard clear and usable on phone-sized screens without changing desktop behavior or Supabase data flows.

**Architecture:** Retain `AdminPanel` state and sections. Add mobile-only CSS and a small preview-toggle control so the editor is the default mobile surface; the existing live preview is opened deliberately rather than stacked below every form.

**Tech Stack:** React 18, Vite 5, CSS embedded in `AdminPanel.jsx`.

**Spec:** `docs/superpowers/specs/2026-10-28-admin-mobile-layout-design.md`

## Global Constraints

- Reuse `activeTab`, `activeViewMode`, save, preview, and data-loading behavior.
- Do not change Supabase requests, timeline payloads, routes, or desktop layout.
- Preserve native button semantics, focus visibility, and horizontal overflow containment.

## Review Focus

- A 390px-wide Timeline editor must expose editable fields with no page-level horizontal scroll.
- Opening and closing mobile preview must preserve the selected admin tab and unsaved form state.
- The Save action must remain available on mobile.
- Desktop split, edit-only, and preview-only modes must remain unchanged.
- The mobile tab rail must remain keyboard reachable and scrollable.

---

### Task 1: Mobile editor-first controls

**Files:**
- Modify: `src/AdminPanel.jsx`
- Test: browser viewport check at 390px wide

**Interfaces:**
- Consumes: existing `activeTab`, `activeViewMode`, `setActiveViewMode`, and `setPreviewEnvelopeState` state setters.
- Produces: a mobile-only preview toggle and responsive editor navigation.

- [x] **Step 1: Establish the failing mobile reproduction**

At a 390px viewport, confirmed that the vertical sidebar list and stacked preview beneath the editor caused massive layout bloat, pushed editor fields offscreen, and triggered horizontal overflow in timeline forms.

- [x] **Step 2: Add a mobile preview toggle in `src/AdminPanel.jsx`**

Added `.ap-mobile-preview-toggle` in the navbar and `.ap-preview-back-btn` in the preview header using the existing `activeViewMode` state (`previewOnly` vs `editOnly`). Switching does not alter `activeTab` or any form data.

- [x] **Step 3: Add mobile-only responsive rules in `src/AdminPanel.jsx`**

At the mobile breakpoint (`max-width: 860px`):
- Compacted navbar with wrapping actions and hidden desktop view switcher.
- Converted sidebar navigation into a horizontal scrolling tab rail (`overflow-x: auto; flex-direction: row;`).
- Forced editor to full width and hidden preview by default when in editor mode.
- Collapsed form grids to 1 column with `grid-column: auto` on children to eliminate overflow.
- Retained full desktop split and switcher behavior above 860px.

- [x] **Step 4: Verify the mobile interaction**

Verified Timeline fields, inputs, and image pickers are responsive at 390px with zero horizontal scroll; mobile preview opens in full device frame and returns cleanly to editor with tab and form state preserved.

- [x] **Step 5: Verify build and desktop regression**

Run: `npm.cmd run build` - Exited 0 with clean Vite bundle. Desktop retained split, edit-only, and preview-only modes.
