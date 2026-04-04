'use client';

import { useState, useEffect } from 'react';
import FerramentaLayout from '@/components/dashboard/FerramentaLayout';
import { useCarregarRespostas } from '@/lib/useCarregarRespostas';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Classificacao = 'produtivo' | 'essencial' | 'necessario' | 'ladrao';

type ItemInventario = { horasDia: string; classificacao: Classificacao };

type Inventario = {
  sono: ItemInventario;        refeicoes: ItemInventario;  trabalho: ItemInventario;
  estudo: ItemInventario;      exercicio: ItemInventario;  deslocamento: ItemInventario;
  familia: ItemInventario;     redesSociais: ItemInventario; tv: ItemInventario;
  lazer: ItemInventario;       improdutivo: ItemInventario;  outros: ItemInventario;
};

type ItemADE = { descricao: string; horas: string };

type MatrizADE = {
  eliminar: ItemADE;  delegar: ItemADE;  automatizar: ItemADE;
  otimizar: ItemADE;  aumentar: ItemADE;
};

type Reflexao = { surpresa: string; prioridade: string; compromisso: string };

// ─── Constantes ───────────────────────────────────────────────────────────────

const ETAPAS = [
  { label: 'Bem-vindo',    descricao: 'Introdução à ferramenta'      },
  { label: 'Inventário',   descricao: 'Mapeie como usa suas 168h'    },
  { label: 'Matriz ADE',   descricao: 'Automatizar, Delegar, Eliminar'},
  { label: 'Reflexão',     descricao: 'Perguntas poderosas'           },
];

const CLASSIFICACOES: Record<Classificacao, { label: string; cor: string; descricao: string }> = {
  produtivo:  { label: 'Produtivo',  cor: '#22c55e', descricao: 'Te aproxima dos seus objetivos'    },
  essencial:  { label: 'Essencial',  cor: '#3b82f6', descricao: 'Necessário para vida e saúde'     },
  necessario: { label: 'Necessário', cor: '#8b5cf6', descricao: 'Obrigações e compromissos'         },
  ladrao:     { label: 'Ladrão',     cor: '#ef4444', descricao: 'Consome tempo sem retorno real'    },
};

const ATIVIDADES_CONFIG: Array<{
  key: keyof Inventario;
  emoji: string;
  nome: string;
  descricao: string;
  classificacaoPadrao: Classificacao;
  sugestao: number;
}> = [
  { key: 'sono',         emoji: '😴', nome: 'Sono',           descricao: 'Horas dormindo por noite',           classificacaoPadrao: 'essencial',  sugestao: 7.5 },
  { key: 'refeicoes',    emoji: '🍽️', nome: 'Refeições',      descricao: 'Café, almoço, jantar e lanches',     classificacaoPadrao: 'essencial',  sugestao: 1.5 },
  { key: 'trabalho',     emoji: '💼', nome: 'Trabalho',        descricao: 'Horas de trabalho produtivo',        classificacaoPadrao: 'necessario', sugestao: 8   },
  { key: 'estudo',       emoji: '📚', nome: 'Estudo',          descricao: 'Aprendizado, cursos e leituras',     classificacaoPadrao: 'produtivo',  sugestao: 1   },
  { key: 'exercicio',    emoji: '🏃', nome: 'Exercício',       descricao: 'Treino, caminhada ou esporte',       classificacaoPadrao: 'essencial',  sugestao: 0.5 },
  { key: 'deslocamento', emoji: '🚗', nome: 'Deslocamento',    descricao: 'Transporte casa-trabalho e outros',  classificacaoPadrao: 'necessario', sugestao: 1   },
  { key: 'familia',      emoji: '👨‍👩‍👧', nome: 'Família',        descricao: 'Tempo com cônjuge, filhos, pais',   classificacaoPadrao: 'essencial',  sugestao: 2   },
  { key: 'redesSociais', emoji: '📱', nome: 'Redes Sociais',   descricao: 'Instagram, TikTok, WhatsApp etc.',   classificacaoPadrao: 'ladrao',     sugestao: 2   },
  { key: 'tv',           emoji: '📺', nome: 'TV / Streaming',  descricao: 'Filmes, séries e YouTube',           classificacaoPadrao: 'ladrao',     sugestao: 2   },
  { key: 'lazer',        emoji: '🎮', nome: 'Lazer',           descricao: 'Hobbies, diversão e descanso ativo', classificacaoPadrao: 'essencial',  sugestao: 1   },
  { key: 'improdutivo',  emoji: '😶', nome: 'Improdutivo',     descricao: 'Procrastinação e tempo perdido',     classificacaoPadrao: 'ladrao',     sugestao: 1   },
  { key: 'outros',       emoji: '📌', nome: 'Outros',          descricao: 'Tudo que não se encaixa acima',      classificacaoPadrao: 'necessario', sugestao: 1   },
];

