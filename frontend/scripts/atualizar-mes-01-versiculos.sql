-- ═══════════════════════════════════════════════════════════════════════════
-- MÊS 1 — versículos novos (TPT, colados da fonte)
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Sete dos nove dias que ganharam cena bíblica nova. Texto exato da TPT,
-- fornecido pelo Davilson — não gerado.
--
-- PENDENTES, ainda com o versículo antigo:
--   dia  4 → 2 Samuel 9:13  (não foi enviado)
--   dia 22 → Lucas 15:20    (veio o texto de Daniel 3:27 por engano)
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- Dia 2 · Juízes 6:12
UPDATE momento_kairos SET
  versiculo_texto      = 'De repente, o anjo do Senhor apareceu a Gideão e disse: “A presença do Senhor está contigo, homem de coragem destemida!”',
  versiculo_referencia = 'Juízes 6:12 — TPT'
WHERE dia_jornada = 2;

-- Dia 9 · João 21:17
UPDATE momento_kairos SET
  versiculo_texto      = 'Então Jesus perguntou-lhe novamente: “Pedro, filho de Jonas, você tem grande afeição por mim?” Pedro ficou triste por ser questionado pela terceira vez e disse: “Meu Senhor, tu sabes tudo. Tu sabes que eu ardo de amor por ti!” Jesus respondeu: “Então apascenta os meus cordeiros!”',
  versiculo_referencia = 'João 21:17 — TPT'
WHERE dia_jornada = 9;

-- Dia 12 · Rute 2:3
UPDATE momento_kairos SET
  versiculo_texto      = 'Então Rute foi aos campos para recolher o trigo que os ceifeiros haviam deixado para trás. Aconteceu que ela se viu trabalhando na extremidade de um campo que pertencia a Boaz, da família de Elimeleque.',
  versiculo_referencia = 'Rute 2:3 — TPT'
WHERE dia_jornada = 12;

-- Dia 17 · João 21:22
UPDATE momento_kairos SET
  versiculo_texto      = 'Jesus respondeu: “Se eu decidir deixá-lo viver até que eu volte, o que isso tem a ver com você? Continue me seguindo!”',
  versiculo_referencia = 'João 21:22 — TPT'
WHERE dia_jornada = 17;

-- Dia 21 · Daniel 3:27
UPDATE momento_kairos SET
  versiculo_texto      = 'Quando todos os oficiais do rei se reuniram, juntamente com os príncipes, magistrados e governadores, descobriram que o fogo não havia causado nenhum dano aos três homens. Seus cabelos não estavam chamuscados, suas roupas não estavam queimadas e eles nem sequer cheiravam a fumaça.',
  versiculo_referencia = 'Daniel 3:27 — TPT'
WHERE dia_jornada = 21;

-- Dia 24 · Atos 9:9
UPDATE momento_kairos SET
  versiculo_texto      = 'Durante três dias ele não comeu nem bebeu e não conseguia enxergar nada.',
  versiculo_referencia = 'Atos 9:9 — TPT'
WHERE dia_jornada = 24;

-- Dia 29 · Daniel 6:10
UPDATE momento_kairos SET
  versiculo_texto      = 'Mesmo depois de Daniel ter ficado sabendo que o rei havia assinado oficialmente o decreto, ele continuou com seu costume de orar três vezes ao dia. Subiu ao quarto superior de sua casa, abriu as janelas que davam para Jerusalém, ajoelhou-se, orou e louvou a Deus, como sempre fazia.',
  versiculo_referencia = 'Daniel 6:10 — TPT'
WHERE dia_jornada = 29;

COMMIT;

-- Verificação — deve devolver 7 linhas, nenhuma com placeholder:
--
--   SELECT dia_jornada, versiculo_referencia, left(versiculo_texto, 60)
--     FROM momento_kairos
--    WHERE dia_jornada IN (2, 9, 12, 17, 21, 24, 29)
--    ORDER BY dia_jornada;

-- ═══════════════════════════════════════════════════════════════════════════
-- Os dois que faltavam — em Almeida (domínio público)
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Dia  4 · 2 Samuel 9:13 — não encontrado na TPT
-- Dia 22 · Lucas 15:20   — o texto enviado era Lucas 10:20
--
-- Almeida resolve os dois: é domínio público, então não há questão de licença,
-- e a linguagem antiga assenta bem nas duas cenas. Se um dia você quiser a TPT
-- nesses dois dias, é só trocar o texto e o sufixo da referência.
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- Dia 4 · 2 Samuel 9:13 — Almeida
UPDATE momento_kairos SET
  versiculo_texto      = 'Assim habitava Mefibosete em Jerusalém, porquanto sempre comia à mesa do rei; e era coxo de ambos os pés.',
  versiculo_referencia = '2 Samuel 9:13 — Almeida'
WHERE dia_jornada = 4;

-- Dia 22 · Lucas 15:20 — Almeida
UPDATE momento_kairos SET
  versiculo_texto      = 'E, levantando-se, foi para seu pai. E, quando ainda estava longe, viu-o seu pai, e se moveu de íntima compaixão e, correndo, lançou-se-lhe ao pescoço e o beijou.',
  versiculo_referencia = 'Lucas 15:20 — Almeida'
WHERE dia_jornada = 22;

COMMIT;

-- Verificação final do mês 1 — deve devolver 0 linhas:
--
--   SELECT dia_jornada FROM momento_kairos
--    WHERE dia_jornada BETWEEN 1 AND 31
--      AND (versiculo_texto IS NULL OR versiculo_texto = 'COLE_O_TEXTO_AQUI');
