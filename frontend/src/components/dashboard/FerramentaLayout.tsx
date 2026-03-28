'use client';

import Link from "next/link";
import { BookOpen, ChevronRight, ArrowRight, CheckCircle, Circle } from "lucide-react";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type Etapa = {
  label: string;
  descricao?: string;
};

type FerramentaLayoutProps = {
  /** Código exibido no badge: "F01", "F02", etc. */
  codigo: string;
  /** Nome exibido no breadcrumb e na sidebar */
  nome: string;
  /** Descrição curta na sidebar */
  descricao: string;
  /** Lista de etapas da ferramenta */
  etapas: Etapa[];
  /** Índice da etapa atual (0-based) */
  etapaAtual: number;
  /** Percentual de progresso 0–100 */
  progresso: number;
  /** Callback do botão principal (Continuar / Salvar) */
  onAvancar: () => void;
  /** Callback do botão Voltar (omitido na etapa 0) */
  onVoltar?: () => void;
  /** Habilita ou desabilita o botão Continuar */
  podeAvancar?: boolean;
  /** Label do botão de ação principal */
  labelAvancar?: string;
  /** Contador opcional exibido na topbar (itens preenchidos, fontes, etc.) */
  totalItens?: number;
  /** Label do contador */
  labelItens?: string;
  /** Conteúdo da área central */
  children: React.ReactNode;
  /** Conteúdo do painel lateral direito */
  resumo?: React.ReactNode;
};

// ─── Constantes ───────────────────────────────────────────────────────────────

const COR_SIDEBAR = "#1a5c3a";
const COR_GOLD    = "#b5840a";
const COR_CREAM   = "#f5f4f0";

// ─── Componente ───────────────────────────────────────────────────────────────

