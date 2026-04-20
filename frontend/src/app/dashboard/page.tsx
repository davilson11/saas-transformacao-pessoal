'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import DashboardLayout, { useModoFoco } from "@/components/dashboard/DashboardLayout";
import LifeWheel from "@/components/dashboard/LifeWheel";
import NextActions from "@/components/dashboard/NextActions";
import Onboarding from "@/components/dashboard/Onboarding";
import TrialBanner from "@/components/dashboard/TrialBanner";
import PaywallScreen from "@/components/dashboard/PaywallScreen";
import { buscarVisaoAncora } from "@/lib/queries";
import { useSupabaseClient } from "@/lib/useSupabaseClient";
import { useSubscription } from "@/hooks/useSubscription";
import RevisaoSemanal from "@/components/dashboard/RevisaoSemanal";
import CelebracaoFase from "@/components/dashboard/CelebracaoFase";

// ─── Tokens ───────────────────────────────────────────────────────────────────

const G       = '#0E0E0E';
const GOLD    = '#C8A030';
const CREAM   = '#F5F2EC';

// ─── Ferramentas ordenadas ────────────────────────────────────────────────────

const TODAS_FERRAMENTAS = [
  { nome: 'Raio-X 360°',             slug: 'raio-x' },
  { nome: 'Bússola de Valores',       slug: 'bussola-valores' },
  { nome: 'SWOT Pessoal',             slug: 'swot-pessoal' },
  { nome: 'Feedback 360°',            slug: 'feedback-360' },
  { nome: 'OKRs Pessoais',            slug: 'okrs-pessoais' },
  { nome: 'Design de Vida',           slug: 'design-vida' },
  { nome: 'DRE Pessoal',              slug: 'dre-pessoal' },
  { nome: 'Rotina Ideal',             slug: 'rotina-ideal' },
  { nome: 'Auditoria de Tempo',       slug: 'auditoria-tempo' },
  { nome: 'Arquiteto de Rotinas',     slug: 'arquiteto-rotinas' },
  { nome: 'Sprint de Aprendizado',    slug: 'sprint-aprendizado' },
  { nome: 'Energia e Vitalidade',     slug: 'energia-vitalidade' },
  { nome: 'Desconstrutor de Crenças', slug: 'desconstrutor-crencas' },
  { nome: 'CRM de Relacionamentos',   slug: 'crm-relacionamentos' },
  { nome: 'Diário de Bordo',          slug: 'diario-bordo' },
  { nome: 'Prevenção de Recaída',     slug: 'prevencao-recaida' },
];

// ─── Card único "Próximo Passo" ───────────────────────────────────────────────

type EstadoDia = 'sem-momento' | 'sem-diario' | 'completo';

