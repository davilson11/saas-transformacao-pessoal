'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { useSupabaseClient } from '@/lib/useSupabaseClient';
import type { DiarioKairos } from '@/lib/database.types';

// ─── Stopwords PT-BR ──────────────────────────────────────────────────────────

const STOP_WORDS = new Set([
  'de', 'da', 'do', 'das', 'dos', 'a', 'o', 'as', 'os', 'e', 'em',
  'no', 'na', 'nos', 'nas', 'um', 'uma', 'uns', 'umas', 'que',
  'para', 'com', 'por', 'se', 'me', 'mais', 'mas', 'nao', 'foi',
  'ser', 'ter', 'bem', 'ao', 'ou', 'ja', 'eu', 'meu', 'minha',
  'meus', 'minhas', 'seu', 'sua', 'seus', 'suas', 'este', 'esta',
  'esse', 'essa', 'isso', 'aqui', 'ali', 'hoje', 'dia', 'vez',
  'todo', 'toda', 'muito', 'pouco', 'sempre', 'nunca', 'quando',
  'como', 'onde', 'porque', 'pois', 'entao', 'assim', 'tambem',
  'ainda', 'fui', 'fazer', 'feito', 'tive', 'tudo', 'nada', 'cada',
  'entre', 'sobre', 'ate', 'depois', 'antes', 'num', 'numa', 'sao',
  'tenho', 'tem', 'temos', 'estou', 'estao', 'estava',
  'foram', 'sera', 'pode', 'pelo', 'pela', 'pelos', 'pelas',
  'menos', 'sem', 'so', 'nada', 'coisa', 'coisas', 'outro', 'outra',
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

const EMOCOES_CANSACO = new Set([
  'cansado', 'cansada', 'exausto', 'exausta', 'esgotado', 'esgotada',
  'sobrecarregado', 'sobrecarregada',
]);

const EMOCOES_ANSIEDADE = new Set([
  'ansioso', 'ansiosa', 'preocupado', 'preocupada', 'tenso', 'tensa',
  'angustiado', 'angustiada',
]);

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Palavra = { texto: string; count: number };
type SentimentoLabel = 'Positivo' | 'Neutro' | 'Negativo';
type Nivel = 'minimo' | 'inicio' | 'semana' | 'padrao' | 'evolucao' | 'transformacao';

type FerramentaRec = {
  codigo: string;
  nome: string;
  slug: string;
  motivo: string;
};

type MentorInsight = {
  nivel: Nivel;
  totalRegistros: number;
  mensagem: string;
  pergunta: string;
  ferramenta: FerramentaRec | null;
  topPalavras: Palavra[];
  sentimentoLabel: SentimentoLabel;
  sentimentoPct: number;
  mediaNota: number | null;
  emocaoDominante: string | null;
  melhorDia: string | null;
  piorDia: string | null;
  melhorDiaNota: number | null;
  piorDiaNota: number | null;
  evolucaoPct: number | null;
  emTendenciaPositiva: boolean;
  primeiraData: string | null;
};

// ─── Ferramentas recomendáveis ────────────────────────────────────────────────

const FERRAMENTAS: Record<string, FerramentaRec> = {
  energia:  { codigo: 'F12', nome: 'Energia e Vitalidade',    slug: 'energia-vitalidade',     motivo: 'seus registros mostram desgaste físico e mental acumulado' },
  crencas:  { codigo: 'F13', nome: 'Desconstrutor de Crenças',slug: 'desconstrutor-crencas',  motivo: 'há padrões emocionais recorrentes que merecem atenção profunda' },
  okrs:     { codigo: 'F05', nome: 'OKRs Pessoais',           slug: 'okrs-pessoais',          motivo: 'sua energia está alta — ótimo momento para definir metas ousadas' },
  rotina:   { codigo: 'F08', nome: 'Rotina Ideal',            slug: 'rotina-ideal',           motivo: 'a variação entre seus dias sugere que uma rotina mais sólida te estabilizaria' },
  swot:     { codigo: 'F03', nome: 'SWOT Pessoal',            slug: 'swot-pessoal',           motivo: 'com a clareza acumulada, é hora de mapear forças e pontos cegos' },
  raio:     { codigo: 'F01', nome: 'Raio-X 360°',             slug: 'raio-x',                 motivo: 'uma avaliação completa de todas as áreas da sua vida te daria uma visão mais nítida agora' },
  habitos:  { codigo: 'F10', nome: 'Arquiteto de Rotinas',    slug: 'arquiteto-rotinas',      motivo: 'o padrão dos seus dias sugere que hábitos estratégicos fariam uma diferença real' },
  dre:      { codigo: 'F07', nome: 'DRE Pessoal',             slug: 'dre-pessoal',            motivo: 'preocupações financeiras aparecem com frequência nos seus registros' },
  bussola:  { codigo: 'F02', nome: 'Bússola de Valores',      slug: 'bussola-valores',        motivo: 'clarificar o que mais importa para você ajuda a sair do ciclo de ansiedade' },
  prevencao:{ codigo: 'F16', nome: 'Plano de Continuidade',   slug: 'prevencao-recaida',      motivo: 'planejar antes de cair é mais poderoso do que reagir depois' },
};

const DIAS_SEMANA = [
  'Domingo', 'Segunda-feira', 'Terça-feira',
  'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function norm(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function extrairPalavras(registros: DiarioKairos[]): Palavra[] {
  const freq = new Map<string, number>();
  for (const r of registros) {
    const texto = [r.preocupacao, r.gratidao, r.conquista, r.aprendizado, r.texto_livre]
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
  emocaoDominante: string | null;
} {
  const notas = registros
    .map((r) => r.nota_dia)
    .filter((n): n is number => n !== null && n > 0);
  const mediaNota = notas.length
    ? notas.reduce((a, b) => a + b, 0) / notas.length
    : null;

  let positivos = 0, negativos = 0;
  const emocaoFreq = new Map<string, number>();

  for (const r of registros) {
    if (!r.emocao) continue;
    const e = norm(r.emocao.trim());
    emocaoFreq.set(e, (emocaoFreq.get(e) ?? 0) + 1);
    if (EMOCOES_POSITIVAS.has(e))      positivos++;
    else if (EMOCOES_NEGATIVAS.has(e)) negativos++;
  }

  const emocaoDominante = emocaoFreq.size > 0
    ? [...emocaoFreq.entries()].sort((a, b) => b[1] - a[1])[0][0]
    : null;

  let pct: number;
  if (mediaNota !== null && notas.length >= 2) {
    const notaPct = (mediaNota / 10) * 100;
    const total   = positivos + negativos;
    const emocPct = total > 0 ? (positivos / total) * 100 : 50;
    pct = Math.round(notaPct * 0.6 + emocPct * 0.4);
  } else if (mediaNota !== null) {
    pct = Math.round((mediaNota / 10) * 100);
  } else {
    const total = positivos + negativos;
    pct = total > 0 ? Math.round((positivos / total) * 100) : 50;
  }

  const label: SentimentoLabel =
    pct >= 65 ? 'Positivo' : pct >= 40 ? 'Neutro' : 'Negativo';

  return { label, pct, mediaNota, emocaoDominante };
}

function calcularMelhorPiorDia(registros: DiarioKairos[]): {
  melhor: { dia: string; media: number } | null;
  pior:   { dia: string; media: number } | null;
} {
  const grupos: Record<number, number[]> = {};
  for (const r of registros) {
    if (!r.nota_dia) continue;
    const dataStr = (r as DiarioKairos & { data?: string }).data;
    if (!dataStr) continue;
    const dow = new Date(dataStr + 'T12:00:00').getDay();
    if (!grupos[dow]) grupos[dow] = [];
    grupos[dow].push(r.nota_dia);
  }

  let melhor: { dow: number; media: number } | null = null;
  let pior:   { dow: number; media: number } | null = null;

  for (const [dowStr, notas] of Object.entries(grupos)) {
    if (notas.length < 2) continue;
    const media = notas.reduce((a, b) => a + b, 0) / notas.length;
    const dow   = Number(dowStr);
    if (!melhor || media > melhor.media) melhor = { dow, media };
    if (!pior   || media < pior.media)   pior   = { dow, media };
  }

  return {
    melhor: melhor ? { dia: DIAS_SEMANA[melhor.dow], media: melhor.media } : null,
    pior:   pior   ? { dia: DIAS_SEMANA[pior.dow],   media: pior.media   } : null,
  };
}

function calcularEvolucao(registros: DiarioKairos[]): number | null {
  const comNota = registros.filter((r) => r.nota_dia !== null && (r.nota_dia ?? 0) > 0);
  if (comNota.length < 14) return null;
  const metade   = Math.floor(comNota.length / 2);
  const recentes = comNota.slice(0, metade);
  const antigos  = comNota.slice(metade);
  const mediaRecente = recentes.reduce((a, b) => a + (b.nota_dia ?? 0), 0) / recentes.length;
  const mediaAntiga  = antigos.reduce((a, b)  => a + (b.nota_dia ?? 0), 0) / antigos.length;
  if (mediaAntiga === 0) return null;
  return Math.round(((mediaRecente - mediaAntiga) / mediaAntiga) * 100);
}

function extrairPrimeiraData(registros: DiarioKairos[]): string | null {
  // registros está em ordem descendente, logo o último é o mais antigo
  const ultimo = registros[registros.length - 1];
  const dataStr = ultimo ? (ultimo as DiarioKairos & { data?: string }).data : undefined;
  return dataStr ?? null;
}

// ─── Gerador de insight e pergunta por nível ──────────────────────────────────

function gerarConteudo(params: {
  nivel: Nivel;
  total: number;
  topPalavras: Palavra[];
  sentimentoLabel: SentimentoLabel;
  mediaNota: number | null;
  emocaoDominante: string | null;
  melhorDia: string | null;
  piorDia: string | null;
  melhorDiaNota: number | null;
  piorDiaNota: number | null;
  evolucaoPct: number | null;
  emTendenciaPositiva: boolean;
  primeiraData: string | null;
}): { mensagem: string; pergunta: string; ferramenta: FerramentaRec | null } {
  const {
    nivel, total, topPalavras, sentimentoLabel, mediaNota,
    emocaoDominante, melhorDia, piorDia, melhorDiaNota, piorDiaNota,
    evolucaoPct, emTendenciaPositiva, primeiraData,
  } = params;

  const topWord = topPalavras[0]?.texto;
  const emocNorm = emocaoDominante ? norm(emocaoDominante) : null;

  // ── Nível: início (3–6 registros) ────────────────────────────────────────
  if (nivel === 'inicio') {
    return {
      mensagem: `Você tem ${total} registro${total > 1 ? 's' : ''} no diário. Isso já te coloca à frente de 90% das pessoas que um dia planejaram se autoconhecer, mas nunca começaram. A observação consistente de si mesmo é a base de qualquer transformação real — e você já está fazendo isso.`,
      pergunta: 'O que te motivou a começar esse processo de autoconhecimento? Qual versão de você mesmo você quer encontrar no outro lado?',
      ferramenta: FERRAMENTAS.raio,
    };
  }

  // ── Nível: semana (7–13 registros) ───────────────────────────────────────
  if (nivel === 'semana') {
    let mensagem = '';
    let pergunta = '';
    let ferramenta: FerramentaRec | null = null;

    if (emocNorm && EMOCOES_CANSACO.has(emocNorm)) {
      mensagem = `Nos últimos dias, "${emocaoDominante}" aparece como sua emoção mais frequente${topWord ? `, e o tema "${topWord}" domina os seus escritos` : ''}. Cansaço não é fraqueza — é um sinal que merece atenção.${mediaNota !== null ? ` Sua nota média nesses registros é ${mediaNota.toFixed(1)}/10.` : ''}`;
      pergunta = 'O que você está carregando que não é seu?';
      ferramenta = FERRAMENTAS.energia;
    } else if (emocNorm && EMOCOES_ANSIEDADE.has(emocNorm)) {
      mensagem = `Ansiedade tem aparecido com frequência nos seus registros${topWord ? `, frequentemente conectada ao tema "${topWord}"` : ''}. Sentir ansiedade é humano. O que importa é entender o que ela está tentando te dizer.${mediaNota !== null ? ` Nota média: ${mediaNota.toFixed(1)}/10.` : ''}`;
      pergunta = 'De qual futuro você tem medo de não estar fazendo suficiente para construir?';
      ferramenta = FERRAMENTAS.bussola;
    } else if (sentimentoLabel === 'Positivo') {
      mensagem = `Que semana. Seu padrão emocional dos últimos registros é claramente positivo${mediaNota !== null ? ` — nota média ${mediaNota.toFixed(1)}/10` : ''}${topWord ? `, e o tema "${topWord}" aparece com destaque no que você escreveu` : ''}. Esse é o tipo de momentum que se transforma em hábito quando você o alimenta conscientemente.`;
      pergunta = 'O que você fez diferente recentemente que está funcionando — e que você poderia proteger ativamente?';
      ferramenta = FERRAMENTAS.okrs;
    } else {
      mensagem = `Com ${total} registros, já é possível ver um padrão emocional${sentimentoLabel === 'Negativo' ? ' desafiador' : ' em construção'}${mediaNota !== null ? `. Nota média: ${mediaNota.toFixed(1)}/10` : ''}${topWord ? `. O tema "${topWord}" aparece com mais frequência nos seus escritos` : ''}. Cada registro é um ponto de dados sobre quem você é e o que você precisa.`;
      pergunta = topWord ? `O tema "${topWord}" aparece muito. O que ele representa para você agora?` : 'O que você tem descoberto sobre si mesmo nesse processo de escrita?';
      ferramenta = sentimentoLabel === 'Negativo' ? FERRAMENTAS.crencas : FERRAMENTAS.habitos;
    }

    return { mensagem, pergunta, ferramenta };
  }

  // ── Nível: padrão (14–29 registros) ──────────────────────────────────────
  if (nivel === 'padrao') {
    let mensagem = '';
    let pergunta = '';
    let ferramenta: FerramentaRec | null = null;

    if (melhorDia && piorDia && melhorDiaNota && piorDiaNota) {
      const diff = melhorDiaNota - piorDiaNota;
      mensagem = `Com ${total} registros, seu mapa semanal começa a aparecer. ${melhorDia} é consistentemente seu melhor dia (média ${melhorDiaNota.toFixed(1)}/10), enquanto ${piorDia} é o mais desafiador (média ${piorDiaNota.toFixed(1)}/10). Essa diferença de ${diff.toFixed(1)} pontos não é aleatória — algo muda entre esses dois dias que vale investigar.`;
      pergunta = `O que é diferente entre a sua ${melhorDia} e a sua ${piorDia}? O que você faz, pensa ou deixa de fazer?`;
      ferramenta = diff > 2.5 ? FERRAMENTAS.rotina : FERRAMENTAS.swot;
    } else if (mediaNota !== null && mediaNota <= 5) {
      mensagem = `Seus ${total} registros mostram um período pesado. Nota média de ${mediaNota.toFixed(1)}/10${topWord ? ` e o tema "${topWord}" dominando seus escritos` : ''}. Fases difíceis têm informação valiosa dentro delas — mas precisam ser atravessadas com os recursos certos.`;
      pergunta = 'O que você está evitando olhar de frente nesse momento?';
      ferramenta = FERRAMENTAS.energia;
    } else {
      mensagem = `${total} registros. Você está construindo algo real aqui${mediaNota !== null ? `. Nota média de ${mediaNota.toFixed(1)}/10` : ''}${topWord ? `, com "${topWord}" como tema recorrente` : ''}. Com essa base, você consegue começar a identificar padrões que a maioria das pessoas nunca vê sobre si mesma.`;
      pergunta = 'Quais padrões você já identificou sobre si mesmo que te surpreenderam?';
      ferramenta = FERRAMENTAS.swot;
    }

    return { mensagem, pergunta, ferramenta };
  }

  // ── Nível: evolução (30–89 registros) ────────────────────────────────────
  if (nivel === 'evolucao') {
    let mensagem = '';
    let pergunta = '';
    let ferramenta: FerramentaRec | null = null;

    if (evolucaoPct !== null && evolucaoPct > 5) {
      mensagem = `${total} registros e a curva aponta para cima. Sua nota média cresceu ${evolucaoPct}% desde que você começou — isso é progresso real, mensurável, construído registro a registro${melhorDia ? `. Você tende a estar melhor às ${melhorDia}` : ''}. Poucas pessoas chegam aqui e ainda menos continuam.`;
      pergunta = 'O que mudou em você desde que começou esse processo que ainda não está sendo celebrado?';
      ferramenta = FERRAMENTAS.okrs;
    } else if (evolucaoPct !== null && evolucaoPct < -5) {
      mensagem = `${total} registros mostram uma tendência que merece atenção: sua nota média caiu ${Math.abs(evolucaoPct)}% em relação ao início. Isso não é fracasso — é informação. Algo mudou${melhorDia ? ` (seu melhor dia ainda é ${melhorDia}, média ${melhorDiaNota?.toFixed(1)}/10)` : ''}, e entender o quê é mais valioso do que qualquer meta.`;
      pergunta = 'O que mudou nos últimos 30 dias que você ainda não nomeou?';
      ferramenta = FERRAMENTAS.prevencao;
    } else {
      mensagem = `${total} registros. Sua nota média está estável${mediaNota !== null ? ` em ${mediaNota.toFixed(1)}/10` : ''}${melhorDia ? ` — com ${melhorDia} sendo consistentemente seu melhor dia` : ''}. Estabilidade pode ser uma conquista ou um platô. Só você sabe qual das duas é.`;
      pergunta = emTendenciaPositiva
        ? 'O que você quer construir nos próximos 30 dias com essa base sólida?'
        : 'O que você precisaria mudar para sentir que está crescendo de novo?';
      ferramenta = FERRAMENTAS.swot;
    }

    return { mensagem, pergunta, ferramenta };
  }

  // ── Nível: transformação (90+ registros) ─────────────────────────────────
  if (nivel === 'transformacao') {
    let dataInicio = '';
    if (primeiraData) {
      const d = new Date(primeiraData + 'T12:00:00');
      dataInicio = d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
    }

    let mensagem = '';
    let pergunta = '';
    let ferramenta: FerramentaRec | null = null;

    if (evolucaoPct !== null && evolucaoPct > 0) {
      mensagem = `${total} registros${dataInicio ? ` desde ${dataInicio}` : ''}. Você não é mais a mesma pessoa que começou essa jornada. Sua nota média cresceu ${evolucaoPct}% desde os primeiros registros${topWord ? `, e "${topWord}" emergiu como tema central da sua transformação` : ''}. Isso é autoconhecimento aplicado — a forma mais rara de inteligência.`;
      pergunta = 'Quem você era quando começou essa jornada, e o que essa pessoa precisaria ouvir de você hoje?';
      ferramenta = FERRAMENTAS.okrs;
    } else if (evolucaoPct !== null && evolucaoPct < 0) {
      mensagem = `${total} registros${dataInicio ? ` desde ${dataInicio}` : ''}. Você acumulou algo que a maioria das pessoas nunca tem: dados reais sobre si mesma. A tendência atual mostra uma queda de ${Math.abs(evolucaoPct)}% na nota média — mas você tem todo o histórico necessário para entender o porquê e virar o jogo.`;
      pergunta = 'Se você comparar quem você era no começo com quem você é hoje, o que ficou mais forte — e o que precisa de mais atenção?';
      ferramenta = FERRAMENTAS.prevencao;
    } else {
      mensagem = `${total} registros${dataInicio ? ` desde ${dataInicio}` : ''}. Sua jornada de autoconhecimento tem uma profundidade que pouquíssimas pessoas alcançam. Sua nota média está estável${mediaNota !== null ? ` em ${mediaNota.toFixed(1)}/10` : ''}${topWord ? `, e "${topWord}" é o tema que mais aparece em toda a sua história` : ''}. Você conhece seus padrões. Agora é a hora de usar esse conhecimento com intenção.`;
      pergunta = 'Qual é o próximo capítulo da sua transformação — e o que você sabe sobre si mesmo que vai te ajudar a escrevê-lo?';
      ferramenta = FERRAMENTAS.swot;
    }

    return { mensagem, pergunta, ferramenta };
  }

  // ── Fallback (minimo / sem dados) ────────────────────────────────────────
  return {
    mensagem: 'Continue registrando. Cada entrada no diário é um dado valioso sobre quem você é.',
    pergunta: 'O que você quer entender melhor sobre si mesmo?',
    ferramenta: null,
  };
}

// ─── Função principal de análise ──────────────────────────────────────────────

function analisar(registros: DiarioKairos[]): MentorInsight {
  const total = registros.length;

  const nivel: Nivel =
    total >= 90 ? 'transformacao'
    : total >= 30 ? 'evolucao'
    : total >= 14 ? 'padrao'
    : total >= 7  ? 'semana'
    : total >= 3  ? 'inicio'
    : 'minimo';

  if (nivel === 'minimo') {
    return {
      nivel, totalRegistros: total,
      mensagem: '', pergunta: '', ferramenta: null,
      topPalavras: [], sentimentoLabel: 'Neutro', sentimentoPct: 50,
      mediaNota: null, emocaoDominante: null,
      melhorDia: null, piorDia: null, melhorDiaNota: null, piorDiaNota: null,
      evolucaoPct: null, emTendenciaPositiva: false, primeiraData: null,
    };
  }

  const ultimos14 = registros.slice(0, 14);
  const topPalavras = extrairPalavras(ultimos14);
  const { label, pct, mediaNota, emocaoDominante } = calcularSentimento(ultimos14);

  const { melhor, pior } = (nivel === 'padrao' || nivel === 'evolucao' || nivel === 'transformacao')
    ? calcularMelhorPiorDia(registros)
    : { melhor: null, pior: null };

  const evolucaoPct = (nivel === 'evolucao' || nivel === 'transformacao')
    ? calcularEvolucao(registros)
    : null;

  const emTendenciaPositiva = evolucaoPct !== null ? evolucaoPct > 0 : label === 'Positivo';
  const primeiraData = (nivel === 'transformacao') ? extrairPrimeiraData(registros) : null;

  const { mensagem, pergunta, ferramenta } = gerarConteudo({
    nivel, total, topPalavras,
    sentimentoLabel: label, mediaNota, emocaoDominante,
    melhorDia: melhor?.dia ?? null,
    piorDia:   pior?.dia   ?? null,
    melhorDiaNota: melhor?.media ?? null,
    piorDiaNota:   pior?.media   ?? null,
    evolucaoPct, emTendenciaPositiva, primeiraData,
  });

  return {
    nivel, totalRegistros: total,
    mensagem, pergunta, ferramenta,
    topPalavras, sentimentoLabel: label, sentimentoPct: pct,
    mediaNota, emocaoDominante,
    melhorDia: melhor?.dia ?? null,
    piorDia:   pior?.dia   ?? null,
    melhorDiaNota: melhor?.media ?? null,
    piorDiaNota:   pior?.media   ?? null,
    evolucaoPct, emTendenciaPositiva, primeiraData,
  };
}

// ─── Helpers de UI ────────────────────────────────────────────────────────────

function formatarHora(d: Date): string {
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <>
      <style>{`
        @keyframes kairosShimmer {
          0%, 100% { opacity: 0.25; }
          50%       { opacity: 0.55; }
        }
      `}</style>
      <div style={{
        background: 'linear-gradient(160deg, #0E0E0E 0%, #111111 100%)',
        border: '1px solid rgba(200,160,48,0.15)',
        borderRadius: 16, padding: '20px',
        display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        {/* Avatar + header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'rgba(200,160,48,0.15)',
            animation: 'kairosShimmer 1.5s ease-in-out infinite',
          }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
            <div style={{ height: 10, width: 100, borderRadius: 4, background: 'rgba(200,160,48,0.15)', animation: 'kairosShimmer 1.5s ease-in-out infinite' }} />
            <div style={{ height: 8,  width: 60,  borderRadius: 4, background: 'rgba(200,160,48,0.08)', animation: 'kairosShimmer 1.5s ease-in-out infinite 0.2s' }} />
          </div>
        </div>
        {[140, 110, 160, 90].map((w, i) => (
          <div key={w} style={{
            height: 9, width: w, borderRadius: 4,
            background: 'rgba(245,240,232,0.06)',
            animation: `kairosShimmer 1.5s ease-in-out infinite ${i * 0.15}s`,
          }} />
        ))}
      </div>
    </>
  );
}

// ─── Card "sem dados ainda" ───────────────────────────────────────────────────

function CardMinimo({ total }: { total: number }) {
  const faltam = Math.max(0, 3 - total);
  return (
    <div style={{
      background: 'linear-gradient(160deg, #0E0E0E 0%, #111111 100%)',
      border: '1px solid rgba(200,160,48,0.15)',
      borderRadius: 16, padding: '20px',
      display: 'flex', flexDirection: 'column', gap: 16,
    }}>
      {/* Cabeçalho Mentor */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'linear-gradient(135deg, #C8A030 0%, #A07828 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 800, color: '#0E0E0E',
          flexShrink: 0, letterSpacing: '-0.02em',
        }}>
          K·
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#C8A030', lineHeight: 1.2 }}>
            Mentor Kairos
          </div>
          <div style={{ fontSize: 11, color: 'rgba(245,240,232,0.35)', marginTop: 1 }}>
            aguardando seus primeiros registros
          </div>
        </div>
      </div>

      <p style={{ fontSize: 13, color: 'rgba(245,240,232,0.6)', lineHeight: 1.7, margin: 0 }}>
        {total === 0
          ? 'Quando você começar a registrar seu dia no Diário de Bordo, eu vou analisar seus padrões e te dar insights personalizados. O primeiro passo é o mais importante.'
          : `Você tem ${total} registro${total > 1 ? 's' : ''} — falta${faltam === 1 ? '' : 'm'} ${faltam} para eu começar a enxergar padrões e te dar os primeiros insights.`
        }
      </p>

      {/* Barra de progresso */}
      {total > 0 && (
        <div>
          <div style={{
            display: 'flex', justifyContent: 'space-between', marginBottom: 6,
            fontSize: 11, color: 'rgba(245,240,232,0.35)',
          }}>
            <span>{total} de 3 registros</span>
            <span>{Math.round((total / 3) * 100)}%</span>
          </div>
          <div style={{ height: 4, borderRadius: 99, background: 'rgba(200,160,48,0.12)' }}>
            <div style={{
              height: '100%', borderRadius: 99,
              width: `${Math.min(100, (total / 3) * 100)}%`,
              background: 'linear-gradient(90deg, #C8A030, #e8c76a)',
              transition: 'width 0.8s ease',
            }} />
          </div>
        </div>
      )}

      {/* Marcos */}
      <div style={{ display: 'flex', gap: 6 }}>
        {[
          { n: 3,  label: 'Primeiros insights' },
          { n: 7,  label: 'Padrão emocional' },
          { n: 30, label: 'Tendências' },
        ].map(({ n, label }) => (
          <div key={n} style={{
            flex: 1, textAlign: 'center',
            background: total >= n ? 'rgba(200,160,48,0.10)' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${total >= n ? 'rgba(200,160,48,0.30)' : 'rgba(255,255,255,0.06)'}`,
            borderRadius: 8, padding: '6px 4px',
          }}>
            <div style={{
              fontSize: 11, fontWeight: 700, fontFamily: 'monospace',
              color: total >= n ? '#C8A030' : 'rgba(245,240,232,0.18)',
            }}>
              {total >= n ? '✓' : `${n}d`}
            </div>
            <div style={{
              fontSize: 9, marginTop: 2, lineHeight: 1.2,
              color: total >= n ? 'rgba(200,160,48,0.6)' : 'rgba(245,240,232,0.18)',
            }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      <Link
        href="/ferramentas/diario-bordo"
        style={{
          display: 'block', textAlign: 'center',
          background: 'linear-gradient(135deg, #C8A030 0%, #A07828 100%)',
          color: '#0E0E0E', fontWeight: 700, fontSize: 13,
          padding: '10px 16px', borderRadius: 10,
          textDecoration: 'none',
        }}
      >
        Abrir Diário de Bordo →
      </Link>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function AnaliseIA() {
  const { user }      = useUser();
  const { getClient } = useSupabaseClient();

  const [insight,   setInsight]   = useState<MentorInsight | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [atualizou, setAtualizou] = useState<Date | null>(null);

  const carregar = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const client = await getClient();
      const { data, error } = await client
        .from('diario_kairos')
        .select('id, data, emocao, preocupacao, gratidao, conquista, aprendizado, texto_livre, nota_dia')
        .eq('user_id', user.id)
        .or('tipo_entrada.neq.momento,tipo_entrada.is.null')
        .order('data', { ascending: false })
        .limit(100);
      if (!error && data) {
        setInsight(analisar(data as DiarioKairos[]));
        setAtualizou(new Date());
      }
    } finally {
      setLoading(false);
    }
  }, [user?.id, getClient]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { carregar(); }, [carregar]);

  if (loading) return <Skeleton />;
  if (!insight) return null;

  // Sem dados suficientes
  if (insight.nivel === 'minimo') {
    return <CardMinimo total={insight.totalRegistros} />;
  }

  const nivelLabel: Record<Nivel, string> = {
    minimo:        '',
    inicio:        '✦ Começando',
    semana:        '✦ 1 semana',
    padrao:        '✦ Padrão identificado',
    evolucao:      '✦ Evolução',
    transformacao: '✦ Transformação',
  };

  const sentColors: Record<string, string> = {
    Positivo: '#4dbb7a',
    Neutro:   '#C8A030',
    Negativo: '#e05c5c',
  };
  const sentEmoji: Record<string, string> = {
    Positivo: '😊',
    Neutro:   '😐',
    Negativo: '😔',
  };

  return (
    <>
      <style>{`
        @keyframes kairosShimmer {
          0%, 100% { opacity: 0.25; }
          50%       { opacity: 0.55; }
        }
        .kairos-cta-link:hover {
          opacity: 0.88 !important;
          transform: translateY(-1px) !important;
        }
        .kairos-refresh:hover {
          color: rgba(200,160,48,0.8) !important;
        }
      `}</style>

      <div style={{
        background: 'linear-gradient(160deg, #0E0E0E 0%, #111111 100%)',
        border: '1px solid rgba(200,160,48,0.18)',
        borderRadius: 16,
        display: 'flex', flexDirection: 'column', gap: 0,
        overflow: 'hidden',
      }}>

        {/* ── Cabeçalho Mentor ────────────────────────────────────────────── */}
        <div style={{
          padding: '16px 18px 14px',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          {/* Avatar K· */}
          <div style={{
            width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, #C8A030 0%, #A07828 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 800, color: '#0E0E0E', letterSpacing: '-0.02em',
            boxShadow: '0 0 0 3px rgba(200,160,48,0.15)',
          }}>
            K·
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#C8A030', lineHeight: 1.2 }}>
              Mentor Kairos
            </div>
            <div style={{ fontSize: 10, color: 'rgba(245,240,232,0.30)', marginTop: 1 }}>
              {insight.totalRegistros} registros analisados
            </div>
          </div>

          {/* Badge nível */}
          <span style={{
            fontSize: 9, fontWeight: 700, letterSpacing: '0.08em',
            color: 'rgba(200,160,48,0.7)',
            background: 'rgba(200,160,48,0.08)',
            border: '1px solid rgba(200,160,48,0.20)',
            borderRadius: 99, padding: '3px 8px', whiteSpace: 'nowrap',
          }}>
            {nivelLabel[insight.nivel]}
          </span>
        </div>

        {/* ── Mensagem principal ───────────────────────────────────────────── */}
        <div style={{ padding: '16px 18px 14px' }}>
          <p style={{
            fontSize: 13.5, color: 'rgba(245,240,232,0.82)',
            lineHeight: 1.75, margin: 0,
          }}>
            {insight.mensagem}
          </p>
        </div>

        {/* ── Indicadores rápidos ──────────────────────────────────────────── */}
        {(insight.mediaNota !== null || insight.emocaoDominante !== null) && (
          <div style={{
            margin: '0 18px',
            display: 'flex', gap: 8, flexWrap: 'wrap',
          }}>
            {insight.mediaNota !== null && (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 8, padding: '5px 10px',
                fontSize: 12,
              }}>
                <span style={{ color: sentColors[insight.sentimentoLabel] ?? '#C8A030' }}>
                  {sentEmoji[insight.sentimentoLabel] ?? '·'}
                </span>
                <span style={{ color: 'rgba(245,240,232,0.55)', fontSize: 11 }}>
                  Média
                </span>
                <span style={{ color: sentColors[insight.sentimentoLabel] ?? '#C8A030', fontWeight: 700, fontFamily: 'monospace' }}>
                  {insight.mediaNota.toFixed(1)}/10
                </span>
              </div>
            )}

            {insight.emocaoDominante && (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 8, padding: '5px 10px',
                fontSize: 11,
              }}>
                <span style={{ color: 'rgba(245,240,232,0.35)' }}>Emoção</span>
                <span style={{ color: 'rgba(245,240,232,0.75)', fontWeight: 600 }}>
                  {insight.emocaoDominante}
                </span>
              </div>
            )}

            {insight.evolucaoPct !== null && (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                background: insight.evolucaoPct >= 0 ? 'rgba(77,187,122,0.08)' : 'rgba(224,92,92,0.08)',
                border: `1px solid ${insight.evolucaoPct >= 0 ? 'rgba(77,187,122,0.20)' : 'rgba(224,92,92,0.20)'}`,
                borderRadius: 8, padding: '5px 10px',
                fontSize: 11,
              }}>
                <span style={{ fontSize: 12 }}>{insight.evolucaoPct >= 0 ? '📈' : '📉'}</span>
                <span style={{
                  color: insight.evolucaoPct >= 0 ? '#4dbb7a' : '#e05c5c',
                  fontWeight: 700, fontFamily: 'monospace',
                }}>
                  {insight.evolucaoPct > 0 ? '+' : ''}{insight.evolucaoPct}%
                </span>
              </div>
            )}
          </div>
        )}

        {/* ── Temas recorrentes ────────────────────────────────────────────── */}
        {insight.topPalavras.length > 0 && (
          <div style={{ padding: '12px 18px 0' }}>
            <div style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
              color: 'rgba(245,240,232,0.22)', textTransform: 'uppercase',
              marginBottom: 7,
            }}>
              Temas nos seus registros
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {insight.topPalavras.map(({ texto, count }, i) => (
                <span
                  key={texto}
                  style={{
                    fontSize: i === 0 ? 12 : 11,
                    fontWeight: i === 0 ? 700 : 500,
                    color: i === 0 ? '#C8A030' : 'rgba(245,240,232,0.45)',
                    background: i === 0 ? 'rgba(200,160,48,0.10)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${i === 0 ? 'rgba(200,160,48,0.25)' : 'rgba(255,255,255,0.06)'}`,
                    borderRadius: 99, padding: i === 0 ? '3px 10px' : '2px 8px',
                    display: 'inline-flex', alignItems: 'center', gap: 3,
                  }}
                >
                  {texto}
                  <span style={{ fontSize: 9, opacity: 0.55, fontFamily: 'monospace' }}>
                    {count}×
                  </span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── Pergunta reflexiva ───────────────────────────────────────────── */}
        <div style={{ padding: '14px 18px 0' }}>
          <div style={{
            background: 'rgba(200,160,48,0.06)',
            border: '1px solid rgba(200,160,48,0.18)',
            borderLeft: '3px solid rgba(200,160,48,0.60)',
            borderRadius: '0 10px 10px 0',
            padding: '12px 14px',
          }}>
            <div style={{
              fontSize: 9, fontWeight: 700, letterSpacing: '0.10em',
              color: 'rgba(200,160,48,0.55)', textTransform: 'uppercase',
              marginBottom: 6,
            }}>
              ✦ Pergunta para reflexão
            </div>
            <p style={{
              fontSize: 13, color: 'rgba(245,240,232,0.75)',
              fontStyle: 'italic', lineHeight: 1.65, margin: 0,
            }}>
              &ldquo;{insight.pergunta}&rdquo;
            </p>
          </div>
        </div>

        {/* ── Ferramenta recomendada ───────────────────────────────────────── */}
        {insight.ferramenta && (
          <div style={{ padding: '14px 18px 0' }}>
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 10, padding: '12px 14px',
            }}>
              <div style={{
                fontSize: 9, fontWeight: 700, letterSpacing: '0.10em',
                color: 'rgba(245,240,232,0.28)', textTransform: 'uppercase',
                marginBottom: 6,
              }}>
                Recomendação do Mentor
              </div>
              <div style={{ fontSize: 12, color: 'rgba(245,240,232,0.5)', lineHeight: 1.55, marginBottom: 10 }}>
                {insight.ferramenta.motivo.charAt(0).toUpperCase() + insight.ferramenta.motivo.slice(1)}.
              </div>
              <Link
                href={`/ferramentas/${insight.ferramenta.slug}`}
                className="kairos-cta-link"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: 'linear-gradient(135deg, rgba(200,160,48,0.15) 0%, rgba(200,160,48,0.08) 100%)',
                  border: '1px solid rgba(200,160,48,0.30)',
                  borderRadius: 8, padding: '9px 12px',
                  textDecoration: 'none',
                  transition: 'opacity 0.15s, transform 0.15s',
                }}
              >
                <div>
                  <div style={{ fontSize: 11, color: 'rgba(200,160,48,0.6)', fontFamily: 'monospace', marginBottom: 2 }}>
                    {insight.ferramenta.codigo}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#C8A030' }}>
                    {insight.ferramenta.nome}
                  </div>
                </div>
                <span style={{ fontSize: 16, color: 'rgba(200,160,48,0.6)' }}>→</span>
              </Link>
            </div>
          </div>
        )}

        {/* ── Rodapé: última análise + atualizar ──────────────────────────── */}
        <div style={{
          padding: '14px 18px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          marginTop: 14,
        }}>
          <span style={{ fontSize: 10, color: 'rgba(245,240,232,0.22)' }}>
            {atualizou ? `Analisado às ${formatarHora(atualizou)}` : 'Análise carregada'}
          </span>
          <button
            className="kairos-refresh"
            onClick={carregar}
            disabled={loading}
            style={{
              background: 'none', border: 'none',
              fontSize: 11, color: 'rgba(200,160,48,0.45)',
              cursor: loading ? 'not-allowed' : 'pointer',
              padding: '2px 4px', fontFamily: 'inherit',
              transition: 'color 0.15s',
            }}
          >
            {loading ? 'Atualizando…' : '↻ Atualizar análise'}
          </button>
        </div>

      </div>
    </>
  );
}
