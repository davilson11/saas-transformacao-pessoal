'use client';
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useSupabaseClient } from "./useSupabaseClient";
import { buscarRespostaFerramenta } from "./queries";

/**
 * Carrega as respostas salvas de uma ferramenta.
 *
 * `carregando` foi adicionado depois, quando os OKRs passaram a ler as respostas
 * da Bússola: `dados === null` significava tanto "ainda buscando" quanto "não
 * existe", e a tela precisa tratar os dois casos de formas diferentes — spinner
 * num caso, convite para fazer a Bússola no outro.
 *
 * O campo `dados` continua igual, então as 17 ferramentas que já usam este hook
 * não precisam mudar nada.
 */
export function useCarregarRespostas<T = Record<string, unknown>>(slug: string) {
  const { user, isLoaded } = useUser();
  const { getClient } = useSupabaseClient();
  const [dados, setDados] = useState<T | null>(null);
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
        const r = await buscarRespostaFerramenta(userId, slug, client);
        if (cancelado) return;
        if (r?.respostas) setDados(r.respostas as T);
      } catch (err) {
        console.error('[useCarregarRespostas]', slug, err);
      } finally {
        if (!cancelado) setCarregando(false);
      }
    })();

    return () => { cancelado = true; };
  }, [isLoaded, user?.id, slug]); // eslint-disable-line react-hooks/exhaustive-deps

  return { dados, carregando };
}
