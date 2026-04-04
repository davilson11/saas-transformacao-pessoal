'use client';

import { useState, useEffect } from 'react';
import FerramentaLayout from '@/components/dashboard/FerramentaLayout';
import { useCarregarRespostas } from '@/lib/useCarregarRespostas';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type ChaveDimensao = 'fisica' | 'mental' | 'emocional' | 'espiritual';
type Notas5 = [number, number, number, number, number];

type Diagnostico = {
  fisica:     Notas5;
  mental:     Notas5;
  emocional:  Notas5;
  espiritual: Notas5;
};

type ItemEnergia = {
  descricao:    string;
  tempoSemanal: string;
};

type DiaSemana = {
  energiaAcordar: number;
  energiaDormir:  number;
  horasSono:      string;
  exercitou:      boolean | null;
  destaque:       string;
};

// ─── Constantes ───────────────────────────────────────────────────────────────

const COR_VERDE  = '#1a5c3a';
const COR_GOLD   = '#b5840a';
const COR_BORDER = 'rgba(26,92,58,0.1)';

const ETAPAS = [
  { label: 'Bem-vindo',           descricao: 'Introdução à ferramenta'        },
  { label: 'Diagnóstico',         descricao: '4 dimensões, 20 métricas'       },
  { label: 'Drenadores e Cargas', descricao: 'O que drena e o que recarrega'  },
  { label: 'Rastreador Semanal',  descricao: '7 dias de monitoramento diário' },
];

type DimensaoConfig = {
  key:      ChaveDimensao;
  emoji:    string;
  nome:     string;
  cor:      string;
  bg:       string;
  metricas: string[];
};

const DIMENSOES: DimensaoConfig[] = [
  {
    key: 'fisica', emoji: '💪', nome: 'Física', cor: '#16a34a', bg: 'rgba(22,163,74,0.06)',
    metricas: ['Qualidade do sono', 'Prática de exercícios', 'Alimentação saudável', 'Hidratação diária', 'Disposição física'],
  },
  {
    key: 'mental', emoji: '🧠', nome: 'Mental', cor: '#2563eb', bg: 'rgba(37,99,235,0.06)',
    metricas: ['Clareza mental', 'Capacidade de foco', 'Produtividade', 'Gestão do estresse', 'Criatividade'],
  },
  {
    key: 'emocional', emoji: '❤️', nome: 'Emocional', cor: '#e11d48', bg: 'rgba(225,29,72,0.05)',
    metricas: ['Estabilidade emocional', 'Qualidade dos relacionamentos', 'Autoestima', 'Equilíbrio de humor', 'Alegria e entusiasmo'],
  },
  {
    key: 'espiritual', emoji: '✨', nome: 'Espiritual', cor: '#7c3aed', bg: 'rgba(124,58,237,0.06)',
    metricas: ['Clareza de propósito', 'Meditação / oração', 'Prática de gratidão', 'Conexão espiritual', 'Paz interior'],
  },
];

const DIAS_SEMANA = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
const TEMPO_OPTS  = ['Nenhum', '30 min', '1h', '1h30', '2h', '3h', '4h+'];

const NOTAS5_ZERO: Notas5 = [0, 0, 0, 0, 0];

const ITEM_DEFAULT: ItemEnergia = { descricao: '', tempoSemanal: 'Nenhum' };
const DIA_DEFAULT: DiaSemana    = { energiaAcordar: 0, energiaDormir: 0, horasSono: '', exercitou: null, destaque: '' };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function setNota5(arr: Notas5, idx: number, n: number): Notas5 {
  const next = [...arr] as Notas5;
  next[idx] = n;
  return next;
}

function calcScore(notas: Notas5): number {
  const filled = notas.filter(n => n > 0);
  if (filled.length === 0) return 0;
  return filled.reduce((s, n) => s + n, 0) / filled.length;
}

function calcScoreGeral(diag: Diagnostico): number {
  const all = ([...diag.fisica, ...diag.mental, ...diag.emocional, ...diag.espiritual] as number[]).filter(n => n > 0);
  if (all.length === 0) return 0;
  return all.reduce((s, n) => s + n, 0) / all.length;
}

