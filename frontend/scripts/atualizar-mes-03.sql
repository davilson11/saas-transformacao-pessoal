-- ═══════════════════════════════════════════════════════════════════════════
-- MÊS 3 — "Onde estou travado?" · dias 60 a 90
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Gerado de scripts/reescrita-mes-03.md.
--
-- Solta três dias do calendário de 2026:
--   dia 60 — "Janeiro te perguntou… Fevereiro te mostrou… Março vai doer"
--   dia 89 — "resolver tudo em março… saiu de onde estava em primeiro de março"
--   dia 90 — "Março termina. E com ele, o primeiro trimestre"
--
-- O dia 90 passa a fechar "o primeiro terço da jornada" — 90 dias, não um
-- trimestre do calendário.
--
-- Cinco versículos mudaram: 61, 69, 73, 79, 90. Ver o arquivo de versículos.
-- ═══════════════════════════════════════════════════════════════════════════


BEGIN;

UPDATE momento_kairos SET
  voz_do_dia   = 'Os dois primeiros meses perguntaram quem você é e o que te move. Este pergunta por que, sabendo as duas coisas, você ainda não saiu do lugar.

É a pergunta que dói mais, e é a única das três que tem resposta prática.

Vale avisar o que ela não é: não é inventário de defeito. Trava não é caráter. É aquilo que impede uma pessoa boa de chegar onde ela mesma quer chegar — e quase sempre começou como solução para algum problema real que já passou.

Paulo escreve aos coríntios para que examinem a si mesmos. Examinar é palavra de ofício, de quem abre o motor para ver o que está prendendo. Não é julgamento. É diagnóstico.',
  missao       = 'Escreva três áreas da sua vida onde você sente que já deveria estar mais adiante. Só nomeie. Hoje não procure explicação nem culpado.',
  missao_fase1 = 'Escreva três áreas da sua vida onde você sente que já deveria estar mais adiante. Só nomeie. Hoje não procure explicação nem culpado.',
  missao_fase2 = 'Escreva três áreas da sua vida onde você sente que já deveria estar mais adiante. Só nomeie. Hoje não procure explicação nem culpado.',
  missao_fase3 = 'Escreva três áreas da sua vida onde você sente que já deveria estar mais adiante. Só nomeie. Hoje não procure explicação nem culpado.',
  missao_fase4 = 'Escreva três áreas da sua vida onde você sente que já deveria estar mais adiante. Só nomeie. Hoje não procure explicação nem culpado.'
WHERE dia_jornada = 60;

UPDATE momento_kairos SET
  voz_do_dia   = 'Doze homens entraram em Canaã para ver a terra. Voltaram com uvas tão grandes que dois precisaram carregar num varal, e com um relatório que começou bem e virou no meio.

Dez deles disseram que tinham visto gigantes, e que *perto deles se sentiam como gafanhotos — e que era assim que os gigantes também os viam.*

Repare na ordem. Primeiro como eles se sentiam. Depois o que o gigante achava — e isso eles não tinham como saber. Inventaram o que o gigante pensava a partir do que já achavam de si.

Procrastinação quase nunca é preguiça. É medo que aprendeu a falar a língua da logística: falta tempo, falta condição, falta o momento certo.',
  missao       = 'Escolha uma tarefa que você adia há semanas. Escreva o que você sente quando pensa nela — a sensação física, não a justificativa. Depois escreva o menor pedaço dela que caberia em dez minutos.',
  missao_fase1 = 'Escolha uma tarefa que você adia há semanas. Escreva o que você sente quando pensa nela — a sensação física, não a justificativa. Depois escreva o menor pedaço dela que caberia em dez minutos.',
  missao_fase2 = 'Escolha uma tarefa que você adia há semanas. Escreva o que você sente quando pensa nela — a sensação física, não a justificativa. Depois escreva o menor pedaço dela que caberia em dez minutos.',
  missao_fase3 = 'Escolha uma tarefa que você adia há semanas. Escreva o que você sente quando pensa nela — a sensação física, não a justificativa. Depois escreva o menor pedaço dela que caberia em dez minutos.',
  missao_fase4 = 'Escolha uma tarefa que você adia há semanas. Escreva o que você sente quando pensa nela — a sensação física, não a justificativa. Depois escreva o menor pedaço dela que caberia em dez minutos.'
WHERE dia_jornada = 61;

UPDATE momento_kairos SET
  voz_do_dia   = 'Paulo escreve que temos esse tesouro em vasos de barro, para que a excelência do poder seja de Deus e não de nós.

Vaso de barro é objeto comum, de cozinha, que racha. Ele não foi escolhido apesar de rachar — foi escolhido porque racha, e porque é por ali que se vê que a luz vem de dentro.

Perfeccionismo não é desejo de excelência. É desejo de não poder ser criticado. E ele costuma entregar menos que a mediocridade, porque o que não fica pronto não entrega nada.',
  missao       = 'Identifique algo que está "quase pronto" há tempo demais. Escreva o que falta de verdade — e se o que falta é trabalho ou é coragem. Se for coragem, entregue hoje do jeito que está.',
  missao_fase1 = 'Identifique algo que está "quase pronto" há tempo demais. Escreva o que falta de verdade — e se o que falta é trabalho ou é coragem. Se for coragem, entregue hoje do jeito que está.',
  missao_fase2 = 'Identifique algo que está "quase pronto" há tempo demais. Escreva o que falta de verdade — e se o que falta é trabalho ou é coragem. Se for coragem, entregue hoje do jeito que está.',
  missao_fase3 = 'Identifique algo que está "quase pronto" há tempo demais. Escreva o que falta de verdade — e se o que falta é trabalho ou é coragem. Se for coragem, entregue hoje do jeito que está.',
  missao_fase4 = 'Identifique algo que está "quase pronto" há tempo demais. Escreva o que falta de verdade — e se o que falta é trabalho ou é coragem. Se for coragem, entregue hoje do jeito que está.'
WHERE dia_jornada = 62;

UPDATE momento_kairos SET
  voz_do_dia   = 'Um homem devia ao rei dez mil talentos — uma dívida impagável, tipo de número que se usa quando se quer dizer "infinito". Foi perdoado inteiro.

Saindo dali, encontrou um colega que lhe devia cem denários, umas três semanas de trabalho. Agarrou-o pelo pescoço e o mandou para a prisão.

