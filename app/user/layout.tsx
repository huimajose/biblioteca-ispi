import type { Metadata } from "next";
import "../globals.css";
import Header from "@/components/user/Header";
import Sidebar from "@/components/user/Sidebar";
import { ClerkProvider } from "@clerk/nextjs";
import { ToastProvider } from "@/components/ui/ToastContext";

export const metadata: Metadata = {
  title: {
    template: '%s | Painel administrativo | Biblioteca',
    default: 'Painel administrativo |  Biblioteca',
  },
  description: "Acesse seu painel de usuário para gerenciar suas informações e interações com o sistema de biblioteca.",
};

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
       <ToastProvider>
      <html lang="en">
        <body className="bg-indigo-100/75">
          <main className="flex">
            <Sidebar />
            <div className="flex flex-col p-4 w-full">
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