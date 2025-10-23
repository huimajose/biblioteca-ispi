"use client";

import React from "react";
import Link from "next/link";

const Footer: React.FC = () => {
  return (
    <footer className="bg-green-600 text-white py-6">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
        <div className="text-sm text-center">
          &copy; {new Date().getFullYear()} ISPI - Biblioteca Digital. Todos os direitos reservados.
        </div>
        <nav className="mt-4 md:mt-0">
          <ul className="flex space-x-4">
            <li>
              <Link href="/" className="hover:text-gray-300">
                Início
              </Link>
            </li>
            
           
            <li>
              <Link href="/contact" className="hover:text-gray-300">
                Contatos
              </Link>
            </li>
            
            <li>
              <Link href="/terms" className="hover:text-gray-300">
                Termos e Condições
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
