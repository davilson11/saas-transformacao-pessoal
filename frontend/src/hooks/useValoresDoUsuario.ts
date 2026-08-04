'use client';

import { useCarregarRespostas } from '@/lib/useCarregarRespostas';
import { valoresDoUsuario, type RespostasBussola, type Valor } from '@/lib/valores';

export type UseValoresDoUsuarioResult = {
  /** Valores do usuário, do mais para o menos prioritário. */
  valores:    Valor[];
  /** true quando a Bússola ainda não foi preenchida. */
  semBussola: boolean;
  carregando: boolean;
};

/**
 * Lê os valores que o usuário definiu na Bússola.
 *
 * É a primeira ponte entre duas ferramentas do produto: até aqui, cada uma
 * carregava apenas as próprias respostas (`useCarregarRespostas` com o próprio
 * slug) e nenhuma sabia o que a outra tinha descoberto.
 *
 * `useCarregarRespostas` devolve `null` tanto enquanto carrega quanto quando
 * não há resposta salva. Para a tela, a diferença importa — "carregando" e
 * "você ainda não fez a Bússola" pedem interfaces diferentes —, então aqui a
 * gente separa os dois com um estado próprio.
 */
export function useValoresDoUsuario(): UseValoresDoUsuarioResult {
  const { dados, carregando } = useCarregarRespostas<RespostasBussola>('bussola-valores');

  const valores = valoresDoUsuario(dados);

  return {
    valores,
    semBussola: !carregando && valores.length === 0,
    carregando,
  };
}
