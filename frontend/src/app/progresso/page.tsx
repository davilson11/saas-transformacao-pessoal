'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { useSupabaseClient } from '@/lib/useSupabaseClient';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import type { FerramentasRespostas, DiarioKairos } from '@/lib/database.types';

// ─── Design tokens ────────────────────────────────────────────────────────────

const GOLD  = '#C8A030';
const DARK  = '#0E0E0E';
const CARD  = '#1A1A1A';
const CREAM = '#F5F0E8';

// ─── Dados das fases ──────────────────────────────────────────────────────────

type FerramData = {
  codigo: string;
  nome: string;
  slug: string;
};

type FaseData = {
  numero: number;
  nome: string;
  subtitulo: string;
  emoji: string;
  ferramentas: FerramData[];
};

const FASES: FaseData[] = [
  {
    numero: 1,
    nome: 'Autoconhecimento',
    subtitulo: 'Quem você é e onde está',
    emoji: '🔍',
    ferramentas: [
      { codigo: 'F01', nome: 'Raio-X 360°',       slug: 'raio-x'        },
      { codigo: 'F02', nome: 'Bússola de Valores', slug: 'bussola-valores' },
      { codigo: 'F03', nome: 'SWOT Pessoal',       slug: 'swot-pessoal'  },
      { codigo: 'F04', nome: 'Feedback 360°',      slug: 'feedback-360'  },
    ],
  },
  {
    numero: 2,
    nome: 'Visão e Metas',
    subtitulo: 'Para onde você quer ir',
    emoji: '🎯',
    ferramentas: [
      { codigo: 'F05', nome: 'OKRs Pessoais',  slug: 'okrs-pessoais' },
      { codigo: 'F06', nome: 'Design de Vida', slug: 'design-vida'   },
      { codigo: 'F07', nome: 'Mapa Financeiro Pessoal', slug: 'dre-pessoal' },
      { codigo: 'F08', nome: 'Rotina Ideal',   slug: 'rotina-ideal'  },
    ],
  },
  {
    numero: 3,
    nome: 'Hábitos e Energia',
    subtitulo: 'Como sustentar a mudança',
    emoji: '⚡',
    ferramentas: [
      { codigo: 'F09', nome: 'Auditoria de Tempo',     slug: 'auditoria-tempo'    },
      { codigo: 'F10', nome: 'Arquiteto de Rotinas',   slug: 'arquiteto-rotinas'  },
      { codigo: 'F11', nome: 'Sprint de Aprendizado',  slug: 'sprint-aprendizado' },
      { codigo: 'F12', nome: 'Energia e Vitalidade',   slug: 'energia-vitalidade' },
    ],
  },
  {
    numero: 4,
    nome: 'Crescimento',
    subtitulo: 'Quem você está se tornando',
    emoji: '🌱',
    ferramentas: [
      { codigo: 'F13', nome: 'Desconstrutor de Crenças', slug: 'desconstrutor-crencas' },
      { codigo: 'F14', nome: 'Mapa de Relacionamentos',    slug: 'crm-relacionamentos'   },
      { codigo: 'F15', nome: 'Diário de Bordo',          slug: 'diario-bordo'          },
      { codigo: 'F16', nome: 'Plano de Continuidade',      slug: 'prevencao-recaida'     },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Data YYYY-MM-DD em fuso America/Sao_Paulo. offsetDias=0 → hoje, 1 → ontem, … */
function getDiaStr(offsetDias = 0): string {
  return new Date(Date.now() - offsetDias * 86_400_000)
    .toLocaleDateString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric', month: '2-digit', day: '2-digit',
    })
    .split('/').reverse().join('-');
}

function fraseMotivacional(pct: number): string {
  if (pct === 0)  return 'Sua jornada começa agora. O primeiro passo é o mais importante.';
  if (pct < 25)  return 'Você deu início. A consistência é o segredo — continue avançando.';
  if (pct < 50)  return 'Bom ritmo! Você está construindo uma base sólida de autoconhecimento.';
  if (pct < 75)  return 'Mais da metade concluída. Você está se tornando outra pessoa. Siga.';
  if (pct < 100) return 'A linha de chegada está próxima. A transformação já aconteceu em você.';
  return '🏆 Jornada concluída! Você é a prova de que transformação é possível.';
}

function formatarData(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
}

function calcularStreak(datas: string[]): number {
  const sorted = [...datas].sort((a, b) => b.localeCompare(a));
  let s = 0;
  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i] === getDiaStr(i)) s++;
    else break;
  }
  return s;
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function ProgressBar({
  pct,
  height = 6,
  color = GOLD,
}: {
  pct: number;
  height?: number;
  color?: string;
}) {
  return (
    <div style={{
      width: '100%', height, borderRadius: height,
      background: 'rgba(255,255,255,0.07)', overflow: 'hidden',
    }}>
      <div style={{
        width: `${Math.min(100, pct)}%`, height: '100%', borderRadius: height,
        background: pct === 100
          ? `linear-gradient(90deg, ${color}, #e8c76a)`
          : `linear-gradient(90deg, ${color}99, ${color})`,
        transition: 'width 0.8s cubic-bezier(0.16,1,0.3,1)',
      }} />
    </div>
  );
}

