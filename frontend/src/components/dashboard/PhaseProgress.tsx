import Link from "next/link";

// ─── Tipos e dados ────────────────────────────────────────────────────────────

type FaseConfig = {
  numero: string;
  nome: string;
  subtitulo: string;
  pct: number;
  cor: string;
  ativa: boolean;
};

const FASES: FaseConfig[] = [
  {
    numero: "01",
    nome: "Autoconhecimento",
    subtitulo: "Raio-X · Valores · SWOT · Feedback",
    pct: 75,
    cor: "#4a8c6a",
    ativa: true,
  },
  {
    numero: "02",
    nome: "Visão e Estratégia",
    subtitulo: "OKRs · Design de Vida · DRE · Rotina",
    pct: 40,
    cor: "#d4905a",
    ativa: false,
  },
  {
    numero: "03",
    nome: "Hábitos e Produtividade",
    subtitulo: "Auditoria · Arquiteto · Sprint · Energia",
    pct: 20,
    cor: "#5a7abf",
    ativa: false,
  },
  {
    numero: "04",
    nome: "Mentalidade",
    subtitulo: "Crenças · CRM · Diário · Recaída",
    pct: 5,
    cor: "#9b6baf",
    ativa: false,
  },
];

// ─── Componente ───────────────────────────────────────────────────────────────

export default function PhaseProgress() {
  return (
    <div className="flex flex-col gap-4">
      {/* Cabeçalho da seção */}
      <div className="flex items-center justify-between">
        <h3
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: 17,
            fontWeight: 700,
            color: "var(--color-brand-dark-green)",
          }}
        >
          Progresso por Fase
        </h3>
        <Link
          href="/ferramentas"
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--color-brand-gold)",
            textDecoration: "none",
          }}
        >
          Ver ferramentas →
        </Link>
      </div>

      {/* Grid 2×2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {FASES.map((fase, i) => (
          <Link
            key={fase.numero}
            href="/ferramentas"
            className="group"
            style={{ textDecoration: "none" }}
          >
            <div
              className="flex flex-col gap-3 rounded-2xl p-5 h-full transition-all duration-200 group-hover:shadow-md"
              style={{
                background: "#fff",
                border: `1px solid ${fase.ativa ? fase.cor + "44" : "var(--color-brand-border)"}`,
                boxShadow: fase.ativa
                  ? `0 2px 14px ${fase.cor}1a`
                  : "var(--shadow-card)",
              }}
            >
              {/* Topo: badge de fase + indicador ativa + percentual */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      fontWeight: 700,
                      color: fase.cor,
                      background: fase.cor + "18",
                      padding: "2px 8px",
                      borderRadius: 99,
                    }}
                  >
                    Fase {fase.numero}
                  </span>
                  {fase.ativa && (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        color: fase.cor,
                        fontFamily: "var(--font-body)",
                      }}
                    >
                      ● Ativa
                    </span>
                  )}
                </div>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 22,
                    fontWeight: 700,
                    color: fase.pct >= 50 ? fase.cor : "var(--color-brand-gray)",
                    lineHeight: 1,
                  }}
                >
                  {fase.pct}%
                </span>
              </div>

              {/* Nome + subtítulo */}
              <div>
                <p
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: 16,
                    fontWeight: 700,
                    color: "var(--color-brand-dark-green)",
                    lineHeight: 1.2,
                  }}
                >
                  {fase.nome}
                </p>
                <p
                  style={{
                    fontSize: 11,
                    color: "var(--color-brand-gray)",
                    marginTop: 4,
                    lineHeight: 1.5,
                  }}
                >
                  {fase.subtitulo}
                </p>
              </div>

              {/* Barra de progresso */}
              <div
                className="relative rounded-full overflow-hidden"
                style={{ height: 6, background: "rgba(30,57,42,0.08)" }}
              >
                <div
                  className="absolute left-0 top-0 h-full rounded-full"
                  style={{
                    width: `${fase.pct}%`,
                    background: fase.cor,
                    animation: `growWidth 0.8s ease ${i * 150}ms both`,
                  }}
                />
              </div>

              {/* Rodapé */}
              <div className="flex items-center justify-between mt-auto">
                <span style={{ fontSize: 11, color: "var(--color-brand-gray)" }}>
                  4 ferramentas
                </span>
                <span
                  className="transition-transform duration-200 group-hover:translate-x-0.5"
                  style={{ fontSize: 12, color: fase.cor, fontWeight: 600 }}
                >
                  Acessar →
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <style>{`@keyframes growWidth { from { width: 0% } }`}</style>
    </div>
  );
}
