"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/ToastContext";

interface Book {
  id: number;
  is_digital: boolean;
  availableCopies: number;
}

interface BookActionsProps {
  book: Book;
}

export function BookActions({ book }: BookActionsProps) {
  const { showToast } = useToast();

  async function addToShelf() {
    const res = await fetch(`/api/books/${book.id}/add-to-shelf`, {
      method: "POST",
    });
    const data = await res.json();
    showToast(data.message, data.success ? "success" : "error");
  }

  async function requestLoan() {
    const res = await fetch(`/api/books/${book.id}/rent`, {
      method: "POST",
    });
    const data = await res.json();

    if (res.ok) {
      showToast("Empréstimo solicitado com sucesso!", "success");
    } else {
      showToast(data.error || "Erro ao solicitar empréstimo.", "error");
    }
  }

  const hasDigital = book.is_digital;
  const hasPhysical = book.availableCopies > 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="outline">
          Ação
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        {/* 📘 DIGITAL */}
        {hasDigital && (
          <DropdownMenuItem onClick={addToShelf}>
            📘 Adicionar à estante (Digital)
          </DropdownMenuItem>
        )}

        {/* 📕 FÍSICO */}
        {hasPhysical && (
          <DropdownMenuItem onClick={requestLoan}>
            📕 Solicitar empréstimo (Físico)
          </DropdownMenuItem>
        )}

        {/* 🚫 FÍSICO INDISPONÍVEL */}
        {!hasPhysical && !hasDigital && (
          <DropdownMenuItem disabled>
            Indisponível
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
