'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useSupabaseClient } from '@/lib/useSupabaseClient';
import {
  buscarTodasRespostas,
  buscarVisaoAncora,
  buscarRodaVida,
} from '@/lib/queries';
import type {
  FerramentasRespostas,
  VisaoAncora,
  RodaVida,
  DiarioKairos,
} from '@/lib/database.types';

// ─── Constantes de design ─────────────────────────────────────────────────────

const BG_PAGE    = '#0E0E0E';
const BG_DARK    = '#0A0A0A';
const BG_MID     = '#111111';
const GOLD       = '#C8A030';
const GOLD_DIM   = 'rgba(200,160,48,0.18)';
const CREAM      = '#F5F0E8';
const CREAM_DIM  = 'rgba(245,240,232,0.45)';
const CREAM_FAINT= 'rgba(245,240,232,0.12)';
const RED_DIM    = 'rgba(239,68,68,0.22)';

// ─── Slugs das ferramentas relevantes ────────────────────────────────────────

const SLUG_F01 = 'raio-x';
const SLUG_F02 = 'bussola-valores';
const SLUG_F05 = 'okrs-pessoais';
const SLUG_F06 = 'design-vida';
const SLUG_F08 = 'rotina-ideal';
const SLUG_F11 = 'sprint-aprendizado';
const SLUG_F13 = 'desconstrutor-crencas';
const SLUG_F16 = 'prevencao-recaida';

const TODAS_SLUGS = [
  'raio-x','bussola-valores','swot-pessoal','feedback-360',
  'okrs-pessoais','design-vida','dre-pessoal','rotina-ideal',
  'auditoria-tempo','arquiteto-rotinas','sprint-aprendizado',
  'energia-vitalidade','desconstrutor-crencas','crm-relacionamentos',
  'diario-bordo','prevencao-recaida',
];

const FASES_EXEC = [
  { n: 1, slugs: ['raio-x','bussola-valores','swot-pessoal','feedback-360'],
    nomes: ['Raio-X 360°','Bússola de Valores','SWOT Pessoal','Feedback 360°'] },
  { n: 2, slugs: ['okrs-pessoais','design-vida','dre-pessoal','rotina-ideal'],
    nomes: ['OKRs Pessoais','Design de Vida','Mapa Financeiro Pessoal','Rotina Ideal'] },
  { n: 3, slugs: ['auditoria-tempo','arquiteto-rotinas','sprint-aprendizado','energia-vitalidade'],
    nomes: ['Auditoria de Tempo','Arquiteto de Rotinas','Sprint de Aprendizado','Energia e Vitalidade'] },
  { n: 4, slugs: ['desconstrutor-crencas','crm-relacionamentos','diario-bordo','prevencao-recaida'],
    nomes: ['Desconstrutor de Crenças','Mapa de Relacionamentos','Diário de Bordo','Plano de Continuidade'] },
];

