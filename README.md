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

## Customize

Open `src/WeddingInvite.jsx` and edit the `DATA` object near the top of the
file — names, date, venue, timeline events, verse, dress code colors, and
RSVP deadline all live there. Everything else (layout, animation, styling)
is in the same file, in a plain `<style>` string, so no CSS build step is
required.
