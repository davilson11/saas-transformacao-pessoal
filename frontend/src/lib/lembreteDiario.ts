/**
 * A mensagem do lembrete da manhã.
 *
 * ─── Por que isto não é um texto fixo ──────────────────────────────────────
 *
 * "Seu momento diário está pronto. Registre seu dia!" é um aviso sobre o app.
 * A pessoa lê isso três manhãs seguidas e para de ver — a notificação vira
 * ruído de sistema, igual a "backup concluído".
 *
 * O que não vira ruído é conteúdo. Um trecho da voz do dia já diz alguma coisa
 * antes de abrir o app, e abrir passa a ser querer o resto em vez de cumprir
 * tabela. É a mesma lógica da manchete de jornal: o título entrega o suficiente
 * para criar a pergunta, não para respondê-la.
 *
 * Por isso a mensagem carrega o dia, o tema do mês e as primeiras palavras do
 * texto — e nunca cobra. Lembrete que cobra ensina a pessoa a não olhar.
 */

import type { EstadoJornada } from './jornada';

export type Lembrete = {
  title: string;
  body:  string;
  url:   string;
};

/** Corta no limite de caracteres sem quebrar palavra, e fecha com reticências. */
export function recortar(texto: string, limite = 110): string {
  const limpo = (texto ?? '').replace(/\s+/g, ' ').trim();
  if (limpo.length <= limite) return limpo;

  const corte = limpo.slice(0, limite);
  const ultimoEspaco = corte.lastIndexOf(' ');
  const base = ultimoEspaco > limite * 0.6 ? corte.slice(0, ultimoEspaco) : corte;

  // Tira pontuação solta antes das reticências: "palavra," vira "palavra…"
  return `${base.replace(/[\s,;:.—–-]+$/, '')}…`;
}

/**
 * Monta a notificação da manhã.
 *
 * `vozDoDia` pode faltar — se o conteúdo do dia não carregar, a mensagem ainda
 * precisa existir, só que sem a isca. Melhor um lembrete simples que lembrete
 * nenhum.
 */
export function montarLembrete(
  estado: EstadoJornada,
  vozDoDia?: string | null,
): Lembrete {
  const title = `Dia ${estado.diaNoCiclo} · ${estado.mes.tema}`;

  const voz = (vozDoDia ?? '').trim();
  const body = voz
    ? recortar(voz)
    : 'Seu momento de hoje está aqui.';

  return { title, body, url: '/momento' };
}
