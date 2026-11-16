-- ═══════════════════════════════════════════════════════════════════════════
-- MÊS 5 — COMPLETO · "Fé que age" · dias 121 a 151
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Um arquivo só: os 31 textos + os 6 versículos trocados, numa transação.
-- Gerado de scripts/reescrita-mes-05.md.
--
-- Solto do calendário: 135 ("cada dia de maio"), 150 e 151 ("Maio termina",
-- "síntese de maio").
--
-- Cenas repetidas trocadas: o dia 133 citava Noé, Abraão e Josué na mesma
-- frase, e os três já tinham aparecido nos meses 2 e 4. Ficou Jericó, narrado.
--
-- ⚠️  Os versículos dos dias 123, 124, 133, 138, 140 e 148 entram com
--     'COLE_O_TEXTO_AQUI'. O app mostra a caixa vazia até o texto da TPT ser
--     colado — e os dias 123 e 124 chegam antes dos outros.
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ─── os 31 textos ──────────────────────────────────────────────────────────

UPDATE momento_kairos SET
  voz_do_dia   = 'Quatro meses olhando para dentro. Agora a pergunta sai do espelho e vai para a rua.

Tiago escreve que a fé sem obras é morta, e a palavra que ele usa é cadáver. Não fraca, não incompleta — morta. É o tipo de frase que irrita quem gosta de teologia limpa.

O ponto dele não é que ação salva. É que fé que não produz movimento provavelmente nunca foi fé — foi concordância. E concordar é barato.

Você passou quatro meses sabendo mais. Este mês mede outra coisa.',
  missao       = 'Escolha uma área onde você tem fé declarada e pouca ação correspondente. Escreva o menor passo possível — tão pequeno que seja constrangedor não dar. Dê hoje.',
  missao_fase1 = 'Escolha uma área onde você tem fé declarada e pouca ação correspondente. Escreva o menor passo possível — tão pequeno que seja constrangedor não dar. Dê hoje.',
  missao_fase2 = 'Escolha uma área onde você tem fé declarada e pouca ação correspondente. Escreva o menor passo possível — tão pequeno que seja constrangedor não dar. Dê hoje.',
  missao_fase3 = 'Escolha uma área onde você tem fé declarada e pouca ação correspondente. Escreva o menor passo possível — tão pequeno que seja constrangedor não dar. Dê hoje.',
  missao_fase4 = 'Escolha uma área onde você tem fé declarada e pouca ação correspondente. Escreva o menor passo possível — tão pequeno que seja constrangedor não dar. Dê hoje.'
WHERE dia_jornada = 121;

UPDATE momento_kairos SET
  voz_do_dia   = 'Tem uma fé que funciona como apólice: você a aciona quando desmorona.

E tem uma fé que funciona como motor: ela decide onde você almoça, como você responde uma mensagem atravessada, o que você faz com uma informação que te beneficiaria guardar.

A primeira aparece em crise. A segunda aparece em terça-feira.

Habacuque escreve que o justo viverá pela fé — viverá, verbo de rotina, não de emergência.',
  missao       = 'Hoje, escolha três decisões pequenas do dia — o que falar, o que fazer, como responder — e tome cada uma perguntando antes o que a fé pediria. Anote as três à noite.',
  missao_fase1 = 'Hoje, escolha três decisões pequenas do dia — o que falar, o que fazer, como responder — e tome cada uma perguntando antes o que a fé pediria. Anote as três à noite.',
  missao_fase2 = 'Hoje, escolha três decisões pequenas do dia — o que falar, o que fazer, como responder — e tome cada uma perguntando antes o que a fé pediria. Anote as três à noite.',
  missao_fase3 = 'Hoje, escolha três decisões pequenas do dia — o que falar, o que fazer, como responder — e tome cada uma perguntando antes o que a fé pediria. Anote as três à noite.',
  missao_fase4 = 'Hoje, escolha três decisões pequenas do dia — o que falar, o que fazer, como responder — e tome cada uma perguntando antes o que a fé pediria. Anote as três à noite.'
WHERE dia_jornada = 122;

UPDATE momento_kairos SET
  voz_do_dia   = 'Samuel era menino e dormia no templo. Ouviu seu nome e correu até Eli: você me chamou?

Aconteceu três vezes. Nas três, ele atribuiu a voz à pessoa errada — e o texto explica por quê: ainda não conhecia o Senhor, nem lhe tinha sido revelada a palavra.

Na quarta, Eli o ensinou o que responder. E a resposta não foi uma pergunta: *fala, Senhor, porque o teu servo ouve.*

A maioria das pessoas sabe o que Deus falou há cinco anos. Poucas perguntam o que ele está falando sobre o passo de agora.',
  missao       = 'Quinze minutos em silêncio, sem celular e sem música. Uma pergunta só: o que o Senhor está falando sobre este passo? Escreva o que vier, inclusive se vier pouco.',
  missao_fase1 = 'Quinze minutos em silêncio, sem celular e sem música. Uma pergunta só: o que o Senhor está falando sobre este passo? Escreva o que vier, inclusive se vier pouco.',
  missao_fase2 = 'Quinze minutos em silêncio, sem celular e sem música. Uma pergunta só: o que o Senhor está falando sobre este passo? Escreva o que vier, inclusive se vier pouco.',
  missao_fase3 = 'Quinze minutos em silêncio, sem celular e sem música. Uma pergunta só: o que o Senhor está falando sobre este passo? Escreva o que vier, inclusive se vier pouco.',
  missao_fase4 = 'Quinze minutos em silêncio, sem celular e sem música. Uma pergunta só: o que o Senhor está falando sobre este passo? Escreva o que vier, inclusive se vier pouco.'
WHERE dia_jornada = 123;

UPDATE momento_kairos SET
  voz_do_dia   = 'Saul recebeu uma ordem clara e cumpriu quase toda. Guardou o melhor do gado — para sacrificar, segundo ele.

Quando Samuel chegou, Saul saiu ao encontro dizendo que tinha cumprido a palavra do Senhor. E Samuel respondeu com a pergunta mais seca da Bíblia: *que balido de ovelhas é esse que chega aos meus ouvidos?*

