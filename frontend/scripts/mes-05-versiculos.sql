-- ═══════════════════════════════════════════════════════════════════════════
-- MÊS 5 — os seis versículos trocados
-- ═══════════════════════════════════════════════════════════════════════════
-- Limpezas: tirados os números de versículo, o parêntese solto do 1 Samuel
-- 15:22, o colchete "[ou atentar]" e a nota de rodapé do João 13:5.
--
-- ATRIBUIÇÃO — dois não são TPT:
--   dia 123 · 1 Samuel 3:10  → rotulado "Almeida". A redação ("Fala, porque o
--             teu servo ouve") é da Almeida, não da TPT. É domínio público.
--   dia 124 · 1 Samuel 15:22 → SEM rótulo de tradução. Não é Almeida nem
--             parece TPT; provavelmente NVI ou NAA. Confira e me diga qual,
--             que eu corrijo o rótulo.
--
-- A nota de rodapé do João 13:5 dizia que Jesus sabia da traição de Judas e
-- ainda assim lhe lavou os pés — que é exatamente o ponto do texto do dia.
-- Ficou fora da caixa, mas confirma a leitura.
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- Dia 123 · 1 Samuel 3:10 — Almeida
UPDATE momento_kairos SET
  versiculo_texto      = 'Então veio o Senhor, e pôs-se ali, e chamou como das outras vezes: Samuel, Samuel. E disse Samuel: Fala, porque o teu servo ouve.',
  versiculo_referencia = '1 Samuel 3:10 — Almeida'
WHERE dia_jornada = 123;

-- Dia 124 · 1 Samuel 15:22
UPDATE momento_kairos SET
  versiculo_texto      = 'O Senhor tem tanto prazer em holocaustos e sacrifícios quanto em obedecer ao Senhor? Obedecer é melhor do que o sacrifício, e dar ouvidos é melhor do que a gordura de carneiros.',
  versiculo_referencia = '1 Samuel 15:22'
WHERE dia_jornada = 124;

-- Dia 133 · Josué 6:20 — TPT
UPDATE momento_kairos SET
  versiculo_texto      = 'Quando ouviram o som dos shofares, o povo estava pronto para gritar com grande júbilo. Assim que ouviram o toque dos shofares, soltaram um grito de júbilo estrondoso, como um trovão, e de repente as grossas muralhas de Jericó ruíram! Todos avançaram e conquistaram a cidade.',
  versiculo_referencia = 'Josué 6:20 — TPT'
WHERE dia_jornada = 133;

-- Dia 138 · Ezequiel 37:4 — TPT
UPDATE momento_kairos SET
  versiculo_texto      = 'Então ele me disse: “Profetize sobre estes ossos secos estas palavras: ‘Ossos secos, ouçam o que o Senhor diz’”.',
  versiculo_referencia = 'Ezequiel 37:4 — TPT'
WHERE dia_jornada = 138;

-- Dia 140 · João 13:5 — TPT
UPDATE momento_kairos SET
  versiculo_texto      = 'Depois, deitou água numa bacia e começou a lavar os pés sujos dos discípulos e a enxugá-los com a toalha.',
  versiculo_referencia = 'João 13:5 — TPT'
WHERE dia_jornada = 140;

-- Dia 148 · Lucas 2:26 — TPT
UPDATE momento_kairos SET
  versiculo_texto      = 'Pois o Espírito Santo lhe havia revelado que ele não morreria antes de ver o Messias, o Ungido de Deus.',
  versiculo_referencia = 'Lucas 2:26 — TPT'
WHERE dia_jornada = 148;

COMMIT;

-- Verificação — 0 linhas:
--   SELECT dia_jornada FROM momento_kairos
--    WHERE dia_jornada BETWEEN 121 AND 151 AND versiculo_texto = 'COLE_O_TEXTO_AQUI';
