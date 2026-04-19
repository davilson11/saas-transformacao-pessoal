/**
 * Cliente Supabase com service-role key — uso exclusivo em Server Components
 * e Route Handlers (nunca importar em código client-side).
 *
 * Centralizado aqui para evitar múltiplas chamadas a createClient espalhadas
 * nos API routes, eliminando o aviso "Multiple GoTrueClient instances".
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl        = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Singleton no escopo do módulo — reutilizado em todas as requisições
// do mesmo processo Node.js (Next.js server).
// Sem generic <Database>: o admin acessa tabelas fora do schema tipado
// (push_subscriptions, etc.), então usa o cliente sem tipo estrito.
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: {
      persistSession:   false,
      autoRefreshToken: false,
    },
  },
);
