# Registro de trabalho — 03 e 04 de agosto de 2026

Sessão de auditoria de segurança e primeira funcionalidade de "sistema".
Ponto de partida: commit `6caf067`. Ponto de chegada: `3d5bf42`.
Oito commits, 24 arquivos, +1.455 / −1.569 linhas.

Documento companheiro: [`ANALISE-PROJETO.md`](./ANALISE-PROJETO.md) tem o diagnóstico completo.
Este aqui é o registro do que foi **feito**.

---

## Estado atual

**Enviado ao GitHub:** até `e0823bf`.
**Pendente de push:** `3d5bf42` (próximas ações).

Antes do próximo build, na pasta `frontend/`:

```bash
npm install     # obrigatório: node_modules ficou parcial e o lock não tem vitest
npm test        # 19 testes
npm run build
```

Depois, na raiz: `git push`.

---

## Os oito commits

| Commit | O que fez |
|---|---|
| `7791c87` | Paywall server-side, IDOR do `/api/notify`, webhook, limpeza, CI |
| `d020d06` | Atualização da análise |
| `2e0da5d` | RLS de `momento_kairos` e `push_subscriptions` |
| `b1a72f7` | **Revert** — `proxy.ts` estava certo o tempo todo |
| `be1c2da` | Correção do item 1 da análise |
| `43eb610` | IDOR do `/api/push/subscribe`, falha aberta no cron |
| `e0823bf` | Remove "Davilson" hardcoded |
| `3d5bf42` | Próximas ações calculadas de verdade + primeiros testes |

---

## Segurança — o que estava aberto e como foi fechado

### 1. Paywall burlável pelo próprio usuário

`subscriptions` tinha policies de INSERT e UPDATE para o cliente. Com a anon key
(pública, vai no bundle) e o JWT legítimo do Clerk, qualquer usuário rodava no console:

```js
supabase.from('subscriptions').update({ status: 'active' }).eq('user_id', meuId)
```

E tinha acesso vitalício grátis. Pelo INSERT dava para o mesmo efeito escolhendo
um `trial_ends_at` em 2099.

**Correção:** o cliente só lê. Toda escrita passa pelo servidor.

- Nova rota `frontend/src/app/api/subscription/route.ts` — cria o trial com
  service-role e prazo calculado no servidor.
- `frontend/src/lib/subscription.ts` — `startTrial()` chama a rota em vez de
  escrever no banco.
- SQL aplicado: `frontend/scripts/fix-rls-subscriptions.sql`

### 2. Conteúdo do produto aberto sem login

`momento_kairos` tinha `USING (true)` no role `public`. Não era vazamento de dado
pessoal — a tabela não tem `user_id`, é o conteúdo editorial dos seeds. Mas o
conteúdo **é** o produto: qualquer um baixava os 12 meses de voz do dia e missões,
inclusive o conteúdo futuro, sem login e sem pagar.

**Correção:** policy exige `authenticated` + trial válido ou assinatura ativa, e
limita `data <= current_date + 1`. Isso põe o paywall dentro do Postgres.

- SQL aplicado: `frontend/scripts/fix-rls-conteudo.sql`
- Verificado com: `curl` na REST API com a anon key retornou `[]`

### 3. Dois IDOR nas rotas de push

`/api/notify` e `/api/push/subscribe` liam `userId` do body e gravavam com
service-role, sem autenticação. Qualquer pessoa sobrescrevia a push subscription
de qualquer usuário.

O segundo eu só encontrei na segunda passada, depois que a lista de rotas do
build me chamou atenção.

**Correção:** as duas pegam o `userId` de `auth()` do Clerk e ignoram o body.
`momento/page.tsx` parou de enviar `userId`.

**Bug de brinde:** o cliente nunca enviava `userId` para o `/api/notify`, então
todas as inscrições caíam em `user_id = 'anonymous'` — coluna UNIQUE. Só um
dispositivo no sistema inteiro recebia a notificação diária.

### 4. Cron com falha aberta

O GET de `/api/notify` só checava o `CRON_SECRET` **se** a variável existisse.
Sem ela no ambiente, rota aberta. Agora falha fechada com 503.

### 5. Webhook do Stripe

- **Idempotência** por `event.id` na nova tabela `stripe_events`. O Stripe reenvia
  eventos e não garante ordem; um `subscription.updated` antigo podia chegar depois
  de um cancelamento e reativar o acesso.
- **Fallback** por `stripe_subscription_id` / `stripe_customer_id` quando falta
  `metadata.userId`. Antes, cancelamento pelo customer portal era descartado em
  silêncio e o acesso continuava ativo.
- Mapeia também `trialing`, `unpaid`, `incomplete_expired`.
- Loga quando nenhuma linha é afetada.

### 6. Auditoria de RLS — as quatro tabelas

Feita direto no banco, porque o schema não está versionado.

| Tabela | Situação |
|---|---|
| `diario_kairos` | Já estava correta: `ALL` com `user_id = auth.jwt() ->> 'sub'` |
| `momento_kairos` | Aberta — corrigida |
| `push_subscriptions` | Usava `auth.uid()`, que faz cast para uuid; IDs do Clerk (`user_2abc...`) não são uuid, então nunca casava. Falha fechada, sem brecha, mas quebrada. Alinhada com `auth.jwt() ->> 'sub'` |
| `subscriptions` | Reescrita |

---

## O erro que eu cometi

Apresentei como achado mais grave que o `clerkMiddleware` nunca rodava, porque o
arquivo se chamava `proxy.ts` em vez de `middleware.ts`. **Estava errado.**

No Next.js 16 o `middleware.ts` foi renomeado para `proxy.ts`. `proxy.ts` é a
convenção atual. As rotas sempre estiveram protegidas. O commit antigo que migrou
`middleware.ts → proxy.ts` estava certo, e eu li aquele vai-e-vem de renomeações
como confusão quando era o oposto.

