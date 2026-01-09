import { getCachedCover, setCachedCover } from "@/services/bookCoverCache";

type CoverResult = {
  url: string;
  source: "openlibrary" | "googlebooks" | "default";
};

const DEFAULT_COVER = "/images/book-placeholder.png";

/* --------------------------------------------------
   1️⃣ Open Library (ISBN)
-------------------------------------------------- */
async function getCoverFromOpenLibrary(isbn: string): Promise<string | null> {
  const url = `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg?default=false`;

  try {
    const res = await fetch(url, { method: "HEAD" });
    return res.ok ? url : null;
  } catch {
    return null;
  }
}

/* --------------------------------------------------
   2️⃣ Google Books (ISBN ou título)
-------------------------------------------------- */
async function getCoverFromGoogleBooks(
  query: string,
  isISBN = true
): Promise<string | null> {
  const q = isISBN ? `isbn:${query}` : query;
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
    q
  )}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    return (
      data?.items?.[0]?.volumeInfo?.imageLinks?.thumbnail ??
      data?.items?.[0]?.volumeInfo?.imageLinks?.smallThumbnail ??
      null
    );
  } catch {
    return null;
  }
}

/* --------------------------------------------------
   3️⃣ Serviço principal (com Redis)
-------------------------------------------------- */
export async function getBookCover({
  isbn,
  title,
}: {
  isbn?: string;
  title?: string;
}): Promise<CoverResult> {

  // 🧠 0️⃣ Redis primeiro (se houver ISBN)
  if (isbn) {
    const cached = await getCachedCover(isbn);
    if (cached) return cached;
  }

  let result: CoverResult | null = null;

  // 1️⃣ Open Library por ISBN
  if (isbn) {
    const openLibCover = await getCoverFromOpenLibrary(isbn);
    if (openLibCover) {
      result = { url: openLibCover, source: "openlibrary" };
    }
  }

  // 2️⃣ Google Books por ISBN
  if (!result && isbn) {
    const googleCover = await getCoverFromGoogleBooks(isbn, true);
    if (googleCover) {
      result = { url: googleCover, source: "googlebooks" };
    }
  }

  // 3️⃣ Google Books por título
  if (!result && title) {
    const googleCover = await getCoverFromGoogleBooks(title, false);
    if (googleCover) {
      result = { url: googleCover, source: "googlebooks" };
    }
  }

  // 4️⃣ Fallback
  if (!result) {
    result = { url: DEFAULT_COVER, source: "default" };
  }

  // 💾 5️⃣ Guardar no Redis (apenas se houver ISBN)
  if (isbn) {
    await setCachedCover(isbn, result);
  }

  return result;
}
