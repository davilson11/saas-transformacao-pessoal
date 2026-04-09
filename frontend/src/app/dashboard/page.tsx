'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import LifeWheel from "@/components/dashboard/LifeWheel";
import MissaoDia from "@/components/dashboard/MissaoDia"
import NextActions from "@/components/dashboard/NextActions";
import PhaseProgress from "@/components/dashboard/PhaseProgress";
import MomentoKairosCard from "@/components/dashboard/MomentoKairosCard";
import Onboarding from "@/components/dashboard/Onboarding";
import { buscarVisaoAncora } from "@/lib/queries";
import { useSupabaseClient } from "@/lib/useSupabaseClient";
import { calcularStreakDias } from "@/lib/badges";

// ─── Vitality ring ────────────────────────────────────────────────────────────

const VITALITY = 86;
const V_R = 44;
const V_CIRCUM = 2 * Math.PI * V_R;
const V_OFFSET = V_CIRCUM * (1 - VITALITY / 100);

// ─── Hero: Visão Âncora ───────────────────────────────────────────────────────

type HeroProps = {
  manchete:   string | null;
  declaracao: string | null;
  loading:    boolean;
};

function VisionAnchorHero({ manchete, declaracao, loading }: HeroProps) {
  const temVisao = !loading && !!manchete;
  const semVisao = !loading && !manchete;

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: "#0E0E0E", border: "1px solid rgba(200,160,48,0.18)" }}
    >
      <div className="flex flex-col sm:flex-row items-stretch">

        {/* ── Esquerda ── */}
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

          {/* Estado: carregando */}
          {loading && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[240, 200, 160].map((w) => (
                <div
                  key={w}
                  style={{
                    height: 18,
                    width: w,
                    maxWidth: "100%",
                    borderRadius: 6,
                    background: "rgba(255,255,255,0.10)",
                    animation: "pulse 1.5s ease-in-out infinite",
                  }}
                />
              ))}
            </div>
          )}

          {/* Estado: tem Visão Âncora */}
          {temVisao && (
            <>
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
                &ldquo;{manchete}&rdquo;
              </h2>

              {declaracao && (
                <p
                  style={{
                    fontSize: 14,
                    color: "rgba(245,244,240,0.60)",
                    lineHeight: 1.7,
                    maxWidth: 480,
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {declaracao}
                </p>
              )}
            </>
          )}

          {/* Estado: sem Visão Âncora */}
          {semVisao && (
            <>
              <h2
                style={{
                  fontFamily: "var(--font-heading)",
                  fontStyle: "italic",
                  fontSize: "clamp(20px, 3vw, 28px)",
                  fontWeight: 400,
                  color: "rgba(245,244,240,0.70)",
                  lineHeight: 1.3,
                  margin: 0,
                }}
              >
                Você ainda não criou sua Visão Âncora.
              </h2>
              <p
                style={{
                  fontSize: 14,
                  color: "rgba(245,244,240,0.50)",
                  lineHeight: 1.65,
                  maxWidth: 400,
                }}
              >
                É o documento mais importante da sua jornada — leva 60 minutos
                e ancora todas as suas decisões nos próximos 12 meses.
              </p>
              <div>
                <Link
                  href="/visao-ancora"
                  style={{
                    display: "inline-block",
                    fontFamily: "var(--font-body)",
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#1a5c3a",
                    background: "var(--color-brand-gold)",
                    padding: "11px 24px",
                    borderRadius: 10,
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  Criar minha Visão Âncora →
                </Link>
              </div>
            </>
          )}
        </div>

        {/* ── Direita: anel vitality + CTA ── */}
        <div
          className="flex flex-col items-center justify-center gap-5 p-8 flex-shrink-0"
          style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
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
              <circle
                cx="62" cy="62" r={V_R}
                stroke="rgba(255,255,255,0.10)"
                strokeWidth="9" fill="none"
              />
              <circle
                cx="62" cy="62" r={V_R}
                stroke="var(--color-brand-gold)"
                strokeWidth="9" fill="none"
                strokeLinecap="round"
                strokeDasharray={V_CIRCUM}
                strokeDashoffset={V_OFFSET}
                style={{ transition: "stroke-dashoffset 1s ease" }}
              />
            </svg>
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

          {/* CTA condicional */}
          {temVisao && (
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
          )}
          {semVisao && (
            <Link
              href="/visao-ancora"
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 12,
                fontWeight: 600,
                color: "rgba(245,244,240,0.60)",
                textDecoration: "underline",
                whiteSpace: "nowrap",
              }}
            >
              Saber mais
            </Link>
          )}
        </div>

      </div>

      {/* Keyframes para skeleton */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.5 }
          50% { opacity: 1 }
        }
      `}</style>
    </div>
  );
}

// ─── Diário de Bordo Card ────────────────────────────────────────────────────

function DiarioBordoCard() {
  const { user } = useUser();
  const { getClient } = useSupabaseClient();

  const [loading,        setLoading]        = useState(true);
  const [registradoHoje, setRegistradoHoje] = useState(false);
  const [notaHoje,       setNotaHoje]       = useState<number | null>(null);
  const [emocaoHoje,     setEmocaoHoje]     = useState<string | null>(null);
  const [streak,         setStreak]         = useState(0);

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    (async () => {
      const client  = await getClient();
      const hoje    = new Date().toISOString().split("T")[0];

      const { data } = await client
        .from("diario_kairos")
        .select("data, nota_dia, emocao")
        .eq("user_id", user.id)
        .order("data", { ascending: false })
        .limit(60);

      if (data && data.length > 0) {
        const datas = data.map((d) => d.data as string);
        setStreak(calcularStreakDias(datas));

        const entrada = data.find((d) => d.data === hoje);
        if (entrada) {
          setRegistradoHoje(true);
          setNotaHoje(entrada.nota_dia as number | null);
          setEmocaoHoje(entrada.emocao as string | null);
        }
      }
      setLoading(false);
    })();
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const nome = user?.firstName ?? user?.fullName?.split(" ")[0] ?? "você";

  function notaCor(n: number): string {
    if (n >= 8) return "#22c55e";
    if (n >= 6) return "#C8A030";
    return "#ef4444";
  }

  return (
    <div
      style={{
        background: "#0E0E0E",
        border: "1px solid rgba(200,160,48,0.25)",
        borderRadius: 16,
        overflow: "hidden",
      }}
    >
      {/* Linha dourada superior */}
      <div style={{ height: 3, background: "linear-gradient(90deg, #C8A030 0%, #a07820 100%)" }} />

      <div className="flex flex-col sm:flex-row items-stretch gap-0">

        {/* ── Esquerda: conteúdo principal ── */}
        <div className="flex flex-col justify-center gap-4 p-6 flex-1">

          {/* Eyebrow */}
          <span style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10, fontWeight: 600,
            letterSpacing: "0.12em", textTransform: "uppercase",
            color: "rgba(200,160,48,0.70)",
          }}>
            📔 Diário de Bordo · Hoje
          </span>

          {/* Skeleton */}
          {loading && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[200, 140].map((w) => (
                <div key={w} style={{
                  height: 16, width: w, maxWidth: "100%", borderRadius: 6,
                  background: "rgba(255,255,255,0.08)",
                  animation: "dbPulse 1.5s ease-in-out infinite",
                }} />
              ))}
            </div>
          )}

          {/* Não registrou hoje */}
          {!loading && !registradoHoje && (
            <>
              <h3 style={{
                fontFamily: "var(--font-heading)",
                fontStyle: "italic",
                fontSize: "clamp(18px, 2.5vw, 24px)",
                fontWeight: 400,
                color: "#f5f4f0",
                lineHeight: 1.25,
                margin: 0,
              }}>
                Como foi seu dia, {nome}?
              </h3>
              <p style={{
                fontSize: 13,
                color: "rgba(245,244,240,0.50)",
                lineHeight: 1.6,
                margin: 0,
                maxWidth: 400,
              }}>
                Reserve 5 minutos para registrar suas vitórias, aprendizados e como você está se sentindo.
              </p>
              <div>
                <Link
                  href="/ferramentas/diario-bordo"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    fontFamily: "var(--font-body)",
                    fontSize: 15, fontWeight: 700,
                    color: "#0E0E0E",
                    background: "#C8A030",
                    padding: "12px 26px",
                    borderRadius: 12,
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                    boxShadow: "0 4px 20px rgba(200,160,48,0.35)",
                    transition: "opacity 0.15s",
                  }}
                >
                  <span>Registrar agora</span>
                  <span>→</span>
                </Link>
              </div>
            </>
          )}

          {/* Já registrou hoje */}
          {!loading && registradoHoje && (
            <>
              {/* Badge "Registrado" */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 700,
                  color: "#22c55e",
                  background: "rgba(34,197,94,0.12)",
                  border: "1px solid rgba(34,197,94,0.25)",
                  padding: "5px 14px", borderRadius: 99,
                }}>
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <path d="M2 6.5l3.5 3.5 5.5-6" stroke="#22c55e" strokeWidth="2"
                      strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Registrado hoje
                </span>

                {notaHoje !== null && (
                  <span style={{
                    fontFamily: "var(--font-mono)", fontSize: 15, fontWeight: 700,
                    color: notaCor(notaHoje),
                  }}>
                    {notaHoje}/10
                  </span>
                )}

                {emocaoHoje && (
                  <span style={{
                    fontFamily: "var(--font-body)", fontSize: 13, fontStyle: "italic",
                    color: "rgba(245,244,240,0.55)",
                  }}>
                    · {emocaoHoje}
                  </span>
                )}
              </div>

              <p style={{
                fontSize: 13,
                color: "rgba(245,244,240,0.45)",
                lineHeight: 1.55,
                margin: 0,
              }}>
                Excelente! Seu registro de hoje está salvo. Volte à noite para o ritual noturno.
              </p>

              <div>
                <Link
                  href="/ferramentas/diario-bordo"
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: 13, fontWeight: 600,
                    color: "#C8A030",
                    textDecoration: "none",
                  }}
                >
                  Editar registro →
                </Link>
              </div>
            </>
          )}
        </div>

        {/* ── Direita: streak ── */}
        <div
          className="flex flex-col items-center justify-center gap-3 p-6 flex-shrink-0 sm:border-l"
          style={{
            borderColor: "rgba(255,255,255,0.07)",
            borderTop: "1px solid rgba(255,255,255,0.07)",
            minWidth: 140,
          }}
        >
          {loading ? (
            <div style={{
              width: 64, height: 64, borderRadius: "50%",
              background: "rgba(255,255,255,0.06)",
              animation: "dbPulse 1.5s ease-in-out infinite",
            }} />
          ) : (
            <>
              {/* Círculo de streak */}
              <div style={{
                width: 72, height: 72, borderRadius: "50%",
                background: streak > 0
                  ? "linear-gradient(135deg, rgba(200,160,48,0.20) 0%, rgba(200,160,48,0.08) 100%)"
                  : "rgba(255,255,255,0.04)",
                border: streak > 0
                  ? "2px solid rgba(200,160,48,0.40)"
                  : "2px solid rgba(255,255,255,0.08)",
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                gap: 1,
              }}>
                <span style={{ fontSize: streak > 0 ? 20 : 16 }}>
                  {streak > 0 ? "🔥" : "📔"}
                </span>
                <span style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: streak >= 10 ? 18 : 22,
                  fontWeight: 700,
                  color: streak > 0 ? "#C8A030" : "rgba(245,244,240,0.30)",
                  lineHeight: 1,
                }}>
                  {streak}
                </span>
              </div>

              <div style={{ textAlign: "center" }}>
                <p style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 11, fontWeight: 600,
                  color: streak > 0 ? "rgba(245,244,240,0.70)" : "rgba(245,244,240,0.30)",
                  margin: 0, lineHeight: 1.3,
                }}>
                  {streak === 1 ? "dia seguido" : "dias seguidos"}
                </p>
                {streak === 0 && (
                  <p style={{
                    fontFamily: "var(--font-body)", fontSize: 10,
                    color: "rgba(245,244,240,0.25)",
                    margin: "4px 0 0",
                  }}>
                    Comece hoje!
                  </p>
                )}
                {streak >= 7 && (
                  <p style={{
                    fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 600,
                    color: "#C8A030",
                    margin: "4px 0 0", letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}>
                    🏆 Top semana
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes dbPulse {
          0%, 100% { opacity: 0.4 }
          50%       { opacity: 0.9 }
        }
      `}</style>
    </div>
  );
}

