"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronUp, ChevronDown } from "lucide-react";
import { BookActions } from "./BookActions";
import type { Book, SortField } from "@/types/books";

interface BooksTableProps {
  books: Book[];
  sort: SortField;
  order: "asc" | "desc";
  onSort: (field: SortField) => void;
}

export function BooksTable({ books, sort, order, onSort }: BooksTableProps) {
  const headers: { label: string; field: SortField }[] = [
    { label: "Título", field: "title" },
    { label: "Autor", field: "author" },
    { label: "ISBN", field: "isbn" },
    { label: "Disponível", field: "availableCopies" },
    { label: "Total", field: "totalCopies" },
  ];

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {headers.map(({ label, field }) => (
            <TableHead
              key={field}
              className="cursor-pointer select-none"
              onClick={() => onSort(field)}
            >
              <div className="flex items-center gap-1">
                {label}
                {sort === field &&
                  (order === "asc" ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  ))}
              </div>
            </TableHead>
          ))}
          <TableHead>Ação</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {books.map((book) => (
          <TableRow key={book.id}>
            <TableCell className="font-medium">{book.title}</TableCell>
            <TableCell>{book.author}</TableCell>
            <TableCell>{book.isbn}</TableCell>
            <TableCell>
              <span
                className={`px-2 py-1 rounded-full text-xs ${
                  book.availableCopies > 0
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {book.availableCopies}
              </span>
            </TableCell>
            <TableCell>{book.totalCopies}</TableCell>
            <TableCell>
              <BookActions book={book} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
