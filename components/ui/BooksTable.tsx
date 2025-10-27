"use client";

import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import { BookTableRow } from "@/components/ui/BookTableRow";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import ImageUpload from "@/components/ui/BookUpload";
import { Pagination } from "@/components/ui/pagination";
import { BookCover } from "@/components/ui/BookCover";
import { useState, useEffect } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown, Plus, Trash2, Copy, Save } from "lucide-react";
import { removePhysicalBook, addPhysicalBook } from "@/app/admin/allbooks/actions";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IKImage, IKUpload, ImageKitProvider } from "imagekitio-next";
import { useToast } from "@/components/ui/ToastContext";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch";
import UploadBookFile from "@/components/ui/UploadBookFile";
import { useMemo } from "react";
import { FileCard } from "@files-ui/react";


interface Book {
  id: number;
  title: string;
  author: string;
  genre: string;
  totalCopies: number;
  availableCopies: number;
  cover: string;
  isbn: string;
  fileUrl?: string; // Optional for digital books
  document_type?: number; // Added to support book type (e.g., livro, monografia, etc.)
  is_digital?: boolean; // Added to indicate if the book is digital
}

interface PhysicalBook {
  pid: number;
  bookId: number;
  borrowed: boolean;
  returnDate: null | string;
  userId: string;
  currTransactionId: number;
}

interface BooksTableProps {
  initialBooks: Book[];
  totalPages: number;
  totalBooks: number;
  currentPage: number;
}

const urlEndpoint = process.env.NEXT_PUBLIC_URL_ENDPOINT;
const publicKey = process.env.NEXT_PUBLIC_PUBLIC_KEY;
const supabaseUrl = "https://ouhdotednocmpjcktfsh.supabase.co/storage/v1/object/public/books";

const authenticator = async () => {
  const res = await fetch("/api/auth");
  const data = await res.json();
  return {
    signature: data.signature,
    expire: data.expire,
    token: data.token,
  };
};



