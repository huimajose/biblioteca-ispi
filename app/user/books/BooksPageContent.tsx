// app/admin/books/BooksPageContent.tsx
"use client";

import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ChevronUp, ChevronDown, ArrowUpDown } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { getReturnDatePlus7Days } from "@/utils/date";



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

type SortField = "id" | "title" | "author" | "isbn" | "availableCopies" | "totalCopies";
type SortOrder = "asc" | "desc";






export default function BooksPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [books, setBooks] = useState<Book[]>([]);
    const [searchQuery, setSearchQuery] = useState(searchParams?.get("search") ?? "");
    const [loading, setLoading] = useState(true);
    const [totalBooks, setTotalBooks] = useState(0);
    const [currentPage, setCurrentPage] = useState(parseInt(searchParams?.get("page") ?? "1"));
    const [sortField, setSortField] = useState<SortField>((searchParams?.get("sort") as SortField) ?? "title");
    const [sortOrder, setSortOrder] = useState<SortOrder>((searchParams?.get("order") as SortOrder) ?? "asc");
    const pageSize = 10;



    useEffect(() => {
        fetchBooks();
    }, [currentPage, sortField, sortOrder, searchQuery]);

    const fetchBooks = async () => {
        try {
            const params = new URLSearchParams({
                page: currentPage.toString(),
                pageSize: pageSize.toString(),
                sort: sortField,
                order: sortOrder,
                search: searchQuery
            });
            const response = await fetch(`/api/books?${params}`);
            const data = await response.json();
            setBooks(data.books || []);
            setTotalBooks(data.total || 0);
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
    };

    const handleSearch = (value: string) => {
        setSearchQuery(value);
        setCurrentPage(1);
        updateUrl(1, sortField, sortOrder, value);
    };

    const updateUrl = (page: number, sort: string, order: string, search: string) => {
        const params = new URLSearchParams();
        if (page > 1) params.set("page", page.toString());
        if (sort !== "title") params.set("sort", sort);
        if (order !== "asc") params.set("order", order);
        if (search) params.set("search", search);
        router.push(`/admin/books${params.toString() ? `?${params.toString()}` : ""}`);
    };

    const totalPages = Math.ceil(totalBooks / pageSize);



    


    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-green-600">Todos os livros</h1>
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            setSortField("id");
                            setSortOrder("desc");
                            setCurrentPage(1);
                            updateUrl(1, "id", "desc", searchQuery);
                        }}
                        className="flex items-center gap-2"
                    >
                        <ArrowUpDown className="h-4 w-4 text-green-600" />
                        Novos
                    </Button>
                    <div className="relative w-[500px]">
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
                                <TableHead className="cursor-pointer" onClick={() => handleSort("title")}>
                                        <div className="flex items-center ">
                                        Titulo
                                        {sortField === "title" && (
                                            sortOrder === "asc" ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                                        )}
                                    </div>
                                </TableHead>
                                <TableHead className="cursor-pointer" onClick={() => handleSort("author")}>
                                        <div className="flex items-center">
                                        Autor
                                        {sortField === "author" && (
                                            sortOrder === "asc" ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                                        )}
                                    </div>
                                </TableHead>
                                <TableHead className="cursor-pointer" onClick={() => handleSort("isbn")}>
                                        <div className="flex items-center ">
                                        ISBN
                                        {sortField === "isbn" && (
                                            sortOrder === "asc" ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                                        )}
                                    </div>
                                </TableHead>
                                <TableHead className="cursor-pointer" onClick={() => handleSort("availableCopies")}>
                                        <div className="flex items-center ">
                                        Disponível
                                        {sortField === "availableCopies" && (
                                            sortOrder === "asc" ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                                        )}
                                    </div>
                                </TableHead>
                                <TableHead className="cursor-pointer" onClick={() => handleSort("totalCopies")}>
                                        <div className="flex items-center ">
                                        Total
                                        {sortField === "totalCopies" && (
                                            sortOrder === "asc" ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                                        )}
                                    </div>
                                </TableHead>
                                    <TableHead >Ação</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {books.map((book) => (
                                <TableRow key={book.id}>
                                    <TableCell className="font-medium">{book.title}</TableCell>
                                    <TableCell className="">{book.author}</TableCell>
                                    <TableCell className="">{book.isbn}</TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs ${book.availableCopies > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                            }`}>
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
                                                const userId = 1; // <-- Substituir pelo ID real do usuário logado
                                                const res = await fetch(`/api/books/${book.id}/rent`, {
                                                    method: "POST",
                                                    headers: { "Content-Type": "application/json" },
                                                    body: JSON.stringify({ userId }),
                                                });

                                                if (res.ok) {
                                                    alert("Livro alugado com sucesso!");
                                                    fetchBooks(); // Atualiza a lista
                                                } else {
                                                    const data = await res.json();
                                                    alert(data.error || "Erro ao alugar o livro.");
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
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 p-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setCurrentPage(prev => Math.max(1, prev - 1));
                                    updateUrl(currentPage - 1, sortField, sortOrder, searchQuery);
                                }}
                                disabled={currentPage === 1}
                            >
                                Voltar
                            </Button>
                            <span className="text-sm">
                                Página {currentPage} de {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setCurrentPage(prev => Math.min(totalPages, prev + 1));
                                    updateUrl(currentPage + 1, sortField, sortOrder, searchQuery);
                                }}
                                disabled={currentPage === totalPages}
                            >
                                Seguinte
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}