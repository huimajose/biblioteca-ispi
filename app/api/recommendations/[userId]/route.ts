// app/api/recommendations/[userId]/route.ts
import { NextResponse } from "next/server";
import { readPhysicalBooksByUser } from "@/db/crud/physicalBooks.crud";
import { readBooks } from "@/db/crud/books.crud";

export async function GET(req: Request, { params }: { params: { userId: string } }) {
  const { userId } = params;
  if (!userId) return NextResponse.json({ error: "userId inválido" }, { status: 400 });

  try {
    const userPhysicalBooks = await readPhysicalBooksByUser(userId);
    const booksData = await readBooks(1, 1000);
    const allBooks = booksData.books || [];

    const borrowedBookIds = userPhysicalBooks.map(b => b.bookId);
    const suggestedBooks = allBooks.filter(b => !borrowedBookIds.includes(b.id));

    return NextResponse.json(suggestedBooks);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
