'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useSupabaseClient } from '@/lib/useSupabaseClient';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getWeekKey(): string {
  const now = new Date();
  const d   = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86_400_000) + 1) / 7);
  return `kairos_revisao_${d.getUTCFullYear()}_W${weekNo}`;
}

function getLastWeekRange(): { inicio: string; fim: string; label: string } {
  const now  = new Date();
  const day  = now.getDay(); // 0=Dom … 6=Sáb
  // Segunda-feira desta semana
  const thisMon = new Date(now);
  thisMon.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
  // Segunda e domingo da semana passada
  const lastMon = new Date(thisMon);
  lastMon.setDate(thisMon.getDate() - 7);
  const lastSun = new Date(thisMon);
  lastSun.setDate(thisMon.getDate() - 1);

  const iso  = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const fmt  = (d: Date) =>
    d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });

  return { inicio: iso(lastMon), fim: iso(lastSun), label: `${fmt(lastMon)} a ${fmt(lastSun)}` };
}

function palavraMaisFrequente(textos: (string | null)[]): string | null {
  const STOP = new Set([
    'de','da','do','em','e','a','o','que','um','uma','para','com','não','mas','por',
    'foi','mais','me','se','no','na','os','as','meu','minha','seu','sua','muito',
    'bem','dia','hoje','ainda','já','isso','esse','esta','este','ela','ele','eu',
    'ao','dos','das','nos','nas','tem','ter','vez','porque','como','quando','ser',
    'está','foram','era','também','só','até','todo','toda','todos','todas','tudo',
    'cada','qual','quem','onde','esse','esses','essa','essas','num','numa','nem',
  ]);
  const freq: Record<string, number> = {};
  for (const t of textos) {
    if (!t) continue;
    for (const p of t.toLowerCase().replace(/[^a-záàâãéêíóôõúç\s]/g, '').split(/\s+/)) {
      if (p.length >= 4 && !STOP.has(p)) freq[p] = (freq[p] ?? 0) + 1;
    }
  }
  const top = Object.entries(freq).sort((a, b) => b[1] - a[1])[0];
  return top ? top[0] : null;
}

// ─── Tipos ────────────────────────────────────────────────────────────────────

type DadosSemana = {
  diasRegistrados:  number;
  missoesCumpridas: number;
  notaMedia:        number | null;
  palavraFrequente: string | null;
};

// ─── Componente ───────────────────────────────────────────────────────────────

