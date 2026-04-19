import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: NextRequest) {
  const { userId, subscription } = await req.json() as { userId?: string; subscription?: unknown };
  if (!userId || !subscription) {
    return NextResponse.json({ error: 'Missing data' }, { status: 400 });
  }
  await supabaseAdmin.from('push_subscriptions').upsert(
    { user_id: userId, subscription },
    { onConflict: 'user_id' }
  );
  return NextResponse.json({ ok: true });
}
