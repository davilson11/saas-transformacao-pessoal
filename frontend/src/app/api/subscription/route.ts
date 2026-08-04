import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

/**
 * Criação do trial — server-side, com service-role.
 *
 * Antes o cliente fazia o INSERT direto no Supabase. Como a policy de RLS só
 * validava `user_id`, o usuário podia escolher o próprio `trial_ends_at`
 * (ou depois virar `status: 'active'` com um UPDATE) e liberar o produto de graça.
 * Agora o cliente não escreve nada em `subscriptions`: só lê.
 */

const TRIAL_DIAS = 7;

export async function POST(): Promise<NextResponse> {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  }

  try {
    // Já existe? Devolve como está — nunca reinicia um trial nem rebaixa um pago.
    const { data: existente, error: erroLeitura } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (erroLeitura) {
      console.error('[subscription POST] leitura:', erroLeitura.message);
      return NextResponse.json({ error: erroLeitura.message }, { status: 500 });
    }

    if (existente) {
      return NextResponse.json({ subscription: existente }, { status: 200 });
    }

    const trialEndsAt = new Date(Date.now() + TRIAL_DIAS * 86_400_000).toISOString();

    const { data, error } = await supabaseAdmin
      .from('subscriptions')
      .insert({ user_id: userId, status: 'trial', trial_ends_at: trialEndsAt })
      .select()
      .maybeSingle();

    // Corrida entre duas abas: a linha foi criada no meio do caminho (UNIQUE user_id).
    if (error?.code === '23505') {
      const { data: recuperada } = await supabaseAdmin
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      return NextResponse.json({ subscription: recuperada }, { status: 200 });
    }

    if (error) {
      console.error('[subscription POST] insert:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ subscription: data }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro interno';
    console.error('[subscription POST]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
