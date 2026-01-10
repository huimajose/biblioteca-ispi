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
