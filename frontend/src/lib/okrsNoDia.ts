/**
 * Os OKRs no registro diário.
 *
 * ─── Por que esta ponte existe ─────────────────────────────────────────────
 *
 * Automonitoramento é o BCT mais consistentemente eficaz das meta-análises
 * (d = 0,42 quando presente contra 0,26 quando ausente, em Michie et al.). E a
 * combinação **automonitoramento + definição de metas** é a mais confiável de
 * todas — mais do que qualquer uma das duas isolada.
 *
 * O app tinha as duas partes e elas não se falavam: a pessoa definia OKRs
 * trimestrais numa tela e registrava o dia em outra. O registro diário não
 * sabia que existia um objetivo; o objetivo não sabia que a pessoa registrou 40
 * dias. Era o par com maior lastro empírico do produto, desconectado.
 *
 * Aqui o número do resultado-chave passa a ser atualizável de dentro do dia.
 *
 * ─── Sobre os números ──────────────────────────────────────────────────────
 *
 * `meta` e `atual` são texto livre no formulário de OKRs — a pessoa digita
 * "1,5", "1.5", "R$ 3.000" ou "três vezes". Este módulo só trata como métrica o
 * que dá para ler com segurança, e ignora o resto em vez de inventar um número.
 * Um KR qualitativo continua válido; ele só não aparece no acompanhamento
 * diário, onde não haveria o que acompanhar.
 */

export type KeyResult = {
  descricao: string;
  meta:      string;
  atual:     string;
  unidade:   string;
  prazo:     string;
};

export type Objetivo = {
  texto:    string;
  emoji:    string;
  krs:      KeyResult[];
  valorId?: string | null;
};

export type RespostasOkrs = {
  trimestre?: string;
  objetivos?: Objetivo[];
};

export type KrAcompanhavel = {
  /** Índices para escrever de volta no JSON sem ambiguidade. */
  objetivoIdx: number;
  krIdx:       number;
  objetivoTexto: string;
  emoji:       string;
  descricao:   string;
  unidade:     string;
  atual:       number;
  meta:        number;
  /** 0–100. */
  progresso:   number;
  concluido:   boolean;
};

/**
 * Lê um número escrito por humano em português.
 *
 * Aceita "1,5", "1.5", "R$ 3.000,50", "12 kg". Devolve null quando não há um
 * número confiável — chutar aqui produziria uma barra de progresso mentirosa,
 * que é pior que barra nenhuma.
 */
export function lerNumero(valor: string | null | undefined): number | null {
  if (valor == null) return null;
  const bruto = String(valor).trim();
  if (!bruto) return null;

  // Fica só com dígitos, vírgula, ponto e sinal.
  const limpo = bruto.replace(/[^\d.,-]/g, '');
  if (!limpo || !/\d/.test(limpo)) return null;

  const temVirgula = limpo.includes(',');
  const temPonto   = limpo.includes('.');

  let normalizado = limpo;
  if (temVirgula && temPonto) {
    // "3.000,50" — ponto é milhar, vírgula é decimal.
    normalizado = limpo.replace(/\./g, '').replace(',', '.');
  } else if (temVirgula) {
    // "1,5" decimal; "3,000" é ambíguo, mas em pt-BR vírgula é decimal.
    normalizado = limpo.replace(',', '.');
  }

  const n = Number(normalizado);
  return Number.isFinite(n) ? n : null;
}

/**
 * Extrai os resultados-chave que dá para acompanhar por número.
 *
 * Só entram os que têm meta numérica maior que zero e descrição preenchida.
 * Os concluídos continuam na lista — ver um KR batido é reforço, e escondê-lo
 * apagaria a única boa notícia do painel.
 */
export function krsAcompanhaveis(respostas: RespostasOkrs | null | undefined): KrAcompanhavel[] {
  const objetivos = respostas?.objetivos ?? [];
  const saida: KrAcompanhavel[] = [];

  objetivos.forEach((obj, objetivoIdx) => {
    if (!obj?.texto?.trim()) return;

    (obj.krs ?? []).forEach((kr, krIdx) => {
      if (!kr?.descricao?.trim()) return;

      const meta  = lerNumero(kr.meta);
      const atual = lerNumero(kr.atual) ?? 0;
      if (meta === null || meta <= 0) return;

      const progresso = Math.max(0, Math.min(100, Math.round((atual / meta) * 100)));

      saida.push({
        objetivoIdx, krIdx,
        objetivoTexto: obj.texto.trim(),
        emoji:     obj.emoji ?? '🎯',
        descricao: kr.descricao.trim(),
        unidade:   (kr.unidade ?? '').trim(),
        atual, meta, progresso,
        concluido: atual >= meta,
      });
    });
  });

  return saida;
}

/**
 * Grava o novo valor de um KR preservando todo o resto do JSON.
 *
 * Devolve uma cópia — mutar o objeto original faria o React não perceber a
 * mudança, e pior, arriscaria gravar estado parcial se algo falhasse no meio.
 */
export function atualizarKr(
  respostas: RespostasOkrs,
  objetivoIdx: number,
  krIdx: number,
  novoAtual: string,
): RespostasOkrs {
  const objetivos = (respostas.objetivos ?? []).map((obj, i) => {
    if (i !== objetivoIdx) return obj;
    return {
      ...obj,
      krs: (obj.krs ?? []).map((kr, j) => (j === krIdx ? { ...kr, atual: novoAtual } : kr)),
    };
  });
  return { ...respostas, objetivos };
}

/**
 * Frase de acompanhamento para a tela.
 *
 * Nenhum cenário cobra. Um KR parado por semanas é informação, não acusação —
 * e a pessoa que vê "você não mexeu nisso" fecha o app em vez de mexer.
 */
export function resumoDoDia(krs: KrAcompanhavel[]): string {
  if (krs.length === 0) return '';
  const concluidos = krs.filter((k) => k.concluido).length;

  if (concluidos === krs.length) {
    return krs.length === 1
      ? 'Resultado-chave batido. Vale registrar o que fez isso acontecer.'
      : 'Todos os resultados-chave batidos neste trimestre.';
  }
  if (concluidos > 0) {
    return `${concluidos} de ${krs.length} resultados-chave já batidos.`;
  }
  return 'Atualize o número quando ele mudar. É o registro que faz a meta existir.';
}