// ─── Bottom Bar ───────────────────────────────────────────────────────────────

function BottomBar() {
  return (
    <div
      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl px-6 py-5"
      style={{
        background: "#1A1A1A",
        border: "1px solid rgba(200,160,48,0.18)",
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex items-center justify-center rounded-xl flex-shrink-0"
          style={{ width: 40, height: 40, background: "rgba(200,160,48,0.1)", fontSize: 18 }}
        >
          🛠
        </div>
        <div>
          <p
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 15,
              fontWeight: 700,
              color: "#F5F0E8",
              lineHeight: 1,
            }}
          >
            7 de 16 ferramentas acessadas
          </p>
          <p style={{ fontSize: 12, color: "rgba(245,240,232,0.5)", marginTop: 3 }}>
            Continue explorando as 9 restantes para desbloquear todo o potencial
          </p>
        </div>
      </div>
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
  const { user, isLoaded } = useUser();
  const { getClient } = useSupabaseClient();

  const [manchete,   setManchete]   = useState<string | null>(null);
  const [declaracao, setDeclaracao] = useState<string | null>(null);
  const [heroLoading, setHeroLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;
    if (!user?.id) {
      setHeroLoading(false);
      return;
    }
    (async () => {
      const client = await getClient();
      const data = await buscarVisaoAncora(user.id, client);
      setManchete(data?.manchete   ?? null);
      setDeclaracao(data?.declaracao ?? null);
      setHeroLoading(false);
    })();
  }, [isLoaded, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <DashboardLayout>
      <Onboarding />

      <div className="flex flex-col gap-6">
        {/* 0. Missão do Dia personalizada */}
        <MissaoDia />
        {/* 0b. Diário de Bordo — acesso principal */}
        <DiarioBordoCard />
        {/* 1. Visão Âncora Hero — dados reais do Supabase */}
        <VisionAnchorHero
          manchete={manchete}
          declaracao={declaracao}
          loading={heroLoading}
        />

        {/* 2. Grid central: Roda da Vida (carrega do Supabase) + Próximas Ações */}



        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <LifeWheel />
          <NextActions />
        </div>

        {/* Momento Kairos */}
        <MomentoKairosCard />

        {/* 3. Progresso por Fase — grid 2×2 */}
        <PhaseProgress />

        {/* 4. Bottom Bar */}
        <BottomBar />
      </div>
    </DashboardLayout>
  );
}
