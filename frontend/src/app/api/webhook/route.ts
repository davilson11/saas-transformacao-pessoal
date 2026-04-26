import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabase-admin';

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

      // Checkout concluído — ativar subscription no Supabase
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        // userId enviado via client_reference_id e também em metadata
        const userId = session.client_reference_id ?? session.metadata?.userId;
        const customerId    = typeof session.customer === 'string' ? session.customer : null;
        const subscriptionId = typeof session.subscription === 'string' ? session.subscription : null;
        const plano = session.metadata?.plano ?? 'mensal';
        console.log('[webhook] checkout.session.completed — userId:', userId, 'plano:', plano);
        if (userId) {
          const { error } = await supabaseAdmin
            .from('subscriptions')
            .update({
              status:                 'active',
              plan:                   plano,
              stripe_customer_id:     customerId,
              stripe_subscription_id: subscriptionId,
            })
            .eq('user_id', userId);
          if (error) console.error('[webhook] Erro ao ativar subscription:', error.message);
        }
        break;
      }

      // Assinatura criada (redundante ao checkout.session.completed, mas seguro manter)
      case 'customer.subscription.created': {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.userId;
        const plano  = sub.metadata?.plano ?? 'mensal';
        console.log('[webhook] subscription.created:', sub.id, 'userId:', userId, 'plano:', plano);
        if (userId) {
          const { error } = await supabaseAdmin
            .from('subscriptions')
            .update({
              status:                 'active',
              plan:                   plano,
              stripe_subscription_id: sub.id,
              stripe_customer_id:     typeof sub.customer === 'string' ? sub.customer : null,
            })
            .eq('user_id', userId);
          if (error) console.error('[webhook] Erro ao criar subscription:', error.message);
        }
        break;
      }

      // Assinatura atualizada (upgrade/downgrade, renovação, inadimplência)
      case 'customer.subscription.updated': {
        const sub    = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.userId;
        console.log('[webhook] subscription.updated:', sub.id, 'status:', sub.status, 'userId:', userId);
        if (userId) {
          const statusMap: Record<string, string> = {
            active:   'active',
            past_due: 'past_due',
            canceled: 'canceled',
          };
          const newStatus = statusMap[sub.status];
          if (newStatus) {
            const { error } = await supabaseAdmin
              .from('subscriptions')
              .update({ status: newStatus })
              .eq('user_id', userId);
            if (error) console.error('[webhook] Erro ao atualizar subscription:', error.message);
          }
        }
        break;
      }

      // Assinatura cancelada — rebaixar para trial expirado
      case 'customer.subscription.deleted': {
        const sub    = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.userId;
        console.log('[webhook] subscription.deleted:', sub.id, 'userId:', userId);
        if (userId) {
          const { error } = await supabaseAdmin
            .from('subscriptions')
            .update({ status: 'canceled', stripe_subscription_id: null })
            .eq('user_id', userId);
          if (error) console.error('[webhook] Erro ao cancelar subscription:', error.message);
        }
        break;
      }

      // Cobrança bem-sucedida (renovação) — garantir status active
      case 'invoice.payment_succeeded': {
        const inv = event.data.object as Stripe.Invoice;
        const customerId = typeof inv.customer === 'string' ? inv.customer : null;
        console.log('[webhook] invoice.payment_succeeded:', inv.id, 'customer:', customerId);
        if (customerId) {
          // Atualiza pelo stripe_customer_id (já salvo no checkout)
          const { error } = await supabaseAdmin
            .from('subscriptions')
            .update({ status: 'active' })
            .eq('stripe_customer_id', customerId);
          if (error) console.error('[webhook] Erro ao renovar subscription:', error.message);
        }
        break;
      }

      // Cobrança falhou — marcar como inadimplente
      case 'invoice.payment_failed': {
        const inv = event.data.object as Stripe.Invoice;
        const customerId = typeof inv.customer === 'string' ? inv.customer : null;
        console.warn('[webhook] invoice.payment_failed:', inv.id, 'customer:', customerId);
        if (customerId) {
          const { error } = await supabaseAdmin
            .from('subscriptions')
            .update({ status: 'past_due' })
            .eq('stripe_customer_id', customerId);
          if (error) console.error('[webhook] Erro ao marcar past_due:', error.message);
        }
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
