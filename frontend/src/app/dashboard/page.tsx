'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import DashboardLayout, { useModoFoco } from "@/components/dashboard/DashboardLayout";
import LifeWheel from "@/components/dashboard/LifeWheel";
import NextActions from "@/components/dashboard/NextActions";
import MomentoKairosCard from "@/components/dashboard/MomentoKairosCard";
import Onboarding from "@/components/dashboard/Onboarding";
import { buscarVisaoAncora } from "@/lib/queries";
import { useSupabaseClient } from "@/lib/useSupabaseClient";
import { calcularStreakDias } from "@/lib/badges";

// ─── Tokens ───────────────────────────────────────────────────────────────────

const G       = '#0E0E0E';
const GOLD    = '#C8A030';
const CREAM   = '#F5F2EC';

// ─── Dados das fases ──────────────────────────────────────────────────────────

const FASES = [
  { num: '01', nome: 'Autoconhecimento',     slugs: ['raio-x','bussola-valores','swot-pessoal','feedback-360'],          cor: '#4a8c6a', pct: 75, tools: 4 },
  { num: '02', nome: 'Visão e Estratégia',   slugs: ['okrs-pessoais','design-vida','dre-pessoal','rotina-ideal'],         cor: '#d4905a', pct: 40, tools: 4 },
  { num: '03', nome: 'Hábitos e Produtividade', slugs: ['auditoria-tempo','arquiteto-rotinas','sprint-aprendizado','energia-vitalidade'], cor: '#5a7abf', pct: 20, tools: 4 },
  { num: '04', nome: 'Mentalidade',          slugs: ['desconstrutor-crencas','crm-relacionamentos','diario-bordo','prevencao-recaida'], cor: '#9b6baf', pct: 5, tools: 4 },
];

// ─── Zone 1 — Card "Hoje" ─────────────────────────────────────────────────────

