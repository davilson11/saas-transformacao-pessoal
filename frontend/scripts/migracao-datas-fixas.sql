-- ═══════════════════════════════════════════════════════════════════════════
-- DATAS FIXAS — quando o calendário real tem precedência sobre a jornada
-- Supabase: SQL Editor → New Query → Run. Seguro de rodar mais de uma vez.
-- ═══════════════════════════════════════════════════════════════════════════
--
-- O PROBLEMA
--
-- A jornada é atemporal, mas alguns conteúdos são sobre datas reais e centrais
-- da fé. Os dias 358, 359 e 360 falam de Natal — encarnação, Lucas 2, presença
-- à mesa. Não é linguagem de calendário que dá para reescrever; é conteúdo
-- sobre uma data que existe no mundo.
--
-- Tirar o Natal empobreceria o produto e soaria estranho num app de fé.
-- Deixar como está entregaria "leia Lucas 2" num dia qualquer de fevereiro
-- para quem começou em março.
--
-- A SOLUÇÃO
--
-- A jornada continua atemporal, mas um punhado de datas reais tem precedência.
-- Em 25 de dezembro todo mundo recebe o conteúdo de Natal, esteja no dia 12 ou
-- no 300 da jornada. No dia seguinte, cada um retoma de onde estava — o dia da
-- jornada não é consumido, porque ele é contado a partir de jornada_inicio e
-- não de quantos textos a pessoa leu.
--
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- Formato MM-DD: repete todo ano, independente do ano em que a pessoa esteja.
ALTER TABLE momento_kairos
  ADD COLUMN IF NOT EXISTS data_fixa text;

ALTER TABLE momento_kairos
  DROP CONSTRAINT IF EXISTS momento_kairos_data_fixa_formato;

ALTER TABLE momento_kairos
  ADD CONSTRAINT momento_kairos_data_fixa_formato
  CHECK (data_fixa IS NULL OR data_fixa ~ '^\d{2}-\d{2}$');

-- Só um conteúdo por data fixa.
CREATE UNIQUE INDEX IF NOT EXISTS momento_kairos_data_fixa_idx
  ON momento_kairos (data_fixa)
  WHERE data_fixa IS NOT NULL;

-- ─── Marcação inicial: os três dias de Natal ───────────────────────────────
--
-- Conservador de propósito. Começa só pelo núcleo do Natal; se depois fizer
-- sentido fixar Páscoa ou a virada de ano, é um UPDATE a mais.

UPDATE momento_kairos SET data_fixa = '12-24' WHERE dia_jornada = 358;
UPDATE momento_kairos SET data_fixa = '12-25' WHERE dia_jornada = 359;
UPDATE momento_kairos SET data_fixa = '12-26' WHERE dia_jornada = 360;

-- ─── RLS: liberar o conteúdo fixo no dia dele ──────────────────────────────
--
-- Sem isto, a policy bloquearia o texto de Natal para quem ainda não chegou ao
-- dia 359 da jornada — que é justamente todo mundo, no primeiro ano.

DROP POLICY IF EXISTS "Conteúdo liberado para assinantes" ON momento_kairos;

CREATE POLICY "Conteúdo liberado para assinantes"
  ON momento_kairos FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM subscriptions s
       WHERE s.user_id = auth.jwt() ->> 'sub'
         AND (s.status = 'active'
              OR (s.status = 'trial' AND s.trial_ends_at > now()))
         AND (
           -- conteúdo de data fixa, no dia real dele
           (momento_kairos.data_fixa IS NOT NULL
            AND momento_kairos.data_fixa = to_char(CURRENT_DATE, 'MM-DD'))
           -- ou já completou um ciclo inteiro: vê tudo
           OR (CURRENT_DATE - s.jornada_inicio) + 1 > 365
           -- ou até o dia de hoje da jornada dele
           OR momento_kairos.dia_jornada <= (CURRENT_DATE - s.jornada_inicio) + 1
         )
    )
  );

COMMIT;

-- ═══════════════════════════════════════════════════════════════════════════
-- VERIFICAÇÃO
--
--   SELECT dia_jornada, data_fixa, data, LEFT(voz_do_dia, 60) AS inicio
--     FROM momento_kairos WHERE data_fixa IS NOT NULL ORDER BY data_fixa;
--
-- Esperado: três linhas, dias 358/359/360 com 12-24, 12-25 e 12-26.
--
-- Para desfazer a fixação sem remover a coluna:
--   UPDATE momento_kairos SET data_fixa = NULL;
-- ═══════════════════════════════════════════════════════════════════════════
