"use client";
import { Bell, RefreshCw } from "lucide-react";

interface TopBarProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export default function TopBar({ title, subtitle, action }: TopBarProps) {
  const today = new Date().toLocaleDateString("en-KE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const user =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("kefs_user") || "{}")
      : {};

  const initials = user?.full_name
    ? user.full_name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "KF";

  return (
    <header className="topbar">
      <div className="topbar-left">
        <h2>{title}</h2>
        {subtitle && <p>{subtitle || today}</p>}
      </div>
      <div className="topbar-right">
        {action && action}
        <button className="topbar-btn" title="Refresh">
          <RefreshCw size={16} />
        </button>
        <button className="topbar-btn" title="Notifications">
          <Bell size={16} />
        </button>
        <div className="topbar-avatar" title={user?.full_name}>
          {initials}
        </div>
      </div>
    </header>
  );
}