export default function FerramentaLayout({
  codigo,
  nome,
  descricao,
  etapas,
  etapaAtual,
  progresso,
  onAvancar,
  onVoltar,
  podeAvancar = true,
  labelAvancar,
  totalItens,
  labelItens = "itens",
  children,
  resumo,
}: FerramentaLayoutProps) {
  const isUltimaEtapa = etapaAtual === etapas.length - 1;

  const btnLabel = labelAvancar
    ?? (etapaAtual === 0
      ? "Começar →"
      : isUltimaEtapa
      ? `Salvar ${nome.split(" ")[0]} ✓`
      : "Continuar →");

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: COR_CREAM,
      }}
    >
      {/* ══════════════════════════════════════════════════════════════
          TOPBAR
      ══════════════════════════════════════════════════════════════ */}
      <header
        className="sticky top-0 z-30 flex items-center gap-4 px-5"
        style={{
          height: 52,
          background: COR_SIDEBAR,
          borderBottom: `1px solid rgba(255,255,255,0.08)`,
          boxShadow: "0 2px 12px rgba(0,0,0,0.18)",
        }}
      >
        {/* Breadcrumb */}
        <nav
          className="flex items-center gap-1.5 flex-1 min-w-0"
          style={{ fontFamily: "var(--font-body)", fontSize: 12 }}
        >
          <Link
            href="/ferramentas"
            className="transition-opacity duration-150 hover:opacity-100 whitespace-nowrap"
            style={{ color: "rgba(245,244,240,0.55)", textDecoration: "none" }}
          >
            Ferramentas
          </Link>
          <span style={{ color: "rgba(245,244,240,0.3)", display: "flex", alignItems: "center" }}>
            <ChevronRight size={12} />
          </span>
          <span
            className="truncate"
            style={{ color: "rgba(245,244,240,0.9)", fontWeight: 500 }}
          >
            {nome}
          </span>

          {/* Badge código */}
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              fontWeight: 700,
              color: COR_GOLD,
              background: `${COR_GOLD}22`,
              border: `1px solid ${COR_GOLD}44`,
              padding: "2px 8px",
              borderRadius: 99,
              marginLeft: 6,
              letterSpacing: "0.04em",
              flexShrink: 0,
            }}
          >
            {codigo}
          </span>
        </nav>

        {/* Progresso + contador */}
        <div className="flex items-center gap-4 shrink-0">
          {/* Barra de progresso */}
          <div className="hidden sm:flex items-center gap-2.5">
            <div
              className="relative rounded-full overflow-hidden"
              style={{ width: 140, height: 5, background: "rgba(255,255,255,0.12)" }}
            >
              <div
                className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
                style={{
                  width: `${progresso}%`,
                  background: `linear-gradient(90deg, ${COR_GOLD}, #e8b84b)`,
                  boxShadow: `0 0 8px ${COR_GOLD}60`,
                }}
              />
            </div>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                fontWeight: 600,
                color: progresso >= 100 ? "#4dbb7a" : "rgba(245,244,240,0.8)",
                minWidth: 32,
              }}
            >
              {progresso}%
            </span>
          </div>

          {/* Contador de itens */}
          {totalItens !== undefined && totalItens > 0 && (
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 11,
                fontWeight: 600,
                color: "rgba(245,244,240,0.7)",
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.12)",
                padding: "3px 10px",
                borderRadius: 99,
              }}
            >
              {totalItens} {labelItens}
            </span>
          )}
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════════
          CORPO  (sidebar + central + painel)
      ══════════════════════════════════════════════════════════════ */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Sidebar Esquerda ── */}
        <aside
          className="flex flex-col shrink-0 overflow-y-auto"
          style={{
            width: 220,
            background: COR_SIDEBAR,
            borderRight: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {/* Logo */}
          <div
            className="flex flex-col gap-0.5 px-5 pt-6 pb-5"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
          >
            <span
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: 20,
                fontWeight: 400,
                color: "#f5f4f0",
                letterSpacing: "-0.01em",
                fontStyle: "italic",
                lineHeight: 1.1,
              }}
            >
              A Virada
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 9,
                fontWeight: 500,
                color: COR_GOLD,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              {codigo} · {nome}
            </span>
          </div>

          {/* Descrição */}
          <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 14,
                color: "rgba(245,244,240,0.55)",
                lineHeight: 1.55,
              }}
            >
              {descricao}
            </p>
          </div>

          {/* Etapas */}
          <nav className="flex flex-col gap-1 px-3 py-4 flex-1">
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 12,
                fontWeight: 600,
                color: "rgba(245,244,240,0.35)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                paddingLeft: 8,
                marginBottom: 4,
              }}
            >
              Etapas
            </p>

            {etapas.map((etapa, idx) => {
              const ativa    = etapaAtual === idx;
              const concluida = etapaAtual > idx;
              const pendente = etapaAtual < idx;

              return (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 rounded-lg px-2.5 py-2.5 transition-all duration-200"
                  style={{
                    background: ativa
                      ? "rgba(245,244,240,0.1)"
                      : "transparent",
                    opacity: pendente ? 0.45 : 1,
                    cursor: concluida ? "pointer" : "default",
                  }}
                >
                  {/* Indicador */}
                  <div className="flex items-center justify-center shrink-0 mt-0.5" style={{ width: 20, height: 20 }}>
                    {concluida ? (
                      <CheckCircle size={20} color={COR_GOLD} strokeWidth={2} />
                    ) : pendente ? (
                      <Circle size={20} color="rgba(245,244,240,0.25)" strokeWidth={1.5} />
                    ) : (
                      <div
                        className="flex items-center justify-center rounded-full"
                        style={{
                          width: 20,
                          height: 20,
                          background: "rgba(245,244,240,0.9)",
                          color: COR_SIDEBAR,
                          fontFamily: "var(--font-mono)",
                          fontSize: 9,
                          fontWeight: 700,
                        }}
                      >
                        {idx + 1}
                      </div>
                    )}
                  </div>

                  {/* Texto */}
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: 15,
                        fontWeight: ativa ? 600 : 400,
                        color: ativa
                          ? "#f5f4f0"
                          : concluida
                          ? "rgba(245,244,240,0.7)"
                          : "rgba(245,244,240,0.4)",
                        lineHeight: 1.3,
                      }}
                    >
                      {etapa.label}
                    </span>
                    {etapa.descricao && ativa && (
                      <span
                        style={{
                          fontFamily: "var(--font-body)",
                          fontSize: 13,
                          color: "rgba(245,244,240,0.45)",
                          lineHeight: 1.4,
                        }}
                      >
                        {etapa.descricao}
                      </span>
                    )}
                  </div>

                  {/* Seta na etapa ativa */}
                  {ativa && (
                    <div className="ml-auto shrink-0 mt-0.5" style={{ color: COR_GOLD }}>
                      <ArrowRight size={14} strokeWidth={2} />
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Rodapé com botões */}
          <div
            className="flex flex-col gap-2 p-4"
            style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
          >
            {/* Botão principal */}
            <button
              onClick={onAvancar}
              disabled={!podeAvancar}
              className="w-full rounded-xl py-2.5 font-semibold transition-all duration-200"
              style={{
                background: podeAvancar
                  ? isUltimaEtapa
                    ? `linear-gradient(135deg, ${COR_GOLD}, #e8b84b)`
                    : "rgba(245,244,240,0.9)"
                  : "rgba(245,244,240,0.12)",
                color: podeAvancar
                  ? isUltimaEtapa
                    ? "#ffffff"
                    : COR_SIDEBAR
                  : "rgba(245,244,240,0.3)",
                fontFamily: "var(--font-body)",
                fontSize: 13,
                border: "none",
                cursor: podeAvancar ? "pointer" : "not-allowed",
                boxShadow: podeAvancar && isUltimaEtapa
                  ? `0 4px 16px ${COR_GOLD}44`
                  : "none",
              }}
            >
              {btnLabel}
            </button>

            {/* Botão Voltar */}
            {etapaAtual > 0 && onVoltar && (
              <button
                onClick={onVoltar}
                className="w-full rounded-xl py-2 transition-all duration-150"
                style={{
                  background: "transparent",
                  color: "rgba(245,244,240,0.45)",
                  fontFamily: "var(--font-body)",
                  fontSize: 12,
                  border: "1px solid rgba(245,244,240,0.12)",
                  cursor: "pointer",
                }}
              >
                ← Voltar
              </button>
            )}
          </div>
        </aside>

        {/* ── Área Central ── */}
        <main
          className="flex-1 overflow-y-auto"
          style={{ background: COR_CREAM, fontSize: 16 }}
        >
          {/* Estilos base para conteúdo da área central */}
          <style>{`
            .fl-central h1 {
              font-family: 'Instrument Serif', Georgia, serif !important;
              font-size: 2rem !important;
              font-weight: 400 !important;
              line-height: 1.12 !important;
            }
            .fl-central h2 {
              font-family: 'Instrument Serif', Georgia, serif !important;
              font-size: 1.5rem !important;
              font-weight: 400 !important;
              line-height: 1.18 !important;
            }
            .fl-central h3 {
              font-size: 1.15rem !important;
            }
            .fl-central p { font-size: 15px !important; line-height: 1.65 !important; }
            .fl-central label { font-size: 15px !important; }
            .fl-central li { font-size: 15px !important; }
            .fl-central textarea, .fl-central input[type="text"], .fl-central input[type="number"] { font-size: 15px !important; }
            .fl-central textarea::placeholder, .fl-central input::placeholder { font-size: 15px !important; }
            .fl-central .card,
            .fl-central [data-card] {
              padding: 24px !important;
              border-radius: 12px !important;
            }
            .fl-central .fl-gap {
              gap: 20px !important;
            }
            /* Remove max-width restritivos herdados */
            .fl-central .max-w-xl,
            .fl-central .max-w-2xl,
            .fl-central .max-w-3xl {
              max-width: 100% !important;
            }
          `}</style>
          <div
            className="fl-central"
            style={{ padding: "28px 32px 28px 36px", minHeight: "100%" }}
          >
            {children}
          </div>
        </main>

        {/* ── Painel Direito ── */}
        {resumo !== undefined && (
          <aside
            className="shrink-0 flex flex-col overflow-y-auto"
            style={{
              width: 280,
              background: "#ffffff",
              borderLeft: "1px solid var(--color-brand-border)",
            }}
          >
            {/* Header fixo do painel */}
            <div
              className="px-5 py-4 flex items-center gap-2 shrink-0"
              style={{
                borderBottom: "1px solid var(--color-brand-border)",
                background: "#fff",
                position: "sticky",
                top: 0,
                zIndex: 10,
              }}
            >
              <div
                className="flex items-center justify-center rounded-lg shrink-0"
                style={{
                  width: 26,
                  height: 26,
                  background: `${COR_GOLD}18`,
                }}
              >
                <BookOpen size={14} color={COR_GOLD} strokeWidth={2} />
              </div>
              <div>
                <h3
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: 18,
                    fontWeight: 400,
                    color: "var(--color-brand-dark-green)",
                    lineHeight: 1.2,
                    fontStyle: "italic",
                  }}
                >
                  Resumo Visual
                </h3>
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: 13,
                    color: "var(--color-brand-gray)",
                    marginTop: 1,
                  }}
                >
                  Atualizado em tempo real
                </p>
              </div>

              {/* Progresso no painel */}
              <div className="ml-auto flex items-center gap-1.5">
                <div
                  className="relative rounded-full overflow-hidden"
                  style={{ width: 36, height: 36 }}
                >
                  <svg width="36" height="36" viewBox="0 0 36 36" fill="none" style={{ transform: "rotate(-90deg)" }}>
                    <circle cx="18" cy="18" r="14" stroke="rgba(26,92,58,0.08)" strokeWidth="3.5" fill="none" />
                    <circle
                      cx="18" cy="18" r="14"
                      stroke={progresso >= 100 ? "#1e8a4c" : COR_GOLD}
                      strokeWidth="3.5"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 14}
                      strokeDashoffset={2 * Math.PI * 14 * (1 - progresso / 100)}
                      style={{ transition: "stroke-dashoffset 0.6s ease" }}
                    />
                  </svg>
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ fontFamily: "var(--font-mono)", fontSize: 8, fontWeight: 700, color: progresso >= 100 ? "#1e8a4c" : COR_GOLD }}
                  >
                    {progresso}%
                  </div>
                </div>
              </div>
            </div>

            {/* Conteúdo do resumo */}
            <div className="flex flex-col gap-4 p-5 flex-1">
              {resumo}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
