import { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { fetchUserTransactions } from "./server";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TRANSACTION_STATUS } from "@/constants/transactionStatus";

export const metadata: Metadata = {
  title: "Minhas requisições | gestão biblioteca",
  description: "Ver as suas requisições",
};

export default async function TransactionsPage() {
  const session = await auth();
  const userId = session.userId;
  if (!userId) {
    return <div>Não autorizado</div>;
  }

  const transactions = await fetchUserTransactions();
  const pageSize = 10;
  const paginatedTransactions = transactions.slice(0, pageSize);



  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-green-600">Minhas requisições</h1>
        <p className="text-sm text-gray-500 mt-1">
          Mostrando {paginatedTransactions.length} de {transactions.length} requisições
        </p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Titulo</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Data emprestimo</TableHead>
              <TableHead>Data devolução</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTransactions.map((tx) => (
              <TableRow key={tx.tid}>
                <TableCell>{tx.tid}</TableCell>
                <TableCell>{tx.bookTitle}</TableCell>
                <TableCell>{TRANSACTION_STATUS[tx.status]?.label ?? tx.status}</TableCell>
                <TableCell>{tx.borrowedDate}</TableCell>
                <TableCell>{tx.returnedDate || "Não devolvido"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 