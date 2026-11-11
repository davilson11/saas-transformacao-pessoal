-- ═══════════════════════════════════════════════════════════════════════════
-- MÊS 2 — "O que me move?" · dias 32 a 59
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Gerado de scripts/reescrita-mes-02.md. Edite o .md e gere de novo — não
-- edite este arquivo à mão.
--
-- Além da reescrita, solta três dias que estavam presos ao calendário de 2026:
--   dia 32 — abria com "Janeiro te perguntou… Fevereiro vai mais fundo"
--   dia 45 — dizia "Hoje é dia 14 de fevereiro"
--   dia 59 — abria com "Fevereiro termina com uma síntese"
--
-- Numa jornada que cada pessoa começa quando quer, isso simplesmente mente.
-- Restam 36 dias no ano com o mesmo problema — ver `calendario-pendente.md`.
--
-- Os versículos dos dias 43 e 50 mudaram: ver `atualizar-mes-02-versiculos.sql`.
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

UPDATE momento_kairos SET
  voz_do_dia   = 'O mês passado perguntou quem você é. Este pergunta uma coisa mais embaraçosa: o que te põe em movimento.

Embaraçosa porque a resposta honesta quase nunca é a resposta bonita. A gente gosta de dizer propósito, chamado, família. E às vezes é. Outras vezes é medo de ficar para trás, ou a vontade de que uma pessoa específica veja.

Nenhuma dessas é vergonhosa. Todas movem. O problema é não saber qual está dirigindo.

Paulo escreve aos filipenses que é Deus quem opera neles tanto o querer quanto o realizar. Repare na ordem: o querer vem primeiro. Antes de qualquer disciplina, existe um desejo — e vale descobrir de quem ele é.',
  missao       = 'Complete sem pensar muito: "Quando eu penso em ______, acende alguma coisa em mim que eu não consigo explicar direito." Escreva tudo que vier. Não edite nada hoje.',
  missao_fase1 = 'Complete sem pensar muito: "Quando eu penso em ______, acende alguma coisa em mim que eu não consigo explicar direito." Escreva tudo que vier. Não edite nada hoje.',
  missao_fase2 = 'Complete sem pensar muito: "Quando eu penso em ______, acende alguma coisa em mim que eu não consigo explicar direito." Escreva tudo que vier. Não edite nada hoje.',
  missao_fase3 = 'Complete sem pensar muito: "Quando eu penso em ______, acende alguma coisa em mim que eu não consigo explicar direito." Escreva tudo que vier. Não edite nada hoje.',
  missao_fase4 = 'Complete sem pensar muito: "Quando eu penso em ______, acende alguma coisa em mim que eu não consigo explicar direito." Escreva tudo que vier. Não edite nada hoje.'
WHERE dia_jornada = 32;

UPDATE momento_kairos SET
  voz_do_dia   = 'Motivação é empurrão. Inspiração é atração.

Uma você precisa fabricar quando não quer; a outra chega sem pedir licença e te encontra fazendo algo às onze da noite sem notar a hora.

Jesus disse a Nicodemos que o vento sopra onde quer: você ouve o som, mas não sabe de onde vem nem para onde vai. É uma descrição ruim de disciplina e uma descrição ótima daquilo que te puxa.

Quem depende só de empurrão acorda todo dia tendo que se convencer de novo.',
  missao       = 'Hoje não escreva nada. Só repare: em que momento do dia você perdeu a noção do tempo? Pode ter sido cinco minutos. Guarde o momento até amanhã.',
  missao_fase1 = 'Hoje não escreva nada. Só repare: em que momento do dia você perdeu a noção do tempo? Pode ter sido cinco minutos. Guarde o momento até amanhã.',
  missao_fase2 = 'Hoje não escreva nada. Só repare: em que momento do dia você perdeu a noção do tempo? Pode ter sido cinco minutos. Guarde o momento até amanhã.',
  missao_fase3 = 'Hoje não escreva nada. Só repare: em que momento do dia você perdeu a noção do tempo? Pode ter sido cinco minutos. Guarde o momento até amanhã.',
  missao_fase4 = 'Hoje não escreva nada. Só repare: em que momento do dia você perdeu a noção do tempo? Pode ter sido cinco minutos. Guarde o momento até amanhã.'
WHERE dia_jornada = 33;

UPDATE momento_kairos SET
  voz_do_dia   = 'Jesus entrou no templo, viu as mesas de câmbio e os vendedores de pombas, fez um chicote de cordas e virou tudo.

É a cena mais desconfortável dos evangelhos para quem gosta de um Jesus sereno. E ela tem um detalhe: ele não se indignou com tudo. Passou por muita coisa errada naquela cidade sem fazer chicote nenhum. Foi aquilo ali.

Indignação é seletiva, e a seleção diz mais sobre você do que sobre o mundo. Existe uma injustiça específica que te tira do sério enquanto gente boa passa ao lado sem ver.

Por que justo essa?',
  missao       = 'Escreva três coisas — no trabalho, na família, na cidade — que te indignam de verdade. Ao lado de cada uma: você já fez alguma coisa a respeito, ou só sentiu?',
  missao_fase1 = 'Escreva três coisas — no trabalho, na família, na cidade — que te indignam de verdade. Ao lado de cada uma: você já fez alguma coisa a respeito, ou só sentiu?',
  missao_fase2 = 'Escreva três coisas — no trabalho, na família, na cidade — que te indignam de verdade. Ao lado de cada uma: você já fez alguma coisa a respeito, ou só sentiu?',
  missao_fase3 = 'Escreva três coisas — no trabalho, na família, na cidade — que te indignam de verdade. Ao lado de cada uma: você já fez alguma coisa a respeito, ou só sentiu?',
  missao_fase4 = 'Escreva três coisas — no trabalho, na família, na cidade — que te indignam de verdade. Ao lado de cada uma: você já fez alguma coisa a respeito, ou só sentiu?'
