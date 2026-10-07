-- ═══════════════════════════════════════════════════════════════════════════
-- push_subscriptions — a constraint que nunca existiu
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Erro que apareceu na tela do iPhone:
--
--   there is no unique or exclusion constraint matching the ON CONFLICT
--   specification
--
-- As duas rotas que salvam a inscrição de notificação fazem:
--
--   .upsert({ user_id, subscription }, { onConflict: 'user_id' })
--
-- `ON CONFLICT (user_id)` exige um índice UNIQUE em `user_id`. A tabela foi
-- criada sem ele. Então toda tentativa de ativar o lembrete, desde sempre,
-- morria aqui — e o código do cliente não olhava a resposta, então o botão
-- ficava verde e ninguém ficava sabendo.
--
-- Esta é a causa raiz da notificação que nunca chegou. Os outros três bugs
-- (método GET, proxy do Clerk, botão sem tratamento de erro) estavam no
-- caminho, mas este é o fundo do poço.
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- Se houver duplicatas de um mesmo usuário, o índice não é criado. Fica só a
-- inscrição mais recente — é a única que o navegador ainda reconhece.
DELETE FROM push_subscriptions a
 USING push_subscriptions b
 WHERE a.user_id = b.user_id
   AND a.created_at < b.created_at;

ALTER TABLE push_subscriptions
  DROP CONSTRAINT IF EXISTS push_subscriptions_user_id_key;

ALTER TABLE push_subscriptions
  ADD CONSTRAINT push_subscriptions_user_id_key UNIQUE (user_id);

COMMIT;


-- ═══════════════════════════════════════════════════════════════════════════
-- VERIFICAÇÃO — rode depois
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Deve aparecer `push_subscriptions_user_id_key | UNIQUE (user_id)`:
--
--   SELECT conname, pg_get_constraintdef(oid)
--     FROM pg_constraint
--    WHERE conrelid = 'push_subscriptions'::regclass;
--
-- E depois de ativar no celular, deve haver uma linha:
--
--   SELECT user_id, created_at FROM push_subscriptions;
-- ═══════════════════════════════════════════════════════════════════════════
