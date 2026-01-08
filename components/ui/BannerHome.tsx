"use client";

import Image from "next/image";
import { Suspense } from "react";
import SearchBar from "@/components/ui/searchBar";
import {
  Pagination,
  A11y,
  Autoplay,
  EffectFade,
} from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  BookOpen,
  FileText,
  FilePlus,
  FlaskConical,
} from "lucide-react";

import CounterHome from "./CounterHome";
import UserCounter from "./UserCounter";
import StudentCount from "./StudentCount";
import MonoCounter from "./MonoCounter";
import ProjectCounter from './ProjectCounter';
import RecentBooks from "./BooksOfMonths";

export default function BannerHome() {
  const cardData = [
    {
      title: "Livros",
      description: "Explore nossa coleção de livros digitais e físicos.",
      content: "Encontre livros para leitura ou consulta na biblioteca.",
      icon: <BookOpen className="w-6 h-6 text-green-600" />,
      url: "/user/books?category=1",
    },
    {
      title: "Monografias",
      description: "Trabalhos acadêmicos submetidos por estudantes.",
      content: "Acesse monografias organizadas por curso e tema.",
      icon: <FileText className="w-6 h-6 text-green-600" />,
      url: "/user/books?category=2",
    },
    
    {
      title: "Artigos Científicos",
      description: "Pesquisas e artigos de revistas científicas.",
      content: "Leia artigos científicos publicados por docentes e alunos.",
      icon: <FlaskConical className="w-6 h-6 text-green-600" />,
      url: "/user/books?category=4",
    },
  ];

  return (
    <Suspense>
      <div className="h-full flex flex-col items-center w-full mt-5">

        {/* =================== BANNER =================== */}
        <Swiper
          modules={[Pagination, A11y, Autoplay, EffectFade]}
          spaceBetween={30}
          slidesPerView={1}
          pagination={{ clickable: true }}
          loop
          effect="fade"
          autoplay={{
            delay: 9000,
            disableOnInteraction: false,
          }}
          className="w-full"
        >
          {["1.png", "2.png", "3.png", "4.png", "5.png"].map((img, i) => (
            <SwiperSlide key={i}>
              <div className="w-full max-w-screen-2xl mx-auto">
                <Image
                  src={`/images/${img}`}
                  alt={`Slide ${i + 1}`}
                  width={1920}
                  height={500}
                  priority={i === 0}
                  className="w-full h-auto shadow-md object-cover rounded-md"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* =================== TÍTULO =================== */}
       

        {/* =================== SEPARADOR =================== */}
        {/* =================== SEPARADOR COM DESCRIÇÃO =================== */}
        <div className="w-full max-w-7xl flex flex-col items-center my-8">
          <div className="border-b border-gray-300 w-full mb-2"></div>
          <p className="text-center text-sm text-gray-500 italic">
            Descubra todo o universo de conhecimento disponível em nossa plataforma. Uma biblioteca digital que conecta ideias, pessoas e inovação.
          </p>
        </div>


        {/* =================== CARDS =================== */}
        <div className="w-full max-w-7xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4 py-10">
          {cardData.map((card, i) => (
            <a href={card.url} key={i} className="no-underline">
              <Card className="shadow-md">
                <CardHeader className="flex flex-col items-start gap-2">
                  <div className="flex items-center gap-2">
                    {card.icon}
                    <CardTitle>{card.title}</CardTitle>
                  </div>
                  <CardDescription>{card.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>{card.content}</p>
                </CardContent>
                <CardFooter>
                  <p className="text-sm text-gray-500">Acesso rápido</p>
                </CardFooter>
              </Card>
            </a>
          ))}
        </div>

        {/* =================== SEPARADOR =================== */}
        {/* =================== SEPARADOR DOS CONTADORES =================== */}
        <div className="w-full max-w-7xl flex flex-col items-center my-8">
          <div className="border-b border-gray-300 w-full mb-2"></div>
          <p className="text-center text-sm text-gray-500 italic">
            Números que contam a nossa história: acompanhe o crescimento da nossa comunidade em tempo real.
          </p>
        </div>


        {/* =================== CONTADOR =================== */}
        <div className="w-full max-w-7xl flex flex-col sm:flex-row gap-4 px-4">
          <Suspense fallback={<p>Carregando ...</p>}>
            <CounterHome type={1} />
          </Suspense>
     
          
          <StudentCount />
          <MonoCounter type={2} />
          <ProjectCounter type={3} />
        </div>

        <div className="w-full max-w-7xl flex flex-col sm:flex-row gap-4 px-4">

          <RecentBooks />
        </div>

      </div>
    </Suspense>
  );
}