WHERE dia_jornada = 34;

UPDATE momento_kairos SET
  voz_do_dia   = 'Na parábola dos talentos, o terceiro servo devolve exatamente o que recebeu. E explica por quê: *tive medo, e fui esconder na terra.*

Ele não roubou nem gastou. Preservou. Pela lógica dele, fez a coisa mais responsável possível — e é essa a parte incômoda, porque medo quase sempre se apresenta como prudência.

Medo move. Move muito. Só que a direção do medo é sempre *para longe de*, nunca *em direção a*. Dá para passar a vida inteira em movimento e nunca escolher um destino.',
  missao       = 'Escolha uma decisão que você vem adiando. Escreva a razão que você dá aos outros. Depois escreva, embaixo, a razão de verdade. Às vezes são a mesma. Às vezes não.',
  missao_fase1 = 'Escolha uma decisão que você vem adiando. Escreva a razão que você dá aos outros. Depois escreva, embaixo, a razão de verdade. Às vezes são a mesma. Às vezes não.',
  missao_fase2 = 'Escolha uma decisão que você vem adiando. Escreva a razão que você dá aos outros. Depois escreva, embaixo, a razão de verdade. Às vezes são a mesma. Às vezes não.',
  missao_fase3 = 'Escolha uma decisão que você vem adiando. Escreva a razão que você dá aos outros. Depois escreva, embaixo, a razão de verdade. Às vezes são a mesma. Às vezes não.',
  missao_fase4 = 'Escolha uma decisão que você vem adiando. Escreva a razão que você dá aos outros. Depois escreva, embaixo, a razão de verdade. Às vezes são a mesma. Às vezes não.'
WHERE dia_jornada = 35;

UPDATE momento_kairos SET
  voz_do_dia   = 'Paulo escreve que dá para falar as línguas dos homens e dos anjos e, sem amor, não passar de metal que ressoa.

Metal que ressoa é barulho de oficina. É a imagem mais seca que ele poderia ter escolhido para descrever competência sem afeto.

Tem áreas da sua vida que você mantém funcionando por obrigação ou aparência. Elas até entregam resultado. Só não produzem nada em você.',
  missao       = 'Hoje, faça uma coisa pequena e concreta por alguém — e escolha alguém de uma área que você anda tocando no automático. Não precisa anunciar nem explicar.',
  missao_fase1 = 'Hoje, faça uma coisa pequena e concreta por alguém — e escolha alguém de uma área que você anda tocando no automático. Não precisa anunciar nem explicar.',
  missao_fase2 = 'Hoje, faça uma coisa pequena e concreta por alguém — e escolha alguém de uma área que você anda tocando no automático. Não precisa anunciar nem explicar.',
  missao_fase3 = 'Hoje, faça uma coisa pequena e concreta por alguém — e escolha alguém de uma área que você anda tocando no automático. Não precisa anunciar nem explicar.',
  missao_fase4 = 'Hoje, faça uma coisa pequena e concreta por alguém — e escolha alguém de uma área que você anda tocando no automático. Não precisa anunciar nem explicar.'
WHERE dia_jornada = 36;

UPDATE momento_kairos SET
  voz_do_dia   = 'No meio das instruções sobre o tabernáculo, o texto para e dá nome a um homem: Bezalel. Diz que Deus o encheu do Espírito em sabedoria, entendimento e conhecimento — para trabalhar ouro, prata e bronze, lapidar pedra e entalhar madeira.

É a primeira vez na Bíblia que alguém é descrito como cheio do Espírito. Não um profeta. Um artesão.

Existe algo que sai fácil de você e difícil da maioria. Você costuma descontar isso, porque é fácil — e a gente acha que só vale o que custou.',
  missao       = 'Liste o que você entrega com facilidade e que os outros acham difícil. Não minimize nenhum item. Depois marque: quais desses você está usando de fato hoje?',
  missao_fase1 = 'Liste o que você entrega com facilidade e que os outros acham difícil. Não minimize nenhum item. Depois marque: quais desses você está usando de fato hoje?',
  missao_fase2 = 'Liste o que você entrega com facilidade e que os outros acham difícil. Não minimize nenhum item. Depois marque: quais desses você está usando de fato hoje?',
  missao_fase3 = 'Liste o que você entrega com facilidade e que os outros acham difícil. Não minimize nenhum item. Depois marque: quais desses você está usando de fato hoje?',
  missao_fase4 = 'Liste o que você entrega com facilidade e que os outros acham difícil. Não minimize nenhum item. Depois marque: quais desses você está usando de fato hoje?'
WHERE dia_jornada = 37;

UPDATE momento_kairos SET
  voz_do_dia   = 'Tem uma pergunta que a gente evita porque a resposta dá trabalho: o que te trouxe até aqui serve para o que vem?

Motivação envelhece. O que movia você aos vinte pode ser pequeno demais agora — ou pode ter sido ótimo e já ter cumprido a função, como aquele carro que levou a família a lugares importantes e hoje não sai da garagem.

Não é traição trocar de motor. É manutenção.

