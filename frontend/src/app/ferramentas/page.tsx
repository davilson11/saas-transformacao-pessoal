import Link from "next/link";

// ─── Tipos ───────────────────────────────────────────────────────────────────

type Status = "disponivel" | "em-breve";

type Ferramenta = {
  codigo: string;
  slug: string;
  emoji: string;
  nome: string;
  descricao: string;
  frequencia: string;
  status: Status;
};

type Fase = {
  numero: string;
  titulo: string;
  descricao: string;
  cor: string;
  ferramentas: Ferramenta[];
};

// ─── Dados ───────────────────────────────────────────────────────────────────

const FASES: Fase[] = [
  {
    numero: "01",
    titulo: "Autoconhecimento",
    descricao: "Descubra quem você é, onde está e o que realmente importa.",
    cor: "#4a8c6a",
    ferramentas: [
      {
        codigo: "F01",
        slug: "raio-x",
        emoji: "🎯",
        nome: "Raio-X 360°",
        descricao: "Diagnóstico completo das 8 áreas da sua vida para saber exatamente onde você está hoje.",
        frequencia: "Anual",
        status: "disponivel",
      },
      {
        codigo: "F02",
        slug: "bussola-valores",
        emoji: "🧭",
        nome: "Bússola de Valores",
        descricao: "Identifique os valores que guiam suas decisões e alinhe sua vida ao que é essencial para você.",
        frequencia: "Anual",
        status: "disponivel",
      },
      {
        codigo: "F03",
        slug: "swot-pessoal",
        emoji: "⭐",
        nome: "SWOT Pessoal",
        descricao: "Mapeie suas forças, fraquezas, oportunidades e ameaças para tomar decisões mais estratégicas.",
        frequencia: "Semestral",
        status: "disponivel",
      },
      {
        codigo: "F04",
        slug: "feedback-360",
        emoji: "🔮",
        nome: "Feedback 360°",
        descricao: "Colete perspectivas de pessoas próximas para enxergar pontos cegos e acelerar seu crescimento.",
        frequencia: "Semestral",
        status: "disponivel",
      },
    ],
  },
  {
    numero: "02",
    titulo: "Visão e Estratégia",
    descricao: "Defina metas concretas e construa o plano que transforma visão em realidade.",
    cor: "#d4905a",
    ferramentas: [
      {
        codigo: "F05",
        slug: "okrs-pessoais",
        emoji: "📊",
        nome: "OKRs Pessoais",
        descricao: "Defina objetivos ambiciosos e resultados-chave mensuráveis para cada trimestre.",
        frequencia: "Trimestral",
        status: "disponivel",
      },
      {
        codigo: "F06",
        slug: "design-vida",
        emoji: "📅",
        nome: "Design de Vida",
        descricao: "Visualize seu dia perfeito e trace horizontes de 1, 5 e 10 anos com clareza e intenção.",
        frequencia: "Anual",
        status: "disponivel",
      },
      {
        codigo: "F07",
        slug: "dre-pessoal",
        emoji: "💰",
        nome: "DRE Pessoal",
        descricao: "Demonstrativo financeiro pessoal com receitas, custos, lucro líquido e metas de patrimônio.",
        frequencia: "Mensal",
        status: "disponivel",
      },
      {
        codigo: "F08",
        slug: "rotina-ideal",
        emoji: "🌅",
        nome: "Rotina Ideal",
        descricao: "Monte blocos de tempo para manhã, tarde e noite que maximizam sua energia e foco.",
        frequencia: "Semanal",
        status: "disponivel",
      },
    ],
  },
  {
    numero: "03",
    titulo: "Hábitos e Produtividade",
    descricao: "Construa a base diária que sustenta a transformação ao longo dos 12 meses.",
    cor: "#5a7abf",
    ferramentas: [
      {
        codigo: "F09",
        slug: "auditoria-tempo",
        emoji: "⏱",
        nome: "Auditoria de Tempo",
        descricao: "Inventarie como você usa seu tempo, classifique atividades e redesenhe sua semana ideal.",
        frequencia: "Mensal",
        status: "disponivel",
      },
      {
        codigo: "F10",
        slug: "arquiteto-rotinas",
        emoji: "🏗",
        nome: "Arquiteto de Rotinas",
        descricao: "Construa rituais matinais, blocos produtivos e rituais noturnos com rastreador semanal.",
        frequencia: "Semanal",
        status: "disponivel",
      },
      {
        codigo: "F11",
        slug: "sprint-aprendizado",
        emoji: "🎓",
        nome: "Sprint de Aprendizado",
        descricao: "Domine uma habilidade em 30 dias com recursos, projetos práticos e tracker diário.",
        frequencia: "Mensal",
        status: "disponivel",
      },
      {
        codigo: "F12",
        slug: "energia-vitalidade",
        emoji: "⚡",
        nome: "Energia e Vitalidade",
        descricao: "Diagnostique as 4 dimensões da energia — física, mental, emocional e espiritual.",
        frequencia: "Semanal",
        status: "disponivel",
      },
    ],
  },
  {
    numero: "04",
    titulo: "Mentalidade e Sustentabilidade",
    descricao: "Elimine bloqueios, consolide conquistas e garanta que a transformação dure.",
    cor: "#9b6baf",
    ferramentas: [
      {
        codigo: "F13",
        slug: "desconstrutor-crencas",
        emoji: "🧠",
        nome: "Desconstrutor de Crenças",
        descricao: "Identifique e desconstrua até 3 crenças limitantes com 9 perguntas socráticas e mantras.",
        frequencia: "Mensal",
        status: "disponivel",
      },
      {
        codigo: "F14",
        slug: "crm-relacionamentos",
        emoji: "🤝",
        nome: "CRM de Relacionamentos",
        descricao: "Mapeie 10 contatos-chave, defina frequência ideal e receba alertas de quem precisa de atenção.",
        frequencia: "Mensal",
        status: "disponivel",
      },
      {
        codigo: "F15",
        slug: "diario-bordo",
        emoji: "📔",
        nome: "Diário de Bordo",
        descricao: "Ritual matinal + noturno + revisão semanal com histórico visual dos últimos 7 dias.",
        frequencia: "Diária",
        status: "disponivel",
      },
      {
        codigo: "F16",
        slug: "prevencao-recaida",
        emoji: "🛡",
        nome: "Prevenção de Recaída",
        descricao: "Planos SE-ENTÃO para 7 cenários de risco, protocolo de recuperação e sistema de recompensas.",
        frequencia: "Mensal",
        status: "disponivel",
      },
    ],
  },
];

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function FrequenciaBadge({ frequencia }: { frequencia: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    Diária:      { bg: "rgba(30,57,42,0.08)",   color: "#1E392A" },
    Semanal:     { bg: "rgba(41,128,185,0.10)",  color: "#2980B9" },
    Mensal:      { bg: "rgba(224,165,95,0.15)",  color: "#a0692d" },
    Trimestral:  { bg: "rgba(155,107,175,0.12)", color: "#7b4b8f" },
    Semestral:   { bg: "rgba(220,90,90,0.10)",   color: "#b03030" },
    Anual:       { bg: "rgba(39,174,96,0.10)",   color: "#1a7a40" },
  };
  const s = map[frequencia] ?? map["Mensal"];
  return (
    <span
      style={{
        fontFamily: "var(--font-body)",
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: "0.05em",
        textTransform: "uppercase",
        padding: "3px 8px",
        borderRadius: 99,
        background: s.bg,
        color: s.color,
        whiteSpace: "nowrap",
      }}
    >
      {frequencia}
    </span>
  );
}

