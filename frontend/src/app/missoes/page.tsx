'use client';

import { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { useSupabaseClient } from '@/lib/useSupabaseClient';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import type { MomentoKairos, DiarioKairos } from '@/lib/database.types';

// ─── Cores ───────────────────────────────────────────────────────────────────

const C = {
  gold:    '#C8A030',
  goldDim: 'rgba(200,160,48,0.15)',
  goldBrd: 'rgba(200,160,48,0.28)',
  bg:      '#0E0E0E',
  card:    '#141414',
  card2:   '#1A1A1A',
  border:  'rgba(200,160,48,0.10)',
  text:    '#F5F0E8',
  muted:   'rgba(245,240,232,0.45)',
  green:   '#22c55e',
  greenDim:'rgba(34,197,94,0.12)',
  greenBrd:'rgba(34,197,94,0.28)',
  red:     '#ef4444',
};

// ─── Tipos locais ─────────────────────────────────────────────────────────────

type HistItem = {
  data:            string;
  missao:          string;
  missao_cumprida: boolean;
  missao_execucao: string | null;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Data YYYY-MM-DD em fuso America/Sao_Paulo. offsetDias=0 → hoje, 1 → ontem, … */
function getDiaStr(offsetDias = 0): string {
  return new Date(Date.now() - offsetDias * 86_400_000)
    .toLocaleDateString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric', month: '2-digit', day: '2-digit',
    })
    .split('/').reverse().join('-');
}

function fmtData(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function fmtDataCurta(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('pt-BR', {
    weekday: 'short', day: '2-digit', month: '2-digit',
  });
}

// ─── Sub-componente: CartãoMissãoHoje ─────────────────────────────────────────

function CartaoMissaoHoje({
  missao,
  fase,
}: {
  missao: string;
  fase: number;
}) {
  return (
    <div style={{
      position: 'relative',
      background: `linear-gradient(135deg, #1A1200 0%, #0E0E0E 100%)`,
      border: `1.5px solid ${C.goldBrd}`,
      borderRadius: 20,
      padding: '28px 32px',
      overflow: 'hidden',
    }}>
      {/* Glow de fundo */}
      <div style={{
        position: 'absolute', top: -40, right: -40,
        width: 180, height: 180, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(200,160,48,0.10) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Cabeçalho */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: C.goldDim, border: `1px solid ${C.goldBrd}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, flexShrink: 0,
        }}>
          🎯
        </div>
        <div>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: C.gold, textTransform: 'uppercase', letterSpacing: '0.12em', margin: 0 }}>
            Missão do Dia
          </p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: C.muted, margin: 0 }}>
            Fase {fase} · {fmtData(getDiaStr())}
          </p>
        </div>
      </div>

      {/* Texto da missão */}
      <p style={{
        fontFamily: 'var(--font-heading)',
        fontSize: 'clamp(17px, 2.2vw, 22px)',
        fontWeight: 600,
        color: C.text,
        lineHeight: 1.5,
        margin: 0,
        position: 'relative',
      }}>
        <span style={{ color: C.gold, marginRight: 6, fontStyle: 'italic' }}>"</span>
        {missao}
        <span style={{ color: C.gold, marginLeft: 4, fontStyle: 'italic' }}>"</span>
      </p>
    </div>
  );
}

// ─── Sub-componente: ItemHistorico ────────────────────────────────────────────

function ItemHistorico({ item }: { item: HistItem }) {
  return (
    <div style={{
      background: C.card,
      border: `1px solid ${item.missao_cumprida ? C.greenBrd : C.border}`,
      borderRadius: 14,
      padding: '14px 18px',
      display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      {/* Cabeçalho: ícone + data + badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Ícone cumprida */}
        <div style={{
          width: 28, height: 28, borderRadius: 8, flexShrink: 0,
          background: item.missao_cumprida ? C.greenDim : 'rgba(255,255,255,0.04)',
          border: `1px solid ${item.missao_cumprida ? C.greenBrd : 'rgba(255,255,255,0.08)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14,
          color: item.missao_cumprida ? C.green : C.muted,
          fontWeight: 700,
        }}>
          {item.missao_cumprida ? '✓' : '·'}
        </div>

        {/* Data */}
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600,
          color: item.missao_cumprida ? C.green : C.muted,
          textTransform: 'capitalize', flex: 1,
        }}>
          {fmtDataCurta(item.data)}
        </span>

        {/* Badge registrado */}
        {item.missao_execucao && (
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700,
            color: C.gold, background: C.goldDim, border: `1px solid ${C.goldBrd}`,
            borderRadius: 99, padding: '2px 8px', flexShrink: 0,
          }}>
            REGISTRADO
          </span>
        )}
      </div>

      {/* Texto da missão — sempre visível, sem truncamento */}
      <p style={{
        fontFamily: 'var(--font-body)', fontSize: 13, color: '#F5F0E8',
        lineHeight: 1.65, margin: 0,
      }}>
        <span style={{ color: C.gold, fontWeight: 600 }}>Missão: </span>
        {item.missao}
      </p>

      {/* Como executei — sempre visível se preenchido */}
      {item.missao_execucao && (
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 10, padding: '10px 14px',
        }}>
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
            color: C.gold, textTransform: 'uppercase', letterSpacing: '0.08em',
            margin: '0 0 6px',
          }}>
            Como executei
          </p>
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(245,240,232,0.8)',
            lineHeight: 1.65, margin: 0, fontStyle: 'italic',
          }}>
            {item.missao_execucao}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Página Principal ─────────────────────────────────────────────────────────