O seu ainda dá conta do caminho que vem pela frente?',
  missao       = 'Escreva as três coisas que mais te movem hoje. Para cada uma: se o resultado já estivesse garantido, sem ninguém ficar sabendo, você ainda faria?',
  missao_fase1 = 'Escreva as três coisas que mais te movem hoje. Para cada uma: se o resultado já estivesse garantido, sem ninguém ficar sabendo, você ainda faria?',
  missao_fase2 = 'Escreva as três coisas que mais te movem hoje. Para cada uma: se o resultado já estivesse garantido, sem ninguém ficar sabendo, você ainda faria?',
  missao_fase3 = 'Escreva as três coisas que mais te movem hoje. Para cada uma: se o resultado já estivesse garantido, sem ninguém ficar sabendo, você ainda faria?',
  missao_fase4 = 'Escreva as três coisas que mais te movem hoje. Para cada uma: se o resultado já estivesse garantido, sem ninguém ficar sabendo, você ainda faria?'
WHERE dia_jornada = 38;

UPDATE momento_kairos SET
  voz_do_dia   = 'Marta estava fazendo tudo certo. Recebeu Jesus em casa, cuidou do serviço, ocupou-se com muita coisa — o texto usa essa palavra, *ocupada*. E então reclamou da irmã que estava sentada ouvindo.

A resposta não foi sobre louça. Foi: você anda inquieta e preocupada com muitas coisas.

Existe um movimento que parece produtividade e é fuga. A agenda cheia protege de uma pergunta que só aparece no silêncio — e às vezes a pergunta é se o que você está perseguindo vale o preço.',
  missao       = 'Cancele ou adie hoje uma tarefa não urgente. Fique vinte minutos sem preencher o espaço — sem celular, sem podcast, sem TV. Repare no que aparece quando não tem o que fazer.',
  missao_fase1 = 'Cancele ou adie hoje uma tarefa não urgente. Fique vinte minutos sem preencher o espaço — sem celular, sem podcast, sem TV. Repare no que aparece quando não tem o que fazer.',
  missao_fase2 = 'Cancele ou adie hoje uma tarefa não urgente. Fique vinte minutos sem preencher o espaço — sem celular, sem podcast, sem TV. Repare no que aparece quando não tem o que fazer.',
  missao_fase3 = 'Cancele ou adie hoje uma tarefa não urgente. Fique vinte minutos sem preencher o espaço — sem celular, sem podcast, sem TV. Repare no que aparece quando não tem o que fazer.',
  missao_fase4 = 'Cancele ou adie hoje uma tarefa não urgente. Fique vinte minutos sem preencher o espaço — sem celular, sem podcast, sem TV. Repare no que aparece quando não tem o que fazer.'
WHERE dia_jornada = 39;

UPDATE momento_kairos SET
  voz_do_dia   = 'Pilatos examinou o caso e concluiu que não havia culpa. Disse isso em voz alta, mais de uma vez.

Depois olhou para a multidão, viu que o tumulto aumentava, pediu uma bacia e lavou as mãos na frente de todos. O gesto não mudou nada do que ele decidiu em seguida. Só serviu para ele não se sentir o autor.

Quem é movido por aprovação entrega a direção da própria vida para gente que não responde por ela depois.',
  missao       = 'Identifique uma coisa que você está adiando porque precisa que alguém aprove antes. Escreva quem é essa pessoa. Depois escreva o que acontece, na prática, se ela não aprovar.',
  missao_fase1 = 'Identifique uma coisa que você está adiando porque precisa que alguém aprove antes. Escreva quem é essa pessoa. Depois escreva o que acontece, na prática, se ela não aprovar.',
  missao_fase2 = 'Identifique uma coisa que você está adiando porque precisa que alguém aprove antes. Escreva quem é essa pessoa. Depois escreva o que acontece, na prática, se ela não aprovar.',
  missao_fase3 = 'Identifique uma coisa que você está adiando porque precisa que alguém aprove antes. Escreva quem é essa pessoa. Depois escreva o que acontece, na prática, se ela não aprovar.',
  missao_fase4 = 'Identifique uma coisa que você está adiando porque precisa que alguém aprove antes. Escreva quem é essa pessoa. Depois escreva o que acontece, na prática, se ela não aprovar.'
WHERE dia_jornada = 40;

UPDATE momento_kairos SET
  voz_do_dia   = 'Não os sonhos de dormir. Os que você tem acordado, no trânsito, e descarta como bobagem.

A marca deles é a insistência. Você já concluiu que não é possível, já explicou para si mesmo por que não dá — e três meses depois ele está de volta, igualzinho.

Joel escreve sobre um tempo em que o Espírito seria derramado e os jovens teriam visões, os velhos sonhariam sonhos. Vale como critério: o que insiste em voltar merece pelo menos ser escrito antes de ser descartado de novo.',
  missao       = 'Escreva um sonho seu daqui a cinco anos — específico, com cheiro e som. Onde você está, o que faz, com quem. Não o plano. O sonho.',
  missao_fase1 = 'Escreva um sonho seu daqui a cinco anos — específico, com cheiro e som. Onde você está, o que faz, com quem. Não o plano. O sonho.',
  missao_fase2 = 'Escreva um sonho seu daqui a cinco anos — específico, com cheiro e som. Onde você está, o que faz, com quem. Não o plano. O sonho.',
  missao_fase3 = 'Escreva um sonho seu daqui a cinco anos — específico, com cheiro e som. Onde você está, o que faz, com quem. Não o plano. O sonho.',
  missao_fase4 = 'Escreva um sonho seu daqui a cinco anos — específico, com cheiro e som. Onde você está, o que faz, com quem. Não o plano. O sonho.'