Quem derrubou o diagnóstico foi o `npm run build`:

```
⚠ The "middleware" file convention is deprecated. Please use "proxy" instead.
```

Revertido em `b1a72f7`. Fica registrado porque é a lição prática da sessão:
**verifique rodando.** O build derrubou um achado falso e a lista de rotas do
build revelou um achado verdadeiro que eu tinha deixado passar.

---

## Próximas ações calculadas de verdade

O `NextActions.tsx` tinha uma lista fixa escrita à mão — os mesmos seis itens para
todo usuário, para sempre. "Completar as 3 últimas perguntas do SWOT" aparecia
para quem nunca abriu o SWOT. O componente que deveria responder "o que faço
agora" era o único do produto que não olhava para o usuário.

### Arquivos

- **`frontend/src/lib/proximosPassos.ts`** — o motor. Regras puras, sem React nem
  Supabase. A data "hoje" é parâmetro, não `Date.now()` escondido — é o que torna
  as regras testáveis. Contém também o catálogo `FERRAMENTAS` (16 ferramentas,
  código, slug, fase, frequência).
- **`frontend/src/hooks/useProximosPassos.ts`** — só I/O. Busca
  `ferramentas_respostas` e os últimos 40 dias de `diario_kairos`, entrega ao motor.
- **`frontend/src/components/dashboard/NextActions.tsx`** — mesmo visual de antes,
  mais o motivo de cada sugestão e os estados de carregando / erro / tudo-em-dia.
- **`frontend/src/lib/proximosPassos.test.ts`** — 19 testes.

### As regras, em ordem de precedência

1. **Diário de hoje em aberto.** É o hábito que sustenta o resto.
2. **Ferramenta começada e não terminada**, ordenada por quem está mais perto do
   fim. Fechar o que está aberto vem antes de abrir coisa nova.
3. **Próxima da jornada** — a primeira não feita, na ordem das fases. Uma por vez:
   a lista dá direção, não dever de casa acumulado.
4. **Resposta vencida**, usando a frequência declarada no catálogo como régua.
   Uma ferramenta anual não vence em 100 dias; uma semanal vence.

### O princípio

**Se não dá para explicar por que a sugestão apareceu, ela não aparece.** Todo
item carrega um `motivo` visível: "Você parou em 60%", "Você fechou a Fase 1.
Esta abre a Fase 2", "Respondida há 3 meses — você mudou desde então".

Uma escolha de tom que vale revisar: depois de uma ausência longa a mensagem é
"Seu último registro foi há mais de 7 dias. Recomeçar hoje já conta" — não "você
quebrou sua sequência". Num produto sobre mudança pessoal, a diferença entre
acolher e cobrar decide se a pessoa volta. Se discordar, é uma linha em
`proximosPassos.ts`.

---

## Infraestrutura

- **`.github/workflows/ci.yml`** — typecheck, testes e build bloqueantes; lint
  como não-bloqueante (há 171 erros pré-existentes).
- **`.gitignore`** na raiz — `.bak`, `.DS_Store`, `.claude/`, `.env*`.
- **`vitest.config.ts`** — testes só em `src/**/*.test.ts`, ambiente node.
- Removidos: 4 arquivos `.bak` versionados, `.DS_Store`, pasta órfã `src/` na raiz.

---

## O que continua pendente

**Estrutural, decidir antes de codar**

- [ ] O conteúdo é um calendário de 2026 e acaba em 31/12. Quem assina hoje entra
      no meio de uma jornada de fases. Considerar ancorar em `dia_da_jornada`
      (1–365) em vez de `data`, transformando a biblioteca num currículo permanente.

**Técnico**

- [ ] `roda_vida` não tem policy de UPDATE — updates falham em silêncio.
- [ ] Exportar o schema completo (`supabase db dump`) e versionar migrations.
      Foi a ausência disso que escondeu os três problemas de RLS.
- [ ] 171 erros de lint; remover o `continue-on-error` do CI quando zerar.
- [ ] ~15k linhas duplicadas entre as 17 ferramentas — virar config declarativa.
- [ ] Tudo é client component; nenhum server component.
- [ ] `PhaseProgress.tsx` tem percentuais hardcoded (75/40/20/5). É código morto,
      não está sendo importado. Apagar antes que alguém use.
- [ ] `AnaliseIA.tsx` não usa IA — é análise por dicionário de palavras. Ou
      renomear, ou tornar IA de verdade.

**Produto — o próximo passo combinado**

- [ ] Primeira ferramenta a ler a resposta de outra: **OKRs ↔ Bússola de Valores**.
      Ao definir um objetivo, mostrar os valores escolhidos e perguntar a qual
      deles esse objetivo serve. Se não serve a nenhum, isso é um dado.

---

## Comandos úteis

```bash
# desenvolvimento
cd ~/Desktop/saas-transformacao-pessoal/frontend
npm run dev

# antes de qualquer push
npm test && npm run build

# ver o que mudou nesta sessão
cd ~/Desktop/saas-transformacao-pessoal
git log --oneline 6caf067..HEAD
git diff 6caf067..HEAD -- frontend/src

# testar se o conteúdo está protegido (deve retornar [])
cd frontend
URL=$(grep '^NEXT_PUBLIC_SUPABASE_URL=' .env.local | cut -d= -f2- | tr -d '"')
KEY=$(grep '^NEXT_PUBLIC_SUPABASE_ANON_KEY=' .env.local | cut -d= -f2- | tr -d '"')
curl -s "$URL/rest/v1/momento_kairos?select=data&limit=1" -H "apikey: $KEY"
```
