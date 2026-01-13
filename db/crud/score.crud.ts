import { db } from "@/db";
import { transactions, userScores } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Atualiza a pontuação do usuário quando um livro é devolvido
 * Regras:
 * - No prazo ou antes: +1 ponto (máx 100)
 * - Atraso: -1 ponto por dia (mín 0)
 * - Só pode ser aplicada UMA vez por transação
 */
export async function updateUserScoreOnReturn(transactionId: number) {
  const today = new Date();

  // 1. Buscar transação
  const [tx] = await db
    .select()
    .from(transactions)
    .where(eq(transactions.tid, transactionId));

  if (!tx) throw new Error("Transação não encontrada");

  if (!tx.returnedDate) {
    throw new Error("Transação ainda não foi devolvida");
  }

  if (tx.scoreApplied) {
    // já processado, evita duplicação
    return { userId: tx.userId, pointsApplied: false };
  }

  if (!tx.borrowedDate) {
    throw new Error("borrowedDate inexistente");
  }

  const userId = tx.userId;
  const borrowedDate = new Date(tx.borrowedDate);
  const returnedDate = new Date(tx.returnedDate);

  // 2. Buscar ou criar score
  const [existingScore] = await db
    .select()
    .from(userScores)
    .where(eq(userScores.userId, userId));

  const currentPoints = existingScore?.points ?? 100;

  // 3. Calcular prazo
  const MAX_DAYS = 15;
  const dueDate = new Date(borrowedDate);
  dueDate.setDate(dueDate.getDate() + MAX_DAYS);

  let newPoints = currentPoints;

  if (returnedDate <= dueDate) {
    newPoints = Math.min(100, currentPoints + 1);
  } else {
    const diffTime = returnedDate.getTime() - dueDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    newPoints = Math.max(0, currentPoints - diffDays);
  }

  // 4. Persistir score
  if (existingScore) {
    await db
      .update(userScores)
      .set({
        points: newPoints,
        lastUpdated: today,
      })
      .where(eq(userScores.userId, userId));
  } else {
    await db.insert(userScores).values({
      userId,
      points: newPoints,
      lastUpdated: today,
    });
  }

  const check = await db
  .select({ tid: transactions.tid, scoreApplied: transactions.scoreApplied })
  .from(transactions)
  .where(eq(transactions.tid, transactionId));

console.log("Transação encontrada para ser pontuada:", check);


  // 5. Marcar transação como pontuada
  await db
    .update(transactions)
    .set({ scoreApplied: true })
    .where(eq(transactions.tid, transactionId));

  return {
    userId,
    previousPoints: currentPoints,
    newPoints,
  };
}
