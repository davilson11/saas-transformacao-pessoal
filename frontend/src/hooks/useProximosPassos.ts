'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useSupabaseClient } from '@/lib/useSupabaseClient';
import {
  calcularProximosPassos,
  diaStr,
  type ProximoPasso,
  type RespostaFerramenta,
} from '@/lib/proximosPassos';

export type UseProximosPassosResult = {
  passos:  ProximoPasso[];
  loading: boolean;
  erro:    string | null;
};

/**
 * Busca o estado do usuário e delega o cálculo para `calcularProximosPassos`.
 * Toda a lógica de decisão vive lá (pura e testada); aqui só há I/O.
 */
export function useProximosPassos(): UseProximosPassosResult {
  const { user, isLoaded } = useUser();
  const { getClient }      = useSupabaseClient();
  const [passos,  setPassos]  = useState<ProximoPasso[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro,    setErro]    = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;

    let cancelado = false;

    (async () => {
      const userId = user?.id;
      if (!userId) {
        if (!cancelado) setLoading(false);
        return;
      }

      try {
        const client = await getClient();

        // Últimos 40 dias de diário bastam para a regra de sequência.
        const desde = diaStr(new Date(Date.now() - 40 * 86_400_000));

        const [respostasRes, diarioRes] = await Promise.all([
          client
            .from('ferramentas_respostas')
            .select('ferramenta_slug, progresso, concluida, updated_at')
            .eq('user_id', userId),
          client
            .from('diario_kairos')
            .select('data')
            .eq('user_id', userId)
            .gte('data', desde)
            .order('data', { ascending: false }),
        ]);

        if (cancelado) return;

        if (respostasRes.error) throw new Error(respostasRes.error.message);
        if (diarioRes.error)    throw new Error(diarioRes.error.message);

        const respostas = (respostasRes.data ?? []) as RespostaFerramenta[];
        const diasComRegistro = Array.from(
          new Set((diarioRes.data ?? []).map((d: { data: string }) => d.data)),
        );

        setPassos(calcularProximosPassos({ respostas, diasComRegistro }));
      } catch (e) {
        if (cancelado) return;
        const msg = e instanceof Error ? e.message : 'Erro ao carregar próximos passos';
        console.error('[useProximosPassos]', msg);
        setErro(msg);
      } finally {
        if (!cancelado) setLoading(false);
      }
    })();

    return () => { cancelado = true; };
  }, [isLoaded, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return { passos, loading, erro };
}
