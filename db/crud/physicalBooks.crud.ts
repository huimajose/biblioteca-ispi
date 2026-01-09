import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";
import { physicalBooks, books, userDigitalBooks } from "../schema";
import { and, eq, sql } from "drizzle-orm";

const db = drizzle(process.env.DATABASE_URL!);

export const createPhysicalBooks = async (bookId: number, borrowed: boolean, returnDate: any, userId: string, currTransactionId: number) => {
  const physicalBook: typeof physicalBooks.$inferInsert = {
    bookId,
    borrowed,
    returnDate,
    userId,
    currTransactionId,
  };
  try {
    const res = await db.insert(physicalBooks).values(physicalBook);
    console.log("createPhysicalBooks:", res);
  } catch (error) {
    console.log("Something Went Wrong :", error);
  }
};

export const readPhysicalBooks = async () => {
  try {
    const res = await db.select().from(physicalBooks);
    console.log("readPhysicalBooks:", res);

    return res;
  } catch (error) {
    console.log("Something Went Wrong :", error);
  }
};

export const readPhysicalBooksByUser = async (userId: string) => {
  try {
    const res = await db
      .select()
      .from(physicalBooks)
      .where(
        and(
          eq(physicalBooks.userId, userId),
          eq(physicalBooks.borrowed, true) // só livros emprestados
        )
      );

    console.log("readPhysicalBooksByUser:", res);
    return res;
  } catch (error) {
    console.log("Something Went Wrong :", error);
    return [];
  }
};

export const readDigitalBooks = async (userIdd: string) => {
  try {
    const res = await db
      .select()
      .from(userDigitalBooks)
      .where(eq(userDigitalBooks.userId, userIdd)); // filtra pelo usuário

    console.log("readDigitalBooks:", res);
    return res;
  } catch (error) {
    console.log("Something Went Wrong :", error);
    return [];
  }
};


export const updatePhysicalBooks = async (pid: number, borrowed: boolean) => {
  try {
    // First get the book ID from physical book
    const physicalBook = await db.select({ bookId: physicalBooks.bookId }).from(physicalBooks).where(eq(physicalBooks.pid, pid)).limit(1);

    if (!physicalBook || physicalBook.length === 0) {
      throw new Error("Physical book not found");
    }

    // Calculate return date if book is being borrowed
    const returnDate = borrowed ? new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) : null;

    // Update the physical book's borrowed status and return date
    const res = await db
      .update(physicalBooks)
      .set({
        borrowed,
        returnDate: returnDate?.toISOString(),
      })
      .where(eq(physicalBooks.pid, pid));

    // Get the new count of available books
    const availableCount = await db
      .select({
        count: sql`cast(count(*) as integer)`,
      })
      .from(physicalBooks)
      .where(and(eq(physicalBooks.bookId, physicalBook[0].bookId), eq(physicalBooks.borrowed, false)));

    // Update the books table with new available copies count
    await db
      .update(books)
      .set({ availableCopies: Number(availableCount[0].count) })
      .where(eq(books.id, physicalBook[0].bookId));

    return res;
  } catch (error) {
    console.error("Error updating physical book:", error);
    throw error;
  }
};

export const deletePhysicalBooks = async (pid: number) => {
  try {
    const res = await db.delete(physicalBooks).where(eq(physicalBooks.pid, pid));
    console.log("deletePhysicalBooks:", res);
  } catch (error) {
    console.log("Something Went Wrong :", error);
  }
};

export const checkAvailablePhysicalBooks = async (bookId: number) => {
  try {
    const availableBooks = await db
      .select()
      .from(physicalBooks)
      .where(
        and(
          eq(physicalBooks.bookId, bookId), // Ensure we're looking for the correct book
          eq(physicalBooks.borrowed, false) // Ensure it's not already borrowed
        )
      );

    return availableBooks;
  } catch (error) {
    console.log("Error fetching available books:", error);
    throw error;
  }
};

export const findOneAvailablePhysicalBookId = async (bookId: number): Promise<number | null> => {
  try {
    const availableBooks = await checkAvailablePhysicalBooks(bookId);

    if (availableBooks && availableBooks.length > 0) {
      return availableBooks[0].pid; // Assuming 'pid' is the physical book ID
    }

    return null; // No available physical books found
  } catch (error) {
    console.log("Error finding one available physical book ID:", error);
    throw error;
  }
};

export const resetPhysicalBook = async (pidd: number) => {
  try {
    const res = await db
      .update(physicalBooks)
      .set({
        borrowed: false,
        returnDate: null,
        userId: null,
        currTransactionId: 0,
      })
      .where(eq(physicalBooks.pid, pidd));

    return true;
  } catch (error) {
    console.error("Error resetting physical book:", error);
    throw new Error("Failed to reset physical book.");
  }
};
