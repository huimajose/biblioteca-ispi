import Sidebar from "@/components/admin/Sidebar";
import "../globals.css";
import Header from "@/components/admin/Header";
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { ptPT } from "@clerk/localizations";
import { ToastProvider } from "@/components/ui/ToastContext";


export const metadata: Metadata = {
  title: {
    template: '%s | Admin Dashboard | Library Management System',
    default: 'Admin Dashboard | Library Management System',
  },
  description: "Administrar o sistema de biblioteca, gerenciar usuários, livros e empréstimos.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider localization={ptPT}>
      <ToastProvider>
      <html lang="en">
        <body className="bg-indigo-100/75">
          <main className="flex">
            <Sidebar />
            <div className="flex flex-col  p-4 w-full">
              <Header />
              {children}
            </div>
          </main>
        </body>
      </html>
      </ToastProvider>
    </ClerkProvider>
  );
}
