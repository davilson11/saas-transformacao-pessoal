-- ═══════════════════════════════════════════════════════════════════════════
-- PLANO SE-ENTÃO NA MISSÃO DIÁRIA
-- Supabase: SQL Editor → Run. Idempotente.
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Implementation intentions são a intervenção com melhor evidência de toda a
-- psicologia da mudança: efeito médio-grande (d = 0,65) sobre atingimento de
-- objetivos em 94 testes independentes (Gollwitzer & Sheeran), agregados em
-- 642 testes na revisão de 2024.
--
-- O app já tinha a técnica — escondida no Plano de Continuidade, ferramenta 16,
-- fase 4. A intervenção mais forte da ciência comportamental estava no fim da
-- fila, onde a maioria das pessoas nunca chega.
--
-- Esta coluna a traz para a missão diária: 365 vezes por ano em vez de uma.
--
-- Guardamos só o gatilho ("quando/onde"). A ação é a missão do dia, que já está
-- ligada ao registro pelo par user_id + data — duplicar o texto da missão aqui
-- criaria duas fontes de verdade para a mesma coisa.
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

ALTER TABLE diario_kairos
  ADD COLUMN IF NOT EXISTS plano_gatilho text;

COMMENT ON COLUMN diario_kairos.plano_gatilho IS
  'Gatilho do plano se-então da missão do dia: quando/onde a ação vai acontecer.';

COMMIT;

-- ═══════════════════════════════════════════════════════════════════════════
-- VERIFICAÇÃO
--
--   SELECT column_name, data_type
--     FROM information_schema.columns
--    WHERE table_name = 'diario_kairos' AND column_name = 'plano_gatilho';
--
-- A RLS de diario_kairos já cobre a coluna nova: as policies são por linha
-- (user_id = auth.jwt() ->> 'sub'), não por coluna. Nada a fazer.
-- ═══════════════════════════════════════════════════════════════════════════
