# Análise — SaaS Transformação Pessoal

**Data:** 03/08/2026 · **Commit analisado:** `6caf067` · **Tamanho:** ~34.850 linhas TS/TSX em `frontend/src`

## Stack

Next.js 16.2.1 (App Router, React 19.2 + React Compiler) · Clerk (auth) · Supabase (Postgres + RLS) · Stripe (assinaturas) · Tailwind 4 · web-push (PWA) · deploy Vercel.

Produto: 17 ferramentas de autoconhecimento + dashboard, diário Kairos, missões, mapa, trial de 7 dias e paywall mensal/anual.

---

## 🔴 Crítico

### 1. Nenhum middleware de autenticação está ativo

O arquivo `frontend/src/proxy.ts` contém um `clerkMiddleware` correto — mas o Next.js **só** reconhece `middleware.ts` (na raiz ou em `src/`). Como o arquivo se chama `proxy.ts`, ele nunca é executado.

Consequência: **zero proteção de rota no edge**. Toda a autenticação depende de guards client-side (`useUser()` dentro de `'use client'`), que rodam depois do HTML ser servido e são triviais de contornar.

O histórico mostra que isso foi um vai-e-vem de 8 commits:

```
1bf5f22 fix: renomeia middleware.ts para proxy.ts      ← estado atual (quebrado)
fa259b3 feat: adiciona middleware de autenticação Clerk
0cf5aa4 fix: move middleware para raiz do projeto
a0ceb75 fix: remover middleware.ts duplicado — usar apenas proxy.ts
7d1accf fix: substitui middleware.ts por proxy.ts e corrige conflito Next.js 16
```

O "conflito do Next.js 16" que motivou a renomeação provavelmente era outra coisa (middleware duplicado em dois níveis). A correção certa é ter **um único** `frontend/src/middleware.ts`.

**Correção:** `git mv frontend/src/proxy.ts frontend/src/middleware.ts` e garantir que não exista outro middleware na raiz.

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

### 4. Schema do banco não está versionado por completo

`supabase-schema.sql` cobre apenas `visao_ancora`, `ferramentas_respostas` e `roda_vida`. Mas o código consulta também `diario_kairos`, `momento_kairos`, `subscriptions` e `push_subscriptions`. As duas tabelas mais usadas do app (`diario_kairos`, `momento_kairos`) **não têm definição nem policy de RLS em lugar nenhum do repositório** — impossível auditar, e impossível recriar o ambiente.

Verifique no dashboard do Supabase se essas tabelas têm RLS habilitada. Se não tiverem, qualquer usuário autenticado lê o diário de todos os outros — dado altamente sensível num app de transformação pessoal (LGPD).

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
| **`exhaustive-deps` desabilitado** | 22 arquivos com `eslint-disable` de hooks. Com **React Compiler ligado** isso é arriscado: o compiler memoiza assumindo deps corretas. |
| **Design tokens** | Cores hardcoded (`GOLD = '#C8A030'`, `DARK`, `CREAM`) repetidas em vários componentes, apesar do Tailwind 4 instalado. |
| **Cache de client Supabase** | `authClientCache` é um `Map` por token, sem expiração — cresce a cada refresh de JWT. Vazamento pequeno mas real em sessões longas. |
| **Histórico de commits** | 197 commits, esmagadora maioria `fix:` de bugs recém-introduzidos. Sintoma da ausência de testes/CI. |

**Positivo:** `strict: true` no TypeScript, zero `: any` no código, apenas 6 `console.log`, webhook do Stripe valida assinatura corretamente, `/api/checkout` pega o `userId` do servidor em vez de confiar no cliente, e `/api/push/send` é protegido por `CRON_SECRET`. Segredos não estão versionados (`.env*` no gitignore, confirmado com `git ls-files`).

---

## Ordem de ataque sugerida

1. **Hoje:** renomear `proxy.ts` → `middleware.ts` (item 1).
2. **Hoje:** autenticar `POST /api/notify` (item 3).
3. **Esta semana:** fechar a RLS de `subscriptions` (item 2) e auditar RLS de `diario_kairos` / `momento_kairos` (item 4).
4. **Esta semana:** exportar o schema completo do Supabase para o repo (`supabase db dump`) e passar a versionar migrations.
5. **Depois:** idempotência + fallback no webhook (itens 6 e 7).
6. **Contínuo:** limpar `.bak`/`.DS_Store`, adicionar CI com `next build` + `eslint`, e começar testes pelos módulos de dinheiro (`subscription.ts`, webhook).
