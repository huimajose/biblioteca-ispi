/* eslint-disable @typescript-eslint/no-unused-vars */
import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";
import { books, physicalBooks, userDigitalBooks  } from "@/drizzle/schema";
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
  searchQuery: string = "",
  category?: number | null
) {
  const offset = (page - 1) * pageSize;
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const searchPattern = `%${normalizedQuery}%`;

  const isNumericSearch = /^\d+$/.test(searchQuery);

  // 🔍 Condição de busca
  const searchCondition = isNumericSearch
    ? eq(books.id, Number(searchQuery))
    : searchQuery
    ? sql`
        LOWER(${books.title}) LIKE ${searchPattern} OR 
        LOWER(${books.author}) LIKE ${searchPattern} OR 
        LOWER(${books.isbn}) LIKE ${searchPattern}
      `
    : undefined;

  // 🔹 Condição de categoria
  const categoryCondition =
    category && category.trim() !== ""
      ? /^\d+$/.test(category)
        ? eq(books.genre_id, Number(category)) // se for número
        : sql`LOWER(${books.genre}) = LOWER(${category})` // se for texto
      : undefined;

  // 🔹 Combina condições
  const whereClause =
    searchCondition && categoryCondition
      ? and(searchCondition, categoryCondition)
      : searchCondition || categoryCondition;

  // 🔹 Ordenação
  const orderByClause =
    sortOrder === "desc"
      ? desc(books[sortField as keyof typeof books.$inferSelect])
      : asc(books[sortField as keyof typeof books.$inferSelect]);

  // 🔹 Busca e total em paralelo
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

export async function rentBook(bookId: number, userId: string, userName?: string) {
  try {
    // 1️⃣ Verifica se o livro existe
    const book = await db
      .select()
      .from(books)
      .where(eq(books.id, bookId))
      .limit(1);

    if (!book.length) {
      return { success: false, message: "Livro não encontrado" };
    }

    // 2️⃣ Verifica se ainda há cópias físicas disponíveis
    const availableBooks = await db
      .select()
      .from(physicalBooks)
      .where(and(eq(physicalBooks.bookId, bookId), eq(physicalBooks.borrowed, false)))
      .limit(1);

    if (availableBooks.length === 0) {
      return { success: false, message: "Nenhuma cópia física disponível para empréstimo" };
    }

    const bookToRent = availableBooks[0];

    // 3️⃣ Verifica se o usuário já pegou este livro emprestado
    const existingRental = await db
      .select()
      .from(physicalBooks)
      .where(and(eq(physicalBooks.bookId, bookId), eq(physicalBooks.userId, userId), eq(physicalBooks.borrowed, true)))
      .limit(1);

    if (existingRental.length) {
      return { success: false, message: "Você já requisitou este livro" };
    }

    // 4️⃣ Atualiza o livro físico para "emprestado"
    const updatedPhysicalBook = await db
      .update(physicalBooks)
      .set({
        borrowed: true,
        userId,
        returnDate: getReturnDatePlus7Days(),
      })
      .where(eq(physicalBooks.pid, bookToRent.pid))
      .returning();

    if (updatedPhysicalBook.length === 0) {
      return { success: false, message: "Erro ao atualizar o status do livro físico" };
    }

    // 5️⃣ Atualiza a contagem de cópias disponíveis no livro geral
    await db
      .update(books)
      .set({ availableCopies: sql`${books.availableCopies} - 1` })
      .where(eq(books.id, bookId));

    // 6️⃣ Cria transação de empréstimo
    const trans_result = await createTransactions(bookId, userId, userId, "REQUESTED", getCurrentDate(), getReturnDatePlus7Days(), userName);
    if (!trans_result) {
      return { success: false, message: "Erro ao criar transação de empréstimo" };
    }

    return {
      success: true,
      message: `Livro "${book[0].title}" requisitado com sucesso! 📚`,
      physicalBook: updatedPhysicalBook[0],
    };
  } catch (error) {
    console.error("❌ rentBook error:", error);
    return { success: false, message: (error as Error).message || "Ocorreu um erro ao requisitar o livro" };
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


export async function getBookTitleByPhysicalId(pid: number) {
  try {
    const result = await db
      .select({ title: books.title })
      .from(physicalBooks)
      .innerJoin(books, eq(books.id, physicalBooks.bookId))
      .where(eq(physicalBooks.pid, pid));
    return result[0]?.title || "Livro desconhecido";
  } catch (error) {
    console.error("Erro ao buscar título do livro:", error);
    return "Erro";
  }
}

export async function addBookToShelf(bookId: number, userIdd: string) {
  try {

    const book = await db
      .select()
      .from(books)
      .where(eq(books.id, bookId))
      .limit(1);

    if (!book.length) {
      return {
        success: false,
        message: "Livro não encontrado",
      };
    }

    if (!book[0].is_digital) {
     return {
        success: false,
        message: "Este livro não possui versão digital",
      };
    }

   const exists = await db
      .select()
      .from(userDigitalBooks)
      .where(
        and(
          eq(userDigitalBooks.bookId, bookId),
          eq(userDigitalBooks.userId, userIdd)
        )
      );

    if (exists.length) {
      return {
        success: false,
        message: "Livro já está na sua estante",
      };
    }
   await db.insert(userDigitalBooks).values({
      bookId,
      userId: userIdd, 
    });
    
  return {
      success: true,
      message: `Livro "${book[0].title}" adicionado à sua estante!`,
    };
  } catch (error) {
    console.error("❌ addBookToShelf error:", error);
     return {
      success: false,
      message: "Ocorreu um erro ao adicionar o livro",
    };
  }
}