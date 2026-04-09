'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useSupabaseClient } from '@/lib/useSupabaseClient';
import type { DiarioKairos } from '@/lib/database.types';

// ─── Stopwords PT-BR ──────────────────────────────────────────────────────────

const STOP_WORDS = new Set([
  'de', 'da', 'do', 'das', 'dos', 'a', 'o', 'as', 'os', 'e', 'em',
  'no', 'na', 'nos', 'nas', 'um', 'uma', 'uns', 'umas', 'é', 'que',
  'para', 'com', 'por', 'se', 'me', 'mais', 'mas', 'não', 'foi',
  'ser', 'ter', 'bem', 'ao', 'ou', 'já', 'eu', 'meu', 'minha',
  'meus', 'minhas', 'seu', 'sua', 'seus', 'suas', 'este', 'esta',
  'esse', 'essa', 'isso', 'aqui', 'ali', 'hoje', 'dia', 'vez',
  'todo', 'toda', 'muito', 'pouco', 'sempre', 'nunca', 'quando',
  'como', 'onde', 'porque', 'pois', 'então', 'assim', 'também',
  'ainda', 'fui', 'fazer', 'feito', 'tive', 'tudo', 'nada', 'cada',
  'entre', 'sobre', 'até', 'depois', 'antes', 'num', 'numa', 'são',
  'minha', 'minhas', 'meus', 'tenho', 'tem', 'temos', 'estou',
  'está', 'estão', 'estava', 'foram', 'são', 'será', 'pode', 'pelo',
  'pela', 'pelos', 'pelas', 'mais', 'menos', 'sem', 'nos', 'nas',
]);

// ─── Mapeamento de emoções ────────────────────────────────────────────────────

const EMOCOES_POSITIVAS = new Set([
  'feliz', 'grato', 'grata', 'animado', 'animada', 'confiante',
  'sereno', 'serena', 'motivado', 'motivada', 'tranquilo', 'tranquila',
  'alegre', 'satisfeito', 'satisfeita', 'realizado', 'realizada',
  'esperançoso', 'esperançosa', 'energizado', 'energizada',
  'entusiasmado', 'entusiasmada', 'orgulhoso', 'orgulhosa',
  'conectado', 'conectada', 'calmo', 'calma', 'positivo', 'positiva',
  'otimista', 'focado', 'focada', 'forte', 'bem', 'ótimo', 'ótima',
  'excelente', 'maravilhoso', 'maravilhosa', 'radiante',
]);

const EMOCOES_NEGATIVAS = new Set([
  'ansioso', 'ansiosa', 'estressado', 'estressada', 'cansado', 'cansada',
  'triste', 'frustrado', 'frustrada', 'sobrecarregado', 'sobrecarregada',
  'irritado', 'irritada', 'preocupado', 'preocupada', 'tenso', 'tensa',
  'perdido', 'perdida', 'desmotivado', 'desmotivada', 'exausto', 'exausta',
  'confuso', 'confusa', 'inseguro', 'insegura', 'mal', 'ruim',
  'deprimido', 'deprimida', 'angustiado', 'angustiada', 'esgotado', 'esgotada',
]);

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Palavra = { texto: string; count: number };

type SentimentoLabel = 'Positivo' | 'Neutro' | 'Negativo';

type Analise = {
  topPalavras:     Palavra[];
  sentimentoLabel: SentimentoLabel;
  sentimentoPct:   number;   // 0–100, maior = mais positivo
  mediaNota:       number | null;
  totalRegistros:  number;
  dica:            string;
};

// ─── Lógica de análise ────────────────────────────────────────────────────────

function extrairPalavras(registros: DiarioKairos[]): Palavra[] {
  const freq = new Map<string, number>();

  for (const r of registros) {
    const texto = [r.preocupacao, r.gratidao, r.conquista, r.aprendizado]
      .filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
      .join(' ')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, ''); // remove acentos para matching de stopwords

    for (const word of texto.split(/[\s,.'!?;:()\[\]\-–—/\\]+/)) {
      const w = word.trim();
      if (w.length > 3 && !STOP_WORDS.has(w) && /^[a-z]+$/.test(w)) {
        freq.set(w, (freq.get(w) ?? 0) + 1);
      }
    }
  }

  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([texto, count]) => ({ texto, count }));
}

