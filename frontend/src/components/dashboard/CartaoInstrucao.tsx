import { COR_DARK, COR_GOLD } from '@/lib/tokens';

/**
 * O cartão de instrução da etapa — título em negrito, lista com seta dourada.
 *
 * Estava copiado, linha a linha, em cinco ferramentas: design-vida,
 * dre-pessoal, okrs-pessoais, feedback-360 e swot-pessoal. As duas últimas
 * centralizam com largura máxima; as outras ocupam a largura do container.
 *
 * Aparência mantida idêntica à original — isto é extração, não redesign.
 */
export type Instrucao = {
  titulo: string;
  itens:  string[];
};

export default function CartaoInstrucao({
  instrucao,
  centralizado = false,
}: {
  instrucao: Instrucao | null | undefined;
  /** feedback-360 e swot-pessoal usam max-w-2xl mx-auto. */
  centralizado?: boolean;
}) {
  if (!instrucao) return null;

  return (
    <div
      className={`${centralizado ? 'max-w-2xl mx-auto ' : ''}flex flex-col gap-3 rounded-xl p-4 mb-6`}
      style={{ background: `${COR_DARK}06`, border: `1px solid ${COR_DARK}12` }}
    >
      <p style={{ fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 700, color: COR_DARK }}>
        {instrucao.titulo}
      </p>
      <ul className="flex flex-col gap-2">
        {instrucao.itens.map((item, i) => (
          <li key={i} className="flex items-start gap-2">
            <span style={{ color: COR_GOLD, fontSize: 15, marginTop: 1, flexShrink: 0 }}>→</span>
            <span style={{ fontSize: 15, color: 'var(--color-brand-gray)', lineHeight: 1.5 }}>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
