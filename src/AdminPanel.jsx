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
  verse_text: "And We created you in pairs.",
  verse_ref: "Surah An-Naba 78:8",
  rsvp_deadline: "30 November 2026",
  audio_url: "https://pub-4dc8201144ca418fb604349c73e8c724.r2.dev/Einaudi_%20Divenire%20(1)%20(1).mp3",
  envelope_video_url: "/Envelope%20Cover%20Video%202.mp4",
  hero_video_url: "https://pub-4dc8201144ca418fb604349c73e8c724.r2.dev/Newbeautifulvideo.mp4",
  dress_code: {
    title: "Soft Pastel Shades",
    note: "We kindly invite our guests to dress in soft pastel shades. Please avoid wearing beige, as it is reserved for the bride and groom.",
    palette: ["#F6E7D8", "#E8D5C4", "#D8E2DC", "#FFE5D9", "#ECE4DB"],
  },
};

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

          setFormData({
            ...inv,
            wedding_date: dateStr || DEFAULT_INVITE.wedding_date,
            dress_code: inv.dress_code || DEFAULT_INVITE.dress_code,
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
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    setErrorMessage("");

    try {
      if (!isSupabaseConfigured || !supabase) {
        throw new Error("Supabase is not configured in .env");
      }

      // 1. Update/Upsert Invitation
      const { data: invData, error: invError } = await supabase
        .from("invitations")
        .upsert(
          {
            ...formData,
            wedding_date: new Date(formData.wedding_date).toISOString(),
            slug: formData.slug || slug,
          },
          { onConflict: "slug" }
        )
        .select()
        .single();

      if (invError) throw invError;

      // 2. Update Timeline Events
      if (invData?.id) {
        // Remove old events and re-insert updated list
        await supabase.from("timeline_events").delete().eq("invitation_id", invData.id);

        if (timeline.length > 0) {
          const eventsToInsert = timeline.map((ev, i) => ({
            invitation_id: invData.id,
            time: ev.time,
            title: ev.title,
            illustration_url: ev.illustration_url,
            img_side: ev.img_side || (i % 2 === 0 ? "left" : "right"),
            order_index: i,
          }));
          await supabase.from("timeline_events").insert(eventsToInsert);
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
      {/* Top Navigation Bar */}
      <header className="ap-header">
        <div className="ap-header-left">
          <div className="ap-logo">
            <span className="ap-logo-badge">ADMIN</span>
            <h1>Wedding Invitation Control Panel</h1>
          </div>
          <div className="ap-slug-wrap">
            <label>Invite Slug:</label>
            <input
              type="text"
              value={formData.slug || slug}
              onChange={(e) => handleChange("slug", e.target.value)}
              placeholder="e.g. ayash-farwin"
            />
          </div>
        </div>

        <div className="ap-header-actions">
          <button
            type="button"
            className="ap-btn-preview"
            onClick={() => onBackToInvite && onBackToInvite(formData.slug || slug)}
          >
            Preview Live Invite ↗
          </button>
          <button
            type="button"
            className="ap-btn-save"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save All Changes"}
          </button>
        </div>
      </header>

      {/* Notifications */}
      {saveSuccess && (
        <div className="ap-alert ap-alert-success">
          ✓ All invitation changes saved successfully to Supabase!
        </div>
      )}
      {errorMessage && (
        <div className="ap-alert ap-alert-error">
          ✕ {errorMessage}
        </div>
      )}

      {/* Main Body */}
      <div className="ap-container">
        {/* Sidebar Tabs */}
        <aside className="ap-sidebar">
          <button
            className={`ap-tab-btn ${activeTab === "couple" ? "active" : ""}`}
            onClick={() => setActiveTab("couple")}
          >
            <span>💍</span> Couple &amp; Parents
          </button>
          <button
            className={`ap-tab-btn ${activeTab === "date" ? "active" : ""}`}
            onClick={() => setActiveTab("date")}
          >
            <span>📅</span> Date &amp; Countdown
          </button>
          <button
            className={`ap-tab-btn ${activeTab === "venue" ? "active" : ""}`}
            onClick={() => setActiveTab("venue")}
          >
            <span>📍</span> Venue &amp; Location
          </button>
          <button
            className={`ap-tab-btn ${activeTab === "media" ? "active" : ""}`}
            onClick={() => setActiveTab("media")}
          >
            <span>🎬</span> Cover Video &amp; Music
          </button>
          <button
            className={`ap-tab-btn ${activeTab === "timeline" ? "active" : ""}`}
            onClick={() => setActiveTab("timeline")}
          >
            <span>⏳</span> Wedding Timeline ({timeline.length})
          </button>
          <button
            className={`ap-tab-btn ${activeTab === "dress" ? "active" : ""}`}
            onClick={() => setActiveTab("dress")}
          >
            <span>👗</span> Dress Code &amp; Verse
          </button>
          <button
            className={`ap-tab-btn ${activeTab === "rsvps" ? "active" : ""}`}
            onClick={() => setActiveTab("rsvps")}
          >
            <span>💌</span> Live RSVPs ({rsvps.length})
          </button>
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

              {/* TAB 4: MEDIA & MUSIC */}
              {activeTab === "media" && (
                <div className="ap-section-card">
                  <h2>🎬 Videos, Invitation Graphic &amp; Background Audio</h2>
                  <p className="ap-desc">Update video loops, opening envelope animation, and background music stream.</p>

                  <div className="ap-field">
                    <label>Opening Envelope Video (URL or local path)</label>
                    <input
                      type="text"
                      value={formData.envelope_video_url || ""}
                      onChange={(e) => handleChange("envelope_video_url", e.target.value)}
                      placeholder="e.g. /Envelope%20Cover%20Video%202.mp4 or CDN URL"
                    />
                    <small>Played seamlessly in-place when user taps to open the envelope.</small>
                  </div>

                  <div className="ap-field">
                    <label>Main Hero Background Video (URL)</label>
                    <input
                      type="text"
                      value={formData.hero_video_url || ""}
                      onChange={(e) => handleChange("hero_video_url", e.target.value)}
                      placeholder="e.g. https://.../Newbeautifulvideo.mp4"
                    />
                    <small>Looping video in the background of the opening page.</small>
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
                            <input
                              type="text"
                              value={item.illustration_url || ""}
                              onChange={(e) => handleTimelineChange(idx, "illustration_url", e.target.value)}
                              placeholder="https://...png"
                            />
                          </div>
                        </div>
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
                    <label>Dress Code Note / Description</label>
                    <textarea
                      rows={3}
                      value={formData.dress_code?.note || ""}
                      onChange={(e) => handleDressCodeChange("note", e.target.value)}
                      placeholder="Guidelines for guests..."
                    />
                  </div>

                  <div className="ap-field">
                    <label>Color Swatches (Hex Codes)</label>
                    <div className="ap-palette-row">
                      {(formData.dress_code?.palette || ["#F6E7D8", "#E8D5C4", "#D8E2DC", "#FFE5D9", "#ECE4DB"]).map(
                        (col, i) => (
                          <div key={i} className="ap-swatch-picker">
                            <input
                              type="color"
                              value={col.startsWith("#") ? col : "#F6E7D8"}
                              onChange={(e) => handlePaletteChange(i, e.target.value)}
                            />
                            <span>{col}</span>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  <hr style={{ margin: "24px 0", borderColor: "#eee" }} />

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
                      <h2>💌 RSVP Guest List</h2>
                      <p className="ap-desc">Real-time attendance responses from your guests in Supabase.</p>
                    </div>
                    <button type="button" className="ap-btn-secondary" onClick={exportCsv} disabled={rsvps.length === 0}>
                      📥 Export to CSV
                    </button>
                  </div>

                  {/* Stat Cards */}
                  <div className="ap-stats-row">
                    <div className="ap-stat-card">
                      <div className="ap-stat-val">{totalGuests}</div>
                      <div className="ap-stat-lbl">Total Attending Guests</div>
                    </div>
                    <div className="ap-stat-card">
                      <div className="ap-stat-val" style={{ color: "#27ae60" }}>{acceptedCount}</div>
                      <div className="ap-stat-lbl">Accepted RSVPs</div>
                    </div>
                    <div className="ap-stat-card">
                      <div className="ap-stat-val" style={{ color: "#e74c3c" }}>{declinedCount}</div>
                      <div className="ap-stat-lbl">Declined</div>
                    </div>
                  </div>

                  {rsvps.length === 0 ? (
                    <div className="ap-empty">No RSVPs received yet. Once guests submit, they will appear here live.</div>
                  ) : (
                    <div className="ap-table-wrap">
                      <table className="ap-table">
                        <thead>
                          <tr>
                            <th>Guest Name</th>
                            <th>Status</th>
                            <th>Guests</th>
                            <th>Submitted At</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rsvps.map((r) => (
                            <tr key={r.id}>
                              <td style={{ fontWeight: "600" }}>{r.guest_name}</td>
                              <td>
                                <span className={`ap-badge ${r.attending === "yes" ? "badge-yes" : "badge-no"}`}>
                                  {r.attending === "yes" ? "Joyfully Attending" : "Declined"}
                                </span>
                              </td>
                              <td>{r.attending === "yes" ? r.guest_count : 0}</td>
                              <td style={{ color: "#888", fontSize: "12px" }}>
                                {new Date(r.created_at).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Bottom Sticky Save Bar */}
              <div className="ap-bottom-bar">
                <button
                  type="submit"
                  className="ap-btn-save-large"
                  disabled={saving}
                >
                  {saving ? "Saving Changes..." : "💾 Save All Changes to Supabase"}
                </button>
              </div>
            </form>
          )}
        </main>
      </div>

      {/* Admin Panel Styles */}
      <style>{`
        .ap-root {
          min-height: 100vh;
          background: #F4EFE6;
          color: #332619;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        }
        .ap-header {
          background: #FFFFFF;
          border-bottom: 1px solid #E6DACB;
          padding: 14px 28px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: 0 2px 10px rgba(0,0,0,0.04);
        }
        .ap-header-left {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .ap-logo {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .ap-logo h1 {
          font-size: 17px;
          font-weight: 700;
          margin: 0;
          color: #5C4325;
        }
        .ap-logo-badge {
          background: #8A6B34;
          color: #FFF;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1px;
          padding: 3px 7px;
          border-radius: 4px;
        }
        .ap-slug-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #7A6956;
        }
        .ap-slug-wrap input {
          background: #FAF6F0;
          border: 1px solid #D6C7B2;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 13px;
          color: #4A3926;
          font-weight: 600;
        }
        .ap-header-actions {
          display: flex;
          gap: 12px;
        }
        .ap-btn-preview {
          background: #FAF6F0;
          border: 1px solid #C4B199;
          color: #694F2E;
          font-weight: 600;
          padding: 8px 16px;
          border-radius: 7px;
          cursor: pointer;
          font-size: 13px;
          transition: all 0.2s;
        }
        .ap-btn-preview:hover {
          background: #EFE6D8;
        }
        .ap-btn-save {
          background: #8A6B34;
          color: #FFFFFF;
          border: none;
          font-weight: 600;
          padding: 8px 20px;
          border-radius: 7px;
          cursor: pointer;
          font-size: 13px;
          transition: all 0.2s;
        }
        .ap-btn-save:hover {
          background: #735728;
        }
        .ap-alert {
          padding: 12px 24px;
          font-size: 14px;
          font-weight: 600;
          text-align: center;
        }
        .ap-alert-success {
          background: #D4EDDA;
          color: #155724;
          border-bottom: 1px solid #C3E6CB;
        }
        .ap-alert-error {
          background: #F8D7DA;
          color: #721C24;
          border-bottom: 1px solid #F5C6CB;
        }
        .ap-container {
          display: flex;
          max-width: 1200px;
          margin: 24px auto;
          padding: 0 20px;
          gap: 24px;
        }
        .ap-sidebar {
          width: 260px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .ap-tab-btn {
          background: #FFFFFF;
          border: 1px solid #EADBCE;
          color: #5C4A36;
          padding: 12px 16px;
          text-align: left;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 10px;
          transition: all 0.2s;
        }
        .ap-tab-btn:hover {
          background: #FAF6F0;
          border-color: #D6C1AA;
        }
        .ap-tab-btn.active {
          background: #8A6B34;
          color: #FFFFFF;
          border-color: #8A6B34;
          box-shadow: 0 4px 12px rgba(138, 107, 52, 0.25);
        }
        .ap-content {
          flex: 1;
        }
        .ap-section-card {
          background: #FFFFFF;
          border: 1px solid #E6DACB;
          border-radius: 12px;
          padding: 28px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.03);
          margin-bottom: 24px;
        }
        .ap-section-card h2 {
          font-size: 20px;
          color: #4A351C;
          margin: 0 0 6px;
        }
        .ap-desc {
          font-size: 13px;
          color: #8A7763;
          margin: 0 0 22px;
        }
        .ap-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 16px;
        }
        .ap-grid-3 {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 16px;
          margin-bottom: 16px;
        }
        .ap-field {
          margin-bottom: 18px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .ap-field label {
          font-size: 13px;
          font-weight: 600;
          color: #5C4934;
        }
        .ap-field input, .ap-field select, .ap-field textarea {
          border: 1px solid #D6C8B5;
          background: #FCFAF7;
          padding: 10px 14px;
          border-radius: 7px;
          font-size: 14px;
          color: #332619;
          font-family: inherit;
          transition: border-color 0.2s;
        }
        .ap-field input:focus, .ap-field select:focus, .ap-field textarea:focus {
          outline: none;
          border-color: #8A6B34;
          background: #FFFFFF;
        }
        .ap-field small {
          font-size: 12px;
          color: #9C8974;
        }
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
          cursor: pointer;
          font-size: 13px;
        }
        .ap-timeline-item-card {
          background: #FAF7F2;
          border: 1px solid #E8DDD0;
          border-radius: 9px;
          padding: 16px;
          margin-bottom: 14px;
        }
        .ap-tl-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        .ap-tl-num {
          font-weight: 700;
          font-size: 13px;
          color: #8A6B34;
        }
        .ap-btn-delete {
          background: none;
          border: none;
          color: #c0392b;
          font-weight: 600;
          font-size: 12px;
          cursor: pointer;
        }
        .ap-stats-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }
        .ap-stat-card {
          background: #FAF6F0;
          border: 1px solid #EADBCE;
          padding: 18px;
          border-radius: 10px;
          text-align: center;
        }
        .ap-stat-val {
          font-size: 32px;
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
          background: #8A6B34;
          color: #FFFFFF;
          border: none;
          font-weight: 700;
          padding: 16px;
          border-radius: 10px;
          font-size: 16px;
          cursor: pointer;
          box-shadow: 0 6px 18px rgba(138, 107, 52, 0.3);
          transition: background 0.2s;
        }
        .ap-btn-save-large:hover {
          background: #735728;
        }
        .ap-loading, .ap-empty {
          text-align: center;
          padding: 40px;
          color: #8A7763;
        }
        @media (max-width: 768px) {
          .ap-container {
            flex-direction: column;
          }
          .ap-sidebar {
            width: 100%;
          }
          .ap-grid-2, .ap-grid-3, .ap-stats-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
