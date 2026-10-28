# Admin Mobile Layout Design Spec

**Date:** 2026-10-28
**Scope:** Admin Panel Responsive Behavior (`/admin`)

## Background & Objective
The wedding invitation admin panel previously used a split layout (left-side editor, right-side live preview) on desktop screens. On mobile screens (such as 390px phone viewports), stacking the full live preview underneath the editor caused significant vertical clutter, layout overflowing, and prevented easy editing.

The goal is to provide an editor-first experience on mobile devices without affecting the desktop split or single-view experience or touching Supabase data flows.

## Architecture & Controls
1. **Editor-First Default on Mobile:**
   - Under the mobile breakpoint (`<= 860px`), live preview is hidden by default (`display: none`).
   - The editor occupies the full screen width.
2. **Mobile Preview Toggle:**
   - On mobile, the desktop view switcher (Split / Edit Only / Preview) is replaced by an intuitive mobile preview toggle button (`👁️ Preview` / `✏️ Editor`).
   - Tapping preview switches the view mode to `previewOnly`.
   - In preview mode, a sticky "← Back to Editor" button is provided.
   - Switching back sets view mode to `editOnly`, restoring the editor without reloading or altering `activeTab` or unsaved form state.
3. **Horizontal Tab Rail for Navigation:**
   - The sidebar vertical list is converted on mobile into a horizontally scrolling tab rail (`overflow-x: auto; flex-direction: row`).
   - Preserves native `<button>` focus, keyboard reachability, and active tab highlights.
4. **Zero Page-Level Overflow:**
   - Form grids (`.ap-grid-2`, `.ap-grid-3`, `.ap-stats-row`) collapse to 1 column on mobile with `grid-column: auto` to prevent column blowout.
   - Inputs, selects, and textareas enforce `width: 100%`, `box-sizing: border-box`, and `min-width: 0`.
   - Card padding is reduced from 32px to 16px/12px on phone screens.