// ── Card de fase ──────────────────────────────────────────────────────────────

function CardFase({
  fase,
  respostas,
}: {
  fase: FaseData;
  respostas: FerramentasRespostas[];
}) {
  const [aberto, setAberto] = useState(false);

  const slugsRespostas = new Map(respostas.map(r => [r.ferramenta_slug, r]));

  const stats = fase.ferramentas.map(f => {
    const r = slugsRespostas.get(f.slug);
    return {
      ...f,
      concluida:   r?.concluida   ?? false,
      progresso:   r?.progresso   ?? 0,
      updated_at:  r?.updated_at  ?? null,
      iniciada:    (r?.progresso ?? 0) > 0 || (r?.concluida ?? false),
    };
  });

  const concluidas = stats.filter(s => s.concluida).length;
  const pctFase    = Math.round((concluidas / 4) * 100);

  const faseBloqueada = (() => {
    if (fase.numero === 1) return false;
    const faseAnterior = FASES[fase.numero - 2];
    return faseAnterior.ferramentas
      .some(f => !(slugsRespostas.get(f.slug)?.concluida ?? false));
  })();

  const corFase = pctFase === 100 ? '#22c55e' : pctFase > 0 ? GOLD : 'rgba(245,240,232,0.2)';

  return (
    <div style={{
      background: CARD, borderRadius: 16,
      border: `1px solid ${pctFase === 100 ? 'rgba(34,197,94,0.3)' : pctFase > 0 ? 'rgba(200,160,48,0.25)' : 'rgba(255,255,255,0.06)'}`,
      overflow: 'hidden',
      opacity: faseBloqueada ? 0.55 : 1,
      transition: 'border-color 0.2s',
    }}>
      {/* Header da fase */}
      <button
        onClick={() => !faseBloqueada && setAberto(v => !v)}
        disabled={faseBloqueada}
        style={{
          width: '100%', background: 'none', border: 'none',
          cursor: faseBloqueada ? 'not-allowed' : 'pointer',
          padding: '20px 22px', textAlign: 'left',
          display: 'flex', alignItems: 'center', gap: 16,
        }}
      >
        {/* Ícone circular */}
        <div style={{
          width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
          background: pctFase === 100
            ? 'rgba(34,197,94,0.12)'
            : pctFase > 0
              ? 'rgba(200,160,48,0.12)'
              : 'rgba(255,255,255,0.05)',
          border: `2px solid ${corFase}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22,
          boxShadow: pctFase === 100 ? '0 0 14px rgba(34,197,94,0.25)' : pctFase > 0 ? `0 0 10px rgba(200,160,48,0.2)` : 'none',
        }}>
          {pctFase === 100 ? '✓' : fase.emoji}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 10, color: corFase, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
              Fase {fase.numero}
            </span>
            {faseBloqueada && (
              <span style={{ fontSize: 10, color: 'rgba(245,240,232,0.3)', background: 'rgba(255,255,255,0.06)', borderRadius: 99, padding: '2px 8px' }}>
                🔒 Conclua a fase anterior
              </span>
            )}
            {pctFase === 100 && (
              <span style={{ fontSize: 10, color: '#22c55e', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 99, padding: '2px 8px', fontWeight: 600 }}>
                Concluída ✓
              </span>
            )}
          </div>
          <p style={{ fontSize: 16, fontWeight: 700, color: CREAM, margin: '0 0 2px' }}>{fase.nome}</p>
          <p style={{ fontSize: 12, color: 'rgba(245,240,232,0.4)', margin: 0 }}>{fase.subtitulo}</p>
        </div>

        {/* Contador + chevron */}
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <p style={{ fontSize: 18, fontWeight: 800, color: corFase, margin: '0 0 2px' }}>
            {concluidas}/4
          </p>
          <p style={{ fontSize: 10, color: 'rgba(245,240,232,0.35)', margin: 0 }}>concluídas</p>
        </div>
        {!faseBloqueada && (
          <span style={{
            fontSize: 10, color: 'rgba(245,240,232,0.3)', flexShrink: 0,
            transform: aberto ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.2s',
          }}>▼</span>
        )}
      </button>

      {/* Barra de progresso */}
      <div style={{ padding: '0 22px 16px' }}>
        <ProgressBar pct={pctFase} color={pctFase === 100 ? '#22c55e' : GOLD} />
      </div>

      {/* Lista de ferramentas */}
      {aberto && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '12px 16px 16px' }}>
          {stats.map((f, i) => {
            const statusColor = f.concluida ? '#22c55e' : f.iniciada ? '#f59e0b' : 'rgba(245,240,232,0.2)';
            const statusLabel = f.concluida ? 'Concluída' : f.iniciada ? 'Em andamento' : 'Não iniciada';
            const btnLabel    = f.concluida ? 'Revisar' : f.iniciada ? 'Continuar' : 'Iniciar';

            return (
              <div key={f.slug}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 10px',
                  borderBottom: i < stats.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  borderRadius: 10,
                  background: 'transparent',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                {/* Status dot */}
                <div style={{
                  width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                  background: f.concluida
                    ? 'rgba(34,197,94,0.15)'
                    : f.iniciada
                      ? 'rgba(245,158,11,0.12)'
                      : 'rgba(255,255,255,0.04)',
                  border: `1.5px solid ${statusColor}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10,
                }}>
                  {f.concluida ? <span style={{ color: '#22c55e' }}>✓</span>
                    : f.iniciada ? <span style={{ color: '#f59e0b', fontSize: 8 }}>●</span>
                    : null}
                </div>

                {/* Código */}
                <span style={{
                  fontSize: 10, fontWeight: 800, color: statusColor,
                  background: `${statusColor}15`,
                  borderRadius: 99, padding: '2px 7px',
                  letterSpacing: '0.06em', flexShrink: 0,
                  fontFamily: 'monospace',
                }}>
                  {f.codigo}
                </span>

                {/* Nome + última vez */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: f.concluida ? 600 : 400, color: f.iniciada || f.concluida ? CREAM : 'rgba(245,240,232,0.45)', margin: 0 }}>
                    {f.nome}
                  </p>
                  {f.updated_at && (
                    <p style={{ fontSize: 10, color: 'rgba(245,240,232,0.3)', margin: '1px 0 0' }}>
                      Último acesso: {formatarData(f.updated_at)}
                    </p>
                  )}
                </div>

                {/* Status badge pequeno */}
                <span style={{ fontSize: 10, color: statusColor, fontWeight: 600, flexShrink: 0, display: 'none' }}>
                  {statusLabel}
                </span>

                {/* Botão */}
                <Link href={`/ferramentas/${f.slug}`}
                  style={{
                    padding: '6px 14px', borderRadius: 8, fontSize: 11, fontWeight: 600,
                    textDecoration: 'none', flexShrink: 0, whiteSpace: 'nowrap',
                    background: f.concluida
                      ? 'rgba(34,197,94,0.12)'
                      : f.iniciada
                        ? 'rgba(200,160,48,0.18)'
                        : 'rgba(200,160,48,0.1)',
                    color: f.concluida ? '#22c55e' : GOLD,
                    border: `1px solid ${f.concluida ? 'rgba(34,197,94,0.25)' : 'rgba(200,160,48,0.3)'}`,
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                >
                  {btnLabel} →
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Calendário de streak ──────────────────────────────────────────────────────

function CardStreak({
  datasRegistradas,
  streak,
}: {
  datasRegistradas: string[];
  streak: number;
}) {
  const set = new Set(datasRegistradas);
  const hoje = getDiaStr();
  const streakEmoji = streak >= 14 ? '⚡' : streak >= 7 ? '🔥' : streak >= 3 ? '✨' : '💤';

  const dias = Array.from({ length: 30 }).map((_, i) => {
    const offset = 29 - i; // 29 dias atrás … hoje
    const s   = getDiaStr(offset);
    const dom = new Date(s + 'T12:00:00').getDay(); // getDay() em horário local
    return { s, registrado: set.has(s), isHoje: s === hoje, dom };
  });

  return (
    <div style={{ background: CARD, borderRadius: 16, padding: '22px', border: `1px solid rgba(200,160,48,0.18)` }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <p style={{ fontSize: 10, color: 'rgba(245,240,232,0.45)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
            Sequência de registros
          </p>
          <p style={{ fontSize: 16, fontWeight: 700, color: CREAM, margin: 0 }}>Calendário — 30 dias</p>
        </div>
        <div style={{
          textAlign: 'center', background: streak > 0 ? 'rgba(200,160,48,0.12)' : 'rgba(255,255,255,0.04)',
          border: `1px solid ${streak > 0 ? 'rgba(200,160,48,0.3)' : 'rgba(255,255,255,0.07)'}`,
          borderRadius: 14, padding: '10px 16px',
        }}>
          <p style={{ fontSize: 22, margin: '0 0 2px' }}>{streakEmoji}</p>
          <p style={{ fontSize: 22, fontWeight: 800, color: streak > 0 ? GOLD : 'rgba(245,240,232,0.2)', margin: 0, lineHeight: 1 }}>{streak}</p>
          <p style={{ fontSize: 10, color: 'rgba(245,240,232,0.35)', margin: '3px 0 0' }}>{streak === 1 ? 'dia' : 'dias'}</p>
        </div>
      </div>

      {/* Dias da semana header */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
        {['D','S','T','Q','Q','S','S'].map((d, i) => (
          <div key={i} style={{ textAlign: 'center', fontSize: 9, color: 'rgba(245,240,232,0.25)', fontWeight: 600 }}>{d}</div>
        ))}
      </div>

      {/* Grid de dias — iniciar na coluna do dia da semana correto */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {/* Células vazias no início */}
        {Array.from({ length: dias[0].dom }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {dias.map(({ s, registrado, isHoje }) => (
          <div key={s} title={new Date(s + 'T12:00:00').toLocaleDateString('pt-BR')}
            style={{
              aspectRatio: '1', borderRadius: 6,
              background: registrado
                ? isHoje ? GOLD : 'rgba(200,160,48,0.3)'
                : 'rgba(255,255,255,0.04)',
              border: isHoje
                ? `2px solid ${GOLD}`
                : registrado
                  ? '1px solid rgba(200,160,48,0.4)'
                  : '1px solid rgba(255,255,255,0.05)',
              boxShadow: isHoje && registrado ? `0 0 8px rgba(200,160,48,0.4)` : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 9, fontWeight: 600,
              color: isHoje && registrado ? DARK : registrado ? GOLD : 'rgba(245,240,232,0.2)',
            }}>
            {new Date(s + 'T12:00:00').getDate()}
          </div>
        ))}
      </div>

      {/* Legenda */}
      <div style={{ display: 'flex', gap: 14, marginTop: 14 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'rgba(245,240,232,0.4)' }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: 'rgba(200,160,48,0.3)', border: '1px solid rgba(200,160,48,0.4)', display: 'inline-block' }} />
          Registrado
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'rgba(245,240,232,0.4)' }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', display: 'inline-block' }} />
          Sem registro
        </span>
      </div>
    </div>
  );
}

// ── Card de conquistas ─────────────────────────────────────────────────────────

type Badge = {
  id: string;
  emoji: string;
  titulo: string;
  descricao: string;
  conquistado: boolean;
};

function CardConquistas({
  badges,
}: {
  badges: Badge[];
}) {
  const conquistados = badges.filter(b => b.conquistado).length;

  return (
    <div style={{ background: CARD, borderRadius: 16, padding: '22px', border: `1px solid rgba(200,160,48,0.18)` }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <div>
          <p style={{ fontSize: 10, color: 'rgba(245,240,232,0.45)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
            Conquistas
          </p>
          <p style={{ fontSize: 16, fontWeight: 700, color: CREAM, margin: 0 }}>Badges da jornada</p>
        </div>
        <div style={{
          background: conquistados > 0 ? 'rgba(200,160,48,0.12)' : 'rgba(255,255,255,0.04)',
          border: `1px solid ${conquistados > 0 ? 'rgba(200,160,48,0.3)' : 'rgba(255,255,255,0.07)'}`,
          borderRadius: 99, padding: '5px 14px',
        }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: conquistados > 0 ? GOLD : 'rgba(245,240,232,0.3)' }}>
            {conquistados}/{badges.length}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        {badges.map(b => (
          <div key={b.id}
            style={{
              background: b.conquistado ? 'linear-gradient(135deg, rgba(200,160,48,0.12), rgba(200,160,48,0.05))' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${b.conquistado ? 'rgba(200,160,48,0.35)' : 'rgba(255,255,255,0.06)'}`,
              borderRadius: 12, padding: '14px',
              opacity: b.conquistado ? 1 : 0.45,
              transition: 'all 0.2s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{
                fontSize: 26,
                filter: b.conquistado ? 'none' : 'grayscale(1)',
              }}>{b.emoji}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: b.conquistado ? CREAM : 'rgba(245,240,232,0.4)', margin: '0 0 2px' }}>
                  {b.titulo}
                </p>
                <p style={{ fontSize: 10, color: 'rgba(245,240,232,0.35)', margin: 0, lineHeight: 1.4 }}>
                  {b.descricao}
                </p>
              </div>
            </div>
            {b.conquistado && (
              <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: GOLD, boxShadow: `0 0 6px ${GOLD}`, display: 'inline-block' }} />
                <span style={{ fontSize: 10, color: GOLD, fontWeight: 600 }}>Conquistado</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function ProgressoPage() {
  const { user } = useUser();
  const { getClient } = useSupabaseClient();

  const [respostas,       setRespostas]       = useState<FerramentasRespostas[]>([]);
  const [datasRegistradas, setDatasRegistradas] = useState<string[]>([]);
  const [streak,          setStreak]          = useState(0);
  const [carregando,      setCarregando]      = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      try {
        const client = await getClient();
        const [{ data: resp }, { data: hist }] = await Promise.all([
          client.from('ferramentas_respostas').select('*').eq('user_id', user.id),
          client
            .from('diario_kairos')
            .select('data')
            .eq('user_id', user.id)
            .or('tipo_entrada.neq.momento,tipo_entrada.is.null')
            .order('data', { ascending: false })
            .limit(90),
        ]);

        if (resp) setRespostas(resp as FerramentasRespostas[]);

        if (hist) {
          const datas = hist.map((h: Pick<DiarioKairos, 'data'>) => h.data);
          setDatasRegistradas(datas);
          setStreak(calcularStreak(datas));
        }
      } catch (err) {
        console.error('[progresso] Erro ao carregar dados:', err);
      } finally {
        setCarregando(false);
      }
    })();
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Cálculos derivados ──────────────────────────────────────────────────────

  const concluidas   = respostas.filter(r => r.concluida).length;
  const pctGeral     = Math.round((concluidas / 16) * 100);
  const slugsConcluidos = new Set(respostas.filter(r => r.concluida).map(r => r.ferramenta_slug));

  const fase1Completa = FASES[0].ferramentas.every(f => slugsConcluidos.has(f.slug));
  const fase2Completa = FASES[1].ferramentas.every(f => slugsConcluidos.has(f.slug));
  const fase3Completa = FASES[2].ferramentas.every(f => slugsConcluidos.has(f.slug));
  const fase4Completa = FASES[3].ferramentas.every(f => slugsConcluidos.has(f.slug));

  const badges: Badge[] = [
    {
      id: 'primeiros_passos',
      emoji: '🌱',
      titulo: 'Primeiros Passos',
      descricao: 'Concluiu a primeira ferramenta',
      conquistado: concluidas >= 1,
    },
    {
      id: 'autoconhecimento',
      emoji: '🔍',
      titulo: 'Autoconhecimento',
      descricao: 'Fase 1 completa (F01–F04)',
      conquistado: fase1Completa,
    },
    {
      id: 'visionario',
      emoji: '🎯',
      titulo: 'Visionário',
      descricao: 'Fase 2 completa (F05–F08)',
      conquistado: fase2Completa,
    },
    {
      id: 'maquina_habitos',
      emoji: '⚡',
      titulo: 'Máquina de Hábitos',
      descricao: 'Fase 3 completa (F09–F12)',
      conquistado: fase3Completa,
    },
    {
      id: 'crescimento_total',
      emoji: '🌿',
      titulo: 'Crescimento Total',
      descricao: 'Fase 4 completa (F13–F16)',
      conquistado: fase4Completa,
    },
    {
      id: 'constancia',
      emoji: '🔥',
      titulo: 'Constância',
      descricao: '7 dias seguidos de registro',
      conquistado: streak >= 7,
    },
    {
      id: 'dedicacao',
      emoji: '💎',
      titulo: 'Dedicação',
      descricao: '30 dias seguidos de registro',
      conquistado: streak >= 30,
    },
    {
      id: 'jornada_completa',
      emoji: '🏆',
      titulo: 'Jornada Completa',
      descricao: 'Todas as 16 ferramentas',
      conquistado: concluidas === 16,
    },
  ];

  // ── Skeleton ────────────────────────────────────────────────────────────────

  if (carregando) {
    return (
      <DashboardLayout>
        <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[80, 160, 120, 120, 120, 120, 100, 200].map((h, i) => (
            <div key={i} style={{
              height: h, borderRadius: 16, background: CARD,
              border: '1px solid rgba(200,160,48,0.07)',
              animation: 'pulse 1.8s ease-in-out infinite',
            }} />
          ))}
          <style>{`@keyframes pulse { 0%,100%{opacity:.45} 50%{opacity:.7} }`}</style>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div style={{
          background: 'linear-gradient(135deg, #1a1200 0%, #0E0E0E 100%)',
          borderRadius: 20, padding: '28px 28px 24px',
          border: `1.5px solid rgba(200,160,48,0.3)`,
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Ornamento */}
          <div style={{
            position: 'absolute', top: -60, right: -60, width: 220, height: 220,
            borderRadius: '50%', background: 'rgba(200,160,48,0.04)', pointerEvents: 'none',
          }} />

          <p style={{ fontSize: 11, color: GOLD, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.18em', margin: '0 0 6px' }}>
            Meu Progresso
          </p>

          {/* % principal */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, marginBottom: 10 }}>
            <span style={{ fontSize: 56, fontWeight: 900, color: GOLD, lineHeight: 1, fontFamily: 'var(--font-heading)' }}>
              {pctGeral}
            </span>
            <span style={{ fontSize: 24, fontWeight: 400, color: 'rgba(200,160,48,0.6)', marginBottom: 8 }}>%</span>
            <div style={{ marginBottom: 10 }}>
              <p style={{ fontSize: 13, color: CREAM, fontWeight: 600, margin: 0 }}>
                {concluidas} de 16 ferramentas
              </p>
              <p style={{ fontSize: 12, color: 'rgba(245,240,232,0.45)', margin: '2px 0 0' }}>concluídas</p>
            </div>
          </div>

          {/* Barra geral */}
          <ProgressBar pct={pctGeral} height={8} />

          {/* Frase motivacional */}
          <p style={{ fontSize: 13, color: 'rgba(245,240,232,0.65)', margin: '14px 0 0', lineHeight: 1.6, fontStyle: 'italic' }}>
            {fraseMotivacional(pctGeral)}
          </p>

          {/* Mini stats */}
          <div style={{ display: 'flex', gap: 16, marginTop: 16, flexWrap: 'wrap' }}>
            {FASES.map(fase => {
              const n = fase.ferramentas.filter(f => slugsConcluidos.has(f.slug)).length;
              return (
                <div key={fase.numero}>
                  <span style={{ fontSize: 10, color: 'rgba(245,240,232,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    Fase {fase.numero}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: n === 4 ? '#22c55e' : n > 0 ? GOLD : 'rgba(245,240,232,0.25)', marginLeft: 6 }}>
                    {n}/4
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Cards de fase ────────────────────────────────────────────────── */}
        <p style={{ fontSize: 11, color: 'rgba(245,240,232,0.45)', textTransform: 'uppercase', letterSpacing: '0.15em', margin: '4px 0 0' }}>
          Ferramentas por fase — clique para expandir
        </p>

        {FASES.map(fase => (
          <CardFase key={fase.numero} fase={fase} respostas={respostas} />
        ))}

        {/* ── Streak + Conquistas ─────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          <CardStreak datasRegistradas={datasRegistradas} streak={streak} />
          <CardConquistas badges={badges} />
        </div>

      </div>
    </DashboardLayout>
  );
}
