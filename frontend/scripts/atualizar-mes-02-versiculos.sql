-- ═══════════════════════════════════════════════════════════════════════════
-- MÊS 2 — os dois versículos trocados (TPT, colados da fonte)
-- ═══════════════════════════════════════════════════════════════════════════
--  dia 43: Provérbios 4:23 → Lucas 24:32  (a frase dos discípulos de Emaús)
--  dia 50: Efésios 4:7     → Ester 4:14   ("para um momento como este")
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- Dia 43 · Lucas 24:32 — TPT
UPDATE momento_kairos SET
  versiculo_texto      = 'Atônitos, olharam uns para os outros e disseram: “Por que não o reconhecemos? Nossos corações não arderam com a chama de uma santa paixão enquanto caminhávamos ao seu lado? Ele nos revelou tamanha profundidade das Escrituras!”',
  versiculo_referencia = 'Lucas 24:32 — TPT'
WHERE dia_jornada = 43;

-- Dia 50 · Ester 4:14 — TPT
UPDATE momento_kairos SET
  versiculo_texto      = 'Pois, se você ficar calada nesta hora, socorro e livramento surgirão de outra parte para os judeus, mas você e a família do seu pai morrerão. Quem sabe se não foi para um momento como este que você chegou à posição de rainha?',
  versiculo_referencia = 'Ester 4:14 — TPT'
WHERE dia_jornada = 50;

COMMIT;

-- Verificação — 0 linhas esperadas:
--   SELECT dia_jornada FROM momento_kairos
--    WHERE dia_jornada BETWEEN 32 AND 59
--      AND (versiculo_texto IS NULL OR versiculo_texto = 'COLE_O_TEXTO_AQUI');
