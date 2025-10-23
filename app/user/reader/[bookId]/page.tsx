"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import PdfViewer from "@/components/ui/PdfViewer";

export default function ReaderPage() {
  const params = useParams();
  const bookId = params?.bookId as string;
  const filename = params?.filename as string | undefined; // pode não existir

  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const supabaseUrl =
    "https://ouhdotednocmpjcktfsh.storage.supabase.co/storage/v1/object/public/books";

  useEffect(() => {
    async function loadPdf() {
      // 🧩 Caso 1: não tem filename → abre o PDF padrão
      if (!filename) {
        setPdfUrl("/default_biblioteca_ispi.pdf");
        return;
      }

      // 🧩 Caso 2: tenta carregar o PDF real
      const decodedFileName = decodeURIComponent(filename);
      const filePath = `${supabaseUrl}/${bookId}/${decodedFileName}`;

      try {
        const res = await fetch(filePath, { method: "GET" });

        if (res.ok && res.headers.get("content-type")?.includes("pdf")) {
          setPdfUrl(filePath);
        } else {
          console.warn("PDF não encontrado, abrindo padrão...");
          setPdfUrl("/default_biblioteca_ispi.pdf");
        }
      } catch (err) {
        console.error("Erro ao buscar PDF:", err);
        setPdfUrl("/default_biblioteca_ispi.pdf");
      }
    }

    loadPdf();
  }, [bookId, filename]);

  if (!pdfUrl) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        Verificando arquivo...
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-4">
      <h1 className="text-xl font-semibold mb-4">
        {filename ? "Leitura do Livro" : "Pré-visualização indisponível"}
      </h1>

      <PdfViewer
        url={pdfUrl}
        watermarkText=""
      />

      
    </div>
  );
}
