"use client";

import { useParams } from "next/navigation";
import PdfViewer from "@/components/ui/PdfViewer";

export default function ReaderPage() {
  const params = useParams();
  const bookId = params?.bookId as string;
  const filename = params?.filename as string;

  const decodedFileName = decodeURIComponent(filename);

  console.log("ID do livro:", bookId);
  console.log("Nome do ficheiro decodificado:", decodedFileName);

  const supabaseUrl = "https://ouhdotednocmpjcktfsh.storage.supabase.co/storage/v1/object/public/books";
  const filePath = `${supabaseUrl}/${bookId}/${decodedFileName}`;

  return (
    <div className="flex flex-col items-center p-4">
      <h1 className="text-xl font-semibold mb-4">Leitura do Livro</h1>
      <PdfViewer url={filePath} watermarkText="" />
    </div>
  );
}