WHERE dia_jornada = 41;

UPDATE momento_kairos SET
  voz_do_dia   = 'Gratidão genérica não move ninguém. "Sou grato pela saúde" é uma frase que a gente diz e esquece no mesmo minuto.

O que funciona é o detalhe: a frase exata que alguém te disse na terça e que você levou para casa. O fato de a conta ter fechado esse mês. O cheiro da cozinha quando você chegou.

Detalhe é difícil de falsificar. Por isso ele prova que você estava presente.',
  missao       = 'Escreva dez coisas específicas pelas quais você é grato hoje. Nenhuma pode ser uma categoria — precisa ser um episódio, com dia e lugar.',
  missao_fase1 = 'Escreva dez coisas específicas pelas quais você é grato hoje. Nenhuma pode ser uma categoria — precisa ser um episódio, com dia e lugar.',
  missao_fase2 = 'Escreva dez coisas específicas pelas quais você é grato hoje. Nenhuma pode ser uma categoria — precisa ser um episódio, com dia e lugar.',
  missao_fase3 = 'Escreva dez coisas específicas pelas quais você é grato hoje. Nenhuma pode ser uma categoria — precisa ser um episódio, com dia e lugar.',
  missao_fase4 = 'Escreva dez coisas específicas pelas quais você é grato hoje. Nenhuma pode ser uma categoria — precisa ser um episódio, com dia e lugar.'
WHERE dia_jornada = 42;

UPDATE momento_kairos SET
  voz_do_dia   = 'Dois homens voltavam para casa derrotados. Um estranho se juntou à caminhada e conversou com eles o caminho inteiro.

Só reconheceram quem era depois, quando ele já tinha ido embora. E a frase que disseram um ao outro não foi sobre o argumento nem sobre a explicação: *não ardia o nosso coração enquanto ele nos falava pelo caminho?*

O corpo soube antes da cabeça.

Algumas conversas te deixam mais vivo e outras te esvaziam, e isso não é sobre as pessoas — é sobre o assunto. Onde você fala mais rápido do que pensa, tem alguma coisa sua ali.',
  missao       = 'Hoje é dia de reparar, não de registrar. Em cada conversa, note: acendeu ou esvaziou? Qual era o assunto? Anote uma linha só, no fim do dia.',
  missao_fase1 = 'Hoje é dia de reparar, não de registrar. Em cada conversa, note: acendeu ou esvaziou? Qual era o assunto? Anote uma linha só, no fim do dia.',
  missao_fase2 = 'Hoje é dia de reparar, não de registrar. Em cada conversa, note: acendeu ou esvaziou? Qual era o assunto? Anote uma linha só, no fim do dia.',
  missao_fase3 = 'Hoje é dia de reparar, não de registrar. Em cada conversa, note: acendeu ou esvaziou? Qual era o assunto? Anote uma linha só, no fim do dia.',
  missao_fase4 = 'Hoje é dia de reparar, não de registrar. Em cada conversa, note: acendeu ou esvaziou? Qual era o assunto? Anote uma linha só, no fim do dia.'
WHERE dia_jornada = 43;

UPDATE momento_kairos SET
  voz_do_dia   = 'Visão te move em direção a alguma coisa. Reatividade te move para longe de alguma coisa.

Vistos de fora, os dois parecem iguais: pessoa ocupada, dia cheio, muita coisa resolvida. A diferença não aparece no esforço — aparece quando você pergunta para onde.

Quem é movido por reação passa a vida respondendo ao que apareceu: o problema urgente, a crise, a demanda de quem gritou mais alto. É uma vida inteira de competência sem destino.

Para onde você está indo?',
  missao       = 'Escreva seu destino em uma frase. Não o que você está fazendo — onde você quer chegar. Se não couber em uma frase, não force: essa dificuldade é a informação do dia.',
  missao_fase1 = 'Escreva seu destino em uma frase. Não o que você está fazendo — onde você quer chegar. Se não couber em uma frase, não force: essa dificuldade é a informação do dia.',
  missao_fase2 = 'Escreva seu destino em uma frase. Não o que você está fazendo — onde você quer chegar. Se não couber em uma frase, não force: essa dificuldade é a informação do dia.',
  missao_fase3 = 'Escreva seu destino em uma frase. Não o que você está fazendo — onde você quer chegar. Se não couber em uma frase, não force: essa dificuldade é a informação do dia.',
  missao_fase4 = 'Escreva seu destino em uma frase. Não o que você está fazendo — onde você quer chegar. Se não couber em uma frase, não force: essa dificuldade é a informação do dia.'
WHERE dia_jornada = 44;

UPDATE momento_kairos SET
  voz_do_dia   = 'Amor costuma ser tratado como sentimento, e sentimento vai e vem.

Paulo descreve de outro jeito: tudo sofre, tudo crê, tudo espera, tudo suporta. São quatro verbos. Nenhum deles é emoção — todos são comportamento sob pressão.

