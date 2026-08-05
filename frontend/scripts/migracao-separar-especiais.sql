-- ═══════════════════════════════════════════════════════════════════════════
-- SEPARAR CONTEÚDO DE JORNADA DE CONTEÚDO ESPECIAL
-- Supabase: SQL Editor → Run. Idempotente.
-- ═══════════════════════════════════════════════════════════════════════════
--
-- CORRIGE UM ERRO DE DESENHO MEU, JÁ EM PRODUÇÃO
--
-- A migração das datas fixas marcou os dias 358, 359 e 360 com `data_fixa`,
-- mas deixou o `dia_jornada` preenchido. As duas coisas na mesma linha: a linha
-- aparece no dia real (25 de dezembro) E no dia da jornada.
--
-- Resultado: quem chegasse ao dia 359 da jornada em março receberia o texto de
-- Natal — exatamente o problema que a migração dizia resolver.
--
-- O MODELO CORRETO
--
--   Linha de jornada   → dia_jornada 1..365, data_fixa NULL. São sempre 365.
--   Linha especial     → data_fixa preenchido, dia_jornada NULL. Fora da
--                        contagem, aparece só no dia real dela.
--
-- Sete textos saem da sequência e viram especiais de fim de ano — um bônus
-- sazonal que aparece para todo mundo em dezembro, esteja onde estiver na
-- jornada. Os sete slots vagos recebem texto novo, escrito para o lugar que
-- ocupam no arco (ver reescrita-mes-12-jornada.md).
--
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ─── 1. dia_jornada passa a aceitar NULL ───────────────────────────────────

ALTER TABLE momento_kairos
  ALTER COLUMN dia_jornada DROP NOT NULL;

-- A CHECK só pode entrar DEPOIS de os dados estarem limpos: as linhas 358-360
-- ainda têm dia_jornada e data_fixa preenchidos ao mesmo tempo, que é
-- exatamente o que ela proíbe. Adicionar aqui faz a migração inteira falhar.
ALTER TABLE momento_kairos
  DROP CONSTRAINT IF EXISTS momento_kairos_jornada_ou_especial;

-- ─── 2. Duplicar os sete textos sazonais como linhas especiais ─────────────
--
-- Copiar antes de desvincular: assim o texto original é preservado como
-- especial e o slot da jornada fica livre para o texto novo.

INSERT INTO momento_kairos (
  data, mes, dia_do_mes, tema_mensal, voz_do_dia, missao,
  versiculo_texto, versiculo_referencia, fase, data_fixa, dia_jornada
)
SELECT
  m.data, m.mes, m.dia_do_mes, m.tema_mensal, m.voz_do_dia, m.missao,
  m.versiculo_texto, m.versiculo_referencia, m.fase,
  CASE m.dia_jornada
    WHEN 351 THEN '12-17' WHEN 352 THEN '12-18' WHEN 353 THEN '12-19'
    WHEN 356 THEN '12-22' WHEN 358 THEN '12-24' WHEN 359 THEN '12-25'
    WHEN 360 THEN '12-26'
  END,
  NULL
FROM momento_kairos m
WHERE m.dia_jornada IN (351, 352, 353, 356, 358, 359, 360)
  AND NOT EXISTS (
    SELECT 1 FROM momento_kairos x
     WHERE x.data_fixa = CASE m.dia_jornada
       WHEN 351 THEN '12-17' WHEN 352 THEN '12-18' WHEN 353 THEN '12-19'
       WHEN 356 THEN '12-22' WHEN 358 THEN '12-24' WHEN 359 THEN '12-25'
       WHEN 360 THEN '12-26' END
  );

-- ─── 3. Limpar a marcação antiga das linhas de jornada ─────────────────────
--
-- Elas voltam a ser puramente de jornada. O texto continua ali até você rodar
-- o seed com os novos — assim nada fica em branco no meio do caminho.

UPDATE momento_kairos
   SET data_fixa = NULL
 WHERE dia_jornada IS NOT NULL
   AND data_fixa IS NOT NULL;

-- Agora sim: os dados estão consistentes e a regra pode ser gravada.
ALTER TABLE momento_kairos
  ADD CONSTRAINT momento_kairos_jornada_ou_especial
  CHECK (
    (dia_jornada IS NOT NULL AND data_fixa IS NULL)
    OR
    (dia_jornada IS NULL AND data_fixa IS NOT NULL)
  );

COMMIT;

-- ═══════════════════════════════════════════════════════════════════════════
-- VERIFICAÇÃO
--
-- Devem ser 365 linhas de jornada e 7 especiais:
--
--   SELECT
--     COUNT(*) FILTER (WHERE dia_jornada IS NOT NULL) AS jornada,
--     COUNT(*) FILTER (WHERE data_fixa   IS NOT NULL) AS especiais
--   FROM momento_kairos;
--
-- As sete especiais, em ordem:
--
--   SELECT data_fixa, LEFT(voz_do_dia, 60) AS inicio
--     FROM momento_kairos WHERE data_fixa IS NOT NULL ORDER BY data_fixa;
--
-- Nenhuma linha pode ser as duas coisas (a CHECK garante, mas confira):
--
--   SELECT COUNT(*) FROM momento_kairos
--    WHERE dia_jornada IS NOT NULL AND data_fixa IS NOT NULL;
--   -- esperado: 0
--
-- ═══════════════════════════════════════════════════════════════════════════
-- DEPOIS DESTA MIGRAÇÃO
--
-- Os slots 349, 354, 355, 358, 359, 360 e 363 ainda estão com o texto antigo,
-- preso ao calendário. Os textos novos estão em reescrita-mes-12-jornada.md e
-- entram atualizando dezembro-2026.json e rodando:
--
--   npx ts-node scripts/seed-momento.ts scripts/dezembro-2026.json
--
-- O seed já foi ajustado para conflitar por `dia_jornada` em vez de `data`:
-- com as linhas especiais duplicando valores de `data`, ele sobrescreveria a
-- linha errada e apagaria o conteúdo de Natal.
-- ═══════════════════════════════════════════════════════════════════════════
