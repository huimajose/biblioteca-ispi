"use client";

import React from "react";
import Image from "next/image";
import { IKImage, ImageKitProvider } from "imagekitio-next";

const urlEndpoint = process.env.NEXT_PUBLIC_URL_ENDPOINT!;
const publicKey = process.env.NEXT_PUBLIC_PUBLIC_KEY!;
const defaultCover = "/cover_2.jpeg";

const BookOverview = ({
  title,
  author,
  genre,
  totalCopies,
  availableCopies,
  cover,
  isbn,
  onBorrow,
  onReturn,
  borrowed,
  requested,
  maxBorrowed,
  loading,
  transaction,
}: {
  title: string;
  author: string;
  genre: string;
  totalCopies: number;
  availableCopies: number;
  cover: string | null;
  isbn: string;
  onBorrow: () => void;
  onReturn: () => void;
  borrowed: boolean;
  requested: boolean;
  maxBorrowed: boolean;
  loading: boolean;
  transaction: any;
}) => {
  const getButtonText = () => {
    if (loading) return "Processando...";
    if (transaction?.status === "RETURN") return "Return Requested";
    if (borrowed) return "Devolver";
    if (requested) return "Pedido pendente";
    if (maxBorrowed) return "Máx de livros emprestados";
    return "+ Leitura";
  };

  const isDisabled =
    loading ||
    transaction?.status === "RETURN" ||
    (!borrowed && !requested && !maxBorrowed);

  // ✅ Define capa exibida
  const displayCover =
    cover && cover.trim() !== "" && cover !== "null" ? cover : defaultCover;

  // ✅ Detecta se a capa vem do ImageKit
  const isImageKitCover = displayCover.includes("book-cover_");

  // ✅ Remove / inicial caso exista (ImageKit não precisa)
  const normalizedCover = displayCover.startsWith("/")
    ? displayCover.substring(1)
    : displayCover;

  console.log("Capa recebida:", cover);

  return (
    <section className="flex flex-col-reverse text-green-600 items-center justify-around gap-12 sm:gap-32 xl:flex-row xl:gap-8 mx-10 my-10 w-full max-w-7xl">
      {/* LEFT SIDE */}
      <div className="flex flex-col gap-5 max-w-[600px] min-w-[300px] w-full">
        <h1 className="text-5xl font-semibold text-black dark:text-white md:text-7xl">
          {title}
        </h1>

        <p className="text-xl text-light-100">
          Autor <span className="font-semibold text-[#EED1AC]">{author}</span>
        </p>

        <div className="mt-4 flex flex-col gap-3">
          <p className="text-xl text-light-100">
            ISBN: <span className="font-semibold text-[#EED1AC]">{isbn}</span>
          </p>

          <p className="text-xl text-light-100">
            Categoria: <span className="font-semibold text-[#EED1AC]">{genre}</span>
          </p>

          <div className="flex flex-row text-green-600 flex-wrap gap-4 mt-2">
            <p className="text-xl text-light-100">
              Total: <span className="font-semibold text-[#EED1AC]">{totalCopies}</span>
            </p>

            <p className="text-xl text-light-100">
              Disponíveis: <span className="font-semibold text-[#EED1AC]">{availableCopies}</span>
            </p>
          </div>
        </div>

        <button
          onClick={transaction?.status === "RETURN" ? undefined : borrowed ? onReturn : onBorrow}
          disabled={isDisabled}
          className="mt-6 w-[200px] px-6 py-3 bg-green-600 text-white rounded-xl text-lg hover:bg-green-700 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {getButtonText()}
        </button>
      </div>

      {/* RIGHT SIDE */}
      <div className="relative flex justify-center max-w-[400px] w-full">
        {isImageKitCover ? (
          <ImageKitProvider publicKey={publicKey} urlEndpoint={urlEndpoint}>
            <IKImage
              path={normalizedCover}
              alt="Book cover"
              width={300}
              height={400}
              className="rounded-lg shadow-lg object-cover"
            />
          </ImageKitProvider>
        ) : (
          <Image
            src={defaultCover}
            alt="Book cover"
            width={300}
            height={400}
            className="rounded-lg shadow-lg object-cover"
          />
        )}
      </div>
    </section>
  );
};

export default BookOverview;
