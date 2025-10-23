"use client";

import FAQItem from "@/components/ui/FAQItem";

export default function FAQPage() {
  const faqs = [
    {
      question: "Como posso requisitar um livro?",
      answer:
        "Para requisitar um livro, basta iniciar sessão na sua conta, abrir o livro desejado e clicar em '+ Leitura'. O pedido será avaliado e poderá ser aceite se houver exemplares disponíveis.",
    },
    {
      question: "Posso devolver um livro antes do prazo?",
      answer:
        "Sim. Basta ir até à página do livro que requisitou e clicar em 'Devolver'. Isso disponibilizará o exemplar novamente para outros utilizadores.",
    },
    {
      question: "Quantos livros posso requisitar de uma só vez?",
      answer:
        "Cada utilizador pode requisitar até 3 livros em simultâneo. Após a devolução de um livro, pode requisitar outro.",
    },
    {
      question: "O que acontece se eu atrasar a devolução de um livro?",
      answer:
        "Em caso de atraso, a sua conta pode ser temporariamente suspensa até que todos os livros sejam devolvidos.",
    },
    {
      question: "Como posso entrar em contacto com a equipa da biblioteca?",
      answer:
        "Pode usar a página de contacto no menu principal para enviar uma mensagem diretamente à equipa da biblioteca.",
    },
  ];

  return (
    <main className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-bold text-green-600 mb-6 text-center">
        Perguntas Frequentes (FAQ)
      </h1>

      <p className="text-gray-600 mb-12 text-center">
        Encontre respostas rápidas para as perguntas mais comuns sobre o uso da biblioteca.
      </p>

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8">
        {faqs.map((faq, index) => (
          <FAQItem key={index} question={faq.question} answer={faq.answer} />
        ))}
      </div>
    </main>
  );
}
