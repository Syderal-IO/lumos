"use client";

import { useState, useRef, useEffect } from "react";
import { BoltIcon } from "@/components/ui/pixel-icons";
import { useTranslation } from "@/lib/i18n";

/**
 * #11 Notification Center — Bell icon with dropdown and unread badge.
 */
export default function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);

  const MOCK_NOTIFICATIONS = [
    { id: 1, icon: "🏠", text: t("notif.buyer_near"), time: "2m", unread: true },
    { id: 2, icon: "📈", text: t("notif.price_up"), time: "1h", unread: true },
    { id: 3, icon: "🏆", text: t("notif.badge_unlocked"), time: "3h", unread: false },
    { id: 4, icon: "🔥", text: t("notif.streak"), time: "1d", unread: false },
  ];

  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const unreadCount = notifications.filter((n) => n.unread).length;

  // Update notifications when language changes
  useEffect(() => {
    setNotifications([
      { id: 1, icon: "🏠", text: t("notif.buyer_near"), time: "2m", unread: notifications[0]?.unread ?? true },
      { id: 2, icon: "📈", text: t("notif.price_up"), time: "1h", unread: notifications[1]?.unread ?? true },
      { id: 3, icon: "🏆", text: t("notif.badge_unlocked"), time: "3h", unread: notifications[2]?.unread ?? false },
      { id: 4, icon: "🔥", text: t("notif.streak"), time: "1d", unread: notifications[3]?.unread ?? false },
    ]);
  }, [t]); // eslint-disable-line react-hooks/exhaustive-deps

  // Mark all as read when opened
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 cursor-pointer transition-all hover:opacity-80"
        style={{
          color: "var(--foreground-secondary)",
          backgroundColor: "rgba(249, 115, 22, 0.1)",
          border: "1px solid rgba(249, 115, 22, 0.2)",
        }}
        aria-label="Notifications"
      >
        <span className="text-base">🔔</span>
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center font-pixel text-[8px] font-bold"
            style={{
              backgroundColor: "var(--color-solar-orange)",
              color: "white",
              animation: "pulse-orange 2s infinite",
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1 w-64 pixel-card overflow-hidden z-50"
          style={{
            backgroundColor: "var(--card-bg)",
            border: "2px solid var(--card-border)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
          }}
        >
          <div className="px-3 py-2 flex items-center justify-between" style={{ borderBottom: "2px solid var(--card-border)" }}>
            <span className="font-pixel text-[8px] font-bold" style={{ color: "var(--foreground)" }}>
              {t("notif.title")}
            </span>
            <BoltIcon size={12} color="var(--color-solar-orange)" />
          </div>

          <div className="max-h-64 overflow-y-auto">
            {notifications.map((n) => (
              <div
                key={n.id}
                className="px-3 py-2 flex items-start gap-2 transition-colors"
                style={{
                  borderBottom: "1px solid var(--card-border)",
                  backgroundColor: n.unread ? "rgba(249, 115, 22, 0.05)" : "transparent",
                }}
              >
                <span className="text-sm shrink-0">{n.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-pixel text-[7px] leading-relaxed" style={{ color: "var(--foreground)" }}>
                    {n.text}
                  </p>
                  <span className="font-pixel text-[6px]" style={{ color: "var(--foreground-secondary)" }}>
                    {n.time}
                  </span>
                </div>
                {n.unread && (
                  <div className="w-1.5 h-1.5 shrink-0 mt-1" style={{ backgroundColor: "var(--color-solar-orange)" }} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
