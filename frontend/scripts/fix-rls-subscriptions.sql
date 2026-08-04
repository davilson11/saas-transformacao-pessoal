-- ═══════════════════════════════════════════════════════════════════════════
-- CORREÇÃO DE SEGURANÇA — subscriptions e stripe_events
-- Executar no Supabase: Dashboard → SQL Editor → New Query → Run
-- ═══════════════════════════════════════════════════════════════════════════
--
-- PROBLEMA
-- As policies antigas deixavam o próprio usuário escrever na tabela
-- `subscriptions`. Com a anon key (que é pública, vai no bundle do navegador)
-- e o JWT legítimo do Clerk, qualquer usuário conseguia rodar no console:
--
--   supabase.from('subscriptions')
--           .update({ status: 'active' })
--           .eq('user_id', <o próprio id>)
--
-- …e liberar o produto pago para sempre. Pelo INSERT dava para o mesmo efeito
-- escolhendo um `trial_ends_at` no ano 2099.
--
-- SOLUÇÃO
-- O cliente passa a ter apenas SELECT. Toda escrita acontece no servidor,
-- via service-role key (que ignora RLS):
--   • criação do trial  → POST /api/subscription
--   • status / plano    → webhook do Stripe em /api/webhook
--
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ─── 1. Remover as policies de escrita do cliente ──────────────────────────

DROP POLICY IF EXISTS "Inserção própria"   ON subscriptions;
DROP POLICY IF EXISTS "Atualização própria" ON subscriptions;

-- Garantia extra: mesmo que alguma policy volte por engano, o role
-- `authenticated` não tem privilégio de escrita nesta tabela.
REVOKE INSERT, UPDATE, DELETE ON subscriptions FROM authenticated, anon;

-- ─── 2. Manter só a leitura da própria linha ───────────────────────────────

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Leitura própria" ON subscriptions;
CREATE POLICY "Leitura própria"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (user_id = auth.jwt() ->> 'sub');

-- ─── 3. Idempotência do webhook do Stripe ──────────────────────────────────
--
-- O Stripe reenvia eventos e não garante ordem. Sem isso, um
-- `subscription.updated` antigo pode chegar depois de um cancelamento e
-- reativar o acesso de quem já cancelou.

CREATE TABLE IF NOT EXISTS stripe_events (
  id           text        PRIMARY KEY,   -- event.id do Stripe (evt_...)
  type         text        NOT NULL,
  processed_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE stripe_events ENABLE ROW LEVEL SECURITY;
-- Sem nenhuma policy: só a service-role (que ignora RLS) enxerga a tabela.
REVOKE ALL ON stripe_events FROM authenticated, anon;

COMMIT;

-- ═══════════════════════════════════════════════════════════════════════════
-- VERIFICAÇÃO — rode depois e confira o resultado
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Deve listar exatamente uma linha: "Leitura própria" / SELECT
--
--   SELECT policyname, cmd FROM pg_policies
--    WHERE tablename = 'subscriptions';
--
-- Deve retornar rowsecurity = true para as duas tabelas:
--
--   SELECT relname, relrowsecurity FROM pg_class
--    WHERE relname IN ('subscriptions', 'stripe_events');
--
-- ═══════════════════════════════════════════════════════════════════════════
-- AUDITORIA PENDENTE — verifique também as tabelas que não estão versionadas
-- ═══════════════════════════════════════════════════════════════════════════
--
-- `diario_kairos` e `momento_kairos` guardam os dados mais sensíveis do app e
-- não têm definição em nenhum arquivo SQL deste repositório. Rode:
--
--   SELECT relname, relrowsecurity FROM pg_class
--    WHERE relname IN ('diario_kairos', 'momento_kairos', 'push_subscriptions');
--
--   SELECT tablename, policyname, cmd, qual FROM pg_policies
--    WHERE tablename IN ('diario_kairos', 'momento_kairos', 'push_subscriptions');
--
-- Se `relrowsecurity` vier false em qualquer uma delas, qualquer usuário
-- autenticado consegue ler o diário de todos os outros. O padrão esperado é:
--
--   ALTER TABLE diario_kairos ENABLE ROW LEVEL SECURITY;
--   CREATE POLICY "Usuário lê seu próprio diário" ON diario_kairos
--     FOR SELECT TO authenticated USING (user_id = auth.jwt() ->> 'sub');
--   CREATE POLICY "Usuário insere seu próprio diário" ON diario_kairos
--     FOR INSERT TO authenticated WITH CHECK (user_id = auth.jwt() ->> 'sub');
--   CREATE POLICY "Usuário atualiza seu próprio diário" ON diario_kairos
--     FOR UPDATE TO authenticated USING (user_id = auth.jwt() ->> 'sub')
--                                 WITH CHECK (user_id = auth.jwt() ->> 'sub');
--   CREATE POLICY "Usuário deleta seu próprio diário" ON diario_kairos
--     FOR DELETE TO authenticated USING (user_id = auth.jwt() ->> 'sub');
--
-- (idem para momento_kairos)
--
-- Falta também a policy de UPDATE em `roda_vida` — ela só tem SELECT, INSERT
-- e DELETE, então qualquer update naquela tabela falha silenciosamente.
