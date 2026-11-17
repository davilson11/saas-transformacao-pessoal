/**
 * Interpretação da resposta de `/api/push/subscribe`.
 *
 * ─── Por que isto é uma função pura ────────────────────────────────────────
 *
 * O Onboarding fazia `await fetch(...)` e, na linha seguinte, marcava
 * "granted" — sem olhar a resposta. O Momento tinha o mesmo bug; foi corrigido
 * lá e não chegou aqui, porque eram dois códigos diferentes para a mesma coisa.
 *
 * Com a decisão isolada numa função sem rede, sem React e sem navegador:
 *   1. os dois lugares chamam a mesma coisa e divergir fica difícil;
 *   2. o cenário "servidor respondeu 500" é testável sem subir servidor.
 *
 * E separa duas falhas que o Onboarding confundia: permissão negada no
 * navegador (a pessoa resolve nos ajustes) e falha do servidor (a pessoa não
 * tem o que fazer além de tentar de novo). A mensagem errada manda a pessoa
 * mexer em configuração que não tem nada a ver.
 */

export type ResultadoInscricao =
  | { estado: 'granted' }
  | { estado: 'erro'; mensagem: string };

/** O que o servidor devolve, já lido como JSON (ou null se não deu para ler). */
export type CorpoResposta = { ok?: boolean; error?: string } | null;

export function interpretarInscricao(status: number, corpo: CorpoResposta): ResultadoInscricao {
  if (status >= 200 && status < 300) {
    return { estado: 'granted' };
  }

  const detalhe = corpo?.error?.trim();

  if (status === 401) {
    return { estado: 'erro', mensagem: 'Sua sessão expirou. Entre de novo e tente ativar.' };
  }
  if (status === 400) {
    return { estado: 'erro', mensagem: detalhe || 'O navegador não gerou uma inscrição válida.' };
  }
  return {
    estado: 'erro',
    mensagem: detalhe || `O servidor não conseguiu salvar (${status}). Tente de novo em instantes.`,
  };
}

/**
 * Classifica uma exceção do fluxo de ativação.
 *
 * `requestPermission` negado e `pushManager.subscribe` com chave errada
 * levantam erros diferentes, e o tratamento certo é diferente para cada um.
 */
export type OrigemFalha = 'permissao' | 'chave' | 'navegador' | 'rede';

export function classificarFalha(e: unknown): OrigemFalha {
  const nome = e instanceof Error ? e.name : '';
  const msg  = (e instanceof Error ? e.message : String(e ?? '')).toLowerCase();

  if (nome === 'NotAllowedError' || msg.includes('permission'))          return 'permissao';
  if (nome === 'InvalidStateError' || msg.includes('applicationserverkey')
      || msg.includes('vapid') || msg.includes('chave'))                  return 'chave';
  if (nome === 'TypeError' && msg.includes('fetch'))                      return 'rede';
  return 'navegador';
}

export function mensagemDaFalha(origem: OrigemFalha): string {
  switch (origem) {
    case 'permissao': return 'Permissão negada. Você pode liberar nos ajustes do navegador.';
    case 'chave':     return 'A chave de notificação não está configurada no servidor.';
    case 'rede':      return 'Sem conexão com o servidor. Tente de novo em instantes.';
    default:          return 'Este navegador não conseguiu criar a inscrição.';
  }
}
