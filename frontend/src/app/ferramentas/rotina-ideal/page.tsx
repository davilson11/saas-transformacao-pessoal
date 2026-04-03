'use client';

import { useState } from 'react';
import FerramentaLayout from '@/components/dashboard/FerramentaLayout';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Atividade = { horario: string; duracao: string };
type AtividadeSimples = { horario: string };
type NivelEnergia = 1 | 2 | 3 | 4 | 5;
type Bloco = { foco: string; tarefas: string; energia: NivelEnergia };

type RitualMatinal = {
  acordar:      Atividade;
  hidratacao:   Atividade;
  meditacao:    Atividade;
  leitura:      Atividade;
  exercicio:    Atividade;
  planejamento: Atividade;
  cafe:         Atividade;
};

type BlocosDia = { manha: Bloco; tarde: Bloco; noite: Bloco };

type RitualNoturno = {
  diario:      AtividadeSimples;
  desconexao:  AtividadeSimples;
  higiene:     AtividadeSimples;
  leituraLeve: AtividadeSimples;
  gratidao:    AtividadeSimples;
  dormir:      AtividadeSimples;
};

// ─── Constantes ───────────────────────────────────────────────────────────────

const ETAPAS = [
  { label: 'Bem-vindo',      descricao: 'Introdução à ferramenta'   },
  { label: 'Ritual Matinal', descricao: 'Atividades do amanhecer'   },
  { label: 'Blocos do Dia',  descricao: 'Manhã, tarde e noite'      },
  { label: 'Ritual Noturno', descricao: 'Encerramento do dia'       },
];

const ATIV_MATINAIS: Array<{
  key: keyof RitualMatinal;
  emoji: string;
  nome: string;
  sugestao: string;
  duracaoPadrao: string;
}> = [
  { key: 'acordar',      emoji: '☀️', nome: 'Acordar',            sugestao: '06:00', duracaoPadrao: '5 min'  },
  { key: 'hidratacao',   emoji: '💧', nome: 'Hidratação',          sugestao: '06:05', duracaoPadrao: '5 min'  },
  { key: 'meditacao',    emoji: '🧘', nome: 'Oração / Meditação',  sugestao: '06:10', duracaoPadrao: '15 min' },
  { key: 'leitura',      emoji: '📖', nome: 'Leitura',             sugestao: '06:25', duracaoPadrao: '20 min' },
  { key: 'exercicio',    emoji: '🏃', nome: 'Exercício',           sugestao: '06:45', duracaoPadrao: '30 min' },
  { key: 'planejamento', emoji: '📋', nome: 'Planejamento do dia', sugestao: '07:15', duracaoPadrao: '15 min' },
  { key: 'cafe',         emoji: '☕', nome: 'Café da manhã',       sugestao: '07:30', duracaoPadrao: '20 min' },
];

const BLOCOS_CONFIG: Array<{
  key: keyof BlocosDia;
  emoji: string;
  nome: string;
  periodo: string;
  cor: string;
  bg: string;
}> = [
  { key: 'manha', emoji: '🌅', nome: 'Manhã', periodo: '08:00 – 12:00', cor: '#2980B9', bg: 'rgba(41,128,185,0.06)'  },
  { key: 'tarde', emoji: '☀️', nome: 'Tarde', periodo: '13:00 – 18:00', cor: '#D97706', bg: 'rgba(217,119,6,0.06)'   },
  { key: 'noite', emoji: '🌆', nome: 'Noite', periodo: '19:00 – 21:00', cor: '#7c3aed', bg: 'rgba(124,58,237,0.06)'  },
];

const ATIV_NOTURNAS: Array<{
  key: keyof RitualNoturno;
  emoji: string;
  nome: string;
  sugestao: string;
}> = [
  { key: 'diario',      emoji: '📔', nome: 'Diário / Reflexão',  sugestao: '21:00' },
  { key: 'desconexao',  emoji: '📵', nome: 'Desconexão digital', sugestao: '21:30' },
  { key: 'higiene',     emoji: '🪥', nome: 'Higiene noturna',    sugestao: '21:45' },
  { key: 'leituraLeve', emoji: '📚', nome: 'Leitura leve',       sugestao: '22:00' },
  { key: 'gratidao',    emoji: '🙏', nome: 'Gratidão',           sugestao: '22:20' },
  { key: 'dormir',      emoji: '🌙', nome: 'Dormir',             sugestao: '22:30' },
];

