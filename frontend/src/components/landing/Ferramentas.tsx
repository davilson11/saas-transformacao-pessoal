"use client";

import { useEffect, useRef } from "react";

const grupos = [
  {
    fase: "01",
    titulo: "Autoconhecimento",
    cor: "#4a8c6a",
    ferramentas: [
      { codigo: "F01", emoji: "🎯", nome: "Raio-X 360°", desc: "Diagnóstico completo de onde você está hoje" },
      { codigo: "F02", emoji: "🧭", nome: "Mapa de Valores", desc: "Identifique o que realmente importa para você" },
      { codigo: "F03", emoji: "⭐", nome: "Propósito de Vida", desc: "Descubra sua missão e razão de existir" },
      { codigo: "F04", emoji: "🔮", nome: "Visão de Futuro", desc: "Visualize em detalhes como será sua vida ideal" },
    ],
  },
  {
    fase: "02",
    titulo: "Visão e Metas",
    cor: "#d4905a",
    ferramentas: [
      { codigo: "F05", emoji: "📊", nome: "OKRs Pessoais", desc: "Objetivos e resultados-chave que guiam sua jornada" },
      { codigo: "F06", emoji: "📅", nome: "Plano de 12 Meses", desc: "Cronograma claro mês a mês de cada objetivo" },
      { codigo: "F07", emoji: "💰", nome: "Finanças Pessoais", desc: "Controle e planejamento financeiro integrado" },
      { codigo: "F08", emoji: "🌅", nome: "Rotina Ideal", desc: "Monte sua rotina de manhã, tarde e noite" },
    ],
  },
  {
    fase: "03",
    titulo: "Hábitos e Energia",
    cor: "#5a7abf",
    ferramentas: [
      { codigo: "F09", emoji: "💪", nome: "Saúde e Energia", desc: "Hábitos de movimento, sono e alimentação" },
      { codigo: "F10", emoji: "🤝", nome: "Relacionamentos", desc: "Cuide das conexões que importam de verdade" },
      { codigo: "F11", emoji: "🧘", nome: "Espiritualidade", desc: "Prática contemplativa e conexão com o sagrado" },
      { codigo: "F12", emoji: "⚡", nome: "Energia Diária", desc: "Rastreie e maximize seus níveis de energia" },
    ],
  },
  {
    fase: "04",
    titulo: "Crescimento e Revisão",
    cor: "#9b6baf",
    ferramentas: [
      { codigo: "F13", emoji: "🎓", nome: "Aprendizado", desc: "Gerencie leituras, cursos e novos conhecimentos" },
      { codigo: "F14", emoji: "📔", nome: "Diário de Bordo", desc: "Registro contínuo da sua jornada e reflexões" },
      { codigo: "F15", emoji: "🏆", nome: "Conquistas", desc: "Celebre cada vitória — pequena ou grande" },
      { codigo: "F16", emoji: "🔄", nome: "Revisão Mensal", desc: "Check-in estruturado para ajustar o rumo" },
    ],
  },
];

export default function Ferramentas() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => e.isIntersecting && e.target.classList.add("visible"));
      },
      { threshold: 0.08 }
    );
    containerRef.current?.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="ferramentas"
      className="section-white py-24 px-4"
      ref={containerRef}
    >
      <div className="container">

        {/* Cabeçalho */}
        <div className="reveal text-center mb-16">
          <div className="badge badge-green mb-4">O que está incluído</div>
          <h2 style={{ color: "var(--color-brand-dark-green)" }}>
            16 Ferramentas Para{" "}
            <span
              style={{
                fontStyle: "italic",
                color: "var(--color-brand-medium-green)",
              }}
            >
              Transformar Sua Vida
            </span>
          </h2>
          <div className="divider-gold" />
          <p
            className="mt-5 text-lg max-w-xl mx-auto"
            style={{ color: "var(--color-brand-gray)" }}
          >
            Cada ferramenta resolve um problema específico da sua jornada —
            organizadas nas 4 fases de transformação.
          </p>
        </div>

        {/* Grupos por fase */}
        <div className="flex flex-col gap-14">
          {grupos.map((grupo, gi) => (
            <div key={grupo.fase} className="reveal" style={{ transitionDelay: `${gi * 80}ms` }}>

              {/* Título do grupo */}
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="rounded-full flex items-center justify-center text-xs font-bold"
                  style={{
                    width: 32,
                    height: 32,
                    background: grupo.cor,
                    color: "#fff",
                    fontFamily: "var(--font-heading)",
                    flexShrink: 0,
                  }}
                >
                  {grupo.fase}
                </div>
                <h3
                  style={{
                    color: "var(--color-brand-dark-green)",
                    fontSize: 18,
                    fontFamily: "var(--font-heading)",
                  }}
                >
                  {grupo.titulo}
                </h3>
                <div
                  className="flex-1"
                  style={{ height: 1, background: "var(--color-brand-border)" }}
                />
              </div>

              {/* Cards das ferramentas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {grupo.ferramentas.map((f, fi) => (
                  <div
                    key={f.codigo}
                    className="reveal rounded-xl p-5 flex flex-col gap-3 transition-all duration-300"
                    style={{
                      background: "#fafafa",
                      border: "1px solid var(--color-brand-border)",
                      transitionDelay: `${gi * 80 + fi * 50}ms`,
                      cursor: "default",
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget;
                      el.style.background = "#fff";
                      el.style.borderColor = grupo.cor;
                      el.style.boxShadow = `0 4px 20px ${grupo.cor}22`;
                      el.style.transform = "translateY(-3px)";
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget;
                      el.style.background = "#fafafa";
                      el.style.borderColor = "var(--color-brand-border)";
                      el.style.boxShadow = "none";
                      el.style.transform = "translateY(0)";
                    }}
                  >
                    {/* Emoji + código */}
                    <div className="flex items-center justify-between">
                      <span style={{ fontSize: 28, lineHeight: 1 }}>{f.emoji}</span>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 11,
                          fontWeight: 500,
                          color: grupo.cor,
                          background: `${grupo.cor}18`,
                          padding: "2px 7px",
                          borderRadius: 99,
                        }}
                      >
                        {f.codigo}
                      </span>
                    </div>

                    {/* Nome + descrição */}
                    <div>
                      <p
                        style={{
                          fontFamily: "var(--font-heading)",
                          fontWeight: 600,
                          fontSize: 15,
                          color: "var(--color-brand-dark-green)",
                          marginBottom: 4,
                        }}
                      >
                        {f.nome}
                      </p>
                      <p
                        style={{
                          fontSize: 13,
                          lineHeight: 1.55,
                          color: "var(--color-brand-gray)",
                        }}
                      >
                        {f.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* CTA ponte */}
        <div className="reveal text-center mt-16">
          <a href="#comecar" className="btn-primary text-base px-10 py-4">
            Quero Acesso às 16 Ferramentas →
          </a>
        </div>
      </div>
    </section>
  );
}