function CardHoje() {
  const { user }       = useUser();
  const { getClient }  = useSupabaseClient();

  const [loading,         setLoading]         = useState(true);
  const [registradoHoje,  setRegistradoHoje]  = useState(false);
  const [streak,          setStreak]          = useState(0);
  const [notaHoje,        setNotaHoje]        = useState<number | null>(null);
  const [emocaoHoje,      setEmocaoHoje]      = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    (async () => {
      const client  = await getClient();
      const hoje    = new Date().toISOString().split('T')[0];
      const { data } = await client
        .from('diario_kairos')
        .select('data, nota_dia, emocao')
        .eq('user_id', user.id)
        .order('data', { ascending: false })
        .limit(60);

      if (data?.length) {
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

  const hora = new Date().getHours();
  const emoji = hora < 12 ? '🌅' : hora < 18 ? '☀️' : '🌙';

  function notaCor(n: number): string {
    if (n >= 8) return '#22c55e';
    if (n >= 6) return GOLD;
    return '#ef4444';
  }

  return (
    <div
      style={{
        background: G,
        border: `1px solid ${registradoHoje ? 'rgba(34,197,94,0.22)' : `rgba(200,160,48,0.28)`}`,
        borderRadius: 20,
        overflow: 'hidden',
        position: 'relative',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = `0 12px 40px rgba(0,0,0,0.3)`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Linha superior colorida */}
      <div style={{
        height: 3,
        background: registradoHoje
          ? 'linear-gradient(90deg, #22c55e, #16a34a)'
          : `linear-gradient(90deg, ${GOLD}, #e8c76a)`,
      }} />

      <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 0 }}>

        {/* ── Bloco principal ── */}
        <div style={{ flex: 1, minWidth: 220, display: 'flex', flexDirection: 'column', gap: 16, padding: '20px 24px' }}>

          {/* Eyebrow */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600,
              letterSpacing: '0.1em', textTransform: 'uppercase' as const,
              color: 'rgba(200,160,48,0.70)',
            }}>
              {emoji} Hoje · Diário de Bordo
            </span>
          </div>

          {/* Skeleton */}
          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[200, 130].map((w) => (
                <div key={w} style={{ height: 16, width: w, maxWidth: '100%', borderRadius: 6, background: 'rgba(255,255,255,0.08)', animation: 'cardPulse 1.5s ease-in-out infinite' }} />
              ))}
            </div>
          )}

          {/* Não registrou hoje */}
          {!loading && !registradoHoje && (
            <>
              <div>
                <h2 style={{
                  fontFamily: 'var(--font-heading)', fontStyle: 'italic',
                  fontSize: 'clamp(18px,2.5vw,24px)', fontWeight: 400,
                  color: '#f5f4f0', lineHeight: 1.25, margin: 0,
                }}>
                  Como foi seu dia até agora?
                </h2>
                <p style={{ fontSize: 13, color: 'rgba(245,244,240,0.48)', lineHeight: 1.6, marginTop: 6, maxWidth: 380 }}>
                  Reserve 5 minutos para registrar suas vitórias e o que aprendeu hoje.
                </p>
              </div>
              <div>
                <Link
                  href="/ferramentas/diario-bordo"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 700,
                    color: G, background: GOLD,
                    padding: '11px 24px', borderRadius: 12,
                    textDecoration: 'none', whiteSpace: 'nowrap',
                    boxShadow: `0 4px 20px rgba(200,160,48,0.35)`,
                    transition: 'opacity 0.2s, transform 0.2s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  Registrar agora →
                </Link>
              </div>
            </>
          )}

          {/* Registrou hoje */}
          {!loading && registradoHoje && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 700,
                  color: '#22c55e', background: 'rgba(34,197,94,0.12)',
                  border: '1px solid rgba(34,197,94,0.25)', padding: '5px 12px', borderRadius: 99,
                }}>
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                    <path d="M1.5 5.5l3 3 5-5.5" stroke="#22c55e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Registrado hoje
                </span>
                {notaHoje !== null && (
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 700, color: notaCor(notaHoje) }}>
                    {notaHoje}/10
                  </span>
                )}
                {emocaoHoje && (
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontStyle: 'italic', color: 'rgba(245,244,240,0.50)' }}>
                    · {emocaoHoje}
                  </span>
                )}
              </div>
              <p style={{ fontSize: 13, color: 'rgba(245,244,240,0.42)', lineHeight: 1.55, margin: 0 }}>
                Ótimo! Registro salvo. Continue sua jornada nas ferramentas.
              </p>
              <Link href="/ferramentas/diario-bordo"
                style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: GOLD, textDecoration: 'none', transition: 'opacity 0.2s' }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.75'; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}>
                Editar registro →
              </Link>
            </>
          )}
        </div>

        {/* ── Bloco streak ── */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 10, padding: '20px 28px', flexShrink: 0,
          borderLeft: '1px solid rgba(255,255,255,0.07)',
          minWidth: 120,
        }}>
          {loading ? (
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', animation: 'cardPulse 1.5s ease-in-out infinite' }} />
          ) : (
            <>
              <div style={{
                width: 70, height: 70, borderRadius: '50%',
                background: streak > 0
                  ? 'linear-gradient(135deg, rgba(200,160,48,0.22), rgba(200,160,48,0.08))'
                  : 'rgba(255,255,255,0.04)',
                border: `2px solid ${streak > 0 ? 'rgba(200,160,48,0.40)' : 'rgba(255,255,255,0.08)'}`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1,
              }}>
                <span style={{ fontSize: streak > 0 ? 18 : 15 }}>{streak > 0 ? '🔥' : '📔'}</span>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: streak >= 10 ? 17 : 20, fontWeight: 700,
                  color: streak > 0 ? GOLD : 'rgba(245,244,240,0.28)', lineHeight: 1,
                }}>
                  {streak}
                </span>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{
                  fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 600,
                  color: streak > 0 ? 'rgba(245,244,240,0.65)' : 'rgba(245,244,240,0.28)',
                  margin: 0, lineHeight: 1.3,
                }}>
                  {streak === 1 ? 'dia seguido' : 'dias seguidos'}
                </p>
                {streak === 0 && (
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'rgba(245,244,240,0.22)', margin: '3px 0 0' }}>
                    Comece hoje!
                  </p>
                )}
                {streak >= 7 && (
                  <p style={{
                    fontFamily: 'var(--font-mono)', fontSize: 8, fontWeight: 700, color: GOLD,
                    margin: '3px 0 0', letterSpacing: '0.06em', textTransform: 'uppercase' as const,
                  }}>
                    🏆 Top semana
                  </p>
                )}
              </div>
            </>
          )}
        </div>

      </div>

      <style>{`@keyframes cardPulse { 0%,100%{opacity:0.4} 50%{opacity:0.85} }`}</style>
    </div>
  );
}

