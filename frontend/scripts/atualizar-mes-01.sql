-- ═══════════════════════════════════════════════════════════════════════════
-- MÊS 1 — texto reescrito (dias 1 a 31)
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Gerado a partir de scripts/reescrita-mes-01.md. Não edite este arquivo à mão:
-- edite o .md e gere de novo, senão as duas versões divergem em silêncio.
--
-- O QUE ESTE SCRIPT FAZ
--
--   voz_do_dia      → texto novo
--   missao          → missão nova
--   missao_fase1..4 → TODAS recebem a mesma missão nova
--
-- Sobre as fases: a tabela tinha quatro missões diferentes por dia, de uma
-- geração anterior do conteúdo, e o app escolhe pela fase do usuário. Como
-- você está em fase avançada, vinha lendo `missao_fase3` — uma missão antiga,
-- de outro texto, que não conversava com a voz do dia. Era parte da sensação
-- de desencaixe. Unificando, todo mundo lê a missão que foi escrita para
-- aquele texto. Se um dia você quiser variantes por fase, elas voltam — mas
-- escritas de propósito, não herdadas.
--
-- O versículo NÃO é tocado aqui. Ver `atualizar-mes-01-versiculos.sql`.
-- ═══════════════════════════════════════════════════════════════════════════


BEGIN;

UPDATE momento_kairos SET
  voz_do_dia   = 'Se alguém te perguntar quem você é, você vai responder o que faz.

É o reflexo de todo mundo. Nome, profissão, cidade — e a conversa segue como se aquilo tivesse respondido alguma coisa. A resposta é tão automática que ninguém percebe ter respondido outra pergunta.

Deus disse a Jeremias que o conhecia antes de formá-lo no ventre. Antes de qualquer coisa que ele tivesse feito, falhado ou construído. A identidade chegou primeiro, e tudo o que Jeremias fez depois foi consequência.

A ordem importa. Quem tenta descobrir o que fazer antes de saber quem é constrói a vida inteira sobre uma resposta que nunca deu.

Você vai passar 365 dias aqui. Este é o primeiro, e traz a pergunta mais desconfortável de todas — porque não dá para responder com currículo.',
  missao       = 'Escreva uma frase: quem você acredita que é hoje. Sem editar, sem a versão apresentável. Depois escreva quem Deus diz que você é. Guarde as duas. Você vai reler no Dia 365.',
  missao_fase1 = 'Escreva uma frase: quem você acredita que é hoje. Sem editar, sem a versão apresentável. Depois escreva quem Deus diz que você é. Guarde as duas. Você vai reler no Dia 365.',
  missao_fase2 = 'Escreva uma frase: quem você acredita que é hoje. Sem editar, sem a versão apresentável. Depois escreva quem Deus diz que você é. Guarde as duas. Você vai reler no Dia 365.',
  missao_fase3 = 'Escreva uma frase: quem você acredita que é hoje. Sem editar, sem a versão apresentável. Depois escreva quem Deus diz que você é. Guarde as duas. Você vai reler no Dia 365.',
  missao_fase4 = 'Escreva uma frase: quem você acredita que é hoje. Sem editar, sem a versão apresentável. Depois escreva quem Deus diz que você é. Guarde as duas. Você vai reler no Dia 365.'
WHERE dia_jornada = 1;

UPDATE momento_kairos SET
  voz_do_dia   = 'Alguém disse uma frase sobre você quando você era criança.

Talvez num almoço de domingo, talvez no meio de uma discussão, talvez de brincadeira. Quem disse provavelmente esqueceu na mesma semana. Você não esqueceu.

Gideão estava debulhando trigo dentro de um lagar — um buraco cavado para pisar uva, não lugar de debulhar nada. Ele estava ali porque era fundo e ninguém o veria. E foi nesse buraco que o anjo chegou e o chamou de valente guerreiro.

Não havia uma única evidência disso. Gideão olhou em volta e respondeu o que qualquer um responderia: tem certeza de que é comigo?

Deus não descreveu o que estava vendo. Descreveu o que tinha colocado ali.

Enquanto você estiver operando com a frase que plantaram, vai viver defendendo uma conclusão que outra pessoa tirou sobre você — com pouca informação, num dia qualquer, há muito tempo.',
  missao       = 'Escreva uma frase que você "simplesmente sabe" que é verdade sobre você. Agora rastreie: quem disse primeiro? Em que situação? Essa pessoa tinha como saber?',
  missao_fase1 = 'Escreva uma frase que você "simplesmente sabe" que é verdade sobre você. Agora rastreie: quem disse primeiro? Em que situação? Essa pessoa tinha como saber?',
  missao_fase2 = 'Escreva uma frase que você "simplesmente sabe" que é verdade sobre você. Agora rastreie: quem disse primeiro? Em que situação? Essa pessoa tinha como saber?',
  missao_fase3 = 'Escreva uma frase que você "simplesmente sabe" que é verdade sobre você. Agora rastreie: quem disse primeiro? Em que situação? Essa pessoa tinha como saber?',
  missao_fase4 = 'Escreva uma frase que você "simplesmente sabe" que é verdade sobre você. Agora rastreie: quem disse primeiro? Em que situação? Essa pessoa tinha como saber?'
WHERE dia_jornada = 2;

UPDATE momento_kairos SET
  voz_do_dia   = 'Você pode saber de cor um versículo sobre quem você é e acordar na segunda sentindo que precisa provar alguma coisa antes das nove da manhã.

Isso não é hipocrisia. É a distância entre a cabeça e o resto do corpo.

James Pennebaker passou anos pedindo que pessoas escrevessem sobre experiências difíceis por alguns dias seguidos. O que ele encontrou nos textos de quem melhorou não foi mais emoção — foi mais causa. Palavras como *porque*, *então*, *percebi*. Quem melhorou não desabafou melhor. Narrou melhor.

É mais ou menos o que Hirtler quer dizer quando fala que a verdade precisa descer da cabeça para o coração: não é uma questão de repetir mais, é de reorganizar a história.

Conhecer sua identidade e habitá-la são duas moradas diferentes. Hoje dá para descobrir em qual você está morando.',
  missao       = 'Diga em voz alta, olhando no espelho: "Eu sou filho amado de Deus. Isso não depende do que eu fizer hoje." Repare no que acontece no corpo — o ombro que sobe, a vontade de rir, o incômodo. Escreva só isso. A resistência é o mapa.',
  missao_fase1 = 'Diga em voz alta, olhando no espelho: "Eu sou filho amado de Deus. Isso não depende do que eu fizer hoje." Repare no que acontece no corpo — o ombro que sobe, a vontade de rir, o incômodo. Escreva só isso. A resistência é o mapa.',
  missao_fase2 = 'Diga em voz alta, olhando no espelho: "Eu sou filho amado de Deus. Isso não depende do que eu fizer hoje." Repare no que acontece no corpo — o ombro que sobe, a vontade de rir, o incômodo. Escreva só isso. A resistência é o mapa.',
  missao_fase3 = 'Diga em voz alta, olhando no espelho: "Eu sou filho amado de Deus. Isso não depende do que eu fizer hoje." Repare no que acontece no corpo — o ombro que sobe, a vontade de rir, o incômodo. Escreva só isso. A resistência é o mapa.',
  missao_fase4 = 'Diga em voz alta, olhando no espelho: "Eu sou filho amado de Deus. Isso não depende do que eu fizer hoje." Repare no que acontece no corpo — o ombro que sobe, a vontade de rir, o incômodo. Escreva só isso. A resistência é o mapa.'
