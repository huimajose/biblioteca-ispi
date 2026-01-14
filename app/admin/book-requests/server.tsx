"use server";

import { readTransactions, updateTransactions, updateTransactionsSuccess, returnTransactionCrud, readTransactionById } from "@/db/crud/transactions.crud"; // Assuming this is where the updateTransactions function resides
import { updatePhysicalBookToTransaction, resetPhysicalBook, updatePhysicalBookActiveNew  } from "@/db/crud/physicalBooks.crud";
import { transactions } from "@/drizzle/schema";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { updateAvailableCopies } from "@/db/crud/books.crud";
import { canUserBorrowBook, updateUserScoreOnReturn } from "@/services/userScore.service";
import { notifyBookAccepted, notifyBookRejected, notifyBookReturned } from "@/services/notification.service";


// Accept transaction function
// Accept transaction function
export async function acceptTransaction(tid: number, userId: string | null | undefined) {
  try {
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // First get the transaction details to get the physical book ID
    const transaction = await readTransactionById(tid);


    console.log("Transaction details:", transaction);
    
    if (!transaction) {
      throw new Error("Transaction not found");
    }

    // Check if user can borrow book
    const canBorrow = await canUserBorrowBook(userId);
    if (!canBorrow.allowed) {
      return { success: false, message: canBorrow.reason };
    }

    // Update the transaction status and dates
    await updateTransactionsSuccess(tid, "ACCEPTED", userId);

    // Update the physical book's borrowed status
    //await updatePhysicalBookToTransaction(transaction.physicalBookId, true, tid, userId);
    await updatePhysicalBookActiveNew(tid, userId);

    await notifyBookAccepted(tid, userId /* adminId? */, transaction.userId, transaction.physicalBookId);

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
   await notifyBookRejected(userId);
  return { success: true, message: "Transaction rejected successfully" };
}

// Fetch all transactions (already implemented in your `server.tsx`)
export async function fetchTransactions() {
  return await readTransactions(); // This reads transactions from the DB
}


export async function returnTransaction(tid: number, bookId: number) {
  try {

   

    const res = await returnTransactionCrud(tid);

    
    const retPhysicallBook = await resetPhysicalBook(tid);
    await updateAvailableCopies(bookId, 1);
    // Atualiza pontuação do usuário
    const transaction = await db.select().from(transactions).where(eq(transactions.tid, tid));
    if (transaction.length) {
      const scoreResult = await updateUserScoreOnReturn(transaction[0].userId, tid);

 await notifyBookReturned(transaction[0].userId, scoreResult);
    }
   
    return { success: true, message: "Livro marcado como devolvido", res, retPhysicallBook };
  } catch (err) {
    console.error("Erro ao marcar devolução:", err);
    return { success: false, message: "Erro ao marcar devolução" };
  }
}