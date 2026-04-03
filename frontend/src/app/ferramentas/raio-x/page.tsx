'use client';

import { useState, useMemo } from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import FerramentaLayout from '@/components/dashboard/FerramentaLayout';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip);

// ─── Tipos e constantes ───────────────────────────────────────────────────────

type Passo = 0 | 1 | 2 | 3;

type Area = {
  emoji: string;
  label: string;
  descricao: string;
  cor: string;
};

const AREAS: Area[] = [
  { emoji: '💪', label: 'Saúde & Corpo',       descricao: 'Energia, sono, alimentação e movimento físico.',      cor: '#27AE60' },
  { emoji: '🧠', label: 'Mente & Emoções',      descricao: 'Saúde mental, clareza, equilíbrio emocional.',        cor: '#2980B9' },
  { emoji: '💰', label: 'Finanças',             descricao: 'Controle, segurança, investimentos e renda.',         cor: '#b5840a' },
  { emoji: '🚀', label: 'Carreira & Propósito', descricao: 'Realização, alinhamento e impacto no trabalho.',      cor: '#af6b9b' },
  { emoji: '🤝', label: 'Relacionamentos',       descricao: 'Família, amigos, parceiro(a) e rede de apoio.',      cor: '#5a7abf' },
  { emoji: '🎨', label: 'Lazer & Diversão',      descricao: 'Hobbies, descanso, prazer e criatividade.',          cor: '#D97706' },
  { emoji: '📈', label: 'Crescimento Pessoal',  descricao: 'Aprendizado, leitura, cursos e autodesenvolvimento.', cor: '#1a5c3a' },
  { emoji: '🧘', label: 'Espiritualidade',       descricao: 'Propósito, gratidão, fé e conexão com o todo.',      cor: '#7aaa8c' },
];

const ETAPAS = [
  { label: 'Bem-vindo',             descricao: 'Introdução à ferramenta' },
  { label: 'Avalie as Áreas',       descricao: 'Note cada dimensão de 1 a 10' },
  { label: 'Visualize o Resultado', descricao: 'Interprete seu mapa de vida' },
  { label: 'Próximos Passos',       descricao: 'Defina onde focar agora' },
];

const INSTRUCOES = [
  {
    titulo: 'Bem-vindo ao Raio-X 360°',
    corpo: [
      'Esta é sua primeira e mais importante ferramenta. Ela revela com honestidade onde você está hoje — sem julgamentos.',
      'Para cada área da vida, você vai dar uma nota de 1 a 10. Seja sincero consigo mesmo. Não existe resposta certa ou errada.',
      'O resultado será um gráfico radar que mostra o equilíbrio (ou desequilíbrio) da sua vida neste momento.',
    ],
    dica: '💡 Reserve 15 minutos tranquilos para preencher com calma e atenção.',
  },
  {
    titulo: 'Como avaliar cada área',
    corpo: [
      'Use os sliders para dar uma nota de 1 a 10 para cada área da sua vida.',
      '1 = Muito insatisfeito · 5 = Neutro · 10 = Completamente realizado',
      'Avalie como você se sente AGORA — não como quer estar, nem como estava antes.',
    ],
    dica: '💡 Confie no seu primeiro instinto. A intuição costuma ser mais honesta que a razão.',
  },
  {
    titulo: 'Seu Raio-X está pronto',
    corpo: [
      'O gráfico à direita mostra o mapa atual da sua vida. Áreas mais próximas do centro precisam de mais atenção.',
      'O Índice de Equilíbrio é a média das suas notas. Mas atenção: não é sobre ter notas altas em tudo — é sobre equilíbrio.',
      'Uma vida desequilibrada — mesmo com notas altas — gera insatisfação crônica.',
    ],
    dica: '💡 Observe quais áreas estão mais distantes umas das outras. Esse contraste revela onde focar.',
  },
  {
    titulo: 'Próximos passos',
    corpo: [
      'Agora que você tem clareza de onde está, é hora de definir onde quer chegar.',
      'Escolha 1 ou 2 áreas com nota mais baixa para focar nos próximos 90 dias. Tentar melhorar tudo ao mesmo tempo é receita para não melhorar nada.',
      'Salve seu resultado e revisite este Raio-X todo mês para acompanhar sua evolução.',
    ],
    dica: '💡 Recomendamos refazer o Raio-X a cada 30 dias para medir seu progresso.',
  },
];