WHERE dia_jornada = 3;

UPDATE momento_kairos SET
  voz_do_dia   = 'Você tem trinta segundos num elevador para dizer quem é. Vai gastar os trinta falando do que faz.

Mefibosete era neto de Saul e aleijado dos dois pés desde os cinco anos. Morava em Lo-Debar, um lugar cujo nome significa mais ou menos "terra sem pasto". Era onde se escondia quem tinha sido alguém.

Davi mandou buscá-lo. Não para empregá-lo, não para cobrar nada — para que comesse à mesa do rei todos os dias, como um dos filhos. A Bíblia faz questão de registrar, no fim, que ele comia à mesa do rei e que seus pés continuavam aleijados.

Ninguém o curou. Mudaram o lugar onde ele se sentava.

A identidade que o mundo entrega é um crachá que alguém pode recolher. A que Deus entrega é um lugar à mesa, e o lugar não depende dos pés.',
  missao       = 'Hoje você não escreve nada. Só conta. Toda vez que se apresentar, explicar quem é, ou responder "e você, o que faz?", repare se a resposta foi função ou pessoa. No fim do dia, guarde só o número.',
  missao_fase1 = 'Hoje você não escreve nada. Só conta. Toda vez que se apresentar, explicar quem é, ou responder "e você, o que faz?", repare se a resposta foi função ou pessoa. No fim do dia, guarde só o número.',
  missao_fase2 = 'Hoje você não escreve nada. Só conta. Toda vez que se apresentar, explicar quem é, ou responder "e você, o que faz?", repare se a resposta foi função ou pessoa. No fim do dia, guarde só o número.',
  missao_fase3 = 'Hoje você não escreve nada. Só conta. Toda vez que se apresentar, explicar quem é, ou responder "e você, o que faz?", repare se a resposta foi função ou pessoa. No fim do dia, guarde só o número.',
  missao_fase4 = 'Hoje você não escreve nada. Só conta. Toda vez que se apresentar, explicar quem é, ou responder "e você, o que faz?", repare se a resposta foi função ou pessoa. No fim do dia, guarde só o número.'
WHERE dia_jornada = 4;

UPDATE momento_kairos SET
  voz_do_dia   = 'Entre a hora em que você acorda e a hora em que alguém te vê, existe um pedaço do dia em que você é só você.

Samuel foi a Belém ungir um rei e Jessé trouxe os filhos um por um. O mais velho era tão impressionante que o próprio Samuel se enganou. Deus o interrompeu antes que ele falasse: o homem olha o que está diante dos olhos.

Sete filhos passaram. O oitavo nem tinha sido chamado — estava no campo com as ovelhas, fazendo o que ninguém via. Foi esse.

Hábitos são identidade em câmera lenta. Cada coisa pequena que você repete sem plateia está esculpindo alguém, e esse alguém é quem vai aparecer no dia em que a pressão vier.',
  missao       = 'Nomeie um comportamento que você só tem quando está sozinho e que contradiz quem você quer ser. Um pensamento, uma reação, um hábito. Nomear, sem se condenar, já é o primeiro movimento — e hoje é só isso.',
  missao_fase1 = 'Nomeie um comportamento que você só tem quando está sozinho e que contradiz quem você quer ser. Um pensamento, uma reação, um hábito. Nomear, sem se condenar, já é o primeiro movimento — e hoje é só isso.',
  missao_fase2 = 'Nomeie um comportamento que você só tem quando está sozinho e que contradiz quem você quer ser. Um pensamento, uma reação, um hábito. Nomear, sem se condenar, já é o primeiro movimento — e hoje é só isso.',
  missao_fase3 = 'Nomeie um comportamento que você só tem quando está sozinho e que contradiz quem você quer ser. Um pensamento, uma reação, um hábito. Nomear, sem se condenar, já é o primeiro movimento — e hoje é só isso.',
  missao_fase4 = 'Nomeie um comportamento que você só tem quando está sozinho e que contradiz quem você quer ser. Um pensamento, uma reação, um hábito. Nomear, sem se condenar, já é o primeiro movimento — e hoje é só isso.'
WHERE dia_jornada = 5;

UPDATE momento_kairos SET
  voz_do_dia   = 'Há um nome seu que não é o seu problema principal.

Não é o diagnóstico, nem o apelido que pegou na escola, nem o papel que sua família distribuiu para você antes de você saber falar.

Esse nome não sai de teste de personalidade. Sai de conversa.',
  missao       = 'Separe dez minutos sem pedir nada. Uma pergunta só: "Pai, quem o Senhor diz que eu sou?" Fique no silêncio depois de perguntar — o silêncio é a parte. Escreva o que vier, inclusive se vier pouco.',
  missao_fase1 = 'Separe dez minutos sem pedir nada. Uma pergunta só: "Pai, quem o Senhor diz que eu sou?" Fique no silêncio depois de perguntar — o silêncio é a parte. Escreva o que vier, inclusive se vier pouco.',
  missao_fase2 = 'Separe dez minutos sem pedir nada. Uma pergunta só: "Pai, quem o Senhor diz que eu sou?" Fique no silêncio depois de perguntar — o silêncio é a parte. Escreva o que vier, inclusive se vier pouco.',
  missao_fase3 = 'Separe dez minutos sem pedir nada. Uma pergunta só: "Pai, quem o Senhor diz que eu sou?" Fique no silêncio depois de perguntar — o silêncio é a parte. Escreva o que vier, inclusive se vier pouco.',
  missao_fase4 = 'Separe dez minutos sem pedir nada. Uma pergunta só: "Pai, quem o Senhor diz que eu sou?" Fique no silêncio depois de perguntar — o silêncio é a parte. Escreva o que vier, inclusive se vier pouco.'
WHERE dia_jornada = 6;

UPDATE momento_kairos SET
  voz_do_dia   = 'A parte estranha não é descobrir o que precisa mudar. É que você já sabe.

Tem uma coisa que você evita há meses. Não é um mistério, não exige análise. Se eu pedisse agora, você escreveria em quinze segundos.

O que trava não é falta de informação. É que a próxima versão de você teria que largar alguma coisa confortável — e a versão atual, apesar de limitada, já aprendeu a funcionar.

