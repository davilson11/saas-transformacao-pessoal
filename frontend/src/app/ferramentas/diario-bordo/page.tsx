'use client';

import { useState } from 'react';
import FerramentaLayout from '@/components/dashboard/FerramentaLayout';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Tres = [string, string, string];

type EntradaDiaria = {
  data:           string;
  // Matinal
  gratidoes:      Tres;
  prioridades:    Tres;
  sinto:          string;
  afirmacao:      string;
  pergunta:       string;
  // Noturno
  vitorias:       Tres;
  desafio:        string;
  aprendi:        string;
  fariaDiferente: string;
  energia:        number;
  foco:           number;
  humor:          number;
  intencaoAmanha: string;
};

type RevisaoSemanal = {
  vitoriasSemana:       Tres;
  momentoCoragem:       string;
  principalAprendizado: string;
  naoFuncionou:         string;
  progressoOKRs:        string;
  prioxSemana:          Tres;
};

// ─── Constantes ───────────────────────────────────────────────────────────────

const COR_VERDE  = '#1a5c3a';
const COR_GOLD   = '#b5840a';
const COR_BORDER = 'rgba(26,92,58,0.1)';

const ETAPAS = [
  { label: 'Bem-vindo',         descricao: 'Como usar o diário'           },
  { label: 'Ritual Matinal',    descricao: 'Gratidão, MIT e intenção'     },
  { label: 'Ritual Noturno',    descricao: 'Vitórias, aprendizados e avaliação' },
  { label: 'Revisão Semanal',   descricao: 'Balanço da semana e próximos passos' },
];

const PERGUNTAS_PODEROSAS = [
  'O que eu preciso largar para crescer mais rápido?',
  'Se eu fosse mais corajoso hoje, o que faria diferente?',
  'O que meu eu do futuro está esperando que eu faça hoje?',
  'Em que área estou me enganando?',
  'O que posso fazer hoje que deixará meu eu futuro grato?',
  'Que hábito estou procrastinando que mudaria minha vida?',
  'Estou investindo tempo nas coisas que realmente importam?',
];

const AFIRMACOES_SUGERIDAS = [
  'Sou capaz de criar resultados extraordinários todos os dias.',
  'Cada desafio me torna mais forte e mais sábio.',
  'Estou no caminho certo e crescendo constantemente.',
  'Minha disciplina hoje constrói a liberdade de amanhã.',
  'Entrego o meu melhor e confio no processo.',
  'Sou grato por cada oportunidade de aprender e crescer.',
];

const TRES_ZERO: Tres = ['', '', ''];

const ENTRADA_DEFAULT: EntradaDiaria = {
  data: '',
  gratidoes: [...TRES_ZERO] as Tres,
  prioridades: [...TRES_ZERO] as Tres,
  sinto: '', afirmacao: '', pergunta: '',
  vitorias: [...TRES_ZERO] as Tres,
  desafio: '', aprendi: '', fariaDiferente: '',
  energia: 0, foco: 0, humor: 0,
  intencaoAmanha: '',
};

