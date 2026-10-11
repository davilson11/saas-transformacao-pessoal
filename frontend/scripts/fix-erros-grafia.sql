-- ═══════════════════════════════════════════════════════════════════════════
-- Os 13 erros de grafia (fora do mês 1)
-- ═══════════════════════════════════════════════════════════════════════════
--
-- `perdonado`, `perdonador` e `vanidade` são espanhol — assinatura de geração
-- automática que escorregou de idioma. Os outros são digitação.
--
-- Usa replace() em vez de reescrever o texto inteiro: altera só a palavra, sem
-- risco de sobrescrever alguma edição sua.
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- desillusão → desilusão   (dia 26)
UPDATE momento_kairos SET
  voz_do_dia = replace(voz_do_dia, 'desillusão', 'desilusão'),
  missao     = replace(missao,     'desillusão', 'desilusão')
WHERE dia_jornada IN (26);

-- propureza → pureza   (dia 38)
UPDATE momento_kairos SET
  voz_do_dia = replace(voz_do_dia, 'propureza', 'pureza'),
  missao     = replace(missao,     'propureza', 'pureza')
WHERE dia_jornada IN (38);

-- mentorear → mentorar   (dia 77)
UPDATE momento_kairos SET
  voz_do_dia = replace(voz_do_dia, 'mentorear', 'mentorar'),
  missao     = replace(missao,     'mentorear', 'mentorar')
WHERE dia_jornada IN (77);

-- naturalsobre natural → natural sobre natural   (dia 122)
UPDATE momento_kairos SET
  voz_do_dia = replace(voz_do_dia, 'naturalsobre natural', 'natural sobre natural'),
  missao     = replace(missao,     'naturalsobre natural', 'natural sobre natural')
WHERE dia_jornada IN (122);

-- reprovisionada → reabastecida   (dia 129)
UPDATE momento_kairos SET
  voz_do_dia = replace(voz_do_dia, 'reprovisionada', 'reabastecida'),
  missao     = replace(missao,     'reprovisionada', 'reabastecida')
WHERE dia_jornada IN (129);

-- Nehemias → Neemias   (dia 158)
UPDATE momento_kairos SET
  voz_do_dia = replace(voz_do_dia, 'Nehemias', 'Neemias'),
  missao     = replace(missao,     'Nehemias', 'Neemias')
WHERE dia_jornada IN (158);

-- aterrisou → aterrissou   (dia 176)
UPDATE momento_kairos SET
  voz_do_dia = replace(voz_do_dia, 'aterrisou', 'aterrissou'),
  missao     = replace(missao,     'aterrisou', 'aterrissou')
WHERE dia_jornada IN (176);

-- reenmoldura → ressignifica   (dia 210)
UPDATE momento_kairos SET
  voz_do_dia = replace(voz_do_dia, 'reenmoldura', 'ressignifica'),
  missao     = replace(missao,     'reenmoldura', 'ressignifica')
WHERE dia_jornada IN (210);

-- alcender → acender   (dia 220)
UPDATE momento_kairos SET
  voz_do_dia = replace(voz_do_dia, 'alcender', 'acender'),
  missao     = replace(missao,     'alcender', 'acender')
WHERE dia_jornada IN (220);

-- perdonador → perdoador   (dia 223)
UPDATE momento_kairos SET
  voz_do_dia = replace(voz_do_dia, 'perdonador', 'perdoador'),
  missao     = replace(missao,     'perdonador', 'perdoador')
WHERE dia_jornada IN (223);

-- perdonado → perdoado   (dia 223)
UPDATE momento_kairos SET
  voz_do_dia = replace(voz_do_dia, 'perdonado', 'perdoado'),
  missao     = replace(missao,     'perdonado', 'perdoado')
WHERE dia_jornada IN (223);

-- vanidade → vaidade   (dias 274, 345)
UPDATE momento_kairos SET
  voz_do_dia = replace(voz_do_dia, 'vanidade', 'vaidade'),
  missao     = replace(missao,     'vanidade', 'vaidade')
WHERE dia_jornada IN (274, 345);

-- ânjos → anjos   (dia 340)
UPDATE momento_kairos SET
  voz_do_dia = replace(voz_do_dia, 'ânjos', 'anjos'),
  missao     = replace(missao,     'ânjos', 'anjos')
WHERE dia_jornada IN (340);

COMMIT;

-- Verificação — deve devolver 0 linhas:
--
--   SELECT dia_jornada FROM momento_kairos
--    WHERE voz_do_dia ~* '(desillus|propureza|mentorear|naturalsobre|reprovisionada|Nehemias|aterrisou|reenmoldura|alcender|perdonad|perdonador|vanidade|ânjos)';
