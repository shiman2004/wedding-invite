import React, { useState, useEffect, useRef, useCallback } from "react";
import { supabase, isSupabaseConfigured } from "./supabase";

/* ------------------------------------------------------------------ */
/*  DATA & CONFIGURATION                                              */
/* ------------------------------------------------------------------ */
const DATA = {
  partnerA: "Ayash",
  partnerB: "Farwin",
  groomParents: "MR & MRS CH. HUSSAINI",
  brideParents: "MR & MRS CH. FAROOQI",
  occasion: "Nikkah Ceremony",
  verse: "And We created you in pairs.",
  verseRef: "Surah An-Naba 78:8",
  weddingDate: new Date("2027-01-10T18:00:00"),
  dateParts: { day: "10", month: "January", year: "2027" },
  city: "DUBAI",
  venueTitle: "Four Seasons Hotel in Jumeirah,",
  venueSub: "Dana Ballroom",
  mapQuery: "Four Seasons Resort Dubai at Jumeirah Beach",
  venueImg: "https://static.tildacdn.net/tild6462-3635-4461-a162-303965356266/Screenshot_2026-08-0.png",
  venueTopFlower: "https://static.tildacdn.net/tild3935-6639-4836-b366-623864343762/Group_306.png",
  venueBottomFlower: "https://static.tildacdn.net/tild3238-6635-4563-b336-356564353735/Group_305.png",
  rsvpBy: "30 November 2026",
  invitationGreeting: "Dear Friends and Family",
  invitationText: "Join us for an evening of love, laughter, duas, and unforgettable memories as we begin our forever.",
  /* Timeline Assets & Data */
  timelineFlourish: "https://static.tildacdn.net/tild6262-3636-4964-a632-666535323935/ChatGPT_Image_Jul_24.png",
  timelineTopSpire: "https://static.tildacdn.net/tild6363-6533-4164-b433-316434383166/up.png",
  timelineBottomSpire: "https://static.tildacdn.net/tild3765-6366-4436-b364-636630313232/sown.png",
  timelineRosette: "https://static.tildacdn.net/tild3565-6561-4334-b335-386634333338/ChatGPT_Image_Jul_6_.png",
  timeline: [
    {
      time: "6:00 pm",
      title: "Guest Arrival and Welcome Drinks",
      illustration: "https://static.tildacdn.net/tild3965-3466-4265-b863-373664656661/ChatGPT_Image_Jul_24.png",
      imgSide: "left",
      alt: "Guest Arrival & Welcome Drinks",
    },
    {
      time: "6:30 pm",
      title: "Bride Entrance",
      illustration: "https://static.tildacdn.net/tild6166-3066-4762-a161-623234663434/ChatGPT_Image_Jul_24.png",
      imgSide: "right",
      alt: "Bride Entrance",
    },
    {
      time: "7:30 pm",
      title: "Salat al Isha",
      illustration: "https://static.tildacdn.net/tild3539-6537-4937-a165-616566313532/ChatGPT_Image_Jul_24.png",
      imgSide: "left",
      alt: "Salat al Isha",
    },
    {
      time: "8:30 pm",
      title: "Buffet Opening",
      illustration: "https://static.tildacdn.net/tild3335-3735-4630-b061-303735666263/ChatGPT_Image_Jul_24.png",
      imgSide: "right",
      alt: "Buffet Opening",
    },
    {
      time: "10:00 pm",
      title: "Let the Fun Begin",
      illustration: "https://static.tildacdn.net/tild6430-6536-4230-b334-383333623035/ChatGPT_Image_Jul_24.png",
      imgSide: "left",
      alt: "Celebration",
    },
  ],
  dressCode: {
    title: "Soft Pastel Shades",
    note: "We kindly invite our guests to dress in soft pastel shades. Please avoid wearing beige, as it is reserved for the bride and groom.",
    palette: ["#F6E7D8", "#E8D5C4", "#D8E2DC", "#FFE5D9", "#ECE4DB"],
  },
  audioUrl: "https://pub-4dc8201144ca418fb604349c73e8c724.r2.dev/Einaudi_%20Divenire%20(1)%20(1).mp3",
  envelopeImg: "/Envelope%20Cover%20Photo%203.png",
  envelopeVideo: "/Envelope%20Cover%20Video%202.mp4",
  heroVideo: "https://pub-4dc8201144ca418fb604349c73e8c724.r2.dev/Newbeautifulvideo.mp4",
  floralLeft: "https://static.tildacdn.net/tild3238-6635-4563-b336-356564353735/Group_305.png",
  floralRight: "https://static.tildacdn.net/tild3935-6639-4836-b366-623864343762/Group_306.png",

  /* Authentic Timeless Grace Arch Assets */
  archFrameImg: "https://static.tildacdn.net/tild6665-3331-4665-b937-616331303830/noroot.png",
  bismillahImg: "https://static.tildacdn.net/tild3561-3634-4134-b365-373438636335/Group_269_1.png",
  archFloralLeft: "https://static.tildacdn.net/tild3337-3937-4162-b935-356566376533/ChatGPT_Image_Jul_5_.png",
  archFloralRight: "https://static.tildacdn.net/tild6635-3066-4365-b962-353461316561/Group_304-Photoroom.png",
};

/* ------------------------------------------------------------------ */
/*  STYLES                                                            */
/* ------------------------------------------------------------------ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Alex+Brush&family=Cinzel:wght@400;500;600;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400;1,500;1,600&family=Great+Vibes&family=Imperial+Script&family=MonteCarlo&family=Montserrat:wght@300;400;500&family=Pinyon+Script&family=Rufina:wght@400;700&family=Tangerine:wght@400;700&display=swap');

:root {
  --bg-cream: #F9F0E0;
  --card-bg: #FDF6EE;
  --gold: #AD8A4E;
  --gold-deep: #8A6B34;
  --gold-btn: #CFAB66;
  --gold-dark: #6E4E24;
  --ink: #3E3123;
  --ink-soft: #6E5C46;
  --line: rgba(138, 107, 52, 0.22);
}

body {
  margin: 0;
  padding: 0;
  background-color: var(--bg-cream);
  font-family: 'Cormorant Garamond', Georgia, serif;
  color: var(--ink);
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}

.wi-root {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  background: #F9F0E0;
  padding: 0;
  box-sizing: border-box;
}

.wi-frame {
  width: 100%;
  max-width: 440px;
  background: var(--card-bg);
  position: relative;
  overflow: hidden;
  box-shadow: 0 0 50px rgba(62, 49, 35, 0.12);
  border-radius: 0;
  min-height: 100vh;
  margin: 0 auto;
}

/* ============================================================
   SEAMLESS ENVELOPE OVERLAY & VIDEO
   ============================================================ */
.wei-overlay {
  position: fixed;
  inset: 0;
  z-index: 99999;
  background: #F9F0E0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
  transition: opacity 1.1s cubic-bezier(0.4, 0, 0.2, 1), visibility 1.1s;
}

.wei-overlay.wei-hidden {
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
}

.wei-envelope-holder {
  position: relative;
  width: 100vw;
  height: 100vh;
  max-width: 100vw;
  max-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 0;
  box-shadow: none;
  background: #F9F0E0;
}

.wei-envelope-media {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: contain;
}

@media (max-width: 600px) {
  .wei-envelope-media {
    object-fit: cover;
  }
}

.wei-cover-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 2;
  transition: opacity 0.45s ease;
  pointer-events: none;
}

.wei-cover-img.wei-faded {
  opacity: 0;
}

.wei-tap-wrap {
  position: absolute;
  bottom: 28%;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  z-index: 3;
  transition: opacity 0.4s ease, transform 0.4s ease;
  animation: weiTapIn 1.2s 0.8s both;
}

.wei-tap-wrap.wei-faded {
  opacity: 0;
  transform: translateX(-50%) translateY(10px);
}

