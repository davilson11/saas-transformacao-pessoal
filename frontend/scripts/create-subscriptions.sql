-- ─── Tabela de assinaturas / trial ──────────────────────────────────────────
-- Executar no Supabase SQL Editor (Dashboard → SQL Editor → New Query)

CREATE TABLE IF NOT EXISTS subscriptions (
  id                     uuid         DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id                text         NOT NULL UNIQUE,
  status                 text         NOT NULL DEFAULT 'trial',   -- trial | active | canceled | past_due
  trial_ends_at          timestamptz  NOT NULL,
  plan                   text,                                     -- mensal | anual
  stripe_customer_id     text,
  stripe_subscription_id text,
  created_at             timestamptz  DEFAULT now(),
  updated_at             timestamptz  DEFAULT now()
);

-- Índice para lookup por user_id (já coberto pelo UNIQUE, mas explícito)
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions (user_id);

-- Trigger: atualiza updated_at automaticamente
CREATE OR REPLACE FUNCTION update_subscriptions_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER trg_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_subscriptions_updated_at();

-- RLS: usuário só lê/escreve o próprio registro
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Leitura própria" ON subscriptions;
CREATE POLICY "Leitura própria"
  ON subscriptions FOR SELECT
  USING (user_id = auth.jwt() ->> 'sub');

DROP POLICY IF EXISTS "Inserção própria" ON subscriptions;
CREATE POLICY "Inserção própria"
  ON subscriptions FOR INSERT
  WITH CHECK (user_id = auth.jwt() ->> 'sub');

DROP POLICY IF EXISTS "Atualização própria" ON subscriptions;
CREATE POLICY "Atualização própria"
  ON subscriptions FOR UPDATE
  USING (user_id = auth.jwt() ->> 'sub');
