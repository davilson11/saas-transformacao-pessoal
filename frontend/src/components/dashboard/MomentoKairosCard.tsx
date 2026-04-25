'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useSupabaseClient } from '@/lib/useSupabaseClient';
import type { MomentoKairos, DiarioKairos } from '@/lib/database.types';

const EMOCOES = ['animado', 'focado', 'grato', 'cansado', 'ansioso', 'tranquilo'];

function hojeStr(): string {
  return new Date().toLocaleDateString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).split('/').reverse().join('-');
}

function horaAtual(): number {
  return parseInt(
    new Date().toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', hour12: false }),
    10,
  );
}

function saudacao(hora: number): string {
  if (hora < 12) return 'Bom dia';
  if (hora < 18) return 'Boa tarde';
  return 'Boa noite';
}

// Retorna YYYY-MM-DD no fuso de Brasília; offsetDias=0 → hoje, 1 → ontem, etc.
function getDiaStr(offsetDias = 0): string {
  return new Date(Date.now() - offsetDias * 86_400_000)
    .toLocaleDateString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric', month: '2-digit', day: '2-digit',
    })
    .split('/').reverse().join('-');
}

function calcularStreak(hist: Partial<DiarioKairos>[]): number {
  if (!hist.length) return 0;
  const datas = hist.map(h => h.data).filter(Boolean).sort((a, b) => b!.localeCompare(a!)) as string[];
  let streak = 0;
  for (let i = 0; i < datas.length; i++) {
    if (datas[i] === getDiaStr(i)) streak++;
    else break;
  }
  return streak;
}

const GOLD = '#C8A030';
const DARK = '#0E0E0E';
const CREAM = '#F5F0E8';