@keyframes weiTapIn {
  from { opacity: 0; transform: translateX(-50%) translateY(8px); }
  to   { opacity: 1; transform: translateX(-50%) translateY(0); }
}

.wei-tap-label {
  font-family: 'Cinzel', Georgia, serif;
  font-size: 11px;
  letter-spacing: 0.26em;
  text-transform: uppercase;
  color: rgba(140, 100, 60, 0.85);
  animation: weiPulse 2.4s 1.6s ease-in-out infinite;
  white-space: nowrap;
}

@keyframes weiPulse {
  0%, 100% { opacity: 0.55; letter-spacing: 0.26em; }
  50%       { opacity: 1;    letter-spacing: 0.32em; }
}

.wei-chevron-tap {
  width: 10px;
  height: 10px;
  border-right: 1.8px solid rgba(140, 100, 60, 0.7);
  border-top: 1.8px solid rgba(140, 100, 60, 0.7);
  transform: rotate(-45deg);
  animation: weiChevron 2.4s 1.9s ease-in-out infinite;
}

@keyframes weiChevron {
  0%, 100% { transform: rotate(-45deg) translate(0, 0); opacity: 0.6; }
  50%       { transform: rotate(-45deg) translate(2px, -2px); opacity: 1; }
}

/* Floating Audio Toggle Button */
.wei-audio-btn {
  position: fixed;
  bottom: 22px;
  right: 22px;
  width: 52px;
  height: 52px;
  background: var(--gold-btn);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100001;
  cursor: pointer;
  box-shadow: 0 6px 18px rgba(140, 100, 60, 0.35);
  transition: transform 0.25s ease, opacity 0.4s ease, box-shadow 0.25s ease;
  border: 1px solid rgba(255, 255, 255, 0.4);
}

.wei-audio-btn:hover {
  transform: scale(1.06);
  box-shadow: 0 8px 22px rgba(140, 100, 60, 0.45);
}

.wei-audio-btn svg {
  width: 24px;
  height: 24px;
  fill: #FFFFFF;
}

/* ============================================================
   MAIN CONTENT SHELL
   ============================================================ */
.wi-content {
  position: relative;
  opacity: 0;
  transform: translateY(12px);
  transition: opacity 1.1s ease 0.2s, transform 1.1s ease 0.2s;
}

.wi-content.wi-visible {
  opacity: 1;
  transform: translateY(0);
}

/* ============================================================
   HERO / FIRST PAGE SECTION
   ============================================================ */
.wi-hero {
  position: relative;
  width: 100%;
  height: 100vh;
  min-height: 100vh;
  overflow: hidden;
  background-color: #FDF4EB;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.wi-hero-video-wrap {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 1;
}

.wi-hero-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* Ambient glow & vignette overlay in arch */
.wi-hero-glow {
  position: absolute;
  top: 100px;
  left: 50%;
  transform: translateX(-50%);
  width: 340px;
  height: 340px;
  background: radial-gradient(circle at center, rgba(249, 237, 224, 0.95) 0%, rgba(255, 247, 210, 0.4) 45%, rgba(255, 255, 255, 0) 75%);
  z-index: 2;
  pointer-events: none;
}

.wi-hero-bottom-fade {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 220px;
  background: linear-gradient(0deg, #FDF4EB 0%, rgba(253, 244, 235, 0.85) 45%, rgba(253, 244, 235, 0) 100%);
  z-index: 2;
  pointer-events: none;
}

/* Swaying Corner Floral Arrangements */
.wi-floral-left {
  position: absolute;
  bottom: 0;
  left: -20px;
  width: 220px;
  height: auto;
  z-index: 3;
  pointer-events: none;
  animation: floralSwayLeft 7s ease-in-out infinite alternate;
}

.wi-floral-right {
  position: absolute;
  bottom: 0;
  right: -20px;
  width: 220px;
  height: auto;
  z-index: 3;
  pointer-events: none;
  animation: floralSwayRight 7.5s ease-in-out infinite alternate;
}

@keyframes floralSwayLeft {
  0%   { transform: rotate(0deg) scale(1); }
  50%  { transform: rotate(-2deg) scale(1.02) translate(2px, -3px); }
  100% { transform: rotate(1.5deg) scale(0.99) translate(-2px, 1px); }
}

@keyframes floralSwayRight {
  0%   { transform: rotate(0deg) scale(1); }
  50%  { transform: rotate(2deg) scale(1.02) translate(-2px, -3px); }
  100% { transform: rotate(-1.5deg) scale(0.99) translate(2px, 1px); }
}

/* Hero Typography Overlay */
.wi-hero-content {
  position: relative;
  z-index: 4;
  margin-top: 155px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  width: 90%;
}

.wi-hero-eyebrow {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 15px;
  font-style: italic;
  font-weight: 500;
  letter-spacing: 1.5px;
  color: #725227;
  text-shadow: 0 1px 3px rgba(255, 255, 255, 0.9), 0 0 12px rgba(255, 245, 225, 0.9);
  margin-bottom: 2px;
}

.wi-hero-occasion {
  font-family: 'Pinyon Script', 'Alex Brush', cursive;
  font-size: 40px;
  color: #63431D;
  margin: 0 0 2px;
  line-height: 1.1;
  font-weight: 400;
  text-shadow: 0 1px 3px rgba(255, 255, 255, 0.9), 0 0 15px rgba(255, 245, 225, 0.9);
}

.wi-hero-of-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin: 2px 0 4px;
}

.wi-flourish-line {
  width: 32px;
  height: 1px;
  background: linear-gradient(90deg, transparent, #8A6B34, transparent);
  position: relative;
}

.wi-flourish-line::after {
  content: '◆';
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  font-size: 5px;
  color: #8A6B34;
}

.wi-hero-of {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 14px;
  font-style: italic;
  color: #725227;
  letter-spacing: 2px;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.9);
}

.wi-hero-names {
  font-family: 'Great Vibes', 'Alex Brush', cursive;
  font-size: 54px;
  line-height: 1.05;
  color: #5C411D;
  font-weight: 400;
  margin-top: 2px;
  text-shadow: 0 1px 3px rgba(255, 255, 255, 0.95), 0 0 18px rgba(255, 245, 225, 0.95);
}

.wi-hero-name {
  display: block;
}

.wi-hero-amp {
  font-family: 'Great Vibes', 'Alex Brush', cursive;
  font-size: 32px;
  display: block;
  color: #8A6B34;
  margin: -6px 0 -4px;
}

.wi-scroll-cue {
  position: absolute;
  bottom: 22px;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  z-index: 4;
}

.wi-scroll-cue span {
  display: block;
  font-family: 'Pinyon Script', 'Great Vibes', cursive;
  font-size: 26px;
  color: #725227;
  margin-bottom: 2px;
  text-shadow: 0 1px 3px rgba(255, 255, 255, 0.9);
}

.wi-chevron {
  width: 9px;
  height: 9px;
  border-right: 1.8px solid #725227;
  border-bottom: 1.8px solid #725227;
  transform: rotate(45deg);
  margin: 0 auto;
  animation: wi-bob 1.8s ease-in-out infinite;
}

@keyframes wi-bob {
  0%, 100% { transform: rotate(45deg) translate(-50%, 0); }
  50%      { transform: rotate(45deg) translate(-50%, 6px); }
}

/* ============================================================
   SECTIONS STYLING
   ============================================================ */
.wi-section {
  padding: 56px 28px;
  text-align: center;
  position: relative;
  background: #FDF6EE;
}

.wi-section + .wi-section {
  border-top: 1px solid var(--line);
}

.wi-script-title {
  font-family: 'Imperial Script', cursive;
  font-size: 52px;
  color: var(--gold-deep);
  line-height: 1.1;
  font-weight: 400;
  margin: 0 0 6px;
}

.wi-heading {
  font-family: 'Cinzel', 'Cormorant Garamond', serif;
  font-size: 14px;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: var(--ink-soft);
  margin: 0 0 8px;
}

