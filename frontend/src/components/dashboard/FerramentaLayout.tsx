'use client';

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, ChevronRight, ArrowRight, CheckCircle, Circle } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useSupabaseClient } from "@/lib/useSupabaseClient";
import { salvarRespostaFerramenta } from "@/lib/queries";
import type { Json } from "@/lib/database.types";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type Etapa = {
  label: string;
  descricao?: string;
};

type SaveStatus = "idle" | "saving" | "saved" | "error";

type FerramentaLayoutProps = {
  /** Código exibido no badge: "F01", "F02", etc. */
  codigo: string;
  /** Slug da ferramenta para salvar no banco: "raio-x", "bussola-valores", etc.
   *  Se omitido, é derivado automaticamente do pathname da URL. */
  slug?: string;
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
  /** Dados atuais do formulário para salvar como progresso parcial */
  respostas?: Record<string, unknown>;
};

// ─── Constantes ───────────────────────────────────────────────────────────────

const COR_SIDEBAR = "#1a5c3a";
const COR_GOLD    = "#b5840a";
const COR_CREAM   = "#f5f4f0";

// ─── Componente ───────────────────────────────────────────────────────────────

export default function FerramentaLayout({
  codigo,
  slug,
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
  respostas,
}: FerramentaLayoutProps) {
  const { user } = useUser();
  const { getClient } = useSupabaseClient();
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [concluido, setConcluido] = useState(false);
  const pathname = usePathname();

  // Derive slug from URL path if not provided explicitly
  const resolvedSlug = slug ?? pathname.split("/").filter(Boolean).pop() ?? codigo.toLowerCase();

  const isUltimaEtapa = etapaAtual === etapas.length - 1;

  const btnLabel = labelAvancar
    ?? (etapaAtual === 0
      ? "Começar →"
      : isUltimaEtapa
      ? `Salvar ${nome.split(" ")[0]} ✓`
      : "Continuar →");

  async function handleSalvarProgresso() {
    if (!user?.id) return;
    setSaveStatus("saving");
    try {
      const client = await getClient();
      const result = await salvarRespostaFerramenta(
        user.id,
        codigo,
        resolvedSlug,
        respostas as Json ?? {},
        progresso,
        false,
        client,
      );
      setSaveStatus(result ? "saved" : "error");
    } catch {
      setSaveStatus("error");
    }
    setTimeout(() => setSaveStatus("idle"), 3000);
  }

  function handleAvancar() {
    onAvancar();
    if (isUltimaEtapa) setConcluido(true);
  }

  // ── Shared: botão de salvar progress (usado na sidebar desktop e no bottom bar mobile) ──
  const salvarBtn = (
    <button
      onClick={handleSalvarProgresso}
      disabled={saveStatus === "saving"}
      className="w-full rounded-xl py-2 transition-all duration-150"
      style={{
        background: "transparent",
        color: saveStatus === "saved"
          ? "#4dbb7a"
          : saveStatus === "error"
          ? "#e05c5c"
          : "rgba(245,244,240,0.7)",
        fontFamily: "var(--font-body)",
        fontSize: 12,
        fontWeight: 500,
        border: `1px solid ${
          saveStatus === "saved"
            ? "#4dbb7a55"
            : saveStatus === "error"
            ? "#e05c5c55"
            : "rgba(245,244,240,0.18)"
        }`,
        cursor: saveStatus === "saving" ? "not-allowed" : "pointer",
      }}
    >
      {saveStatus === "saving" && "Salvando..."}
      {saveStatus === "saved"  && "✓ Salvo!"}
      {saveStatus === "error"  && "Erro ao salvar"}
      {saveStatus === "idle"   && "Salvar progresso"}
    </button>
  );

  return (
    <>
      <style>{`
        /* ── Estilos da área central (desktop) ── */
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
        .fl-central h3 { font-size: 1.15rem !important; }
        .fl-central p   { font-size: 15px !important; line-height: 1.65 !important; }
        .fl-central label { font-size: 15px !important; }
        .fl-central li  { font-size: 15px !important; }
        .fl-central textarea,
        .fl-central input[type="text"],
        .fl-central input[type="number"] { font-size: 15px !important; }
        .fl-central textarea::placeholder,
        .fl-central input::placeholder   { font-size: 15px !important; }
        .fl-central .card,
        .fl-central [data-card] { padding: 24px !important; border-radius: 12px !important; }
        .fl-central .fl-gap     { gap: 20px !important; }
        .fl-central .max-w-xl,
        .fl-central .max-w-2xl,
        .fl-central .max-w-3xl { max-width: 100% !important; }

        /* ── Mobile overrides: font-size ≥ 16px para evitar zoom iOS ── */
        @media (max-width: 767px) {
          .fl-central h1 { font-size: 1.5rem !important; }
          .fl-central h2 { font-size: 1.25rem !important; }
          .fl-central p, .fl-central label, .fl-central li { font-size: 16px !important; }
          .fl-central textarea,
          .fl-central input[type="text"],
          .fl-central input[type="number"],
          .fl-central input[type="range"],
          .fl-central select { font-size: 16px !important; }
          .fl-central textarea::placeholder,
          .fl-central input::placeholder { font-size: 16px !important; }
          .fl-central .card,
          .fl-central [data-card] { padding: 16px !important; }
        }

        /* ── Esconde scrollbar horizontal no strip de etapas mobile ── */
        .fl-steps-strip::-webkit-scrollbar { display: none; }
        .fl-steps-strip { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          background: COR_CREAM,
        }}
      >
        {/* ════════════════════════════════════════════════════════════
            TOPBAR
        ════════════════════════════════════════════════════════════ */}
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
            {/* Barra de progresso — oculta no mobile */}
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

            {/* Percentual compacto no mobile */}
            <span
              className="flex sm:hidden"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                fontWeight: 600,
                color: progresso >= 100 ? "#4dbb7a" : COR_GOLD,
              }}
            >
              {progresso}%
            </span>

            {/* Contador de itens */}
            {totalItens !== undefined && totalItens > 0 && (
              <span
                className="hidden sm:inline"
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

        {/* ════════════════════════════════════════════════════════════
            CORPO  (sidebar + central + painel)
            • Desktop: flex-row, cada coluna rola independentemente
            • Mobile:  flex-col, rola como página normal
        ════════════════════════════════════════════════════════════ */}
        <div className="flex flex-col md:flex-row flex-1 md:overflow-hidden">

          {/* ── Sidebar Esquerda — oculta no mobile ── */}
          <aside
            className="hidden md:flex flex-col shrink-0 overflow-y-auto"
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
                      background: ativa ? "rgba(245,244,240,0.1)" : "transparent",
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

            {/* Rodapé com botões — desktop only */}
            <div
              className="flex flex-col gap-2 p-4"
              style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
            >
              {salvarBtn}

              {/* Botão principal */}
              <button
                onClick={handleAvancar}
                disabled={!podeAvancar}
                className="w-full rounded-xl py-2.5 font-semibold transition-all duration-200"
                style={{
                  background: podeAvancar
                    ? isUltimaEtapa
                      ? `linear-gradient(135deg, ${COR_GOLD}, #e8b84b)`
                      : "rgba(245,244,240,0.9)"
                    : "rgba(245,244,240,0.12)",
                  color: podeAvancar
                    ? isUltimaEtapa ? "#ffffff" : COR_SIDEBAR
                    : "rgba(245,244,240,0.3)",
                  fontFamily: "var(--font-body)",
                  fontSize: 13,
                  border: "none",
                  cursor: podeAvancar ? "pointer" : "not-allowed",
                  boxShadow: podeAvancar && isUltimaEtapa ? `0 4px 16px ${COR_GOLD}44` : "none",
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
            <div
              className="fl-central"
              style={{
                padding: "28px 20px 160px",
                minHeight: "100%",
              }}
            >
              {/* Em desktop, ajusta o padding lateral */}
              <style>{`
                @media (min-width: 768px) {
                  .fl-central-inner { padding: 28px 32px 28px 36px !important; }
                }
              `}</style>
              <div className="fl-central-inner" style={{ maxWidth: "100%" }}>
                {children}
              </div>
            </div>
          </main>

          {/* ── Painel Direito ──
              Desktop: coluna fixa à direita
              Mobile:  bloco abaixo do conteúdo (dentro do scroll normal) */}
          {resumo !== undefined && (
            <aside
              className="shrink-0 flex flex-col overflow-y-auto"
              style={{
                width: "100%",
                background: "#ffffff",
                borderTop: "1px solid var(--color-brand-border)",
              }}
            >
              {/* Aplicar width 280px apenas em desktop via CSS */}
              <style>{`
                @media (min-width: 768px) {
                  .fl-right-panel {
                    width: 280px !important;
                    border-left: 1px solid var(--color-brand-border) !important;
                    border-top: none !important;
                  }
                }
              `}</style>

              <div className="fl-right-panel flex flex-col overflow-y-auto flex-1" style={{ width: "100%", background: "#fff" }}>
                {/* Header do painel */}
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
                    style={{ width: 26, height: 26, background: `${COR_GOLD}18` }}
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
                    <div className="relative" style={{ width: 36, height: 36 }}>
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
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 8,
                          fontWeight: 700,
                          color: progresso >= 100 ? "#1e8a4c" : COR_GOLD,
                        }}
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
              </div>
            </aside>
          )}
        </div>

        {/* ════════════════════════════════════════════════════════════
            MOBILE BOTTOM BAR — fixo no rodapé, visível apenas em mobile
        ════════════════════════════════════════════════════════════ */}
        <div
          className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex flex-col"
          style={{
            background: COR_SIDEBAR,
            boxShadow: "0 -4px 24px rgba(0,0,0,0.28)",
            borderTop: "1px solid rgba(255,255,255,0.10)",
          }}
        >
          {/* Strip de etapas — scroll horizontal */}
          <div
            className="fl-steps-strip flex overflow-x-auto gap-0 px-1"
            style={{
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              padding: "8px 8px 6px",
            }}
          >
            {etapas.map((etapa, idx) => {
              const ativa    = etapaAtual === idx;
              const concluida = etapaAtual > idx;
              const pendente = etapaAtual < idx;

              return (
                <div
                  key={idx}
                  className="flex flex-col items-center shrink-0 px-3 py-1 rounded-lg transition-all duration-200"
                  style={{
                    minWidth: 64,
                    background: ativa ? "rgba(245,244,240,0.12)" : "transparent",
                    opacity: pendente ? 0.45 : 1,
                  }}
                >
                  {/* Ícone */}
                  <div style={{ width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {concluida ? (
                      <CheckCircle size={16} color={COR_GOLD} strokeWidth={2} />
                    ) : pendente ? (
                      <Circle size={16} color="rgba(245,244,240,0.25)" strokeWidth={1.5} />
                    ) : (
                      <div
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: "50%",
                          background: "rgba(245,244,240,0.9)",
                          color: COR_SIDEBAR,
                          fontFamily: "var(--font-mono)",
                          fontSize: 8,
                          fontWeight: 700,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {idx + 1}
                      </div>
                    )}
                  </div>

                  {/* Label */}
                  <span
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: 10,
                      fontWeight: ativa ? 600 : 400,
                      color: ativa
                        ? "#f5f4f0"
                        : concluida
                        ? "rgba(245,244,240,0.65)"
                        : "rgba(245,244,240,0.35)",
                      textAlign: "center",
                      lineHeight: 1.2,
                      marginTop: 3,
                      maxWidth: 56,
                      overflow: "hidden",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {etapa.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Botões de ação — padding extra no fundo para safe area (iPhone notch) */}
          <div
            className="flex items-center gap-2 px-4 pt-2"
            style={{ paddingBottom: "max(16px, env(safe-area-inset-bottom, 16px))" }}
          >
            {/* Voltar */}
            {etapaAtual > 0 && onVoltar && (
              <button
                onClick={onVoltar}
                style={{
                  flex: "0 0 auto",
                  background: "transparent",
                  color: "rgba(245,244,240,0.6)",
                  fontFamily: "var(--font-body)",
                  fontSize: 14,
                  fontWeight: 500,
                  border: "1px solid rgba(245,244,240,0.18)",
                  borderRadius: 12,
                  padding: "13px 16px",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  minHeight: 48,
                }}
              >
                ← Voltar
              </button>
            )}

            {/* Salvar progresso */}
            <button
              onClick={handleSalvarProgresso}
              disabled={saveStatus === "saving"}
              style={{
                flex: "0 0 auto",
                background: "transparent",
                color: saveStatus === "saved"
                  ? "#4dbb7a"
                  : saveStatus === "error"
                  ? "#e05c5c"
                  : "rgba(245,244,240,0.6)",
                fontFamily: "var(--font-body)",
                fontSize: 13,
                fontWeight: 500,
                border: `1px solid ${
                  saveStatus === "saved"
                    ? "#4dbb7a55"
                    : saveStatus === "error"
                    ? "#e05c5c55"
                    : "rgba(245,244,240,0.18)"
                }`,
                borderRadius: 12,
                padding: "13px 14px",
                cursor: saveStatus === "saving" ? "not-allowed" : "pointer",
                whiteSpace: "nowrap",
                minHeight: 48,
              }}
            >
              {saveStatus === "saving" && "Salvando..."}
              {saveStatus === "saved"  && "✓ Salvo!"}
              {saveStatus === "error"  && "Erro"}
              {saveStatus === "idle"   && "Salvar"}
            </button>

            {/* Continuar — botão principal, ocupa o espaço restante */}
            <button
              onClick={handleAvancar}
              disabled={!podeAvancar}
              style={{
                flex: 1,
                background: podeAvancar
                  ? isUltimaEtapa
                    ? `linear-gradient(135deg, ${COR_GOLD}, #e8b84b)`
                    : "rgba(245,244,240,0.9)"
                  : "rgba(245,244,240,0.12)",
                color: podeAvancar
                  ? isUltimaEtapa ? "#ffffff" : COR_SIDEBAR
                  : "rgba(245,244,240,0.3)",
                fontFamily: "var(--font-body)",
                fontSize: 15,
                fontWeight: 700,
                border: "none",
                borderRadius: 12,
                padding: "13px 20px",
                cursor: podeAvancar ? "pointer" : "not-allowed",
                boxShadow: podeAvancar && isUltimaEtapa ? `0 4px 16px ${COR_GOLD}44` : "none",
                minHeight: 48,
              }}
            >
              {btnLabel}
            </button>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════
          MODAL DE CONCLUSÃO
      ════════════════════════════════════════════════════════════ */}
      {concluido && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(10, 30, 20, 0.82)", backdropFilter: "blur(6px)" }}
          onClick={() => setConcluido(false)}
        >
          <div
            className="flex flex-col items-center text-center w-full max-w-sm rounded-3xl"
            style={{
              background: "linear-gradient(160deg, #1e4d31 0%, #133028 100%)",
              border: "1px solid rgba(255,255,255,0.10)",
              boxShadow: "0 32px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(181,132,10,0.15)",
              padding: "44px 36px 40px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Ícone troféu */}
            <div
              className="flex items-center justify-center rounded-2xl mb-6"
              style={{
                width: 72,
                height: 72,
                background: `linear-gradient(135deg, ${COR_GOLD}22, ${COR_GOLD}44)`,
                border: `1px solid ${COR_GOLD}55`,
                fontSize: 36,
              }}
            >
              🏆
            </div>

            {/* Título */}
            <h2
              style={{
                fontFamily: "var(--font-heading)",
                fontStyle: "italic",
                fontSize: "clamp(22px, 5vw, 28px)",
                fontWeight: 400,
                color: "#f5f4f0",
                lineHeight: 1.2,
                margin: "0 0 8px",
              }}
            >
              Ferramenta concluída!
            </h2>

            {/* Emoji + badge do nome */}
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 14,
                color: "rgba(245,244,240,0.55)",
                lineHeight: 1.5,
                margin: "0 0 10px",
              }}
            >
              Você completou
            </p>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                fontWeight: 700,
                color: COR_GOLD,
                background: `${COR_GOLD}20`,
                border: `1px solid ${COR_GOLD}44`,
                padding: "4px 14px",
                borderRadius: 99,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                marginBottom: 28,
              }}
            >
              {codigo} · {nome}
            </span>

            {/* Separador dourado */}
            <div
              style={{
                width: 48,
                height: 1,
                background: `linear-gradient(90deg, transparent, ${COR_GOLD}88, transparent)`,
                margin: "0 0 28px",
              }}
            />

            {/* Botões */}
            <div className="flex flex-col gap-3 w-full">
              <Link
                href="/dashboard"
                className="block w-full rounded-xl text-center transition-opacity duration-150 hover:opacity-90"
                style={{
                  background: `linear-gradient(135deg, ${COR_GOLD}, #e8b84b)`,
                  color: "#fff",
                  fontFamily: "var(--font-body)",
                  fontSize: 15,
                  fontWeight: 700,
                  padding: "14px 24px",
                  textDecoration: "none",
                  boxShadow: `0 6px 20px ${COR_GOLD}44`,
                }}
              >
                Ir para o Dashboard →
              </Link>

              <Link
                href="/ferramentas"
                className="block w-full rounded-xl text-center transition-all duration-150 hover:opacity-90"
                style={{
                  background: "rgba(245,244,240,0.08)",
                  color: "rgba(245,244,240,0.75)",
                  fontFamily: "var(--font-body)",
                  fontSize: 14,
                  fontWeight: 500,
                  padding: "13px 24px",
                  textDecoration: "none",
                  border: "1px solid rgba(245,244,240,0.12)",
                }}
              >
                Ver todas as ferramentas
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