function CardProximoPasso() {
  const { user }      = useUser();
  const { getClient } = useSupabaseClient();

  const hoje = new Date().toLocaleDateString('pt-BR', {
    timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit',
  }).split('/').reverse().join('-');

  const [loading,           setLoading]           = useState(true);
  const [estado,            setEstado]            = useState<EstadoDia>('sem-momento');
  const [proximaFerramenta, setProximaFerramenta] = useState<{ nome: string; slug: string } | null>(null);

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    (async () => {
      const client = await getClient();

      // Verifica se o usuário tem registro no diário hoje
      const { data: diario } = await client
        .from('diario_kairos')
        .select('texto_livre, conquista, tipo_entrada')
        .eq('user_id', user.id)
        .eq('data', hoje)
        .maybeSingle();

      if (!diario) {
        // Sem nenhum registro hoje → sugerir abrir o Momento
        setEstado('sem-momento');
        setLoading(false);
        return;
      }

      // Tem registro, mas sem conteúdo do diário → sugerir registrar o dia
      const temConteudoDiario = !!(diario.texto_livre || diario.conquista);
      if (!temConteudoDiario) {
        setEstado('sem-diario');
        setLoading(false);
        return;
      }

      // Tudo feito hoje → buscar próxima ferramenta incompleta
      setEstado('completo');
      const { data: respostas } = await client
        .from('ferramentas_respostas')
        .select('ferramenta_slug, concluida')
        .eq('user_id', user.id);

      const concluidas = new Set(
        (respostas ?? [])
          .filter((r: { concluida: boolean }) => r.concluida)
          .map((r: { ferramenta_slug: string }) => r.ferramenta_slug)
      );
      const proxima = TODAS_FERRAMENTAS.find(t => !concluidas.has(t.slug));
      setProximaFerramenta(proxima ?? null);
      setLoading(false);
    })();
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const configs: Record<EstadoDia, {
    emoji: string; label: string; titulo: string; subtitulo: string; btnText: string; btnHref: string;
  }> = {
    'sem-momento': {
      emoji:    '🌅',
      label:    'Comece o dia',
      titulo:   'Abra seu Momento Kairos',
      subtitulo:'Sua palavra do dia e missão te esperam.',
      btnText:  'Abrir Momento Kairos →',
      btnHref:  '/momento',
    },
    'sem-diario': {
      emoji:    '📔',
      label:    'Próximo passo',
      titulo:   'Registre seu dia',
      subtitulo:'Reserve 5 minutos para refletir e anotar.',
      btnText:  'Registrar meu dia →',
      btnHref:  '/ferramentas/diario-bordo',
    },
    'completo': {
      emoji:    '🧭',
      label:    'Continue evoluindo',
      titulo:   proximaFerramenta ? `Próxima: ${proximaFerramenta.nome}` : 'Explorar ferramentas',
      subtitulo:proximaFerramenta
        ? 'Continue sua jornada de transformação.'
        : 'Você completou todas as ferramentas!',
      btnText:  proximaFerramenta ? 'Abrir ferramenta →' : 'Ver ferramentas →',
      btnHref:  proximaFerramenta ? `/ferramentas/${proximaFerramenta.slug}` : '/ferramentas',
    },
  };

  if (loading) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #1A1200 0%, #0E0E0E 100%)',
        border: '1.5px solid rgba(200,160,48,0.18)',
        borderRadius: 20, padding: '24px 28px',
        display: 'flex', alignItems: 'center', gap: 24,
        animation: 'cardPulse 1.5s ease-in-out infinite',
      }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ height: 10, width: 80, background: 'rgba(200,160,48,0.15)', borderRadius: 4 }} />
          <div style={{ height: 20, width: 220, background: 'rgba(255,255,255,0.07)', borderRadius: 6 }} />
          <div style={{ height: 13, width: 160, background: 'rgba(255,255,255,0.04)', borderRadius: 4 }} />
        </div>
        <div style={{ width: 180, height: 44, borderRadius: 12, background: 'rgba(200,160,48,0.15)', flexShrink: 0 }} />
        <style>{`@keyframes cardPulse { 0%,100%{opacity:0.5} 50%{opacity:1} }`}</style>
      </div>
    );
  }

  const cfg = configs[estado];

  return (
    <Link href={cfg.btnHref} style={{ textDecoration: 'none', display: 'block' }}>
      <div
        style={{
          background: 'linear-gradient(135deg, #1A1200 0%, #0E0E0E 100%)',
          border: '1.5px solid rgba(200,160,48,0.32)',
          borderRadius: 20, padding: '22px 28px',
          display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap',
          boxShadow: '0 4px 32px rgba(200,160,48,0.08)',
          transition: 'border-color 0.2s, box-shadow 0.2s',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(200,160,48,0.55)';
          (e.currentTarget as HTMLDivElement).style.boxShadow  = '0 6px 40px rgba(200,160,48,0.16)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(200,160,48,0.32)';
          (e.currentTarget as HTMLDivElement).style.boxShadow  = '0 4px 32px rgba(200,160,48,0.08)';
        }}
      >
        {/* Ícone */}
        <div style={{
          width: 56, height: 56, borderRadius: 16, flexShrink: 0,
          background: 'rgba(200,160,48,0.12)',
          border: '1px solid rgba(200,160,48,0.28)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 26,
        }}>
          {cfg.emoji}
        </div>

        {/* Texto */}
        <div style={{ flex: 1, minWidth: 180 }}>
          <div style={{
            fontSize: 10, fontWeight: 700, color: GOLD,
            textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 5,
          }}>
            ⚡ {cfg.label}
          </div>
          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(16px, 2vw, 20px)', fontWeight: 700,
            color: '#F5F0E8', margin: '0 0 4px', lineHeight: 1.2,
          }}>
            {cfg.titulo}
          </h2>
          <p style={{ fontSize: 13, color: 'rgba(245,240,232,0.5)', margin: 0 }}>
            {cfg.subtitulo}
          </p>
        </div>

        {/* CTA */}
        <span style={{
          flexShrink: 0,
          display: 'inline-flex', alignItems: 'center',
          fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 14,
          color: G, background: GOLD,
          padding: '12px 26px', borderRadius: 12,
          whiteSpace: 'nowrap',
          boxShadow: '0 4px 20px rgba(200,160,48,0.35)',
        }}>
          {cfg.btnText}
        </span>
      </div>
    </Link>
  );
}

