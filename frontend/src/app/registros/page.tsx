'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useSupabaseClient } from '@/lib/useSupabaseClient';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from 'chart.js';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import type { DiarioKairos } from '@/lib/database.types';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

// ─── Design tokens ────────────────────────────────────────────────────────────

const GOLD  = '#C8A030';
const DARK  = '#0E0E0E';
const CARD  = '#1A1A1A';
const CREAM = '#F5F0E8';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const EMOCAO_EMOJI: Record<string, string> = {
  animado:   '😄',
  focado:    '🎯',
  grato:     '🙏',
  cansado:   '😴',
  ansioso:   '😰',
  tranquilo: '😌',
};

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const STOP_WORDS = new Set([
  'a','ao','aos','as','com','da','das','de','do','dos','e','em','eu','foi',
  'na','nas','no','nos','o','os','para','por','que','se','um','uma','já',
  'mais','mas','não','hoje','meu','minha','me','muito','bem','dia','isso',
  'mim','tive','fazer','fiz','ser','ter','tem','um','uns','sua','seu','foi',
  'esta','está','isso','esse','essa','eles','ela','ele','como','mas','ou',
  'quando','muito','há','nem','tão','qual','pois','então','assim','sobre',
  'até','só','ainda','também','lá','aqui','fui','era','eram','este','esses',
]);

function palavrasMaisFrequentes(historico: Partial<DiarioKairos>[], top = 1): string[] {
  const texto = historico
    .flatMap(h => [h.preocupacao, h.gratidao, h.conquista, h.aprendizado])
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
    .replace(/[^a-záàâãéèêíïóôõöúüçñ\s]/gi, ' ');

  const freq: Record<string, number> = {};
  texto.split(/\s+/).forEach(w => {
    if (w.length > 3 && !STOP_WORDS.has(w)) freq[w] = (freq[w] ?? 0) + 1;
  });

  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, top)
    .map(([w]) => w);
}

function calcularStreakMaximo(hist: Partial<DiarioKairos>[]): number {
  const datas = hist.map(h => h.data).filter(Boolean).sort() as string[];
  if (!datas.length) return 0;
  let max = 1, cur = 1;
  for (let i = 1; i < datas.length; i++) {
    const prev = new Date(datas[i - 1]);
    const curr = new Date(datas[i]);
    const diff = (curr.getTime() - prev.getTime()) / 86400000;
    if (diff === 1) { cur++; max = Math.max(max, cur); }
    else cur = 1;
  }
  return max;
}

function calcularStreakAtual(hist: Partial<DiarioKairos>[]): number {
  const datas = hist.map(h => h.data).filter(Boolean).sort((a, b) => b!.localeCompare(a!)) as string[];
  let streak = 0;
  const base = new Date();
  for (let i = 0; i < datas.length; i++) {
    const esp = new Date(base);
    esp.setDate(base.getDate() - i);
    if (datas[i] === esp.toISOString().split('T')[0]) streak++;
    else break;
  }
  return streak;
}

function ensinamento(emocaoDominante: string | null, mediaNota: number | null): { titulo: string; texto: string } {
  if (emocaoDominante === 'cansado' || emocaoDominante === 'ansioso') {
    return {
      titulo: '💤 Sobre energia e descanso',
      texto: 'Seu corpo está enviando um sinal importante. O descanso não é fraqueza — é a base da transformação sustentável. Reserve espaços para recuperação antes de exigir mais de si.',
    };
  }
  if (mediaNota !== null && mediaNota <= 2.5) {
    return {
      titulo: '🤍 Sobre autocompaixão',
      texto: 'Dias difíceis fazem parte da jornada. Tratar-se com gentileza nos momentos de baixa é uma forma de força, não de rendição. O que você diria a um amigo próximo que está passando pelo mesmo?',
    };
  }
  if (emocaoDominante === 'grato' || emocaoDominante === 'animado') {
    return {
      titulo: '✨ Sobre ampliar o que funciona',
      texto: 'Você está num ciclo positivo. Anote o que está contribuindo para esse estado — rotina, pessoas, atividades — e proteja esses elementos como prioridades na sua agenda.',
    };
  }
  if (emocaoDominante === 'focado') {
    return {
      titulo: '🎯 Sobre momentum',
      texto: 'O foco é um recurso renovável quando alimentado pela missão certa. Aproveite esse estado para avançar nas suas ferramentas e ancorar hábitos que vão sustentar esse estado.',
    };
  }
  return {
    titulo: '🧭 Sobre consistência',
    texto: 'Cada registro é um voto para a versão de você que você quer se tornar. A consistência supera a intensidade — aparecer todos os dias, mesmo nos dias ordinários, é o que cria resultados extraordinários.',
  };
}

