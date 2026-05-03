'use client';

import { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { useSupabaseClient } from '@/lib/useSupabaseClient';
import {
  getSubscription,
  startTrial,
  isTrialActive,
  isPro,
  hasAccess,
  getDaysRemaining,
  type Subscription,
} from '@/lib/subscription';

export type UseSubscriptionResult = {
  subscription:    Subscription | null;
  hasAccess:       boolean;
  isTrialActive:   boolean;
  isPro:           boolean;
  daysRemaining:   number;
  loading:         boolean;
};

export function useSubscription(): UseSubscriptionResult {
  const { user, isLoaded }    = useUser();
  const { getToken }          = useAuth();
  const { getClient }         = useSupabaseClient();
  const [sub, setSub]         = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;
    if (!user?.id) { setLoading(false); return; }

    (async () => {
      const token = await getToken({ template: 'supabase' });
      if (!token) { setLoading(false); return; }

      const client = await getClient();
      let found = await getSubscription(user.id, client);

      // Nenhuma subscription existe → criar trial automaticamente
      if (!found) {
        found = await startTrial(user.id, client);
        // Se o upsert com ignoreDuplicates devolveu null (linha já existia),
        // buscar novamente para garantir
        if (!found) {
          found = await getSubscription(user.id, client);
        }
      }

      setSub(found);
      setLoading(false);
    })();
  }, [isLoaded, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!sub) {
    return { subscription: null, hasAccess: false, isTrialActive: false, isPro: false, daysRemaining: 0, loading };
  }

  return {
    subscription:  sub,
    hasAccess:     hasAccess(sub),
    isTrialActive: isTrialActive(sub),
    isPro:         isPro(sub),
    daysRemaining: getDaysRemaining(sub),
    loading,
  };
}