const DURACAO_OPTS = ['5 min','10 min','15 min','20 min','30 min','45 min','60 min','90 min'];

const ENERGIA_INFO: Record<NivelEnergia, { label: string; cor: string }> = {
  1: { label: 'Muito baixa', cor: '#ef4444' },
  2: { label: 'Baixa',       cor: '#f97316' },
  3: { label: 'Média',       cor: '#eab308' },
  4: { label: 'Alta',        cor: '#84cc16' },
  5: { label: 'Máxima',      cor: '#22c55e' },
};

const INSTRUCOES = [
  {
    titulo: 'Bem-vindo à Rotina Ideal',
    corpo: [
      'A rotina ideal não é sobre fazer mais — é sobre fazer as coisas certas no momento certo, com a energia certa.',
      'Você vai montar três blocos: um ritual matinal para começar bem o dia, três blocos produtivos alinhados à sua energia, e um ritual noturno para encerrar com intenção.',
      'A consistência de uma boa rotina é o que separa quem tem resultados de quem tem intenções.',
    ],
    dica: '💡 Reserve 20 minutos tranquilos para montar sua rotina. Você não precisa seguir tudo de primeira — ajuste ao longo dos dias.',
  },
  {
    titulo: 'O poder do ritual matinal',
    corpo: [
      'As primeiras horas do dia definem o tom de tudo que vem depois. Um ritual matinal sólido garante que você comece com intenção.',
      'Defina os horários de cada atividade. A duração já vem com sugestões — ajuste conforme sua realidade.',
      'O ideal é que seu ritual matinal tenha entre 60 e 120 minutos para dar conta de corpo, mente e planejamento.',
    ],
    dica: '💡 Comece pelo horário de acordar. Todo o restante do dia se organiza a partir dele.',
  },
  {
    titulo: 'Energia e foco por bloco',
    corpo: [
      'Seu nível de energia não é constante — ele varia ao longo do dia. Alocar as tarefas certas para o momento de energia certa é a chave da produtividade.',
      'Para cada bloco, defina o foco principal e as tarefas planejadas. O campo de energia mostra em que nível você costuma estar naquele horário.',
      'Reserva tarefas que exigem concentração máxima para o bloco de maior energia.',
    ],
    dica: '💡 A maioria das pessoas tem energia máxima pela manhã. Use esse bloco para o trabalho mais importante.',
  },
  {
    titulo: 'Rituais noturnos importam',
    corpo: [
      'O dia termina como ele recomeça: com intenção. Um ritual noturno bem feito garante sono de qualidade e prepara sua mente para o dia seguinte.',
      'A desconexão digital antes de dormir é uma das práticas com maior impacto comprovado na qualidade do sono.',
      'Defina o horário de cada atividade noturna, terminando com o horário em que você pretende dormir.',
    ],
    dica: '💡 Tente manter o horário de dormir consistente — é o fator mais importante para a qualidade do sono.',
  },
];

const COR_PRIMARY = '#1a5c3a';
const COR_GOLD    = '#b5840a';
const COR_NOTURNO = '#4a3a8a';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function minutosDuracao(d: string): number {
  return parseInt(d) || 0;
}