const COR_PRIMARY = '#1a5c3a';
const COR_GOLD    = '#b5840a';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function equilibrioLabel(media: number): { label: string; cor: string } {
  if (media >= 8) return { label: 'Excelente', cor: '#1e8a4c' };
  if (media >= 6) return { label: 'Bom',       cor: '#7aaa8c' };
  if (media >= 4) return { label: 'Atenção',   cor: '#c47d0e' };
  return               { label: 'Crítico',     cor: '#c0392b' };
}

function scoreColor(v: number): string {
  if (v >= 8) return '#1e8a4c';
  if (v >= 5) return '#c47d0e';
  return '#c0392b';
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function SliderArea({
  area,
  valor,
  onChange,
}: {
  area: Area;
  valor: number;
  onChange: (v: number) => void;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span style={{ fontSize: 18, flexShrink: 0 }}>{area.emoji}</span>
          <div className="min-w-0">
            <p style={{ fontSize: 16, fontWeight: 600, color: COR_PRIMARY, fontFamily: 'var(--font-body)', lineHeight: 1.2 }}>
              {area.label}
            </p>
            <p style={{ fontSize: 13, color: 'var(--color-brand-gray)', lineHeight: 1.3 }}>
              {area.descricao}
            </p>
          </div>
        </div>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 18,
            fontWeight: 700,
            color: scoreColor(valor),
            minWidth: 28,
            textAlign: 'right',
            flexShrink: 0,
          }}
        >
          {valor}
        </span>
      </div>

      <div
        className="relative flex items-center"
        style={{ height: 24 }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      >
        <div className="absolute rounded-full" style={{ left: 0, right: 0, height: 6, background: 'rgba(26,92,58,0.08)' }} />
        <div
          className="absolute rounded-full transition-all duration-150"
          style={{
            left: 0,
            width: `${((valor - 1) / 9) * 100}%`,
            height: 6,
            background: focused ? area.cor : COR_PRIMARY,
          }}
        />
        {[1, 3, 5, 7, 10].map((m) => (
          <div
            key={m}
            className="absolute rounded-full"
            style={{
              left: `${((m - 1) / 9) * 100}%`,
              width: 2,
              height: 8,
              background: 'rgba(26,92,58,0.15)',
              transform: 'translateX(-1px)',
              top: '50%',
              marginTop: -4,
              pointerEvents: 'none',
            }}
          />
        ))}
        <input
          type="range"
          min={1}
          max={10}
          value={valor}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute w-full opacity-0 cursor-pointer"
          style={{ height: 24 }}
          aria-label={`${area.label}: ${valor}`}
        />
        <div
          className="absolute rounded-full pointer-events-none transition-all duration-150"
          style={{
            left: `${((valor - 1) / 9) * 100}%`,
            width: 16,
            height: 16,
            background: focused ? area.cor : COR_PRIMARY,
            border: '2px solid #fff',
            boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
            transform: 'translateX(-8px)',
            top: '50%',
            marginTop: -8,
          }}
        />
      </div>

      <div className="flex justify-between" style={{ fontSize: 9, color: 'rgba(26,92,58,0.35)', fontFamily: 'var(--font-mono)' }}>
        <span>1 — Crítico</span>
        <span>5 — Neutro</span>
        <span>10 — Realizado</span>
      </div>
    </div>
  );
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function RaioXPage() {
  const [passo, setPasso] = useState<Passo>(0);
  const [valores, setValores] = useState<number[]>(AREAS.map(() => 5));

  const media = useMemo(
    () => valores.reduce((s, v) => s + v, 0) / valores.length,
    [valores]
  );
  const equilibrio = equilibrioLabel(media);

  const chartData = useMemo(() => ({
    labels: AREAS.map((a) => a.label),
    datasets: [
      {
        label: 'Minha Vida',
        data: valores,
        backgroundColor: 'rgba(26,92,58,0.12)',
        borderColor: COR_PRIMARY,
        borderWidth: 2,
        pointBackgroundColor: AREAS.map((a) => a.cor),
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  }), [valores]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: true,
    animation: { duration: 250 },
    // Padding externo empurra o gráfico para dentro, dando espaço aos labels
    layout: { padding: 24 },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: { label: (ctx: { raw: unknown }) => ` ${ctx.raw}/10` },
        backgroundColor: COR_PRIMARY,
        titleColor: '#f5f4f0',
        bodyColor: COR_GOLD,
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
          color: 'rgba(26,92,58,0.3)',
          font: { size: 9, family: 'DM Mono' },
          backdropColor: 'transparent',
        },
        grid:       { color: 'rgba(26,92,58,0.08)' },
        angleLines: { color: 'rgba(26,92,58,0.1)'  },
        pointLabels: {
          padding: 10,   // espaço entre o polígono e o label
          color: COR_PRIMARY,
          font: { size: 9, weight: 'bold' as const, family: 'Inter' },
          // Labels longos quebram em duas linhas
          callback: (label: string): string | string[] => {
            if (label.includes(' & ')) {
              const idx = label.indexOf(' & ');
              return [label.slice(0, idx + 2).trim(), label.slice(idx + 2).trim()];
            }
            const words = label.split(' ');
            if (words.length >= 2 && label.length > 12) {
              const mid = Math.ceil(words.length / 2);
              return [words.slice(0, mid).join(' '), words.slice(mid).join(' ')];
            }
            return label;
          },
        },
      },
    },
  }), []);

  const instrucao   = INSTRUCOES[passo];
  const minIdx      = valores.indexOf(Math.min(...valores));
  const maxIdx      = valores.indexOf(Math.max(...valores));
  const progresso   = passo === 0 ? 5 : passo === 1 ? 35 : passo === 2 ? 70 : 100;

  const labelAvancar =
    passo === 0 ? 'Começar avaliação →'
    : passo === 1 ? 'Ver meu resultado →'
    : passo === 2 ? 'Ver próximos passos →'
    : 'Salvar Raio-X ✓';

  // ── Painel direito — sempre visível ──
  const painelResumo = (
    <>
      {/* Radar */}
      <div className="flex items-center justify-center">
        <Radar data={chartData} options={chartOptions} />
      </div>

      {/* Índice de equilíbrio */}
      <div
        className="flex items-center gap-4 rounded-2xl p-4"
        style={{ background: 'rgba(26,92,58,0.04)', border: '1px solid var(--color-brand-border)' }}
      >
        <div className="relative shrink-0">
          {(() => {
            const r = 28;
            const c = 2 * Math.PI * r;
            const offset = c * (1 - media / 10);
            return (
              <svg width="68" height="68" viewBox="0 0 68 68">
                <circle cx="34" cy="34" r={r} fill="none" stroke="rgba(26,92,58,0.08)" strokeWidth="6" />
                <circle
                  cx="34" cy="34" r={r}
                  fill="none"
                  stroke={equilibrio.cor}
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={c}
                  strokeDashoffset={offset}
                  transform="rotate(-90 34 34)"
                  style={{ transition: 'stroke-dashoffset 0.3s ease, stroke 0.3s ease' }}
                />
                <text x="34" y="38" textAnchor="middle" style={{ fontSize: 14, fontWeight: 700, fill: COR_PRIMARY, fontFamily: 'Inter' }}>
                  {media.toFixed(1)}
                </text>
              </svg>
            );
          })()}
        </div>
        <div>
          <p style={{ fontFamily: 'var(--font-heading)', fontSize: 15, fontStyle: 'italic', color: equilibrio.cor }}>
            {equilibrio.label}
          </p>
          <p style={{ fontSize: 13, color: 'var(--color-brand-gray)', lineHeight: 1.5, marginTop: 2 }}>
            Índice de equilíbrio<br />baseado nas 8 áreas
          </p>
        </div>
      </div>

      {/* Notas por área */}
      <div className="flex flex-col gap-2">
        <p style={{ fontSize: 14, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-brand-gray)' }}>
          Notas por área
        </p>
        {AREAS.map((area, i) => (
          <div key={area.label} className="flex items-center gap-2">
            <span style={{ fontSize: 13, flexShrink: 0 }}>{area.emoji}</span>
            <div className="flex-1 rounded-full overflow-hidden" style={{ height: 4, background: 'rgba(26,92,58,0.08)' }}>
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${(valores[i] / 10) * 100}%`, background: area.cor }}
              />
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 700, color: scoreColor(valores[i]), minWidth: 16, textAlign: 'right' }}>
              {valores[i]}
            </span>
          </div>
        ))}
      </div>

      {/* Foco / Força */}
      <div className="flex flex-col gap-2">
        <div className="rounded-xl p-3" style={{ background: 'rgba(192,57,43,0.06)', border: '1px solid rgba(192,57,43,0.15)' }}>
          <p style={{ fontSize: 14, color: '#c0392b', fontWeight: 600 }}>⚠ Foco recomendado</p>
          <p style={{ fontSize: 15, color: COR_PRIMARY, marginTop: 2 }}>
            {AREAS[minIdx].emoji} {AREAS[minIdx].label} — nota {valores[minIdx]}
          </p>
        </div>
        <div className="rounded-xl p-3" style={{ background: 'rgba(30,138,76,0.06)', border: '1px solid rgba(30,138,76,0.15)' }}>
          <p style={{ fontSize: 14, color: '#1e8a4c', fontWeight: 600 }}>✦ Ponto forte</p>
          <p style={{ fontSize: 15, color: COR_PRIMARY, marginTop: 2 }}>
            {AREAS[maxIdx].emoji} {AREAS[maxIdx].label} — nota {valores[maxIdx]}
          </p>
        </div>
      </div>
    </>
  );

  return (
    <FerramentaLayout
      codigo="F01"
      nome="Raio-X 360°"
      descricao="Diagnóstico completo das 8 áreas da sua vida para saber exatamente onde você está hoje."
      etapas={ETAPAS}
      etapaAtual={passo}
      progresso={progresso}
      onAvancar={() => setPasso((p) => Math.min(3, p + 1) as Passo)}
      onVoltar={() => setPasso((p) => Math.max(0, p - 1) as Passo)}
      podeAvancar
      labelAvancar={labelAvancar}
      resumo={painelResumo}
  respostas={{ valores }}
    >
      {/* ── Conteúdo central ── */}
      <div className="p-8">

        {/* Instrução do passo atual */}
        <div className="max-w-xl mx-auto mb-8">
          <h2
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(22px, 3vw, 30px)',
              fontWeight: 400,
              fontStyle: 'italic',
              color: COR_PRIMARY,
              lineHeight: 1.2,
              marginBottom: 16,
            }}
          >
            {instrucao.titulo}
          </h2>
          <div className="flex flex-col gap-3 mb-4">
            {instrucao.corpo.map((txt, i) => (
              <p key={i} style={{ fontSize: 16, lineHeight: 1.7, color: 'var(--color-brand-gray)' }}>
                {txt}
              </p>
            ))}
          </div>
          <div
            className="rounded-xl p-3"
            style={{ background: `${COR_GOLD}14`, border: `1px solid ${COR_GOLD}30` }}
          >
            <p style={{ fontSize: 15, color: COR_GOLD, lineHeight: 1.6, fontWeight: 500 }}>
              {instrucao.dica}
            </p>
          </div>
        </div>

        {/* Passo 0 — Cards de boas-vindas */}
        {passo === 0 && (
          <div className="max-w-xl mx-auto grid grid-cols-2 gap-4">
            {[
              { emoji: '🎯', titulo: '8 áreas avaliadas', desc: 'Cobertura completa das dimensões da vida.' },
              { emoji: '📊', titulo: 'Gráfico radar', desc: 'Visualize seu equilíbrio de forma intuitiva.' },
              { emoji: '⚡', titulo: '15 minutos', desc: 'Rápido e profundo ao mesmo tempo.' },
              { emoji: '🔄', titulo: 'Revisão mensal', desc: 'Acompanhe sua evolução ao longo do tempo.' },
            ].map((c) => (
              <div
                key={c.titulo}
                className="flex flex-col gap-2 rounded-2xl p-5"
                style={{ background: '#fff', border: '1px solid var(--color-brand-border)', boxShadow: 'var(--shadow-card)' }}
              >
                <span style={{ fontSize: 24 }}>{c.emoji}</span>
                <p style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontStyle: 'italic', color: COR_PRIMARY }}>{c.titulo}</p>
                <p style={{ fontSize: 15, color: 'var(--color-brand-gray)', lineHeight: 1.5 }}>{c.desc}</p>
              </div>
            ))}
          </div>
        )}

        {/* Passos 1, 2, 3 — Sliders sempre visíveis */}
        {passo >= 1 && (
          <div className="max-w-xl mx-auto flex flex-col gap-4">
            {passo === 1 && (
              <p style={{ fontSize: 15, color: 'var(--color-brand-gray)', marginBottom: 4 }}>
                Arraste os sliders para refletir como você se sente hoje. Seja honesto.
              </p>
            )}

            {AREAS.map((area, i) => (
              <div
                key={area.label}
                className="rounded-2xl p-5"
                style={{ background: '#fff', border: '1px solid var(--color-brand-border)', boxShadow: 'var(--shadow-card)' }}
              >
                <SliderArea
                  area={area}
                  valor={valores[i]}
                  onChange={(v) => setValores((prev) => prev.map((x, j) => (j === i ? v : x)))}
                />
              </div>
            ))}

            {/* Resumo de equilíbrio inline */}
            <div
              className="rounded-2xl p-5 flex items-center justify-between gap-4"
              style={{ background: COR_PRIMARY }}
            >
              <div>
                <p style={{ fontSize: 15, color: 'rgba(245,244,240,0.6)', marginBottom: 4 }}>Índice de Equilíbrio</p>
                <p style={{ fontFamily: 'var(--font-heading)', fontSize: 28, fontStyle: 'italic', color: equilibrio.cor, lineHeight: 1 }}>
                  {media.toFixed(1)}<span style={{ fontSize: 14, color: 'rgba(245,244,240,0.4)' }}>/10</span>
                </p>
              </div>
              <div className="text-right">
                <p style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontStyle: 'italic', color: equilibrio.cor }}>
                  {equilibrio.label}
                </p>
                <p style={{ fontSize: 13, color: 'rgba(245,244,240,0.5)', marginTop: 2 }}>
                  Baseado nas suas respostas
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Passo 3 — Próximos passos destacados */}
        {passo === 3 && (
          <div className="max-w-xl mx-auto mt-6 flex flex-col gap-3">
            <div
              className="rounded-2xl p-5"
              style={{ background: `${COR_GOLD}12`, border: `1.5px solid ${COR_GOLD}40` }}
            >
              <p style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontStyle: 'italic', color: COR_PRIMARY, marginBottom: 8 }}>
                Área prioritária
              </p>
              <div className="flex items-center gap-3">
                <span style={{ fontSize: 28 }}>{AREAS[minIdx].emoji}</span>
                <div>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 600, color: COR_PRIMARY }}>
                    {AREAS[minIdx].label}
                  </p>
                  <p style={{ fontSize: 15, color: 'var(--color-brand-gray)' }}>
                    Nota atual: {valores[minIdx]}/10 — foco recomendado para os próximos 90 dias
                  </p>
                </div>
              </div>
            </div>
            <div
              className="rounded-2xl p-5"
              style={{ background: 'rgba(30,138,76,0.06)', border: '1.5px solid rgba(30,138,76,0.25)' }}
            >
              <p style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontStyle: 'italic', color: '#1e8a4c', marginBottom: 8 }}>
                Seu maior recurso
              </p>
              <div className="flex items-center gap-3">
                <span style={{ fontSize: 28 }}>{AREAS[maxIdx].emoji}</span>
                <div>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 600, color: COR_PRIMARY }}>
                    {AREAS[maxIdx].label}
                  </p>
                  <p style={{ fontSize: 15, color: 'var(--color-brand-gray)' }}>
                    Nota atual: {valores[maxIdx]}/10 — use esta área como alavanca
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </FerramentaLayout>
  );
}
