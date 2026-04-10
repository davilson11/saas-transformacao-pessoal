'use client';

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  codigo: string;
  slug?: string;
  nome: string;
  descricao: string;
  etapas: Etapa[];
  etapaAtual: number;
  progresso: number;
  onAvancar: () => void;
  onVoltar?: () => void;
  podeAvancar?: boolean;
  labelAvancar?: string;
  totalItens?: number;
  labelItens?: string;
  children: React.ReactNode;
  resumo?: React.ReactNode;
  respostas?: Record<string, unknown>;
};

// ─── Banner contextual ────────────────────────────────────────────────────────

const AREAS_RAIO_X = ['Saúde', 'Mente', 'Carreira', 'Finanças', 'Relacionamentos', 'Lazer', 'Crescimento', 'Espiritualidade'];

type BannerRule = {
  slug: string;
  getMensagem: (data: Record<string, unknown>) => string | null;
};

const BANNER_RULES: Record<string, BannerRule> = {
  F03: {
    slug: 'raio-x',
    getMensagem: (d) => {
      const vals = (d as { valores?: number[] }).valores;
      if (!vals?.length) return null;
      const minIdx = vals.indexOf(Math.min(...vals));
      return `🎯 Seu Raio-X aponta ${AREAS_RAIO_X[minIdx] ?? 'uma área'} como ponto a fortalecer. Use como ponto de partida para sua análise SWOT.`;
    },
  },
  F05: {
    slug: 'raio-x',
    getMensagem: (d) => {
      const vals = (d as { valores?: number[] }).valores;
      if (!vals?.length) return null;
      const minIdx = vals.indexOf(Math.min(...vals));
      return `🎯 Seu Raio-X mostra ${AREAS_RAIO_X[minIdx] ?? 'uma área'} como a dimensão que mais precisa evoluir. Que tal criar OKRs específicos para ela?`;
    },
  },
  F08: {
    slug: 'raio-x',
    getMensagem: (d) => {
      const vals = (d as { valores?: number[] }).valores;
      if (!vals?.length) return null;
      const minIdx = vals.indexOf(Math.min(...vals));
      return `🎯 No Raio-X, ${AREAS_RAIO_X[minIdx] ?? 'uma área'} ficou mais baixa. Considere reservar um bloco matinal dedicado a ela.`;
    },
  },
  F04: {
    slug: 'raio-x',
    getMensagem: (d) => {
      const vals = (d as { valores?: number[] }).valores;
      if (!vals?.length) return null;
      const minIdx = vals.indexOf(Math.min(...vals));
      return `🎯 Cruzamento com o Raio-X: ${AREAS_RAIO_X[minIdx] ?? 'uma área'} teve a pontuação mais baixa. Vale pedir feedback específico sobre essa dimensão.`;
    },
  },
};

// ─── Mensagens motivacionais por ferramenta ───────────────────────────────────

const MENSAGENS_MOTIVACIONAIS: Record<string, string> = {
  F01: "Seu Raio-X está completo. Você se conhece melhor que 97% das pessoas.",
  F02: "Você acabou de mapear seus valores. Isso é raro e poderoso.",
  F03: "Sua análise SWOT está pronta. Você tem clareza que poucos têm.",
  F04: "Seu feedback 360° revela o que poucos querem ver.",
  F05: "Seus OKRs estão definidos. Agora é execução.",
};

const MENSAGEM_GENERICA =
  "Progresso salvo. Cada passo conta — você está construindo algo real.";

function getMensagem(codigo: string): string {
  return MENSAGENS_MOTIVACIONAIS[codigo.toUpperCase()] ?? MENSAGEM_GENERICA;
}

// ─── Tokens ───────────────────────────────────────────────────────────────────

