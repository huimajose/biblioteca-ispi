/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useBooks } from "@/hooks/user/useBooks";
import { BooksHeader } from "@/hooks/user/BooksHeader";
import { BooksTable } from "@/hooks/user/BooksTable";

export default function BooksPageContent() {
  const {
    books,
    loading,
    search,
    sort,
    order,
    handleSort,
    updateParams,
  } = useBooks();

  return (
    <div className="p-6">
      <BooksHeader
        search={search}
        onSearch={(v) => updateParams({ search: v, page: "1" })}
        onSortNew={() =>
          updateParams({ sort: "id", order: "desc", page: "1" })
        }
      />

      {!loading && (
        <BooksTable
          books={books}
          sort={sort}
          order={order}
          onSort={handleSort}
        />
      )}
    </div>
  );
}