const BooksTable = ({ initialBooks, totalPages, totalBooks, currentPage }: BooksTableProps) => {
  const router = useRouter();
  const { showToast } = useToast();
  const books = initialBooks;
  const [sortField, setSortField] = useState<keyof Book>("id");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [physicalBooks, setPhysicalBooks] = useState<PhysicalBook[]>([]);
  const [selectedPid, setSelectedPid] = useState<number | null>(null);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [isDigital, setIsDigital] = useState(false);



  const handleToggle = (checked: boolean) => {
    setIsDigital(checked);
  };


  console.log(isDigital, "isDigital state");


  const handleSort = (field: keyof Book) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedBooks = useMemo(() => {
    return [...books].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });
  }, [books, sortField, sortDirection]);

  const handleUpdate = async (book: Book) => {
    setSelectedBook(book);
    setIsDigital(!!book.is_digital); // garante booleano (caso venha como null/undefined)
    setIsUpdateDialogOpen(true);
  };

  const fetchPhysicalBooks = async (bookId: number) => {
    try {
      const response = await fetch(`/api/books/${bookId}/physical`);
      if (!response.ok) throw new Error('Failed to fetch physical books');
      const data = await response.json();
      setPhysicalBooks(data);
    } catch (error) {
      console.error('Error fetching physical books:', error);
      showToast('Failed to fetch physical books', 'error');
    }
  };

  const handleDeletePhysicalBook = async (bookId: number) => {
    if (!selectedBook) return;
    
    // Fetch physical books when opening the dialog
    await fetchPhysicalBooks(bookId);
    setIsRemoveDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedBook || !selectedPid) {
      showToast('Por favor selecione uma cópia para remover', 'error');
      return;
    }

    const result = await removePhysicalBook(selectedBook.id, selectedBook.totalCopies, selectedBook.availableCopies, selectedPid);
    
    if (result.success && result.totalCopies !== undefined && result.availableCopies !== undefined) {
      const updatedBook: Book = { 
        ...selectedBook, 
        totalCopies: result.totalCopies, 
        availableCopies: result.availableCopies 
      };
      // setBooks(books.map(book => book.id === selectedBook.id ? updatedBook : book));
      setIsRemoveDialogOpen(false);
      setSelectedPid(null);
      showToast("Livro fisico removido com sucesso", "success");
    } else {
      showToast(result.error || "Ocorreu um erro ao remover o livro", "error");
    }
  };

  const handleAddPhysicalBook = async (bookId: number) => {
    if (!selectedBook) return;

    try {
      const result = await addPhysicalBook(bookId, selectedBook.totalCopies, selectedBook.availableCopies);
      
      if (result.success && result.physicalBookId) {
        const updatedBook: Book = { 
          ...selectedBook, 
          totalCopies: result.totalCopies!, 
          availableCopies: result.availableCopies! 
        };
        // setBooks(books.map(book => book.id === bookId ? updatedBook : book));
        setIsUpdateDialogOpen(false);
        showToast(`Novo livro fisio copiado com sucesso, ID: ${result.physicalBookId}`, "success", 6000);
      } else {
        throw new Error(result.error || "Ocorreu um erro ao adicionar o livro fisico");
      }
    } catch (error) {
      console.error("Ocorreu um erro ao adicionar o livro:", error);
      showToast(error instanceof Error ? error.message : "Ocorreu um erro ao adicionar o livro", "error");
    }
  };

  const handleUpdateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBook) return;

    try {
      const response = await fetch(`/api/books/${selectedBook.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: selectedBook.title,
          author: selectedBook.author,
          genre: selectedBook.genre,
          isbn: selectedBook.isbn,
          totalCopies: selectedBook.totalCopies,
          availableCopies: selectedBook.availableCopies,
          cover: selectedBook.cover,
          fileUrl: selectedBook.fileUrl || "",
          document_type: selectedBook.document_type || 1, // Default to 1 if not set
          is_digital: isDigital, // Pass the isDigital state
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ocorreu um erro ao actualizar o livro');
      }

      // setBooks(books.map(book => 
      //   book.id === selectedBook.id ? selectedBook : book
      // ));
      
      setIsUpdateDialogOpen(false);
      showToast("Livro actualizado com sucesso", "success");
    } catch (error) {
      console.error('Erro ao actualizar:', error);
      showToast(error instanceof Error ? error.message : "Ocorreu um erro ao actualizar o livro", "error");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedBook) return;

    const { name, value } = e.target;
    setSelectedBook({
      ...selectedBook,
      [name]: name === 'totalCopies' || name === 'availableCopies' 
        ? parseInt(value) 
        : value
    });
  };

  const handleImageSuccess = async (res: { filePath: string }) => {
    if (!selectedBook) return;

    const updatedCover = res.filePath;

    try {
      // Atualiza o estado local
      setSelectedBook({
        ...selectedBook,
        cover: updatedCover
      });

      // Envia para a API para salvar no banco
      const response = await fetch(`/api/books/${selectedBook.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...selectedBook,
          cover: updatedCover
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Falha ao atualizar a capa");
      }

      showToast("Capa actualizada com sucesso!", "success");
    } catch (err) {
      console.error("Erro ao actualizar a capa:", err);
      showToast("Erro ao actualizar a capa. Tente novamente.", "error");
    }
  };


  const handleImageError = (err: any) => {
    console.error("Erro ao realizar o upload:", err);
    showToast("Não foi possivel enviar a imagem. Por favor tente mais.", "error");
  };


  const fileDownloadUrl = selectedBook?.fileUrl
    ? `${supabaseUrl}/${selectedBook.id}/${selectedBook.fileUrl}`
    : "";

  const sampleFile = {
    size: 28 * 1024 * 1024,
    type: "application/pdf",
    name: selectedBook?.title,
    imageUrl: selectedBook?.cover,
    downloadUrl: fileDownloadUrl
  };

  return (
    <div className="w-full mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-green-600">Livros</h2>
        <div className="flex gap-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-green-600">
              <Plus className="mr-2 h-4 w-4 " />
              Add Livro
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add novo livro</DialogTitle>
            </DialogHeader>
            <ImageUpload />
          </DialogContent>
        </Dialog>
          <Button variant="outline" onClick={() => { setSortField("id"); setSortDirection("desc"); }}>
            Novos
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Capa</TableHead>
            <TableHead>
              <Button variant="ghost" onClick={() => handleSort("title")}>
                Titulo
                {sortField === "title" && (
                  sortDirection === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                )}
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" onClick={() => handleSort("author")}>
                Autor
                {sortField === "author" && (
                  sortDirection === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                )}
              </Button>
            </TableHead>
            
            <TableHead>
              <Button variant="ghost" onClick={() => handleSort("totalCopies")}>
                Total Cópias
                {sortField === "totalCopies" && (
                  sortDirection === "asc" ? <ArrowUp className="ml-2 h-4" /> : <ArrowDown className="ml-2 h-4" />
                )}
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" onClick={() => handleSort("availableCopies")}>
                Cópias Disponíveis
                {sortField === "availableCopies" && (
                  sortDirection === "asc" ? <ArrowUp className="ml-2 h-4" /> : <ArrowDown className="ml-2 h-4" />
                )}
              </Button>
            </TableHead>
            <TableHead>Ação</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedBooks.map((book) => (
            <TableRow 
              key={book.id}
              className="cursor-pointer hover:bg-gray-100"
              onClick={() => router.push(`/book/${book.id}`)}
            >
              <TableCell>
                <BookCover cover={book.cover} title={book.title} />
              </TableCell>
              <TableCell>{book.title.length > 30 ? book.title.slice(0, 30) + "..." : book.title}</TableCell>
              <TableCell>{book.author}</TableCell>
            
              <TableCell>{book.totalCopies}</TableCell>
              <TableCell>{book.availableCopies}</TableCell>
              <TableCell>
                <Button variant="outline" onClick={(e) => {
                  e.stopPropagation();
                  handleUpdate(book);
                }}>
                  Editar
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar livro: {selectedBook?.title}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateBook} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titulo</Label>
                <Input
                  id="title"
                  name="title"
                  value={selectedBook?.title || 0}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="author">Autor</Label>
                <Input
                  id="author"
                  name="author"
                  value={selectedBook?.author || 0}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="genre">Genero</Label>
                <Input
                  id="genre"
                  name="genre"
                  value={selectedBook?.genre || 0}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="isbn">ISBN</Label>
                <Input
                  id="isbn"
                  name="isbn"
                  value={selectedBook?.isbn || 0}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
               
                <div className="space-y-2">
                  <Label htmlFor="documentType">Tipo</Label>
                  <select
                    id="documentType"
                    name="documentType"
                    value={selectedBook?.document_type || ""}
                    onChange={(e) => {
                      if (selectedBook) {
                        setSelectedBook({
                          ...selectedBook,
                          document_type: parseInt(e.target.value),
                        });
                      }
                    }}
                    className="w-full rounded-md border border-gray-300 p-2"
                    required
                  >
                    <option value="" disabled>
                      Selecione o tipo
                    </option>
                    <option value="1">Livro</option>
                    <option value="2">Monografia</option>
                    <option value="3">Artigo Científico</option>
                  </select>
                </div>


              </div>

              {!isDigital &&
              <div className="space-y-2">
                <Label htmlFor="totalCopies">Total Cópias</Label>
                <Input
                  id="totalCopies"
                  name="totalCopies"
                  type="number"
                  min="0"
                  value={selectedBook?.totalCopies || 0}
                  onChange={handleInputChange}
                  required
                />
              </div>

}

              {!isDigital &&
              <div className="space-y-2">
                <Label htmlFor="availableCopies">Cópias disponíveis</Label>
                <Input
                  id="availableCopies"
                  name="availableCopies"
                  type="number"
                  min="0"
                  max={selectedBook?.totalCopies || 0}
                  value={selectedBook?.availableCopies || 0}
                  onChange={handleInputChange}
                  required
                />
              </div>
}

              <div className="col-span-2 space-y-2">
                <Label>Capa do livro</Label>
                <div className="flex items-start space-x-4">
                  <div className="w-32">
                    <ImageKitProvider publicKey={publicKey} urlEndpoint={urlEndpoint}>
                      <IKImage
                        path={selectedBook?.cover || ""}
                        alt={selectedBook?.title || 'Capa do livro'}
                        className="rounded-lg"
                        width={200}
                        height={300}
                      />
                    </ImageKitProvider>
                  </div>
                  <div className="flex-1">
                    <div className="p-4 border-2 border-dashed rounded-lg">
                      <ImageKitProvider publicKey={publicKey} urlEndpoint={urlEndpoint} authenticator={authenticator}>
                        <p className="text-sm text-gray-500 mb-2">Enviar nova capa</p>
                        <IKUpload
                          fileName="book-cover.jpg"
                          onSuccess={handleImageSuccess}
                          onError={handleImageError}
                          className="w-full"
                        />
                      </ImageKitProvider>
                    </div>

                    {isDigital &&
                      <>
                        <UploadBookFile
                          bookId={selectedBook.id}
                          onUploadComplete={(url) => {
                            setSelectedBook({ ...selectedBook, fileUrl: url });
                            showToast("PDF enviado e URL salva com sucesso!", "success");
                          }}
                        />

                        <div className="mt-2 p-2 border rounded bg-gray-50">
                          <p className="text-sm text-gray-700">Arquivo existente:</p>
                         
                        <FileCard id={selectedBook.id} {...sampleFile} info />
                        </div>
                      </>
                    }

                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={isDigital}
                  onCheckedChange={handleToggle}
                  id="airplane-mode"
                />

                <Label htmlFor="airplane-mode">Livro Digital?</Label>
              </div>
              
            </div>

            <div className="flex justify-between items-center pt-4">
              <div className="flex space-x-2">
               
                <Button variant="outline" onClick={() => handleAddPhysicalBook(selectedBook!.id)}>
                  <Copy className="mr-2 h-4 w-4" />
                  Add Fisico
                </Button>
                <Button variant="destructive" onClick={() => handleDeletePhysicalBook(selectedBook!.id)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remover Fisico
                </Button>
              </div>
              <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
                Guardar Alterações
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remover cópia fisica</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Selecione para remover</Label>
              <Select onValueChange={(value: string) => setSelectedPid(Number(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a cópia" />
                </SelectTrigger>
                <SelectContent>
                  {physicalBooks.map((book) => (
                    <SelectItem 
                      key={book.pid} 
                      value={book.pid.toString()}
                      disabled={book.borrowed}
                    >
                      ID: {book.pid} {book.borrowed ? '(Ocupado)' : 0}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsRemoveDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleConfirmDelete}
                disabled={!selectedPid}
              >
                Remover
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Pagination totalPages={totalPages} currentPage={currentPage} baseUrl="/admin/allbooks" className="flex justify-center mt-4" />
    </div>
  );
};

export default BooksTable;