const TOTAL_DAYS = 13;
const STREAK = 12; // dias concluídos (o 13º é o dia atual — dourado com fogo)

const MESSAGES = [
  "Você está imparável. Não quebre agora!",
  "Consistência é o segredo da transformação.",
  "Cada dia conta. Continue assim!",
];

export default function StreakBar() {
  const message = MESSAGES[STREAK % MESSAGES.length];

  return (
    <div
      className="flex flex-col sm:flex-row sm:items-center gap-5 rounded-2xl px-6 py-5"
      style={{
        background: "#fff",
        border: "1px solid var(--color-brand-border)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      {/* Lado esquerdo — número + label */}
      <div className="flex items-center gap-4 flex-shrink-0">
        <div className="flex flex-col items-center justify-center rounded-2xl"
          style={{
            width: 64,
            height: 64,
            background: "linear-gradient(135deg, #1E392A 0%, #2D5A4F 100%)",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: 28,
              fontWeight: 700,
              color: "var(--color-brand-gold)",
              lineHeight: 1,
            }}
          >
            {STREAK + 1}
          </span>
          <span style={{ fontSize: 9, color: "rgba(244,241,222,0.6)", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "var(--font-body)" }}>
            dias
          </span>
        </div>

        <div>
          <p
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: 15,
              fontWeight: 700,
              color: "var(--color-brand-dark-green)",
              lineHeight: 1.2,
            }}
          >
            Sequência de dias
          </p>
          <p style={{ fontSize: 12, color: "var(--color-brand-gray)", marginTop: 3, fontFamily: "var(--font-body)" }}>
            Seu recorde pessoal: <strong style={{ color: "var(--color-brand-dark-green)" }}>18 dias</strong>
          </p>
        </div>
      </div>

      {/* Divisor vertical */}
      <div className="hidden sm:block self-stretch flex-shrink-0" style={{ width: 1, background: "var(--color-brand-border)" }} />

      {/* Círculos de dias */}
      <div className="flex items-center gap-2 flex-wrap flex-1">
        {Array.from({ length: TOTAL_DAYS }).map((_, i) => {
          const isDone = i < STREAK;       // dias anteriores concluídos
          const isCurrent = i === STREAK;  // dia atual (dourado com fogo)

          if (isCurrent) {
            return (
              <div
                key={i}
                className="relative flex items-center justify-center rounded-full flex-shrink-0"
                title={`Dia ${i + 1} — hoje`}
                style={{
                  width: 32,
                  height: 32,
                  background: "var(--color-brand-gold)",
                  boxShadow: "0 0 12px rgba(224,165,95,0.55)",
                }}
              >
                <span style={{ fontSize: 16, lineHeight: 1 }}>🔥</span>
                {/* Pulsação */}
                <span
                  className="absolute inset-0 rounded-full animate-ping"
                  style={{ background: "rgba(224,165,95,0.3)", animationDuration: "1.8s" }}
                />
              </div>
            );
          }

          if (isDone) {
            return (
              <div
                key={i}
                className="flex items-center justify-center rounded-full flex-shrink-0"
                title={`Dia ${i + 1} — concluído`}
                style={{
                  width: 32,
                  height: 32,
                  background: "#1E392A",
                }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="var(--color-brand-gold)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            );
          }

          // Dias futuros
          return (
            <div
              key={i}
              className="rounded-full flex-shrink-0"
              title={`Dia ${i + 1}`}
              style={{
                width: 32,
                height: 32,
                background: "rgba(30,57,42,0.06)",
                border: "1.5px dashed var(--color-brand-border)",
              }}
            />
          );
        })}
      </div>

      {/* Divisor vertical */}
      <div className="hidden sm:block self-stretch flex-shrink-0" style={{ width: 1, background: "var(--color-brand-border)" }} />

      {/* Mensagem motivacional */}
      <div className="flex-shrink-0 sm:max-w-[180px]">
        <p
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: 13,
            fontStyle: "italic",
            color: "var(--color-brand-dark-green)",
            lineHeight: 1.5,
          }}
        >
          "{message}"
        </p>
        <p style={{ fontSize: 11, color: "var(--color-brand-gold)", marginTop: 6, fontWeight: 600, fontFamily: "var(--font-body)", letterSpacing: "0.04em" }}>
          🏆 Top 5% esta semana
        </p>
      </div>
    </div>
  );
}
