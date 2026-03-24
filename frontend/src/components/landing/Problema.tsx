"use client";

import { useEffect, useRef } from "react";

const problemas = [
  {
    emoji: "🧭",
    titulo: "Falta de direção",
    descricao:
      "Você tem vontade de mudar, mas não sabe por onde começar. Cada dia parece igual ao anterior.",
  },
  {
    emoji: "🗂️",
    titulo: "Fragmentação",
    descricao:
      "Começa vários projetos e não termina nenhum. A energia se dispersa sem gerar resultado.",
  },
  {
    emoji: "⏳",
    titulo: "Procrastinação",
    descricao:
      "Sabe o que precisa fazer, mas adia sempre para amanhã. O amanhã nunca chega.",
  },
  {
    emoji: "🌫️",
    titulo: "Falta de clareza",
    descricao:
      "Não consegue visualizar como será sua vida daqui 1 ano. O futuro parece indefinido.",
  },
  {
    emoji: "📚",
    titulo: "Excesso de informação",
    descricao:
      "Consome muito conteúdo mas coloca pouco em prática. Informação sem sistema não vira ação.",
  },
];

export default function Problema() {
  const containerRef = useRef<HTMLDivElement>(null);

  /* Scroll reveal */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.15 }
    );

    const els = containerRef.current?.querySelectorAll(".reveal");
    els?.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section className="section-light py-24 px-4" ref={containerRef}>
      <div className="container">

        {/* Cabeçalho */}
        <div className="reveal text-center mb-16">
          <div className="badge badge-green mb-4">Você se identifica?</div>
          <h2 style={{ color: "var(--color-brand-dark-green)" }}>
            Você está aqui:
          </h2>
          <div className="divider-gold" />
          <p
            className="mt-5 text-lg max-w-lg mx-auto"
            style={{ color: "var(--color-brand-gray)" }}
          >
            Reconhece algum desses cenários? A maioria das pessoas que querem
            mudar passa por pelo menos três deles.
          </p>
        </div>

        {/* Grid unificado — 3 cols em desktop, 2 em tablet, 1 em mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {problemas.map((p, i) => (
            <div
              key={p.titulo}
              className={`reveal card flex flex-col gap-4 min-h-[180px] ${
                /* Último item (índice 4) → centralizado nas 3 colunas */
                i === 4 ? "sm:col-start-1 lg:col-start-2" : ""
              }`}
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              {/* Ícone + número */}
              <div className="flex items-start justify-between">
                <span style={{ fontSize: 36, lineHeight: 1 }}>{p.emoji}</span>
                <span
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: 13,
                    fontWeight: 700,
                    color: "rgba(30,57,42,0.18)",
                    letterSpacing: "0.05em",
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>

              {/* Texto */}
              <div>
                <h4
                  className="mb-2"
                  style={{
                    fontFamily: "var(--font-heading)",
                    color: "var(--color-brand-dark-green)",
                  }}
                >
                  {p.titulo}
                </h4>
                <p
                  style={{
                    fontSize: 14,
                    lineHeight: 1.65,
                    color: "var(--color-brand-gray)",
                  }}
                >
                  {p.descricao}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Ponte para a solução */}
        <div className="reveal text-center mt-16">
          <p
            className="text-lg font-semibold"
            style={{ color: "var(--color-brand-dark-green)" }}
          >
            Se você reconheceu pelo menos um desses cenários,{" "}
            <span style={{ color: "var(--color-brand-gold)", fontFamily: "var(--font-heading)" }}>
              A Virada foi feita para você.
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}