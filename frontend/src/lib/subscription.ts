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

/** Cria um trial de 7 dias para o usuário. Seguro de chamar múltiplas vezes (upsert). */
export async function startTrial(
  userId: string,
  client: Client,
): Promise<Subscription | null> {
  const trialEndsAt = new Date(Date.now() + 7 * 86_400_000).toISOString();

  const { data, error } = await client
    .from('subscriptions')
    .upsert(
      { user_id: userId, status: 'trial', trial_ends_at: trialEndsAt },
      { onConflict: 'user_id', ignoreDuplicates: true },
    )
    .select()
    .maybeSingle();

  if (error) {
    console.error('[subscription] startTrial:', error.message);
    return null;
  }
  return data as Subscription | null;
}
