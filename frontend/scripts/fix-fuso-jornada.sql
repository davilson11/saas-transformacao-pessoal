-- ═══════════════════════════════════════════════════════════════════════════
-- O BUG DO FUSO — jornada começando amanhã
-- ═══════════════════════════════════════════════════════════════════════════
--
-- O Postgres do Supabase roda em UTC. `CURRENT_DATE` é a data em UTC, não em
-- São Paulo. Entre 21h e meia-noite (horário de Brasília) o banco já virou o
-- dia, enquanto para a pessoa ainda é hoje.
--
-- Isso aparecia em dois lugares:
--
--   1. DEFAULT de `subscriptions.jornada_inicio` — quem se cadastrasse à noite
--      recebia a data de AMANHÃ como início da jornada. O app, que conta no
--      fuso de São Paulo, calculava dia 0. Dia 0 não existe: a tela do momento
--      abria vazia, no primeiro acesso da pessoa.
--
--   2. Policy de leitura de `momento_kairos` — à noite liberava o conteúdo do
--      dia seguinte três horas antes, e no dia 365 podia liberar o ciclo
--      inteiro cedo demais.
--
-- Nenhum dos dois quebrava de dia. Por isso passou despercebido.
--
-- A correção é usar sempre `America/Sao_Paulo`, que é a mesma régua que o app
-- usa em `hojeStr()` (src/lib/jornada.ts).
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ── 1. Função única para "hoje em São Paulo" ────────────────────────────────
-- Uma função em vez de repetir a expressão: se um dia o fuso mudar, muda aqui.
-- IMMUTABLE não serve (depende do relógio); STABLE basta e permite usar em
-- policies e defaults.

CREATE OR REPLACE FUNCTION hoje_sp() RETURNS date
  LANGUAGE sql STABLE
  AS $$ SELECT (now() AT TIME ZONE 'America/Sao_Paulo')::date $$;


-- ── 2. O default da coluna ──────────────────────────────────────────────────

ALTER TABLE subscriptions
  ALTER COLUMN jornada_inicio SET DEFAULT hoje_sp();


-- ── 3. Consertar quem já ficou com data no futuro ───────────────────────────
-- Puxa para hoje qualquer início adiantado. Não mexe em ninguém que esteja
-- com data correta.

UPDATE subscriptions
   SET jornada_inicio = hoje_sp()
 WHERE jornada_inicio > hoje_sp();


-- ── 4. A policy de leitura, na mesma régua ──────────────────────────────────
-- Mesma lógica de antes; só troca CURRENT_DATE por hoje_sp().

DROP POLICY IF EXISTS "Conteúdo liberado para assinantes" ON momento_kairos;

CREATE POLICY "Conteúdo liberado para assinantes"
  ON momento_kairos FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM subscriptions s
       WHERE s.user_id = auth.jwt() ->> 'sub'
         AND (s.status = 'active'
              OR (s.status = 'trial' AND s.trial_ends_at > now()))
         AND (
           -- conteúdo de data fixa, no dia real dele
           (momento_kairos.data_fixa IS NOT NULL
            AND momento_kairos.data_fixa = to_char(hoje_sp(), 'MM-DD'))
           -- ou já completou um ciclo inteiro: vê tudo
           OR (hoje_sp() - s.jornada_inicio) + 1 > 365
           -- ou até o dia de hoje da jornada dele
           OR momento_kairos.dia_jornada <= (hoje_sp() - s.jornada_inicio) + 1
         )
    )
  );

COMMIT;


-- ═══════════════════════════════════════════════════════════════════════════
-- VERIFICAÇÃO
-- ═══════════════════════════════════════════════════════════════════════════
--
-- 1. Ninguém com início no futuro (esperado: 0 linhas)
--
--   SELECT user_id, jornada_inicio FROM subscriptions WHERE jornada_inicio > hoje_sp();
--
-- 2. O default mudou
--
--   SELECT column_default FROM information_schema.columns
--    WHERE table_name = 'subscriptions' AND column_name = 'jornada_inicio';
--
-- 3. A diferença entre as duas réguas — à noite, os dois valores divergem.
--    É esta divergência que causava o bug.
--
--   SELECT CURRENT_DATE AS utc, hoje_sp() AS sao_paulo, now() AS agora;
-- ═══════════════════════════════════════════════════════════════════════════
