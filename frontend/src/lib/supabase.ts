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
 * Cria um client autenticado com o JWT do Clerk.
 * Necessário para que o Supabase RLS reconheça o usuário via auth.jwt() ->> 'sub'.
 * Obtenha o token com: await getToken({ template: 'supabase' }) do useAuth() do Clerk.
 */
export function createAuthClient(token: string) {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: { Authorization: `Bearer ${token}` },
    },
  });
}