Paulo escreve que somos transformados de glória em glória. Reparou que são duas? Sempre tem uma glória sendo deixada para trás. É por isso que crescer dói um pouco mesmo quando é bom.',
  missao       = 'Escreva a próxima versão de você. Não a ideal, não a de daqui a dez anos — a próxima. O que ela faz que você não faz? O que ela já parou de fazer? Guarde.',
  missao_fase1 = 'Escreva a próxima versão de você. Não a ideal, não a de daqui a dez anos — a próxima. O que ela faz que você não faz? O que ela já parou de fazer? Guarde.',
  missao_fase2 = 'Escreva a próxima versão de você. Não a ideal, não a de daqui a dez anos — a próxima. O que ela faz que você não faz? O que ela já parou de fazer? Guarde.',
  missao_fase3 = 'Escreva a próxima versão de você. Não a ideal, não a de daqui a dez anos — a próxima. O que ela faz que você não faz? O que ela já parou de fazer? Guarde.',
  missao_fase4 = 'Escreva a próxima versão de você. Não a ideal, não a de daqui a dez anos — a próxima. O que ela faz que você não faz? O que ela já parou de fazer? Guarde.'
WHERE dia_jornada = 7;

UPDATE momento_kairos SET
  voz_do_dia   = 'Com algumas pessoas você fala mais. Com outras você se ouve escolhendo as palavras antes de dizer.

Isso não é falsidade. É informação.

Jeremias descreve uma árvore plantada junto ao ribeiro: quando o calor vem, ela não sente; quando a seca chega, suas folhas continuam verdes. Não porque o tempo lá seja diferente. Porque a raiz chegou na água por baixo.

A diferença entre uma pessoa com centro e uma pessoa sem centro não aparece em dia bom. Aparece na seca — quando a aprovação some e é preciso continuar a mesma pessoa mesmo assim.',
  missao       = 'Hoje não escreva nada. Só repare: em cada conversa, qual versão sua apareceu? A expansiva, a cautelosa, a que some? Guarde a observação na cabeça até amanhã.',
  missao_fase1 = 'Hoje não escreva nada. Só repare: em cada conversa, qual versão sua apareceu? A expansiva, a cautelosa, a que some? Guarde a observação na cabeça até amanhã.',
  missao_fase2 = 'Hoje não escreva nada. Só repare: em cada conversa, qual versão sua apareceu? A expansiva, a cautelosa, a que some? Guarde a observação na cabeça até amanhã.',
  missao_fase3 = 'Hoje não escreva nada. Só repare: em cada conversa, qual versão sua apareceu? A expansiva, a cautelosa, a que some? Guarde a observação na cabeça até amanhã.',
  missao_fase4 = 'Hoje não escreva nada. Só repare: em cada conversa, qual versão sua apareceu? A expansiva, a cautelosa, a que some? Guarde a observação na cabeça até amanhã.'
WHERE dia_jornada = 8;

UPDATE momento_kairos SET
  voz_do_dia   = 'Pedro negou três vezes num pátio, de madrugada, se esquentando num fogo de brasas.

Dias depois, voltou a pescar — que é o que a gente faz quando não sabe mais quem é: volta para o que sabia fazer antes. Jesus estava na praia. Tinha acendido um fogo. De brasas.

O mesmo cheiro. De propósito.

E então perguntou três vezes se Pedro o amava. Uma para cada negação. Não para cobrar — para desfazer, uma por uma, as três camadas que tinham sido coladas em cima do nome dele.

Jesus não fingiu que não tinha acontecido. Levou Pedro de volta ao cheiro e reescreveu ali.

Fracasso é um evento. Vira identidade quando ninguém o leva de volta ao lugar para reescrever.',
  missao       = 'Escolha um fracasso que ainda pesa. Agora conte o episódio em terceira pessoa — "ele fez isso, então aconteceu aquilo" — como quem relata o que viu de longe. Repare no que você nota que não notava.',
  missao_fase1 = 'Escolha um fracasso que ainda pesa. Agora conte o episódio em terceira pessoa — "ele fez isso, então aconteceu aquilo" — como quem relata o que viu de longe. Repare no que você nota que não notava.',
  missao_fase2 = 'Escolha um fracasso que ainda pesa. Agora conte o episódio em terceira pessoa — "ele fez isso, então aconteceu aquilo" — como quem relata o que viu de longe. Repare no que você nota que não notava.',
  missao_fase3 = 'Escolha um fracasso que ainda pesa. Agora conte o episódio em terceira pessoa — "ele fez isso, então aconteceu aquilo" — como quem relata o que viu de longe. Repare no que você nota que não notava.',
  missao_fase4 = 'Escolha um fracasso que ainda pesa. Agora conte o episódio em terceira pessoa — "ele fez isso, então aconteceu aquilo" — como quem relata o que viu de longe. Repare no que você nota que não notava.'
WHERE dia_jornada = 9;

UPDATE momento_kairos SET
  voz_do_dia   = 'Existe uma competência sua que nunca foi nomeada por ninguém.

Não porque não exista. Porque ninguém parou para dizer em voz alta, e o que não é dito em voz alta a gente não acredita que tem.',
  missao       = 'Pergunte hoje a três pessoas que te conhecem: "o que você vê em mim que eu provavelmente não vejo?" Não explique por que está perguntando. Anote as respostas sem corrigir nenhuma.',
  missao_fase1 = 'Pergunte hoje a três pessoas que te conhecem: "o que você vê em mim que eu provavelmente não vejo?" Não explique por que está perguntando. Anote as respostas sem corrigir nenhuma.',
  missao_fase2 = 'Pergunte hoje a três pessoas que te conhecem: "o que você vê em mim que eu provavelmente não vejo?" Não explique por que está perguntando. Anote as respostas sem corrigir nenhuma.',
  missao_fase3 = 'Pergunte hoje a três pessoas que te conhecem: "o que você vê em mim que eu provavelmente não vejo?" Não explique por que está perguntando. Anote as respostas sem corrigir nenhuma.',
  missao_fase4 = 'Pergunte hoje a três pessoas que te conhecem: "o que você vê em mim que eu provavelmente não vejo?" Não explique por que está perguntando. Anote as respostas sem corrigir nenhuma.'
WHERE dia_jornada = 10;

UPDATE momento_kairos SET
  voz_do_dia   = 'Os discípulos estavam discutindo quem era o maior. Jesus não respondeu a pergunta. Chamou uma criança e a pôs no meio da roda.

Uma criança no meio de um debate sobre hierarquia não contribui com nada. Não argumenta, não tem currículo, não disputa. Só está ali.

E era esse o ponto.

Toda criança sabe pedir sem calcular se merece. Em algum momento você aprendeu a calcular. Foi necessário — alguém te ensinou que querer demais custa caro, e a lição salvou você de algumas coisas.

Mas armadura que serviu numa guerra continua pesada depois dela. Quem você era antes de precisar vestir a sua?',
  missao       = 'Escreva uma lembrança de quando você se sentiu inteiramente você mesmo, sem esforço. O que estava acontecendo? Com quem? Essa memória é bússola, não nostalgia.',
  missao_fase1 = 'Escreva uma lembrança de quando você se sentiu inteiramente você mesmo, sem esforço. O que estava acontecendo? Com quem? Essa memória é bússola, não nostalgia.',
  missao_fase2 = 'Escreva uma lembrança de quando você se sentiu inteiramente você mesmo, sem esforço. O que estava acontecendo? Com quem? Essa memória é bússola, não nostalgia.',
  missao_fase3 = 'Escreva uma lembrança de quando você se sentiu inteiramente você mesmo, sem esforço. O que estava acontecendo? Com quem? Essa memória é bússola, não nostalgia.',
  missao_fase4 = 'Escreva uma lembrança de quando você se sentiu inteiramente você mesmo, sem esforço. O que estava acontecendo? Com quem? Essa memória é bússola, não nostalgia.'
