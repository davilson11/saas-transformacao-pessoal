-- ═══════════════════════════════════════════════════════════════════════════
-- RLS — momento_kairos e push_subscriptions
-- APLICADO EM PRODUÇÃO EM 03/08/2026
-- ═══════════════════════════════════════════════════════════════════════════
--
-- CONTEXTO DA AUDITORIA
--
-- momento_kairos
--   Tinha a policy `leitura_publica_momento_kairos` com USING (true), aberta
--   ao role `public` — ou seja, também ao `anon`.
--   A tabela não guarda dado pessoal (não tem user_id): é o conteúdo editorial
--   do produto, populado pelos scripts de seed. Então não havia vazamento de
--   dado de usuário.
--   O problema era comercial: o conteúdo É o produto, e qualquer um com a
--   anon key (que vai no bundle do site) baixava os 12 meses de "voz do dia"
--   e missões — inclusive o conteúdo futuro — sem login e sem pagar.
--
-- push_subscriptions
--   A policy usava `auth.uid()`, que converte o claim `sub` do JWT para uuid.
--   O projeto autentica com Clerk, cujos IDs têm formato `user_2abc...` e não
--   são uuid — a policy nunca casava. Falha fechada (nega), não era brecha,
--   mas quebraria qualquer leitura client-side dessa tabela.
--   O resto do schema usa `auth.jwt() ->> 'sub'`; aqui ficou inconsistente.
--
-- diario_kairos
--   Auditada e correta: ALL com USING (user_id = auth.jwt() ->> 'sub').
--   Nenhuma alteração necessária.
--
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ─── momento_kairos: conteúdo do produto, só para quem tem acesso ativo ────
--
-- Efeito colateral desejado: isto vira um paywall no próprio banco. Mesmo que
-- alguém contorne a tela de paywall no cliente, o conteúdo não sai do Postgres
-- sem trial válido ou assinatura ativa.
-- `data <= current_date + 1` evita raspagem do conteúdo futuro (o +1 cobre a
-- diferença de fuso entre UTC e São Paulo na virada do dia).

DROP POLICY IF EXISTS leitura_publica_momento_kairos ON momento_kairos;

CREATE POLICY "Conteúdo liberado para assinantes"
  ON momento_kairos FOR SELECT
  TO authenticated
  USING (
    data <= (current_date + 1)
    AND EXISTS (
      SELECT 1 FROM subscriptions s
       WHERE s.user_id = auth.jwt() ->> 'sub'
         AND (s.status = 'active'
              OR (s.status = 'trial' AND s.trial_ends_at > now()))
    )
  );

-- ─── push_subscriptions: alinhar com o padrão Clerk do resto do schema ─────

DROP POLICY IF EXISTS usuario_ve_proprio_push ON push_subscriptions;

CREATE POLICY "Usuário vê seu próprio push"
  ON push_subscriptions FOR ALL
  TO authenticated
  USING      (user_id = auth.jwt() ->> 'sub')
  WITH CHECK (user_id = auth.jwt() ->> 'sub');

COMMIT;

-- ═══════════════════════════════════════════════════════════════════════════
-- Os scripts de seed (scripts/seed-*.ts) continuam funcionando: usam a
-- service-role key, que ignora RLS.
--
-- PENDENTE: `roda_vida` tem policies de SELECT, INSERT e DELETE, mas não de
-- UPDATE. Qualquer update naquela tabela falha em silêncio.
-- ═══════════════════════════════════════════════════════════════════════════
