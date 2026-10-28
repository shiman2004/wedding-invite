import React, { useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "./supabase";
import WeddingInvite from "./WeddingInvite.jsx";

const DEFAULT_INVITE = {
  slug: "ayash-farwin",
  groom_name: "Ayash",
  bride_name: "Farwin",
  groom_parents: "Ms.Najeema",
  bride_parents: "Mr & Mrs Jawfer",
  occasion: "Nikkah Ceremony",
  wedding_date: "2026-11-13T12:30",
  city: "Eravur",
  venue_title: "Eravur, Batticaloa",
  venue_sub: "EASCCA conference centre",
  map_query: "EASCCA conference centre",
  venue_image_url: "https://lh3.googleusercontent.com/grass-cs/AABkmLfxXBRJI_9Tsof5q4TUPN0716WMdjx5XDF1AlbstTxFJK-woomjwYMYp0UbHqSFqH8xZr3T9gyyeo-801LG4xBlJguuAk3RANGMVmai1Cu5TjvyRmRRbVmnM5sXq67rBbukN929apdycQmm=w408-h307-k-no",
  rsvp_deadline: "1 November 2026",
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

const AUTH_KEY = "wedding_admin_authenticated";
const CUSTOM_PASS_KEY = "wedding_admin_password";
const DEFAULT_PASSWORDS = [
  (import.meta.env.VITE_ADMIN_PASSWORD || "").trim(),
  "ayash2026",
  "admin123",
  "ayash-farwin",
].filter(Boolean);

export default function AdminPanel({ onBackToInvite, initialSlug }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window === "undefined") return false;
    return (
      sessionStorage.getItem(AUTH_KEY) === "true" ||
      localStorage.getItem(AUTH_KEY) === "true"
    );
  });
  const [passwordInput, setPasswordInput] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [authError, setAuthError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showChangePassModal, setShowChangePassModal] = useState(false);
  const [newPasswordInput, setNewPasswordInput] = useState("");
  const [changePassSuccess, setChangePassSuccess] = useState(false);

  const [activeTab, setActiveTab] = useState("couple"); // couple | date | venue | media | timeline | rsvps
  const [slug, setSlug] = useState(initialSlug || "ayash-farwin");
  const [formData, setFormData] = useState(DEFAULT_INVITE);
  const [timeline, setTimeline] = useState([]);
  const [rsvps, setRsvps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Live preview layout & device states
  const [previewDevice, setPreviewDevice] = useState("mobile"); // "mobile" | "tablet"
  const [previewEnvelopeState, setPreviewEnvelopeState] = useState("invite"); // "invite" | "overlay"
  const [activeViewMode, setActiveViewMode] = useState("split"); // "split" | "editOnly" | "previewOnly"

  const scrollToPreviewSection = (sectionId) => {
    if (previewEnvelopeState === "overlay") {
      setPreviewEnvelopeState("invite");
    }
    setTimeout(() => {
      const container = document.querySelector(".wi-root.wi-in-preview");
      const target = document.getElementById(sectionId);
      if (container && target) {
        const containerRect = container.getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();
        const offset = targetRect.top - containerRect.top + container.scrollTop;
        container.scrollTo({
          top: offset - 8,
          behavior: "smooth",
        });
      } else if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 50);
  };

  const handleSelectTab = (tabName) => {
    setActiveTab(tabName);
    const map = {
      couple: "preview-couple",
      date: "preview-date",
      venue: "preview-venue",
      media: "preview-hero",
      timeline: "preview-timeline",
      rsvps: "preview-rsvp",
    };
    if (map[tabName]) {
      scrollToPreviewSection(map[tabName]);
    }
  };

  const handleLogin = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const input = passwordInput.trim();
    if (!input) {
      setAuthError("Please enter the admin password");
      return;
    }
    const customPass = localStorage.getItem(CUSTOM_PASS_KEY);
    const validPasswords = customPass
      ? [customPass, ...DEFAULT_PASSWORDS]
      : DEFAULT_PASSWORDS;

    if (validPasswords.includes(input)) {
      setIsAuthenticated(true);
      setAuthError("");
      if (rememberMe) {
        localStorage.setItem(AUTH_KEY, "true");
      } else {
        sessionStorage.setItem(AUTH_KEY, "true");
      }
    } else {
      setAuthError("Incorrect password. Please try again.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(AUTH_KEY);
    sessionStorage.removeItem(AUTH_KEY);
    setIsAuthenticated(false);
    setPasswordInput("");
    setAuthError("");
  };

  // Load invitation & RSVPs from Supabase
  useEffect(() => {
    if (!isAuthenticated) return;
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
              { time: "4:00 pm", title: "Guest Arrival and Welcome Drinks", illustration_url: "https://static.tildacdn.net/tild3965-3466-4265-b863-373664656661/ChatGPT_Image_Jul_24.png", img_side: "left", order_index: 0 },
              { time: "5:00 pm", title: "Bride Entrance", illustration_url: "https://static.tildacdn.net/tild6166-3066-4762-a161-623234663434/ChatGPT_Image_Jul_24.png", img_side: "right", order_index: 1 },
              { time: "5:30 pm", title: "Groom Arrival", illustration_url: "https://static.tildacdn.net/tild3539-6537-4937-a165-616566313532/ChatGPT_Image_Jul_24.png", img_side: "left", order_index: 2 },
              { time: "6:00 pm", title: "Nikkah Ceremony", illustration_url: "https://static.tildacdn.net/tild3335-3735-4630-b061-303735666263/ChatGPT_Image_Jul_24.png", img_side: "right", order_index: 3 },
              { time: "7:00 pm", title: "Let the celebration Begins..", illustration_url: "https://static.tildacdn.net/tild6430-6536-4230-b334-383333623035/ChatGPT_Image_Jul_24.png", img_side: "left", order_index: 4 },
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
  }, [slug, isAuthenticated]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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

      // Rich media assets are stored in the dedicated media_assets JSON column
      const mediaAssets = {
        venue_image_url: formData.venue_image_url || DEFAULT_INVITE.venue_image_url,
        envelope_image_url: formData.envelope_image_url || DEFAULT_INVITE.envelope_image_url,
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

      // Payload to submit
      let payload = {
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
        rsvp_deadline: formData.rsvp_deadline || "",
        audio_url: formData.audio_url || "",
        envelope_video_url: formData.envelope_video_url || "",
        hero_video_url: formData.hero_video_url || "",
        media_assets: mediaAssets,
      };

      let invData = null;
      let attempts = 0;

      while (attempts < 6) {
        attempts++;
        let res;
        if (formData.id) {
          res = await supabase
            .from("invitations")
            .update(payload)
            .eq("id", formData.id)
            .select()
            .single();
        } else {
          res = await supabase
            .from("invitations")
            .upsert(payload, { onConflict: "slug" })
            .select()
            .single();
        }

        if (!res.error) {
          invData = res.data;
          break;
        }

        // Auto-detect if Supabase complained about a column not existing in schema cache
        const colMatch = res.error.message?.match(/Could not find the '([^']+)' column/i);
        if (colMatch && colMatch[1] && payload[colMatch[1]] !== undefined) {
          console.warn(`Column '${colMatch[1]}' not in Supabase schema. Stripping from root payload.`);
          delete payload[colMatch[1]];
          continue; // Retry next attempt
        }

        throw res.error;
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

  if (!isAuthenticated) {
    return (
      <div className="ap-lock-root">
        <div className="ap-lock-card">
          <div className="ap-lock-badge">
            <span>🔒</span>
          </div>
          <div className="ap-lock-brand">Ayash & Farwin</div>
          <h1 className="ap-lock-title">Wedding Admin Portal</h1>
          <p className="ap-lock-desc">
            This administration page is protected. Please enter the passcode to access and customize the wedding invitation.
          </p>

          <form onSubmit={handleLogin} className="ap-lock-form">
            <div className="ap-lock-input-wrap">
              <input
                type={showPassword ? "text" : "password"}
                className={`ap-lock-input ${authError ? "ap-lock-input-error" : ""}`}
                placeholder="Enter admin passcode..."
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  if (authError) setAuthError("");
                }}
                autoFocus
              />
              <button
                type="button"
                className="ap-lock-eye-btn"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Hide passcode" : "Show passcode"}
                tabIndex={-1}
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>

            {authError && (
              <div className="ap-lock-error">
                <span>⚠️</span>
                <span>{authError}</span>
              </div>
            )}

            <label className="ap-lock-remember">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Keep me logged in on this browser</span>
            </label>

            <button type="submit" className="ap-lock-submit-btn">
              <span>Unlock Admin Panel</span>
              <span>→</span>
            </button>
          </form>

          <div className="ap-lock-footer">
            <button
              type="button"
              className="ap-lock-back-btn"
              onClick={() => onBackToInvite && onBackToInvite(slug)}
            >
              ← Return to Wedding Invitation
            </button>
          </div>
        </div>

        <style>{`
          .ap-lock-root {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: radial-gradient(circle at 50% 20%, #FAF5EE 0%, #EFE8DC 100%);
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            color: #3B2E1E;
            padding: 24px;
            box-sizing: border-box;
          }
          .ap-lock-card {
            max-width: 440px;
            width: 100%;
            background: #FFFFFF;
            border: 1px solid #E4D7C8;
            border-radius: 20px;
            padding: 44px 36px 36px;
            box-shadow: 0 20px 48px rgba(74, 53, 28, 0.1);
            text-align: center;
            box-sizing: border-box;
          }
          .ap-lock-badge {
            width: 64px;
            height: 64px;
            border-radius: 50%;
            background: #FAF6EF;
            border: 1.5px solid #D8C7B5;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 16px;
            font-size: 26px;
            box-shadow: 0 4px 12px rgba(138, 107, 52, 0.1);
          }
          .ap-lock-brand {
            font-size: 13px;
            letter-spacing: 2px;
            text-transform: uppercase;
            font-weight: 700;
            color: #8A6B34;
            margin-bottom: 6px;
          }
          .ap-lock-title {
            font-size: 24px;
            font-weight: 700;
            color: #4A351C;
            margin: 0 0 10px;
            letter-spacing: -0.3px;
          }
          .ap-lock-desc {
            font-size: 13.5px;
            line-height: 1.55;
            color: #7A654E;
            margin: 0 0 28px;
          }
          .ap-lock-form {
            display: flex;
            flex-direction: column;
            text-align: left;
          }
          .ap-lock-input-wrap {
            position: relative;
            display: flex;
            align-items: center;
          }
          .ap-lock-input {
            width: 100%;
            padding: 13px 44px 13px 16px;
            background: #FAF8F5;
            border: 1.5px solid #D8C7B5;
            border-radius: 10px;
            font-size: 14px;
            color: #4A351C;
            outline: none;
            transition: all 0.2s;
            box-sizing: border-box;
          }
          .ap-lock-input:focus {
            background: #FFFFFF;
            border-color: #8A6B34;
            box-shadow: 0 0 0 3.5px rgba(138, 107, 52, 0.14);
          }
          .ap-lock-input-error {
            border-color: #E74C3C !important;
            background: #FFF8F8 !important;
          }
          .ap-lock-eye-btn {
            position: absolute;
            right: 12px;
            background: none;
            border: none;
            cursor: pointer;
            font-size: 16px;
            opacity: 0.55;
            padding: 4px;
            transition: opacity 0.2s;
          }
          .ap-lock-eye-btn:hover {
            opacity: 1;
          }
          .ap-lock-error {
            margin-top: 10px;
            padding: 8px 12px;
            background: #FDF2F2;
            border: 1px solid #F6B8B8;
            border-radius: 8px;
            color: #A32727;
            font-size: 12.5px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 6px;
          }
          .ap-lock-remember {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 13px;
            color: #6E5330;
            margin: 16px 0 22px;
            cursor: pointer;
            user-select: none;
          }
          .ap-lock-remember input {
            accent-color: #8A6B34;
            cursor: pointer;
          }
          .ap-lock-submit-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            width: 100%;
            padding: 13px 20px;
            background: linear-gradient(135deg, #9C7A3E 0%, #80612A 100%);
            color: #FFFFFF;
            border: none;
            border-radius: 10px;
            font-size: 14px;
            font-weight: 700;
            cursor: pointer;
            box-shadow: 0 4px 14px rgba(138, 107, 52, 0.28);
            transition: all 0.2s;
          }
          .ap-lock-submit-btn:hover {
            background: linear-gradient(135deg, #8A6B34 0%, #705423 100%);
            transform: translateY(-1px);
            box-shadow: 0 6px 18px rgba(138, 107, 52, 0.35);
          }
          .ap-lock-footer {
            margin-top: 26px;
            padding-top: 20px;
            border-top: 1px solid #EFE4D6;
          }
          .ap-lock-back-btn {
            background: none;
            border: none;
            color: #8A6B34;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            padding: 0;
            transition: color 0.2s;
          }
          .ap-lock-back-btn:hover {
            color: #5C4325;
            text-decoration: underline;
          }
        `}</style>
      </div>
    );
  }

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
          {/* View Mode Switcher: Split View / Edit Only / Preview Only (Desktop) */}
          <div className="ap-view-switcher">
            <button
              type="button"
              className={`ap-view-btn ${activeViewMode === "split" ? "active" : ""}`}
              onClick={() => setActiveViewMode("split")}
              title="Side-by-side: Edit on Left, Live Preview on Right"
            >
              <span>◫</span>
              <span>Split View</span>
            </button>
            <button
              type="button"
              className={`ap-view-btn ${activeViewMode === "editOnly" ? "active" : ""}`}
              onClick={() => setActiveViewMode("editOnly")}
              title="Full Width Edit Form"
            >
              <span>✏️</span>
              <span>Edit Only</span>
            </button>
            <button
              type="button"
              className={`ap-view-btn ${activeViewMode === "previewOnly" ? "active" : ""}`}
              onClick={() => setActiveViewMode("previewOnly")}
              title="Full Preview Only"
            >
              <span>👁️</span>
              <span>Preview</span>
            </button>
          </div>

          {/* Mobile Preview Toggle (Switches view on mobile without changing activeTab or unsaved data) */}
          <button
            type="button"
            className="ap-mobile-preview-toggle"
            onClick={() => setActiveViewMode(activeViewMode === "previewOnly" ? "editOnly" : "previewOnly")}
            title={activeViewMode === "previewOnly" ? "Return to Editor Form" : "Open Live Preview"}
            aria-label={activeViewMode === "previewOnly" ? "Return to Editor Form" : "Open Live Preview"}
          >
            {activeViewMode === "previewOnly" ? (
              <>
                <span>✏️</span>
                <span>Editor</span>
              </>
            ) : (
              <>
                <span>👁️</span>
                <span>Preview</span>
              </>
            )}
          </button>

          <button
            type="button"
            className="ap-btn-ghost"
            onClick={() => onBackToInvite && onBackToInvite(formData.slug || slug)}
            title="Open live wedding invitation website"
          >
            <span>Live Site</span>
            <span>↗</span>
          </button>
          <button
            type="button"
            className="ap-btn-ghost"
            onClick={() => setShowChangePassModal(true)}
            title="Change the Admin Passcode"
          >
            <span>🔑</span>
            <span>Passcode</span>
          </button>
          <button
            type="button"
            className="ap-btn-ghost"
            onClick={handleLogout}
            title="Lock and Log out of Admin Panel"
          >
            <span>🚪</span>
            <span>Log Out</span>
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

      {/* Main Workspace: Split Screen Layout */}
      <div className={`ap-split-workspace ap-view-${activeViewMode}`}>
        {/* Left Side: Admin Editable Controls */}
        <div className="ap-split-editor">
          <div className="ap-layout">
        {/* Sidebar Navigation */}
        <aside className="ap-sidebar">
          <div className="ap-sidebar-menu">
            <button
              type="button"
              className={`ap-nav-item ${activeTab === "couple" ? "active" : ""}`}
              onClick={() => handleSelectTab("couple")}
            >
              <span className="ap-nav-icon">💍</span>
              <span className="ap-nav-text">Couple &amp; Ceremony</span>
            </button>

            <button
              type="button"
              className={`ap-nav-item ${activeTab === "date" ? "active" : ""}`}
              onClick={() => handleSelectTab("date")}
            >
              <span className="ap-nav-icon">📅</span>
              <span className="ap-nav-text">Date &amp; Countdown</span>
            </button>

            <button
              type="button"
              className={`ap-nav-item ${activeTab === "venue" ? "active" : ""}`}
              onClick={() => handleSelectTab("venue")}
            >
              <span className="ap-nav-icon">📍</span>
              <span className="ap-nav-text">Venue &amp; Location</span>
            </button>

            <button
              type="button"
              className={`ap-nav-item ${activeTab === "media" ? "active" : ""}`}
              onClick={() => handleSelectTab("media")}
            >
              <span className="ap-nav-icon">🎬</span>
              <span className="ap-nav-text">Media &amp; Images</span>
            </button>

            <button
              type="button"
              className={`ap-nav-item ${activeTab === "timeline" ? "active" : ""}`}
              onClick={() => handleSelectTab("timeline")}
            >
              <span className="ap-nav-icon">⏳</span>
              <span className="ap-nav-text">Timeline ({timeline.length})</span>
            </button>

            <button
              type="button"
              className={`ap-nav-item ${activeTab === "rsvps" ? "active" : ""}`}
              onClick={() => handleSelectTab("rsvps")}
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

              {/* TAB 6: LIVE RSVPS */}
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
                      <div className="ap-stat-val">{acceptedCount}</div>
                      <div className="ap-stat-lbl">Attending</div>
                    </div>
                    <div className="ap-stat-card">
                      <div className="ap-stat-val">{totalGuests}</div>
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

              {/* Card Footer Save Action */}
              <div className="ap-card-footer">
                <button type="submit" className="ap-btn-primary" disabled={saving}>
                  {saving ? (
                    <>
                      <span className="ap-spinner" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <span>💾</span>
                      <span>Save All Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </main>
          </div>
        </div>

        {/* Right Side: Synchronized Live Preview */}
        <div className="ap-split-preview">
          <div className="ap-preview-panel">
            <div className="ap-preview-header">
              <div className="ap-preview-title-box">
                <button
                  type="button"
                  className="ap-preview-back-btn"
                  onClick={() => setActiveViewMode("editOnly")}
                  title="Close Live Preview and return to Editor Form"
                >
                  <span>←</span>
                  <span>Back to Editor</span>
                </button>
                <span className="ap-live-badge">
                  <span className="ap-pulse-dot" />
                  LIVE PREVIEW
                </span>
                <span className="ap-preview-hint">Updates automatically as you type</span>
              </div>

              <div className="ap-preview-tools">
                {/* Envelope vs Card View */}
                <div className="ap-seg-control">
                  <button
                    type="button"
                    className={`ap-seg-btn ${previewEnvelopeState === "invite" ? "active" : ""}`}
                    onClick={() => setPreviewEnvelopeState("invite")}
                    title="View Full Wedding Invitation Card"
                  >
                    💌 Full Card
                  </button>
                  <button
                    type="button"
                    className={`ap-seg-btn ${previewEnvelopeState === "overlay" ? "active" : ""}`}
                    onClick={() => setPreviewEnvelopeState("overlay")}
                    title="View Envelope Video Cover"
                  >
                    ✉️ Envelope
                  </button>
                </div>

                {/* Device Frame */}
                <div className="ap-seg-control">
                  <button
                    type="button"
                    className={`ap-seg-btn ${previewDevice === "mobile" ? "active" : ""}`}
                    onClick={() => setPreviewDevice("mobile")}
                    title="Mobile View (390px)"
                  >
                    📱 Mobile
                  </button>
                  <button
                    type="button"
                    className={`ap-seg-btn ${previewDevice === "tablet" ? "active" : ""}`}
                    onClick={() => setPreviewDevice("tablet")}
                    title="Expanded View"
                  >
                    💻 Full
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Section Jump Navigator */}
            <div className="ap-preview-quick-nav">
              <span className="ap-quick-title">Jump:</span>
              <button type="button" className="ap-quick-btn" onClick={() => scrollToPreviewSection("preview-hero")}>🔝 Top</button>
              <button type="button" className="ap-quick-btn" onClick={() => scrollToPreviewSection("preview-date")}>📅 Date</button>
              <button type="button" className="ap-quick-btn" onClick={() => scrollToPreviewSection("preview-couple")}>💍 Couple</button>
              <button type="button" className="ap-quick-btn" onClick={() => scrollToPreviewSection("preview-timeline")}>⏳ Timeline</button>
              <button type="button" className="ap-quick-btn" onClick={() => scrollToPreviewSection("preview-venue")}>📍 Venue</button>
              <button type="button" className="ap-quick-btn" onClick={() => scrollToPreviewSection("preview-rsvp")}>✉️ RSVP</button>
            </div>

            <div className="ap-preview-viewport">
              <div className={`ap-device-shell ap-shell-${previewDevice}`}>
                <WeddingInvite
                  previewData={formData}
                  previewTimeline={timeline}
                  isLivePreview={true}
                  previewEnvelopeState={previewEnvelopeState}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showChangePassModal && (
        <div className="ap-modal-backdrop" onClick={() => setShowChangePassModal(false)}>
          <div className="ap-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="ap-modal-header">
              <h3 style={{ margin: 0, fontSize: "17px", color: "#4A351C" }}>🔑 Change Admin Passcode</h3>
              <button
                type="button"
                className="ap-modal-close"
                onClick={() => setShowChangePassModal(false)}
              >
                &times;
              </button>
            </div>
            <div className="ap-modal-body">
              <p style={{ fontSize: "13px", color: "#7A654E", margin: "0 0 16px", lineHeight: "1.5" }}>
                Set a custom password to protect your admin dashboard. Anyone visiting <code>/admin</code> will need to enter this passcode.
              </p>
              <div className="ap-field-group">
                <label className="ap-label">New Admin Passcode</label>
                <input
                  type="text"
                  className="ap-input"
                  placeholder="e.g. MyWedding2026"
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  autoFocus
                />
              </div>
              {changePassSuccess && (
                <div style={{ color: "#1A6C35", background: "#EAF8EF", border: "1px solid #A8E4BA", padding: "8px 12px", borderRadius: "8px", fontSize: "13px", margin: "14px 0", fontWeight: "600" }}>
                  ✓ Passcode updated successfully!
                </div>
              )}
              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "22px" }}>
                <button
                  type="button"
                  className="ap-btn-ghost"
                  onClick={() => setShowChangePassModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="ap-btn-primary"
                  onClick={() => {
                    if (newPasswordInput.trim()) {
                      localStorage.setItem(CUSTOM_PASS_KEY, newPasswordInput.trim());
                      setChangePassSuccess(true);
                      setTimeout(() => {
                        setChangePassSuccess(false);
                        setShowChangePassModal(false);
                        setNewPasswordInput("");
                      }, 1200);
                    }
                  }}
                >
                  Save Passcode
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        /* Modal Styles */
        .ap-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(40, 28, 14, 0.45);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          padding: 20px;
        }
        .ap-modal-card {
          background: #FFFFFF;
          border-radius: 16px;
          box-shadow: 0 20px 48px rgba(40, 28, 14, 0.2);
          max-width: 460px;
          width: 100%;
          border: 1px solid #E2D4C3;
          overflow: hidden;
        }
        .ap-modal-header {
          padding: 18px 24px;
          border-bottom: 1px solid #EFE4D6;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .ap-modal-close {
          background: none;
          border: none;
          font-size: 24px;
          color: #8C755E;
          cursor: pointer;
          line-height: 1;
        }
        .ap-modal-close:hover {
          color: #4A351C;
        }
        .ap-modal-body {
          padding: 24px;
        }

        /* ============================================================
           SPLIT SCREEN WORKSPACE LAYOUT & LIVE PREVIEW
           ============================================================ */
        .ap-split-workspace {
          display: flex;
          width: 100%;
          min-height: calc(100vh - 69px);
          align-items: stretch;
          background: #F8F5F0;
        }

        .ap-split-editor {
          flex: 1 1 54%;
          min-width: 0;
          border-right: 1px solid #E5D7C7;
          overflow-y: auto;
          max-height: calc(100vh - 69px);
          background: #F8F5F0;
        }

        .ap-split-editor .ap-layout {
          max-width: 100%;
          margin: 0;
          padding: 20px 20px 60px;
          gap: 18px;
        }

        .ap-split-editor .ap-sidebar {
          width: 210px;
          top: 20px;
        }

        .ap-split-preview {
          flex: 1 1 46%;
          min-width: 360px;
          background: #181410;
          position: sticky;
          top: 69px;
          height: calc(100vh - 69px);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        /* View Mode Overrides */
        .ap-split-workspace.ap-view-editOnly .ap-split-editor {
          flex: 1 1 100%;
          border-right: none;
          max-height: none;
        }
        .ap-split-workspace.ap-view-editOnly .ap-split-editor .ap-layout {
          max-width: 1240px;
          margin: 0 auto;
          padding: 28px 24px 60px;
          gap: 28px;
        }
        .ap-split-workspace.ap-view-editOnly .ap-split-editor .ap-sidebar {
          width: 250px;
          top: 86px;
        }
        .ap-split-workspace.ap-view-editOnly .ap-split-preview {
          display: none;
        }

        .ap-split-workspace.ap-view-previewOnly .ap-split-editor {
          display: none;
        }
        .ap-split-workspace.ap-view-previewOnly .ap-split-preview {
          flex: 1 1 100%;
        }

        /* View Switcher in Navbar */
        .ap-view-switcher {
          display: flex;
          align-items: center;
          background: #FAF5EE;
          border: 1px solid #E2D4C3;
          border-radius: 8px;
          padding: 3px;
          gap: 2px;
        }

        .ap-view-btn {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 6px 11px;
          background: transparent;
          border: none;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          color: #7A654E;
          cursor: pointer;
          transition: all 0.15s ease;
          font-family: inherit;
        }

        .ap-view-btn:hover {
          color: #4A351C;
        }

        .ap-view-btn.active {
          background: #8A6B34;
          color: #FFFFFF;
          box-shadow: 0 2px 6px rgba(138, 107, 52, 0.25);
        }

        /* Mobile-only Preview Toggle in Navbar (hidden on desktop) */
        .ap-mobile-preview-toggle {
          display: none;
        }

        /* Preview Back Button (shown in previewOnly mode and on mobile) */
        .ap-preview-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 11px;
          font-size: 12px;
          font-weight: 600;
          color: #FAF4EB;
          background: #3A2B1C;
          border: 1px solid #755530;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.15s ease;
          font-family: inherit;
        }

        .ap-preview-back-btn:hover {
          background: #4E3B27;
          border-color: #9E7444;
        }

        /* Hide Back to Editor on desktop split view since the editor is already side-by-side */
        .ap-split-workspace.ap-view-split .ap-preview-back-btn {
          display: none;
        }

        /* Live Preview Panel UI */
        .ap-preview-panel {
          display: flex;
          flex-direction: column;
          height: 100%;
          width: 100%;
        }

        .ap-preview-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 18px;
          background: #231E19;
          border-bottom: 1px solid #383027;
          gap: 12px;
          flex-wrap: wrap;
        }

        .ap-preview-title-box {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .ap-live-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.8px;
          color: #E6C88A;
          background: rgba(230, 200, 138, 0.1);
          border: 1px solid rgba(230, 200, 138, 0.25);
          padding: 4px 8px;
          border-radius: 4px;
        }

        .ap-pulse-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #2ECC71;
          box-shadow: 0 0 8px #2ECC71;
          animation: apPulse 1.8s infinite;
        }

        @keyframes apPulse {
          0% { transform: scale(0.9); opacity: 0.8; }
          50% { transform: scale(1.25); opacity: 1; box-shadow: 0 0 12px #2ECC71; }
          100% { transform: scale(0.9); opacity: 0.8; }
        }

        .ap-preview-hint {
          font-size: 11.5px;
          color: #8C7B6B;
        }

        .ap-preview-tools {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .ap-seg-control {
          display: flex;
          background: #15110E;
          border: 1px solid #332B22;
          border-radius: 7px;
          padding: 2px;
          gap: 2px;
        }

        .ap-seg-btn {
          background: transparent;
          border: none;
          color: #A89582;
          font-size: 11.5px;
          font-weight: 600;
          padding: 5px 9px;
          border-radius: 5px;
          cursor: pointer;
          transition: all 0.15s ease;
          font-family: inherit;
        }

        .ap-seg-btn:hover {
          color: #EDE1D1;
        }

        .ap-seg-btn.active {
          background: #8A6B34;
          color: #FFFFFF;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);
        }

        .ap-preview-quick-nav {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 7px 16px;
          background: #1C1713;
          border-bottom: 1px solid #332B22;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .ap-preview-quick-nav::-webkit-scrollbar {
          display: none;
        }

        .ap-quick-title {
          font-size: 10.5px;
          color: #8C7B6B;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          font-weight: 700;
          margin-right: 4px;
          white-space: nowrap;
        }

        .ap-quick-btn {
          background: #28211A;
          border: 1px solid #42362A;
          color: #D6C7B7;
          font-size: 11px;
          font-weight: 600;
          padding: 4px 9px;
          border-radius: 5px;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.15s ease;
          font-family: inherit;
        }

        .ap-quick-btn:hover {
          background: #8A6B34;
          color: #FFFFFF;
          border-color: #8A6B34;
          transform: translateY(-1px);
        }

        .ap-preview-viewport {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          background: radial-gradient(circle at 50% 30%, #25201A 0%, #120F0C 100%);
          overflow: hidden;
          box-sizing: border-box;
        }

        .ap-device-shell {
          width: 100%;
          height: 100%;
          overflow: hidden;
          background: #F9F0E0;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          flex-direction: column;
        }

        .ap-device-shell.ap-shell-mobile {
          width: 390px;
          max-height: 820px;
          border-radius: 36px;
          border: 10px solid #2B251E;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.7), 0 0 0 2px rgba(173, 138, 78, 0.3);
        }

        .ap-device-shell.ap-shell-tablet {
          width: 100%;
          max-width: 520px;
          height: 100%;
          border-radius: 18px;
          border: 3px solid #3B332A;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
        }

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

        .ap-card-footer {
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid #EAE0D3;
          display: flex;
          justify-content: flex-end;
        }

        .ap-loading, .ap-empty {
          text-align: center;
          padding: 40px;
          color: #8A7763;
        }

        @media (max-width: 1080px) and (min-width: 861px) {
          .ap-split-workspace {
            flex-direction: column;
          }
          .ap-split-editor {
            max-height: none;
            overflow-y: visible;
          }
          .ap-split-preview {
            position: static;
            height: 720px;
            max-height: 85vh;
          }
        }

        /* Mobile Screens (<= 860px, including 390px phone viewports) */
        @media (max-width: 860px) {
          html, body {
            overflow-x: hidden;
            max-width: 100vw;
          }

          .ap-admin-container {
            overflow-x: hidden;
            max-width: 100vw;
            box-sizing: border-box;
          }

          /* Compact Mobile Navbar */
          .ap-navbar {
            padding: 10px 12px;
            flex-direction: column;
            align-items: stretch;
            gap: 8px;
            width: 100%;
            box-sizing: border-box;
          }

          .ap-navbar-left {
            width: 100%;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 8px;
          }

          .ap-brand {
            gap: 6px;
            flex-shrink: 0;
          }

          .ap-brand-title {
            font-size: 13px;
          }

          .ap-slug-pill {
            padding: 3px 8px;
            font-size: 11px;
            max-width: 170px;
            flex: 1 1 auto;
            min-width: 0;
          }

          .ap-slug-field {
            width: 100%;
            min-width: 50px;
            font-size: 11px;
          }

          .ap-navbar-actions {
            width: 100%;
            display: flex;
            align-items: center;
            flex-wrap: wrap;
            gap: 6px;
          }

          /* Hide desktop 3-mode switcher on mobile */
          .ap-view-switcher {
            display: none !important;
          }

          /* Show mobile preview toggle button */
          .ap-mobile-preview-toggle {
            display: inline-flex !important;
            align-items: center;
            gap: 5px;
            padding: 6px 12px;
            font-size: 12px;
            font-weight: 700;
            white-space: nowrap;
            border-radius: 8px;
            background: #8A6B34;
            color: #FFFFFF;
            border: 1px solid #755525;
            cursor: pointer;
            box-shadow: 0 2px 6px rgba(138, 107, 52, 0.25);
          }

          .ap-btn-ghost {
            padding: 6px 10px;
            font-size: 12px;
            white-space: nowrap;
          }

          .ap-btn-primary {
            padding: 6px 12px;
            font-size: 12px;
            white-space: nowrap;
          }

          /* Mobile Workspace: Editor is default surface, Live Preview is toggled */
          .ap-split-workspace {
            flex-direction: column;
            width: 100%;
            max-width: 100vw;
            overflow-x: hidden;
            min-height: auto;
          }

          /* When NOT in previewOnly mode on mobile: hide preview and show editor full width */
          .ap-split-workspace:not(.ap-view-previewOnly) .ap-split-preview {
            display: none !important;
          }
          .ap-split-workspace:not(.ap-view-previewOnly) .ap-split-editor {
            display: block !important;
            width: 100% !important;
            flex: 1 1 100% !important;
            max-height: none !important;
            overflow-y: visible !important;
            border-right: none !important;
          }

          /* When in previewOnly mode on mobile: hide editor and show preview full width */
          .ap-split-workspace.ap-view-previewOnly .ap-split-editor {
            display: none !important;
          }
          .ap-split-workspace.ap-view-previewOnly .ap-split-preview {
            display: flex !important;
            width: 100% !important;
            flex: 1 1 100% !important;
            min-width: 0 !important;
            height: auto !important;
            min-height: calc(100vh - 60px) !important;
            position: static !important;
          }

          /* Responsive Editor Navigation: Horizontally Scrolling Tab Rail */
          .ap-layout {
            flex-direction: column;
            padding: 8px 10px 40px;
            gap: 10px;
            width: 100%;
            box-sizing: border-box;
            overflow-x: hidden;
          }

          .ap-split-editor .ap-layout {
            padding: 8px 10px 40px !important;
            gap: 10px !important;
            max-width: 100% !important;
          }

          .ap-sidebar,
          .ap-split-editor .ap-sidebar {
            width: 100% !important;
            position: sticky !important;
            top: 0 !important;
            z-index: 80 !important;
            margin: 0 !important;
            padding: 4px 0 6px !important;
            background: #F8F5F0 !important;
          }

          .ap-sidebar-menu {
            display: flex !important;
            flex-direction: row !important;
            overflow-x: auto !important;
            overflow-y: hidden !important;
            white-space: nowrap !important;
            gap: 6px !important;
            padding: 6px 8px !important;
            border-radius: 10px !important;
            background: #FFFFFF !important;
            box-shadow: 0 1px 4px rgba(0,0,0,0.04) !important;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: thin;
            max-width: 100%;
            box-sizing: border-box;
          }

          .ap-sidebar-menu::-webkit-scrollbar {
            height: 3px;
          }
          .ap-sidebar-menu::-webkit-scrollbar-thumb {
            background: #D4C3AE;
            border-radius: 3px;
          }

          .ap-nav-item {
            flex-shrink: 0 !important;
            width: auto !important;
            white-space: nowrap !important;
            padding: 8px 12px !important;
            font-size: 12.5px !important;
            gap: 6px !important;
            border-radius: 7px !important;
          }

          .ap-nav-icon {
            font-size: 14px;
          }

          .ap-nav-text {
            flex: none !important;
          }

          /* Editor Section Content - Full Width with Zero Horizontal Overflow */
          .ap-content {
            width: 100% !important;
            max-width: 100% !important;
            min-width: 0 !important;
            box-sizing: border-box;
            overflow-x: hidden;
          }

          .ap-section-card {
            padding: 16px 12px !important;
            border-radius: 10px !important;
            margin-bottom: 14px !important;
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
            overflow-x: hidden;
          }

          .ap-section-header {
            flex-direction: column;
            align-items: stretch;
            gap: 10px;
            margin-bottom: 14px;
          }

          .ap-section-header > div {
            width: 100%;
          }

          .ap-section-header h2 {
            font-size: 17px !important;
            margin-bottom: 4px;
          }

          .ap-desc {
            font-size: 12px !important;
            margin-bottom: 8px !important;
          }

          .ap-section-header .ap-btn-secondary {
            width: 100%;
            text-align: center;
            justify-content: center;
            padding: 8px;
            box-sizing: border-box;
          }

          /* Responsive Form Grids: 1 column on phone viewports */
          .ap-grid-2,
          .ap-grid-3,
          .ap-stats-row {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
            width: 100% !important;
            box-sizing: border-box;
          }

          .ap-grid-2 > *,
          .ap-grid-3 > *,
          .ap-field {
            grid-column: auto !important;
            width: 100% !important;
            max-width: 100% !important;
            min-width: 0 !important;
            box-sizing: border-box !important;
          }

          .ap-field input,
          .ap-field select,
          .ap-field textarea {
            width: 100% !important;
            max-width: 100% !important;
            min-width: 0 !important;
            box-sizing: border-box !important;
            font-size: 14px !important;
          }

          /* Timeline item cards */
          .ap-timeline-item-card {
            padding: 12px 10px !important;
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
            overflow-x: hidden;
          }

          .ap-tl-header {
            margin-bottom: 10px;
          }

          /* Mobile Live Preview Controls */
          .ap-preview-panel {
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
          }

          .ap-preview-header {
            padding: 8px 10px !important;
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 8px !important;
          }

          .ap-preview-title-box {
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: 100%;
            flex-wrap: wrap;
            gap: 6px;
          }

          .ap-preview-tools {
            display: flex;
            justify-content: space-between;
            width: 100%;
            gap: 6px;
          }

          .ap-preview-quick-nav {
            padding: 6px 8px !important;
            gap: 4px !important;
            overflow-x: auto !important;
            -webkit-overflow-scrolling: touch;
            width: 100% !important;
            box-sizing: border-box !important;
          }

          .ap-quick-btn {
            padding: 3px 6px !important;
            font-size: 11px !important;
            flex-shrink: 0;
          }

          .ap-preview-viewport {
            padding: 8px 4px !important;
          }

          .ap-device-shell.ap-shell-mobile,
          .ap-device-shell.ap-shell-tablet {
            width: 100% !important;
            max-width: 100% !important;
            border-radius: 10px !important;
            margin: 0 auto;
          }

          .ap-preview-back-btn {
            display: inline-flex !important;
          }
        }
      `}</style>
    </div>
  );
}