.wi-rule {
  width: 60px;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--gold), transparent);
  margin: 14px auto 24px;
}

/* ============================================================
   DATE SCRATCH CARDS
   ============================================================ */
.wi-hint {
  font-size: 15px;
  font-style: italic;
  color: var(--gold-deep);
  letter-spacing: 0.5px;
  margin-bottom: 26px;
}

.wi-hint .wi-star {
  opacity: 0.7;
}

.wi-cards {
  display: flex;
  gap: clamp(6px, 2.4vw, 12px);
  justify-content: center;
  max-width: 100%;
}

.wi-card {
  width: clamp(82px, 27vw, 98px);
  flex-shrink: 1;
}

.wi-scratch-box {
  position: relative;
  width: 100%;
  aspect-ratio: 98 / 126;
  border-radius: clamp(10px, 3vw, 14px);
  background: radial-gradient(circle at 50% 40%, #FFFDF8 25%, #F8EEDB 75%, #EDD4B4 100%);
  border: 1px solid rgba(195, 160, 110, 0.45);
  box-shadow: 0 8px 24px -6px rgba(160, 120, 70, 0.22), inset 0 0 14px rgba(255, 255, 255, 0.7);
  overflow: hidden;
  cursor: grab;
  touch-action: none;
  transition: border-color 0.5s ease, box-shadow 0.5s ease;
}

.wi-scratch-box.wi-revealed {
  border-color: rgba(188, 142, 68, 0.55);
  box-shadow: 0 10px 28px -6px rgba(175, 130, 75, 0.28), inset 0 0 16px rgba(255, 255, 255, 0.85);
}

.wi-scratch-answer {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: clamp(23px, 7vw, 29px);
  font-weight: 500;
  color: #8F6629;
  padding: 4px;
  text-align: center;
  line-height: 1;
  background: radial-gradient(circle at 50% 40%, #FFFDF8 25%, #F8EEDB 75%, #EDD4B4 100%);
  text-shadow: 0 1px 1px rgba(255, 255, 255, 0.9);
  user-select: none;
}

.wi-scratch-answer.wi-text-month {
  font-size: clamp(18px, 5.5vw, 24px);
}

.wi-scratch-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  touch-action: none;
  cursor: grab;
  transition: opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), filter 0.6s ease;
}

.wi-scratch-canvas.wi-canvas-dissolve {
  opacity: 0;
  filter: blur(4px) brightness(1.15);
  pointer-events: none;
}

.wi-card-label {
  margin-top: 14px;
  font-family: 'Cinzel', serif;
  font-size: 11px;
  letter-spacing: 0.32em;
  text-transform: uppercase;
  color: #8F6629;
  text-align: center;
}

/* ============================================================
   AUTHENTIC 3D ISLAMIC ARCH INVITATION CARD
   ============================================================ */
.wi-arch-section {
  padding: 35px 0 45px;
  background: #FDF4EB;
  display: flex;
  justify-content: center;
  position: relative;
  overflow: hidden;
  border-top: 1px solid var(--line);
}

.wi-arch-container {
  position: relative;
  width: 100%;
  max-width: 440px;
  aspect-ratio: 440 / 842;
  display: block;
  margin: 0 auto;
}

.wi-arch-frame-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: fill;
  pointer-events: none;
  z-index: 1;
}

.wi-arch-bismillah {
  position: absolute;
  top: 21.6%;
  left: 50%;
  transform: translateX(-50%);
  width: 30%;
  max-width: 135px;
  height: auto;
  opacity: 0.9;
  z-index: 2;
}

.wi-arch-heading {
  position: absolute;
  top: 29.0%;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  text-align: center;
  font-family: 'Rufina', 'Cinzel', serif;
  font-size: clamp(10.5px, 2.7vw, 12.5px);
  line-height: 1.4;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: #806B43;
  font-weight: 600;
  z-index: 2;
}

.wi-arch-name-groom {
  position: absolute;
  top: 34.0%;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  text-align: center;
  font-family: 'Imperial Script', cursive;
  font-size: clamp(56px, 15vw, 68px);
  color: #A68547;
  line-height: 1;
  font-weight: 400;
  z-index: 2;
}

.wi-arch-rel-groom {
  position: absolute;
  top: 48.0%;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  text-align: center;
  font-family: 'Cinzel', serif;
  font-size: clamp(9px, 2.2vw, 10.5px);
  letter-spacing: 0.26em;
  text-transform: uppercase;
  color: #806B43;
  font-weight: 600;
  z-index: 2;
}

.wi-arch-parents-groom {
  position: absolute;
  top: 50.6%;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  text-align: center;
  font-family: 'Cinzel', serif;
  font-size: clamp(10px, 2.4vw, 11.5px);
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #806B43;
  font-weight: 600;
  z-index: 2;
}

.wi-arch-with {
  position: absolute;
  top: 53.4%;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  text-align: center;
  font-family: 'Imperial Script', cursive;
  font-size: clamp(30px, 8vw, 36px);
  color: #806B43;
  line-height: 1;
  font-weight: 400;
  z-index: 2;
}

.wi-arch-name-bride {
  position: absolute;
  top: 56.8%;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  text-align: center;
  font-family: 'Imperial Script', cursive;
  font-size: clamp(56px, 15vw, 68px);
  color: #A68547;
  line-height: 1;
  font-weight: 400;
  z-index: 2;
}

.wi-arch-rel-bride {
  position: absolute;
  top: 70.8%;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  text-align: center;
  font-family: 'Cinzel', serif;
  font-size: clamp(9px, 2.2vw, 10.5px);
  letter-spacing: 0.26em;
  text-transform: uppercase;
  color: #806B43;
  font-weight: 600;
  z-index: 2;
}

.wi-arch-parents-bride {
  position: absolute;
  top: 73.2%;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  text-align: center;
  font-family: 'Cinzel', serif;
  font-size: clamp(10px, 2.4vw, 11.5px);
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #806B43;
  font-weight: 600;
  z-index: 2;
}

.wi-arch-greeting {
  position: absolute;
  top: 77.0%;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  text-align: center;
  font-family: 'Imperial Script', cursive;
  font-size: clamp(26px, 7vw, 32px);
  color: #806B43;
  line-height: 1;
  font-weight: 400;
  z-index: 2;
}

.wi-arch-msg {
  position: absolute;
  top: 81.4%;
  left: 50%;
  transform: translateX(-50%);
  width: 72%;
  text-align: center;
  font-family: 'Rufina', 'Cormorant Garamond', Georgia, serif;
  font-size: clamp(12.5px, 3.2vw, 14.5px);
  font-style: italic;
  line-height: 1.45;
  color: #806B43;
  z-index: 2;
}

.wi-arch-flower-left {
  position: absolute;
  bottom: 0px;
  left: -12px;
  width: 34%;
  max-width: 140px;
  height: auto;
  z-index: 3;
  pointer-events: none;
  opacity: 0.95;
}

.wi-arch-flower-right {
  position: absolute;
  bottom: 0px;
  right: -12px;
  width: 34%;
  max-width: 140px;
  height: auto;
  z-index: 3;
  pointer-events: none;
  opacity: 0.95;
}

/* ============================================================
   VERSE
   ============================================================ */
.wi-verse-section {
  background: #F8EFE4;
}

.wi-verse {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-style: italic;
  font-size: 24px;
  line-height: 1.5;
  color: var(--ink);
}

.wi-verse-ref {
  margin-top: 12px;
  font-family: 'Cinzel', serif;
  font-size: 12px;
  letter-spacing: 2px;
  color: var(--gold-deep);
}

/* ============================================================
   TIMELINE (AUTHENTIC TIMELESS GRACE & SCROLL REVEAL)
   ============================================================ */
.wi-timeline-section {
  padding: 40px 16px 36px;
  background: #FDF6EE;
  overflow: hidden;
  position: relative;
}

