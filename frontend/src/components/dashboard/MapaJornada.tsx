'use client';

import { useState } from 'react';
import {
  MESES_JORNADA,
  TOTAL_DIAS,
  calcularConstancia,
  type EstadoJornada,
} from '@/lib/jornada';

const GOLD  = '#C8A030';
const CREAM = '#F5F0E8';

/**
 * O mapa persistente da jornada.
 *
 * A tela do Dia 1 mostra os 12 territórios uma vez e desaparece. Depois disso o
 * usuário ficava sem nenhuma forma de se localizar nos 365 dias — o produto
 * prometia um plano no primeiro dia e não sustentava no segundo.
 *
 * A queixa que originou este app é que cursos e mentorias dão clareza sem dar
 * plano nem referência. "Onde estou, por onde passei, o que vem" é literalmente
 * a resposta a essa queixa, e precisa estar visível todo dia — não uma vez só.
 *
 * Fechado por padrão para não competir com o conteúdo do dia, que é o motivo de
 * a pessoa ter aberto o app.
 */
export default function MapaJornada({
  estado,
  diasRegistrados,
}: {
  estado: EstadoJornada | null;
  /** Dias com registro no diário desde o início da jornada. */
  diasRegistrados: number;
}) {
  const [aberto, setAberto] = useState(false);

  if (!estado) return null;

  const constancia = calcularConstancia(diasRegistrados, estado.diaAbsoluto);

  return (
    <div
      style={{
        background: '#0E0E0E',
        borderRadius: 14,
        border: '1px solid rgba(200,160,48,0.18)',
        overflow: 'hidden',
      }}
    >
      {/* Cabeçalho — sempre visível */}
      <button
        onClick={() => setAberto((a) => !a)}
        className="w-full text-left"
        style={{ background: 'transparent', border: 'none', padding: '18px 22px', cursor: 'pointer' }}
      >
        <div className="flex items-start justify-between gap-3">
          <div style={{ minWidth: 0 }}>
            <p style={{
              fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.16em',
              textTransform: 'uppercase', color: GOLD, margin: 0,
            }}>
              Sua jornada
            </p>
            <p style={{
              fontFamily: 'var(--font-heading)', fontStyle: 'italic', fontSize: 19,
              color: CREAM, margin: '5px 0 0', lineHeight: 1.25,
            }}>
              Dia {estado.diaNoCiclo} · {estado.mes.tema}
            </p>
          </div>

          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(245,240,232,0.4)',
            flexShrink: 0, paddingTop: 4,
          }}>
            {aberto ? '▲' : '▼'}
          </span>
        </div>

        {/* Progresso do ciclo */}
        <div style={{ marginTop: 14 }}>
          <div style={{ height: 5, background: 'rgba(245,240,232,0.08)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${Math.max(1, estado.progressoCiclo)}%`,
              background: `linear-gradient(90deg, ${GOLD}, #e8b84b)`,
              borderRadius: 3,
              transition: 'width .5s ease',
            }} />
          </div>
          <div className="flex items-center justify-between" style={{ marginTop: 7, gap: 10 }}>
            <span style={{ fontSize: 11.5, color: 'rgba(245,240,232,0.45)' }}>
              Mês {estado.mes.numero} de 12 · Fase {estado.fase}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(245,240,232,0.45)', flexShrink: 0 }}>
              {estado.diaNoCiclo}/{TOTAL_DIAS}
            </span>
          </div>
        </div>

        {/* Constância */}
        <p style={{ fontSize: 12.5, color: 'rgba(245,240,232,0.6)', margin: '12px 0 0', lineHeight: 1.5 }}>
          {constancia.texto}
        </p>
      </button>

      {/* Os 12 territórios */}
      {aberto && (
        <div style={{ padding: '4px 14px 16px', borderTop: '1px solid rgba(245,240,232,0.07)' }}>
          <ol style={{ listStyle: 'none', padding: 0, margin: '12px 0 0' }}>
            {MESES_JORNADA.map((mes) => {
              const passou = mes.diaFim < estado.diaNoCiclo;
              const atual  = mes.numero === estado.mes.numero;

              return (
                <li
                  key={mes.numero}
                  className="flex items-center gap-3"
                  style={{
                    padding: '8px 10px',
                    borderRadius: 9,
                    background: atual ? 'rgba(200,160,48,0.10)' : 'transparent',
                    border: `1px solid ${atual ? 'rgba(200,160,48,0.32)' : 'transparent'}`,
                    marginBottom: 1,
                  }}
                >
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: 10.5, width: 20, flexShrink: 0,
                    color: atual ? GOLD : passou ? 'rgba(245,240,232,0.5)' : 'rgba(245,240,232,0.25)',
                  }}>
                    {passou ? '✓' : String(mes.numero).padStart(2, '0')}
                  </span>

                  <span style={{
                    fontSize: 14, lineHeight: 1.35,
                    color: atual ? CREAM : passou ? 'rgba(245,240,232,0.55)' : 'rgba(245,240,232,0.32)',
                    fontWeight: atual ? 600 : 400,
                  }}>
                    {mes.tema}
                  </span>

                  {atual && (
                    <span style={{
                      marginLeft: 'auto', flexShrink: 0,
                      fontFamily: 'var(--font-mono)', fontSize: 9.5,
                      color: GOLD, letterSpacing: '0.08em',
                    }}>
                      {estado.progressoMes}%
                    </span>
                  )}
                </li>
              );
            })}
          </ol>

          {estado.volta > 1 && (
            <p style={{
              fontSize: 12, color: 'rgba(245,240,232,0.5)', lineHeight: 1.55,
              margin: '14px 10px 0', fontStyle: 'italic',
            }}>
              Esta é sua {estado.volta}ª volta. As perguntas se repetem de propósito —
              o que mudou é você, e a diferença entre as respostas é a medida disso.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