A desobediência estava berrando no quintal enquanto ele declarava obediência na porta.

Obediência parcial tem sempre uma boa justificativa. Esse é o problema dela: ela convence quem a pratica.',
  missao       = 'Escreva uma coisa que você está cumprindo pela metade, ou adiando justamente na parte mais cara. Nomeie o berro que está no seu quintal.',
  missao_fase1 = 'Escreva uma coisa que você está cumprindo pela metade, ou adiando justamente na parte mais cara. Nomeie o berro que está no seu quintal.',
  missao_fase2 = 'Escreva uma coisa que você está cumprindo pela metade, ou adiando justamente na parte mais cara. Nomeie o berro que está no seu quintal.',
  missao_fase3 = 'Escreva uma coisa que você está cumprindo pela metade, ou adiando justamente na parte mais cara. Nomeie o berro que está no seu quintal.',
  missao_fase4 = 'Escreva uma coisa que você está cumprindo pela metade, ou adiando justamente na parte mais cara. Nomeie o berro que está no seu quintal.'
WHERE dia_jornada = 124;

UPDATE momento_kairos SET
  voz_do_dia   = 'É fácil crer que Deus faz pelos outros. A prova disso é que você se alegra de verdade quando ouve.

Difícil é aplicar a mesma fé a si mesmo — e tem gente com uma teologia generosa para o irmão e uma contabilidade dura para a própria vida.

A conta não fecha: ou a promessa vale para quem crê, ou não vale para ninguém.',
  missao       = 'Escolha uma promessa da Escritura que trate de uma necessidade sua de agora. Reescreva em primeira pessoa, com o seu nome dentro. Leia em voz alta uma vez.',
  missao_fase1 = 'Escolha uma promessa da Escritura que trate de uma necessidade sua de agora. Reescreva em primeira pessoa, com o seu nome dentro. Leia em voz alta uma vez.',
  missao_fase2 = 'Escolha uma promessa da Escritura que trate de uma necessidade sua de agora. Reescreva em primeira pessoa, com o seu nome dentro. Leia em voz alta uma vez.',
  missao_fase3 = 'Escolha uma promessa da Escritura que trate de uma necessidade sua de agora. Reescreva em primeira pessoa, com o seu nome dentro. Leia em voz alta uma vez.',
  missao_fase4 = 'Escolha uma promessa da Escritura que trate de uma necessidade sua de agora. Reescreva em primeira pessoa, com o seu nome dentro. Leia em voz alta uma vez.'
WHERE dia_jornada = 125;

UPDATE momento_kairos SET
  voz_do_dia   = 'Numa festa de casamento acabou o vinho, que era vergonha pública para a família.

A instrução que os serviçais receberam não tinha nada a ver com o problema: encham de água aquelas seis talhas de pedra. Eram talhas de purificação, não de bebida. Encher aquilo dava trabalho e não resolvia nada.

Eles encheram até em cima. E o texto registra um detalhe: os serviçais sabiam de onde tinha vindo. O mestre da festa não.

Fé que age quase sempre obedece antes de entender. A compreensão costuma chegar no meio do caminho, e às vezes só chega para quem carregou a água.',
  missao       = 'Identifique algo que você adia até "entender melhor". Escreva: o que exatamente eu preciso entender — e Deus pediu que eu entendesse, ou que eu fizesse?',
  missao_fase1 = 'Identifique algo que você adia até "entender melhor". Escreva: o que exatamente eu preciso entender — e Deus pediu que eu entendesse, ou que eu fizesse?',
  missao_fase2 = 'Identifique algo que você adia até "entender melhor". Escreva: o que exatamente eu preciso entender — e Deus pediu que eu entendesse, ou que eu fizesse?',
  missao_fase3 = 'Identifique algo que você adia até "entender melhor". Escreva: o que exatamente eu preciso entender — e Deus pediu que eu entendesse, ou que eu fizesse?',
  missao_fase4 = 'Identifique algo que você adia até "entender melhor". Escreva: o que exatamente eu preciso entender — e Deus pediu que eu entendesse, ou que eu fizesse?'
WHERE dia_jornada = 126;

UPDATE momento_kairos SET
  voz_do_dia   = 'Paulo tentou ir para a Ásia e foi impedido. Tentou Bitínia e o Espírito não permitiu. Dois planos razoáveis, duas portas fechadas, nenhuma explicação.

Ficaram em Trôade sem saber o que fazer. Foi ali que veio a visão do homem da Macedônia pedindo ajuda — e foi assim que o evangelho entrou na Europa.

Às vezes fé que age significa parar quando tudo grita para avançar. Impulso forte não é o mesmo que direção.',
  missao       = 'Antes de qualquer decisão relevante hoje, pare três minutos e pergunte: isto é paz ou é ansiedade com pressa? Se for a segunda, adie até amanhã.',
  missao_fase1 = 'Antes de qualquer decisão relevante hoje, pare três minutos e pergunte: isto é paz ou é ansiedade com pressa? Se for a segunda, adie até amanhã.',
  missao_fase2 = 'Antes de qualquer decisão relevante hoje, pare três minutos e pergunte: isto é paz ou é ansiedade com pressa? Se for a segunda, adie até amanhã.',
  missao_fase3 = 'Antes de qualquer decisão relevante hoje, pare três minutos e pergunte: isto é paz ou é ansiedade com pressa? Se for a segunda, adie até amanhã.',
  missao_fase4 = 'Antes de qualquer decisão relevante hoje, pare três minutos e pergunte: isto é paz ou é ansiedade com pressa? Se for a segunda, adie até amanhã.'
WHERE dia_jornada = 127;

UPDATE momento_kairos SET
  voz_do_dia   = 'Quando você ouve o que Deus fez na vida de outra pessoa, alguma coisa reage. Se for inveja, vira peso. Se for fé, vira possibilidade.

A diferença entre as duas reações não está na história que você ouviu. Está no que você acredita sobre si naquele dia.