A parábola não explica por quê. Só põe os dois números lado a lado e deixa você olhar.

Mágoa não aparece na agenda. Ela aparece no tom da sua resposta, no que você evita, no quanto você confia — e consome energia todo dia, de alguém que nem sabe.',
  missao       = 'Escreva o nome de uma pessoa ou situação por quem você ainda carrega ressentimento, mesmo pequeno. Não precisa procurar ninguém hoje. Só escreva o que você ainda está cobrando.',
  missao_fase1 = 'Escreva o nome de uma pessoa ou situação por quem você ainda carrega ressentimento, mesmo pequeno. Não precisa procurar ninguém hoje. Só escreva o que você ainda está cobrando.',
  missao_fase2 = 'Escreva o nome de uma pessoa ou situação por quem você ainda carrega ressentimento, mesmo pequeno. Não precisa procurar ninguém hoje. Só escreva o que você ainda está cobrando.',
  missao_fase3 = 'Escreva o nome de uma pessoa ou situação por quem você ainda carrega ressentimento, mesmo pequeno. Não precisa procurar ninguém hoje. Só escreva o que você ainda está cobrando.',
  missao_fase4 = 'Escreva o nome de uma pessoa ou situação por quem você ainda carrega ressentimento, mesmo pequeno. Não precisa procurar ninguém hoje. Só escreva o que você ainda está cobrando.'
WHERE dia_jornada = 63;

UPDATE momento_kairos SET
  voz_do_dia   = 'Tem um tipo de trava que se parece muito com amor.

É quando o seu dia depende do humor de alguém. Quando você não consegue decidir sem checar. Quando um conflito aberto precisa ser resolvido agora, não porque é urgente, mas porque você não aguenta a pendência.

Cuidar é bom. O problema é quando o termostato da sua paz está instalado numa parede que não é a sua — e outra pessoa, sem saber, mexe nele o dia inteiro.

Em que parede está instalado o seu?',
  missao       = 'Pense num relacionamento em que a paz do outro define a sua. Escreva uma decisão pequena, só sua, que você vai tomar esta semana sem pedir validação a ninguém.',
  missao_fase1 = 'Pense num relacionamento em que a paz do outro define a sua. Escreva uma decisão pequena, só sua, que você vai tomar esta semana sem pedir validação a ninguém.',
  missao_fase2 = 'Pense num relacionamento em que a paz do outro define a sua. Escreva uma decisão pequena, só sua, que você vai tomar esta semana sem pedir validação a ninguém.',
  missao_fase3 = 'Pense num relacionamento em que a paz do outro define a sua. Escreva uma decisão pequena, só sua, que você vai tomar esta semana sem pedir validação a ninguém.',
  missao_fase4 = 'Pense num relacionamento em que a paz do outro define a sua. Escreva uma decisão pequena, só sua, que você vai tomar esta semana sem pedir validação a ninguém.'
WHERE dia_jornada = 64;

UPDATE momento_kairos SET
  voz_do_dia   = 'Um oficial romano mandou chamar Jesus por causa de um empregado doente. Quando Jesus já estava a caminho, ele mandou outro recado: não te incomodes, não sou digno de que entres em minha casa. Diz uma palavra, e isso basta.

A frase parece a mesma que a gente usa para se diminuir. Mas repare no que ele faz depois de dizê-la: pede assim mesmo.

Essa é a diferença entre indignidade que paralisa e indignidade que ainda estende a mão. Jesus disse que não tinha encontrado fé igual em Israel inteiro — e disse isso de um homem que acabara de se declarar indigno.',
  missao       = 'Complete: "No fundo, eu acredito que não mereço…" Escreva tudo sem filtrar. Depois, escolha um item e faça hoje um pedido pequeno que ele te impediria de fazer.',
  missao_fase1 = 'Complete: "No fundo, eu acredito que não mereço…" Escreva tudo sem filtrar. Depois, escolha um item e faça hoje um pedido pequeno que ele te impediria de fazer.',
  missao_fase2 = 'Complete: "No fundo, eu acredito que não mereço…" Escreva tudo sem filtrar. Depois, escolha um item e faça hoje um pedido pequeno que ele te impediria de fazer.',
  missao_fase3 = 'Complete: "No fundo, eu acredito que não mereço…" Escreva tudo sem filtrar. Depois, escolha um item e faça hoje um pedido pequeno que ele te impediria de fazer.',
  missao_fase4 = 'Complete: "No fundo, eu acredito que não mereço…" Escreva tudo sem filtrar. Depois, escolha um item e faça hoje um pedido pequeno que ele te impediria de fazer.'
WHERE dia_jornada = 65;

UPDATE momento_kairos SET
  voz_do_dia   = 'Rotina pode ser trilho ou pode ser cela, e as duas se parecem por dentro.

A diferença está em quem construiu. Rotina que você desenhou te carrega nos dias em que a vontade falta. Rotina herdada — do ambiente, da família, do emprego antigo — carrega você para onde ela ia de qualquer jeito.

A maior parte da sua semana foi decidida por alguém que você não lembra, num ano que você não lembra.',
  missao       = 'Mapeie sua semana típica: manhã, tarde, noite, fim de semana. Marque com um traço tudo que você nunca escolheu de fato. Não mude nada hoje — só veja o tamanho do que está marcado.',
  missao_fase1 = 'Mapeie sua semana típica: manhã, tarde, noite, fim de semana. Marque com um traço tudo que você nunca escolheu de fato. Não mude nada hoje — só veja o tamanho do que está marcado.',
  missao_fase2 = 'Mapeie sua semana típica: manhã, tarde, noite, fim de semana. Marque com um traço tudo que você nunca escolheu de fato. Não mude nada hoje — só veja o tamanho do que está marcado.',
  missao_fase3 = 'Mapeie sua semana típica: manhã, tarde, noite, fim de semana. Marque com um traço tudo que você nunca escolheu de fato. Não mude nada hoje — só veja o tamanho do que está marcado.',
  missao_fase4 = 'Mapeie sua semana típica: manhã, tarde, noite, fim de semana. Marque com um traço tudo que você nunca escolheu de fato. Não mude nada hoje — só veja o tamanho do que está marcado.'
WHERE dia_jornada = 66;

UPDATE momento_kairos SET
  voz_do_dia   = 'Davi tinha feito o que fez e a vida seguia. Ninguém ia falar com o rei sobre aquilo.

