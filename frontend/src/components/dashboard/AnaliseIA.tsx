'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useSupabaseClient } from '@/lib/useSupabaseClient';
import type { DiarioKairos } from '@/lib/database.types';

// ─── Stopwords PT-BR ──────────────────────────────────────────────────────────

const STOP_WORDS = new Set([
  'de', 'da', 'do', 'das', 'dos', 'a', 'o', 'as', 'os', 'e', 'em',
  'no', 'na', 'nos', 'nas', 'um', 'uma', 'uns', 'umas', 'e', 'que',
  'para', 'com', 'por', 'se', 'me', 'mais', 'mas', 'nao', 'foi',
  'ser', 'ter', 'bem', 'ao', 'ou', 'ja', 'eu', 'meu', 'minha',
  'meus', 'minhas', 'seu', 'sua', 'seus', 'suas', 'este', 'esta',
  'esse', 'essa', 'isso', 'aqui', 'ali', 'hoje', 'dia', 'vez',
  'todo', 'toda', 'muito', 'pouco', 'sempre', 'nunca', 'quando',
  'como', 'onde', 'porque', 'pois', 'entao', 'assim', 'tambem',
  'ainda', 'fui', 'fazer', 'feito', 'tive', 'tudo', 'nada', 'cada',
  'entre', 'sobre', 'ate', 'depois', 'antes', 'num', 'numa', 'sao',
  'tenho', 'tem', 'temos', 'estou', 'esta', 'estao', 'estava',
  'foram', 'sera', 'pode', 'pelo', 'pela', 'pelos', 'pelas',
  'menos', 'sem', 'so', 'ja', 'bem', 'nao', 'isso', 'esta',
]);

