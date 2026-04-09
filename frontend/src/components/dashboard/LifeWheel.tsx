'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { salvarRodaVida, buscarRodaVida, buscarHistoricoRodaVida } from '@/lib/queries';
import { useSupabaseClient } from '@/lib/useSupabaseClient';
import type { RodaVida } from '@/lib/database.types';
import {
  Chart as ChartJS,
  RadialLinearScale,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar, Line } from 'react-chartjs-2';

ChartJS.register(
  RadialLinearScale,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
);

// ─── Tipos e dados ───────────────────────────────────────────────────────────

type Area = {
  label: string;
  emoji: string;
  valor: number;
  cor: string;
};

type ViewMode = 'radar' | 'historico';
type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

type Alerta = { label: string; emoji: string; queda: number };

// Mapeamento label → coluna no banco
const AREA_DB_KEY: Record<string, keyof Omit<RodaVida, 'id' | 'user_id' | 'created_at'>> = {
  'Saúde':           'saude',
  'Carreira':        'carreira',
  'Finanças':        'financas',
  'Relacionamentos': 'relacionamentos',
  'Crescimento':     'crescimento',
  'Lazer':           'lazer',
  'Família':         'familia',
  'Espiritualidade': 'espiritualidade',
};

const AREA_KEYS: Array<{
  label: string;
  emoji: string;
  key: keyof Omit<RodaVida, 'id' | 'user_id' | 'created_at'>;
}> = [
  { label: 'Saúde',           emoji: '💪', key: 'saude' },
  { label: 'Carreira',        emoji: '💼', key: 'carreira' },
  { label: 'Finanças',        emoji: '💰', key: 'financas' },
  { label: 'Relacionamentos', emoji: '🤝', key: 'relacionamentos' },
  { label: 'Crescimento',     emoji: '📈', key: 'crescimento' },
  { label: 'Lazer',           emoji: '🎨', key: 'lazer' },
  { label: 'Família',         emoji: '🏡', key: 'familia' },
  { label: 'Espiritualidade', emoji: '🧘', key: 'espiritualidade' },
];

