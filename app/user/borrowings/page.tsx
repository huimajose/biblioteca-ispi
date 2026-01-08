import { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { readTransactions } from "@/db/crud/transactions.crud";
import { readBooks } from "@/db/crud/books.crud";
import { getUserDigitalBooks } from "@/db/crud/books.crud"; // nova função
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Minha biblioteca | Sistema de gestão de biblioteca",
  description: "Ver os livros que estás a ler",
};

export default async function BorrowingsPage() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Usuário não autenticado");
  }

  // 📌 Livros físicos
  const transactions = await readTransactions();
  const activeBorrowings = transactions.filter(
    (tx) => tx.userId === userId && tx.status === "ACCEPTED"
  );
  const physicalBookIds = [...new Set(activeBorrowings.map((tx) => tx.physicalBookId))];

  const physicalBooksData = (
    await Promise.all(
      physicalBookIds.map(async (id) => {
        const book = await readBooks(1, 1, "id", "asc", id.toString());
        return book.books[0];
      })
    )
  ).filter(Boolean);

  const physicalBookMap = new Map(physicalBooksData.map((book) => [book.id, book]));

  const enrichedPhysicalBorrowings = activeBorrowings.map((tx) => {
    const book = physicalBookMap.get(tx.physicalBookId);
    return {
      ...tx,
      bookTitle: book?.title || "Unknown Book",
      bookAuthor: book?.author || "Unknown Author",
    };
  });

  // 📌 Livros digitais
  const digitalBooksData = await getUserDigitalBooks(userId); // busca direta da estante digital

  return (
    <div className="p-6 space-y-12">
      {/* 📱 Tabela de Livros Digitais */}
      <div>
        <h2 className="text-2xl font-bold text-green-600 mb-2">Livros digitais</h2>
        <p className="text-sm text-gray-500 mb-4">
          Mostrando {digitalBooksData.length} livros digitais disponíveis para leitura
        </p>

        <div className="bg-white rounded-lg shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Autor</TableHead>
                <TableHead>Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {digitalBooksData.map((book) => (
                <TableRow key={book.id}>
                  <TableCell>{book.id}</TableCell>
                  <TableCell>{book.title}</TableCell>
                  <TableCell>{book.author}</TableCell>
                  <TableCell>
                    <Button className="bg-blue-600" asChild>
                      <Link href={`/user/reader/${book.id}/${book.fileUrl}`}>
                        Ler livro
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* 📚 Tabela de Livros Físicos */}
      <div>
        <h2 className="text-2xl font-bold text-green-600 mb-2">Livros físicos</h2>
        <p className="text-sm text-gray-500 mb-4">
          Mostrando {enrichedPhysicalBorrowings.length} livros emprestados fisicamente
        </p>

        <div className="bg-white rounded-lg shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Autor</TableHead>
                <TableHead>Data empréstimo</TableHead>
                <TableHead>Data devolução</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enrichedPhysicalBorrowings.map((tx) => (
                <TableRow key={tx.tid}>
                  <TableCell>{tx.tid}</TableCell>
                  <TableCell>{tx.bookTitle}</TableCell>
                  <TableCell>{tx.bookAuthor}</TableCell>
                  <TableCell>{tx.borrowedDate}</TableCell>
                  <TableCell>{tx.returnedDate || "Não devolvido"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