.wi-timeline-script-title {
  font-family: 'Pinyon Script', 'Imperial Script', 'Alex Brush', cursive;
  font-size: 46px;
  color: #806b43;
  line-height: 1.1;
  font-weight: 400;
  margin: 0 0 2px;
  text-align: center;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
}

.wi-timeline-flourish {
  display: flex;
  justify-content: center;
  margin: 4px auto 16px;
}

.wi-timeline-flourish-img {
  width: 165px;
  max-width: 80%;
  height: auto;
  opacity: 0.95;
  filter: drop-shadow(0 1px 2px rgba(128, 107, 67, 0.15));
}

.wi-timeline-container {
  position: relative;
  max-width: 410px;
  margin: 0 auto;
  padding: 0;
}

.wi-tl-spire {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  z-index: 3;
}

.wi-tl-spire-top {
  margin-bottom: -1px;
}

.wi-tl-spire-top img {
  width: 14px;
  height: 24px;
  object-fit: cover;
  object-position: top;
  display: block;
}

.wi-tl-spire-bottom {
  margin-top: -1px;
}

.wi-tl-spire-bottom img {
  width: 14px;
  height: 24px;
  object-fit: cover;
  object-position: bottom;
  display: block;
}

.wi-tl-spine-line {
  position: absolute;
  top: 14px;
  bottom: 14px;
  left: 50%;
  width: 1px;
  transform: translateX(-50%);
  background: linear-gradient(180deg, 
    rgba(128, 107, 67, 0.25) 0%, 
    rgba(128, 107, 67, 0.75) 8%, 
    rgba(128, 107, 67, 0.75) 92%, 
    rgba(128, 107, 67, 0.25) 100%
  );
  z-index: 1;
}

.wi-tl-rows {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 6px 0;
}

.wi-tl-row {
  display: grid;
  grid-template-columns: 1fr clamp(28px, 8vw, 36px) 1fr;
  align-items: center;
  width: 100%;
  position: relative;
  min-height: 95px;
}

.wi-tl-col {
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
}

.wi-tl-left {
  align-items: flex-end;
  padding-right: clamp(6px, 2.2vw, 14px);
  text-align: right;
}

.wi-tl-right {
  align-items: flex-start;
  padding-left: clamp(6px, 2.2vw, 14px);
  text-align: left;
}

.wi-tl-center {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  height: 100%;
}

.wi-tl-node {
  width: clamp(18px, 5.5vw, 22px);
  height: clamp(18px, 5.5vw, 22px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 4;
  transition: transform 0.75s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.75s ease;
  opacity: 0;
  transform: scale(0.2) rotate(-90deg);
}

.wi-tl-rosette-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 1px 2px rgba(128, 107, 67, 0.3));
}

.wi-tl-node-diamond {
  width: 9px;
  height: 9px;
  background: #C4A468;
  transform: rotate(45deg);
  border: 1px solid #806b43;
  box-shadow: 0 0 6px rgba(196, 164, 104, 0.6);
}

.wi-tl-img-box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  transition: transform 0.85s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.85s ease;
}

.wi-tl-img {
  max-width: clamp(86px, 25vw, 116px);
  width: 100%;
  height: auto;
  max-height: clamp(86px, 25vw, 116px);
  object-fit: contain;
  display: block;
  filter: drop-shadow(0 3px 8px rgba(128, 107, 67, 0.18));
  transition: transform 0.5s ease, filter 0.5s ease;
}

.wi-tl-img:hover {
  transform: scale(1.06) translateY(-2px);
  filter: drop-shadow(0 6px 14px rgba(128, 107, 67, 0.28));
}

.wi-tl-text-box {
  display: flex;
  flex-direction: column;
  transition: transform 0.85s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.85s ease;
}

.wi-tl-text-right {
  text-align: right;
  align-items: flex-end;
}

.wi-tl-text-left {
  text-align: left;
  align-items: flex-start;
}

.wi-tl-time {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: clamp(22px, 6vw, 27px);
  font-style: italic;
  font-weight: 400;
  color: #806b43;
  line-height: 1.1;
  margin-bottom: 2px;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.wi-tl-title {
  font-family: 'Cinzel', 'Cormorant Garamond', Georgia, serif;
  font-size: clamp(11.5px, 3vw, 13px);
  font-weight: 600;
  color: #806b43;
  line-height: 1.35;
  letter-spacing: 0.4px;
  max-width: 140px;
  word-break: normal;
}

/* Scroll Animation: Initial States before revealed */
.wi-tl-left .wi-tl-img-box,
.wi-tl-left .wi-tl-text-box {
  opacity: 0;
  transform: translateX(-40px) scale(0.95);
}

.wi-tl-right .wi-tl-img-box,
.wi-tl-right .wi-tl-text-box {
  opacity: 0;
  transform: translateX(40px) scale(0.95);
}

/* Scroll Animation: Revealed States when in viewport */
.wi-tl-row.wi-tl-visible .wi-tl-left .wi-tl-img-box,
.wi-tl-row.wi-tl-visible .wi-tl-left .wi-tl-text-box {
  opacity: 1;
  transform: translateX(0) scale(1);
  transition-delay: var(--tl-delay, 0s);
}

.wi-tl-row.wi-tl-visible .wi-tl-right .wi-tl-img-box,
.wi-tl-row.wi-tl-visible .wi-tl-right .wi-tl-text-box {
  opacity: 1;
  transform: translateX(0) scale(1);
  transition-delay: calc(var(--tl-delay, 0s) + 0.08s);
}

.wi-tl-row.wi-tl-visible .wi-tl-node {
  opacity: 1;
  transform: scale(1) rotate(0deg);
  transition-delay: calc(var(--tl-delay, 0s) + 0.14s);
}

/* Subtle gentle floating animation once visible */
.wi-tl-row.wi-tl-visible .wi-tl-img {
  animation: wiTlFloat 4.5s ease-in-out infinite alternate;
  animation-delay: var(--tl-delay, 0s);
}

@keyframes wiTlFloat {
  0% { transform: translateY(0px); }
  100% { transform: translateY(-4px); }
}

/* ============================================================
   COUNTDOWN & LOCATION
   ============================================================ */
.wi-countdown {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: clamp(4px, 2.5vw, 16px);
  margin: 16px 0 20px;
  max-width: 100%;
}

.wi-count-unit {
  min-width: clamp(38px, 12vw, 54px);
  text-align: center;
}

.wi-count-num {
  font-size: clamp(24px, 7.5vw, 32px);
  color: var(--gold-deep);
  font-weight: 600;
  line-height: 1;
}

.wi-count-label {
  font-family: 'Cinzel', serif;
  font-size: clamp(8px, 2.2vw, 10px);
  letter-spacing: clamp(1px, 0.4vw, 2px);
  color: var(--ink-soft);
  margin-top: 4px;
}

.wi-count-colon {
  font-size: clamp(18px, 5vw, 24px);
  color: var(--gold);
  align-self: center;
  margin-bottom: 12px;
}

.wi-venue-city {
  font-family: 'Cinzel', serif;
  font-size: 15px;
  letter-spacing: 4px;
  color: var(--ink);
  margin-bottom: 6px;
}

.wi-venue-line1 {
  font-family: 'Cormorant Garamond', serif;
  font-size: 20px;
  font-weight: 600;
  color: var(--ink);
}

.wi-venue-line2 {
  font-family: 'Cormorant Garamond', serif;
  font-size: 17px;
  font-style: italic;
  color: var(--ink-soft);
  margin-top: 2px;
}

.wi-map {
  margin-top: 24px;
  border: 1px solid var(--line);
  border-radius: 8px;
  overflow: hidden;
  height: 220px;
  box-shadow: 0 6px 18px -8px rgba(62, 49, 35, 0.2);
}

.wi-map iframe {
  width: 100%;
  height: 100%;
  border: 0;
}

/* ============================================================
   DRESS CODE & GIFT PREFERENCES
   ============================================================ */
.wi-swatches {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin: 22px 0 16px;
}

.wi-swatch {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid #FFFDF8;
  box-shadow: 0 0 0 1px var(--line), 0 4px 8px -2px rgba(62, 49, 35, 0.15);
}

.wi-dress-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: 20px;
  font-weight: 600;
  color: var(--ink);
  margin-bottom: 8px;
}

