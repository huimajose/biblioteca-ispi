"use client";

import { useEffect, useState } from "react";
import { Spinner } from "../ui/spinner";

interface Book {
  id: number;
  title: string;
  author: string;
}

interface SuggestedBooksProps {
  userId: string;
}

export default function SuggestedBooks({ userId }: SuggestedBooksProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchBooks = async () => {
      try {
        const res = await fetch(`/api/recommendations/${userId}`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data: Book[] = await res.json();
        setBooks(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Erro ao buscar livros");
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [userId]);

if (loading)
  return (
    <div className="bg-white rounded-lg shadow p-6 mt-6 flex flex-col items-center justify-center">
      <Spinner className="w-8 h-8 mb-4" />
      <h2 className="text-xl font-semibold text-green-600">
        Carregando sugestões...
      </h2>
    </div>
  );

if (!books.length)
  return (
    <div className="bg-white rounded-lg shadow p-6 mt-6 flex flex-col items-center justify-center">
      <h2 className="text-xl font-semibold text-green-600">
        Nenhuma sugestão disponível no momento.
      </h2>
    </div>
  );


  return (
    <div className="bg-white rounded-lg shadow p-6 mt-6">
      <h2 className="text-xl font-semibold mb-4 text-green-600">Sugestões de livros</h2>
      <ul className="space-y-2">
        {books.map(book => (
          <li key={book.id} className="p-2 border rounded hover:bg-green-50 transition">
            <strong>{book.title}</strong> — {book.author}
          </li>
        ))}
      </ul>
    </div>
  );
}
