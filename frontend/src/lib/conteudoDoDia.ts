import type { MomentoKairos } from './database.types';
import { dataFixaHoje } from './jornada';

/**
 * O client vem tipado com o schema `Database`, que não descreve
 * `momento_kairos` — ela foi criada fora do schema tipado. Por isso a consulta
 * é feita através desta interface mínima, com o cast acontecendo em um lugar
 * só, aqui, em vez de espalhado pelas três telas que precisam do conteúdo.
 */
type ClientConsulta = {
  from: (tabela: string) => {
    select: (colunas: string) => {
      eq: (coluna: string, valor: string | number) => {
        maybeSingle: () => PromiseLike<{ data: unknown }>;
      };
    };
  };
};

/**
 * Busca o conteúdo do dia.
 *
 * Duas fontes, com precedência: se hoje é uma data fixa (Natal, por exemplo),
 * o conteúdo dela vence, independentemente do ponto da jornada em que a pessoa
 * esteja. Caso contrário, vem o conteúdo do dia da jornada dela.
 *
 * Está centralizado aqui porque três telas precisam da mesma regra — momento,
 * o card do dashboard e missões. Duplicar a decisão em três lugares é como
 * nascem as divergências silenciosas entre telas.
 *
 * A RLS no banco aplica a mesma regra. Esta função existe para a interface não
 * pedir o que o banco vai negar, mas a decisão que vale é sempre a do banco.
 */
export async function buscarConteudoDoDia(
  client: unknown,
  diaJornada: number | null,
): Promise<MomentoKairos | null> {
  const c = client as ClientConsulta;

  const { data: fixo } = await c
    .from('momento_kairos')
    .select('*')
    .eq('data_fixa', dataFixaHoje())
    .maybeSingle();

  if (fixo) return fixo as MomentoKairos;

  // Só consulta a jornada quando não há conteúdo fixo hoje.
  if (diaJornada === null) return null;

  const { data: doDia } = await c
    .from('momento_kairos')
    .select('*')
    .eq('dia_jornada', diaJornada)
    .maybeSingle();

  return (doDia as MomentoKairos | null) ?? null;
}
