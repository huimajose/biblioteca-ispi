"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { IKImage, ImageKitProvider } from "imagekitio-next";

const urlEndpoint = process.env.NEXT_PUBLIC_URL_ENDPOINT!;
const publicKey = process.env.NEXT_PUBLIC_PUBLIC_KEY!;

interface Book {
  id: number;
  title: string;
  author: string;
  genre: string;
  cover?: string | null;
}

export default function RecentBooks() {
  const [recentBooks, setRecentBooks] = useState<Book[]>([]);

  useEffect(() => {
    const fetchRecentBooks = async () => {
      try {
        const res = await fetch("/api/books?recent=true");
        if (!res.ok) throw new Error("Falha ao buscar livros recentes");
        const data = await res.json();
        setRecentBooks(data);
      } catch (err) {
        console.error("Erro ao buscar livros recentes:", err);
      }
    };

    fetchRecentBooks();
  }, []);

  if (recentBooks.length === 0) return null;

  return (
    <div className="mt-8">
      <label className="text-green-600 mb-4 p-5 font-bold text-lg">
        Novidades da semana
        <span className="text-xs text-gray-500"> (últimos 7 dias)</span>
      </label>

      <ImageKitProvider publicKey={publicKey} urlEndpoint={urlEndpoint}>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
          {recentBooks.map((book) => (
            <Link key={book.id} href={`/book/${book.id}`}>
              <Card className="cursor-pointer hover:shadow-lg transition flex flex-col h-[320px]">
                <div className="relative w-full h-48">
                  {book.cover ? (
                    // ✅ Capa do banco (ImageKit)
                    <IKImage
                      path={book.cover}
                      alt={book.title}
                      transformation={[{ width: 300, height: 400 }]}
                      className=" object-cover w-full h-full"
                    />
                  ) : (
                    // ✅ Capa padrão local
                    <Image
                      src="/cover_2.jpeg"
                      alt="Capa padrão"
                      fill
                      className="object-cover "
                    />
                  )}
                </div>

                <CardContent className="p-2 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-sm font-semibold truncate">{book.title}</p>
                    <p className="text-xs text-gray-500 truncate">{book.author}</p>
                  </div>
                </CardContent>

                <CardFooter className="p-2">
                  <p className="text-xs text-muted-foreground truncate">{book.genre}</p>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      </ImageKitProvider>
    </div>
  );
}