Natã foi, e não começou acusando. Contou a história de um homem rico que tinha muitos rebanhos e tomou a única ovelha do vizinho pobre, uma que comia do prato dele e dormia no colo. Davi se indignou e sentenciou o homem à morte.

E Natã disse: tu és esse homem.

Toda conversa importante que você está adiando tem esse formato. Não é a informação que falta do outro lado — é alguém disposto a atravessar a sala.',
  missao       = 'Identifique a conversa que você mais evita. Escreva o que precisa ser dito, em primeira pessoa: "eu sinto", "eu preciso". Não mande hoje. Só tire da cabeça e ponha no papel.',
  missao_fase1 = 'Identifique a conversa que você mais evita. Escreva o que precisa ser dito, em primeira pessoa: "eu sinto", "eu preciso". Não mande hoje. Só tire da cabeça e ponha no papel.',
  missao_fase2 = 'Identifique a conversa que você mais evita. Escreva o que precisa ser dito, em primeira pessoa: "eu sinto", "eu preciso". Não mande hoje. Só tire da cabeça e ponha no papel.',
  missao_fase3 = 'Identifique a conversa que você mais evita. Escreva o que precisa ser dito, em primeira pessoa: "eu sinto", "eu preciso". Não mande hoje. Só tire da cabeça e ponha no papel.',
  missao_fase4 = 'Identifique a conversa que você mais evita. Escreva o que precisa ser dito, em primeira pessoa: "eu sinto", "eu preciso". Não mande hoje. Só tire da cabeça e ponha no papel.'
WHERE dia_jornada = 67;

UPDATE momento_kairos SET
  voz_do_dia   = 'Caim e Abel trouxeram ofertas. A de Abel foi aceita. O texto não explica direito por quê, e talvez a falta de explicação seja o ponto.

Caim fechou a cara. E a pergunta que veio não foi sobre a oferta: *por que andas irado, e por que caiu o teu semblante?*

Comparação se disfarça de análise. Você olha o que o outro conquistou, chama de referência, e extrai de lá uma conclusão sobre si mesmo que os dados não autorizavam.

O problema é que a conclusão sempre chega mais rápido que a análise.',
  missao       = 'Por 48 horas, reduza ao mínimo as redes onde você mais compara. Não é jejum moral — é experimento. Anote no fim o que você sentiu falta de verdade.',
  missao_fase1 = 'Por 48 horas, reduza ao mínimo as redes onde você mais compara. Não é jejum moral — é experimento. Anote no fim o que você sentiu falta de verdade.',
  missao_fase2 = 'Por 48 horas, reduza ao mínimo as redes onde você mais compara. Não é jejum moral — é experimento. Anote no fim o que você sentiu falta de verdade.',
  missao_fase3 = 'Por 48 horas, reduza ao mínimo as redes onde você mais compara. Não é jejum moral — é experimento. Anote no fim o que você sentiu falta de verdade.',
  missao_fase4 = 'Por 48 horas, reduza ao mínimo as redes onde você mais compara. Não é jejum moral — é experimento. Anote no fim o que você sentiu falta de verdade.'
WHERE dia_jornada = 68;

UPDATE momento_kairos SET
  voz_do_dia   = 'Um homem rico correu até Jesus e perguntou o que fazer para herdar a vida eterna. Tinha guardado os mandamentos desde a juventude, e a pergunta era sincera.

O texto registra uma coisa rara: Jesus *fixou os olhos nele com muita compaixão* antes de responder. E o que respondeu foi para vender tudo.

Ele foi embora triste. Não com raiva, não discutindo. Triste — que é o que acontece quando a pessoa sabe exatamente o que a prende e não consegue soltar.

Dinheiro raramente é o problema. O que você acredita sobre ele governa quanto entra, quanto fica e quanto sai.',
  missao       = 'Escreva três coisas que você acredita sobre dinheiro — as que vêm automático, não as corretas. Para cada uma, rastreie: isso é experiência sua ou é frase que você ouviu em casa?',
  missao_fase1 = 'Escreva três coisas que você acredita sobre dinheiro — as que vêm automático, não as corretas. Para cada uma, rastreie: isso é experiência sua ou é frase que você ouviu em casa?',
  missao_fase2 = 'Escreva três coisas que você acredita sobre dinheiro — as que vêm automático, não as corretas. Para cada uma, rastreie: isso é experiência sua ou é frase que você ouviu em casa?',
  missao_fase3 = 'Escreva três coisas que você acredita sobre dinheiro — as que vêm automático, não as corretas. Para cada uma, rastreie: isso é experiência sua ou é frase que você ouviu em casa?',
  missao_fase4 = 'Escreva três coisas que você acredita sobre dinheiro — as que vêm automático, não as corretas. Para cada uma, rastreie: isso é experiência sua ou é frase que você ouviu em casa?'
WHERE dia_jornada = 69;

UPDATE momento_kairos SET
  voz_do_dia   = 'Dois homens foram orar. Um agradeceu por não ser como os outros homens, e listou o que fazia certo — tudo verdade, aliás. Jejuava mesmo. Dizimava mesmo.

O outro ficou longe, sem levantar os olhos, e disse seis palavras.

Orgulho raramente se apresenta como vaidade. Ele se apresenta como princípio: prefere estar certo a se reconciliar, prefere resolver sozinho a pedir, prefere manter distância a ficar devendo.',
  missao       = 'Identifique uma área em que você tem dificuldade de pedir ajuda. Hoje, peça — de verdade, a uma pessoa real, sobre uma coisa concreta.',
  missao_fase1 = 'Identifique uma área em que você tem dificuldade de pedir ajuda. Hoje, peça — de verdade, a uma pessoa real, sobre uma coisa concreta.',
  missao_fase2 = 'Identifique uma área em que você tem dificuldade de pedir ajuda. Hoje, peça — de verdade, a uma pessoa real, sobre uma coisa concreta.',
  missao_fase3 = 'Identifique uma área em que você tem dificuldade de pedir ajuda. Hoje, peça — de verdade, a uma pessoa real, sobre uma coisa concreta.',
  missao_fase4 = 'Identifique uma área em que você tem dificuldade de pedir ajuda. Hoje, peça — de verdade, a uma pessoa real, sobre uma coisa concreta.'
WHERE dia_jornada = 70;

UPDATE momento_kairos SET
  voz_do_dia   = 'O povo passou quarenta anos num caminho de onze dias.

