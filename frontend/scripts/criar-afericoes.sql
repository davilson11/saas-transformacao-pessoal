-- ═══════════════════════════════════════════════════════════════════════════
-- AFERIÇÕES — a peça que fecha o sistema
-- Supabase: SQL Editor → Run. Idempotente.
-- ═══════════════════════════════════════════════════════════════════════════
--
-- POR QUE ESTA TABELA EXISTE
--
-- O produto tem cinco peças com papéis distintos: a Visão Âncora é o ponto
-- fixo, as ferramentas são a construção, o Momento é o combustível diário, o
-- diário é a memória, e o mapa deveria responder "estou no caminho certo?".
--
-- "Caminho certo" é uma frase relativa — só significa algo em relação à
-- âncora. Mas até aqui a âncora era exibida em quatro telas e nunca usada como
-- referência: o mapa mostrava a manchete num card e, ao lado, o progresso nas
-- ferramentas, sem jamais ligar uma coisa à outra.
--
-- Um mapa que mostra onde você está sem mostrar onde fica o norte é uma lista
-- de coordenadas.
--
-- A aferição é o norte. Ao fim de cada mês da jornada, o app devolve a
-- manchete e pergunta uma coisa só: mais perto ou mais longe? Doze respostas ao
-- longo do ano viram a única série temporal que importa — feita por quem está
-- andando no caminho, não por um algoritmo palpitando sobre ele.
--
-- Sem IA de propósito. A avaliação é da pessoa; o app só guarda e devolve.
--
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

CREATE TABLE IF NOT EXISTS afericoes (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       text        NOT NULL,          -- Clerk user id
  mes_jornada   integer     NOT NULL,          -- 1..12, o mês que se encerrou
  volta         integer     NOT NULL DEFAULT 1,-- 1ª, 2ª volta do ciclo
  dia_jornada   integer     NOT NULL,          -- dia absoluto em que respondeu
  resposta      text        NOT NULL,          -- mais_perto | igual | mais_longe
  porque        text,                          -- a frase; opcional de propósito
  -- Guarda a manchete vigente no momento da aferição. A pessoa pode reescrever
  -- a âncora depois, e sem isto o histórico perderia o sentido: a resposta
  -- passaria a se referir a uma manchete que não existia quando foi dada.
  manchete_no_momento text,
  created_at    timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT afericoes_resposta_valida
    CHECK (resposta IN ('mais_perto', 'igual', 'mais_longe')),
  CONSTRAINT afericoes_mes_valido
    CHECK (mes_jornada BETWEEN 1 AND 12),

  -- Uma aferição por mês por volta. A segunda volta pergunta de novo.
  UNIQUE (user_id, volta, mes_jornada)
);

CREATE INDEX IF NOT EXISTS afericoes_user_idx
  ON afericoes (user_id, volta, mes_jornada);

-- ─── RLS ───────────────────────────────────────────────────────────────────
--
-- Padrão Clerk do resto do schema: auth.jwt() ->> 'sub', nunca auth.uid(),
-- que faz cast para uuid e não casa com ids no formato user_2abc...

ALTER TABLE afericoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuário lê suas próprias aferições" ON afericoes;
CREATE POLICY "Usuário lê suas próprias aferições"
  ON afericoes FOR SELECT TO authenticated
  USING (user_id = auth.jwt() ->> 'sub');

DROP POLICY IF EXISTS "Usuário insere suas próprias aferições" ON afericoes;
CREATE POLICY "Usuário insere suas próprias aferições"
  ON afericoes FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.jwt() ->> 'sub');

-- Permite corrigir uma resposta dada com pressa, mas sem trocar de dono.
DROP POLICY IF EXISTS "Usuário atualiza suas próprias aferições" ON afericoes;
CREATE POLICY "Usuário atualiza suas próprias aferições"
  ON afericoes FOR UPDATE TO authenticated
  USING      (user_id = auth.jwt() ->> 'sub')
  WITH CHECK (user_id = auth.jwt() ->> 'sub');

COMMIT;

-- ═══════════════════════════════════════════════════════════════════════════
-- VERIFICAÇÃO
--
--   SELECT conname, pg_get_constraintdef(oid)
--     FROM pg_constraint WHERE conrelid = 'afericoes'::regclass;
--
--   SELECT policyname, cmd, roles FROM pg_policies WHERE tablename = 'afericoes';
--   -- esperado: 3 policies (SELECT, INSERT, UPDATE), todas em authenticated
--
--   SELECT relrowsecurity FROM pg_class WHERE relname = 'afericoes';
--   -- esperado: true
-- ═══════════════════════════════════════════════════════════════════════════
