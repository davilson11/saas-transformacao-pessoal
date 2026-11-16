-- ═══════════════════════════════════════════════════════════════════════════
-- MÊS 4 — os seis versículos trocados
-- ═══════════════════════════════════════════════════════════════════════════
-- Cinco em TPT, colados da fonte. Limpezas feitas:
--   Zacarias 4:10 — cortada a segunda metade (as sete lâmpadas), que é outro
--                   assunto e não cabe na caixa
--   Lucas 14:28   — removida a nota de rodapé "Ou torre"
--
-- ⚠️  1 Reis 19:21 está SEM o sufixo "— TPT". O texto veio de um post de rede
--     social, não da TPT, e a redação não parece ser dela. Confira na sua
--     Bíblia antes de assumir a atribuição; se for de outra tradução, troque o
--     rótulo para a correta.
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- Dia 92 · Hebreus 11:7 — TPT
UPDATE momento_kairos SET
  versiculo_texto      = 'A fé abriu o coração de Noé para receber revelações e avisos de Deus sobre o que estava por vir, até mesmo coisas que nunca tinham sido vistas. Mas ele deu um passo em reverente obediência a Deus e construiu uma arca que salvaria a si mesmo e à sua família.',
  versiculo_referencia = 'Hebreus 11:7 — TPT'
WHERE dia_jornada = 92;

-- Dia 100 · Josué 14:12 — TPT
UPDATE momento_kairos SET
  versiculo_texto      = 'Agora, dê-me a região montanhosa que o Senhor me prometeu naquele dia. Você mesmo estava lá e ouviu o relato de que os anaquins viviam lá em cidades fortes e fortificadas. Eu sei que, com o poder do Senhor me ajudando, eu os expulsarei, exatamente como o Senhor disse!',
  versiculo_referencia = 'Josué 14:12 — TPT'
WHERE dia_jornada = 100;

-- Dia 103 · Zacarias 4:10 — TPT
UPDATE momento_kairos SET
  versiculo_texto      = 'Aqueles que desprezam o dia dos pequenos começos se alegrarão quando virem Zorobabel segurando o prumo em suas mãos.',
  versiculo_referencia = 'Zacarias 4:10 — TPT'
WHERE dia_jornada = 103;

-- Dia 110 · Lucas 14:28 — TPT
UPDATE momento_kairos SET
  versiculo_texto      = 'Portanto, não me siga sem considerar o preço que isso lhe custará. Pois quem constrói uma casa sem antes calcular o custo para terminá-la?',
  versiculo_referencia = 'Lucas 14:28 — TPT'
WHERE dia_jornada = 110;

-- Dia 115 · 2 Timóteo 1:5 — TPT
UPDATE momento_kairos SET
  versiculo_texto      = 'Ao pensar na forte fé que você tem, transmitida através da sua família. Começou com sua avó Lóide, que a transmitiu para sua querida mãe, Eunice. E é evidente que você também está seguindo os passos do exemplo piedoso delas.',
  versiculo_referencia = '2 Timóteo 1:5 — TPT'
WHERE dia_jornada = 115;

-- Dia 118 · 1 Reis 19:21
UPDATE momento_kairos SET
  versiculo_texto      = 'Então Eliseu o deixou e voltou. Ele pegou a sua junta de bois e os abateu. Queimou os equipamentos de arar para cozinhar a carne e a deu ao povo, e eles comeram. Depois, partiu para seguir Elias e tornou-se seu servo.',
  versiculo_referencia = '1 Reis 19:21'
WHERE dia_jornada = 118;

COMMIT;

-- Verificação — 0 linhas:
--   SELECT dia_jornada FROM momento_kairos
--    WHERE dia_jornada BETWEEN 91 AND 120 AND versiculo_texto = 'COLE_O_TEXTO_AQUI';
