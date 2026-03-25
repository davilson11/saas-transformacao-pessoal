const FASES = [
  { numero: "01", nome: "Autoconhecimento",  pct: 75 },
  { numero: "02", nome: "Visão e Metas",     pct: 40 },
  { numero: "03", nome: "Hábitos e Rotina",  pct: 20 },
  { numero: "04", nome: "Mentalidade",       pct:  5 },
];

export default function PhaseProgress() {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "#fff",
        border: "1px solid var(--color-brand-border)",
        boxShadow: "var(--shadow-card)",
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
          Progresso por Fase
        </h3>
        <p style={{ fontSize: 12, color: "var(--color-brand-gray)", marginTop: 3 }}>
          Jornada de 12 meses — 4 fases progressivas
        </p>
      </div>

      {/* Fases */}
      <div className="flex flex-col gap-5 px-6 py-5">
        {FASES.map((fase, i) => (
          <div key={fase.numero} className="flex flex-col gap-2">
            {/* Número + nome + percentual */}
            <div className="flex items-center gap-3">
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  fontWeight: 700,
                  color: "var(--color-brand-gold)",
                  minWidth: 24,
                }}
              >
                {fase.numero}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 14,
                  fontWeight: 500,
                  color: "var(--color-brand-dark-green)",
                  flex: 1,
                }}
              >
                {fase.nome}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 13,
                  fontWeight: 700,
                  color: fase.pct >= 50
                    ? "var(--color-brand-dark-green)"
                    : "var(--color-brand-gray)",
                  minWidth: 36,
                  textAlign: "right",
                }}
              >
                {fase.pct}%
              </span>
            </div>

            {/* Barra de progresso */}
            <div
              className="relative rounded-full overflow-hidden"
              style={{ height: 8, background: "rgba(30,57,42,0.08)" }}
            >
              <div
                className="absolute left-0 top-0 h-full rounded-full"
                style={{
                  width: `${fase.pct}%`,
                  background: fase.pct === 100
                    ? "#27AE60"
                    : i === 0
                    ? "#1E392A"
                    : `rgba(30,57,42,${0.85 - i * 0.18})`,
                  animation: `growWidth 0.8s ease ${i * 150}ms both`,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        className="px-6 py-3 flex items-center gap-2"
        style={{
          borderTop: "1px solid var(--color-brand-border)",
          background: "rgba(30,57,42,0.02)",
        }}
      >
        <div
          className="rounded-full"
          style={{ width: 8, height: 8, background: "var(--color-brand-gold)", flexShrink: 0 }}
        />
        <p style={{ fontSize: 12, color: "var(--color-brand-gray)" }}>
          Fase ativa:{" "}
          <strong style={{ color: "var(--color-brand-dark-green)" }}>
            01 — Autoconhecimento
          </strong>
        </p>
      </div>

      <style>{`
        @keyframes growWidth {
          from { width: 0% }
        }
      `}</style>
    </div>
  );
}
