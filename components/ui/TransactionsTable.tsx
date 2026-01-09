"use client";

import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown } from "lucide-react";
import { useState } from "react";
import { acceptTransaction, rejectTransaction, returnTransaction } from "@/app/admin/book-requests/server"; // Import functions directly from server.tsx
import { ClerkProvider, useAuth } from "@clerk/nextjs"; // Use hook here
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { getBookDetails } from "@/app/user/books/actions/book.actions";
import { Spinner } from "./spinner";
import { TRANSACTION_STATUS } from "@/constants/transactionStatus";


interface Transaction {
  tid: number;
  physicalBookId: number;
  userId: string;
  adminId: string;
  status: string;
  borrowedDate: string;
  returnedDate: string | null;
  userName?: string;
  bookTitle?: string;
  user_name?: string;
}

interface TransactionsTableProps {
  initialTransactions: Transaction[];
  totalPages: number;
  totalTransactions: number;
  currentPage: number;
}

type SortField = keyof Transaction;
type SortOrder = "asc" | "desc";

export default function TransactionsTable({ initialTransactions, totalPages, totalTransactions, currentPage }: TransactionsTableProps) {
  const { userId } = useAuth(); // Get logged-in admin's ID once at the top of the component
  const pageSize = 10;

  const [sortField, setSortField] = useState<SortField>("tid");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [transactions, setTransactions] = useState(initialTransactions);
  const [loadingTransaction, setLoadingTransaction] = useState<number | null>(null); // Track the loading state for a specific transaction
  const [selectedBook, setSelectedBook] = useState<any>(null);
const [loadingBook, setLoadingBook] = useState(false);




  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };
  

  // Handle Accept Transaction
  const handleAccept = async (tid: number) => {
console.log("book ID in handleAccept:", tid);

    try {
      if (!userId) {
        console.error("Unauthorized");
        return;
      }

      setLoadingTransaction(tid); // Set loading state for the specific transaction
      const response = await acceptTransaction(tid, userId); // Pass the userId from useAuth here
      if (response.success) {
        setTransactions((prev) => prev.map((tx) => (tx.tid === tid ? { ...tx, status: "ACCEPTED" } : tx)));
      }
    } catch (err) {
      console.error("Error accepting transaction:", err);
    } finally {
      setLoadingTransaction(null); // Reset loading state once the action is complete
    }
  };

  // Handle Reject Transaction
  const handleReject = async (tid: number) => {
    try {
      if (!userId) {
        console.error("Unauthorized");
        return;
      }

      setLoadingTransaction(tid); // Set loading state for the specific transaction
      const response = await rejectTransaction(tid, userId); // Pass the userId from useAuth here
      if (response.success) {
        setTransactions((prev) => prev.map((tx) => (tx.tid === tid ? { ...tx, status: "rejected" } : tx)));
      }
    } catch (err) {
      console.error("Error rejecting transaction:", err);
    } finally {
      setLoadingTransaction(null); // Reset loading state once the action is complete
    }
  };


