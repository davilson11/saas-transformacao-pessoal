'use client';

import { useState, useMemo, useEffect } from 'react';
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
import { useCarregarRespostas } from '@/lib/useCarregarRespostas';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip);

// ─── Tipos e constantes ───────────────────────────────────────────────────────

type Passo = 0 | 1 | 2 | 3;

type Area = {
  emoji: string;
  label: string;
  descricao: string;
  cor: string;
};

type Opcao = {
  label: string;
  score: number;
};

type AreaPergunta = {
  pergunta:  string;   // comportamental com âncora temporal
  subtexto?: string;   // exemplo ou contexto extra
  opcoes:    Opcao[];  // 5 opções → scores 2/4/6/8/10
};

type RespostaArea = {
  opcaoIdx:  number | null;  // índice da opção selecionada
  revelacao: string;          // "E o que isso revela sobre você?"
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

// Perguntas comportamentais com âncoras temporais (neurociência: o cérebro
// responde mais honestamente a comportamentos concretos do que a autoavaliações
// abstratas como "dê uma nota de 1 a 10").
const AREAS_PERGUNTAS: AreaPergunta[] = [
  {
    pergunta: "Nos últimos 7 dias, quantas vezes você fez algo intencional pelo seu corpo?",
    subtexto: "Ex: exercício, sono de qualidade, alimentação consciente, hidratação.",
    opcoes: [
      { label: "Nenhuma vez",          score: 2  },
      { label: "1–2 vezes",            score: 4  },
      { label: "3–4 vezes",            score: 6  },
      { label: "5–6 vezes",            score: 8  },
      { label: "Todos os dias",        score: 10 },
    ],
  },
  {
    pergunta: "Na última semana, com que frequência você manteve a clareza mental quando estava sob pressão?",
    subtexto: "Pense em momentos de estresse, conflito ou sobrecarga.",
    opcoes: [
      { label: "Quase nunca",          score: 2  },
      { label: "Raramente",            score: 4  },
      { label: "Às vezes",             score: 6  },
      { label: "Na maioria das vezes", score: 8  },
      { label: "Quase sempre",         score: 10 },
    ],
  },
  {
    pergunta: "Nos últimos 30 dias, você sabia exatamente quanto entrou, saiu e ficou nas suas finanças?",
    subtexto: "Considere seu nível de controle e intenção — não o valor em si.",
    opcoes: [
      { label: "Sem controle algum",       score: 2  },
      { label: "Ideia vaga, sem registro", score: 4  },
      { label: "Sei aproximadamente",      score: 6  },
      { label: "Tenho registro e metas",   score: 8  },
      { label: "Controle total e reserva", score: 10 },
    ],
  },
  {
    pergunta: "No último mês, com que frequência você terminou o dia sentindo que contribuiu com algo que importa de verdade?",
    subtexto: "Não sobre produtividade — sobre propósito e significado.",
    opcoes: [
      { label: "Raramente ou nunca",        score: 2  },
      { label: "1–2 dias no mês",           score: 4  },
      { label: "Algumas semanas",           score: 6  },
      { label: "Maioria das semanas",       score: 8  },
      { label: "Quase todos os dias",       score: 10 },
    ],
  },
  {
    pergunta: "Na última semana, você teve pelo menos uma conversa genuína — não superficial — com alguém que importa para você?",
    subtexto: "Conversa genuína: onde você ou o outro se sentiu visto de verdade.",
    opcoes: [
      { label: "Nenhuma",                        score: 2  },
      { label: "Tentei, ficou superficial",       score: 4  },
      { label: "Uma conversa razoável",           score: 6  },
      { label: "2–3 conversas de qualidade",      score: 8  },
      { label: "Me sinto profundamente conectado(a)", score: 10 },
    ],
  },
  {
    pergunta: "Nos últimos 7 dias, você fez algo apenas pelo prazer de fazer — sem nenhum objetivo de produtividade envolvido?",
    subtexto: "Lazer real: algo que você faria mesmo sem audiência e sem resultado.",
    opcoes: [
      { label: "Não, não tive tempo",             score: 2  },
      { label: "Tentei, mas me senti culpado(a)", score: 4  },
      { label: "Algo pequeno e passageiro",       score: 6  },
      { label: "Tive momentos genuínos",          score: 8  },
      { label: "Me sinto recarregado(a)",         score: 10 },
    ],
  },
  {
    pergunta: "No último mês, você aprendeu algo novo de forma intencional — livro, curso, mentor ou prática deliberada?",
    subtexto: "Intencional = com foco, não aprendizado acidental por acaso.",
    opcoes: [
      { label: "Nada de forma intencional", score: 2  },
      { label: "Comecei, não mantive",      score: 4  },
      { label: "Estudei ocasionalmente",    score: 6  },
      { label: "Tenho rotina de estudo",    score: 8  },
      { label: "Estou em sprint intenso",   score: 10 },
    ],
  },
  {
    pergunta: "Na última semana, você dedicou tempo a algo maior que você mesmo — gratidão, meditação, oração ou serviço ao próximo?",
    subtexto: "Qualquer prática que te conecte com o todo, com sentido ou com transcendência.",
    opcoes: [
      { label: "Não faz parte da minha rotina",  score: 2  },
      { label: "Pensei nisso, mas não pratiquei", score: 4  },
      { label: "1–2 momentos de conexão",         score: 6  },
      { label: "Pratiquei regularmente",          score: 8  },
      { label: "É parte central da minha vida",   score: 10 },
    ],
  },
];

const ETAPAS = [
  { label: 'Bem-vindo',             descricao: 'Introdução à ferramenta' },
  { label: 'Avalie as Áreas',       descricao: 'Responda com honestidade comportamental' },
  { label: 'Visualize o Resultado', descricao: 'Interprete seu mapa de vida' },
  { label: 'Próximos Passos',       descricao: 'Defina onde focar agora' },
];

const INSTRUCOES = [
  {
    titulo: 'Bem-vindo ao Raio-X 360°',
    corpo: [
      'Esta é sua primeira e mais importante ferramenta. Ela revela com honestidade onde você está hoje — sem julgamentos.',
      'Em vez de notas abstratas, você vai responder perguntas comportamentais com âncoras temporais reais. A neurociência mostra que o cérebro é mais honesto quando pensa em comportamentos concretos do que em autoavaliações genéricas.',
      'Para cada área da vida, selecione a opção que melhor descreve seus últimos 7 a 30 dias. Depois, reflita brevemente sobre o que isso revela.',
    ],
    dica: '💡 Reserve 20 minutos tranquilos. Confie no seu primeiro instinto — a intuição costuma ser mais honesta que a razão.',
  },
  {
    titulo: 'Perguntas comportamentais',
    corpo: [
      'Cada pergunta tem uma âncora temporal — "nos últimos 7 dias", "no último mês" — para ativar memórias concretas, não impressões vagas.',
      'Selecione a opção que melhor descreve o que você realmente fez (não o que queria ter feito). Sem julgamento.',
      'Após selecionar, responda brevemente: "E o que isso revela sobre você?" — essa reflexão é o que transforma dado em autoconhecimento.',
    ],
    dica: '💡 Não pule a pergunta de revelação. Ela é onde o insight acontece.',
  },
  {
    titulo: 'Seu Raio-X está pronto',
    corpo: [
      'O gráfico à direita mostra o mapa atual da sua vida. Áreas mais próximas do centro precisam de mais atenção.',
      'O Índice de Equilíbrio é a média das suas respostas. Mas atenção: não é sobre ter notas altas em tudo — é sobre equilíbrio.',
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

function scoreFromIdx(idx: number | null, opcoes: Opcao[]): number {
  if (idx === null) return 5;
  return opcoes[idx]?.score ?? 5;
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function PerguntaArea({
  area,
  pergunta,
  subtexto,
  opcoes,
  resposta,
  onChange,
}: {
  area:      Area;
  pergunta:  string;
  subtexto?: string;
  opcoes:    Opcao[];
  resposta:  RespostaArea;
  onChange:  (r: RespostaArea) => void;
}) {
  const score         = scoreFromIdx(resposta.opcaoIdx, opcoes);
  const selecionada   = resposta.opcaoIdx !== null;

  return (
    <div
      className="flex flex-col gap-4 rounded-2xl p-5"
      style={{
        background: '#fff',
        border: `1.5px solid ${selecionada ? area.cor + '40' : 'var(--color-brand-border)'}`,
        boxShadow: 'var(--shadow-card)',
        transition: 'border-color 0.2s',
      }}
    >
      {/* Header da área */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span style={{ fontSize: 18, flexShrink: 0 }}>{area.emoji}</span>
          <p style={{ fontSize: 15, fontWeight: 700, color: COR_PRIMARY, fontFamily: 'var(--font-body)', lineHeight: 1.2 }}>
            {area.label}
          </p>
        </div>
        {selecionada && (
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 16,
              fontWeight: 700,
              color: scoreColor(score),
              background: `${scoreColor(score)}12`,
              border: `1px solid ${scoreColor(score)}30`,
              borderRadius: 99,
              padding: '2px 10px',
              flexShrink: 0,
            }}
          >
            {score}/10
          </span>
        )}
      </div>

      {/* Pergunta comportamental */}
      <div>
        <p style={{ fontSize: 15, fontWeight: 600, color: COR_PRIMARY, lineHeight: 1.5, marginBottom: subtexto ? 4 : 0 }}>
          {pergunta}
        </p>
        {subtexto && (
          <p style={{ fontSize: 13, color: 'var(--color-brand-gray)', lineHeight: 1.4, fontStyle: 'italic' }}>
            {subtexto}
          </p>
        )}
      </div>

      {/* Opções */}
      <div className="flex flex-col gap-2">
        {opcoes.map((op, i) => {
          const ativo = resposta.opcaoIdx === i;
          return (
            <button
              key={i}
              onClick={() => onChange({ ...resposta, opcaoIdx: i })}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                textAlign: 'left',
                padding: '9px 14px',
                borderRadius: 10,
                border: `1.5px solid ${ativo ? area.cor : 'rgba(26,92,58,0.14)'}`,
                background: ativo ? `${area.cor}10` : 'transparent',
                cursor: 'pointer',
                transition: 'all 0.15s',
                fontFamily: 'var(--font-body)',
                fontSize: 14,
                color: ativo ? area.cor : 'var(--color-brand-gray)',
                fontWeight: ativo ? 700 : 400,
              }}
            >
              {/* Bolinha de rádio */}
              <span
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  border: `2px solid ${ativo ? area.cor : 'rgba(26,92,58,0.25)'}`,
                  background: ativo ? area.cor : 'transparent',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s',
                }}
              >
                {ativo && (
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff', display: 'block' }} />
                )}
              </span>
              {op.label}
              {ativo && (
                <span
                  style={{
                    marginLeft: 'auto',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    color: area.cor,
                    fontWeight: 700,
                  }}
                >
                  {op.score}/10
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Revelação — aparece após selecionar */}
      {selecionada && (
        <div className="flex flex-col gap-2">
          <p style={{ fontSize: 13, fontWeight: 700, color: COR_GOLD, letterSpacing: '0.04em' }}>
            💡 E o que isso revela sobre você?
          </p>
          <textarea
            value={resposta.revelacao}
            onChange={(e) => onChange({ ...resposta, revelacao: e.target.value })}
            placeholder="Escreva livremente — sem julgamento. Essa reflexão é só sua."
            rows={2}
            style={{
              width: '100%',
              resize: 'vertical',
              borderRadius: 10,
              border: `1.5px solid ${COR_GOLD}33`,
              background: `${COR_GOLD}06`,
              color: COR_PRIMARY,
              fontFamily: 'var(--font-body)',
              fontSize: 14,
              lineHeight: 1.6,
              padding: '10px 12px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
            onFocus={(e) => { e.target.style.borderColor = COR_GOLD; e.target.style.boxShadow = `0 0 0 3px ${COR_GOLD}18`; }}
            onBlur={(e)  => { e.target.style.borderColor = `${COR_GOLD}33`; e.target.style.boxShadow = 'none'; }}
          />
        </div>
      )}
    </div>
  );
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function RaioXPage() {
  const [passo,     setPasso]     = useState<Passo>(0);
  const [respostas, setRespostas] = useState<RespostaArea[]>(
    AREAS.map(() => ({ opcaoIdx: null, revelacao: '' }))
  );

  const { dados: dadosSalvos } = useCarregarRespostas("raio-x");
  useEffect(() => {
    if (!dadosSalvos) return;
    const d = dadosSalvos as Record<string, unknown>;
    // Formato novo
    if (Array.isArray(d.respostas)) {
      setRespostas(d.respostas as RespostaArea[]);
    // Formato legado (só valores numéricos)
    } else if (Array.isArray(d.valores)) {
      const legado = d.valores as number[];
      setRespostas(
        AREAS.map((_, i) => {
          const score    = legado[i] ?? 5;
          const opcoes   = AREAS_PERGUNTAS[i].opcoes;
          // Aproxima o score legado ao índice de opção mais próximo
          const opcaoIdx = opcoes.reduce((best, op, j) =>
            Math.abs(op.score - score) < Math.abs(opcoes[best].score - score) ? j : best, 0);
          return { opcaoIdx, revelacao: '' };
        })
      );
    }
  }, [dadosSalvos]);

  // valores derivados para o radar e cálculos
  const valores = useMemo(
    () => respostas.map((r, i) => scoreFromIdx(r.opcaoIdx, AREAS_PERGUNTAS[i].opcoes)),
    [respostas]
  );

  const media      = useMemo(() => valores.reduce((s, v) => s + v, 0) / valores.length, [valores]);
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
          padding: 10,
          color: COR_PRIMARY,
          font: { size: 9, weight: 'bold' as const, family: 'Inter' },
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

  const respondidas = respostas.filter((r) => r.opcaoIdx !== null).length;

  const labelAvancar =
    passo === 0 ? 'Começar avaliação →'
    : passo === 1 ? 'Ver meu resultado →'
    : passo === 2 ? 'Ver próximos passos →'
    : 'Salvar Raio-X ✓';

  // ── Painel direito ──
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
      descricao="Diagnóstico comportamental das 8 áreas da sua vida com âncoras temporais para máxima honestidade."
      etapas={ETAPAS}
      etapaAtual={passo}
      progresso={progresso}
      onAvancar={() => setPasso((p) => Math.min(3, p + 1) as Passo)}
      onVoltar={() => setPasso((p) => Math.max(0, p - 1) as Passo)}
      podeAvancar
      labelAvancar={labelAvancar}
      resumo={painelResumo}
      respostas={{ respostas, valores }}
    >
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
              { emoji: '🧠', titulo: 'Perguntas comportamentais', desc: 'Âncoras temporais reais — não notas abstratas.' },
              { emoji: '📊', titulo: 'Gráfico radar',             desc: 'Visualize seu equilíbrio de forma intuitiva.' },
              { emoji: '💡', titulo: 'Revelação guiada',          desc: '"E o que isso revela sobre você?" por área.' },
              { emoji: '🔄', titulo: 'Revisão mensal',            desc: 'Acompanhe sua evolução ao longo do tempo.' },
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

        {/* Passos 1, 2, 3 — Perguntas comportamentais */}
        {passo >= 1 && (
          <div className="max-w-xl mx-auto flex flex-col gap-4">
            {passo === 1 && (
              <div
                className="flex items-center justify-between gap-3 rounded-xl p-3"
                style={{ background: `${COR_PRIMARY}08`, border: `1px solid ${COR_PRIMARY}18` }}
              >
                <p style={{ fontSize: 14, color: 'var(--color-brand-gray)' }}>
                  Selecione a opção que mais se aproxima do que você realmente viveu.
                </p>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 13,
                    fontWeight: 700,
                    color: respondidas === 8 ? '#1e8a4c' : COR_GOLD,
                    flexShrink: 0,
                  }}
                >
                  {respondidas}/8
                </span>
              </div>
            )}

            {AREAS.map((area, i) => (
              <PerguntaArea
                key={area.label}
                area={area}
                pergunta={AREAS_PERGUNTAS[i].pergunta}
                subtexto={AREAS_PERGUNTAS[i].subtexto}
                opcoes={AREAS_PERGUNTAS[i].opcoes}
                resposta={respostas[i]}
                onChange={(r) =>
                  setRespostas((prev) => prev.map((x, j) => (j === i ? r : x)))
                }
              />
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
                  {respondidas === 8 ? 'Todas as áreas respondidas' : `${respondidas} de 8 áreas respondidas`}
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