export default function RevisaoSemanal() {
  const { user }      = useUser();
  const { getClient } = useSupabaseClient();

  const [visivel,    setVisivel]    = useState(false);
  const [dados,      setDados]      = useState<DadosSemana | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [intencoes,  setIntencoes]  = useState(['', '', '']);
  const [salvo,      setSalvo]      = useState(false);

  // ── Verificar se deve mostrar ─────────────────────────────────────────────

  useEffect(() => {
    const isSegunda = new Date().getDay() === 1;
    if (!isSegunda) return;
    const jaViu = localStorage.getItem(getWeekKey());
    if (!jaViu) setVisivel(true);
  }, []);

  // ── Buscar dados da semana passada ────────────────────────────────────────

  useEffect(() => {
    if (!visivel || !user?.id) return;
    (async () => {
      setCarregando(true);
      try {
        const client            = await getClient();
        const { inicio, fim }   = getLastWeekRange();

        const { data } = await client
          .from('diario_kairos')
          .select('data, missao_cumprida, nota_dia, texto_livre, conquista, preocupacao, gratidao')
          .eq('user_id', user.id)
          .gte('data', inicio)
          .lte('data', fim);

        if (!data || data.length === 0) {
          setDados({ diasRegistrados: 0, missoesCumpridas: 0, notaMedia: null, palavraFrequente: null });
          return;
        }

        // Deduplicar por data (cumprida tem prioridade)
        const porDia = new Map<string, typeof data[0]>();
        for (const row of data) {
          const prev = porDia.get(row.data);
          if (!prev || (row.missao_cumprida && !prev.missao_cumprida)) porDia.set(row.data, row);
        }
        const rows = [...porDia.values()];

        const diasRegistrados  = rows.length;
        const missoesCumpridas = rows.filter(r => r.missao_cumprida).length;
        const notas = rows.map(r => r.nota_dia).filter((n): n is number => n !== null);
        const notaMedia = notas.length > 0
          ? Math.round((notas.reduce((a, b) => a + b, 0) / notas.length) * 10) / 10
          : null;
        const textos = rows.flatMap(r => [r.texto_livre, r.conquista, r.preocupacao, r.gratidao]);
        const palavraFrequente = palavraMaisFrequente(textos);

        setDados({ diasRegistrados, missoesCumpridas, notaMedia, palavraFrequente });
      } catch (err) {
        console.error('[RevisaoSemanal]', err);
        setDados({ diasRegistrados: 0, missoesCumpridas: 0, notaMedia: null, palavraFrequente: null });
      } finally {
        setCarregando(false);
      }
    })();
  }, [visivel, user?.id, getClient]);

  // ── Gerar insights ────────────────────────────────────────────────────────

  function gerarInsights(d: DadosSemana): string[] {
    const ins: string[] = [];

    if (d.diasRegistrados >= 5)
      ins.push(`Você registrou ${d.diasRegistrados} de 7 dias — sua consistência está crescendo. Mantenha o ritmo.`);
    else if (d.diasRegistrados >= 3)
      ins.push(`Você registrou ${d.diasRegistrados} de 7 dias — cada entrada conta. Que tal chegar a 5 esta semana?`);
    else
      ins.push(`Você registrou ${d.diasRegistrados} de 7 dias — pequenos passos constroem grandes mudanças. Comece hoje.`);

    if (d.missoesCumpridas >= 5)
      ins.push(`${d.missoesCumpridas} missões cumpridas — você está honrando seus compromissos diários. Isso é disciplina real.`);
    else if (d.missoesCumpridas >= 3)
      ins.push(`${d.missoesCumpridas} missões cumpridas — você está no caminho. Cada missão é um voto de quem você está se tornando.`);
    else
      ins.push(`${d.missoesCumpridas} missões cumpridas — as missões são o coração da transformação. Priorize-as esta semana.`);

    if (d.notaMedia !== null) {
      if (d.notaMedia >= 7)
        ins.push(`Nota média ${d.notaMedia}/10 — foi uma boa semana. Use essa energia para avançar ainda mais.`);
      else
        ins.push(`Nota média ${d.notaMedia}/10 — semanas difíceis também ensinam. O que você aprendeu sobre si mesmo?`);
    } else if (d.palavraFrequente) {
      ins.push(`A palavra "${d.palavraFrequente}" apareceu bastante nas suas entradas — ela revela o centro da sua atenção agora.`);
    } else {
      ins.push(`Registre mais dias para ver seus padrões emergir. O autoconhecimento começa na consistência.`);
    }

    return ins;
  }

  // ── Ações ─────────────────────────────────────────────────────────────────

  function fechar() {
    localStorage.setItem(getWeekKey(), '1');
    setVisivel(false);
  }

  function salvarIntencoes() {
    localStorage.setItem(getWeekKey(), JSON.stringify({ intencoes, ts: Date.now() }));
    setSalvo(true);
    setTimeout(() => setVisivel(false), 700);
  }

  // ─────────────────────────────────────────────────────────────────────────

  if (!visivel) return null;

  const semana   = getLastWeekRange();
  const insights = dados ? gerarInsights(dados) : [];

  const EMOJIS_INSIGHT = ['📈', '🎯', '💡'] as const;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={fechar}
        style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.78)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
        }}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1001,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px', pointerEvents: 'none',
      }}>
        <div style={{
          width: '100%', maxWidth: 560,
          background: '#111111',
          border: '1px solid rgba(200,160,48,0.28)',
          borderRadius: 24,
          boxShadow: '0 24px 80px rgba(0,0,0,0.7), inset 0 0 0 1px rgba(200,160,48,0.06)',
          overflow: 'hidden',
          pointerEvents: 'all',
          maxHeight: '92dvh',
          overflowY: 'auto',
        }}>

          {/* Faixa topo */}
          <div style={{ height: 3, background: 'linear-gradient(90deg, #C8A030, #e8d08a, #C8A030)', flexShrink: 0 }} />

          <div style={{ padding: '28px 32px 32px' }}>

            {/* Header */}
            <div style={{ marginBottom: 24 }}>
              <div style={{
                fontSize: 10, fontWeight: 700, color: '#C8A030',
                textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: 8,
              }}>
                ✦ Revisão Semanal
              </div>
              <h2 style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontSize: 26, fontWeight: 300, color: '#F5F0E8',
                margin: '0 0 5px', lineHeight: 1.2,
              }}>
                Sua semana em revisão
              </h2>
              <p style={{ fontSize: 13, color: 'rgba(245,240,232,0.38)', margin: 0 }}>
                {semana.label}
              </p>
            </div>

            {/* Stats */}
            {carregando ? (
              <div style={{ display: 'flex', gap: 10, marginBottom: 22 }}>
                {[1, 2, 3].map(i => (
                  <div key={i} style={{
                    flex: 1, height: 72, borderRadius: 12,
                    background: 'rgba(255,255,255,0.04)',
                    animation: 'rsShimmer 1.4s ease-in-out infinite',
                  }} />
                ))}
              </div>
            ) : dados && (
              <>
                <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                  {[
                    {
                      val: `${dados.diasRegistrados}/7`,
                      label: 'Dias registrados',
                      cor: dados.diasRegistrados >= 5 ? '#22c55e' : '#C8A030',
                    },
                    {
                      val: String(dados.missoesCumpridas),
                      label: 'Missões cumpridas',
                      cor: dados.missoesCumpridas >= 5 ? '#22c55e' : '#C8A030',
                    },
                    {
                      val: dados.notaMedia !== null ? `${dados.notaMedia}/10` : '—',
                      label: 'Nota média',
                      cor: dados.notaMedia !== null && dados.notaMedia >= 7 ? '#22c55e' : '#C8A030',
                    },
                  ].map(s => (
                    <div key={s.label} style={{
                      flex: '1 1 100px',
                      background: 'rgba(200,160,48,0.04)',
                      border: '1px solid rgba(200,160,48,0.13)',
                      borderRadius: 12, padding: '14px 16px', textAlign: 'center',
                    }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 700, color: s.cor, lineHeight: 1 }}>
                        {s.val}
                      </div>
                      <div style={{ fontSize: 10, color: 'rgba(245,240,232,0.38)', marginTop: 5 }}>
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>

                {dados.palavraFrequente && (
                  <div style={{
                    marginBottom: 18, padding: '9px 14px',
                    background: 'rgba(200,160,48,0.05)',
                    border: '1px solid rgba(200,160,48,0.12)',
                    borderRadius: 9, display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <span style={{ fontSize: 12, color: 'rgba(245,240,232,0.38)' }}>Palavra em destaque:</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#C8A030' }}>
                      &ldquo;{dados.palavraFrequente}&rdquo;
                    </span>
                  </div>
                )}
              </>
            )}

            {/* Insights */}
            {!carregando && insights.length > 0 && (
              <div style={{ marginBottom: 26 }}>
                <div style={{
                  fontSize: 10, fontWeight: 700, color: 'rgba(245,240,232,0.28)',
                  textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10,
                }}>
                  Insights da semana
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {insights.map((ins, i) => (
                    <div key={i} style={{
                      display: 'flex', gap: 10, alignItems: 'flex-start',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.07)',
                      borderRadius: 10, padding: '10px 13px',
                    }}>
                      <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>
                        {EMOJIS_INSIGHT[i]}
                      </span>
                      <p style={{ fontSize: 13, color: 'rgba(245,240,232,0.72)', margin: 0, lineHeight: 1.65 }}>
                        {ins}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Intenções */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#F5F0E8', marginBottom: 3 }}>
                3 intenções para esta semana
              </div>
              <div style={{ fontSize: 12, color: 'rgba(245,240,232,0.32)', marginBottom: 14 }}>
                O que você quer focar, cultivar ou mudar nos próximos 7 dias?
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {([0, 1, 2] as const).map(i => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{
                      width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                      background: intencoes[i].trim()
                        ? 'rgba(200,160,48,0.22)'
                        : 'rgba(200,160,48,0.08)',
                      border: '1px solid rgba(200,160,48,0.28)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, fontWeight: 700, color: '#C8A030',
                      transition: 'background 0.2s',
                    }}>
                      {i + 1}
                    </span>
                    <input
                      type="text"
                      value={intencoes[i]}
                      onChange={e => setIntencoes(prev => {
                        const n = [...prev]; n[i] = e.target.value; return n;
                      })}
                      placeholder={[
                        'Ex: Acordar às 6h todos os dias',
                        'Ex: Meditar 10 minutos pela manhã',
                        'Ex: Concluir a ferramenta OKRs',
                      ][i]}
                      style={{
                        flex: 1, background: '#1A1A1A',
                        border: '1px solid rgba(200,160,48,0.16)',
                        borderRadius: 8, padding: '9px 12px',
                        fontSize: 13, color: '#F5F0E8',
                        outline: 'none', fontFamily: 'var(--font-body)',
                        transition: 'border-color 0.15s',
                      }}
                      onFocus={e => (e.currentTarget.style.borderColor = 'rgba(200,160,48,0.45)')}
                      onBlur={e => (e.currentTarget.style.borderColor = 'rgba(200,160,48,0.16)')}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Botões */}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', alignItems: 'center' }}>
              <button
                onClick={fechar}
                style={{
                  padding: '10px 18px', borderRadius: 10, cursor: 'pointer',
                  background: 'transparent',
                  border: '1px solid rgba(245,240,232,0.10)',
                  color: 'rgba(245,240,232,0.38)', fontSize: 13,
                  fontFamily: 'var(--font-body)',
                  transition: 'border-color 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(245,240,232,0.22)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(245,240,232,0.10)')}
              >
                Pular
              </button>
              <button
                onClick={salvarIntencoes}
                disabled={salvo}
                style={{
                  padding: '11px 26px', borderRadius: 10,
                  cursor: salvo ? 'default' : 'pointer',
                  background: salvo
                    ? '#22c55e'
                    : 'linear-gradient(135deg, #C8A030 0%, #A07828 100%)',
                  border: 'none',
                  color: '#0E0E0E', fontSize: 14, fontWeight: 700,
                  fontFamily: 'var(--font-body)',
                  boxShadow: salvo
                    ? '0 4px 16px rgba(34,197,94,0.3)'
                    : '0 4px 16px rgba(200,160,48,0.3)',
                  transition: 'background 0.3s, box-shadow 0.3s',
                }}
              >
                {salvo ? '✓ Salvo!' : 'Começar minha semana →'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes rsShimmer {
          0%, 100% { opacity: 0.4; }
          50%       { opacity: 0.85; }
        }
      `}</style>
    </>
  );
}