const REVISAO_DEFAULT: RevisaoSemanal = {
  vitoriasSemana: [...TRES_ZERO] as Tres,
  momentoCoragem: '', principalAprendizado: '',
  naoFuncionou: '', progressoOKRs: '',
  prioxSemana: [...TRES_ZERO] as Tres,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getScoreCor(v: number): string {
  if (v <= 0) return 'rgba(26,92,58,0.2)';
  if (v >= 7) return '#16a34a';
  if (v >= 4) return '#d97706';
  return '#ef4444';
}

function fmtData(iso: string): string {
  if (!iso) return '';
  const [, m, d] = iso.split('-');
  return `${d}/${m}`;
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function TresFields({ label, valores, placeholder, onChange, cor, subLabel }: {
  label:       string;
  valores:     Tres;
  placeholder: (i: number) => string;
  onChange:    (idx: number, v: string) => void;
  cor?:        string;
  subLabel?:   string;
}) {
  const c = cor ?? COR_VERDE;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div>
        <label style={{ fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 600, color: COR_VERDE }}>
          {label}
        </label>
        {subLabel && (
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(26,92,58,0.5)', margin: '2px 0 0' }}>
            {subLabel}
          </p>
        )}
      </div>
      {valores.map((v, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
            background: v ? c : 'rgba(26,92,58,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
            color: v ? '#fff' : 'rgba(26,92,58,0.4)', transition: 'background 0.2s',
          }}>
            {i + 1}
          </div>
          <input
            type="text"
            value={v}
            onChange={e => onChange(i, e.target.value)}
            placeholder={placeholder(i + 1)}
            style={{
              flex: 1,
              border: `1px solid ${v ? c + '45' : COR_BORDER}`,
              borderRadius: 7, padding: '8px 12px', fontSize: 15,
              fontFamily: 'var(--font-body)', color: '#1a2015',
              outline: 'none', background: v ? `${c}03` : '#fff',
              transition: 'border-color 0.15s',
            }}
          />
        </div>
      ))}
    </div>
  );
}

function ScoreRow({ label, emoji, valor, cor, onChange }: {
  label:    string;
  emoji:    string;
  valor:    number;
  cor:      string;
  onChange: (n: number) => void;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
      <span style={{ fontSize: 18, flexShrink: 0 }}>{emoji}</span>
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: '#2d3748', minWidth: 56 }}>
        {label}
      </span>
      <div style={{ display: 'flex', gap: 3 }}>
        {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
          <button
            key={n}
            onClick={() => onChange(valor === n ? 0 : n)}
            title={`${n}/10`}
            style={{
              width: 24, height: 24, borderRadius: 4, border: 'none',
              background: valor >= n ? cor : 'rgba(26,92,58,0.08)',
              cursor: 'pointer', padding: 0,
              fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700,
              color: valor >= n ? '#fff' : 'rgba(26,92,58,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.1s',
            }}
          >
            {n}
          </button>
        ))}
      </div>
      {valor > 0 && (
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 700,
          color: cor, minWidth: 22,
        }}>
          {valor}
        </span>
      )}
    </div>
  );
}

// ─── Componente Principal ─────────────────────────────────────────────────────

