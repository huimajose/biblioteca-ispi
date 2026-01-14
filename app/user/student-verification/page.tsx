"use client";

import { useState, useEffect } from "react";
import { Spinner } from "@/components/ui/spinner";

export default function StudentVerificationPage() {
  const [studentNumber, setStudentNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPending, setHasPending] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkPending = async () => {
      try {
        const res = await fetch("/api/student-verification");
        if (!res.ok) throw new Error("Falha ao verificar status");
        const data = await res.json();
        setHasPending(data.hasPending);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Erro desconhecido");
      } finally {
        setChecking(false);
      }
    };
    checkPending();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/student-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentNumber }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Falha ao enviar número de estudante");
      }

      setSuccess(true);
      setStudentNumber("");
      setHasPending(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/student-verification", {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Falha ao cancelar solicitação");
      }

      setHasPending(false);
      setSuccess(false);
      setStudentNumber("");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  if (checking)
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner className="w-8 h-8" />
      </div>
    );

  return (
    <div className="max-w-md mx-auto mt-12 bg-white p-6 rounded-lg shadow">
      <h1 className="text-2xl font-semibold mb-4 text-green-600">
        Verificação de Estudante
      </h1>

      {success && (
        <div className="mb-4 text-green-700 font-medium">
          Número enviado! O admin irá verificar e liberar o acesso.
        </div>
      )}

      {error && (
        <div className="mb-4 text-red-600 font-medium">{error}</div>
      )}

      {hasPending && !success && (
        <div className="mb-4 text-yellow-700 font-medium">
          Você já possui uma solicitação pendente. Aguarde a aprovação do admin.
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Número de Estudante
          </label>
          <input
            type="text"
            value={studentNumber}
            onChange={(e) => setStudentNumber(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-400 disabled:opacity-50"
            placeholder="Ex: 202400123"
            required
            disabled={hasPending}
          />
        </div>

        <div className="flex flex-col gap-2">
          <button
            type="submit"
            disabled={loading || hasPending}
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition disabled:opacity-50"
          >
            {loading ? <Spinner className="w-5 h-5 mx-auto" /> : "Enviar"}
          </button>

          {hasPending && (
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 transition disabled:opacity-50"
            >
              {loading ? <Spinner className="w-5 h-5 mx-auto" /> : "Cancelar Solicitação"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
