import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";


export function BooksHeader({ search, onSearch, onSortNew }) {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold text-green-600">Livros</h1>

      <div className="flex gap-4">
        <Button onClick={onSortNew}>Novos</Button>

        <Input
          placeholder="Procurar livros..."
          value={search}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
    </div>
  );
}