WHERE dia_jornada = 11;

UPDATE momento_kairos SET
  voz_do_dia   = 'Rute era moabita, viúva, estrangeira, e passava os dias andando atrás dos ceifeiros para catar o que caía no chão. Não havia nada de promissor ali.

Ela não sabia — ninguém sabia — que estava caminhando dentro da genealogia de Davi.

Sua história não decide seu destino, mas ela informa quem você é. E a diferença entre ser definido pelo passado e ser formado por ele está inteira no modo como você conta.

Enquanto a narrativa for "foi isso que me fizeram", o presente inteiro passa por esse filtro. Os fatos não mudam. O significado que você atribui a eles, sim.',
  missao       = 'Escreva a história da sua vida em três parágrafos: o que aconteceu, o que você aprendeu, para onde está indo. Depois releia só o terceiro. É ele que diz se você está se contando como protagonista.',
  missao_fase1 = 'Escreva a história da sua vida em três parágrafos: o que aconteceu, o que você aprendeu, para onde está indo. Depois releia só o terceiro. É ele que diz se você está se contando como protagonista.',
  missao_fase2 = 'Escreva a história da sua vida em três parágrafos: o que aconteceu, o que você aprendeu, para onde está indo. Depois releia só o terceiro. É ele que diz se você está se contando como protagonista.',
  missao_fase3 = 'Escreva a história da sua vida em três parágrafos: o que aconteceu, o que você aprendeu, para onde está indo. Depois releia só o terceiro. É ele que diz se você está se contando como protagonista.',
  missao_fase4 = 'Escreva a história da sua vida em três parágrafos: o que aconteceu, o que você aprendeu, para onde está indo. Depois releia só o terceiro. É ele que diz se você está se contando como protagonista.'
WHERE dia_jornada = 12;

UPDATE momento_kairos SET
  voz_do_dia   = 'Numa obra antiga, o pedreiro separava as pedras que não serviam. Formato errado, ângulo estranho, difícil de encaixar. A pedra ia para o monte do descarte e a construção seguia.

O salmo diz que a pedra rejeitada pelos construtores se tornou a principal da esquina. A pedra angular é a que define o ângulo de todo o resto — e o que a tornava inútil para o meio da parede era exatamente o que a tornava certa para o canto.

Ela não foi consertada. Foi posta no lugar certo.

Culpa é "eu fiz algo errado". Vergonha é "eu sou algo errado". Com vergonha, você só pode aparecer pela metade — e a metade que você esconde é frequentemente a que teria utilidade.',
  missao       = 'Nomeie uma parte sua que você costuma esconder. Agora escreva uma frase: como ela poderia servir a alguém que está passando pelo que você passou?',
  missao_fase1 = 'Nomeie uma parte sua que você costuma esconder. Agora escreva uma frase: como ela poderia servir a alguém que está passando pelo que você passou?',
  missao_fase2 = 'Nomeie uma parte sua que você costuma esconder. Agora escreva uma frase: como ela poderia servir a alguém que está passando pelo que você passou?',
  missao_fase3 = 'Nomeie uma parte sua que você costuma esconder. Agora escreva uma frase: como ela poderia servir a alguém que está passando pelo que você passou?',
  missao_fase4 = 'Nomeie uma parte sua que você costuma esconder. Agora escreva uma frase: como ela poderia servir a alguém que está passando pelo que você passou?'
WHERE dia_jornada = 13;

UPDATE momento_kairos SET
  voz_do_dia   = 'Tem uma voz comentando a sua vida em tempo real.

Ela avalia o que você falou na reunião, prevê como a conversa vai terminar, explica o que o silêncio da outra pessoa significa. Trabalha o dia inteiro e nunca pediu para ser contratada.

O problema é que ela não é neutra. Foi treinada — por anos de experiência, de comparação, de coisas que te disseram. E o que ela chama de realismo é quase sempre repetição.

Paulo escreve a Timóteo que o espírito que recebemos não é de medo. Vale como critério prático: voz que te paralisa tem um remetente; voz que te corrige e te move tem outro.',
  missao       = 'Nas próximas 24 horas, quando a voz fizer um comentário sobre você, pergunte só isto: "isso é fato ou é história?" Não discuta com ela. Não tente mudar nada hoje. Só classifique.',
  missao_fase1 = 'Nas próximas 24 horas, quando a voz fizer um comentário sobre você, pergunte só isto: "isso é fato ou é história?" Não discuta com ela. Não tente mudar nada hoje. Só classifique.',
  missao_fase2 = 'Nas próximas 24 horas, quando a voz fizer um comentário sobre você, pergunte só isto: "isso é fato ou é história?" Não discuta com ela. Não tente mudar nada hoje. Só classifique.',
  missao_fase3 = 'Nas próximas 24 horas, quando a voz fizer um comentário sobre você, pergunte só isto: "isso é fato ou é história?" Não discuta com ela. Não tente mudar nada hoje. Só classifique.',
  missao_fase4 = 'Nas próximas 24 horas, quando a voz fizer um comentário sobre você, pergunte só isto: "isso é fato ou é história?" Não discuta com ela. Não tente mudar nada hoje. Só classifique.'
WHERE dia_jornada = 14;

UPDATE momento_kairos SET
  voz_do_dia   = 'Duas semanas com a mesma pergunta.

Introspecção tem um defeito conhecido: ela tende a confirmar o que já sabíamos e a desviar do que precisamos ver. A pessoa passa horas pensando sobre si e sai exatamente onde entrou, só que mais cansada.

O que costuma furar esse ciclo não é pensar mais. É olhar para três lugares específicos: o que te irrita nos outros, o que você evita sistematicamente, e o que você defende com energia desproporcional. Esses três são espelhos, e eles mostram o que a introspecção educada esconde.',
  missao       = 'Abra o que você escreveu nos últimos catorze dias e leia tudo de uma vez. Depois escreva três linhas: uma verdade que ficou mais clara, um padrão que se repetiu, e uma coisa que você ainda está evitando olhar. Capriche na terceira.',
  missao_fase1 = 'Abra o que você escreveu nos últimos catorze dias e leia tudo de uma vez. Depois escreva três linhas: uma verdade que ficou mais clara, um padrão que se repetiu, e uma coisa que você ainda está evitando olhar. Capriche na terceira.',
  missao_fase2 = 'Abra o que você escreveu nos últimos catorze dias e leia tudo de uma vez. Depois escreva três linhas: uma verdade que ficou mais clara, um padrão que se repetiu, e uma coisa que você ainda está evitando olhar. Capriche na terceira.',
  missao_fase3 = 'Abra o que você escreveu nos últimos catorze dias e leia tudo de uma vez. Depois escreva três linhas: uma verdade que ficou mais clara, um padrão que se repetiu, e uma coisa que você ainda está evitando olhar. Capriche na terceira.',
  missao_fase4 = 'Abra o que você escreveu nos últimos catorze dias e leia tudo de uma vez. Depois escreva três linhas: uma verdade que ficou mais clara, um padrão que se repetiu, e uma coisa que você ainda está evitando olhar. Capriche na terceira.'
