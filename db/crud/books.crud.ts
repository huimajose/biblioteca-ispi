import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";
import { books, physicalBooks } from "@/drizzle/schema";
import { eq, desc, count, sql, and, asc, like, or } from "drizzle-orm";
import { createTransactions } from "./transactions.crud";
import { getCurrentDate, getReturnDatePlus7Days } from "@/utils/date";



const db = drizzle(process.env.DATABASE_URL!);

export const createBooks = async (isbn: string, title: string, author: string, genre: string, totalCopies: number, availableCopies: number, cover: string, document_type: number) => {
  const book: typeof books.$inferInsert = {
    isbn,
    title,
    author,
    genre,
    totalCopies,
    availableCopies,
    cover,
    document_type
  };
  try {
    const res = await db.insert(books).values(book);
    console.log(res);
    return res;
  } catch (error) {
    console.log("Something Went Wrong :", error);
    throw error;
  }
};

/*
export async function readBooks(
  page: number = 1,
  pageSize: number = 10,
  sortField: string = "title",
  sortOrder: string = "asc",
  searchQuery: string = ""
) {
  const offset = (page - 1) * pageSize;
  const searchPattern = `%${searchQuery}%`;

  // Verifica se é uma busca por ID (número inteiro)
  const isNumericSearch = /^\d+$/.test(searchQuery);

  const whereClause = isNumericSearch
    ? eq(books.id, Number(searchQuery)) // Busca exata por ID
    : searchQuery
      ? or(
        like(books.title, searchPattern),
        like(books.author, searchPattern),
        like(books.isbn, searchPattern)
      )
      : undefined;

  const orderByClause = sortOrder === "desc"
    ? desc(books[sortField as keyof typeof books.$inferSelect])
    : asc(books[sortField as keyof typeof books.$inferSelect]);

  const [booksList, total] = await Promise.all([
    db
      .select()
      .from(books)
      .where(whereClause)
      .orderBy(orderByClause)
      .limit(pageSize)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(books)
      .where(whereClause)
  ]);

  return {
    books: booksList,
    totalBooks: total[0].count,
    totalPages: Math.ceil(total[0].count / pageSize)
  };
}
*/

export async function readBooks(
  page: number = 1,
  pageSize: number = 10,
  sortField: string = "title",
  sortOrder: string = "asc",
  searchQuery: string = ""
) {
  const offset = (page - 1) * pageSize;
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const searchPattern = `%${normalizedQuery}%`;

  // 🔹 Verifica se é busca por ID (número exato)
  const isNumericSearch = /^\d+$/.test(searchQuery);

  // 🔹 Filtro case-insensitive
  const whereClause = isNumericSearch
    ? eq(books.id, Number(searchQuery))
    : searchQuery
    ? sql`
        LOWER(${books.title}) LIKE ${searchPattern} OR 
        LOWER(${books.author}) LIKE ${searchPattern} OR 
        LOWER(${books.isbn}) LIKE ${searchPattern} OR
        LOWER(${books.genre}) LIKE ${searchPattern}
      `
    : undefined;

  // 🔹 Ordenação dinâmica
  const orderByClause =
    sortOrder === "desc"
      ? desc(books[sortField as keyof typeof books.$inferSelect])
      : asc(books[sortField as keyof typeof books.$inferSelect]);

  // 🔹 Busca paginada e total em paralelo
  const [booksList, total] = await Promise.all([
    db
      .select()
      .from(books)
      .where(whereClause)
      .orderBy(orderByClause)
      .limit(pageSize)
      .offset(offset),

    db
      .select({ count: sql<number>`COUNT(*)` })
      .from(books)
      .where(whereClause),
  ]);

  const totalCount = Number(total[0]?.count || 0);

  return {
    books: booksList,
    totalBooks: totalCount,
    totalPages: Math.ceil(totalCount / pageSize),
  };
}



export const updateBooks = async (id: number, totalCopies: number, availableCopies: number) => {
  try {
    const updatedBook = await db
      .update(books)
      .set({ totalCopies, availableCopies })
      .where(eq(books.id, id))
      .returning();

    return updatedBook[0];
  } catch (error) {
    console.log("Something Went Wrong :", error);
    return null;
  }
};

