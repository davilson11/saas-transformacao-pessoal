# Verificação — `diario_kairos`: Momento × Diário de Bordo

Data: 2026-11-16. Inspeção de código, sem execução de SQL, sem alteração.

---

## 1. Risco de sobrescrita cruzada — **não identificado**

Pergunta: ao salvar, o Momento pode apagar campos gravados pelo Diário de
Bordo, ou o contrário?

Resposta da inspeção: **não.** As duas telas gravam em **linhas diferentes**
da mesma tabela, separadas pela coluna `tipo_entrada`:

| tela | `tipo_entrada` que lê | `tipo_entrada` que grava |
|---|---|---|
| Momento (`app/momento/page.tsx`) | `'momento'` ou `NULL` | somente `'momento'` |
| Diário de Bordo (`app/ferramentas/diario-bordo/page.tsx`) | tudo **exceto** `'momento'`, ou `NULL` | `'diario'`, `'livre'`, `'profunda'` |

Cada salvamento localiza a linha por `user_id + data + tipo_entrada` (valor
exato) e faz `update(campos)` com **apenas os campos daquela tela**. Um
`UPDATE` não toca colunas ausentes do objeto. Não há `upsert` com linha
inteira em nenhum dos fluxos.

Dentro do próprio Momento, manhã (6 campos) e noite (4 campos) gravam na
mesma linha `'momento'`, cada uma só com os seus — também sem sobrescrita.

**Status: risco descartado por inspeção. Não foi testado em execução.**

---

## 2. Correção de uma afirmação anterior

Na análise de produto desta mesma data (em conversa, não em documento), foi
dito que "Momento e Diário de Bordo escrevem no **mesmo registro do dia**" e
que "não existem dois diários". **Isso estava errado.**

O correto: escrevem na **mesma tabela**, em **registros separados** por
`tipo_entrada`. Para um mesmo dia podem existir, no mínimo, uma linha
`'momento'` e uma linha `'diario'`, além de quantas `'livre'` e `'profunda'`
a pessoa criar. São diários distintos que compartilham a tabela — não um
registro com duas entradas.

A fronteira de produto proposta (Momento = orientação e check-in de hoje;
Diário = reflexão e registro aprofundado) continua válida; o que muda é o
modelo de dados por trás dela, que é de separação, não de compartilhamento.

Os documentos em `scripts/` foram revisados: nenhum continha a afirmação
errada. Ela existiu só na conversa.

---

## 3. Resíduo: linhas com `tipo_entrada` nulo

Os dois carregadores incluem `tipo_entrada IS NULL`. Se houver linhas assim
(anteriores à coluna existir), **as duas telas as exibem** e **nenhuma grava
nelas** — cada salvamento filtra por tipo exato e, não encontrando, insere uma
linha nova. Efeito possível: a mesma data duas vezes numa tela. Não é perda de
dado.

**Não executar `UPDATE` nessas linhas.** Primeiro, contar:

```sql
SELECT count(*) AS linhas_sem_tipo,
       min(data) AS mais_antiga,
       max(data) AS mais_recente
  FROM diario_kairos
 WHERE tipo_entrada IS NULL;
```

Se o resultado for maior que zero, a classificação de cada linha depende da
**origem e do conteúdo** — quais colunas estão preenchidas (`gratidao`,
`emocao` apontam para o fluxo do Momento; `conteudo` livre aponta para o
Diário). **Não assumir que todas são `'momento'`.** Decisão só depois de ver
as linhas.

---

## Pendências desta verificação

- [ ] Rodar a contagem acima (só leitura)
- [ ] Se > 0: listar colunas preenchidas por linha antes de classificar
- [ ] Teste em execução do item 1 (salvar nas duas telas no mesmo dia e
      conferir as duas linhas) — não feito
