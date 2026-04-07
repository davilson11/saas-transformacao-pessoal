import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

webpush.setVapidDetails(
  process.env.VAPID_MAILTO!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { data: subs } = await supabase.from('push_subscriptions').select('*');
  if (!subs?.length) return NextResponse.json({ ok: true, sent: 0 });
  const payload = JSON.stringify({
    title: '🌅 Momento Kairos',
    body: 'Seu momento diário está pronto. Registre seu dia!',
    url: '/momento',
  });
  let sent = 0;
  for (const row of subs) {
    try {
      await webpush.sendNotification(row.subscription, payload);
      sent++;
    } catch (e) {
      await supabase.from('push_subscriptions').delete().eq('id', row.id);
    }
  }
  return NextResponse.json({ ok: true, sent });
}
