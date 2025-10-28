"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ChevronUp, ChevronDown, ArrowUpDown } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Pagination from "@/components/ui/pagination";
import { getCategoryName } from "@/utils/categoryMapper";
import clsx from "clsx";

import { useToast } from "@/components/ui/ToastContext";

interface Book {
  id: number;
  title: string;
  author: string;
  genre: string;
  totalCopies: number;
  availableCopies: number;
  cover: string;
  isbn: string;
  fileUrl: string;
}

type SortField =
  | "id"
  | "title"
  | "author"
  | "isbn"
  | "availableCopies"
  | "totalCopies";
type SortOrder = "asc" | "desc";

export default function BooksPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalBooks, setTotalBooks] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>("title");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);


  const pageSize = 10;

  // 🔁 Atualiza estado e busca livros sempre que a URL muda
  useEffect(() => {
    const pageParam = parseInt(searchParams.get("page") ?? "1");
    const sortParam = (searchParams.get("sort") as SortField) ?? "title";
    const orderParam = (searchParams.get("order") as SortOrder) ?? "asc";
    const searchParam = searchParams.get("search") ?? "";
    const categoryParam = searchParams.get("category");

    setCurrentPage(pageParam);
    setSortField(sortParam);
    setSortOrder(orderParam);
    setSearchQuery(searchParam);
    setCategory(categoryParam)

    fetchBooks(pageParam, sortParam, orderParam, searchParam, categoryParam);
  }, [searchParams]);

  const fetchBooks = async (
    page = currentPage,
    sort = sortField,
    order = sortOrder,
    search = searchQuery,
    categoryParam: string | null = category
  ) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        sort,
        order,
        search,
      });

            // Se existir uma category somente se existir
      if(categoryParam){
        params.set("category", categoryParam);
      }

      const response = await fetch(`/api/books?${params}`);
      const data = await response.json();
      setBooks(data.books || []);
      setTotalBooks(data.totalBooks || 0);
    } catch (error) {
      console.error("Error fetching books:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }

    // Atualiza URL
    const params = new URLSearchParams(searchParams);
    params.set("sort", field);
    params.set("order", field === sortField && sortOrder === "asc" ? "desc" : "asc");
    router.push(`/user/books?${params.toString()}`);
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    const params = new URLSearchParams(searchParams);
    if (value) params.set("search", value);
    else params.delete("search");
    params.set("page", "1"); // sempre volta para a página 1
    router.push(`/user/books?${params.toString()}`);
  };

  const totalPages = Math.ceil(totalBooks / pageSize);


  

  return (
    
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-green-600">
          {getCategoryName(category)}
          </h1>
          <div className="flex items-center gap-4">
          {/* Botões de categorias */}
          <div className="flex gap-2">
            <Button
  variant="outline"
  size="sm"
  className={clsx(
    "transition-colors",
    category === null
      ? "bg-green-600 text-white hover:bg-green-700"
      : "bg-white text-gray-700 hover:bg-gray-100 border"
  )}
  onClick={() => router.push("/user/books")}
>
  Todos
</Button>
            <Button
              variant="outline"
              size="sm"
              className={clsx(
              "transition-colors",
              category === "1"
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-white text-gray-700 hover:bg-gray-100 border"
            )}
              onClick={() => router.push("/user/books?category=1")}
            >
              Livros
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={clsx(
              "transition-colors",
              category === "2"
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-white text-gray-700 hover:bg-gray-100 border"
            )}
              onClick={() => router.push("/user/books?category=2")}
            >
              Monografias
            </Button>
             <Button
              variant="outline"
              size="sm"
              className={clsx(
              "transition-colors",
              category === "3"
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-white text-gray-700 hover:bg-gray-100 border"
            )}
              onClick={() => router.push("/user/books?category=3")}
            >
              Projetos
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={clsx(
              "transition-colors",
              category === "4"
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-white text-gray-700 hover:bg-gray-100 border"
            )}
              onClick={() => router.push("/user/books?category=4")}
            >
              Artigos Ciêntíficos
            </Button>
          </div>
            </div>
          
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const params = new URLSearchParams(searchParams);
              params.set("sort", "id");
              params.set("order", "desc");
              params.set("page", "1");
              router.push(`/admin/books?${params.toString()}`);
            }}
            className="flex items-center gap-2"
          >
            <ArrowUpDown className="h-4 w-4 text-green-600" />
            Novos
          </Button>
          <div className="relative w-[600px]">
            <Input
              type="text"
              placeholder="Procurar livros..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-green-600">Carregando livros...</div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          <Table>
            <TableHeader>
              <TableRow>
                {["title", "author", "isbn", "availableCopies", "totalCopies"].map((field) => (
                  <TableHead
                    key={field}
                    className="cursor-pointer"
                    onClick={() => handleSort(field as SortField)}
                  >
                    <div className="flex items-center">
                      {field === "title" ? "Título" :
                       field === "author" ? "Autor" :
                       field === "isbn" ? "ISBN" :
                       field === "availableCopies" ? "Disponível" : "Total"}
                      {sortField === field && (
                        sortOrder === "asc" ? (
                          <ChevronUp className="ml-1 h-4 w-4" />
                        ) : (
                          <ChevronDown className="ml-1 h-4 w-4" />
                        )
                      )}
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
                  <Button
                variant="outline"
                size="sm"
                disabled={book.availableCopies === 0}
                onClick={async () => {
                  const userId = 1;
                  const res = await fetch(`/api/books/${book.id}/rent`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId }),
                  });

                  const data = await res.json();

                  if (res.ok) {
                    showToast("Livro alugado com sucesso!", "success");
                    fetchBooks();
                  } else {
                    showToast(data.error || "Erro ao alugar o livro.", "error");
                  }
                }}
              >
                {book.availableCopies > 0 ? "Ler" : "Indisponível"}
              </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* 📄 Paginação */}
          {totalPages > 1 && (
            <div className="flex justify-center py-4">
              <Pagination currentPage={currentPage} totalPages={totalPages} />
            </div>
          )}
        </div>
      )}
    </div>

  );
}