const AREAS_INICIAL: Area[] = [
  { label: 'Saúde',          emoji: '💪', valor: 7, cor: '#27AE60' },
  { label: 'Carreira',       emoji: '💼', valor: 6, cor: '#2980B9' },
  { label: 'Finanças',       emoji: '💰', valor: 5, cor: '#E0A55F' },
  { label: 'Relacionamentos',emoji: '🤝', valor: 8, cor: '#af6b9b' },
  { label: 'Crescimento',    emoji: '📈', valor: 9, cor: '#1E392A' },
  { label: 'Lazer',          emoji: '🎨', valor: 4, cor: '#D97706' },
  { label: 'Família',        emoji: '🏡', valor: 8, cor: '#5a7abf' },
  { label: 'Espiritualidade',emoji: '🧘', valor: 6, cor: '#81B29A' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function scoreColor(v: number): string {
  if (v <= 3) return '#C0392B';
  if (v <= 6) return '#D97706';
  return '#27AE60';
}

function scoreMedia(r: RodaVida): number {
  const total =
    r.saude + r.carreira + r.financas + r.relacionamentos +
    r.crescimento + r.lazer + r.familia + r.espiritualidade;
  return total / 8;
}

function formatarData(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
}

function calcularAlertas(historico: RodaVida[]): Alerta[] {
  if (historico.length < 2) return [];

  // historico está em ordem desc: [0] = mais recente
  const maisRecente = historico[0];
  const now = new Date(maisRecente.created_at);
  const umaSemanaAtras = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Referência: primeiro registro que é >= 7 dias anterior ao mais recente;
  // se não houver, usa o mais antigo disponível
  const referencia =
    historico.find((r) => new Date(r.created_at) <= umaSemanaAtras) ??
    historico[historico.length - 1];

  if (referencia.id === maisRecente.id) return [];

  const alertas: Alerta[] = [];
  for (const { label, emoji, key } of AREA_KEYS) {
    const antes = referencia[key] as number;
    const depois = maisRecente[key] as number;
    if (antes > 0) {
      const queda = (antes - depois) / antes;
      if (queda >= 0.2) {
        alertas.push({ label, emoji, queda: Math.round(queda * 100) });
      }
    }
  }
  return alertas;
}

// ─── Componente principal ────────────────────────────────────────────────────

export default function LifeWheel() {
  const [areas, setAreas] = useState<Area[]>(AREAS_INICIAL);
  const [editing, setEditing] = useState<number | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [view, setView] = useState<ViewMode>('radar');
  const [historico, setHistorico] = useState<RodaVida[]>([]);
  const [loadingHistorico, setLoadingHistorico] = useState(false);

  const { user } = useUser();
  const { getClient } = useSupabaseClient();

  // ── Carregar dados salvos ao montar ──
  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      const client = await getClient();
      const data = await buscarRodaVida(user.id, client);
      if (!data) return;
      setAreas((prev) =>
        prev.map((a) => {
          const key = AREA_DB_KEY[a.label];
          return key ? { ...a, valor: data[key] as number } : a;
        })
      );
    })();
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Carregar histórico ao trocar para a aba de histórico ──
  useEffect(() => {
    if (view !== 'historico' || !user?.id || historico.length > 0) return;
    (async () => {
      setLoadingHistorico(true);
      const client = await getClient();
      const data = await buscarHistoricoRodaVida(user.id, 30, client);
      setHistorico(data);
      setLoadingHistorico(false);
    })();
  }, [view, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const media = (areas.reduce((s, a) => s + a.valor, 0) / areas.length).toFixed(1);

  const handleSlider = useCallback((index: number, value: number) => {
    setAreas((prev) =>
      prev.map((a, i) => (i === index ? { ...a, valor: value } : a))
    );
    setSaveStatus('idle');
  }, []);

  // ── Salvar no Supabase ──
  async function handleSalvar() {
    if (!user?.id) return;
    setSaveStatus('saving');
    const scores = {
      saude:           areas.find((a) => a.label === 'Saúde')?.valor           ?? 5,
      carreira:        areas.find((a) => a.label === 'Carreira')?.valor        ?? 5,
      financas:        areas.find((a) => a.label === 'Finanças')?.valor        ?? 5,
      relacionamentos: areas.find((a) => a.label === 'Relacionamentos')?.valor ?? 5,
      crescimento:     areas.find((a) => a.label === 'Crescimento')?.valor     ?? 5,
      lazer:           areas.find((a) => a.label === 'Lazer')?.valor           ?? 5,
      familia:         areas.find((a) => a.label === 'Família')?.valor         ?? 5,
      espiritualidade: areas.find((a) => a.label === 'Espiritualidade')?.valor ?? 5,
    };
    const client = await getClient();
    const result = await salvarRodaVida(user.id, scores, client);
    setSaveStatus(result ? 'saved' : 'error');
    if (result) {
      // Invalida o cache do histórico para forçar recarga na próxima visita
      setHistorico([]);
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  }

  // ── Chart.js — Radar ──
  const radarData = {
    labels: areas.map((a) => a.label),
    datasets: [
      {
        label: 'Minha Vida',
        data: areas.map((a) => a.valor),
        backgroundColor: 'rgba(200,160,48,0.12)',
        borderColor: '#C8A030',
        borderWidth: 2,
        pointBackgroundColor: areas.map((a) => a.cor),
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: { raw: unknown }) => ` ${ctx.raw}/10`,
        },
        backgroundColor: '#0E0E0E',
        titleColor: '#F4F1DE',
        bodyColor: '#E0A55F',
        padding: 10,
        cornerRadius: 8,
      },
    },
    scales: {
      r: {
        min: 0,
        max: 10,
        ticks: {
          stepSize: 2,
          color: 'rgba(30,57,42,0.35)',
          font: { size: 10, family: 'DM Sans' },
          backdropColor: 'transparent',
        },
        grid: { color: 'rgba(0,0,0,0.08)' },
        angleLines: { color: 'rgba(0,0,0,0.08)' },
        pointLabels: {
          color: '#4A4540',
          font: { size: 11, weight: 'bold' as const, family: 'DM Sans' },
          padding: 8,
        },
      },
    },
  };

  // ── Chart.js — Linha ──
  const historicoAsc = [...historico].reverse(); // mais antigo → mais recente

  const lineData = {
    labels: historicoAsc.map((r) => formatarData(r.created_at)),
    datasets: [
      {
        label: 'Score Médio',
        data: historicoAsc.map((r) => parseFloat(scoreMedia(r).toFixed(1))),
        borderColor: '#C8A030',
        backgroundColor: 'rgba(200,160,48,0.10)',
        borderWidth: 2,
        pointBackgroundColor: '#C8A030',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.35,
        fill: true,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: { raw: unknown }) => ` Média: ${ctx.raw}/10`,
        },
        backgroundColor: '#0E0E0E',
        titleColor: '#F4F1DE',
        bodyColor: '#E0A55F',
        padding: 10,
        cornerRadius: 8,
      },
    },
    scales: {
      y: {
        min: 0,
        max: 10,
        ticks: {
          stepSize: 2,
          color: 'rgba(30,57,42,0.5)',
          font: { size: 11 },
        },
        grid: { color: 'rgba(0,0,0,0.06)' },
      },
      x: {
        ticks: {
          color: 'rgba(30,57,42,0.5)',
          font: { size: 11 },
          maxRotation: 45,
        },
        grid: { display: false },
      },
    },
  };

  const alertas = calcularAlertas(historico);

  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid var(--color-brand-border)',
        boxShadow: 'var(--shadow-card)',
        borderRadius: 16,
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-6 py-4"
        style={{ borderBottom: '1px solid var(--color-brand-border)' }}
      >
        <div>
          <h3
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 17,
              fontWeight: 700,
              color: 'var(--color-brand-dark-green)',
              lineHeight: 1.2,
            }}
          >
            Roda da Vida
          </h3>
          <p style={{ fontSize: 12, color: 'var(--color-brand-gray)', marginTop: 2 }}>
            Média atual:{' '}
            <strong style={{ color: scoreColor(Number(media)) }}>{media}/10</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Toggle radar / histórico */}
          <div
            className="flex"
            style={{
              border: '1px solid var(--color-brand-border)',
              borderRadius: 8,
              overflow: 'hidden',
            }}
          >
            <button
              onClick={() => setView('radar')}
              style={{
                padding: '6px 14px',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                border: 'none',
                background: view === 'radar' ? '#C8A030' : 'transparent',
                color: view === 'radar' ? '#fff' : 'var(--color-brand-gray)',
                transition: 'background 0.15s, color 0.15s',
              }}
            >
              Radar
            </button>
            <button
              onClick={() => setView('historico')}
              style={{
                padding: '6px 14px',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                border: 'none',
                borderLeft: '1px solid var(--color-brand-border)',
                background: view === 'historico' ? '#C8A030' : 'transparent',
                color: view === 'historico' ? '#fff' : 'var(--color-brand-gray)',
                transition: 'background 0.15s, color 0.15s',
              }}
            >
              Histórico
            </button>
          </div>

          <span className="badge badge-green">Fase 1</span>
        </div>
      </div>

      {/* ── VIEW: RADAR ───────────────────────────────────────────────── */}
      {view === 'radar' && (
        <>
          <div className="flex flex-col lg:flex-row">
            {/* Gráfico radar */}
            <div className="flex items-center justify-center flex-1" style={{ minWidth: 0, padding: '40px 32px 32px' }}>
              <div style={{ width: '100%', maxWidth: 360, overflow: 'visible' }}>
                <Radar data={radarData} options={radarOptions} />
              </div>
            </div>

            {/* Sliders */}
            <div
              className="flex flex-col gap-3 p-6 flex-shrink-0"
              style={{
                borderTop: '1px solid var(--color-brand-border)',
                width: 'clamp(220px, 100%, 288px)',
                minWidth: 0,
                overflow: 'visible',
              }}
            >
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--color-brand-gray)',
                  marginBottom: 4,
                }}
              >
                Ajuste sua avaliação
              </p>

              {areas.map((area, i) => (
                <div
                  key={area.label}
                  className="flex flex-col gap-1"
                  onFocus={() => setEditing(i)}
                  onBlur={() => setEditing(null)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4, minWidth: 0 }}>
                    <span style={{
                      fontSize: 13,
                      fontFamily: 'var(--font-body)',
                      color: 'var(--color-brand-dark-green)',
                      wordBreak: 'break-word',
                      overflowWrap: 'break-word',
                      minWidth: 0,
                      flex: 1,
                    }}>
                      <span style={{ marginRight: 4 }}>{area.emoji}</span>
                      {area.label}
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 13,
                        fontWeight: 600,
                        color: scoreColor(area.valor),
                        minWidth: 28,
                        textAlign: 'right',
                        flexShrink: 0,
                      }}
                    >
                      {area.valor}
                    </span>
                  </div>

                  {/* Track customizado */}
                  <div className="relative flex items-center" style={{ height: 20 }}>
                    <div
                      className="absolute rounded-full"
                      style={{
                        left: 0,
                        right: 0,
                        height: 4,
                        background: 'var(--color-brand-border)',
                      }}
                    />
                    <div
                      className="absolute rounded-full transition-all duration-150"
                      style={{
                        left: 0,
                        width: `${(area.valor / 10) * 100}%`,
                        height: 4,
                        background: editing === i ? area.cor : '#C8A030',
                      }}
                    />
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={area.valor}
                      onChange={(e) => handleSlider(i, Number(e.target.value))}
                      className="absolute w-full opacity-0 cursor-pointer"
                      style={{ height: 20 }}
                      aria-label={`${area.label}: ${area.valor}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer — CTA */}
          <div
            className="flex items-center justify-between gap-4 px-6 py-4"
            style={{ borderTop: '1px solid var(--color-brand-border)', background: 'rgba(30,57,42,0.02)' }}
          >
            <p style={{ fontSize: 12, color: 'var(--color-brand-gray)' }}>
              {saveStatus === 'saved'  && <span style={{ color: '#27AE60' }}>✓ Avaliação salva!</span>}
              {saveStatus === 'saving' && <span style={{ color: 'var(--color-brand-gray)' }}>Salvando…</span>}
              {saveStatus === 'error'  && <span style={{ color: '#C0392B' }}>Erro ao salvar. Tente novamente.</span>}
              {saveStatus === 'idle'   && 'Mova os sliders para refletir cada área da sua vida.'}
            </p>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleSalvar}
                disabled={saveStatus === 'saving'}
                className="btn-gold"
                style={{
                  padding: '10px 20px',
                  fontSize: 14,
                  borderRadius: 10,
                  opacity: saveStatus === 'saving' ? 0.7 : 1,
                  cursor: saveStatus === 'saving' ? 'wait' : 'pointer',
                }}
              >
                {saveStatus === 'saving' ? 'Salvando…' : 'Salvar Avaliação'}
              </button>
              <Link
                href="/ferramentas/raio-x"
                style={{ fontSize: 13, color: 'var(--color-brand-gold)', fontWeight: 600, textDecoration: 'none' }}
              >
                Ver Raio-X →
              </Link>
            </div>
          </div>
        </>
      )}

      {/* ── VIEW: HISTÓRICO ───────────────────────────────────────────── */}
      {view === 'historico' && (
        <div className="flex flex-col gap-0">
          {loadingHistorico ? (
            <div
              className="flex items-center justify-center"
              style={{ padding: '48px 24px', color: 'var(--color-brand-gray)', fontSize: 14 }}
            >
              Carregando histórico…
            </div>
          ) : historico.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center gap-2 text-center"
              style={{ padding: '48px 24px' }}
            >
              <span style={{ fontSize: 32 }}>📊</span>
              <p style={{ fontSize: 14, color: 'var(--color-brand-gray)' }}>
                Nenhum registro encontrado.
              </p>
              <p style={{ fontSize: 13, color: 'var(--color-brand-gray)' }}>
                Salve sua avaliação no radar para começar a ver sua evolução aqui.
              </p>
            </div>
          ) : (
            <>
              {/* Gráfico de linha */}
              <div style={{ padding: '28px 28px 20px' }}>
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: '0.07em',
                    textTransform: 'uppercase',
                    color: 'var(--color-brand-gray)',
                    marginBottom: 16,
                  }}
                >
                  Evolução do score médio — últimos 30 dias
                </p>
                <div style={{ height: 220 }}>
                  <Line data={lineData} options={lineOptions} />
                </div>
              </div>

              {/* Alertas de queda */}
              {alertas.length > 0 && (
                <div
                  style={{
                    borderTop: '1px solid var(--color-brand-border)',
                    padding: '20px 28px',
                  }}
                >
                  <p
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      letterSpacing: '0.07em',
                      textTransform: 'uppercase',
                      color: '#C0392B',
                      marginBottom: 12,
                    }}
                  >
                    Atenção — quedas na última semana
                  </p>
                  <div className="flex flex-col gap-2">
                    {alertas.map((a) => (
                      <div
                        key={a.label}
                        className="flex items-center gap-3"
                        style={{
                          background: 'rgba(192,57,43,0.06)',
                          border: '1px solid rgba(192,57,43,0.18)',
                          borderRadius: 10,
                          padding: '10px 14px',
                        }}
                      >
                        <span style={{ fontSize: 20 }}>{a.emoji}</span>
                        <p style={{ fontSize: 13, color: '#7B1A10', fontWeight: 500 }}>
                          Sua <strong>{a.label}</strong> caiu{' '}
                          <strong style={{ color: '#C0392B' }}>{a.queda}%</strong> essa semana.
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rodapé do histórico */}
              <div
                style={{
                  borderTop: '1px solid var(--color-brand-border)',
                  background: 'rgba(30,57,42,0.02)',
                  padding: '12px 28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <p style={{ fontSize: 12, color: 'var(--color-brand-gray)' }}>
                  {historico.length} registro{historico.length !== 1 ? 's' : ''} encontrado{historico.length !== 1 ? 's' : ''}
                </p>
                <Link
                  href="/ferramentas/raio-x"
                  style={{ fontSize: 13, color: 'var(--color-brand-gold)', fontWeight: 600, textDecoration: 'none' }}
                >
                  Ver Raio-X →
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
