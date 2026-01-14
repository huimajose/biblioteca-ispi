// services/userScore.service.ts
import { db } from "@/db";
import { transactions, systemMetadata, userScores } from "@/db/schema";
import { and, eq, isNull, lt } from "drizzle-orm";

export async function canUserBorrowBook(userId: string) {
  const today = new Date();

  // 1️⃣ Buscar metadata do sistema
  const [meta] = await db.select().from(systemMetadata).limit(1);
  const maxDays = meta?.maxDays ?? 15;

  // 2️⃣ Buscar livros em atraso
  const overdueTransactions = await db
    .select()
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.status, "ACCEPTED"),
        isNull(transactions.returnedDate),
        lt(transactions.borrowedDate, new Date(today.getTime() - maxDays * 86400000))
      )
    );

  // 3️⃣ Se tiver atraso → bloquear
  if (overdueTransactions.length > 0) {
    return {
      allowed: false,
      reason: "Usuário possui livro(s) em atraso",
    };
  }

  // 4️⃣ Verificar pontuação
  const [score] = await db
    .select()
    .from(userScores)
    .where(eq(userScores.userId, userId));

  if (score && score.points <= 0) {
    return {
      allowed: false,
      reason: "Pontuação insuficiente para novos empréstimos",
    };
  }

  return {
    allowed: true,
    reason: "Usuário elegível para empréstimo",
  };
}

/**
 * Atualiza a pontuação do usuário ao devolver um livro
 * @param userId - ID do usuário
 * @param transactionId - ID da transação do livro
 */
export async function updateUserScoreOnReturn(userId: string, transactionId: number) {
  // 1️⃣ Busca a transação
  const [transaction] = await db.select()
    .from(transactions)
    .where(eq(transactions.tid, transactionId));

  if (!transaction) {
    throw new Error("Transação não encontrada");
  }

  const returnedDate = new Date();
  const borrowedDate = new Date(transaction.borrowedDate);

  // 2️⃣ Busca metadata do sistema
  const [meta] = await db.select().from(systemMetadata).limit(1);
  const maxDays = meta?.maxDays ?? 15;

  // 3️⃣ Calcula prazo final
  const dueDate = new Date(borrowedDate);
  dueDate.setDate(dueDate.getDate() + maxDays);

  // 4️⃣ Calcula pontos
  let pointsDelta = 0;
  if (returnedDate <= dueDate) {
    pointsDelta = 1; // entregou no prazo → +1 ponto
  } else {
    const diffDays = Math.floor((returnedDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
    pointsDelta = -diffDays; // atrasado → -1 ponto por dia
  }

  // 5️⃣ Atualiza ou cria registro no userScores
  const [existingScore] = await db.select()
    .from(userScores)
    .where(eq(userScores.userId, userId));

  if (existingScore) {
    // atualiza
    const newPoints = Math.min(100, Math.max(0, existingScore.points + pointsDelta));
    await db.update(userScores)
      .set({ points: newPoints })
      .where(eq(userScores.userId, userId));
  } else {
    // cria
    const initialPoints = Math.min(100, Math.max(0, 100 + pointsDelta));
    await db.insert(userScores).values({
      userId,
      points: initialPoints
    });
  }

  return pointsDelta;
}