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
  { emoji: '💪', label: 'Saúde & Corpo',        descricao: 'Energia, sono, alimentação e movimento físico.',      cor: '#27AE60' },
  { emoji: '🧠', label: 'Mente & Emoções',       descricao: 'Saúde mental, clareza, equilíbrio emocional.',        cor: '#2980B9' },
  { emoji: '💰', label: 'Finanças',              descricao: 'Controle, segurança, investimentos e renda.',         cor: '#E0A55F' },
  { emoji: '🚀', label: 'Carreira & Propósito',  descricao: 'Realização, alinhamento e impacto no trabalho.',      cor: '#af6b9b' },
  { emoji: '🤝', label: 'Relacionamentos',        descricao: 'Família, amigos, parceiro(a) e rede de apoio.',      cor: '#5a7abf' },
  { emoji: '🎨', label: 'Lazer & Diversão',       descricao: 'Hobbies, descanso, prazer e criatividade.',          cor: '#D97706' },
  { emoji: '📈', label: 'Crescimento Pessoal',   descricao: 'Aprendizado, leitura, cursos e autodesenvolvimento.', cor: '#1E392A' },
  { emoji: '🧘', label: 'Espiritualidade',        descricao: 'Propósito, gratidão, fé e conexão com o todo.',      cor: '#81B29A' },
];

const PASSOS = [
  { numero: 1, titulo: 'Bem-vindo',             icone: '👋' },
  { numero: 2, titulo: 'Preencha os Campos',    icone: '✏️' },
  { numero: 3, titulo: 'Visualize o Resultado', icone: '📊' },
  { numero: 4, titulo: 'Próximos Passos',       icone: '🚀' },
];

const PASSOS_INSTRUCOES = [
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
      'Salve ou compartilhe seu resultado e revisit este Raio-X todo mês para acompanhar sua evolução.',
    ],
    dica: '💡 Recomendamos refazer o Raio-X a cada 30 dias para medir seu progresso.',
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function equilibrioLabel(media: number): { label: string; cor: string } {
  if (media >= 8) return { label: 'Excelente',    cor: '#27AE60' };
  if (media >= 6) return { label: 'Bom',          cor: '#81B29A' };
  if (media >= 4) return { label: 'Atenção',      cor: '#D97706' };
  return               { label: 'Crítico',        cor: '#C0392B' };
}

function scoreColor(v: number): string {
  if (v >= 8) return '#27AE60';
  if (v >= 5) return '#D97706';
  return '#C0392B';
}

// ─── Componentes ─────────────────────────────────────────────────────────────