Qual das duas apareceu da última vez?',
  missao       = 'Conte hoje, para uma pessoa, um momento em que você agiu por fé e Deus respondeu. Em voz alta, não por escrito. Repare no que você lembra ao contar e que não lembrava antes.',
  missao_fase1 = 'Conte hoje, para uma pessoa, um momento em que você agiu por fé e Deus respondeu. Em voz alta, não por escrito. Repare no que você lembra ao contar e que não lembrava antes.',
  missao_fase2 = 'Conte hoje, para uma pessoa, um momento em que você agiu por fé e Deus respondeu. Em voz alta, não por escrito. Repare no que você lembra ao contar e que não lembrava antes.',
  missao_fase3 = 'Conte hoje, para uma pessoa, um momento em que você agiu por fé e Deus respondeu. Em voz alta, não por escrito. Repare no que você lembra ao contar e que não lembrava antes.',
  missao_fase4 = 'Conte hoje, para uma pessoa, um momento em que você agiu por fé e Deus respondeu. Em voz alta, não por escrito. Repare no que você lembra ao contar e que não lembrava antes.'
WHERE dia_jornada = 128;

UPDATE momento_kairos SET
  voz_do_dia   = 'Elias pediu água e pão a uma viúva que estava juntando dois gravetos para fazer a última refeição da vida dela e do filho.

A resposta dela foi um inventário exato: um punhado de farinha na panela e um pouco de azeite na botija. Depois disso, morreremos.

Ela fez o bolo para o profeta primeiro. E a farinha não acabou.

Repare na ordem, porque é ela que incomoda: a provisão não veio antes do gesto. Veio depois.',
  missao       = 'Faça hoje um ato de generosidade financeira. Não no tamanho certo — no tamanho possível agora. Pode ser pequeno. Tem que ser hoje.',
  missao_fase1 = 'Faça hoje um ato de generosidade financeira. Não no tamanho certo — no tamanho possível agora. Pode ser pequeno. Tem que ser hoje.',
  missao_fase2 = 'Faça hoje um ato de generosidade financeira. Não no tamanho certo — no tamanho possível agora. Pode ser pequeno. Tem que ser hoje.',
  missao_fase3 = 'Faça hoje um ato de generosidade financeira. Não no tamanho certo — no tamanho possível agora. Pode ser pequeno. Tem que ser hoje.',
  missao_fase4 = 'Faça hoje um ato de generosidade financeira. Não no tamanho certo — no tamanho possível agora. Pode ser pequeno. Tem que ser hoje.'
WHERE dia_jornada = 129;

UPDATE momento_kairos SET
  voz_do_dia   = 'Existe um tipo de fidelidade que não rende história para contar.

É o relatório feito direito que ninguém vai conferir. A conversa em que você não entrou. O desconto que você avisou que estava errado a seu favor.

Nada disso vira testemunho, porque testemunho precisa de enredo. Mas é aí que o caráter é construído, e caráter é o que sustenta quando a oportunidade grande aparece.',
  missao       = 'Escreva uma área em que você é fiel sem que ninguém veja. Depois escreva o que isso te custa. Reconhecer o custo é parte de continuar pagando.',
  missao_fase1 = 'Escreva uma área em que você é fiel sem que ninguém veja. Depois escreva o que isso te custa. Reconhecer o custo é parte de continuar pagando.',
  missao_fase2 = 'Escreva uma área em que você é fiel sem que ninguém veja. Depois escreva o que isso te custa. Reconhecer o custo é parte de continuar pagando.',
  missao_fase3 = 'Escreva uma área em que você é fiel sem que ninguém veja. Depois escreva o que isso te custa. Reconhecer o custo é parte de continuar pagando.',
  missao_fase4 = 'Escreva uma área em que você é fiel sem que ninguém veja. Depois escreva o que isso te custa. Reconhecer o custo é parte de continuar pagando.'
WHERE dia_jornada = 130;

UPDATE momento_kairos SET
  voz_do_dia   = 'Impulso reage ao momento e não tem memória: começa muito e termina pouco.

Coragem responde a um chamado e tem data. Ela sabe por que começou, o que custa e quanto tempo deve durar.

As duas produzem movimento no primeiro dia. No trigésimo, só uma continua de pé.',
  missao       = 'Escreva um ato de coragem que sua fé vem pedindo e que você adia por medo. Marque dia e hora para ele nesta semana. Hora cheia, no calendário.',
  missao_fase1 = 'Escreva um ato de coragem que sua fé vem pedindo e que você adia por medo. Marque dia e hora para ele nesta semana. Hora cheia, no calendário.',
  missao_fase2 = 'Escreva um ato de coragem que sua fé vem pedindo e que você adia por medo. Marque dia e hora para ele nesta semana. Hora cheia, no calendário.',
  missao_fase3 = 'Escreva um ato de coragem que sua fé vem pedindo e que você adia por medo. Marque dia e hora para ele nesta semana. Hora cheia, no calendário.',
  missao_fase4 = 'Escreva um ato de coragem que sua fé vem pedindo e que você adia por medo. Marque dia e hora para ele nesta semana. Hora cheia, no calendário.'
WHERE dia_jornada = 131;

UPDATE momento_kairos SET
  voz_do_dia   = 'Jesus contou de um juiz que não temia a Deus nem respeitava ninguém, e de uma viúva que voltava todo dia pedindo justiça.

Ele a atendeu — e o motivo registrado é constrangedor: para que ela parasse de me importunar.

Jesus não comparou Deus ao juiz. Fez o contrário: se até um homem assim cede à insistência, quanto mais.

Pedido vago é fácil de abandonar. Pedido específico tem como voltar amanhã.',
  missao       = 'Escreva três pedidos específicos — com nome, contexto e o que mudaria se fossem atendidos. Nada genérico. Releia amanhã e depois de amanhã.',
  missao_fase1 = 'Escreva três pedidos específicos — com nome, contexto e o que mudaria se fossem atendidos. Nada genérico. Releia amanhã e depois de amanhã.',
  missao_fase2 = 'Escreva três pedidos específicos — com nome, contexto e o que mudaria se fossem atendidos. Nada genérico. Releia amanhã e depois de amanhã.',
  missao_fase3 = 'Escreva três pedidos específicos — com nome, contexto e o que mudaria se fossem atendidos. Nada genérico. Releia amanhã e depois de amanhã.',
  missao_fase4 = 'Escreva três pedidos específicos — com nome, contexto e o que mudaria se fossem atendidos. Nada genérico. Releia amanhã e depois de amanhã.'
