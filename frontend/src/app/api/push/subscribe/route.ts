import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: NextRequest) {
  // O user_id vem SEMPRE da sessão do Clerk. Nunca do body: esta rota escreve
  // com a service-role key (ignora RLS), então aceitar um userId do cliente
  // permitiria sobrescrever a push subscription de qualquer usuário.
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  }

  const { subscription } = await req.json() as { subscription?: unknown };
  if (!subscription) {
    return NextResponse.json({ error: 'Missing data' }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from('push_subscriptions').upsert(
    { user_id: userId, subscription },
    { onConflict: 'user_id' },
  );

  if (error) {
    console.error('[push/subscribe] erro ao salvar:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
