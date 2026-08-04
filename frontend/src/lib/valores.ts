/**
 * Catálogo de valores — compartilhado.
 *
 * Estava dentro de `bussola-valores/page.tsx`, onde só aquela página enxergava.
 * Foi extraído para cá quando os OKRs passaram a precisar dos mesmos dados: é a
 * primeira vez que uma ferramenta lê o resultado de outra.
 *
 * Quem depende deste módulo:
 *   - ferramentas/bussola-valores  (define os valores do usuário)
 *   - ferramentas/okrs-pessoais    (liga cada objetivo a um valor)
 *   - hooks/useValoresDoUsuario    (lê o ranking salvo)
 */

export type Valor = {
  id:        string;
  nome:      string;
  descricao: string;
  categoria: string;
  emoji:     string;
};

/** Um valor no ranking do usuário: a ordem do array É a prioridade. */
export type ValorRankeado = {
  id:     string;
  porque: string;
};

export type CategoriaValor = {
  id:    string;
  label: string;
  cor:   string;
  emoji: string;
};

export const CATEGORIAS: CategoriaValor[] = [
  { id: 'ser',        label: 'Ser',        cor: '#4a8c6a', emoji: '🪞' },
  { id: 'fazer',      label: 'Fazer',      cor: '#5a7abf', emoji: '⚡' },
  { id: 'ter',        label: 'Ter',        cor: '#d4905a', emoji: '🌿' },
  { id: 'relacionar', label: 'Relacionar', cor: '#9b6baf', emoji: '🤝' },
  { id: 'crescer',    label: 'Crescer',    cor: '#27AE60', emoji: '📈' },
];

export const VALORES: Valor[] = [
  { id: 'autenticidade', nome: 'Autenticidade', descricao: 'Ser fiel a si mesmo em tudo',         categoria: 'ser',        emoji: '🪞' },
  { id: 'coragem',       nome: 'Coragem',       descricao: 'Agir com bravura apesar do medo',     categoria: 'ser',        emoji: '🦁' },
  { id: 'integridade',   nome: 'Integridade',   descricao: 'Coerência entre fala e ação',         categoria: 'ser',        emoji: '⚖️' },
  { id: 'serenidade',    nome: 'Serenidade',    descricao: 'Paz interior em qualquer situação',   categoria: 'ser',        emoji: '🧘' },
  { id: 'excelencia',    nome: 'Excelência',    descricao: 'Dar o melhor em tudo que faz',        categoria: 'fazer',      emoji: '🏆' },
  { id: 'criatividade',  nome: 'Criatividade',  descricao: 'Criar e inovar constantemente',       categoria: 'fazer',      emoji: '🎨' },
  { id: 'impacto',       nome: 'Impacto',       descricao: 'Fazer a diferença na vida dos outros',categoria: 'fazer',      emoji: '💥' },
  { id: 'disciplina',    nome: 'Disciplina',    descricao: 'Consistência nas ações diárias',      categoria: 'fazer',      emoji: '⚡' },
  { id: 'liberdade',     nome: 'Liberdade',     descricao: 'Autonomia sobre a própria vida',      categoria: 'ter',        emoji: '🦅' },
  { id: 'seguranca',     nome: 'Segurança',     descricao: 'Estabilidade e previsibilidade',      categoria: 'ter',        emoji: '🛡️' },
  { id: 'abundancia',    nome: 'Abundância',    descricao: 'Prosperidade em todas as formas',     categoria: 'ter',        emoji: '🌿' },
  { id: 'saude',         nome: 'Saúde',         descricao: 'Corpo e mente em pleno equilíbrio',   categoria: 'ter',        emoji: '💚' },
  { id: 'amor',          nome: 'Amor',          descricao: 'Conexão profunda com quem importa',   categoria: 'relacionar', emoji: '❤️' },
  { id: 'lealdade',      nome: 'Lealdade',      descricao: 'Fidelidade às pessoas e causas',      categoria: 'relacionar', emoji: '🤝' },
  { id: 'empatia',       nome: 'Empatia',       descricao: 'Compreender o outro profundamente',   categoria: 'relacionar', emoji: '💙' },
  { id: 'pertencimento', nome: 'Pertencimento', descricao: 'Sentir que faz parte de algo maior',  categoria: 'relacionar', emoji: '🏡' },
  { id: 'aprendizado',   nome: 'Aprendizado',   descricao: 'Evoluir e aprender constantemente',   categoria: 'crescer',    emoji: '📚' },
  { id: 'proposito',     nome: 'Propósito',     descricao: 'Viver com sentido e direção claros',  categoria: 'crescer',    emoji: '🧭' },
  { id: 'aventura',      nome: 'Aventura',      descricao: 'Explorar o novo e desconhecido',      categoria: 'crescer',    emoji: '🗺️' },
  { id: 'legado',        nome: 'Legado',        descricao: 'Deixar algo que dure além de mim',    categoria: 'crescer',    emoji: '🌳' },
];