WHERE dia_jornada = 132;

UPDATE momento_kairos SET
  voz_do_dia   = 'A instrução para tomar Jericó não tinha nada de militar. Andar em volta da cidade uma vez por dia, durante seis dias, em silêncio. No sétimo, sete voltas, e aí gritar.

Treze voltas no total, sendo que doze delas não produziram absolutamente nada visível.

Imagine a sexta. Nada rachou, nada caiu, e os de cima do muro já tinham parado de levar a sério.

Fé que age quase sempre inclui um trecho que parece ridículo visto de fora — e visto de dentro também.',
  missao       = 'Escreva algo que Deus pôs em você e que parece grande demais, cedo demais ou improvável demais. Depois escreva a volta de hoje: a coisa pequena e sem resultado visível que você vai fazer assim mesmo.',
  missao_fase1 = 'Escreva algo que Deus pôs em você e que parece grande demais, cedo demais ou improvável demais. Depois escreva a volta de hoje: a coisa pequena e sem resultado visível que você vai fazer assim mesmo.',
  missao_fase2 = 'Escreva algo que Deus pôs em você e que parece grande demais, cedo demais ou improvável demais. Depois escreva a volta de hoje: a coisa pequena e sem resultado visível que você vai fazer assim mesmo.',
  missao_fase3 = 'Escreva algo que Deus pôs em você e que parece grande demais, cedo demais ou improvável demais. Depois escreva a volta de hoje: a coisa pequena e sem resultado visível que você vai fazer assim mesmo.',
  missao_fase4 = 'Escreva algo que Deus pôs em você e que parece grande demais, cedo demais ou improvável demais. Depois escreva a volta de hoje: a coisa pequena e sem resultado visível que você vai fazer assim mesmo.'
WHERE dia_jornada = 133;

UPDATE momento_kairos SET
  voz_do_dia   = 'Tiago escreve sobre o agricultor que espera o precioso fruto da terra, aguardando com paciência a chuva temporã e a serôdia.

É uma imagem precisa sobre espera. O lavrador não fica olhando o céu: ele semeia, limpa, conserta cerca, prepara. Faz tudo que depende dele e não faz nada do que não depende.

Espera ativa não é passividade. É trabalhar na parte que é sua enquanto a outra não chega.',
  missao       = 'Identifique uma coisa que você está forçando no seu tempo. Escreva o que nela é seu trabalho e o que é chuva. Hoje, faça só a parte que é sua.',
  missao_fase1 = 'Identifique uma coisa que você está forçando no seu tempo. Escreva o que nela é seu trabalho e o que é chuva. Hoje, faça só a parte que é sua.',
  missao_fase2 = 'Identifique uma coisa que você está forçando no seu tempo. Escreva o que nela é seu trabalho e o que é chuva. Hoje, faça só a parte que é sua.',
  missao_fase3 = 'Identifique uma coisa que você está forçando no seu tempo. Escreva o que nela é seu trabalho e o que é chuva. Hoje, faça só a parte que é sua.',
  missao_fase4 = 'Identifique uma coisa que você está forçando no seu tempo. Escreva o que nela é seu trabalho e o que é chuva. Hoje, faça só a parte que é sua.'
WHERE dia_jornada = 134;

UPDATE momento_kairos SET
  voz_do_dia   = 'Quinze dias de convites a agir. A pergunta de revisão é concreta e não tem meio-termo: você agiu?

Não perfeitamente. Não com o resultado que queria. Agiu?

Se a resposta for não, há uma informação valiosa aí e ela não é sobre preguiça. Quase sempre o passo escolhido era grande demais, e passo grande demais não é ambição — é autossabotagem com roupa boa.',
  missao       = 'Releia estes quinze dias. Escreva duas linhas: uma ação de fé que você tomou, por menor que seja, e uma que você adiou. Para a adiada, reduza o tamanho pela metade e faça amanhã.',
  missao_fase1 = 'Releia estes quinze dias. Escreva duas linhas: uma ação de fé que você tomou, por menor que seja, e uma que você adiou. Para a adiada, reduza o tamanho pela metade e faça amanhã.',
  missao_fase2 = 'Releia estes quinze dias. Escreva duas linhas: uma ação de fé que você tomou, por menor que seja, e uma que você adiou. Para a adiada, reduza o tamanho pela metade e faça amanhã.',
  missao_fase3 = 'Releia estes quinze dias. Escreva duas linhas: uma ação de fé que você tomou, por menor que seja, e uma que você adiou. Para a adiada, reduza o tamanho pela metade e faça amanhã.',
  missao_fase4 = 'Releia estes quinze dias. Escreva duas linhas: uma ação de fé que você tomou, por menor que seja, e uma que você adiou. Para a adiada, reduza o tamanho pela metade e faça amanhã.'
WHERE dia_jornada = 135;

UPDATE momento_kairos SET
  voz_do_dia   = 'Havia um homem doente há trinta e oito anos ao lado de um tanque onde, segundo diziam, a água às vezes se movia e curava quem entrasse primeiro.

Jesus perguntou se ele queria ser curado. A resposta não foi sim. Foi uma explicação: não tenho ninguém que me ponha no tanque, e enquanto eu vou, outro desce antes.

Ele respondeu por que ainda não tinha conseguido. É o que a gente responde quando a pergunta encosta num lugar que já foi acomodado.',
  missao       = 'Identifique uma área sua que precisa de cura e que você vem evitando olhar. Escreva a sua explicação de por que ainda não. Depois leia e repare se é explicação ou é resposta.',
  missao_fase1 = 'Identifique uma área sua que precisa de cura e que você vem evitando olhar. Escreva a sua explicação de por que ainda não. Depois leia e repare se é explicação ou é resposta.',
  missao_fase2 = 'Identifique uma área sua que precisa de cura e que você vem evitando olhar. Escreva a sua explicação de por que ainda não. Depois leia e repare se é explicação ou é resposta.',
  missao_fase3 = 'Identifique uma área sua que precisa de cura e que você vem evitando olhar. Escreva a sua explicação de por que ainda não. Depois leia e repare se é explicação ou é resposta.',
  missao_fase4 = 'Identifique uma área sua que precisa de cura e que você vem evitando olhar. Escreva a sua explicação de por que ainda não. Depois leia e repare se é explicação ou é resposta.'
