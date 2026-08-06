/**
 * Planos "se-então" (implementation intentions).
 *
 * ─── Por que isto existe ───────────────────────────────────────────────────
 *
 * É a intervenção com melhor evidência de toda a psicologia da mudança.
 * Gollwitzer e Sheeran mediram efeito médio-grande (d = 0,65) sobre atingimento
 * de objetivos em 94 testes independentes; a agregação de 2024 chegou a 642.
 *
 * Três condições aumentam o efeito, e todas estão refletidas neste módulo:
 *   1. formato contingente ("quando X, então Y") — não uma lista de tarefas
 *   2. o plano ser ensaiado ao menos uma vez — por isso a frase é devolvida
 *      montada, para a pessoa ler
 *   3. especificidade — plano vago não engata
 *
 * O app já tinha isso, mas escondido na ferramenta 16, fase 4: a técnica mais
 * forte da ciência comportamental estava no fim da fila, onde a maioria nunca
 * chega. Aqui ela passa a acontecer 365 vezes por ano, junto da missão do dia.
 *
 * Nada aqui usa IA. É estrutura de pergunta, que é o que a evidência sustenta.
 */

export type Especificidade = 'vago' | 'razoavel' | 'especifico';

export type AnaliseGatilho = {
  nivel:  Especificidade;
  /** Sugestão para a tela. Vazio quando o gatilho já está bom. */
  dica:   string;
  temHora:   boolean;
  temLugar:  boolean;
  temAncora: boolean;
};

// As três expressões usam \p{L} com a flag `u` em vez de \b.
//
// Motivo: em JavaScript, \b se apoia em \w, que é [A-Za-z0-9_] e não inclui
// acento. "de manhã\b" nunca casa, porque depois do "ã" não há caractere de
// palavra para formar a fronteira. Com português isso quebra em silêncio — o
// teste de "de manhã" foi o que revelou.

// Hora explícita: "7h", "07:30", "às 8", "de manhã", "antes de dormir".
const RX_HORA = /(?<!\p{L})(\d{1,2}\s*[:h]\s*\d{0,2}|\d{1,2}\s*horas?|de manhã|à tarde|de tarde|à noite|de noite|ao acordar|antes de dormir|no almoço|madrugada)(?!\p{L})/iu;

// Lugar: preposição seguida de substantivo de lugar comum.
const RX_LUGAR = /(?<!\p{L})(n[ao]s?|em|no|na)\s+(cozinha|quarto|sala|escritório|escritorio|academia|carro|ônibus|onibus|banheiro|mesa|cama|sofá|sofa|trabalho|igreja|rua|parque|escada|varanda|casa)(?!\p{L})/iu;

// Âncora comportamental: encaixar numa ação que já existe.
const RX_ANCORA = /(?<!\p{L})(depois d[eoa]|assim que|logo que|antes d[eoa]|quando (eu )?(termin|acord|chegar|sentar|sair|entrar|desligar|fechar))/iu;

/**
 * Avalia o quanto o gatilho é acionável.
 *
 * A régua não é linguística, é prática: um gatilho serve quando a situação
 * descrita é reconhecível no momento em que acontece. "Amanhã" não é
 * reconhecível — amanhã dura o dia inteiro. "Ao sentar para o café" é.
 *
 * O tom das dicas é de ajuste, não de reprovação. O campo é opcional, e um
 * plano vago continua sendo melhor que plano nenhum.
 */
export function analisarGatilho(gatilho: string): AnaliseGatilho {
  const texto = (gatilho ?? '').trim();

  const temHora   = RX_HORA.test(texto);
  const temLugar  = RX_LUGAR.test(texto);
  const temAncora = RX_ANCORA.test(texto);
  const sinais    = [temHora, temLugar, temAncora].filter(Boolean).length;

  if (texto.length < 3) {
    return { nivel: 'vago', dica: '', temHora, temLugar, temAncora };
  }

  if (sinais >= 2) {
    return { nivel: 'especifico', dica: '', temHora, temLugar, temAncora };
  }

  if (sinais === 1) {
    const falta = !temLugar
      ? 'Onde você vai estar?'
      : 'Que horas, ou depois de qual outra coisa?';
    return { nivel: 'razoavel', dica: `Bom gatilho. ${falta} Quanto mais reconhecível o momento, mais o plano engata.`, temHora, temLugar, temAncora };
  }

  return {
    nivel: 'vago',
    dica: 'Tente ancorar num momento reconhecível — um horário, um lugar, ou logo depois de algo que você já faz todo dia.',
    temHora, temLugar, temAncora,
  };
}

/**
 * Monta a frase completa para ser lida de volta.
 *
 * O ensaio mental é uma das condições que aumentam o efeito, e ler a frase
 * pronta é a forma mais barata de provocá-lo. Por isso a tela devolve o plano
 * montado em vez de só guardar o que foi digitado.
 */
export function montarPlano(gatilho: string, missao: string): string | null {
  const g = (gatilho ?? '').trim();
  const m = (missao ?? '').trim();
  if (!g || !m) return null;

  // Tira o "quando" inicial se a pessoa já escreveu, para não duplicar.
  const limpo = g.replace(/^(quando|assim que|logo que)\s+/i, '');
  const acao  = m.charAt(0).toLowerCase() + m.slice(1);

  return `Quando ${limpo}, eu vou ${acao}`;
}
