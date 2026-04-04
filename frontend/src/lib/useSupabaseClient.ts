'use client';

import { useCallback } from 'react';
import { supabase } from './supabase';

/**
 * Hook que retorna uma função `getClient()`.
 * RLS desabilitado — retorna o client anônimo diretamente.
 */
export function useSupabaseClient() {
  const getClient = useCallback(async () => supabase, []);

  return { getClient };
}
