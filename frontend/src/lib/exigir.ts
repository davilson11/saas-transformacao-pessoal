/**
 * `exigir` — transforma o `{ data, error }` do Supabase em dado ou exceção.
 *
 * ─── Por que isto existe ───────────────────────────────────────────────────
 *
 * Em 29 lugares do projeto a consulta é escrita assim:
 *
 *     const { data } = await supabase.from('x').select(...)
 *
 * Quando a consulta falha, `error` vem preenchido e `data` vem `null` — e o
 * código segue como se simplesmente não houvesse registros. Numa tela, isso
 * aparece como lista vazia. Numa rota que roda às 6h30 sem ninguém olhando,
 * aparece como `enviados: 0` num log que ninguém lê.
 *
 * Esta função é a versão explícita: ou devolve o dado, ou levanta um erro com
 * contexto de onde veio. Quem chama decide o que fazer com a exceção — mas não
 * consegue mais ignorá-la por acidente.
 */

export type ResultadoSupabase<T> = {
  data:  T | null;
  error: { message: string; code?: string } | null;
};

export class ErroDeConsulta extends Error {
  readonly contexto: string;
  readonly codigo?: string;

  constructor(contexto: string, mensagem: string, codigo?: string) {
    super(`${contexto}: ${mensagem}`);
    this.name     = 'ErroDeConsulta';
    this.contexto = contexto;
    this.codigo   = codigo;
  }
}

/**
 * @param resultado  o retorno de `await supabase.from(...)...`
 * @param contexto   onde a consulta foi feita, para o erro dizer de onde veio
 * @param vazio      o que devolver se `data` vier null SEM erro (padrão: lança)
 */
export function exigir<T>(resultado: ResultadoSupabase<T>, contexto: string, vazio?: T): T {
  if (resultado.error) {
    throw new ErroDeConsulta(contexto, resultado.error.message, resultado.error.code);
  }
  if (resultado.data === null || resultado.data === undefined) {
    if (vazio !== undefined) return vazio;
    throw new ErroDeConsulta(contexto, 'consulta não devolveu dados nem erro');
  }
  return resultado.data;
}
