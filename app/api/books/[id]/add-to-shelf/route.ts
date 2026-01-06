import { NextResponse } from "next/server";
import { addBookToShelf } from "@/db/crud/books.crud";
import { auth } from "@clerk/nextjs/server";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ success: false, message: "Usuário não autenticado" }, { status: 401 });
    }

    // ✅ pegar params de forma segura
    const { id } = await Promise.resolve(params);
    const bookId = Number(id);

    if (Number.isNaN(bookId)) {
     return NextResponse.json({ success: false, message: "ID do livro inválido" }, { status: 400 });
    }

    const result = await addBookToShelf(bookId, userId);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json({ message: result.message }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Erro interno do servidor" }, { status: 500 });
  }
}