WHERE dia_jornada = 136;

UPDATE momento_kairos SET
  voz_do_dia   = 'Tem coisa que você está construindo e que ninguém pode ver, inclusive você em dia ruim.

Um hábito de três semanas não aparece em lugar nenhum. Uma conversa difícil bem conduzida não gera prova. Estudo que ainda não virou competência parece tempo perdido.

Quase todo resultado visível passou um período longo sendo invisível, e a maioria das desistências acontece exatamente nesse trecho.',
  missao       = 'Escreva três coisas que você está construindo e que ainda não têm resultado visível. Ao lado de cada uma, há quanto tempo. Guarde para reler no fim do ano.',
  missao_fase1 = 'Escreva três coisas que você está construindo e que ainda não têm resultado visível. Ao lado de cada uma, há quanto tempo. Guarde para reler no fim do ano.',
  missao_fase2 = 'Escreva três coisas que você está construindo e que ainda não têm resultado visível. Ao lado de cada uma, há quanto tempo. Guarde para reler no fim do ano.',
  missao_fase3 = 'Escreva três coisas que você está construindo e que ainda não têm resultado visível. Ao lado de cada uma, há quanto tempo. Guarde para reler no fim do ano.',
  missao_fase4 = 'Escreva três coisas que você está construindo e que ainda não têm resultado visível. Ao lado de cada uma, há quanto tempo. Guarde para reler no fim do ano.'
WHERE dia_jornada = 137;

UPDATE momento_kairos SET
  voz_do_dia   = 'Ezequiel foi levado a um vale cheio de ossos secos. Secos é a palavra que o texto repete — não corpos recentes, não mortos de ontem. Ossos de muito tempo.

E a ordem que ele recebeu foi para falar com eles. Falar com ossos.

Ele falou. E veio ruído, e os ossos se juntaram, e vieram nervos, carne e pele. Mas ainda não havia espírito neles — foi preciso uma segunda ordem, desta vez para o vento.

Declarar não é manipular Deus. É repetir em voz alta o que ele já disse, num vale onde todo o resto está dizendo o contrário.',
  missao       = 'Escreva três declarações sobre sua vida — não sobre como você se sente, mas sobre o que você crê que é verdade. Leia em voz alta, sozinho. Repare no desconforto.',
  missao_fase1 = 'Escreva três declarações sobre sua vida — não sobre como você se sente, mas sobre o que você crê que é verdade. Leia em voz alta, sozinho. Repare no desconforto.',
  missao_fase2 = 'Escreva três declarações sobre sua vida — não sobre como você se sente, mas sobre o que você crê que é verdade. Leia em voz alta, sozinho. Repare no desconforto.',
  missao_fase3 = 'Escreva três declarações sobre sua vida — não sobre como você se sente, mas sobre o que você crê que é verdade. Leia em voz alta, sozinho. Repare no desconforto.',
  missao_fase4 = 'Escreva três declarações sobre sua vida — não sobre como você se sente, mas sobre o que você crê que é verdade. Leia em voz alta, sozinho. Repare no desconforto.'
WHERE dia_jornada = 138;

UPDATE momento_kairos SET
  voz_do_dia   = 'Prova de fé não é punição nem armadilha. É o processo que separa o que você diz do que você tem.

O problema quase nunca é passar pelo teste. É passar e não aprender nada — sair do outro lado com a mesma estrutura, só mais cansado.',
  missao       = 'Descreva a situação que mais está testando sua fé agora. Escreva ao lado: que capacidade essa situação está tentando construir em mim? Se não souber, escreva o que ela já revelou.',
  missao_fase1 = 'Descreva a situação que mais está testando sua fé agora. Escreva ao lado: que capacidade essa situação está tentando construir em mim? Se não souber, escreva o que ela já revelou.',
  missao_fase2 = 'Descreva a situação que mais está testando sua fé agora. Escreva ao lado: que capacidade essa situação está tentando construir em mim? Se não souber, escreva o que ela já revelou.',
  missao_fase3 = 'Descreva a situação que mais está testando sua fé agora. Escreva ao lado: que capacidade essa situação está tentando construir em mim? Se não souber, escreva o que ela já revelou.',
  missao_fase4 = 'Descreva a situação que mais está testando sua fé agora. Escreva ao lado: que capacidade essa situação está tentando construir em mim? Se não souber, escreva o que ela já revelou.'
WHERE dia_jornada = 139;

UPDATE momento_kairos SET
  voz_do_dia   = 'Na última ceia, Jesus levantou-se da mesa, tirou a roupa de cima, cingiu-se com uma toalha e começou a lavar os pés dos discípulos — trabalho de escravo, e dos mais baixos.

O texto deixa claro que, naquele momento, ele já sabia quem o entregaria.

Judas estava na roda. Os pés dele também foram lavados.

Fé que serve não calcula se a pessoa merece, nem se vai haver retorno. Se calculasse, teria pulado um par de pés naquela noite.',
  missao       = 'Escolha hoje uma pessoa com uma necessidade concreta — não uma necessidade que você vai resolver depois, uma de hoje. Resolva. Sem avisar que foi você, se der.',
  missao_fase1 = 'Escolha hoje uma pessoa com uma necessidade concreta — não uma necessidade que você vai resolver depois, uma de hoje. Resolva. Sem avisar que foi você, se der.',
  missao_fase2 = 'Escolha hoje uma pessoa com uma necessidade concreta — não uma necessidade que você vai resolver depois, uma de hoje. Resolva. Sem avisar que foi você, se der.',
  missao_fase3 = 'Escolha hoje uma pessoa com uma necessidade concreta — não uma necessidade que você vai resolver depois, uma de hoje. Resolva. Sem avisar que foi você, se der.',
  missao_fase4 = 'Escolha hoje uma pessoa com uma necessidade concreta — não uma necessidade que você vai resolver depois, uma de hoje. Resolva. Sem avisar que foi você, se der.'
