// app/admin/dashboard.tsx
import { checkRole, verifyAdmin } from "@/utils/roles";
import { redirect } from "next/navigation";
import { UsersIcon, BookOpenIcon, ClipboardDocumentCheckIcon, ClockIcon, BookmarkIcon, BookmarkSlashIcon, BookOpenIcon as AvailableBooksIcon } from "@heroicons/react/24/solid";
import { getUserCount } from "@/db/crud/users.crud";
import { readBooks } from "@/db/crud/books.crud";
import { readVerifyPending } from "@/db/crud/verifyPending.crud";
import { readTransactions } from "@/db/crud/transactions.crud";
import { currentUser } from "@clerk/nextjs/server";

export default async function AdminDashboard() {
  //const isAdmin = await checkRole("admin");
  //if (isAdmin) {
    //redirect("/");
  //}



  // Fetch data for dashboard cards
  const userCount = await getUserCount();
  const { totalBooks, books } = await readBooks(1, 1000); // Get all books for counting
  const pendingUsers = await readVerifyPending();
  const transactions = await readTransactions() || [];
  const user = await currentUser()

  const isAdmin = await verifyAdmin(user.id)

    console.log("Verificar se o user é Admin: ", isAdmin)
    

  // Calculate available books
  const availableBooks = books.reduce((sum, book) => sum + book.availableCopies, 0);

  // Calculate active borrowings annd accvpeted books
  const activeBorrowings = transactions.filter(t =>
  ["borrowed", "accepted"].includes(t.status)
).length;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Painel administrativo</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {/* Total Users Card */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 rounded-xl shadow-lg text-white">
          <div className="flex flex-col h-full">
            <div className="flex items-center mb-4">
              <UsersIcon className="w-12 h-12 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">Total Users</h2>
              <p className="text-4xl font-bold">{userCount}</p>
            </div>
          </div>
        </div>

        {/* Total Books Card */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 rounded-xl shadow-lg text-white">
          <div className="flex flex-col h-full">
            <div className="flex items-center mb-4">
              <BookOpenIcon className="w-12 h-12 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">Total de livros</h2>
              <p className="text-4xl font-bold">{totalBooks}</p>
            </div>
          </div>
        </div>

        {/* Available Books Card */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-6 rounded-xl shadow-lg text-white">
          <div className="flex flex-col h-full">
            <div className="flex items-center mb-4">
              <AvailableBooksIcon className="w-12 h-12 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">Livros fisicos</h2>
              <p className="text-4xl font-bold">{availableBooks}</p>
            </div>
          </div>
        </div>

        {/* Active Borrowings Card */}
        <div className="bg-gradient-to-r from-yellow-500 to-orange-600 p-6 rounded-xl shadow-lg text-white">
          <div className="flex flex-col h-full">
            <div className="flex items-center mb-4">
              <ClockIcon className="w-12 h-12 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">Livros emprestados</h2>
              <p className="text-4xl font-bold">{activeBorrowings}</p>
            </div>
          </div>
        </div>

        {/* Pending Users Card */}
        <div className="bg-gradient-to-r from-red-500 to-pink-600 p-6 rounded-xl shadow-lg text-white">
          <div className="flex flex-col h-full">
            <div className="flex items-center mb-4">
              <ClipboardDocumentCheckIcon className="w-12 h-12 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">Usuários pendentes</h2>
              <p className="text-4xl font-bold">{pendingUsers.length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


