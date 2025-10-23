"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FAQItemProps {
  question: string;
  answer: string;
}

export default function FAQItem({ question, answer }: FAQItemProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 py-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex justify-between items-center w-full text-left"
      >
        <span className="text-lg font-medium text-gray-800">{question}</span>
        <ChevronDown
          className={`text-green-600 transition-transform ${open ? "rotate-180" : ""}`}
          size={20}
        />
      </button>

      {open && (
        <p className="mt-3 text-gray-600 text-sm leading-relaxed">
          {answer}
        </p>
      )}
    </div>
  );
}