.wi-dress-note {
  font-size: 16px;
  font-style: italic;
  line-height: 1.5;
  color: var(--ink-soft);
  max-width: 300px;
  margin: 0 auto;
}

/* ============================================================
   RSVP MODAL & SECTION
   ============================================================ */
.wi-rsvp-copy {
  font-size: 17px;
  font-style: italic;
  color: var(--ink-soft);
  max-width: 300px;
  margin: 0 auto 26px;
  line-height: 1.5;
}

.wi-rsvp-btn {
  font-family: 'Cinzel', serif;
  letter-spacing: 3px;
  font-size: 14px;
  text-transform: uppercase;
  background: linear-gradient(120deg, #CFAB66, #8A6B34);
  color: #FFFFFF;
  border: none;
  padding: 15px 48px;
  border-radius: 30px;
  cursor: pointer;
  box-shadow: 0 10px 22px -8px rgba(138, 107, 52, 0.6);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.wi-rsvp-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 26px -8px rgba(138, 107, 52, 0.7);
}

/* RSVP Modal */
.wi-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(40, 30, 20, 0.65);
  backdrop-filter: blur(4px);
  z-index: 100002;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.wi-modal-card {
  background: #FFFDF9;
  border-radius: 12px;
  width: 100%;
  max-width: 380px;
  padding: 32px 24px;
  text-align: center;
  position: relative;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  border: 1px solid var(--line);
  animation: modalIn 0.3s ease-out;
}

@keyframes modalIn {
  from { opacity: 0; transform: scale(0.95) translateY(10px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}

.wi-modal-close {
  position: absolute;
  top: 14px;
  right: 16px;
  background: transparent;
  border: none;
  font-size: 22px;
  color: var(--ink-soft);
  cursor: pointer;
}

.wi-form-group {
  margin-bottom: 18px;
  text-align: left;
}

.wi-form-label {
  display: block;
  font-family: 'Cinzel', serif;
  font-size: 11px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--gold-deep);
  margin-bottom: 6px;
}

.wi-input {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid var(--line);
  border-radius: 6px;
  background: #FDF9F2;
  font-family: 'Cormorant Garamond', serif;
  font-size: 16px;
  color: var(--ink);
  outline: none;
  box-sizing: border-box;
}

.wi-input:focus {
  border-color: var(--gold);
}

.wi-radio-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 6px;
}

.wi-radio-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  color: var(--ink);
  cursor: pointer;
}

.wi-submit-btn {
  width: 100%;
  margin-top: 10px;
  font-family: 'Cinzel', serif;
  letter-spacing: 2.5px;
  font-size: 13px;
  text-transform: uppercase;
  background: linear-gradient(120deg, #CFAB66, #8A6B34);
  color: #FFFFFF;
  border: none;
  padding: 13px 20px;
  border-radius: 30px;
  cursor: pointer;
}

.wi-rsvp-sent {
  font-size: 17px;
  color: var(--gold-deep);
  font-style: italic;
  padding: 12px 0;
}

.wi-footer-note {
  margin-top: 48px;
  font-family: 'Pinyon Script', cursive;
  font-size: 38px;
  color: var(--gold-deep);
}

.wi-footer-sub {
  margin-top: 6px;
  font-family: 'Cinzel', serif;
  font-size: 11px;
  letter-spacing: 3px;
  color: var(--ink-soft);
}

/* ============================================================
   AUTHENTIC TIMELESS GRACE VENUE & LOCATION SECTION
   ============================================================ */
.wi-venue-section {
  position: relative;
  padding: 55px 20px 48px;
  text-align: center;
  background: #FDF4EB;
  overflow: hidden;
  border-top: 1px solid var(--line);
}

.wi-venue-flower-top {
  position: absolute;
  top: 10px;
  right: -25px;
  width: 175px;
  height: auto;
  pointer-events: none;
  z-index: 1;
  opacity: 0.95;
}

.wi-venue-script-title {
  font-family: 'Imperial Script', 'Pinyon Script', cursive;
  font-size: 56px;
  color: #8A6B34;
  line-height: 1;
  font-weight: 400;
  margin: 0 0 4px;
  position: relative;
  z-index: 2;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.9);
}

.wi-venue-flourish {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin: 4px auto 16px;
  position: relative;
  z-index: 2;
}

.wi-v-line {
  width: 32px;
  height: 1px;
  background: linear-gradient(90deg, transparent, #8A6B34, transparent);
}

.wi-v-diamond {
  font-size: 8px;
  color: #8A6B34;
}

.wi-venue-city-text {
  font-family: 'Cinzel', 'Rufina', Georgia, serif;
  font-size: 15px;
  letter-spacing: 0.26em;
  text-transform: uppercase;
  color: #725227;
  font-weight: 600;
  margin-bottom: 6px;
  position: relative;
  z-index: 2;
}

.wi-venue-title-text {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 18px;
  color: #5C4425;
  font-weight: 500;
  line-height: 1.35;
  position: relative;
  z-index: 2;
}

.wi-venue-sub-text {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 17px;
  color: #6E5330;
  font-weight: 500;
  margin-top: 2px;
  position: relative;
  z-index: 2;
}

.wi-venue-img-wrap {
  position: relative;
  margin: 30px auto 24px;
  width: 100%;
  max-width: 370px;
  z-index: 2;
}

.wi-venue-img {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  border-radius: 16px;
  box-shadow: 0 14px 38px -8px rgba(110, 75, 30, 0.22);
  display: block;
  border: 1px solid rgba(255, 255, 255, 0.6);
}

.wi-venue-flower-bottom {
  position: absolute;
  bottom: -24px;
  left: -28px;
  width: 195px;
  height: auto;
  pointer-events: none;
  z-index: 3;
  opacity: 0.95;
}

.wi-venue-map-cta {
  margin-top: 14px;
  position: relative;
  z-index: 4;
}

.wi-maps-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 26px;
  background: #FFFFFF;
  border: 1px solid #D6C2A8;
  border-radius: 28px;
  color: #725227;
  font-family: 'Cinzel', serif;
  font-size: 11.5px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  font-weight: 600;
  text-decoration: none;
  box-shadow: 0 4px 15px rgba(140, 100, 60, 0.12);
  transition: all 0.25s ease;
}