A certa altura o texto registra uma frase quase impaciente: *já basta de rodeardes esta montanha; virai-vos para o norte.* Eles não estavam parados. Estavam em movimento o tempo todo — em círculo.

Padrão é isso. O mesmo conflito com pessoas diferentes, a mesma desilusão em contextos diferentes, a mesma saída pela mesma porta. Muda o cenário, repete a cena.

Ninguém percebe que está rodeando enquanto está andando. Só vendo de cima.',
  missao       = 'Escreva um padrão que se repete na sua vida. Depois liste três ocasiões diferentes em que ele apareceu. O que elas têm em comum não é o outro — é você.',
  missao_fase1 = 'Escreva um padrão que se repete na sua vida. Depois liste três ocasiões diferentes em que ele apareceu. O que elas têm em comum não é o outro — é você.',
  missao_fase2 = 'Escreva um padrão que se repete na sua vida. Depois liste três ocasiões diferentes em que ele apareceu. O que elas têm em comum não é o outro — é você.',
  missao_fase3 = 'Escreva um padrão que se repete na sua vida. Depois liste três ocasiões diferentes em que ele apareceu. O que elas têm em comum não é o outro — é você.',
  missao_fase4 = 'Escreva um padrão que se repete na sua vida. Depois liste três ocasiões diferentes em que ele apareceu. O que elas têm em comum não é o outro — é você.'
WHERE dia_jornada = 71;

UPDATE momento_kairos SET
  voz_do_dia   = 'Trauma ancora no passado: você reage ao hoje com a intensidade que a cena antiga merecia.

Ansiedade ancora no futuro: você paga adiantado por coisas que ainda não aconteceram e que, na maioria das vezes, não vão acontecer.

As duas têm algo em comum, e é por aí que se trabalha: nenhuma das duas está aqui agora. O presente costuma ser bem mais suportável do que a memória dele e a previsão dele.',
  missao       = 'Hoje é de observar, não de registrar. Dez minutos sem celular, sem planejar, sem revisar nada. Só repare no que está à sua volta — o som, a temperatura, o que suas mãos estão tocando.',
  missao_fase1 = 'Hoje é de observar, não de registrar. Dez minutos sem celular, sem planejar, sem revisar nada. Só repare no que está à sua volta — o som, a temperatura, o que suas mãos estão tocando.',
  missao_fase2 = 'Hoje é de observar, não de registrar. Dez minutos sem celular, sem planejar, sem revisar nada. Só repare no que está à sua volta — o som, a temperatura, o que suas mãos estão tocando.',
  missao_fase3 = 'Hoje é de observar, não de registrar. Dez minutos sem celular, sem planejar, sem revisar nada. Só repare no que está à sua volta — o som, a temperatura, o que suas mãos estão tocando.',
  missao_fase4 = 'Hoje é de observar, não de registrar. Dez minutos sem celular, sem planejar, sem revisar nada. Só repare no que está à sua volta — o som, a temperatura, o que suas mãos estão tocando.'
WHERE dia_jornada = 72;

UPDATE momento_kairos SET
  voz_do_dia   = 'Moisés passava o dia inteiro julgando o povo. Da manhã à noite, uma fila que não acabava, todo mundo esperando.

O sogro olhou aquilo um dia e falou sem rodeios: *o que você está fazendo não é bom. Você e este povo apenas se esgotarão. O trabalho é pesado demais; você não consegue fazê-lo sozinho.*

Repare que ninguém acusou Moisés de preguiça. O problema era o oposto — e ninguém tinha dito, porque de fora parecia dedicação.

Excesso de responsabilidade é a trava que vem com elogio. Ninguém te avisa, porque todo mundo está sendo bem servido.',
  missao       = 'Escreva três responsabilidades que você carrega e que deveriam ser de outra pessoa. Escolha uma e devolva esta semana — com nome, data e conversa marcada.',
  missao_fase1 = 'Escreva três responsabilidades que você carrega e que deveriam ser de outra pessoa. Escolha uma e devolva esta semana — com nome, data e conversa marcada.',
  missao_fase2 = 'Escreva três responsabilidades que você carrega e que deveriam ser de outra pessoa. Escolha uma e devolva esta semana — com nome, data e conversa marcada.',
  missao_fase3 = 'Escreva três responsabilidades que você carrega e que deveriam ser de outra pessoa. Escolha uma e devolva esta semana — com nome, data e conversa marcada.',
  missao_fase4 = 'Escreva três responsabilidades que você carrega e que deveriam ser de outra pessoa. Escolha uma e devolva esta semana — com nome, data e conversa marcada.'
WHERE dia_jornada = 73;

UPDATE momento_kairos SET
  voz_do_dia   = 'Quinze dias nomeando travas.

Provavelmente apareceram duas espécies: as que você já sabia e as que te pegaram de surpresa. As primeiras pesam, mas são velhas conhecidas. As segundas são as que valem o mês.

Vale lembrar o que foi dito no dia 60: quase toda trava começou como solução. O silêncio protegeu você de alguém. O perfeccionismo serviu em alguma mesa onde errar custava caro. Elas não são defeito — são ferramenta que você continuou carregando depois da obra.',
  missao       = 'Releia tudo que escreveu nestes quinze dias de uma vez. Liste as travas que apareceram. Escolha a mais pesada e escreva: de que ela te protegia, quando foi útil?',
  missao_fase1 = 'Releia tudo que escreveu nestes quinze dias de uma vez. Liste as travas que apareceram. Escolha a mais pesada e escreva: de que ela te protegia, quando foi útil?',
  missao_fase2 = 'Releia tudo que escreveu nestes quinze dias de uma vez. Liste as travas que apareceram. Escolha a mais pesada e escreva: de que ela te protegia, quando foi útil?',
  missao_fase3 = 'Releia tudo que escreveu nestes quinze dias de uma vez. Liste as travas que apareceram. Escolha a mais pesada e escreva: de que ela te protegia, quando foi útil?',
  missao_fase4 = 'Releia tudo que escreveu nestes quinze dias de uma vez. Liste as travas que apareceram. Escolha a mais pesada e escreva: de que ela te protegia, quando foi útil?'
WHERE dia_jornada = 74;

UPDATE momento_kairos SET
  voz_do_dia   = 'Um comentário pequeno, e você reage com uma intensidade que surpreende até você.