Isso muda o que dá para cobrar de si mesmo. Você não controla o que sente por alguém numa terça difícil. Controla o que faz.',
  missao       = 'Escreva o nome de três pessoas que são afetadas pelo que você faz. Hoje, faça uma coisa concreta pensando especificamente em uma delas — e não conte para ela que foi de propósito.',
  missao_fase1 = 'Escreva o nome de três pessoas que são afetadas pelo que você faz. Hoje, faça uma coisa concreta pensando especificamente em uma delas — e não conte para ela que foi de propósito.',
  missao_fase2 = 'Escreva o nome de três pessoas que são afetadas pelo que você faz. Hoje, faça uma coisa concreta pensando especificamente em uma delas — e não conte para ela que foi de propósito.',
  missao_fase3 = 'Escreva o nome de três pessoas que são afetadas pelo que você faz. Hoje, faça uma coisa concreta pensando especificamente em uma delas — e não conte para ela que foi de propósito.',
  missao_fase4 = 'Escreva o nome de três pessoas que são afetadas pelo que você faz. Hoje, faça uma coisa concreta pensando especificamente em uma delas — e não conte para ela que foi de propósito.'
WHERE dia_jornada = 45;

UPDATE momento_kairos SET
  voz_do_dia   = 'Quinze dias perguntando o que te move.

A pergunta que fecha a primeira metade é outra, e é mais difícil: o que você descobriu que *fingia* te mover?

Motivação emprestada é confortável porque vem pronta e com aprovação embutida. O sonho que era do seu pai. A expectativa da sua igreja. A definição de sucesso que você absorveu sem nunca ter examinado.

Devolver uma dessas não é ingratidão. É inventário.',
  missao       = 'Releia o que você escreveu nestes quinze dias, tudo de uma vez. Depois escreva duas linhas: uma motivação que é genuinamente sua, e uma que você percebeu que é herdada.',
  missao_fase1 = 'Releia o que você escreveu nestes quinze dias, tudo de uma vez. Depois escreva duas linhas: uma motivação que é genuinamente sua, e uma que você percebeu que é herdada.',
  missao_fase2 = 'Releia o que você escreveu nestes quinze dias, tudo de uma vez. Depois escreva duas linhas: uma motivação que é genuinamente sua, e uma que você percebeu que é herdada.',
  missao_fase3 = 'Releia o que você escreveu nestes quinze dias, tudo de uma vez. Depois escreva duas linhas: uma motivação que é genuinamente sua, e uma que você percebeu que é herdada.',
  missao_fase4 = 'Releia o que você escreveu nestes quinze dias, tudo de uma vez. Depois escreva duas linhas: uma motivação que é genuinamente sua, e uma que você percebeu que é herdada.'
WHERE dia_jornada = 46;

UPDATE momento_kairos SET
  voz_do_dia   = 'Legado não é a frase bonita que você gostaria no discurso. É o que sobra de você na cabeça de quem conviveu.

E a parte incômoda: já está sendo construído. Não começa quando você decidir — está sendo escrito pelas suas semanas comuns, pelo jeito que você responde quando está cansado, pelo que você faz quando ninguém depende daquilo.

Provérbios fala do homem de bem que deixa herança aos filhos dos filhos. Herança ali não é só dinheiro. É tudo que atravessa.',
  missao       = 'Escreva uma frase: "Quero ser lembrado como alguém que…" Não corrija pela humildade. Escreva o que de fato importa para você.',
  missao_fase1 = 'Escreva uma frase: "Quero ser lembrado como alguém que…" Não corrija pela humildade. Escreva o que de fato importa para você.',
  missao_fase2 = 'Escreva uma frase: "Quero ser lembrado como alguém que…" Não corrija pela humildade. Escreva o que de fato importa para você.',
  missao_fase3 = 'Escreva uma frase: "Quero ser lembrado como alguém que…" Não corrija pela humildade. Escreva o que de fato importa para você.',
  missao_fase4 = 'Escreva uma frase: "Quero ser lembrado como alguém que…" Não corrija pela humildade. Escreva o que de fato importa para você.'
WHERE dia_jornada = 47;

UPDATE momento_kairos SET
  voz_do_dia   = 'Elias tinha acabado de vencer. Fogo do céu, profetas de Baal derrotados, o maior dia da carreira dele.

No dia seguinte estava fugindo pelo deserto, sentou debaixo de um arbusto e pediu para morrer.

O que veio não foi repreensão nem sermão. Um anjo tocou nele e disse: levanta e come. Ele comeu, bebeu e dormiu. Depois o anjo voltou e fez de novo — *porque o caminho é longo demais para ti.*

Pão, água e sono antes de qualquer conversa sobre propósito. Às vezes o que parece crise de fé é só um corpo que não dorme há semanas.',
  missao       = 'Dê uma nota de 1 a 10 para sua energia real dos últimos sete dias. Se for abaixo de 6, escreva a fonte principal do esgotamento — e uma coisa que você pode tirar esta semana.',
  missao_fase1 = 'Dê uma nota de 1 a 10 para sua energia real dos últimos sete dias. Se for abaixo de 6, escreva a fonte principal do esgotamento — e uma coisa que você pode tirar esta semana.',
  missao_fase2 = 'Dê uma nota de 1 a 10 para sua energia real dos últimos sete dias. Se for abaixo de 6, escreva a fonte principal do esgotamento — e uma coisa que você pode tirar esta semana.',
  missao_fase3 = 'Dê uma nota de 1 a 10 para sua energia real dos últimos sete dias. Se for abaixo de 6, escreva a fonte principal do esgotamento — e uma coisa que você pode tirar esta semana.',
  missao_fase4 = 'Dê uma nota de 1 a 10 para sua energia real dos últimos sete dias. Se for abaixo de 6, escreva a fonte principal do esgotamento — e uma coisa que você pode tirar esta semana.'
WHERE dia_jornada = 48;

UPDATE momento_kairos SET
  voz_do_dia   = 'Tem gente de quem você sai maior do que entrou.

