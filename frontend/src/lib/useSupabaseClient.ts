'use client';

import { useAuth } from '@clerk/nextjs';
import { useCallback } from 'react';
import { supabase, createAuthClient } from './supabase';

/**
 * Hook que retorna uma função `getClient()`.
 * Chame `await getClient()` dentro de handlers async para obter um
 * SupabaseClient autenticado com o JWT do Clerk (necessário para RLS).
 * Se não houver sessão ativa, retorna o client anônimo como fallback.
 */
export function useSupabaseClient() {
  const { getToken } = useAuth();

  const getClient = useCallback(async () => {
    try {
      const token = await getToken({ template: 'supabase' });
      if (!token) {
        console.warn('[useSupabaseClient] ⚠️ JWT token NULL — usando client anônimo. Verifique se o JWT Template "supabase" está configurado no Clerk Dashboard.');
        return supabase;
      }
      console.log('[useSupabaseClient] ✅ JWT token obtido com sucesso. RLS autenticado.');
      return createAuthClient(token);
    } catch (err) {
      console.error('[useSupabaseClient] ❌ Erro ao obter token:', err);
      return supabase;
    }
  }, [getToken]);

  return { getClient };
}
