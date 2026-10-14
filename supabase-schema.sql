-- Wedding Invite Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create invitations table
CREATE TABLE invitations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  groom_name TEXT NOT NULL,
  bride_name TEXT NOT NULL,
  groom_parents TEXT,
  bride_parents TEXT,
  occasion TEXT DEFAULT 'Nikkah Ceremony',
  wedding_date TIMESTAMP WITH TIME ZONE NOT NULL,
  city TEXT,
  venue_title TEXT,
  venue_sub TEXT,
  map_query TEXT,
  venue_image_url TEXT,
  rsvp_deadline TEXT,
  invitation_greeting TEXT DEFAULT 'Dear Friends and Family',
  invitation_text TEXT,
  audio_url TEXT,
  envelope_video_url TEXT,
  envelope_image_url TEXT,
  hero_video_url TEXT,
  bismillah_img TEXT,
  arch_frame_img TEXT,
  arch_floral_left TEXT,
  arch_floral_right TEXT,
  floral_left TEXT,
  floral_right TEXT,
  venue_top_flower TEXT,
  venue_bottom_flower TEXT,
  timeline_flourish TEXT,
  timeline_top_spire TEXT,
  timeline_bottom_spire TEXT,
  timeline_rosette TEXT,
  media_assets JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create timeline_events table
CREATE TABLE timeline_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  invitation_id UUID REFERENCES invitations(id) ON DELETE CASCADE NOT NULL,
  time TEXT NOT NULL,
  title TEXT NOT NULL,
  illustration_url TEXT,
  img_side TEXT CHECK (img_side IN ('left', 'right')) DEFAULT 'left',
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create rsvps table
CREATE TABLE rsvps (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  invitation_id UUID REFERENCES invitations(id) ON DELETE CASCADE,
  guest_name TEXT NOT NULL,
  attending TEXT CHECK (attending IN ('yes', 'no')) NOT NULL,
  guest_count INTEGER DEFAULT 0,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_invitations_slug ON invitations(slug);
CREATE INDEX idx_timeline_events_invitation_id ON timeline_events(invitation_id);
CREATE INDEX idx_rsvps_invitation_id ON rsvps(invitation_id);

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_invitations_updated_at
  BEFORE UPDATE ON invitations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
