# Reescrita do conteúdo para a jornada atemporal

Levantamento automático das passagens que assumem uma data real do calendário.
Planilha completa: [`passagens-calendario.csv`](./passagens-calendario.csv) — abra no
Excel ou Numbers, a coluna `reescrita` está em branco para você preencher.

**123 passagens, em três níveis de gravidade.**

| Nível | Qtd | O que é | Precisa reescrever? |
|---|---|---|---|
| 🔴 CRÍTICO | 27 | Assume que hoje é uma data real ("fim de ano", "31 de dezembro") | **Sim.** Quebra o sentido para quem começa fora de dezembro |
| 🟡 MODERADO | 53 | Cita mês como posição na jornada ("releia o que escreveu em janeiro") | Sim, mas é troca de vocabulário |
| ⚪ LEVE | 43 | "este ano", "do ano" | Opcional — quase sempre funciona como "este ciclo" |

Os 27 críticos estão concentrados: **24 em dezembro**, 2 em janeiro, 1 em abril.
Ou seja, o trabalho de verdade é um mês de conteúdo.

---

## Vocabulário de substituição

A ideia é trocar referência de calendário por referência de jornada. Onde o
original diz *quando é*, o novo diz *onde você está*.

| Em vez de | Use |
|---|---|
| em janeiro | no primeiro mês / quando você começou |
| desde janeiro | desde o primeiro dia |
| dezembro | este último mês / o fim do seu ciclo |
| fim de ano | fim do seu ciclo / o fechamento desta jornada |
| virada do ano / ano novo | a virada do seu ciclo / o próximo ciclo |
| este ano | este ciclo / estes 365 dias |
| até 31 de dezembro | até o dia 365 |
| o ano está se fechando | seu ciclo está se fechando |
| Releia em 31 de dezembro | Releia no seu dia 365 |

Repare que o último fica **melhor** no modelo novo: "releia no seu dia 365" é uma
promessa pessoal, "releia em 31 de dezembro" é uma data de agenda.

---

## Os casos que valem atenção especial

**Dia 1 — "antes de qualquer resolução de ano novo"**
É a primeira frase que a pessoa lê no produto. Hoje ela pressupõe 1º de janeiro.
Sugestão: *"antes de qualquer meta, antes de qualquer plano, antes de qualquer
promessa que você já fez a si mesmo — existe uma pergunta que precede tudo: quem
você é?"*. Funciona em qualquer data e é mais forte, porque "promessa que você já
fez a si mesmo" atinge mais que "resolução de ano novo".

**Dia 31 — "Releia em 31 de dezembro"**
Vira "Releia no seu dia 365". E aqui há uma oportunidade: se o app guardar essa
marcação, no dia 365 ele pode trazer de volta o que a pessoa escreveu no dia 31.
Isso é produto, não só correção de texto.

**Dia 117 — "inverno ou primavera, colheita ou preparo do solo"**
**Falso positivo.** O texto usa estações como metáfora de temporadas da vida, não
como estação do ano. Não mexa — está ótimo.

**Mês 12 inteiro — "Gratidão e recomeço"**
O tema já funciona perfeitamente como fechamento de jornada. O arco fecha
sozinho: quem sou eu → ... → gratidão e recomeço. Só o vocabulário está preso ao
calendário. Reescrevendo dezembro, você ganha o melhor final possível para a
jornada, e ele já está escrito.

---

## Sugestão de ordem de trabalho

1. Os **24 críticos de dezembro** — é o bloco que realmente importa. Uma sessão
   focada resolve.
2. Os **2 de janeiro** — são a primeira impressão do produto, então valem cuidado
   desproporcional ao número.
3. Os **53 moderados** — mecânico, dá para fazer ouvindo música.
4. Os **43 leves** — só se sobrar vontade.

Enquanto você reescreve, eu sigo no schema e nas telas. As duas frentes não se
bloqueiam: o código passa a ler por `dia_jornada` independentemente do texto, e
o texto pode ser atualizado depois com um novo seed.
