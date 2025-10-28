import { pgTable, unique, integer, varchar, serial, boolean, date } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const verifyPending = pgTable(
  "verifyPending",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "verifyPending_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647 }),
    clerkId: varchar({ length: 255 }).notNull(),
    email: varchar({ length: 255 }).notNull(),
  },
  (table) => [unique("verifyPending_clerkId_unique").on(table.clerkId), unique("verifyPending_email_unique").on(table.email)]
);

export const admin = pgTable("admin", {
  clerkId: varchar({ length: 255 }).primaryKey().notNull(),
  primaryEmail: varchar({ length: 255 }).notNull(),
});

export const systemMetadata = pgTable("systemMetadata", {
  maxBooks: integer().default(4).notNull(),
  maxDays: integer().default(15).notNull(),
});

export const users = pgTable("users", {
  clerkId: varchar({ length: 255 }).primaryKey().notNull(),
  primaryEmail: varchar({ length: 255 }).notNull(),
});

export const physicalBooks = pgTable("physical_books", {
  pid: serial().primaryKey().notNull(),
  bookId: integer("book_id").notNull(),
  borrowed: boolean().default(false).notNull(),
  returnDate: date("return_date"),
  userId: varchar("user_id", { length: 255 }),
  currTransactionId: integer("curr_transaction_id").notNull(),
});

export const transactions = pgTable("transactions", {
  tid: serial().primaryKey().notNull(),
  physicalBookId: integer("physical_book_id").notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  adminId: varchar("admin_id", { length: 255 }).notNull(),
  status: varchar({ length: 50 }).notNull(),
  borrowedDate: date("borrowed_date").defaultNow().notNull(),
  returnedDate: date("returned_date"),
});

export const books = pgTable(
  "books",
  {
    id: serial().primaryKey().notNull(),
    title: varchar({ length: 255 }).notNull(),
    author: varchar({ length: 255 }).notNull(),
    genre: varchar({ length: 100 }).notNull(),
    genre_id: integer("genre_id").default(1),
    totalCopies: integer("total_copies").default(0).notNull(),
    availableCopies: integer("available_copies").default(0).notNull(),
    cover: varchar({ length: 255 }).notNull(),
    isbn: varchar({ length: 13 }).notNull(),
    fileUrl: varchar("fileUrl", { length: 255 }),
    document_type: integer("document_type").default(1).notNull(), // 1 for physical, 2 for digital
    is_digital: boolean("is_digital").default(false).notNull(), // Added to indicate if the book is digital
    created_at: date("created_at").default(sql`now()`).notNull(),
  },
  (table) => [unique("books_isbn_unique").on(table.isbn)]
);
