-- ============================================================================
--  WEDDING INVITE — SUPABASE DATABASE SCHEMA
-- ----------------------------------------------------------------------------
--  How to use:
--    1. Open your project at https://supabase.com  →  SQL Editor  →  New query
--    2. Paste this entire file and click "Run".
--    3. (Optional) Run supabase/seed.sql to insert the demo invitation.
--
--  Tables:
--    invitations      – one row per invitation (couple, date, venue, media, ...)
--    timeline_events  – ordered wedding-day schedule rows for an invitation
--    rsvps            – guest RSVP submissions for an invitation
--
--  The React app talks to these tables directly with the public "anon" key
--  (@supabase/supabase-js), so the row level security (RLS) policies below are
--  intentionally permissive. See the SECURITY NOTE further down.
-- ============================================================================


-- ----------------------------------------------------------------------------
--  0. Extensions
-- ----------------------------------------------------------------------------
-- gen_random_uuid() for primary keys (bundled with Postgres 13+ / Supabase).
create extension if not exists "pgcrypto";


-- ----------------------------------------------------------------------------
--  1. invitations
-- ----------------------------------------------------------------------------
create table if not exists public.invitations (
  id                  uuid        primary key default gen_random_uuid(),

  -- Identity / routing
  slug                text        not null unique,          -- e.g. "ayash-farwin"

  -- Couple & ceremony
  groom_name          text        not null default '',
  bride_name          text        not null default '',
  groom_parents       text        not null default '',
  bride_parents       text        not null default '',
  occasion            text        not null default '',
  wedding_date        timestamptz not null default now(),

  -- Venue & location
  city                text        not null default '',
  venue_title         text        not null default '',
  venue_sub           text        not null default '',
  map_query           text        not null default '',

  -- RSVP copy
  rsvp_deadline       text        not null default '',

  -- Media URLs (video / audio)
  audio_url           text        not null default '',
  envelope_video_url  text        not null default '',
  hero_video_url      text        not null default '',

  -- Media image URLs (mirrored inside the media_assets JSON column by the app)
  venue_image_url     text,
  envelope_image_url  text,
  bismillah_img       text,
  arch_frame_img      text,
  arch_floral_left    text,
  arch_floral_right   text,
  floral_left         text,
  floral_right        text,
  venue_top_flower    text,
  venue_bottom_flower text,
  timeline_flourish   text,

  -- Flexible JSON buckets
  --   media_assets : flat map of every image URL above
  media_assets        jsonb       not null default '{}'::jsonb,

  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

comment on table  public.invitations            is 'One row per wedding invitation. Keyed by a unique slug used in the invite URL (?invite=slug).';
comment on column public.invitations.media_assets is 'Flat map of image URLs (venue, florals, arch, etc.).';

-- Fast lookup by slug (also enforced unique) and by recency.
create index if not exists invitations_slug_idx       on public.invitations (slug);
create index if not exists invitations_created_at_idx on public.invitations (created_at desc);


-- ----------------------------------------------------------------------------
--  2. timeline_events
-- ----------------------------------------------------------------------------
create table if not exists public.timeline_events (
  id               uuid        primary key default gen_random_uuid(),
  invitation_id    uuid        not null references public.invitations (id) on delete cascade,

  time             text        not null default '',   -- e.g. "6:30 pm"
  title            text        not null default '',   -- e.g. "Bride Entrance"
  illustration_url text        not null default '',
  img_side         text        not null default 'left'
                     check (img_side in ('left', 'right')),
  order_index      integer     not null default 0,

  created_at       timestamptz not null default now()
);

comment on table public.timeline_events is 'Ordered schedule entries shown on the invitation timeline.';

create index if not exists timeline_events_invitation_idx
  on public.timeline_events (invitation_id, order_index);


-- ----------------------------------------------------------------------------
--  3. rsvps
-- ----------------------------------------------------------------------------
create table if not exists public.rsvps (
  id            uuid        primary key default gen_random_uuid(),
  invitation_id uuid        references public.invitations (id) on delete set null,

  guest_name    text        not null,
  attending     text        not null default 'yes'
                  check (attending in ('yes', 'no')),
  guest_count   integer     not null default 1
                  check (guest_count >= 0),

  created_at    timestamptz not null default now()
);

comment on table public.rsvps is 'Guest RSVP submissions. invitation_id may be null if submitted before an invite loaded.';

create index if not exists rsvps_invitation_idx on public.rsvps (invitation_id, created_at desc);
create index if not exists rsvps_created_at_idx on public.rsvps (created_at desc);


-- ----------------------------------------------------------------------------
--  4. updated_at trigger for invitations
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_invitations_updated_at on public.invitations;
create trigger trg_invitations_updated_at
  before update on public.invitations
  for each row execute function public.set_updated_at();


-- ----------------------------------------------------------------------------
--  5. Row Level Security
-- ----------------------------------------------------------------------------
alter table public.invitations     enable row level security;
alter table public.timeline_events enable row level security;
alter table public.rsvps           enable row level security;

-- Public invitation content: readable by anyone (guests).
drop policy if exists "invitations_select_public" on public.invitations;
create policy "invitations_select_public"
  on public.invitations for select
  to anon, authenticated
  using (true);

-- Admin panel writes with the anon key (see SECURITY NOTE below).
drop policy if exists "invitations_write_anon" on public.invitations;
create policy "invitations_write_anon"
  on public.invitations for all
  to anon, authenticated
  using (true) with check (true);

-- Timeline: world readable, admin writable.
drop policy if exists "timeline_events_select_public" on public.timeline_events;
create policy "timeline_events_select_public"
  on public.timeline_events for select
  to anon, authenticated
  using (true);

drop policy if exists "timeline_events_write_anon" on public.timeline_events;
create policy "timeline_events_write_anon"
  on public.timeline_events for all
  to anon, authenticated
  using (true) with check (true);

-- RSVPs: guests may insert + read (admin needs read), admin may delete/update.
drop policy if exists "rsvps_select_anon" on public.rsvps;
create policy "rsvps_select_anon"
  on public.rsvps for select
  to anon, authenticated
  using (true);

drop policy if exists "rsvps_insert_anon" on public.rsvps;
create policy "rsvps_insert_anon"
  on public.rsvps for insert
  to anon, authenticated
  with check (true);

drop policy if exists "rsvps_modify_anon" on public.rsvps;
create policy "rsvps_modify_anon"
  on public.rsvps for update
  to anon, authenticated
  using (true) with check (true);

drop policy if exists "rsvps_delete_anon" on public.rsvps;
create policy "rsvps_delete_anon"
  on public.rsvps for delete
  to anon, authenticated
  using (true);


-- ============================================================================
--  SECURITY NOTE
-- ----------------------------------------------------------------------------
--  This project ships without authentication: the admin panel and the public
--  invitation use the same public "anon" key. The policies above therefore let
--  ANYONE holding the anon key edit invitations, timeline events and wipe RSVPs.
--  That is fine for a throwaway/personal invite, but NOT for sensitive data.
--
--  To harden later (recommended):
--    1. Enable Supabase Auth and create an "admin" user.
--    2. Restrict write policies to that user, e.g.:
--         using ( (auth.jwt() ->> 'email') = 'you@example.com' )
--    3. Keep SELECT open only for the invitation/timeline content.
--    4. Never expose the service_role key in the frontend.
-- ============================================================================