function StepIndicator({ passo, atual }: { passo: typeof PASSOS[number]; atual: Passo }) {
  const idx = (passo.numero - 1) as Passo;
  const concluido = idx < atual;
  const ativo = idx === atual;

  return (
    <div className="flex items-center gap-3">
      <div
        className="flex items-center justify-center rounded-full flex-shrink-0 text-xs font-bold transition-all duration-300"
        style={{
          width: 28,
          height: 28,
          background: concluido ? '#27AE60' : ativo ? '#1E392A' : 'rgba(30,57,42,0.08)',
          color: concluido || ativo ? '#fff' : 'var(--color-brand-gray)',
          fontFamily: 'var(--font-heading)',
        }}
      >
        {concluido ? '✓' : passo.numero}
      </div>
      <div>
        <p
          style={{
            fontSize: 13,
            fontWeight: ativo ? 700 : 500,
            color: ativo ? 'var(--color-brand-dark-green)' : concluido ? '#27AE60' : 'var(--color-brand-gray)',
            fontFamily: 'var(--font-body)',
            lineHeight: 1.2,
          }}
        >
          {passo.titulo}
        </p>
      </div>
    </div>
  );
}

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
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-brand-dark-green)', fontFamily: 'var(--font-body)', lineHeight: 1.2 }}>
              {area.label}
            </p>
            <p style={{ fontSize: 11, color: 'var(--color-brand-gray)', lineHeight: 1.3 }}>
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

      {/* Track customizado */}
      <div
        className="relative flex items-center"
        style={{ height: 24 }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      >
        {/* Trilha fundo */}
        <div className="absolute rounded-full" style={{ left: 0, right: 0, height: 6, background: 'rgba(30,57,42,0.08)' }} />
        {/* Fill */}
        <div
          className="absolute rounded-full transition-all duration-150"
          style={{
            left: 0,
            width: `${((valor - 1) / 9) * 100}%`,
            height: 6,
            background: focused ? area.cor : '#1E392A',
          }}
        />
        {/* Marcadores de referência */}
        {[1, 3, 5, 7, 10].map((m) => (
          <div
            key={m}
            className="absolute rounded-full"
            style={{
              left: `${((m - 1) / 9) * 100}%`,
              width: 2,
              height: 8,
              background: 'rgba(30,57,42,0.15)',
              transform: 'translateX(-1px)',
              top: '50%',
              marginTop: -4,
              pointerEvents: 'none',
            }}
          />
        ))}
        {/* Input invisível */}
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
        {/* Thumb visível */}
        <div
          className="absolute rounded-full pointer-events-none transition-all duration-150"
          style={{
            left: `${((valor - 1) / 9) * 100}%`,
            width: 16,
            height: 16,
            background: focused ? area.cor : '#1E392A',
            border: '2px solid #fff',
            boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
            transform: 'translateX(-8px)',
            top: '50%',
            marginTop: -8,
          }}
        />
      </div>

      {/* Escala */}
      <div className="flex justify-between" style={{ fontSize: 9, color: 'rgba(30,57,42,0.35)', fontFamily: 'var(--font-mono)' }}>
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
        backgroundColor: 'rgba(30,57,42,0.15)',
        borderColor: '#1E392A',
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
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: { label: (ctx: { raw: unknown }) => ` ${ctx.raw}/10` },
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
          color: 'rgba(30,57,42,0.3)',
          font: { size: 9, family: 'DM Mono' },
          backdropColor: 'transparent',
        },
        grid: { color: 'rgba(30,57,42,0.08)' },
        angleLines: { color: 'rgba(30,57,42,0.1)' },
        pointLabels: {
          color: '#1E392A',
          font: { size: 11, weight: 'bold' as const, family: 'DM Sans' },
        },
      },
    },
  }), []);

  const instrucao = PASSOS_INSTRUCOES[passo];
  const isUltimoPasso = passo === 3;

  return (
    <div style={{ background: '#f7f5ee', minHeight: '100vh', fontFamily: 'var(--font-body)' }}>

      {/* Topbar */}
      <div
        className="flex items-center gap-4 px-6 py-3 sticky top-0 z-20"
        style={{ background: '#1E392A', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      >
        <a
          href="/ferramentas"
          className="flex items-center gap-1 text-sm transition-opacity hover:opacity-70"
          style={{ color: 'rgba(244,241,222,0.6)', textDecoration: 'none' }}
        >
          ← Ferramentas
        </a>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>/</span>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--color-brand-gold)',
            background: 'rgba(224,165,95,0.15)',
            padding: '2px 8px',
            borderRadius: 99,
          }}
        >
          F01
        </span>
        <span
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 15,
            fontWeight: 700,
            color: 'var(--color-brand-cream)',
          }}
        >
          Raio-X 360°
        </span>
        {/* Progress bar */}
        <div className="flex-1 mx-4">
          <div className="rounded-full overflow-hidden" style={{ height: 3, background: 'rgba(255,255,255,0.1)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${((passo + 1) / 4) * 100}%`, background: 'var(--color-brand-gold)' }}
            />
          </div>
        </div>
        <span style={{ fontSize: 12, color: 'rgba(244,241,222,0.5)', whiteSpace: 'nowrap' }}>
          Passo {passo + 1} de 4
        </span>
      </div>

      {/* Layout 3 colunas */}
      <div className="flex h-[calc(100vh-49px)]">

        {/* ── Coluna esquerda: nav + instruções ─────────────────────── */}
        <aside
          className="flex flex-col flex-shrink-0 overflow-y-auto"
          style={{
            width: 280,
            background: '#fff',
            borderRight: '1px solid var(--color-brand-border)',
          }}
        >
          {/* Steps */}
          <div className="flex flex-col gap-3 p-5" style={{ borderBottom: '1px solid var(--color-brand-border)' }}>
            {PASSOS.map((p) => (
              <StepIndicator key={p.numero} passo={p} atual={passo} />
            ))}
          </div>

          {/* Instrução do passo atual */}
          <div className="flex flex-col gap-4 p-5 flex-1">
            <h3
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 16,
                fontWeight: 700,
                color: 'var(--color-brand-dark-green)',
                lineHeight: 1.25,
              }}
            >
              {instrucao.titulo}
            </h3>
            <div className="flex flex-col gap-3">
              {instrucao.corpo.map((p, i) => (
                <p key={i} style={{ fontSize: 13, lineHeight: 1.65, color: 'var(--color-brand-gray)' }}>
                  {p}
                </p>
              ))}
            </div>
            <div
              className="rounded-xl p-3"
              style={{ background: 'rgba(224,165,95,0.1)', border: '1px solid rgba(224,165,95,0.25)' }}
            >
              <p style={{ fontSize: 12, color: '#a0692d', lineHeight: 1.6 }}>
                {instrucao.dica}
              </p>
            </div>
          </div>

          {/* Botão Continuar */}
          <div className="p-5" style={{ borderTop: '1px solid var(--color-brand-border)' }}>
            {isUltimoPasso ? (
              <a
                href="/ferramentas"
                className="btn-gold w-full text-center"
                style={{ display: 'flex', justifyContent: 'center', borderRadius: 10, padding: '12px 16px', textDecoration: 'none' }}
              >
                Ver outras ferramentas →
              </a>
            ) : (
              <button
                onClick={() => setPasso((p) => Math.min(3, p + 1) as Passo)}
                className="btn-primary w-full"
                style={{ borderRadius: 10, padding: '12px 16px', justifyContent: 'center' }}
              >
                {passo === 0 ? 'Começar avaliação →' : passo === 1 ? 'Ver meu resultado →' : 'Ver próximos passos →'}
              </button>
            )}
            {passo > 0 && (
              <button
                onClick={() => setPasso((p) => Math.max(0, p - 1) as Passo)}
                className="w-full mt-2 text-sm transition-opacity hover:opacity-70"
                style={{ color: 'var(--color-brand-gray)', background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}
              >
                ← Voltar
              </button>
            )}
          </div>
        </aside>

        {/* ── Coluna central: sliders ────────────────────────────────── */}
        <main
          className="flex-1 overflow-y-auto p-6"
          style={{ background: '#f7f5ee', minWidth: 0 }}
        >
          <div className="max-w-xl mx-auto flex flex-col gap-2">
            <div className="mb-4">
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 700, color: 'var(--color-brand-dark-green)' }}>
                Avalie cada área da sua vida
              </h2>
              <p style={{ fontSize: 13, color: 'var(--color-brand-gray)', marginTop: 4 }}>
                Arraste os sliders para refletir como você se sente hoje. Seja honesto.
              </p>
            </div>

            <div className="flex flex-col gap-6">
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
            </div>

            {/* Resumo inline */}
            <div
              className="rounded-2xl p-5 mt-2 flex items-center justify-between gap-4"
              style={{ background: '#1E392A' }}
            >
              <div>
                <p style={{ fontSize: 12, color: 'rgba(244,241,222,0.6)', marginBottom: 4 }}>Índice de Equilíbrio</p>
                <p style={{ fontFamily: 'var(--font-heading)', fontSize: 28, fontWeight: 700, color: equilibrio.cor, lineHeight: 1 }}>
                  {media.toFixed(1)}<span style={{ fontSize: 14, color: 'rgba(244,241,222,0.4)' }}>/10</span>
                </p>
              </div>
              <div className="text-right">
                <p style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700, color: equilibrio.cor }}>
                  {equilibrio.label}
                </p>
                <p style={{ fontSize: 11, color: 'rgba(244,241,222,0.5)', marginTop: 2 }}>
                  Baseado nas suas respostas
                </p>
              </div>
            </div>
          </div>
        </main>

        {/* ── Coluna direita: radar ──────────────────────────────────── */}
        <aside
          className="flex-shrink-0 flex flex-col overflow-y-auto"
          style={{
            width: 320,
            background: '#fff',
            borderLeft: '1px solid var(--color-brand-border)',
          }}
        >
          {/* Header */}
          <div className="p-5" style={{ borderBottom: '1px solid var(--color-brand-border)' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 700, color: 'var(--color-brand-dark-green)' }}>
              Seu Mapa de Vida
            </h3>
            <p style={{ fontSize: 12, color: 'var(--color-brand-gray)', marginTop: 2 }}>
              Atualiza em tempo real
            </p>
          </div>

          {/* Radar */}
          <div className="p-4 flex items-center justify-center">
            <Radar data={chartData} options={chartOptions} />
          </div>

          {/* Índice de equilíbrio */}
          <div
            className="mx-4 rounded-2xl p-4 flex items-center gap-4"
            style={{ background: 'rgba(30,57,42,0.04)', border: '1px solid var(--color-brand-border)' }}
          >
            {/* Círculo SVG */}
            <div className="relative flex-shrink-0">
              {(() => {
                const r = 28;
                const c = 2 * Math.PI * r;
                const offset = c * (1 - media / 10);
                return (
                  <svg width="68" height="68" viewBox="0 0 68 68">
                    <circle cx="34" cy="34" r={r} fill="none" stroke="rgba(30,57,42,0.08)" strokeWidth="6" />
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
                    <text x="34" y="38" textAnchor="middle" style={{ fontSize: 14, fontWeight: 700, fill: '#1E392A', fontFamily: 'DM Sans' }}>
                      {media.toFixed(1)}
                    </text>
                  </svg>
                );
              })()}
            </div>
            <div>
              <p style={{ fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 700, color: equilibrio.cor }}>
                {equilibrio.label}
              </p>
              <p style={{ fontSize: 11, color: 'var(--color-brand-gray)', lineHeight: 1.5, marginTop: 2 }}>
                Índice de equilíbrio<br />baseado nas 8 áreas
              </p>
            </div>
          </div>

          {/* Lista de notas por área */}
          <div className="flex flex-col gap-1 p-4 mt-2">
            <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-brand-gray)', marginBottom: 6 }}>
              Notas por área
            </p>
            {AREAS.map((area, i) => (
              <div key={area.label} className="flex items-center gap-2">
                <span style={{ fontSize: 14, flexShrink: 0 }}>{area.emoji}</span>
                <div className="flex-1 rounded-full overflow-hidden" style={{ height: 4, background: 'rgba(30,57,42,0.08)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${(valores[i] / 10) * 100}%`, background: area.cor }}
                  />
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: scoreColor(valores[i]), minWidth: 16, textAlign: 'right' }}>
                  {valores[i]}
                </span>
              </div>
            ))}
          </div>

          {/* Área mais fraca */}
          {(() => {
            const minIdx = valores.indexOf(Math.min(...valores));
            const maxIdx = valores.indexOf(Math.max(...valores));
            return (
              <div className="flex flex-col gap-2 px-4 pb-4">
                <div className="rounded-xl p-3" style={{ background: 'rgba(192,57,43,0.06)', border: '1px solid rgba(192,57,43,0.15)' }}>
                  <p style={{ fontSize: 11, color: '#C0392B', fontWeight: 600 }}>
                    ⚠ Foco recomendado
                  </p>
                  <p style={{ fontSize: 13, color: 'var(--color-brand-dark-green)', marginTop: 2 }}>
                    {AREAS[minIdx].emoji} {AREAS[minIdx].label} — nota {valores[minIdx]}
                  </p>
                </div>
                <div className="rounded-xl p-3" style={{ background: 'rgba(39,174,96,0.06)', border: '1px solid rgba(39,174,96,0.15)' }}>
                  <p style={{ fontSize: 11, color: '#27AE60', fontWeight: 600 }}>
                    ✦ Ponto forte
                  </p>
                  <p style={{ fontSize: 13, color: 'var(--color-brand-dark-green)', marginTop: 2 }}>
                    {AREAS[maxIdx].emoji} {AREAS[maxIdx].label} — nota {valores[maxIdx]}
                  </p>
                </div>
              </div>
            );
          })()}
        </aside>
      </div>
    </div>
  );
}
