import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { diaJornadaSeguro, estadoJornada } from '@/lib/jornada';
import { montarLembrete } from '@/lib/lembreteDiario';

/**
 * O lembrete da manhã.
 *
 * ─── O bug que isto conserta ───────────────────────────────────────────────
 *
 * O `vercel.json` agenda esta rota, e **o cron da Vercel faz uma requisição
 * GET**. Esta rota exportava apenas POST. Ou seja: todo dia, na hora marcada,
 * a Vercel chamava e recebia 405 Method Not Allowed. A notificação nunca saiu,
 * nenhuma vez, e nada falhou de forma visível — o botão "Ativar" funcionava, a
 * subscription era salva, e depois disso o silêncio.
 *
 * Agora o GET é o caminho do cron. O POST continua existindo para disparo
 * manual (útil para testar sem esperar o dia seguinte).
 *
 * ─── Por que a mensagem é montada por usuário ──────────────────────────────
 *
 * Cada pessoa está num dia diferente da jornada, então não existe uma mensagem
 * só. Esta rota lê o `jornada_inicio` de cada um, calcula em que dia está, e
 * busca a voz daquele dia. Ver `lembreteDiario.ts` para o porquê do formato.
 */

function initWebPush() {
  const pub  = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? process.env.VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  const mail = process.env.VAPID_MAILTO ?? process.env.VAPID_EMAIL ?? 'mailto:contato@kairos.app';
  if (!pub || !priv) throw new Error('Chaves VAPID não configuradas.');
  webpush.setVapidDetails(mail, pub, priv);
}

type Assinatura = Parameters<typeof webpush.sendNotification>[0];

async function enviarLembretes() {
  initWebPush();

  // Quem pediu para ser lembrado.
  const { data: subs, error } = await supabaseAdmin
    .from('push_subscriptions')
    .select('id, user_id, subscription');

  if (error) throw new Error(error.message);
  if (!subs?.length) return { enviados: 0, removidos: 0, falhas: 0 };

  const ids = subs.map((s) => s.user_id as string);

  // Em que dia cada um está.
  const { data: assinaturas } = await supabaseAdmin
    .from('subscriptions')
    .select('user_id, jornada_inicio, status, trial_ends_at')
    .in('user_id', ids);

  const inicioPor = new Map<string, string>();
  for (const a of (assinaturas ?? []) as Array<{
    user_id: string; jornada_inicio: string | null;
    status: string; trial_ends_at: string | null;
  }>) {
    // Só lembra quem tem acesso. Chamar de volta quem não pode entrar é pior
    // que não chamar.
    const ativo = a.status === 'active'
      || (a.status === 'trial' && !!a.trial_ends_at && new Date(a.trial_ends_at) > new Date());
    if (ativo && a.jornada_inicio) inicioPor.set(a.user_id, a.jornada_inicio);
  }

  // O conteúdo dos dias em questão, numa consulta só.
  const estadoPor = new Map<string, ReturnType<typeof estadoJornada>>();
  for (const [userId, inicio] of inicioPor) {
    estadoPor.set(userId, estadoJornada(diaJornadaSeguro(inicio)));
  }

  const diasNecessarios = [...new Set(
    [...estadoPor.values()].map((e) => e?.diaNoCiclo).filter((d): d is number => !!d),
  )];

  const vozPorDia = new Map<number, string>();
  if (diasNecessarios.length) {
    const { data: conteudos } = await supabaseAdmin
      .from('momento_kairos')
      .select('dia_jornada, voz_do_dia')
      .in('dia_jornada', diasNecessarios);

    for (const c of (conteudos ?? []) as Array<{ dia_jornada: number; voz_do_dia: string | null }>) {
      if (c.voz_do_dia) vozPorDia.set(c.dia_jornada, c.voz_do_dia);
    }
  }

  const resultado = { enviados: 0, removidos: 0, falhas: 0 };

  await Promise.allSettled(
    (subs as Array<{ id: string; user_id: string; subscription: Assinatura }>).map(
      async ({ id, user_id, subscription }) => {
        const estado = estadoPor.get(user_id);
        if (!estado) return; // sem acesso ou sem jornada: não incomoda

        const lembrete = montarLembrete(estado, vozPorDia.get(estado.diaNoCiclo));

        try {
          await webpush.sendNotification(
            subscription,
            JSON.stringify({ ...lembrete, icon: '/icon-192.png' }),
          );
          resultado.enviados++;
        } catch (e) {
          // 410/404 = o navegador descartou a subscription. Qualquer outro erro
          // pode ser temporário, e apagar nesse caso faria a pessoa perder o
          // lembrete para sempre por causa de uma falha de rede.
          const status = (e as { statusCode?: number }).statusCode;
          if (status === 410 || status === 404) {
            await supabaseAdmin.from('push_subscriptions').delete().eq('id', id);
            resultado.removidos++;
          } else {
            console.warn('[push/send] falha para', user_id, status);
            resultado.falhas++;
          }
        }
      },
    ),
  );

  return resultado;
}

function autorizado(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  // Falha fechada: sem secret configurada, ninguém dispara.
  if (!secret) return false;
  return req.headers.get('authorization') === `Bearer ${secret}`;
}

/** O caminho do cron da Vercel. */
export async function GET(req: NextRequest) {
  if (!process.env.CRON_SECRET) {
    console.error('[push/send] CRON_SECRET não definida — rota bloqueada.');
    return NextResponse.json({ error: 'Não configurado.' }, { status: 503 });
  }
  if (!autorizado(req)) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  try {
    const r = await enviarLembretes();
    console.log('[push/send]', r);
    return NextResponse.json({ ok: true, ...r });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erro interno';
    console.error('[push/send]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/** Disparo manual, para testar sem esperar o dia seguinte. */
export async function POST(req: NextRequest) {
  return GET(req);
}
