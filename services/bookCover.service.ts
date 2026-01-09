type CoverResult = {
  url: string;
  source: "openlibrary" | "googlebooks" | "default";
};

const DEFAULT_COVER =
  "/images/book-placeholder.png"; 
/* --------------------------------------------------
   1️⃣ Open Library (ISBN)
-------------------------------------------------- */
async function getCoverFromOpenLibrary(isbn: string): Promise<string | null> {
  const url = `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg?default=false`;

  try {
    const res = await fetch(url, { method: "HEAD" });
    if (res.ok) return url;
    return null;
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

    const cover =
      data?.items?.[0]?.volumeInfo?.imageLinks?.thumbnail ??
      data?.items?.[0]?.volumeInfo?.imageLinks?.smallThumbnail;

    return cover || null;
  } catch {
    return null;
  }
}

/* --------------------------------------------------
   3️⃣ Serviço principal
-------------------------------------------------- */
export async function getBookCover({
  isbn,
  title,
}: {
  isbn?: string;
  title?: string;
}): Promise<CoverResult> {
  // 1️⃣ Tenta ISBN no Open Library
  if (isbn) {
    const openLibCover = await getCoverFromOpenLibrary(isbn);
    if (openLibCover) {
      return { url: openLibCover, source: "openlibrary" };
    }

    // 2️⃣ ISBN no Google Books
    const googleCover = await getCoverFromGoogleBooks(isbn, true);
    if (googleCover) {
      return { url: googleCover, source: "googlebooks" };
    }
  }

  // 3️⃣ Título no Google Books
  if (title) {
    const googleCover = await getCoverFromGoogleBooks(title, false);
    if (googleCover) {
      return { url: googleCover, source: "googlebooks" };
    }
  }

  // 4️⃣ Fallback
  return {
    url: DEFAULT_COVER,
    source: "default",
  };
}
