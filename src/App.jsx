import React, { useState, useEffect } from "react";
import WeddingInvite from "./WeddingInvite.jsx";
import AdminPanel from "./AdminPanel.jsx";

export default function App() {
  const [view, setView] = useState("invite"); // "invite" | "admin"
  const [currentSlug, setCurrentSlug] = useState("ayash-farwin");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("admin") === "1" || params.get("admin") === "true" || window.location.pathname.startsWith("/admin")) {
      setView("admin");
    }
    if (params.get("invite")) {
      setCurrentSlug(params.get("invite"));
    }
  }, []);

  const handleOpenAdmin = () => {
    const url = new URL(window.location.href);
    url.searchParams.set("admin", "1");
    window.history.pushState({}, "", url);
    setView("admin");
  };

  const handleBackToInvite = (slug) => {
    const url = new URL(window.location.href);
    url.searchParams.delete("admin");
    if (slug) url.searchParams.set("invite", slug);
    window.history.pushState({}, "", url);
    setCurrentSlug(slug || "ayash-farwin");
    setView("invite");
  };

  return (
    <>
      {view === "admin" ? (
        <AdminPanel onBackToInvite={handleBackToInvite} />
      ) : (
        <>
          <WeddingInvite />

          {/* Discreet Floating Admin Access Button */}
          <button
            onClick={handleOpenAdmin}
            title="Open Admin Panel"
            style={{
              position: "fixed",
              bottom: "22px",
              left: "22px",
              background: "rgba(255, 255, 255, 0.85)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(138, 107, 52, 0.3)",
              borderRadius: "30px",
              padding: "8px 14px",
              fontSize: "12px",
              fontWeight: "600",
              color: "#6E4E24",
              boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
              cursor: "pointer",
              zIndex: 999999,
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "all 0.2s ease",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "scale(1.05)";
              e.currentTarget.style.background = "#FFFFFF";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.85)";
            }}
          >
            <span>⚙️</span>
            <span>Admin</span>
          </button>
        </>
      )}
    </>
  );
}