const ADE_CONFIG: Array<{
  key: keyof MatrizADE;
  emoji: string;
  label: string;
  descricao: string;
  cor: string;
  placeholder: string;
}> = [
  { key: 'eliminar',    emoji: '🗑️', label: 'Eliminar',    cor: '#ef4444', descricao: 'O que vai tirar da sua vida agora?',          placeholder: 'Ex: Ver TV por 2h/dia, rolar o feed sem propósito, reuniões desnecessárias...' },
  { key: 'delegar',     emoji: '🤝', label: 'Delegar',     cor: '#f97316', descricao: 'O que pode ser feito por outra pessoa?',       placeholder: 'Ex: Tarefas administrativas, limpeza, compras repetitivas...' },
  { key: 'automatizar', emoji: '⚙️', label: 'Automatizar', cor: '#8b5cf6', descricao: 'O que pode rodar sem sua presença ativa?',     placeholder: 'Ex: Pagamentos, e-mails recorrentes, backups, relatórios...' },
  { key: 'otimizar',    emoji: '⚡', label: 'Otimizar',    cor: '#3b82f6', descricao: 'O que pode ser feito em menos tempo?',         placeholder: 'Ex: Reuniões de 1h → 30min, preparar refeições em lote, leitura em dobro...' },
  { key: 'aumentar',    emoji: '📈', label: 'Aumentar',    cor: '#22c55e', descricao: 'O que merece mais espaço na sua semana?',      placeholder: 'Ex: Exercício diário, estudo de 1h, tempo de qualidade com família...' },
];

const REFLEXAO_PERGUNTAS: Array<{
  key: keyof Reflexao;
  emoji: string;
  pergunta: string;
  placeholder: string;
}> = [
  {
    key: 'surpresa',
    emoji: '😮',
    pergunta: 'Qual atividade te surpreendeu mais em termos de tempo consumido?',
    placeholder: 'Ex: Percebi que passo quase 3h/dia no celular sem perceber — mais do que exercício, estudo e família somados. Isso nunca foi intencional.',
  },
  {
    key: 'prioridade',
    emoji: '🎯',
    pergunta: 'Se você tivesse 10 horas extras por semana, em que as investiria?',
    placeholder: 'Ex: Investiria 4h em estudo de produto, 3h em exercícios físicos e as 3h restantes em momentos de qualidade com a minha família.',
  },
  {
    key: 'compromisso',
    emoji: '✊',
    pergunta: 'Qual é o primeiro hábito que você vai mudar e qual o impacto esperado em 30 dias?',
    placeholder: 'Ex: Vou eliminar redes sociais antes das 9h e após as 21h. Em 30 dias, espero ter ~14h extras por semana para investir em estudo e exercício.',
  },
];

const INSTRUCOES = [
  {
    titulo: 'Bem-vindo à Auditoria de Tempo',
    corpo: [
      'Todos temos exatamente 168 horas por semana. A diferença entre quem avança e quem fica parado está em como essas horas são alocadas — não em ter mais tempo.',
      'Nesta ferramenta você vai mapear onde suas horas realmente vão, classificar cada atividade por tipo, e criar um plano concreto para recuperar tempo perdido.',
      'A maioria das pessoas descobre que perde entre 20h e 40h por semana em atividades que não refletem seus valores ou objetivos.',
    ],
    dica: '💡 Seja honesto(a). O valor da auditoria está na precisão — não nos números ideais que você gostaria de ter.',
  },
  {
    titulo: 'Como fazer o inventário',
    corpo: [
      'Para cada atividade, estime quantas horas por dia você dedica a ela em média. O total semanal é calculado automaticamente.',
      'Em seguida, classifique: Produtivo (te aproxima de objetivos), Essencial (necessário para vida), Necessário (obrigações), Ladrão (sem retorno real).',
      'O painel ao lado mostra a distribuição em tempo real. Você tem 168h — quanto sobra depois de mapear tudo?',
    ],
    dica: '💡 Não se preocupe em ser perfeito. Uma estimativa honesta vale mais do que dados exatos que você vai inventar.',
  },
  {
    titulo: 'A Matriz ADE',
    corpo: [
      'ADE é o framework para recuperar tempo perdido: Automatizar o que pode rodar sozinho, Delegar o que outros podem fazer, Eliminar o que não agrega valor.',
      'Adicionamos também Otimizar (fazer mais rápido) e Aumentar (dar mais espaço ao que importa).',
      'Para cada ação, estime quantas horas por semana você pode recuperar ou ganhar. Esse é o seu potencial de transformação.',
    ],
    dica: '💡 Comece pelo Eliminar. É a alavanca de maior impacto imediato e não depende de ninguém além de você.',
  },
  {
    titulo: 'Perguntas de reflexão',
    corpo: [
      'Dados sem reflexão são apenas números. Estas três perguntas convertem a sua auditoria em intenção de mudança.',
      'Responda com honestidade e especificidade. Respostas vagas não geram ação. Respostas concretas sim.',
      'Salve e compartilhe com alguém de confiança — o comprometimento público multiplica a probabilidade de execução.',
    ],
    dica: '💡 A pergunta mais poderosa das três é a última. Não pule ela.',
  },
];

