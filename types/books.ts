// Tipos partilhados para livros
export type SortField = "title" | "author" | "isbn" | "id" | "availableCopies" | "totalCopies";
export type SortOrder = "asc" | "desc";

export interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  is_digital: boolean;
  availableCopies: number;
  totalCopies: number;
}
