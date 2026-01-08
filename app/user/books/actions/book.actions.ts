"use server";

import { fetchBookById } from "@/db/crud/books.crud";

export async function getBookDetails(bookId: number) {
  return await fetchBookById(bookId);
}
