# Briefing para o Fable

Dois pedidos, nesta ordem. **Não misture os dois na mesma conversa** — o
primeiro muda arquivos, o segundo só lê. Misturar faz o modelo começar a
refatorar no meio da análise.

Antes de colar: dê a ele acesso à pasta `~/Desktop/saas-transformacao-pessoal`.
Sem os arquivos, a resposta é genérica — foi esse o defeito do prompt anterior.

---

## PEDIDO 1 — execução (cole isto primeiro)

```
Você está trabalhando no repositório ~/Desktop/saas-transformacao-pessoal.
É um app Next.js 16 + TypeScript + Supabase + Clerk, em produção, de um
usuário só. Não é um projeto novo: tem 164 testes passando e CI.

Leia primeiro: frontend/scripts/MAPA-DUPLICACAO.md
Ele tem a análise já feita e o plano. Não refaça a análise.

Execute os itens 1 e 2 do plano, nesta ordem:

ITEM 1 — tokens de cor
- Crie frontend/src/lib/tokens.ts exportando as cores de marca.
- O dourado oficial é #C8A030 (o do Momento, 168 usos).
- Migre as 16 ferramentas em frontend/src/app/ferramentas/*/page.tsx para
  importar de lá, removendo as declarações locais de COR_GOLD, COR_VERDE,
  COR_DARK, COR_BORDER e COR_PRIMARY.
- Atualize --color-brand-gold em frontend/src/app/globals.css para o mesmo
  valor, inclusive no bloco de tema escuro.

ITEM 2 — dois componentes visuais
- Extraia <CartaoInstrucao> (título + lista com seta) para
  frontend/src/components/dashboard/. Hoje está copiado em 9 ferramentas.
- Extraia <BadgeTopo> (o pill dourado do cabeçalho). Hoje está em 13.
- Aplique nas ferramentas que os usam. Mantenha a aparência idêntica — isto é
  refatoração, não redesign.

RESTRIÇÕES, todas obrigatórias:
- NÃO toque em frontend/src/components/dashboard/FerramentaLayout.tsx.
  São 1.357 linhas, 15 telas dependem dele e ele não tem teste nenhum.
- NÃO altere nada em frontend/src/app/momento/ nem em frontend/src/lib/.
- NÃO mexa em conteúdo: os arquivos frontend/scripts/*.json e *.sql são os
  365 dias de texto e estão fora do escopo.
- NÃO mude comportamento. Nenhuma tela pode ficar diferente na tela.
- Rode `npm test` ao final, em frontend/. Os 164 testes têm que passar.
- Rode `npx tsc --noEmit` ao final. Tem que passar limpo.

ENTREGA:
- Os arquivos alterados.
- A saída de npm test e tsc.
- Uma lista do que você mudou por ferramenta, e de qualquer lugar onde a cor
  antiga era visualmente diferente o bastante para alguém notar a troca.
```

---

## PEDIDO 2 — análise (conversa nova, depois do primeiro terminar)

```
Repositório: ~/Desktop/saas-transformacao-pessoal
Next.js 16, TypeScript, Supabase com RLS, Clerk, Stripe, PWA com web push.
Em produção em meukairos.com.br, com um usuário: o dono.

Contexto que importa para você não sugerir a coisa errada:
- Este NÃO é um produto para vender. É a ferramenta pessoal do dono. Não
  sugira monetização, planos, onboarding de novos usuários ou growth.
- O conteúdo (365 dias de texto) está sendo reescrito em outro fluxo. Fora
  do escopo.
- Já existem 164 testes e CI.

O que eu quero de você, e só isso:

1. Uma revisão técnica do que está frágil e pode quebrar em produção.
   Priorize por risco real, não por boa prática genérica.
2. Os pontos onde uma falha aconteceria em SILÊNCIO — sucesso aparente sem o
   trabalho feito. Este app já teve quatro bugs assim; quero saber onde estão
   os próximos.
3. O que está morto: componentes não usados, código que não roda mais.
4. Se e como vale escrever teste para FerramentaLayout.tsx antes de alguém
   precisar mexer nele.

Seja específico: arquivo, linha, o que acontece. Sem lista genérica de boas
práticas.
```

---

## Depois

Se o Pedido 1 passar nos testes, commite com mensagem própria antes de
qualquer outra coisa — fica fácil de reverter se aparecer alguma diferença
visual que ninguém notou.

Se o Pedido 2 trouxer achados, traga para cá que a gente decide o que fazer.
