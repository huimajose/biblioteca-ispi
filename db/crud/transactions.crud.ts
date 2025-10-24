import "dotenv/config";
import { physicalBooks, transactions } from "../schema";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";

export const createTransactions = async (
  physicalBookId: number,
  userId: string,
  adminId: string,
  status: string,
  borrowedDate: any,
  returnedDate: string | undefined
) => {
  const transaction: typeof transactions.$inferInsert = {
    physicalBookId,
    userId,
    adminId,
    status,
    borrowedDate,
    returnedDate,
  };

  try {
    const [res] = await db.insert(transactions).values(transaction).returning({
      tid: transactions.tid,
      physicalBookId: transactions.physicalBookId,
      status: transactions.status,
      borrowedDate: transactions.borrowedDate,
      returnedDate: transactions.returnedDate,
    });

    console.log("createTransactions:", res);
    return res;
  } catch (error) {
    console.error("Something Went Wrong in createTransactions:", error);
    return null;
  }
};


export async function readTransactions() {
  try {
    const result = await db.select().from(transactions);
    return result;
  } catch (error) {
    console.error("Error reading transactions:", error);
    return null;
  }
}

export async function readTransactionById(id: number) {
  try {
    const result = await db
      .select()
      .from(transactions)
      .where(eq(transactions.tid, id))
      .limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("Error reading transaction:", error);
    return null;
  }
}

export async function updateTransactionStatus(id: number, status: string) {
  try {
    const result = await db
      .update(transactions)
      .set({ status })
      .where(eq(transactions.tid, id))
      .returning();
    return result[0] || null;
  } catch (error) {
    console.error("Error updating transaction:", error);
    return null;
  }
}

export const updateTransactions = async (tid: number, status: string, adminId: string) => {
  try {
    const res = await db
      .update(transactions)
      .set({
        status,
        adminId,
      })
      .where(eq(transactions.tid, tid));

    console.log("updateTransactions:", res);
  } catch (error) {
    console.error("Something Went Wrong:", error);
    throw new Error("Failed to update transaction");
  }
};

export const updateTransactionsSuccess = async (tid: number, status: string, adminId: string) => {
  try {
    const borrowedDate = new Date();
    const returnedDate = new Date(borrowedDate);
    returnedDate.setDate(borrowedDate.getDate() + 15); // Add 15 days

    const res = await db
      .update(transactions)
      .set({
        status,
        adminId,
        borrowedDate: borrowedDate.toISOString(),
        returnedDate: returnedDate.toISOString(),
      })
      .where(eq(transactions.tid, tid));

    console.log("updateTransactions:", res);
  } catch (error) {
    console.error("Something Went Wrong:", error);
    throw new Error("Failed to update transaction");
  }
};

export const deleteTransactions = async (tid: number) => {
  try {
    const res = await db.delete(transactions).where(eq(transactions.tid, tid));
    console.log("deleteTransactions:", res);
  } catch (error) {
    console.log("Something Went Wrong :", error);
  }
};

export const getUserTransactionStatus = async (bookId: number, userId: string | undefined) => {
  try {
    // Return early if userId is undefined
    if (!userId) {
      return { borrowed: false, requested: false, totalBorrowed: 0 };
    }

    // Check if user has any active transaction (BORROWED or REQUESTED) for any physical copy of this book
    const bookStatus = await db
      .select({
        status: transactions.status,
      })
      .from(transactions)
      .innerJoin(physicalBooks, eq(transactions.physicalBookId, physicalBooks.pid))
      .where(
        and(
          eq(physicalBooks.bookId, bookId),
          eq(transactions.userId, userId),
          // Match the actual status values used in the application
          sql`${transactions.status} IN ('accepted', 'REQUESTED')`
        )
      )
      .limit(1);

    // Count total active borrows for the user across all books
    const activeBorrows = await db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(transactions)
      .where(and(eq(transactions.userId, userId), eq(transactions.status, "accepted")));

    const totalBorrowed = Number(activeBorrows[0].count);
    const status = bookStatus[0]?.status;

    // Match the exact status strings from the database
    return {
      borrowed: status === "accepted",
      requested: status === "REQUESTED",
      totalBorrowed,
    };
  } catch (error) {
    console.error("getUserTransactionStatus Error:", error);
    return { borrowed: false, requested: false, totalBorrowed: 0 };
  }
};

export const getAcceptedTransaction = async (userId: string, bookId: number) => {
  try {
    const transaction = await db
      .select()
      .from(transactions)
      .innerJoin(physicalBooks, eq(transactions.physicalBookId, physicalBooks.pid))
      .where(
        and(
          eq(transactions.userId, userId),
          eq(physicalBooks.bookId, bookId),
          eq(transactions.status, "accepted") // Case-sensitive match
        )
      )
      .limit(1);

    return transaction[0] || null;
  } catch (error) {
    console.error("Error fetching accepted transaction:", error);
    throw error;
  }
};

export const returnTransaction = async (tid: number) => {
  try {
    const res = await db
      .update(transactions)
      .set({ status: "RETURN" }) // Update status to "RETURN"
      .where(eq(transactions.tid, tid));

    console.log("returnTransaction:", res);
    return res;
  } catch (error) {
    console.error("Error updating transaction to return:", error);
    throw new Error("Failed to update transaction to return.");
  }
};
