# Validação do fluxo de notificação — produção

Data: 2026-11-16, noite. Ambiente: `https://www.meukairos.com.br`, deploy
`5e84787` (contém `3fdfcf2`, a correção do Onboarding e do `push/send`).
Aparelho de teste: Mac, Chrome, com DevTools. Restauração final no iPhone (PWA).

Conduzido etapa por etapa, com resultado conferido antes de cada avanço.
Nenhum código alterado, nenhum arquivo apagado, nenhuma escrita manual no
banco. Todas as consultas foram somente leitura.

---

## Resultado

| # | o que foi testado | resultado |
|---|---|---|
| 1 | Reabrir o onboarding removendo **só** `kairos_onboarding_visto` | **passou** — 23 chaves restantes no localStorage; onboarding reapareceu |
| 2 | Ativação com sucesso e gravação no banco para o usuário correto | **passou** |
| 3 | Falha de rede: mensagem adequada, sem falso sucesso, com retry | **passou** |
| 4 | Nova tentativa com sucesso após restaurar a conexão | **passou** |
| 5 | Entrega de uma notificação no dispositivo | **não testada** — ver abaixo |
| 6 | Restauração da inscrição no iPhone, confirmada no banco | **passou** |

---

## Evidências, por etapa

### 2 · Ativação e gravação

- Linha de base no banco antes de agir: 1 linha, `user_3BmMC…`, host
  `web.push.apple.com` (inscrição do iPhone, de 7 de outubro).
- Clique em ativar no Chrome → permissão concedida → tela mostrou a caixa
  verde com o **texto novo**: *"Lembrete diário ativado — chega de manhã, com
  o seu dia da jornada."* (O texto antigo era "ativados às 20h".)
- Banco depois: 1 linha, mesmo `user_id`, mesmo `created_at`, host
  **`fcm.googleapis.com`**. O upsert trocou a inscrição, não criou outra.

Conclusão: a tela só disse "ativado" porque o servidor gravou. Não foi falso
sucesso.

### 3 · Falha de rede

- Onboarding reaberto; DevTools → Network → **Offline**; clique em ativar.
- Tela mostrou caixa **vermelha**: *"Sem conexão com o servidor. Tente de novo
  em instantes."*, com o link **"tentar de novo"**.
- Não mostrou verde (seria o bug antigo), nem "Notificações bloqueadas. Você
  pode ativar nas configurações do navegador" (seria a confusão antiga entre
  falha de rede e permissão negada).

### 4 · Retry

- Throttling de volta para **No throttling**; clique em "tentar de novo", sem
  recarregar.
- Tela voltou à caixa verde com o texto correto.
- Aba Network registrou **`subscribe` → 200** (1,81 s), logo depois da série
  de requisições que falharam no Offline.
- Banco: 1 linha, host `fcm.googleapis.com`. A tentativa falha não apagou nem
  corrompeu a linha.

### 6 · Restauração no iPhone

- No PWA (aberto pelo ícone), Momento → card "Lembrete diário" → Ativar.
- Tela mostrou **"Ativado neste aparelho"** — estado que só aparece após
  confirmação do servidor, não é lembrado entre sessões.
- Banco: 1 linha, host de volta para **`web.push.apple.com`**.

O lembrete das 6h30 volta a chegar no iPhone.

---

## O que não foi testado, e por quê

**Entrega de uma notificação no dispositivo.** A única rota de envio,
`/api/push/send`, dispara para **todas** as linhas de `push_subscriptions`. Não
existe disparo por usuário. No momento do teste havia exatamente 1 linha (a do
Davilson), então "todos" e "ele" coincidiam — mas isso é um fato do banco, não
uma garantia do código. Decisão: **não disparar**. Fica registrado como não
testado por ausência de mecanismo por usuário.

Evidência indireta de que a entrega funciona: o lembrete das 6h30 vem chegando
no iPhone desde 7 de outubro, e o disparo manual de 6 de outubro devolveu
`enviados: 1` e a notificação apareceu. Mas isso não foi reproduzido nesta
validação.

---

## Melhoria registrada — não implementada

**Endpoint de teste autenticado, por usuário, com limite de frequência.**

- Rota: `POST /api/push/test`.
- Autenticação pela **sessão do Clerk no servidor** (`auth()`), nunca por
  `userId` no corpo — mesma regra das rotas de inscrição.
- Envia **somente** para a linha de `push_subscriptions` cujo `user_id` é o da
  sessão. Zero linhas → 404 com mensagem clara, não 200 com `enviados: 0`.
- Limite de frequência: no máximo 1 disparo por usuário a cada N minutos
  (guardar `ultimo_teste_em` na própria linha ou numa tabela pequena). Acima
  do limite → 429.
- Corpo da notificação: o mesmo `montarLembrete()` da rota de produção, com
  prefixo "[teste]" no título, para a pessoa saber que foi ela que pediu.
- Botão "Enviar notificação de teste" no card do Momento, visível só com
  inscrição ativa.
- Testes: o pedaço puro (decisão de limite, montagem do corpo) em `lib/`,
  como o resto.

Com isso a entrega passa a ser testável **por construção**, sem depender de o
banco ter uma linha só.

---

## Achados laterais, fora do escopo desta rodada

Vistos no console durante o teste, sem ação tomada:

1. **`GET /manifest.json` → 404** em produção. Provável causa: o matcher do
   `proxy.ts` exclui `.js` (`js(?!on)`) mas **não** `.json`, então o manifesto
   passa pelo `auth.protect()` e o Clerk devolve 404 para a requisição sem
   sessão que o navegador faz. Afeta metadados do PWA (nome, ícone, cor de
   tema na instalação). O app instalado no iPhone já existe, então o efeito
   hoje é em instalações novas. Correção provável: adicionar `/manifest.json`
   às rotas públicas, ou `json` à lista de extensões excluídas — uma linha.
2. **"Multiple GoTrueClient instances detected"** — aviso do SDK do Supabase,
   indica mais de um cliente criado no mesmo contexto. Não é erro; pode
   produzir comportamento indefinido sob concorrência. Vale olhar em
   `useSupabaseClient.ts` quando houver motivo.

Nenhum dos dois interferiu na validação.
