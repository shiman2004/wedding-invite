import React, { useState, useEffect } from "react";
import WeddingInvite from "./WeddingInvite.jsx";
import AdminPanel from "./AdminPanel.jsx";

// Admin panel is reachable only via the /admin URL path.
const isAdminPath = () => window.location.pathname.replace(/\/+$/, "") === "/admin";

export default function App() {
  const [view, setView] = useState(() => (isAdminPath() ? "admin" : "invite"));
  const [currentSlug, setCurrentSlug] = useState(() => {
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search);
      return p.get("invite") || "ayash-farwin";
    }
    return "ayash-farwin";
  });

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
    const target = slug || currentSlug || "ayash-farwin";
    const url = target ? `/?invite=${encodeURIComponent(target)}` : "/";
    window.history.pushState({}, "", url);
    setCurrentSlug(target);
    setView("invite");
  };

  const handleOpenAdmin = () => {
    window.history.pushState({}, "", "/admin");
    setView("admin");
  };

  return view === "admin" ? (
    <AdminPanel onBackToInvite={handleBackToInvite} initialSlug={currentSlug} />
  ) : (
    <WeddingInvite slug={currentSlug} onOpenAdmin={handleOpenAdmin} />
  );
}