WHERE dia_jornada = 140;

UPDATE momento_kairos SET
  voz_do_dia   = 'Confessar o que você errou é um ato de fé, e não é óbvio por quê.

É fé porque implica acreditar que a misericórdia é maior que o erro. Quem não acredita nisso esconde — e esconder é a resposta racional de quem acha que a verdade vai custar mais do que a mentira.

Davi escondeu por meses. O salmo que ele escreveu depois descreve o custo com precisão física: os ossos envelheceram, o vigor secou.',
  missao       = 'Se há algo pesando — um erro não confessado, uma relação não restaurada, uma honestidade que você deve a alguém — dê hoje o primeiro passo. Só o primeiro.',
  missao_fase1 = 'Se há algo pesando — um erro não confessado, uma relação não restaurada, uma honestidade que você deve a alguém — dê hoje o primeiro passo. Só o primeiro.',
  missao_fase2 = 'Se há algo pesando — um erro não confessado, uma relação não restaurada, uma honestidade que você deve a alguém — dê hoje o primeiro passo. Só o primeiro.',
  missao_fase3 = 'Se há algo pesando — um erro não confessado, uma relação não restaurada, uma honestidade que você deve a alguém — dê hoje o primeiro passo. Só o primeiro.',
  missao_fase4 = 'Se há algo pesando — um erro não confessado, uma relação não restaurada, uma honestidade que você deve a alguém — dê hoje o primeiro passo. Só o primeiro.'
WHERE dia_jornada = 141;

UPDATE momento_kairos SET
  voz_do_dia   = 'Jacó voltou para casa depois de vinte anos sabendo que o irmão que ele enganou vinha ao encontro com quatrocentos homens.

Mandou presentes na frente, dividiu a família em dois grupos para salvar metade, passou a noite acordado. Preparou-se para o pior com todo o cuidado de quem conhece a própria culpa.

E então Esaú correu ao encontro dele, abraçou-o e choraram juntos.

Nem toda distância que você mantém está sendo mantida dos dois lados.',
  missao       = 'Identifique uma relação com distância — conflito não resolvido, silêncio longo, mágoa velha. Faça hoje o primeiro movimento, por menor que seja. Mensagem conta.',
  missao_fase1 = 'Identifique uma relação com distância — conflito não resolvido, silêncio longo, mágoa velha. Faça hoje o primeiro movimento, por menor que seja. Mensagem conta.',
  missao_fase2 = 'Identifique uma relação com distância — conflito não resolvido, silêncio longo, mágoa velha. Faça hoje o primeiro movimento, por menor que seja. Mensagem conta.',
  missao_fase3 = 'Identifique uma relação com distância — conflito não resolvido, silêncio longo, mágoa velha. Faça hoje o primeiro movimento, por menor que seja. Mensagem conta.',
  missao_fase4 = 'Identifique uma relação com distância — conflito não resolvido, silêncio longo, mágoa velha. Faça hoje o primeiro movimento, por menor que seja. Mensagem conta.'
WHERE dia_jornada = 142;

UPDATE momento_kairos SET
  voz_do_dia   = 'Dormir o suficiente é um ato de confiança: você está declarando, na prática, que o mundo não depende de você estar acordado.

Comer bem, mover o corpo, parar quando está no limite — nada disso é vaidade nem é secundário à vida espiritual. É a manutenção do único equipamento pelo qual tudo o mais vai passar.',
  missao       = 'Escolha um hábito físico que você sabe que precisa estabelecer: sono, movimento, comida, descanso. Comece hoje, na versão mínima — a que você conseguiria fazer num dia péssimo.',
  missao_fase1 = 'Escolha um hábito físico que você sabe que precisa estabelecer: sono, movimento, comida, descanso. Comece hoje, na versão mínima — a que você conseguiria fazer num dia péssimo.',
  missao_fase2 = 'Escolha um hábito físico que você sabe que precisa estabelecer: sono, movimento, comida, descanso. Comece hoje, na versão mínima — a que você conseguiria fazer num dia péssimo.',
  missao_fase3 = 'Escolha um hábito físico que você sabe que precisa estabelecer: sono, movimento, comida, descanso. Comece hoje, na versão mínima — a que você conseguiria fazer num dia péssimo.',
  missao_fase4 = 'Escolha um hábito físico que você sabe que precisa estabelecer: sono, movimento, comida, descanso. Comece hoje, na versão mínima — a que você conseguiria fazer num dia péssimo.'
WHERE dia_jornada = 143;

UPDATE momento_kairos SET
  voz_do_dia   = 'Nem toda persistência é fé. Parte dela é ego com vocabulário espiritual.

A diferença aparece numa pergunta: se ninguém soubesse que você desistiu, você desistiria? Se a resposta for sim, o que está te segurando não é chamado — é plateia.

Parar o que não funciona libera a energia que a coisa certa vai exigir.

O que você está carregando por plateia?',
  missao       = 'Avalie um projeto ou compromisso que consome energia sem fruto. Responda à pergunta acima por escrito, com honestidade. Se for ego, escreva a data em que você vai encerrar.',
  missao_fase1 = 'Avalie um projeto ou compromisso que consome energia sem fruto. Responda à pergunta acima por escrito, com honestidade. Se for ego, escreva a data em que você vai encerrar.',
  missao_fase2 = 'Avalie um projeto ou compromisso que consome energia sem fruto. Responda à pergunta acima por escrito, com honestidade. Se for ego, escreva a data em que você vai encerrar.',
  missao_fase3 = 'Avalie um projeto ou compromisso que consome energia sem fruto. Responda à pergunta acima por escrito, com honestidade. Se for ego, escreva a data em que você vai encerrar.',
  missao_fase4 = 'Avalie um projeto ou compromisso que consome energia sem fruto. Responda à pergunta acima por escrito, com honestidade. Se for ego, escreva a data em que você vai encerrar.'
WHERE dia_jornada = 144;

UPDATE momento_kairos SET
  voz_do_dia   = 'Dez leprosos foram curados no caminho. Um voltou.

