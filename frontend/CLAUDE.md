@AGENTS.md
# Plataforma SaaS de Transformação Pessoal

## Sobre o Projeto
Landing page e plataforma SaaS para jornada de transformação pessoal de 12 meses com 16 ferramentas interativas.

## Stack
- Next.js 16 com TypeScript e App Router
- Tailwind CSS v4 (tokens definidos via @theme no globals.css)
- Claude Code para geração de componentes

## Design Guide
- Verde Escuro: #1E392A (fundo, headers, CTAs)
- Verde Médio: #2D5A4F (cards, secundários)
- Verde Claro: #81B29A (hover, progresso)
- Dourado: #E0A55F (acentos, CTA premium)
- Branco Quente: #F4F1DE (fundo secundário)
- Fontes: Poppins (headings), Inter (body)

## Componentes Criados
- Hero.tsx — seção hero com gradiente verde e botão dourado
- Problema.tsx — 5 cards com dores do usuário ('use client')
- Solucao.tsx — 4 fases com glassmorphism verde
- Ferramentas.tsx — grid 4x4 das 16 ferramentas ('use client')
- Pricing.tsx — 1 plano anual R$297 com CTA dourado

## Componentes a Criar
- FAQ.tsx — accordion com perguntas frequentes
- Footer.tsx — links e redes sociais
- Sidebar.tsx — menu lateral do dashboard
- Dashboard/Cockpit.tsx — visão geral diária

## Regras de Código
- Sempre usar 'use client' em componentes com onClick, onMouseEnter, useState
- Cores sempre via classes Tailwind geradas pelo @theme (ex: bg-brand-dark-green)
- Nunca hardcodar hex nas classes Tailwind
- Componentes em src/components/landing/ para landing page
- Componentes em src/components/dashboard/ para área logada
- Componentes base em src/components/ui/

## Estrutura de Pastas
src/
  app/
    page.tsx (landing page)
    globals.css (design tokens)
  components/
    landing/ (Hero, Problema, Solucao, Ferramentas, Pricing)
    dashboard/ (a criar)
    ui/ (a criar)