WHERE dia_jornada = 15;

UPDATE momento_kairos SET
  voz_do_dia   = 'Isaías usa uma imagem de oficina: nós somos o barro, Deus é o oleiro, e somos obra das mãos dele.

Repare que o barro não tem função antes de ter forma. Ele é barro de qualquer jeito — nas mãos, na roda, quebrado, inteiro. A identidade dele não é o vaso que vai virar.

Você é pai ou filho, profissional, líder, amigo. Papéis são reais e importam. E são todos temporários: o filho cresce, o emprego acaba, o cargo passa para outro.

Se a identidade está ancorada no papel, perder o papel é perder a si mesmo. O que sobra de você quando todos eles saem?',
  missao       = 'Escreva cinco afirmações sobre quem você é sem usar nenhuma profissão, parentesco ou função. Se travar na segunda, esse travamento é a informação do dia.',
  missao_fase1 = 'Escreva cinco afirmações sobre quem você é sem usar nenhuma profissão, parentesco ou função. Se travar na segunda, esse travamento é a informação do dia.',
  missao_fase2 = 'Escreva cinco afirmações sobre quem você é sem usar nenhuma profissão, parentesco ou função. Se travar na segunda, esse travamento é a informação do dia.',
  missao_fase3 = 'Escreva cinco afirmações sobre quem você é sem usar nenhuma profissão, parentesco ou função. Se travar na segunda, esse travamento é a informação do dia.',
  missao_fase4 = 'Escreva cinco afirmações sobre quem você é sem usar nenhuma profissão, parentesco ou função. Se travar na segunda, esse travamento é a informação do dia.'
WHERE dia_jornada = 16;

UPDATE momento_kairos SET
  voz_do_dia   = 'Na mesma praia do dia 9, logo depois da conversa sobre as três negações, Pedro olhou para o lado, viu João e perguntou: e quanto a este?

Acabava de ser restaurado. Tinha recebido de volta o nome e a missão. E a primeira coisa que fez foi comparar.

A resposta de Jesus foi quase ríspida: que te importa? Segue-me tu.

Comparação é sempre assimétrica por construção. Você vê os seus rascunhos e o resultado final do outro. Seus bastidores, o palco dele. Não existe comparação honesta — só uma ilusão com cara de avaliação.',
  missao       = 'Pense em alguém com quem você se compara. Escreva uma única coisa que você fez nos últimos dois anos que essa pessoa não teria como fazer. Uma só, específica.',
  missao_fase1 = 'Pense em alguém com quem você se compara. Escreva uma única coisa que você fez nos últimos dois anos que essa pessoa não teria como fazer. Uma só, específica.',
  missao_fase2 = 'Pense em alguém com quem você se compara. Escreva uma única coisa que você fez nos últimos dois anos que essa pessoa não teria como fazer. Uma só, específica.',
  missao_fase3 = 'Pense em alguém com quem você se compara. Escreva uma única coisa que você fez nos últimos dois anos que essa pessoa não teria como fazer. Uma só, específica.',
  missao_fase4 = 'Pense em alguém com quem você se compara. Escreva uma única coisa que você fez nos últimos dois anos que essa pessoa não teria como fazer. Uma só, específica.'
WHERE dia_jornada = 17;

UPDATE momento_kairos SET
  voz_do_dia   = 'Existe um assunto sobre o qual você fala rápido demais quando alguém puxa.

Outro que te irrita de um jeito desproporcional — uma injustiça específica que te tira do sério enquanto outras pessoas passam ao lado sem ver.

Essas duas coisas não são traços de personalidade aleatórios. São o lugar onde sua atenção vai sem ser empurrada, e atenção não empurrada é um dado raro sobre alguém.

O salmo diz que Deus concede os desejos do coração a quem se deleita nele. Tem uma leitura mais interessante do que a óbvia: talvez alguns dos desejos já tenham sido concedidos — plantados — antes de você perceber que eram seus.',
  missao       = 'Complete quantas vezes conseguir: "Quando estou fazendo ______, não vejo o tempo passar." Depois procure o que as respostas têm em comum. O padrão vale mais que a lista.',
  missao_fase1 = 'Complete quantas vezes conseguir: "Quando estou fazendo ______, não vejo o tempo passar." Depois procure o que as respostas têm em comum. O padrão vale mais que a lista.',
  missao_fase2 = 'Complete quantas vezes conseguir: "Quando estou fazendo ______, não vejo o tempo passar." Depois procure o que as respostas têm em comum. O padrão vale mais que a lista.',
  missao_fase3 = 'Complete quantas vezes conseguir: "Quando estou fazendo ______, não vejo o tempo passar." Depois procure o que as respostas têm em comum. O padrão vale mais que a lista.',
  missao_fase4 = 'Complete quantas vezes conseguir: "Quando estou fazendo ______, não vejo o tempo passar." Depois procure o que as respostas têm em comum. O padrão vale mais que a lista.'
WHERE dia_jornada = 18;

UPDATE momento_kairos SET
  voz_do_dia   = 'Quase ninguém fala desta: a coragem de não ser excepcional.

Nossa cultura celebra o extraordinário de um jeito que faz quem é apenas fiel, presente e constante se sentir em falta. Como se existir bem, todo dia, fosse o prêmio de consolação.

Paulo escreve para não pensarmos de nós mais do que convém, mas com bom senso. A palavra importa: bom senso, não autodepreciação. A medida certa de si mesmo não é a menor possível — é a exata.

Superestimar e se diminuir dão no mesmo: os dois impedem você de ver o tamanho real do que tem na mão.',
  missao       = 'Escreva cinco forças suas, sem falsa modéstia, e três limitações reais, sem autopunição. Leia as oito em voz alta, seguidas. Essa é a pessoa de verdade.',
  missao_fase1 = 'Escreva cinco forças suas, sem falsa modéstia, e três limitações reais, sem autopunição. Leia as oito em voz alta, seguidas. Essa é a pessoa de verdade.',
  missao_fase2 = 'Escreva cinco forças suas, sem falsa modéstia, e três limitações reais, sem autopunição. Leia as oito em voz alta, seguidas. Essa é a pessoa de verdade.',
  missao_fase3 = 'Escreva cinco forças suas, sem falsa modéstia, e três limitações reais, sem autopunição. Leia as oito em voz alta, seguidas. Essa é a pessoa de verdade.',
  missao_fase4 = 'Escreva cinco forças suas, sem falsa modéstia, e três limitações reais, sem autopunição. Leia as oito em voz alta, seguidas. Essa é a pessoa de verdade.'
WHERE dia_jornada = 19;

