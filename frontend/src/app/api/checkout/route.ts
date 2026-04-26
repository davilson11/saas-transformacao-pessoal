import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { auth, currentUser } from '@clerk/nextjs/server';

// ─── Instância server-side do Stripe ─────────────────────────────────────────

function getStripeServer(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY não definida nas variáveis de ambiente.');
  return new Stripe(key, { apiVersion: '2026-03-25.dahlia' });
}

// ─── Mapa de Price IDs ────────────────────────────────────────────────────────

const PRICE_IDS: Record<string, string> = {
  mensal: process.env.STRIPE_PRICE_MENSAL ?? '',
  anual:  process.env.STRIPE_PRICE_ANUAL  ?? '',
};

// ─── POST /api/checkout ───────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Pegar userId e email do Clerk server-side (não confiar no cliente)
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const clerkUser = await currentUser();
    const email = clerkUser?.emailAddresses?.[0]?.emailAddress ?? undefined;

    const body = await req.json() as { plano?: string };
    const { plano = 'mensal' } = body;

    const priceId = PRICE_IDS[plano];
    if (!priceId) {
      return NextResponse.json(
        { error: `Plano inválido ou price_id não configurado: "${plano}"` },
        { status: 400 },
      );
    }

    const stripe = getStripeServer();
    const origin = req.headers.get('origin') ?? 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/dashboard?checkout=success&plano=${plano}`,
      cancel_url:  `${origin}/#precos`,
      ...(email ? { customer_email: email } : {}),
      client_reference_id: userId,
      subscription_data: {
        metadata: { plano, userId },
      },
      metadata: { plano, userId },
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
    });

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro interno';
    console.error('[checkout] Erro ao criar sessão Stripe:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
