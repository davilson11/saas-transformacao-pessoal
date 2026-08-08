'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { useSupabaseClient } from '@/lib/useSupabaseClient';
import { buscarRespostaFerramenta, salvarRespostaFerramenta } from '@/lib/queries';
import {
  krsAcompanhaveis,
  atualizarKr,
  resumoDoDia,
  type RespostasOkrs,
} from '@/lib/okrsNoDia';
import type { Json } from '@/lib/database.types';

const GOLD  = '#C8A030';
const CREAM = '#F5F0E8';

/**
 * Os resultados-chave dentro do registro diário.
 *
 * Automonitoramento é o BCT mais consistentemente eficaz, e a combinação com
 * definição de metas é a mais confiável das meta-análises — mais do que
 * qualquer uma das duas isolada. O app tinha as duas partes em telas separadas,
 * sem se falarem.
 *
 * Aparece só quando existe pelo menos um KR com meta numérica. Sem isso não há
 * o que acompanhar por número, e ocupar espaço no dia sem função seria ruído.
 */
export default function OkrsNoDia() {
  const { user, isLoaded } = useUser();
  const { getClient }      = useSupabaseClient();

  const [respostas,  setRespostas]  = useState<RespostasOkrs | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [salvandoId, setSalvandoId] = useState<string | null>(null);
  const [erro,       setErro]       = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;
    let cancelado = false;

    (async () => {
      const userId = user?.id;
      if (!userId) { if (!cancelado) setCarregando(false); return; }

      try {
        const client = await getClient();
        const r = await buscarRespostaFerramenta(userId, 'okrs-pessoais', client);
        if (cancelado) return;
        if (r?.respostas) setRespostas(r.respostas as RespostasOkrs);
      } catch (e) {
        console.error('[OkrsNoDia]', e instanceof Error ? e.message : e);
      } finally {
        if (!cancelado) setCarregando(false);
      }
    })();

    return () => { cancelado = true; };
  }, [isLoaded, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (carregando || !respostas) return null;

  const krs = krsAcompanhaveis(respostas);
  if (krs.length === 0) return null;

  async function gravar(objetivoIdx: number, krIdx: number, valor: string) {
    if (!user?.id || !respostas) return;
    const id = `${objetivoIdx}-${krIdx}`;

    // Otimista: o número muda na tela na hora. Se falhar, o erro aparece e a
    // pessoa pode tentar de novo — bem melhor que travar o campo esperando rede.
    const novas = atualizarKr(respostas, objetivoIdx, krIdx, valor);
    setRespostas(novas);
    setSalvandoId(id);
    setErro(null);

    try {
      const client = await getClient();
      const ok = await salvarRespostaFerramenta(
        user.id, 'F05', 'okrs-pessoais', novas as unknown as Json, 100, false, client,
      );
      if (!ok) throw new Error('Não consegui salvar o número.');
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não consegui salvar o número.');
    } finally {
      setSalvandoId(null);
    }
  }

  return (
    <div style={{ background: '#0E0E0E', borderRadius: 14, padding: '20px 22px', border: '1px solid rgba(200,160,48,0.18)' }}>
      <div className="flex items-start justify-between gap-3" style={{ marginBottom: 4 }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: GOLD, margin: 0 }}>
          Seus resultados-chave
        </p>
        <Link
          href="/ferramentas/okrs-pessoais"
          style={{ fontSize: 11.5, color: 'rgba(245,240,232,0.45)', textDecoration: 'none', flexShrink: 0 }}
        >
          editar ↗
        </Link>
      </div>

      <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {krs.map((k) => {
          const id = `${k.objetivoIdx}-${k.krIdx}`;
          return (
            <div key={id}>
              <div className="flex items-baseline gap-2" style={{ marginBottom: 6 }}>
                <span style={{ fontSize: 13, flexShrink: 0 }}>{k.emoji}</span>
                <p style={{
                  fontSize: 14, lineHeight: 1.4, margin: 0,
                  color: k.concluido ? 'rgba(245,240,232,0.5)' : CREAM,
                  textDecoration: k.concluido ? 'line-through' : 'none',
                }}>
                  {k.descricao}
                </p>
              </div>

              <div style={{ height: 5, background: 'rgba(245,240,232,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${Math.max(1, k.progresso)}%`,
                  background: k.concluido ? '#22c55e' : `linear-gradient(90deg, ${GOLD}, #e8b84b)`,
                  borderRadius: 3, transition: 'width .4s ease',
                }} />
              </div>

              <div className="flex items-center gap-2" style={{ marginTop: 8 }}>
                <input
                  type="text"
                  inputMode="decimal"
                  defaultValue={String(k.atual)}
                  onBlur={(e) => {
                    const v = e.target.value.trim();
                    if (v !== String(k.atual)) gravar(k.objetivoIdx, k.krIdx, v);
                  }}
                  aria-label={`Valor atual de ${k.descricao}`}
                  style={{
                    width: 84, padding: '8px 10px', borderRadius: 8, fontSize: 15,
                    background: 'rgba(245,240,232,0.06)', color: CREAM,
                    border: '1px solid rgba(245,240,232,0.15)', outline: 'none',
                    minHeight: 40, textAlign: 'right',
                  }}
                />
                <span style={{ fontSize: 13.5, color: 'rgba(245,240,232,0.5)' }}>
                  de {k.meta}{k.unidade ? ` ${k.unidade}` : ''}
                </span>
                <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 11, color: k.concluido ? '#22c55e' : 'rgba(245,240,232,0.4)' }}>
                  {salvandoId === id ? '…' : `${k.progresso}%`}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {erro && <p style={{ fontSize: 12.5, color: '#f87171', margin: '12px 0 0' }}>{erro}</p>}

      <p style={{ fontSize: 12.5, color: 'rgba(245,240,232,0.45)', lineHeight: 1.5, margin: '14px 0 0' }}>
        {resumoDoDia(krs)}
      </p>
    </div>
  );
}
