const SCORE = 86;
const RADIUS = 54;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const FILL = CIRCUMFERENCE * (1 - SCORE / 100);

const METRICAS = [
  { label: "Sequência",        valor: "12",  unidade: "dias" },
  { label: "Ferramentas",      valor: "4",   unidade: "/16"  },
  { label: "Ações Concluídas", valor: "3",   unidade: "/6"   },
];

function scoreCor(s: number): string {
  if (s >= 80) return "#27AE60";
  if (s >= 50) return "#D97706";
  return "#C0392B";
}

export default function VitalityScore() {
  const cor = scoreCor(SCORE);

  return (
    <div
      className="flex flex-col rounded-2xl overflow-hidden"
      style={{
        background: "#fff",
        border: "1px solid var(--color-brand-border)",
        boxShadow: "var(--shadow-card)",
        height: "100%",
      }}
    >
      {/* Header */}
      <div
        className="px-6 py-4"
        style={{ borderBottom: "1px solid var(--color-brand-border)" }}
      >
        <h3
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: 17,
            fontWeight: 700,
            color: "var(--color-brand-dark-green)",
            lineHeight: 1.2,
          }}
        >
          Vitality Score
        </h3>
        <p style={{ fontSize: 12, color: "var(--color-brand-gray)", marginTop: 3 }}>
          Pontuação de Vitalidade
        </p>
      </div>

      {/* Conteúdo central */}
      <div className="flex flex-col items-center justify-center flex-1 px-6 py-6 gap-4">
        {/* Círculo SVG */}
        <div className="relative flex items-center justify-center">
          <svg
            width="148"
            height="148"
            viewBox="0 0 148 148"
            fill="none"
            style={{ transform: "rotate(-90deg)" }}
          >
            {/* Trilha */}
            <circle
              cx="74"
              cy="74"
              r={RADIUS}
              stroke="rgba(30,57,42,0.08)"
              strokeWidth="10"
              fill="none"
            />
            {/* Progresso dourado */}
            <circle
              cx="74"
              cy="74"
              r={RADIUS}
              stroke="var(--color-brand-gold)"
              strokeWidth="10"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={FILL}
              style={{ transition: "stroke-dashoffset 1s ease" }}
            />
          </svg>

          {/* Número centralizado sobre o SVG */}
          <div
            className="absolute flex flex-col items-center"
            style={{ transform: "rotate(0deg)" }}
          >
            <span
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: 42,
                fontWeight: 700,
                color: "#1E392A",
                lineHeight: 1,
              }}
            >
              {SCORE}
            </span>
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 11,
                color: cor,
                fontWeight: 600,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                marginTop: 4,
              }}
            >
              {SCORE >= 80 ? "Excelente" : SCORE >= 50 ? "Bom" : "Atenção"}
            </span>
          </div>
        </div>

        {/* Descrição */}
        <p
          className="text-center"
          style={{
            fontSize: 12,
            color: "var(--color-brand-gray)",
            lineHeight: 1.6,
            maxWidth: 200,
          }}
        >
          Baseado nas suas ações e progresso diário
        </p>
      </div>

      {/* Métricas */}
      <div
        className="grid grid-cols-3 divide-x divide-brand-border"
        style={{ borderTop: "1px solid var(--color-brand-border)" }}
      >
        {METRICAS.map((m) => (
          <div
            key={m.label}
            className="flex flex-col items-center justify-center py-4 gap-0.5"
          >
            <div className="flex items-baseline gap-0.5">
              <span
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: 20,
                  fontWeight: 700,
                  color: "var(--color-brand-dark-green)",
                  lineHeight: 1,
                }}
              >
                {m.valor}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color: "var(--color-brand-gray)",
                }}
              >
                {m.unidade}
              </span>
            </div>
            <span
              style={{
                fontSize: 10,
                color: "var(--color-brand-gray)",
                fontFamily: "var(--font-body)",
                textAlign: "center",
                lineHeight: 1.3,
              }}
            >
              {m.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
