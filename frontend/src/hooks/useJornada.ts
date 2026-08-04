'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useSupabaseClient } from '@/lib/useSupabaseClient';
import {
  diaJornadaHoje,
  diaJornadaDe,
  estadoJornada,
  type EstadoJornada,
} from '@/lib/jornada';

export type UseJornadaResult = {
  /** Data em que a jornada começou (YYYY-MM-DD). */
  inicio:  string | null;
  /** Tudo que as telas precisam sobre o dia de hoje. */
  estado:  EstadoJornada | null;
  /** Dia do ciclo a usar nas consultas de conteúdo (1..365). */
  diaHoje: number | null;
  carregando: boolean;
  /**
   * Converte uma data do diário no dia do ciclo em que a pessoa estava.
   * O diário é ancorado na data real; o conteúdo, no dia da jornada. Esta é a
   * ponte entre os dois.
   */
  diaDoCicloEm: (data: string) => number | null;
};

/**
 * A jornada do usuário.
 *
 * `jornada_inicio` mora em `subscriptions` porque é lá que já existe uma linha
 * por usuário com RLS de leitura própria — não valia uma tabela nova para
 * guardar uma data.
 */
export function useJornada(): UseJornadaResult {
  const { user, isLoaded } = useUser();
  const { getClient }      = useSupabaseClient();
  const [inicio, setInicio]         = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;

    let cancelado = false;

    (async () => {
      const userId = user?.id;
      if (!userId) {
        if (!cancelado) setCarregando(false);
        return;
      }

      try {
        const client = await getClient();
        const { data, error } = await client
          .from('subscriptions')
          .select('jornada_inicio')
          .eq('user_id', userId)
          .maybeSingle();

        if (cancelado) return;
        if (error) throw new Error(error.message);

        const valor = (data as { jornada_inicio?: string | null } | null)?.jornada_inicio;
        if (valor) setInicio(valor);
      } catch (e) {
        console.error('[useJornada]', e instanceof Error ? e.message : e);
      } finally {
        if (!cancelado) setCarregando(false);
      }
    })();

    return () => { cancelado = true; };
  }, [isLoaded, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const diaAbsoluto = inicio ? diaJornadaHoje(inicio) : null;
  const estado      = diaAbsoluto !== null ? estadoJornada(diaAbsoluto) : null;

  return {
    inicio,
    estado,
    diaHoje: estado?.diaNoCiclo ?? null,
    carregando,
    diaDoCicloEm: (data: string) => {
      if (!inicio) return null;
      const abs = diaJornadaDe(data, inicio);
      if (abs === null) return null;
      return estadoJornada(abs)?.diaNoCiclo ?? null;
    },
  };
}