const handleReturnByAdmin = async (tid: number) => {
  try {
    if (!userId) {
      console.error("Unauthorized");
      return;
    }

    setLoadingTransaction(tid);

    // Chama a função do server
    const response = await returnTransaction(tid, userId);

    if (response.success) {
      setTransactions((prev) =>
        prev.map((tx) =>
          tx.tid === tid
            ? { ...tx, status: "RETURN", returnedDate: new Date().toISOString().split("T")[0] }
            : tx
        )
      );
    }
  } catch (err) {
    console.error("Erro ao marcar devolução:", err);
  } finally {
    setLoadingTransaction(null);
  }
};


  const sortedTransactions = [...transactions].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortOrder === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    }

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
    }

    return 0;
  });

  const SortButton = ({ field, label }: { field: SortField; label: string }) => (
    <Button variant="ghost" onClick={() => handleSort(field)} className="flex items-center gap-1">
      {label}
      {sortField === field && (sortOrder === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />)}
    </Button>
  );

  const openBookDetails = async (bookId: number) => {
  setLoadingBook(true);
  setSelectedBook(null);

  try {
    const data = await getBookDetails(bookId);
    setSelectedBook(data);
  } finally {
    setLoadingBook(false);
  }
};

  return (
    <ClerkProvider>
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Todos os pedidos</h1>
            <p className="text-sm text-gray-500 mt-1">
              Exibindo {(currentPage - 1) * pageSize + 1} para {Math.min(currentPage * pageSize, totalTransactions)} de {totalTransactions} requisições
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setSortField("tid");
              setSortOrder("desc");
            }}
          >
            Novos
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <SortButton field="tid" label="ID requisição" />
              </TableHead>
              <TableHead>
                <SortButton field="physicalBookId" label="ID do livro fisico" />
              </TableHead>
              <TableHead>
                <SortButton field="userId" label="Requisitado por" />
              </TableHead>
              
              <TableHead>
                <SortButton field="status" label="Estado" />
              </TableHead>
              <TableHead>
                <SortButton field="borrowedDate" label="Data emprestimo" />
              </TableHead>
              <TableHead>
                <SortButton field="returnedDate" label="Data devolução" />
              </TableHead>
              <TableHead>Ação</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {sortedTransactions?.map((tx) => (
              <TableRow key={tx.tid}>
                <td className="px-4 py-2">{tx.tid}</td>
<td className="px-4 py-2">
  <div className="flex flex-col gap-1">
   

    <Sheet>
      <SheetTrigger asChild>
        <Button
  variant="secondary"
  size="sm"
  onClick={() => openBookDetails(tx.physicalBookId)}
  className="py-2 text-blue-600 hover:text-blue-700 flex items-center gap-2"
>
  <span className="font-mono text-sm">
    #{tx.physicalBookId}
  </span>
  <span className="text-sm font-medium">
    Detalhes
  </span>
</Button>

      </SheetTrigger>

      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="text-center text-green-900">Detalhes do Livro</SheetTitle>
          <SheetDescription className="text-center">
            Informação completa do exemplar físico
          </SheetDescription>
        </SheetHeader>

        {loadingBook && (
          <div className="mt-6 space-y-3">
    <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
    <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
    <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse" />

    <p className="text-sm text-gray-500 flex items-center gap-2">
      <Spinner />
      A carregar informações do livro…
    </p>
  </div>
        )}

        {selectedBook && (
  <div className="ml-16 mt-6 space-y-4 text-sm">
    <div>
      <p className="text-xs text-gray-500">Título</p>
      <p className="font-bold text-green-900">{selectedBook.title}</p>
    </div>

    <div>
      <p className="text-xs text-gray-500">Autor</p>
      <p className="font-bold text-green-900">{selectedBook.author}</p>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div>
        <p className="text-xs text-gray-500">ISBN</p>
        <p className="font-bold text-green-900">{selectedBook.isbn}</p>
      </div>

      <div>
        <p className="text-xs text-gray-500">Cópias disponiveis</p>
        <span className="inline-block rounded bg-blue-50 px-2 py-1 text-blue-700 text-xs font-medium">
          {selectedBook.availableCopies}
        </span>
      </div>
    </div>
  </div>
)}
      </SheetContent>
    </Sheet>
  </div>
</td>


                <td className="px-4 py-2">{tx.user_name}</td>
                
               <td className="px-4 py-2">
  <span
    className={`inline-flex items-center rounded px-2 py-1 text-xs font-medium ${
      TRANSACTION_STATUS[tx.status]?.className ??
      "bg-gray-100 text-gray-800"
    }`}
  >
    {TRANSACTION_STATUS[tx.status]?.label ?? tx.status}
  </span>
</td>

                <td className="px-4 py-2">{tx.borrowedDate}</td>
                <td className="px-4 py-2">{tx.returnedDate}</td>
                <td className="px-4 py-2 flex gap-2">
  <td className="px-4 py-2 flex gap-2">
  {/* Botões Aceitar/Rejeitar */}
  {tx.status === "PENDING" && (
    <>
      <Button
        size="sm"
        onClick={() => handleAccept(tx.tid)}
        className="bg-green-500 hover:bg-green-600 text-white"
        disabled={loadingTransaction === tx.tid}
      >
        {loadingTransaction === tx.tid ? "Processando..." : "Aceitar"}
      </Button>

      <Button
        size="sm"
        onClick={() => handleReject(tx.tid)}
        className="bg-red-500 hover:bg-red-600 text-white"
        disabled={loadingTransaction === tx.tid}
      >
        {loadingTransaction === tx.tid ? "Processando..." : "Rejeitar"}
      </Button>
    </>
  )}

  {/* Status já processado (ACCEPTED, REJECTED, RETURN) */}
  {tx.status !== "PENDING" && (
    <span
      className={`px-2 py-1 rounded text-white ${
        tx.status === "ACCEPTED" ? "bg-green-600" :
        tx.status === "REJECTED" ? "bg-red-600" :
        "bg-blue-600" // RETURN
      }`}
    >
      {TRANSACTION_STATUS[tx.status]?.label || tx.status}
    </span>
  )}

  {/* Botão Devolução */}
  {tx.status === "ACCEPTED" && !tx.returnedDate && (
    <Button
      size="sm"
      onClick={() => handleReturnByAdmin(tx.tid)}
      className="bg-blue-600 hover:bg-blue-700 text-white"
      disabled={loadingTransaction === tx.tid}
    >
      {loadingTransaction === tx.tid ? "Processando..." : "Confirmar Devolução"}
    </Button>
  )}
</td>


</td>

              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="mt-4 flex justify-center">
          <Pagination currentPage={currentPage} totalPages={totalPages} baseUrl="/admin/all-transactions" />
        </div>
      </div>
    </ClerkProvider>
  );
}