export default function MissoesPage() {
  const { user }    = useUser();
  const { getClient } = useSupabaseClient();

  // Estado do dia atual
  const [momento,         setMomento]         = useState<MomentoKairos | null>(null);
  const [diarioHoje,      setDiarioHoje]       = useState<Partial<DiarioKairos> | null>(null);
  const [execucao,        setExecucao]         = useState('');
  const [cumprida,        setCumprida]         = useState(false);
  const [historico,       setHistorico]        = useState<HistItem[]>([]);
  const [loading,         setLoading]          = useState(true);
  const [salvando,        setSalvando]         = useState(false);
  const [salvandoCumprida, setSalvandoCumprida] = useState(false);
  const [feedbackSalvo,   setFeedbackSalvo]    = useState(false);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Carregamento inicial ──────────────────────────────────────────────────

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      setLoading(true);
      try {
        const client = await getClient();
        const hoje   = getDiaStr();
        const limite = getDiaStr(30);

        // Missão do dia
        const { data: mom } = await client
          .from('momento_kairos')
          .select('*')
          .eq('data', hoje)
          .maybeSingle();
        if (mom) setMomento(mom as MomentoKairos);

        // Diário de hoje
        const { data: dHoje } = await client
          .from('diario_kairos')
          .select('*')
          .eq('user_id', user.id)
          .eq('data', hoje)
          .maybeSingle();
        if (dHoje) {
          setDiarioHoje(dHoje as DiarioKairos);
          setExecucao((dHoje as DiarioKairos).missao_execucao ?? '');
          setCumprida((dHoje as DiarioKairos).missao_cumprida ?? false);
        }

        // Histórico últimos 30 dias — apenas entradas Momento (tipo_entrada = 'momento' ou null)
        const { data: hist } = await client
          .from('diario_kairos')
          .select('data, missao_cumprida, missao_execucao')
          .eq('user_id', user.id)
          .gte('data', limite)
          .or('tipo_entrada.eq.momento,tipo_entrada.is.null')
          .order('data', { ascending: false });

        if (hist && hist.length > 0) {
          const datas = hist.map((h: { data: string }) => h.data);
          const { data: moms } = await client
            .from('momento_kairos')
            .select('data, missao, fase')
            .in('data', datas);

          const momMap: Record<string, string> = {};
          if (moms) {
            for (const m of moms as { data: string; missao: string }[]) {
              momMap[m.data] = m.missao;
            }
          }

          setHistorico(
            hist
              .filter((h: { data: string }) => h.data !== hoje)
              .map((h: { data: string; missao_cumprida: boolean; missao_execucao: string | null }) => ({
                data:            h.data,
                missao:          momMap[h.data] ?? '—',
                missao_cumprida: h.missao_cumprida ?? false,
                missao_execucao: h.missao_execucao ?? null,
              }))
          );
        }
      } catch (err) {
        console.error('[missoes] Erro ao carregar dados:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auto-save de execução (debounce 800 ms) ────────────────────────────────

  useEffect(() => {
    if (!user?.id || loading) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => salvarExecucao(execucao), 800);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [execucao]); // eslint-disable-line react-hooks/exhaustive-deps

  async function salvarExecucao(texto: string) {
    if (!user?.id) return;
    setSalvando(true);
    try {
      const client = await getClient();
      const hoje   = getDiaStr();
      await client.from('diario_kairos').upsert(
        { user_id: user.id, data: hoje, missao_execucao: texto, updated_at: new Date().toISOString() },
        { onConflict: 'user_id,data' }
      );
      setFeedbackSalvo(true);
      setTimeout(() => setFeedbackSalvo(false), 1800);
    } catch (err) {
      console.error('[missoes] salvarExecucao', err);
    } finally {
      setSalvando(false);
    }
  }

  // ── Marcar como cumprida ──────────────────────────────────────────────────

  async function toggleCumprida() {
    if (!user?.id) return;
    const novaCumprida = !cumprida;
    setCumprida(novaCumprida);
    setSalvandoCumprida(true);
    try {
      const client = await getClient();
      const hoje   = getDiaStr();

      // Ao marcar como cumprida, persiste também missao_execucao no mesmo upsert
      // para garantir que o texto não seja perdido caso o debounce ainda não tenha disparado.
      if (novaCumprida) {
        await client.from('diario_kairos').upsert(
          {
            user_id:         user.id,
            data:            hoje,
            missao_cumprida: true,
            missao_execucao: execucao.trim() || null,
            updated_at:      new Date().toISOString(),
          },
          { onConflict: 'user_id,data' }
        );
      } else {
        await client.from('diario_kairos').upsert(
          {
            user_id:         user.id,
            data:            hoje,
            missao_cumprida: false,
            updated_at:      new Date().toISOString(),
          },
          { onConflict: 'user_id,data' }
        );
      }
    } catch (err) {
      console.error('[missoes] toggleCumprida', err);
      setCumprida(!novaCumprida); // reverte o estado visual em caso de erro
    } finally {
      setSalvandoCumprida(false);
    }
  }

  // ── Métricas de histórico ─────────────────────────────────────────────────

  const totalCumpridas  = historico.filter(h => h.missao_cumprida).length;
  const totalRegistros  = historico.filter(h => h.missao_execucao).length;
  const taxaCumprimento = historico.length > 0
    ? Math.round((totalCumpridas / historico.length) * 100)
    : 0;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <DashboardLayout>
      {/* Wrapper escuro cobre todo o content area — evita texto creme sobre fundo creme do DashboardLayout */}
      <div style={{ background: C.bg, minHeight: 'calc(100vh - 54px)' }}>
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 28 }}>

        {/* ── Cabeçalho ────────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: C.gold, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                Kairos
              </span>
              <span style={{ width: 1, height: 12, background: C.goldBrd, display: 'inline-block' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Missões Diárias
              </span>
            </div>
            <h1 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(24px, 3vw, 32px)',
              fontWeight: 700, color: C.text, margin: 0, lineHeight: 1.2,
            }}>
              Missões
            </h1>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: C.muted, marginTop: 6 }}>
              Cada missão é um passo concreto na sua jornada de transformação.
            </p>
          </div>

          {/* Métricas rápidas */}
          {!loading && historico.length > 0 && (
            <div style={{ display: 'flex', gap: 10 }}>
              {[
                { label: 'Cumpridas', valor: `${totalCumpridas}`, sub: 'últimos 30 dias', cor: C.green },
                { label: 'Taxa',      valor: `${taxaCumprimento}%`, sub: 'de conclusão',   cor: C.gold  },
                { label: 'Registros', valor: `${totalRegistros}`,  sub: 'com anotação',    cor: 'rgba(245,240,232,0.6)' },
              ].map(m => (
                <div key={m.label} style={{
                  background: C.card, border: `1px solid ${C.border}`,
                  borderRadius: 12, padding: '10px 16px', textAlign: 'center', minWidth: 72,
                }}>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 700, color: m.cor, margin: 0, lineHeight: 1 }}>
                    {m.valor}
                  </p>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: C.muted, marginTop: 3 }}>{m.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Loading ──────────────────────────────────────────────────────── */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[180, 120, 80].map((h, i) => (
              <div key={i} style={{
                height: h, borderRadius: 16,
                background: 'linear-gradient(90deg, #1A1A1A 25%, #222 50%, #1A1A1A 75%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.4s infinite',
              }} />
            ))}
            <style>{`@keyframes shimmer { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }`}</style>
          </div>
        )}

        {!loading && (
          <>
            {/* ── Missão do dia ────────────────────────────────────────────── */}
            {momento ? (
              <CartaoMissaoHoje missao={momento.missao} fase={momento.fase} />
            ) : (
              <div style={{
                background: C.card, border: `1.5px dashed ${C.border}`,
                borderRadius: 20, padding: '32px', textAlign: 'center',
              }}>
                <span style={{ fontSize: 32 }}>🌅</span>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: C.muted, marginTop: 12 }}>
                  Nenhuma missão cadastrada para hoje.
                </p>
              </div>
            )}

            {/* ── Registro de execução ─────────────────────────────────────── */}
            {momento && (
              <div style={{
                background: C.card,
                border: `1px solid ${C.border}`,
                borderRadius: 20,
                padding: '24px 28px',
                display: 'flex', flexDirection: 'column', gap: 16,
              }}>
                {/* Título da seção */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <div>
                    <p style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 700, color: C.text, margin: 0 }}>
                      Como executei essa missão hoje
                    </p>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: C.muted, marginTop: 3 }}>
                      Descreva o que aconteceu ao colocar a missão em prática.
                    </p>
                  </div>
                  {/* Status de auto-save */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                    {salvando && (
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: C.muted }}>salvando…</span>
                    )}
                    {feedbackSalvo && !salvando && (
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: C.green }}>✓ salvo</span>
                    )}
                  </div>
                </div>

                {/* Textarea */}
                <textarea
                  value={execucao}
                  onChange={e => setExecucao(e.target.value)}
                  rows={5}
                  placeholder="Ex: Acordei às 6h e passei 20 minutos em silêncio antes de abrir o celular. Percebi que minha mente ficou mais calma durante o dia. A tarde foi mais difícil — tive que relembrar a missão conscientemente duas vezes..."
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    background: '#0E0E0E',
                    border: `1.5px solid ${execucao.trim() ? C.goldBrd : 'rgba(255,255,255,0.08)'}`,
                    borderRadius: 12, padding: '14px 16px',
                    fontFamily: 'var(--font-body)', fontSize: 16,
                    color: C.text, lineHeight: 1.7,
                    outline: 'none', resize: 'vertical',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = C.goldBrd)}
                  onBlur={e => (e.currentTarget.style.borderColor = execucao.trim() ? C.goldBrd : 'rgba(255,255,255,0.08)')}
                />

                {/* Botão marcar cumprida */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <button
                    onClick={toggleCumprida}
                    disabled={salvandoCumprida}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '11px 22px', borderRadius: 12,
                      cursor: salvandoCumprida ? 'wait' : 'pointer',
                      fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 700,
                      transition: 'all 0.2s',
                      background: cumprida
                        ? C.greenDim
                        : 'linear-gradient(135deg, #C8A030 0%, #A07828 100%)',
                      color:  cumprida ? C.green : '#0E0E0E',
                      border: `1.5px solid ${cumprida ? C.greenBrd : 'transparent'}`,
                      boxShadow: cumprida ? 'none' : '0 4px 16px rgba(200,160,48,0.25)',
                      opacity: salvandoCumprida ? 0.6 : 1,
                    }}
                    onMouseEnter={e => {
                      if (!cumprida) e.currentTarget.style.boxShadow = '0 6px 20px rgba(200,160,48,0.35)';
                    }}
                    onMouseLeave={e => {
                      if (!cumprida) e.currentTarget.style.boxShadow = '0 4px 16px rgba(200,160,48,0.25)';
                    }}
                  >
                    <span style={{ fontSize: 16 }}>{cumprida ? '✓' : '🎯'}</span>
                    {cumprida ? 'Missão cumprida!' : 'Marcar como cumprida'}
                  </button>

                  {cumprida && (
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: C.green, margin: 0 }}>
                      Parabéns — mais um dia de compromisso com sua transformação.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* ── Divisor ──────────────────────────────────────────────────── */}
            {historico.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ flex: 1, height: 1, background: C.border }} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>
                  Histórico · últimos 30 dias
                </span>
                <div style={{ flex: 1, height: 1, background: C.border }} />
              </div>
            )}

            {/* ── Barra de progresso 30 dias ────────────────────────────────── */}
            {historico.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* Mini calendário de calor */}
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {Array.from({ length: 30 }, (_, i) => {
                    const data = getDiaStr(30 - i);
                    const item = historico.find(h => h.data === data);
                    const cor = !item
                      ? 'rgba(255,255,255,0.04)'
                      : item.missao_cumprida
                      ? C.green
                      : 'rgba(200,160,48,0.35)';
                    return (
                      <div
                        key={i}
                        title={item ? `${fmtDataCurta(data)} — ${item.missao_cumprida ? 'cumprida' : 'não cumprida'}` : fmtDataCurta(data)}
                        style={{
                          width: 18, height: 18, borderRadius: 4,
                          background: cor,
                          transition: 'background 0.15s',
                          flexShrink: 0,
                        }}
                      />
                    );
                  })}
                </div>
                <div style={{ display: 'flex', gap: 14 }}>
                  {[
                    { cor: C.green, label: 'Cumprida' },
                    { cor: 'rgba(200,160,48,0.35)', label: 'Registrada' },
                    { cor: 'rgba(255,255,255,0.04)', label: 'Sem registro' },
                  ].map(l => (
                    <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 2, background: l.cor, flexShrink: 0 }} />
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: C.muted }}>{l.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Lista histórico ───────────────────────────────────────────── */}
            {historico.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {historico.map(item => (
                  <ItemHistorico key={item.data} item={item} />
                ))}
              </div>
            ) : (
              !loading && (
                <div style={{
                  background: C.card, border: `1.5px dashed ${C.border}`,
                  borderRadius: 16, padding: '28px', textAlign: 'center',
                }}>
                  <span style={{ fontSize: 28 }}>📋</span>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: C.muted, marginTop: 10 }}>
                    Nenhum registro dos últimos 30 dias ainda.<br />
                    Complete a missão de hoje para começar seu histórico.
                  </p>
                </div>
              )
            )}
          </>
        )}
      </div>
      </div>
    </DashboardLayout>
  );
}
