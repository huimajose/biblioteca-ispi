/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

export function useNotifications(userId: string) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (!userId) return;

    const newSocket = io("http://localhost:3000", { query: { userId } });
    setSocket(newSocket);

    newSocket.on("notification", (notif) => {
      setNotifications((prev) => [notif, ...prev]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [userId]);

  return { socket, notifications };
}