function getStatus(nota: number): { label: string; cor: string; bg: string } {
  if (nota === 0)  return { label: '—',       cor: 'rgba(26,92,58,0.3)',  bg: 'rgba(26,92,58,0.05)'   };
  if (nota >= 7)   return { label: 'OK',       cor: '#16a34a',             bg: 'rgba(22,163,74,0.12)'  };
  if (nota >= 4)   return { label: 'Atenção',  cor: '#d97706',             bg: 'rgba(217,119,6,0.12)'  };
  return               { label: 'URGENTE',  cor: '#dc2626',             bg: 'rgba(220,38,38,0.1)'   };
}

function getScoreCor(score: number): string {
  if (score <= 0) return 'rgba(26,92,58,0.3)';
  if (score >= 7) return '#16a34a';
  if (score >= 5) return '#d97706';
  if (score >= 3) return '#f97316';
  return '#dc2626';
}

function clampInt(v: string, min: number, max: number): number {
  const n = parseInt(v);
  return isNaN(n) ? 0 : Math.min(max, Math.max(min, n));
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function MetricaRow({ nome, nota, cor, onChange }: {
  nome: string;
  nota: number;
  cor: string;
  onChange: (n: number) => void;
}) {
  const status = getStatus(nota);
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '7px 0', borderBottom: '1px solid rgba(26,92,58,0.05)',
    }}>
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: '#2d3748', flex: 1, minWidth: 170 }}>
        {nome}
      </span>
      <div style={{ display: 'flex', gap: 2 }}>
        {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
          <button
            key={n}
            onClick={() => onChange(nota === n ? 0 : n)}
            title={`${n}/10`}
            style={{
              width: 22, height: 22, borderRadius: 3, border: 'none',
              background: nota >= n ? cor : 'rgba(26,92,58,0.08)',
              cursor: 'pointer', padding: 0, transition: 'background 0.1s',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-mono)', fontSize: 8, fontWeight: 700,
              color: nota >= n ? '#fff' : 'rgba(26,92,58,0.25)',
            }}
          >
            {n}
          </button>
        ))}
      </div>
      <div style={{
        padding: '2px 8px', borderRadius: 99,
        background: status.bg, border: `1px solid ${status.cor}30`,
        fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700,
        color: status.cor, minWidth: 62, textAlign: 'center',
      }}>
        {status.label}
      </div>
    </div>
  );
}

