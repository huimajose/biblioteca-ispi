"use client";

import { useState } from "react";
import { toast } from "sonner";

export default function ContactForm() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    setLoading(false);

    if (res.ok) {
      toast.success("Mensagem enviada com sucesso!");
      setFormData({ name: "", email: "", message: "" });
    } else {
      toast.error("Erro ao enviar mensagem. Tente novamente.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Seu nome"
        required
        className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-600"
      />

      <input
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Seu e-mail"
        required
        className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-600"
      />

      <textarea
        name="message"
        value={formData.message}
        onChange={handleChange}
        placeholder="Sua mensagem..."
        rows={5}
        required
        className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-600"
      />

      <button
        type="submit"
        disabled={loading}
        className="bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition disabled:bg-gray-400"
      >
        {loading ? "Enviando..." : "Enviar mensagem"}
      </button>
    </form>
  );
}