const EMOCOES_POSITIVAS = new Set([
  'feliz', 'grato', 'grata', 'animado', 'animada', 'confiante',
  'sereno', 'serena', 'motivado', 'motivada', 'tranquilo', 'tranquila',
  'alegre', 'satisfeito', 'satisfeita', 'realizado', 'realizada',
  'esperancoso', 'esperancosa', 'energizado', 'energizada',
  'entusiasmado', 'entusiasmada', 'orgulhoso', 'orgulhosa',
  'conectado', 'conectada', 'calmo', 'calma', 'positivo', 'positiva',
  'otimista', 'focado', 'focada', 'forte', 'bem', 'otimo', 'otima',
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

/** Nível de insight conforme acúmulo de registros */
type Nivel = 'insuficiente' | 'semana' | 'padrao' | 'evolucao';

type AnaliseCompleta = {
  nivel:           Nivel;
  totalRegistros:  number;
  // ≥7 — semana
  topPalavras:     Palavra[];
  sentimentoLabel: SentimentoLabel;
  sentimentoPct:   number;
  mediaNota:       number | null;
  dica:            string;
  // ≥30 — padrão semanal
  melhorDia:       string | null;
  melhorDiaNota:   number | null;
  // ≥90 — evolução
  evolucaoPct:     number | null;
  // frase de insight hero (30+ ou 90+)
  fraseInsight:    string | null;
};

// ─── Constantes ───────────────────────────────────────────────────────────────

const DIAS_SEMANA = [
  'Domingo', 'Segunda-feira', 'Terça-feira',
  'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado',
];

const COR_VERDE  = '#1a5c3a';
const COR_GOLD   = '#b5840a';
const COR_BORDER = 'rgba(26,92,58,0.10)';

const SENTIMENTO_CONFIG: Record<SentimentoLabel, { cor: string; emoji: string }> = {
  Positivo: { cor: '#16a34a', emoji: '😊' },
  Neutro:   { cor: '#d97706', emoji: '😐' },
  Negativo: { cor: '#dc2626', emoji: '😔' },
};

// ─── Helpers de análise ───────────────────────────────────────────────────────

function norm(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function extrairPalavras(registros: DiarioKairos[]): Palavra[] {
  const freq = new Map<string, number>();
  for (const r of registros) {
    const texto = [r.preocupacao, r.gratidao, r.conquista, r.aprendizado]
      .filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
      .join(' ');

    for (const word of norm(texto).split(/[\s,.'!?;:()\[\]\-–—/\\]+/)) {
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
  const notas = registros
    .map((r) => r.nota_dia)
    .filter((n): n is number => n !== null && n > 0);
  const mediaNota = notas.length
    ? notas.reduce((a, b) => a + b, 0) / notas.length
    : null;

  let positivos = 0, negativos = 0;
  for (const r of registros) {
    if (!r.emocao) continue;
    const e = norm(r.emocao.trim());
    if (EMOCOES_POSITIVAS.has(e))      positivos++;
    else if (EMOCOES_NEGATIVAS.has(e)) negativos++;
  }

  let pct: number;
  if (mediaNota !== null && notas.length >= 2) {
    const notaPct  = (mediaNota / 10) * 100;
    const total    = positivos + negativos;
    const emocPct  = total > 0 ? (positivos / total) * 100 : 50;
    pct = Math.round(notaPct * 0.6 + emocPct * 0.4);
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
    return EMOCOES_NEGATIVAS.has(norm(r.emocao.trim()));
  }).length;

  if (mediaNota !== null && mediaNota <= 4)
    return 'Seus registros mostram uma fase pesada. A ferramenta F12 — Energia e Vitalidade pode te ajudar a recuperar sua base.';
  if (mediaNota !== null && mediaNota >= 8.5)
    return 'Semana excelente! Documente o que funcionou e use como base para atualizar seus OKRs.';
  if (negativas >= 4)
    return 'Várias emoções difíceis esta semana. O Desconstrutor de Crenças (F13) pode ajudar a transformar esses padrões.';
  if (sentimento === 'Positivo')
    return 'Sua energia emocional está elevada. Ótimo momento para avançar nas ferramentas mais desafiadoras.';
  const topWord = topPalavras[0]?.texto;
  if (topWord)
    return `O tema "${topWord}" aparece com frequência nos seus registros. Vale aprofundar na próxima Revisão Semanal.`;
  return 'Continue registrando diariamente — com mais dados, sua análise ficará cada vez mais precisa.';
}

/** Retorna o dia da semana com maior nota média (mínimo 2 registros naquele dia). */
function calcularMelhorDia(
  registros: DiarioKairos[],
): { dia: string; media: number } | null {
  const grupos: Record<number, number[]> = {};
  for (const r of registros) {
    if (!r.nota_dia || !(r as DiarioKairos & { data?: string }).data) continue;
    const dataStr = (r as DiarioKairos & { data?: string }).data;
    if (!dataStr) continue;
    const dow = new Date(dataStr + 'T12:00:00').getDay();
    if (!grupos[dow]) grupos[dow] = [];
    grupos[dow].push(r.nota_dia);
  }

  let melhor: { dow: number; media: number } | null = null;
  for (const [dowStr, notas] of Object.entries(grupos)) {
    if (notas.length < 2) continue;
    const media = notas.reduce((a, b) => a + b, 0) / notas.length;
    if (!melhor || media > melhor.media) {
      melhor = { dow: Number(dowStr), media };
    }
  }
  return melhor ? { dia: DIAS_SEMANA[melhor.dow], media: melhor.media } : null;
}

/**
 * Compara a média da primeira metade dos registros com a segunda metade (mais recente).
 * Retorna a variação percentual (positivo = cresceu, negativo = caiu).
 * registros deve estar em ordem DESCENDENTE (mais recente primeiro).
 */
function calcularEvolucao(registros: DiarioKairos[]): number | null {
  const comNota = registros.filter((r) => r.nota_dia !== null && (r.nota_dia ?? 0) > 0);
  if (comNota.length < 14) return null;

  const metade   = Math.floor(comNota.length / 2);
  const recentes = comNota.slice(0, metade);   // mais novos
  const antigos  = comNota.slice(metade);      // mais antigos

  const mediaRecente = recentes.reduce((a, b) => a + (b.nota_dia ?? 0), 0) / recentes.length;
  const mediaAntiga  = antigos.reduce((a, b) => a + (b.nota_dia ?? 0), 0) / antigos.length;
  if (mediaAntiga === 0) return null;

  return Math.round(((mediaRecente - mediaAntiga) / mediaAntiga) * 100);
}

function gerarFraseInsight(
  nivel: Nivel,
  melhorDia: string | null,
  evolucaoPct: number | null,
  topPalavras: Palavra[],
  sentimentoLabel: SentimentoLabel,
): string | null {
  if (nivel === 'evolucao' && evolucaoPct !== null) {
    if (evolucaoPct > 0)
      return `📈 Sua nota média cresceu ${evolucaoPct}% desde que você começou. Progresso real e mensurável.`;
    if (evolucaoPct < 0)
      return `📉 Sua nota média caiu ${Math.abs(evolucaoPct)}% em relação ao início — hora de revisar sua rotina.`;
    return `⚖️ Sua nota média está estável desde o início. Consistência é uma vitória.`;
  }
  if ((nivel === 'padrao' || nivel === 'evolucao') && melhorDia) {
    return `✨ Você tende a se sentir melhor às ${melhorDia}. Use isso a seu favor no planejamento semanal.`;
  }
  if (nivel === 'semana') {
    const topWord = topPalavras[0]?.texto;
    if (topWord && sentimentoLabel === 'Positivo')
      return `💚 "${topWord}" é seu tema dominante esta semana — e o padrão emocional é positivo.`;
    if (topWord)
      return `🔍 O tema "${topWord}" se destaca nos seus registros desta semana.`;
  }
  return null;
}

// ─── Função principal de análise ──────────────────────────────────────────────

function analisar(registros: DiarioKairos[]): AnaliseCompleta {
  const total = registros.length;

  const nivel: Nivel =
    total >= 90 ? 'evolucao'
    : total >= 30 ? 'padrao'
    : total >= 7  ? 'semana'
    : 'insuficiente';

  if (nivel === 'insuficiente') {
    return {
      nivel, totalRegistros: total,
      topPalavras: [], sentimentoLabel: 'Neutro', sentimentoPct: 50,
      mediaNota: null, dica: '',
      melhorDia: null, melhorDiaNota: null,
      evolucaoPct: null, fraseInsight: null,
    };
  }

  // Análise da semana (últimos 7)
  const ultimos7 = registros.slice(0, 7);
  const topPalavras     = extrairPalavras(ultimos7);
  const { label, pct, mediaNota } = calcularSentimento(ultimos7);
  const dica            = gerarDica(label, mediaNota, topPalavras, ultimos7);

  // Padrão semanal (todos os registros)
  let melhorDia: string | null = null;
  let melhorDiaNota: number | null = null;
  if (nivel === 'padrao' || nivel === 'evolucao') {
    const res = calcularMelhorDia(registros);
    if (res) { melhorDia = res.dia; melhorDiaNota = res.media; }
  }

  // Evolução (todos os registros)
  let evolucaoPct: number | null = null;
  if (nivel === 'evolucao') {
    evolucaoPct = calcularEvolucao(registros);
  }

  const fraseInsight = gerarFraseInsight(nivel, melhorDia, evolucaoPct, topPalavras, label);

  return {
    nivel, totalRegistros: total,
    topPalavras, sentimentoLabel: label, sentimentoPct: pct,
    mediaNota, dica,
    melhorDia, melhorDiaNota,
    evolucaoPct, fraseInsight,
  };
}

// ─── Sub-componentes de UI ────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {[160, 110, 140, 100].map((w) => (
        <div key={w} style={{
          height: 10, width: w, borderRadius: 4,
          background: 'rgba(26,92,58,0.07)',
          animation: 'analiseIAPulse 1.5s ease-in-out infinite',
        }} />
      ))}
      <style>{`@keyframes analiseIAPulse{0%,100%{opacity:.35}50%{opacity:.85}}`}</style>
    </div>
  );
}

function CardInsuficiente({ total }: { total: number }) {
  const faltam = 7 - total;
  const pct    = Math.round((total / 7) * 100);
  return (
    <div style={{
      background: `${COR_GOLD}08`,
      border: `1px solid ${COR_GOLD}28`,
      borderRadius: 12, padding: '16px 18px',
      display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 20 }}>📊</span>
        <div>
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 700,
            color: COR_GOLD, margin: 0,
          }}>
            Análise acumulativa
          </p>
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: 12,
            color: 'rgba(26,92,58,0.55)', margin: '2px 0 0',
          }}>
            {total === 0
              ? 'Seu primeiro insight aparece após 7 registros.'
              : `Falta${faltam === 1 ? '' : 'm'} ${faltam} registro${faltam === 1 ? '' : 's'} para o primeiro insight.`}
          </p>
        </div>
      </div>

      {/* Barra de progresso */}
      <div>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 6,
        }}>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
            color: COR_GOLD,
          }}>
            {total} de 7 dias
          </span>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 10,
            color: 'rgba(26,92,58,0.40)',
          }}>
            {pct}%
          </span>
        </div>
        <div style={{
          height: 8, borderRadius: 99, overflow: 'hidden',
          background: 'rgba(26,92,58,0.08)',
        }}>
          <div style={{
            height: '100%', width: `${pct}%`, borderRadius: 99,
            background: `linear-gradient(90deg, ${COR_GOLD}88 0%, ${COR_GOLD} 100%)`,
            transition: 'width 0.8s ease',
          }} />
        </div>
      </div>

      {/* Contadores de marcos */}
      <div style={{ display: 'flex', gap: 8 }}>
        {[
          { n: 7,  label: '1ª análise' },
          { n: 30, label: 'Padrão diário' },
          { n: 90, label: 'Evolução' },
        ].map(({ n, label }) => (
          <div key={n} style={{
            flex: 1, textAlign: 'center',
            background: total >= n ? `${COR_VERDE}10` : 'rgba(26,92,58,0.04)',
            border: `1px solid ${total >= n ? COR_VERDE + '25' : COR_BORDER}`,
            borderRadius: 8, padding: '6px 4px',
          }}>
            <p style={{
              fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
              color: total >= n ? COR_VERDE : 'rgba(26,92,58,0.25)',
              margin: 0,
            }}>
              {n}d
            </p>
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: 9,
              color: total >= n ? 'rgba(26,92,58,0.55)' : 'rgba(26,92,58,0.22)',
              margin: '2px 0 0', lineHeight: 1.2,
            }}>
              {label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function AnaliseIA() {
  const { user }      = useUser();
  const { getClient } = useSupabaseClient();

  const [analise,  setAnalise]  = useState<AnaliseCompleta | null>(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      setLoading(true);
      const client = await getClient();

      // Busca até 100 registros (suficiente para tier evolução = 90+)
      const { data, error } = await client
        .from('diario_kairos')
        .select('id, data, emocao, preocupacao, gratidao, conquista, aprendizado, nota_dia')
        .eq('user_id', user.id)
        .order('data', { ascending: false })
        .limit(100);

      if (error || !data) { setLoading(false); return; }
      setAnalise(analisar(data as DiarioKairos[]));
      setLoading(false);
    })();
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <Skeleton />;
  if (!analise) return null;

  // ── Sem dados suficientes ──────────────────────────────────────────────────
  if (analise.nivel === 'insuficiente') {
    return <CardInsuficiente total={analise.totalRegistros} />;
  }

  const sentConf = SENTIMENTO_CONFIG[analise.sentimentoLabel];
  const maxCount = analise.topPalavras[0]?.count ?? 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 700,
            color: COR_VERDE, textTransform: 'uppercase', letterSpacing: '0.06em',
            margin: 0,
          }}>
            🔍 Análise Acumulativa
          </p>
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: 11,
            color: 'rgba(26,92,58,0.45)', margin: '2px 0 0',
          }}>
            {analise.totalRegistros} registros
          </p>
        </div>

        {/* Badge do nível */}
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700,
          color: analise.nivel === 'evolucao' ? '#C8A030'
               : analise.nivel === 'padrao'   ? COR_VERDE
               : 'rgba(26,92,58,0.45)',
          background: analise.nivel === 'evolucao' ? 'rgba(200,160,48,0.12)'
                    : analise.nivel === 'padrao'   ? `${COR_VERDE}10`
                    : 'rgba(26,92,58,0.06)',
          border: `1px solid ${
            analise.nivel === 'evolucao' ? 'rgba(200,160,48,0.30)'
          : analise.nivel === 'padrao'   ? `${COR_VERDE}25`
          : COR_BORDER}`,
          borderRadius: 99, padding: '3px 8px',
          textTransform: 'uppercase', letterSpacing: '0.06em',
        }}>
          {analise.nivel === 'evolucao' ? '🏆 Nível evolução'
         : analise.nivel === 'padrao'   ? '⭐ Nível padrão'
         :                                '📅 7 dias'}
        </span>
      </div>

      {/* ── Frase de insight hero (30+ ou 90+) ──────────────────────────── */}
      {analise.fraseInsight && (
        <div style={{
          background: analise.nivel === 'evolucao'
            ? 'linear-gradient(135deg, rgba(200,160,48,0.10) 0%, rgba(200,160,48,0.04) 100%)'
            : `${COR_VERDE}08`,
          border: `1px solid ${analise.nivel === 'evolucao' ? 'rgba(200,160,48,0.30)' : COR_VERDE + '20'}`,
          borderRadius: 10, padding: '12px 16px',
        }}>
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
            color: analise.nivel === 'evolucao' ? '#5c4a00' : COR_VERDE,
            margin: 0, lineHeight: 1.55,
          }}>
            {analise.fraseInsight}
          </p>
        </div>
      )}

      {/* ── Sentimento geral (últimos 7) ─────────────────────────────────── */}
      <div style={{
        background: '#fff', border: `1px solid ${COR_BORDER}`,
        borderRadius: 10, padding: '12px 14px',
        display: 'flex', flexDirection: 'column', gap: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600,
            color: 'rgba(26,92,58,0.50)', margin: 0,
          }}>
            Padrão emocional · últimos 7
          </p>
          <span style={{
            fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 700,
            color: sentConf.cor,
          }}>
            {sentConf.emoji} {analise.sentimentoLabel}
          </span>
        </div>

        <div style={{ height: 6, borderRadius: 99, overflow: 'hidden', background: 'rgba(26,92,58,0.08)' }}>
          <div style={{
            height: '100%', width: `${analise.sentimentoPct}%`, borderRadius: 99,
            background: 'linear-gradient(90deg, #dc2626 0%, #d97706 40%, #16a34a 100%)',
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

      {/* ── Palavra mais frequente + temas ──────────────────────────────── */}
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
              const peso = count / maxCount;
              return (
                <span
                  key={texto}
                  title={`${count}× mencionado`}
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize:   peso >= 0.7 ? 13 : 11,
                    fontWeight: peso >= 0.7 ? 700 : 500,
                    color:      peso >= 0.7 ? COR_VERDE : 'rgba(26,92,58,0.55)',
                    background: peso >= 0.7 ? `${COR_VERDE}12` : 'rgba(26,92,58,0.05)',
                    border: `1px solid ${peso >= 0.7 ? COR_VERDE + '30' : 'rgba(26,92,58,0.10)'}`,
                    borderRadius: 99, padding: peso >= 0.7 ? '3px 10px' : '2px 8px',
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                  }}
                >
                  {texto}
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(26,92,58,0.35)' }}>
                    {count}×
                  </span>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Melhor dia da semana (30+) ───────────────────────────────────── */}
      {(analise.nivel === 'padrao' || analise.nivel === 'evolucao') && analise.melhorDia && (
        <div style={{
          background: `${COR_VERDE}06`,
          border: `1px solid ${COR_VERDE}20`,
          borderRadius: 10, padding: '12px 14px',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10, flexShrink: 0,
            background: `${COR_VERDE}12`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20,
          }}>
            📅
          </div>
          <div>
            <p style={{
              fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700,
              color: 'rgba(26,92,58,0.40)', textTransform: 'uppercase',
              letterSpacing: '0.08em', margin: '0 0 3px',
            }}>
              Seu melhor dia · baseado em {analise.totalRegistros} registros
            </p>
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 700,
              color: COR_VERDE, margin: 0,
            }}>
              {analise.melhorDia}
              {analise.melhorDiaNota !== null && (
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 500,
                  color: 'rgba(26,92,58,0.50)', marginLeft: 8,
                }}>
                  (média {analise.melhorDiaNota.toFixed(1)}/10)
                </span>
              )}
            </p>
          </div>
        </div>
      )}

      {/* ── Evolução do score (90+) ───────────────────────────────────────── */}
      {analise.nivel === 'evolucao' && analise.evolucaoPct !== null && (
        <div style={{
          background: analise.evolucaoPct >= 0
            ? 'rgba(22,163,74,0.07)'
            : 'rgba(220,38,38,0.06)',
          border: `1px solid ${analise.evolucaoPct >= 0
            ? 'rgba(22,163,74,0.22)'
            : 'rgba(220,38,38,0.20)'}`,
          borderRadius: 10, padding: '12px 14px',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10, flexShrink: 0,
            background: analise.evolucaoPct >= 0
              ? 'rgba(22,163,74,0.12)' : 'rgba(220,38,38,0.10)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20,
          }}>
            {analise.evolucaoPct >= 0 ? '📈' : '📉'}
          </div>
          <div>
            <p style={{
              fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700,
              color: 'rgba(26,92,58,0.40)', textTransform: 'uppercase',
              letterSpacing: '0.08em', margin: '0 0 3px',
            }}>
              Evolução do score médio
            </p>
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 700,
              color: analise.evolucaoPct >= 0 ? '#16a34a' : '#dc2626',
              margin: 0,
            }}>
              {analise.evolucaoPct > 0 ? '+' : ''}{analise.evolucaoPct}%
              <span style={{
                fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 400,
                color: 'rgba(26,92,58,0.45)', marginLeft: 8,
              }}>
                vs. seus primeiros registros
              </span>
            </p>
          </div>
        </div>
      )}

      {/* ── Dica personalizada ────────────────────────────────────────────── */}
      <div style={{
        background: `${COR_GOLD}08`,
        border: `1px solid ${COR_GOLD}28`,
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

      {/* ── Marcos de progresso (rodapé) ────────────────────────────────── */}
      <div style={{
        display: 'flex', gap: 6,
        borderTop: `1px solid ${COR_BORDER}`, paddingTop: 10,
      }}>
        {[
          { n: 7,  label: '1ª análise',    nivel: 'semana'    },
          { n: 30, label: 'Padrão diário', nivel: 'padrao'    },
          { n: 90, label: 'Evolução',      nivel: 'evolucao'  },
        ].map(({ n, label, nivel: nv }) => {
          const ativo     = analise.totalRegistros >= n;
          const corrente  = analise.nivel === nv;
          return (
            <div key={n} style={{
              flex: 1, textAlign: 'center',
              background: ativo ? (corrente ? `${COR_VERDE}12` : `${COR_VERDE}06`) : 'transparent',
              border: `1px solid ${ativo ? COR_VERDE + (corrente ? '30' : '18') : COR_BORDER}`,
              borderRadius: 8, padding: '5px 4px',
            }}>
              <p style={{
                fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
                color: ativo ? COR_VERDE : 'rgba(26,92,58,0.20)', margin: 0,
              }}>
                {ativo ? '✓' : `${n}d`}
              </p>
              <p style={{
                fontFamily: 'var(--font-body)', fontSize: 9,
                color: ativo ? 'rgba(26,92,58,0.55)' : 'rgba(26,92,58,0.20)',
                margin: '2px 0 0', lineHeight: 1.2,
              }}>
                {label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
