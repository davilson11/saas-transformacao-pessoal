/**
 * Dias-marco e o que a aferição devolve deles.
 *
 * ─── Por que isto existe ───────────────────────────────────────────────────
 *
 * O conteúdo pede, em dias específicos, "guarde isto — você vai reler": no
 * Dia 1 (quem você acredita que é), no fim de cada mês reescrito (a síntese do
 * mês). Até aqui a promessa era feita e nada no app a cumpria: os textos
 * ficavam soltos no diário, sem marca e sem retorno.
 *
 * Este módulo é o primeiro passo: ao fim do mês N, a aferição mostra o texto
 * do marco do mês anterior. Nada de análise, nota ou comparação automática.
 * Só devolver o que a pessoa escreveu, no dia certo.
 *
 * Onde o texto mora: na coluna `missao_execucao` da linha `tipo_entrada =
 * 'diario'` daquele dia — escrita pelo Diário de Bordo. O Momento não grava
 * esse campo. Se a pessoa respondeu no caderno, não há o que devolver, e a
 * tela diz isso sem culpa.
 */

import {
  MESES_JORNADA,
  TOTAL_DIAS,
  dataDoDiaJornada,
  somarDias,
  hojeStr,
  type EstadoJornada,
} from './jornada';

/**
 * Os dias-marco. O Dia 1 e o fechamento de cada mês já reescrito.
 * Os meses 6 a 12 entram aqui quando forem reescritos — esta lista é a única
 * fonte; nada mais no código decide o que é marco.
 */
export const DIAS_MARCO: readonly number[] = [1, 31, 59, 90, 120, 151];

/**
 * O marco do mês anterior a `mes`: o dia de fechamento do mês anterior, se
 * ele estiver na lista.
 *
 *   mês 1  → null  (não há mês anterior)
 *   mês 2  → 31 · mês 3 → 59 · mês 4 → 90 · mês 5 → 120 · mês 6 → 151
 *   mês 7+ → null  (até esses meses terem marco definido)
 *
 * Entrada fora de 1..12 devolve null. Nunca lança.
 */
export function marcoAnterior(mes: number): number | null {
  const anterior = MESES_JORNADA.find((m) => m.numero === mes - 1);
  if (!anterior) return null;
  return DIAS_MARCO.includes(anterior.diaFim) ? anterior.diaFim : null;
}

/** Dia absoluto do marco, respeitando a volta: dia 31 da 2ª volta é o 396. */
export function diaAbsolutoDoMarco(marco: number, volta: number): number {
  return marco + TOTAL_DIAS * (Math.max(1, Math.floor(volta)) - 1);
}

/**
 * A data real (YYYY-MM-DD) em que a pessoa viveu o marco.
 *
 * O componente só tem `estado`, não `jornada_inicio`. O início é derivado de
 * `estado.diaAbsoluto` e de hoje — sem consulta, sem prop nova. `hoje` é
 * parâmetro para os testes não dependerem da data real.
 */
export function dataDoMarco(marco: number, estado: EstadoJornada, hoje: string = hojeStr()): string {
  const inicio = somarDias(hoje, -(estado.diaAbsoluto - 1));
  return dataDoDiaJornada(diaAbsolutoDoMarco(marco, estado.volta), inicio);
}

export type ResultadoMarco =
  | { situacao: 'texto'; texto: string }
  | { situacao: 'ausente' }
  | { situacao: 'erro' };

/**
 * O que a tela mostra para cada situação.
 *
 * 'ausente' e 'erro' são diferentes de propósito: "não há registro" é um fato
 * sobre o diário; "não foi possível carregar" é um fato sobre a rede. Dizer o
 * primeiro quando aconteceu o segundo é mentir para a pessoa.
 *
 * Nenhuma variante culpa. O caderno é um lugar válido para ter escrito.
 */
export function mensagemMarco(r: ResultadoMarco): string {
  switch (r.situacao) {
    case 'texto':   return r.texto;
    case 'ausente': return 'Não há registro no app para esse dia.';
    case 'erro':    return 'Não foi possível carregar o registro desse dia.';
  }
}