// ─── Dados das fases ──────────────────────────────────────────────────────────

const FASES = [
  { num: '01', nome: 'Autoconhecimento',     slugs: ['raio-x','bussola-valores','swot-pessoal','feedback-360'],          cor: '#4a8c6a', pct: 75, tools: 4 },
  { num: '02', nome: 'Visão e Estratégia',   slugs: ['okrs-pessoais','design-vida','dre-pessoal','rotina-ideal'],         cor: '#d4905a', pct: 40, tools: 4 },
  { num: '03', nome: 'Hábitos e Produtividade', slugs: ['auditoria-tempo','arquiteto-rotinas','sprint-aprendizado','energia-vitalidade'], cor: '#5a7abf', pct: 20, tools: 4 },
  { num: '04', nome: 'Mentalidade',          slugs: ['desconstrutor-crencas','crm-relacionamentos','diario-bordo','prevencao-recaida'], cor: '#9b6baf', pct: 5, tools: 4 },
];

// ─── Progresso das Fases ──────────────────────────────────────────────────────

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
                color: '#2a2a2a', flex: '1 1 100px', minWidth: 0,
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
              <span className="dash-fase-pct" style={{
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

// ─── Mapa de slugs por fase ───────────────────────────────────────────────────

const FASES_SLUGS: Record<number, string[]> = {
  1: ['raio-x', 'bussola-valores', 'swot-pessoal', 'feedback-360'],
  2: ['okrs-pessoais', 'design-vida', 'dre-pessoal', 'rotina-ideal'],
  3: ['auditoria-tempo', 'arquiteto-rotinas', 'sprint-aprendizado', 'energia-vitalidade'],
  4: ['desconstrutor-crencas', 'crm-relacionamentos', 'diario-bordo', 'prevencao-recaida'],
};

// ─── Página ───────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user, isLoaded }                   = useUser();
  const { getClient }                        = useSupabaseClient();
  const modoFoco                             = useModoFoco();
  const { hasAccess, loading: subLoading }   = useSubscription();

  const [manchete,      setManchete]      = useState<string | null>(null);
  const [declaracao,    setDeclaracao]    = useState<string | null>(null);
  const [heroLoading,   setHeroLoading]   = useState(true);
  const [faseConcluida, setFaseConcluida] = useState<number | null>(null);

  useEffect(() => {
    if (!isLoaded) return;
    if (!user?.id) { setHeroLoading(false); return; }
    (async () => {
      const client = await getClient();

      // Visão Âncora
      const visao = await buscarVisaoAncora(user.id, client);
      setManchete(visao?.manchete   ?? null);
      setDeclaracao(visao?.declaracao ?? null);
      setHeroLoading(false);

      // Detecção de fase concluída (não celebrada ainda)
      const { data: respostas } = await client
        .from('ferramentas_respostas')
        .select('ferramenta_slug, concluida')
        .eq('user_id', user.id);

      if (respostas && respostas.length > 0) {
        const concluidas = new Set(
          respostas
            .filter((r: { concluida: boolean }) => r.concluida)
            .map((r: { ferramenta_slug: string }) => r.ferramenta_slug)
        );
        for (const [fase, slugs] of Object.entries(FASES_SLUGS)) {
          const faseNum = Number(fase);
          const key = `kairos_fase_${faseNum}_celebrada`;
          if (slugs.every(s => concluidas.has(s)) && !localStorage.getItem(key)) {
            setFaseConcluida(faseNum);
            break;
          }
        }
      }
    })();
  }, [isLoaded, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Paywall: trial expirado ────────────────────────────────────────────────
  if (!subLoading && !hasAccess) {
    return (
      <DashboardLayout>
        <PaywallScreen />
      </DashboardLayout>
    );
  }

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
      <style>{`
        @media (max-width: 640px) {
          .dash-fase-pct { display: none !important; }
        }
      `}</style>
      <RevisaoSemanal />
      <CelebracaoFase faseConcluida={faseConcluida} onFechar={() => setFaseConcluida(null)} />
      <Onboarding />
      <TrialBanner />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 1200 }}>

        {/* ════════════════════════════════════════════════════
            ZONA 1 — Próximo Passo
        ════════════════════════════════════════════════════ */}
        <section>
          <CardProximoPasso />
        </section>

        {/* ════════════════════════════════════════════════════
            ZONA 2 — Progresso das 4 Fases (horizontal)
        ════════════════════════════════════════════════════ */}
        <section>
          <FasesProgresso />
        </section>

        {/* ════════════════════════════════════════════════════
            ZONA 4 — Insights + Roda da Vida
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