Jesus perguntou pelos outros nove, e a pergunta fica no ar sem resposta até hoje. Os nove não foram ingratos por maldade — provavelmente estavam correndo para mostrar a família, retomar a vida, recuperar o tempo. Tinham motivos ótimos.

Gratidão não costuma competir com ingratidão. Costuma competir com pressa.',
  missao       = 'Escreva dez evidências concretas da fidelidade de Deus nos últimos doze meses. Fatos, com data e lugar. Nada de promessa futura — só o que já aconteceu.',
  missao_fase1 = 'Escreva dez evidências concretas da fidelidade de Deus nos últimos doze meses. Fatos, com data e lugar. Nada de promessa futura — só o que já aconteceu.',
  missao_fase2 = 'Escreva dez evidências concretas da fidelidade de Deus nos últimos doze meses. Fatos, com data e lugar. Nada de promessa futura — só o que já aconteceu.',
  missao_fase3 = 'Escreva dez evidências concretas da fidelidade de Deus nos últimos doze meses. Fatos, com data e lugar. Nada de promessa futura — só o que já aconteceu.',
  missao_fase4 = 'Escreva dez evidências concretas da fidelidade de Deus nos últimos doze meses. Fatos, com data e lugar. Nada de promessa futura — só o que já aconteceu.'
WHERE dia_jornada = 145;

UPDATE momento_kairos SET
  voz_do_dia   = 'A maioria dos dias não tem revelação, milagre nem confirmação. Tem só o dia.

E é neles que quase tudo é decidido, porque eles são quase todos.',
  missao       = 'Escolha três ações simples de hoje — fazer o café, responder uma mensagem, terminar uma tarefa chata. Faça cada uma com atenção deliberada, como oferta. Repare se muda alguma coisa.',
  missao_fase1 = 'Escolha três ações simples de hoje — fazer o café, responder uma mensagem, terminar uma tarefa chata. Faça cada uma com atenção deliberada, como oferta. Repare se muda alguma coisa.',
  missao_fase2 = 'Escolha três ações simples de hoje — fazer o café, responder uma mensagem, terminar uma tarefa chata. Faça cada uma com atenção deliberada, como oferta. Repare se muda alguma coisa.',
  missao_fase3 = 'Escolha três ações simples de hoje — fazer o café, responder uma mensagem, terminar uma tarefa chata. Faça cada uma com atenção deliberada, como oferta. Repare se muda alguma coisa.',
  missao_fase4 = 'Escolha três ações simples de hoje — fazer o café, responder uma mensagem, terminar uma tarefa chata. Faça cada uma com atenção deliberada, como oferta. Repare se muda alguma coisa.'
WHERE dia_jornada = 146;

UPDATE momento_kairos SET
  voz_do_dia   = 'Muita gente espera a versão pronta para aparecer. E a versão pronta nunca chega, porque sempre dá para melhorar mais um pouco.

Mostrar o inacabado é um risco real: você perde o controle da primeira impressão. Mas é também a única forma de receber correção enquanto ela ainda é barata.',
  missao       = 'Esta semana, mostre a alguém de confiança algo seu que ainda está em andamento. Diga que está incompleto e pergunte uma coisa específica. Marque hoje.',
  missao_fase1 = 'Esta semana, mostre a alguém de confiança algo seu que ainda está em andamento. Diga que está incompleto e pergunte uma coisa específica. Marque hoje.',
  missao_fase2 = 'Esta semana, mostre a alguém de confiança algo seu que ainda está em andamento. Diga que está incompleto e pergunte uma coisa específica. Marque hoje.',
  missao_fase3 = 'Esta semana, mostre a alguém de confiança algo seu que ainda está em andamento. Diga que está incompleto e pergunte uma coisa específica. Marque hoje.',
  missao_fase4 = 'Esta semana, mostre a alguém de confiança algo seu que ainda está em andamento. Diga que está incompleto e pergunte uma coisa específica. Marque hoje.'
WHERE dia_jornada = 147;

UPDATE momento_kairos SET
  voz_do_dia   = 'Um homem velho em Jerusalém tinha recebido uma palavra: não morreria antes de ver o Cristo.

Ninguém sabe quantos anos ele esperou. Sabe-se que ele estava lá todo dia, que era um entre milhares, e que o menino chegou no colo de um casal pobre, sem nada que o distinguisse dos outros bebês daquela manhã.

Ele reconheceu. Tomou nos braços e disse que agora podia ir em paz.

A espera dele não foi vazia. Foi presença repetida no lugar certo.',
  missao       = 'Escreva uma promessa que você ainda espera. Depois escreva como você está esperando — com amargura, com distração, ou presente. A segunda parte é a que depende de você.',
  missao_fase1 = 'Escreva uma promessa que você ainda espera. Depois escreva como você está esperando — com amargura, com distração, ou presente. A segunda parte é a que depende de você.',
  missao_fase2 = 'Escreva uma promessa que você ainda espera. Depois escreva como você está esperando — com amargura, com distração, ou presente. A segunda parte é a que depende de você.',
  missao_fase3 = 'Escreva uma promessa que você ainda espera. Depois escreva como você está esperando — com amargura, com distração, ou presente. A segunda parte é a que depende de você.',
  missao_fase4 = 'Escreva uma promessa que você ainda espera. Depois escreva como você está esperando — com amargura, com distração, ou presente. A segunda parte é a que depende de você.'
WHERE dia_jornada = 148;

UPDATE momento_kairos SET
  voz_do_dia   = 'Hoje é curto.

Olhe sua semana. Boa parte dela vai evaporar sem deixar marca em ninguém, e isso é normal — a vida tem manutenção.

Mas alguma coisa ali tem peso. Vale saber qual é antes que a semana decida sozinha.',
  missao       = 'Pegue sua agenda desta semana. Marque um sinal ao lado do que ainda vai importar daqui a dez anos. Se não houver nenhum sinal, acrescente um compromisso hoje.',
  missao_fase1 = 'Pegue sua agenda desta semana. Marque um sinal ao lado do que ainda vai importar daqui a dez anos. Se não houver nenhum sinal, acrescente um compromisso hoje.',
  missao_fase2 = 'Pegue sua agenda desta semana. Marque um sinal ao lado do que ainda vai importar daqui a dez anos. Se não houver nenhum sinal, acrescente um compromisso hoje.',
  missao_fase3 = 'Pegue sua agenda desta semana. Marque um sinal ao lado do que ainda vai importar daqui a dez anos. Se não houver nenhum sinal, acrescente um compromisso hoje.',
  missao_fase4 = 'Pegue sua agenda desta semana. Marque um sinal ao lado do que ainda vai importar daqui a dez anos. Se não houver nenhum sinal, acrescente um compromisso hoje.'
