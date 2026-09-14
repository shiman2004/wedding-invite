import React, { useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "./supabase";

const DEFAULT_INVITE = {
  slug: "ayash-farwin",
  groom_name: "Ayash",
  bride_name: "Farwin",
  groom_parents: "MR & MRS CH. HUSSAINI",
  bride_parents: "MR & MRS CH. FAROOQI",
  occasion: "Nikkah Ceremony",
  wedding_date: "2027-01-10T18:00",
  city: "DUBAI",
  venue_title: "Four Seasons Hotel Jumeirah",
  venue_sub: "Dana Ballroom",
  map_query: "Four Seasons Resort Dubai at Jumeirah Beach",
  venue_image_url: "https://static.tildacdn.net/tild6462-3635-4461-a162-303965356266/Screenshot_2026-08-0.png",
  verse_text: "And We created you in pairs.",
  verse_ref: "Surah An-Naba 78:8",
  rsvp_deadline: "30 November 2026",
  audio_url: "https://pub-4dc8201144ca418fb604349c73e8c724.r2.dev/Einaudi_%20Divenire%20(1)%20(1).mp3",
  envelope_video_url: "/Envelope%20Cover%20Video%202.mp4",
  envelope_image_url: "/Envelope%20Cover%20Photo%203.png",
  hero_video_url: "https://pub-4dc8201144ca418fb604349c73e8c724.r2.dev/Newbeautifulvideo.mp4",
  bismillah_img: "https://static.tildacdn.net/tild3561-3634-4134-b365-373438636335/Group_269_1.png",
  arch_frame_img: "https://static.tildacdn.net/tild6665-3331-4665-b937-616331303830/noroot.png",
  arch_floral_left: "https://static.tildacdn.net/tild3337-3937-4162-b935-356566376533/ChatGPT_Image_Jul_5_.png",
  arch_floral_right: "https://static.tildacdn.net/tild6635-3066-4365-b962-353461316561/Group_304-Photoroom.png",
  floral_left: "https://static.tildacdn.net/tild3238-6635-4563-b336-356564353735/Group_305.png",
  floral_right: "https://static.tildacdn.net/tild3935-6639-4836-b366-623864343762/Group_306.png",
  venue_top_flower: "https://static.tildacdn.net/tild3935-6639-4836-b366-623864343762/Group_306.png",
  venue_bottom_flower: "https://static.tildacdn.net/tild3238-6635-4563-b336-356564353735/Group_305.png",
  timeline_flourish: "https://static.tildacdn.net/tild6262-3636-4964-a632-666535323935/ChatGPT_Image_Jul_24.png",
  dress_code: {
    title: "Soft Pastel Shades",
    note: "We kindly invite our guests to dress in soft pastel shades. Please avoid wearing beige, as it is reserved for the bride and groom.",
    palette: ["#F6E7D8", "#E8D5C4", "#D8E2DC", "#FFE5D9", "#ECE4DB"],
  },
};

function ImageUploadField({ label, description, value, defaultValue, onChange }) {
  const fileInputRef = React.useRef(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        onChange(evt.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const previewSrc = value || defaultValue;

  return (
    <div className="ap-image-field-card">
      <div className="ap-image-field-main">
        <label className="ap-image-title">{label}</label>
        {description && <div className="ap-image-desc-text">{description}</div>}

        <div className="ap-image-row">
          <input
            type="text"
            className="ap-image-input"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Image URL (https://... or /path.png)"
          />
          <button
            type="button"
            className="ap-img-upload-btn"
            onClick={() => fileInputRef.current?.click()}
            title="Upload image from device"
          >
            📁 Pick Local File
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleFile}
          />
        </div>

        <div className="ap-image-actions">
          {defaultValue && value !== defaultValue && (
            <button
              type="button"
              className="ap-img-reset-btn"
              onClick={() => onChange(defaultValue)}
            >
              ↺ Reset Default
            </button>
          )}
          {value && (
            <button
              type="button"
              className="ap-img-clear-btn"
              onClick={() => onChange("")}
            >
              &times; Clear
            </button>
          )}
        </div>
      </div>

      <div className="ap-image-thumb-box">
        {previewSrc ? (
          <img
            src={previewSrc}
            alt={label}
            onError={(e) => {
              e.target.style.opacity = "0.2";
            }}
          />
        ) : (
          <div className="ap-no-img-text">No Image</div>
        )}
      </div>
    </div>
  );
}

export default function AdminPanel({ onBackToInvite }) {
  const [activeTab, setActiveTab] = useState("couple"); // couple | date | venue | media | timeline | rsvps | dress
  const [slug, setSlug] = useState("ayash-farwin");
  const [formData, setFormData] = useState(DEFAULT_INVITE);
  const [timeline, setTimeline] = useState([]);
  const [rsvps, setRsvps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Load invitation & RSVPs from Supabase
  useEffect(() => {
    async function loadData() {
      if (!isSupabaseConfigured || !supabase) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        // 1. Fetch Invitation
        const { data: inv, error: invErr } = await supabase
          .from("invitations")
          .select("*")
          .eq("slug", slug)
          .single();

        if (!invErr && inv) {
          // Format ISO date for datetime-local input
          let dateStr = "";
          if (inv.wedding_date) {
            const d = new Date(inv.wedding_date);
            if (!isNaN(d.getTime())) {
              const pad = (n) => String(n).padStart(2, "0");
              dateStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
            }
          }

          const mediaAssets = inv.media_assets || {};

          setFormData({
            ...DEFAULT_INVITE,
            ...inv,
            wedding_date: dateStr || DEFAULT_INVITE.wedding_date,
            dress_code: inv.dress_code || DEFAULT_INVITE.dress_code,
            envelope_image_url: inv.envelope_image_url || mediaAssets.envelope_image_url || DEFAULT_INVITE.envelope_image_url,
            venue_image_url: inv.venue_image_url || mediaAssets.venue_image_url || DEFAULT_INVITE.venue_image_url,
            bismillah_img: inv.bismillah_img || mediaAssets.bismillah_img || DEFAULT_INVITE.bismillah_img,
            arch_frame_img: inv.arch_frame_img || mediaAssets.arch_frame_img || DEFAULT_INVITE.arch_frame_img,
            arch_floral_left: inv.arch_floral_left || mediaAssets.arch_floral_left || DEFAULT_INVITE.arch_floral_left,
            arch_floral_right: inv.arch_floral_right || mediaAssets.arch_floral_right || DEFAULT_INVITE.arch_floral_right,
            floral_left: inv.floral_left || mediaAssets.floral_left || DEFAULT_INVITE.floral_left,
            floral_right: inv.floral_right || mediaAssets.floral_right || DEFAULT_INVITE.floral_right,
            venue_top_flower: inv.venue_top_flower || mediaAssets.venue_top_flower || DEFAULT_INVITE.venue_top_flower,
            venue_bottom_flower: inv.venue_bottom_flower || mediaAssets.venue_bottom_flower || DEFAULT_INVITE.venue_bottom_flower,
            timeline_flourish: inv.timeline_flourish || mediaAssets.timeline_flourish || DEFAULT_INVITE.timeline_flourish,
          });

          // 2. Fetch Timeline Events
          const { data: tlData } = await supabase
            .from("timeline_events")
            .select("*")
            .eq("invitation_id", inv.id)
            .order("order_index", { ascending: true });

          if (tlData && tlData.length > 0) {
            setTimeline(tlData);
          } else {
            setTimeline([
              { time: "6:00 pm", title: "Guest Arrival and Welcome Drinks", illustration_url: "https://static.tildacdn.net/tild3965-3466-4265-b863-373664656661/ChatGPT_Image_Jul_24.png", img_side: "left", order_index: 0 },
              { time: "6:30 pm", title: "Bride Entrance", illustration_url: "https://static.tildacdn.net/tild6166-3066-4762-a161-623234663434/ChatGPT_Image_Jul_24.png", img_side: "right", order_index: 1 },
              { time: "7:30 pm", title: "Salat al Isha", illustration_url: "https://static.tildacdn.net/tild3539-6537-4937-a165-616566313532/ChatGPT_Image_Jul_24.png", img_side: "left", order_index: 2 },
              { time: "8:30 pm", title: "Buffet Opening", illustration_url: "https://static.tildacdn.net/tild3335-3735-4630-b061-303735666263/ChatGPT_Image_Jul_24.png", img_side: "right", order_index: 3 },
              { time: "10:00 pm", title: "Let the Fun Begin", illustration_url: "https://static.tildacdn.net/tild6430-6536-4230-b334-383333623035/ChatGPT_Image_Jul_24.png", img_side: "left", order_index: 4 },
            ]);
          }

          // 3. Fetch RSVPs
          const { data: rsvpData } = await supabase
            .from("rsvps")
            .select("*")
            .eq("invitation_id", inv.id)
            .order("created_at", { ascending: false });

          if (rsvpData) setRsvps(rsvpData);
        }
      } catch (err) {
        console.error("Admin load error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [slug]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDressCodeChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      dress_code: { ...prev.dress_code, [field]: value },
    }));
  };

  const handlePaletteChange = (index, color) => {
    const newPal = [...(formData.dress_code?.palette || [])];
    newPal[index] = color;
    handleDressCodeChange("palette", newPal);
  };

  // Timeline handlers
  const handleTimelineChange = (index, field, value) => {
    setTimeline((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const addTimelineItem = () => {
    setTimeline((prev) => [
      ...prev,
      {
        time: "8:00 pm",
        title: "New Event",
        illustration_url: "https://static.tildacdn.net/tild3565-6561-4334-b335-386634333338/ChatGPT_Image_Jul_6_.png",
        img_side: prev.length % 2 === 0 ? "left" : "right",
        order_index: prev.length,
      },
    ]);
  };

  const removeTimelineItem = (index) => {
    setTimeline((prev) => prev.filter((_, i) => i !== index));
  };

  // Save changes to Supabase
  const handleSave = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    setErrorMessage("");

    try {
      if (!isSupabaseConfigured || !supabase) {
        throw new Error("Supabase is not configured in .env");
      }

      const targetSlug = (formData.slug || slug || "ayash-farwin").trim();

      const mediaAssets = {
        envelope_image_url: formData.envelope_image_url || DEFAULT_INVITE.envelope_image_url,
        venue_image_url: formData.venue_image_url || DEFAULT_INVITE.venue_image_url,
        bismillah_img: formData.bismillah_img || DEFAULT_INVITE.bismillah_img,
        arch_frame_img: formData.arch_frame_img || DEFAULT_INVITE.arch_frame_img,
        arch_floral_left: formData.arch_floral_left || DEFAULT_INVITE.arch_floral_left,
        arch_floral_right: formData.arch_floral_right || DEFAULT_INVITE.arch_floral_right,
        floral_left: formData.floral_left || DEFAULT_INVITE.floral_left,
        floral_right: formData.floral_right || DEFAULT_INVITE.floral_right,
        venue_top_flower: formData.venue_top_flower || DEFAULT_INVITE.venue_top_flower,
        venue_bottom_flower: formData.venue_bottom_flower || DEFAULT_INVITE.venue_bottom_flower,
        timeline_flourish: formData.timeline_flourish || DEFAULT_INVITE.timeline_flourish,
      };

      const basePayload = {
        slug: targetSlug,
        groom_name: formData.groom_name || "",
        bride_name: formData.bride_name || "",
        groom_parents: formData.groom_parents || "",
        bride_parents: formData.bride_parents || "",
        occasion: formData.occasion || "",
        wedding_date: formData.wedding_date ? new Date(formData.wedding_date).toISOString() : new Date().toISOString(),
        city: formData.city || "",
        venue_title: formData.venue_title || "",
        venue_sub: formData.venue_sub || "",
        map_query: formData.map_query || "",
        venue_image_url: formData.venue_image_url || DEFAULT_INVITE.venue_image_url,
        verse_text: formData.verse_text || "",
        verse_ref: formData.verse_ref || "",
        rsvp_deadline: formData.rsvp_deadline || "",
        audio_url: formData.audio_url || "",
        envelope_video_url: formData.envelope_video_url || "",
        hero_video_url: formData.hero_video_url || "",
        dress_code: {
          ...(formData.dress_code || DEFAULT_INVITE.dress_code),
          media_assets: mediaAssets,
        },
      };

      let invData = null;

      // Try updating with media_assets in payload
      const fullPayload = { ...basePayload, media_assets: mediaAssets };

      if (formData.id) {
        let res = await supabase
          .from("invitations")
          .update(fullPayload)
          .eq("id", formData.id)
          .select()
          .single();

        if (res.error) {
          // Retry with base payload if media_assets column is missing
          res = await supabase
            .from("invitations")
            .update(basePayload)
            .eq("id", formData.id)
            .select()
            .single();
        }

        if (res.error) throw res.error;
        invData = res.data;
      } else {
        let res = await supabase
          .from("invitations")
          .upsert(fullPayload, { onConflict: "slug" })
          .select()
          .single();

        if (res.error) {
          res = await supabase
            .from("invitations")
            .upsert(basePayload, { onConflict: "slug" })
            .select()
            .single();
        }

        if (res.error) throw res.error;
        invData = res.data;
      }

      if (invData) {
        setFormData((prev) => ({
          ...prev,
          id: invData.id,
          slug: invData.slug,
        }));
        setSlug(invData.slug);
      }

      // 2. Update Timeline Events
      if (invData?.id) {
        await supabase.from("timeline_events").delete().eq("invitation_id", invData.id);

        if (timeline.length > 0) {
          const eventsToInsert = timeline.map((ev, i) => ({
            invitation_id: invData.id,
            time: ev.time || "",
            title: ev.title || "",
            illustration_url: ev.illustration_url || "",
            img_side: ev.img_side || (i % 2 === 0 ? "left" : "right"),
            order_index: i,
          }));
          const { error: tlErr } = await supabase.from("timeline_events").insert(eventsToInsert);
          if (tlErr) console.warn("Timeline insert error:", tlErr.message);
        }
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error("Save error:", err);
      setErrorMessage(err.message || "Failed to save changes. Please ensure Supabase policies allow updates.");
    } finally {
      setSaving(false);
    }
  };

  // Export RSVPs to CSV
  const exportCsv = () => {
    if (rsvps.length === 0) return;
    const headers = "Guest Name,Attending,Guests,Date Submitted\n";
    const rows = rsvps
      .map((r) => `"${r.guest_name}","${r.attending}","${r.guest_count}","${new Date(r.created_at).toLocaleString()}"`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `RSVPs_${slug}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalGuests = rsvps
    .filter((r) => r.attending === "yes")
    .reduce((sum, r) => sum + (parseInt(r.guest_count, 10) || 1), 0);
  const acceptedCount = rsvps.filter((r) => r.attending === "yes").length;
  const declinedCount = rsvps.filter((r) => r.attending === "no").length;

  return (
    <div className="ap-root">
      {/* Sleek Modern Top Navigation Bar */}
      <header className="ap-navbar">
        <div className="ap-navbar-left">
          <div className="ap-brand">
            <span className="ap-brand-badge">ADMIN</span>
            <span className="ap-brand-title">Wedding Control Panel</span>
          </div>

          <div className="ap-slug-pill">
            <span className="ap-slug-label">Slug:</span>
            <input
              type="text"
              className="ap-slug-field"
              value={formData.slug || slug}
              onChange={(e) => handleChange("slug", e.target.value)}
              placeholder="e.g. ayash-farwin"
              title="URL Slug identifier"
            />
          </div>
        </div>

        <div className="ap-navbar-actions">
          <button
            type="button"
            className="ap-btn-ghost"
            onClick={() => onBackToInvite && onBackToInvite(formData.slug || slug)}
            title="Open live wedding invitation in preview mode"
          >
            <span>Live Preview</span>
            <span>↗</span>
          </button>
          <button
            type="button"
            className="ap-btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <>
                <span className="ap-spinner" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <span>💾</span>
                <span>Save All Changes</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Notifications */}
      {saveSuccess && (
        <div className="ap-toast ap-toast-success">
          <span>✓</span> All invitation settings and media saved successfully to Supabase!
        </div>
      )}
      {errorMessage && (
        <div className="ap-toast ap-toast-error">
          <span>✕</span> {errorMessage}
        </div>
      )}

      {/* Main Workspace */}
      <div className="ap-layout">
        {/* Sidebar Navigation */}
        <aside className="ap-sidebar">
          <div className="ap-sidebar-menu">
            <button
              type="button"
              className={`ap-nav-item ${activeTab === "couple" ? "active" : ""}`}
              onClick={() => setActiveTab("couple")}
            >
              <span className="ap-nav-icon">💍</span>
              <span className="ap-nav-text">Couple &amp; Ceremony</span>
            </button>

            <button
              type="button"
              className={`ap-nav-item ${activeTab === "date" ? "active" : ""}`}
              onClick={() => setActiveTab("date")}
            >
              <span className="ap-nav-icon">📅</span>
              <span className="ap-nav-text">Date &amp; Countdown</span>
            </button>

            <button
              type="button"
              className={`ap-nav-item ${activeTab === "venue" ? "active" : ""}`}
              onClick={() => setActiveTab("venue")}
            >
              <span className="ap-nav-icon">📍</span>
              <span className="ap-nav-text">Venue &amp; Location</span>
            </button>

            <button
              type="button"
              className={`ap-nav-item ${activeTab === "media" ? "active" : ""}`}
              onClick={() => setActiveTab("media")}
            >
              <span className="ap-nav-icon">🎬</span>
              <span className="ap-nav-text">Media &amp; Images</span>
            </button>

            <button
              type="button"
              className={`ap-nav-item ${activeTab === "timeline" ? "active" : ""}`}
              onClick={() => setActiveTab("timeline")}
            >
              <span className="ap-nav-icon">⏳</span>
              <span className="ap-nav-text">Timeline ({timeline.length})</span>
            </button>

            <button
              type="button"
              className={`ap-nav-item ${activeTab === "dress" ? "active" : ""}`}
              onClick={() => setActiveTab("dress")}
            >
              <span className="ap-nav-icon">👗</span>
              <span className="ap-nav-text">Dress Code &amp; Verse</span>
            </button>

            <button
              type="button"
              className={`ap-nav-item ${activeTab === "rsvps" ? "active" : ""}`}
              onClick={() => setActiveTab("rsvps")}
            >
              <span className="ap-nav-icon">💌</span>
              <span className="ap-nav-text">RSVP Responses ({rsvps.length})</span>
            </button>
          </div>
        </aside>

        {/* Content Panel */}
        <main className="ap-content">
          {loading ? (
            <div className="ap-loading">Loading invitation details from Supabase...</div>
          ) : (
            <form onSubmit={handleSave}>
              {/* TAB 1: COUPLE & PARENTS */}
              {activeTab === "couple" && (
                <div className="ap-section-card">
                  <h2>💍 Couple &amp; Ceremony Information</h2>
                  <p className="ap-desc">Customize bride &amp; groom names, parent titles, and ceremony title.</p>

                  <div className="ap-grid-2">
                    <div className="ap-field">
                      <label>Groom's Name (Partner A)</label>
                      <input
                        type="text"
                        value={formData.groom_name || ""}
                        onChange={(e) => handleChange("groom_name", e.target.value)}
                        placeholder="e.g. Ayash"
                        required
                      />
                    </div>
                    <div className="ap-field">
                      <label>Bride's Name (Partner B)</label>
                      <input
                        type="text"
                        value={formData.bride_name || ""}
                        onChange={(e) => handleChange("bride_name", e.target.value)}
                        placeholder="e.g. Farwin"
                        required
                      />
                    </div>
                  </div>

                  <div className="ap-grid-2">
                    <div className="ap-field">
                      <label>Groom's Parents</label>
                      <input
                        type="text"
                        value={formData.groom_parents || ""}
                        onChange={(e) => handleChange("groom_parents", e.target.value)}
                        placeholder="e.g. MR & MRS CH. HUSSAINI"
                      />
                    </div>
                    <div className="ap-field">
                      <label>Bride's Parents</label>
                      <input
                        type="text"
                        value={formData.bride_parents || ""}
                        onChange={(e) => handleChange("bride_parents", e.target.value)}
                        placeholder="e.g. MR & MRS CH. FAROOQI"
                      />
                    </div>
                  </div>

                  <div className="ap-field">
                    <label>Occasion / Ceremony Title</label>
                    <input
                      type="text"
                      value={formData.occasion || ""}
                      onChange={(e) => handleChange("occasion", e.target.value)}
                      placeholder="e.g. Nikkah Ceremony"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: DATE & COUNTDOWN */}
              {activeTab === "date" && (
                <div className="ap-section-card">
                  <h2>📅 Wedding Date &amp; Countdown Timer</h2>
                  <p className="ap-desc">Set the ceremony date &amp; time. The countdown timer and scratch-off cards automatically compute days, month, and year from this setting.</p>

                  <div className="ap-grid-2">
                    <div className="ap-field">
                      <label>Ceremony Date &amp; Time</label>
                      <input
                        type="datetime-local"
                        value={formData.wedding_date || ""}
                        onChange={(e) => handleChange("wedding_date", e.target.value)}
                        required
                      />
                    </div>
                    <div className="ap-field">
                      <label>RSVP Deadline Text</label>
                      <input
                        type="text"
                        value={formData.rsvp_deadline || ""}
                        onChange={(e) => handleChange("rsvp_deadline", e.target.value)}
                        placeholder="e.g. 30 November 2026"
                      />
                    </div>
                  </div>

                  <div className="ap-preview-box">
                    <strong>Live Date Preview:</strong>
                    <span>
                      {formData.wedding_date
                        ? new Date(formData.wedding_date).toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Select date"}
                    </span>
                  </div>
                </div>
              )}

              {/* TAB 3: VENUE & LOCATION */}
              {activeTab === "venue" && (
                <div className="ap-section-card">
                  <h2>📍 Venue &amp; Location Details</h2>
                  <p className="ap-desc">Specify city, venue hall, and the Google Maps location search string.</p>

                  <div className="ap-grid-2">
                    <div className="ap-field">
                      <label>City</label>
                      <input
                        type="text"
                        value={formData.city || ""}
                        onChange={(e) => handleChange("city", e.target.value)}
                        placeholder="e.g. DUBAI"
                      />
                    </div>
                    <div className="ap-field">
                      <label>Venue Name</label>
                      <input
                        type="text"
                        value={formData.venue_title || ""}
                        onChange={(e) => handleChange("venue_title", e.target.value)}
                        placeholder="e.g. Four Seasons Hotel Jumeirah"
                      />
                    </div>
                  </div>

                  <div className="ap-field">
                    <label>Hall / Ballroom Subtitle</label>
                    <input
                      type="text"
                      value={formData.venue_sub || ""}
                      onChange={(e) => handleChange("venue_sub", e.target.value)}
                      placeholder="e.g. Dana Ballroom"
                    />
                  </div>

                  <ImageUploadField
                    label="Venue Photo Image"
                    description="Luxury photograph or architectural illustration of the wedding venue."
                    value={formData.venue_image_url}
                    defaultValue={DEFAULT_INVITE.venue_image_url}
                    onChange={(val) => handleChange("venue_image_url", val)}
                  />

                  <div className="ap-field">
                    <label>Google Maps Search Query / Address</label>
                    <input
                      type="text"
                      value={formData.map_query || ""}
                      onChange={(e) => handleChange("map_query", e.target.value)}
                      placeholder="e.g. Four Seasons Resort Dubai at Jumeirah Beach"
                    />
                  </div>

                  {formData.map_query && (
                    <div className="ap-map-preview">
                      <iframe
                        title="admin-map-preview"
                        src={`https://www.google.com/maps?q=${encodeURIComponent(formData.map_query)}&output=embed`}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: MEDIA & IMAGES */}
              {activeTab === "media" && (
                <div className="ap-section-card">
                  <h2>🎬 Media, Images &amp; Background Audio</h2>
                  <p className="ap-desc">Manage all photos, videos, calligraphy graphics, and background audio for the invitation.</p>

                  {/* Section 1: Envelope & Cover Media */}
                  <div className="ap-media-group">
                    <h3 className="ap-media-group-title">✉️ 1. Envelope &amp; Cover Media</h3>
                    
                    <div className="ap-field">
                      <label>Opening Envelope Video (URL or local path)</label>
                      <input
                        type="text"
                        value={formData.envelope_video_url || ""}
                        onChange={(e) => handleChange("envelope_video_url", e.target.value)}
                        placeholder="e.g. /Envelope%20Cover%20Video%202.mp4 or CDN URL"
                      />
                      <small>Plays seamlessly in-place when the guest taps to unseal the envelope.</small>
                    </div>

                    <ImageUploadField
                      label="Envelope Cover Static Photo (Poster Image)"
                      description="Displayed on the envelope before tapping to open, and as the initial video poster."
                      value={formData.envelope_image_url}
                      defaultValue={DEFAULT_INVITE.envelope_image_url}
                      onChange={(val) => handleChange("envelope_image_url", val)}
                    />
                  </div>

                  {/* Section 2: Hero Background & Music */}
                  <div className="ap-media-group">
                    <h3 className="ap-media-group-title">🎥 2. Hero Background Video &amp; Music</h3>
                    
                    <div className="ap-field">
                      <label>Main Hero Background Video (URL)</label>
                      <input
                        type="text"
                        value={formData.hero_video_url || ""}
                        onChange={(e) => handleChange("hero_video_url", e.target.value)}
                        placeholder="e.g. https://.../Newbeautifulvideo.mp4"
                      />
                      <small>Looping video in the background of the first invitation page.</small>
                    </div>

                    <div className="ap-field">
                      <label>Background Music Audio (MP3 URL)</label>
                      <input
                        type="text"
                        value={formData.audio_url || ""}
                        onChange={(e) => handleChange("audio_url", e.target.value)}
                        placeholder="e.g. https://.../music.mp3"
                      />
                      {formData.audio_url && (
                        <div style={{ marginTop: "8px" }}>
                          <audio controls src={formData.audio_url} style={{ width: "100%", height: "36px" }} />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Section 3: Venue & Location Photos */}
                  <div className="ap-media-group">
                    <h3 className="ap-media-group-title">🏛️ 3. Venue &amp; Location Photos</h3>
                    
                    <ImageUploadField
                      label="Main Venue Photograph"
                      description="Framed photo of the wedding venue shown in the Location section."
                      value={formData.venue_image_url}
                      defaultValue={DEFAULT_INVITE.venue_image_url}
                      onChange={(val) => handleChange("venue_image_url", val)}
                    />

                    <div className="ap-grid-2">
                      <ImageUploadField
                        label="Top-Right Venue Flower Bouquet"
                        description="Decorative floral cluster at the top-right of Location."
                        value={formData.venue_top_flower}
                        defaultValue={DEFAULT_INVITE.venue_top_flower}
                        onChange={(val) => handleChange("venue_top_flower", val)}
                      />
                      <ImageUploadField
                        label="Bottom-Left Venue Flower Bouquet"
                        description="Decorative floral cluster overlapping the venue photo."
                        value={formData.venue_bottom_flower}
                        defaultValue={DEFAULT_INVITE.venue_bottom_flower}
                        onChange={(val) => handleChange("venue_bottom_flower", val)}
                      />
                    </div>
                  </div>

                  {/* Section 4: 3D Arch & Islamic Calligraphy */}
                  <div className="ap-media-group">
                    <h3 className="ap-media-group-title">🌸 4. Islamic Arch &amp; Calligraphy Graphics</h3>

                    <ImageUploadField
                      label="Bismillah Arabic Calligraphy"
                      description="Gold embossed Bismillah calligraphy at the crown of the arch."
                      value={formData.bismillah_img}
                      defaultValue={DEFAULT_INVITE.bismillah_img}
                      onChange={(val) => handleChange("bismillah_img", val)}
                    />

                    <ImageUploadField
                      label="3D Embossed Arch Frame"
                      description="Luxury architectural 3D arch border containing the invitation wording."
                      value={formData.arch_frame_img}
                      defaultValue={DEFAULT_INVITE.arch_frame_img}
                      onChange={(val) => handleChange("arch_frame_img", val)}
                    />

                    <div className="ap-grid-2">
                      <ImageUploadField
                        label="Arch Base Left Flowers"
                        description="Floral bouquet sitting at the bottom-left of the arch."
                        value={formData.arch_floral_left}
                        defaultValue={DEFAULT_INVITE.arch_floral_left}
                        onChange={(val) => handleChange("arch_floral_left", val)}
                      />
                      <ImageUploadField
                        label="Arch Base Right Flowers"
                        description="Floral bouquet sitting at the bottom-right of the arch."
                        value={formData.arch_floral_right}
                        defaultValue={DEFAULT_INVITE.arch_floral_right}
                        onChange={(val) => handleChange("arch_floral_right", val)}
                      />
                    </div>
                  </div>

                  {/* Section 5: Corner Florals & Flourishes */}
                  <div className="ap-media-group">
                    <h3 className="ap-media-group-title">🌿 5. Hero Corner Florals &amp; Timeline Flourish</h3>

                    <div className="ap-grid-2">
                      <ImageUploadField
                        label="Hero Top-Left Swaying Bouquet"
                        description="Flower branch in the top-left of the first page."
                        value={formData.floral_left}
                        defaultValue={DEFAULT_INVITE.floral_left}
                        onChange={(val) => handleChange("floral_left", val)}
                      />
                      <ImageUploadField
                        label="Hero Top-Right Swaying Bouquet"
                        description="Flower branch in the top-right of the first page."
                        value={formData.floral_right}
                        defaultValue={DEFAULT_INVITE.floral_right}
                        onChange={(val) => handleChange("floral_right", val)}
                      />
                    </div>

                    <ImageUploadField
                      label="Timeline Calligraphy Flourish"
                      description="Header flourish motif sitting above the timeline."
                      value={formData.timeline_flourish}
                      defaultValue={DEFAULT_INVITE.timeline_flourish}
                      onChange={(val) => handleChange("timeline_flourish", val)}
                    />
                  </div>
                </div>
              )}

              {/* TAB 5: TIMELINE */}
              {activeTab === "timeline" && (
                <div className="ap-section-card">
                  <div className="ap-section-header">
                    <div>
                      <h2>⏳ Wedding Day Timeline</h2>
                      <p className="ap-desc">Manage the itinerary schedule, descriptions, and illustrations.</p>
                    </div>
                    <button type="button" className="ap-btn-secondary" onClick={addTimelineItem}>
                      + Add New Event
                    </button>
                  </div>

                  <div className="ap-timeline-list">
                    {timeline.map((item, idx) => (
                      <div key={idx} className="ap-timeline-item-card">
                        <div className="ap-tl-header">
                          <span className="ap-tl-num">#{idx + 1}</span>
                          <button
                            type="button"
                            className="ap-btn-delete"
                            onClick={() => removeTimelineItem(idx)}
                            title="Remove item"
                          >
                            &times; Delete
                          </button>
                        </div>

                        <div className="ap-grid-3">
                          <div className="ap-field">
                            <label>Time</label>
                            <input
                              type="text"
                              value={item.time}
                              onChange={(e) => handleTimelineChange(idx, "time", e.target.value)}
                              placeholder="e.g. 6:30 pm"
                            />
                          </div>
                          <div className="ap-field" style={{ gridColumn: "span 2" }}>
                            <label>Event Title</label>
                            <input
                              type="text"
                              value={item.title}
                              onChange={(e) => handleTimelineChange(idx, "title", e.target.value)}
                              placeholder="e.g. Bride Entrance"
                            />
                          </div>
                        </div>

                        <div className="ap-grid-2">
                          <div className="ap-field">
                            <label>Side on Timeline</label>
                            <select
                              value={item.img_side || "left"}
                              onChange={(e) => handleTimelineChange(idx, "img_side", e.target.value)}
                            >
                              <option value="left">Left</option>
                              <option value="right">Right</option>
                            </select>
                          </div>
                          <div className="ap-field">
                            <label>Illustration Image URL</label>
                            <div style={{ display: "flex", gap: "8px" }}>
                              <input
                                type="text"
                                value={item.illustration_url || ""}
                                onChange={(e) => handleTimelineChange(idx, "illustration_url", e.target.value)}
                                placeholder="https://...png"
                                style={{ flex: 1 }}
                              />
                              <label className="ap-img-upload-btn" style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", padding: "6px 10px", fontSize: "12px", whiteSpace: "nowrap" }}>
                                📁 Pick
                                <input
                                  type="file"
                                  accept="image/*"
                                  style={{ display: "none" }}
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onload = (evt) => {
                                        handleTimelineChange(idx, "illustration_url", evt.target.result);
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                />
                              </label>
                            </div>
                          </div>
                        </div>

                        {item.illustration_url && (
                          <div style={{ marginTop: "8px", display: "flex", alignItems: "center", gap: "10px" }}>
                            <img
                              src={item.illustration_url}
                              alt="Illustration Preview"
                              style={{ width: "48px", height: "48px", objectFit: "contain", border: "1px solid #D6C2A8", borderRadius: "6px", background: "#FCFAF7" }}
                            />
                            <small style={{ color: "#8A7763" }}>Event Illustration Preview</small>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 6: DRESS CODE & VERSE */}
              {activeTab === "dress" && (
                <div className="ap-section-card">
                  <h2>👗 Dress Code &amp; Quranic Verse</h2>
                  <p className="ap-desc">Configure the color palette guidelines and Quranic verse citation.</p>

                  <div className="ap-field">
                    <label>Dress Code Title</label>
                    <input
                      type="text"
                      value={formData.dress_code?.title || ""}
                      onChange={(e) => handleDressCodeChange("title", e.target.value)}
                      placeholder="e.g. Soft Pastel Shades"
                    />
                  </div>

                  <div className="ap-field">
                    <label>Dress Code Description / Guidelines</label>
                    <textarea
                      rows={3}
                      value={formData.dress_code?.note || ""}
                      onChange={(e) => handleDressCodeChange("note", e.target.value)}
                      placeholder="e.g. We kindly invite our guests to dress in soft pastel shades..."
                    />
                  </div>

                  <div className="ap-field">
                    <label>Color Palette Swatches</label>
                    <div className="ap-palette-row">
                      {(formData.dress_code?.palette || []).map((color, idx) => (
                        <div key={idx} className="ap-swatch-picker">
                          <input
                            type="color"
                            value={color}
                            onChange={(e) => handlePaletteChange(idx, e.target.value)}
                          />
                          <span>{color}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <hr style={{ margin: "24px 0", border: "none", borderTop: "1px solid #EDE4D8" }} />

                  <div className="ap-field">
                    <label>Quranic Verse Text</label>
                    <input
                      type="text"
                      value={formData.verse_text || ""}
                      onChange={(e) => handleChange("verse_text", e.target.value)}
                      placeholder="e.g. And We created you in pairs."
                    />
                  </div>

                  <div className="ap-field">
                    <label>Verse Reference</label>
                    <input
                      type="text"
                      value={formData.verse_ref || ""}
                      onChange={(e) => handleChange("verse_ref", e.target.value)}
                      placeholder="e.g. Surah An-Naba 78:8"
                    />
                  </div>
                </div>
              )}

              {/* TAB 7: LIVE RSVPS */}
              {activeTab === "rsvps" && (
                <div className="ap-section-card">
                  <div className="ap-section-header">
                    <div>
                      <h2>💌 Guest RSVPs</h2>
                      <p className="ap-desc">Real-time attendance responses submitted by invited guests.</p>
                    </div>
                    {rsvps.length > 0 && (
                      <button type="button" className="ap-btn-secondary" onClick={exportCsv}>
                        📥 Export to CSV
                      </button>
                    )}
                  </div>

                  <div className="ap-stats-row">
                    <div className="ap-stat-card">
                      <div className="ap-stat-val">{rsvps.length}</div>
                      <div className="ap-stat-lbl">Total Responses</div>
                    </div>
                    <div className="ap-stat-card">
                      <div className="ap-stat-val">{attendingCount}</div>
                      <div className="ap-stat-lbl">Attending</div>
                    </div>
                    <div className="ap-stat-card">
                      <div className="ap-stat-val">{totalGuestsCount}</div>
                      <div className="ap-stat-lbl">Total Guests</div>
                    </div>
                    <div className="ap-stat-card">
                      <div className="ap-stat-val">{declinedCount}</div>
                      <div className="ap-stat-lbl">Declined</div>
                    </div>
                  </div>

                  {rsvps.length === 0 ? (
                    <div className="ap-empty">No RSVPs submitted yet. As guests confirm attendance, they will appear here live.</div>
                  ) : (
                    <div className="ap-table-wrap">
                      <table className="ap-table">
                        <thead>
                          <tr>
                            <th>Guest Name</th>
                            <th>Status</th>
                            <th>Guest Count</th>
                            <th>Submitted On</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rsvps.map((r) => (
                            <tr key={r.id}>
                              <td><strong>{r.guest_name}</strong></td>
                              <td>
                                <span className={`ap-badge ${r.attending === "yes" ? "badge-yes" : "badge-no"}`}>
                                  {r.attending === "yes" ? "✓ Attending" : "✗ Declined"}
                                </span>
                              </td>
                              <td>{r.attending === "yes" ? r.guest_count || 1 : "—"}</td>
                              <td style={{ color: "#8A7763", fontSize: "12px" }}>
                                {r.created_at ? new Date(r.created_at).toLocaleString() : "Recently"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Bottom Action Bar */}
              <div className="ap-bottom-bar">
                <button type="submit" className="ap-btn-save-large" disabled={saving}>
                  {saving ? "💾 Saving All Changes to Supabase..." : "💾 Save All Changes to Supabase"}
                </button>
              </div>
            </form>
          )}
        </main>
      </div>

      <style>{`
        /* ============================================================
           ADMIN PANEL LUXURY MODERN DASHBOARD DESIGN SYSTEM
           ============================================================ */
        .ap-root {
          min-height: 100vh;
          background: #F8F5F0;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          color: #3B2E1E;
          -webkit-font-smoothing: antialiased;
        }

        /* Top Modern Navbar */
        .ap-navbar {
          background: #FFFFFF;
          border-bottom: 1px solid #EADDCF;
          padding: 14px 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 1000;
          box-shadow: 0 2px 10px rgba(70, 50, 20, 0.04);
        }

        .ap-navbar-left {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .ap-brand {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .ap-brand-badge {
          background: #8A6B34;
          color: #FFFFFF;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.8px;
          padding: 4px 8px;
          border-radius: 5px;
          text-transform: uppercase;
        }

        .ap-brand-title {
          font-size: 17px;
          font-weight: 700;
          color: #4A351C;
          letter-spacing: -0.2px;
        }

        .ap-slug-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #FAF6EF;
          border: 1px solid #E2D4C3;
          padding: 5px 12px;
          border-radius: 20px;
        }

        .ap-slug-label {
          font-size: 12px;
          font-weight: 600;
          color: #8C755E;
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }

        .ap-slug-field {
          background: transparent;
          border: none;
          outline: none;
          font-size: 13px;
          font-weight: 600;
          color: #5C4325;
          width: 140px;
          font-family: inherit;
        }

        .ap-navbar-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .ap-btn-ghost {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #FAF6EF;
          border: 1px solid #D8C7B5;
          color: #6E5330;
          font-size: 13px;
          font-weight: 600;
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .ap-btn-ghost:hover {
          background: #EFE4D3;
          border-color: #CBB6A0;
          color: #4A351C;
        }

        .ap-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, #9C7A3E 0%, #80612A 100%);
          color: #FFFFFF;
          border: none;
          font-size: 13px;
          font-weight: 700;
          padding: 9px 20px;
          border-radius: 8px;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(138, 107, 52, 0.3);
          transition: all 0.2s;
        }

        .ap-btn-primary:hover:not(:disabled) {
          background: linear-gradient(135deg, #8A6B34 0%, #705423 100%);
          box-shadow: 0 4px 12px rgba(138, 107, 52, 0.4);
          transform: translateY(-1px);
        }

        .ap-btn-primary:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .ap-spinner {
          display: inline-block;
          width: 12px;
          height: 12px;
          border: 2px solid rgba(255,255,255,0.4);
          border-top-color: #FFFFFF;
          border-radius: 50%;
          animation: ap-spin 0.8s linear infinite;
        }

        @keyframes ap-spin {
          to { transform: rotate(360deg); }
        }

        /* Notifications & Toasts */
        .ap-toast {
          padding: 12px 32px;
          font-size: 13px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .ap-toast-success {
          background: #EAF8EF;
          border-bottom: 1px solid #A8E4BA;
          color: #1A6C35;
        }

        .ap-toast-error {
          background: #FDF2F2;
          border-bottom: 1px solid #F6B8B8;
          color: #A32727;
        }

        /* Workspace Grid */
        .ap-layout {
          max-width: 1240px;
          margin: 0 auto;
          padding: 28px 24px 60px;
          display: flex;
          gap: 28px;
          align-items: flex-start;
        }

        /* Sidebar Tabs */
        .ap-sidebar {
          width: 250px;
          flex-shrink: 0;
          position: sticky;
          top: 86px;
        }

        .ap-sidebar-menu {
          background: #FFFFFF;
          border: 1px solid #EBE0D3;
          border-radius: 12px;
          padding: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.02);
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .ap-nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          text-align: left;
          padding: 11px 14px;
          background: transparent;
          border: none;
          border-radius: 8px;
          font-size: 13.5px;
          font-weight: 600;
          color: #695844;
          cursor: pointer;
          transition: all 0.15s;
          font-family: inherit;
        }

        .ap-nav-item:hover {
          background: #FAF5EE;
          color: #4A351C;
        }

        .ap-nav-item.active {
          background: #8A6B34;
          color: #FFFFFF;
          box-shadow: 0 3px 10px rgba(138, 107, 52, 0.28);
        }

        .ap-nav-icon {
          font-size: 16px;
        }

        .ap-nav-text {
          flex: 1;
        }

        /* Content Panel */
        .ap-content {
          flex: 1;
          min-width: 0;
        }

        .ap-section-card {
          background: #FFFFFF;
          border: 1px solid #ECE2D5;
          border-radius: 14px;
          padding: 32px;
          box-shadow: 0 3px 16px rgba(0, 0, 0, 0.03);
          margin-bottom: 24px;
        }

        .ap-section-card h2 {
          font-size: 20px;
          font-weight: 700;
          color: #4A351C;
          margin: 0 0 6px;
        }

        .ap-desc {
          font-size: 13px;
          color: #8C7863;
          margin: 0 0 24px;
          line-height: 1.5;
        }

        /* Form Grids */
        .ap-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
          margin-bottom: 18px;
        }

        .ap-grid-3 {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 18px;
          margin-bottom: 18px;
        }

        .ap-field {
          margin-bottom: 20px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .ap-field label {
          font-size: 13px;
          font-weight: 600;
          color: #54412B;
        }

        .ap-field input, .ap-field select, .ap-field textarea {
          border: 1px solid #D6C8B5;
          background: #FCFAF7;
          padding: 11px 14px;
          border-radius: 8px;
          font-size: 14px;
          color: #332619;
          font-family: inherit;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .ap-field input:focus, .ap-field select:focus, .ap-field textarea:focus {
          outline: none;
          border-color: #8A6B34;
          box-shadow: 0 0 0 3px rgba(138, 107, 52, 0.12);
          background: #FFFFFF;
        }

        .ap-field small {
          font-size: 12px;
          color: #9C8974;
          margin-top: 2px;
        }

        /* Media & Image Groups */
        .ap-media-group {
          background: #FAF6EF;
          border: 1px solid #EAE0D3;
          border-radius: 12px;
          padding: 22px;
          margin-bottom: 24px;
        }

        .ap-media-group-title {
          font-size: 15px;
          font-weight: 700;
          color: #6E5330;
          margin: 0 0 16px;
          padding-bottom: 10px;
          border-bottom: 1px solid #E5D7C7;
          letter-spacing: -0.1px;
        }

        .ap-image-field-card {
          background: #FFFFFF;
          border: 1px solid #E5DACD;
          border-radius: 10px;
          padding: 16px;
          margin-bottom: 14px;
          display: flex;
          gap: 18px;
          align-items: center;
          box-shadow: 0 1px 4px rgba(0,0,0,0.02);
        }

        .ap-image-field-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 6px;
          min-width: 0;
        }

        .ap-image-title {
          font-size: 13.5px;
          font-weight: 600;
          color: #4A351C;
        }

        .ap-image-desc-text {
          font-size: 12px;
          color: #8C7863;
          line-height: 1.4;
        }

        .ap-image-row {
          display: flex;
          gap: 8px;
          margin-top: 4px;
        }

        .ap-image-input {
          flex: 1;
          border: 1px solid #D6C8B5;
          background: #FCFAF7;
          padding: 9px 12px;
          border-radius: 6px;
          font-size: 13px;
          color: #332619;
          font-family: inherit;
        }

        .ap-image-input:focus {
          outline: none;
          border-color: #8A6B34;
          background: #FFFFFF;
        }

        .ap-img-upload-btn {
          background: #F4E8D6;
          border: 1px solid #D6C2A8;
          color: #6E5330;
          padding: 8px 14px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: background 0.15s;
        }

        .ap-img-upload-btn:hover {
          background: #EADBC5;
        }

        .ap-image-actions {
          display: flex;
          gap: 12px;
          margin-top: 4px;
        }

        .ap-img-reset-btn {
          background: none;
          border: none;
          color: #8A6B34;
          font-size: 11.5px;
          font-weight: 600;
          cursor: pointer;
          padding: 0;
          text-decoration: underline;
        }

        .ap-img-clear-btn {
          background: none;
          border: none;
          color: #C0392B;
          font-size: 11.5px;
          font-weight: 600;
          cursor: pointer;
          padding: 0;
        }

        .ap-image-thumb-box {
          width: 86px;
          height: 86px;
          flex-shrink: 0;
          border-radius: 8px;
          border: 1px solid #D6C8B5;
          background: #FDFBF8;
          background-image: linear-gradient(45deg, #F0EAE1 25%, transparent 25%),
                            linear-gradient(-45deg, #F0EAE1 25%, transparent 25%),
                            linear-gradient(45deg, transparent 75%, #F0EAE1 75%),
                            linear-gradient(-45deg, transparent 75%, #F0EAE1 75%);
          background-size: 12px 12px;
          background-position: 0 0, 0 6px, 6px -6px, -6px 0px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .ap-image-thumb-box img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .ap-no-img-text {
          font-size: 10px;
          color: #A89582;
          text-align: center;
        }

        /* Preview box & Map */
        .ap-preview-box {
          background: #FAF5ED;
          border: 1px dashed #D6C3AA;
          padding: 14px 18px;
          border-radius: 8px;
          display: flex;
          gap: 10px;
          font-size: 14px;
          color: #6E5330;
        }

        .ap-map-preview iframe {
          width: 100%;
          height: 220px;
          border-radius: 8px;
          border: 1px solid #E0D4C3;
          margin-top: 10px;
        }

        /* Palette Picker */
        .ap-palette-row {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
        }

        .ap-swatch-picker {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }

        .ap-swatch-picker input[type="color"] {
          width: 44px;
          height: 44px;
          border: none;
          cursor: pointer;
          border-radius: 8px;
          padding: 0;
          background: none;
        }

        .ap-swatch-picker span {
          font-size: 11px;
          font-family: monospace;
          color: #666;
        }

        /* Timeline Items */
        .ap-section-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
        }

        .ap-btn-secondary {
          background: #FAF4EB;
          border: 1px solid #D6C2A8;
          color: #73552C;
          font-weight: 600;
          padding: 8px 16px;
          border-radius: 7px;
          font-size: 13px;
          cursor: pointer;
        }

        .ap-btn-secondary:hover {
          background: #EDE1CE;
        }

        .ap-timeline-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .ap-timeline-item-card {
          background: #FCFAF7;
          border: 1px solid #E5DACE;
          border-radius: 8px;
          padding: 16px;
        }

        .ap-tl-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .ap-tl-num {
          font-weight: 700;
          color: #8A6B34;
          font-size: 13px;
        }

        .ap-btn-delete {
          background: none;
          border: none;
          color: #C0392B;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
        }

        .ap-btn-delete:hover {
          text-decoration: underline;
        }

        /* RSVP Statistics */
        .ap-stats-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          margin-bottom: 24px;
        }

        .ap-stat-card {
          background: #FAF6EF;
          border: 1px solid #EBE0D3;
          border-radius: 8px;
          padding: 16px;
          text-align: center;
        }

        .ap-stat-val {
          font-size: 28px;
          font-weight: 700;
          color: #5C4425;
          margin-bottom: 4px;
        }

        .ap-stat-lbl {
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #8A755D;
        }

        .ap-table-wrap {
          overflow-x: auto;
        }

        .ap-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
        }

        .ap-table th {
          text-align: left;
          padding: 12px;
          border-bottom: 2px solid #EBE0D3;
          color: #7A6752;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .ap-table td {
          padding: 12px;
          border-bottom: 1px solid #F0E6DA;
        }

        .ap-badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
        }

        .badge-yes {
          background: #E8F8F0;
          color: #27AE60;
        }

        .badge-no {
          background: #FDEEEF;
          color: #E74C3C;
        }

        .ap-bottom-bar {
          margin-top: 10px;
        }

        .ap-btn-save-large {
          width: 100%;
          background: linear-gradient(135deg, #9C7A3E 0%, #80612A 100%);
          color: #FFFFFF;
          border: none;
          font-weight: 700;
          padding: 16px;
          border-radius: 10px;
          font-size: 16px;
          cursor: pointer;
          box-shadow: 0 6px 18px rgba(138, 107, 52, 0.25);
          transition: all 0.2s;
        }

        .ap-btn-save-large:hover {
          background: linear-gradient(135deg, #8A6B34 0%, #705423 100%);
          box-shadow: 0 8px 22px rgba(138, 107, 52, 0.35);
        }

        .ap-loading, .ap-empty {
          text-align: center;
          padding: 40px;
          color: #8A7763;
        }

        @media (max-width: 860px) {
          .ap-navbar {
            padding: 12px 16px;
            flex-direction: column;
            gap: 12px;
          }
          .ap-layout {
            flex-direction: column;
            padding: 16px;
          }
          .ap-sidebar {
            width: 100%;
            position: static;
          }
          .ap-grid-2, .ap-grid-3, .ap-stats-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
