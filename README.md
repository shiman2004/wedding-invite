# Wedding Invite — React Project

A single-page animated wedding invitation: envelope open, scratch-to-reveal
date, live countdown, embedded map, timeline, dress code, and RSVP.

## Run locally

```bash
npm install
npm run dev
```

Then open the printed local URL in your browser.

## Build for hosting

```bash
npm run build
```

This outputs a static site into `dist/` that you can deploy anywhere
(Netlify, Vercel, GitHub Pages, etc.).

## Supabase database

The app stores its data in Supabase (Postgres). The schema lives in
[`supabase/schema.sql`](supabase/schema.sql) and demo data in
[`supabase/seed.sql`](supabase/seed.sql).

**Set up:**

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor → New query**, paste the contents of
   `supabase/schema.sql`, and click **Run**.
3. *(Optional)* Repeat with `supabase/seed.sql` to load the demo invitation.
4. Copy your credentials from **Project Settings → API** and create a `.env`
   file in the project root (see `.env.example`):

   ```env
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

5. Restart `npm run dev`. Without these variables the app falls back to its
   built-in defaults and RSVPs are not saved.

**Tables:**

| Table            | Purpose                                                       |
| ---------------- | ------------------------------------------------------------- |
| `invitations`    | One row per invite (couple, date, venue, media).              |
| `timeline_events`| Ordered wedding-day schedule rows linked to an invitation.    |
| `rsvps`          | Guest RSVP submissions linked to an invitation.               |

> **Security:** The admin panel and the public invite share the same `anon`
> key, so the included RLS policies are permissive (anyone with the anon key
> can edit content or delete RSVPs). That is fine for a personal invite; add
> Supabase Auth and tighten the write policies before storing anything
> sensitive. See the note at the bottom of `supabase/schema.sql`.

## Customize

Open `src/WeddingInvite.jsx` and edit the `DATA` object near the top of the
file — names, date, venue, timeline events, verse, dress code colors, and
RSVP deadline all live there. Everything else (layout, animation, styling)
is in the same file, in a plain `<style>` string, so no CSS build step is
required.
