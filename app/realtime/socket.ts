// app/socket/socketHelper.ts
import { Server as HttpServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";

let io: SocketIOServer | null = null;

/**
 * Inicializa o Socket.IO server (apenas uma vez)
 */
export function initSocket(server: HttpServer) {
  if (io) return io;

  io = new SocketIOServer(server, {
    cors: {
      origin: "*", // ajuste para seu frontend
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket: Socket) => {
    console.log("🔌 Novo cliente conectado:", socket.id);

    // Podemos associar userId ao socket aqui, se quiser
    socket.on("register", (userId: string) => {
      socket.join(userId); // Cria uma sala privada por usuário
      console.log(`🟢 User ${userId} registrado no socket`);
    });

    socket.on("disconnect", () => {
      console.log("❌ Cliente desconectado:", socket.id);
    });
  });

  return io;
}

/**
 * Emite uma notificação para um usuário específico
 */
export function sendNotification(userId: string, title: string, message: string) {
  if (!io) {
    console.warn("⚠️ Socket.IO não inicializado");
    return;
  }

  io.to(userId).emit("notification", { title, message, date: new Date() });
}