function DiaCard({ idx, diaNome, dados, onChange }: {
  idx:     number;
  diaNome: string;
  dados:   DiaSemana;
  onChange: (d: DiaSemana) => void;
}) {
  const set = (p: Partial<DiaSemana>) => onChange({ ...dados, ...p });
  const media = dados.energiaAcordar > 0 && dados.energiaDormir > 0
    ? ((dados.energiaAcordar + dados.energiaDormir) / 2)
    : null;

  return (
    <div style={{
      background: '#fff', border: `1px solid ${COR_BORDER}`,
      borderRadius: 10, padding: '14px 16px',
      display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 8,
          background: `${COR_VERDE}0d`, border: `1px solid ${COR_VERDE}20`,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, color: 'rgba(26,92,58,0.4)', textTransform: 'uppercase', letterSpacing: '0.04em', lineHeight: 1 }}>
            Dia
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 700, color: COR_VERDE, lineHeight: 1.1 }}>
            {idx + 1}
          </span>
        </div>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 600, color: COR_VERDE, flex: 1 }}>
          {diaNome}
        </span>
        {media !== null && (
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700,
            color: getScoreCor(media),
            background: `${getScoreCor(media)}14`,
            border: `1px solid ${getScoreCor(media)}25`,
            borderRadius: 99, padding: '2px 10px',
          }}>
            Ø {media.toFixed(1)}
          </span>
        )}
      </div>

      {/* Energia + Sono */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        {[
          { label: '☀️ Energia ao acordar', key: 'energiaAcordar' as const, val: dados.energiaAcordar },
          { label: '🌙 Energia ao dormir',  key: 'energiaDormir'  as const, val: dados.energiaDormir  },
        ].map(field => (
          <div key={field.key} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, color: 'rgba(26,92,58,0.55)' }}>
              {field.label}
            </label>
            <input
              type="number"
              min={1}
              max={10}
              value={field.val || ''}
              onChange={e => set({ [field.key]: clampInt(e.target.value, 1, 10) })}
              placeholder="1–10"
              style={{
                border: `1px solid ${COR_BORDER}`, borderRadius: 6,
                padding: '6px 10px', fontSize: 16,
                fontFamily: 'var(--font-mono)',
                color: field.val ? getScoreCor(field.val) : '#9ca3af',
                fontWeight: 700, outline: 'none', background: '#fff',
              }}
            />
          </div>
        ))}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, color: 'rgba(26,92,58,0.55)' }}>
            💤 Horas de sono
          </label>
          <input
            type="text"
            value={dados.horasSono}
            onChange={e => set({ horasSono: e.target.value })}
            placeholder="Ex: 7h30"
            style={{
              border: `1px solid ${COR_BORDER}`, borderRadius: 6,
              padding: '6px 10px', fontSize: 14,
              fontFamily: 'var(--font-body)', color: '#1a2015',
              outline: 'none', background: '#fff',
            }}
          />
        </div>
      </div>

      {/* Exercitou + Destaque */}
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <label style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, color: 'rgba(26,92,58,0.55)' }}>
            🏃 Exercitou?
          </label>
          <div style={{ display: 'flex', gap: 6 }}>
            {([true, false] as const).map(val => (
              <button
                key={String(val)}
                onClick={() => set({ exercitou: val })}
                style={{
                  padding: '4px 12px', borderRadius: 99,
                  border: `1px solid ${dados.exercitou === val ? (val ? '#16a34a' : '#ef4444') : COR_BORDER}`,
                  background: dados.exercitou === val ? (val ? 'rgba(22,163,74,0.12)' : 'rgba(239,68,68,0.1)') : 'transparent',
                  color: dados.exercitou === val ? (val ? '#16a34a' : '#ef4444') : 'rgba(26,92,58,0.5)',
                  fontFamily: 'var(--font-body)', fontSize: 13,
                  fontWeight: dados.exercitou === val ? 600 : 400,
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                {val ? 'Sim' : 'Não'}
              </button>
            ))}
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5, minWidth: 160 }}>
          <label style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, color: 'rgba(26,92,58,0.55)' }}>
            ⭐ Destaque do dia
          </label>
          <input
            type="text"
            value={dados.destaque}
            onChange={e => set({ destaque: e.target.value })}
            placeholder="O que foi mais significativo hoje?"
            style={{
              border: `1px solid ${COR_BORDER}`, borderRadius: 6,
              padding: '6px 10px', fontSize: 14,
              fontFamily: 'var(--font-body)', color: '#1a2015',
              outline: 'none', background: '#fff',
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Componente Principal ─────────────────────────────────────────────────────

export default function EnergiaVitalidadePage() {
  const [etapa, setEtapa] = useState(0);

  const [diag, setDiag] = useState<Diagnostico>({
    fisica:     [...NOTAS5_ZERO] as Notas5,
    mental:     [...NOTAS5_ZERO] as Notas5,
    emocional:  [...NOTAS5_ZERO] as Notas5,
    espiritual: [...NOTAS5_ZERO] as Notas5,
  });

  const [drenadores, setDrenadores] = useState<ItemEnergia[]>(
    Array.from({ length: 6 }, () => ({ ...ITEM_DEFAULT }))
  );

  const [recarregadores, setRecarregadores] = useState<ItemEnergia[]>(
    Array.from({ length: 6 }, () => ({ ...ITEM_DEFAULT }))
  );

  const [rastreador, setRastreador] = useState<DiaSemana[]>(
    Array.from({ length: 7 }, () => ({ ...DIA_DEFAULT }))
  );

  const { dados: dadosSalvos } = useCarregarRespostas("energia-vitalidade");
  useEffect(() => { if (!dadosSalvos) return; if ((dadosSalvos as any).diag) setDiag((dadosSalvos as any).diag); if ((dadosSalvos as any).drenadores) setDrenadores((dadosSalvos as any).drenadores); if ((dadosSalvos as any).recarregadores) setRecarregadores((dadosSalvos as any).recarregadores); if ((dadosSalvos as any).rastreador) setRastreador((dadosSalvos as any).rastreador); }, [dadosSalvos]);

  // ─── Métricas ──────────────────────────────────────────────────────────────

  const totalMetricas     = [...diag.fisica, ...diag.mental, ...diag.emocional, ...diag.espiritual].filter(n => n > 0).length;
  const scoreGeral        = calcScoreGeral(diag);
  const scoresDim         = DIMENSOES.map(d => ({ key: d.key, score: calcScore(diag[d.key]) }));
  const drenFilled        = drenadores.filter(i => i.descricao.trim().length > 0).length;
  const rechFilled        = recarregadores.filter(i => i.descricao.trim().length > 0).length;
  const diasComDados      = rastreador.filter(d => d.energiaAcordar > 0 || d.energiaDormir > 0).length;
  const urgentes          = DIMENSOES.flatMap(dim =>
    dim.metricas.map((m, i) => ({ dim: dim.nome, metrica: m, nota: diag[dim.key][i] }))
  ).filter(x => x.nota > 0 && x.nota < 4);

  const progresso =
    etapa === 0 ? 0
    : etapa === 1 ? Math.min(33, Math.round((totalMetricas / 20) * 33))
    : etapa === 2 ? 33 + Math.min(33, Math.round(((drenFilled + rechFilled) / 12) * 33))
    : 66 + Math.min(34, Math.round((diasComDados / 7) * 34));

  const podeAvancar =
    etapa === 0 ? true
    : etapa === 1 ? totalMetricas >= 10
    : etapa === 2 ? (drenFilled >= 2 || rechFilled >= 2)
    : true;

  const totalItens =
    etapa === 1 ? totalMetricas
    : etapa === 2 ? drenFilled + rechFilled
    : etapa === 3 ? diasComDados
    : undefined;

  const labelItens =
    etapa === 1 ? 'métricas avaliadas'
    : etapa === 2 ? 'itens mapeados'
    : 'dias registrados';

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const setMetrica = (dim: ChaveDimensao, idx: number, nota: number) =>
    setDiag(prev => ({ ...prev, [dim]: setNota5(prev[dim], idx, nota) }));

  const setDren = (idx: number, p: Partial<ItemEnergia>) =>
    setDrenadores(prev => prev.map((x, i) => i === idx ? { ...x, ...p } : x));

  const setRech = (idx: number, p: Partial<ItemEnergia>) =>
    setRecarregadores(prev => prev.map((x, i) => i === idx ? { ...x, ...p } : x));

  const setDia = (idx: number, d: DiaSemana) =>
    setRastreador(prev => prev.map((x, i) => i === idx ? d : x));

  // ─── Painel Direito ────────────────────────────────────────────────────────

  const corScore = getScoreCor(scoreGeral);
  const pctScore = Math.round((scoreGeral / 10) * 100);

  const painelResumo = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Score geral */}
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 700, color: COR_VERDE, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
          Score de Energia
        </p>
        <div style={{
          width: 80, height: 80, borderRadius: '50%', margin: '0 auto',
          background: `conic-gradient(${corScore} ${pctScore}%, rgba(26,92,58,0.08) 0%)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: scoreGeral > 0 ? `0 0 0 4px #fff, 0 0 0 5px ${corScore}30` : 'none',
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: '#fff', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 700, color: corScore, lineHeight: 1 }}>
              {scoreGeral > 0 ? scoreGeral.toFixed(1) : '—'}
            </span>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'rgba(26,92,58,0.4)' }}>/ 10</span>
          </div>
        </div>
        {scoreGeral > 0 && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            marginTop: 8, padding: '3px 12px', borderRadius: 99,
            background: `${corScore}12`, border: `1px solid ${corScore}25`,
          }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: corScore }} />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: corScore }}>
              {scoreGeral >= 7 ? 'Energia elevada' : scoreGeral >= 5 ? 'Energia moderada' : scoreGeral >= 3 ? 'Energia baixa' : 'Energia crítica'}
            </span>
          </div>
        )}
      </div>

      {/* Dimensões */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 700, color: COR_VERDE, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Por dimensão
        </p>
        {DIMENSOES.map(dim => {
          const score = calcScore(diag[dim.key]);
          const pct   = Math.round((score / 10) * 100);
          return (
            <div key={dim.key}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(26,92,58,0.7)' }}>
                  {dim.emoji} {dim.nome}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: score > 0 ? dim.cor : 'rgba(26,92,58,0.3)' }}>
                  {score > 0 ? score.toFixed(1) : '—'}
                </span>
              </div>
              <div style={{ height: 6, borderRadius: 99, background: 'rgba(26,92,58,0.07)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${pct}%`,
                  background: dim.cor, borderRadius: 99,
                  transition: 'width 0.5s ease',
                }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Alertas URGENTE */}
      {urgentes.length > 0 && (
        <div style={{
          background: 'rgba(220,38,38,0.05)',
          border: '1px solid rgba(220,38,38,0.18)',
          borderRadius: 10, padding: '12px 14px',
        }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
            ⚠ Pontos críticos
          </p>
          {urgentes.slice(0, 4).map((u, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#dc2626', flexShrink: 0 }} />
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#7f1d1d', lineHeight: 1.4 }}>
                {u.metrica} <span style={{ color: '#dc2626', fontWeight: 600 }}>({u.nota}/10)</span>
              </span>
            </div>
          ))}
          {urgentes.length > 4 && (
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'rgba(220,38,38,0.6)' }}>
              + {urgentes.length - 4} outros
            </span>
          )}
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
          <span style={{ fontSize: 14 }}>⚡</span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: COR_GOLD }}>
            F12 · Matriz de Energia e Vitalidade
          </span>
        </div>
        <h1 style={{ color: COR_VERDE, marginBottom: 12 }}>
          Energia é o ativo mais precioso da sua vida
        </h1>
        <p style={{ color: '#4a5568', maxWidth: 560 }}>
          Você pode ter tempo mas sem energia não faz nada. Esta ferramenta mapeia suas 4 dimensões de vitalidade, identifica o que drena e o que recarrega — e cria um rastreador semanal personalizado.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {[
          { emoji: '💪', titulo: 'Física',     desc: 'Sono, exercício, alimentação e disposição' },
          { emoji: '🧠', titulo: 'Mental',     desc: 'Clareza, foco, produtividade e estresse'   },
          { emoji: '❤️', titulo: 'Emocional',  desc: 'Estabilidade, relacionamentos e autoestima' },
          { emoji: '✨', titulo: 'Espiritual', desc: 'Propósito, gratidão e paz interior'         },
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
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(26,92,58,0.6)', lineHeight: 1.5 }}>
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
          <strong>Seja honesto:</strong> avalie como você realmente está, não como gostaria estar. O diagnóstico preciso é o primeiro passo para a transformação real.
        </p>
      </div>
    </div>
  );

  // ─── Etapa 1: Diagnóstico ─────────────────────────────────────────────────

  const step1 = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div>
        <h2 style={{ color: COR_VERDE, marginBottom: 8 }}>Diagnóstico das 4 Dimensões</h2>
        <p style={{ color: '#4a5568', maxWidth: 580 }}>
          Avalie cada métrica de 1 a 10. O sistema calculará automaticamente o status de cada indicador. Seja honesto — este diagnóstico é apenas para você.
        </p>
        <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
          {[
            { label: '1–3  URGENTE', cor: '#dc2626', bg: 'rgba(220,38,38,0.1)'  },
            { label: '4–6  Atenção',  cor: '#d97706', bg: 'rgba(217,119,6,0.12)' },
            { label: '7–10 OK',       cor: '#16a34a', bg: 'rgba(22,163,74,0.12)' },
          ].map(item => (
            <span key={item.label} style={{
              fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: item.cor,
              background: item.bg, border: `1px solid ${item.cor}30`,
              borderRadius: 99, padding: '3px 10px',
            }}>
              {item.label}
            </span>
          ))}
        </div>
      </div>

      {DIMENSOES.map(dim => (
        <div key={dim.key} style={{
          background: dim.bg, border: `1.5px solid ${dim.cor}25`,
          borderRadius: 12, padding: '18px 20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <span style={{ fontSize: 22 }}>{dim.emoji}</span>
            <div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 16, fontWeight: 700, color: dim.cor }}>
                {dim.nome}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: `${dim.cor}80` }}>
                Score: {calcScore(diag[dim.key]) > 0 ? calcScore(diag[dim.key]).toFixed(1) : '—'} / 10
              </div>
            </div>
            {calcScore(diag[dim.key]) > 0 && (
              <div style={{ marginLeft: 'auto', height: 6, width: 80, borderRadius: 99, background: 'rgba(26,92,58,0.1)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${Math.round((calcScore(diag[dim.key]) / 10) * 100)}%`,
                  background: dim.cor, borderRadius: 99, transition: 'width 0.4s',
                }} />
              </div>
            )}
          </div>
          {dim.metricas.map((m, i) => (
            <MetricaRow
              key={i}
              nome={m}
              nota={diag[dim.key][i]}
              cor={dim.cor}
              onChange={n => setMetrica(dim.key, i, n)}
            />
          ))}
        </div>
      ))}

      {totalMetricas < 10 && (
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: 14, color: '#92400e',
          background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)',
          borderRadius: 8, padding: '10px 14px', margin: 0,
        }}>
          Avalie pelo menos 10 métricas para continuar ({totalMetricas}/10 preenchidas).
        </p>
      )}
    </div>
  );

  // ─── Etapa 2: Drenadores vs Recarregadores ────────────────────────────────

  const step2 = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h2 style={{ color: COR_VERDE, marginBottom: 8 }}>Drenadores e Recarregadores</h2>
        <p style={{ color: '#4a5568', maxWidth: 580 }}>
          Identifique o que suga sua energia e o que a restaura. Quanto tempo semanal você dedica a cada um? Esta consciência é transformadora.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Drenadores */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 22 }}>🔋</span>
            <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 16, fontWeight: 700, color: '#dc2626' }}>
              Drenadores
            </h3>
          </div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(26,92,58,0.6)', margin: 0 }}>
            Pessoas, situações ou hábitos que consomem sua energia
          </p>
          {drenadores.map((item, idx) => (
            <div key={idx} style={{
              background: 'rgba(220,38,38,0.04)', border: '1px solid rgba(220,38,38,0.12)',
              borderRadius: 9, padding: '12px 14px',
              display: 'flex', flexDirection: 'column', gap: 8,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{
                  width: 18, height: 18, borderRadius: '50%',
                  background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, color: '#dc2626' }}>
                    {idx + 1}
                  </span>
                </div>
                <input
                  type="text"
                  value={item.descricao}
                  onChange={e => setDren(idx, { descricao: e.target.value })}
                  placeholder="Ex: Reuniões sem pauta definida…"
                  style={{
                    flex: 1, border: '1px solid rgba(220,38,38,0.15)',
                    borderRadius: 6, padding: '5px 10px', fontSize: 14,
                    fontFamily: 'var(--font-body)', color: '#1a2015',
                    outline: 'none', background: '#fff',
                  }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(26,92,58,0.5)', fontWeight: 500 }}>
                  Tempo semanal:
                </span>
                <select
                  value={item.tempoSemanal}
                  onChange={e => setDren(idx, { tempoSemanal: e.target.value })}
                  style={{
                    border: '1px solid rgba(220,38,38,0.15)', borderRadius: 6,
                    padding: '4px 8px', fontSize: 13,
                    fontFamily: 'var(--font-body)', color: '#1a2015',
                    outline: 'none', background: '#fff', cursor: 'pointer',
                  }}
                >
                  {TEMPO_OPTS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
          ))}
        </div>

        {/* Recarregadores */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 22 }}>⚡</span>
            <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 16, fontWeight: 700, color: '#16a34a' }}>
              Recarregadores
            </h3>
          </div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(26,92,58,0.6)', margin: 0 }}>
            Atividades, pessoas ou hábitos que restauram sua vitalidade
          </p>
          {recarregadores.map((item, idx) => (
            <div key={idx} style={{
              background: 'rgba(22,163,74,0.04)', border: '1px solid rgba(22,163,74,0.15)',
              borderRadius: 9, padding: '12px 14px',
              display: 'flex', flexDirection: 'column', gap: 8,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{
                  width: 18, height: 18, borderRadius: '50%',
                  background: 'rgba(22,163,74,0.15)', border: '1px solid rgba(22,163,74,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, color: '#16a34a' }}>
                    {idx + 1}
                  </span>
                </div>
                <input
                  type="text"
                  value={item.descricao}
                  onChange={e => setRech(idx, { descricao: e.target.value })}
                  placeholder="Ex: Caminhada matinal na natureza…"
                  style={{
                    flex: 1, border: '1px solid rgba(22,163,74,0.15)',
                    borderRadius: 6, padding: '5px 10px', fontSize: 14,
                    fontFamily: 'var(--font-body)', color: '#1a2015',
                    outline: 'none', background: '#fff',
                  }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(26,92,58,0.5)', fontWeight: 500 }}>
                  Tempo semanal:
                </span>
                <select
                  value={item.tempoSemanal}
                  onChange={e => setRech(idx, { tempoSemanal: e.target.value })}
                  style={{
                    border: '1px solid rgba(22,163,74,0.15)', borderRadius: 6,
                    padding: '4px 8px', fontSize: 13,
                    fontFamily: 'var(--font-body)', color: '#1a2015',
                    outline: 'none', background: '#fff', cursor: 'pointer',
                  }}
                >
                  {TEMPO_OPTS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>

      {!podeAvancar && (
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: 14, color: '#92400e',
          background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)',
          borderRadius: 8, padding: '10px 14px', margin: 0,
        }}>
          Preencha pelo menos 2 drenadores ou 2 recarregadores para continuar.
        </p>
      )}
    </div>
  );

  // ─── Etapa 3: Rastreador Semanal ──────────────────────────────────────────

  const step3 = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h2 style={{ color: COR_VERDE, marginBottom: 8 }}>Rastreador Semanal</h2>
        <p style={{ color: '#4a5568', maxWidth: 580 }}>
          Registre sua energia ao longo da semana. Com dados reais você identificará padrões e saberá exatamente quando e por que sua energia flutua.
        </p>
      </div>

      {/* Stats rápidas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {[
          {
            label: 'Média acordar',
            valor: (() => {
              const vals = rastreador.filter(d => d.energiaAcordar > 0).map(d => d.energiaAcordar);
              return vals.length ? (vals.reduce((s, n) => s + n, 0) / vals.length).toFixed(1) : '—';
            })(),
            cor: '#d97706',
          },
          {
            label: 'Média dormir',
            valor: (() => {
              const vals = rastreador.filter(d => d.energiaDormir > 0).map(d => d.energiaDormir);
              return vals.length ? (vals.reduce((s, n) => s + n, 0) / vals.length).toFixed(1) : '—';
            })(),
            cor: '#7c3aed',
          },
          {
            label: 'Dias exercício',
            valor: rastreador.filter(d => d.exercitou === true).length,
            cor: '#16a34a',
          },
        ].map(stat => (
          <div key={stat.label} style={{
            background: '#fff', border: `1px solid ${COR_BORDER}`,
            borderRadius: 10, padding: '12px 14px', textAlign: 'center',
          }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 700, color: stat.cor, lineHeight: 1 }}>
              {stat.valor}
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(26,92,58,0.5)', marginTop: 4 }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Cards dos dias */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {rastreador.map((d, i) => (
          <DiaCard
            key={i}
            idx={i}
            diaNome={DIAS_SEMANA[i]}
            dados={d}
            onChange={updated => setDia(i, updated)}
          />
        ))}
      </div>
    </div>
  );

  // ─── Render ────────────────────────────────────────────────────────────────

  const steps = [step0, step1, step2, step3];

  return (
    <FerramentaLayout
      codigo="F12"
      nome="Energia e Vitalidade"
      descricao="Diagnostique suas 4 dimensões de energia e rastreie sua vitalidade ao longo da semana."
      etapas={ETAPAS}
      etapaAtual={etapa}
      progresso={progresso}
      onAvancar={() => setEtapa(e => Math.min(e + 1, ETAPAS.length - 1))}
      onVoltar={etapa > 0 ? () => setEtapa(e => e - 1) : undefined}
      podeAvancar={podeAvancar}
      totalItens={totalItens}
      labelItens={labelItens}
      resumo={painelResumo}
  respostas={{ diag, drenadores, recarregadores, rastreador }}
    >
      {steps[etapa]}
    </FerramentaLayout>
  );
}
