-- ═══════════════════════════════════════════════════════════════════════════
-- MÊS 3 — os cinco versículos trocados (TPT, colados da fonte)
-- ═══════════════════════════════════════════════════════════════════════════
-- Números dos versículos e a nota de rodapé do Zacarias foram removidos:
-- a caixa do app mostra só o texto.
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- Dia 61 · Números 13:33 — TPT
UPDATE momento_kairos SET
  versiculo_texto      = 'Até vimos ali os nefilins [gigantes], os descendentes de Anaque. Próximo a eles, nos sentíamos como gafanhotos, e era assim que eles também nos viam!',
  versiculo_referencia = 'Números 13:33 — TPT'
WHERE dia_jornada = 61;

-- Dia 69 · Marcos 10:21-22 — TPT
UPDATE momento_kairos SET
  versiculo_texto      = 'Jesus fixou os olhos no homem com muita compaixão e lhe disse: “Ainda te falta uma coisa. Vai, vende tudo o que tens e dá o dinheiro aos pobres. Então todo o teu tesouro estará no céu. Depois de fazer isso, volta e anda comigo.” Completamente chocado com a resposta de Jesus, ele se virou e foi embora muito triste, pois era extremamente rico.',
  versiculo_referencia = 'Marcos 10:21-22 — TPT'
WHERE dia_jornada = 69;

-- Dia 73 · Êxodo 18:17-18 — TPT
UPDATE momento_kairos SET
  versiculo_texto      = '— O que você está fazendo não é bom — respondeu o sogro de Moisés. — Você e este povo que vem a você apenas se esgotarão. O trabalho é pesado demais para você; você não consegue fazê-lo sozinho.',
  versiculo_referencia = 'Êxodo 18:17-18 — TPT'
WHERE dia_jornada = 73;

-- Dia 79 · Zacarias 3:4 — TPT
UPDATE momento_kairos SET
  versiculo_texto      = 'Então o anjo disse aos membros do conselho celestial que estavam diante dele: “Tirem as roupas sujas de Josué”. E disse a Josué: “Eis que tirei a tua culpa e te vestirei com vestes esplêndidas”.',
  versiculo_referencia = 'Zacarias 3:4 — TPT'
WHERE dia_jornada = 79;

-- Dia 90 · João 11:44 — TPT
UPDATE momento_kairos SET
  versiculo_texto      = 'Então, diante de todos, Lázaro, que havia morrido quatro dias antes, saiu mancando lentamente — ele ainda tinha as faixas funerárias apertadas em volta das mãos e dos pés e cobrindo o rosto! Jesus disse a eles: “Desembrulhem-no e soltem-no”.',
  versiculo_referencia = 'João 11:44 — TPT'
WHERE dia_jornada = 90;

COMMIT;

-- Verificação — 0 linhas:
--   SELECT dia_jornada FROM momento_kairos
--    WHERE dia_jornada BETWEEN 60 AND 90 AND versiculo_texto = 'COLE_O_TEXTO_AQUI';
