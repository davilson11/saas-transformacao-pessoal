-- ═══════════════════════════════════════════════════════════════════════════
-- MIGRAÇÃO — de calendário de 2026 para jornada atemporal de 365 dias
-- Supabase: Dashboard → SQL Editor → New Query → Run
--
-- APLICADO EM PRODUÇÃO EM 04/08/2026. Seguro de rodar de novo (idempotente).
-- ═══════════════════════════════════════════════════════════════════════════
--
-- O QUE MUDA
--
-- Hoje o conteúdo é indexado por `momento_kairos.data` (uma data real de 2026).
-- Todo mundo lê o mesmo texto no mesmo dia, e quem assina em agosto entra no
-- dia 216 de uma jornada que nunca começou para ele.
--
-- Depois desta migração o conteúdo passa a ser indexado por `dia_jornada`
-- (1 a 365) e cada usuário tem seu próprio `jornada_inicio`. Todo mundo começa
-- em "Quem sou eu?", em qualquer data do ano.
--
-- O QUE NÃO MUDA
--
-- O diário (`diario_kairos`) continua ancorado na data real. Um diário é um
-- diário: 4 de agosto é 4 de agosto. Nenhum registro de usuário é tocado aqui.
--
-- SEGURANÇA DA MIGRAÇÃO
--
-- A coluna `data` NÃO é removida. Ela fica como está, e o código passa a ler
-- por `dia_jornada`. Isso permite reverter sem perda: se algo der errado, basta
-- voltar o deploy anterior, porque o banco continua servindo as duas formas.
-- A remoção de `data` fica para um segundo momento, depois de a jornada estar
-- rodando em produção com tranquilidade.
--
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ─── 1. dia_jornada em momento_kairos ──────────────────────────────────────

ALTER TABLE momento_kairos
  ADD COLUMN IF NOT EXISTS dia_jornada integer;

-- A ordem cronológica de 2026 vira a ordem da jornada: 01/01 = dia 1.
-- Isso preserva exatamente o arco temático que já estava escrito
-- (Quem sou eu? → ... → Gratidão e recomeço), sem reordenar nada.
WITH numerado AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY data) AS n
    FROM momento_kairos
)
UPDATE momento_kairos m
   SET dia_jornada = numerado.n
  FROM numerado
 WHERE m.id = numerado.id;

-- Se isto falhar, a tabela não tem exatamente 365 dias e a migração para aqui.
DO $$
DECLARE total integer;
BEGIN
  SELECT COUNT(*) INTO total FROM momento_kairos;
  IF total <> 365 THEN
    RAISE EXCEPTION 'momento_kairos tem % linhas; esperado 365. Migração abortada.', total;
  END IF;
END $$;

ALTER TABLE momento_kairos
  ALTER COLUMN dia_jornada SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS momento_kairos_dia_jornada_idx
  ON momento_kairos (dia_jornada);

-- DROP antes do ADD para o script ser seguro de rodar mais de uma vez.
-- ADD CONSTRAINT não aceita IF NOT EXISTS.
ALTER TABLE momento_kairos
  DROP CONSTRAINT IF EXISTS momento_kairos_dia_jornada_valido;

ALTER TABLE momento_kairos
  ADD CONSTRAINT momento_kairos_dia_jornada_valido
  CHECK (dia_jornada BETWEEN 1 AND 365);

-- ─── 2. jornada_inicio em subscriptions ────────────────────────────────────

ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS jornada_inicio date;

-- Usuários que já existem: por padrão começam a jornada hoje, do dia 1.
-- A decisão de deixá-los escolher "começar do início" ou "continuar de onde
-- parei" é da interface; aqui só definimos o padrão seguro.
UPDATE subscriptions
   SET jornada_inicio = CURRENT_DATE
 WHERE jornada_inicio IS NULL;

ALTER TABLE subscriptions
  ALTER COLUMN jornada_inicio SET DEFAULT CURRENT_DATE;

ALTER TABLE subscriptions
  ALTER COLUMN jornada_inicio SET NOT NULL;

-- ─── 3. RLS — liberar conteúdo pelo dia da jornada ─────────────────────────
--
-- A policy anterior usava `data <= current_date + 1`, que não faz mais sentido:
-- o conteúdo não tem mais dono no calendário. A nova regra é a mesma ideia
-- traduzida para a jornada — você vê até o seu dia de hoje, e nada além.
--
-- O `% 365` cuida da segunda volta: quem está no dia 400 (dia 35 da segunda
-- volta) enxerga do 1 ao 365, porque já percorreu o ciclo inteiro uma vez.

DROP POLICY IF EXISTS "Conteúdo liberado para assinantes" ON momento_kairos;

CREATE POLICY "Conteúdo liberado para assinantes"
  ON momento_kairos FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
        FROM subscriptions s
       WHERE s.user_id = auth.jwt() ->> 'sub'
         AND (s.status = 'active'
              OR (s.status = 'trial' AND s.trial_ends_at > now()))
         AND (
           -- já completou pelo menos um ciclo: vê tudo
           (CURRENT_DATE - s.jornada_inicio) + 1 > 365
           -- ou vê até o dia de hoje da jornada dele
           OR momento_kairos.dia_jornada <= (CURRENT_DATE - s.jornada_inicio) + 1
         )
    )
  );

COMMIT;

-- ═══════════════════════════════════════════════════════════════════════════
-- VERIFICAÇÃO — rode depois e confira
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Deve devolver 365 linhas, dia 1 = 2026-01-01 e dia 365 = 2026-12-31:
--
--   SELECT COUNT(*) AS total,
--          MIN(dia_jornada) AS primeiro,
--          MAX(dia_jornada) AS ultimo
--     FROM momento_kairos;
--
--   SELECT dia_jornada, data, tema_mensal
--     FROM momento_kairos
--    WHERE dia_jornada IN (1, 31, 32, 213, 335, 365)
--    ORDER BY dia_jornada;
--
-- Esperado:
--     1 | 2026-01-01 | Quem sou eu?
--    31 | 2026-01-31 | Quem sou eu?
--    32 | 2026-02-01 | O que me move?
--   213 | 2026-08-01 | Relacionamentos que constroem
--   335 | 2026-12-01 | Gratidão e recomeço
--   365 | 2026-12-31 | Gratidão e recomeço
--
-- Sua própria jornada:
--
--   SELECT user_id, status, jornada_inicio,
--          (CURRENT_DATE - jornada_inicio) + 1 AS dia_de_hoje
--     FROM subscriptions;
--
-- ═══════════════════════════════════════════════════════════════════════════
-- COMO REVERTER
-- ═══════════════════════════════════════════════════════════════════════════
--
-- A coluna `data` continua intacta, então reverter é voltar o deploy anterior
-- e restaurar a policy antiga:
--
--   DROP POLICY IF EXISTS "Conteúdo liberado para assinantes" ON momento_kairos;
--   CREATE POLICY "Conteúdo liberado para assinantes"
--     ON momento_kairos FOR SELECT TO authenticated
--     USING (
--       data <= (current_date + 1)
--       AND EXISTS (SELECT 1 FROM subscriptions s
--                    WHERE s.user_id = auth.jwt() ->> 'sub'
--                      AND (s.status = 'active'
--                           OR (s.status = 'trial' AND s.trial_ends_at > now())))
--     );
--
-- Nenhum dado de usuário é perdido em nenhum dos dois sentidos.
-- ═══════════════════════════════════════════════════════════════════════════
