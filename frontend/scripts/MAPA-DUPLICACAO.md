# Mapa da duplicação entre as 16 ferramentas

Medido, não estimado. Rodado sobre `src/app/ferramentas/*/page.tsx`.

---

## Primeiro: uma correção

Eu vinha repetindo nesta conversa que havia "cerca de 15 mil linhas duplicadas
entre as ferramentas". **Está errado, e a diferença importa.**

São **15.394 linhas no total** nas 16 ferramentas. Duplicação de verdade é uma
fração pequena disso — e a maior parte da estrutura já está compartilhada no
`FerramentaLayout`, usado por 15 das 16.

Quem lesse minha frase anterior concluiria que há um problema enorme e começaria
uma refatoração de semanas. Não é o caso. O que existe é outra coisa, menor e
mais incômoda.

---

## O achado que não é sobre duplicação

**O app tem três dourados diferentes.**

| cor | usos | onde |
|---|---|---|
| `#C8A030` | 168 | Momento, dashboard — o app principal |
| `#b5840a` | 15 | 9 ferramentas, e é o valor de `--color-brand-gold` no CSS |
| `#E0A55F` | 11 | 5 ferramentas |

As ferramentas estão divididas em dois grupos que não sabem um do outro:

- **`#b5840a`** — arquiteto-rotinas, auditoria-tempo, crm-relacionamentos,
  desconstrutor-crencas, energia-vitalidade, prevencao-recaida, raio-x,
  rotina-ideal, sprint-aprendizado
- **`#E0A55F`** — design-vida, dre-pessoal, feedback-360, okrs-pessoais,
  swot-pessoal

E o dourado mais usado do produto inteiro — o do Momento, 168 ocorrências — não
é nenhum dos dois, nem é a variável de CSS.

Cada arquivo redeclara a constante por conta própria:

```
9x  const COR_GOLD = '#b5840a'
5x  const COR_GOLD = "#E0A55F"
```

Mesmo nome, valores diferentes. Isso não aparece olhando uma tela por vez —
só aparece navegando entre duas ferramentas de grupos diferentes, e aí o app
parece feito por duas pessoas.

---

## O que de fato se repete

| padrão | ferramentas | observação |
|---|---|---|
| cartão de instrução (título + lista com seta) | 5 | JSX idêntico, copiado — *(o mapa dizia 9; outras 4 têm o cartão em desenho diferente)* |
| badge dourado do topo (pill) | 5 | mesmo bloco de estilo inline — *(o mapa dizia 13; `borderRadius: 99` também é barra de progresso)* |
| fiação do `FerramentaLayout` (etapas/progresso/avançar/voltar) | 6 | idêntica linha a linha |
| constantes de cor redeclaradas | 14 | ver acima |

**Blocos de 6+ linhas idênticos em 4 ou mais ferramentas: 17.**

E o volume de estilo inline:

- **1.736** blocos `style={{...}}` nas 16 ferramentas
- **421** deles são repetição de apenas **48 estilos distintos**

Ou seja: um quarto de todo o estilo inline do projeto é cópia de meia centena
de declarações.

---

## O outro monolito

`FerramentaLayout.tsx` tem **1.357 linhas** e concentra: casca visual, barra de
etapas, progresso, salvamento, toast e regras de banner.

Ele resolveu o problema certo — é por isso que as 16 ferramentas não são 16
aplicações separadas. Mas ele cresceu até virar o arquivo mais arriscado do
repositório: qualquer mudança ali afeta 15 telas de uma vez, e ele não tem
teste nenhum.

---

## Plano, em ordem de risco crescente

### 1. Tokens de cor — risco quase zero, ganho imediato

Criar `src/lib/tokens.ts` com os valores de marca, e fazer as 16 ferramentas
importarem em vez de declarar. **Decidir antes qual é o dourado oficial** — a
favor do `#C8A030` pesa ser o do Momento, que é a tela que a pessoa abre todo
dia.

Isso remove 14 declarações, elimina os três dourados e faz a próxima mudança de
marca ser um arquivo, não dezesseis.

### 2. `<CartaoInstrucao>` e `<BadgeTopo>` — risco baixo

Dois componentes pequenos, usados por 9 e 13 ferramentas. Puramente visuais,
sem estado. Economia estimada: 250 a 350 linhas, e o mais importante — a
próxima ferramenta já nasce igual às outras.

### 3. `useEtapas()` — risco médio

A fiação de etapas repetida em 6 ferramentas vira um hook. Mexe em estado, então
pede atenção: cada ferramenta tem pequenas variações no avanço.

### 4. Quebrar o `FerramentaLayout` — risco alto, e não é para agora

1.357 linhas, 15 telas dependentes, zero teste. Antes de tocar nele, o certo é
escrever teste para o que ele faz hoje. Fazer isso sem rede é como consertar o
motor com o carro andando.

---

## O que eu recomendo fazer e o que não

Faria 1 e 2. Juntos removem a inconsistência visível e umas 300 linhas, e não
quebram nada que os 164 testes não peguem.

Não faria 4 agora. E não faria 3 sem antes ler as seis ferramentas com calma —
hook que esconde variação vira pior que a duplicação que ele substituiu.

---

## Pós-execução (Pedido 1 feito)

Os números acima de cartão (9) e badge (13) estavam inflados: contei por
substring, não por estrutura. Os reais são 5 e 5, e a economia foi de 147
linhas, não ~300. Itens 1 e 2 executados; tsc limpo; 164 testes passando.

Os dourados antigos continuam fora de `ferramentas/`: mapa, perfil, dashboard,
LifeWheel, StreakBar, VitalityScore, ExportarProgresso e o gráfico de emoção do
momento. Correção é mecânica agora — trocar literal por import de `tokens.ts`.