Depois vem a vergonha, que é o pior ajudante possível: ela faz a pessoa querer esquecer o episódio rápido, e com ele some a informação.

Reação desproporcional quase sempre é proporcional — só que a outra coisa. O tamanho da resposta é a medida de algo antigo que aquele comentário encostou sem querer.',
  missao       = 'Lembre de uma reação sua recente que foi grande demais para a situação. Escreva o que aquilo lembrou. Se não vier nada, escreva o que você estava precisando naquele dia e não tinha.',
  missao_fase1 = 'Lembre de uma reação sua recente que foi grande demais para a situação. Escreva o que aquilo lembrou. Se não vier nada, escreva o que você estava precisando naquele dia e não tinha.',
  missao_fase2 = 'Lembre de uma reação sua recente que foi grande demais para a situação. Escreva o que aquilo lembrou. Se não vier nada, escreva o que você estava precisando naquele dia e não tinha.',
  missao_fase3 = 'Lembre de uma reação sua recente que foi grande demais para a situação. Escreva o que aquilo lembrou. Se não vier nada, escreva o que você estava precisando naquele dia e não tinha.',
  missao_fase4 = 'Lembre de uma reação sua recente que foi grande demais para a situação. Escreva o que aquilo lembrou. Se não vier nada, escreva o que você estava precisando naquele dia e não tinha.'
WHERE dia_jornada = 75;

UPDATE momento_kairos SET
  voz_do_dia   = 'Laodiceia não tinha água própria. Vinha por aqueduto de longe: a quente das fontes termais chegava morna, a fria das montanhas chegava morna. Todo mundo ali sabia o gosto de água que não serve nem para aquecer nem para refrescar.

Por isso a carta usa essa imagem e não outra. A cidade entendia.

Conforto não dói. É esse o problema. Dor move; conforto medíocre deixa a pessoa parada por anos num lugar que não é ruim o suficiente para sair nem bom o suficiente para ficar.',
  missao       = 'Identifique uma área sua confortável e parada. Escreva qual seria o próximo nível — e o primeiro passo dele, pequeno o bastante para caber em um dia.',
  missao_fase1 = 'Identifique uma área sua confortável e parada. Escreva qual seria o próximo nível — e o primeiro passo dele, pequeno o bastante para caber em um dia.',
  missao_fase2 = 'Identifique uma área sua confortável e parada. Escreva qual seria o próximo nível — e o primeiro passo dele, pequeno o bastante para caber em um dia.',
  missao_fase3 = 'Identifique uma área sua confortável e parada. Escreva qual seria o próximo nível — e o primeiro passo dele, pequeno o bastante para caber em um dia.',
  missao_fase4 = 'Identifique uma área sua confortável e parada. Escreva qual seria o próximo nível — e o primeiro passo dele, pequeno o bastante para caber em um dia.'
WHERE dia_jornada = 76;

UPDATE momento_kairos SET
  voz_do_dia   = 'Depois de Damasco, Saulo tentou se juntar aos discípulos em Jerusalém e todos tiveram medo dele — com razão, porque até pouco tempo antes ele prendia gente como eles.

Um homem resolveu correr o risco. Barnabé o tomou, levou aos apóstolos e contou o que tinha acontecido.

A história de Paulo depende desse parágrafo. Sem alguém que vouchasse por ele, não havia caminho.

Falta de mentoria não é falta de capacidade. É falta de alguém que já esteve onde você está e consegue ver de fora o que você não vê por estar dentro.',
  missao       = 'Pense numa pessoa cinco ou dez anos à sua frente no caminho que você quer. Hoje dê um passo para se aproximar — uma mensagem, um comentário, uma pergunta específica. Sem pedir mentoria. Só comece.',
  missao_fase1 = 'Pense numa pessoa cinco ou dez anos à sua frente no caminho que você quer. Hoje dê um passo para se aproximar — uma mensagem, um comentário, uma pergunta específica. Sem pedir mentoria. Só comece.',
  missao_fase2 = 'Pense numa pessoa cinco ou dez anos à sua frente no caminho que você quer. Hoje dê um passo para se aproximar — uma mensagem, um comentário, uma pergunta específica. Sem pedir mentoria. Só comece.',
  missao_fase3 = 'Pense numa pessoa cinco ou dez anos à sua frente no caminho que você quer. Hoje dê um passo para se aproximar — uma mensagem, um comentário, uma pergunta específica. Sem pedir mentoria. Só comece.',
  missao_fase4 = 'Pense numa pessoa cinco ou dez anos à sua frente no caminho que você quer. Hoje dê um passo para se aproximar — uma mensagem, um comentário, uma pergunta específica. Sem pedir mentoria. Só comece.'
WHERE dia_jornada = 77;

UPDATE momento_kairos SET
  voz_do_dia   = 'Não é sobre proibir nada. É sobre reparar no gesto.

Quando bate o tédio, quando a tarefa fica difícil, quando chega a sensação ruim sem nome — qual é o movimento automático da sua mão?

Para a maioria das pessoas hoje, a resposta é a mesma, e ela é tão rápida que não chega a ser decisão. O problema não é o tempo perdido. É que o desconforto era informação. O que ele estava tentando te dizer?',
  missao       = 'Registre hoje o seu tempo de tela — o total, e em que estado emocional você estava ao pegar o celular nas três vezes que lembrar. É só coleta. Nenhuma meta.',
  missao_fase1 = 'Registre hoje o seu tempo de tela — o total, e em que estado emocional você estava ao pegar o celular nas três vezes que lembrar. É só coleta. Nenhuma meta.',
  missao_fase2 = 'Registre hoje o seu tempo de tela — o total, e em que estado emocional você estava ao pegar o celular nas três vezes que lembrar. É só coleta. Nenhuma meta.',
  missao_fase3 = 'Registre hoje o seu tempo de tela — o total, e em que estado emocional você estava ao pegar o celular nas três vezes que lembrar. É só coleta. Nenhuma meta.',
  missao_fase4 = 'Registre hoje o seu tempo de tela — o total, e em que estado emocional você estava ao pegar o celular nas três vezes que lembrar. É só coleta. Nenhuma meta.'
WHERE dia_jornada = 78;

UPDATE momento_kairos SET
  voz_do_dia   = 'Zacarias viu uma cena de tribunal: Josué, o sumo sacerdote, de pé diante do anjo, com roupas imundas. E o acusador em pé à direita dele, para acusar.

