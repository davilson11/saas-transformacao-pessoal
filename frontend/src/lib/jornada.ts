/**
 * A jornada de 365 dias.
 *
 * O produto nasceu como um calendário de 2026: o conteúdo era indexado pela data
 * real, todo mundo lia o mesmo texto no mesmo dia, e quem assinava em agosto
 * entrava no dia 216 de uma jornada que nunca começou. Este módulo é a virada
 * para uma jornada atemporal — o conteúdo passa a ser indexado pelo *dia da
 * jornada de cada pessoa*, e todo mundo começa em "Quem sou eu?".
 *
 * ─── A regra de ouro da arquitetura ────────────────────────────────────────
 *
 * O diário continua ancorado na data real. Um diário é um diário: 4 de agosto é
 * 4 de agosto, e o que a pessoa escreveu naquele dia não pode migrar. O que muda
 * é só o CONTEÚDO, que passa a ser ancorado no dia da jornada.
 *
 * A ponte entre os dois mundos é `diaJornadaDe(data, inicio)` — dado um registro
 * do diário, em que dia da jornada a pessoa estava quando o escreveu.
 *
 * ─── Sobre datas ───────────────────────────────────────────────────────────
 *
 * Tudo aqui trabalha com datas-calendário (YYYY-MM-DD), nunca com instantes.
 * "Dia 1" é um dia inteiro, não um horário. Por isso as contas são feitas em
 * UTC ao meio-dia: elimina qualquer efeito de fuso ou horário de verão, que
 * causaria o bug clássico de a jornada avançar ou atrasar um dia.
 */

// ─── Estrutura da jornada ─────────────────────────────────────────────────────

export type MesJornada = {
  numero:     number;  // 1..12
  tema:       string;
  diaInicio:  number;  // 1-based, inclusivo
  diaFim:     number;  // 1-based, inclusivo
  fase:       1 | 2 | 3 | 4;
};

/**
 * Os 12 meses temáticos.
 *
 * Os comprimentos vêm dos meses de 2026, quando o conteúdo foi escrito — por
 * isso o mês 2 tem 28 dias e não 30. Mantive assim de propósito: cada dia do
 * conteúdo original continua no mesmo mês temático em que foi escrito, e nada
 * precisa ser reordenado nem reescrito por causa da mudança de indexação.
 *
 * As 4 fases agrupam 3 meses cada — o mesmo agrupamento que o app já exibia
 * (agosto de 2026, dia 216, aparecia como "Fase 03", e o mês 8 cai na fase 3).
 */
export const MESES_JORNADA: MesJornada[] = [
  { numero: 1,  tema: 'Quem sou eu?',                 diaInicio: 1,   diaFim: 31,  fase: 1 },
  { numero: 2,  tema: 'O que me move?',               diaInicio: 32,  diaFim: 59,  fase: 1 },
  { numero: 3,  tema: 'Onde estou travado?',          diaInicio: 60,  diaFim: 90,  fase: 1 },
  { numero: 4,  tema: 'Minha visão de futuro',        diaInicio: 91,  diaFim: 120, fase: 2 },
  { numero: 5,  tema: 'Fé que age',                   diaInicio: 121, diaFim: 151, fase: 2 },
  { numero: 6,  tema: 'Clareza de propósito',         diaInicio: 152, diaFim: 181, fase: 2 },
  { numero: 7,  tema: 'Disciplina como liberdade',    diaInicio: 182, diaFim: 212, fase: 3 },
  { numero: 8,  tema: 'Relacionamentos que constroem',diaInicio: 213, diaFim: 243, fase: 3 },
  { numero: 9,  tema: 'Finanças com intenção',        diaInicio: 244, diaFim: 273, fase: 3 },
  { numero: 10, tema: 'Saúde é base',                 diaInicio: 274, diaFim: 304, fase: 4 },
  { numero: 11, tema: 'Legado e impacto',             diaInicio: 305, diaFim: 334, fase: 4 },
  { numero: 12, tema: 'Gratidão e recomeço',          diaInicio: 335, diaFim: 365, fase: 4 },
];

export const TOTAL_DIAS = 365;

// ─── Datas ────────────────────────────────────────────────────────────────────

const UM_DIA = 86_400_000;

/** Data-calendário de hoje no fuso de São Paulo, como YYYY-MM-DD. */
export function hojeStr(agora: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(agora);
}

/**
 * YYYY-MM-DD → instante em UTC ao meio-dia.
 * O meio-dia (e não a meia-noite) evita que qualquer deslocamento de fuso
 * empurre a data para o dia anterior ou seguinte.
 */
function aoMeioDiaUTC(data: string): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(data.trim());
  if (!m) return null;
  const [, a, mes, d] = m;
  const t = Date.UTC(Number(a), Number(mes) - 1, Number(d), 12);
  return Number.isNaN(t) ? null : t;
}

/** Diferença em dias-calendário entre duas datas YYYY-MM-DD. */
export function diasEntre(de: string, ate: string): number | null {
  const a = aoMeioDiaUTC(de);
  const b = aoMeioDiaUTC(ate);
  if (a === null || b === null) return null;
  return Math.round((b - a) / UM_DIA);
}

