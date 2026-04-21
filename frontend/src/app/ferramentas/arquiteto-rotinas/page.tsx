'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import FerramentaLayout from '@/components/dashboard/FerramentaLayout';
import { useCarregarRespostas } from '@/lib/useCarregarRespostas';
import { useSupabaseClient } from '@/lib/useSupabaseClient';
import { useUser } from '@clerk/nextjs';
import { buscarRespostaFerramenta } from '@/lib/queries';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type NivelDificuldade = 1 | 2 | 3 | 4 | 5;
type NivelEnergia     = 1 | 2 | 3 | 4 | 5;

type Habito = {
  horario:    string;
  duracao:    string;
  jaFaz:      boolean | null;
  dificuldade: NivelDificuldade | null;
};

type MatinalState = {
  acordar:      Habito;
  hidratacao:   Habito;
  meditacao:    Habito;
  leitura:      Habito;
  exercicio:    Habito;
  planejamento: Habito;
  cafe:         Habito;
};

type BlocoProdutivo = {
  tarefa:  string;
  duracao: string;
  energia: NivelEnergia;
};

type BlocosState = {
  bloco1: BlocoProdutivo;
  bloco2: BlocoProdutivo;
  bloco3: BlocoProdutivo;
};

type NoturnoState = {
  diario:      Habito;
  desconexao:  Habito;
  higiene:     Habito;
  leituraLeve: Habito;
  gratidao:    Habito;
  dormir:      Habito;
};

type DiaRastreador = { matinal: boolean; produtivo: boolean; noturno: boolean };

// ─── Constantes ───────────────────────────────────────────────────────────────

const COR_VERDE  = '#1a5c3a';
const COR_GOLD   = '#b5840a';
const COR_BORDER = 'rgba(26,92,58,0.1)';

const ETAPAS = [
  { label: 'Bem-vindo',       descricao: 'Introdução à ferramenta'   },
  { label: 'Ritual Matinal',  descricao: '7 hábitos do amanhecer'    },
  { label: 'Bloco Produtivo', descricao: '3 blocos de foco profundo' },
  { label: 'Ritual Noturno',  descricao: '6 hábitos de encerramento' },
];

const HABITOS_MATINAIS: Array<{
  key: keyof MatinalState;
  emoji: string;
  nome: string;
  sugestao: string;
}> = [
  { key: 'acordar',      emoji: '☀️', nome: 'Acordar',            sugestao: '06:00' },
  { key: 'hidratacao',   emoji: '💧', nome: 'Hidratação',          sugestao: '06:05' },
  { key: 'meditacao',    emoji: '🧘', nome: 'Oração / Meditação',  sugestao: '06:10' },
  { key: 'leitura',      emoji: '📖', nome: 'Leitura',             sugestao: '06:25' },
  { key: 'exercicio',    emoji: '🏃', nome: 'Exercício',           sugestao: '06:45' },
  { key: 'planejamento', emoji: '📋', nome: 'Planejamento do dia', sugestao: '07:15' },
  { key: 'cafe',         emoji: '☕', nome: 'Café da manhã',       sugestao: '07:30' },
];

