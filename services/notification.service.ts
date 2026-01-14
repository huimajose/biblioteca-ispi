
// app/notifications/notificationsService.ts
import { createNotification } from "./actions"; // sua função DB
import { getAllAdmins } from "@/db/crud/users.crud";
import { sendNotification } from "@/app/realtime/socket";
import { fetchBookById } from "@/db/crud/books.crud";

/**
 * Notifica todos os admins sobre um novo pedido de livro
 */
export async function notifyNewTransaction(transactionId: number, userId: string) {
  const admins = await getAllAdmins();

  for (const admin of admins) {
    const title = "📚 Novo pedido de livro";
    const message = `O usuário ${userId} requisitou um livro.`;

    // Salvar no banco
    await createNotification(admin.clerkId, title, message);

    // Emitir para badge em tempo real
    sendNotification(admin.clerkId, title, message);
  }
}

/**
 * Notifica o usuário que o livro foi aceito
 */
export async function notifyBookAccepted(transactionId: number, adminId: string, userId: string, bookId: number) {
  const bookIdd = await fetchBookById(bookId);


const bookTitle = bookIdd?.title?.trim();
const author = bookIdd?.author?.trim();

  const tittle = "Requisição aceite";
  const message = `Seu pedido **${bookTitle}** do autor **${author}** foi aceito. Dirija-se à biblioteca para pegar o exemplar.`;

  await createNotification(userId, tittle, message);
  sendNotification(userId, tittle, message);
}

/**
 * Notifica o usuário que o livro foi marcado como devolvido
 */
export async function notifyBookReturned(userId: string) {
  const title = "Livro devolvido";
  const message = "Seu livro foi marcado como devolvido. Obrigado!";

  await createNotification(userId, title, message);
  sendNotification(userId, title, message);
}
/** * Notifica o usuário que o livro foi rejeitado
 */

export async function notifyBookRejected(userId: string) {
  const title = "Requisição rejeitada";
  const message = `Seu pedido do livro foi rejeitado pelo administrador.`;
  await createNotification(userId, title, message);
  sendNotification(userId, title, message);
}

/**
 * Notifica o usuário que o livro está atrasado
 */
export async function notifyBookOverdue(transactionId: number, userId: string, daysLate: number) {
  const title = "⚠️ Livro atrasado";
  const message = `Você atrasou a devolução do livro em ${daysLate} dia(s). Por favor, devolva o quanto antes.`;

  await createNotification(userId, title, message);
  sendNotification(userId, title, message);
}
