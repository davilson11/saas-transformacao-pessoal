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

    // `cancelado` evita setState depois que o componente desmonta ou que o
    // usuário muda no meio da requisição.
    let cancelado = false;

    (async () => {
      const userId = user?.id;
      if (!userId) {
        if (!cancelado) setLoading(false);
        return;
      }

      const token = await getToken({ template: 'supabase' });
      if (!token) {
        if (!cancelado) setLoading(false);
        return;
      }

      const client = await getClient();
      let found = await getSubscription(userId, client);

      // Nenhuma subscription existe → criar trial no servidor
      if (!found) {
        found = await startTrial();
        // Se a rota falhou, tenta reler (pode ter sido criada em outra aba)
        if (!found) {
          found = await getSubscription(userId, client);
        }
      }

      if (cancelado) return;
      setSub(found);
      setLoading(false);
    })();

    return () => { cancelado = true; };
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
