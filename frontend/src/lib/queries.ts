import { supabase } from "./supabase";
import type {
  Database,
  VisaoAncora,
  FerramentasRespostas,
  RodaVida,
  ReferenciaJson,
  Json,
} from "./database.types";

// ─── Tipo de client ───────────────────────────────────────────────────────────

type DbClient = typeof supabase;

// ─── Tipos de entrada (extraídos do Database para garantir compatibilidade) ───

export type VisaoAncoraInput     = Database["public"]["Tables"]["visao_ancora"]["Insert"];
export type FerramentaRespostaInput = Database["public"]["Tables"]["ferramentas_respostas"]["Insert"];
export type RodaVidaInput        = Database["public"]["Tables"]["roda_vida"]["Insert"];

// ─── Visão Âncora ─────────────────────────────────────────────────────────────

/**
 * Salva ou atualiza a Visão Âncora do usuário (upsert por user_id).
 * Passe um client autenticado (createAuthClient) para que o RLS funcione.
 */
export async function salvarVisaoAncora(
  userId: string,
  dados: Omit<VisaoAncoraInput, "user_id">,
  client: DbClient = supabase
): Promise<VisaoAncora | null> {
  const payload: VisaoAncoraInput = {
    ...dados,
    user_id: userId,
  };

  const { data, error } = await client
    .from("visao_ancora")
    .upsert(payload, { onConflict: "user_id" })
    .select()
    .single();

  if (error) {
    console.error("[salvarVisaoAncora]", error.message);
    return null;
  }

  return data;
}

/**
 * Busca a Visão Âncora do usuário.
 */
export async function buscarVisaoAncora(
  userId: string,
  client: DbClient = supabase
): Promise<VisaoAncora | null> {
  const { data, error } = await client
    .from("visao_ancora")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("[buscarVisaoAncora]", error.message);
    return null;
  }

  return data;
}

// ─── Ferramentas — Respostas ──────────────────────────────────────────────────

/**
 * Salva ou atualiza as respostas de uma ferramenta (upsert por user_id + slug).
 */
export async function salvarRespostaFerramenta(
  userId: string,
  ferramentaCodigo: string,
  ferramentaSlug: string,
  respostas: Json,
  progresso: number,
  concluida = false,
  client: DbClient = supabase
): Promise<FerramentasRespostas | null> {
  const payload: FerramentaRespostaInput = {
    user_id: userId,
    ferramenta_codigo: ferramentaCodigo,
    ferramenta_slug: ferramentaSlug,
    respostas,
    progresso: Math.min(100, Math.max(0, progresso)),
    concluida,
  };

  const { data, error } = await client
    .from("ferramentas_respostas")
    .upsert(payload, { onConflict: "user_id,ferramenta_slug" })
    .select()
    .single();

  if (error) {
    console.error("[salvarRespostaFerramenta]", error.message);
    return null;
  }

  return data;
}

/**
 * Busca as respostas de uma ferramenta específica do usuário.
 */
export async function buscarRespostaFerramenta(
  userId: string,
  ferramentaSlug: string,
  client: DbClient = supabase
): Promise<FerramentasRespostas | null> {
  const { data, error } = await client
    .from("ferramentas_respostas")
    .select("*")
    .eq("user_id", userId)
    .eq("ferramenta_slug", ferramentaSlug)
    .maybeSingle();

  if (error) {
    console.error("[buscarRespostaFerramenta]", error.message);
    return null;
  }

  return data;
}

/**
 * Busca todas as ferramentas respondidas pelo usuário.
 */
export async function buscarTodasRespostas(
  userId: string,
  client: DbClient = supabase
): Promise<FerramentasRespostas[]> {
  const { data, error } = await client
    .from("ferramentas_respostas")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("[buscarTodasRespostas]", error.message);
    return [];
  }

  return data ?? [];
}

// ─── Roda da Vida ─────────────────────────────────────────────────────────────

/**
 * Salva um novo snapshot da Roda da Vida (append — histórico completo).
 */
export async function salvarRodaVida(
  userId: string,
  scores: Omit<RodaVidaInput, "user_id">,
  client: DbClient = supabase
): Promise<RodaVida | null> {
  const payload: RodaVidaInput = { ...scores, user_id: userId };

  const { data, error } = await client
    .from("roda_vida")
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error("[salvarRodaVida]", error.message);
    return null;
  }

  return data;
}

/**
 * Busca o registro mais recente da Roda da Vida do usuário.
 */
export async function buscarRodaVida(
  userId: string,
  client: DbClient = supabase
): Promise<RodaVida | null> {
  const { data, error } = await client
    .from("roda_vida")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[buscarRodaVida]", error.message);
    return null;
  }

  return data;
}

/**
 * Busca o histórico completo da Roda da Vida (para gráfico de evolução).
 */
export async function buscarHistoricoRodaVida(
  userId: string,
  limite = 12,
  client: DbClient = supabase
): Promise<RodaVida[]> {
  const { data, error } = await client
    .from("roda_vida")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limite);

  if (error) {
    console.error("[buscarHistoricoRodaVida]", error.message);
    return [];
  }

  return data ?? [];
}
