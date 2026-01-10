import { db } from "@/db"; // seu cliente Drizzle
import { transactions, physicalBooks, userScores } from "@/db/schema";
import { eq } from "drizzle-orm";

interface UpdateScoreInput {
  userId: string;
  transactionId: number;
}

/**
 * Atualiza a pontuação de um usuário baseado na devolução do livro
 * - Entregou no prazo ou antes: +1 ponto (máx 100)
 * - Entregou atrasado: -1 ponto por dia de atraso (mín 0)
 */
export async function updateUserScore(transactionId: number) {
  // 1. Buscar a transação e livro físico
  const tx = await db
    .select()
    .from(transactions)
    .where(eq(transactions.tid, transactionId))
    .get();

  if (!tx) throw new Error("Transação não encontrada");

  const physicalBook = await db
    .select()
    .from(physicalBooks)
    .where(eq(physicalBooks.currTransactionId, transactionId))
    .get();

  if (!physicalBook) throw new Error("Livro físico não encontrado");

  const today = new Date();
  const returnDate = physicalBook.returnDate ? new Date(physicalBook.returnDate) : null;
  const userId = tx.userId;

  // 2. Buscar ou criar registro de pontuação
  let userScore = await db.select().from(userScores).where(eq(userScores.userId, userId)).get();

  if (!userScore) {
    // cria pontuação inicial
    userScore = {
      userId,
      points: 100,
      lastUpdated: today,
    };
    await db.insert(userScores).values(userScore).run();
  }

  // 3. Calcular variação de pontos
  let points = userScore.points;

  if (!returnDate) {
    // Ainda não devolvido: pontos não mudam aqui (ou podemos penalizar por atraso diário com job)
    return userScore;
  }

  const borrowedDate = new Date(tx.borrowedDate);
  const maxDays = 15; // ou pegar do systemMetadata se quiser parametrizar
  const dueDate = new Date(borrowedDate);
  dueDate.setDate(dueDate.getDate() + maxDays);

  if (returnDate <= dueDate) {
    // devolveu no prazo ou antes
    points = Math.min(100, points + 1);
  } else {
    // devolveu atrasado: penaliza 1 ponto por dia de atraso
    const diffTime = returnDate.getTime() - dueDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    points = Math.max(0, points - diffDays);
  }

  // 4. Atualizar pontuação
  await db
    .update(userScores)
    .set({ points, lastUpdated: today })
    .where(eq(userScores.userId, userId))
    .run();

  return { userId, points };
}
