import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabase-admin';

// ─── Instância server-side ────────────────────────────────────────────────────

function getStripeServer(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY não definida.');
  return new Stripe(key, { apiVersion: '2026-03-25.dahlia' });
}

// ─── Idempotência ─────────────────────────────────────────────────────────────
//
// O Stripe reenvia eventos em caso de timeout e não garante ordem de entrega.
// Registramos cada event.id numa tabela com PRIMARY KEY; se o INSERT colidir,
// o evento já foi processado e é descartado.
// Requer a tabela `stripe_events` — ver scripts/fix-rls-subscriptions.sql.

async function jaProcessado(event: Stripe.Event): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from('stripe_events')
    .insert({ id: event.id, type: event.type });

  if (!error) return false;

  if (error.code === '23505') {
    console.log('[webhook] evento duplicado ignorado:', event.id, event.type);
    return true;
  }

  // Tabela ausente ou erro de infra: não bloqueia o processamento, só avisa.
  console.warn('[webhook] falha ao registrar idempotência:', error.message);
  return false;
}

// ─── Localização da linha em `subscriptions` ─────────────────────────────────
//
// `metadata.userId` só existe em assinaturas criadas pelo nosso checkout.
// Assinaturas criadas pelo dashboard do Stripe, migrações de plano e ações no
// customer portal podem chegar sem metadata — antes esses eventos eram
// descartados em silêncio (um cancelamento não rebaixava o acesso).
// Ordem de tentativa: userId → stripe_subscription_id → stripe_customer_id.

type Filtro = {
  coluna: 'user_id' | 'stripe_subscription_id' | 'stripe_customer_id';
  valor:  string;
};

function montarFiltro(
  userId?: string | null,
  subscriptionId?: string | null,
  customerId?: string | null,
): Filtro | null {
  if (userId)         return { coluna: 'user_id',                valor: userId };
  if (subscriptionId) return { coluna: 'stripe_subscription_id', valor: subscriptionId };
  if (customerId)     return { coluna: 'stripe_customer_id',     valor: customerId };
  return null;
}

async function atualizarAssinatura(
  filtro:   Filtro | null,
  patch:    Record<string, string | null>,
  contexto: string,
): Promise<void> {
  if (!filtro) {
    console.error(`[webhook] ${contexto}: sem identificador para localizar a assinatura.`);
    return;
  }

  const { data, error } = await supabaseAdmin
    .from('subscriptions')
    .update(patch)
    .eq(filtro.coluna, filtro.valor)
    .select('user_id');

  if (error) {
    console.error(`[webhook] ${contexto}: erro ao atualizar —`, error.message);
    return;
  }
  if (!data?.length) {
    console.error(
      `[webhook] ${contexto}: nenhuma linha encontrada para ${filtro.coluna}=${filtro.valor}.`,
    );
    return;
  }
  console.log(`[webhook] ${contexto}: atualizado via ${filtro.coluna}`, patch);
}

// ─── Mapa de status do Stripe → status interno ───────────────────────────────

const STATUS_MAP: Record<string, string> = {
  active:             'active',
  trialing:           'active',
  past_due:           'past_due',
  unpaid:             'past_due',
  canceled:           'canceled',
  incomplete_expired: 'canceled',
};

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

  if (await jaProcessado(event)) {
    return NextResponse.json({ received: true, duplicate: true }, { status: 200 });
  }

  // ─── Handlers por tipo de evento ─────────────────────────────────────────

  try {
    switch (event.type) {

      // Checkout concluído — ativar subscription no Supabase
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        // userId enviado via client_reference_id e também em metadata
        const userId         = session.client_reference_id ?? session.metadata?.userId;
        const customerId     = typeof session.customer === 'string' ? session.customer : null;
        const subscriptionId = typeof session.subscription === 'string' ? session.subscription : null;
        const plano          = session.metadata?.plano ?? 'mensal';

        await atualizarAssinatura(
          montarFiltro(userId, subscriptionId, customerId),
          {
            status:                 'active',
            plan:                   plano,
            stripe_customer_id:     customerId,
            stripe_subscription_id: subscriptionId,
          },
          'checkout.session.completed',
        );
        break;
      }

      // Assinatura criada (redundante ao checkout.session.completed, mas seguro manter)
      case 'customer.subscription.created': {
        const sub        = event.data.object as Stripe.Subscription;
        const userId     = sub.metadata?.userId;
        const plano      = sub.metadata?.plano ?? 'mensal';
        const customerId = typeof sub.customer === 'string' ? sub.customer : null;

        await atualizarAssinatura(
          montarFiltro(userId, sub.id, customerId),
          {
            status:                 'active',
            plan:                   plano,
            stripe_subscription_id: sub.id,
            stripe_customer_id:     customerId,
          },
          'customer.subscription.created',
        );
        break;
      }

      // Assinatura atualizada (upgrade/downgrade, renovação, inadimplência)
      case 'customer.subscription.updated': {
        const sub        = event.data.object as Stripe.Subscription;
        const userId     = sub.metadata?.userId;
        const customerId = typeof sub.customer === 'string' ? sub.customer : null;
        const novoStatus = STATUS_MAP[sub.status];

        if (!novoStatus) {
          console.log('[webhook] subscription.updated: status sem mapeamento —', sub.status);
          break;
        }

        await atualizarAssinatura(
          montarFiltro(userId, sub.id, customerId),
          { status: novoStatus },
          `customer.subscription.updated (${sub.status})`,
        );
        break;
      }

      // Assinatura cancelada — rebaixar acesso
      case 'customer.subscription.deleted': {
        const sub        = event.data.object as Stripe.Subscription;
        const userId     = sub.metadata?.userId;
        const customerId = typeof sub.customer === 'string' ? sub.customer : null;

        await atualizarAssinatura(
          montarFiltro(userId, sub.id, customerId),
          { status: 'canceled', stripe_subscription_id: null },
          'customer.subscription.deleted',
        );
        break;
      }

      // Cobrança bem-sucedida (renovação) — garantir status active
      case 'invoice.payment_succeeded': {
        const inv        = event.data.object as Stripe.Invoice;
        const customerId = typeof inv.customer === 'string' ? inv.customer : null;

        await atualizarAssinatura(
          montarFiltro(null, null, customerId),
          { status: 'active' },
          'invoice.payment_succeeded',
        );
        break;
      }

      // Cobrança falhou — marcar como inadimplente
      case 'invoice.payment_failed': {
        const inv        = event.data.object as Stripe.Invoice;
        const customerId = typeof inv.customer === 'string' ? inv.customer : null;

        await atualizarAssinatura(
          montarFiltro(null, null, customerId),
          { status: 'past_due' },
          'invoice.payment_failed',
        );
        break;
      }

      default:
        // Evento não tratado — ignorar silenciosamente
        break;
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro no handler';
    console.error('[webhook] Erro ao processar evento:', event.type, message);

    // Libera o event.id para que a retentativa do Stripe seja processada de novo.
    await supabaseAdmin.from('stripe_events').delete().eq('id', event.id);

    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
