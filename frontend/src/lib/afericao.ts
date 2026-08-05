/**
 * A aferição do caminho.
 *
 * O mapa do produto deveria responder "estou no caminho certo?" — e "certo" só
 * existe em relação à Visão Âncora. Este módulo é a régua: ao fim de cada mês
 * da jornada, o app devolve a manchete e pergunta uma coisa só.
 *
 * Toda a decisão de QUANDO perguntar e SOBRE O QUE perguntar vive aqui, em
 * funções puras. A tela só apresenta.
 */

import { MESES_JORNADA, type EstadoJornada, type MesJornada } from './jornada';

export type RespostaAfericao = 'mais_perto' | 'igual' | 'mais_longe';

export type Afericao = {
  mes_jornada:         number;
  volta:               number;
  dia_jornada:         number;
  resposta:            RespostaAfericao;
  porque:              string | null;
  manchete_no_momento: string | null;
  created_at:          string;
};

// ─── Quando perguntar ─────────────────────────────────────────────────────────

/**
 * Qual mês encerrado ainda não foi aferido.
 *
 * Perguntamos sobre o mês que **acabou**, não sobre o que está em curso: não dá
 * para avaliar um trecho que a pessoa ainda está andando.
 *
 * A regra é deliberadamente tolerante. Não exige que a pessoa abra o app no dia
 * exato em que o mês virou — qualquer dia depois serve, e o mês mais antigo em
 * aberto tem prioridade. Um app que só aceita a resposta na data certa é um app
 * que não recebe resposta nenhuma.
 */
export function mesAAferir(
  estado: EstadoJornada | null,
  jaAferidos: Afericao[],
): MesJornada | null {
  if (!estado) return null;

  const feitos = new Set(
    jaAferidos
      .filter((a) => a.volta === estado.volta)
      .map((a) => a.mes_jornada),
  );

  // Meses inteiramente vividos nesta volta, do mais antigo para o mais recente.
  const encerrados = MESES_JORNADA.filter((m) => m.diaFim < estado.diaNoCiclo);

  return encerrados.find((m) => !feitos.has(m.numero)) ?? null;
}

/** Quantos meses encerrados ainda esperam resposta. */
export function pendentes(estado: EstadoJornada | null, jaAferidos: Afericao[]): number {
  if (!estado) return 0;
  const feitos = new Set(
    jaAferidos.filter((a) => a.volta === estado.volta).map((a) => a.mes_jornada),
  );
  return MESES_JORNADA.filter((m) => m.diaFim < estado.diaNoCiclo && !feitos.has(m.numero)).length;
}

// ─── A pergunta ───────────────────────────────────────────────────────────────

export const OPCOES: Array<{ valor: RespostaAfericao; rotulo: string; cor: string }> = [
  { valor: 'mais_perto', rotulo: 'Mais perto', cor: '#1E8449' },
  { valor: 'igual',      rotulo: 'Igual',      cor: '#B7791F' },
  { valor: 'mais_longe', rotulo: 'Mais longe', cor: '#C0392B' },
];

/**
 * O enunciado.
 *
 * Sem manchete definida a pergunta não faz sentido — devolve null e a tela
 * convida a criar a âncora primeiro.
 */
export function enunciado(mes: MesJornada, manchete: string | null | undefined): string | null {
  if (!manchete?.trim()) return null;
  return (
    `Você fechou o mês "${mes.tema}". Olhando estes últimos ${mes.diaFim - mes.diaInicio + 1} ` +
    `dias com honestidade: você está mais perto ou mais longe de ser a pessoa da sua âncora?`
  );
}

// ─── A série ──────────────────────────────────────────────────────────────────

export type Serie = {
  total:      number;
  maisPerto:  number;
  igual:      number;
  maisLonge:  number;
  /** Leitura honesta do conjunto, para a tela. */
  texto:      string;
};

/**
 * Resume as aferições de uma volta.
 *
 * O tom aqui importa tanto quanto a conta. Uma sequência de "mais longe" é
 * exatamente o momento em que a pessoa mais precisa continuar aparecendo — e o
 * pior momento possível para o app confirmar que ela está fracassando.
 *
 * Ao mesmo tempo, maquiar o dado destruiria o valor da régua. A saída é dizer a
 * verdade e mudar a pergunta: quando o saldo é negativo, o texto não julga a
 * pessoa, questiona a âncora. Muitas vezes o problema não é a falta de esforço
 * — é uma meta herdada que nunca foi realmente sua.
 */
export function resumirSerie(afericoes: Afericao[], volta = 1): Serie {
  const da = afericoes.filter((a) => a.volta === volta);
  const maisPerto = da.filter((a) => a.resposta === 'mais_perto').length;
  const igual     = da.filter((a) => a.resposta === 'igual').length;
  const maisLonge = da.filter((a) => a.resposta === 'mais_longe').length;
  const total     = da.length;

  let texto: string;
  if (total === 0) {
    texto = 'Sua primeira aferição acontece ao fim do primeiro mês.';
  } else if (total === 1) {
    texto = 'Uma aferição registrada. A régua começa a existir a partir da segunda.';
  } else if (maisLonge > maisPerto) {
    texto =
      `${maisLonge} de ${total} aferições apontaram para longe. ` +
      `Antes de concluir que faltou esforço, vale reler sua âncora: ` +
      `ela ainda descreve quem você quer ser, ou é uma meta que você herdou?`;
  } else if (maisPerto >= total * 0.6) {
    texto = `${maisPerto} de ${total} aferições apontaram para perto. O caminho está sustentando a direção.`;
  } else {
    texto = `${maisPerto} para perto, ${igual} sem mudança, ${maisLonge} para longe. Movimento existe, direção ainda oscila.`;
  }

  return { total, maisPerto, igual, maisLonge, texto };
}
