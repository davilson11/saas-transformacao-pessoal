import DashboardLayout from "@/components/dashboard/DashboardLayout";
import LifeWheel from "@/components/dashboard/LifeWheel";
import NextActions from "@/components/dashboard/NextActions";
import PhaseProgress from "@/components/dashboard/PhaseProgress";
import Link from "next/link";

// ─── Vitality ring (inline no hero, sem card branco) ─────────────────────────

const VITALITY = 86;
const V_R = 44;
const V_CIRCUM = 2 * Math.PI * V_R;
const V_OFFSET = V_CIRCUM * (1 - VITALITY / 100);

function VisionAnchorHero() {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: "#1a5c3a" }}
    >
      <div className="flex flex-col sm:flex-row items-stretch">
        {/* ── Esquerda: eyebrow + headline + declaração ── */}
        <div className="flex flex-col justify-center gap-4 p-8 flex-1">
          {/* Eyebrow */}
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "rgba(245,244,240,0.50)",
            }}
          >
            Sua Visão Âncora — F00
          </span>

          {/* Manchete */}
          <h2
            style={{
              fontFamily: "var(--font-heading)",
              fontStyle: "italic",
              fontSize: "clamp(20px, 3vw, 30px)",
              fontWeight: 400,
              color: "#f5f4f0",
              lineHeight: 1.25,
              letterSpacing: "-0.01em",
              margin: 0,
            }}
          >
            &ldquo;Em 12 meses serei a versão mais<br />
            livre e realizada de mim mesmo.&rdquo;
          </h2>

          {/* Declaração complementar */}
          <p
            style={{
              fontSize: 14,
              color: "rgba(245,244,240,0.60)",
              lineHeight: 1.7,
              maxWidth: 480,
            }}
          >
            Fase atual:{" "}
            <strong style={{ color: "rgba(245,244,240,0.90)" }}>
              01 — Autoconhecimento
            </strong>
            . Continue de onde parou — você está a 75% desta fase.
          </p>
        </div>

        {/* ── Direita: anel vitality + CTA ── */}
        <div
          className="flex flex-col items-center justify-center gap-5 p-8 flex-shrink-0"
          style={{
            borderTop: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {/* Anel SVG dourado */}
          <div className="relative flex items-center justify-center">
            <svg
              width="124"
              height="124"
              viewBox="0 0 124 124"
              fill="none"
              style={{ transform: "rotate(-90deg)" }}
            >
              {/* Trilha */}
              <circle
                cx="62"
                cy="62"
                r={V_R}
                stroke="rgba(255,255,255,0.10)"
                strokeWidth="9"
                fill="none"
              />
              {/* Progresso dourado */}
              <circle
                cx="62"
                cy="62"
                r={V_R}
                stroke="var(--color-brand-gold)"
                strokeWidth="9"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={V_CIRCUM}
                strokeDashoffset={V_OFFSET}
                style={{ transition: "stroke-dashoffset 1s ease" }}
              />
            </svg>
            {/* Número centralizado */}
            <div className="absolute flex flex-col items-center">
              <span
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: 36,
                  fontWeight: 700,
                  color: "#f5f4f0",
                  lineHeight: 1,
                }}
              >
                {VITALITY}
              </span>
              <span
                style={{
                  fontSize: 10,
                  color: "var(--color-brand-gold)",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginTop: 4,
                }}
              >
                Vitality
              </span>
            </div>
          </div>

          {/* CTA */}
          <Link
            href="/visao-ancora"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 13,
              fontWeight: 600,
              color: "#1a5c3a",
              background: "var(--color-brand-gold)",
              padding: "9px 22px",
              borderRadius: 10,
              textDecoration: "none",
              whiteSpace: "nowrap",
              display: "inline-block",
            }}
          >
            Reler minha visão →
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Bottom Bar ───────────────────────────────────────────────────────────────

function BottomBar() {
  return (
    <div
      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl px-6 py-5"
      style={{
        background: "#fff",
        border: "1px solid var(--color-brand-border)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      {/* Contador */}
      <div className="flex items-center gap-3">
        <div
          className="flex items-center justify-center rounded-xl flex-shrink-0"
          style={{
            width: 40,
            height: 40,
            background: "rgba(26,92,58,0.08)",
            fontSize: 18,
          }}
        >
          🛠
        </div>
        <div>
          <p
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: 15,
              fontWeight: 700,
              color: "var(--color-brand-dark-green)",
              lineHeight: 1,
            }}
          >
            7 de 16 ferramentas acessadas
          </p>
          <p style={{ fontSize: 12, color: "var(--color-brand-gray)", marginTop: 3 }}>
            Continue explorando as 9 restantes para desbloquear todo o potencial
          </p>
        </div>
      </div>

      {/* Botão */}
      <Link
        href="/ferramentas"
        className="btn-primary flex-shrink-0"
        style={{ padding: "10px 22px", fontSize: 13, borderRadius: 10, textDecoration: "none" }}
      >
        Ver todas as ferramentas →
      </Link>
    </div>
  );
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        {/* 1. Visão Âncora Hero */}
        <VisionAnchorHero />

        {/* 2. Grid central: Roda da Vida + Próximas Ações */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <LifeWheel />
          <NextActions />
        </div>

        {/* 3. Progresso por Fase — grid 2×2 */}
        <PhaseProgress />

        {/* 4. Bottom Bar */}
        <BottomBar />
      </div>
    </DashboardLayout>
  );
}
