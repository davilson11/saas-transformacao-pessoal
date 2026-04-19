import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY são obrigatórias."
  );
}

/** Client anônimo — para rotas públicas ou quando não há sessão. */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

/**
 * Cache de instâncias autenticadas por token.
 * Evita criar múltiplos GoTrueClient para o mesmo JWT, eliminando o aviso
 * "Multiple GoTrueClient instances detected in the same browser context".
 */
const authClientCache = new Map<string, ReturnType<typeof createClient<Database>>>();

/**
 * Retorna um client autenticado com o JWT do Clerk.
 * Reutiliza a instância se o mesmo token já foi usado antes.
 * Necessário para que o Supabase RLS reconheça o usuário via auth.jwt() ->> 'sub'.
 * Obtenha o token com: await getToken({ template: 'supabase' }) do useAuth() do Clerk.
 */
export function createAuthClient(token: string): ReturnType<typeof createClient<Database>> {
  const cached = authClientCache.get(token);
  if (cached) return cached;

  const client = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: { Authorization: `Bearer ${token}` },
    },
  });

  authClientCache.set(token, client);
  return client;
}