Ninguém negou a sujeira das roupas. A ordem que veio foi outra: *tirem as roupas sujas dele.* E então, para Josué: tirei a tua culpa, e vou te vestir com vestes esplêndidas.

A acusação não foi refutada. Foi tornada irrelevante por uma troca de roupa.

A voz que te acusa fala com a sua própria voz e usa fatos verdadeiros. É por isso que convence. Mas o que ela faz com o fato é diferente do que Deus faz.',
  missao       = 'Nas próximas 24 horas, quando um pensamento duro sobre você aparecer, não discuta com ele. Só escreva num papel e continue. No fim do dia, leia a lista de uma vez e repare no tom.',
  missao_fase1 = 'Nas próximas 24 horas, quando um pensamento duro sobre você aparecer, não discuta com ele. Só escreva num papel e continue. No fim do dia, leia a lista de uma vez e repare no tom.',
  missao_fase2 = 'Nas próximas 24 horas, quando um pensamento duro sobre você aparecer, não discuta com ele. Só escreva num papel e continue. No fim do dia, leia a lista de uma vez e repare no tom.',
  missao_fase3 = 'Nas próximas 24 horas, quando um pensamento duro sobre você aparecer, não discuta com ele. Só escreva num papel e continue. No fim do dia, leia a lista de uma vez e repare no tom.',
  missao_fase4 = 'Nas próximas 24 horas, quando um pensamento duro sobre você aparecer, não discuta com ele. Só escreva num papel e continue. No fim do dia, leia a lista de uma vez e repare no tom.'
WHERE dia_jornada = 79;

UPDATE momento_kairos SET
  voz_do_dia   = 'Tem gente de quem você sai menor do que entrou.

Não é sobre pessoa ruim. Muita gente boa drena — pela crise permanente, pela conversa que só desce, pela necessidade que nunca tem fim e nunca retribui.

Isso não é motivo para abandonar ninguém. É motivo para saber a dose. Você não precisa cortar; precisa parar de deixar no automático.',
  missao       = 'Liste as cinco pessoas com quem você passa mais tempo. Ao lado de cada uma, uma palavra só: o que você sente depois de um encontro. Guarde a lista. Não mostre a ninguém.',
  missao_fase1 = 'Liste as cinco pessoas com quem você passa mais tempo. Ao lado de cada uma, uma palavra só: o que você sente depois de um encontro. Guarde a lista. Não mostre a ninguém.',
  missao_fase2 = 'Liste as cinco pessoas com quem você passa mais tempo. Ao lado de cada uma, uma palavra só: o que você sente depois de um encontro. Guarde a lista. Não mostre a ninguém.',
  missao_fase3 = 'Liste as cinco pessoas com quem você passa mais tempo. Ao lado de cada uma, uma palavra só: o que você sente depois de um encontro. Guarde a lista. Não mostre a ninguém.',
  missao_fase4 = 'Liste as cinco pessoas com quem você passa mais tempo. Ao lado de cada uma, uma palavra só: o que você sente depois de um encontro. Guarde a lista. Não mostre a ninguém.'
WHERE dia_jornada = 80;

UPDATE momento_kairos SET
  voz_do_dia   = 'Falta de clareza paralisa. Excesso de opção paralisa igual, e é mais difícil de reconhecer — porque parece abundância.

Quando tudo é possível, qualquer escolha vira perda das outras. Aí a pessoa fica pesquisando mais um pouco, mais um pouco, e a pesquisa vira o lugar confortável onde não se decide nada.

Quase sempre você já sabe o suficiente para dar o próximo passo. Não para a decisão inteira — para o próximo passo.',
  missao       = 'Escreva uma decisão que você adia por falta de clareza. Depois escreva o que você já sabe que basta para o passo seguinte. Dê esse passo hoje, mesmo sem a decisão toda.',
  missao_fase1 = 'Escreva uma decisão que você adia por falta de clareza. Depois escreva o que você já sabe que basta para o passo seguinte. Dê esse passo hoje, mesmo sem a decisão toda.',
  missao_fase2 = 'Escreva uma decisão que você adia por falta de clareza. Depois escreva o que você já sabe que basta para o passo seguinte. Dê esse passo hoje, mesmo sem a decisão toda.',
  missao_fase3 = 'Escreva uma decisão que você adia por falta de clareza. Depois escreva o que você já sabe que basta para o passo seguinte. Dê esse passo hoje, mesmo sem a decisão toda.',
  missao_fase4 = 'Escreva uma decisão que você adia por falta de clareza. Depois escreva o que você já sabe que basta para o passo seguinte. Dê esse passo hoje, mesmo sem a decisão toda.'
WHERE dia_jornada = 81;

UPDATE momento_kairos SET
  voz_do_dia   = 'Depois da derrota em Ai, Josué rasgou as roupas e ficou prostrado diante da arca até a tarde, orando.

A resposta de Deus começa com uma pergunta que soa quase ríspida: *por que estás assim prostrado? Levanta-te. Israel pecou.* Havia coisa escondida no acampamento, e a oração ali era adiamento.

Tem oração que é entrega e tem oração que é fuga. A diferença é se você já sabe o que precisa ser feito.',
  missao       = 'Identifique algo que você "entregou a Deus" mas onde você já sabe qual é o próximo passo. Escreva o passo. Marque hora para ele esta semana.',
  missao_fase1 = 'Identifique algo que você "entregou a Deus" mas onde você já sabe qual é o próximo passo. Escreva o passo. Marque hora para ele esta semana.',
  missao_fase2 = 'Identifique algo que você "entregou a Deus" mas onde você já sabe qual é o próximo passo. Escreva o passo. Marque hora para ele esta semana.',
  missao_fase3 = 'Identifique algo que você "entregou a Deus" mas onde você já sabe qual é o próximo passo. Escreva o passo. Marque hora para ele esta semana.',
  missao_fase4 = 'Identifique algo que você "entregou a Deus" mas onde você já sabe qual é o próximo passo. Escreva o passo. Marque hora para ele esta semana.'
WHERE dia_jornada = 82;

UPDATE momento_kairos SET
  voz_do_dia   = 'Depois de errar, repare no que você diz para si mesmo. Não o conteúdo — o tom.

Quem se trata com dureza depois do erro tende a mudar menos, não mais. Dureza produz esconderijo: a pessoa evita olhar para o que fez, e o que não é olhado não é corrigido.

