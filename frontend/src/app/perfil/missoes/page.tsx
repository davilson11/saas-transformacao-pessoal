'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { useSupabaseClient } from '@/lib/useSupabaseClient';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type DiaComMissao = {
  data:            string;
  missao:          string;
  cumprida:        boolean;
  missaoExecucao:  string | null;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatarDataCompleta(data: string): string {
  const d = new Date(data + 'T12:00:00');
  const dia = d.toLocaleDateString('pt-BR', { weekday: 'long' });
  const num = d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });
  return `${dia.charAt(0).toUpperCase() + dia.slice(1)}, ${num}`;
}

function mesLabel(ym: string): string {
  const [ano, mes] = ym.split('-');
  const d = new Date(parseInt(ano, 10), parseInt(mes, 10) - 1);
  const label = d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

// ─── Card da missão ────────────────────────────────────────────────────────────

function CardMissao({ dia }: { dia: DiaComMissao }) {
  return (
    <div style={{
      background: '#1A1A1A',
      border: dia.cumprida
        ? '1px solid rgba(200,160,48,0.18)'
        : '1px solid rgba(245,240,232,0.06)',
      borderRadius: 12,
      padding: '16px 18px',
      display: 'flex', alignItems: 'flex-start', gap: 14,
    }}>
      {/* Ícone status */}
      <div style={{
        width: 38, height: 38, borderRadius: 10, flexShrink: 0,
        background: dia.cumprida
          ? 'rgba(200,160,48,0.1)'
          : 'rgba(245,240,232,0.04)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 18,
      }}>
        {dia.cumprida ? '✅' : '⬜'}
      </div>

      {/* Conteúdo */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 11, color: 'rgba(245,240,232,0.3)',
          marginBottom: 5, textTransform: 'capitalize',
        }}>
          {formatarDataCompleta(dia.data)}
        </div>
        <p style={{
          fontSize: 14, color: 'rgba(245,240,232,0.85)',
          margin: 0, lineHeight: 1.65,
        }}>
          {dia.missao}
        </p>

        {dia.missaoExecucao && (
          <div style={{ marginTop: 10 }}>
            <span style={{
              display: 'block',
              fontSize: 11, fontWeight: 700,
              color: '#C8A030',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: 4,
            }}>
              Como executei:
            </span>
            <p style={{
              fontSize: 14, color: 'rgba(245,240,232,0.8)',
              margin: 0, lineHeight: 1.65,
              whiteSpace: 'pre-wrap',
            }}>
              {dia.missaoExecucao}
            </p>
          </div>
        )}
      </div>

      {/* Badge */}
      <span style={{
        flexShrink: 0, fontSize: 11, fontWeight: 700,
        padding: '4px 11px', borderRadius: 99,
        background: dia.cumprida
          ? 'rgba(200,160,48,0.12)'
          : 'rgba(245,240,232,0.05)',
        color: dia.cumprida ? '#C8A030' : 'rgba(245,240,232,0.28)',
        border: dia.cumprida
          ? '1px solid rgba(200,160,48,0.3)'
          : '1px solid rgba(245,240,232,0.08)',
        whiteSpace: 'nowrap',
      }}>
        {dia.cumprida ? '✓ Cumprida' : 'Pendente'}
      </span>
    </div>
  );
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function MissoesPerfilPage() {
  const { user }      = useUser();
  const { getClient } = useSupabaseClient();

  const [dias,       setDias]       = useState<DiaComMissao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [mesFiltro,  setMesFiltro]  = useState('todos');

  useEffect(() => {
    if (!user?.id) return;
    let cancelado = false;
    (async () => {
      const client = await getClient();

      // 1. Registros do usuário (data + missao_cumprida)
      const { data: diarioData } = await client
        .from('diario_kairos')
        .select('data, missao_cumprida, missao_execucao')
        .eq('user_id', user.id)
        .order('data', { ascending: false });

      const diarioRows = (diarioData ?? []) as {
        data:            string;
        missao_cumprida: boolean;
        missao_execucao: string | null;
      }[];

      // Mapa data → { cumprida, execucao }
      // Prioriza cumprida=true; mantém execucao do primeiro registro não-nulo
      const diarioMap = new Map<string, { cumprida: boolean; execucao: string | null }>();
      for (const row of diarioRows) {
        const prev = diarioMap.get(row.data);
        if (prev === undefined) {
          diarioMap.set(row.data, { cumprida: row.missao_cumprida, execucao: row.missao_execucao });
        } else {
          diarioMap.set(row.data, {
            cumprida: prev.cumprida || row.missao_cumprida,
            execucao: prev.execucao ?? row.missao_execucao,
          });
        }
      }

      // 2. Missões dos dias que o usuário tem registro
      const datasComRegistro = [...diarioMap.keys()];

      let resultado: DiaComMissao[] = [];

      if (datasComRegistro.length > 0) {
        const { data: momentoData } = await client
          .from('momento_kairos')
          .select('data, missao')
          .in('data', datasComRegistro)
          .order('data', { ascending: false });

        const momentoRows = (momentoData ?? []) as { data: string; missao: string }[];

        resultado = momentoRows
          .filter(m => m.data && m.missao)
          .map(m => {
            const entry = diarioMap.get(m.data);
            return {
              data:           m.data,
              missao:         m.missao,
              cumprida:       entry?.cumprida ?? false,
              missaoExecucao: entry?.execucao ?? null,
            };
          });
      }

      if (!cancelado) {
        setDias(resultado);
        setCarregando(false);
      }
    })();
    return () => { cancelado = true; };
  }, [user?.id, getClient]);

  // Meses únicos
  const meses = [...new Set(dias.map(d => d.data.slice(0, 7)))].sort().reverse();

  const diasFiltrados = mesFiltro === 'todos'
    ? dias
    : dias.filter(d => d.data.startsWith(mesFiltro));

  const totalCumpridas = diasFiltrados.filter(d => d.cumprida).length;
  const totalDias      = diasFiltrados.length;

  return (
    <DashboardLayout>
      <div style={{ minHeight: '100vh', background: '#0E0E0E', padding: '32px 24px 80px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>

          {/* Header */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Link
                href="/perfil"
                style={{ fontSize: 12, color: 'rgba(245,240,232,0.35)', textDecoration: 'none' }}
              >
                ← Perfil
              </Link>
            </div>
            <div style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.14em',
              color: '#C8A030', textTransform: 'uppercase', marginBottom: 8,
            }}>
              Meus Registros · Missões
            </div>
            <h1 style={{
              fontSize: 24, fontWeight: 300, color: '#F5F0E8', margin: 0,
              fontFamily: "Georgia, 'Times New Roman', serif",
            }}>
              Histórico de Missões
            </h1>

            {/* Contador */}
            {!carregando && totalDias > 0 && (
              <div style={{ marginTop: 10 }}>
                <span style={{ fontSize: 14, color: 'rgba(245,240,232,0.45)' }}>
                  <span style={{ fontSize: 18, fontWeight: 700, color: '#C8A030' }}>{totalCumpridas}</span>
                  {' '}missões cumpridas de{' '}
                  <span style={{ fontWeight: 600, color: '#F5F0E8' }}>{totalDias}</span>
                  {' '}dias
                </span>
                {totalDias > 0 && (
                  <div style={{ marginTop: 8, height: 5, background: 'rgba(245,240,232,0.06)', borderRadius: 99, overflow: 'hidden', maxWidth: 200 }}>
                    <div style={{
                      height: '100%',
                      width: `${Math.round((totalCumpridas / totalDias) * 100)}%`,
                      background: '#C8A030', borderRadius: 99,
                      transition: 'width 0.5s ease',
                    }} />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Filtro por mês */}
          {!carregando && meses.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <select
                value={mesFiltro}
                onChange={e => setMesFiltro(e.target.value)}
                style={{
                  background: '#1A1A1A',
                  border: '1px solid rgba(200,160,48,0.2)',
                  borderRadius: 8,
                  padding: '8px 14px',
                  color: '#F5F0E8',
                  fontSize: 13,
                  cursor: 'pointer',
                  outline: 'none',
                  appearance: 'none',
                  WebkitAppearance: 'none',
                }}
              >
                <option value="todos">Todos os meses</option>
                {meses.map(m => (
                  <option key={m} value={m}>{mesLabel(m)}</option>
                ))}
              </select>
            </div>
          )}

          {/* Conteúdo */}
          {carregando ? (
            <div style={{ textAlign: 'center', padding: '64px 0', color: 'rgba(245,240,232,0.2)', fontSize: 14 }}>
              Carregando missões…
            </div>
          ) : diasFiltrados.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🎯</div>
              <div style={{ fontSize: 16, color: 'rgba(245,240,232,0.45)', marginBottom: 6 }}>
                {mesFiltro === 'todos' ? 'Nenhuma missão ainda.' : 'Sem missões neste mês.'}
              </div>
              <div style={{ fontSize: 13, color: 'rgba(245,240,232,0.22)' }}>
                {mesFiltro === 'todos'
                  ? 'As missões aparecem quando você acessa o Momento Kairos e registra o dia.'
                  : 'Tente outro mês ou volte para ver todos os registros.'}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {diasFiltrados.map(dia => (
                <CardMissao key={dia.data} dia={dia} />
              ))}
            </div>
          )}

        </div>
      </div>
    </DashboardLayout>
  );
}