export const deleteBooks = async (id: number) => {
  try {
    const res = await db.delete(books).where(eq(books.id, id));
    console.log("deleteBooks:", res);
  } catch (error) {
    console.log("Something Went Wrong :", error);
  }
};

export const fetchLimitedBooks = async (limit: number) => {
  try {
    const booksData = await db.select().from(books).orderBy(desc(books.id)).limit(limit);
    return booksData;
  } catch (error) {
    console.log("Something went wrong while fetching books:", error);
    return [];
  }
};

export async function fetchBookById(id: number) {
  const result = await db.select().from(books).where(eq(books.id, id)).limit(1);

  return result[0] || null;
}

export const deletePhysicalBook = async (pid: number) => {
  try {
    // Check if the book is available (not borrowed)
    const physicalBook = await db.select().from(physicalBooks).where(eq(physicalBooks.pid, pid)).limit(1);

    if (physicalBook.length === 0) {
      throw new Error("Physical book not found");
    }

    if (physicalBook[0].borrowed) {
      throw new Error("Cannot remove a borrowed book");
    }

    // Delete the physical book
    await db.delete(physicalBooks).where(eq(physicalBooks.pid, pid));
    return true;
  } catch (error) {
    console.error("Error removing physical book:", error);
    throw error;
  }
};

export const createPhysicalBooks = async (bookId: number, borrowed: boolean, returnDate: string | null, userId: string, currTransactionId: number) => {
  try {
    const physicalBook = {
      bookId,
      borrowed,
      returnDate,
      userId,
      currTransactionId,
    };
    const [newBook] = await db.insert(physicalBooks).values(physicalBook).returning({
      pid: physicalBooks.pid,
      bookId: physicalBooks.bookId,
      borrowed: physicalBooks.borrowed,
      returnDate: physicalBooks.returnDate,
      userId: physicalBooks.userId,
      currTransactionId: physicalBooks.currTransactionId,
    });

    console.log("Created physical book:", newBook);
    return newBook;
  } catch (error) {
    console.error("Error creating physical book:", error);
    throw error;
  }
};

export const getActivePhysicalBooksCount = async (bookId: number) => {
  try {
    const result = await db
      .select()
      .from(physicalBooks)
      .where(sql`${physicalBooks.bookId} = ${bookId}`);
    return result.length;
  } catch (error) {
    console.error("Error getting physical books count:", error);
    throw error;
  }
};

export const updateBook = async (id: number, title: string, author: string, genre: string, isbn: string, totalCopies: number, availableCopies: number, cover: string, fileUrl: string, document_type: number, is_digital: boolean) => {
  try {
    const res = await db
      .update(books)
      .set({
        title,
        author,
        genre,
        isbn,
        totalCopies,
        fileUrl,
        availableCopies,
        cover,
        document_type,
        is_digital
      })
      .where(eq(books.id, id));
    return res;
  } catch (error) {
    console.error("Error updating book:", error);
    throw error;
  }
};

export const readPhysicalBooks = async (bookId: number) => {
  try {
    const result = await db.select().from(physicalBooks).where(eq(physicalBooks.bookId, bookId));
    return result;
  } catch (error) {
    console.error("Error reading physical books:", error);
    throw error;
  }
};

export const fetchBooksByQuery = async (query: string, page: number = 1, pageSize: number = 10) => {
  try {
    const offset = (page - 1) * pageSize;

    const [searchResults, totalCount] = await Promise.all([
      db
        .select()
        .from(books)
        .where(
          sql`LOWER(title) LIKE LOWER(${"%" + query + "%"}) OR 
              LOWER(author) LIKE LOWER(${"%" + query + "%"}) OR 
              LOWER(isbn) LIKE LOWER(${"%" + query + "%"}) OR
              LOWER(genre) LIKE LOWER(${"%" + query + "%"})`
        )
        .orderBy(desc(books.id))
        .limit(pageSize)
        .offset(offset),
      db
        .select({ count: books.id })
        .from(books)
        .where(
          sql`LOWER(title) LIKE LOWER(${"%" + query + "%"}) OR 
              LOWER(author) LIKE LOWER(${"%" + query + "%"}) OR 
              LOWER(isbn) LIKE LOWER(${"%" + query + "%"}) OR
              LOWER(genre) LIKE LOWER(${"%" + query + "%"})`
        )
        .then((res) => res.length),
    ]);

    return {
      books: searchResults,
      totalPages: Math.ceil(totalCount / pageSize),
      currentPage: page,
      totalBooks: totalCount,
    };
  } catch (error) {
    console.error("Error searching books:", error);
    return {
      books: [],
      totalPages: 0,
      currentPage: page,
      totalBooks: 0,
    };
  }
};

