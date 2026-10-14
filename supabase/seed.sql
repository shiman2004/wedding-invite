-- ============================================================================
--  WEDDING INVITE — OPTIONAL DEMO SEED DATA
-- ----------------------------------------------------------------------------
--  Run AFTER supabase/schema.sql.
--  Inserts the "ayash-farwin" invitation and its timeline shown by the app's
--  built-in defaults. Safe to re-run: existing slug is left untouched.
-- ============================================================================

-- 1. Invitation --------------------------------------------------------------
insert into public.invitations (
  slug,
  groom_name,
  bride_name,
  groom_parents,
  bride_parents,
  occasion,
  wedding_date,
  city,
  venue_title,
  venue_sub,
  map_query,
  rsvp_deadline,
  audio_url,
  envelope_video_url,
  hero_video_url,
  venue_image_url,
  envelope_image_url,
  bismillah_img,
  arch_frame_img,
  arch_floral_left,
  arch_floral_right,
  floral_left,
  floral_right,
  venue_top_flower,
  venue_bottom_flower,
  timeline_flourish
) values (
  'ayash-farwin',
  'Ayash',
  'Farwin',
  'MR & MRS CH. HUSSAINI',
  'MR & MRS CH. FAROOQI',
  'Nikkah Ceremony',
  '2027-01-10T18:00:00Z',
  'DUBAI',
  'Four Seasons Hotel Jumeirah',
  'Dana Ballroom',
  'Four Seasons Resort Dubai at Jumeirah Beach',
  '30 November 2026',
  'https://pub-4dc8201144ca418fb604349c73e8c724.r2.dev/Einaudi_%20Divenire%20(1)%20(1).mp3',
  '/Envelope%20Cover%20Video%202.mp4',
  'https://pub-4dc8201144ca418fb604349c73e8c724.r2.dev/Newbeautifulvideo.mp4',
  'https://static.tildacdn.net/tild6462-3635-4461-a162-303965356266/Screenshot_2026-08-0.png',
  '/Envelope%20Cover%20Photo%203.png',
  'https://static.tildacdn.net/tild3561-3634-4134-b365-373438636335/Group_269_1.png',
  'https://static.tildacdn.net/tild6665-3331-4665-b937-616331303830/noroot.png',
  'https://static.tildacdn.net/tild3337-3937-4162-b935-356566376533/ChatGPT_Image_Jul_5_.png',
  'https://static.tildacdn.net/tild6635-3066-4365-b962-353461316561/Group_304-Photoroom.png',
  'https://static.tildacdn.net/tild3238-6635-4563-b336-356564353735/Group_305.png',
  'https://static.tildacdn.net/tild3935-6639-4836-b366-623864343762/Group_306.png',
  'https://static.tildacdn.net/tild3935-6639-4836-b366-623864343762/Group_306.png',
  'https://static.tildacdn.net/tild3238-6635-4563-b336-356564353735/Group_305.png',
  'https://static.tildacdn.net/tild6262-3636-4964-a632-666535323935/ChatGPT_Image_Jul_24.png'
)
on conflict (slug) do nothing;


-- 2. Timeline events ---------------------------------------------------------
-- Only seed when this invitation has no events yet.
insert into public.timeline_events (invitation_id, time, title, illustration_url, img_side, order_index)
select
  inv.id,
  ev.time,
  ev.title,
  ev.illustration_url,
  ev.img_side,
  ev.order_index
from public.invitations inv
cross join (values
  ('6:00 pm',  'Guest Arrival and Welcome Drinks', 'https://static.tildacdn.net/tild3965-3466-4265-b863-373664656661/ChatGPT_Image_Jul_24.png', 'left',  0),
  ('6:30 pm',  'Bride Entrance',                   'https://static.tildacdn.net/tild6166-3066-4762-a161-623234663434/ChatGPT_Image_Jul_24.png', 'right', 1),
  ('7:30 pm',  'Salat al Isha',                    'https://static.tildacdn.net/tild3539-6537-4937-a165-616566313532/ChatGPT_Image_Jul_24.png', 'left',  2),
  ('8:30 pm',  'Buffet Opening',                   'https://static.tildacdn.net/tild3335-3735-4630-b061-303735666263/ChatGPT_Image_Jul_24.png', 'right', 3),
  ('10:00 pm', 'Let the Fun Begin',                'https://static.tildacdn.net/tild6430-6536-4230-b334-383333623035/ChatGPT_Image_Jul_24.png', 'left',  4)
) as ev(time, title, illustration_url, img_side, order_index)
where inv.slug = 'ayash-farwin'
  and not exists (
    select 1 from public.timeline_events t where t.invitation_id = inv.id
  );