UPDATE momento_kairos SET
  voz_do_dia   = 'Dá para passar anos ao lado de alguém entregando presença e nenhuma informação sobre si.

É confortável. É também o motivo de muita gente se sentir sozinha dentro de relações que, no papel, estão funcionando.',
  missao       = 'Hoje, em uma relação que importa, diga uma coisa verdadeira que você normalmente guardaria — uma dúvida, um medo, uma alegria boba. Uma frase basta. Repare no que acontece depois.',
  missao_fase1 = 'Hoje, em uma relação que importa, diga uma coisa verdadeira que você normalmente guardaria — uma dúvida, um medo, uma alegria boba. Uma frase basta. Repare no que acontece depois.',
  missao_fase2 = 'Hoje, em uma relação que importa, diga uma coisa verdadeira que você normalmente guardaria — uma dúvida, um medo, uma alegria boba. Uma frase basta. Repare no que acontece depois.',
  missao_fase3 = 'Hoje, em uma relação que importa, diga uma coisa verdadeira que você normalmente guardaria — uma dúvida, um medo, uma alegria boba. Uma frase basta. Repare no que acontece depois.',
  missao_fase4 = 'Hoje, em uma relação que importa, diga uma coisa verdadeira que você normalmente guardaria — uma dúvida, um medo, uma alegria boba. Uma frase basta. Repare no que acontece depois.'
WHERE dia_jornada = 20;

UPDATE momento_kairos SET
  voz_do_dia   = 'Três homens foram jogados numa fornalha superaquecida por se recusarem a se curvar. Antes, tinham dito ao rei que Deus podia livrá-los — e que, se não livrasse, ainda assim não se curvariam.

O detalhe que o texto faz questão de registrar vem depois: saíram sem um fio de cabelo chamuscado, sem cheiro de fogo na roupa. A única coisa que tinha queimado eram as cordas com que os amarraram.

Pressão não constrói caráter. Ela mostra o que já estava ali e queima o que não era seu.

Você só descobre o que realmente acredita quando acreditar passa a custar alguma coisa. Até lá, é opinião.',
  missao       = 'Lembre de uma situação recente de pressão — um conflito, um prazo, uma frustração. Escreva sua primeira reação, não a que você teve depois de pensar. A primeira é a que está automatizada.',
  missao_fase1 = 'Lembre de uma situação recente de pressão — um conflito, um prazo, uma frustração. Escreva sua primeira reação, não a que você teve depois de pensar. A primeira é a que está automatizada.',
  missao_fase2 = 'Lembre de uma situação recente de pressão — um conflito, um prazo, uma frustração. Escreva sua primeira reação, não a que você teve depois de pensar. A primeira é a que está automatizada.',
  missao_fase3 = 'Lembre de uma situação recente de pressão — um conflito, um prazo, uma frustração. Escreva sua primeira reação, não a que você teve depois de pensar. A primeira é a que está automatizada.',
  missao_fase4 = 'Lembre de uma situação recente de pressão — um conflito, um prazo, uma frustração. Escreva sua primeira reação, não a que você teve depois de pensar. A primeira é a que está automatizada.'
WHERE dia_jornada = 21;

UPDATE momento_kairos SET
  voz_do_dia   = 'Naquela cultura, um homem de posição não corria. Correr exigia levantar a túnica, mostrar as pernas, perder a compostura na frente da vila inteira.

O filho tinha ensaiado um discurso no caminho. Tinha até a proposta pronta: me aceite como empregado.

Não chegou a usar. O pai o viu de longe, correu, e o abraço aconteceu antes de qualquer explicação. A proposta de virar empregado morreu na garganta porque já estava fora de contexto.

Pertencimento que você recebe não é o mesmo que pertencimento que você negocia. Quem vive negociando nunca chega a desfazer a mala.',
  missao       = 'Escreva: "Eu pertenço a Deus porque..." e complete com três razões que não tenham nada a ver com o que você faz ou entrega. Leia nas próximas manhãs.',
  missao_fase1 = 'Escreva: "Eu pertenço a Deus porque..." e complete com três razões que não tenham nada a ver com o que você faz ou entrega. Leia nas próximas manhãs.',
  missao_fase2 = 'Escreva: "Eu pertenço a Deus porque..." e complete com três razões que não tenham nada a ver com o que você faz ou entrega. Leia nas próximas manhãs.',
  missao_fase3 = 'Escreva: "Eu pertenço a Deus porque..." e complete com três razões que não tenham nada a ver com o que você faz ou entrega. Leia nas próximas manhãs.',
  missao_fase4 = 'Escreva: "Eu pertenço a Deus porque..." e complete com três razões que não tenham nada a ver com o que você faz ou entrega. Leia nas próximas manhãs.'
WHERE dia_jornada = 22;

UPDATE momento_kairos SET
  voz_do_dia   = 'Existe uma performance de modéstia que ainda é, no fundo, sobre si mesmo.

"Ah, não foi nada", "eu não sou bom nisso", "qualquer um faria" — dita no automático, essa linguagem parece humilde e mantém a atenção exatamente onde estava: em você.

Humildade real move a atenção de lugar. Não pensa pouco de si; pensa menos sobre si. É uma diferença de direção, não de volume.

E é por isso que ela é tão difícil de treinar falando. Ela se treina fazendo alguma coisa que não pode ser creditada a você.',
  missao       = 'Faça hoje um ato de serviço que ninguém vai saber que foi seu. Anônimo de verdade — sem contar depois, sem deixar pista. Repare na vontade de contar. A vontade é o dado.',
  missao_fase1 = 'Faça hoje um ato de serviço que ninguém vai saber que foi seu. Anônimo de verdade — sem contar depois, sem deixar pista. Repare na vontade de contar. A vontade é o dado.',
  missao_fase2 = 'Faça hoje um ato de serviço que ninguém vai saber que foi seu. Anônimo de verdade — sem contar depois, sem deixar pista. Repare na vontade de contar. A vontade é o dado.',
  missao_fase3 = 'Faça hoje um ato de serviço que ninguém vai saber que foi seu. Anônimo de verdade — sem contar depois, sem deixar pista. Repare na vontade de contar. A vontade é o dado.',
  missao_fase4 = 'Faça hoje um ato de serviço que ninguém vai saber que foi seu. Anônimo de verdade — sem contar depois, sem deixar pista. Repare na vontade de contar. A vontade é o dado.'
WHERE dia_jornada = 23;

UPDATE momento_kairos SET
  voz_do_dia   = 'Saulo caiu na estrada de Damasco e levantou cego. Passou três dias sem ver, sem comer e sem beber, numa casa que não era dele, esperando alguém que ele não conhecia.

Ele era o homem mais competente da sua geração naquilo que fazia. Em três dias, não sobrou nada da estrutura inteira: nem a função, nem a reputação, nem a certeza de estar do lado certo.

O que foi reconstruído depois não era uma versão melhorada do que havia antes. Era outra coisa.

