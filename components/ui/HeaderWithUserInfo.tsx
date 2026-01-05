"use client";

import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { ModeToggle } from "@/components/ui/dark-toggle";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu";
import Image from "next/image";

export default function LibraryHeader() {
  const { user } = useUser();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const isAdmin = user?.publicMetadata?.role === "admin";

  return (
    <header className="w-full bg-green-600 text-white">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        {/* LOGO ou nome da biblioteca */}
        <Link href="/" className="flex items-center gap-2 text-xl font-bold">
          <div className="w-[50px] h-[50px] rounded-md shadow-md overflow-hidden bg-white">
            <Image
              src="/images/logo2.png"
              alt="Logo"
              width={50}
              height={50}
              className="w-full h-full object-contain"
            />
          </div>
          <span className="text-white dark:text-white font-family: var(--font-serif);">Biblioteca Digital</span>
        </Link>

        {/* Menu de navegação (Desktop) */}
        <nav className="hidden md:flex gap-4 items-center">
          {/* 📚 Livros com dropdown */}
          <Link href="/">
            <Button variant="ghost">Página inicial</Button>
          </Link>
          <Link href="/user/books">
            <Button variant="ghost">Livros</Button>
          </Link>
     
          {/* 📄 Monografias */}
          <Link href="/contact">
            <Button variant="ghost">Contactos</Button>
          </Link>
          <Link href="/faq">
            <Button variant="ghost">FAQ</Button>  
          </Link>
          {/* Modo escuro */}
          
          <SignedIn>
         
            {isAdmin ? (
              <Link href="/admin">
                <Button variant="ghost">Admin</Button>
              </Link>
            ) : (
              <Link href="/user">
                <Button variant="ghost">Minha Conta</Button>
              </Link>
            )}
          </SignedIn>

          <ModeToggle />
        </nav>

        {/* Ações à direita */}
        <div className="flex items-center gap-3">
          <SignedOut>
            <Link href="/sign-in">
              <Button size="sm">Entrar</Button>
            </Link>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>

          {/* Mobile menu toggle */}
          <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            <Menu size={24} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden flex flex-col px-4 pb-4 gap-2">
          {/* Novas opções */}
          <Link href="/">
            <Button variant="ghost" className="w-full">Página Inicial</Button>
          </Link>
          <Link href="/user/books">
            <Button variant="ghost">Livros</Button>
          </Link>
          
          <Link href="/contactos">
            <Button variant="ghost">Contactos</Button>
          </Link>
          
          <Link href="/faq">
            <Button variant="ghost">FAQ</Button>
          </Link>

          {/* Ações de usuário */}

          <SignedIn>
            <Link href="/my-books" onClick={() => setMenuOpen(false)}>
              <Button variant="ghost" className="w-full">Meus Empréstimos</Button>
            </Link>
            <Link href={isAdmin ? "/admin" : "/user"} onClick={() => setMenuOpen(false)}>
              <Button variant="ghost" className="w-full">{isAdmin ? "Admin" : "Minha Conta"}</Button>
            </Link>
          </SignedIn>
          <SignedOut>
            <Link href="/sign-in" onClick={() => setMenuOpen(false)}>
              <Button variant="ghost" className="w-full">Entrar</Button>
            </Link>
            <Link href="/sign-up" onClick={() => setMenuOpen(false)}>
              <Button variant="ghost" className="w-full">Criar Conta</Button>
            </Link>
          </SignedOut>
        </div>
      )}
    </header>
  );
}
