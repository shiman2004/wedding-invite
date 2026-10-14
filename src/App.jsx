import React, { useState, useEffect } from "react";
import WeddingInvite from "./WeddingInvite.jsx";
import AdminPanel from "./AdminPanel.jsx";

// Admin panel is reachable only via the /admin URL path.
const isAdminPath = () => window.location.pathname.replace(/\/+$/, "") === "/admin";

export default function App() {
  const [view, setView] = useState("invite"); // "invite" | "admin"
  const [currentSlug, setCurrentSlug] = useState("ayash-farwin");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (isAdminPath()) {
      setView("admin");
    }
    if (params.get("invite")) {
      setCurrentSlug(params.get("invite"));
    }

    const handlePopState = () => {
      const p = new URLSearchParams(window.location.search);
      setView(isAdminPath() ? "admin" : "invite");
      setCurrentSlug(p.get("invite") || "ayash-farwin");
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleBackToInvite = (slug) => {
    const url = slug ? `/?invite=${encodeURIComponent(slug)}` : "/";
    window.history.pushState({}, "", url);
    setCurrentSlug(slug || "ayash-farwin");
    setView("invite");
  };

  return view === "admin" ? (
    <AdminPanel onBackToInvite={handleBackToInvite} />
  ) : (
    <WeddingInvite />
  );
}
