"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import ReactMarkdown from "react-markdown";


export interface Notification {
  id: number;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

const NotificationBell = () => {
  const { user } = useUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    fetch(`/api/notifications/${user.id}`)
      .then(res => {
        if (!res.ok) throw new Error("Erro ao buscar notificações");
        return res.json();
      })
      .then((data: Notification[]) => {
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.read).length);
      })
      .catch(console.error);
  }, [user?.id]);

  const openDropdown = async () => {
    setOpen(!open);

    if (!open && unreadCount > 0) {
      setUnreadCount(0);

      await fetch(`/api/notifications/${user?.id}`, {
        method: "POST",
      });

      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      );
    }
  };

  return (
    <div className="relative">
      <button
        onClick={openDropdown}
        className="relative p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white border shadow-lg rounded-lg z-50">
          {notifications.length === 0 ? (
            <p className="p-4 text-center text-gray-500">
              Sem notificações
            </p>
          ) : (
            notifications.map(n => (
              <div
                key={n.id}
                className={`p-3 border-b hover:bg-gray-50 ${
                  n.read ? "bg-gray-100" : "bg-white"
                }`}
              >
                <p className="font-semibold text-gray-800">{n.title}</p>
                <ReactMarkdown
  components={{
    strong: ({ children }) => (
      <strong className="font-semibold text-gray-900">
        {children}
      </strong>
    ),
  }}
 
>
  {n.message}
</ReactMarkdown>


                <p className="text-xs text-gray-400">
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
