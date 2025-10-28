import { boolean, date, integer, pgTable, serial, varchar, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const verifyPending = pgTable("verifyPending", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  clerkId: varchar({ length: 255 }).notNull().unique(),
  email: varchar({ length: 255 }).notNull().unique(),
});

export const users = pgTable("users", {
  clerkId: varchar({ length: 255 }).primaryKey(),
  primaryEmail: varchar({ length: 255 }).notNull(),
  role: varchar({length: 20})
});

export const admin = pgTable("admin", {
  clerkId: varchar({ length: 255 }).primaryKey().notNull(),
  primaryEmail: varchar({ length: 255 }).notNull(),
});

export const systemMetadata = pgTable("systemMetadata", {
  maxBooks: integer().notNull().default(4),
  maxDays: integer().notNull().default(15),
});

export const books = pgTable("books", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  author: varchar("author", { length: 255 }).notNull(),
  genre: varchar("genre", { length: 100 }).notNull(),
  isbn: varchar("isbn", { length: 13 }).notNull().unique(),
  totalCopies: integer("total_copies").notNull().default(0),
  availableCopies: integer("available_copies").notNull().default(0),
  cover: varchar("cover", { length: 255 }).notNull(),
  fileUrl: varchar("fileUrl", {length:255}),
  document_type: integer("document_type").notNull().default(1),
  is_digital: boolean("is_digital").notNull().default(false), // Added to indicate if the book is digital
  created_at: timestamp("created_at").notNull().defaultNow(),

  
});

export const transactions = pgTable("transactions", {
  tid: serial("tid").primaryKey(),
  physicalBookId: integer("physical_book_id").notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  adminId: varchar("admin_id", { length: 255 }).notNull(),
  status: varchar("status", { length: 50 }).notNull(),
  borrowedDate: date("borrowed_date"),
  returnedDate: date("returned_date"),
});

export const physicalBooks = pgTable("physical_books", {
  pid: serial("pid").primaryKey(),
  bookId: integer("book_id").notNull(),
  borrowed: boolean("borrowed").notNull().default(false),
  returnDate: date("return_date"),
  userId: varchar("user_id", { length: 255 }),
  currTransactionId: integer("curr_transaction_id").notNull(),
});
