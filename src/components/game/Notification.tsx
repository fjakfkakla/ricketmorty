"use client";

import { useEffect, useState } from "react";

export interface NotifData {
  id: string;
  message: string;
  emoji: string;
  color: string;
  type: "info" | "warning" | "pickup" | "angry";
}

interface NotificationProps {
  notif: NotifData | null;
}

export default function Notification({ notif }: NotificationProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (notif) {
      setVisible(true);
      const t = setTimeout(() => setVisible(false), 2800);
      return () => clearTimeout(t);
    }
  }, [notif]);

  if (!notif || !visible) return null;

  return (
    <div
      className="absolute top-20 left-1/2 z-50 notif-slide"
      style={{ transform: "translateX(-50%)", pointerEvents: "none" }}
    >
      <div
        className="flex items-center gap-3 px-5 py-3 rounded-xl text-sm font-bold"
        style={{
          background: `rgba(0,0,0,0.92)`,
          border: `2px solid ${notif.color}`,
          boxShadow: `0 0 20px ${notif.color}`,
          color: notif.color,
          fontFamily: "monospace",
          maxWidth: "400px",
        }}
      >
        <span className="text-xl">{notif.emoji}</span>
        <span>{notif.message}</span>
      </div>
    </div>
  );
}
