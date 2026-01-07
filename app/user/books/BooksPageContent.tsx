/* eslint-disable react-hooks/exhaustive-deps */
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
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { truncateText } from "@/lib/utils";

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
  is_digital: boolean;
}

// Extensão do Book para controlar loading individual
interface BookWithLoading extends Book {
  loadingDigital?: boolean;
  loadingPhysical?: boolean;
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

  const [books, setBooks] = useState<BookWithLoading[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalBooks, setTotalBooks] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>("title");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);

  const pageSize = 10;
  const totalPages = Math.ceil(totalBooks / pageSize);

  // 🔁 Atualiza estado e busca livros sempre que a URL muda
  useEffect(() => {
    const pageParam = parseInt(searchParams.get("page") ?? "1");
    const sortParam = (searchParams.get("sort") as SortField) ?? "title";
    const orderParam = (searchParams.get("order") as SortOrder) ?? "asc";
    const searchParam = searchParams.get("search") ?? "";
    const categoryParam = searchParams.get("category") ?? null;

    setCurrentPage(pageParam);
    setSortField(sortParam);
    setSortOrder(orderParam);
    setSearchQuery(searchParam);
    setCategory(categoryParam);

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
      if (categoryParam) params.set("category", categoryParam);

      const res = await fetch(`/api/books?${params}`);
      const data = await res.json();
      setBooks(data.books || []);
      setTotalBooks(data.totalBooks || 0);
    } catch (err) {
      console.error("Erro ao buscar livros:", err);
      showToast("Erro ao buscar livros", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    const newOrder =
      field === sortField && sortOrder === "asc" ? "desc" : "asc";

    const params = new URLSearchParams(searchParams);
    params.set("sort", field);
    params.set("order", newOrder);
    params.set("page", "1"); // volta para página 1
    router.push(`/user/books?${params.toString()}`);
  };

  const handleSearch = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set("search", value);
    else params.delete("search");
    params.set("page", "1");
    router.push(`/user/books?${params.toString()}`);
  };

  const handleCategory = (catId: string | null) => {
    const params = new URLSearchParams(searchParams);
    if (catId) params.set("category", catId);
    else params.delete("category");
    params.set("page", "1");
    router.push(`/user/books?${params.toString()}`);
  };

  /*
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    router.push(`/user/books?${params.toString()}`);
  };
  */

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-green-600">
          {getCategoryName(category)}
        </h1>

        <div className="flex items-center gap-4 flex-wrap">
          {["Todos", "Livros", "Monografias", "Artigos Ciêntíficos"].map(
            (name, idx) => {
              const catId = idx === 0 ? null : idx.toString();
              const isActive = category === catId;
              return (
                <Button
                  key={name}
                  size="sm"
                  variant="outline"
                  className={clsx(
                    "transition-colors",
                    isActive
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-white text-gray-700 hover:bg-gray-100 border"
                  )}
                  onClick={() => handleCategory(catId)}
                >
                  {name}
                </Button>
              );
            }
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const params = new URLSearchParams(searchParams);
              params.set("sort", "id");
              params.set("order", "desc");
              params.set("page", "1");
              router.push(`/user/books?${params.toString()}`);
            }}
            className="flex items-center gap-2"
          >
            <ArrowUpDown className="h-4 w-4 text-green-600" />
            Novos
          </Button>

          <div className="relative w-[300px] sm:w-[600px]">
            <Input
              type="text"
              placeholder="Procurar livros, monografias, artigos , autores, ISBN...."
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
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {["title", "author", "isbn", "availableCopies", "totalCopies"].map(
                  (field) => (
                    <TableHead
                      key={field}
                      className="cursor-pointer"
                      onClick={() => handleSort(field as SortField)}
                    >
                      <div className="flex items-center">
                        {field === "title"
                          ? "Título"
                          : field === "author"
                          ? "Autor"
                          : field === "isbn"
                          ? "ISBN"
                          : field === "availableCopies"
                          ? "Disponível"
                          : "Total"}
                        {sortField === field && (
                          sortOrder === "asc" ? (
                            <ChevronUp className="ml-1 h-4 w-4" />
                          ) : (
                            <ChevronDown className="ml-1 h-4 w-4" />
                          )
                        )}
                      </div>
                    </TableHead>
                  )
                )}
                <TableHead>Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {books.map((book) => (
                <TableRow key={book.id}>
                  <TableCell>{truncateText(book.title)}</TableCell>
                  <TableCell>{truncateText(book.author)}</TableCell>
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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="outline">
                          Ação
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        {book.is_digital && (
                          <DropdownMenuItem
                            disabled={book.loadingDigital}
                            onClick={async () => {
                              setBooks(prev =>
                                prev.map(b =>
                                  b.id === book.id ? { ...b, loadingDigital: true } : b
                                )
                              );
                              try {
                                const res = await fetch(
                                  `/api/books/${book.id}/add-to-shelf`,
                                  { method: "POST" }
                                );
                                const data = await res.json();
                                showToast(data.message, data.success ? "success" : "error");
                              } catch {
                                showToast("Erro ao adicionar à estante", "error");
                              } finally {
                                setBooks(prev =>
                                  prev.map(b =>
                                    b.id === book.id ? { ...b, loadingDigital: false } : b
                                  )
                                );
                              }
                            }}
                          >
                            {book.loadingDigital ? "Processando..." : "📘 Adicionar à estante (Digital)"}
                          </DropdownMenuItem>
                        )}

                        {book.availableCopies > 0 ? (
                          <DropdownMenuItem
                            disabled={book.loadingPhysical}
                            onClick={async () => {
                              setBooks(prev =>
                                prev.map(b =>
                                  b.id === book.id ? { ...b, loadingPhysical: true } : b
                                )
                              );
                              try {
                                const res = await fetch(`/api/books/${book.id}/rent`, { method: "POST" });
                                const data = await res.json();
                                if (res.ok) {
                                  showToast("Empréstimo solicitado!", "success");
                                  setBooks(prev =>
                                    prev.map(b =>
                                      b.id === book.id
                                        ? { ...b, availableCopies: b.availableCopies - 1 }
                                        : b
                                    )
                                  );
                                } else {
                                  showToast(data.error || "Erro ao solicitar empréstimo.", "error");
                                }
                              } catch {
                                showToast("Erro ao solicitar empréstimo.", "error");
                              } finally {
                                setBooks(prev =>
                                  prev.map(b =>
                                    b.id === book.id ? { ...b, loadingPhysical: false } : b
                                  )
                                );
                              }
                            }}
                          >
                            {book.loadingPhysical ? "Processando..." : "📕 Solicitar empréstimo (Físico)"}
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem disabled>🚫 Físico indisponível</DropdownMenuItem>
                        )}

                        {!book.is_digital && book.availableCopies === 0 && !book.loadingPhysical && (
                          <DropdownMenuItem disabled>🚫 Digital Indisponível</DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="flex justify-center py-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
