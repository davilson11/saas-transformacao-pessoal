'use client';

import { useRef, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { supabase, createAuthClient } from './supabase';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

/**
 * Hook que retorna getClient() — função com referência estável (useCallback deps vazias).
 *
 * Por que useRef para getToken:
 *   Clerk não garante estabilidade de getToken entre renders. Guardá-lo em ref
 *   permite que getClient[] (deps vazias) sempre chame a versão mais recente
 *   sem precisar declarar getToken como dep (o que causaria loop infinito).
 *
 * Por que useRef para client/token:
 *   Reutiliza a mesma instância SupabaseClient enquanto o token não muda,
 *   evitando "Multiple GoTrueClient instances detected".
 *
 * Como usar nos callers:
 *   const { getClient } = useSupabaseClient();
 *   // dentro de effect ou handler async:
 *   const client = await getClient();
 *   // NÃO incluir getClient nas dep arrays — é estável por design.
 */
export function useSupabaseClient() {
  const { getToken } = useAuth();

  // Ref para getToken: sempre aponta para a versão mais recente sem ser dep
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  // Cache do client e do token string
  const clientRef = useRef<SupabaseClient<Database>>(supabase);
  const tokenRef  = useRef<string | null>(null);

  const getClient = useCallback(async () => {
    try {
      const t = await getTokenRef.current({ template: 'supabase' });
      if (t && t !== tokenRef.current) {
        tokenRef.current  = t;
        clientRef.current = createAuthClient(t);
      }
    } catch {
      // sem sessão ativa → retorna client anônimo
    }
    return clientRef.current;
  }, []); // deps vazias — getClient nunca muda de referência

  return { getClient };
}
