/**
 * Contraste entre o que a pessoa diz que importa e como ela usa o dia.
 *
 * Cruza a Bússola de Valores (o que importa, em ordem de prioridade) com o dia
 * típico da Auditoria de Tempo (quantas horas vão para cada área). É a segunda
 * ponte entre ferramentas do produto.
 *
 * ─── Sobre a honestidade deste módulo ──────────────────────────────────────
 *
 * O risco aqui não é técnico, é de credibilidade. Num produto sobre
 * autoconhecimento, uma observação errada dita com confiança é pior do que
 * nenhuma observação: destrói a confiança em tudo que o app disser depois.
 *
 * Por isso o módulo só fala quando o vínculo entre valor e área do dia é
 * inequívoco. "Saúde" → horas de saúde é óbvio. "Coragem" → qual área? Não dá
 * para saber, e inventar um mapeamento seria fabricar uma conclusão. Nesses
 * casos o módulo fica calado — e a tela avisa que ficou, para o usuário não
 * achar que o app julgou e sim que ele não tem base para julgar.
 *
 * As referências de horas não são minhas: são as mesmas `sugestao` que a
 * Auditoria de Tempo já mostra ao usuário. O app não inventa uma régua nova.
 */

import type { Valor } from './valores';

// ─── Entrada ──────────────────────────────────────────────────────────────────

export type AreaDia = 'trabalho' | 'familia' | 'saude' | 'lazer' | 'crescimento' | 'desperdicado';

/** O que a Auditoria de Tempo salva: horas por dia em cada área. */
export type DiaTipico = Record<AreaDia, number>;

export type RespostasAuditoria = {
  diaTipico?: Partial<DiaTipico>;
};

/**
 * Mapeamento valor → área do dia. **Só o que é inequívoco.**
 *
 * Deliberadamente ausentes: as categorias 'ser' (autenticidade, coragem,
 * integridade, serenidade), 'fazer' (excelência, criatividade, impacto,
 * disciplina) e 'ter' (liberdade, segurança, abundância). Nenhuma delas tem
 * equivalente direto num balde de horas — "Integridade" não é uma atividade de
 * agenda, e "Excelência" pode viver no trabalho, no estudo ou no treino.
 */
const VALOR_PARA_AREA: Record<string, AreaDia> = {
  // relacionar → família e relacionamentos
  amor:          'familia',
  lealdade:      'familia',
  empatia:       'familia',
  pertencimento: 'familia',
  // saúde é literal
  saude:         'saude',
  // crescer → crescimento pessoal
  aprendizado:   'crescimento',
  proposito:     'crescimento',
  aventura:      'crescimento',
  legado:        'crescimento',
};

/** As mesmas sugestões que a Auditoria de Tempo já exibe (horas/dia). */
const REFERENCIA_HORAS: Record<AreaDia, number> = {
  trabalho:     8,
  familia:      3,
  saude:        2,
  lazer:        3,
  crescimento:  1,
  desperdicado: 2,
};

const NOME_AREA: Record<AreaDia, string> = {
  trabalho:     'trabalho',
  familia:      'família e relacionamentos',
  saude:        'saúde',
  lazer:        'lazer',
  crescimento:  'crescimento pessoal',
  desperdicado: 'tempo desperdiçado',
};

// ─── Saída ────────────────────────────────────────────────────────────────────

export type TipoObservacao = 'contradicao' | 'atencao' | 'reconhecimento';

export type Observacao = {
  id:     string;
  tipo:   TipoObservacao;
  valor:  Valor;
  texto:  string;
};

export type Contraste = {
  observacoes: Observacao[];
  /** Valores do top 3 sem equivalente numa área do dia — o app não opina. */
  semMapeamento: Valor[];
};

// ─── Regras ───────────────────────────────────────────────────────────────────

/** Quantos valores do topo do ranking são considerados. */
const TOP = 3;

function horas(dia: Partial<DiaTipico> | undefined, area: AreaDia): number | null {
  const v = dia?.[area];
  return typeof v === 'number' && Number.isFinite(v) ? v : null;
}

