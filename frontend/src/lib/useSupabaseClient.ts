'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@clerk/nextjs';
import { supabase, createAuthClient } from './supabase';

/**
 * Hook que retorna um SupabaseClient autenticado com o JWT do Clerk.
 * Usa useMemo para criar uma única instância por token (evita "Multiple GoTrueClient instances").
 * Retorna o client anônimo enquanto o token ainda não foi obtido.
 */
export function useSupabaseClient() {
  const { getToken } = useAuth();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    getToken({ template: 'supabase' })
      .then((t) => { if (t) setToken(t); })
      .catch(() => {});
  }, [getToken]);

  const client = useMemo(
    () => (token ? createAuthClient(token) : supabase),
    [token]
  );

  return { client };
}
