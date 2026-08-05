import type { Afericao, RespostaAfericao } from './afericao';

/**
 * I/O das aferições.
 *
 * `afericoes` foi criada fora do schema tipado `Database`, então o client
 * gerado não a conhece. Mesmo padrão de `conteudoDoDia.ts`: o cast acontece
 * aqui, num lugar só, em vez de espalhado pelo componente.
 */
type ClientAfericoes = {
  from: (tabela: string) => {
    select: (colunas: string) => {
      eq: (coluna: string, valor: string) => PromiseLike<{ data: unknown; error: unknown }>;
    };
    insert: (linha: Record<string, unknown>) => PromiseLike<{ error: { message: string } | null }>;
  };
};

export async function buscarAfericoes(client: unknown, userId: string): Promise<Afericao[]> {
  const c = client as ClientAfericoes;
  const { data, error } = await c.from('afericoes').select('*').eq('user_id', userId);
  if (error) {
    console.error('[afericoes] leitura:', error);
    return [];
  }
  return (data ?? []) as Afericao[];
}

export type NovaAfericao = {
  userId:      string;
  mesJornada:  number;
  volta:       number;
  diaJornada:  number;
  resposta:    RespostaAfericao;
  porque:      string | null;
  manchete:    string | null;
};

export async function salvarAfericao(client: unknown, nova: NovaAfericao): Promise<void> {
  const c = client as ClientAfericoes;
  const { error } = await c.from('afericoes').insert({
    user_id:             nova.userId,
    mes_jornada:         nova.mesJornada,
    volta:               nova.volta,
    dia_jornada:         nova.diaJornada,
    resposta:            nova.resposta,
    porque:              nova.porque,
    manchete_no_momento: nova.manchete,
  });
  if (error) throw new Error(error.message);
}
