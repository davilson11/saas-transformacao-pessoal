/**
 * A única leitura desta funcionalidade: a linha 'diario' do dia-marco.
 *
 * Isola o cast do cliente, como `afericaoDb.ts` e `conteudoDoDia.ts` fazem,
 * porque `diario_kairos` é lida aqui por colunas que o tipo gerado conhece,
 * mas o cliente chega como `unknown` do hook.
 */

import type { ResultadoMarco } from './marcos';

type Linha = { missao_execucao: string | null; created_at: string | null };

type Consulta = {
  order: (col: string, opts: { ascending: boolean }) => {
    limit: (n: number) => Promise<{ data: Linha[] | null; error: { message: string } | null }>;
  };
};
type Cliente = {
  from: (t: string) => {
    select: (c: string) => {
      eq: (k: string, v: string) => { eq: (k: string, v: string) => { eq: (k: string, v: string) => Consulta } };
    };
  };
};

/**
 * Busca o `missao_execucao` da linha 'diario' do dia.
 *
 * Duplicidade: o código do Diário de Bordo localiza por `user_id + data +
 * tipo_entrada` antes de inserir, então duas linhas 'diario' para o mesmo dia
 * não deveriam existir. Mas "não deveria" não é garantia — não há UNIQUE no
 * banco. Por isso a consulta pede até 2, ordenadas por `created_at` (que vem
 * do DEFAULT do banco e é confiável): se vierem 2, usa a mais recente e
 * registra a anomalia no console. A pessoa não vê nada disso.
 *
 * Erro de consulta vira 'erro', nunca 'ausente'.
 */
export async function buscarTextoDoMarco(
  client: unknown,
  userId: string,
  data: string,
): Promise<ResultadoMarco> {
  const c = client as Cliente;
  const { data: linhas, error } = await c
    .from('diario_kairos')
    .select('missao_execucao, created_at')
    .eq('user_id', userId)
    .eq('data', data)
    .eq('tipo_entrada', 'diario')
    .order('created_at', { ascending: false })
    .limit(2);

  if (error) {
    console.error('[marcosDb] diario_kairos:', error.message);
    return { situacao: 'erro' };
  }

  const lista = linhas ?? [];
  if (lista.length > 1) {
    console.warn(`[marcosDb] mais de uma linha 'diario' para ${userId} em ${data}; usando a mais recente.`);
  }

  const texto = lista[0]?.missao_execucao?.trim();
  return texto ? { situacao: 'texto', texto } : { situacao: 'ausente' };
}