const HABITOS_NOTURNOS: Array<{
  key: keyof NoturnoState;
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

const BLOCOS_CONFIG: Array<{
  key: keyof BlocosState;
  emoji: string;
  nome: string;
  periodo: string;
  cor: string;
  bg: string;
}> = [
  { key: 'bloco1', emoji: '🟢', nome: 'Bloco 1', periodo: '08:00 – 10:00', cor: '#16a34a', bg: 'rgba(22,163,74,0.07)'   },
  { key: 'bloco2', emoji: '🔵', nome: 'Bloco 2', periodo: '10:30 – 12:30', cor: '#2563eb', bg: 'rgba(37,99,235,0.07)'   },
  { key: 'bloco3', emoji: '🟣', nome: 'Bloco 3', periodo: '14:00 – 16:00', cor: '#7c3aed', bg: 'rgba(124,58,237,0.07)'  },
];

const RITUAIS_RASTREADOR: Array<{
  key: keyof DiaRastreador;
  emoji: string;
  nome: string;
  cor: string;
}> = [
  { key: 'matinal',   emoji: '🌅', nome: 'Matinal',   cor: '#d97706' },
  { key: 'produtivo', emoji: '💼', nome: 'Produtivo', cor: '#2563eb' },
  { key: 'noturno',   emoji: '🌙', nome: 'Noturno',   cor: '#7c3aed' },
];

const DURACAO_HABITO = ['5 min','10 min','15 min','20 min','30 min','45 min','60 min','90 min'];
const DURACAO_BLOCO  = ['30 min','45 min','1h','1h30','2h','2h30','3h'];
const DIAS_SEMANA    = ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'];

const ENERGIA_INFO: Record<NivelEnergia, { label: string; cor: string }> = {
  1: { label: 'Muito baixa', cor: '#ef4444' },
  2: { label: 'Baixa',       cor: '#f97316' },
  3: { label: 'Média',       cor: '#eab308' },
  4: { label: 'Alta',        cor: '#84cc16' },
  5: { label: 'Máxima',      cor: '#22c55e' },
};

const DIFICULDADE_INFO: Record<NivelDificuldade, string> = {
  1: 'Fácil',
  2: 'Simples',
  3: 'Moderado',
  4: 'Difícil',
  5: 'Extremo',
};

function getDificuldadeCor(n: NivelDificuldade): string {
  const cores: Record<NivelDificuldade, string> = {
    1: '#22c55e',
    2: '#84cc16',
    3: '#eab308',
    4: '#f97316',
    5: '#ef4444',
  };
  return cores[n];
}

const HABITO_DEFAULT: Habito = { horario: '', duracao: '15 min', jaFaz: null, dificuldade: null };
const BLOCO_DEFAULT: BlocoProdutivo = { tarefa: '', duracao: '1h', energia: 3 };

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function HabitoRow({
  emoji, nome, sugestao, habito, onChange,
}: {
  emoji: string;
  nome: string;
  sugestao: string;
  habito: Habito;
  onChange: (h: Habito) => void;
}) {
  const set = (partial: Partial<Habito>) => onChange({ ...habito, ...partial });

  return (
    <div style={{
      background: '#fff',
      border: `1px solid ${COR_BORDER}`,
      borderRadius: 10,
      padding: '14px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
    }}>
      {/* Linha 1: emoji + nome + horário + duração */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 20, flexShrink: 0 }}>{emoji}</span>
        <span style={{
          fontFamily: 'var(--font-body)',
          fontSize: 15,
          fontWeight: 600,
          color: COR_VERDE,
          flex: 1,
          minWidth: 130,
        }}>
          {nome}
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(26,92,58,0.5)', fontWeight: 500 }}>
            Horário
          </span>
          <input
            type="time"
            value={habito.horario}
            placeholder={sugestao}
            onChange={e => set({ horario: e.target.value })}
            style={{
              border: `1px solid ${COR_BORDER}`,
              borderRadius: 6,
              padding: '4px 8px',
              fontSize: 14,
              fontFamily: 'var(--font-mono)',
              color: COR_VERDE,
              outline: 'none',
              width: 96,
              background: habito.horario ? 'rgba(26,92,58,0.03)' : '#fff',
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(26,92,58,0.5)', fontWeight: 500 }}>
            Duração
          </span>
          <select
            value={habito.duracao}
            onChange={e => set({ duracao: e.target.value })}
            style={{
              border: `1px solid ${COR_BORDER}`,
              borderRadius: 6,
              padding: '4px 8px',
              fontSize: 14,
              fontFamily: 'var(--font-body)',
              color: COR_VERDE,
              outline: 'none',
              background: '#fff',
              cursor: 'pointer',
            }}
          >
            {DURACAO_HABITO.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      {/* Linha 2: já faço + dificuldade */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(26,92,58,0.6)' }}>
            Já pratico?
          </span>
          {([true, false] as const).map(val => (
            <button
              key={String(val)}
              onClick={() => set({ jaFaz: val })}
              style={{
                padding: '3px 12px',
                borderRadius: 99,
                border: `1px solid ${habito.jaFaz === val ? (val ? '#16a34a' : '#ef4444') : COR_BORDER}`,
                background: habito.jaFaz === val
                  ? (val ? 'rgba(22,163,74,0.12)' : 'rgba(239,68,68,0.1)')
                  : 'transparent',
                color: habito.jaFaz === val
                  ? (val ? '#16a34a' : '#ef4444')
                  : 'rgba(26,92,58,0.5)',
                fontFamily: 'var(--font-body)',
                fontSize: 13,
                fontWeight: habito.jaFaz === val ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {val ? 'Sim' : 'Não'}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(26,92,58,0.6)' }}>
            Dificuldade:
          </span>
          <div style={{ display: 'flex', gap: 4 }}>
            {([1,2,3,4,5] as NivelDificuldade[]).map(n => (
              <button
                key={n}
                onClick={() => set({ dificuldade: n })}
                title={DIFICULDADE_INFO[n]}
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  border: '1.5px solid',
                  borderColor: (habito.dificuldade !== null && habito.dificuldade >= n)
                    ? getDificuldadeCor(n)
                    : 'rgba(26,92,58,0.15)',
                  background: (habito.dificuldade !== null && habito.dificuldade >= n)
                    ? getDificuldadeCor(n)
                    : 'transparent',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'all 0.15s',
                }}
              />
            ))}
          </div>
          {habito.dificuldade && (
            <span style={{
              fontFamily: 'var(--font-body)',
              fontSize: 12,
              color: getDificuldadeCor(habito.dificuldade),
              fontWeight: 600,
              minWidth: 58,
            }}>
              {DIFICULDADE_INFO[habito.dificuldade]}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function BlocoProdutivoCard({
  config, bloco, onChange,
}: {
  config: typeof BLOCOS_CONFIG[0];
  bloco: BlocoProdutivo;
  onChange: (b: BlocoProdutivo) => void;
}) {
  const set = (partial: Partial<BlocoProdutivo>) => onChange({ ...bloco, ...partial });

  return (
    <div style={{
      background: config.bg,
      border: `1.5px solid ${config.cor}30`,
      borderRadius: 12,
      padding: '18px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 22, flexShrink: 0 }}>{config.emoji}</span>
        <div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 700, color: config.cor }}>
            {config.nome}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: `${config.cor}99` }}>
            {config.periodo}
          </div>
        </div>
      </div>

      {/* Tarefa principal */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: 'rgba(26,92,58,0.7)' }}>
          Tarefa principal
        </label>
        <input
          type="text"
          value={bloco.tarefa}
          onChange={e => set({ tarefa: e.target.value })}
          placeholder="Ex: Escrever capítulo do livro…"
          style={{
            border: `1px solid ${config.cor}30`,
            borderRadius: 8,
            padding: '8px 12px',
            fontSize: 15,
            fontFamily: 'var(--font-body)',
            color: '#1a2015',
            outline: 'none',
            background: 'rgba(255,255,255,0.75)',
          }}
        />
      </div>

      {/* Duração + Energia */}
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: 'rgba(26,92,58,0.7)' }}>
            Duração
          </label>
          <select
            value={bloco.duracao}
            onChange={e => set({ duracao: e.target.value })}
            style={{
              border: `1px solid ${config.cor}30`,
              borderRadius: 8,
              padding: '8px 12px',
              fontSize: 14,
              fontFamily: 'var(--font-body)',
              color: '#1a2015',
              outline: 'none',
              background: 'rgba(255,255,255,0.75)',
              cursor: 'pointer',
            }}
          >
            {DURACAO_BLOCO.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: 'rgba(26,92,58,0.7)' }}>
            Energia necessária
          </label>
          <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
            {([1,2,3,4,5] as NivelEnergia[]).map(n => (
              <button
                key={n}
                onClick={() => set({ energia: n })}
                title={ENERGIA_INFO[n].label}
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  border: '1.5px solid',
                  borderColor: bloco.energia >= n ? ENERGIA_INFO[n].cor : 'rgba(26,92,58,0.15)',
                  background: bloco.energia >= n ? ENERGIA_INFO[n].cor : 'transparent',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'all 0.15s',
                }}
              />
            ))}
            <span style={{
              fontFamily: 'var(--font-body)',
              fontSize: 13,
              color: ENERGIA_INFO[bloco.energia].cor,
              fontWeight: 600,
              marginLeft: 4,
              minWidth: 72,
            }}>
              {ENERGIA_INFO[bloco.energia].label}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Componente Principal ─────────────────────────────────────────────────────

export default function ArquitetoRotinasPage() {
  const [etapa, setEtapa] = useState(0);

  const [matinal, setMatinal] = useState<MatinalState>({
    acordar:      { ...HABITO_DEFAULT },
    hidratacao:   { ...HABITO_DEFAULT },
    meditacao:    { ...HABITO_DEFAULT },
    leitura:      { ...HABITO_DEFAULT },
    exercicio:    { ...HABITO_DEFAULT },
    planejamento: { ...HABITO_DEFAULT },
    cafe:         { ...HABITO_DEFAULT },
  });

  const [blocos, setBlocos] = useState<BlocosState>({
    bloco1: { ...BLOCO_DEFAULT },
    bloco2: { ...BLOCO_DEFAULT },
    bloco3: { ...BLOCO_DEFAULT },
  });

  const [noturno, setNoturno] = useState<NoturnoState>({
    diario:      { ...HABITO_DEFAULT },
    desconexao:  { ...HABITO_DEFAULT },
    higiene:     { ...HABITO_DEFAULT },
    leituraLeve: { ...HABITO_DEFAULT },
    gratidao:    { ...HABITO_DEFAULT },
    dormir:      { ...HABITO_DEFAULT },
  });

  const [rastreador, setRastreador] = useState<DiaRastreador[]>(
    DIAS_SEMANA.map(() => ({ matinal: false, produtivo: false, noturno: false }))
  );

  const { dados: dadosSalvos } = useCarregarRespostas("arquiteto-rotinas");
  useEffect(() => { if (!dadosSalvos) return; if ((dadosSalvos as any).matinal) setMatinal((dadosSalvos as any).matinal); if ((dadosSalvos as any).blocos) setBlocos((dadosSalvos as any).blocos); if ((dadosSalvos as any).noturno) setNoturno((dadosSalvos as any).noturno); if ((dadosSalvos as any).rastreador) setRastreador((dadosSalvos as any).rastreador); }, [dadosSalvos]);

  // ─── Verificação de pré-requisitos (F08 e F09) ─────────────────────────────
  type StatusPreReq = 'loading' | 'done' | 'not_done';
  const [statusF08, setStatusF08] = useState<StatusPreReq>('loading');
  const [statusF09, setStatusF09] = useState<StatusPreReq>('loading');
  const { user } = useUser();
  const { getClient } = useSupabaseClient();

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      const client = await getClient();
      const [r08, r09] = await Promise.all([
        buscarRespostaFerramenta(user.id, 'rotina-ideal', client),
        buscarRespostaFerramenta(user.id, 'auditoria-tempo', client),
      ]);
      setStatusF08(r08?.concluida ? 'done' : 'not_done');
      setStatusF09(r09?.concluida ? 'done' : 'not_done');
    })();
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const ambosFeitos  = statusF08 === 'done' && statusF09 === 'done';
  const umFeito      = (statusF08 === 'done') !== (statusF09 === 'done');
  const nenhumFeito  = statusF08 === 'not_done' && statusF09 === 'not_done';
  const carregando   = statusF08 === 'loading' || statusF09 === 'loading';

  const bannerPreReq = carregando ? null : (
    <div style={{
      borderRadius: 12,
      padding: '14px 18px',
      marginBottom: 20,
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      ...(ambosFeitos ? {
        background: 'rgba(22,163,74,0.08)',
        border: '1.5px solid rgba(22,163,74,0.35)',
      } : umFeito ? {
        background: 'rgba(217,119,6,0.08)',
        border: '1.5px solid rgba(217,119,6,0.35)',
      } : {
        background: 'rgba(37,99,235,0.07)',
        border: '1.5px solid rgba(37,99,235,0.3)',
      }),
    }}>
      {ambosFeitos && (
        <>
          <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 700, color: '#15803d' }}>
            ✅ Pré-requisitos concluídos
          </p>
          <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 13, color: '#166534' }}>
            Você já tem sua Rotina Ideal e seu Dia Típico definidos. Vamos construir sua rotina definitiva com base neles.
          </p>
        </>
      )}
      {umFeito && (
        <>
          <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 700, color: '#92400e' }}>
            ⚠️ Um pré-requisito pendente
          </p>
          <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 13, color: '#78350f' }}>
            {statusF08 === 'not_done' && (
              <>Você ainda não concluiu a <Link href="/ferramentas/rotina-ideal" style={{ color: '#b45309', fontWeight: 600, textDecoration: 'underline' }}>Rotina Ideal (F08)</Link>. Concluí-la enriquece essa etapa.</>
            )}
            {statusF09 === 'not_done' && (
              <>Você ainda não concluiu a <Link href="/ferramentas/auditoria-tempo" style={{ color: '#b45309', fontWeight: 600, textDecoration: 'underline' }}>Auditoria de Tempo (F09)</Link>. Concluí-la enriquece essa etapa.</>
            )}
          </p>
        </>
      )}
      {nenhumFeito && (
        <>
          <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 700, color: '#1d4ed8' }}>
            💡 Dica: faça primeiro F08 e F09
          </p>
          <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 13, color: '#1e40af' }}>
            Para melhores resultados, conclua antes{' '}
            <Link href="/ferramentas/rotina-ideal" style={{ color: '#1d4ed8', fontWeight: 600, textDecoration: 'underline' }}>Rotina Ideal (F08)</Link>
            {' '}e{' '}
            <Link href="/ferramentas/auditoria-tempo" style={{ color: '#1d4ed8', fontWeight: 600, textDecoration: 'underline' }}>Auditoria de Tempo (F09)</Link>.
            Você pode continuar aqui mesmo assim.
          </p>
        </>
      )}
    </div>
  );

  // ─── Métricas ──────────────────────────────────────────────────────────────

  const matinalPreenchidos = HABITOS_MATINAIS.filter(h => matinal[h.key].horario.length > 0).length;
  const blocoPreenchidos   = BLOCOS_CONFIG.filter(b => blocos[b.key].tarefa.length > 0).length;
  const noturnoPreenchidos = HABITOS_NOTURNOS.filter(h => noturno[h.key].horario.length > 0).length;

  const progresso =
    etapa === 0 ? 0
    : etapa === 1 ? Math.min(33, Math.round((matinalPreenchidos / 7) * 33))
    : etapa === 2 ? 33 + Math.min(33, Math.round((blocoPreenchidos / 3) * 33))
    : 66 + Math.min(34, Math.round((noturnoPreenchidos / 6) * 34));

  const podeAvancar =
    etapa === 0 ? true
    : etapa === 1 ? matinalPreenchidos >= 3
    : etapa === 2 ? blocoPreenchidos >= 1
    : noturnoPreenchidos >= 3;

  const totalItens =
    etapa === 1 ? matinalPreenchidos
    : etapa === 2 ? blocoPreenchidos
    : etapa === 3 ? noturnoPreenchidos
    : undefined;

  const labelItens =
    etapa === 2 ? 'blocos configurados' : 'hábitos configurados';

  // ─── Rastreador ────────────────────────────────────────────────────────────

  const toggleRastreador = (diaIdx: number, ritual: keyof DiaRastreador) => {
    setRastreador(prev =>
      prev.map((d, i) =>
        i === diaIdx ? ({ ...d, [ritual]: !d[ritual] } as DiaRastreador) : d
      )
    );
  };

  const consistenciaDias = (ritual: keyof DiaRastreador) =>
    rastreador.filter(d => d[ritual]).length;

  const totalExecucoes = rastreador.reduce(
    (sum, d) => sum + (d.matinal ? 1 : 0) + (d.produtivo ? 1 : 0) + (d.noturno ? 1 : 0),
    0
  );

  // ─── Painel Direito ────────────────────────────────────────────────────────

  const painelResumo = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Título */}
      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize: 13,
        fontWeight: 700,
        color: COR_VERDE,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
      }}>
        Rastreador Semanal
      </p>

      {/* Grid cabeçalho */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '60px repeat(7, 1fr)',
        gap: 2,
        marginBottom: 2,
      }}>
        <div />
        {DIAS_SEMANA.map(d => (
          <div key={d} style={{
            textAlign: 'center',
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            fontWeight: 700,
            color: 'rgba(26,92,58,0.4)',
            letterSpacing: '0.04em',
          }}>
            {d}
          </div>
        ))}
      </div>

      {/* Linhas dos rituais */}
      {RITUAIS_RASTREADOR.map(ritual => (
        <div key={ritual.key} style={{
          display: 'grid',
          gridTemplateColumns: '60px repeat(7, 1fr)',
          gap: 2,
          alignItems: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, paddingRight: 4 }}>
            <span style={{ fontSize: 12 }}>{ritual.emoji}</span>
            <span style={{
              fontFamily: 'var(--font-body)',
              fontSize: 10,
              fontWeight: 600,
              color: ritual.cor,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
            }}>
              {ritual.nome}
            </span>
          </div>
          {DIAS_SEMANA.map((_, diaIdx) => {
            const marcado = rastreador[diaIdx][ritual.key];
            return (
              <button
                key={diaIdx}
                onClick={() => toggleRastreador(diaIdx, ritual.key)}
                title={`${ritual.nome} — ${DIAS_SEMANA[diaIdx]}`}
                style={{
                  height: 28,
                  borderRadius: 6,
                  border: `1.5px solid ${marcado ? ritual.cor : 'rgba(26,92,58,0.12)'}`,
                  background: marcado ? `${ritual.cor}20` : 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s',
                  padding: 0,
                }}
              >
                {marcado && (
                  <span style={{ fontSize: 11, color: ritual.cor, fontWeight: 700, lineHeight: 1 }}>✓</span>
                )}
              </button>
            );
          })}
        </div>
      ))}

      {/* Consistência */}
      <div style={{
        borderTop: `1px solid ${COR_BORDER}`,
        paddingTop: 14,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 12,
          fontWeight: 700,
          color: COR_VERDE,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: 2,
        }}>
          Consistência
        </p>
        {RITUAIS_RASTREADOR.map(ritual => {
          const dias = consistenciaDias(ritual.key);
          const pct  = Math.round((dias / 7) * 100);
          return (
            <div key={ritual.key}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(26,92,58,0.7)' }}>
                  {ritual.emoji} {ritual.nome}
                </span>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 13,
                  fontWeight: 700,
                  color: ritual.cor,
                }}>
                  {dias}/7
                </span>
              </div>
              <div style={{ height: 5, borderRadius: 99, background: 'rgba(26,92,58,0.08)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${pct}%`,
                  background: ritual.cor,
                  borderRadius: 99,
                  transition: 'width 0.4s ease',
                }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Total */}
      <div style={{
        background: 'rgba(26,92,58,0.04)',
        border: `1px solid ${COR_BORDER}`,
        borderRadius: 10,
        padding: '12px 14px',
        textAlign: 'center',
      }}>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 28,
          fontWeight: 700,
          color: COR_VERDE,
          lineHeight: 1,
        }}>
          {totalExecucoes}
          <span style={{ fontSize: 14, fontWeight: 400, color: 'rgba(26,92,58,0.45)', marginLeft: 4 }}>
            / 21
          </span>
        </div>
        <div style={{
          fontFamily: 'var(--font-body)',
          fontSize: 12,
          color: 'rgba(26,92,58,0.5)',
          marginTop: 4,
        }}>
          execuções na semana
        </div>
      </div>
    </div>
  );

  // ─── Etapa 0: Bem-vindo ────────────────────────────────────────────────────

  const step0 = (
    <div style={{ maxWidth: 620, display: 'flex', flexDirection: 'column', gap: 28 }}>
      <div>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          background: `${COR_GOLD}15`,
          border: `1px solid ${COR_GOLD}30`,
          borderRadius: 99,
          padding: '4px 14px',
          marginBottom: 16,
        }}>
          <span style={{ fontSize: 14 }}>🏗️</span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: COR_GOLD }}>
            F10 · Arquiteto de Rotinas
          </span>
        </div>
        <h1 style={{ color: COR_VERDE, marginBottom: 12 }}>
          Projete a rotina que vai transformar sua vida
        </h1>
        <p style={{ color: '#4a5568', maxWidth: 560 }}>
          Rotinas de alta performance não são criadas por acaso — são arquitetadas com intenção. Estruture seu ritual matinal, seus blocos produtivos e seu ritual noturno, e rastreie a consistência ao longo da semana.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {[
          { emoji: '🌅', titulo: 'Ritual Matinal',   desc: '7 hábitos para começar o dia com energia' },
          { emoji: '💼', titulo: 'Bloco Produtivo',  desc: '3 blocos de foco profundo e alto desempenho' },
          { emoji: '🌙', titulo: 'Ritual Noturno',   desc: '6 hábitos para encerrar o dia com qualidade' },
          { emoji: '📊', titulo: 'Rastreador Semanal', desc: 'Marque rituais executados e veja sua consistência' },
        ].map(item => (
          <div key={item.titulo} style={{
            background: '#fff',
            border: `1px solid ${COR_BORDER}`,
            borderRadius: 12,
            padding: '16px 18px',
            display: 'flex',
            gap: 12,
            alignItems: 'flex-start',
          }}>
            <span style={{ fontSize: 24, flexShrink: 0 }}>{item.emoji}</span>
            <div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 700, color: COR_VERDE, marginBottom: 4 }}>
                {item.titulo}
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(26,92,58,0.6)', lineHeight: 1.5 }}>
                {item.desc}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{
        background: 'rgba(181,132,10,0.06)',
        border: `1px solid ${COR_GOLD}25`,
        borderRadius: 12,
        padding: '16px 20px',
        display: 'flex',
        gap: 12,
        alignItems: 'flex-start',
      }}>
        <span style={{ fontSize: 20, flexShrink: 0 }}>💡</span>
        <p style={{ color: '#5c4a00', margin: 0, fontSize: 14 }}>
          <strong>Dica:</strong> Comece pelo horário de acordar e deixe tudo fluir a partir daí. A consistência de uma boa rotina supera qualquer motivação momentânea.
        </p>
      </div>
    </div>
  );

  // ─── Etapa 1: Ritual Matinal ───────────────────────────────────────────────

  const step1 = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={{ color: COR_VERDE, marginBottom: 8 }}>Ritual Matinal</h2>
        <p style={{ color: '#4a5568', maxWidth: 580 }}>
          Configure cada hábito do seu amanhecer. Indique se já pratica e qual a dificuldade — isso ajuda a priorizar as mudanças mais importantes.
        </p>
      </div>

      {HABITOS_MATINAIS.map(h => (
        <HabitoRow
          key={h.key}
          emoji={h.emoji}
          nome={h.nome}
          sugestao={h.sugestao}
          habito={matinal[h.key]}
          onChange={updated => setMatinal(prev => ({ ...prev, [h.key]: updated }))}
        />
      ))}

      {matinalPreenchidos < 3 && (
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 14,
          color: '#92400e',
          background: 'rgba(251,191,36,0.1)',
          border: '1px solid rgba(251,191,36,0.3)',
          borderRadius: 8,
          padding: '10px 14px',
          margin: 0,
        }}>
          Preencha o horário de pelo menos 3 hábitos para continuar.
        </p>
      )}
    </div>
  );

  // ─── Etapa 2: Blocos Produtivos ────────────────────────────────────────────

  const step2 = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <h2 style={{ color: COR_VERDE, marginBottom: 8 }}>Bloco Produtivo</h2>
        <p style={{ color: '#4a5568', maxWidth: 580 }}>
          Defina seus 3 blocos de foco profundo. Cada bloco tem uma tarefa principal clara, duração definida e o nível de energia que a tarefa exige para ser executada com qualidade.
        </p>
      </div>

      {BLOCOS_CONFIG.map(config => (
        <BlocoProdutivoCard
          key={config.key}
          config={config}
          bloco={blocos[config.key]}
          onChange={updated => setBlocos(prev => ({ ...prev, [config.key]: updated }))}
        />
      ))}

      {blocoPreenchidos === 0 && (
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 14,
          color: '#92400e',
          background: 'rgba(251,191,36,0.1)',
          border: '1px solid rgba(251,191,36,0.3)',
          borderRadius: 8,
          padding: '10px 14px',
          margin: 0,
        }}>
          Defina a tarefa principal de pelo menos 1 bloco para continuar.
        </p>
      )}
    </div>
  );

  // ─── Etapa 3: Ritual Noturno ───────────────────────────────────────────────

  const step3 = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={{ color: COR_VERDE, marginBottom: 8 }}>Ritual Noturno</h2>
        <p style={{ color: '#4a5568', maxWidth: 580 }}>
          O encerramento do dia é tão importante quanto o começo. Configure os hábitos noturnos que vão garantir descanso de qualidade e preparo para o dia seguinte.
        </p>
      </div>

      {HABITOS_NOTURNOS.map(h => (
        <HabitoRow
          key={h.key}
          emoji={h.emoji}
          nome={h.nome}
          sugestao={h.sugestao}
          habito={noturno[h.key]}
          onChange={updated => setNoturno(prev => ({ ...prev, [h.key]: updated }))}
        />
      ))}

      {noturnoPreenchidos < 3 && (
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 14,
          color: '#92400e',
          background: 'rgba(251,191,36,0.1)',
          border: '1px solid rgba(251,191,36,0.3)',
          borderRadius: 8,
          padding: '10px 14px',
          margin: 0,
        }}>
          Preencha o horário de pelo menos 3 hábitos para continuar.
        </p>
      )}
    </div>
  );

  // ─── Render ────────────────────────────────────────────────────────────────

  const steps = [step0, step1, step2, step3];

  return (
    <FerramentaLayout
      codigo="F10"
      nome="Arquiteto de Rotinas"
      descricao="Projete rituais matinal, produtivo e noturno — e rastreie sua consistência semanal."
      etapas={ETAPAS}
      etapaAtual={etapa}
      progresso={progresso}
      onAvancar={() => setEtapa(e => Math.min(e + 1, ETAPAS.length - 1))}
      onVoltar={etapa > 0 ? () => setEtapa(e => e - 1) : undefined}
      podeAvancar={podeAvancar}
      totalItens={totalItens}
      labelItens={labelItens}
      resumo={painelResumo}
  respostas={{ matinal, blocos, noturno, rastreador }}
    >
      {bannerPreReq}
      {steps[etapa]}
    </FerramentaLayout>
  );
}
