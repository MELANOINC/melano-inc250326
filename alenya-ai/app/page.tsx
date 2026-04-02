"use client";

import { useState } from "react";

const waLink = process.env.NEXT_PUBLIC_WHATSAPP_WA_ME;

export default function Home() {
  const [msg, setMsg] = useState("");
  const [chat, setChat] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = async () => {
    const trimmed = msg.trim();
    if (!trimmed || loading) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });

      const data = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
        error?: { message?: string };
      };

      if (!res.ok) {
        const apiErr =
          typeof data.error?.message === "string"
            ? data.error.message
            : JSON.stringify(data);
        throw new Error(apiErr);
      }

      const reply = data.choices?.[0]?.message?.content;
      if (typeof reply !== "string") {
        throw new Error("Respuesta inválida del modelo");
      }

      setChat((c) => [...c, `👤 ${trimmed}`, `🤖 ${reply}`]);
      setMsg("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al enviar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-full flex-1 flex-col bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 px-4 py-4 sm:px-8">
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
          ALENYA AI
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Asistente inmobiliario — demo lista para vender
        </p>
        {waLink ? (
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block text-sm font-medium text-emerald-400 hover:text-emerald-300"
          >
            WhatsApp directo →
          </a>
        ) : null}
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-6 sm:px-6">
        <div className="flex-1 space-y-3 overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          {chat.length === 0 ? (
            <p className="text-sm text-zinc-500">
              Escribí un mensaje para probar el flujo (saludo → calificación →
              CTA).
            </p>
          ) : (
            chat.map((c, i) => (
              <p
                key={i}
                className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-200"
              >
                {c}
              </p>
            ))
          )}
        </div>

        {error ? (
          <p className="mt-2 text-sm text-red-400" role="alert">
            {error}
          </p>
        ) : null}

        <div className="mt-4 flex gap-2">
          <input
            className="min-w-0 flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
            placeholder="Escribí tu mensaje…"
            disabled={loading}
            aria-label="Mensaje"
          />
          <button
            type="button"
            onClick={() => void send()}
            disabled={loading || !msg.trim()}
            className="shrink-0 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "…" : "Enviar"}
          </button>
        </div>
      </main>
    </div>
  );
}
