"use client";

import { useNotifications } from "@/hooks/useNotifications";
import { useAuth } from "@clerk/nextjs";

export default function NotificationBadge() {
  const { userId } = useAuth();
  const { notifications } = useNotifications(userId || "");

  return (
    <div className="relative inline-block">
      <button className="p-2 bg-gray-200 rounded-full">
        🔔
      </button>

      {notifications.length > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full px-2 text-xs">
          {notifications.length}
        </span>
      )}

      {/* Dropdown simples */}
      {notifications.length > 0 && (
        <div className="absolute right-0 mt-2 w-64 bg-white border shadow-lg rounded">
          {notifications.map((n, i) => (
            <div key={i} className="p-2 border-b last:border-b-0">
              <p className="font-bold">{n.title}</p>
              <p className="text-sm">{n.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
