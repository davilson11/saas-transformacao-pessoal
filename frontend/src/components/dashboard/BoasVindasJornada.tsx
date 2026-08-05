'use client';

import { useState, useEffect } from 'react';
import { MESES_JORNADA, type EstadoJornada } from '@/lib/jornada';

const CHAVE = 'kairos_boas_vindas_jornada_v1';

const COR_DARK  = '#0E0E0E';
const COR_GOLD  = '#C8A030';
const COR_CREAM = '#F5F0E8';

/**
 * A tela do Dia 1.
 *
 * Existe por causa de uma pesquisa específica: Dai, Milkman e Riis mostraram que
 * as pessoas iniciam mudanças de comportamento logo após "marcos temporais" —
 * início de semana, de mês, aniversários. As pessoas são 33% mais propensas a se
 * exercitar no começo de uma semana.
 *
 * O detalhe que importa é o mecanismo: o que funciona não é a segunda-feira em
 * si, é a percepção de um novo período, que joga os fracassos anteriores para
 * um capítulo encerrado. Ou seja, o marco pode ser fabricado. "Hoje é o Dia 1"
 * é um marco temporal legítimo pela própria teoria.
 *
 * Foi por isso que a jornada começa no cadastro em vez de esperar segunda-feira:
 * esperar custaria até 6 dos 7 dias de trial. Em vez de esperar pelo marco, a
 * gente cria um — e esta tela é ele.
 *
 * Mostrar os 12 territórios de uma vez é deliberado: a queixa que originou este
 * produto é que cursos e mentorias dão clareza sem dar plano. Ver o mapa inteiro
 * no primeiro dia é a promessa de que aqui existe um.
 */
export default function BoasVindasJornada({ estado }: { estado: EstadoJornada | null }) {
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    // Só no Dia 1 da primeira volta, e só se ainda não foi visto.
    if (!estado || estado.diaAbsoluto !== 1) return;
    try {
      if (!localStorage.getItem(CHAVE)) setVisivel(true);
    } catch {
      // localStorage bloqueado (anônima, alguns navegadores) — não insiste.
    }
  }, [estado]);

  function fechar() {
    try { localStorage.setItem(CHAVE, new Date().toISOString()); } catch { /* ignora */ }
    setVisivel(false);
  }

  if (!visivel || !estado) return null;

  return (
    <div
      className="flex flex-col"
      style={{
        position: 'fixed', inset: 0, zIndex: 60,
        background: COR_DARK, overflowY: 'auto',
        padding: '32px 20px 40px',
      }}
    >
      <div style={{ maxWidth: 560, margin: '0 auto', width: '100%' }}>

        <p style={{
          fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.18em',
          textTransform: 'uppercase', color: COR_GOLD, marginBottom: 14,
        }}>
          Dia 1 de 365
        </p>

        <h1 style={{
          fontFamily: 'var(--font-heading)', fontStyle: 'italic', fontWeight: 400,
          fontSize: 'clamp(26px, 6vw, 38px)', lineHeight: 1.2, color: COR_CREAM,
          marginBottom: 18,
        }}>
          Hoje sua jornada começa.
        </h1>

        <p style={{ fontSize: 15.5, lineHeight: 1.7, color: 'rgba(245,240,232,0.75)', marginBottom: 10 }}>
          Nos próximos 365 dias você vai atravessar doze territórios. Não em ordem
          aleatória — cada um prepara o seguinte. Você não vai falar de metas antes
          de saber quem é, nem de disciplina antes de saber para onde vai.
        </p>

        <p style={{ fontSize: 15.5, lineHeight: 1.7, color: 'rgba(245,240,232,0.75)', marginBottom: 26 }}>
          Um dia por vez. Sem adiantar, sem acumular. Este é o mapa inteiro:
        </p>

        {/* Os 12 territórios */}
        <ol style={{ listStyle: 'none', padding: 0, margin: '0 0 28px' }}>
          {MESES_JORNADA.map((mes) => {
            const atual = mes.numero === estado.mes.numero;
            return (
              <li
                key={mes.numero}
                className="flex items-center gap-3"
                style={{
                  padding: '9px 12px',
                  borderRadius: 10,
                  background: atual ? 'rgba(200,160,48,0.10)' : 'transparent',
                  border: `1px solid ${atual ? 'rgba(200,160,48,0.35)' : 'transparent'}`,
                  marginBottom: 2,
                }}
              >
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 11, width: 22, flexShrink: 0,
                  color: atual ? COR_GOLD : 'rgba(245,240,232,0.35)',
                }}>
                  {String(mes.numero).padStart(2, '0')}
                </span>
                <span style={{
                  fontSize: 15, lineHeight: 1.4,
                  color: atual ? COR_CREAM : 'rgba(245,240,232,0.55)',
                  fontWeight: atual ? 600 : 400,
                }}>
                  {mes.tema}
                </span>
                {atual && (
                  <span style={{
                    marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 10,
                    color: COR_GOLD, letterSpacing: '0.1em', flexShrink: 0,
                  }}>
                    VOCÊ ESTÁ AQUI
                  </span>
                )}
              </li>
            );
          })}
        </ol>

        <p style={{
          fontSize: 14, lineHeight: 1.65, color: 'rgba(245,240,232,0.55)',
          fontStyle: 'italic', marginBottom: 28,
          borderLeft: `2px solid rgba(200,160,48,0.4)`, paddingLeft: 14,
        }}>
          O que você escrever hoje vai ser pedido de volta no Dia 365. A distância
          entre as duas respostas é a única medida de mudança que não dá para fingir.
        </p>

        <button
          onClick={fechar}
          className="w-full"
          style={{
            padding: '15px 24px', borderRadius: 12, border: 'none',
            background: COR_GOLD, color: COR_DARK,
            fontSize: 15.5, fontWeight: 600, cursor: 'pointer',
            minHeight: 50,
          }}
        >
          Começar o Dia 1
        </button>
      </div>
    </div>
  );
}