export default function MomentoKairosCard() {
  const { user } = useUser();
  const { getClient } = useSupabaseClient();

  const [momento, setMomento] = useState<MomentoKairos | null>(null);
  const [diario, setDiario] = useState<Partial<DiarioKairos>>({});
  const [streak, setStreak] = useState(0);
  const [faseUsuario, setFaseUsuario] = useState(1);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [salvandoNoite, setSalvandoNoite] = useState(false);
  const [salvoNoite, setSalvoNoite] = useState(false);
  const [historico, setHistorico] = useState<Partial<DiarioKairos>[]>([]);
  const [mostrarHistorico, setMostrarHistorico] = useState(false);

  const hora = horaAtual();
  const hoje = hojeStr();
  const mostrarMatinal = hora < 18;
  const mostrarNoturno = hora >= 12;

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      try {
        const client = await getClient();
        const [{ data: momentoData }, { data: diarioData }, { data: hist }] = await Promise.all([
          client.from('momento_kairos').select('*').eq('data', hoje).maybeSingle(),
          client.from('diario_kairos').select('*').eq('user_id', user.id).eq('data', hoje).maybeSingle(),
          client.from('diario_kairos').select('*').eq('user_id', user.id).or('tipo_entrada.eq.momento,tipo_entrada.is.null').order('data', { ascending: false }).limit(60),
        ]);
        if (momentoData) setMomento(momentoData);
        if (diarioData) setDiario(diarioData);
        if (hist) { setHistorico(hist); setStreak(calcularStreak(hist)); }
      } catch (e) {
        console.error('[MomentoKairosCard] erro ao carregar:', e);
      } finally {
        setCarregando(false);
      }
    })();
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      try {
        const client = await getClient();
        const { data } = await client.from('ferramentas_respostas').select('concluida').eq('user_id', user.id);
        if (!data) return;
        const n = data.filter(f => f.concluida).length;
        if (n >= 12) setFaseUsuario(4);
        else if (n >= 8) setFaseUsuario(3);
        else if (n >= 4) setFaseUsuario(2);
        else setFaseUsuario(1);
      } catch (e) {
        console.error('[MomentoKairosCard] erro ao carregar fase:', e);
      }
    })();
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function salvarMatinal() {
    if (!user?.id) return;
    setSalvando(true);
    try {
      const client = await getClient();
      const { error } = await client.from('diario_kairos').upsert({
        user_id:         user.id,
        data:            hoje,
        tipo_entrada:    'momento',
        qualidade_sono:  diario.qualidade_sono  ?? null,
        emocao:          diario.emocao          ?? null,
        preocupacao:     diario.preocupacao     ?? null,
        gratidao:        diario.gratidao        ?? null,
        missao_cumprida: diario.missao_cumprida ?? false,
      }, { onConflict: 'user_id,data' });
      if (error) throw error;
      setSalvo(true);
      setTimeout(() => setSalvo(false), 3000);
    } catch (e) {
      console.error('[salvarMatinal]', e);
    } finally {
      setSalvando(false);
    }
  }

  async function salvarNoturno() {
    if (!user?.id) return;
    setSalvandoNoite(true);
    try {
      const client = await getClient();
      const { error } = await client.from('diario_kairos').upsert({
        user_id:      user.id,
        data:         hoje,
        tipo_entrada: 'momento',
        conquista:    diario.conquista   ?? null,
        aprendizado:  diario.aprendizado ?? null,
        energia_fim:  diario.energia_fim ?? null,
        nota_dia:     diario.nota_dia    ?? null,
      }, { onConflict: 'user_id,data' });
      if (error) throw error;
      setSalvoNoite(true);
      setTimeout(() => setSalvoNoite(false), 3000);
    } catch (e) {
      console.error('[salvarNoturno]', e);
    } finally {
      setSalvandoNoite(false);
    }
  }

  const missaoDoDia = momento
    ? ((momento[`missao_fase${faseUsuario}` as keyof MomentoKairos] as string) ?? momento.missao)
    : null;

  const nomeUsuario = user?.firstName ?? '';
  const dataLabel = new Date().toLocaleDateString('pt-BR', {
    timeZone: 'America/Sao_Paulo', weekday: 'long', day: 'numeric', month: 'long',
  });

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (carregando) {
    return (
      <div style={{ background: DARK, borderRadius: 16, padding: '24px', border: `1px solid rgba(200,160,48,0.15)` }}>
        <div style={{ height: 14, width: 160, background: 'rgba(255,255,255,0.06)', borderRadius: 6, marginBottom: 12 }} />
        <div style={{ height: 22, width: 240, background: 'rgba(255,255,255,0.08)', borderRadius: 6 }} />
      </div>
    );
  }

  // ── No content today ──────────────────────────────────────────────────────
  if (!momento) {
    return (
      <div style={{ background: DARK, borderRadius: 16, padding: '28px 24px', border: `1px solid rgba(200,160,48,0.15)`, textAlign: 'center' }}>
        <p style={{ fontSize: 28, margin: '0 0 10px' }}>☀️</p>
        <p style={{ fontSize: 15, fontWeight: 600, color: CREAM, margin: '0 0 6px' }}>Momento ainda não disponível</p>
        <p style={{ fontSize: 12, color: 'rgba(245,240,232,0.45)', margin: 0 }}>O conteúdo de hoje está sendo preparado. Volte mais tarde.</p>
      </div>
    );
  }

  // ── Streak emoji ──────────────────────────────────────────────────────────
  const streakEmoji = streak >= 14 ? '⚡' : streak >= 7 ? '🔥' : streak >= 3 ? '✨' : '💤';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <style>{`
        @media (max-width: 640px) {
          .mkc-header { padding: 14px 16px !important; flex-wrap: wrap !important; gap: 12px !important; }
          .mkc-grid { grid-template-columns: 1fr !important; }
          .mkc-section { padding: 16px !important; }
          .mkc-voz { padding: 16px !important; }
        }
      `}</style>

      {/* ── 0. Banner contextual por horário ────────────────────────────── */}
      <div style={{
        borderRadius: 12, padding: '12px 18px',
        display: 'flex', alignItems: 'center', gap: 12,
        background: hora < 12
          ? 'linear-gradient(135deg, rgba(255,200,80,0.13), rgba(200,140,0,0.07))'
          : hora < 18
            ? 'linear-gradient(135deg, rgba(255,140,30,0.13), rgba(180,90,0,0.07))'
            : 'linear-gradient(135deg, rgba(80,80,180,0.18), rgba(30,30,90,0.1))',
        border: `1px solid ${hora < 12 ? 'rgba(255,200,80,0.3)' : hora < 18 ? 'rgba(255,140,30,0.28)' : 'rgba(100,100,200,0.25)'}`,
      }}>
        <span style={{ fontSize: 20, flexShrink: 0 }}>
          {hora < 12 ? '🌅' : hora < 18 ? '🌞' : '🌙'}
        </span>
        <p style={{ fontSize: 13, fontWeight: 600, color: CREAM, margin: 0 }}>
          {hora < 12
            ? 'Bom dia — registre sua manhã'
            : hora < 18
              ? 'Boa tarde — sua missão te espera'
              : 'Boa noite — hora da reflexão'}
        </p>
      </div>

      {/* ── 1. Topo: saudação + data ─────────────────────────────────────── */}
      <div className="mkc-header" style={{
        background: DARK,
        borderRadius: 16,
        padding: '20px 24px',
        border: `1px solid rgba(200,160,48,0.18)`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <p style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: GOLD, fontWeight: 600, margin: '0 0 4px' }}>
            Momento Kairos · Fase 0{faseUsuario}
          </p>
          <p style={{ fontSize: 20, color: CREAM, fontFamily: 'var(--font-heading)', fontWeight: 400, margin: 0 }}>
            {saudacao(hora)}{nomeUsuario ? `, ${nomeUsuario}` : ''}.
          </p>
          <p style={{ fontSize: 12, color: 'rgba(245,240,232,0.4)', margin: '4px 0 0', textTransform: 'capitalize' }}>{dataLabel}</p>
        </div>
        {streak > 0 && (
          <div style={{
            background: 'rgba(200,160,48,0.12)', border: `1px solid rgba(200,160,48,0.3)`,
            borderRadius: 50, padding: '8px 14px', textAlign: 'center', flexShrink: 0,
          }}>
            <p style={{ fontSize: 18, margin: '0 0 2px' }}>{streakEmoji}</p>
            <p style={{ fontSize: 14, fontWeight: 700, color: GOLD, margin: 0, lineHeight: 1 }}>{streak}</p>
            <p style={{ fontSize: 10, color: 'rgba(200,160,48,0.6)', margin: '2px 0 0' }}>{streak === 1 ? 'dia' : 'dias'}</p>
          </div>
        )}
      </div>

      {/* ── 2. Voz do dia ───────────────────────────────────────────────── */}
      <div className="mkc-voz" style={{
        background: '#1A1A1A',
        borderRadius: 14,
        padding: '22px 24px',
        border: `1px solid rgba(200,160,48,0.22)`,
        borderLeft: `3px solid ${GOLD}`,
      }}>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: GOLD, margin: '0 0 14px' }}>A voz do dia</p>
        <p style={{
          fontSize: 17, fontFamily: 'var(--font-heading)', fontStyle: 'italic',
          color: CREAM, lineHeight: 1.75, margin: 0,
        }}>
          &ldquo;{momento.voz_texto}&rdquo;
        </p>
      </div>

      {/* ── 3. Missão do dia (PRINCIPAL) ─────────────────────────────────── */}
      <div className="mkc-section" style={{
        background: `linear-gradient(135deg, #2A1800 0%, #1A1000 100%)`,
        borderRadius: 16,
        padding: '22px 24px',
        border: `1.5px solid rgba(200,160,48,0.4)`,
      }}>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: GOLD, margin: '0 0 10px' }}>
          🎯 Sua missão de hoje
        </p>
        <p style={{ fontSize: 16, color: CREAM, lineHeight: 1.7, margin: '0 0 18px', fontWeight: 500 }}>
          {missaoDoDia}
        </p>
        <button
          onClick={() => setDiario(d => ({ ...d, missao_cumprida: !d.missao_cumprida }))}
          style={{
            width: '100%', padding: '15px', borderRadius: 10, fontSize: 15, fontWeight: 800,
            cursor: 'pointer', letterSpacing: '0.06em', transition: 'all 0.2s', border: 'none',
            background: diario.missao_cumprida ? '#22c55e' : GOLD,
            color: DARK,
            boxShadow: diario.missao_cumprida
              ? '0 4px 16px rgba(34,197,94,0.35)'
              : `0 4px 20px rgba(200,160,48,0.45)`,
          }}
        >
          {diario.missao_cumprida ? '✓ Missão cumprida!' : '🎯 Marcar como cumprida'}
        </button>
      </div>

      {/* ── 4. Streak + Versículo lado a lado ──────────────────────────── */}
      <div className="mkc-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>

        {/* Streak card */}
        <div style={{
          background: streak >= 7 ? 'linear-gradient(135deg, #1a0a00, #2d1600)' : '#1A1A1A',
          borderRadius: 14, padding: '16px',
          border: `1px solid ${streak >= 7 ? 'rgba(200,160,48,0.4)' : 'rgba(255,255,255,0.06)'}`,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}>
          <p style={{ fontSize: 26, margin: 0 }}>{streakEmoji}</p>
          <p style={{ fontSize: 24, fontWeight: 700, color: streak > 0 ? GOLD : 'rgba(245,240,232,0.3)', margin: 0, lineHeight: 1 }}>
            {streak} {streak === 1 ? 'dia' : 'dias'}
          </p>
          <p style={{ fontSize: 11, color: 'rgba(245,240,232,0.45)', margin: 0, textAlign: 'center', lineHeight: 1.4 }}>
            {streak === 0 && 'Comece hoje!'}
            {streak === 1 && 'Continue amanhã!'}
            {streak >= 2 && streak < 7 && 'Não pare agora!'}
            {streak >= 7 && streak < 14 && 'Uma semana 🔥'}
            {streak >= 14 && 'Você é imparável!'}
          </p>
        </div>

        {/* Versículo card */}
        <div style={{
          background: '#1A1A1A', borderRadius: 14, padding: '16px',
          border: `1px solid rgba(200,160,48,0.2)`,
        }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: GOLD, margin: '0 0 8px' }}>✝ Versículo</p>
          <p style={{ fontSize: 12, color: 'rgba(245,240,232,0.75)', lineHeight: 1.6, margin: '0 0 8px' }}>
            {momento.versiculo}
          </p>
          <p style={{ fontSize: 11, color: GOLD, fontWeight: 600, margin: 0 }}>{momento.versiculo_ref}</p>
        </div>
      </div>

      {/* ── 5. Registro matinal (antes das 18h) ────────────────────────── */}
      {mostrarMatinal && (
        <div style={{
          background: '#fff', borderRadius: 14, padding: '20px 24px',
          border: '1px solid var(--color-brand-border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <span style={{ fontSize: 16 }}>☀️</span>
            <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-brand-dark-green)', margin: 0 }}>Registro da manhã</p>
          </div>

          {/* Sono */}
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 12, color: 'var(--color-brand-gray)', marginBottom: 8, fontWeight: 500 }}>Como dormi?</p>
            <div style={{ display: 'flex', gap: 8 }}>
              {[1,2,3,4,5].map(n => (
                <button key={n} onClick={() => setDiario(d => ({ ...d, qualidade_sono: n }))}
                  style={{
                    width: 36, height: 36, borderRadius: '50%', fontSize: 13, cursor: 'pointer',
                    border: `1px solid ${diario.qualidade_sono === n ? GOLD : 'var(--color-brand-border)'}`,
                    background: diario.qualidade_sono === n ? GOLD : 'transparent',
                    color: diario.qualidade_sono === n ? DARK : 'var(--color-brand-gray)',
                    fontWeight: diario.qualidade_sono === n ? 600 : 400,
                  }}>{n}</button>
              ))}
            </div>
          </div>

          {/* Emoção */}
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 12, color: 'var(--color-brand-gray)', marginBottom: 8, fontWeight: 500 }}>Como estou agora?</p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {EMOCOES.map(e => (
                <button key={e} onClick={() => setDiario(d => ({ ...d, emocao: e }))}
                  style={{
                    padding: '5px 12px', borderRadius: 99, fontSize: 13, cursor: 'pointer',
                    background: diario.emocao === e ? 'rgba(200,160,48,0.12)' : 'transparent',
                    border: `1px solid ${diario.emocao === e ? 'rgba(200,160,48,0.5)' : 'var(--color-brand-border)'}`,
                    color: diario.emocao === e ? '#854F0B' : 'var(--color-brand-gray)',
                    fontWeight: diario.emocao === e ? 600 : 400,
                  }}>{e}</button>
              ))}
            </div>
          </div>

          {/* Preocupação */}
          <div style={{ marginBottom: 14 }}>
            <p style={{ fontSize: 12, color: 'var(--color-brand-gray)', marginBottom: 6, fontWeight: 500 }}>O que está pesando na sua mente hoje?</p>
            <textarea rows={2} value={diario.preocupacao ?? ''} onChange={e => setDiario(d => ({ ...d, preocupacao: e.target.value }))}
              placeholder="Escreva livremente..."
              style={{ width: '100%', fontSize: 14, resize: 'none', borderRadius: 8, padding: '10px 12px', border: '1px solid var(--color-brand-border)', fontFamily: 'var(--font-body)', color: 'var(--color-brand-dark-green)', background: 'rgba(30,57,42,0.02)', outline: 'none', boxSizing: 'border-box' }} />
          </div>

          {/* Gratidão */}
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 12, color: 'var(--color-brand-gray)', marginBottom: 6, fontWeight: 500 }}>Pelo que sou grato hoje?</p>
            <textarea rows={2} value={diario.gratidao ?? ''} onChange={e => setDiario(d => ({ ...d, gratidao: e.target.value }))}
              placeholder="Pelo menos uma coisa..."
              style={{ width: '100%', fontSize: 14, resize: 'none', borderRadius: 8, padding: '10px 12px', border: '1px solid var(--color-brand-border)', fontFamily: 'var(--font-body)', color: 'var(--color-brand-dark-green)', background: 'rgba(30,57,42,0.02)', outline: 'none', boxSizing: 'border-box' }} />
          </div>

          <button onClick={salvarMatinal} disabled={salvando}
            style={{
              width: '100%', padding: 13, border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600,
              cursor: salvando ? 'wait' : 'pointer', transition: 'background 0.2s', letterSpacing: '0.04em',
              background: salvo ? '#27AE60' : DARK, color: CREAM,
            }}>
            {salvando ? 'Salvando...' : salvo ? '✓ Manhã registrada!' : 'Registrar manhã'}
          </button>
        </div>
      )}

      {/* ── Separador matinal / noturno (quando ambos visíveis, 12–18h) ── */}
      {mostrarMatinal && mostrarNoturno && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '4px 0' }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(200,160,48,0.18)' }} />
          <span style={{ fontSize: 10, color: 'rgba(245,240,232,0.35)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.16em', whiteSpace: 'nowrap' }}>
            Reflexão da noite
          </span>
          <div style={{ flex: 1, height: 1, background: 'rgba(200,160,48,0.18)' }} />
        </div>
      )}

      {/* ── 6. Reflexão da noite (depois das 12h) ──────────────────────── */}
      {mostrarNoturno && (
        <div style={{
          background: 'linear-gradient(135deg, #0a0a1a, #0e1a2d)', borderRadius: 14, padding: '20px 24px',
          border: '1px solid rgba(100,120,200,0.2)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <span style={{ fontSize: 16 }}>🌙</span>
            <p style={{ fontSize: 15, fontWeight: 600, color: CREAM, margin: 0 }}>Reflexão da noite</p>
          </div>

          <div style={{ marginBottom: 14 }}>
            <p style={{ fontSize: 12, color: 'rgba(245,240,232,0.5)', marginBottom: 6, fontWeight: 500 }}>O que conquistei hoje?</p>
            <textarea rows={2} value={diario.conquista ?? ''} onChange={e => setDiario(d => ({ ...d, conquista: e.target.value }))}
              placeholder="Uma vitória, por menor que seja..."
              style={{ width: '100%', fontSize: 14, resize: 'none', borderRadius: 8, padding: '10px 12px', border: '1px solid rgba(245,240,232,0.1)', fontFamily: 'var(--font-body)', color: CREAM, background: 'rgba(255,255,255,0.05)', outline: 'none', boxSizing: 'border-box' }} />
          </div>

          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 12, color: 'rgba(245,240,232,0.5)', marginBottom: 6, fontWeight: 500 }}>O que aprendi hoje?</p>
            <textarea rows={2} value={diario.aprendizado ?? ''} onChange={e => setDiario(d => ({ ...d, aprendizado: e.target.value }))}
              placeholder="Uma lição, insight ou descoberta..."
              style={{ width: '100%', fontSize: 14, resize: 'none', borderRadius: 8, padding: '10px 12px', border: '1px solid rgba(245,240,232,0.1)', fontFamily: 'var(--font-body)', color: CREAM, background: 'rgba(255,255,255,0.05)', outline: 'none', boxSizing: 'border-box' }} />
          </div>

          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 12, color: 'rgba(245,240,232,0.5)', marginBottom: 8, fontWeight: 500 }}>Energia no fim do dia</p>
            <div style={{ display: 'flex', gap: 8 }}>
              {[1,2,3,4,5].map(n => (
                <button key={n} onClick={() => setDiario(d => ({ ...d, energia_fim: n }))}
                  style={{
                    width: 36, height: 36, borderRadius: '50%', fontSize: 13, cursor: 'pointer',
                    border: `1px solid ${diario.energia_fim === n ? GOLD : 'rgba(245,240,232,0.15)'}`,
                    background: diario.energia_fim === n ? GOLD : 'transparent',
                    color: diario.energia_fim === n ? DARK : 'rgba(245,240,232,0.5)',
                    fontWeight: diario.energia_fim === n ? 600 : 400,
                  }}>{n}</button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 12, color: 'rgba(245,240,232,0.5)', marginBottom: 8, fontWeight: 500 }}>Nota do dia</p>
            <div style={{ display: 'flex', gap: 8 }}>
              {[1,2,3,4,5].map(n => (
                <button key={n} onClick={() => setDiario(d => ({ ...d, nota_dia: n }))}
                  style={{
                    width: 36, height: 36, borderRadius: '50%', fontSize: 13, cursor: 'pointer',
                    border: `1px solid ${diario.nota_dia === n ? GOLD : 'rgba(245,240,232,0.15)'}`,
                    background: diario.nota_dia === n ? GOLD : 'transparent',
                    color: diario.nota_dia === n ? DARK : 'rgba(245,240,232,0.5)',
                    fontWeight: diario.nota_dia === n ? 600 : 400,
                  }}>{n}</button>
              ))}
            </div>
          </div>

          <button onClick={salvarNoturno} disabled={salvandoNoite}
            style={{
              width: '100%', padding: 13, border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600,
              cursor: salvandoNoite ? 'wait' : 'pointer', transition: 'background 0.2s', letterSpacing: '0.04em',
              background: salvoNoite ? '#27AE60' : 'rgba(200,160,48,0.9)', color: DARK,
            }}>
            {salvandoNoite ? 'Salvando...' : salvoNoite ? '✓ Noite registrada!' : 'Registrar reflexão da noite'}
          </button>
        </div>
      )}

      {/* ── 7. Compartilhar meu dia (CTA secundário) ────────────────────── */}
      <a href="/momento"
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          padding: '14px', borderRadius: 12, textDecoration: 'none',
          background: 'rgba(200,160,48,0.08)',
          border: `1px solid rgba(200,160,48,0.3)`,
          color: GOLD, fontWeight: 600, fontSize: 13,
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(200,160,48,0.15)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(200,160,48,0.08)'; }}
      >
        <span style={{ fontSize: 16 }}>📤</span>
        Compartilhar meu dia
      </a>

      {/* ── 8. Histórico colapsado ───────────────────────────────────────── */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid var(--color-brand-border)', overflow: 'hidden' }}>
        <button
          onClick={() => setMostrarHistorico(h => !h)}
          style={{
            width: '100%', padding: '14px 20px', background: 'transparent', border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            cursor: 'pointer', fontSize: 14, fontWeight: 600, color: 'var(--color-brand-dark-green)',
          }}
        >
          <span>Ver histórico (30 dias)</span>
          <span style={{ fontSize: 12, color: 'var(--color-brand-gray)', transition: 'transform 0.2s', display: 'inline-block', transform: mostrarHistorico ? 'rotate(180deg)' : 'none' }}>↓</span>
        </button>

        {mostrarHistorico && (
          <div style={{ padding: '0 20px 20px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
              {Array.from({ length: 30 }).map((_, i) => {
                const offset = 29 - i;
                const ds     = getDiaStr(offset);
                const reg    = historico.find(h => h.data === ds);
                const isHoje = offset === 0;
                const diaNum = parseInt(ds.split('-')[2], 10);
                return (
                  <div key={ds} title={ds}
                    style={{
                      width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: 11, fontWeight: 600, cursor: 'default',
                      background: reg ? (isHoje ? GOLD : 'rgba(200,160,48,0.15)') : 'rgba(30,57,42,0.04)',
                      color: reg ? (isHoje ? DARK : '#854F0B') : 'rgba(30,57,42,0.3)',
                      border: `1px solid ${isHoje ? GOLD : reg ? 'rgba(200,160,48,0.3)' : 'var(--color-brand-border)'}`,
                    }}>
                    {diaNum}
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', gap: 16, fontSize: 11, color: 'var(--color-brand-gray)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 12, height: 12, borderRadius: 3, background: 'rgba(200,160,48,0.15)', border: '1px solid rgba(200,160,48,0.3)', display: 'inline-block' }} />
                Registrado
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 12, height: 12, borderRadius: 3, background: 'rgba(30,57,42,0.04)', border: '1px solid var(--color-brand-border)', display: 'inline-block' }} />
                Sem registro
              </span>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
