"use client";

import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown } from "lucide-react";
import { useState } from "react";
import { acceptTransaction, rejectTransaction } from "@/app/admin/book-requests/server"; // Import functions directly from server.tsx
import { ClerkProvider, useAuth } from "@clerk/nextjs"; // Use hook here

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
    try {
      if (!userId) {
        console.error("Unauthorized");
        return;
      }

      setLoadingTransaction(tid); // Set loading state for the specific transaction
      const response = await acceptTransaction(tid, userId); // Pass the userId from useAuth here
      if (response.success) {
        setTransactions((prev) => prev.map((tx) => (tx.tid === tid ? { ...tx, status: "accepted" } : tx)));
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
                <SortButton field="userId" label="User ID" />
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
                <td className="px-4 py-2">{tx.bookTitle ?? `Livro #${tx.physicalBookId}`}</td>
                <td className="px-4 py-2">{tx.userId}</td>
                
                <td className="px-4 py-2 capitalize">{tx.status}</td>
                <td className="px-4 py-2">{tx.borrowedDate}</td>
                <td className="px-4 py-2">{tx.returnedDate}</td>
                <td className="px-4 py-2 flex gap-2">

                  {/* Show Reject button only if status is not accepted or rejected */}
                  {tx.status !== "accepted" && tx.status !== "rejected" && (
                    <Button size="sm" onClick={() => handleReject(tx.tid)} className="bg-red-500 hover:bg-red-600 text-white" disabled={loadingTransaction === tx.tid}>
                      {loadingTransaction === tx.tid ? "Processando..." : "Rejeitar"}
                    </Button>
                  )}
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
