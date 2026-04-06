'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useSupabaseClient } from '@/lib/useSupabaseClient';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import type { MomentoKairos, DiarioKairos } from '@/lib/database.types';

const EMOCOES = ['animado', 'focado', 'grato', 'cansado', 'ansioso', 'tranquilo'];

function calcularStreak(hist: Partial<DiarioKairos>[]): number {
  if (!hist.length) return 0;
  const datas = hist.map(h => h.data).sort((a, b) => b!.localeCompare(a!));
  let streak = 0;
  const hoje = new Date();
  for (let i = 0; i < datas.length; i++) {
    const esperado = new Date(hoje);
    esperado.setDate(hoje.getDate() - i);
    const esperadoStr = esperado.toISOString().split('T')[0];
    if (datas[i] === esperadoStr) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export default function MomentoPage() {
  const { user } = useUser();
  const { getClient } = useSupabaseClient();

  const [momento, setMomento] = useState<MomentoKairos | null>(null);
  const [diario, setDiario] = useState<Partial<DiarioKairos>>({});
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [historico, setHistorico] = useState<Partial<DiarioKairos>[]>([]);
  const [diaSelecionado, setDiaSelecionado] = useState<Partial<DiarioKairos> | null>(null);
  const [streak, setStreak] = useState(0);
  const hoje = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      const client = await getClient();

      const { data: momentoData } = await client
        .from('momento_kairos')
        .select('*')
        .eq('data', hoje)
        .single();
      if (momentoData) setMomento(momentoData);

      const { data: diarioData } = await client
        .from('diario_kairos')
        .select('*')
        .eq('user_id', user.id)
        .eq('data', hoje)
        .single();
      if (diarioData) setDiario(diarioData);

      const { data: hist } = await client
        .from('diario_kairos')
        .select('*')
        .eq('user_id', user.id)
        .order('data', { ascending: false })
        .limit(30);
      if (hist) {
        setHistorico(hist);
        setStreak(calcularStreak(hist));
      }

      setCarregando(false);
    })();
  }, [user?.id]);

  async function salvarDiario() {
    if (!user?.id) return;
    setSalvando(true);
    const client = await getClient();
    await client.from('diario_kairos').upsert({
      user_id: user.id,
      data: hoje,
      qualidade_sono: diario.qualidade_sono ?? null,
      emocao: diario.emocao ?? null,
      preocupacao: diario.preocupacao ?? null,
      gratidao: diario.gratidao ?? null,
      missao_cumprida: diario.missao_cumprida ?? false,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,data' });
    setSalvando(false);
    setSalvo(true);
    setTimeout(() => setSalvo(false), 3000);
  }

  const nomeUsuario = user?.firstName ?? 'Davilson';
  const dataLabel = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

  if (carregando) return (
    <DashboardLayout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <p style={{ color: 'var(--color-brand-gray)', fontSize: 14 }}>Carregando seu Momento...</p>
      </div>
    </DashboardLayout>
  );

  if (!momento) return (
    <DashboardLayout>
      <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center', padding: '60px 24px' }}>
        <p style={{ fontSize: 32, marginBottom: 16 }}>☀️</p>
        <p style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-brand-dark-green)', marginBottom: 8 }}>
          Momento ainda não disponível
        </p>
        <p style={{ fontSize: 14, color: 'var(--color-brand-gray)' }}>
          O conteúdo de hoje ainda está sendo preparado. Volte mais tarde.
        </p>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Header */}
        <div style={{ background: '#0E0E0E', borderRadius: 12, padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <span style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#C8A030', fontWeight: 500 }}>
              Momento Kairos · Fase 0{momento.fase}
            </span>
            <span style={{ fontSize: 11, color: 'rgba(245,240,232,0.4)', textTransform: 'capitalize' }}>{dataLabel}</span>
          </div>
          <p style={{ fontSize: 22, fontFamily: 'var(--font-heading)', color: '#F5F0E8', fontWeight: 400, margin: 0 }}>
            Bom dia, {nomeUsuario}.
          </p>
        </div>

        {/* Streak */}
        <div style={{ background: streak >= 7 ? 'linear-gradient(135deg, #1a0a00, #2d1600)' : '#fff', border: `1px solid ${streak >= 7 ? 'rgba(200,160,48,0.4)' : 'var(--color-brand-border)'}`, borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: streak > 0 ? 'rgba(200,160,48,0.15)' : 'rgba(30,57,42,0.06)', border: `2px solid ${streak > 0 ? '#C8A030' : 'var(--color-brand-border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 22 }}>{streak >= 14 ? '⚡' : streak >= 7 ? '🔥' : streak >= 3 ? '✨' : '💤'}</span>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 22, fontWeight: 700, color: streak > 0 ? '#C8A030' : 'var(--color-brand-gray)', margin: 0, lineHeight: 1 }}>
              {streak} {streak === 1 ? 'dia' : 'dias'}
            </p>
            <p style={{ fontSize: 12, color: streak >= 7 ? 'rgba(200,160,48,0.7)' : 'var(--color-brand-gray)', margin: '4px 0 0', fontWeight: 500 }}>
              {streak === 0 && 'Comece hoje sua sequência!'}
              {streak === 1 && 'Primeiro dia — continue amanhã!'}
              {streak >= 2 && streak < 7 && `${streak} dias seguidos — não pare agora!`}
              {streak >= 7 && streak < 14 && '🔥 Uma semana de consistência!'}
              {streak >= 14 && '⚡ Você é imparável!'}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 10, color: 'var(--color-brand-gray)', margin: 0, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Sequência</p>
            <p style={{ fontSize: 10, color: 'var(--color-brand-gray)', margin: '2px 0 0' }}>consecutiva</p>
          </div>
        </div>

        {/* Voz do dia */}
        <div style={{ background: '#fff', border: '1px solid var(--color-brand-border)', borderRadius: 12, padding: '20px 24px', borderLeft: '3px solid #C8A030' }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-brand-gray)', marginBottom: 12 }}>
            A voz do dia
          </p>
          <p style={{ fontSize: 15, color: 'var(--color-brand-dark-green)', lineHeight: 1.8, fontFamily: 'var(--font-heading)', fontStyle: 'italic', margin: 0 }}>
            &ldquo;{momento.voz_texto}&rdquo;
          </p>
        </div>

        {/* Versículo */}
        <div style={{ background: 'rgba(200,160,48,0.05)', border: '1px solid rgba(200,160,48,0.2)', borderRadius: 12, padding: '16px 20px', display: 'flex', gap: 14 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(200,160,48,0.15)', border: '1px solid rgba(200,160,48,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 14 }}>✝</span>
          </div>
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-brand-gray)', marginBottom: 6 }}>Versículo do dia</p>
            <p style={{ fontSize: 14, color: 'var(--color-brand-dark-green)', lineHeight: 1.7, margin: 0 }}>{momento.versiculo}</p>
            <p style={{ fontSize: 12, color: '#C8A030', marginTop: 6, fontWeight: 600 }}>{momento.versiculo_ref}</p>
          </div>
        </div>

        {/* Missão */}
        <div style={{ background: '#fff', border: '1px solid var(--color-brand-border)', borderRadius: 12, padding: '16px 20px' }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#C8A030', marginBottom: 8 }}>
            Sua missão de hoje
          </p>
          <p style={{ fontSize: 15, color: 'var(--color-brand-dark-green)', lineHeight: 1.7, margin: '0 0 12px' }}>{momento.missao}</p>
          <button
            onClick={() => setDiario(d => ({ ...d, missao_cumprida: !d.missao_cumprida }))}
            style={{ width: '100%', padding: '9px', borderRadius: 8, fontSize: 13, cursor: 'pointer', background: diario.missao_cumprida ? '#C8A030' : 'transparent', color: diario.missao_cumprida ? '#0E0E0E' : 'var(--color-brand-dark-green)', border: `1px solid ${diario.missao_cumprida ? '#C8A030' : 'var(--color-brand-border)'}`, fontWeight: diario.missao_cumprida ? 600 : 400, transition: 'all 0.2s' }}
          >
            {diario.missao_cumprida ? '✓ Missão cumprida!' : 'Marcar como cumprida'}
          </button>
        </div>

        {/* Diário */}
        <div style={{ background: '#fff', border: '1px solid var(--color-brand-border)', borderRadius: 12, padding: '20px 24px' }}>
          <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-brand-dark-green)', marginBottom: 16 }}>Meu diário de hoje</p>

          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 12, color: 'var(--color-brand-gray)', marginBottom: 8, fontWeight: 500 }}>Como dormi?</p>
            <div style={{ display: 'flex', gap: 8 }}>
              {[1,2,3,4,5].map(n => (
                <button key={n} onClick={() => setDiario(d => ({ ...d, qualidade_sono: n }))}
                  style={{ width: 36, height: 36, borderRadius: '50%', border: `1px solid ${diario.qualidade_sono === n ? '#C8A030' : 'var(--color-brand-border)'}`, background: diario.qualidade_sono === n ? '#C8A030' : 'transparent', color: diario.qualidade_sono === n ? '#0E0E0E' : 'var(--color-brand-gray)', fontSize: 13, fontWeight: diario.qualidade_sono === n ? 600 : 400, cursor: 'pointer' }}>
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 12, color: 'var(--color-brand-gray)', marginBottom: 8, fontWeight: 500 }}>Como estou agora?</p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {EMOCOES.map(e => (
                <button key={e} onClick={() => setDiario(d => ({ ...d, emocao: e }))}
                  style={{ padding: '5px 12px', borderRadius: 99, fontSize: 13, cursor: 'pointer', background: diario.emocao === e ? 'rgba(200,160,48,0.12)' : 'transparent', border: `1px solid ${diario.emocao === e ? 'rgba(200,160,48,0.5)' : 'var(--color-brand-border)'}`, color: diario.emocao === e ? '#854F0B' : 'var(--color-brand-gray)', fontWeight: diario.emocao === e ? 600 : 400 }}>
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <p style={{ fontSize: 12, color: 'var(--color-brand-gray)', marginBottom: 6, fontWeight: 500 }}>O que está pesando na sua mente hoje?</p>
            <textarea rows={3} value={diario.preocupacao ?? ''} onChange={e => setDiario(d => ({ ...d, preocupacao: e.target.value }))}
              placeholder="Escreva livremente..."
              style={{ width: '100%', fontSize: 14, resize: 'none', borderRadius: 8, padding: '10px 12px', border: '1px solid var(--color-brand-border)', fontFamily: 'var(--font-body)', color: 'var(--color-brand-dark-green)', background: 'rgba(30,57,42,0.02)', outline: 'none', boxSizing: 'border-box' }} />
          </div>

          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 12, color: 'var(--color-brand-gray)', marginBottom: 6, fontWeight: 500 }}>Pelo que sou grato hoje?</p>
            <textarea rows={3} value={diario.gratidao ?? ''} onChange={e => setDiario(d => ({ ...d, gratidao: e.target.value }))}
              placeholder="Pelo menos uma coisa..."
              style={{ width: '100%', fontSize: 14, resize: 'none', borderRadius: 8, padding: '10px 12px', border: '1px solid var(--color-brand-border)', fontFamily: 'var(--font-body)', color: 'var(--color-brand-dark-green)', background: 'rgba(30,57,42,0.02)', outline: 'none', boxSizing: 'border-box' }} />
          </div>

          <button onClick={salvarDiario} disabled={salvando}
            style={{ width: '100%', padding: 13, background: salvo ? '#27AE60' : '#0E0E0E', color: '#F5F0E8', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: salvando ? 'wait' : 'pointer', transition: 'background 0.2s', letterSpacing: '0.04em' }}>
            {salvando ? 'Salvando...' : salvo ? '✓ Diário registrado!' : 'Registrar meu dia'}
          </button>
        </div>

        {/* Histórico 30 dias */}
        <div style={{ background: '#fff', border: '1px solid var(--color-brand-border)', borderRadius: 12, padding: '20px 24px' }}>
          <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-brand-dark-green)', marginBottom: 4 }}>
            Meu histórico
          </p>
          <p style={{ fontSize: 12, color: 'var(--color-brand-gray)', marginBottom: 16 }}>
            Últimos 30 dias — clique num dia para ver o registro
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {Array.from({ length: 30 }).map((_, i) => {
              const d = new Date();
              d.setDate(d.getDate() - (29 - i));
              const dataStr = d.toISOString().split('T')[0];
              const registro = historico.find(h => h.data === dataStr);
              const isHoje = dataStr === hoje;
              return (
                <button key={dataStr} onClick={() => registro ? setDiaSelecionado(diaSelecionado?.data === dataStr ? null : registro) : null}
                  title={dataStr}
                  style={{ width: 32, height: 32, borderRadius: '50%', border: 'none', cursor: registro ? 'pointer' : 'default', background: isHoje ? '#C8A030' : registro ? '#1E392A' : 'rgba(30,57,42,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: isHoje ? '0 0 10px rgba(200,160,48,0.4)' : 'none', transition: 'transform 0.15s' }}>
                  {isHoje ? <span style={{ fontSize: 14 }}>🔥</span> :
                   registro ? <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#C8A030" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                   : null}
                </button>
              );
            })}
          </div>

          {diaSelecionado && (
            <div style={{ marginTop: 20, padding: '16px', background: 'rgba(30,57,42,0.04)', borderRadius: 10, border: '1px solid var(--color-brand-border)' }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#C8A030', marginBottom: 12, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {new Date(diaSelecionado.data + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {diaSelecionado.qualidade_sono && <p style={{ fontSize: 13, color: 'var(--color-brand-dark-green)', margin: 0 }}>😴 Sono: <strong>{diaSelecionado.qualidade_sono}/5</strong></p>}
                {diaSelecionado.emocao && <p style={{ fontSize: 13, color: 'var(--color-brand-dark-green)', margin: 0 }}>❤️ Emoção: <strong>{diaSelecionado.emocao}</strong></p>}
                {diaSelecionado.preocupacao && <p style={{ fontSize: 13, color: 'var(--color-brand-dark-green)', margin: 0 }}>💭 Pesando: <em>"{diaSelecionado.preocupacao}"</em></p>}
                {diaSelecionado.gratidao && <p style={{ fontSize: 13, color: 'var(--color-brand-dark-green)', margin: 0 }}>🙏 Gratidão: <em>"{diaSelecionado.gratidao}"</em></p>}
                {diaSelecionado.missao_cumprida && <p style={{ fontSize: 13, color: '#27AE60', fontWeight: 600, margin: 0 }}>✓ Missão cumprida neste dia!</p>}
              </div>
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}