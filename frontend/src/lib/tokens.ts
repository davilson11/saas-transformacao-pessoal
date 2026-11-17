/**
 * Cores de marca — um lugar só.
 *
 * ─── Por que isto existe ───────────────────────────────────────────────────
 *
 * Antes deste arquivo, 14 das 16 ferramentas declaravam as próprias constantes
 * de cor, e elas não concordavam entre si:
 *
 *   9 ferramentas:  const COR_GOLD = '#b5840a'
 *   5 ferramentas:  const COR_GOLD = "#E0A55F"
 *   e o Momento:    '#C8A030' em 168 lugares
 *
 * Três dourados com o mesmo nome. Invisível olhando uma tela por vez; evidente
 * navegando de uma ferramenta para outra. O mesmo valia para o verde escuro
 * (#1a5c3a em 9, #1E392A em 5).
 *
 * O dourado oficial passa a ser o do Momento — a tela que a pessoa abre todo
 * dia é a que define a marca. O verde escuro passa a ser o de globals.css.
 *
 * Os nomes antigos continuam existindo como aliases para a migração não exigir
 * reescrever JSX. Código novo deve usar GOLD / VERDE / BORDER.
 */

export const GOLD   = '#C8A030';
export const VERDE  = '#1a5c3a';
export const BORDER = 'rgba(26,92,58,0.1)';

// ── Aliases dos nomes que as ferramentas já usavam ─────────────────────────
export const COR_GOLD    = GOLD;
export const COR_VERDE   = VERDE;
export const COR_PRIMARY = VERDE; // auditoria-tempo, raio-x, rotina-ideal
export const COR_DARK    = VERDE; // era #1E392A em 5 ferramentas — unificado
export const COR_BORDER  = BORDER;
