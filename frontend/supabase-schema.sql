-- ═══════════════════════════════════════════════════════════════════════════
-- A Virada — Schema do Supabase
-- Executar no SQL Editor do Supabase Dashboard
-- ═══════════════════════════════════════════════════════════════════════════
--
-- IMPORTANTE: o user_id é o Clerk User ID (string), não o UUID do Supabase Auth.
-- A RLS usa (auth.uid()::text = user_id) caso você configure o Clerk como
-- JWT provider no Supabase, ou use a função clerk_user_id() abaixo.
-- Se quiser usar apenas service_role para gravações via API Route,
-- remova as policies de INSERT/UPDATE e faça as chamadas server-side.
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── Extensão UUID ───────────────────────────────────────────────────────────

create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. VISÃO ÂNCORA
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.visao_ancora (
  id              uuid primary key default gen_random_uuid(),
  user_id         text not null unique,          -- Clerk User ID

  -- Seção 01 — Capa da Forbes
  manchete        text not null default '',
  area_referencia text not null default '',
  obstaculo       text not null default '',

  -- Seção 02 — 3 Pedidos
  pedido1         text not null default '',
  pedido2         text not null default '',
  pedido3         text not null default '',

  -- Seção 03 — Referências (array de objetos {nome, area, admiro})
  referencias     jsonb not null default '[]'::jsonb,

  -- Seção 04 — O que me Move
  tira_sono       text not null default '',
  da_energia      text not null default '',
  faria_graca     text not null default '',
  mundo_perderia  text not null default '',

  -- Seção 05 — Declaração de Vida
  declaracao      text not null default '',

  -- Campos legados / extras (mantidos para compatibilidade com versão anterior)
  financas        text not null default '',
  como_vive       text not null default '',

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Atualiza updated_at automaticamente
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger visao_ancora_updated_at
  before update on public.visao_ancora
  for each row execute function public.set_updated_at();

-- RLS
alter table public.visao_ancora enable row level security;

create policy "Usuário lê sua própria visão âncora"
  on public.visao_ancora for select
  using (auth.jwt() ->> 'sub' = user_id);

create policy "Usuário insere sua própria visão âncora"
  on public.visao_ancora for insert
  with check (auth.jwt() ->> 'sub' = user_id);

create policy "Usuário atualiza sua própria visão âncora"
  on public.visao_ancora for update
  using (auth.jwt() ->> 'sub' = user_id)
  with check (auth.jwt() ->> 'sub' = user_id);

create policy "Usuário deleta sua própria visão âncora"
  on public.visao_ancora for delete
  using (auth.jwt() ->> 'sub' = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. FERRAMENTAS — RESPOSTAS
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.ferramentas_respostas (
  id                 uuid primary key default gen_random_uuid(),
  user_id            text not null,               -- Clerk User ID
  ferramenta_codigo  text not null,               -- ex: "F01"
  ferramenta_slug    text not null,               -- ex: "raio-x"
  respostas          jsonb not null default '{}'::jsonb,
  progresso          integer not null default 0
                     check (progresso >= 0 and progresso <= 100),
  concluida          boolean not null default false,

  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),

  -- Um registro por usuário + ferramenta
  unique (user_id, ferramenta_slug)
);

create index if not exists ferramentas_respostas_user_id_idx
  on public.ferramentas_respostas (user_id);

create index if not exists ferramentas_respostas_slug_idx
  on public.ferramentas_respostas (user_id, ferramenta_slug);

create trigger ferramentas_respostas_updated_at
  before update on public.ferramentas_respostas
  for each row execute function public.set_updated_at();

-- RLS
alter table public.ferramentas_respostas enable row level security;

create policy "Usuário lê suas próprias respostas"
  on public.ferramentas_respostas for select
  using (auth.jwt() ->> 'sub' = user_id);

create policy "Usuário insere suas próprias respostas"
  on public.ferramentas_respostas for insert
  with check (auth.jwt() ->> 'sub' = user_id);

create policy "Usuário atualiza suas próprias respostas"
  on public.ferramentas_respostas for update
  using (auth.jwt() ->> 'sub' = user_id)
  with check (auth.jwt() ->> 'sub' = user_id);

create policy "Usuário deleta suas próprias respostas"
  on public.ferramentas_respostas for delete
  using (auth.jwt() ->> 'sub' = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. RODA DA VIDA
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.roda_vida (
  id              uuid primary key default gen_random_uuid(),
  user_id         text not null,                 -- Clerk User ID

  -- Scores de 1–10 para cada área
  saude           integer not null default 5 check (saude between 1 and 10),
  carreira        integer not null default 5 check (carreira between 1 and 10),
  financas        integer not null default 5 check (financas between 1 and 10),
  relacionamentos integer not null default 5 check (relacionamentos between 1 and 10),
  lazer           integer not null default 5 check (lazer between 1 and 10),
  espiritualidade integer not null default 5 check (espiritualidade between 1 and 10),
  familia         integer not null default 5 check (familia between 1 and 10),
  crescimento     integer not null default 5 check (crescimento between 1 and 10),

  created_at      timestamptz not null default now()
  -- Sem updated_at: cada linha é um snapshot imutável (histórico de evolução)
);

create index if not exists roda_vida_user_id_created_idx
  on public.roda_vida (user_id, created_at desc);

-- RLS
alter table public.roda_vida enable row level security;

create policy "Usuário lê sua própria roda da vida"
  on public.roda_vida for select
  using (auth.jwt() ->> 'sub' = user_id);

create policy "Usuário insere sua própria roda da vida"
  on public.roda_vida for insert
  with check (auth.jwt() ->> 'sub' = user_id);

create policy "Usuário deleta sua própria roda da vida"
  on public.roda_vida for delete
  using (auth.jwt() ->> 'sub' = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- NOTA SOBRE CLERK + SUPABASE RLS
-- ─────────────────────────────────────────────────────────────────────────────
--
-- As policies acima usam:  auth.jwt() ->> 'sub' = user_id
--
-- Para que isso funcione, configure o Clerk como JWT Template no Supabase:
--
--   1. No Clerk Dashboard → JWT Templates → New Template → Supabase
--   2. Copie o "JWKS Endpoint" do Clerk
--   3. No Supabase Dashboard → Authentication → JWT Settings
--      → cole o JWKS Endpoint e salve
--   4. No frontend, passe o token Clerk ao instanciar o client:
--
--      import { useAuth } from "@clerk/nextjs";
--      const { getToken } = useAuth();
--      const token = await getToken({ template: "supabase" });
--      const supabaseWithAuth = createClient(url, anonKey, {
--        global: { headers: { Authorization: `Bearer ${token}` } },
--      });
--
--   5. Use supabaseWithAuth nas chamadas autenticadas em vez de supabase.
--
-- ─────────────────────────────────────────────────────────────────────────────