function getWeekKey(): string {
  const now = new Date();
  const d   = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const wk = Math.ceil(((d.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${wk}`;
}

// ─── Áreas da Roda da Vida ────────────────────────────────────────────────────

type RodaKey = 'saude' | 'carreira' | 'financas' | 'relacionamentos' | 'lazer' | 'espiritualidade' | 'familia' | 'crescimento';

const RODA_AREAS: Array<{ key: RodaKey; emoji: string; label: string; cor: string }> = [
  { key: 'saude',           emoji: '💪', label: 'Saúde',           cor: '#27AE60' },
  { key: 'espiritualidade', emoji: '🧘', label: 'Espiritualidade', cor: '#8E44AD' },
  { key: 'financas',        emoji: '💰', label: 'Finanças',        cor: '#b5840a' },
  { key: 'carreira',        emoji: '🚀', label: 'Carreira',        cor: '#2980B9' },
  { key: 'relacionamentos', emoji: '🤝', label: 'Relações',        cor: '#e11d48' },
  { key: 'lazer',           emoji: '🎨', label: 'Lazer',           cor: '#D97706' },
  { key: 'familia',         emoji: '🏠', label: 'Família',         cor: '#16a34a' },
  { key: 'crescimento',     emoji: '📈', label: 'Crescimento',     cor: '#7c3aed' },
];

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function SectionTitle({ label, cor }: { label: string; cor?: string }) {
  return (
    <p style={{
      fontFamily: 'var(--font-body)',
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      color: cor ?? GOLD,
      margin: 0,
    }}>
      {label}
    </p>
  );
}

function GhostCard({ href, texto }: { href: string; texto: string }) {
  return (
    <Link href={href} style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '14px 18px',
      borderRadius: 10,
      border: `1px dashed rgba(200,160,48,0.22)`,
      background: 'rgba(200,160,48,0.03)',
      textDecoration: 'none',
      transition: 'background 0.2s',
      cursor: 'pointer',
    }}
    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(200,160,48,0.07)'; }}
    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(200,160,48,0.03)'; }}
    >
      <span style={{ fontSize: 16 }}>✦</span>
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(200,160,48,0.7)' }}>
        {texto}
      </span>
      <span style={{ marginLeft: 'auto', color: 'rgba(200,160,48,0.4)', fontSize: 12 }}>→</span>
    </Link>
  );
}

function Badge({ label, cor }: { label: string; cor: string }) {
  return (
    <span style={{
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      fontWeight: 700,
      letterSpacing: '0.08em',
      color: cor,
      background: `${cor}22`,
      border: `1px solid ${cor}44`,
      borderRadius: 99,
      padding: '2px 8px',
      textTransform: 'uppercase',
    }}>
      {label}
    </span>
  );
}

function ProgressBar({ value, cor, max = 10 }: { value: number; cor: string; max?: number }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div style={{ position: 'relative', height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, width: `${pct}%`, background: cor, borderRadius: 99, transition: 'width 0.6s ease' }} />
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function MapaPage() {
  const { user }     = useUser();
  const { getClient } = useSupabaseClient();

  // ── Estado ────────────────────────────────────────────────────────────────

  const [loading,       setLoading]       = useState(true);
  const [allRespostas,  setAllRespostas]  = useState<FerramentasRespostas[]>([]);
  const [visaoAncora,   setVisaoAncora]   = useState<VisaoAncora | null>(null);
  const [rodaVida,      setRodaVida]      = useState<RodaVida | null>(null);
  const [diarioUlt7,    setDiarioUlt7]    = useState<DiarioKairos[]>([]);
  const [diasMes,       setDiasMes]       = useState(0);
  const [abaAtiva,      setAbaAtiva]      = useState<'mapa' | 'execucao'>('mapa');
  const [checkedSemana, setCheckedSemana] = useState<Set<number>>(() => {
    if (typeof window === 'undefined') return new Set();
    try {
      const raw = localStorage.getItem(`kairos_exec_${getWeekKey()}`);
      return new Set(raw ? (JSON.parse(raw) as number[]) : []);
    } catch { return new Set(); }
  });

  // ── Fetch ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      const client = await getClient();
      const [respostas, ancora, roda] = await Promise.all([
        buscarTodasRespostas(user.id, client),
        buscarVisaoAncora(user.id, client),
        buscarRodaVida(user.id, client),
      ]);

      // Últimos 7 dias do diário + contagem do mês atual
      const hoje   = new Date();
      const d7ago  = new Date(hoje); d7ago.setDate(hoje.getDate() - 6);
      const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0];
      const [{ data: diario }, { count: cntMes }] = await Promise.all([
        client
          .from('diario_kairos')
          .select('*')
          .eq('user_id', user.id)
          .gte('data', d7ago.toISOString().split('T')[0])
          .order('data', { ascending: false }),
        client
          .from('diario_kairos')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('data', inicioMes),
      ]);

      setAllRespostas(respostas);
      setVisaoAncora(ancora);
      setRodaVida(roda);
      setDiarioUlt7((diario ?? []) as DiarioKairos[]);
      setDiasMes(cntMes ?? 0);
      setLoading(false);
    })();
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Helpers de acesso ────────────────────────────────────────────────────

  function bySlug(slug: string): FerramentasRespostas | undefined {
    return allRespostas.find(r => r.ferramenta_slug === slug);
  }

  function resp(slug: string): Record<string, unknown> {
    const r = bySlug(slug);
    if (!r?.respostas || typeof r.respostas !== 'object') return {};
    return r.respostas as Record<string, unknown>;
  }

  function isConcluida(slug: string): boolean {
    return bySlug(slug)?.concluida ?? false;
  }

  // ── Dados processados ────────────────────────────────────────────────────

  const f01 = resp(SLUG_F01);
  const f02 = resp(SLUG_F02);
  const f05 = resp(SLUG_F05);
  const f06 = resp(SLUG_F06);
  const f08 = resp(SLUG_F08);
  const f11 = resp(SLUG_F11);
  const f13 = resp(SLUG_F13);
  const f16 = resp(SLUG_F16);

  // F01 — scores das 8 áreas
  const f01Respostas = (f01.respostas ?? {}) as Record<string, { opcaoIdx: number | null; revelacao: string }>;
  const f01Areas = Object.entries(f01Respostas)
    .filter(([, v]) => v?.opcaoIdx != null)
    .map(([label, v]) => ({ label, score: [2,4,6,8,10][v.opcaoIdx as number] ?? 0 }));

  // F02 — valores
  // ranking = ValorRankeado[] → { id: string; porque: string }; selecionados = string[] (IDs)
  const f02Ranking: string[] = Array.isArray(f02.ranking)
    ? (f02.ranking as Array<{ id?: string } | string>).flatMap(v =>
        typeof v === 'string' ? [v] : (v as { id?: string }).id ? [(v as { id: string }).id] : []
      )
    : [];
  const f02Selecionados: string[] = Array.isArray(f02.selecionados) ? (f02.selecionados as string[]) : [];
  const f02Valores: string[] = f02Ranking.length > 0 ? f02Ranking : f02Selecionados;

  // F05 — objetivos
  const f05Objetivos = Array.isArray(f05.objetivos)
    ? (f05.objetivos as Array<{ texto: string; emoji: string; krs: Array<{ descricao: string; meta: string; atual: string; unidade: string }> }>)
    : [];

  // F06 — declaração de propósito
  const f06PorqueProundo = (f06.porqueProundo ?? f06.porqueProfundo ?? {}) as Record<string, string>;
  const f06Declaracao   = f06PorqueProundo.declaracao ?? '';
  const f06DiaPerfeito  = (f06.diaPerfeito ?? {}) as Record<string, string>;
  const f06VisaoFutura  = f06DiaPerfeito.sentimento ?? '';

  // F08 — blocos do dia
  const f08Blocos = (f08.blocosDia ?? {}) as Record<string, { foco: string; tarefas: string }>;
  const f08Items  = Object.values(f08Blocos).filter(b => b?.foco?.trim());

  // F11 — sprint
  const f11Config = (f11.configSprint ?? {}) as Record<string, string>;

  // F13 — crenças trabalhadas
  const f13Crencas = Array.isArray(f13.crencas)
    ? (f13.crencas as Array<{ identificacao: { crenca: string; novaAfirmacao?: string; bloqueio?: string }; desconstrucao: Record<string, string> }>)
    : [];

  // F16 — planos SE-ENTÃO
  const f16Cenarios = (f16.cenarios ?? {}) as Record<string, { gatilho: string; seEntao: string }>;
  const f16Items    = Object.values(f16Cenarios).filter(c => c?.gatilho?.trim());

  // ── Progresso das 5 seções ───────────────────────────────────────────────

  const sec1Done = f01Areas.length > 0 || f02Valores.length > 0;
  const sec2Done = !!(visaoAncora?.manchete || f06Declaracao);
  const sec3Done = f05Objetivos.some(o => o.texto) || f08Items.length > 0 || !!f11Config.habilidade;
  const sec4Done = !!rodaVida;
  const sec5Done = f13Crencas.length > 0 || f16Items.length > 0;

  const secsDone  = [sec1Done, sec2Done, sec3Done, sec4Done, sec5Done].filter(Boolean).length;
  const progPct   = Math.round((secsDone / 5) * 100);

  // Ferramentas concluídas (para botão flutuante — próxima não concluída)
  const concluidas = new Set(allRespostas.filter(r => r.concluida).map(r => r.ferramenta_slug));
  const proximaSlug = TODAS_SLUGS.find(s => !concluidas.has(s)) ?? 'raio-x';

  // ── Subtítulo dinâmico ───────────────────────────────────────────────────

  const subtitulo =
    progPct < 25  ? 'Seu mapa está sendo desenhado...'
    : progPct < 50 ? 'Sua direção está tomando forma.'
    : progPct < 75 ? 'Você está construindo algo sólido.'
    : 'Seu mapa está completo. Execute.';

  // ── Dados para aba Execução ──────────────────────────────────────────────

  // Fase atual (primeira fase com ferramentas incompletas)
  const faseAtual = FASES_EXEC.find(f => f.slugs.some(s => !concluidas.has(s))) ?? FASES_EXEC[3];

  // Primeira ferramenta incompleta na fase atual
  const proxIdxFase = faseAtual.slugs.findIndex(s => !concluidas.has(s));
  const proxNomeFase = proxIdxFase >= 0 ? faseAtual.nomes[proxIdxFase] : null;
  const proxSlugFase = proxIdxFase >= 0 ? faseAtual.slugs[proxIdxFase] : null;

  // Primeiro OKR
  const primeiroOKR = f05Objetivos[0]?.texto ?? null;

  // Streak de diário (dias consecutivos até hoje)
  const hojeStr = new Date().toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })
    .split('/').reverse().join('-');
  const datasSet = new Set(diarioUlt7.map(d => d.data));
  let streakDiario = 0;
  {
    let checkDate = hojeStr;
    while (datasSet.has(checkDate)) {
      streakDiario++;
      const d = new Date(checkDate); d.setDate(d.getDate() - 1);
      checkDate = d.toISOString().split('T')[0];
    }
  }

  const fezMomentoHoje = datasSet.has(hojeStr);

  // Prioridades desta semana (lista de até 4 itens gerados dinamicamente)
  const prioridadesSemana: Array<{ texto: string; href?: string }> = [];
  if (proxNomeFase && proxSlugFase) {
    prioridadesSemana.push({ texto: `Concluir: ${proxNomeFase}`, href: `/ferramentas/${proxSlugFase}` });
  }
  if (primeiroOKR) {
    prioridadesSemana.push({ texto: `Avançar em: ${primeiroOKR.slice(0, 55)}${primeiroOKR.length > 55 ? '…' : ''}` });
  }
  if (streakDiario < 5) {
    prioridadesSemana.push({ texto: 'Registrar no diário 5 dias seguidos', href: '/ferramentas/diario-bordo' });
  }
  if (!fezMomentoHoje) {
    prioridadesSemana.push({ texto: 'Completar o Momento Kairos de hoje', href: '/momento' });
  }
  // Garantir pelo menos 3 itens
  if (prioridadesSemana.length === 0) {
    prioridadesSemana.push({ texto: 'Revisar seus OKRs da semana', href: '/ferramentas/okrs-pessoais' });
  }
  if (prioridadesSemana.length < 2) {
    prioridadesSemana.push({ texto: 'Atualizar sua Roda da Vida no Dashboard', href: '/dashboard' });
  }
  if (prioridadesSemana.length < 3) {
    prioridadesSemana.push({ texto: 'Escrever no Diário de Bordo hoje', href: '/ferramentas/diario-bordo' });
  }
  const prioridades3 = prioridadesSemana.slice(0, 3);

  // Marcos do mês
  const totalFase = faseAtual.slugs.length;
  const concluidasFase = faseAtual.slugs.filter(s => concluidas.has(s)).length;
  const metaDiasMes = Math.max(20, Math.round(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() * 0.7));
  const statusCompletarFase = concluidasFase === totalFase ? 'done' : concluidasFase > 0 ? 'progress' : 'open';
  const statusDiarioMes     = diasMes >= metaDiasMes ? 'done' : diasMes > 0 ? 'progress' : 'open';
  const statusProxFerr      = proxNomeFase ? (concluidas.has(proxSlugFase ?? '') ? 'done' : 'open') : 'done';

  // Frase motivacional 90 dias
  const fraseMotivacional =
    progPct < 25 ? 'Você está construindo a fundação. Todo arranha-céu começa aqui.'
    : progPct < 50 ? 'Você já passou do ponto de retorno. Continue.'
    : progPct < 75 ? 'Você está na metade. A segunda metade é onde a transformação real acontece.'
    : 'Você está quase lá. Não pare agora.';

  // Checkpoint de 90 dias (mês atual + 2)
  const agora = new Date();
  const mes1Label = agora.toLocaleDateString('pt-BR', { month: 'long', timeZone: 'America/Sao_Paulo' });
  const mes2 = new Date(agora.getFullYear(), agora.getMonth() + 1, 1);
  const mes2Label = mes2.toLocaleDateString('pt-BR', { month: 'long', timeZone: 'America/Sao_Paulo' });
  const mes3 = new Date(agora.getFullYear(), agora.getMonth() + 2, 1);
  const mes3Label = mes3.toLocaleDateString('pt-BR', { month: 'long', timeZone: 'America/Sao_Paulo' });

  function toggleChecked(idx: number) {
    setCheckedSemana(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      try { localStorage.setItem(`kairos_exec_${getWeekKey()}`, JSON.stringify([...next])); } catch { /* noop */ }
      return next;
    });
  }

  // ── Emoção dominante + nota média ────────────────────────────────────────

  const emocoes   = diarioUlt7.filter(d => d.emocao).map(d => d.emocao as string);
  const emocaoFreq = emocoes.reduce<Record<string, number>>((acc, e) => ({ ...acc, [e]: (acc[e] ?? 0) + 1 }), {});
  const emocaoDominante = Object.entries(emocaoFreq).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  const notas  = diarioUlt7.filter(d => d.nota_dia != null).map(d => d.nota_dia as number);
  const notaMedia = notas.length > 0 ? (notas.reduce((s, n) => s + n, 0) / notas.length).toFixed(1) : null;

  // ─────────────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ minHeight: '100%', background: BG_PAGE, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: CREAM_DIM, marginBottom: 8 }}>
              Carregando seu Mapa...
            </div>
            <div style={{ width: 160, height: 2, background: 'rgba(200,160,48,0.15)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: '60%', background: GOLD, borderRadius: 99, animation: 'mapa-pulse 1.4s ease-in-out infinite' }} />
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <style>{`
        @media (max-width: 639px) {
          .mapa-header { padding: 28px 16px 24px !important; }
          .mapa-abas { padding: 0 16px !important; overflow-x: auto; }
          .mapa-abas button { padding: 12px 14px !important; flex-shrink: 0; min-height: 44px; }
          .mapa-execucao-inner, .mapa-content-inner { padding: 24px 16px 80px !important; }
          .mapa-roda-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
      <div style={{ minHeight: '100%', background: BG_PAGE, fontFamily: 'var(--font-body)', paddingBottom: 100 }}>

        {/* ══════════════════════════════════
            BARRA DE PROGRESSO DO MAPA
        ══════════════════════════════════ */}
        <div style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          background: 'rgba(10,10,10,0.92)',
          backdropFilter: 'blur(8px)',
          borderBottom: `1px solid ${GOLD_DIM}`,
          padding: '10px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700, color: GOLD, whiteSpace: 'nowrap', letterSpacing: '0.06em' }}>
            MAPA {progPct}%
          </span>
          <div style={{ flex: 1, position: 'relative', height: 3, borderRadius: 99, background: 'rgba(200,160,48,0.1)' }}>
            <div style={{ position: 'absolute', inset: 0, width: `${progPct}%`, background: `linear-gradient(90deg, ${GOLD}, #e8c76a)`, borderRadius: 99, transition: 'width 0.8s ease' }} />
          </div>
          {/* 5 pontos de seção */}
          <div style={{ display: 'flex', gap: 6 }}>
            {[sec1Done, sec2Done, sec3Done, sec4Done, sec5Done].map((done, i) => (
              <div key={i} style={{
                width: 7, height: 7, borderRadius: '50%',
                background: done ? GOLD : 'rgba(200,160,48,0.15)',
                border: done ? 'none' : '1px solid rgba(200,160,48,0.25)',
                transition: 'background 0.4s',
                boxShadow: done ? `0 0 6px ${GOLD}88` : 'none',
              }} />
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════
            HEADER
        ══════════════════════════════════ */}
        <div className="mapa-header" style={{
          padding: '48px 24px 40px',
          background: `linear-gradient(180deg, #0A0A0A 0%, ${BG_PAGE} 100%)`,
          borderBottom: `1px solid ${GOLD_DIM}`,
        }}>
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <p style={{ margin: '0 0 6px', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.18em', color: GOLD, textTransform: 'uppercase' }}>
              Kairos · Mapa de Vida
            </p>
            <h1 style={{
              margin: '0 0 10px',
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 'clamp(28px, 5vw, 44px)',
              fontWeight: 700,
              color: CREAM,
              lineHeight: 1.12,
            }}>
              Meu Mapa de Vida
            </h1>
            <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 15, color: CREAM_DIM, fontStyle: 'italic' }}>
              {subtitulo}
            </p>
          </div>
        </div>

        {/* ══════════════════════════════════
            ABAS
        ══════════════════════════════════ */}
        <div className="mapa-abas" style={{
          padding: '0 24px',
          background: BG_DARK,
          borderBottom: `1px solid ${GOLD_DIM}`,
          display: 'flex',
          gap: 0,
        }}>
          {(['mapa', 'execucao'] as const).map((aba) => {
            const ativo = abaAtiva === aba;
            const label = aba === 'mapa' ? 'Meu Mapa' : 'Plano de Execução';
            return (
              <button
                key={aba}
                onClick={() => setAbaAtiva(aba)}
                style={{
                  padding: '14px 20px',
                  fontFamily: 'var(--font-body)',
                  fontSize: 13,
                  fontWeight: ativo ? 700 : 400,
                  color: ativo ? GOLD : CREAM_DIM,
                  background: 'transparent',
                  border: 'none',
                  borderBottom: ativo ? `2px solid ${GOLD}` : '2px solid transparent',
                  cursor: 'pointer',
                  transition: 'color 0.2s, border-color 0.2s',
                  marginBottom: -1,
                  whiteSpace: 'nowrap',
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* ══════════════════════════════════
            ABA — EXECUÇÃO
        ══════════════════════════════════ */}
        {abaAtiva === 'execucao' && (
          <div className="mapa-execucao-inner" style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px 120px' }}>

            {/* SEÇÃO 1 — ESTA SEMANA */}
            <div style={{ marginBottom: 48 }}>
              <div style={{ marginBottom: 20 }}>
                <p style={{ margin: '0 0 4px', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em', color: GOLD, textTransform: 'uppercase' }}>
                  Esta semana
                </p>
                <h2 style={{ margin: 0, fontFamily: "'Playfair Display', Georgia, serif", fontSize: 22, fontWeight: 700, color: CREAM }}>
                  Suas 3 prioridades
                </h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {prioridades3.map((p, idx) => {
                  const checked = checkedSemana.has(idx);
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleChecked(idx)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                        padding: '16px 18px',
                        borderRadius: 12,
                        background: checked ? 'rgba(200,160,48,0.07)' : BG_MID,
                        border: `1px solid ${checked ? 'rgba(200,160,48,0.3)' : 'rgba(255,255,255,0.06)'}`,
                        cursor: 'pointer',
                        transition: 'background 0.2s, border-color 0.2s',
                        textDecoration: 'none',
                      }}
                    >
                      {/* Checkbox */}
                      <div style={{
                        flexShrink: 0,
                        width: 22, height: 22,
                        borderRadius: 6,
                        border: `2px solid ${checked ? GOLD : 'rgba(200,160,48,0.3)'}`,
                        background: checked ? GOLD : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.18s ease',
                      }}>
                        {checked && (
                          <span style={{ color: '#0E0E0E', fontSize: 13, fontWeight: 900, lineHeight: 1, transform: 'scale(1)', transition: 'transform 0.18s ease' }}>✓</span>
                        )}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{
                          margin: 0,
                          fontSize: 14,
                          fontWeight: 600,
                          color: checked ? CREAM_DIM : CREAM,
                          textDecoration: checked ? 'line-through' : 'none',
                          transition: 'color 0.2s',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}>
                          {p.texto}
                        </p>
                        {p.href && !checked && (
                          <Link
                            href={p.href}
                            onClick={(e) => e.stopPropagation()}
                            style={{ fontSize: 11, color: 'rgba(200,160,48,0.6)', textDecoration: 'none', marginTop: 2, display: 'inline-block' }}
                          >
                            Ir agora →
                          </Link>
                        )}
                      </div>

                      <span style={{
                        flexShrink: 0,
                        fontFamily: 'var(--font-mono)',
                        fontSize: 9,
                        color: 'rgba(200,160,48,0.35)',
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                      }}>
                        {idx + 1}/3
                      </span>
                    </div>
                  );
                })}
              </div>

              <p style={{ margin: '12px 0 0', fontSize: 11, color: 'rgba(245,240,232,0.2)', textAlign: 'right' }}>
                Reset toda segunda-feira · progresso salvo localmente
              </p>
            </div>

            {/* SEÇÃO 2 — ESTE MÊS */}
            <div style={{ marginBottom: 48 }}>
              <div style={{ marginBottom: 20 }}>
                <p style={{ margin: '0 0 4px', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em', color: GOLD, textTransform: 'uppercase' }}>
                  Este mês
                </p>
                <h2 style={{ margin: 0, fontFamily: "'Playfair Display', Georgia, serif", fontSize: 22, fontWeight: 700, color: CREAM }}>
                  Marcos do mês
                </h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  {
                    status: statusCompletarFase,
                    label: `Completar Fase ${faseAtual.n}`,
                    detalhe: `${concluidasFase}/${totalFase} ferramentas concluídas`,
                  },
                  {
                    status: statusDiarioMes,
                    label: `${metaDiasMes} dias de registro este mês`,
                    detalhe: `${diasMes} ${diasMes === 1 ? 'dia registrado' : 'dias registrados'} até agora`,
                  },
                  {
                    status: statusProxFerr,
                    label: proxNomeFase ? `Concluir: ${proxNomeFase}` : 'Todas as ferramentas concluídas',
                    detalhe: proxSlugFase ? 'Próxima ferramenta na fila' : 'Fase completa!',
                  },
                ].map(({ status, label, detalhe }, i) => {
                  const icon   = status === 'done' ? '✅' : status === 'progress' ? '⏳' : '☐';
                  const clr    = status === 'done' ? '#22c55e' : status === 'progress' ? '#f59e0b' : 'rgba(245,240,232,0.25)';
                  return (
                    <div key={i} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      padding: '14px 18px',
                      borderRadius: 10,
                      background: BG_MID,
                      border: `1px solid rgba(255,255,255,0.05)`,
                    }}>
                      <span style={{ fontSize: 18, flexShrink: 0 }}>{icon}</span>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: status === 'done' ? CREAM_DIM : CREAM }}>{label}</p>
                        <p style={{ margin: '2px 0 0', fontSize: 11, color: clr }}>{detalhe}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SEÇÃO 3 — PRÓXIMOS 90 DIAS */}
            <div>
              <div style={{ marginBottom: 20 }}>
                <p style={{ margin: '0 0 4px', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em', color: GOLD, textTransform: 'uppercase' }}>
                  Próximos 90 dias
                </p>
                <h2 style={{ margin: 0, fontFamily: "'Playfair Display', Georgia, serif", fontSize: 22, fontWeight: 700, color: CREAM }}>
                  Sua linha do tempo
                </h2>
              </div>

              {/* Timeline */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginBottom: 24 }}>
                {[
                  {
                    mes: mes1Label,
                    label: 'Agora',
                    cor: GOLD,
                    desc: `Fase ${faseAtual.n} · ${concluidasFase}/${totalFase} ferramentas`,
                    sub: proxNomeFase ? `Próxima: ${proxNomeFase}` : 'Fase concluída!',
                  },
                  {
                    mes: mes2Label,
                    label: 'Daqui a 30 dias',
                    cor: '#a78bfa',
                    desc: concluidasFase < totalFase
                      ? `Fase ${faseAtual.n} concluída`
                      : `Fase ${Math.min(faseAtual.n + 1, 4)} em progresso`,
                    sub: 'Mantendo o ritmo atual',
                  },
                  {
                    mes: mes3Label,
                    label: 'Meta 90 dias',
                    cor: '#22c55e',
                    desc: concluidas.size + 4 >= 16
                      ? 'Todas as 16 ferramentas'
                      : `${Math.min(concluidas.size + 4, 16)} de 16 ferramentas`,
                    sub: 'Se você não parar',
                  },
                ].map(({ mes, label, cor, desc, sub }, i) => (
                  <div key={i} style={{
                    background: BG_MID,
                    border: `1px solid ${cor}33`,
                    borderTop: `3px solid ${cor}`,
                    borderRadius: 12,
                    padding: '16px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                  }}>
                    <div>
                      <p style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: 9, color: cor, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>
                        {label}
                      </p>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: CREAM, textTransform: 'capitalize' }}>
                        {mes}
                      </p>
                    </div>
                    <div style={{ width: '100%', height: 1, background: `${cor}22` }} />
                    <div>
                      <p style={{ margin: 0, fontSize: 12, color: CREAM, fontWeight: 600 }}>{desc}</p>
                      <p style={{ margin: '3px 0 0', fontSize: 11, color: CREAM_DIM }}>{sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Frase motivacional */}
              <div style={{
                background: `linear-gradient(135deg, rgba(200,160,48,0.06) 0%, rgba(200,160,48,0.02) 100%)`,
                border: `1px solid rgba(200,160,48,0.2)`,
                borderLeft: `3px solid ${GOLD}`,
                borderRadius: 12,
                padding: '20px 22px',
              }}>
                <p style={{
                  margin: 0,
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: 16,
                  color: CREAM,
                  lineHeight: 1.65,
                  fontStyle: 'italic',
                }}>
                  "{fraseMotivacional}"
                </p>
              </div>
            </div>

          </div>
        )}

        {/* ══════════════════════════════════
            ABA — MEU MAPA (conteúdo existente)
        ══════════════════════════════════ */}
        {abaAtiva === 'mapa' && <>

        {/* ══════════════════════════════════
            SEÇÃO 1 — QUEM SOU
        ══════════════════════════════════ */}
        <section style={{
          background: BG_MID,
          borderLeft: `3px solid ${GOLD}`,
          padding: '36px 24px',
        }}>
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <span style={{ fontSize: 20 }}>🎯</span>
              <div>
                <SectionTitle label="Seção 1 · Quem Sou" />
                <p style={{ margin: 0, fontSize: 13, color: CREAM_DIM, marginTop: 2 }}>
                  Suas forças, padrões e valores centrais
                </p>
              </div>
              {sec1Done && <Badge label="Ativo" cor="#22c55e" />}
            </div>

            {/* F01 — Raio-X */}
            {f01Areas.length > 0 ? (
              <div style={{ marginBottom: 20 }}>
                <p style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 600, color: CREAM_DIM, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  Raio-X 360° — suas 8 áreas
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 8 }}>
                  {f01Areas.map(({ label, score }) => (
                    <div key={label} style={{
                      background: BG_DARK,
                      border: '1px solid rgba(255,255,255,0.05)',
                      borderRadius: 8,
                      padding: '10px 12px',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ fontSize: 11, color: CREAM, fontWeight: 600 }}>{label}</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: score >= 8 ? '#22c55e' : score >= 6 ? GOLD : '#f97316', fontWeight: 700 }}>
                          {score}/10
                        </span>
                      </div>
                      <ProgressBar value={score} max={10} cor={score >= 8 ? '#22c55e' : score >= 6 ? GOLD : '#f97316'} />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ marginBottom: 16 }}>
                <GhostCard href="/ferramentas/raio-x" texto="Complete o Raio-X para revelar seu perfil em 8 áreas →" />
              </div>
            )}

            {/* F02 — Valores */}
            {f02Valores.length > 0 ? (
              <div>
                <p style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 600, color: CREAM_DIM, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  Bússola de Valores — seus pilares
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {f02Valores.slice(0, 8).map((id, i) => {
                    const nome = id.charAt(0).toUpperCase() + id.slice(1);
                    return (
                      <span key={id + i} style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: 12,
                        fontWeight: 600,
                        color: i < 3 ? GOLD : CREAM,
                        background: i < 3 ? 'rgba(200,160,48,0.12)' : 'rgba(245,240,232,0.06)',
                        border: `1px solid ${i < 3 ? 'rgba(200,160,48,0.28)' : 'rgba(245,240,232,0.1)'}`,
                        borderRadius: 99,
                        padding: '4px 12px',
                      }}>
                        {i < 3 && <span style={{ marginRight: 4 }}>{['①','②','③'][i]}</span>}
                        {nome}
                      </span>
                    );
                  })}
                </div>
              </div>
            ) : (
              <GhostCard href="/ferramentas/bussola-valores" texto="Complete a Bússola de Valores para revelar o que mais importa →" />
            )}
          </div>
        </section>

        {/* ══════════════════════════════════
            SEÇÃO 2 — PARA ONDE VOU
        ══════════════════════════════════ */}
        <section style={{
          background: '#1A0F00',
          borderLeft: `3px solid ${GOLD}`,
          padding: '36px 24px',
        }}>
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
              <span style={{ fontSize: 20 }}>🌟</span>
              <div>
                <SectionTitle label="Seção 2 · Para Onde Vou" />
                <p style={{ margin: 0, fontSize: 13, color: CREAM_DIM, marginTop: 2 }}>
                  Sua visão âncora e design de vida
                </p>
              </div>
              {sec2Done && <Badge label="Ativo" cor="#22c55e" />}
            </div>

            {/* Visão Âncora */}
            {visaoAncora?.manchete ? (
              <div style={{ marginBottom: 24 }}>
                <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 600, color: CREAM_DIM, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  Visão Âncora
                </p>
                <h2 style={{
                  margin: '0 0 10px',
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontStyle: 'italic',
                  fontSize: 'clamp(20px, 4vw, 30px)',
                  fontWeight: 700,
                  color: GOLD,
                  lineHeight: 1.2,
                }}>
                  "{visaoAncora.manchete}"
                </h2>
                {visaoAncora.declaracao && (
                  <p style={{ margin: 0, fontSize: 14, color: CREAM_DIM, lineHeight: 1.6, maxWidth: 600 }}>
                    {visaoAncora.declaracao}
                  </p>
                )}
              </div>
            ) : (
              <div style={{ marginBottom: 16 }}>
                <GhostCard href="/visao-ancora" texto="Crie sua Visão Âncora — a manchete do seu futuro →" />
              </div>
            )}

            {/* F06 — Design de Vida */}
            {f06Declaracao ? (
              <div style={{
                background: 'rgba(200,160,48,0.06)',
                border: `1px solid rgba(200,160,48,0.18)`,
                borderRadius: 10,
                padding: '16px 20px',
              }}>
                <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 600, color: GOLD, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  Design de Vida — seu porquê
                </p>
                <p style={{ margin: 0, fontSize: 14, color: CREAM, lineHeight: 1.65, fontStyle: 'italic' }}>
                  "{f06Declaracao}"
                </p>
                {f06VisaoFutura && (
                  <p style={{ margin: '8px 0 0', fontSize: 12, color: CREAM_DIM }}>
                    Como se sente: {f06VisaoFutura}
                  </p>
                )}
              </div>
            ) : !visaoAncora?.manchete ? null : (
              <GhostCard href="/ferramentas/design-vida" texto="Complete o Design de Vida para projetar os próximos 10 anos →" />
            )}

            {!visaoAncora?.manchete && !f06Declaracao && (
              <GhostCard href="/ferramentas/design-vida" texto="Complete o Design de Vida para projetar os próximos 10 anos →" />
            )}
          </div>
        </section>

        {/* ══════════════════════════════════
            SEÇÃO 3 — COMO CHEGO LÁ
        ══════════════════════════════════ */}
        <section style={{ background: BG_MID, padding: '36px 24px' }}>
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
              <span style={{ fontSize: 20 }}>⚡</span>
              <div>
                <SectionTitle label="Seção 3 · Como Chego Lá" cor={GOLD} />
                <p style={{ margin: 0, fontSize: 13, color: CREAM_DIM, marginTop: 2 }}>
                  OKRs, rotina e aprendizado em curso
                </p>
              </div>
              {sec3Done && <Badge label="Ativo" cor="#22c55e" />}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>

              {/* F05 — OKRs */}
              <div style={{
                background: BG_DARK,
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 12,
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                  <span style={{ fontSize: 15 }}>🎯</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: GOLD, letterSpacing: '0.06em', textTransform: 'uppercase' }}>OKRs Ativos</span>
                </div>
                {f05Objetivos.filter(o => o.texto).length > 0 ? (
                  f05Objetivos.filter(o => o.texto).map((obj, idx) => {
                    const krsDone = obj.krs?.filter(kr => kr.atual && kr.meta && parseFloat(kr.atual) >= parseFloat(kr.meta)).length ?? 0;
                    const krsTotal = obj.krs?.filter(kr => kr.descricao).length ?? 0;
                    const pct = krsTotal > 0 ? Math.round((krsDone / krsTotal) * 100) : 0;
                    return (
                      <div key={idx}>
                        <p style={{ margin: '0 0 5px', fontSize: 12, color: CREAM, fontWeight: 600, lineHeight: 1.4 }}>
                          {obj.emoji} {obj.texto}
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <span style={{ fontSize: 10, color: CREAM_DIM }}>{krsTotal} KRs</span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: GOLD }}>{pct}%</span>
                        </div>
                        <ProgressBar value={pct} max={100} cor={pct >= 80 ? '#22c55e' : GOLD} />
                      </div>
                    );
                  })
                ) : (
                  <Link href="/ferramentas/okrs-pessoais" style={{ textDecoration: 'none' }}>
                    <p style={{ margin: 0, fontSize: 12, color: 'rgba(200,160,48,0.5)', fontStyle: 'italic' }}>
                      Defina seus OKRs trimestrais →
                    </p>
                  </Link>
                )}
              </div>

              {/* F08 — Rotina Ideal */}
              <div style={{
                background: BG_DARK,
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 12,
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                  <span style={{ fontSize: 15 }}>🌅</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: GOLD, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Rotina Ideal</span>
                </div>
                {f08Items.length > 0 ? (
                  f08Items.map((bloco, i) => (
                    <div key={i} style={{
                      background: 'rgba(255,255,255,0.03)',
                      borderRadius: 6,
                      padding: '8px 10px',
                    }}>
                      <p style={{ margin: 0, fontSize: 12, color: CREAM, fontWeight: 600 }}>{bloco.foco}</p>
                      {bloco.tarefas && (
                        <p style={{ margin: '3px 0 0', fontSize: 11, color: CREAM_DIM, lineHeight: 1.4 }}>{bloco.tarefas.slice(0, 60)}{bloco.tarefas.length > 60 ? '…' : ''}</p>
                      )}
                    </div>
                  ))
                ) : (
                  <Link href="/ferramentas/rotina-ideal" style={{ textDecoration: 'none' }}>
                    <p style={{ margin: 0, fontSize: 12, color: 'rgba(200,160,48,0.5)', fontStyle: 'italic' }}>
                      Projete seus blocos do dia →
                    </p>
                  </Link>
                )}
              </div>

              {/* F11 — Sprint de Aprendizado */}
              <div style={{
                background: BG_DARK,
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 12,
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                  <span style={{ fontSize: 15 }}>📚</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: GOLD, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Sprint Ativo</span>
                </div>
                {f11Config.habilidade ? (
                  <>
                    <p style={{ margin: 0, fontSize: 13, color: CREAM, fontWeight: 700 }}>
                      {f11Config.habilidade}
                    </p>
                    {f11Config.definicaoSucesso && (
                      <p style={{ margin: 0, fontSize: 12, color: CREAM_DIM, lineHeight: 1.5 }}>
                        Meta: {f11Config.definicaoSucesso.slice(0, 80)}{f11Config.definicaoSucesso.length > 80 ? '…' : ''}
                      </p>
                    )}
                    {f11Config.dataFim && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                        <span style={{ fontSize: 10, color: CREAM_DIM }}>Prazo:</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: GOLD }}>
                          {new Date(f11Config.dataFim).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    )}
                  </>
                ) : (
                  <Link href="/ferramentas/sprint-aprendizado" style={{ textDecoration: 'none' }}>
                    <p style={{ margin: 0, fontSize: 12, color: 'rgba(200,160,48,0.5)', fontStyle: 'italic' }}>
                      Inicie um Sprint de 30 dias →
                    </p>
                  </Link>
                )}
              </div>

            </div>
          </div>
        </section>

        {/* ══════════════════════════════════
            SEÇÃO 4 — ONDE ESTOU AGORA
        ══════════════════════════════════ */}
        <section style={{ background: BG_DARK, padding: '36px 24px' }}>
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
              <span style={{ fontSize: 20 }}>📡</span>
              <div>
                <SectionTitle label="Seção 4 · Onde Estou Agora" />
                <p style={{ margin: 0, fontSize: 13, color: CREAM_DIM, marginTop: 2 }}>
                  Roda da vida e estado emocional recente
                </p>
              </div>
              {sec4Done && <Badge label="Ativo" cor="#22c55e" />}
            </div>

            {rodaVida ? (
              <div>
                {/* Barras da Roda da Vida */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(175px, 1fr))', gap: 10, marginBottom: 20 }}>
                  {RODA_AREAS.map(({ key, emoji, label, cor }) => {
                    const val = (rodaVida as unknown as Record<string, number>)[key] ?? 0;
                    return (
                      <div key={key} style={{
                        background: BG_MID,
                        border: '1px solid rgba(255,255,255,0.05)',
                        borderRadius: 8,
                        padding: '10px 12px',
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <span style={{ fontSize: 12 }}>{emoji} <span style={{ fontSize: 11, color: CREAM }}>{label}</span></span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: cor, fontWeight: 700 }}>{val}</span>
                        </div>
                        <ProgressBar value={val} max={10} cor={cor} />
                      </div>
                    );
                  })}
                </div>

                {/* Diário — emoção + nota */}
                {(emocaoDominante || notaMedia) && (
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    {emocaoDominante && (
                      <div style={{
                        background: BG_MID,
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: 10,
                        padding: '12px 16px',
                        flex: '1 1 160px',
                      }}>
                        <p style={{ margin: '0 0 4px', fontSize: 10, color: CREAM_DIM, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Emoção dos últimos 7 dias</p>
                        <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: CREAM }}>
                          {emocaoDominante}
                        </p>
                      </div>
                    )}
                    {notaMedia && (
                      <div style={{
                        background: BG_MID,
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: 10,
                        padding: '12px 16px',
                        flex: '1 1 140px',
                      }}>
                        <p style={{ margin: '0 0 4px', fontSize: 10, color: CREAM_DIM, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Nota média da semana</p>
                        <p style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: 26, fontWeight: 700, color: GOLD }}>
                          {notaMedia}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <GhostCard href="/dashboard" texto="Preencha sua Roda da Vida no Dashboard para ver seu estado atual →" />
            )}
          </div>
        </section>

        {/* ══════════════════════════════════
            SEÇÃO 5 — O QUE ME PROTEGE
        ══════════════════════════════════ */}
        <section style={{
          background: BG_MID,
          borderLeft: `3px solid ${RED_DIM}`,
          padding: '36px 24px',
        }}>
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
              <span style={{ fontSize: 20 }}>🛡️</span>
              <div>
                <SectionTitle label="Seção 5 · O Que Me Protege" cor="#ef4444" />
                <p style={{ margin: 0, fontSize: 13, color: CREAM_DIM, marginTop: 2 }}>
                  Crenças trabalhadas e planos SE-ENTÃO
                </p>
              </div>
              {sec5Done && <Badge label="Ativo" cor="#22c55e" />}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>

              {/* F13 — Crenças */}
              <div style={{
                background: BG_DARK,
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 12,
                padding: '16px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                  <span style={{ fontSize: 15 }}>🪞</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: GOLD, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Crenças Desconstruídas</span>
                </div>
                {f13Crencas.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {f13Crencas.slice(0, 3).map((c, i) => {
                      const crenca = c.identificacao?.crenca || c.identificacao?.bloqueio || '';
                      const nova   = c.identificacao?.novaAfirmacao || '';
                      if (!crenca) return null;
                      return (
                        <div key={i} style={{
                          background: 'rgba(255,255,255,0.03)',
                          borderRadius: 7,
                          padding: '10px 12px',
                        }}>
                          <p style={{ margin: 0, fontSize: 11, color: 'rgba(239,68,68,0.7)', textDecoration: 'line-through', lineHeight: 1.4 }}>
                            {crenca.slice(0, 60)}{crenca.length > 60 ? '…' : ''}
                          </p>
                          {nova && (
                            <p style={{ margin: '5px 0 0', fontSize: 11, color: '#22c55e', lineHeight: 1.4 }}>
                              ✓ {nova.slice(0, 60)}{nova.length > 60 ? '…' : ''}
                            </p>
                          )}
                        </div>
                      );
                    })}
                    {f13Crencas.length > 3 && (
                      <p style={{ margin: 0, fontSize: 11, color: CREAM_DIM, textAlign: 'center' }}>
                        +{f13Crencas.length - 3} outras crenças desconstruídas
                      </p>
                    )}
                  </div>
                ) : (
                  <Link href="/ferramentas/desconstrutor-crencas" style={{ textDecoration: 'none' }}>
                    <p style={{ margin: 0, fontSize: 12, color: 'rgba(200,160,48,0.5)', fontStyle: 'italic' }}>
                      Desconstrua suas crenças limitantes →
                    </p>
                  </Link>
                )}
              </div>

              {/* F16 — Plano de Continuidade */}
              <div style={{
                background: BG_DARK,
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 12,
                padding: '16px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                  <span style={{ fontSize: 15 }}>🛡️</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: GOLD, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Plano de Continuidade</span>
                </div>
                {f16Items.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {f16Items.slice(0, 3).map((c, i) => (
                      <div key={i} style={{
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: 7,
                        padding: '10px 12px',
                      }}>
                        <p style={{ margin: '0 0 4px', fontSize: 10, color: CREAM_DIM, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          SE: {c.gatilho.slice(0, 50)}{c.gatilho.length > 50 ? '…' : ''}
                        </p>
                        <p style={{ margin: 0, fontSize: 11, color: '#22c55e', lineHeight: 1.4 }}>
                          ENTÃO: {c.seEntao.slice(0, 60)}{c.seEntao.length > 60 ? '…' : ''}
                        </p>
                      </div>
                    ))}
                    {f16Items.length > 3 && (
                      <p style={{ margin: 0, fontSize: 11, color: CREAM_DIM, textAlign: 'center' }}>
                        +{f16Items.length - 3} outros planos ativos
                      </p>
                    )}
                    <Badge label="Ativo" cor="#22c55e" />
                  </div>
                ) : (
                  <Link href="/ferramentas/prevencao-recaida" style={{ textDecoration: 'none' }}>
                    <p style={{ margin: 0, fontSize: 12, color: 'rgba(200,160,48,0.5)', fontStyle: 'italic' }}>
                      Crie seus planos SE-ENTÃO preventivos →
                    </p>
                  </Link>
                )}
              </div>

            </div>
          </div>
        </section>

        </>}

        {/* ══════════════════════════════════
            BOTÃO FLUTUANTE
        ══════════════════════════════════ */}
        <div style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 50,
        }}>
          <Link href={`/ferramentas/${proximaSlug}`} style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '12px 20px',
            borderRadius: 99,
            background: `linear-gradient(135deg, ${GOLD}, #e8c76a)`,
            color: '#0E0E0E',
            fontFamily: 'var(--font-body)',
            fontSize: 13,
            fontWeight: 700,
            textDecoration: 'none',
            boxShadow: `0 4px 24px rgba(200,160,48,0.5)`,
            transition: 'transform 0.2s, box-shadow 0.2s',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = `0 8px 32px rgba(200,160,48,0.65)`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = `0 4px 24px rgba(200,160,48,0.5)`;
          }}
          >
            Continuar construindo →
          </Link>
        </div>

      </div>

      <style>{`
        @keyframes mapa-pulse {
          0%,100% { opacity: 0.4; transform: translateX(-30%); }
          50%      { opacity: 1;   transform: translateX(30%);  }
        }
      `}</style>
    </DashboardLayout>
  );
}
