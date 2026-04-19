import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';
import { supabaseAdmin } from '@/lib/supabase-admin';

// ─── Configuração VAPID ───────────────────────────────────────────────────────
//
// Variáveis de ambiente necessárias em .env.local:
//   VAPID_PUBLIC_KEY   = chave pública gerada via `npx web-push generate-vapid-keys`
//   VAPID_PRIVATE_KEY  = chave privada correspondente
//   VAPID_EMAIL        = mailto:seu@email.com
//   NEXT_PUBLIC_VAPID_PUBLIC_KEY = mesma chave pública (acessível no client)
//
// Supabase: criar tabela push_subscriptions
//   CREATE TABLE push_subscriptions (
//     id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
//     user_id     text NOT NULL,
//     subscription jsonb NOT NULL,
//     created_at  timestamptz DEFAULT now(),
//     UNIQUE(user_id)
//   );

function initWebPush() {
  const pub  = process.env.VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  const mail = process.env.VAPID_EMAIL ?? 'mailto:contato@kairos.app';
  if (!pub || !priv) {
    throw new Error('VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY não definidas.');
  }
  webpush.setVapidDetails(mail, pub, priv);
}

// ─── Mensagem padrão ──────────────────────────────────────────────────────────

const MENSAGEM_PADRAO = {
  title: 'Kairos 📔',
  body:  'Seu dia ainda não foi registrado. 2 minutos para capturar o que foi mais significativo.',
  url:   '/ferramentas/diario-bordo',
  icon:  '/icon-192.png',
};

// ─── POST /api/notify — salvar subscription do usuário ───────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json() as {
      subscription?: {
        endpoint: string;
        keys:     { p256dh: string; auth: string };
      };
      userId?: string;
    };

    const { subscription, userId } = body;

    if (!subscription?.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
      return NextResponse.json({ error: 'Subscription inválida.' }, { status: 400 });
    }

    const supabase = supabaseAdmin;

    // Upsert: um registro por usuário (userId pode ser null para usuários não autenticados)
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert(
        { user_id: userId ?? 'anonymous', subscription },
        { onConflict: 'user_id' },
      );

    if (error) {
      console.error('[notify POST] Erro ao salvar subscription:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro interno';
    console.error('[notify POST]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// ─── GET /api/notify — enviar push para usuários sem registro hoje ────────────
//
// Chamado por um cron às 20h (ex: Vercel Cron Jobs, GitHub Actions, ou cron externo).
// Endpoint protegido por CRON_SECRET para evitar chamadas não autorizadas.
//
// Exemplo de Vercel cron em vercel.json:
//   { "crons": [{ "path": "/api/notify", "schedule": "0 23 * * *" }] }
//   (23h UTC = 20h BRT)

export async function GET(req: NextRequest): Promise<NextResponse> {
  // Proteção simples por secret header
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get('authorization');
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }
  }

  try {
    initWebPush();
    const supabase = supabaseAdmin;

    const hoje = new Date().toISOString().split('T')[0];

    // Usuários que registraram hoje
    const { data: comRegistro } = await supabase
      .from('diario_kairos')
      .select('user_id')
      .eq('data', hoje);

    const idsComRegistro = new Set(
      (comRegistro ?? []).map((r: { user_id: string }) => r.user_id)
    );

    // Subscriptions de usuários sem registro hoje
    const { data: subs, error: subsError } = await supabase
      .from('push_subscriptions')
      .select('user_id, subscription');

    if (subsError) {
      return NextResponse.json({ error: subsError.message }, { status: 500 });
    }

    const pendentes = (subs ?? []).filter(
      (s: { user_id: string }) => !idsComRegistro.has(s.user_id)
    ) as Array<{
      user_id:      string;
      subscription: { endpoint: string; keys: { p256dh: string; auth: string } };
    }>;

    const payload = JSON.stringify(MENSAGEM_PADRAO);
    const resultados = { enviados: 0, falhas: 0, removidos: 0 };

    await Promise.allSettled(
      pendentes.map(async ({ user_id, subscription }) => {
        try {
          await webpush.sendNotification(subscription, payload);
          resultados.enviados++;
        } catch (err: unknown) {
          // Subscription expirada ou inválida (410 Gone) → remover
          const status = (err as { statusCode?: number }).statusCode;
          if (status === 410 || status === 404) {
            await supabase
              .from('push_subscriptions')
              .delete()
              .eq('user_id', user_id);
            resultados.removidos++;
          } else {
            console.warn('[notify GET] Falha ao enviar para', user_id, status);
            resultados.falhas++;
          }
        }
      })
    );

    console.log('[notify GET] Resultado:', resultados);
    return NextResponse.json({ ok: true, ...resultados }, { status: 200 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro interno';
    console.error('[notify GET]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
