import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// ─── Tipo ─────────────────────────────────────────────────────────────────────

export type Subscription = {
  id:                     string;
  user_id:                string;
  status:                 'trial' | 'active' | 'canceled' | 'past_due';
  trial_ends_at:          string; // ISO timestamptz
  plan:                   string | null;
  stripe_customer_id:     string | null;
  stripe_subscription_id: string | null;
  created_at:             string;
  updated_at:             string;
};

type Client = SupabaseClient<Database>;

// ─── Funções puras ────────────────────────────────────────────────────────────

/** Retorna true se o trial ainda não expirou. */
export function isTrialActive(sub: Subscription): boolean {
  return sub.status === 'trial' && new Date(sub.trial_ends_at) > new Date();
}

/** Retorna true se o usuário tem plano pago ativo. */
export function isPro(sub: Subscription): boolean {
  return sub.status === 'active';
}

/** Retorna true se o usuário pode acessar a plataforma (trial ativo OU pro). */
export function hasAccess(sub: Subscription): boolean {
  return isTrialActive(sub) || isPro(sub);
}

/** Dias restantes do trial (0 se expirado). */
export function getDaysRemaining(sub: Subscription): number {
  if (sub.status !== 'trial') return 0;
  const diff = new Date(sub.trial_ends_at).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86_400_000));
}

// ─── Funções assíncronas ──────────────────────────────────────────────────────

/** Busca a subscription do usuário no Supabase. Retorna null se não existir. */
export async function getSubscription(
  userId: string,
  client: Client,
): Promise<Subscription | null> {
  const { data, error } = await client
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('[subscription] getSubscription:', error.message);
    return null;
  }
  return data as Subscription | null;
}

/**
 * Cria o trial do usuário chamando a rota server-side.
 *
 * O cliente NÃO escreve mais em `subscriptions` — a duração do trial e o
 * `status` são definidos no servidor, senão o próprio usuário conseguiria
 * escolher a data de expiração ou se marcar como `active`.
 *
 * Seguro de chamar múltiplas vezes: se a linha já existir, é devolvida como está.
 */
export async function startTrial(): Promise<Subscription | null> {
  try {
    const res = await fetch('/api/subscription', { method: 'POST' });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      console.error('[subscription] startTrial:', (body as { error?: string }).error ?? res.status);
      return null;
    }
    const { subscription } = await res.json() as { subscription?: Subscription | null };
    return subscription ?? null;
  } catch (err) {
    console.error('[subscription] startTrial:', err instanceof Error ? err.message : err);
    return null;
  }
}