function FerramentaCard({ f, faseCor }: { f: Ferramenta; faseCor: string }) {
  const disponivel = f.status === "disponivel";

  const inner = (
    <div
      className="group relative flex flex-col gap-4 rounded-2xl p-5 h-full transition-all duration-300"
      style={{
        background: "#fff",
        border: `1px solid var(--color-brand-border)`,
        boxShadow: "var(--shadow-card)",
        opacity: disponivel ? 1 : 0.72,
        cursor: disponivel ? "pointer" : "default",
      }}
    >
      {/* Hover overlay — só para disponíveis */}
      {disponivel && (
        <div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{ border: `1.5px solid ${faseCor}`, boxShadow: `0 4px 20px ${faseCor}22` }}
        />
      )}

      {/* Topo: emoji + código + status */}
      <div className="flex items-start justify-between gap-2">
        <div
          className="flex items-center justify-center rounded-xl flex-shrink-0"
          style={{ width: 44, height: 44, background: `${faseCor}18`, fontSize: 22 }}
        >
          {f.emoji}
        </div>
        <div className="flex items-center gap-2">
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              fontWeight: 600,
              color: "var(--color-brand-gold)",
              background: "rgba(224,165,95,0.12)",
              padding: "2px 7px",
              borderRadius: 99,
            }}
          >
            {f.codigo}
          </span>
          {!disponivel && (
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 10,
                fontWeight: 600,
                color: "#6B7280",
                background: "rgba(107,114,128,0.1)",
                padding: "2px 7px",
                borderRadius: 99,
                letterSpacing: "0.04em",
              }}
            >
              Em breve
            </span>
          )}
        </div>
      </div>

      {/* Nome + descrição */}
      <div className="flex flex-col gap-1 flex-1">
        <h3
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: 16,
            fontWeight: 700,
            color: "var(--color-brand-dark-green)",
            lineHeight: 1.25,
          }}
        >
          {f.nome}
        </h3>
        <p
          style={{
            fontSize: 13,
            lineHeight: 1.6,
            color: "var(--color-brand-gray)",
          }}
        >
          {f.descricao}
        </p>
      </div>

      {/* Rodapé: frequência + seta */}
      <div className="flex items-center justify-between mt-auto pt-3"
        style={{ borderTop: "1px solid var(--color-brand-border)" }}>
        <FrequenciaBadge frequencia={f.frequencia} />
        {disponivel && (
          <span
            className="text-sm font-semibold transition-transform duration-200 group-hover:translate-x-1"
            style={{ color: faseCor }}
          >
            Abrir →
          </span>
        )}
      </div>
    </div>
  );

  if (!disponivel) return inner;

  return (
    <Link href={`/ferramentas/${f.slug}`} className="block h-full" style={{ textDecoration: "none" }}>
      {inner}
    </Link>
  );
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function FeramentasPage() {
  const total = FASES.flatMap((f) => f.ferramentas).length;
  const disponiveis = FASES.flatMap((f) => f.ferramentas).filter((f) => f.status === "disponivel").length;

  return (
    <div style={{ background: "#f7f5ee", minHeight: "100vh" }}>
      {/* Header da página */}
      <div
        className="py-16"
        style={{
          background: "linear-gradient(135deg, #1E392A 0%, #2D5A4F 100%)",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", textAlign: "center" }}>
          <span className="badge badge-white mb-4">Sistema Completo</span>
          <h1
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(28px, 5vw, 44px)",
              fontWeight: 700,
              color: "var(--color-brand-cream)",
              lineHeight: 1.15,
              marginBottom: 12,
              textAlign: "center",
            }}
          >
            16 Ferramentas para{" "}
            <span style={{ color: "var(--color-brand-gold)", fontStyle: "italic" }}>
              Transformar Sua Vida
            </span>
          </h1>
          <p style={{ fontSize: 15, color: "rgba(244,241,222,0.7)", lineHeight: 1.65 }}>
            Organizadas em 4 fases progressivas. Cada ferramenta resolve um problema
            específico da sua jornada de 12 meses.
          </p>
          {/* Contadores */}
          <div className="flex items-center justify-center gap-6 mt-8">
            {[
              { valor: `${disponiveis}`, label: "Disponíveis" },
              { valor: `${total - disponiveis}`, label: "Em breve" },
              { valor: "4", label: "Fases" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: 28,
                    fontWeight: 700,
                    color: "var(--color-brand-gold)",
                    lineHeight: 1,
                  }}
                >
                  {s.valor}
                </p>
                <p style={{ fontSize: 11, color: "rgba(244,241,222,0.5)", marginTop: 4, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fases */}
      <div className="py-12 flex flex-col gap-14">
        {FASES.map((fase) => (
          <section key={fase.numero}>
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
            {/* Cabeçalho da fase */}
            <div className="flex items-start gap-4 mb-6">
              <div
                className="flex items-center justify-center rounded-xl flex-shrink-0 font-bold"
                style={{
                  width: 40,
                  height: 40,
                  background: fase.cor,
                  color: "#fff",
                  fontFamily: "var(--font-heading)",
                  fontSize: 14,
                }}
              >
                {fase.numero}
              </div>
              <div>
                <h2
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "clamp(20px, 3vw, 26px)",
                    fontWeight: 700,
                    color: "var(--color-brand-dark-green)",
                    lineHeight: 1.2,
                  }}
                >
                  Fase {fase.numero} — {fase.titulo}
                </h2>
                <p style={{ fontSize: 14, color: "var(--color-brand-gray)", marginTop: 4 }}>
                  {fase.descricao}
                </p>
              </div>
            </div>

            {/* Grid de ferramentas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {fase.ferramentas.map((f) => (
                <FerramentaCard key={f.codigo} f={f} faseCor={fase.cor} />
              ))}
            </div>
            </div>
          </section>
        ))}
      </div>

      {/* Footer CTA */}
      <div className="py-16" style={{ borderTop: "1px solid var(--color-brand-border)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", textAlign: "center" }}>
          <p style={{ fontSize: 14, color: "var(--color-brand-gray)", marginBottom: 16 }}>
            Comece pela Fase 01 — cada ferramenta leva de 20 a 60 minutos.
          </p>
          <Link href="/ferramentas/raio-x" className="btn-gold" style={{ textDecoration: "none" }}>
            Começar com o Raio-X 360° →
          </Link>
        </div>
      </div>
    </div>
  );
}
