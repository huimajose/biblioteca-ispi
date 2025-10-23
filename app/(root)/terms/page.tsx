"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function TermsPage() {
  return (
    <main className="flex flex-col items-center justify-center px-6 py-12 bg-gray-50 min-h-screen">
      <Card className="max-w-3xl w-full shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Termos e Condições
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold mb-2">1. Aceitação dos Termos</h2>
            <p>
              Ao aceder e utilizar o nosso portal, concorda em cumprir e respeitar
              os presentes Termos e Condições. Caso não concorde, pedimos que não
              utilize os nossos serviços.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">2. Utilização do Serviço</h2>
            <p>
              Os utilizadores comprometem-se a utilizar este portal apenas para
              fins legítimos e de acordo com todas as leis e regulamentos aplicáveis.
              É proibido o uso para atividades ilícitas, difamatórias ou fraudulentas.
            </p>
          </section>

          <section>
  <h2 className="text-xl font-semibold mb-2">3. Propriedade Intelectual e Direitos Autorais</h2>
  <p>
    Os livros, artigos e demais materiais disponíveis neste portal pertencem aos seus
    respetivos autores e editoras, estando protegidos por leis de direitos autorais e
    propriedade intelectual. O ISPI atua apenas como intermediário educativo,
    disponibilizando conteúdos para fins de estudo, pesquisa e formação académica.
  </p>
  <p className="mt-2">
    É estritamente proibida a reprodução, distribuição, venda ou modificação de
    qualquer conteúdo sem a autorização expressa dos titulares dos direitos. Caso
    identifique algum material que viole direitos autorais, por favor entre em
    contacto connosco para que possamos tomar as medidas adequadas.
  </p>
</section>


          <section>
            <h2 className="text-xl font-semibold mb-2">4. Limitação de Responsabilidade</h2>
            <p>
              O ISPI não se responsabiliza por quaisquer danos diretos, indiretos,
              incidentais ou consequentes resultantes do uso ou incapacidade de uso
              deste portal ou dos serviços associados.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">5. Alterações aos Termos</h2>
            <p>
              Reservamo-nos o direito de alterar estes Termos e Condições a qualquer
              momento, mediante aviso prévio através do website. A continuação do uso
              do portal após tais alterações constitui aceitação das mesmas.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">6. Contactos</h2>
            <p>
              Em caso de dúvidas ou questões sobre estes Termos e Condições, pode
              entrar em contacto connosco através do e-mail:
              <a
                href="mailto: biblioteca@ispi.edu.ao"
                className="text-blue-600 hover:underline ml-1"
              >
                biblioteca@ispi.edu.ao
              </a>
            </p>
          </section>

          <p className="text-sm text-gray-500 text-center pt-6">
            Última atualização: Outubro de 2025
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