// ─── Zone 2 — Progresso das Fases ────────────────────────────────────────────

function FasesProgresso() {
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid rgba(30,57,42,0.1)',
        borderRadius: 20,
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.10)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Cabeçalho */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 700, color: '#1E392A', margin: 0, lineHeight: 1.2 }}>
            Progresso da Jornada
          </p>
          <p style={{ fontSize: 12, color: 'var(--color-brand-gray)', margin: '3px 0 0' }}>
            4 fases · 16 ferramentas
          </p>
        </div>
        <Link href="/ferramentas"
          style={{ fontSize: 12, fontWeight: 600, color: GOLD, textDecoration: 'none', transition: 'opacity 0.2s' }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.7'; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}>
          Ver todas →
        </Link>
      </div>

      {/* Barras horizontais */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {FASES.map((fase, i) => (
          <Link key={fase.num} href="/ferramentas" style={{ textDecoration: 'none' }}>
            <div
              style={{ display: 'flex', alignItems: 'center', gap: 12, transition: 'opacity 0.2s' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.opacity = '0.8'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.opacity = '1'; }}
            >
              {/* Badge fase */}
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700,
                color: fase.cor, background: `${fase.cor}18`,
                padding: '2px 7px', borderRadius: 99, flexShrink: 0,
                whiteSpace: 'nowrap',
              }}>
                F{fase.num}
              </span>

              {/* Nome */}
              <span style={{
                fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500,
                color: '#2a2a2a', flex: '0 0 160px', minWidth: 0,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {fase.nome}
              </span>

              {/* Barra */}
              <div style={{
                flex: 1, height: 7, background: 'rgba(0,0,0,0.07)', borderRadius: 99, overflow: 'hidden',
                minWidth: 60,
              }}>
                <div style={{
                  height: '100%', borderRadius: 99,
                  width: `${fase.pct}%`,
                  background: fase.cor,
                  animation: `barGrow 0.7s ease ${i * 100}ms both`,
                }} />
              </div>

              {/* Percentual */}
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700,
                color: fase.pct >= 50 ? fase.cor : 'var(--color-brand-gray)',
                flexShrink: 0, minWidth: 32, textAlign: 'right' as const,
              }}>
                {fase.pct}%
              </span>
            </div>
          </Link>
        ))}
      </div>

      <style>{`@keyframes barGrow { from { width: 0 } }`}</style>
    </div>
  );
}

// ─── Visão Âncora Mini ────────────────────────────────────────────────────────

