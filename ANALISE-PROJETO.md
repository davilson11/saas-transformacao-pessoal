# Análise — SaaS Transformação Pessoal

**Data:** 03/08/2026 · **Commit analisado:** `6caf067` · **Tamanho:** ~34.850 linhas TS/TSX em `frontend/src`

> **Status em 03/08/2026, 23h55:** o item 1 era alarme falso e foi revertido — leia a correção abaixo.
> Os demais itens críticos e altos estão fechados. Código nos commits `7791c87` e `b1a72f7`
> (ainda **sem push**); os dois scripts SQL em `frontend/scripts/` já foram aplicados em produção.
> `npm run build` passou. Falta: dar push e a policy de UPDATE em `roda_vida`.

## Stack

Next.js 16.2.1 (App Router, React 19.2 + React Compiler) · Clerk (auth) · Supabase (Postgres + RLS) · Stripe (assinaturas) · Tailwind 4 · web-push (PWA) · deploy Vercel.

Produto: 17 ferramentas de autoconhecimento + dashboard, diário Kairos, missões, mapa, trial de 7 dias e paywall mensal/anual.

---

## 🔴 Crítico

### 1. ~~Nenhum middleware de autenticação está ativo~~ — ❌ ALARME FALSO

**Este item estava errado.** Fica registrado como correção do relatório.

Eu afirmei que o `clerkMiddleware` em `frontend/src/proxy.ts` nunca era executado, porque o Next.js só reconheceria `middleware.ts`. É o contrário: no **Next.js 16 o `middleware.ts` foi renomeado para `proxy.ts`**. `proxy.ts` é a convenção atual; `middleware.ts` é o nome deprecado.

O build deixa isso explícito:

```
⚠ The "middleware" file convention is deprecated. Please use "proxy" instead.
...
ƒ Proxy (Middleware)
```

Ou seja: **as rotas sempre estiveram protegidas no edge.** O commit `7d1accf` ("substitui middleware.ts por proxy.ts e corrige conflito Next.js 16") era uma migração correta, e eu li o vai-e-vem de renomeações como confusão quando era o oposto.

A renomeação que fiz em `7791c87` foi revertida em `b1a72f7`. O arquivo correto é `frontend/src/proxy.ts`.

**Lição para o restante deste relatório:** o diagnóstico veio de leitura estática do código sem rodar o build. Os demais itens foram verificados contra o banco de dados real ou contra o comportamento do código, mas vale ceticismo com qualquer conclusão que dependa de convenção de framework.

### 2. Paywall pode ser burlado pelo próprio usuário (RLS)

Em `scripts/create-subscriptions.sql`:

```sql
CREATE POLICY "Atualização própria"
  ON subscriptions FOR UPDATE
  USING (user_id = auth.jwt() ->> 'sub');
```

Essa policy permite ao usuário atualizar **qualquer coluna** da própria linha — inclusive `status` e `trial_ends_at`. Com a anon key (que é pública, embutida no bundle) e o JWT legítimo do Clerk, qualquer usuário roda:

```js
await supabase.from('subscriptions')
  .update({ status: 'active', plan: 'anual' })
  .eq('user_id', meuId)
```

…e tem acesso vitalício sem pagar. O paywall (`hasAccess`) é avaliado 100% no cliente a partir dessa linha.

**Correção:** o usuário só deveria poder INSERT do próprio trial. `status`, `plan` e campos `stripe_*` devem ser escritos exclusivamente pelo webhook (service-role). Remova a policy de UPDATE e mova a criação do trial para uma rota server-side, ou use um trigger `BEFORE UPDATE` que rejeite mudanças em colunas sensíveis vindas do role `authenticated`.

### 3. IDOR em `POST /api/notify`

```ts
const { subscription, userId } = body;   // userId vem do cliente
await supabaseAdmin.from('push_subscriptions')
  .upsert({ user_id: userId ?? 'anonymous', subscription },
          { onConflict: 'user_id' });
```

A rota não valida sessão e usa o **service-role client** com um `userId` fornecido pelo requisitante. Qualquer pessoa na internet pode sobrescrever a push subscription de qualquer usuário — sequestrando as notificações dele (ou apenas apagando-as).

**Correção:** `const { userId } = await auth();` do Clerk, retornar 401 se ausente, e ignorar o `userId` do body.

---

## 🟠 Alto

### 4. Schema do banco não está versionado por completo — ✅ auditado

`supabase-schema.sql` cobre apenas `visao_ancora`, `ferramentas_respostas` e `roda_vida`. Mas o código consulta também `diario_kairos`, `momento_kairos`, `subscriptions` e `push_subscriptions` — sem definição nem policy versionada.

Auditoria feita direto no banco em 03/08. RLS habilitada nas quatro tabelas. Resultado por tabela:

- **`diario_kairos`** — correta. `ALL` com `USING (user_id = auth.jwt() ->> 'sub')`. Era o maior risco (dado pessoal sensível, LGPD) e estava fechado.
- **`momento_kairos`** — tinha `USING (true)` aberta ao role `public`. Não é dado pessoal (a tabela não tem `user_id`; é o conteúdo editorial do produto), então não houve vazamento de usuário. Mas o conteúdo — que é o produto — estava acessível sem login e sem pagar, via anon key, inclusive o conteúdo futuro. Corrigido em `scripts/fix-rls-conteudo.sql`, que de quebra move o paywall para dentro do banco.
- **`push_subscriptions`** — usava `auth.uid()`, que converte o `sub` do JWT para uuid. Os IDs do Clerk (`user_2abc...`) não são uuid, então a policy nunca casava. Falha fechada, não era brecha, mas quebraria qualquer leitura client-side. Alinhada com `auth.jwt() ->> 'sub'`.
- **`subscriptions`** — reescrita conforme o item 2.

