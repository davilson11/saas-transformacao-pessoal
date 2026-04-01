"use client";

import { useEffect, useRef } from "react";

const beneficios = [
  "16 ferramentas guiadas e prontas para usar",
  "4 fases de transformação progressiva",
  "Raio-X 360° das suas áreas de vida",
  "Plano de 12 meses personalizado",
  "Rotina ideal com blocos de tempo",
  "Controle financeiro integrado",
  "Revisões mensais estruturadas",
  "Acesso vitalício — sem assinatura",
  "Atualizações gratuitas para sempre",
];

const depoimentos = [
  {
    nome: "Ana Vitória",
    profissao: "Designer, 28 anos",
    texto:
      "Em 3 meses já tinha clareza suficiente para pedir demissão e abrir meu negócio. O sistema me deu a estrutura que eu não conseguia criar sozinha.",
    avatar: "AV",
    cor: "#4a8c6a",
  },
  {
    nome: "Lucas Mendes",
    profissao: "Engenheiro, 34 anos",
    texto:
      "Finalmente consegui parar de procrastinar e colocar meus planos em prática. As ferramentas de revisão mensal mudaram completamente minha relação com metas.",
    avatar: "LM",
    cor: "#5a7abf",
  },
  {
    nome: "Rafaela Santos",
    profissao: "Professora, 31 anos",
    texto:
      "O Mapa de Valores foi um divisor de águas. Percebi que estava perseguindo objetivos que não eram meus. Hoje vivo muito mais alinhada.",
    avatar: "RS",
    cor: "#af6b5a",
  },
];

