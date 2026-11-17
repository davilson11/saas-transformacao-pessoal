import { COR_GOLD } from '@/lib/tokens';

/**
 * O pill dourado do cabeçalho: emoji + "F14 · Nome da ferramenta".
 *
 * Estava copiado em cinco ferramentas: crm-relacionamentos,
 * desconstrutor-crencas, energia-vitalidade, prevencao-recaida e
 * sprint-aprendizado. Aparência mantida idêntica.
 */
export default function BadgeTopo({
  emoji,
  children,
}: {
  emoji:    string;
  children: React.ReactNode;
}) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      background: `${COR_GOLD}15`, border: `1px solid ${COR_GOLD}30`,
      borderRadius: 99, padding: '4px 14px', marginBottom: 16,
    }}>
      <span style={{ fontSize: 14 }}>{emoji}</span>
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: COR_GOLD }}>
        {children}
      </span>
    </div>
  );
}