export const readSingleBook = async (bookId: number) => {
  try {
    
    // Pegar os detalhes do livro
    const book = await db.select().from(books).where(eq(books.id, bookId)).limit(1);

    if (!book || book.length === 0) {
      return null;
    }

   
    //Contar o número de livros físicos disponíveis
    const availableCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(physicalBooks)
      .where(and(eq(physicalBooks.bookId, bookId), eq(physicalBooks.borrowed, false)));

    // Combinar os detalhes do livro com a contagem disponível
    return {
      ...book[0],
      availableBooks: Number(availableCount[0].count),
    };
  } catch (error) {
    console.error("Error in readSingleBook:", error);
    throw error;
  }
};

export async function rentBook(bookId: number, userId: string) {
  
  try {
    // Buscar um livro físico disponível
    const availableBooks = await db
      .select()
      .from(physicalBooks)
      .where(eq(physicalBooks.bookId, bookId))
      .limit(1);


      console.log("numero de livros encontrados: ", availableBooks)

    // Verificar se existem livros disponíveis

    if (availableBooks.length === 0) {
      throw new Error("Não existe nenhum livro associado a este ID.");
    }

    const bookToRent = availableBooks[0];

    // Atualizar o status do livro físico para emprestado
    const updatedPhysicalBook = await db
      .update(physicalBooks)
      .set({ borrowed: true, userId: userId, returnDate: getReturnDatePlus7Days()  })
      .where(eq(physicalBooks.pid, bookToRent.pid))
      .returning();

    if (updatedPhysicalBook.length === 0) {
      throw new Error("Ocorreu um erro ao actualizar o status do livro.");
    }

    // Atualizar o número de cópias disponíveis no livro geral
    const updatedBookCount = await db
      .update(books)
      .set({
        availableCopies: sql`${books.availableCopies} - 1`
      })
      .where(eq(books.id, bookId))
      .returning();

    if (updatedBookCount.length === 0) {
      throw new Error("Ocorreu um erro actualizar as informações do livro na tabela.");
    }

    const trans_result = createTransactions(bookId, userId, userId, "borrowed", getCurrentDate(), getReturnDatePlus7Days());

    if (trans_result) {
      throw new Error("Ocorreu um erro ao criar a transação de empréstimo.");
    }


    return {
      success: true,
      message: "Livro requisitado com sucesso.",
      physicalBook: updatedPhysicalBook[0],
    };
  } catch (error) {
    console.error("Ocorreu um erro ao requisitar o livro:", error);
    return {
      success: false,
      message: (error as Error).message,
    };
  }
}

export const updateBookFileUrl = async (id: number, fileUrl: string) => {
  try {
    const result = await db
      .update(books)
      .set({ fileUrl })
      .where(eq(books.id, id))
      .returning();

    if (result.length === 0) {
      throw new Error("Livro não encontrado ou nenhuma alteração realizada.");
    }

    return {
      success: true,
      message: "fileUrl atualizado com sucesso.",
      updatedBook: result[0],
    };
  } catch (error) {
    console.error("Erro ao atualizar fileUrl:", error);
    return {
      success: false,
      message: "Erro ao atualizar o fileUrl.",
      error,
    };
  }
};

export const getBooksCount = async (type?: number) => {
  try {
    const query = db
      .select({ count: count() })
      .from(books);

    if (type !== undefined) {
      query.where(eq(books.document_type, type));  // ou books.document_type se tiveres renomeado
    }

    const result = await query;
    return Number(result[0].count);
  } catch (error) {
    console.error("Erro ao contar os livros cadastrados:", error);
    throw error;
  }
};



export const getRecentBooks = async (limit = 6) => {
  try {
    const result = await db
      .select()
      .from(books)
      .orderBy(desc(books.created_at))  // o id auto-incremental define ordem
      .limit(limit);

    return result ?? [];
  } catch (error) {
    console.error("Erro ao buscar livros recentes:", error);
    throw error;
  }
};