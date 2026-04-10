import { loadStripe, type Stripe } from '@stripe/stripe-js';

// ─── Cliente Stripe (browser) ─────────────────────────────────────────────────

let stripePromise: Promise<Stripe | null> | null = null;

/**
 * Retorna a instância do Stripe carregada uma única vez (singleton).
 * Usar apenas no lado do cliente.
 */
export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!key) {
      console.error('[Stripe] NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY não definida.');
      return Promise.resolve(null);
    }
    stripePromise = loadStripe(key);
  }
  return stripePromise;
}

// ─── Price IDs ────────────────────────────────────────────────────────────────
// Configure as variáveis de ambiente correspondentes em .env.local

export const PRICE_IDS = {
  mensal: process.env.NEXT_PUBLIC_STRIPE_PRICE_MENSAL ?? '',
  anual:  process.env.NEXT_PUBLIC_STRIPE_PRICE_ANUAL  ?? '',
} as const;

export type Plano = keyof typeof PRICE_IDS;