function VisaoAncoraMini({ manchete, declaracao, loading }: {
  manchete: string | null;
  declaracao: string | null;
  loading: boolean;
}) {
  const tem = !loading && !!manchete;

  return (
    <div
      style={{
        background: G,
        border: `1px solid rgba(200,160,48,0.20)`,
        borderRadius: 20,
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.4)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'rgba(200,160,48,0.55)' }}>
          Visão Âncora · F00
        </span>
      </div>

      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[200, 160, 120].map((w) => (
            <div key={w} style={{ height: 14, width: w, maxWidth: '100%', borderRadius: 5, background: 'rgba(255,255,255,0.08)', animation: 'cardPulse 1.5s ease-in-out infinite' }} />
          ))}
        </div>
      )}

      {tem && (
        <>
          <h3 style={{
            fontFamily: 'var(--font-heading)', fontStyle: 'italic',
            fontSize: 'clamp(16px,2vw,20px)', fontWeight: 400,
            color: '#f5f4f0', lineHeight: 1.3, margin: 0,
          }}>
            &ldquo;{manchete}&rdquo;
          </h3>
          {declaracao && (
            <p style={{
              fontSize: 13, color: 'rgba(245,244,240,0.50)', lineHeight: 1.65, margin: 0,
              overflow: 'hidden', display: '-webkit-box',
              WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const,
            }}>
              {declaracao}
            </p>
          )}
          <Link href="/visao-ancora"
            style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: GOLD, textDecoration: 'none', transition: 'opacity 0.2s' }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.75'; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}>
            Reler minha visão →
          </Link>
        </>
      )}

      {!loading && !manchete && (
        <>
          <h3 style={{
            fontFamily: 'var(--font-heading)', fontStyle: 'italic',
            fontSize: 18, fontWeight: 400, color: 'rgba(245,244,240,0.60)', lineHeight: 1.3, margin: 0,
          }}>
            Você ainda não criou sua Visão Âncora.
          </h3>
          <p style={{ fontSize: 13, color: 'rgba(245,244,240,0.38)', lineHeight: 1.6, margin: 0, maxWidth: 320 }}>
            É o documento central da sua jornada de transformação. Leva 60 minutos e vale cada segundo.
          </p>
          <Link href="/visao-ancora"
            style={{
              display: 'inline-block', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 700,
              color: G, background: GOLD, padding: '9px 20px', borderRadius: 10,
              textDecoration: 'none', transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.88'; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}>
            Criar agora →
          </Link>
        </>
      )}
    </div>
  );
}

// ─── Modo Foco: Cockpit ───────────────────────────────────────────────────────

