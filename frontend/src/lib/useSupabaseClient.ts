'use client';

import { useRef, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { supabase, createAuthClient } from './supabase';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

/**
 * Cache GLOBAL — compartilhado entre todos os componentes.
 * Evita múltiplas instâncias GoTrueClient no mesmo contexto.
 */
let globalClient: SupabaseClient<Database> = supabase;
let globalToken: string | null = null;

export function useSupabaseClient() {
  const { getToken } = useAuth();
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  const getClient = useCallback(async () => {
    try {
      const t = await getTokenRef.current({ template: 'supabase' });
      if (t && t !== globalToken) {
        globalToken = t;
        globalClient = createAuthClient(t);
      }
    } catch {
      // sem sessão ativa → retorna client anônimo
    }
    return globalClient;
  }, []);

  return { getClient };
}