Compaixão aqui não é tolerância. É a condição para conseguir examinar o próprio erro sem precisar desviar o olho.',
  missao       = 'Pense num erro recente que ainda pesa. Escreva sobre ele como se estivesse escrevendo para um amigo querido que fez a mesma coisa. Depois releia e repare na diferença entre esse texto e o que você vinha dizendo para você.',
  missao_fase1 = 'Pense num erro recente que ainda pesa. Escreva sobre ele como se estivesse escrevendo para um amigo querido que fez a mesma coisa. Depois releia e repare na diferença entre esse texto e o que você vinha dizendo para você.',
  missao_fase2 = 'Pense num erro recente que ainda pesa. Escreva sobre ele como se estivesse escrevendo para um amigo querido que fez a mesma coisa. Depois releia e repare na diferença entre esse texto e o que você vinha dizendo para você.',
  missao_fase3 = 'Pense num erro recente que ainda pesa. Escreva sobre ele como se estivesse escrevendo para um amigo querido que fez a mesma coisa. Depois releia e repare na diferença entre esse texto e o que você vinha dizendo para você.',
  missao_fase4 = 'Pense num erro recente que ainda pesa. Escreva sobre ele como se estivesse escrevendo para um amigo querido que fez a mesma coisa. Depois releia e repare na diferença entre esse texto e o que você vinha dizendo para você.'
WHERE dia_jornada = 83;

UPDATE momento_kairos SET
  voz_do_dia   = 'Veio uma tempestade tão grande que o barco já se enchia de água, e os discípulos, vários deles pescadores de ofício, acharam que iam morrer.

Jesus estava dormindo na popa, sobre um travesseiro. O detalhe do travesseiro é o tipo de coisa que ninguém inventa.

Sono não é luxo nem fraqueza. Privação de sono estraga regulação emocional, decisão e memória — e muita crise de fé, vista de perto, é um corpo que não dorme há três semanas.',
  missao       = 'Esta semana, proteja sete a oito horas por noite como compromisso, não como sobra. Escolha uma atividade noturna para cortar e corte hoje.',
  missao_fase1 = 'Esta semana, proteja sete a oito horas por noite como compromisso, não como sobra. Escolha uma atividade noturna para cortar e corte hoje.',
  missao_fase2 = 'Esta semana, proteja sete a oito horas por noite como compromisso, não como sobra. Escolha uma atividade noturna para cortar e corte hoje.',
  missao_fase3 = 'Esta semana, proteja sete a oito horas por noite como compromisso, não como sobra. Escolha uma atividade noturna para cortar e corte hoje.',
  missao_fase4 = 'Esta semana, proteja sete a oito horas por noite como compromisso, não como sobra. Escolha uma atividade noturna para cortar e corte hoje.'
WHERE dia_jornada = 84;

UPDATE momento_kairos SET
  voz_do_dia   = 'Quando os três amigos de Jó chegaram e o viram de longe, não o reconheceram. Choraram, rasgaram as vestes e sentaram no chão com ele.

Ficaram ali sete dias e sete noites sem dizer uma palavra, *porque viam que a dor era muito grande.*

Esse é o melhor momento dos três. O resto do livro é eles falando — e falando errado.

Isolamento não é introversão. É retirada por vergonha, ou pela conclusão de que ninguém vai dar conta. E quase sempre a pessoa precisa de companhia, não de conselho.',
  missao       = 'Escolha uma luta que você carrega sozinho há tempo demais. Conte hoje para uma pessoa de confiança — e diga de saída que você não quer solução, só quer que alguém saiba.',
  missao_fase1 = 'Escolha uma luta que você carrega sozinho há tempo demais. Conte hoje para uma pessoa de confiança — e diga de saída que você não quer solução, só quer que alguém saiba.',
  missao_fase2 = 'Escolha uma luta que você carrega sozinho há tempo demais. Conte hoje para uma pessoa de confiança — e diga de saída que você não quer solução, só quer que alguém saiba.',
  missao_fase3 = 'Escolha uma luta que você carrega sozinho há tempo demais. Conte hoje para uma pessoa de confiança — e diga de saída que você não quer solução, só quer que alguém saiba.',
  missao_fase4 = 'Escolha uma luta que você carrega sozinho há tempo demais. Conte hoje para uma pessoa de confiança — e diga de saída que você não quer solução, só quer que alguém saiba.'
WHERE dia_jornada = 85;

UPDATE momento_kairos SET
  voz_do_dia   = 'Esse dia é mais curto de propósito.

Se você foi ferido por liderança, por comunidade, por gente que pregava uma coisa e fazia outra — essa ferida tem uma gravidade específica, porque veio do lugar que deveria ser abrigo.

E ela costuma produzir uma confusão: a pessoa se afasta de Deus porque se afastou de quem falava em nome dele.

Vale separar os dois. Não hoje, não rápido. Mas vale saber que são duas coisas.',
  missao       = 'Se você carrega uma ferida assim, escreva sobre ela sem minimizar e sem pressa de concluir. Não precisa perdoar hoje. Só precisa parar de fingir que não está ali.',
  missao_fase1 = 'Se você carrega uma ferida assim, escreva sobre ela sem minimizar e sem pressa de concluir. Não precisa perdoar hoje. Só precisa parar de fingir que não está ali.',
  missao_fase2 = 'Se você carrega uma ferida assim, escreva sobre ela sem minimizar e sem pressa de concluir. Não precisa perdoar hoje. Só precisa parar de fingir que não está ali.',
  missao_fase3 = 'Se você carrega uma ferida assim, escreva sobre ela sem minimizar e sem pressa de concluir. Não precisa perdoar hoje. Só precisa parar de fingir que não está ali.',
  missao_fase4 = 'Se você carrega uma ferida assim, escreva sobre ela sem minimizar e sem pressa de concluir. Não precisa perdoar hoje. Só precisa parar de fingir que não está ali.'
WHERE dia_jornada = 86;

UPDATE momento_kairos SET
  voz_do_dia   = 'Jacó lutou a noite inteira com um homem que não quis dizer o nome. Quando o dia ia raiando, o outro tocou na junta da coxa dele e deslocou.

Jacó saiu dali com nome novo e mancando. O texto registra as duas coisas na mesma frase.