Quando o que você acreditava sobre si mesmo desmorona — uma perda, uma traição, um diagnóstico —, o que cai primeiro não é você. É a versão de você que estava sustentada por fora.',
  missao       = 'Se você está num momento assim, escreva três listas curtas: o que está caindo, o que continua de pé, o que você ainda não consegue ver. Se não está, escreva sobre uma vez em que esteve — e o que ficou de pé naquela vez.',
  missao_fase1 = 'Se você está num momento assim, escreva três listas curtas: o que está caindo, o que continua de pé, o que você ainda não consegue ver. Se não está, escreva sobre uma vez em que esteve — e o que ficou de pé naquela vez.',
  missao_fase2 = 'Se você está num momento assim, escreva três listas curtas: o que está caindo, o que continua de pé, o que você ainda não consegue ver. Se não está, escreva sobre uma vez em que esteve — e o que ficou de pé naquela vez.',
  missao_fase3 = 'Se você está num momento assim, escreva três listas curtas: o que está caindo, o que continua de pé, o que você ainda não consegue ver. Se não está, escreva sobre uma vez em que esteve — e o que ficou de pé naquela vez.',
  missao_fase4 = 'Se você está num momento assim, escreva três listas curtas: o que está caindo, o que continua de pé, o que você ainda não consegue ver. Se não está, escreva sobre uma vez em que esteve — e o que ficou de pé naquela vez.'
WHERE dia_jornada = 24;

UPDATE momento_kairos SET
  voz_do_dia   = 'Existem dois cansaços e eles não se parecem.

Um deixa você exausto e satisfeito, com vontade de voltar amanhã. O outro deixa você vazio depois de um dia que, no papel, nem foi tão puxado.

A diferença raramente está na quantidade de esforço. Está em quanto do que você fez tinha a ver com você.

Isso não é instrução para evitar o que é chato. Muita coisa necessária esvazia, e vai continuar na sua semana. Mas quem não sabe distinguir os dois acaba cortando a coisa errada quando precisa cortar alguma.',
  missao       = 'Hoje é dia de tirar, não de acrescentar. Olhe sua semana e remova um compromisso que esvazia e que não é necessário. Um só. Avise quem precisa ser avisado hoje mesmo.',
  missao_fase1 = 'Hoje é dia de tirar, não de acrescentar. Olhe sua semana e remova um compromisso que esvazia e que não é necessário. Um só. Avise quem precisa ser avisado hoje mesmo.',
  missao_fase2 = 'Hoje é dia de tirar, não de acrescentar. Olhe sua semana e remova um compromisso que esvazia e que não é necessário. Um só. Avise quem precisa ser avisado hoje mesmo.',
  missao_fase3 = 'Hoje é dia de tirar, não de acrescentar. Olhe sua semana e remova um compromisso que esvazia e que não é necessário. Um só. Avise quem precisa ser avisado hoje mesmo.',
  missao_fase4 = 'Hoje é dia de tirar, não de acrescentar. Olhe sua semana e remova um compromisso que esvazia e que não é necessário. Um só. Avise quem precisa ser avisado hoje mesmo.'
WHERE dia_jornada = 25;

UPDATE momento_kairos SET
  voz_do_dia   = 'Tem gente que não sabe o que quer porque nunca teve permissão de querer.

O querer foi desligado cedo — por decepção, por pragmatismo, às vezes por uma religião mal explicada que ensinou que desejo é suspeito por natureza.

Amós escreve que Deus não faz nada sem revelar seu segredo aos seus servos. E alguns desses segredos chegam vestidos de vontade — uma inquietação que não passa, uma ideia que volta há anos.

E se o que você quer há tanto tempo não for um capricho seu, mas um recado que você vem recusando ler?',
  missao       = 'Complete: "Se eu soubesse que não ia falhar, eu..." Escreva por dez minutos sem reler nenhuma linha. Depois procure o que te surpreendeu.',
  missao_fase1 = 'Complete: "Se eu soubesse que não ia falhar, eu..." Escreva por dez minutos sem reler nenhuma linha. Depois procure o que te surpreendeu.',
  missao_fase2 = 'Complete: "Se eu soubesse que não ia falhar, eu..." Escreva por dez minutos sem reler nenhuma linha. Depois procure o que te surpreendeu.',
  missao_fase3 = 'Complete: "Se eu soubesse que não ia falhar, eu..." Escreva por dez minutos sem reler nenhuma linha. Depois procure o que te surpreendeu.',
  missao_fase4 = 'Complete: "Se eu soubesse que não ia falhar, eu..." Escreva por dez minutos sem reler nenhuma linha. Depois procure o que te surpreendeu.'
WHERE dia_jornada = 26;

UPDATE momento_kairos SET
  voz_do_dia   = 'Repare no que você faz quando alguém te elogia.

Diminui ("imagina, foi sorte"), devolve na hora ("você também!"), ou explica por que não foi tão impressionante assim. Qualquer uma das três tira você da posição de quem recebeu.

Dar mantém você no controle. Receber não — receber coloca você em dívida, e quem não acredita que merece faz qualquer coisa para sair dessa posição rápido.

Paulo escreve que Cristo morreu por nós quando ainda éramos pecadores. A ordem da frase é o escândalo dela: antes de qualquer melhora, antes de qualquer contrapartida. Quem não sabe receber de uma pessoa dificilmente sabe receber disso.',
  missao       = 'Hoje, quando alguém fizer ou disser algo bom para você, diga apenas obrigado. Não diminua, não devolva, não justifique. Fique com o desconforto se ele vier.',
  missao_fase1 = 'Hoje, quando alguém fizer ou disser algo bom para você, diga apenas obrigado. Não diminua, não devolva, não justifique. Fique com o desconforto se ele vier.',
  missao_fase2 = 'Hoje, quando alguém fizer ou disser algo bom para você, diga apenas obrigado. Não diminua, não devolva, não justifique. Fique com o desconforto se ele vier.',
  missao_fase3 = 'Hoje, quando alguém fizer ou disser algo bom para você, diga apenas obrigado. Não diminua, não devolva, não justifique. Fique com o desconforto se ele vier.',
  missao_fase4 = 'Hoje, quando alguém fizer ou disser algo bom para você, diga apenas obrigado. Não diminua, não devolva, não justifique. Fique com o desconforto se ele vier.'
WHERE dia_jornada = 27;

UPDATE momento_kairos SET
  voz_do_dia   = 'O provérbio diz que o ferro afia o ferro. A imagem é precisa e pouca gente repara no custo: afiar tira material dos dois lados. Faísca, calor, atrito. Nenhuma lâmina sai de uma afiação do mesmo tamanho que entrou.

Você não descobre paciência sozinho. Descobre convivendo com quem te tira do sério. Não descobre generosidade na teoria — descobre quando tem pouco e alguém precisa.