Não é sobre elogio. É que perto de certas pessoas você pensa melhor, arrisca uma ideia que ainda não está pronta, fala de um plano sem já ir se defendendo.

Isso é raro, e a gente trata como se fosse abundante. Passam anos sem ligar para quem faz esse efeito.',
  missao       = 'Pense em uma pessoa que te expande. Entre em contato hoje — mensagem, ligação, o que for. Sem pauta, sem pedido. Só diga que lembrou dela.',
  missao_fase1 = 'Pense em uma pessoa que te expande. Entre em contato hoje — mensagem, ligação, o que for. Sem pauta, sem pedido. Só diga que lembrou dela.',
  missao_fase2 = 'Pense em uma pessoa que te expande. Entre em contato hoje — mensagem, ligação, o que for. Sem pauta, sem pedido. Só diga que lembrou dela.',
  missao_fase3 = 'Pense em uma pessoa que te expande. Entre em contato hoje — mensagem, ligação, o que for. Sem pauta, sem pedido. Só diga que lembrou dela.',
  missao_fase4 = 'Pense em uma pessoa que te expande. Entre em contato hoje — mensagem, ligação, o que for. Sem pauta, sem pedido. Só diga que lembrou dela.'
WHERE dia_jornada = 49;

UPDATE momento_kairos SET
  voz_do_dia   = 'Ester tinha tudo a perder e uma lei contra ela: quem se aproximasse do rei sem ser chamado morria, a menos que ele estendesse o cetro.

Mordecai mandou o recado que decidiu a história: quem sabe se não foi para um tempo como este que chegaste ao reino?

Repare no que ele não disse. Não disse que ela era a mais corajosa, nem a mais preparada. Disse que ela estava no lugar certo, na hora certa, com o acesso certo.

Você também está em algum lugar específico, com alguma história específica e algum acesso que outros não têm. Para qual problema, exatamente?',
  missao       = 'Complete: "O problema que eu sinto que fui feito para ajudar a resolver é…" Seja específico. Não "ajudar pessoas" — quais pessoas, com o quê.',
  missao_fase1 = 'Complete: "O problema que eu sinto que fui feito para ajudar a resolver é…" Seja específico. Não "ajudar pessoas" — quais pessoas, com o quê.',
  missao_fase2 = 'Complete: "O problema que eu sinto que fui feito para ajudar a resolver é…" Seja específico. Não "ajudar pessoas" — quais pessoas, com o quê.',
  missao_fase3 = 'Complete: "O problema que eu sinto que fui feito para ajudar a resolver é…" Seja específico. Não "ajudar pessoas" — quais pessoas, com o quê.',
  missao_fase4 = 'Complete: "O problema que eu sinto que fui feito para ajudar a resolver é…" Seja específico. Não "ajudar pessoas" — quais pessoas, com o quê.'
WHERE dia_jornada = 50;

UPDATE momento_kairos SET
  voz_do_dia   = 'Quanto mais claro o propósito, mais barato fica dizer não.

E é por isso que gente sem clareza vive sobrecarregada: sem um critério, todo pedido parece legítimo, e dizer não exige justificativa toda vez. Com critério, a resposta sai sozinha.

O resultado de não ter critério é uma vida espalhada — muita coisa feita razoavelmente, nada feito de verdade.',
  missao       = 'Hoje é dia de tirar. Liste tudo que você está carregando agora. Marque o que não está alinhado com nada do que você descobriu neste mês. Escolha um e saia. Avise hoje.',
  missao_fase1 = 'Hoje é dia de tirar. Liste tudo que você está carregando agora. Marque o que não está alinhado com nada do que você descobriu neste mês. Escolha um e saia. Avise hoje.',
  missao_fase2 = 'Hoje é dia de tirar. Liste tudo que você está carregando agora. Marque o que não está alinhado com nada do que você descobriu neste mês. Escolha um e saia. Avise hoje.',
  missao_fase3 = 'Hoje é dia de tirar. Liste tudo que você está carregando agora. Marque o que não está alinhado com nada do que você descobriu neste mês. Escolha um e saia. Avise hoje.',
  missao_fase4 = 'Hoje é dia de tirar. Liste tudo que você está carregando agora. Marque o que não está alinhado com nada do que você descobriu neste mês. Escolha um e saia. Avise hoje.'
WHERE dia_jornada = 51;

UPDATE momento_kairos SET
  voz_do_dia   = 'Paulo escreve uma frase estranha aos coríntios: Deus nos consola nas nossas tribulações para que possamos consolar os que estão em qualquer angústia — com o consolo que nós mesmos recebemos.

Com o mesmo. Não com um consolo genérico, aprendido em livro. Com aquele exato que funcionou em você.

Isso dá um destino para o que você passou e não escolheu. Quem viveu determinada dor alcança quem está nela de um jeito que ninguém de fora alcança — e a credencial não é diploma, é cicatriz.',
  missao       = 'Pense numa dor que te formou. Escreva: o que, naquele período, alguém fez ou disse que realmente ajudou? Essa é a coisa que você tem para dar.',
  missao_fase1 = 'Pense numa dor que te formou. Escreva: o que, naquele período, alguém fez ou disse que realmente ajudou? Essa é a coisa que você tem para dar.',
  missao_fase2 = 'Pense numa dor que te formou. Escreva: o que, naquele período, alguém fez ou disse que realmente ajudou? Essa é a coisa que você tem para dar.',
  missao_fase3 = 'Pense numa dor que te formou. Escreva: o que, naquele período, alguém fez ou disse que realmente ajudou? Essa é a coisa que você tem para dar.',
  missao_fase4 = 'Pense numa dor que te formou. Escreva: o que, naquele período, alguém fez ou disse que realmente ajudou? Essa é a coisa que você tem para dar.'
