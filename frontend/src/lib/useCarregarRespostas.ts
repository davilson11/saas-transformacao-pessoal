'use client';
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useSupabaseClient } from "./useSupabaseClient";
import { buscarRespostaFerramenta } from "./queries";
export function useCarregarRespostas<T = Record<string, unknown>>(slug: string) {
  const { user } = useUser();
  const { client } = useSupabaseClient();
  const [dados, setDados] = useState<T | null>(null);
  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      const r = await buscarRespostaFerramenta(user.id, slug, client);
      if (r?.respostas) setDados(r.respostas as T);
    })();
  }, [user?.id, slug, client]);
  return { dados };
}
