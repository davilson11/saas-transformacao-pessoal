import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// ─── Instância server-side ────────────────────────────────────────────────────

function getStripeServer(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY não definida.');
  return new Stripe(key, { apiVersion: '2026-03-25.dahlia' });
}

// ─── POST /api/webhook ────────────────────────────────────────────────────────
// Next.js App Router: body é lido como ArrayBuffer (não JSON) para validar assinatura.

export async function POST(req: NextRequest): Promise<NextResponse> {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error('[webhook] STRIPE_WEBHOOK_SECRET não definida.');
    return NextResponse.json({ error: 'Webhook secret ausente' }, { status: 500 });
  }

  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Assinatura ausente' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const rawBody = await req.arrayBuffer();
    const stripe  = getStripeServer();
    event = stripe.webhooks.constructEvent(
      Buffer.from(rawBody),
      signature,
      secret,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro de verificação';
    console.error('[webhook] Falha na verificação da assinatura:', message);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  // ─── Handlers por tipo de evento ─────────────────────────────────────────

  try {
    switch (event.type) {

      // Pagamento bem-sucedido (cobrança avulsa ou primeira cobrança da assinatura)
      case 'payment_intent.succeeded': {
        const pi = event.data.object as Stripe.PaymentIntent;
        console.log('[webhook] payment_intent.succeeded:', pi.id, 'customer:', pi.customer);
        // TODO: registrar pagamento no Supabase se necessário
        break;
      }

      // Assinatura criada
      case 'customer.subscription.created': {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.userId;
        const plano  = sub.metadata?.plano ?? 'mensal';
        console.log('[webhook] subscription.created:', sub.id, 'userId:', userId, 'plano:', plano);
        // TODO: atualizar perfil do usuário no Supabase (ex: profiles.plano = plano)
        break;
      }

      // Assinatura atualizada (upgrade/downgrade, renovação, etc.)
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const status = sub.status; // 'active' | 'past_due' | 'canceled' | ...
        const userId = sub.metadata?.userId;
        console.log('[webhook] subscription.updated:', sub.id, 'status:', status, 'userId:', userId);
        // TODO: sincronizar status no Supabase
        break;
      }

      // Assinatura cancelada / expirada
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.userId;
        console.log('[webhook] subscription.deleted:', sub.id, 'userId:', userId);
        // TODO: rebaixar usuário para plano Grátis no Supabase
        break;
      }

      // Cobrança da assinatura bem-sucedida (renovação mensal/anual)
      case 'invoice.payment_succeeded': {
        const inv = event.data.object as Stripe.Invoice;
        console.log('[webhook] invoice.payment_succeeded:', inv.id, 'customer:', inv.customer);
        // TODO: registrar renovação no histórico de pagamentos
        break;
      }

      // Cobrança falhou
      case 'invoice.payment_failed': {
        const inv = event.data.object as Stripe.Invoice;
        console.warn('[webhook] invoice.payment_failed:', inv.id, 'customer:', inv.customer);
        // TODO: notificar usuário para atualizar cartão
        break;
      }

      default:
        // Evento não tratado — ignorar silenciosamente
        break;
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro no handler';
    console.error('[webhook] Erro ao processar evento:', event.type, message);
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