// ─── Tipos internos ───────────────────────────────────────────────────────────

type Marco = {
  id: string;
  titulo: string;
  descricao: string;
  data: string | null;
  conquistado: boolean;
  emoji: string;
};

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function Tabs({
  aba,
  onChange,
}: {
  aba: 'diario' | 'padroes' | 'jornada';
  onChange: (a: 'diario' | 'padroes' | 'jornada') => void;
}) {
  const tabs: { id: 'diario' | 'padroes' | 'jornada'; label: string; emoji: string }[] = [
    { id: 'diario',  label: 'Diário',   emoji: '📔' },
    { id: 'padroes', label: 'Padrões',  emoji: '📊' },
    { id: 'jornada', label: 'Jornada',  emoji: '🏆' },
  ];
  return (
    <div style={{
      display: 'flex', gap: 4, background: CARD, borderRadius: 14,
      padding: 5, border: `1px solid rgba(200,160,48,0.14)`,
    }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)}
          style={{
            flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', cursor: 'pointer',
            fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: aba === t.id ? 700 : 400,
            background: aba === t.id ? GOLD : 'transparent',
            color: aba === t.id ? DARK : 'rgba(245,240,232,0.45)',
            transition: 'all 0.2s',
          }}>
          {t.emoji} {t.label}
        </button>
      ))}
    </div>
  );
}

// ── Aba Diário ────────────────────────────────────────────────────────────────