export default function DiarioBordoPage() {
  const [etapa, setEtapa]           = useState(0);
  const [perguntaIdx, setPerguntaIdx] = useState(0);
  const [afirmacaoIdx, setAfirmacaoIdx] = useState(0);

  const [entrada, setEntrada] = useState<EntradaDiaria>(() => ({
    ...ENTRADA_DEFAULT,
    data: new Date().toISOString().slice(0, 10),
  }));

  const [revisao, setRevisao] = useState<RevisaoSemanal>({ ...REVISAO_DEFAULT });

  const [historico, setHistorico] = useState<EntradaDiaria[]>(() => {
    const hoje = new Date();
    const scores: [number, number, number][] = [
      [7, 6, 8], [5, 7, 6], [8, 8, 7], [6, 5, 7], [9, 8, 8], [7, 7, 6],
    ];
    return scores.map(([energia, foco, humor], i) => {
      const d = new Date(hoje);
      d.setDate(hoje.getDate() - (6 - i));
      return {
        ...ENTRADA_DEFAULT,
        data: d.toISOString().slice(0, 10),
        energia, foco, humor,
      };
    });
  });

  // ─── Helpers de estado ────────────────────────────────────────────────────

  const setTres = (field: 'gratidoes' | 'prioridades' | 'vitorias', idx: number, valor: string) =>
    setEntrada(prev => {
      const arr = [...prev[field]] as Tres;
      arr[idx] = valor;
      return { ...prev, [field]: arr };
    });

  const setRevisTres = (field: 'vitoriasSemana' | 'prioxSemana', idx: number, valor: string) =>
    setRevisao(prev => {
      const arr = [...prev[field]] as Tres;
      arr[idx] = valor;
      return { ...prev, [field]: arr };
    });

  const setEnt = (p: Partial<EntradaDiaria>) => setEntrada(prev => ({ ...prev, ...p }));
  const setRev = (p: Partial<RevisaoSemanal>) => setRevisao(prev => ({ ...prev, ...p }));

  const sugerirPergunta = () => {
    const idx = (perguntaIdx + 1) % PERGUNTAS_PODEROSAS.length;
    setPerguntaIdx(idx);
    setEnt({ pergunta: PERGUNTAS_PODEROSAS[idx] });
  };

  const sugerirAfirmacao = () => {
    const idx = (afirmacaoIdx + 1) % AFIRMACOES_SUGERIDAS.length;
    setAfirmacaoIdx(idx);
    setEnt({ afirmacao: AFIRMACOES_SUGERIDAS[idx] });
  };

  // ─── Métricas ──────────────────────────────────────────────────────────────

  const matinalFilled = [
    entrada.data, entrada.gratidoes[0], entrada.prioridades[0],
    entrada.sinto, entrada.afirmacao, entrada.pergunta,
  ].filter(v => v.length > 0).length;

  const noturnoFilled = [entrada.vitorias[0], entrada.desafio, entrada.aprendi, entrada.intencaoAmanha]
    .filter(v => v.length > 0).length
    + (entrada.energia > 0 ? 1 : 0)
    + (entrada.foco > 0 ? 1 : 0)
    + (entrada.humor > 0 ? 1 : 0);

  const revisaoFilled = [
    revisao.vitoriasSemana[0], revisao.momentoCoragem,
    revisao.principalAprendizado, revisao.naoFuncionou,
    revisao.progressoOKRs, revisao.prioxSemana[0],
  ].filter(v => v.length > 0).length;

  const progresso =
    etapa === 0 ? 0
    : etapa === 1 ? Math.min(33, Math.round((matinalFilled / 6) * 33))
    : etapa === 2 ? 33 + Math.min(33, Math.round((noturnoFilled / 7) * 33))
    : 66 + Math.min(34, Math.round((revisaoFilled / 6) * 34));

  const podeAvancar =
    etapa === 0 ? true
    : etapa === 1 ? (entrada.data.length > 0 && entrada.gratidoes[0].length > 0 && entrada.prioridades[0].length > 0)
    : etapa === 2 ? (entrada.vitorias[0].length > 0 && (entrada.energia > 0 || entrada.foco > 0 || entrada.humor > 0))
    : (revisao.vitoriasSemana[0].length > 0 && revisao.principalAprendizado.length > 0);

  const totalItens =
    etapa === 1 ? matinalFilled
    : etapa === 2 ? noturnoFilled
    : etapa === 3 ? revisaoFilled
    : undefined;

  const handleAvancar = () => {
    if (etapa === 2) {
      setHistorico(prev => {
        const existe = prev.some(e => e.data === entrada.data);
        if (existe) return prev.map(e => e.data === entrada.data ? { ...entrada } : e);
        return [...prev, { ...entrada }];
      });
    }
    setEtapa(e => Math.min(e + 1, ETAPAS.length - 1));
  };

  // ─── Painel Direito ────────────────────────────────────────────────────────

  const todosDados = [
    ...historico.filter(e => e.data !== entrada.data).slice(-6),
    ...(entrada.energia > 0 || entrada.foco > 0 || entrada.humor > 0 ? [entrada] : historico.slice(-1)),
  ].slice(-7);

  const mediaScore = (key: 'energia' | 'foco' | 'humor') => {
    const vals = todosDados.filter(d => d[key] > 0).map(d => d[key]);
    return vals.length ? vals.reduce((s, n) => s + n, 0) / vals.length : 0;
  };

  const painelResumo = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Hoje */}
      {entrada.data && (
        <div style={{
          background: `${COR_VERDE}07`, border: `1px solid ${COR_VERDE}18`,
          borderRadius: 10, padding: '10px 14px',
        }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: 'rgba(26,92,58,0.45)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>
            Entrada de hoje
          </p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: COR_VERDE }}>
            {new Date(entrada.data + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          {entrada.sinto && (
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(26,92,58,0.6)', fontStyle: 'italic', marginTop: 4 }}>
              Me sinto: <strong>{entrada.sinto}</strong>
            </p>
          )}
        </div>
      )}

      {/* Scores de hoje */}
      {(entrada.energia > 0 || entrada.foco > 0 || entrada.humor > 0) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 700, color: COR_VERDE, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Avaliação de hoje
          </p>
          {[
            { label: 'Energia', emoji: '⚡', val: entrada.energia, cor: '#16a34a' },
            { label: 'Foco',    emoji: '🎯', val: entrada.foco,    cor: '#2563eb' },
            { label: 'Humor',   emoji: '😊', val: entrada.humor,   cor: '#e11d48' },
          ].map(s => s.val > 0 && (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 14 }}>{s.emoji}</span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(26,92,58,0.65)', flex: 1 }}>
                {s.label}
              </span>
              <div style={{ display: 'flex', gap: 2 }}>
                {Array.from({ length: 10 }, (_, i) => (
                  <div key={i} style={{
                    width: 10, height: 10, borderRadius: 2,
                    background: s.val > i ? s.cor : 'rgba(26,92,58,0.08)',
                  }} />
                ))}
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: s.cor, minWidth: 18 }}>
                {s.val}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Gráfico 7 dias */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 700, color: COR_VERDE, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Últimos 7 dias
        </p>

        {/* Barras */}
        <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 60 }}>
          {todosDados.map((d, i) => (
            <div key={i} style={{ display: 'flex', gap: 1.5, alignItems: 'flex-end', flex: 1 }}>
              {[
                { v: d.energia, cor: '#16a34a' },
                { v: d.foco,    cor: '#2563eb' },
                { v: d.humor,   cor: '#e11d48' },
              ].map(bar => (
                <div
                  key={bar.cor}
                  style={{
                    flex: 1,
                    height: bar.v > 0 ? `${Math.round((bar.v / 10) * 54)}px` : '3px',
                    background: bar.v > 0 ? bar.cor : 'rgba(26,92,58,0.08)',
                    borderRadius: '2px 2px 0 0',
                    transition: 'height 0.3s ease',
                    minHeight: 3,
                    opacity: d.data === entrada.data ? 1 : 0.7,
                  }}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Datas */}
        <div style={{ display: 'flex', gap: 4 }}>
          {todosDados.map((d, i) => (
            <div key={i} style={{
              flex: 1, textAlign: 'center',
              fontFamily: 'var(--font-mono)', fontSize: 8,
              color: d.data === entrada.data ? COR_VERDE : 'rgba(26,92,58,0.35)',
              fontWeight: d.data === entrada.data ? 700 : 400,
            }}>
              {fmtData(d.data)}
            </div>
          ))}
        </div>

        {/* Legenda */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {[
            { label: 'Energia', cor: '#16a34a' },
            { label: 'Foco',    cor: '#2563eb' },
            { label: 'Humor',   cor: '#e11d48' },
          ].map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: 1, background: l.cor }} />
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'rgba(26,92,58,0.55)' }}>
                {l.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Médias da semana */}
      {todosDados.some(d => d.energia > 0) && (
        <div style={{
          background: '#fff', border: `1px solid ${COR_BORDER}`,
          borderRadius: 10, padding: '12px 14px',
          display: 'flex', flexDirection: 'column', gap: 6,
        }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700, color: 'rgba(26,92,58,0.45)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 2 }}>
            Média da semana
          </p>
          {[
            { label: '⚡ Energia', key: 'energia' as const, cor: '#16a34a' },
            { label: '🎯 Foco',    key: 'foco'    as const, cor: '#2563eb' },
            { label: '😊 Humor',   key: 'humor'   as const, cor: '#e11d48' },
          ].map(m => {
            const med = mediaScore(m.key);
            return med > 0 ? (
              <div key={m.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(26,92,58,0.65)' }}>
                  {m.label}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: m.cor }}>
                  {med.toFixed(1)}
                </span>
              </div>
            ) : null;
          })}
        </div>
      )}
    </div>
  );

  // ─── Etapa 0: Bem-vindo ────────────────────────────────────────────────────

  const step0 = (
    <div style={{ maxWidth: 620, display: 'flex', flexDirection: 'column', gap: 28 }}>
      <div>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: `${COR_GOLD}15`, border: `1px solid ${COR_GOLD}30`,
          borderRadius: 99, padding: '4px 14px', marginBottom: 16,
        }}>
          <span style={{ fontSize: 14 }}>📓</span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: COR_GOLD }}>
            F15 · Diário de Bordo
          </span>
        </div>
        <h1 style={{ color: COR_VERDE, marginBottom: 12 }}>
          O diário que registra a sua transformação
        </h1>
        <p style={{ color: '#4a5568', maxWidth: 560 }}>
          Líderes e performers de alto nível praticam o diário há séculos. Esta ferramenta estrutura seu ritual matinal, noturno e revisão semanal em um sistema que acelera seu crescimento.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {[
          { emoji: '🌅', titulo: 'Ritual Matinal',  desc: 'Gratidão, MIT, como se sente e intenção do dia'       },
          { emoji: '🌙', titulo: 'Ritual Noturno',  desc: 'Vitórias, aprendizados e avaliação de energia/humor'  },
          { emoji: '📊', titulo: 'Revisão Semanal', desc: 'Balanço, coragem, OKRs e próximas prioridades'        },
          { emoji: '📈', titulo: 'Mini Gráfico',    desc: 'Histórico de energia, foco e humor dos últimos 7 dias' },
        ].map(item => (
          <div key={item.titulo} style={{
            background: '#fff', border: `1px solid ${COR_BORDER}`,
            borderRadius: 12, padding: '16px 18px',
            display: 'flex', gap: 12, alignItems: 'flex-start',
          }}>
            <span style={{ fontSize: 24, flexShrink: 0 }}>{item.emoji}</span>
            <div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 700, color: COR_VERDE, marginBottom: 4 }}>
                {item.titulo}
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(26,92,58,0.6)', lineHeight: 1.45 }}>
                {item.desc}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{
        background: 'rgba(181,132,10,0.06)', border: `1px solid ${COR_GOLD}25`,
        borderRadius: 12, padding: '16px 20px', display: 'flex', gap: 12, alignItems: 'flex-start',
      }}>
        <span style={{ fontSize: 20, flexShrink: 0 }}>💡</span>
        <p style={{ color: '#5c4a00', margin: 0, fontSize: 14 }}>
          <strong>Hábito de elite:</strong> 5 minutos pela manhã e 5 à noite. O diário não tira tempo — ele <em>multiplica</em> a qualidade de tudo que você faz no restante do dia.
        </p>
      </div>
    </div>
  );

  // ─── Etapa 1: Ritual Matinal ───────────────────────────────────────────────

  const step1 = (
    <div style={{ maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div>
        <h2 style={{ color: COR_VERDE, marginBottom: 8 }}>Ritual Matinal</h2>
        <p style={{ color: '#4a5568' }}>
          Comece o dia com intenção. Leva menos de 5 minutos e muda tudo.
        </p>
      </div>

      {/* Data */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <label style={{ fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 600, color: COR_VERDE, flexShrink: 0 }}>
          Data <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <input
          type="date"
          value={entrada.data}
          onChange={e => setEnt({ data: e.target.value })}
          style={{
            border: `1.5px solid ${entrada.data ? COR_VERDE + '50' : COR_BORDER}`,
            borderRadius: 8, padding: '8px 12px', fontSize: 15,
            fontFamily: 'var(--font-body)', color: '#1a2015',
            fontWeight: 600, outline: 'none', background: '#fff',
          }}
        />
        {entrada.data && (
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'rgba(26,92,58,0.6)', fontStyle: 'italic' }}>
            {new Date(entrada.data + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long' })}
          </span>
        )}
      </div>

      {/* Como me sinto */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 600, color: COR_VERDE }}>
          Como me sinto agora — em 1 palavra
        </label>
        <input
          type="text"
          value={entrada.sinto}
          onChange={e => setEnt({ sinto: e.target.value })}
          placeholder="Ex: Animado, Sereno, Focado, Cansado, Grato…"
          style={{
            border: `1px solid ${entrada.sinto ? COR_VERDE + '40' : COR_BORDER}`,
            borderRadius: 8, padding: '9px 14px', fontSize: 15,
            fontFamily: 'var(--font-body)', color: COR_VERDE,
            fontWeight: entrada.sinto ? 600 : 400, fontStyle: entrada.sinto ? 'italic' : 'normal',
            outline: 'none', background: '#fff',
          }}
        />
      </div>

      {/* Gratidões */}
      <TresFields
        label="3 coisas pelas quais sou grato hoje"
        valores={entrada.gratidoes}
        placeholder={i => `Gratidão ${i}…`}
        onChange={(idx, v) => setTres('gratidoes', idx, v)}
        cor="#d97706"
        subLabel="Pequenas ou grandes — tudo conta."
      />

      {/* MIT */}
      <TresFields
        label="3 prioridades MIT do dia (Most Important Tasks)"
        valores={entrada.prioridades}
        placeholder={i => i === 1 ? 'Tarefa mais importante do dia…' : `Prioridade ${i}…`}
        onChange={(idx, v) => setTres('prioridades', idx, v)}
        cor="#2563eb"
        subLabel="Se você só fizesse essas 3 coisas hoje, o dia seria um sucesso?"
      />

      {/* Afirmação */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <label style={{ fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 600, color: COR_VERDE }}>
            Afirmação do dia
          </label>
          <button
            onClick={sugerirAfirmacao}
            style={{
              fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600,
              color: COR_GOLD, background: `${COR_GOLD}10`,
              border: `1px solid ${COR_GOLD}30`, borderRadius: 99,
              padding: '3px 10px', cursor: 'pointer',
            }}
          >
            💡 Sugerir
          </button>
        </div>
        <textarea
          value={entrada.afirmacao}
          onChange={e => setEnt({ afirmacao: e.target.value })}
          placeholder="Escreva uma afirmação no tempo presente que ressuma quem você está se tornando…"
          rows={2}
          style={{
            border: `1px solid ${entrada.afirmacao ? COR_VERDE + '40' : COR_BORDER}`,
            borderRadius: 8, padding: '9px 14px', fontSize: 15,
            fontFamily: 'var(--font-body)', color: '#1a2015', fontStyle: 'italic',
            outline: 'none', background: '#fff', resize: 'vertical', lineHeight: 1.55,
          }}
        />
      </div>

      {/* Pergunta poderosa */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <label style={{ fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 600, color: COR_VERDE }}>
            Pergunta poderosa do dia
          </label>
          <button
            onClick={sugerirPergunta}
            style={{
              fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600,
              color: '#7c3aed', background: 'rgba(124,58,237,0.08)',
              border: '1px solid rgba(124,58,237,0.2)', borderRadius: 99,
              padding: '3px 10px', cursor: 'pointer',
            }}
          >
            🔮 Sugerir pergunta
          </button>
        </div>
        <textarea
          value={entrada.pergunta}
          onChange={e => setEnt({ pergunta: e.target.value })}
          placeholder="Qual pergunta, se respondida hoje, mudaria algo importante na sua vida?"
          rows={2}
          style={{
            border: `1px solid ${entrada.pergunta ? '#7c3aed40' : COR_BORDER}`,
            borderRadius: 8, padding: '9px 14px', fontSize: 15,
            fontFamily: 'var(--font-body)', color: '#1a2015',
            outline: 'none', background: '#fff', resize: 'vertical', lineHeight: 1.55,
          }}
        />
      </div>

      {!podeAvancar && (
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: 14, color: '#92400e',
          background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)',
          borderRadius: 8, padding: '10px 14px', margin: 0,
        }}>
          Preencha a data, pelo menos 1 gratidão e 1 prioridade para continuar.
        </p>
      )}
    </div>
  );

  // ─── Etapa 2: Ritual Noturno ───────────────────────────────────────────────

  const step2 = (
    <div style={{ maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div>
        <h2 style={{ color: COR_VERDE, marginBottom: 8 }}>Ritual Noturno</h2>
        <p style={{ color: '#4a5568' }}>
          Feche o dia com gratidão, aprendizado e avaliação honesta. O encerramento consciente muda a qualidade do sono e do dia seguinte.
        </p>
      </div>

      {/* Vitórias */}
      <TresFields
        label="3 vitórias de hoje"
        valores={entrada.vitorias}
        placeholder={i => i === 1 ? 'Maior vitória do dia (grande ou pequena)…' : `Vitória ${i}…`}
        onChange={(idx, v) => setTres('vitorias', idx, v)}
        cor="#16a34a"
        subLabel="Toda vitória conta — inclusive as internas."
      />

      {/* Reflexão */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {[
          { field: 'desafio' as const,        label: '⚡ Maior desafio enfrentado',       placeholder: 'Qual foi o maior obstáculo de hoje?' },
          { field: 'aprendi' as const,         label: '📚 O que aprendi hoje',             placeholder: 'Qual foi o insight ou aprendizado mais valioso?' },
          { field: 'fariaDiferente' as const,  label: '🔄 Faria diferente',                placeholder: 'Se pudesse refazer alguma parte do dia, o que mudaria?' },
          { field: 'intencaoAmanha' as const,  label: '🌅 Intenção para amanhã',           placeholder: 'Com qual energia e intenção você quer acordar amanhã?' },
        ].map(item => (
          <div key={item.field} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: COR_VERDE }}>
              {item.label}
            </label>
            <textarea
              value={entrada[item.field]}
              onChange={e => setEnt({ [item.field]: e.target.value })}
              placeholder={item.placeholder}
              rows={3}
              style={{
                border: `1px solid ${entrada[item.field] ? COR_VERDE + '35' : COR_BORDER}`,
                borderRadius: 8, padding: '8px 12px', fontSize: 15,
                fontFamily: 'var(--font-body)', color: '#1a2015',
                outline: 'none', background: '#fff', resize: 'vertical', lineHeight: 1.55,
              }}
            />
          </div>
        ))}
      </div>

      {/* Avaliação */}
      <div style={{
        background: '#fff', border: `1px solid ${COR_BORDER}`,
        borderRadius: 12, padding: '18px 20px',
        display: 'flex', flexDirection: 'column', gap: 14,
      }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 700, color: COR_VERDE }}>
          Avaliação do dia
        </p>
        <ScoreRow label="Energia" emoji="⚡" valor={entrada.energia} cor="#16a34a" onChange={v => setEnt({ energia: v })} />
        <ScoreRow label="Foco"    emoji="🎯" valor={entrada.foco}    cor="#2563eb" onChange={v => setEnt({ foco: v })} />
        <ScoreRow label="Humor"   emoji="😊" valor={entrada.humor}   cor="#e11d48" onChange={v => setEnt({ humor: v })} />
      </div>

      {!podeAvancar && (
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: 14, color: '#92400e',
          background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)',
          borderRadius: 8, padding: '10px 14px', margin: 0,
        }}>
          Preencha pelo menos 1 vitória e 1 avaliação para continuar.
        </p>
      )}
    </div>
  );

  // ─── Etapa 3: Revisão Semanal ─────────────────────────────────────────────

  const step3 = (
    <div style={{ maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div>
        <h2 style={{ color: COR_VERDE, marginBottom: 8 }}>Revisão Semanal</h2>
        <p style={{ color: '#4a5568' }}>
          O balanço semanal é onde os grandes saltos acontecem. Reserve 15 minutos — preferencialmente aos domingos — para refletir com profundidade.
        </p>
      </div>

      {/* Vitórias da semana */}
      <TresFields
        label="3 maiores vitórias da semana"
        valores={revisao.vitoriasSemana}
        placeholder={i => i === 1 ? 'A vitória mais significativa desta semana…' : `Vitória ${i}…`}
        onChange={(idx, v) => setRevisTres('vitoriasSemana', idx, v)}
        cor="#16a34a"
      />

      {/* Perguntas reflexivas */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {[
          { field: 'momentoCoragem' as const,       emoji: '🦁', label: 'Momento de maior coragem',      placeholder: 'Em que momento você saiu da zona de conforto esta semana?' },
          { field: 'principalAprendizado' as const,  emoji: '📚', label: 'Principal aprendizado da semana', placeholder: 'Qual foi o insight mais transformador desta semana?' },
          { field: 'naoFuncionou' as const,          emoji: '🔍', label: 'O que não funcionou',            placeholder: 'O que você faria diferente se pudesse repetir essa semana?' },
          { field: 'progressoOKRs' as const,         emoji: '🎯', label: 'Progresso nos OKRs',             placeholder: 'Como você avalia seu progresso em relação aos objetivos do mês/trimestre?' },
        ].map(item => (
          <div key={item.field} style={{
            background: '#fff', border: `1px solid ${COR_BORDER}`,
            borderRadius: 10, padding: '14px 16px',
            display: 'flex', flexDirection: 'column', gap: 8,
          }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 600, color: COR_VERDE }}>
              <span style={{ fontSize: 18 }}>{item.emoji}</span>
              {item.label}
            </label>
            <textarea
              value={revisao[item.field]}
              onChange={e => setRev({ [item.field]: e.target.value })}
              placeholder={item.placeholder}
              rows={3}
              style={{
                border: `1px solid ${revisao[item.field] ? COR_VERDE + '35' : COR_BORDER}`,
                borderRadius: 8, padding: '9px 12px', fontSize: 15,
                fontFamily: 'var(--font-body)', color: '#1a2015',
                outline: 'none', background: revisao[item.field] ? 'rgba(26,92,58,0.01)' : '#fff',
                resize: 'vertical', lineHeight: 1.55,
              }}
            />
          </div>
        ))}
      </div>

      {/* Prioridades próxima semana */}
      <TresFields
        label="3 prioridades para a próxima semana"
        valores={revisao.prioxSemana}
        placeholder={i => i === 1 ? 'Prioridade #1 da próxima semana…' : `Prioridade ${i}…`}
        onChange={(idx, v) => setRevisTres('prioxSemana', idx, v)}
        cor="#7c3aed"
        subLabel="Se você só fizesse essas 3 coisas na semana, qual seria o impacto?"
      />

      {!podeAvancar && (
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: 14, color: '#92400e',
          background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)',
          borderRadius: 8, padding: '10px 14px', margin: 0,
        }}>
          Preencha pelo menos 1 vitória da semana e o principal aprendizado para salvar.
        </p>
      )}
    </div>
  );

  // ─── Render ────────────────────────────────────────────────────────────────

  const steps = [step0, step1, step2, step3];

  return (
    <FerramentaLayout
      codigo="F15"
      nome="Diário de Bordo"
      descricao="Ritual matinal, noturno e revisão semanal para registrar e acelerar sua transformação."
      etapas={ETAPAS}
      etapaAtual={etapa}
      progresso={progresso}
      onAvancar={handleAvancar}
      onVoltar={etapa > 0 ? () => setEtapa(e => e - 1) : undefined}
      podeAvancar={podeAvancar}
      totalItens={totalItens}
      labelItens="campos preenchidos"
      resumo={painelResumo}
    >
      {steps[etapa]}
    </FerramentaLayout>
  );
}
