"use client";

import { useEffect, useRef } from "react";

const fases = [
  {
    numero: "01",
    emoji: "🔍",
    titulo: "Autoconhecimento",
    descricao:
      "Descubra quem você é, onde está hoje e quais são seus valores mais profundos.",
    ferramentas: ["Raio-X 360°", "Mapa de Valores", "Propósito de Vida"],
  },
  {
    numero: "02",
    emoji: "🎯",
    titulo: "Visão e Metas",
    descricao:
      "Defina com clareza onde quer chegar, crie uma visão de futuro e estabeleça seus OKRs.",
    ferramentas: ["Visão de Futuro", "OKRs", "Plano de 12 Meses"],
  },
  {
    numero: "03",
    emoji: "🚀",
    titulo: "Hábitos e Rotina",
    descricao:
      "Construa a rotina que te leva lá: saúde, finanças, produtividade e relacionamentos.",
    ferramentas: ["Rotina Ideal", "Finanças Pessoais", "Saúde e Energia"],
  },
  {
    numero: "04",
    emoji: "🧠",
    titulo: "Mentalidade",
    descricao:
      "Elimine os bloqueios que te prendem, cultive espiritualidade e registre sua evolução.",
    ferramentas: ["Espiritualidade", "Diário de Bordo", "Revisão Mensal"],
  },
];

export default function Solucao() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => e.isIntersecting && e.target.classList.add("visible"));
      },
      { threshold: 0.12 }
    );
    containerRef.current?.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="solucao"
      className="section-dark py-24 px-4"
      ref={containerRef}
    >
      <div className="container">

        {/* Cabeçalho */}
        <div className="reveal text-center mb-16">
          <div className="badge badge-white mb-4">A Metodologia</div>
          <h2 style={{ color: "var(--color-brand-cream)" }}>
            Sua Jornada de{" "}
            <span style={{ color: "var(--color-brand-gold)", fontStyle: "italic" }}>
              12 Meses
            </span>
          </h2>
          <div className="divider-gold" />
          <p
            className="mt-5 text-lg max-w-lg mx-auto"
            style={{ color: "rgba(244,241,222,0.65)" }}
          >
            4 fases progressivas que se constroem uma sobre a outra,
            transformando todas as áreas da sua vida de forma estruturada.
          </p>
        </div>

        {/* Grid de fases */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {fases.map((fase, i) => (
            <div
              key={fase.numero}
              className="reveal flex flex-col gap-4 rounded-2xl p-6"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                transitionDelay: `${i * 100}ms`,
              }}
            >
              {/* Número grande */}
              <div
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: 48,
                  fontWeight: 700,
                  lineHeight: 1,
                  color: "var(--color-brand-gold)",
                  opacity: 0.85,
                }}
              >
                {fase.numero}
              </div>

              <span style={{ fontSize: 32, lineHeight: 1 }}>{fase.emoji}</span>

              <div>
                <h3
                  className="mb-2"
                  style={{
                    color: "var(--color-brand-cream)",
                    fontSize: 20,
                  }}
                >
                  {fase.titulo}
                </h3>
                <p
                  style={{
                    fontSize: 14,
                    lineHeight: 1.65,
                    color: "rgba(244,241,222,0.65)",
                  }}
                >
                  {fase.descricao}
                </p>
              </div>

              {/* Ferramentas incluídas */}
              <div className="mt-auto pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "var(--color-brand-gold)",
                    marginBottom: 8,
                  }}
                >
                  Ferramentas
                </p>
                <div className="flex flex-col gap-1">
                  {fase.ferramentas.map((f) => (
                    <span
                      key={f}
                      style={{
                        fontSize: 12,
                        color: "rgba(244,241,222,0.55)",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <span style={{ color: "var(--color-brand-gold)", fontSize: 10 }}>✦</span>
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA ponte */}
        <div className="reveal text-center mt-14">
          <p
            className="mb-6 text-base"
            style={{ color: "rgba(244,241,222,0.6)" }}
          >
            Cada fase inclui ferramentas guiadas — você nunca começa com a
            tela em branco.
          </p>
          <a href="#ferramentas" className="btn-gold">
            Ver as 16 Ferramentas →
          </a>
        </div>
      </div>
    </section>
  );
}