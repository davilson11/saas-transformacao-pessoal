'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { useSupabaseClient } from '@/lib/useSupabaseClient';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import type { DiarioKairos } from '@/lib/database.types';

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

// ─── Helpers de renderização ──────────────────────────────────────────────────

const LABEL: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  color: '#C8A030',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  marginBottom: 5,
  display: 'block',
};

const TEXTO: React.CSSProperties = {
  fontSize: 14,
  color: 'rgba(245,240,232,0.8)',
  margin: 0,
  lineHeight: 1.7,
  whiteSpace: 'pre-wrap',
};

function Campo({ label, valor }: { label: string; valor: string }) {
  return (
    <div style={{
      background: 'rgba(245,240,232,0.03)',
      border: '1px solid rgba(245,240,232,0.06)',
      borderRadius: 8,
      padding: '10px 12px',
    }}>
      <span style={LABEL}>{label}</span>
      <p style={TEXTO}>{valor}</p>
    </div>
  );
}

// ─── Card individual do diário ────────────────────────────────────────────────

function CardDiario({ entrada }: { entrada: DiarioKairos }) {
  const nota    = entrada.nota_dia;
  const notaPct = nota !== null ? (nota / 10) * 100 : 0;
  const tipo    = entrada.tipo_entrada ?? 'legado';

  return (
    <div style={{
      background: '#1A1A1A',
      border: '1px solid rgba(200,160,48,0.1)',
      borderRadius: 14,
      padding: '18px 20px',
      display: 'flex', flexDirection: 'column', gap: 14,
    }}>
      {/* Header: data + emoji + badge missão */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#F5F0E8', lineHeight: 1.4 }}>
            {formatarDataCompleta(entrada.data)}
          </div>
          {entrada.emocao && (
            <div style={{ fontSize: 22, marginTop: 5 }}>{entrada.emocao}</div>
          )}
        </div>
        <span style={{
          flexShrink: 0,
          fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 99,
          background: entrada.missao_cumprida
            ? 'rgba(34,197,94,0.12)'
            : 'rgba(245,240,232,0.05)',
          color: entrada.missao_cumprida ? '#22c55e' : 'rgba(245,240,232,0.3)',
          border: entrada.missao_cumprida
            ? '1px solid rgba(34,197,94,0.3)'
            : '1px solid rgba(245,240,232,0.08)',
          whiteSpace: 'nowrap',
        }}>
          {entrada.missao_cumprida ? 'Missão cumprida ✓' : 'Pendente'}
        </span>
      </div>

      {/* Nota do dia */}
      {nota !== null && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: '#C8A030', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Nota do dia
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#C8A030' }}>{nota}/10</span>
          </div>
          <div style={{ height: 5, background: 'rgba(245,240,232,0.06)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${notaPct}%`,
              background: '#C8A030', borderRadius: 99,
              transition: 'width 0.5s ease',
            }} />
          </div>
        </div>
      )}

      {/* ── CAMADA 1: entrada livre ── */}
      {tipo === 'livre' && entrada.texto_livre && (
        <div style={{
          background: 'rgba(245,240,232,0.03)',
          border: '1px solid rgba(245,240,232,0.06)',
          borderRadius: 8,
          padding: '10px 12px',
        }}>
          <span style={LABEL}>Entrada livre</span>
          <p style={{ ...TEXTO, fontFamily: "Georgia, 'Times New Roman', serif" }}>
            {entrada.texto_livre}
          </p>
        </div>
      )}

      {/* ── CAMADA 2: registro diário estruturado ── */}
      {tipo === 'diario' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {entrada.conquista   && <Campo label="🌟 Mais significativo" valor={entrada.conquista} />}
          {entrada.preocupacao && <Campo label="💭 O que pesava"       valor={entrada.preocupacao} />}
          {entrada.gratidao    && <Campo label="🙏 Gratidão"           valor={entrada.gratidao} />}
        </div>
      )}

      {/* ── LEGADO / outros tipos: todos os campos não nulos ── */}
      {tipo !== 'livre' && tipo !== 'diario' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {entrada.texto_livre   && <Campo label="Texto"              valor={entrada.texto_livre} />}
          {entrada.conquista     && <Campo label="🌟 Conquista"       valor={entrada.conquista} />}
          {entrada.preocupacao   && <Campo label="💭 O que pesava"    valor={entrada.preocupacao} />}
          {entrada.gratidao      && <Campo label="🙏 Gratidão"        valor={entrada.gratidao} />}
          {entrada.aprendizado   && <Campo label="📚 Aprendizado"     valor={entrada.aprendizado} />}
          {entrada.missao_execucao && <Campo label="🎯 Missão"        valor={entrada.missao_execucao} />}
        </div>
      )}
    </div>
  );
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function DiarioPerfilPage() {
  const { user }      = useUser();
  const { getClient } = useSupabaseClient();

  const [entradas,   setEntradas]   = useState<DiarioKairos[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [mesFiltro,  setMesFiltro]  = useState('todos');

  useEffect(() => {
    if (!user?.id) return;
    let cancelado = false;
    (async () => {
      const client = await getClient();
      const { data } = await client
        .from('diario_kairos')
        .select('*')
        .eq('user_id', user.id)
        .order('data', { ascending: false })
        .order('created_at', { ascending: false });
      if (!cancelado) {
        setEntradas((data ?? []) as DiarioKairos[]);
        setCarregando(false);
      }
    })();
    return () => { cancelado = true; };
  }, [user?.id, getClient]);

  // Meses únicos presentes nos dados
  const meses = [...new Set(entradas.map(e => e.data.slice(0, 7)))].sort().reverse();

  const entradasFiltradas = mesFiltro === 'todos'
    ? entradas
    : entradas.filter(e => e.data.startsWith(mesFiltro));

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
              Meus Registros · Diário
            </div>
            <h1 style={{
              fontSize: 24, fontWeight: 300, color: '#F5F0E8', margin: 0,
              fontFamily: "Georgia, 'Times New Roman', serif",
            }}>
              Histórico do Diário
            </h1>
            <div style={{ fontSize: 12, color: 'rgba(245,240,232,0.28)', marginTop: 6 }}>
              {carregando
                ? 'Carregando…'
                : `${entradas.length} ${entradas.length === 1 ? 'registro' : 'registros'} encontrados`}
            </div>
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
                <option value="todos">Todos os registros</option>
                {meses.map(m => (
                  <option key={m} value={m}>{mesLabel(m)}</option>
                ))}
              </select>
            </div>
          )}

          {/* Conteúdo */}
          {carregando ? (
            <div style={{ textAlign: 'center', padding: '64px 0', color: 'rgba(245,240,232,0.2)', fontSize: 14 }}>
              Carregando registros…
            </div>
          ) : entradasFiltradas.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📖</div>
              <div style={{ fontSize: 16, color: 'rgba(245,240,232,0.45)', marginBottom: 6 }}>
                {mesFiltro === 'todos' ? 'Seu diário está esperando.' : 'Sem registros neste mês.'}
              </div>
              {mesFiltro === 'todos' && (
                <>
                  <div style={{ fontSize: 13, color: 'rgba(245,240,232,0.22)', marginBottom: 28 }}>
                    Comece hoje com uma entrada rápida.
                  </div>
                  <Link
                    href="/ferramentas/diario-bordo"
                    style={{
                      display: 'inline-block',
                      background: '#C8A030', color: '#0E0E0E',
                      padding: '11px 26px', borderRadius: 10,
                      fontWeight: 700, fontSize: 14, textDecoration: 'none',
                      boxShadow: '0 4px 16px rgba(200,160,48,0.35)',
                    }}
                  >
                    Abrir Diário de Bordo →
                  </Link>
                </>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {entradasFiltradas.map(e => (
                <CardDiario key={e.id} entrada={e} />
              ))}
            </div>
          )}

        </div>
      </div>
    </DashboardLayout>
  );
}