/** Soma dias a uma data YYYY-MM-DD. */
export function somarDias(data: string, dias: number): string {
  const base = aoMeioDiaUTC(data);
  if (base === null) return data;
  return new Date(base + dias * UM_DIA).toISOString().slice(0, 10);
}

// ─── Conversões jornada ↔ calendário ──────────────────────────────────────────

/**
 * Em que dia da jornada a pessoa está numa data qualquer.
 *
 * O dia de início é o dia 1, não o dia 0 — quem começa hoje está no dia 1 hoje.
 * Datas anteriores ao início devolvem número menor que 1, e quem chama precisa
 * tratar isso (não deveria acontecer, mas dado ruim existe).
 *
 * Pode passar de 365: é assim que a segunda volta é detectada.
 */
export function diaJornadaDe(data: string, inicio: string): number | null {
  const d = diasEntre(inicio, data);
  return d === null ? null : d + 1;
}

/** Dia da jornada hoje. */
export function diaJornadaHoje(inicio: string, agora: Date = new Date()): number | null {
  return diaJornadaDe(hojeStr(agora), inicio);
}

/** Data-calendário em que a pessoa viveu (ou viverá) um dia da jornada. */
export function dataDoDiaJornada(dia: number, inicio: string): string {
  return somarDias(inicio, dia - 1);
}

// ─── Ciclos ───────────────────────────────────────────────────────────────────

export type EstadoJornada = {
  /** Dia absoluto desde o início, pode passar de 365. */
  diaAbsoluto: number;
  /** Dia dentro do ciclo atual, sempre 1..365. */
  diaNoCiclo:  number;
  /** 1 na primeira volta, 2 na segunda, e assim por diante. */
  volta:       number;
  concluiuCiclo: boolean;
  mes:         MesJornada;
  fase:        1 | 2 | 3 | 4;
  diasRestantesNoCiclo: number;
  /** 0–100, progresso dentro do ciclo atual. */
  progressoCiclo: number;
  /** 0–100, progresso dentro do mês temático atual. */
  progressoMes:   number;
};

/**
 * Traduz o dia absoluto em tudo que as telas precisam saber.
 *
 * A segunda volta reusa o mesmo conteúdo, de propósito: no dia 47 da segunda
 * volta a pessoa recebe a mesma pergunta do dia 47 da primeira, e o que ela
 * escreveu daquela vez continua guardado. A repetição deixa de ser repetição e
 * vira régua — a mesma pergunta, um ano depois, e a diferença entre as duas
 * respostas é a medida da mudança.
 */
export function estadoJornada(diaAbsoluto: number): EstadoJornada | null {
  if (!Number.isFinite(diaAbsoluto) || diaAbsoluto < 1) return null;

  const dia   = Math.floor(diaAbsoluto);
  const volta = Math.floor((dia - 1) / TOTAL_DIAS) + 1;
  const noCiclo = ((dia - 1) % TOTAL_DIAS) + 1;
  const mes = MESES_JORNADA.find((m) => noCiclo >= m.diaInicio && noCiclo <= m.diaFim)!;

  const diasDoMes = mes.diaFim - mes.diaInicio + 1;
  const noMes     = noCiclo - mes.diaInicio + 1;

  return {
    diaAbsoluto: dia,
    diaNoCiclo:  noCiclo,
    volta,
    concluiuCiclo: dia > TOTAL_DIAS,
    mes,
    fase: mes.fase,
    diasRestantesNoCiclo: TOTAL_DIAS - noCiclo,
    progressoCiclo: Math.round((noCiclo / TOTAL_DIAS) * 100),
    progressoMes:   Math.round((noMes / diasDoMes) * 100),
  };
}

/** Mês temático de um dia do ciclo (1..365). */
export function mesDoDia(diaNoCiclo: number): MesJornada | null {
  if (diaNoCiclo < 1 || diaNoCiclo > TOTAL_DIAS) return null;
  return MESES_JORNADA.find((m) => diaNoCiclo >= m.diaInicio && diaNoCiclo <= m.diaFim) ?? null;
}

/**
 * Até que dia o conteúdo pode ser liberado.
 *
 * Espelha a regra da RLS no banco: o dia de hoje, e nada além. Existe aqui para
 * a interface não oferecer o que o banco vai negar — mas a decisão que vale é a
 * do banco, não esta.
 */
export function podeVerDia(diaPedido: number, diaAtual: number): boolean {
  return diaPedido >= 1 && diaPedido <= diaAtual;
}

// ─── Texto ────────────────────────────────────────────────────────────────────

/** "Dia 47 · Quem sou eu?" — rótulo curto para cabeçalhos. */
export function rotuloDia(estado: EstadoJornada): string {
  const base = `Dia ${estado.diaNoCiclo} · ${estado.mes.tema}`;
  return estado.volta > 1 ? `${base} · ${estado.volta}ª volta` : base;
}