function calcularSentimento(registros: DiarioKairos[]): {
  label: SentimentoLabel;
  pct: number;
  mediaNota: number | null;
} {
  // Média do nota_dia (peso maior)
  const notas = registros
    .map((r) => r.nota_dia)
    .filter((n): n is number => n !== null && n > 0);
  const mediaNota = notas.length
    ? notas.reduce((a, b) => a + b, 0) / notas.length
    : null;

  // Contagem de emoções por sentimento
  let positivos = 0;
  let negativos = 0;
  for (const r of registros) {
    if (!r.emocao) continue;
    const emocao = r.emocao
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    if (EMOCOES_POSITIVAS.has(emocao)) positivos++;
    else if (EMOCOES_NEGATIVAS.has(emocao)) negativos++;
  }

  // Combinar nota_dia (60%) + emoções (40%)
  let pct: number;
  if (mediaNota !== null && notas.length >= 2) {
    const notaPct = (mediaNota / 10) * 100;
    const total = positivos + negativos;
    const emocaoPct = total > 0 ? (positivos / total) * 100 : 50;
    pct = Math.round(notaPct * 0.6 + emocaoPct * 0.4);
  } else if (mediaNota !== null) {
    pct = Math.round((mediaNota / 10) * 100);
  } else {
    const total = positivos + negativos;
    pct = total > 0 ? Math.round((positivos / total) * 100) : 50;
  }

  const label: SentimentoLabel =
    pct >= 65 ? 'Positivo' : pct >= 40 ? 'Neutro' : 'Negativo';

  return { label, pct, mediaNota };
}

function gerarDica(
  sentimento: SentimentoLabel,
  mediaNota: number | null,
  topPalavras: Palavra[],
  registros: DiarioKairos[],
): string {
  const negativas = registros.filter((r) => {
    if (!r.emocao) return false;
    const e = r.emocao.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return EMOCOES_NEGATIVAS.has(e);
  }).length;

  if (mediaNota !== null && mediaNota <= 4) {
    return 'Seus registros indicam uma semana pesada. A ferramenta F12 — Energia e Vitalidade pode te ajudar a diagnosticar e recuperar seu nível de energia.';
  }
  if (mediaNota !== null && mediaNota >= 8.5) {
    return 'Semana excelente! Documente o que funcionou e use isso como base para atualizar seus OKRs e metas do próximo ciclo.';
  }
  if (negativas >= 4) {
    return 'Várias emoções difíceis esta semana. O Desconstrutor de Crenças (F13) pode ajudar a identificar e transformar padrões que estão pesando.';
  }
  if (sentimento === 'Positivo') {
    return 'Sua energia emocional está elevada. Ótimo momento para avançar nas ferramentas mais desafiadoras da sua jornada.';
  }
  const topWord = topPalavras[0]?.texto;
  if (topWord) {
    return `O tema "${topWord}" aparece com frequência nos seus registros. Vale aprofundar essa reflexão na sua próxima Revisão Semanal.`;
  }
  return 'Continue registrando diariamente — com mais dados, sua análise ficará cada vez mais precisa e personalizada.';
}

function analisar(registros: DiarioKairos[]): Analise {
  const topPalavras = extrairPalavras(registros);
  const { label, pct, mediaNota } = calcularSentimento(registros);
  const dica = gerarDica(label, mediaNota, topPalavras, registros);

  return {
    topPalavras,
    sentimentoLabel: label,
    sentimentoPct:   pct,
    mediaNota,
    totalRegistros:  registros.length,
    dica,
  };
}

// ─── Cores do diário (matches diario-bordo/page.tsx) ─────────────────────────

const COR_VERDE  = '#1a5c3a';
const COR_GOLD   = '#b5840a';
const COR_BORDER = 'rgba(26,92,58,0.1)';

const SENTIMENTO_CONFIG: Record<SentimentoLabel, { cor: string; emoji: string }> = {
  Positivo: { cor: '#16a34a', emoji: '😊' },
  Neutro:   { cor: '#d97706', emoji: '😐' },
  Negativo: { cor: '#dc2626', emoji: '😔' },
};

// ─── Componente ───────────────────────────────────────────────────────────────

