"use client";
import { ClerkProvider, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import NotificationBell from "../NotificationBell";

const Header = () => {
  return (
    <ClerkProvider>
      <header className="flex w-full h-16 bg-white justify-between px-5 rounded-sm mb-6">
        <div className="py-2 px-4">
          <h2 className="text-2xl font-bold text-grey-400"></h2>
        </div>
        <div className="flex items-center justify-center gap-5 pr-4">
          <Link href="/">
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition">
              Página Inicial
            </button>
          </Link>

          <NotificationBell />

          <div className="scale-125 flex items-center justify-center">
            <UserButton />
          </div>
        </div>
      </header>
    </ClerkProvider>
  );
};

export default Header;