WHERE dia_jornada = 149;

UPDATE momento_kairos SET
  voz_do_dia   = 'A pergunta do fim do mês não é o que você sentiu nem o que planejou.

É o que ficou de pé.

Fé que age deixa rastro: uma conversa que aconteceu, um hábito que começou, um dinheiro que saiu, uma pessoa que foi procurada. Se não houver rastro, houve concordância — e concordância não é o tema deste mês.',
  missao       = 'Escreva três coisas concretas que você construiu, começou ou avançou neste mês por causa de uma ação de fé. Se vier menos de três, escreva as que vierem. Número honesto vale mais que lista cheia.',
  missao_fase1 = 'Escreva três coisas concretas que você construiu, começou ou avançou neste mês por causa de uma ação de fé. Se vier menos de três, escreva as que vierem. Número honesto vale mais que lista cheia.',
  missao_fase2 = 'Escreva três coisas concretas que você construiu, começou ou avançou neste mês por causa de uma ação de fé. Se vier menos de três, escreva as que vierem. Número honesto vale mais que lista cheia.',
  missao_fase3 = 'Escreva três coisas concretas que você construiu, começou ou avançou neste mês por causa de uma ação de fé. Se vier menos de três, escreva as que vierem. Número honesto vale mais que lista cheia.',
  missao_fase4 = 'Escreva três coisas concretas que você construiu, começou ou avançou neste mês por causa de uma ação de fé. Se vier menos de três, escreva as que vierem. Número honesto vale mais que lista cheia.'
WHERE dia_jornada = 150;

UPDATE momento_kairos SET
  voz_do_dia   = 'Trinta e um dias agindo antes de ter certeza.

Provavelmente você descobriu que a parte difícil não era a coragem — era o tamanho. Passo grande dá orgulho de planejar e é fácil de adiar; passo pequeno não dá orgulho nenhum e acontece.

O mês que vem muda de assunto outra vez. Mas o que foi aprendido aqui não fica neste mês: todo o resto do ano vai pedir que você aja antes de entender completamente.',
  missao       = 'Escreva uma frase sua sobre fé que age. Não citação, não versículo — frase sua, tirada destes trinta e um dias. Guarde junto com as sínteses dos meses anteriores.',
  missao_fase1 = 'Escreva uma frase sua sobre fé que age. Não citação, não versículo — frase sua, tirada destes trinta e um dias. Guarde junto com as sínteses dos meses anteriores.',
  missao_fase2 = 'Escreva uma frase sua sobre fé que age. Não citação, não versículo — frase sua, tirada destes trinta e um dias. Guarde junto com as sínteses dos meses anteriores.',
  missao_fase3 = 'Escreva uma frase sua sobre fé que age. Não citação, não versículo — frase sua, tirada destes trinta e um dias. Guarde junto com as sínteses dos meses anteriores.',
  missao_fase4 = 'Escreva uma frase sua sobre fé que age. Não citação, não versículo — frase sua, tirada destes trinta e um dias. Guarde junto com as sínteses dos meses anteriores.'
WHERE dia_jornada = 151;

-- ─── os 6 versículos trocados ──────────────────────────────────────────────

-- Dia 123 · João 10:27 → 1 Samuel 3:10
UPDATE momento_kairos SET
  versiculo_texto      = 'COLE_O_TEXTO_AQUI',
  versiculo_referencia = '1 Samuel 3:10 — TPT'
WHERE dia_jornada = 123;

-- Dia 124 · João 14:21 → 1 Samuel 15:22
UPDATE momento_kairos SET
  versiculo_texto      = 'COLE_O_TEXTO_AQUI',
  versiculo_referencia = '1 Samuel 15:22 — TPT'
WHERE dia_jornada = 124;

-- Dia 133 · Hebreus 11:7 → Josué 6:20
UPDATE momento_kairos SET
  versiculo_texto      = 'COLE_O_TEXTO_AQUI',
  versiculo_referencia = 'Josué 6:20 — TPT'
WHERE dia_jornada = 133;

-- Dia 138 · 2 Coríntios 4:13 → Ezequiel 37:4
UPDATE momento_kairos SET
  versiculo_texto      = 'COLE_O_TEXTO_AQUI',
  versiculo_referencia = 'Ezequiel 37:4 — TPT'
WHERE dia_jornada = 138;

-- Dia 140 · Marcos 10:45 → João 13:5
UPDATE momento_kairos SET
  versiculo_texto      = 'COLE_O_TEXTO_AQUI',
  versiculo_referencia = 'João 13:5 — TPT'
WHERE dia_jornada = 140;

-- Dia 148 · Habacuque 2:3 → Lucas 2:26
UPDATE momento_kairos SET
  versiculo_texto      = 'COLE_O_TEXTO_AQUI',
  versiculo_referencia = 'Lucas 2:26 — TPT'
WHERE dia_jornada = 148;

COMMIT;

-- ═══════════════════════════════════════════════════════════════════════════
-- CONFERÊNCIA — esperado: 31 · 0 · 6 · 31
-- (os 6 pendentes somem quando os versículos forem colados)
-- ═══════════════════════════════════════════════════════════════════════════
--
-- SELECT count(*) FILTER (WHERE voz_do_dia LIKE '%' || chr(10) || '%')     AS com_paragrafo,
--        count(*) FILTER (WHERE voz_do_dia ~* '(maio|20[0-9][0-9])')       AS com_calendario,
--        count(*) FILTER (WHERE versiculo_texto = 'COLE_O_TEXTO_AQUI')     AS pendente,
--        count(*)                                                          AS total
--   FROM momento_kairos WHERE dia_jornada BETWEEN 121 AND 151;
