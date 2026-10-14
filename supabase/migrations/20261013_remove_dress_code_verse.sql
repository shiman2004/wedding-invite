-- ============================================================================
--  MIGRATION — remove the "Dress Code & Quranic Verse" feature
-- ----------------------------------------------------------------------------
--  The app no longer uses dress_code, verse_text or verse_ref. Run this once
--  against an existing database that was created before the feature was
--  removed (fresh installs from schema.sql already omit these columns).
--
--  Safe to run multiple times (IF EXISTS).
-- ============================================================================

-- Preserve any media URLs that were previously stashed inside dress_code
-- before dropping the column.
update public.invitations
set media_assets = coalesce(dress_code -> 'media_assets', '{}'::jsonb)
where dress_code ? 'media_assets'
  and (media_assets is null or media_assets = '{}'::jsonb);

alter table public.invitations
  drop column if exists dress_code,
  drop column if exists verse_text,
  drop column if exists verse_ref;