const G        = "#0E0E0E";
const GOLD     = "#C8A030";
const CREAM    = "#F8F4EE";
const ASIDE_BG = "#FFFFFF";

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
  const [autoSaveIndicator, setAutoSaveIndicator] = useState(false);
  const [toastVisivel, setToastVisivel] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [bannerMsg, setBannerMsg] = useState<string | null>(null);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();

  const resolvedSlug =
    slug ?? pathname.split("/").filter(Boolean).pop() ?? codigo.toLowerCase();

  // Refs para capturar os valores mais recentes dentro do intervalo
  const respostasRef = useRef(respostas);
  const progressoRef = useRef(progresso);
  const resolvedSlugRef = useRef(resolvedSlug);
  const autoSaveIndicatorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { respostasRef.current = respostas; }, [respostas]);
  useEffect(() => { progressoRef.current = progresso; }, [progresso]);
  useEffect(() => { resolvedSlugRef.current = resolvedSlug; }, [resolvedSlug]);

  // Auto-save a cada 30 segundos
  useEffect(() => {
    if (!user?.id) return;

    const intervalId = setInterval(async () => {
      const currentRespostas = respostasRef.current;
      const hasContent = currentRespostas != null &&
        Object.values(currentRespostas).some((v) => {
          if (v === null || v === undefined) return false;
          if (typeof v === "string") return v.trim().length > 0;
          if (Array.isArray(v)) return v.length > 0;
          if (typeof v === "object") return Object.keys(v as object).length > 0;
          return Boolean(v);
        });

      if (!hasContent) return;

      try {
        const client = await getClient();
        const ok = await salvarRespostaFerramenta(
          user.id,
          codigo,
          resolvedSlugRef.current,
          (currentRespostas as Json) ?? {},
          progressoRef.current,
          false,
          client,
        );
        if (ok) {
          setAutoSaveIndicator(true);
          if (autoSaveIndicatorTimeoutRef.current) clearTimeout(autoSaveIndicatorTimeoutRef.current);
          autoSaveIndicatorTimeoutRef.current = setTimeout(() => setAutoSaveIndicator(false), 2000);
        }
      } catch {
        // auto-save silencioso — não interrompe o usuário
      }
    }, 30000);

    return () => {
      clearInterval(intervalId);
      if (autoSaveIndicatorTimeoutRef.current) clearTimeout(autoSaveIndicatorTimeoutRef.current);
    };
  }, [user?.id, codigo, getClient]);

  // Banner contextual: busca dados de ferramenta relacionada
  useEffect(() => {
    const rule = BANNER_RULES[codigo.toUpperCase()];
    if (!rule || !user?.id) return;
    (async () => {
      try {
        const client = await getClient();
        const { data } = await client
          .from('ferramentas_respostas')
          .select('respostas')
          .eq('user_id', user.id)
          .eq('ferramenta_slug', rule.slug)
          .maybeSingle();
        if (data?.respostas) {
          const msg = rule.getMensagem(data.respostas as Record<string, unknown>);
          if (msg) setBannerMsg(msg);
        }
      } catch { /* silencioso */ }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, codigo]);

  const isUltimaEtapa = etapaAtual === etapas.length - 1;

  const btnLabel =
    labelAvancar ??
    (etapaAtual === 0
      ? "Começar →"
      : isUltimaEtapa
      ? `Salvar ${nome.split(" ")[0]} ✓`
      : "Continuar →");

  function mostrarToast(msg: string) {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMsg(msg);
    setToastVisivel(true);
    toastTimeoutRef.current = setTimeout(() => setToastVisivel(false), 3000);
  }

  async function handleSalvarProgresso() {
    if (!user?.id) return;
    setSaveStatus("saving");
    try {
      const client = await getClient();
      const ok = await salvarRespostaFerramenta(
        user.id,
        codigo,
        resolvedSlug,
        (respostas as Json) ?? {},
        progresso,
        false,
        client,
      );
      setSaveStatus(ok ? "saved" : "error");
      if (ok) mostrarToast(getMensagem(codigo));
    } catch {
      setSaveStatus("error");
    }
    setTimeout(() => setSaveStatus("idle"), 3000);
  }

  function handleAvancar() {
    onAvancar();
    if (isUltimaEtapa) setConcluido(true);
  }

  // Anel SVG
  const R = 14;
  const CIRC = 2 * Math.PI * R;
  const ringOffset = CIRC * (1 - progresso / 100);

  return (
    <>
      <style>{`
        /* ROOT */
        .fl-root {
          display: flex;
          flex-direction: column;
          height: 100dvh;
          overflow: hidden;
          font-family: 'DM Sans', sans-serif;
          background: ${CREAM};
        }

        /* TOPBAR */
        .fl-topbar {
          height: 52px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 20px;
          background: ${G};
          border-bottom: 1px solid rgba(255,255,255,0.07);
          z-index: 20;
        }
        .fl-breadcrumb {
          display: flex;
          align-items: center;
          gap: 6px;
          flex: 1;
          min-width: 0;
          font-size: 12px;
        }
        .fl-breadcrumb a {
          color: rgba(250,248,245,0.45);
          text-decoration: none;
          white-space: nowrap;
        }
        .fl-breadcrumb a:hover { color: rgba(250,248,245,0.75); }
        .fl-breadcrumb-sep { color: rgba(250,248,245,0.22); font-size: 10px; }
        .fl-breadcrumb-current {
          color: rgba(250,248,245,0.9);
          font-weight: 500;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .fl-code-badge {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          font-weight: 600;
          color: ${GOLD};
          background: rgba(200,160,48,0.15);
          border: 1px solid ${GOLD}55;
          padding: 1px 8px;
          border-radius: 99px;
          letter-spacing: 0.04em;
          flex-shrink: 0;
          margin-left: 4px;
        }
        .fl-progress-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }
        .fl-progress-track {
          width: 100px;
          height: 4px;
          background: rgba(255,255,255,0.12);
          border-radius: 99px;
          position: relative;
          overflow: hidden;
        }
        .fl-progress-fill {
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, ${GOLD}, #e8c76a);
          border-radius: 99px;
          transition: right 0.6s ease;
        }
        .fl-progress-pct {
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          font-weight: 600;
          min-width: 28px;
          text-align: right;
        }
        .fl-counter-badge {
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          color: rgba(250,248,245,0.6);
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.1);
          padding: 2px 9px;
          border-radius: 99px;
          display: none;
        }
        @media (min-width: 480px) { .fl-counter-badge { display: inline; } }
        @media (max-width: 639px) {
          .fl-progress-wrap { display: none; }
          .fl-breadcrumb-current { max-width: 120px; }
        }

        /* BODY */
        .fl-body {
          flex: 1;
          display: flex;
          overflow: hidden;
        }

        /* SIDEBAR ESQUERDA */
        .fl-sidebar {
          width: 220px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          background: ${G};
          border-right: 1px solid rgba(255,255,255,0.07);
          overflow-y: auto;
        }
        .fl-sidebar-logo {
          padding: 20px 18px 14px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          flex-shrink: 0;
        }
        .fl-sidebar-logo-name {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 18px;
          font-weight: 400;
          font-style: italic;
          color: ${CREAM};
          line-height: 1.1;
          margin-bottom: 4px;
        }
        .fl-sidebar-logo-sub {
          font-family: 'DM Mono', monospace;
          font-size: 9px;
          color: ${GOLD};
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }
        .fl-sidebar-desc {
          padding: 12px 18px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          font-size: 13px;
          color: rgba(250,248,245,0.45);
          line-height: 1.55;
          flex-shrink: 0;
        }
        .fl-steps {
          flex: 1;
          padding: 12px 10px;
          overflow-y: auto;
        }
        .fl-steps-label {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          font-weight: 600;
          color: rgba(250,248,245,0.26);
          text-transform: uppercase;
          letter-spacing: 0.12em;
          padding-left: 8px;
          margin-bottom: 8px;
        }
        .fl-step {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 9px 10px;
          border-radius: 8px;
          margin-bottom: 2px;
          transition: background 0.15s;
        }
        .fl-step-num {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          font-weight: 700;
          margin-top: 1px;
        }
        .fl-step-text { flex: 1; min-width: 0; }
        .fl-step-title {
          display: block;
          font-size: 13px;
          line-height: 1.35;
        }
        .fl-step-sub {
          display: block;
          font-size: 11px;
          color: rgba(250,248,245,0.38);
          line-height: 1.4;
          margin-top: 2px;
        }
        .fl-sidebar-footer {
          padding: 12px 14px;
          border-top: 1px solid rgba(255,255,255,0.07);
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex-shrink: 0;
        }
        .fl-btn-save {
          width: 100%;
          padding: 7px 0;
          border-radius: 8px;
          background: transparent;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
        }
        .fl-btn-main {
          width: 100%;
          padding: 9px 0;
          border-radius: 8px;
          border: none;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s;
        }
        .fl-btn-back {
          width: 100%;
          padding: 6px 0;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.1);
          background: transparent;
          color: rgba(250,248,245,0.35);
          font-size: 12px;
          cursor: pointer;
          transition: all 0.15s;
        }
        .fl-btn-back:hover { color: rgba(250,248,245,0.6); }

        /* ÁREA CENTRAL */
        .fl-main {
          flex: 1;
          overflow-y: auto;
          background: ${CREAM};
          padding: 32px 36px 80px;
          font-size: 15px;
          line-height: 1.65;
          color: #3d3d3d;
        }
        .fl-main h1 {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 1.9rem;
          font-weight: 400;
          line-height: 1.15;
          color: ${GOLD};
          margin-bottom: 8px;
        }
        .fl-main h2 {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 1.4rem;
          font-weight: 400;
          line-height: 1.2;
          color: ${GOLD};
          margin-bottom: 6px;
        }
        .fl-main h3 {
          font-size: 1.05rem;
          font-weight: 600;
          color: ${GOLD};
          margin-bottom: 4px;
        }
        .fl-main textarea,
        .fl-main input[type="text"],
        .fl-main input[type="number"],
        .fl-main select {
          background: #fff;
          border: 1px solid #d8d0c4;
          border-radius: 6px;
          padding: 10px 12px;
          font-size: 15px;
          color: #2a2a2a;
          width: 100%;
        }
        .fl-main textarea:focus,
        .fl-main input:focus,
        .fl-main select:focus {
          outline: 2px solid ${GOLD};
          outline-offset: 1px;
          border-color: ${GOLD};
        }

        /* PAINEL DIREITO */
        .fl-aside {
          width: 248px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          background: ${ASIDE_BG};
          border-left: 1px solid rgba(0,0,0,0.08);
          overflow-y: auto;
        }
        .fl-aside-header {
          padding: 16px 18px 14px;
          border-bottom: 1px solid rgba(0,0,0,0.07);
          display: flex;
          align-items: center;
          gap: 10px;
          position: sticky;
          top: 0;
          background: ${ASIDE_BG};
          z-index: 5;
          flex-shrink: 0;
        }
        .fl-aside-ring { position: relative; flex-shrink: 0; }
        .fl-aside-ring-pct {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'DM Mono', monospace;
          font-size: 8px;
          font-weight: 700;
        }
        .fl-aside-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 16px;
          font-weight: 400;
          font-style: italic;
          color: ${GOLD};
          line-height: 1.2;
          margin: 0;
        }
        .fl-aside-sub {
          font-size: 11px;
          color: rgba(0,0,0,0.38);
          margin: 2px 0 0;
          line-height: 1;
        }
        .fl-aside-body { padding: 16px 18px; flex: 1; }

        /* MOBILE BREAKPOINTS */
        @media (max-width: 899px) { .fl-aside { display: none; } }
        @media (max-width: 639px) {
          .fl-sidebar { display: none; }
          .fl-main { padding: 20px 16px 140px; }
          .fl-main h1 { font-size: 1.4rem; }
          .fl-main h2 { font-size: 1.15rem; }
          .fl-main textarea,
          .fl-main input[type="text"],
          .fl-main input[type="number"],
          .fl-main input[type="range"],
          .fl-main select { font-size: 16px; }
        }

        /* MOBILE BOTTOM BAR */
        .fl-mobile-bar {
          display: none;
          position: fixed;
          bottom: 0; left: 0; right: 0;
          background: ${G};
          border-top: 1px solid rgba(255,255,255,0.1);
          padding: 10px 16px max(12px, env(safe-area-inset-bottom, 12px));
          flex-direction: column;
          gap: 8px;
          z-index: 40;
        }
        @media (max-width: 639px) { .fl-mobile-bar { display: flex; } }

        .fl-steps-strip {
          display: flex;
          overflow-x: auto;
          gap: 6px;
          padding-bottom: 6px;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .fl-steps-strip::-webkit-scrollbar { display: none; }

        /* TOAST MOTIVACIONAL */
        .fl-toast {
          position: fixed;
          top: 16px;
          left: 50%;
          transform: translateX(-50%) translateY(-12px);
          z-index: 200;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 20px;
          border-radius: 12px;
          background: linear-gradient(135deg, #C8A030 0%, #a07820 100%);
          color: #0E0E0E;
          font-size: 13px;
          font-weight: 600;
          line-height: 1.4;
          max-width: min(480px, calc(100vw - 32px));
          box-shadow: 0 8px 32px rgba(200,160,48,0.45), 0 2px 8px rgba(0,0,0,0.30);
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.25s ease, transform 0.25s ease;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .fl-toast.visible {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
          pointer-events: auto;
        }
        .fl-toast-icon {
          font-size: 16px;
          flex-shrink: 0;
        }

        /* BANNER CONTEXTUAL */
        .fl-banner {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          margin-bottom: 20px;
          border-radius: 10px;
          background: linear-gradient(135deg, rgba(200,160,48,0.12), rgba(200,160,48,0.06));
          border: 1px solid rgba(200,160,48,0.35);
          font-size: 13.5px;
          color: #3d3d3d;
          line-height: 1.5;
        }
        .fl-banner-text { flex: 1; min-width: 0; }
        .fl-banner-dismiss {
          background: none;
          border: none;
          color: rgba(0,0,0,0.3);
          cursor: pointer;
          font-size: 16px;
          padding: 2px 6px;
          border-radius: 4px;
          flex-shrink: 0;
          line-height: 1;
          transition: color 0.15s;
        }
        .fl-banner-dismiss:hover { color: rgba(0,0,0,0.55); }

        /* AUTO-SAVE INDICATOR */
        .fl-autosave {
          font-size: 11px;
          color: #4dbb7a;
          display: flex;
          align-items: center;
          gap: 4px;
          white-space: nowrap;
          flex-shrink: 0;
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }
        .fl-autosave.visible { opacity: 1; }
      `}</style>

      {/* ── Toast motivacional ── */}
      <div
        role="status"
        aria-live="polite"
        className={`fl-toast${toastVisivel ? " visible" : ""}`}
      >
        <span className="fl-toast-icon">✨</span>
        <span>{toastMsg}</span>
      </div>

      <div className="fl-root">

        {/* ══════════════════════════════════════════
            TOPBAR
        ══════════════════════════════════════════ */}
        <header className="fl-topbar">

          {/* Breadcrumb + badge */}
          <nav className="fl-breadcrumb">
            <Link href="/ferramentas">Ferramentas</Link>
            <span className="fl-breadcrumb-sep">›</span>
            <span className="fl-breadcrumb-current">{nome}</span>
            <span className="fl-code-badge">{codigo}</span>
          </nav>

          {/* Contador (opcional) */}
          {totalItens !== undefined && totalItens > 0 && (
            <span className="fl-counter-badge">
              {totalItens} {labelItens}
            </span>
          )}

          {/* Indicador de auto-save */}
          <span className={`fl-autosave${autoSaveIndicator ? " visible" : ""}`}>
            ✓ Salvo automaticamente
          </span>

          {/* Barra de progresso */}
          <div className="fl-progress-wrap">
            <div className="fl-progress-track">
              <div
                className="fl-progress-fill"
                style={{ right: `${100 - progresso}%` }}
              />
            </div>
            <span
              className="fl-progress-pct"
              style={{ color: progresso >= 100 ? "#4dbb7a" : "rgba(250,248,245,0.75)" }}
            >
              {progresso}%
            </span>
          </div>

        </header>

        {/* ══════════════════════════════════════════
            BODY
        ══════════════════════════════════════════ */}
        <div className="fl-body">

          {/* ── Sidebar esquerda ── */}
          <aside className="fl-sidebar">

            {/* Logo */}
            <div className="fl-sidebar-logo">
              <div className="fl-sidebar-logo-name">Kairos</div>
              <div className="fl-sidebar-logo-sub">{codigo} · {nome}</div>
            </div>

            {/* Descrição */}
            <div className="fl-sidebar-desc">{descricao}</div>

            {/* Etapas */}
            <nav className="fl-steps">
              <div className="fl-steps-label">Etapas</div>

              {etapas.map((etapa, idx) => {
                const ativa     = etapaAtual === idx;
                const concluida = etapaAtual > idx;
                const pendente  = etapaAtual < idx;

                return (
                  <div
                    key={idx}
                    className="fl-step"
                    style={{
                      background: ativa ? `${GOLD}1e` : "transparent",
                      opacity: pendente ? 0.45 : 1,
                      cursor: concluida ? "pointer" : "default",
                    }}
                  >
                    {/* Indicador numérico */}
                    <div
                      className="fl-step-num"
                      style={
                        concluida
                          ? { background: GOLD, color: G }
                          : ativa
                          ? { background: "rgba(250,248,245,0.92)", color: G }
                          : { background: "rgba(255,255,255,0.08)", color: "rgba(250,248,245,0.38)" }
                      }
                    >
                      {concluida ? "✓" : idx + 1}
                    </div>

                    {/* Texto */}
                    <div className="fl-step-text">
                      <span
                        className="fl-step-title"
                        style={{
                          fontWeight: ativa ? 600 : 400,
                          color: ativa
                            ? CREAM
                            : concluida
                            ? "rgba(250,248,245,0.65)"
                            : "rgba(250,248,245,0.32)",
                        }}
                      >
                        {etapa.label}
                      </span>
                      {ativa && etapa.descricao && (
                        <span className="fl-step-sub">{etapa.descricao}</span>
                      )}
                    </div>

                    {ativa && (
                      <span style={{ color: GOLD, fontSize: 12, flexShrink: 0, marginTop: 3 }}>›</span>
                    )}
                  </div>
                );
              })}
            </nav>

            {/* Footer da sidebar */}
            <div className="fl-sidebar-footer">

              {/* Salvar progresso */}
              <button
                className="fl-btn-save"
                onClick={handleSalvarProgresso}
                disabled={saveStatus === "saving"}
                style={{
                  border: `1px solid ${
                    saveStatus === "saved"  ? "#4dbb7a55" :
                    saveStatus === "error"  ? "#e05c5c55" :
                    `${GOLD}55`
                  }`,
                  color:
                    saveStatus === "saved"  ? "#4dbb7a" :
                    saveStatus === "error"  ? "#e05c5c" :
                    GOLD,
                  cursor: saveStatus === "saving" ? "not-allowed" : "pointer",
                }}
              >
                {saveStatus === "saving" && "Salvando…"}
                {saveStatus === "saved"  && "✓ Salvo!"}
                {saveStatus === "error"  && "Erro ao salvar"}
                {saveStatus === "idle"   && "Salvar progresso"}
              </button>

              {/* Botão principal (Continuar / Concluir) */}
              <button
                className="fl-btn-main"
                onClick={handleAvancar}
                disabled={!podeAvancar}
                style={{
                  background: podeAvancar
                    ? `linear-gradient(135deg, ${GOLD}, #e8c76a)`
                    : "rgba(255,255,255,0.1)",
                  color: podeAvancar ? "#0E0E0E" : "rgba(250,248,245,0.25)",
                  cursor: podeAvancar ? "pointer" : "not-allowed",
                  boxShadow: podeAvancar ? `0 4px 16px ${GOLD}44` : "none",
                }}
              >
                {btnLabel}
              </button>

              {/* ← Voltar */}
              {etapaAtual > 0 && onVoltar && (
                <button className="fl-btn-back" onClick={onVoltar}>
                  ← Voltar
                </button>
              )}

            </div>
          </aside>

          {/* ── Área central ── */}
          <main className="fl-main">
            {bannerMsg && !bannerDismissed && (
              <div className="fl-banner">
                <span className="fl-banner-text">{bannerMsg}</span>
                <button
                  className="fl-banner-dismiss"
                  onClick={() => setBannerDismissed(true)}
                  aria-label="Fechar banner"
                >
                  ×
                </button>
              </div>
            )}
            {children}
          </main>

          {/* ── Painel direito ── */}
          {resumo !== undefined && (
            <aside className="fl-aside">
              <div className="fl-aside-header">
                {/* Mini anel de progresso */}
                <div className="fl-aside-ring">
                  <svg
                    width="36" height="36" viewBox="0 0 36 36" fill="none"
                    style={{ transform: "rotate(-90deg)", display: "block" }}
                  >
                    <circle
                      cx="18" cy="18" r={R}
                      stroke="rgba(0,0,0,0.1)"
                      strokeWidth="3.5"
                      fill="none"
                    />
                    <circle
                      cx="18" cy="18" r={R}
                      stroke={progresso >= 100 ? "#4dbb7a" : GOLD}
                      strokeWidth="3.5"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={CIRC}
                      strokeDashoffset={ringOffset}
                      style={{ transition: "stroke-dashoffset 0.6s ease" }}
                    />
                  </svg>
                  <div
                    className="fl-aside-ring-pct"
                    style={{ color: progresso >= 100 ? "#4dbb7a" : GOLD }}
                  >
                    {progresso}%
                  </div>
                </div>

                <div>
                  <h3 className="fl-aside-title">Resumo Visual</h3>
                  <p className="fl-aside-sub">Atualizado em tempo real</p>
                </div>
              </div>

              <div className="fl-aside-body">{resumo}</div>
            </aside>
          )}

        </div>

        {/* ══════════════════════════════════════════
            MOBILE BOTTOM BAR (< 640px)
        ══════════════════════════════════════════ */}
        <div className="fl-mobile-bar">

          {/* Strip de etapas */}
          <div className="fl-steps-strip">
            {etapas.map((etapa, idx) => {
              const ativa     = etapaAtual === idx;
              const concluida = etapaAtual > idx;
              return (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 3,
                    padding: "4px 10px",
                    borderRadius: 8,
                    flexShrink: 0,
                    background: ativa ? `${GOLD}20` : "transparent",
                    border: ativa ? `1px solid ${GOLD}44` : "1px solid transparent",
                  }}
                >
                  <div
                    style={{
                      width: 20, height: 20, borderRadius: "50%",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 9, fontWeight: 700,
                      ...(concluida
                        ? { background: GOLD, color: G }
                        : ativa
                        ? { background: CREAM, color: G }
                        : { background: "rgba(255,255,255,0.1)", color: "rgba(250,248,245,0.4)" }),
                    }}
                  >
                    {concluida ? "✓" : idx + 1}
                  </div>
                  <span
                    style={{
                      fontSize: 9,
                      color: ativa ? GOLD : "rgba(250,248,245,0.35)",
                      whiteSpace: "nowrap",
                      maxWidth: 64,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {etapa.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Botões */}
          <div style={{ display: "flex", gap: 8 }}>
            {etapaAtual > 0 && onVoltar && (
              <button
                onClick={onVoltar}
                style={{
                  flexShrink: 0,
                  padding: "11px 16px",
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.15)",
                  background: "transparent",
                  color: "rgba(250,248,245,0.55)",
                  fontSize: 13,
                  cursor: "pointer",
                  minHeight: 44,
                }}
              >
                ←
              </button>
            )}
            <button
              onClick={handleAvancar}
              disabled={!podeAvancar}
              style={{
                flex: 1,
                padding: "11px 0",
                borderRadius: 8,
                border: "none",
                background: podeAvancar
                  ? `linear-gradient(135deg, ${GOLD}, #e8c76a)`
                  : "rgba(255,255,255,0.1)",
                color: podeAvancar ? "#0E0E0E" : "rgba(250,248,245,0.25)",
                fontSize: 14, fontWeight: 600,
                cursor: podeAvancar ? "pointer" : "not-allowed",
                minHeight: 44,
                transition: "all 0.15s",
              }}
            >
              {btnLabel}
            </button>
          </div>
        </div>

        {/* ══════════════════════════════════════════
            MODAL DE CONCLUSÃO
        ══════════════════════════════════════════ */}
        {concluido && (
          <div
            style={{
              position: "fixed", inset: 0,
              background: "rgba(0,0,0,0.65)",
              backdropFilter: "blur(4px)",
              display: "flex", alignItems: "center", justifyContent: "center",
              zIndex: 100, padding: 24,
            }}
          >
            <div
              style={{
                background: G,
                border: `1px solid ${GOLD}44`,
                borderRadius: 16,
                padding: "40px 36px",
                maxWidth: 420, width: "100%",
                textAlign: "center",
                boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 16 }}>🏆</div>
              <div
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 10, color: GOLD,
                  letterSpacing: "0.18em", textTransform: "uppercase",
                  marginBottom: 12,
                }}
              >
                {codigo} Concluído
              </div>
              <h2
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: "1.6rem", fontWeight: 400,
                  color: CREAM, lineHeight: 1.2, margin: "0 0 12px",
                }}
              >
                {nome}
              </h2>
              <p
                style={{
                  fontSize: 14,
                  color: "rgba(250,248,245,0.55)",
                  lineHeight: 1.65, marginBottom: 28,
                }}
              >
                Ferramenta concluída com sucesso. Seu progresso foi salvo.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <Link
                  href="/dashboard"
                  style={{
                    display: "block", padding: "12px 0", borderRadius: 8,
                    background: `linear-gradient(135deg, ${GOLD}, #e8c76a)`,
                    color: G, fontWeight: 700, fontSize: 14,
                    textDecoration: "none", textAlign: "center",
                  }}
                >
                  Ir para o Dashboard
                </Link>
                <Link
                  href="/ferramentas"
                  style={{
                    display: "block", padding: "11px 0", borderRadius: 8,
                    border: "1px solid rgba(255,255,255,0.15)",
                    color: "rgba(250,248,245,0.65)",
                    fontSize: 14, textDecoration: "none", textAlign: "center",
                  }}
                >
                  Ver todas as ferramentas
                </Link>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}
