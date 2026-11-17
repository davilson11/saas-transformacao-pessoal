# Revisão técnica — frágil, silencioso, morto

Pedido 2 do briefing. Varredura sobre `frontend/src/`, com arquivo e linha.
Prioridade por risco real em produção, não por boa prática.

---

## 1. A próxima falha silenciosa já está no código

### `components/dashboard/Onboarding.tsx:182` — o segundo botão verde

```ts
await fetch("/api/notify", { method: "POST", ... });
setNotifStatus("granted");   // ← sem olhar a resposta
```

É **exatamente o bug do botão de notificação do Momento**, que custou uma
noite para achar — só que no onboarding, o fluxo de primeiro acesso. Se o
servidor devolver 401 ou 500, a tela diz "ativado" e nada foi gravado.

Pior: esse fluxo chama `/api/notify`, enquanto o Momento chama
`/api/push/subscribe`. São **duas rotas diferentes para gravar a mesma
inscrição**, com dois códigos de cliente diferentes (um converte a chave VAPID
para `Uint8Array`, o outro passa a string). Qualquer correção feita numa não
chega na outra.

**Correção:** o Onboarding deve chamar `/api/push/subscribe`, checar `resp.ok`
e mostrar erro — o mesmo tratamento que o Momento já tem. Depois, apagar o POST
de `/api/notify`.

### 29 lugares que descartam o erro do Supabase

Padrão repetido em todo o projeto:

```ts
const { data } = await supabase.from('x').select(...)
```

Quando a consulta falha, `data` vem `null` e o código segue como se não
houvesse registros. Nenhum log, nenhum erro na tela. Os que mais importam são
os que rodam **sem ninguém olhando**:

| arquivo | linha | o que acontece se falhar |
|---|---|---|
| `app/api/push/send/route.ts` | 52 | consulta de assinaturas falha → `inicioPor` vazio → **ninguém recebe o lembrete**, e o cron reporta `enviados: 0` como se fosse normal |
| `app/api/push/send/route.ts` | 81 | consulta de conteúdo falha → todo mundo recebe o lembrete **sem a voz do dia**, só "Seu momento de hoje está aqui" |
| `app/api/notify/route.ts` | 118 | mesma coisa, na rota antiga |

As duas primeiras são **código meu, de duas semanas atrás**. Escrevi a rota
nova do lembrete repetindo o padrão que estava criticando. Vale corrigir
primeiro, porque é a rota que roda todo dia às 6h30 sem supervisão.

Os outros 26 estão em telas (`dashboard`, `missoes`, `diario-bordo`,
`ferramentas/page`) — ali a falha aparece como "lista vazia", que pelo menos
alguém vê.

**Correção:** nos três de API, desestruturar `{ data, error }` e, se `error`,
logar e devolver 500 em vez de seguir. Nas telas, pode ficar para depois.

---

## 2. Código morto — 2.706 linhas que ninguém importa

Verificado por import **e** por qualquer menção ao nome em `src/`. Zero
referências fora do próprio arquivo:

| arquivo | linhas | o que era |
|---|---|---|
| `components/dashboard/AnaliseIA.tsx` | 920 | o "IA" que é um dicionário de palavras — nunca ligado a nada |
| `components/dashboard/MomentoKairosCard.tsx` | 652 | o Momento antigo, substituído por `app/momento/page.tsx` |
| `components/dashboard/MissaoDia.tsx` | 371 | missão do dia, versão anterior |
| `components/dashboard/PhaseProgress.tsx` | 200 | progresso com 75/40/20/5 fixos no código |
| `components/dashboard/VitalityScore.tsx` | 181 | |
| `components/landing/Solucao.tsx` | 181 | seção da landing que saiu |
| `components/dashboard/StreakBar.tsx` | 134 | |
| `components/dashboard/ScoreDiario.tsx` | 36 | |
| `lib/stripe.ts` | 31 | as rotas importam `stripe` direto |

Dois bônus: `StreakBar` e `VitalityScore` estavam na lista de "dourados
antigos fora das ferramentas". Apagando, somem de lá também.

E a rota `GET /api/notify` (o segundo disparador de push, que aponta para
`/ferramentas/diario-bordo` com mensagem de "seu dia ainda não foi
registrado") **não está agendada em lugar nenhum**. Só `/api/push/send` está
no cron. Ou se decide que ela é o lembrete da noite e se agenda, ou se apaga.

**Correção:** `git rm` dos nove arquivos, rodar `tsc`. Se compilar, estavam
mortos mesmo. São 2.706 linhas a menos e zero risco.

---

## 3. O que está frágil, por ordem

**a) `roda_vida` sem policy de UPDATE** — pendência conhecida desde a auditoria
de RLS. Hoje o usuário consegue criar e ler, mas um `update` falha. Se alguma
tela tentar atualizar, cai no padrão do item 1: `data` null, silêncio.

**b) A notificação depende de 5 variáveis de ambiente na Vercel** (`CRON_SECRET`,
`VAPID_PRIVATE_KEY`, `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_MAILTO`,
`SUPABASE_SERVICE_ROLE_KEY`). Se qualquer uma sumir num redeploy, o cron
devolve 503 e ninguém fica sabendo — não há alerta. Não é bug; é ausência de
observação. Um `console.error` já existe; o que falta é alguém ler o log.

**c) `FerramentaLayout.tsx` — 1.357 linhas, 15 telas, zero teste.** Mas vale
dizer o que a leitura mostrou: **o salvamento dele está correto**. Checa o
retorno, tem `catch`, mostra "error" na tela. Não é ponto de falha silenciosa.
O risco dele é outro — é tamanho, não comportamento.

---

## 4. Testar o FerramentaLayout — vale, e como

Vale, mas não do jeito óbvio. Testar 1.357 linhas de JSX com renderização é
caro e frágil. O que dá para testar barato é a **lógica que está misturada com
o JSX** e que pode ser extraída sem mudar nada na tela:

- `getMensagem()` — as regras de banner por etapa
- a máquina de estados do salvamento (`idle → saving → saved | error → idle`)
- o cálculo de progresso

Cada uma vira uma função pura em `lib/`, testada como as outras 164. O layout
passa a chamar essas funções. Depois disso, mexer no arquivo deixa de ser
cirurgia sem anestesia.

É o mesmo padrão que já funciona no projeto: toda decisão em `lib/`, pura e
testada; a tela só exibe.

---

## Ordem que eu seguiria

1. **Onboarding** — trocar a rota, checar `resp.ok`, mostrar erro. 20 linhas.
2. **`push/send/route.ts`** — tratar os dois erros do Supabase. 10 linhas.
   É a rota das 6h30.
3. **Apagar os 9 mortos** — 2.706 linhas, `tsc` como prova.
4. **`roda_vida` UPDATE policy** — uma migração SQL.
5. Extrair a lógica do FerramentaLayout para `lib/` — quando houver motivo
   para mexer nele, não antes.
