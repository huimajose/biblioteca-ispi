"use server";

import { readTransactions, updateTransactions, updateTransactionsSuccess, returnTransactionCrud } from "@/db/crud/transactions.crud"; // Assuming this is where the updateTransactions function resides
import { updatePhysicalBooks } from "@/db/crud/physicalBooks.crud";
import { transactions } from "@/drizzle/schema";
import { db } from "@/db";
import { eq } from "drizzle-orm";

// Accept transaction function
export async function acceptTransaction(tid: number, userId: string | null | undefined) {
  try {
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // First get the transaction details to get the physical book ID
    const transaction = await db.select().from(transactions).where(eq(transactions.tid, tid)).limit(1);

    if (!transaction || transaction.length === 0) {
      throw new Error("Transaction not found");
    }

    // Update the transaction status and dates
    await updateTransactionsSuccess(tid, "ACCEPTED", userId);

    // Update the physical book's borrowed status
    await updatePhysicalBooks(transaction[0].physicalBookId, true);

    return { success: true, message: "Transaction accepted successfully" };
  } catch (error) {
    console.error("Error accepting transaction:", error);
    throw error;
  }
}

// Reject transaction function
export async function rejectTransaction(tid: number, userId: string | null | undefined) {
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Call the database update function
  await updateTransactions(tid, "REJECTED", userId);
  return { success: true, message: "Transaction rejected successfully" };
}

// Fetch all transactions (already implemented in your `server.tsx`)
export async function fetchTransactions() {
  return await readTransactions(); // This reads transactions from the DB
}


export async function returnTransaction(tid: number, adminId: string) {
  try {
    const res = await returnTransactionCrud(tid, adminId);
    return { success: true, message: "Livro marcado como devolvido", res };
  } catch (err) {
    console.error("Erro ao marcar devolução:", err);
    return { success: false, message: "Erro ao marcar devolução" };
  }
}