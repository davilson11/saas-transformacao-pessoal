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
      if (!token) return supabase;
      return createAuthClient(token);
    } catch {
      return supabase;
    }
  }, [getToken]);

  return { getClient };
}
