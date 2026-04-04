'use client';

import { useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createClient } from '@supabase/supabase-js';

export function useSupabaseClient() {
  const { getToken } = useAuth();

  const getClient = useCallback(async () => {
    const token = await getToken({ template: 'supabase' });

    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );
  }, [getToken]);

  return { getClient };
}