Partes inteiras de você só existem na presença de outra pessoa. Sozinho, elas nem chegam a aparecer para serem conhecidas.',
  missao       = 'Escolha uma pessoa que te conhece de verdade e marque algo com ela esta semana — café, ligação, caminhada. Hoje: só mande a mensagem. Marcar é a missão.',
  missao_fase1 = 'Escolha uma pessoa que te conhece de verdade e marque algo com ela esta semana — café, ligação, caminhada. Hoje: só mande a mensagem. Marcar é a missão.',
  missao_fase2 = 'Escolha uma pessoa que te conhece de verdade e marque algo com ela esta semana — café, ligação, caminhada. Hoje: só mande a mensagem. Marcar é a missão.',
  missao_fase3 = 'Escolha uma pessoa que te conhece de verdade e marque algo com ela esta semana — café, ligação, caminhada. Hoje: só mande a mensagem. Marcar é a missão.',
  missao_fase4 = 'Escolha uma pessoa que te conhece de verdade e marque algo com ela esta semana — café, ligação, caminhada. Hoje: só mande a mensagem. Marcar é a missão.'
WHERE dia_jornada = 28;

UPDATE momento_kairos SET
  voz_do_dia   = 'Quando assinaram o decreto proibindo orar a qualquer deus, Daniel foi para casa, subiu ao quarto de cima e abriu as janelas na direção de Jerusalém, como fazia três vezes por dia.

O texto faz questão de dizer: *como costumava fazer antes*. Ele não aumentou a dose nem fez um gesto heroico. Só não mudou nada.

A fidelidade dele não começou no dia do decreto. Começou nos anos de janela aberta sem nenhum decreto, quando não custava nada e ninguém estava olhando.

É por isso que ser fiel no pouco não é uma frase bonita. É a única forma de já estar fiel quando chegar o muito.',
  missao       = 'Escreva os três valores que de fato governam suas decisões — não os que você gostaria de ter. Depois olhe as decisões dos últimos trinta dias. Elas confirmam ou desmentem a lista?',
  missao_fase1 = 'Escreva os três valores que de fato governam suas decisões — não os que você gostaria de ter. Depois olhe as decisões dos últimos trinta dias. Elas confirmam ou desmentem a lista?',
  missao_fase2 = 'Escreva os três valores que de fato governam suas decisões — não os que você gostaria de ter. Depois olhe as decisões dos últimos trinta dias. Elas confirmam ou desmentem a lista?',
  missao_fase3 = 'Escreva os três valores que de fato governam suas decisões — não os que você gostaria de ter. Depois olhe as decisões dos últimos trinta dias. Elas confirmam ou desmentem a lista?',
  missao_fase4 = 'Escreva os três valores que de fato governam suas decisões — não os que você gostaria de ter. Depois olhe as decisões dos últimos trinta dias. Elas confirmam ou desmentem a lista?'
WHERE dia_jornada = 29;

UPDATE momento_kairos SET
  voz_do_dia   = 'Amanhã fecha o primeiro mês.

Paulo escreve que aquele que começou a boa obra em você há de completá-la. A frase costuma ser lida como consolo, e é — mas repare que ela também é uma afirmação sobre autoria. A obra não é sua. Você está dentro dela.

Trinta dias atrás você escreveu uma frase sobre quem acreditava ser. Ela está guardada. Amanhã você escreve outra, e a distância entre as duas é a única métrica honesta que existe para este mês.',
  missao       = 'Escreva uma carta de você daqui a um ano para você de hoje. O que essa pessoa entendeu? O que ela quer que você pare de fazer? Guarde junto com o texto do Dia 1.',
  missao_fase1 = 'Escreva uma carta de você daqui a um ano para você de hoje. O que essa pessoa entendeu? O que ela quer que você pare de fazer? Guarde junto com o texto do Dia 1.',
  missao_fase2 = 'Escreva uma carta de você daqui a um ano para você de hoje. O que essa pessoa entendeu? O que ela quer que você pare de fazer? Guarde junto com o texto do Dia 1.',
  missao_fase3 = 'Escreva uma carta de você daqui a um ano para você de hoje. O que essa pessoa entendeu? O que ela quer que você pare de fazer? Guarde junto com o texto do Dia 1.',
  missao_fase4 = 'Escreva uma carta de você daqui a um ano para você de hoje. O que essa pessoa entendeu? O que ela quer que você pare de fazer? Guarde junto com o texto do Dia 1.'
WHERE dia_jornada = 30;

UPDATE momento_kairos SET
  voz_do_dia   = 'Trinta e um dias com a mesma pergunta, e você provavelmente ainda não tem a resposta.

Isso não é fracasso. Ninguém termina de responder quem é — a pergunta é grande demais para caber num mês, e desconfie de quem responde rápido.

Bill Johnson costuma dizer que crescimento espiritual não se mede em conquista, se mede em proximidade. Então a pergunta de hoje não é "eu descobri quem sou". É: estou mais perto de mim do que estava no Dia 1? Mais perto de quem Deus diz que sou?

O próximo mês pergunta outra coisa — o que me move. Mas ela só rende para quem sabe de onde parte. Quem pula esta parte acaba perseguindo motivação emprestada, de uma vida que não é a sua.

Você ficou trinta e um dias diante do espelho sem desviar o olhar. Leve o que viu.',
  missao       = 'Escreva a resposta mais honesta que você consegue hoje para "quem sou eu?" — a versão verdadeira, não a apresentável. Guarde. Você vai reler no Dia 365, e a distância entre os dois textos é a história desta jornada.',
  missao_fase1 = 'Escreva a resposta mais honesta que você consegue hoje para "quem sou eu?" — a versão verdadeira, não a apresentável. Guarde. Você vai reler no Dia 365, e a distância entre os dois textos é a história desta jornada.',
  missao_fase2 = 'Escreva a resposta mais honesta que você consegue hoje para "quem sou eu?" — a versão verdadeira, não a apresentável. Guarde. Você vai reler no Dia 365, e a distância entre os dois textos é a história desta jornada.',
  missao_fase3 = 'Escreva a resposta mais honesta que você consegue hoje para "quem sou eu?" — a versão verdadeira, não a apresentável. Guarde. Você vai reler no Dia 365, e a distância entre os dois textos é a história desta jornada.',
  missao_fase4 = 'Escreva a resposta mais honesta que você consegue hoje para "quem sou eu?" — a versão verdadeira, não a apresentável. Guarde. Você vai reler no Dia 365, e a distância entre os dois textos é a história desta jornada.'
WHERE dia_jornada = 31;

COMMIT;

-- ═══════════════════════════════════════════════════════════════════════════
-- VERIFICAÇÃO
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Deve devolver 31 linhas, todas com parágrafo (quebra de linha no texto):
--
--   SELECT dia_jornada,
--          length(voz_do_dia) AS tam,
--          (voz_do_dia LIKE '%' || chr(10) || '%') AS tem_paragrafo,
--          left(voz_do_dia, 50) AS inicio
--     FROM momento_kairos
--    WHERE dia_jornada BETWEEN 1 AND 31
--    ORDER BY dia_jornada;
--
-- E nenhuma deve conter mais "a neurociência":
--
--   SELECT count(*) FROM momento_kairos
--    WHERE dia_jornada BETWEEN 1 AND 31 AND voz_do_dia ILIKE '%neurociência%';
-- ═══════════════════════════════════════════════════════════════════════════
