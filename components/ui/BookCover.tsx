"use client";

import { IKImage, ImageKitProvider } from "imagekitio-next";
import { useState } from "react";
import Image from "next/image";

const urlEndpoint = process.env.NEXT_PUBLIC_URL_ENDPOINT!;
const publicKey = process.env.NEXT_PUBLIC_PUBLIC_KEY!;

interface BookCoverProps {
  cover: string;
  title: string;
  width?: number;
  height?: number;
  className?: string;
}

export function BookCover({
  cover,
  title,
  width = 45,
  height = 60,
  className = "",
}: BookCoverProps) {
  const [imageError, setImageError] = useState(false);

  // Se a capa for nula, vazia ou ocorreu erro, mostra a imagem padrão
  if (!cover || cover === "null" || imageError) {
    return (
      <Image
        alt={`${title} cover`}
        src="/cover_2.jpeg"
        width={width}
        height={height}
        className={`object-cover rounded ${className}`}
      />
    );
  }

  // Caso contrário, mostra a imagem hospedada no ImageKit
  return (
    <ImageKitProvider publicKey={publicKey} urlEndpoint={urlEndpoint}>
      <IKImage
        path={cover}
        height={height}
        width={width}
        alt={`${title} cover`}
        className={`object-cover rounded ${className}`}
        onError={() => setImageError(true)}
      />
    </ImageKitProvider>
  );
}