export default function Pricing() {
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
      id="comecar"
      className="section-dark py-24 px-4"
      ref={containerRef}
    >
      <div className="container">

        {/* Depoimentos */}
        <div className="reveal text-center mb-16">
          <div className="badge badge-white mb-4">O que dizem os alunos</div>
          <h2 style={{ color: "var(--color-brand-cream)" }}>
            Resultados{" "}
            <span style={{ color: "var(--color-brand-gold)", fontStyle: "italic" }}>
              reais
            </span>
          </h2>
          <div className="divider-gold" />
        </div>

        <div className="reveal grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {depoimentos.map((d, i) => (
            <div
              key={d.nome}
              className="rounded-2xl p-6 flex flex-col gap-4"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                transitionDelay: `${i * 80}ms`,
              }}
            >
              <p
                style={{
                  fontSize: 15,
                  lineHeight: 1.7,
                  color: "rgba(244,241,222,0.8)",
                  fontStyle: "italic",
                }}
              >
                "{d.texto}"
              </p>
              <div className="flex items-center gap-3 mt-auto">
                <div
                  className="rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{
                    width: 40,
                    height: 40,
                    background: d.cor,
                    color: "#fff",
                    fontFamily: "var(--font-heading)",
                  }}
                >
                  {d.avatar}
                </div>
                <div>
                  <p
                    style={{
                      fontWeight: 600,
                      fontSize: 14,
                      color: "var(--color-brand-cream)",
                    }}
                  >
                    {d.nome}
                  </p>
                  <p style={{ fontSize: 12, color: "rgba(244,241,222,0.5)" }}>
                    {d.profissao}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Título da seção de preço */}
        <div className="reveal text-center mb-10">
          <h2 style={{ color: "var(--color-brand-cream)" }}>
            Comece Sua Transformação Hoje
          </h2>
          <div className="divider-gold" />
          <p
            className="mt-4 text-base"
            style={{ color: "rgba(244,241,222,0.6)" }}
          >
            Um investimento único. Sem assinatura. Acesso vitalício.
          </p>
        </div>

        {/* Card de pricing */}
        <div className="reveal flex justify-center">
          <div
            className="w-full max-w-md rounded-3xl overflow-hidden"
            style={{
              background: "#fff",
              boxShadow: "0 24px 64px rgba(0,0,0,0.35)",
            }}
          >
            {/* Faixa topo */}
            <div
              className="py-3 px-6 text-center text-sm font-bold tracking-wider"
              style={{
                background: "var(--color-brand-gold)",
                color: "var(--color-brand-dark-green)",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                fontSize: 12,
              }}
            >
              ✦ Oferta de lançamento — Vagas limitadas ✦
            </div>

            <div className="p-8">
              {/* Nome do produto */}
              <p
                className="text-center mb-1"
                style={{
                  fontFamily: "var(--font-heading)",
                  fontWeight: 700,
                  fontSize: 22,
                  color: "var(--color-brand-dark-green)",
                }}
              >
                Kairos
              </p>
              <p
                className="text-center mb-6"
                style={{ fontSize: 14, color: "var(--color-brand-gray)" }}
              >
                Sistema Completo de Transformação de Vida
              </p>

              {/* Preço */}
              <div className="text-center mb-8">
                <div
                  className="flex items-center justify-center gap-3 mb-1"
                >
                  <span
                    style={{
                      fontSize: 15,
                      color: "var(--color-brand-gray)",
                      textDecoration: "line-through",
                    }}
                  >
                    De R$&nbsp;297
                  </span>
                  <span
                    className="badge badge-gold"
                    style={{ fontSize: 11 }}
                  >
                    −33%
                  </span>
                </div>
                <div className="flex items-end justify-center gap-1">
                  <span
                    style={{
                      fontFamily: "var(--font-body)",
                      fontWeight: 500,
                      fontSize: 18,
                      color: "var(--color-brand-dark-green)",
                      marginBottom: 10,
                    }}
                  >
                    R$
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontWeight: 700,
                      fontSize: 64,
                      lineHeight: 1,
                      color: "var(--color-brand-dark-green)",
                    }}
                  >
                    197
                  </span>
                </div>
                <p style={{ fontSize: 13, color: "var(--color-brand-gray)" }}>
                  Pagamento único · Acesso vitalício
                </p>
              </div>

              {/* Benefícios */}
              <ul className="flex flex-col gap-3 mb-8">
                {beneficios.map((b) => (
                  <li key={b} className="flex items-start gap-3">
                    <span
                      className="flex-shrink-0 rounded-full flex items-center justify-center"
                      style={{
                        width: 20,
                        height: 20,
                        background: "rgba(30,57,42,0.08)",
                        color: "var(--color-brand-dark-green)",
                        fontSize: 11,
                        fontWeight: 700,
                        marginTop: 1,
                      }}
                    >
                      ✓
                    </span>
                    <span
                      style={{
                        fontSize: 14,
                        lineHeight: 1.5,
                        color: "var(--color-brand-dark-green)",
                      }}
                    >
                      {b}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA principal */}
              <a
                href="#"
                className="btn-gold w-full text-center text-base py-4 justify-center"
                style={{
                  display: "flex",
                  borderRadius: 12,
                  animation: "pulse-glow 3s ease-in-out infinite",
                }}
              >
                Quero o Kairos Agora →
              </a>

              {/* Segurança */}
              <div
                className="flex flex-col items-center gap-2 mt-5"
                style={{ color: "var(--color-brand-gray)", fontSize: 12 }}
              >
                <div className="flex items-center gap-2">
                  <span>🔒</span>
                  <span>Compra 100% segura · SSL</span>
                </div>
                <div
                  className="flex items-center justify-center gap-2 mt-1 rounded-xl py-3 px-4 w-full"
                  style={{
                    background: "rgba(39,174,96,0.08)",
                    border: "1px solid rgba(39,174,96,0.2)",
                  }}
                >
                  <span style={{ fontSize: 18 }}>🛡️</span>
                  <div>
                    <p
                      style={{
                        fontWeight: 600,
                        fontSize: 13,
                        color: "#1a7a40",
                      }}
                    >
                      Garantia de 7 dias
                    </p>
                    <p style={{ fontSize: 12, color: "#4a9a60" }}>
                      Não gostou? Reembolso total, sem perguntas.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ rápido */}
        <div className="reveal grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16 text-center">
          {[
            { icon: "📱", titulo: "Qual plataforma?", resp: "Notion — disponível em todas as plataformas, mobile e desktop." },
            { icon: "⏱️", titulo: "Quanto tempo leva?", resp: "Cada ferramenta leva de 20 a 60 minutos. Você vai no seu ritmo." },
            { icon: "🔄", titulo: "Posso usar todo ano?", resp: "Sim! O sistema foi projetado para ser revisado e reiniciado anualmente." },
          ].map((faq) => (
            <div
              key={faq.titulo}
              className="rounded-2xl p-6"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <span style={{ fontSize: 28 }}>{faq.icon}</span>
              <p
                className="mt-3 mb-2 font-semibold text-sm"
                style={{ color: "var(--color-brand-cream)" }}
              >
                {faq.titulo}
              </p>
              <p style={{ fontSize: 13, color: "rgba(244,241,222,0.55)", lineHeight: 1.6 }}>
                {faq.resp}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}