export default function AnaliseIA() {
  const { user } = useUser();
  const { getClient } = useSupabaseClient();

  const [analise,  setAnalise]  = useState<Analise | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [semDados, setSemDados] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      setLoading(true);
      const client = await getClient();
      const { data, error } = await client
        .from('diario_kairos')
        .select('id, emocao, preocupacao, gratidao, conquista, aprendizado, nota_dia')
        .eq('user_id', user.id)
        .order('data', { ascending: false })
        .limit(7);

      if (error || !data || data.length === 0) {
        setSemDados(true);
        setLoading(false);
        return;
      }

      setAnalise(analisar(data as DiarioKairos[]));
      setLoading(false);
    })();
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Skeleton ──
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{
          height: 12, width: 160, borderRadius: 4,
          background: 'rgba(26,92,58,0.08)',
          animation: 'analiseIAPulse 1.5s ease-in-out infinite',
        }} />
        {[100, 140, 110].map((w) => (
          <div key={w} style={{
            height: 10, width: w, borderRadius: 4,
            background: 'rgba(26,92,58,0.06)',
            animation: 'analiseIAPulse 1.5s ease-in-out infinite',
          }} />
        ))}
        <style>{`@keyframes analiseIAPulse{0%,100%{opacity:.4}50%{opacity:.9}}`}</style>
      </div>
    );
  }

  // ── Sem dados suficientes ──
  if (semDados || !analise) {
    return (
      <div style={{
        background: `${COR_GOLD}08`,
        border: `1px solid ${COR_GOLD}25`,
        borderRadius: 10, padding: '12px 14px',
      }}>
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: 12,
          color: 'rgba(26,92,58,0.55)', margin: 0,
          lineHeight: 1.5,
        }}>
          💡 A análise da semana estará disponível após o primeiro registro no Diário de Bordo.
        </p>
      </div>
    );
  }

  const sentConf = SENTIMENTO_CONFIG[analise.sentimentoLabel];
  const maxCount = analise.topPalavras[0]?.count ?? 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Header */}
      <div>
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 700,
          color: COR_VERDE, textTransform: 'uppercase', letterSpacing: '0.06em',
          marginBottom: 2,
        }}>
          🔍 Análise da Semana
        </p>
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: 11,
          color: 'rgba(26,92,58,0.45)', margin: 0,
        }}>
          Baseada nos últimos {analise.totalRegistros} registro{analise.totalRegistros !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Sentimento geral */}
      <div style={{
        background: '#fff', border: `1px solid ${COR_BORDER}`,
        borderRadius: 10, padding: '12px 14px',
        display: 'flex', flexDirection: 'column', gap: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600,
            color: 'rgba(26,92,58,0.55)', margin: 0,
          }}>
            Sentimento geral
          </p>
          <span style={{
            fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 700,
            color: sentConf.cor,
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            {sentConf.emoji} {analise.sentimentoLabel}
          </span>
        </div>

        {/* Barra sentimento */}
        <div style={{
          height: 6, borderRadius: 99, overflow: 'hidden',
          background: 'rgba(26,92,58,0.08)',
        }}>
          <div style={{
            height: '100%',
            width: `${analise.sentimentoPct}%`,
            borderRadius: 99,
            background: `linear-gradient(90deg, #dc2626 0%, #d97706 40%, #16a34a 100%)`,
            transition: 'width 0.8s ease',
          }} />
        </div>

        {analise.mediaNota !== null && (
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: 11,
            color: 'rgba(26,92,58,0.45)', margin: 0, textAlign: 'right',
          }}>
            Nota média: <strong style={{ color: sentConf.cor }}>
              {analise.mediaNota.toFixed(1)}/10
            </strong>
          </p>
        )}
      </div>

      {/* Palavras mais frequentes */}
      {analise.topPalavras.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600,
            color: 'rgba(26,92,58,0.45)', textTransform: 'uppercase',
            letterSpacing: '0.06em', margin: 0,
          }}>
            Temas recorrentes
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {analise.topPalavras.map(({ texto, count }) => {
              const peso = count / maxCount; // 0–1
              return (
                <span
                  key={texto}
                  title={`${count}× mencionado`}
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: peso >= 0.7 ? 13 : 11,
                    fontWeight: peso >= 0.7 ? 700 : 500,
                    color: peso >= 0.7 ? COR_VERDE : 'rgba(26,92,58,0.60)',
                    background: peso >= 0.7
                      ? `${COR_VERDE}12`
                      : 'rgba(26,92,58,0.05)',
                    border: `1px solid ${peso >= 0.7
                      ? COR_VERDE + '30'
                      : 'rgba(26,92,58,0.10)'}`,
                    borderRadius: 99,
                    padding: peso >= 0.7 ? '3px 10px' : '2px 8px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    cursor: 'default',
                  }}
                >
                  {texto}
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 9,
                    color: 'rgba(26,92,58,0.40)',
                  }}>
                    {count}×
                  </span>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Dica personalizada */}
      <div style={{
        background: `${COR_GOLD}08`,
        border: `1px solid ${COR_GOLD}30`,
        borderRadius: 10, padding: '12px 14px',
        display: 'flex', alignItems: 'flex-start', gap: 8,
      }}>
        <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>💡</span>
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: 12,
          color: '#5c4a00', margin: 0, lineHeight: 1.6,
        }}>
          {analise.dica}
        </p>
      </div>
    </div>
  );
}