const TOTAL_SEMANA = 168;
const COR_PRIMARY  = '#1a5c3a';
const COR_GOLD     = '#b5840a';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseH(v: string): number {
  const n = parseFloat(v);
  return isNaN(n) || n < 0 ? 0 : n;
}

function fmtH(h: number): string {
  if (h === 0) return '0h';
  if (h % 1 === 0) return `${h}h`;
  return `${h.toFixed(1)}h`;
}

// ─── Gráfico Donut ────────────────────────────────────────────────────────────

function GraficoDonut({
  segmentos,
  totalUsado,
}: {
  segmentos: Array<{ label: string; horas: number; cor: string }>;
  totalUsado: number;
}) {
  const cx = 90, cy = 90, R = 72, ri = 46;
  const livre = Math.max(0, TOTAL_SEMANA - totalUsado);
  const ativos = segmentos.filter((s) => s.horas > 0.01);
  const todos  = livre > 0.01 ? [...ativos, { label: 'Livre', horas: livre, cor: '#e5e7eb' }] : ativos;

  const toXY = (deg: number, r: number) => ({
    x: cx + r * Math.cos((deg * Math.PI) / 180),
    y: cy + r * Math.sin((deg * Math.PI) / 180),
  });

  const arc = (s: number, e: number) => {
    const os = toXY(s, R), oe = toXY(e, R);
    const is = toXY(s, ri), ie = toXY(e, ri);
    const lg = (e - s) > 180 ? 1 : 0;
    return `M${os.x.toFixed(2)},${os.y.toFixed(2)} A${R},${R} 0 ${lg} 1 ${oe.x.toFixed(2)},${oe.y.toFixed(2)} L${ie.x.toFixed(2)},${ie.y.toFixed(2)} A${ri},${ri} 0 ${lg} 0 ${is.x.toFixed(2)},${is.y.toFixed(2)} Z`;
  };

  if (todos.length === 0 || totalUsado < 0.01) {
    return (
      <svg width="180" height="180" viewBox="0 0 180 180">
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="#e5e7eb" strokeWidth={R - ri} />
        <text x={cx} y={cy + 4} textAnchor="middle" style={{ fontSize: 12, fill: '#9ca3af', fontFamily: 'Inter' }}>Preencha as</text>
        <text x={cx} y={cy + 20} textAnchor="middle" style={{ fontSize: 12, fill: '#9ca3af', fontFamily: 'Inter' }}>atividades →</text>
      </svg>
    );
  }

  let cum = -90;
  const slices = todos.map((seg) => {
    const start = cum;
    const sweep = (seg.horas / TOTAL_SEMANA) * 360;
    cum += sweep;
    return { ...seg, start, end: cum };
  });

  const pct  = Math.round((totalUsado / TOTAL_SEMANA) * 100);
  const over = totalUsado > TOTAL_SEMANA;

  return (
    <svg width="180" height="180" viewBox="0 0 180 180">
      {slices.map((s, i) => (
        <path key={i} d={arc(s.start, s.end)} fill={s.cor} stroke="#fff" strokeWidth={1.5} />
      ))}
      <text x={cx} y={cy - 12} textAnchor="middle"
        style={{ fontSize: 22, fontWeight: 700, fill: over ? '#ef4444' : COR_PRIMARY, fontFamily: 'Inter' }}>
        {fmtH(totalUsado)}
      </text>
      <text x={cx} y={cy + 6} textAnchor="middle"
        style={{ fontSize: 10, fill: '#9ca3af', fontFamily: 'Inter' }}>
        de {TOTAL_SEMANA}h/semana
      </text>
      <text x={cx} y={cy + 22} textAnchor="middle"
        style={{ fontSize: 13, fontWeight: 700, fill: over ? '#ef4444' : '#6b7280', fontFamily: 'Inter' }}>
        {over ? `+${pct - 100}% acima` : `${pct}% mapeado`}
      </text>
    </svg>
  );
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function InventarioRow({
  config, valor, onChange,
}: {
  config: typeof ATIVIDADES_CONFIG[0];
  valor: ItemInventario;
  onChange: (v: Partial<ItemInventario>) => void;
}) {
  const horas    = parseH(valor.horasDia);
  const semana   = horas * 7;
  const cls      = CLASSIFICACOES[valor.classificacao];
  const preench  = valor.horasDia !== '';

  return (
    <div
      className="flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-150"
      style={{
        background: '#fff',
        border: preench ? `1.5px solid ${cls.cor}33` : '1px solid var(--color-brand-border)',
        boxShadow: preench ? `0 1px 6px ${cls.cor}14` : 'none',
      }}
    >
      <span style={{ fontSize: 18, flexShrink: 0, width: 24, textAlign: 'center' }}>{config.emoji}</span>

      {/* Nome + descrição */}
      <div className="flex-1 min-w-0">
        <p style={{ fontSize: 14, fontWeight: 600, color: COR_PRIMARY, lineHeight: 1.2 }}>{config.nome}</p>
        <p style={{ fontSize: 12, color: 'var(--color-brand-gray)', marginTop: 1 }}>{config.descricao}</p>
      </div>

      {/* h/dia input */}
      <div className="flex flex-col items-center gap-0.5 shrink-0">
        <input
          type="number"
          step="0.5"
          min="0"
          max="24"
          value={valor.horasDia}
          onChange={(e) => onChange({ horasDia: e.target.value })}
          placeholder="0"
          className="rounded-lg outline-none text-center transition-all duration-150"
          style={{
            width: 60,
            padding: '6px 6px',
            fontSize: 15,
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            color: COR_PRIMARY,
            background: preench ? 'rgba(26,92,58,0.05)' : 'rgba(26,92,58,0.03)',
            border: preench ? `1.5px solid ${COR_PRIMARY}66` : '1.5px solid var(--color-brand-border)',
          }}
          onFocus={(e) => { e.target.style.borderColor = COR_PRIMARY; e.target.style.boxShadow = `0 0 0 3px rgba(26,92,58,0.1)`; }}
          onBlur={(e) => { e.target.style.borderColor = preench ? `${COR_PRIMARY}66` : 'var(--color-brand-border)'; e.target.style.boxShadow = 'none'; }}
        />
        <span style={{ fontSize: 10, color: 'var(--color-brand-gray)', letterSpacing: '0.03em' }}>h/dia</span>
      </div>

      {/* Total semanal */}
      <div className="flex flex-col items-center gap-0.5 shrink-0" style={{ minWidth: 46 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: preench ? cls.cor : 'rgba(0,0,0,0.15)' }}>
          {preench ? fmtH(semana) : '—'}
        </span>
        <span style={{ fontSize: 10, color: 'var(--color-brand-gray)' }}>semana</span>
      </div>

      {/* Classificação select */}
      <select
        value={valor.classificacao}
        onChange={(e) => onChange({ classificacao: e.target.value as Classificacao })}
        className="rounded-lg outline-none shrink-0 transition-all duration-150"
        style={{
          padding: '5px 7px',
          fontSize: 12,
          fontWeight: 600,
          fontFamily: 'var(--font-body)',
          color: cls.cor,
          background: `${cls.cor}12`,
          border: `1.5px solid ${cls.cor}44`,
          cursor: 'pointer',
          width: 110,
        }}
      >
        {(Object.keys(CLASSIFICACOES) as Classificacao[]).map((k) => (
          <option key={k} value={k}>{CLASSIFICACOES[k].label}</option>
        ))}
      </select>
    </div>
  );
}

function ADECard({
  config, valor, onChange,
}: {
  config: typeof ADE_CONFIG[0];
  valor: ItemADE;
  onChange: (v: Partial<ItemADE>) => void;
}) {
  return (
    <div
      className="flex flex-col rounded-2xl overflow-hidden"
      style={{ border: `1.5px solid ${config.cor}30`, background: '#fff', boxShadow: 'var(--shadow-card)' }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-5 py-3"
        style={{ background: `${config.cor}08`, borderBottom: `1px solid ${config.cor}20` }}
      >
        <div
          className="flex items-center justify-center rounded-xl shrink-0"
          style={{ width: 36, height: 36, background: config.cor, fontSize: 18 }}
        >
          {config.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <p style={{ fontFamily: 'var(--font-heading)', fontSize: 18, color: config.cor, fontStyle: 'italic', lineHeight: 1.2 }}>
            {config.label}
          </p>
          <p style={{ fontSize: 13, color: 'var(--color-brand-gray)', marginTop: 1 }}>{config.descricao}</p>
        </div>
        {/* Horas */}
        <div className="flex flex-col items-center gap-0.5 shrink-0">
          <div className="flex items-center gap-1">
            <input
              type="number"
              step="0.5"
              min="0"
              max="40"
              value={valor.horas}
              onChange={(e) => onChange({ horas: e.target.value })}
              placeholder="0"
              className="rounded-lg outline-none text-center"
              style={{
                width: 56,
                padding: '5px 6px',
                fontSize: 16,
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                color: config.cor,
                background: valor.horas ? `${config.cor}10` : 'rgba(0,0,0,0.04)',
                border: valor.horas ? `1.5px solid ${config.cor}66` : '1.5px solid var(--color-brand-border)',
              }}
            />
            <span style={{ fontSize: 13, color: 'var(--color-brand-gray)', fontWeight: 600 }}>h/sem</span>
          </div>
          <span style={{ fontSize: 10, color: 'var(--color-brand-gray)' }}>a recuperar</span>
        </div>
      </div>

      {/* Textarea */}
      <div className="p-4">
        <textarea
          rows={2}
          value={valor.descricao}
          onChange={(e) => onChange({ descricao: e.target.value })}
          placeholder={config.placeholder}
          className="w-full resize-none rounded-xl outline-none transition-all duration-150"
          style={{
            padding: '10px 14px',
            fontSize: 14,
            fontFamily: 'var(--font-body)',
            color: COR_PRIMARY,
            background: 'rgba(26,92,58,0.03)',
            border: valor.descricao ? `1.5px solid ${config.cor}66` : '1.5px solid var(--color-brand-border)',
            lineHeight: 1.6,
          }}
          onFocus={(e) => { e.target.style.borderColor = config.cor; e.target.style.boxShadow = `0 0 0 3px ${config.cor}14`; }}
          onBlur={(e) => { e.target.style.borderColor = valor.descricao ? `${config.cor}66` : 'var(--color-brand-border)'; e.target.style.boxShadow = 'none'; }}
        />
      </div>
    </div>
  );
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function AuditoriaTempoPage() {
  const [passo, setPasso] = useState(0);

  const [inventario, setInventario] = useState<Inventario>(() =>
    Object.fromEntries(
      ATIVIDADES_CONFIG.map((c) => [c.key, { horasDia: '', classificacao: c.classificacaoPadrao }])
    ) as Inventario
  );

  const [ade, setADE] = useState<MatrizADE>({
    eliminar: { descricao: '', horas: '' }, delegar:    { descricao: '', horas: '' },
    automatizar: { descricao: '', horas: '' }, otimizar: { descricao: '', horas: '' },
    aumentar: { descricao: '', horas: '' },
  });

  const [reflexao, setReflexao] = useState<Reflexao>({ surpresa: '', prioridade: '', compromisso: '' });

  const { dados: dadosSalvos } = useCarregarRespostas("auditoria-tempo");
  useEffect(() => { if (!dadosSalvos) return; if ((dadosSalvos as any).inventario) setInventario((dadosSalvos as any).inventario); if ((dadosSalvos as any).ade) setADE((dadosSalvos as any).ade); if ((dadosSalvos as any).reflexao) setReflexao((dadosSalvos as any).reflexao); }, [dadosSalvos]);

  // ── Computed ─────────────────────────────────────────────────────────────────

  const updateInventario = (key: keyof Inventario, v: Partial<ItemInventario>) =>
    setInventario((prev) => ({ ...prev, [key]: { ...prev[key], ...v } }));

  const updateADE = (key: keyof MatrizADE, v: Partial<ItemADE>) =>
    setADE((prev) => ({ ...prev, [key]: { ...prev[key], ...v } }));

  const totalHorasSemana = Object.values(inventario).reduce(
    (sum, item) => sum + parseH(item.horasDia) * 7, 0
  );

  const horasPorClassificacao = (Object.keys(CLASSIFICACOES) as Classificacao[]).map((k) => ({
    label: CLASSIFICACOES[k].label,
    cor:   CLASSIFICACOES[k].cor,
    horas: Object.values(inventario)
      .filter((item) => item.classificacao === k)
      .reduce((sum, item) => sum + parseH(item.horasDia) * 7, 0),
  }));

  const horasRecuperadas = ['eliminar', 'delegar', 'automatizar'].reduce(
    (sum, k) => sum + parseH(ade[k as keyof MatrizADE].horas), 0
  );

  const preenchidas  = Object.values(inventario).filter((i) => i.horasDia !== '').length;
  const adeItems     = Object.values(ade).filter((i) => i.descricao.trim()).length;
  const reflexOk     = Object.values(reflexao).filter((v) => v.trim()).length;
  const totalItens   = preenchidas + adeItems;

  const progresso = passo === 0 ? 5 : passo === 1 ? 35 : passo === 2 ? 70 : 100;

  const podeAvancar =
    passo === 0 ? true :
    passo === 1 ? preenchidas >= 3 :
    passo === 2 ? adeItems >= 1 :
    reflexOk >= 1;

  const instrucao = INSTRUCOES[passo];

  const labelAvancar =
    passo === 0 ? 'Iniciar Auditoria →' :
    passo === 1 ? 'Montar Plano de Ação →' :
    passo === 2 ? 'Responder Reflexões →' :
    'Salvar Auditoria ✓';

  // ── Painel direito ────────────────────────────────────────────────────────────

  const livre        = Math.max(0, TOTAL_SEMANA - totalHorasSemana);
  const over         = totalHorasSemana > TOTAL_SEMANA;

  const painelResumo = (
    <>
      {/* Gráfico */}
      <div className="flex justify-center">
        <GraficoDonut segmentos={horasPorClassificacao} totalUsado={totalHorasSemana} />
      </div>

      {/* Legenda por classificação */}
      <div className="flex flex-col gap-1.5">
        {horasPorClassificacao.map((seg) => (
          <div key={seg.label} className="flex items-center gap-2">
            <div style={{ width: 10, height: 10, borderRadius: 2, background: seg.cor, flexShrink: 0 }} />
            <span style={{ fontSize: 12, flex: 1, color: 'var(--color-brand-gray)' }}>{seg.label}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: seg.horas > 0 ? COR_PRIMARY : 'rgba(0,0,0,0.2)' }}>
              {seg.horas > 0 ? fmtH(seg.horas) : '—'}
            </span>
          </div>
        ))}
        {/* Livre */}
        <div className="flex items-center gap-2" style={{ borderTop: '1px solid var(--color-brand-border)', paddingTop: 6, marginTop: 4 }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, background: '#e5e7eb', flexShrink: 0 }} />
          <span style={{ fontSize: 12, flex: 1, color: 'var(--color-brand-gray)' }}>
            {over ? '⚠ Excesso' : 'Livre / não mapeado'}
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: over ? '#ef4444' : COR_PRIMARY }}>
            {over ? `-${fmtH(totalHorasSemana - TOTAL_SEMANA)}` : fmtH(livre)}
          </span>
        </div>
      </div>

      {/* Alertas */}
      {over && (
        <div className="rounded-xl p-3" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <p style={{ fontSize: 12, color: '#dc2626', fontWeight: 600, marginBottom: 2 }}>⚠ Total acima de 168h</p>
          <p style={{ fontSize: 12, color: 'var(--color-brand-gray)', lineHeight: 1.5 }}>
            Reavalie as estimativas — a soma não pode ultrapassar 168h por semana.
          </p>
        </div>
      )}

      {/* Horas por tipo de atividade — ladrões */}
      {passo >= 1 && (() => {
        const ladrao = horasPorClassificacao.find((s) => s.label === 'Ladrão');
        if (!ladrao || ladrao.horas === 0) return null;
        return (
          <div className="rounded-xl p-3" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
            <p style={{ fontSize: 12, color: '#dc2626', fontWeight: 600, marginBottom: 2 }}>⏱ Ladrões de tempo</p>
            <p style={{ fontSize: 12, color: 'var(--color-brand-gray)', lineHeight: 1.5 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#dc2626' }}>{fmtH(ladrao.horas)}</span> por semana em atividades sem retorno.
            </p>
          </div>
        );
      })()}

      {/* Potencial de recuperação (passo 2+) */}
      {passo >= 2 && horasRecuperadas > 0 && (
        <div className="rounded-xl p-3" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)' }}>
          <p style={{ fontSize: 12, color: '#16a34a', fontWeight: 600, marginBottom: 2 }}>✓ Potencial de recuperação</p>
          <p style={{ fontSize: 12, color: 'var(--color-brand-gray)', lineHeight: 1.5 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#16a34a' }}>{fmtH(horasRecuperadas)}</span> por semana via Eliminar, Delegar e Automatizar.
          </p>
        </div>
      )}
    </>
  );

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <FerramentaLayout
      codigo="F09"
      nome="Auditoria de Tempo"
      descricao="Mapeie como você usa suas 168 horas semanais e recupere o tempo que está sendo desperdiçado."
      etapas={ETAPAS}
      etapaAtual={passo}
      progresso={progresso}
      onAvancar={() => setPasso((p) => Math.min(3, p + 1))}
      onVoltar={() => setPasso((p) => Math.max(0, p - 1))}
      podeAvancar={podeAvancar}
      labelAvancar={labelAvancar}
      totalItens={totalItens > 0 ? totalItens : undefined}
      labelItens="atividades"
      resumo={painelResumo}
  respostas={{ inventario, ade, reflexao }}
    >
      <div className="p-8">

        {/* Instrução */}
        <div className="mb-6 rounded-xl p-4" style={{ background: `${COR_GOLD}10`, border: `1px solid ${COR_GOLD}30` }}>
          <p style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontStyle: 'italic', color: COR_PRIMARY, marginBottom: 10 }}>
            {instrucao.titulo}
          </p>
          <div className="flex flex-col gap-2 mb-3">
            {instrucao.corpo.map((t, i) => (
              <p key={i} style={{ fontSize: 15, color: 'var(--color-brand-gray)', lineHeight: 1.65 }}>{t}</p>
            ))}
          </div>
          <p style={{ fontSize: 14, color: COR_GOLD, lineHeight: 1.6, fontWeight: 500 }}>{instrucao.dica}</p>
        </div>

        {/* ══ PASSO 0 — BEM-VINDO ══════════════════════════════════════════ */}
        {passo === 0 && (
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-3">
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color: COR_GOLD, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Ferramenta F09
              </span>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(28px,4vw,40px)', fontWeight: 400, fontStyle: 'italic', color: COR_PRIMARY, lineHeight: 1.15 }}>
                Auditoria de{' '}
                <span style={{ color: COR_GOLD }}>Tempo</span>
              </h1>
              <p style={{ fontSize: 16, color: 'var(--color-brand-gray)', lineHeight: 1.7, maxWidth: 560 }}>
                Você tem exatamente{' '}
                <strong style={{ color: COR_PRIMARY, fontFamily: 'var(--font-mono)' }}>168 horas</strong>{' '}
                por semana. Esta auditoria mostra onde elas realmente vão — e onde você pode recuperar tempo para o que importa.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { emoji: '🗂️', titulo: '12 categorias',        desc: 'Mapeie todas as dimensões de como você gasta seu tempo na semana.'  },
                { emoji: '📊', titulo: 'Gráfico em tempo real', desc: 'Veja a distribuição do seu tempo sendo construída enquanto preenche.' },
                { emoji: '⚡', titulo: 'Matriz ADE',            desc: 'Automatizar, Delegar, Eliminar — o plano para recuperar horas perdidas.' },
                { emoji: '🧠', titulo: '3 reflexões',           desc: 'Perguntas poderosas que transformam dados em mudança de comportamento.' },
              ].map((c) => (
                <div key={c.titulo} className="flex flex-col gap-3 rounded-2xl p-5"
                  style={{ background: '#fff', border: '1px solid var(--color-brand-border)', boxShadow: 'var(--shadow-card)' }}>
                  <span style={{ fontSize: 24 }}>{c.emoji}</span>
                  <p style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontStyle: 'italic', color: COR_PRIMARY }}>{c.titulo}</p>
                  <p style={{ fontSize: 14, color: 'var(--color-brand-gray)', lineHeight: 1.55 }}>{c.desc}</p>
                </div>
              ))}
            </div>

            {/* Legenda de classificações */}
            <div className="rounded-2xl p-5" style={{ background: '#fff', border: '1px solid var(--color-brand-border)', boxShadow: 'var(--shadow-card)' }}>
              <p style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontStyle: 'italic', color: COR_PRIMARY, marginBottom: 14 }}>
                As 4 classificações de tempo
              </p>
              <div className="grid grid-cols-2 gap-3">
                {(Object.keys(CLASSIFICACOES) as Classificacao[]).map((k) => {
                  const cls = CLASSIFICACOES[k];
                  return (
                    <div key={k} className="flex items-start gap-3">
                      <div style={{ width: 12, height: 12, borderRadius: 3, background: cls.cor, marginTop: 3, flexShrink: 0 }} />
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: COR_PRIMARY }}>{cls.label}</p>
                        <p style={{ fontSize: 13, color: 'var(--color-brand-gray)', marginTop: 1 }}>{cls.descricao}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ══ PASSO 1 — INVENTÁRIO ═════════════════════════════════════════ */}
        {passo === 1 && (
          <div className="flex flex-col gap-4">
            <div className="flex items-end justify-between">
              <div>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 26, fontWeight: 400, fontStyle: 'italic', color: COR_PRIMARY, marginBottom: 4 }}>
                  Inventário da Semana
                </h2>
                <p style={{ fontSize: 15, color: 'var(--color-brand-gray)' }}>
                  Estime as horas por dia em cada atividade. Classifique-as pelo tipo de retorno.
                </p>
              </div>
              {/* Totalizador inline */}
              <div className="flex flex-col items-end shrink-0 gap-0.5">
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 700, color: over ? '#ef4444' : COR_PRIMARY }}>
                  {fmtH(totalHorasSemana)}
                </span>
                <span style={{ fontSize: 12, color: 'var(--color-brand-gray)' }}>
                  de {TOTAL_SEMANA}h · {fmtH(Math.max(0, livre))} livres
                </span>
              </div>
            </div>

            {/* Header colunas */}
            <div className="flex items-center gap-3 px-4" style={{ opacity: 0.55 }}>
              <div style={{ width: 24 }} />
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-brand-gray)' }}>Atividade</span>
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-brand-gray)', width: 60, textAlign: 'center' }}>H/dia</span>
              <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-brand-gray)', width: 46, textAlign: 'center' }}>Semana</span>
              <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-brand-gray)', width: 110, textAlign: 'center' }}>Tipo</span>
            </div>

            {/* Linhas */}
            <div className="flex flex-col gap-2">
              {ATIVIDADES_CONFIG.map((cfg) => (
                <InventarioRow
                  key={cfg.key}
                  config={cfg}
                  valor={inventario[cfg.key]}
                  onChange={(v) => updateInventario(cfg.key, v)}
                />
              ))}
            </div>

            {/* Barra de progresso das 168h */}
            <div className="rounded-2xl p-5 flex items-center justify-between gap-5"
              style={{ background: COR_PRIMARY }}>
              <div>
                <p style={{ fontSize: 13, color: 'rgba(245,244,240,0.6)', marginBottom: 4 }}>Total mapeado</p>
                <p style={{ fontFamily: 'var(--font-heading)', fontSize: 26, fontStyle: 'italic', color: over ? '#fca5a5' : COR_GOLD, lineHeight: 1 }}>
                  {fmtH(totalHorasSemana)}<span style={{ fontSize: 14, color: 'rgba(245,244,240,0.35)' }}> / {TOTAL_SEMANA}h</span>
                </p>
              </div>
              <div className="flex-1">
                <div className="rounded-full overflow-hidden" style={{ height: 8, background: 'rgba(255,255,255,0.12)' }}>
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, (totalHorasSemana / TOTAL_SEMANA) * 100)}%`,
                      background: over ? '#fca5a5' : `linear-gradient(90deg, ${COR_GOLD}, #e8b84b)`,
                    }}
                  />
                </div>
                <p style={{ fontSize: 12, color: 'rgba(245,244,240,0.5)', marginTop: 6 }}>
                  {over
                    ? `⚠ ${fmtH(totalHorasSemana - TOTAL_SEMANA)} acima do limite — reavalie as estimativas`
                    : `${fmtH(livre)} sem alocação — tempo livre ou não mapeado`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ══ PASSO 2 — MATRIZ ADE ═════════════════════════════════════════ */}
        {passo === 2 && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 26, fontWeight: 400, fontStyle: 'italic', color: COR_PRIMARY, marginBottom: 4 }}>
                Plano de Ação
              </h2>
              <p style={{ fontSize: 15, color: 'var(--color-brand-gray)' }}>
                Para cada ação, descreva o que vai mudar e estime quantas horas por semana isso representa.
              </p>
            </div>

            {ADE_CONFIG.map((cfg) => (
              <ADECard
                key={cfg.key}
                config={cfg}
                valor={ade[cfg.key]}
                onChange={(v) => updateADE(cfg.key, v)}
              />
            ))}

            {/* Total de horas a recuperar */}
            {horasRecuperadas > 0 && (
              <div className="rounded-2xl p-5 flex items-center justify-between gap-4"
                style={{ background: 'rgba(34,197,94,0.08)', border: '1.5px solid rgba(34,197,94,0.25)' }}>
                <div>
                  <p style={{ fontSize: 14, color: 'var(--color-brand-gray)', marginBottom: 4 }}>
                    Total a recuperar / ganhar por semana
                  </p>
                  <p style={{ fontFamily: 'var(--font-heading)', fontSize: 26, fontStyle: 'italic', color: '#16a34a', lineHeight: 1 }}>
                    {fmtH(horasRecuperadas + parseH(ade.otimizar.horas) + parseH(ade.aumentar.horas))}
                  </p>
                </div>
                <div className="text-right">
                  <p style={{ fontSize: 13, color: 'var(--color-brand-gray)' }}>Somente Eliminar + Delegar + Automatizar</p>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700, color: '#16a34a', marginTop: 4 }}>
                    {fmtH(horasRecuperadas)}/sem
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ PASSO 3 — REFLEXÃO ═══════════════════════════════════════════ */}
        {passo === 3 && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 26, fontWeight: 400, fontStyle: 'italic', color: COR_PRIMARY, marginBottom: 4 }}>
                Reflexão
              </h2>
              <p style={{ fontSize: 15, color: 'var(--color-brand-gray)' }}>
                Três perguntas para transformar os dados desta auditoria em mudança real de comportamento.
              </p>
            </div>

            {REFLEXAO_PERGUNTAS.map((q) => (
              <div key={q.key} className="flex flex-col rounded-2xl overflow-hidden"
                style={{ border: '1.5px solid var(--color-brand-border)', background: '#fff', boxShadow: 'var(--shadow-card)' }}>
                <div className="flex items-start gap-3 px-5 py-4"
                  style={{ background: 'rgba(26,92,58,0.04)', borderBottom: '1px solid var(--color-brand-border)' }}>
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{q.emoji}</span>
                  <p style={{ fontFamily: 'var(--font-heading)', fontSize: 17, fontStyle: 'italic', color: COR_PRIMARY, lineHeight: 1.4 }}>
                    {q.pergunta}
                  </p>
                </div>
                <div className="p-5">
                  <textarea
                    rows={4}
                    value={reflexao[q.key]}
                    onChange={(e) => setReflexao((prev) => ({ ...prev, [q.key]: e.target.value }))}
                    placeholder={q.placeholder}
                    className="w-full resize-none rounded-xl outline-none transition-all duration-150"
                    style={{
                      padding: '12px 14px',
                      fontSize: 15,
                      fontFamily: 'var(--font-body)',
                      color: COR_PRIMARY,
                      background: 'rgba(26,92,58,0.03)',
                      border: reflexao[q.key] ? `1.5px solid ${COR_PRIMARY}66` : '1.5px solid var(--color-brand-border)',
                      lineHeight: 1.7,
                    }}
                    onFocus={(e) => { e.target.style.borderColor = COR_PRIMARY; e.target.style.boxShadow = `0 0 0 3px rgba(26,92,58,0.1)`; }}
                    onBlur={(e) => { e.target.style.borderColor = reflexao[q.key] ? `${COR_PRIMARY}66` : 'var(--color-brand-border)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
              </div>
            ))}

            {/* Resumo final */}
            {reflexOk >= 2 && (
              <div className="rounded-2xl p-5"
                style={{ background: `linear-gradient(135deg, rgba(26,92,58,0.06), rgba(181,132,10,0.06))`, border: `1px solid ${COR_PRIMARY}20` }}>
                <p style={{ fontFamily: 'var(--font-heading)', fontSize: 17, fontStyle: 'italic', color: COR_PRIMARY, marginBottom: 14 }}>
                  Sua auditoria em números
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { n: `${preenchidas}/12`,              l: 'atividades mapeadas' },
                    { n: fmtH(totalHorasSemana),            l: 'horas por semana'    },
                    { n: fmtH(horasRecuperadas),             l: 'a recuperar'         },
                  ].map((s) => (
                    <div key={s.l} className="rounded-xl p-3 text-center"
                      style={{ background: 'rgba(255,255,255,0.7)' }}>
                      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700, color: COR_PRIMARY }}>{s.n}</p>
                      <p style={{ fontSize: 12, color: 'var(--color-brand-gray)', marginTop: 2 }}>{s.l}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </FerramentaLayout>
  );
}