function CockpitFoco({ manchete }: { manchete: string | null }) {
  return (
    <div style={{
      height: '100%', minHeight: '100dvh',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px', gap: 40, background: G,
    }}>
      {/* Saudação central */}
      <div style={{ textAlign: 'center', maxWidth: 560 }}>
        <p style={{
          fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600,
          color: 'rgba(200,160,48,0.55)', letterSpacing: '0.14em', textTransform: 'uppercase' as const,
          marginBottom: 16,
        }}>
          ⊙ Modo Foco ativo
        </p>
        {manchete && (
          <h1 style={{
            fontFamily: 'var(--font-heading)', fontStyle: 'italic',
            fontSize: 'clamp(24px, 4vw, 38px)', fontWeight: 400,
            color: '#f5f4f0', lineHeight: 1.2, margin: '0 0 20px',
          }}>
            &ldquo;{manchete}&rdquo;
          </h1>
        )}
        {!manchete && (
          <h1 style={{
            fontFamily: 'var(--font-heading)', fontStyle: 'italic',
            fontSize: 'clamp(24px, 4vw, 38px)', fontWeight: 400,
            color: 'rgba(245,244,240,0.50)', lineHeight: 1.2, margin: '0 0 20px',
          }}>
            O que é mais importante agora?
          </h1>
        )}
      </div>

      {/* CTAs essenciais */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        {[
          { label: 'Registrar Diário', href: '/ferramentas/diario-bordo', primary: true },
          { label: 'Ver Ferramentas',  href: '/ferramentas',              primary: false },
          { label: 'Minha Visão',      href: '/visao-ancora',             primary: false },
        ].map((btn) => (
          <Link key={btn.label} href={btn.href}
            style={{
              display: 'inline-block',
              fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: btn.primary ? 700 : 500,
              color: btn.primary ? G : GOLD,
              background: btn.primary ? GOLD : 'rgba(200,160,48,0.10)',
              border: btn.primary ? 'none' : `1px solid rgba(200,160,48,0.28)`,
              padding: '12px 28px', borderRadius: 12,
              textDecoration: 'none',
              transition: 'transform 0.2s, opacity 0.2s',
              boxShadow: btn.primary ? '0 4px 20px rgba(200,160,48,0.35)' : 'none',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.opacity = '0.9'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.opacity = '1'; }}>
            {btn.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const { getClient }      = useSupabaseClient();
  const modoFoco           = useModoFoco();

  const [manchete,    setManchete]    = useState<string | null>(null);
  const [declaracao,  setDeclaracao]  = useState<string | null>(null);
  const [heroLoading, setHeroLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;
    if (!user?.id) { setHeroLoading(false); return; }
    (async () => {
      const client = await getClient();
      const data   = await buscarVisaoAncora(user.id, client);
      setManchete(data?.manchete   ?? null);
      setDeclaracao(data?.declaracao ?? null);
      setHeroLoading(false);
    })();
  }, [isLoaded, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Modo Foco: cockpit minimalista ──────────────────────────────────────────
  if (modoFoco) {
    return (
      <DashboardLayout>
        <CockpitFoco manchete={manchete} />
      </DashboardLayout>
    );
  }

  // ── Layout normal ──────────────────────────────────────────────────────────
  return (
    <DashboardLayout>
      <Onboarding />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 1200 }}>

        {/* ════════════════════════════════════════════════════
            ZONA 1 — Hoje
        ════════════════════════════════════════════════════ */}
        <section>
          <CardHoje />
        </section>

        {/* ════════════════════════════════════════════════════
            ZONA 2 — Progresso das 4 Fases (horizontal)
        ════════════════════════════════════════════════════ */}
        <section>
          <FasesProgresso />
        </section>

        {/* ════════════════════════════════════════════════════
            ZONA 3 — Insights + Roda da Vida
        ════════════════════════════════════════════════════ */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, alignItems: 'start' }}>

          {/* Roda da Vida */}
          <div
            style={{
              background: '#fff',
              border: '1px solid rgba(30,57,42,0.10)',
              borderRadius: 20,
              overflow: 'hidden',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.10)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <LifeWheel />
          </div>

          {/* Visão Âncora + Próximas Ações */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <VisaoAncoraMini manchete={manchete} declaracao={declaracao} loading={heroLoading} />
            <div
              style={{
                background: '#fff',
                border: '1px solid rgba(30,57,42,0.10)',
                borderRadius: 20,
                overflow: 'hidden',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.10)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <NextActions />
            </div>
          </div>
        </section>

        {/* Momento Kairos */}
        <section>
          <MomentoKairosCard />
        </section>

        {/* Bottom CTA */}
        <section>
          <div
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexWrap: 'wrap', gap: 16,
              background: '#1A1A1A',
              border: `1px solid rgba(200,160,48,0.18)`,
              borderRadius: 16, padding: '18px 24px',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: 'rgba(200,160,48,0.10)', fontSize: 18,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                🛠
              </div>
              <div>
                <p style={{ fontFamily: 'var(--font-heading)', fontSize: 14, fontWeight: 700, color: '#F5F0E8', lineHeight: 1, margin: 0 }}>
                  16 ferramentas disponíveis
                </p>
                <p style={{ fontSize: 12, color: 'rgba(245,240,232,0.45)', marginTop: 4 }}>
                  Continue explorando para desbloquear todo o potencial da plataforma
                </p>
              </div>
            </div>
            <Link href="/ferramentas"
              style={{
                display: 'inline-block', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 700,
                color: G, background: GOLD, padding: '9px 20px', borderRadius: 10,
                textDecoration: 'none', flexShrink: 0, transition: 'opacity 0.2s, transform 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}>
              Ver todas as ferramentas →
            </Link>
          </div>
        </section>

      </div>
    </DashboardLayout>
  );
}