function CardDia({ entry, data }: { entry: Partial<DiarioKairos> | null; data: string }) {
  const [aberto, setAberto] = useState(false);
  const temRegistro = entry !== null;

  const dataObj = new Date(data + 'T12:00:00');
  const dataFormatada = dataObj.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

  if (!temRegistro) {
    return (
      <div style={{
        background: CARD, borderRadius: 12, padding: '14px 18px',
        border: '1px solid rgba(255,255,255,0.04)',
        display: 'flex', alignItems: 'center', gap: 12, opacity: 0.45,
      }}>
        <span style={{ fontSize: 18 }}>○</span>
        <div>
          <p style={{ fontSize: 13, color: 'rgba(245,240,232,0.5)', margin: 0, textTransform: 'capitalize' }}>{dataFormatada}</p>
          <p style={{ fontSize: 11, color: 'rgba(245,240,232,0.3)', margin: '2px 0 0' }}>Dia não registrado</p>
        </div>
      </div>
    );
  }

  const emocaoEmoji = entry!.emocao ? (EMOCAO_EMOJI[entry!.emocao] ?? '😶') : null;
  const nota = entry!.nota_dia ?? entry!.qualidade_sono ?? null;

  return (
    <div style={{
      background: CARD, borderRadius: 12,
      border: `1px solid ${aberto ? 'rgba(200,160,48,0.35)' : 'rgba(200,160,48,0.12)'}`,
      overflow: 'hidden', transition: 'border-color 0.2s',
    }}>
      {/* Header colapsado */}
      <button onClick={() => setAberto(v => !v)}
        style={{
          width: '100%', background: 'none', border: 'none', cursor: 'pointer',
          padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left',
        }}>
        {/* Ponto dourado */}
        <span style={{
          width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
          background: GOLD, boxShadow: `0 0 6px rgba(200,160,48,0.5)`,
        }} />
        {/* Data */}
        <p style={{ flex: 1, fontSize: 13, fontWeight: 600, color: CREAM, margin: 0, textTransform: 'capitalize' }}>
          {dataFormatada}
        </p>
        {/* Emoção */}
        {emocaoEmoji && (
          <span style={{
            fontSize: 12, background: 'rgba(200,160,48,0.1)', border: '1px solid rgba(200,160,48,0.2)',
            borderRadius: 99, padding: '3px 10px', color: CREAM, display: 'flex', alignItems: 'center', gap: 4,
          }}>
            {emocaoEmoji} {entry!.emocao}
          </span>
        )}
        {/* Nota */}
        {nota && (
          <span style={{ fontSize: 12, color: GOLD, fontWeight: 700, minWidth: 32, textAlign: 'right' }}>
            {nota}/5
          </span>
        )}
        {/* Missão */}
        {entry!.missao_cumprida && (
          <span style={{ fontSize: 11, color: '#22c55e', fontWeight: 600 }}>✓ missão</span>
        )}
        {/* Chevron */}
        <span style={{
          fontSize: 10, color: 'rgba(245,240,232,0.3)',
          transform: aberto ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s',
        }}>▼</span>
      </button>

      {/* Conteúdo expandido */}
      {aberto && (
        <div style={{ padding: '0 18px 18px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 14 }}>

            {entry!.qualidade_sono && (
              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '10px 12px' }}>
                <p style={{ fontSize: 10, color: 'rgba(245,240,232,0.4)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Sono</p>
                <p style={{ fontSize: 16, fontWeight: 700, color: GOLD, margin: 0 }}>{entry!.qualidade_sono}/5 ⭐</p>
              </div>
            )}

            {entry!.energia_fim && (
              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '10px 12px' }}>
                <p style={{ fontSize: 10, color: 'rgba(245,240,232,0.4)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Energia</p>
                <p style={{ fontSize: 16, fontWeight: 700, color: GOLD, margin: 0 }}>{entry!.energia_fim}/5 ⚡</p>
              </div>
            )}

            {entry!.nota_dia && (
              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '10px 12px' }}>
                <p style={{ fontSize: 10, color: 'rgba(245,240,232,0.4)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Nota do dia</p>
                <p style={{ fontSize: 16, fontWeight: 700, color: GOLD, margin: 0 }}>{entry!.nota_dia}/5</p>
              </div>
            )}

            {entry!.missao_cumprida !== undefined && (
              <div style={{
                background: entry!.missao_cumprida ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.04)',
                border: entry!.missao_cumprida ? '1px solid rgba(34,197,94,0.2)' : 'none',
                borderRadius: 10, padding: '10px 12px',
              }}>
                <p style={{ fontSize: 10, color: 'rgba(245,240,232,0.4)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Missão</p>
                <p style={{ fontSize: 13, fontWeight: 700, color: entry!.missao_cumprida ? '#22c55e' : 'rgba(245,240,232,0.3)', margin: 0 }}>
                  {entry!.missao_cumprida ? '✓ Cumprida' : '— Não registrada'}
                </p>
              </div>
            )}
          </div>

          {entry!.gratidao && (
            <div style={{ marginTop: 10, background: 'rgba(200,160,48,0.06)', borderRadius: 10, padding: '12px 14px', borderLeft: `3px solid rgba(200,160,48,0.4)` }}>
              <p style={{ fontSize: 10, color: GOLD, margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600 }}>🙏 Gratidão</p>
              <p style={{ fontSize: 13, color: 'rgba(245,240,232,0.8)', margin: 0, lineHeight: 1.6, fontStyle: 'italic' }}>&ldquo;{entry!.gratidao}&rdquo;</p>
            </div>
          )}

          {entry!.preocupacao && (
            <div style={{ marginTop: 10, background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '12px 14px' }}>
              <p style={{ fontSize: 10, color: 'rgba(245,240,232,0.4)', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.12em' }}>O que pesava</p>
              <p style={{ fontSize: 13, color: 'rgba(245,240,232,0.7)', margin: 0, lineHeight: 1.6 }}>{entry!.preocupacao}</p>
            </div>
          )}

          {entry!.conquista && (
            <div style={{ marginTop: 10, background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '12px 14px' }}>
              <p style={{ fontSize: 10, color: 'rgba(245,240,232,0.4)', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.12em' }}>🏅 Conquista</p>
              <p style={{ fontSize: 13, color: 'rgba(245,240,232,0.7)', margin: 0, lineHeight: 1.6 }}>{entry!.conquista}</p>
            </div>
          )}

          {entry!.aprendizado && (
            <div style={{ marginTop: 10, background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '12px 14px' }}>
              <p style={{ fontSize: 10, color: 'rgba(245,240,232,0.4)', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.12em' }}>💡 Aprendizado</p>
              <p style={{ fontSize: 13, color: 'rgba(245,240,232,0.7)', margin: 0, lineHeight: 1.6 }}>{entry!.aprendizado}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AbaDiario({ historico }: { historico: Partial<DiarioKairos>[] }) {
  const dias = Array.from({ length: 30 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dataStr = d.toISOString().split('T')[0];
    const entry = historico.find(h => h.data === dataStr) ?? null;
    return { dataStr, entry };
  });

  const totalRegistros = dias.filter(d => d.entry !== null).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Resumo */}
      <div style={{
        background: CARD, borderRadius: 14, padding: '16px 20px',
        border: `1px solid rgba(200,160,48,0.18)`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <p style={{ fontSize: 12, color: 'rgba(245,240,232,0.45)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Últimos 30 dias</p>
          <p style={{ fontSize: 22, fontWeight: 700, color: GOLD, margin: 0 }}>
            {totalRegistros} <span style={{ fontSize: 14, fontWeight: 400, color: 'rgba(245,240,232,0.5)' }}>registros</span>
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: 12, color: 'rgba(245,240,232,0.45)', margin: '0 0 4px' }}>Consistência</p>
          <p style={{ fontSize: 22, fontWeight: 700, color: CREAM, margin: 0 }}>
            {Math.round((totalRegistros / 30) * 100)}%
          </p>
        </div>
      </div>

      {/* Timeline */}
      {dias.map(({ dataStr, entry }) => (
        <CardDia key={dataStr} data={dataStr} entry={entry} />
      ))}
    </div>
  );
}

// ── Aba Padrões ────────────────────────────────────────────────────────────────

function AbaPadroes({ historico }: { historico: Partial<DiarioKairos>[] }) {
  // Emoção dominante da semana (últimos 7 dias)
  const ultimos7 = historico.filter(h => {
    if (!h.data) return false;
    const limite = new Date();
    limite.setDate(limite.getDate() - 7);
    return new Date(h.data) >= limite;
  });
  const emocaoCount: Record<string, number> = {};
  ultimos7.forEach(h => { if (h.emocao) emocaoCount[h.emocao] = (emocaoCount[h.emocao] ?? 0) + 1; });
  const emocaoDominante = Object.entries(emocaoCount).sort((a, b) => b[1] - a[1])[0] ?? null;
  const emocaoPct = emocaoDominante && ultimos7.length > 0
    ? Math.round((emocaoDominante[1] / ultimos7.filter(h => h.emocao).length) * 100)
    : 0;

  // Palavra mais frequente
  const [palavraTop] = palavrasMaisFrequentes(historico, 1);

  // Gráfico últimos 14 dias — nota média (nota_dia ou qualidade_sono)
  const ultimos14 = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    const dataStr = d.toISOString().split('T')[0];
    const entry = historico.find(h => h.data === dataStr);
    const nota = entry?.nota_dia ?? null;
    return {
      label: d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      nota,
    };
  });

  const mediaNota14 = (() => {
    const vals = ultimos14.map(d => d.nota).filter((n): n is number => n !== null);
    return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
  })();

  const chartData = {
    labels: ultimos14.map(d => d.label),
    datasets: [
      {
        label: 'Nota do dia',
        data: ultimos14.map(d => d.nota),
        borderColor: GOLD,
        backgroundColor: 'rgba(200,160,48,0.08)',
        borderWidth: 2,
        pointBackgroundColor: GOLD,
        pointBorderColor: DARK,
        pointBorderWidth: 2,
        pointRadius: 4,
        fill: true,
        tension: 0.35,
        spanGaps: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1A1A1A',
        borderColor: 'rgba(200,160,48,0.3)',
        borderWidth: 1,
        titleColor: CREAM,
        bodyColor: GOLD,
        callbacks: {
          label: (ctx: { raw: unknown }) =>
            ctx.raw !== null ? `Nota: ${ctx.raw}/5` : 'Sem registro',
        },
      },
    },
    scales: {
      y: {
        min: 0, max: 5,
        ticks: { stepSize: 1, color: 'rgba(245,240,232,0.3)', font: { size: 10 } },
        grid: { color: 'rgba(255,255,255,0.05)' },
        border: { display: false },
      },
      x: {
        ticks: { color: 'rgba(245,240,232,0.3)', font: { size: 10 } },
        grid: { display: false },
        border: { display: false },
      },
    },
  };

  // Melhor e pior dia da semana (média histórica)
  const mediaPorDia: Record<number, number[]> = { 0:[], 1:[], 2:[], 3:[], 4:[], 5:[], 6:[] };
  historico.forEach(h => {
    if (!h.data || !h.nota_dia) return;
    const dow = new Date(h.data + 'T12:00:00').getDay();
    mediaPorDia[dow].push(h.nota_dia);
  });
  const mediasDia = Object.entries(mediaPorDia)
    .map(([dow, notas]) => ({
      dow: parseInt(dow),
      media: notas.length > 0 ? notas.reduce((a, b) => a + b, 0) / notas.length : null,
    }))
    .filter(d => d.media !== null)
    .sort((a, b) => (b.media! - a.media!));
  const melhorDia = mediasDia[0] ?? null;
  const piorDia   = mediasDia[mediasDia.length - 1] ?? null;

  // Ensinamento contextual
  const insight = ensinamento(emocaoDominante?.[0] ?? null, mediaNota14);

  const temDados = historico.length > 0;

  if (!temDados) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300, gap: 12 }}>
        <p style={{ fontSize: 28 }}>📊</p>
        <p style={{ fontSize: 16, fontWeight: 600, color: CREAM, margin: 0 }}>Sem registros ainda</p>
        <p style={{ fontSize: 13, color: 'rgba(245,240,232,0.45)', margin: 0, textAlign: 'center' }}>
          Registre seu diário por pelo menos 3 dias para ver seus padrões.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Emoção dominante + Palavra */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ background: CARD, borderRadius: 14, padding: '18px', border: `1px solid rgba(200,160,48,0.18)` }}>
          <p style={{ fontSize: 10, color: 'rgba(245,240,232,0.45)', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Emoção da semana</p>
          {emocaoDominante ? (
            <>
              <p style={{ fontSize: 28, margin: '0 0 4px' }}>{EMOCAO_EMOJI[emocaoDominante[0]] ?? '😶'}</p>
              <p style={{ fontSize: 16, fontWeight: 700, color: CREAM, margin: '0 0 4px', textTransform: 'capitalize' }}>{emocaoDominante[0]}</p>
              <p style={{ fontSize: 20, fontWeight: 800, color: GOLD, margin: 0 }}>{emocaoPct}%</p>
              <p style={{ fontSize: 11, color: 'rgba(245,240,232,0.35)', margin: '4px 0 0' }}>dos dias registrados</p>
            </>
          ) : (
            <p style={{ fontSize: 13, color: 'rgba(245,240,232,0.35)', margin: 0 }}>Sem dados suficientes</p>
          )}
        </div>

        <div style={{ background: CARD, borderRadius: 14, padding: '18px', border: `1px solid rgba(200,160,48,0.18)` }}>
          <p style={{ fontSize: 10, color: 'rgba(245,240,232,0.45)', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Palavra mais presente</p>
          {palavraTop ? (
            <>
              <p style={{ fontSize: 13, color: 'rgba(245,240,232,0.45)', margin: '0 0 8px' }}>Seus textos revelam:</p>
              <p style={{ fontSize: 22, fontWeight: 800, color: GOLD, margin: '0 0 6px', fontFamily: 'var(--font-heading)' }}>&ldquo;{palavraTop}&rdquo;</p>
              <p style={{ fontSize: 11, color: 'rgba(245,240,232,0.35)', margin: 0 }}>em gratidão, conquistas e reflexões</p>
            </>
          ) : (
            <p style={{ fontSize: 13, color: 'rgba(245,240,232,0.35)', margin: 0 }}>Escreva nos registros para ver</p>
          )}
        </div>
      </div>

      {/* Gráfico nota média */}
      <div style={{ background: CARD, borderRadius: 14, padding: '20px', border: `1px solid rgba(200,160,48,0.18)` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <p style={{ fontSize: 10, color: 'rgba(245,240,232,0.45)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Nota do dia — 14 dias</p>
            <p style={{ fontSize: 16, fontWeight: 600, color: CREAM, margin: 0 }}>Tendência recente</p>
          </div>
          {mediaNota14 !== null && (
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 11, color: 'rgba(245,240,232,0.35)', margin: '0 0 2px' }}>Média</p>
              <p style={{ fontSize: 22, fontWeight: 800, color: GOLD, margin: 0 }}>{mediaNota14.toFixed(1)}</p>
            </div>
          )}
        </div>
        <div style={{ height: 160, position: 'relative' }}>
          <Line data={chartData} options={chartOptions as Parameters<typeof Line>[0]['options']} />
        </div>
      </div>

      {/* Melhor e pior dia da semana */}
      {(melhorDia || piorDia) && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {melhorDia && (
            <div style={{ background: 'rgba(34,197,94,0.08)', borderRadius: 14, padding: '16px', border: '1px solid rgba(34,197,94,0.2)' }}>
              <p style={{ fontSize: 10, color: 'rgba(245,240,232,0.45)', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Melhor dia</p>
              <p style={{ fontSize: 22, fontWeight: 800, color: '#22c55e', margin: '0 0 4px' }}>
                {DIAS_SEMANA[melhorDia.dow]}
              </p>
              <p style={{ fontSize: 13, color: 'rgba(245,240,232,0.5)', margin: 0 }}>
                média {melhorDia.media!.toFixed(1)}/5
              </p>
            </div>
          )}
          {piorDia && piorDia.dow !== melhorDia?.dow && (
            <div style={{ background: 'rgba(239,68,68,0.06)', borderRadius: 14, padding: '16px', border: '1px solid rgba(239,68,68,0.15)' }}>
              <p style={{ fontSize: 10, color: 'rgba(245,240,232,0.45)', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Dia mais difícil</p>
              <p style={{ fontSize: 22, fontWeight: 800, color: '#ef4444', margin: '0 0 4px' }}>
                {DIAS_SEMANA[piorDia.dow]}
              </p>
              <p style={{ fontSize: 13, color: 'rgba(245,240,232,0.5)', margin: 0 }}>
                média {piorDia.media!.toFixed(1)}/5
              </p>
            </div>
          )}
        </div>
      )}

      {/* Ensinamento contextual */}
      <div style={{
        background: 'linear-gradient(135deg, #1a1200, #0E0E0E)',
        borderRadius: 14, padding: '20px 22px',
        border: `1.5px solid rgba(200,160,48,0.35)`,
        borderLeft: `4px solid ${GOLD}`,
      }}>
        <p style={{ fontSize: 10, color: GOLD, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700 }}>Ensinamento para você</p>
        <p style={{ fontSize: 15, fontWeight: 700, color: CREAM, margin: '0 0 10px' }}>{insight.titulo}</p>
        <p style={{ fontSize: 13, color: 'rgba(245,240,232,0.75)', margin: 0, lineHeight: 1.7 }}>{insight.texto}</p>
      </div>

    </div>
  );
}

// ── Aba Jornada ────────────────────────────────────────────────────────────────

function AbaJornada({
  historico,
  primeiraFerramentaData,
  visaoAncoraData,
  tempoUsoEmDias,
}: {
  historico: Partial<DiarioKairos>[];
  primeiraFerramentaData: string | null;
  visaoAncoraData: string | null;
  tempoUsoEmDias: number;
}) {
  const streakAtual = calcularStreakAtual(historico);
  const streakMaximo = calcularStreakMaximo(historico);

  // Primeira semana completa
  const primeiraSemanaData = (() => {
    if (streakMaximo < 7) return null;
    const datas = historico.map(h => h.data).filter(Boolean).sort() as string[];
    let cur = 1;
    for (let i = 1; i < datas.length; i++) {
      const prev = new Date(datas[i - 1]);
      const curr = new Date(datas[i]);
      if ((curr.getTime() - prev.getTime()) / 86400000 === 1) {
        cur++;
        if (cur >= 7) return datas[i];
      } else {
        cur = 1;
      }
    }
    return null;
  })();

  const marcos: Marco[] = [
    {
      id: 'inicio',
      emoji: '🌱',
      titulo: 'Início da jornada',
      descricao: 'Você deu o primeiro passo e criou sua conta.',
      data: historico.length > 0
        ? [...historico].sort((a, b) => (a.data ?? '').localeCompare(b.data ?? ''))[0].data ?? null
        : null,
      conquistado: historico.length > 0,
    },
    {
      id: 'primeira_semana',
      emoji: '🔥',
      titulo: 'Primeira semana completa',
      descricao: '7 dias consecutivos de registro no diário.',
      data: primeiraSemanaData,
      conquistado: primeiraSemanaData !== null,
    },
    {
      id: 'primeira_ferramenta',
      emoji: '🛠',
      titulo: 'Primeira ferramenta concluída',
      descricao: 'Você completou sua primeira ferramenta de transformação.',
      data: primeiraFerramentaData,
      conquistado: primeiraFerramentaData !== null,
    },
    {
      id: 'visao_ancora',
      emoji: '🧭',
      titulo: 'Visão Âncora criada',
      descricao: 'Você definiu a manchete da sua vida daqui a 1 ano.',
      data: visaoAncoraData,
      conquistado: visaoAncoraData !== null,
    },
    {
      id: 'streak_max',
      emoji: '⚡',
      titulo: `Recorde de sequência — ${streakMaximo} dias`,
      descricao: `Sua maior sequência de registros consecutivos.`,
      data: null,
      conquistado: streakMaximo >= 3,
    },
  ];

  const fraseMotivacional = (() => {
    if (tempoUsoEmDias < 7)  return 'Você está começando uma jornada que vai mudar tudo. Continue.';
    if (tempoUsoEmDias < 30) return `${tempoUsoEmDias} dias de jornada. O hábito está sendo formado — cada registro conta.`;
    if (tempoUsoEmDias < 90) return `Quase ${Math.round(tempoUsoEmDias / 30)} meses investindo em você. Isso é raro.`;
    return `Você está comprometido com sua transformação há ${Math.round(tempoUsoEmDias / 30)} meses. Isso diz muito sobre quem você está se tornando.`;
  })();

  const conquistados = marcos.filter(m => m.conquistado).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Banner de tempo */}
      <div style={{
        background: 'linear-gradient(135deg, #1a1200 0%, #0E0E0E 100%)',
        borderRadius: 16, padding: '22px 24px',
        border: `1.5px solid rgba(200,160,48,0.35)`,
        textAlign: 'center',
      }}>
        <p style={{ fontSize: 11, color: GOLD, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.18em', fontWeight: 700 }}>Sua jornada Kairos</p>
        <p style={{ fontSize: 32, fontWeight: 800, color: CREAM, margin: '0 0 8px', fontFamily: 'var(--font-heading)' }}>
          {tempoUsoEmDias} <span style={{ fontSize: 16, fontWeight: 400, color: 'rgba(245,240,232,0.5)' }}>dias</span>
        </p>
        <p style={{ fontSize: 13, color: 'rgba(245,240,232,0.65)', margin: '0 0 16px', lineHeight: 1.6 }}>{fraseMotivacional}</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24 }}>
          <div>
            <p style={{ fontSize: 20, fontWeight: 700, color: GOLD, margin: 0 }}>{streakAtual}</p>
            <p style={{ fontSize: 10, color: 'rgba(245,240,232,0.4)', margin: '2px 0 0' }}>streak atual</p>
          </div>
          <div style={{ width: 1, background: 'rgba(200,160,48,0.2)' }} />
          <div>
            <p style={{ fontSize: 20, fontWeight: 700, color: GOLD, margin: 0 }}>{streakMaximo}</p>
            <p style={{ fontSize: 10, color: 'rgba(245,240,232,0.4)', margin: '2px 0 0' }}>recorde</p>
          </div>
          <div style={{ width: 1, background: 'rgba(200,160,48,0.2)' }} />
          <div>
            <p style={{ fontSize: 20, fontWeight: 700, color: GOLD, margin: 0 }}>{conquistados}/{marcos.length}</p>
            <p style={{ fontSize: 10, color: 'rgba(245,240,232,0.4)', margin: '2px 0 0' }}>marcos</p>
          </div>
        </div>
      </div>

      {/* Linha do tempo vertical */}
      <div style={{ background: CARD, borderRadius: 16, padding: '24px', border: `1px solid rgba(200,160,48,0.14)` }}>
        <p style={{ fontSize: 11, color: 'rgba(245,240,232,0.45)', margin: '0 0 20px', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Marcos da jornada</p>

        <div style={{ position: 'relative', paddingLeft: 28 }}>
          {/* Linha vertical */}
          <div style={{
            position: 'absolute', left: 9, top: 12, bottom: 12,
            width: 2, background: 'rgba(200,160,48,0.15)', borderRadius: 1,
          }} />

          {marcos.map((marco, i) => (
            <div key={marco.id} style={{
              position: 'relative', marginBottom: i < marcos.length - 1 ? 24 : 0,
            }}>
              {/* Ponto na linha */}
              <div style={{
                position: 'absolute', left: -28, top: 2,
                width: 20, height: 20, borderRadius: '50%',
                background: marco.conquistado ? GOLD : 'rgba(255,255,255,0.06)',
                border: `2px solid ${marco.conquistado ? GOLD : 'rgba(255,255,255,0.1)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 9,
                boxShadow: marco.conquistado ? `0 0 12px rgba(200,160,48,0.4)` : 'none',
              }}>
                {marco.conquistado ? <span style={{ color: DARK, fontSize: 9, fontWeight: 900 }}>✓</span> : null}
              </div>

              {/* Conteúdo */}
              <div style={{ opacity: marco.conquistado ? 1 : 0.4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                  <span style={{ fontSize: 16 }}>{marco.emoji}</span>
                  <p style={{ fontSize: 14, fontWeight: marco.conquistado ? 700 : 500, color: marco.conquistado ? CREAM : 'rgba(245,240,232,0.5)', margin: 0 }}>
                    {marco.titulo}
                  </p>
                </div>
                <p style={{ fontSize: 12, color: 'rgba(245,240,232,0.45)', margin: '0 0 4px', lineHeight: 1.5 }}>
                  {marco.descricao}
                </p>
                {marco.data && (
                  <p style={{ fontSize: 11, color: GOLD, fontWeight: 600, margin: 0 }}>
                    {new Date(marco.data + 'T12:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                )}
                {!marco.conquistado && (
                  <p style={{ fontSize: 11, color: 'rgba(245,240,232,0.25)', margin: 0, fontStyle: 'italic' }}>Ainda não conquistado</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function RegistrosPage() {
  const { user } = useUser();
  const { getClient } = useSupabaseClient();

  const [aba, setAba] = useState<'diario' | 'padroes' | 'jornada'>('diario');
  const [historico, setHistorico] = useState<Partial<DiarioKairos>[]>([]);
  const [primeiraFerramentaData, setPrimeiraFerramentaData] = useState<string | null>(null);
  const [visaoAncoraData, setVisaoAncoraData] = useState<string | null>(null);
  const [tempoUsoEmDias, setTempoUsoEmDias] = useState(0);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      const client = await getClient();

      const [
        { data: hist },
        { data: ferramentas },
        { data: visao },
      ] = await Promise.all([
        client.from('diario_kairos').select('*').eq('user_id', user.id).order('data', { ascending: false }).limit(90),
        client.from('ferramentas_respostas').select('created_at, concluida').eq('user_id', user.id).eq('concluida', true).order('created_at', { ascending: true }).limit(1),
        client.from('visao_ancora').select('created_at').eq('user_id', user.id).order('created_at', { ascending: true }).limit(1),
      ]);

      if (hist) setHistorico(hist);

      if (ferramentas && ferramentas.length > 0) {
        setPrimeiraFerramentaData(ferramentas[0].created_at.split('T')[0]);
      }

      if (visao && visao.length > 0) {
        setVisaoAncoraData(visao[0].created_at.split('T')[0]);
      }

      // Tempo de uso: primeiro registro de diário ou ferramenta
      const datasIniciais: string[] = [];
      if (hist && hist.length > 0) {
        const mais_antigo = [...hist].sort((a, b) => (a.data ?? '').localeCompare(b.data ?? ''))[0];
        if (mais_antigo.data) datasIniciais.push(mais_antigo.data);
      }
      if (visao && visao.length > 0) datasIniciais.push(visao[0].created_at.split('T')[0]);
      if (datasIniciais.length > 0) {
        datasIniciais.sort();
        const inicio = new Date(datasIniciais[0] + 'T12:00:00');
        const hoje = new Date();
        setTempoUsoEmDias(Math.max(1, Math.floor((hoje.getTime() - inicio.getTime()) / 86400000)));
      } else {
        setTempoUsoEmDias(1);
      }

      setCarregando(false);
    })();
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <DashboardLayout>
      <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Header */}
        <div>
          <p style={{ fontSize: 11, color: GOLD, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.18em', margin: '0 0 6px' }}>
            Registros
          </p>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: CREAM, margin: '0 0 4px', fontFamily: 'var(--font-heading)' }}>
            Sua jornada em dados
          </h1>
          <p style={{ fontSize: 13, color: 'rgba(245,240,232,0.45)', margin: 0 }}>
            Diário, padrões e marcos da sua transformação pessoal.
          </p>
        </div>

        {/* Tabs */}
        <Tabs aba={aba} onChange={setAba} />

        {/* Loading */}
        {carregando ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[120, 80, 100].map((h, i) => (
              <div key={i} style={{ height: h, background: CARD, borderRadius: 14, border: `1px solid rgba(200,160,48,0.08)`, opacity: 0.6 }} />
            ))}
          </div>
        ) : (
          <>
            {aba === 'diario'  && <AbaDiario historico={historico} />}
            {aba === 'padroes' && <AbaPadroes historico={historico} />}
            {aba === 'jornada' && (
              <AbaJornada
                historico={historico}
                primeiraFerramentaData={primeiraFerramentaData}
                visaoAncoraData={visaoAncoraData}
                tempoUsoEmDias={tempoUsoEmDias}
              />
            )}
          </>
        )}

      </div>
    </DashboardLayout>
  );
}
