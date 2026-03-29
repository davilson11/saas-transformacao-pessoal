'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

// ─── Tipos e dados ───────────────────────────────────────────────────────────

type Area = {
  label: string;
  emoji: string;
  valor: number;
  cor: string;
};

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

function scoreColor(v: number): string {
  if (v <= 3) return '#C0392B';
  if (v <= 6) return '#D97706';
  return '#27AE60';
}

// ─── Componente principal ────────────────────────────────────────────────────

export default function LifeWheel() {
  const [areas, setAreas] = useState<Area[]>(AREAS_INICIAL);
  const [editing, setEditing] = useState<number | null>(null);

  const media = (areas.reduce((s, a) => s + a.valor, 0) / areas.length).toFixed(1);

  const handleSlider = useCallback((index: number, value: number) => {
    setAreas((prev) =>
      prev.map((a, i) => (i === index ? { ...a, valor: value } : a))
    );
  }, []);

  // ── Chart.js data ──
  const chartData = {
    labels: areas.map((a) => a.label),
    datasets: [
      {
        label: 'Minha Vida',
        data: areas.map((a) => a.valor),
        backgroundColor: 'rgba(30,57,42,0.18)',
        borderColor: '#1E392A',
        borderWidth: 2,
        pointBackgroundColor: areas.map((a) => a.cor),
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: { raw: unknown }) => ` ${ctx.raw}/10`,
        },
        backgroundColor: '#1E392A',
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
        grid: {
          color: 'rgba(30,57,42,0.1)',
        },
        angleLines: {
          color: 'rgba(30,57,42,0.12)',
        },
        pointLabels: {
          color: '#1E392A',
          font: { size: 12, weight: 'bold' as const, family: 'DM Sans' },
        },
      },
    },
  };

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: '#fff',
        border: '1px solid var(--color-brand-border)',
        boxShadow: 'var(--shadow-card)',
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
        <span className="badge badge-green">Fase 1</span>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Gráfico radar */}
        <div className="flex items-center justify-center p-6 flex-1" style={{ minWidth: 0 }}>
          <div style={{ width: '100%', maxWidth: 360 }}>
            <Radar data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Sliders */}
        <div
          className="flex flex-col gap-3 p-6 lg:w-72 flex-shrink-0"
          style={{ borderTop: '1px solid var(--color-brand-border)' }}
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
              <div className="flex items-center justify-between">
                <span style={{ fontSize: 13, fontFamily: 'var(--font-body)', color: 'var(--color-brand-dark-green)' }}>
                  <span className="mr-1">{area.emoji}</span>
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
                    background: editing === i ? area.cor : '#1E392A',
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
          Mova os sliders para refletir como está cada área da sua vida.
        </p>
        <Link
          href="/ferramentas/raio-x"
          className="btn-gold flex-shrink-0"
          style={{ padding: '10px 20px', fontSize: 14, borderRadius: 10, textDecoration: 'none' }}
        >
          Atualizar Avaliação →
        </Link>
      </div>
    </div>
  );
}