WHERE dia_jornada = 52;

UPDATE momento_kairos SET
  voz_do_dia   = 'A carta aos Hebreus descreve uma arena: uma multidão de testemunhas nas arquibancadas, e a instrução de largar o peso que atrasa e correr com perseverança.

Repare que não é corrida de velocidade. É resistência — e resistência tem um trecho específico que mata.

Não é o começo, onde tudo é novidade. Não é o fim, onde a linha de chegada já puxa. É o meio: a animação acabou e o resultado não apareceu. É ali que a maioria desiste, e é ali que a coisa é decidida.',
  missao       = 'Pense num projeto seu que está no meio. Escreva por que você começou — e depois escreva se essa razão ainda está de pé.',
  missao_fase1 = 'Pense num projeto seu que está no meio. Escreva por que você começou — e depois escreva se essa razão ainda está de pé.',
  missao_fase2 = 'Pense num projeto seu que está no meio. Escreva por que você começou — e depois escreva se essa razão ainda está de pé.',
  missao_fase3 = 'Pense num projeto seu que está no meio. Escreva por que você começou — e depois escreva se essa razão ainda está de pé.',
  missao_fase4 = 'Pense num projeto seu que está no meio. Escreva por que você começou — e depois escreva se essa razão ainda está de pé.'
WHERE dia_jornada = 53;

UPDATE momento_kairos SET
  voz_do_dia   = 'Quatro homens carregaram um paralítico até a casa onde Jesus estava e não conseguiram entrar: gente demais na porta.

Então subiram no telhado e o abriram. Cavaram a cobertura de uma casa que não era deles, com o dono provavelmente ali dentro, e desceram o amigo pelo buraco no meio da sala.

O texto diz que Jesus *viu a fé deles*. Não ouviu — viu. A fé que ele viu tinha formato de telhado quebrado.

O que você está esperando ter mais certeza para fazer?',
  missao       = 'Identifique um passo que você sabe que deve dar e está adiando por falta de certeza. Escreva que evidência exatamente você está esperando — e se ela é obtível antes de dar o passo.',
  missao_fase1 = 'Identifique um passo que você sabe que deve dar e está adiando por falta de certeza. Escreva que evidência exatamente você está esperando — e se ela é obtível antes de dar o passo.',
  missao_fase2 = 'Identifique um passo que você sabe que deve dar e está adiando por falta de certeza. Escreva que evidência exatamente você está esperando — e se ela é obtível antes de dar o passo.',
  missao_fase3 = 'Identifique um passo que você sabe que deve dar e está adiando por falta de certeza. Escreva que evidência exatamente você está esperando — e se ela é obtível antes de dar o passo.',
  missao_fase4 = 'Identifique um passo que você sabe que deve dar e está adiando por falta de certeza. Escreva que evidência exatamente você está esperando — e se ela é obtível antes de dar o passo.'
WHERE dia_jornada = 54;

UPDATE momento_kairos SET
  voz_do_dia   = 'Tem momentos em que você olha para o que saiu e sabe que não foi só você.

Uma conversa que foi muito além do que você tinha preparado. Uma solução que apareceu inteira. Uma frase que você disse e que acertou alguém num ponto que você não sabia que existia.

Não é euforia religiosa. É a experiência comum de entregar mais do que você tinha.',
  missao       = 'Lembre de um momento recente assim. Escreva o que aconteceu e o que você estava fazendo pouco antes. Às vezes dá para identificar as condições.',
  missao_fase1 = 'Lembre de um momento recente assim. Escreva o que aconteceu e o que você estava fazendo pouco antes. Às vezes dá para identificar as condições.',
  missao_fase2 = 'Lembre de um momento recente assim. Escreva o que aconteceu e o que você estava fazendo pouco antes. Às vezes dá para identificar as condições.',
  missao_fase3 = 'Lembre de um momento recente assim. Escreva o que aconteceu e o que você estava fazendo pouco antes. Às vezes dá para identificar as condições.',
  missao_fase4 = 'Lembre de um momento recente assim. Escreva o que aconteceu e o que você estava fazendo pouco antes. Às vezes dá para identificar as condições.'
WHERE dia_jornada = 55;

UPDATE momento_kairos SET
  voz_do_dia   = 'Vai ter dia em que você não vai sentir nada.

O trabalho que te dá prazer não vai dar. O propósito que estava claro vai parecer uma frase que você decorou. Isso não é sinal de que você escolheu errado — é só como funciona qualquer sistema que depende de novidade.

O erro é decidir nesses dias. Gente desiste de coisa boa numa quinta-feira cinzenta e passa anos explicando por quê.

O que sustenta quando não se sente nada não é motivação. É ter deixado por escrito, num dia bom, a razão — para poder ler num dia ruim sem precisar senti-la de novo.',
  missao       = 'Escreva sua âncora: uma frase ou imagem de por que você faz o que faz. Curta o bastante para caber na memória. Guarde onde você encontra fácil.',
  missao_fase1 = 'Escreva sua âncora: uma frase ou imagem de por que você faz o que faz. Curta o bastante para caber na memória. Guarde onde você encontra fácil.',
  missao_fase2 = 'Escreva sua âncora: uma frase ou imagem de por que você faz o que faz. Curta o bastante para caber na memória. Guarde onde você encontra fácil.',
  missao_fase3 = 'Escreva sua âncora: uma frase ou imagem de por que você faz o que faz. Curta o bastante para caber na memória. Guarde onde você encontra fácil.',
  missao_fase4 = 'Escreva sua âncora: uma frase ou imagem de por que você faz o que faz. Curta o bastante para caber na memória. Guarde onde você encontra fácil.'