**Pendente:** exportar o schema completo (`supabase db dump`) e versionar migrations. Hoje o banco é a única fonte de verdade, e foi por isso que esses três problemas passaram despercebidos.

### 5. `roda_vida` sem policy de UPDATE

Tem SELECT, INSERT e DELETE, mas não UPDATE. Ou o código faz delete+insert (funciona, mas perde histórico), ou há um update falhando silenciosamente.

### 6. Webhook do Stripe ignora eventos sem `metadata.userId`

`customer.subscription.updated` e `.deleted` só agem se `sub.metadata?.userId` existir. Se o metadata se perder (assinatura criada pelo dashboard do Stripe, migração de plano, portal do cliente), o evento é descartado **em silêncio** — um cancelamento não rebaixa o acesso.

**Correção:** fallback por `stripe_subscription_id` / `stripe_customer_id`, como já é feito nos eventos de `invoice`.

### 7. Webhook sem idempotência

Não há registro de `event.id` processado. O Stripe reenvia eventos, e a ordem não é garantida — um `subscription.updated` antigo pode chegar depois e reverter o status. Grave os `event.id` numa tabela e ignore duplicados.

### 8. Nenhuma rota de API verifica assinatura

`/api/checkout` valida sessão (bom), mas nenhuma rota valida se o usuário tem acesso ativo. Combinado com o item 2, a monetização não tem nenhuma barreira server-side.

---

## 🟡 Médio — qualidade e manutenção

| Item | Situação |
|---|---|
| **Testes** | Zero. Nenhum arquivo `.test.`, `.spec.`, jest, vitest ou playwright em 34.8k linhas. |
| **CI** | Nenhum `.github/workflows`. Nada roda lint/build antes do deploy. |
| **Arquivos `.bak` versionados** | `dashboard/page.tsx.bak`, `dashboard/page.tsx 2.bak`, `momento/page.tsx.bak`, `useSupabaseClient.ts.bak` — todos no git. |
| **Lixo no repo** | `.DS_Store` versionado; pasta órfã `src/components/landing/Hero.tsx` na raiz (0 bytes), fora do `frontend/`. |
| **Arquivos gigantes** | `perfil/page.tsx` 1574 linhas · `FerramentaLayout.tsx` 1357 · `mapa/page.tsx` 1338 · `arquiteto-rotinas` 1258. |
| **Duplicação massiva** | As 17 ferramentas somam ~15k linhas com estrutura quase idêntica (form → estado → salvar em `ferramentas_respostas`). Candidato forte a virar config declarativa + um renderizador. |
| **Tudo client-side** | Todas as páginas são `'use client'`. Nenhum Server Component. É a raiz do problema de auth (item 1) e infla o bundle. |
| **Lint com 171 erros** | `eslint src` acusa 171 erros e 12 warnings: 114 `no-explicit-any`, 30 `no-unescaped-entities`, 20 `set-state-in-effect`, além de `react-hooks/refs` em `useSupabaseClient.ts` (grava em ref durante o render). Com **React Compiler ligado**, os erros de `react-hooks/*` são risco real de bug, não estilo. |
| **`exhaustive-deps` desabilitado** | 22 arquivos com `eslint-disable` de hooks — o compiler memoiza assumindo deps corretas. |
| **Design tokens** | Cores hardcoded (`GOLD = '#C8A030'`, `DARK`, `CREAM`) repetidas em vários componentes, apesar do Tailwind 4 instalado. |
| **Cache de client Supabase** | `authClientCache` é um `Map` por token, sem expiração — cresce a cada refresh de JWT. Vazamento pequeno mas real em sessões longas. |
| **Histórico de commits** | 197 commits, esmagadora maioria `fix:` de bugs recém-introduzidos. Sintoma da ausência de testes/CI. |

**Positivo:** `strict: true` no TypeScript, apenas 6 `console.log`, webhook do Stripe valida assinatura corretamente, `/api/checkout` pega o `userId` do servidor em vez de confiar no cliente, e `/api/push/send` é protegido por `CRON_SECRET`. Segredos não estão versionados (`.env*` no gitignore, confirmado com `git ls-files`).

---

## Ordem de ataque

- [x] ~~Item 1 — middleware~~ (alarme falso, revertido)
- [x] Item 3 — autenticar `POST /api/notify`
- [x] Item 2 — fechar a RLS de `subscriptions`
- [x] Item 4 — auditar RLS de `diario_kairos` / `momento_kairos` / `push_subscriptions`
- [x] Itens 6 e 7 — idempotência + fallback no webhook
- [x] Limpar `.bak` / `.DS_Store`, adicionar CI
- [ ] **Dar push** (nada foi enviado ao GitHub ainda)
- [ ] Item 5 — policy de UPDATE em `roda_vida`
- [ ] Exportar o schema completo do Supabase (`supabase db dump`) e versionar migrations — foi a ausência disso que escondeu os problemas de RLS
- [ ] Item 8 — verificação de assinatura nas rotas de API (parcialmente coberto: a RLS de `momento_kairos` agora barra o conteúdo no banco)
- [ ] Zerar o passivo de 171 erros de lint e remover o `continue-on-error` do CI
- [ ] Testes, começando pelos módulos de dinheiro (`subscription.ts`, webhook)