.wi-maps-btn:hover {
  background: #FAF4EB;
  border-color: #8A6B34;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(140, 100, 60, 0.2);
}
`;

/* ------------------------------------------------------------------ */
/*  SCRATCH CARD COMPONENT                                            */
/* ------------------------------------------------------------------ */
function ScratchCard({ answer, label }) {
  const canvasRef = useRef(null);
  const [revealed, setRevealed] = useState(false);
  const [dissolving, setDissolving] = useState(false);
  const drawing = useRef(false);
  const strokeLength = useRef(0);
  const lastPos = useRef(null);

  const triggerReveal = useCallback(() => {
    if (revealed || dissolving) return;
    setDissolving(true);
    setTimeout(() => {
      setRevealed(true);
    }, 600);
  }, [revealed, dissolving]);

  const initCanvas = useCallback((canvas) => {
    const dpr = window.devicePixelRatio || 1;
    const { width, height } = canvas.getBoundingClientRect();
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, "#EED8A8");
    grad.addColorStop(0.35, "#E2C485");
    grad.addColorStop(0.7, "#D4AF67");
    grad.addColorStop(1, "#EED8A8");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    ctx.font = "600 11px Cinzel, Georgia, serif";
    ctx.fillStyle = "rgba(120, 85, 35, 0.75)";
    ctx.textAlign = "center";
    ctx.fillText("SCRATCH", width / 2, height / 2);
  }, []);

  useEffect(() => {
    if (canvasRef.current && !revealed) initCanvas(canvasRef.current);
  }, [initCanvas, revealed]);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const point = e.touches ? e.touches[0] : e;
    return { x: point.clientX - rect.left, y: point.clientY - rect.top };
  };

  const scratchSegment = (p1, p2, ctx) => {
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineWidth = 28;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
  };

  const checkScratchPercentage = (canvas) => {
    const ctx = canvas.getContext("2d");
    const { width, height } = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const data = ctx.getImageData(0, 0, width * dpr, height * dpr).data;
    let cleared = 0;
    const step = 32;
    let total = 0;
    for (let i = 3; i < data.length; i += 4 * step) {
      total++;
      if (data[i] === 0) cleared++;
    }
    if (cleared / total >= 0.28) {
      triggerReveal();
    }
  };

  const handleStart = (e) => {
    if (revealed || dissolving) return;
    drawing.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const pos = getPos(e, canvas);
    lastPos.current = pos;
    scratchSegment(pos, pos, canvas.getContext("2d"));
  };

  const handleMove = (e) => {
    if (!drawing.current || revealed || dissolving) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const pos = getPos(e, canvas);

    if (lastPos.current) {
      scratchSegment(lastPos.current, pos, canvas.getContext("2d"));
      const dx = pos.x - lastPos.current.x;
      const dy = pos.y - lastPos.current.y;
      strokeLength.current += Math.sqrt(dx * dx + dy * dy);

      if (strokeLength.current > 140) {
        checkScratchPercentage(canvas);
      }
      if (strokeLength.current > 260) {
        triggerReveal();
      }
    }
    lastPos.current = pos;
  };

  const handleEnd = () => {
    if (drawing.current && canvasRef.current && !revealed && !dissolving) {
      checkScratchPercentage(canvasRef.current);
    }
    drawing.current = false;
  };

  return (
    <div className="wi-card">
      <div
        className={`wi-scratch-box ${revealed || dissolving ? "wi-revealed" : ""}`}
      >
        <div className={`wi-scratch-answer ${label === "MONTH" ? "wi-text-month" : ""}`}>
          {answer}
        </div>

        {!revealed && (
          <canvas
            ref={canvasRef}
            className={`wi-scratch-canvas ${dissolving ? "wi-canvas-dissolve" : ""}`}
            onMouseDown={handleStart}
            onMouseMove={handleMove}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onTouchStart={handleStart}
            onTouchMove={handleMove}
            onTouchEnd={handleEnd}
          />
        )}
      </div>
      <div className="wi-card-label">{label}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  TIMELINE ROW (Scroll-Triggered Reveal Animation)                  */
/* ------------------------------------------------------------------ */
function TimelineRow({ item, index }) {
  const rowRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = rowRef.current;
    if (!el) return;

    // Check if element is already in viewport on mount
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -30px 0px",
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const isLeftImg = item.imgSide === "left";

  return (
    <div
      ref={rowRef}
      className={`wi-tl-row ${isLeftImg ? "wi-tl-row-left-img" : "wi-tl-row-right-img"} ${isVisible ? "wi-tl-visible" : ""
        }`}
      style={{
        "--tl-delay": `${index * 0.08}s`,
      }}
    >
      {/* Left Slot */}
      <div className="wi-tl-col wi-tl-left">
        {isLeftImg ? (
          <div className="wi-tl-img-box">
            <img src={item.illustration} alt={item.alt || item.title} className="wi-tl-img" />
          </div>
        ) : (
          <div className="wi-tl-text-box wi-tl-text-right">
            <div className="wi-tl-time">{item.time}</div>
            <div className="wi-tl-title">{item.title}</div>
          </div>
        )}
      </div>

      {/* Center Spine Connector */}
      <div className="wi-tl-center">
        <div className="wi-tl-node">
          {DATA.timelineRosette ? (
            <img src={DATA.timelineRosette} alt="" className="wi-tl-rosette-img" />
          ) : (
            <div className="wi-tl-node-diamond" />
          )}
        </div>
      </div>

      {/* Right Slot */}
      <div className="wi-tl-col wi-tl-right">
        {!isLeftImg ? (
          <div className="wi-tl-img-box">
            <img src={item.illustration} alt={item.alt || item.title} className="wi-tl-img" />
          </div>
        ) : (
          <div className="wi-tl-text-box wi-tl-text-left">
            <div className="wi-tl-time">{item.time}</div>
            <div className="wi-tl-title">{item.title}</div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  COUNTDOWN HOOK                                                    */
/* ------------------------------------------------------------------ */
function useCountdown(target) {
  const [remaining, setRemaining] = useState(() => target.getTime() - Date.now());
  useEffect(() => {
    const id = setInterval(() => setRemaining(target.getTime() - Date.now()), 1000);
    return () => clearInterval(id);
  }, [target]);
  const clamped = Math.max(0, remaining);
  const d = Math.floor(clamped / (1000 * 60 * 60 * 24));
  const h = Math.floor((clamped / (1000 * 60 * 60)) % 24);
  const m = Math.floor((clamped / (1000 * 60)) % 60);
  const s = Math.floor((clamped / 1000) % 60);
  return { d, h, m, s };
}

/* ------------------------------------------------------------------ */
/*  MAIN WEDDING INVITE COMPONENT                                     */
/* ------------------------------------------------------------------ */
export default function WeddingInvite() {
  const [data, setData] = useState(DATA);
  const [invitationId, setInvitationId] = useState(null);
  const [state, setState] = useState("overlay"); // "overlay" -> "invite"
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showRsvpModal, setShowRsvpModal] = useState(false);
  const [rsvped, setRsvped] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [attendance, setAttendance] = useState("yes");
  const [guestCount, setGuestCount] = useState("1");
  const [isSubmittingRsvp, setIsSubmittingRsvp] = useState(false);
  const [rsvpError, setRsvpError] = useState(null);

  const audioRef = useRef(null);
  const videoRef = useRef(null);
  const heroVideoRef = useRef(null);

  const { d, h, m, s } = useCountdown(data.weddingDate);

  // Fetch invitation data from Supabase on mount
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    const params = new URLSearchParams(window.location.search);
    const slug = params.get("invite");

    async function fetchInvitation() {
      try {
        let query = supabase.from("invitations").select("*");
        if (slug) {
          query = query.eq("slug", slug);
        } else {
          query = query.order("created_at", { ascending: false }).limit(1);
        }

        const { data: invList, error } = await query;

        if (error) {
          console.warn("Supabase load fallback:", error.message);
          return;
        }

        const inv = Array.isArray(invList) ? invList[0] : invList;

        if (inv) {
          setInvitationId(inv.id);
          const wDate = new Date(inv.wedding_date);
          const dateParts = !isNaN(wDate.getTime())
            ? {
                day: String(wDate.getDate()),
                month: wDate.toLocaleString("en-US", { month: "long" }),
                year: String(wDate.getFullYear()),
              }
            : DATA.dateParts;

          setData((prev) => ({
            ...prev,
            partnerA: inv.groom_name || prev.partnerA,
            partnerB: inv.bride_name || prev.partnerB,
            groomParents: inv.groom_parents || prev.groomParents,
            brideParents: inv.bride_parents || prev.brideParents,
            occasion: inv.occasion || prev.occasion,
            weddingDate: !isNaN(wDate.getTime()) ? wDate : prev.weddingDate,
            dateParts,
            city: inv.city || prev.city,
            venueTitle: inv.venue_title || prev.venueTitle,
            venueSub: inv.venue_sub || prev.venueSub,
            mapQuery: inv.map_query || prev.mapQuery,
            verse: inv.verse_text || prev.verse,
            verseRef: inv.verse_ref || prev.verseRef,
            rsvpBy: inv.rsvp_deadline || prev.rsvpBy,
            audioUrl: inv.audio_url || prev.audioUrl,
            envelopeVideo: inv.envelope_video_url || prev.envelopeVideo,
            heroVideo: inv.hero_video_url || prev.heroVideo,
            dressCode: inv.dress_code || prev.dressCode,
          }));

          // Fetch timeline events
          const { data: events, error: eventsErr } = await supabase
            .from("timeline_events")
            .select("*")
            .eq("invitation_id", inv.id)
            .order("order_index", { ascending: true });

          if (!eventsErr && events && events.length > 0) {
            setData((prev) => ({
              ...prev,
              timeline: events.map((ev) => ({
                time: ev.time,
                title: ev.title,
                illustration: ev.illustration_url || prev.timelineRosette,
                imgSide: ev.img_side || "left",
                alt: ev.title,
              })),
            }));
          }
        }
      } catch (err) {
        console.error("Error fetching Supabase invite:", err);
      }
    }

    fetchInvitation();
  }, []);

  // Handle Envelope Tap: play video and audio seamlessly in place
  const handleOpenEnvelope = () => {
    if (videoPlaying) return;

    // Start background music
    if (audioRef.current) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.warn("Audio playback prevented:", err);
      });
    }

    // Play video
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().then(() => {
        setVideoPlaying(true);
      }).catch((err) => {
        console.warn("Video playback error:", err);
        setState("invite");
      });
    }
  };

  // Video finished -> smoothly dissolve overlay and reveal invitation
  const handleVideoEnd = () => {
    setState("invite");
    if (heroVideoRef.current) {
      heroVideoRef.current.play().catch(() => { });
    }
  };

  // Toggle Audio Play/Pause
  const toggleAudio = (e) => {
    e.stopPropagation();
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      });
    }
  };

  const handleRsvpSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingRsvp(true);
    setRsvpError(null);

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from("rsvps").insert([
          {
            invitation_id: invitationId || null,
            guest_name: guestName.trim(),
            attending: attendance,
            guest_count: attendance === "yes" ? parseInt(guestCount, 10) || 1 : 0,
          },
        ]);

        if (error) {
          console.error("Supabase RSVP Error:", error);
          setRsvpError("Could not submit RSVP. Please try again.");
          setIsSubmittingRsvp(false);
          return;
        }
      } catch (err) {
        console.error("RSVP submission error:", err);
        setRsvpError("Submission failed. Please check connection.");
        setIsSubmittingRsvp(false);
        return;
      }
    }

    setIsSubmittingRsvp(false);
    setRsvped(true);
    setShowRsvpModal(false);
  };

  return (
    <div className="wi-root">
      <style>{CSS}</style>

      {/* Background Audio */}
      <audio ref={audioRef} src={data.audioUrl} loop preload="auto" />

      {/* Floating Audio Play/Pause Button (visible after opening) */}
      {state === "invite" && (
        <div className="wei-audio-btn" onClick={toggleAudio} title={isPlaying ? "Pause music" : "Play music"}>
          {isPlaying ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <rect x="6" y="5" width="4" height="14" rx="1" />
              <rect x="14" y="5" width="4" height="14" rx="1" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <polygon points="5,3 19,12 5,21" />
            </svg>
          )}
        </div>
      )}

      {/* Seamless Unified Envelope Video In Place */}
      <div
        className={`wei-overlay ${state === "invite" ? "wei-hidden" : ""}`}
        onClick={handleOpenEnvelope}
      >
        <div className="wei-envelope-holder">
          {/* Active Opening Video */}
          <video
            ref={videoRef}
            className="wei-envelope-media"
            src={`${data.envelopeVideo}#t=0.001`}
            poster="/Envelope%20Cover%20Photo%203.png"
            muted
            playsInline
            preload="auto"
            onLoadedMetadata={(e) => {
              if (e.target && !videoPlaying) e.target.currentTime = 0.001;
            }}
            onPlaying={() => setVideoPlaying(true)}
            onEnded={handleVideoEnd}
          />

          {/* Pulsing Tap Prompt */}
          <div className={`wei-tap-wrap ${videoPlaying ? "wei-faded" : ""}`}>
            <div className="wei-chevron-tap" />
            <div className="wei-tap-label">Tap to open</div>
          </div>
        </div>
      </div>

      {/* Main Invitation Frame */}
      <div className="wi-frame">
        <div className={`wi-content ${state === "invite" ? "wi-visible" : ""}`}>

          {/* ============================================================
              HERO / FIRST PAGE
             ============================================================ */}
          <section className="wi-hero">
            {/* Background Looping Video */}
            <div className="wi-hero-video-wrap">
              <video
                ref={heroVideoRef}
                className="wi-hero-video"
                src={data.heroVideo}
                autoPlay
                muted
                playsInline
                loop
                preload="auto"
              />
            </div>

            {/* Ambient Radial Glow */}
            <div className="wi-hero-glow" />

            {/* Bottom Gradient Fade */}
            <div className="wi-hero-bottom-fade" />

            {/* Swaying Corner Floral Bouquets */}
            <img className="wi-floral-left" src={data.floralLeft} alt="floral decoration" />
            <img className="wi-floral-right" src={data.floralRight} alt="floral decoration" />

            {/* Arch Center Typography Overlay */}
            <div className="wi-hero-content">
              <div className="wi-hero-eyebrow">Welcome to the</div>
              <div className="wi-hero-occasion">{data.occasion}</div>
              <div className="wi-hero-of-wrap">
                <span className="wi-flourish-line" />
                <span className="wi-hero-of">of</span>
                <span className="wi-flourish-line" />
              </div>
              <div className="wi-hero-names">
                <span className="wi-hero-name">{data.partnerA}</span>
                <span className="wi-hero-amp">&amp;</span>
                <span className="wi-hero-name">{data.partnerB}</span>
              </div>
            </div>

            {/* Scroll Indicator */}
            <div className="wi-scroll-cue">
              <span>Scroll down</span>
              <div className="wi-chevron" />
            </div>
          </section>

          {/* ============================================================
              SCRATCH DATE
             ============================================================ */}
          <section className="wi-section">
            <h2 className="wi-script-title">The Date</h2>
            <div className="wi-hint">
              <span className="wi-star">✦</span> Scratch to reveal the date <span className="wi-star">✦</span>
            </div>
            <div className="wi-cards">
              <ScratchCard answer={data.dateParts.day} label="DAY" />
              <ScratchCard answer={data.dateParts.month} label="MONTH" />
              <ScratchCard answer={data.dateParts.year} label="YEAR" />
            </div>
          </section>

          {/* ============================================================
              AUTHENTIC 3D ISLAMIC ARCH INVITATION CARD
             ============================================================ */}
          <section className="wi-arch-section">
            <div className="wi-arch-container">
              {/* 3D Embossed Arch Frame */}
              <img className="wi-arch-frame-bg" src={data.archFrameImg} alt="Islamic Arch Frame" />

              {/* 1. Bismillah Gold Calligraphy */}
              <img className="wi-arch-bismillah" src={data.bismillahImg} alt="Bismillah" />

              {/* 2. Invitation Heading */}
              <div className="wi-arch-heading">
                YOU ARE INVITED TO THE<br />
                NIKKAH CEREMONY OF
              </div>

              {/* 3. Groom Details */}
              <div className="wi-arch-name-groom">{data.partnerA}</div>
              <div className="wi-arch-rel-groom">SON OF</div>
              <div className="wi-arch-parents-groom">{data.groomParents}</div>

              {/* 4. With Script */}
              <div className="wi-arch-with">With</div>

              {/* 5. Bride Details */}
              <div className="wi-arch-name-bride">{data.partnerB}</div>
              <div className="wi-arch-rel-bride">DAUGHTER OF</div>
              <div className="wi-arch-parents-bride">{data.brideParents}</div>

              {/* 6. Friends & Family Message */}
              <div className="wi-arch-greeting">{data.invitationGreeting}</div>
              <div className="wi-arch-msg">
                Join us for an evening of love, laughter, duas, and unforgettable memories as we begin our forever.
              </div>

              {/* Bottom Floral Bouquets at base of arch */}
              <img className="wi-arch-flower-left" src={data.archFloralLeft} alt="flowers" />
              <img className="wi-arch-flower-right" src={data.archFloralRight} alt="flowers" />
            </div>
          </section>

          {/* ============================================================
              QURANIC VERSE
             ============================================================ */}
          <section className="wi-section wi-verse-section">
            <div className="wi-verse">&ldquo;{data.verse}&rdquo;</div>
            <div className="wi-verse-ref">({data.verseRef})</div>
          </section>

          {/* ============================================================
              TIMELINE (AUTHENTIC TIMELESS GRACE & SCROLL-REVEAL)
             ============================================================ */}
          <section className="wi-section wi-timeline-section">
            <h2 className="wi-timeline-script-title">Wedding Timeline</h2>
            {data.timelineFlourish && (
              <div className="wi-timeline-flourish">
                <img src={data.timelineFlourish} alt="" className="wi-timeline-flourish-img" />
              </div>
            )}

            <div className="wi-timeline-container">
              {/* Top Ornate Spire */}
              <div className="wi-tl-spire wi-tl-spire-top">
                <img src={data.timelineTopSpire} alt="" />
              </div>

              {/* Continuous Center Spine */}
              <div className="wi-tl-spine-line" />

              {/* Alternating Event Rows with Smooth Scroll Reveal */}
              <div className="wi-tl-rows">
                {data.timeline.map((item, idx) => (
                  <TimelineRow key={item.time + idx} item={item} index={idx} />
                ))}
              </div>

              {/* Bottom Ornate Spire */}
              <div className="wi-tl-spire wi-tl-spire-bottom">
                <img src={data.timelineBottomSpire} alt="" />
              </div>
            </div>
          </section>

          {/* ============================================================
              COUNTDOWN
             ============================================================ */}
          <section className="wi-section">
            <div className="wi-heading">The Celebration Begins</div>
            <div className="wi-countdown">
              <div className="wi-count-unit">
                <div className="wi-count-num">{d}</div>
                <div className="wi-count-label">DAYS</div>
              </div>
              <div className="wi-count-colon">:</div>
              <div className="wi-count-unit">
                <div className="wi-count-num">{String(h).padStart(2, "0")}</div>
                <div className="wi-count-label">HOURS</div>
              </div>
              <div className="wi-count-colon">:</div>
              <div className="wi-count-unit">
                <div className="wi-count-num">{String(m).padStart(2, "0")}</div>
                <div className="wi-count-label">MINUTES</div>
              </div>
              <div className="wi-count-colon">:</div>
              <div className="wi-count-unit">
                <div className="wi-count-num">{String(s).padStart(2, "0")}</div>
                <div className="wi-count-label">SECONDS</div>
              </div>
            </div>
          </section>

          {/* ============================================================
              AUTHENTIC TIMELESS GRACE LOCATION & VENUE
             ============================================================ */}
          <section className="wi-venue-section">
            {/* Top-Right Decorative Flower Bouquet */}
            <img className="wi-venue-flower-top" src={data.venueTopFlower || DATA.venueTopFlower} alt="" />

            {/* Cursive Title & Diamond Flourish */}
            <h2 className="wi-venue-script-title">Location</h2>
            <div className="wi-venue-flourish">
              <span className="wi-v-line" />
              <span className="wi-v-diamond">❖</span>
              <span className="wi-v-line" />
            </div>

            {/* City, Venue Title & Hall Subtitle */}
            <div className="wi-venue-city-text">{data.city}</div>
            <div className="wi-venue-title-text">{data.venueTitle}</div>
            {data.venueSub && <div className="wi-venue-sub-text">{data.venueSub}</div>}

            {/* Framed Luxury Venue Photo with Bottom-Left Overlapping Bouquet */}
            <div className="wi-venue-img-wrap">
              <img
                className="wi-venue-img"
                src={data.venueImg || data.venue_image_url || DATA.venueImg}
                alt={data.venueTitle}
              />
              <img className="wi-venue-flower-bottom" src={data.venueBottomFlower || DATA.venueBottomFlower} alt="" />
            </div>

            {/* Open in Maps Button */}
            <div className="wi-venue-map-cta">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.mapQuery)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="wi-maps-btn"
              >
                <span>Open In Maps</span>
                <span>↗</span>
              </a>
            </div>
          </section>

          {/* ============================================================
              DRESS CODE
             ============================================================ */}
          <section className="wi-section">
            <div className="wi-heading">Attire</div>
            <h2 className="wi-script-title">Dress Code</h2>
            <div className="wi-rule" />
            <div className="wi-swatches">
              {data.dressCode.palette.map((c) => (
                <span className="wi-swatch" style={{ background: c }} key={c} />
              ))}
            </div>
            <div className="wi-dress-title">{data.dressCode.title}</div>
            <div className="wi-dress-note">{data.dressCode.note}</div>
          </section>

          {/* ============================================================
              RSVP
             ============================================================ */}
          <section className="wi-section">
            <div className="wi-heading">Join Our Celebration</div>
            <h2 className="wi-script-title">Confirm Your Attendance</h2>
            <div className="wi-rule" />
            <div className="wi-rsvp-copy">
              To help us prepare for a joyful celebration, kindly confirm your attendance by {data.rsvpBy}.
            </div>
            {rsvped ? (
              <div className="wi-rsvp-sent">✦ Thank you! We have recorded your attendance. ✦</div>
            ) : (
              <button className="wi-rsvp-btn" onClick={() => setShowRsvpModal(true)}>
                RSVP Now
              </button>
            )}
            <div className="wi-footer-note">Hope to see you there</div>
            <div className="wi-footer-sub">DESIGNED WITH LOVE</div>
          </section>

        </div>
      </div>

      {/* ============================================================
          RSVP MODAL
         ============================================================ */}
      {showRsvpModal && (
        <div className="wi-modal-backdrop" onClick={() => setShowRsvpModal(false)}>
          <div className="wi-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="wi-modal-close" onClick={() => setShowRsvpModal(false)}>&times;</button>
            <h3 className="wi-script-title" style={{ fontSize: "38px" }}>Confirm Attendance</h3>
            <div className="wi-heading" style={{ fontSize: "11px", marginBottom: "18px" }}>
              Please RSVP by {data.rsvpBy}
            </div>

            {rsvpError && (
              <div style={{ color: "#c0392b", fontSize: "13px", marginBottom: "12px", fontFamily: "sans-serif" }}>
                {rsvpError}
              </div>
            )}

            <form onSubmit={handleRsvpSubmit}>
              <div className="wi-form-group">
                <label className="wi-form-label">Your Full Name</label>
                <input
                  className="wi-input"
                  type="text"
                  required
                  placeholder="e.g. Tariq Khan"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                />
              </div>

              <div className="wi-form-group">
                <label className="wi-form-label">Will you attend?</label>
                <div className="wi-radio-group">
                  <label className="wi-radio-label">
                    <input
                      type="radio"
                      name="attending"
                      value="yes"
                      checked={attendance === "yes"}
                      onChange={() => setAttendance("yes")}
                    />
                    Joyfully Accept
                  </label>
                  <label className="wi-radio-label">
                    <input
                      type="radio"
                      name="attending"
                      value="no"
                      checked={attendance === "no"}
                      onChange={() => setAttendance("no")}
                    />
                    Regretfully Decline
                  </label>
                </div>
              </div>

              {attendance === "yes" && (
                <div className="wi-form-group">
                  <label className="wi-form-label">Number of Guests</label>
                  <input
                    className="wi-input"
                    type="number"
                    min="1"
                    max="10"
                    value={guestCount}
                    onChange={(e) => setGuestCount(e.target.value)}
                  />
                </div>
              )}

              <button type="submit" className="wi-submit-btn" disabled={isSubmittingRsvp}>
                {isSubmittingRsvp ? "Submitting..." : "Send RSVP"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