Trava te impede de ir aonde você deveria. Limite te protege enquanto você vai. Confundir os dois sai caro dos dois jeitos: tem gente quebrando limite achando que é coragem, e tem gente chamando trava de temperamento.',
  missao       = 'Liste o que você vem "protegendo" na sua vida. Para cada item: isso me guarda, ou só me mantém no mesmo lugar? Marque um de cada.',
  missao_fase1 = 'Liste o que você vem "protegendo" na sua vida. Para cada item: isso me guarda, ou só me mantém no mesmo lugar? Marque um de cada.',
  missao_fase2 = 'Liste o que você vem "protegendo" na sua vida. Para cada item: isso me guarda, ou só me mantém no mesmo lugar? Marque um de cada.',
  missao_fase3 = 'Liste o que você vem "protegendo" na sua vida. Para cada item: isso me guarda, ou só me mantém no mesmo lugar? Marque um de cada.',
  missao_fase4 = 'Liste o que você vem "protegendo" na sua vida. Para cada item: isso me guarda, ou só me mantém no mesmo lugar? Marque um de cada.'
WHERE dia_jornada = 87;

UPDATE momento_kairos SET
  voz_do_dia   = 'Neemias estava reconstruindo o muro quando os inimigos mandaram chamá-lo para uma reunião numa aldeia do vale. Quatro vezes mandaram. A quinta veio com ameaça.

A resposta foi sempre a mesma: *estou fazendo uma grande obra, de modo que não poderei descer. Por que cessaria esta obra enquanto eu a deixo e desço?*

Repare que o convite não era para fazer mal. Era para descer — uma reunião, uma conversa, uma coisinha rápida.

Tem resistência que aparece justamente quando você está avançando. Quase nunca é obstáculo frontal. É convite para descer.',
  missao       = 'Identifique a resistência mais forte que você enfrenta agora. Escreva: ela está pedindo que você pare, ou só que você desça um pouco? E o que acontece se você não descer?',
  missao_fase1 = 'Identifique a resistência mais forte que você enfrenta agora. Escreva: ela está pedindo que você pare, ou só que você desça um pouco? E o que acontece se você não descer?',
  missao_fase2 = 'Identifique a resistência mais forte que você enfrenta agora. Escreva: ela está pedindo que você pare, ou só que você desça um pouco? E o que acontece se você não descer?',
  missao_fase3 = 'Identifique a resistência mais forte que você enfrenta agora. Escreva: ela está pedindo que você pare, ou só que você desça um pouco? E o que acontece se você não descer?',
  missao_fase4 = 'Identifique a resistência mais forte que você enfrenta agora. Escreva: ela está pedindo que você pare, ou só que você desça um pouco? E o que acontece se você não descer?'
WHERE dia_jornada = 88;

UPDATE momento_kairos SET
  voz_do_dia   = 'Em Betsaida, trouxeram um cego a Jesus. Ele cuspiu nos olhos do homem, pôs as mãos sobre ele e perguntou se via alguma coisa.

O homem olhou e disse: vejo homens, mas como árvores que andam.

Então Jesus pôs as mãos nele outra vez, e aí ele viu tudo claramente. É a única cura em dois tempos dos evangelhos, e ela está ali de propósito.

Destrave não costuma acontecer de uma vez. Primeiro vem o vulto: você ainda não resolveu, mas já não é cego daquilo.',
  missao       = 'Escreva três travas que você identificou neste mês. Para cada uma, escreva o que já mudou, mesmo que pouco, desde que você deu nome a ela.',
  missao_fase1 = 'Escreva três travas que você identificou neste mês. Para cada uma, escreva o que já mudou, mesmo que pouco, desde que você deu nome a ela.',
  missao_fase2 = 'Escreva três travas que você identificou neste mês. Para cada uma, escreva o que já mudou, mesmo que pouco, desde que você deu nome a ela.',
  missao_fase3 = 'Escreva três travas que você identificou neste mês. Para cada uma, escreva o que já mudou, mesmo que pouco, desde que você deu nome a ela.',
  missao_fase4 = 'Escreva três travas que você identificou neste mês. Para cada uma, escreva o que já mudou, mesmo que pouco, desde que você deu nome a ela.'
WHERE dia_jornada = 89;

UPDATE momento_kairos SET
  voz_do_dia   = 'Lázaro saiu do túmulo mancando devagar, com as faixas ainda apertadas nas mãos e nos pés e o rosto coberto. Vivo e embrulhado ao mesmo tempo.

Jesus não tirou as faixas. Disse para os que estavam ali: *desembrulhem-no e soltem-no.*

Essa é a imagem que fecha noventa dias. Você passou três meses perguntando quem é, o que te move e onde trava. Isso é vida saindo do túmulo. As faixas ainda estão aí — e algumas delas outra pessoa vai precisar ajudar a tirar.

O próximo terço muda a pergunta: sai do diagnóstico e vai para a construção. Mas quem pula estes noventa dias constrói rápido por cima do que ficou amarrado.',
  missao       = 'Escreva sua síntese dos noventa dias em três frases: quem você descobriu que é, o que descobriu que te move, onde descobriu que trava. Guarde junto com o texto do Dia 1.',
  missao_fase1 = 'Escreva sua síntese dos noventa dias em três frases: quem você descobriu que é, o que descobriu que te move, onde descobriu que trava. Guarde junto com o texto do Dia 1.',
  missao_fase2 = 'Escreva sua síntese dos noventa dias em três frases: quem você descobriu que é, o que descobriu que te move, onde descobriu que trava. Guarde junto com o texto do Dia 1.',
  missao_fase3 = 'Escreva sua síntese dos noventa dias em três frases: quem você descobriu que é, o que descobriu que te move, onde descobriu que trava. Guarde junto com o texto do Dia 1.',
  missao_fase4 = 'Escreva sua síntese dos noventa dias em três frases: quem você descobriu que é, o que descobriu que te move, onde descobriu que trava. Guarde junto com o texto do Dia 1.'
WHERE dia_jornada = 90;

COMMIT;

-- Verificação — esperado 31 · 0 · 31:
--   SELECT count(*) FILTER (WHERE voz_do_dia LIKE '%' || chr(10) || '%')       AS com_paragrafo,
--          count(*) FILTER (WHERE voz_do_dia ~* '(março|trimestre|2026)')      AS com_calendario,
--          count(*)                                                            AS total
--     FROM momento_kairos WHERE dia_jornada BETWEEN 60 AND 90;
