'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { useSupabaseClient } from '@/lib/useSupabaseClient';
import { buscarVisaoAncora } from '@/lib/queries';
import {
  mesAAferir,
  enunciado,
  resumirSerie,
  OPCOES,
  type Afericao,
  type RespostaAfericao,
} from '@/lib/afericao';
import { buscarAfericoes, salvarAfericao } from '@/lib/afericaoDb';
import type { EstadoJornada } from '@/lib/jornada';

const GOLD  = '#C8A030';
const CREAM = '#F5F0E8';

/**
 * A aferição do caminho — a peça que liga o mapa à Visão Âncora.
 *
 * Até aqui a âncora era exibida em quatro telas e nunca usada como referência.
 * "Estou no caminho certo?" só significa alguma coisa em relação a um norte, e
 * o norte estava ali do lado, decorativo.
 *
 * Aparece só quando um mês da jornada se encerrou e ainda não foi aferido.
 * Nos outros dias, some — perguntar todo dia transformaria a régua em ruído.
 */
export default function AfericaoAncora({ estado }: { estado: EstadoJornada | null }) {
  const { user, isLoaded } = useUser();
  const { getClient }      = useSupabaseClient();

  const [manchete,   setManchete]   = useState<string | null>(null);
  const [afericoes,  setAfericoes]  = useState<Afericao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [escolha,    setEscolha]    = useState<RespostaAfericao | null>(null);
  const [porque,     setPorque]     = useState('');
  const [salvando,   setSalvando]   = useState(false);
  const [erro,       setErro]       = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;
    let cancelado = false;

    (async () => {
      const userId = user?.id;
      if (!userId) { if (!cancelado) setCarregando(false); return; }

      try {
        const client = await getClient();
        const [ancora, lista] = await Promise.all([
          buscarVisaoAncora(userId, client),
          buscarAfericoes(client, userId),
        ]);
        if (cancelado) return;
        setManchete(ancora?.manchete ?? null);
        setAfericoes(lista);
      } catch (e) {
        console.error('[AfericaoAncora]', e instanceof Error ? e.message : e);
      } finally {
        if (!cancelado) setCarregando(false);
      }
    })();

    return () => { cancelado = true; };
  }, [isLoaded, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (carregando || !estado) return null;

  const mes = mesAAferir(estado, afericoes);
  if (!mes) return null; // nada a aferir hoje

  // Sem âncora não há norte — o convite é criar a âncora, não responder.
  if (!manchete?.trim()) {
    return (
      <div style={{ background: '#0E0E0E', borderRadius: 14, padding: '18px 22px', border: '1px solid rgba(200,160,48,0.18)' }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: GOLD, margin: 0 }}>
          Fim do mês {mes.numero}
        </p>
        <p style={{ fontSize: 14.5, color: 'rgba(245,240,232,0.75)', lineHeight: 1.6, margin: '10px 0 0' }}>
          Você fechou <em>{mes.tema}</em>. Para saber se está no caminho certo, primeiro
          é preciso ter um norte. Escreva sua{' '}
          <Link href="/visao-ancora" style={{ color: GOLD, fontWeight: 600, textDecoration: 'underline' }}>
            Visão Âncora
          </Link>{' '}
          — e ao fim de cada mês o app devolve ela para você conferir a direção.
        </p>
      </div>
    );
  }

  const pergunta = enunciado(mes, manchete)!;
  const serie    = resumirSerie(afericoes, estado.volta);

  async function salvar() {
    if (!escolha || !user?.id) return;
    setSalvando(true);
    setErro(null);
    try {
      const client = await getClient();
      await salvarAfericao(client, {
        userId:     user.id,
        mesJornada: mes!.numero,
        volta:      estado!.volta,
        diaJornada: estado!.diaAbsoluto,
        resposta:   escolha,
        porque:     porque.trim() || null,
        manchete,
      });

      setAfericoes((prev) => [...prev, {
        mes_jornada: mes!.numero, volta: estado!.volta, dia_jornada: estado!.diaAbsoluto,
        resposta: escolha, porque: porque.trim() || null,
        manchete_no_momento: manchete, created_at: new Date().toISOString(),
      }]);
      setEscolha(null);
      setPorque('');
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não consegui salvar. Tente de novo.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div style={{ background: '#0E0E0E', borderRadius: 14, padding: '20px 22px', border: `1px solid rgba(200,160,48,0.3)` }}>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: GOLD, margin: 0 }}>
        Aferição · fim do mês {mes.numero}
      </p>

      {/* A âncora, devolvida */}
      <p style={{
        fontFamily: 'var(--font-heading)', fontStyle: 'italic', fontSize: 18,
        color: CREAM, lineHeight: 1.4, margin: '12px 0 0',
        borderLeft: `2px solid ${GOLD}`, paddingLeft: 14,
      }}>
        “{manchete}”
      </p>

      <p style={{ fontSize: 14.5, color: 'rgba(245,240,232,0.72)', lineHeight: 1.6, margin: '16px 0 0' }}>
        {pergunta}
      </p>

      {/* As três opções */}
      <div className="flex flex-wrap gap-2" style={{ marginTop: 16 }}>
        {OPCOES.map((o) => {
          const ativo = escolha === o.valor;
          return (
            <button
              key={o.valor}
              type="button"
              onClick={() => setEscolha(o.valor)}
              style={{
                flex: '1 1 30%', minWidth: 96, minHeight: 46,
                padding: '11px 12px', borderRadius: 10, cursor: 'pointer',
                fontSize: 14, fontWeight: ativo ? 700 : 500,
                border: `1.5px solid ${ativo ? o.cor : 'rgba(245,240,232,0.16)'}`,
                background: ativo ? `${o.cor}26` : 'transparent',
                color: ativo ? CREAM : 'rgba(245,240,232,0.6)',
              }}
            >
              {o.rotulo}
            </button>
          );
        })}
      </div>

      {escolha && (
        <>
          <textarea
            value={porque}
            onChange={(e) => setPorque(e.target.value)}
            placeholder="Em uma frase: por quê? (opcional)"
            style={{
              width: '100%', marginTop: 12, padding: '12px 14px', borderRadius: 10,
              background: 'rgba(245,240,232,0.05)', color: CREAM, fontSize: 15,
              border: '1px solid rgba(245,240,232,0.14)', outline: 'none',
              minHeight: 68, resize: 'vertical', lineHeight: 1.5,
            }}
          />

          <button
            onClick={salvar}
            disabled={salvando}
            className="w-full"
            style={{
              marginTop: 10, padding: '13px', borderRadius: 10, border: 'none',
              background: GOLD, color: '#0E0E0E', fontSize: 15, fontWeight: 600,
              cursor: salvando ? 'default' : 'pointer', opacity: salvando ? 0.6 : 1,
              minHeight: 48,
            }}
          >
            {salvando ? 'Registrando…' : 'Registrar aferição'}
          </button>
        </>
      )}

      {erro && (
        <p style={{ fontSize: 13, color: '#f87171', margin: '10px 0 0' }}>{erro}</p>
      )}

      {serie.total > 0 && (
        <p style={{
          fontSize: 12.5, color: 'rgba(245,240,232,0.5)', lineHeight: 1.55,
          margin: '16px 0 0', paddingTop: 14, borderTop: '1px solid rgba(245,240,232,0.08)',
        }}>
          {serie.texto}
        </p>
      )}
    </div>
  );
}