function formatarMinutos(total: number): string {
  if (total < 60) return `${total} min`;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function AtividadeMatinalRow({
  config,
  valor,
  onChange,
}: {
  config: typeof ATIV_MATINAIS[0];
  valor: Atividade;
  onChange: (v: Partial<Atividade>) => void;
}) {
  return (
    <div
      className="flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-150"
      style={{
        background: '#fff',
        border: valor.horario
          ? `1.5px solid ${COR_PRIMARY}33`
          : '1px solid var(--color-brand-border)',
        boxShadow: valor.horario ? `0 2px 8px rgba(26,92,58,0.08)` : 'none',
      }}
    >
      <span style={{ fontSize: 20, flexShrink: 0 }}>{config.emoji}</span>
      <span style={{ fontSize: 15, fontWeight: 500, color: COR_PRIMARY, flex: 1, fontFamily: 'var(--font-body)' }}>
        {config.nome}
      </span>

      {/* Horário */}
      <input
        type="time"
        value={valor.horario}
        onChange={(e) => onChange({ horario: e.target.value })}
        className="rounded-lg outline-none transition-all duration-150"
        style={{
          padding: '7px 10px',
          fontSize: 14,
          fontFamily: 'var(--font-mono)',
          color: COR_PRIMARY,
          background: valor.horario ? `rgba(26,92,58,0.05)` : 'rgba(26,92,58,0.03)',
          border: valor.horario ? `1.5px solid ${COR_PRIMARY}66` : '1.5px solid var(--color-brand-border)',
          width: 100,
          cursor: 'pointer',
        }}
        onFocus={(e) => { e.target.style.borderColor = COR_PRIMARY; e.target.style.boxShadow = `0 0 0 3px rgba(26,92,58,0.12)`; }}
        onBlur={(e) => { e.target.style.borderColor = valor.horario ? `${COR_PRIMARY}66` : 'var(--color-brand-border)'; e.target.style.boxShadow = 'none'; }}
      />

      {/* Duração */}
      <select
        value={valor.duracao}
        onChange={(e) => onChange({ duracao: e.target.value })}
        className="rounded-lg outline-none transition-all duration-150"
        style={{
          padding: '7px 8px',
          fontSize: 13,
          fontFamily: 'var(--font-body)',
          color: 'var(--color-brand-gray)',
          background: 'rgba(26,92,58,0.03)',
          border: '1.5px solid var(--color-brand-border)',
          cursor: 'pointer',
          width: 90,
        }}
      >
        {DURACAO_OPTS.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

function BlocoEditor({
  config,
  valor,
  onChange,
}: {
  config: typeof BLOCOS_CONFIG[0];
  valor: Bloco;
  onChange: (v: Partial<Bloco>) => void;
}) {
  return (
    <div
      className="flex flex-col rounded-2xl overflow-hidden"
      style={{
        border: `1.5px solid ${config.cor}33`,
        background: '#fff',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-5 py-4"
        style={{ background: config.bg, borderBottom: `1px solid ${config.cor}22` }}
      >
        <span style={{ fontSize: 22, flexShrink: 0 }}>{config.emoji}</span>
        <div className="flex-1 min-w-0">
          <p style={{ fontFamily: 'var(--font-heading)', fontSize: 18, color: config.cor, fontStyle: 'italic', lineHeight: 1.2 }}>
            {config.nome}
          </p>
          <p style={{ fontSize: 13, color: 'var(--color-brand-gray)', marginTop: 2 }}>
            {config.periodo}
          </p>
        </div>

        {/* Seletor de energia */}
        <div className="flex flex-col items-end gap-1 shrink-0">
          <div className="flex items-center gap-1.5">
            {([1, 2, 3, 4, 5] as NivelEnergia[]).map((n) => (
              <button
                key={n}
                onClick={() => onChange({ energia: n })}
                title={ENERGIA_INFO[n].label}
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  background: n <= valor.energia ? ENERGIA_INFO[n].cor : 'rgba(0,0,0,0.1)',
                  border: 'none',
                  cursor: 'pointer',
                  transform: n === valor.energia ? 'scale(1.3)' : 'scale(1)',
                  transition: 'all 0.15s',
                  flexShrink: 0,
                }}
              />
            ))}
          </div>
          <span style={{ fontSize: 11, color: 'var(--color-brand-gray)', whiteSpace: 'nowrap' }}>
            ⚡ {ENERGIA_INFO[valor.energia].label}
          </span>
        </div>
      </div>

      {/* Campos */}
      <div className="flex flex-col gap-4 p-5">
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-brand-gray)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Foco principal
          </label>
          <input
            type="text"
            value={valor.foco}
            onChange={(e) => onChange({ foco: e.target.value })}
            placeholder="O que mais importa neste bloco?"
            className="w-full mt-2 rounded-xl outline-none transition-all duration-150"
            style={{
              padding: '10px 14px',
              fontSize: 15,
              fontFamily: 'var(--font-body)',
              color: COR_PRIMARY,
              background: 'rgba(26,92,58,0.03)',
              border: valor.foco ? `1.5px solid ${config.cor}` : '1.5px solid var(--color-brand-border)',
              lineHeight: 1.5,
            }}
            onFocus={(e) => { e.target.style.borderColor = config.cor; e.target.style.boxShadow = `0 0 0 3px ${config.cor}18`; }}
            onBlur={(e) => { e.target.style.borderColor = valor.foco ? config.cor : 'var(--color-brand-border)'; e.target.style.boxShadow = 'none'; }}
          />
        </div>

        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-brand-gray)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Tarefas planejadas
          </label>
          <textarea
            rows={3}
            value={valor.tarefas}
            onChange={(e) => onChange({ tarefas: e.target.value })}
            placeholder="Liste as tarefas deste bloco, uma por linha..."
            className="w-full mt-2 rounded-xl resize-none outline-none transition-all duration-150"
            style={{
              padding: '10px 14px',
              fontSize: 15,
              fontFamily: 'var(--font-body)',
              color: COR_PRIMARY,
              background: 'rgba(26,92,58,0.03)',
              border: valor.tarefas ? `1.5px solid ${config.cor}` : '1.5px solid var(--color-brand-border)',
              lineHeight: 1.6,
            }}
            onFocus={(e) => { e.target.style.borderColor = config.cor; e.target.style.boxShadow = `0 0 0 3px ${config.cor}18`; }}
            onBlur={(e) => { e.target.style.borderColor = valor.tarefas ? config.cor : 'var(--color-brand-border)'; e.target.style.boxShadow = 'none'; }}
          />
        </div>
      </div>
    </div>
  );
}

function AtividadeNoturnaRow({
  config,
  valor,
  onChange,
  isLast,
}: {
  config: typeof ATIV_NOTURNAS[0];
  valor: AtividadeSimples;
  onChange: (v: Partial<AtividadeSimples>) => void;
  isLast?: boolean;
}) {
  return (
    <div
      className="flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-150"
      style={{
        background: '#fff',
        border: valor.horario
          ? `1.5px solid ${isLast ? COR_NOTURNO : COR_PRIMARY}44`
          : '1px solid var(--color-brand-border)',
        boxShadow: valor.horario ? `0 2px 8px rgba(74,58,138,0.08)` : 'none',
      }}
    >
      <span style={{ fontSize: 20, flexShrink: 0 }}>{config.emoji}</span>
      <span style={{ fontSize: 15, fontWeight: 500, color: isLast ? COR_NOTURNO : COR_PRIMARY, flex: 1, fontFamily: 'var(--font-body)' }}>
        {config.nome}
      </span>
      <input
        type="time"
        value={valor.horario}
        onChange={(e) => onChange({ horario: e.target.value })}
        className="rounded-lg outline-none transition-all duration-150"
        style={{
          padding: '7px 10px',
          fontSize: 14,
          fontFamily: 'var(--font-mono)',
          color: COR_NOTURNO,
          background: valor.horario ? 'rgba(74,58,138,0.05)' : 'rgba(74,58,138,0.03)',
          border: valor.horario ? `1.5px solid ${COR_NOTURNO}66` : '1.5px solid var(--color-brand-border)',
          width: 100,
          cursor: 'pointer',
        }}
        onFocus={(e) => { e.target.style.borderColor = COR_NOTURNO; e.target.style.boxShadow = `0 0 0 3px rgba(74,58,138,0.12)`; }}
        onBlur={(e) => { e.target.style.borderColor = valor.horario ? `${COR_NOTURNO}66` : 'var(--color-brand-border)'; e.target.style.boxShadow = 'none'; }}
      />
    </div>
  );
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function RotinaIdealPage() {
  const [passo, setPasso] = useState(0);

  const [matinal, setMatinal] = useState<RitualMatinal>({
    acordar:      { horario: '', duracao: '5 min'  },
    hidratacao:   { horario: '', duracao: '5 min'  },
    meditacao:    { horario: '', duracao: '15 min' },
    leitura:      { horario: '', duracao: '20 min' },
    exercicio:    { horario: '', duracao: '30 min' },
    planejamento: { horario: '', duracao: '15 min' },
    cafe:         { horario: '', duracao: '20 min' },
  });

  const [blocos, setBlocos] = useState<BlocosDia>({
    manha: { foco: '', tarefas: '', energia: 4 },
    tarde: { foco: '', tarefas: '', energia: 3 },
    noite: { foco: '', tarefas: '', energia: 2 },
  });

  const [noturno, setNoturno] = useState<RitualNoturno>({

  const { dados: dadosSalvos } = useCarregarRespostas("rotina-ideal");
  useEffect(() => { if (!dadosSalvos) return; if ((dadosSalvos as any).matinal) setMatinal((dadosSalvos as any).matinal); if ((dadosSalvos as any).blocos) setBlocos((dadosSalvos as any).blocos); if ((dadosSalvos as any).noturno) setNoturno((dadosSalvos as any).noturno); }, [dadosSalvos]);
    diario:      { horario: '' },
    desconexao:  { horario: '' },
    higiene:     { horario: '' },
    leituraLeve: { horario: '' },
    gratidao:    { horario: '' },
    dormir:      { horario: '' },
  });

  // ── Helpers de update ────────────────────────────────────────────────────────

  const updateMatinal = (key: keyof RitualMatinal, v: Partial<Atividade>) =>
    setMatinal((prev) => ({ ...prev, [key]: { ...prev[key], ...v } }));

  const updateBloco = (key: keyof BlocosDia, v: Partial<Bloco>) =>
    setBlocos((prev) => ({ ...prev, [key]: { ...prev[key], ...v } }));

  const updateNoturno = (key: keyof RitualNoturno, v: Partial<AtividadeSimples>) =>
    setNoturno((prev) => ({ ...prev, [key]: { ...prev[key], ...v } }));

  // ── Métricas ────────────────────────────────────────────────────────────────

  const totalMatinalMin = Object.values(matinal).reduce(
    (sum, a) => sum + minutosDuracao(a.duracao), 0
  );

  const ativMatinalPreenchidas = Object.values(matinal).filter((a) => a.horario).length;
  const blocosPreenchidos      = [blocos.manha, blocos.tarde, blocos.noite].filter((b) => b.foco.trim()).length;
  const ativNoturnaPreenchidas = Object.values(noturno).filter((a) => a.horario).length;
  const totalItens             = ativMatinalPreenchidas + blocosPreenchidos + ativNoturnaPreenchidas;

  const progresso    = passo === 0 ? 5 : passo === 1 ? 35 : passo === 2 ? 70 : 100;
  const instrucao    = INSTRUCOES[passo];

  const podeAvancar =
    passo === 0 ? true :
    passo === 1 ? matinal.acordar.horario.length > 0 :
    passo === 2 ? blocos.manha.foco.trim().length > 0 || blocos.tarde.foco.trim().length > 0 :
    noturno.dormir.horario.length > 0;

  const labelAvancar =
    passo === 0 ? 'Montar minha rotina →' :
    passo === 1 ? 'Configurar blocos do dia →' :
    passo === 2 ? 'Montar ritual noturno →' :
    'Salvar Rotina Ideal ✓';

  // ── Painel direito ──────────────────────────────────────────────────────────

  const painelResumo = (
    <>
      {/* Ritual Matinal */}
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-2 mb-2">
          <div style={{ width: 3, height: 14, background: COR_PRIMARY, borderRadius: 2, flexShrink: 0 }} />
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: COR_PRIMARY }}>
            Ritual Matinal
          </p>
          {ativMatinalPreenchidas > 0 && (
            <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 10, color: COR_PRIMARY, background: `${COR_PRIMARY}12`, padding: '1px 6px', borderRadius: 99, fontWeight: 600 }}>
              {formatarMinutos(totalMatinalMin)}
            </span>
          )}
        </div>
        {ATIV_MATINAIS.map((a) => {
          const v = matinal[a.key];
          return (
            <div
              key={a.key}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5"
              style={{ background: v.horario ? 'rgba(26,92,58,0.05)' : 'transparent' }}
            >
              <span style={{ fontSize: 12, flexShrink: 0 }}>{a.emoji}</span>
              <span style={{ fontSize: 12, flex: 1, color: v.horario ? COR_PRIMARY : 'var(--color-brand-gray)', lineHeight: 1.3 }}>
                {a.nome}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color: v.horario ? COR_PRIMARY : 'rgba(0,0,0,0.2)', minWidth: 38, textAlign: 'right' }}>
                {v.horario || '—:—'}
              </span>
            </div>
          );
        })}
      </div>

      {/* Blocos do dia */}
      <div className="flex flex-col gap-2" style={{ borderTop: '1px solid var(--color-brand-border)', paddingTop: 16 }}>
        <div className="flex items-center gap-2 mb-1">
          <div style={{ width: 3, height: 14, background: COR_GOLD, borderRadius: 2, flexShrink: 0 }} />
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: COR_GOLD }}>
            Blocos do Dia
          </p>
        </div>
        {BLOCOS_CONFIG.map((b) => {
          const v = blocos[b.key];
          return (
            <div
              key={b.key}
              className="rounded-xl p-3"
              style={{ background: b.bg, border: `1px solid ${b.cor}22` }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span style={{ fontSize: 13 }}>{b.emoji}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: b.cor }}>{b.nome}</span>
                <span style={{ fontSize: 11, color: 'var(--color-brand-gray)', marginLeft: 'auto', whiteSpace: 'nowrap' }}>
                  {b.periodo}
                </span>
              </div>
              {v.foco ? (
                <p style={{ fontSize: 12, color: COR_PRIMARY, lineHeight: 1.4, marginBottom: 6 }}>
                  🎯 {v.foco}
                </p>
              ) : (
                <p style={{ fontSize: 12, color: 'var(--color-brand-gray)', fontStyle: 'italic', marginBottom: 6 }}>
                  Não configurado ainda
                </p>
              )}
              <div className="flex items-center gap-1">
                {([1, 2, 3, 4, 5] as NivelEnergia[]).map((n) => (
                  <div key={n} style={{ width: 7, height: 7, borderRadius: '50%', background: n <= v.energia ? ENERGIA_INFO[n].cor : 'rgba(0,0,0,0.08)', flexShrink: 0 }} />
                ))}
                <span style={{ fontSize: 11, color: 'var(--color-brand-gray)', marginLeft: 5 }}>
                  {ENERGIA_INFO[v.energia].label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Ritual Noturno */}
      <div className="flex flex-col gap-0.5" style={{ borderTop: '1px solid var(--color-brand-border)', paddingTop: 16 }}>
        <div className="flex items-center gap-2 mb-2">
          <div style={{ width: 3, height: 14, background: COR_NOTURNO, borderRadius: 2, flexShrink: 0 }} />
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: COR_NOTURNO }}>
            Ritual Noturno
          </p>
        </div>
        {ATIV_NOTURNAS.map((a) => {
          const v = noturno[a.key];
          return (
            <div
              key={a.key}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5"
              style={{ background: v.horario ? 'rgba(74,58,138,0.05)' : 'transparent' }}
            >
              <span style={{ fontSize: 12, flexShrink: 0 }}>{a.emoji}</span>
              <span style={{ fontSize: 12, flex: 1, color: v.horario ? COR_NOTURNO : 'var(--color-brand-gray)', lineHeight: 1.3 }}>
                {a.nome}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color: v.horario ? COR_NOTURNO : 'rgba(0,0,0,0.2)', minWidth: 38, textAlign: 'right' }}>
                {v.horario || '—:—'}
              </span>
            </div>
          );
        })}
      </div>

      {/* Resumo do dia — quando acordar e dormir estão preenchidos */}
      {matinal.acordar.horario && noturno.dormir.horario && (
        <div
          className="rounded-xl p-3 flex items-center gap-3"
          style={{ background: `${COR_PRIMARY}08`, border: `1px solid ${COR_PRIMARY}20`, borderTop: '1px solid var(--color-brand-border)' }}
        >
          <div className="flex flex-col items-center gap-0.5">
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: COR_PRIMARY }}>{matinal.acordar.horario}</span>
            <span style={{ fontSize: 10, color: 'var(--color-brand-gray)' }}>acordar</span>
          </div>
          <div style={{ flex: 1, height: 2, background: `linear-gradient(90deg, ${COR_PRIMARY}, ${COR_NOTURNO})`, borderRadius: 1 }} />
          <div className="flex flex-col items-center gap-0.5">
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: COR_NOTURNO }}>{noturno.dormir.horario}</span>
            <span style={{ fontSize: 10, color: 'var(--color-brand-gray)' }}>dormir</span>
          </div>
        </div>
      )}
    </>
  );

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <FerramentaLayout
      codigo="F08"
      nome="Rotina Ideal"
      descricao="Monte blocos de tempo para manhã, tarde e noite que maximizam sua energia e foco."
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
  respostas={{ matinal, blocos, noturno }}
    >
      <div className="p-8">

        {/* ── Instrução contextual ── */}
        <div
          className="mb-6 rounded-xl p-4"
          style={{ background: `${COR_GOLD}10`, border: `1px solid ${COR_GOLD}30` }}
        >
          <p style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontStyle: 'italic', color: COR_PRIMARY, marginBottom: 10 }}>
            {instrucao.titulo}
          </p>
          <div className="flex flex-col gap-2 mb-3">
            {instrucao.corpo.map((t, i) => (
              <p key={i} style={{ fontSize: 15, color: 'var(--color-brand-gray)', lineHeight: 1.65 }}>{t}</p>
            ))}
          </div>
          <p style={{ fontSize: 14, color: COR_GOLD, lineHeight: 1.6, fontWeight: 500 }}>
            {instrucao.dica}
          </p>
        </div>

        {/* ══════════════════════════════════════════════════════
            PASSO 0 — BEM-VINDO
        ══════════════════════════════════════════════════════ */}
        {passo === 0 && (
          <div className="flex flex-col gap-8">

            <div className="flex flex-col gap-3">
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color: COR_GOLD, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Ferramenta F08
              </span>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(28px,4vw,40px)', fontWeight: 400, fontStyle: 'italic', color: COR_PRIMARY, lineHeight: 1.15 }}>
                Rotina{' '}
                <span style={{ color: COR_GOLD }}>Ideal</span>
              </h1>
              <p style={{ fontSize: 16, color: 'var(--color-brand-gray)', lineHeight: 1.7, maxWidth: 560 }}>
                Uma rotina bem projetada é a diferença entre viver por acidente e viver com intenção. Você vai montar o cronograma do seu dia ideal em 3 etapas.
              </p>
            </div>

            {/* Cards de benefícios */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { emoji: '🌅', titulo: 'Ritual Matinal', desc: '7 atividades com horários e durações para começar o dia com intenção.' },
                { emoji: '⚡', titulo: 'Blocos de Energia', desc: 'Aloque tarefas importantes para os momentos de pico de energia.' },
                { emoji: '🌙', titulo: 'Ritual Noturno', desc: '6 práticas para encerrar o dia e garantir um sono reparador.' },
                { emoji: '📅', titulo: 'Cronograma Visual', desc: 'Painel ao vivo mostrando sua rotina sendo montada em tempo real.' },
              ].map((c) => (
                <div
                  key={c.titulo}
                  className="flex flex-col gap-3 rounded-2xl p-5"
                  style={{ background: '#fff', border: '1px solid var(--color-brand-border)', boxShadow: 'var(--shadow-card)' }}
                >
                  <span style={{ fontSize: 24 }}>{c.emoji}</span>
                  <p style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontStyle: 'italic', color: COR_PRIMARY }}>{c.titulo}</p>
                  <p style={{ fontSize: 14, color: 'var(--color-brand-gray)', lineHeight: 1.55 }}>{c.desc}</p>
                </div>
              ))}
            </div>

            {/* Tempo estimado */}
            <div
              className="flex items-center gap-4 rounded-xl p-4"
              style={{ background: `${COR_PRIMARY}08`, border: `1px solid ${COR_PRIMARY}20` }}
            >
              <span style={{ fontSize: 24 }}>⏱️</span>
              <div>
                <p style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontStyle: 'italic', color: COR_PRIMARY }}>
                  20–30 minutos
                </p>
                <p style={{ fontSize: 14, color: 'var(--color-brand-gray)' }}>
                  Faça com calma. Uma rotina bem pensada vale horas de planejamento futuro.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            PASSO 1 — RITUAL MATINAL
        ══════════════════════════════════════════════════════ */}
        {passo === 1 && (
          <div className="flex flex-col gap-6">
            <div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 26, fontWeight: 400, fontStyle: 'italic', color: COR_PRIMARY, marginBottom: 6 }}>
                Ritual Matinal
              </h2>
              <p style={{ fontSize: 15, color: 'var(--color-brand-gray)' }}>
                Defina os horários e durações de cada atividade. Comece pelo horário de acordar — o restante segue.
              </p>
            </div>

            {/* Legenda dos campos */}
            <div className="flex items-center justify-end gap-6">
              <span style={{ fontSize: 13, color: 'var(--color-brand-gray)', fontWeight: 600 }}>Horário</span>
              <span style={{ fontSize: 13, color: 'var(--color-brand-gray)', fontWeight: 600 }}>Duração</span>
            </div>

            {/* Atividades */}
            <div className="flex flex-col gap-2">
              {ATIV_MATINAIS.map((a) => (
                <AtividadeMatinalRow
                  key={a.key}
                  config={a}
                  valor={matinal[a.key]}
                  onChange={(v) => updateMatinal(a.key, v)}
                />
              ))}
            </div>

            {/* Resumo total do ritual */}
            <div
              className="flex items-center justify-between rounded-xl p-4"
              style={{ background: COR_PRIMARY, color: '#f5f4f0' }}
            >
              <div>
                <p style={{ fontSize: 13, color: 'rgba(245,244,240,0.6)', marginBottom: 2 }}>
                  Duração total do ritual matinal
                </p>
                <p style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontStyle: 'italic', color: 'rgba(245,244,240,0.95)', lineHeight: 1 }}>
                  {formatarMinutos(totalMatinalMin)}
                </p>
              </div>
              <div className="text-right">
                <p style={{ fontSize: 13, color: 'rgba(245,244,240,0.6)', marginBottom: 2 }}>
                  Atividades configuradas
                </p>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 700, color: COR_GOLD }}>
                  {ativMatinalPreenchidas}<span style={{ fontSize: 14, color: 'rgba(245,244,240,0.4)' }}>/{ATIV_MATINAIS.length}</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            PASSO 2 — BLOCOS DO DIA
        ══════════════════════════════════════════════════════ */}
        {passo === 2 && (
          <div className="flex flex-col gap-6">
            <div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 26, fontWeight: 400, fontStyle: 'italic', color: COR_PRIMARY, marginBottom: 6 }}>
                Blocos do Dia
              </h2>
              <p style={{ fontSize: 15, color: 'var(--color-brand-gray)' }}>
                Para cada período, defina o foco principal e as tarefas planejadas. Ajuste o nível de energia esperado.
              </p>
            </div>

            {BLOCOS_CONFIG.map((b) => (
              <BlocoEditor
                key={b.key}
                config={b}
                valor={blocos[b.key]}
                onChange={(v) => updateBloco(b.key, v)}
              />
            ))}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            PASSO 3 — RITUAL NOTURNO
        ══════════════════════════════════════════════════════ */}
        {passo === 3 && (
          <div className="flex flex-col gap-6">
            <div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 26, fontWeight: 400, fontStyle: 'italic', color: COR_NOTURNO, marginBottom: 6 }}>
                Ritual Noturno
              </h2>
              <p style={{ fontSize: 15, color: 'var(--color-brand-gray)' }}>
                Defina os horários das práticas que encerram seu dia. Termine pelo horário que você pretende dormir.
              </p>
            </div>

            {/* Atividades noturnas */}
            <div className="flex flex-col gap-2">
              {ATIV_NOTURNAS.map((a, i) => (
                <AtividadeNoturnaRow
                  key={a.key}
                  config={a}
                  valor={noturno[a.key]}
                  onChange={(v) => updateNoturno(a.key, v)}
                  isLast={i === ATIV_NOTURNAS.length - 1}
                />
              ))}
            </div>

            {/* Resumo completo do dia */}
            {matinal.acordar.horario && noturno.dormir.horario && (
              <div
                className="rounded-2xl p-5"
                style={{ background: `linear-gradient(135deg, ${COR_PRIMARY}08 0%, ${COR_NOTURNO}08 100%)`, border: `1px solid ${COR_PRIMARY}20` }}
              >
                <p style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontStyle: 'italic', color: COR_PRIMARY, marginBottom: 16 }}>
                  Visão geral do seu dia
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center gap-1">
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700, color: COR_PRIMARY }}>{matinal.acordar.horario}</span>
                    <span style={{ fontSize: 12, color: 'var(--color-brand-gray)' }}>☀️ Acordar</span>
                  </div>
                  <div style={{ flex: 1, height: 3, background: `linear-gradient(90deg, ${COR_PRIMARY}, ${COR_GOLD}, ${COR_NOTURNO})`, borderRadius: 2 }} />
                  <div className="flex flex-col items-center gap-1">
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700, color: COR_NOTURNO }}>{noturno.dormir.horario}</span>
                    <span style={{ fontSize: 12, color: 'var(--color-brand-gray)' }}>🌙 Dormir</span>
                  </div>
                </div>

                {/* Estatísticas */}
                <div className="grid grid-cols-3 gap-3 mt-5">
                  {[
                    { n: `${ativMatinalPreenchidas}/${ATIV_MATINAIS.length}`, l: 'ativ. matinais' },
                    { n: `${blocosPreenchidos}/3`,                             l: 'blocos config.' },
                    { n: `${ativNoturnaPreenchidas}/${ATIV_NOTURNAS.length}`, l: 'ativ. noturnas' },
                  ].map((s) => (
                    <div key={s.l} className="text-center rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.6)' }}>
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