/** "1h30" em vez de "1.5h". */
export function formatarHoras(h: number): string {
  const inteiras = Math.floor(h);
  const minutos  = Math.round((h - inteiras) * 60);
  if (minutos === 0) return `${inteiras}h`;
  if (inteiras === 0) return `${minutos}min`;
  return `${inteiras}h${String(minutos).padStart(2, '0')}`;
}

/**
 * Compara os valores do usuário com o dia típico dele.
 *
 * Só olha o top 3 do ranking: se um valor está em quinto lugar, a ausência dele
 * na agenda não é uma contradição, é uma escolha razoável de prioridade.
 *
 * Três tipos de observação:
 *  - `contradicao`  — o tempo desperdiçado supera a área de um valor central.
 *                     É o contraste mais forte, e o mais difícil de rebater,
 *                     porque os dois números vieram da própria pessoa.
 *  - `atencao`      — a área está abaixo da referência que a ferramenta sugere.
 *  - `reconhecimento` — a área está no nível ou acima. Existe para o app não
 *                     ser só cobrança: quem está fazendo certo precisa saber.
 */
export function calcularContraste(
  valores: Valor[],
  respostas: RespostasAuditoria | null | undefined,
): Contraste {
  const dia = respostas?.diaTipico;
  const topo = valores.slice(0, TOP);

  if (!dia || topo.length === 0) {
    return { observacoes: [], semMapeamento: [] };
  }

  const desperdicado = horas(dia, 'desperdicado');
  const observacoes: Observacao[] = [];
  const semMapeamento: Valor[] = [];

  topo.forEach((valor, i) => {
    const area = VALOR_PARA_AREA[valor.id];
    if (!area) {
      semMapeamento.push(valor);
      return;
    }

    const h = horas(dia, area);
    if (h === null) return;

    const posicao   = i === 0 ? 'seu valor número 1' : `um dos seus três valores centrais`;
    const referencia = REFERENCIA_HORAS[area];

    // Contradição: o ruído consome mais do que aquilo que a pessoa diz que importa.
    if (desperdicado !== null && desperdicado > h && desperdicado > 0) {
      observacoes.push({
        id:    `contradicao-${valor.id}`,
        tipo:  'contradicao',
        valor,
        texto:
          `${valor.emoji} ${valor.nome} é ${posicao}, e você registra ` +
          `${formatarHoras(h)} por dia em ${NOME_AREA[area]} — contra ` +
          `${formatarHoras(desperdicado)} de tempo desperdiçado. ` +
          `Os dois números são seus. O que eles dizem juntos?`,
      });
      return;
    }

    if (h < referencia) {
      observacoes.push({
        id:    `atencao-${valor.id}`,
        tipo:  'atencao',
        valor,
        texto:
          `${valor.emoji} ${valor.nome} é ${posicao}, mas ${NOME_AREA[area]} ` +
          `ocupa ${formatarHoras(h)} do seu dia — abaixo das ` +
          `${formatarHoras(referencia)} que esta ferramenta usa como referência.`,
      });
      return;
    }

    observacoes.push({
      id:    `reconhecimento-${valor.id}`,
      tipo:  'reconhecimento',
      valor,
      texto:
        `${valor.emoji} ${valor.nome} é ${posicao}, e ${NOME_AREA[area]} ` +
        `ocupa ${formatarHoras(h)} do seu dia. Aqui sua agenda concorda com o que você diz.`,
    });
  });

  // Contradições primeiro, reconhecimentos por último.
  const ordem: Record<TipoObservacao, number> = { contradicao: 0, atencao: 1, reconhecimento: 2 };
  observacoes.sort((a, b) => ordem[a.tipo] - ordem[b.tipo]);

  return { observacoes, semMapeamento };
}

/**
 * Explicação para os valores que o módulo não consegue avaliar.
 * Existe para o silêncio não parecer omissão nem julgamento.
 */
export function textoSemMapeamento(valores: Valor[]): string {
  if (valores.length === 0) return '';
  const nomes = valores.map((v) => `${v.emoji} ${v.nome}`).join(', ');
  return (
    `Sobre ${nomes}, esta comparação não diz nada: ${valores.length === 1 ? 'esse valor não é' : 'esses valores não são'} ` +
    `uma atividade de agenda, então não daria para medir em horas sem inventar uma conclusão.`
  );
}
