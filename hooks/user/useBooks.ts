"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Book, SortField, SortOrder } from "@/types/books";

export function useBooks(pageSize = 10) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalBooks, setTotalBooks] = useState(0);

  // 🔹 Normaliza params da URL
  const page = Number(searchParams.get("page") ?? 1);

  const sortParam = searchParams.get("sort") as SortField | null;
  const sort: SortField = ["title","author","isbn","id","availableCopies","totalCopies"].includes(sortParam ?? "")
    ? (sortParam as SortField)
    : "title";

  const orderParam = searchParams.get("order");
  const order: SortOrder = orderParam === "desc" ? "desc" : "asc";

  const search = searchParams.get("search") ?? "";
  const category = searchParams.get("category");

  useEffect(() => {
    fetchBooks();
  }, [searchParams]);

  async function fetchBooks() {
    setLoading(true);

    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
      sort,
      order,
      search,
    });

    if (category) params.set("category", category);

    const res = await fetch(`/api/books?${params}`);
    const data = await res.json();

    setBooks(data.books || []);
    setTotalBooks(data.totalBooks || 0);
    setLoading(false);
  }

  function updateParams(next: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams);

    Object.entries(next).forEach(([key, value]) =>
      value === null ? params.delete(key) : params.set(key, value)
    );

    router.push(`/user/books?${params.toString()}`);
  }

  function handleSort(field: SortField) {
    const isSame = field === sort;

    updateParams({
      sort: field,
      order: isSame && order === "asc" ? "desc" : "asc",
      page: "1",
    });
  }

  return {
    books,
    loading,
    totalBooks,
    page,
    search,
    sort,
    order,
    category,
    updateParams,
    handleSort,
    refetch: fetchBooks,
  };
}
