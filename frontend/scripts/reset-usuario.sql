-- ─────────────────────────────────────────────────────────────────────────────
-- RESET DE UM USUÁRIO — voltar a jornada para o dia 1
--
-- Apaga tudo o que ESTE usuário produziu e recoloca a jornada no dia de hoje.
-- Não toca em `momento_kairos` (o conteúdo dos 365 dias é compartilhado por
-- todos; apagar ali esvaziaria o app para qualquer pessoa).
--
-- COMO USAR
--   1. Pegue seu user_id do Clerk (começa com `user_`). Ele aparece no painel
--      do Clerk, ou rode o SELECT do passo 0 abaixo.
--   2. Troque o valor de :meu_id nas duas ocorrências do bloco.
--   3. Rode no SQL Editor do Supabase.
--   4. No navegador, abra o DevTools (F12) → Console e rode:
--        localStorage.removeItem('kairos_boas_vindas_jornada_v1')
--      Sem isso, o ritual de boas-vindas do dia 1 não reaparece — ele é marcado
--      como visto no navegador, não no banco.
--
-- ⚠️  Isto é irreversível. Rode o passo 0 primeiro para conferir o que vai sair.
-- ─────────────────────────────────────────────────────────────────────────────


-- ── Passo 0 — conferir antes de apagar ──────────────────────────────────────
-- Descomente e rode sozinho. Mostra quem existe e quanto cada um tem.

-- SELECT s.user_id, s.jornada_inicio, s.status,
--        (SELECT count(*) FROM diario_kairos        d WHERE d.user_id = s.user_id) AS dias_diario,
--        (SELECT count(*) FROM ferramentas_respostas f WHERE f.user_id = s.user_id) AS ferramentas,
--        (SELECT count(*) FROM afericoes            a WHERE a.user_id = s.user_id) AS afericoes
--   FROM subscriptions s;


-- ── Passo 1 — o reset ───────────────────────────────────────────────────────

BEGIN;

DELETE FROM diario_kairos         WHERE user_id = 'COLE_SEU_USER_ID_AQUI';
DELETE FROM ferramentas_respostas WHERE user_id = 'COLE_SEU_USER_ID_AQUI';
DELETE FROM visao_ancora          WHERE user_id = 'COLE_SEU_USER_ID_AQUI';
DELETE FROM afericoes             WHERE user_id = 'COLE_SEU_USER_ID_AQUI';
DELETE FROM roda_vida             WHERE user_id = 'COLE_SEU_USER_ID_AQUI';

-- A assinatura NÃO é apagada: ela guarda o trial e o vínculo com o Stripe.
-- Só a data de início da jornada volta para hoje.
UPDATE subscriptions
   SET jornada_inicio = CURRENT_DATE
 WHERE user_id = 'COLE_SEU_USER_ID_AQUI';

COMMIT;


-- ── Passo 2 — conferir que ficou zerado ─────────────────────────────────────
-- Deve voltar 0, 0, 0 e a data de hoje.

-- SELECT (SELECT count(*) FROM diario_kairos        WHERE user_id = 'COLE_SEU_USER_ID_AQUI') AS diario,
--        (SELECT count(*) FROM ferramentas_respostas WHERE user_id = 'COLE_SEU_USER_ID_AQUI') AS ferramentas,
--        (SELECT count(*) FROM afericoes            WHERE user_id = 'COLE_SEU_USER_ID_AQUI') AS afericoes,
--        (SELECT jornada_inicio FROM subscriptions   WHERE user_id = 'COLE_SEU_USER_ID_AQUI') AS inicio;


-- ── Checagem de sanidade do conteúdo ────────────────────────────────────────
-- Nada aqui deveria ter mudado. Se mudou, algo saiu errado.
-- Esperado: 365 dias de jornada e 7 datas fixas.

-- SELECT count(*) FILTER (WHERE dia_jornada IS NOT NULL) AS dias_jornada,
--        count(*) FILTER (WHERE data_fixa   IS NOT NULL) AS especiais
--   FROM momento_kairos;
