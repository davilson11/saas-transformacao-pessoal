# Verificação — `roda_vida` e a policy de UPDATE

Data: 2026-11-16. Pendência fechada **sem alteração no banco**.

Duas auditorias anteriores (`fix-rls-conteudo.sql`, `fix-rls-subscriptions.sql`)
registravam: "falta policy de UPDATE em `roda_vida`; qualquer update falha em
silêncio". A nota estava desatualizada.

---

## 1. Configuração inspecionada no banco

Via SQL Editor, somente leitura, resultado lido em captura de tela.

### `pg_policies` para `tablename = 'roda_vida'` — 6 linhas

| policyname | cmd | roles | using (qual) | with_check |
|---|---|---|---|---|
| `user_own_roda_vida` | ALL | `{public}` | `user_id = (auth.jwt() ->> 'sub')` | NULL |
| `usuario ve seus dados` | ALL | `{public}` | `user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub')` | NULL |
| `delete_own` | DELETE | `{public}` | `(auth.jwt() ->> 'sub') = user_id` | NULL |
| `insert_own` | INSERT | `{public}` | NULL | `(auth.jwt() ->> 'sub') = user_id` |
| `select_own` | SELECT | `{public}` | `(auth.jwt() ->> 'sub') = user_id` | NULL |
| **`update_own`** | **UPDATE** | `{public}` | `(auth.jwt() ->> 'sub') = user_id` | NULL |

Conclusões diretas dessa leitura:

- **A policy de UPDATE existe** (`update_own`).
- **Nenhuma usa `auth.uid()`.** Todas comparam `user_id` com o `sub` do JWT —
  o formato correto para ids do Clerk (`user_2abc...`), que não são UUID.
- `insert_own` tem `using = NULL` e `with_check` preenchido — correto para
  INSERT, onde só o WITH CHECK se aplica.
- Nas policies de UPDATE e ALL, `with_check = NULL` significa que o Postgres
  reaproveita o USING para a linha nova. Comportamento esperado.
- `usuario ve seus dados` usa a forma antiga (`current_setting(...)`), que é
  funcionalmente equivalente a `auth.jwt()`.

### `information_schema.columns` — 11 colunas

`id uuid NOT NULL`, **`user_id text NOT NULL`**, oito colunas `integer`
(saude, carreira, financas, relacionamentos, lazer, espiritualidade, familia,
crescimento), `created_at timestamptz`.

O tipo `text` de `user_id` confirma que `auth.jwt() ->> 'sub'` (que devolve
text) é a comparação certa.

### Segunda rodada — `schemaname`, `permissive`, RLS

Rodada na mesma data, depois da primeira. Resultado:

| schemaname | permissive | roles | para as 6 |
|---|---|---|---|
| `public` | `PERMISSIVE` | `{public}` | ✓ todas |

E em `pg_class`:

| schema | tabela | relrowsecurity | relforcerowsecurity |
|---|---|---|---|
| `public` | `roda_vida` | **true** | false |

Conclusões:

- **RLS está habilitado** na tabela. Não está forçado — irrelevante, porque o
  app nunca conecta como dono da tabela (usa o token do Clerk via anon key, ou
  a service-role, que ignora RLS por definição).
- **As seis são permissivas**, então se combinam por OU. Isso confirma a
  observação da seção 4: enquanto `user_own_roda_vida` e `usuario ve seus
  dados` (ambas `ALL`) existirem, qualquer restrição futura numa das quatro por
  comando não terá efeito.

---

## 2. Comportamento verificado no código (leitura de `src/`)

- `src/lib/queries.ts` tem três funções para a tabela: `salvarRodaVida`
  (INSERT), `buscarRodaVida` (SELECT), `buscarHistoricoRodaVida` (SELECT).
- `grep -rn roda_vida src/` filtrado por `update|delete|upsert` — **zero
  ocorrências**. O aplicativo nunca atualiza nem apaga nessa tabela.
- O comentário de `salvarRodaVida` declara a intenção: *"append — histórico
  completo"*. Cada avaliação é um snapshot novo; o gráfico de evolução em
  `LifeWheel.tsx` depende disso.
- O token do Clerk chega via `getToken({ template: 'supabase' })` em
  `useSupabaseClient.ts`; o `sub` desse JWT é o `user.id` do Clerk — o mesmo
  valor gravado em `user_id`.

Portanto: ainda que a policy de UPDATE não existisse, **nada no app falharia**,
porque nada tenta atualizar.

---

## 3. Comportamento testado pelo aplicativo

**Nenhum, nesta verificação.** Não foi feito INSERT nem SELECT em `roda_vida`
pelo app para confirmar as policies em execução. O que existe de evidência
indireta: a tela do dashboard renderiza o `LifeWheel`, que lê a tabela, e o
Davilson usa o app diariamente há 45 dias sem erro reportado nessa tela — mas
isso não foi observado nesta sessão.

Para testar de fato: abrir `/dashboard`, salvar uma Roda da Vida, e confirmar
no SQL Editor que a linha nova tem o `user_id` esperado:

```sql
SELECT user_id, created_at FROM roda_vida ORDER BY created_at DESC LIMIT 3;
```

---

## 4. O que ficou de observação (não é correção)

As duas policies `ALL` tornam as quatro por comando redundantes: policies
permissivas se somam por OU, então uma restrição futura em `select_own`,
por exemplo, **não teria efeito** enquanto `user_own_roda_vida` existir. Hoje
todas restringem ao próprio `user_id`, então não há risco presente.

A limpeza (dropar as duas `ALL`) está agora **apoiada em fato inspecionado**:
seis permissivas, RLS ligado. É opcional — não corrige nada que esteja errado
hoje — e **não foi executada**. Decisão do Davilson, quando quiser.

---

## 5. Consultas usadas — só leitura, para repetir no futuro

```sql
-- policies com schema e permissive
SELECT schemaname, policyname, permissive, roles, cmd,
       qual AS using_expr, with_check AS check_expr
  FROM pg_policies
 WHERE tablename = 'roda_vida'
 ORDER BY cmd, policyname;

-- RLS habilitado / forçado
SELECT n.nspname AS schema, c.relname AS tabela,
       c.relrowsecurity AS rls_habilitado,
       c.relforcerowsecurity AS rls_forcado
  FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
 WHERE c.relname = 'roda_vida';

-- tipos das colunas
SELECT column_name, data_type, is_nullable
  FROM information_schema.columns
 WHERE table_name = 'roda_vida'
 ORDER BY ordinal_position;
```

Resultado em 2026-11-16: seis `public`/`PERMISSIVE`; `rls_habilitado = true`,
`rls_forcado = false`; `user_id text NOT NULL`.

## 6. Único ponto ainda sem teste

O comportamento das policies **em execução pelo app** — um INSERT e um SELECT
reais em `roda_vida` com o token do Clerk — não foi observado nesta sessão.
Seção 3 diz como testar. Tudo o mais está inspecionado.