WHERE dia_jornada = 56;

UPDATE momento_kairos SET
  voz_do_dia   = 'Quando Esdras leu a lei em voz alta depois do exílio, o povo começou a chorar. Fazia sentido chorar: tinham acabado de ouvir o tamanho da distância entre o que deviam ser e o que eram.

E a instrução que veio foi inesperada. Não foi arrependam-se mais. Foi: comam carne gorda, bebam coisa doce, mandem porções a quem não tem — *porque a alegria do Senhor é a vossa força.*

Celebrar não é prêmio para quando terminar. É parte do combustível, e quem opera sempre em déficit acaba parando por falta dele.',
  missao       = 'Escreva três conquistas das últimas quatro semanas, mesmo pequenas. Para cada uma, escreva o que ela custou. Depois faça alguma coisa hoje que marque pelo menos uma.',
  missao_fase1 = 'Escreva três conquistas das últimas quatro semanas, mesmo pequenas. Para cada uma, escreva o que ela custou. Depois faça alguma coisa hoje que marque pelo menos uma.',
  missao_fase2 = 'Escreva três conquistas das últimas quatro semanas, mesmo pequenas. Para cada uma, escreva o que ela custou. Depois faça alguma coisa hoje que marque pelo menos uma.',
  missao_fase3 = 'Escreva três conquistas das últimas quatro semanas, mesmo pequenas. Para cada uma, escreva o que ela custou. Depois faça alguma coisa hoje que marque pelo menos uma.',
  missao_fase4 = 'Escreva três conquistas das últimas quatro semanas, mesmo pequenas. Para cada uma, escreva o que ela custou. Depois faça alguma coisa hoje que marque pelo menos uma.'
WHERE dia_jornada = 57;

UPDATE momento_kairos SET
  voz_do_dia   = 'Abraão tinha quase cem anos quando a promessa de um filho ainda estava de pé. Paulo descreve isso com uma expressão que não faz sentido lógico: ele esperou contra a esperança.

Não é otimismo. Otimismo acha que vai dar certo. Esperança continua apostando depois de já ter calculado que, pela conta, não deveria dar.

É o combustível menos ensinado e o que mais sustenta trecho longo.',
  missao       = 'Escreva algo que você está esperando e que ainda não chegou. Não como pedido — como declaração. Guarde com a âncora de ontem.',
  missao_fase1 = 'Escreva algo que você está esperando e que ainda não chegou. Não como pedido — como declaração. Guarde com a âncora de ontem.',
  missao_fase2 = 'Escreva algo que você está esperando e que ainda não chegou. Não como pedido — como declaração. Guarde com a âncora de ontem.',
  missao_fase3 = 'Escreva algo que você está esperando e que ainda não chegou. Não como pedido — como declaração. Guarde com a âncora de ontem.',
  missao_fase4 = 'Escreva algo que você está esperando e que ainda não chegou. Não como pedido — como declaração. Guarde com a âncora de ontem.'
WHERE dia_jornada = 58;

UPDATE momento_kairos SET
  voz_do_dia   = 'Vinte e oito dias examinando o que te move.

Você encontrou fontes de verdade e fontes falsas. Amor e medo. Visão e reação. Dom e obrigação. Provavelmente descobriu que mais de uma coisa te move ao mesmo tempo, e que elas nem sempre puxam para o mesmo lado.

Isso não é contradição. É como as pessoas funcionam.

O mês que vem muda a pergunta: sai do que te move e vai para onde isso te leva. Mas quem pula esta parte acaba construindo rápido na direção errada — e descobre tarde.',
  missao       = 'Escreva, em um parágrafo, a resposta mais honesta que você consegue hoje para "o que me move?". Inclua o que você preferia que não movesse. Guarde junto com o texto do mês 1.',
  missao_fase1 = 'Escreva, em um parágrafo, a resposta mais honesta que você consegue hoje para "o que me move?". Inclua o que você preferia que não movesse. Guarde junto com o texto do mês 1.',
  missao_fase2 = 'Escreva, em um parágrafo, a resposta mais honesta que você consegue hoje para "o que me move?". Inclua o que você preferia que não movesse. Guarde junto com o texto do mês 1.',
  missao_fase3 = 'Escreva, em um parágrafo, a resposta mais honesta que você consegue hoje para "o que me move?". Inclua o que você preferia que não movesse. Guarde junto com o texto do mês 1.',
  missao_fase4 = 'Escreva, em um parágrafo, a resposta mais honesta que você consegue hoje para "o que me move?". Inclua o que você preferia que não movesse. Guarde junto com o texto do mês 1.'
WHERE dia_jornada = 59;

COMMIT;

-- Verificação — esperado 28 · 0 · 0 · 28:
--
--   SELECT count(*) FILTER (WHERE voz_do_dia LIKE '%' || chr(10) || '%')  AS com_paragrafo,
--          count(*) FILTER (WHERE voz_do_dia ILIKE '%neurociência%')      AS com_neuro,
--          count(*) FILTER (WHERE voz_do_dia ~* '(janeiro|fevereiro|2026)') AS com_calendario,
--          count(*)                                                       AS total
--     FROM momento_kairos WHERE dia_jornada BETWEEN 32 AND 59;
