-- ─────────────────────────────────────────────────────────────────────────────
-- RECOMEÇAR A JORNADA — sem apagar nada
--
-- Diferente de `reset-usuario.sql`, que zera tudo. Aqui só o contador volta
-- para o dia 1. Diário, ferramentas, Visão Âncora e roda da vida continuam
-- exatamente como estão.
--
-- É o caminho certo para quem começou, se dispersou, e quer refazer os dias
-- com atenção — sem perder o que já escreveu.
--
-- Troque `COLE_SEU_USER_ID_AQUI` pelo seu id do Clerk (começa com `user_`).
-- ─────────────────────────────────────────────────────────────────────────────

-- Antes: ver onde você está hoje.
SELECT user_id, jornada_inicio, status,
       CURRENT_DATE - jornada_inicio + 1 AS dia_atual
  FROM subscriptions;

-- O recomeço.
UPDATE subscriptions
   SET jornada_inicio = CURRENT_DATE
 WHERE user_id = 'COLE_SEU_USER_ID_AQUI';

-- Depois: deve mostrar a data de hoje e dia_atual = 1.
SELECT user_id, jornada_inicio, CURRENT_DATE - jornada_inicio + 1 AS dia_atual
  FROM subscriptions
 WHERE user_id = 'COLE_SEU_USER_ID_AQUI';


-- ── Opcional ────────────────────────────────────────────────────────────────
-- Se você já tiver respondido alguma aferição de fim de mês, ela continua
-- registrada e o app não vai perguntar de novo quando o mês 1 fechar. Para
-- fazer as aferições do zero junto com a jornada nova:
--
--   DELETE FROM afericoes WHERE user_id = 'COLE_SEU_USER_ID_AQUI';
--
-- Confira antes se há alguma:
--   SELECT count(*) FROM afericoes WHERE user_id = 'COLE_SEU_USER_ID_AQUI';