const POR_ID = new Map(VALORES.map((v) => [v.id, v]));

export function getValor(id: string): Valor | undefined {
  return POR_ID.get(id);
}

export function getCategoria(id: string): CategoriaValor | undefined {
  return CATEGORIAS.find((c) => c.id === id);
}

// ─── Alinhamento entre objetivos e valores ────────────────────────────────────

/** O que a Bússola salva em `ferramentas_respostas.respostas`. */
export type RespostasBussola = {
  selecionados?: string[];
  ranking?:      ValorRankeado[];
};

/**
 * Extrai os valores do usuário, do mais para o menos prioritário.
 *
 * O `ranking` é a fonte boa: a ordem do array é a prioridade que a pessoa
 * definiu arrastando os itens. Se o ranking ainda não foi montado (a pessoa
 * parou no passo de seleção), cai para `selecionados`, que não tem ordem
 * significativa mas ainda diz quais valores importam.
 *
 * IDs desconhecidos são descartados — o catálogo pode mudar com o tempo e uma
 * resposta antiga não deve quebrar a tela.
 */
export function valoresDoUsuario(respostas: RespostasBussola | null | undefined): Valor[] {
  if (!respostas) return [];

  const ids = respostas.ranking?.length
    ? respostas.ranking.map((r) => r.id)
    : respostas.selecionados ?? [];

  const vistos = new Set<string>();
  const saida: Valor[] = [];

  for (const id of ids) {
    if (vistos.has(id)) continue;
    const v = POR_ID.get(id);
    if (!v) continue;
    vistos.add(id);
    saida.push(v);
  }

  return saida;
}

/** Posição do valor no ranking (1 = mais importante). 0 se não estiver. */
export function prioridadeDoValor(valorId: string | null | undefined, valores: Valor[]): number {
  if (!valorId) return 0;
  const i = valores.findIndex((v) => v.id === valorId);
  return i === -1 ? 0 : i + 1;
}

export type Alinhamento = {
  /** Objetivos preenchidos que apontam para algum valor. */
  alinhados:    number;
  /** Objetivos preenchidos sem valor escolhido. */
  semValor:     number;
  /** Total de objetivos com texto. */
  total:        number;
  /** Valores do usuário que nenhum objetivo serve — a lacuna mais interessante. */
  naoServidos:  Valor[];
};

/**
 * Compara os objetivos do trimestre com os valores do usuário.
 *
 * O dado mais útil aqui não é quantos objetivos estão alinhados — é
 * `naoServidos`: valores que a pessoa declarou importantes e para os quais ela
 * não colocou nenhum objetivo. É o tipo de contradição que um bom mentor aponta.
 */
export function calcularAlinhamento(
  objetivos: { texto: string; valorId?: string | null }[],
  valores:   Valor[],
): Alinhamento {
  const preenchidos = objetivos.filter((o) => o.texto.trim() !== '');
  const usados      = new Set(preenchidos.map((o) => o.valorId).filter(Boolean) as string[]);

  return {
    alinhados:   preenchidos.filter((o) => o.valorId).length,
    semValor:    preenchidos.filter((o) => !o.valorId).length,
    total:       preenchidos.length,
    naoServidos: valores.filter((v) => !usados.has(v.id)),
  };
}
