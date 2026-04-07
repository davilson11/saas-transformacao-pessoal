'use client';

import { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { useSupabaseClient } from '@/lib/useSupabaseClient';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import type { MomentoKairos, DiarioKairos } from '@/lib/database.types';

const EMOCOES = ['animado', 'focado', 'grato', 'cansado', 'ansioso', 'tranquilo'];

const EMOCAO_VALOR: Record<string, number> = {
  animado: 5, grato: 5, focado: 4, tranquilo: 3, cansado: 2, ansioso: 1,
};

function calcularStreak(hist: Partial<DiarioKairos>[]): number {
  if (!hist.length) return 0;
  const datas = hist.map(h => h.data).sort((a, b) => b!.localeCompare(a!));
  let streak = 0;
  const hoje = new Date();
  for (let i = 0; i < datas.length; i++) {
    const esperado = new Date(hoje);
    esperado.setDate(hoje.getDate() - i);
    const esperadoStr = esperado.toISOString().split('T')[0];
    if (datas[i] === esperadoStr) streak++;
    else break;
  }
  return streak;
}

function GraficoHumor({ historico }: { historico: Partial<DiarioKairos>[] }) {
  const W = 580, H = 140, PAD = 32;
  const dias = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dataStr = d.toISOString().split('T')[0];
    const reg = historico.find(h => h.data === dataStr);
    return {
      label: d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', ''),
      sono: reg?.qualidade_sono ?? null,
      emocao: reg?.emocao ? (EMOCAO_VALOR[reg.emocao] ?? null) : null,
    };
  });
  const xStep = (W - PAD * 2) / 6;
  const yScale = (v: number) => H - PAD - ((v - 1) / 4) * (H - PAD * 2);
  const pontosSono = dias.map((d, i) => d.sono !== null ? { x: PAD + i * xStep, y: yScale(d.sono!) } : null);
  const pontosEmocao = dias.map((d, i) => d.emocao !== null ? { x: PAD + i * xStep, y: yScale(d.emocao!) } : null);
  const linhaPath = (pts: (({ x: number; y: number }) | null)[]) => {
    const validos = pts.map((p, i) => ({ p, i })).filter(x => x.p !== null);
    if (validos.length < 2) return '';
    return validos.map((x, i) => `${i === 0 ? 'M' : 'L'} ${x.p!.x} ${x.p!.y}`).join(' ');
  };
  return (
    <div style={{ background: '#fff', border: '1px solid var(--color-brand-border)', borderRadius: 12, padding: '20px 24px' }}>
      <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-brand-dark-green)', marginBottom: 4 }}>Meu humor esta semana</p>
      <div style={{ display: 'flex', gap: 16, marginBottom: 14 }}>
        <span style={{ fontSize: 11, color: '#C8A030', fontWeight: 600 }}>— Sono</span>
        <span style={{ fontSize: 11, color: '#1E392A', fontWeight: 600 }}>— Emoção</span>
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
        {[1,2,3,4,5].map(v => <line key={v} x1={PAD} y1={yScale(v)} x2={W-PAD} y2={yScale(v)} stroke="rgba(30,57,42,0.06)" strokeWidth="1" />)}
        <path d={linhaPath(pontosSono)} fill="none" stroke="#C8A030" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d={linhaPath(pontosEmocao)} fill="none" stroke="#1E392A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 3" />
        {pontosSono.map((p, i) => p && <circle key={i} cx={p.x} cy={p.y} r={4} fill="#C8A030" stroke="#fff" strokeWidth="2" />)}
        {pontosEmocao.map((p, i) => p && <circle key={i} cx={p.x} cy={p.y} r={4} fill="#1E392A" stroke="#fff" strokeWidth="2" />)}
        {dias.map((d, i) => <text key={i} x={PAD + i * xStep} y={H-4} textAnchor="middle" fontSize="10" fill="rgba(30,57,42,0.4)">{d.label}</text>)}
        {[1,3,5].map(v => <text key={v} x={PAD-6} y={yScale(v)+4} textAnchor="end" fontSize="10" fill="rgba(30,57,42,0.3)">{v}</text>)}
      </svg>
      {dias.every(d => d.sono === null && d.emocao === null) && (
        <p style={{ fontSize: 12, color: 'var(--color-brand-gray)', textAlign: 'center', marginTop: 8 }}>Registre seu diário para ver o gráfico 📊</p>
      )}
    </div>
  );
}

function CardCompartilhar({ diario, streak, momento }: {
  diario: Partial<DiarioKairos>;
  streak: number;
  momento: MomentoKairos;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [gerando, setGerando] = useState(false);
  const [mostrar, setMostrar] = useState(false);

  async function baixarCard() {
    if (!cardRef.current) return;
    setGerando(true);
    const html2canvas = (await import('html2canvas')).default;
    const canvas = await html2canvas(cardRef.current, { scale: 2, useCORS: true, backgroundColor: null });
    const link = document.createElement('a');
    link.download = `kairos-${new Date().toISOString().split('T')[0]}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    setGerando(false);
  }

  const dataLabel = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div style={{ background: '#fff', border: '1px solid var(--color-brand-border)', borderRadius: 12, padding: '20px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-brand-dark-green)', margin: 0 }}>Compartilhar meu dia</p>
          <p style={{ fontSize: 12, color: 'var(--color-brand-gray)', margin: '2px 0 0' }}>Gere um card para o Instagram</p>
        </div>
        <button onClick={() => setMostrar(m => !m)}
          style={{ padding: '6px 14px', borderRadius: 8, fontSize: 12, cursor: 'pointer', background: 'transparent', border: '1px solid var(--color-brand-border)', color: 'var(--color-brand-dark-green)', fontWeight: 500 }}>
          {mostrar ? 'Fechar' : '👁 Visualizar'}
        </button>
      </div>
      {mostrar && (
        <>
          <div ref={cardRef} style={{ width: 400, background: 'linear-gradient(145deg, #0E0E0E 0%, #1a1a0a 100%)', borderRadius: 20, padding: '32px 28px', margin: '0 auto 16px', fontFamily: 'Georgia, serif', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(200,160,48,0.06)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: -60, left: -30, width: 200, height: 200, borderRadius: '50%', background: 'rgba(200,160,48,0.04)', pointerEvents: 'none' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
              <div>
                <p style={{ fontSize: 10, letterSpacing: '0.2em', color: '#C8A030', fontWeight: 600, margin: 0, textTransform: 'uppercase', fontFamily: 'Arial, sans-serif' }}>Momento Kairos</p>
                <p style={{ fontSize: 12, color: 'rgba(245,240,232,0.4)', margin: '4px 0 0', fontFamily: 'Arial, sans-serif' }}>{dataLabel}</p>
              </div>
              {streak > 0 && (
                <div style={{ background: 'rgba(200,160,48,0.15)', border: '1px solid rgba(200,160,48,0.3)', borderRadius: 20, padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 12 }}>🔥</span>
                  <span style={{ fontSize: 11, color: '#C8A030', fontWeight: 600, fontFamily: 'Arial, sans-serif' }}>{streak} dias</span>
                </div>
              )}
            </div>
            <div style={{ borderLeft: '2px solid rgba(200,160,48,0.4)', paddingLeft: 16, marginBottom: 24 }}>
              <p style={{ fontSize: 13, color: 'rgba(245,240,232,0.7)', lineHeight: 1.7, margin: 0, fontStyle: 'italic' }}>
                "{momento.voz_texto?.slice(0, 120)}{(momento.voz_texto?.length ?? 0) > 120 ? '...' : ''}"
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
              {diario.qualidade_sono && (
                <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '10px 12px' }}>
                  <p style={{ fontSize: 10, color: 'rgba(245,240,232,0.4)', margin: '0 0 4px', fontFamily: 'Arial, sans-serif', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Sono</p>
                  <p style={{ fontSize: 18, fontWeight: 700, color: '#C8A030', margin: 0, fontFamily: 'Arial, sans-serif' }}>{diario.qualidade_sono}/5</p>
                </div>
              )}
              {diario.emocao && (
                <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '10px 12px' }}>
                  <p style={{ fontSize: 10, color: 'rgba(245,240,232,0.4)', margin: '0 0 4px', fontFamily: 'Arial, sans-serif', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Emoção</p>
                  <p style={{ fontSize: 16, fontWeight: 700, color: '#F5F0E8', margin: 0, fontFamily: 'Arial, sans-serif', textTransform: 'capitalize' }}>{diario.emocao}</p>
                </div>
              )}
              {diario.nota_dia && (
                <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '10px 12px' }}>
                  <p style={{ fontSize: 10, color: 'rgba(245,240,232,0.4)', margin: '0 0 4px', fontFamily: 'Arial, sans-serif', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Nota do dia</p>
                  <p style={{ fontSize: 18, fontWeight: 700, color: '#C8A030', margin: 0, fontFamily: 'Arial, sans-serif' }}>{diario.nota_dia}/5 ⭐</p>
                </div>
              )}
              {diario.missao_cumprida && (
                <div style={{ background: 'rgba(39,174,96,0.1)', borderRadius: 10, padding: '10px 12px', border: '1px solid rgba(39,174,96,0.2)' }}>
                  <p style={{ fontSize: 10, color: 'rgba(245,240,232,0.4)', margin: '0 0 4px', fontFamily: 'Arial, sans-serif', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Missão</p>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#27AE60', margin: 0, fontFamily: 'Arial, sans-serif' }}>✓ Cumprida</p>
                </div>
              )}
            </div>
            {diario.gratidao && (
              <div style={{ background: 'rgba(200,160,48,0.06)', borderRadius: 10, padding: '12px 14px', marginBottom: 20 }}>
                <p style={{ fontSize: 10, color: '#C8A030', margin: '0 0 6px', fontFamily: 'Arial, sans-serif', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>🙏 Grato por</p>
                <p style={{ fontSize: 13, color: 'rgba(245,240,232,0.8)', margin: 0, lineHeight: 1.5, fontStyle: 'italic' }}>"{diario.gratidao.slice(0, 80)}{diario.gratidao.length > 80 ? '...' : ''}"</p>
              </div>
            )}
            <div style={{ borderTop: '1px solid rgba(245,240,232,0.06)', paddingTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontSize: 10, color: 'rgba(245,240,232,0.25)', margin: 0, fontFamily: 'Arial, sans-serif' }}>meukairos.com.br</p>
              <p style={{ fontSize: 10, color: 'rgba(245,240,232,0.25)', margin: 0, fontFamily: 'Arial, sans-serif' }}>A Virada · Kairos</p>
            </div>
          </div>
          <button onClick={baixarCard} disabled={gerando}
            style={{ width: '100%', padding: 13, background: gerando ? 'rgba(200,160,48,0.5)' : '#C8A030', color: '#0E0E0E', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: gerando ? 'wait' : 'pointer', transition: 'background 0.2s', letterSpacing: '0.04em' }}>
            {gerando ? 'Gerando imagem...' : '⬇ Baixar card para Instagram'}
          </button>
        </>
      )}
    </div>
  );
}

export default function MomentoPage() {
  const { user } = useUser();
  const { getClient } = useSupabaseClient();

  const [momento, setMomento] = useState<MomentoKairos | null>(null);
  const [diario, setDiario] = useState<Partial<DiarioKairos>>({});
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [salvandoNoite, setSalvandoNoite] = useState(false);
  const [salvoNoite, setSalvoNoite] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [historico, setHistorico] = useState<Partial<DiarioKairos>[]>([]);
  const [diaSelecionado, setDiaSelecionado] = useState<Partial<DiarioKairos> | null>(null);
  const [streak, setStreak] = useState(0);
  const [notifAtiva, setNotifAtiva] = useState(false);
  const [faseUsuario, setFaseUsuario] = useState(1);
  const hoje = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      const client = await getClient();
      const { data: momentoData } = await client.from('momento_kairos').select('*').eq('data', hoje).maybeSingle();
      if (momentoData) setMomento(momentoData);
      const { data: diarioData } = await client.from('diario_kairos').select('*').eq('user_id', user.id).eq('data', hoje).maybeSingle();
      if (diarioData) setDiario(diarioData);
      const { data: hist } = await client.from('diario_kairos').select('*').eq('user_id', user.id).order('data', { ascending: false }).limit(30);
      if (hist) { setHistorico(hist); setStreak(calcularStreak(hist)); }
      setCarregando(false);
    })();
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      const client = await getClient();
      const { data } = await client
        .from('ferramentas_respostas')
        .select('ferramenta_codigo, concluida')
        .eq('user_id', user.id);
      if (!data) return;
      const concluidas = data.filter(f => f.concluida).length;
      if (concluidas >= 12) setFaseUsuario(4);
      else if (concluidas >= 8) setFaseUsuario(3);
      else if (concluidas >= 4) setFaseUsuario(2);
      else setFaseUsuario(1);
    })();
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function salvarDiario() {
    if (!user?.id) return;
    setSalvando(true);
    const client = await getClient();
    await client.from('diario_kairos').upsert({
      user_id: user.id, data: hoje,
      qualidade_sono: diario.qualidade_sono ?? null,
      emocao: diario.emocao ?? null,
      preocupacao: diario.preocupacao ?? null,
      gratidao: diario.gratidao ?? null,
      missao_cumprida: diario.missao_cumprida ?? false,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,data' });
    setSalvando(false); setSalvo(true);
    setTimeout(() => setSalvo(false), 3000);
  }

  async function salvarReflexaoNoite() {
    if (!user?.id) return;
    setSalvandoNoite(true);
    const client = await getClient();
    await client.from('diario_kairos').upsert({
      user_id: user.id, data: hoje,
      conquista: diario.conquista ?? null,
      aprendizado: diario.aprendizado ?? null,
      energia_fim: diario.energia_fim ?? null,
      nota_dia: diario.nota_dia ?? null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,data' });
    setSalvandoNoite(false); setSalvoNoite(true);
    setTimeout(() => setSalvoNoite(false), 3000);
  }

  async function ativarNotificacoes() {
    if (!user?.id) return;
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return alert('Permissão negada. Ative nas configurações do navegador.');
    const reg = await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    });
    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, subscription: sub }),
    });
    setNotifAtiva(true);
  }

  const nomeUsuario = user?.firstName ?? 'Davilson';
  const dataLabel = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

  const missaoDoDia = momento
    ? (momento[`missao_fase${faseUsuario}` as keyof MomentoKairos] as string ?? momento.missao)
    : null;

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
        <p style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-brand-dark-green)', marginBottom: 8 }}>Momento ainda não disponível</p>
        <p style={{ fontSize: 14, color: 'var(--color-brand-gray)' }}>O conteúdo de hoje ainda está sendo preparado. Volte mais tarde.</p>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Header */}
        <div style={{ background: '#0E0E0E', borderRadius: 12, padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <span style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#C8A030', fontWeight: 500 }}>Momento Kairos · Fase 0{faseUsuario}</span>
            <span style={{ fontSize: 11, color: 'rgba(245,240,232,0.4)', textTransform: 'capitalize' }}>{dataLabel}</span>
          </div>
          <p style={{ fontSize: 22, fontFamily: 'var(--font-heading)', color: '#F5F0E8', fontWeight: 400, margin: 0 }}>Bom dia, {nomeUsuario}.</p>
        </div>

        {/* Streak */}
        <div style={{ background: streak >= 7 ? 'linear-gradient(135deg, #1a0a00, #2d1600)' : '#fff', border: `1px solid ${streak >= 7 ? 'rgba(200,160,48,0.4)' : 'var(--color-brand-border)'}`, borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: streak > 0 ? 'rgba(200,160,48,0.15)' : 'rgba(30,57,42,0.06)', border: `2px solid ${streak > 0 ? '#C8A030' : 'var(--color-brand-border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 22 }}>{streak >= 14 ? '⚡' : streak >= 7 ? '🔥' : streak >= 3 ? '✨' : '💤'}</span>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 22, fontWeight: 700, color: streak > 0 ? '#C8A030' : 'var(--color-brand-gray)', margin: 0, lineHeight: 1 }}>{streak} {streak === 1 ? 'dia' : 'dias'}</p>
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

        {/* Notificações */}
        {typeof window !== 'undefined' && 'Notification' in window && (
          <div style={{ background: '#fff', border: '1px solid var(--color-brand-border)', borderRadius: 12, padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-brand-dark-green)', margin: 0 }}>🔔 Lembrete diário</p>
              <p style={{ fontSize: 11, color: 'var(--color-brand-gray)', margin: '2px 0 0' }}>Receba um aviso todo dia às 7h</p>
            </div>
            <button onClick={ativarNotificacoes} disabled={notifAtiva}
              style={{ padding: '7px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: notifAtiva ? 'default' : 'pointer', background: notifAtiva ? '#27AE60' : '#0E0E0E', color: '#F5F0E8', border: 'none' }}>
              {notifAtiva ? '✓ Ativado' : 'Ativar'}
            </button>
          </div>
        )}

        {/* Voz do dia */}
        <div style={{ background: '#fff', border: '1px solid var(--color-brand-border)', borderRadius: 12, padding: '20px 24px', borderLeft: '3px solid #C8A030' }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-brand-gray)', marginBottom: 12 }}>A voz do dia</p>
          <p style={{ fontSize: 15, color: 'var(--color-brand-dark-green)', lineHeight: 1.8, fontFamily: 'var(--font-heading)', fontStyle: 'italic', margin: 0 }}>&ldquo;{momento.voz_texto}&rdquo;</p>
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

        {/* Missão — dinâmica por fase */}
        <div style={{ background: '#fff', border: '1px solid var(--color-brand-border)', borderRadius: 12, padding: '16px 20px' }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#C8A030', marginBottom: 8 }}>Sua missão de hoje</p>
          <p style={{ fontSize: 15, color: 'var(--color-brand-dark-green)', lineHeight: 1.7, margin: '0 0 12px' }}>{missaoDoDia}</p>
          <button onClick={() => setDiario(d => ({ ...d, missao_cumprida: !d.missao_cumprida }))}
            style={{ width: '100%', padding: '9px', borderRadius: 8, fontSize: 13, cursor: 'pointer', background: diario.missao_cumprida ? '#C8A030' : 'transparent', color: diario.missao_cumprida ? '#0E0E0E' : 'var(--color-brand-dark-green)', border: `1px solid ${diario.missao_cumprida ? '#C8A030' : 'var(--color-brand-border)'}`, fontWeight: diario.missao_cumprida ? 600 : 400, transition: 'all 0.2s' }}>
            {diario.missao_cumprida ? '✓ Missão cumprida!' : 'Marcar como cumprida'}
          </button>
        </div>

        {/* Diário manhã */}
        <div style={{ background: '#fff', border: '1px solid var(--color-brand-border)', borderRadius: 12, padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <span style={{ fontSize: 16 }}>☀️</span>
            <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-brand-dark-green)', margin: 0 }}>Registro da manhã</p>
          </div>
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 12, color: 'var(--color-brand-gray)', marginBottom: 8, fontWeight: 500 }}>Como dormi?</p>
            <div style={{ display: 'flex', gap: 8 }}>
              {[1,2,3,4,5].map(n => (
                <button key={n} onClick={() => setDiario(d => ({ ...d, qualidade_sono: n }))}
                  style={{ width: 36, height: 36, borderRadius: '50%', border: `1px solid ${diario.qualidade_sono === n ? '#C8A030' : 'var(--color-brand-border)'}`, background: diario.qualidade_sono === n ? '#C8A030' : 'transparent', color: diario.qualidade_sono === n ? '#0E0E0E' : 'var(--color-brand-gray)', fontSize: 13, fontWeight: diario.qualidade_sono === n ? 600 : 400, cursor: 'pointer' }}>{n}</button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 12, color: 'var(--color-brand-gray)', marginBottom: 8, fontWeight: 500 }}>Como estou agora?</p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {EMOCOES.map(e => (
                <button key={e} onClick={() => setDiario(d => ({ ...d, emocao: e }))}
                  style={{ padding: '5px 12px', borderRadius: 99, fontSize: 13, cursor: 'pointer', background: diario.emocao === e ? 'rgba(200,160,48,0.12)' : 'transparent', border: `1px solid ${diario.emocao === e ? 'rgba(200,160,48,0.5)' : 'var(--color-brand-border)'}`, color: diario.emocao === e ? '#854F0B' : 'var(--color-brand-gray)', fontWeight: diario.emocao === e ? 600 : 400 }}>{e}</button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <p style={{ fontSize: 12, color: 'var(--color-brand-gray)', marginBottom: 6, fontWeight: 500 }}>O que está pesando na sua mente hoje?</p>
            <textarea rows={3} value={diario.preocupacao ?? ''} onChange={e => setDiario(d => ({ ...d, preocupacao: e.target.value }))} placeholder="Escreva livremente..."
              style={{ width: '100%', fontSize: 14, resize: 'none', borderRadius: 8, padding: '10px 12px', border: '1px solid var(--color-brand-border)', fontFamily: 'var(--font-body)', color: 'var(--color-brand-dark-green)', background: 'rgba(30,57,42,0.02)', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 12, color: 'var(--color-brand-gray)', marginBottom: 6, fontWeight: 500 }}>Pelo que sou grato hoje?</p>
            <textarea rows={3} value={diario.gratidao ?? ''} onChange={e => setDiario(d => ({ ...d, gratidao: e.target.value }))} placeholder="Pelo menos uma coisa..."
              style={{ width: '100%', fontSize: 14, resize: 'none', borderRadius: 8, padding: '10px 12px', border: '1px solid var(--color-brand-border)', fontFamily: 'var(--font-body)', color: 'var(--color-brand-dark-green)', background: 'rgba(30,57,42,0.02)', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <button onClick={salvarDiario} disabled={salvando}
            style={{ width: '100%', padding: 13, background: salvo ? '#27AE60' : '#0E0E0E', color: '#F5F0E8', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: salvando ? 'wait' : 'pointer', transition: 'background 0.2s', letterSpacing: '0.04em' }}>
            {salvando ? 'Salvando...' : salvo ? '✓ Manhã registrada!' : 'Registrar manhã'}
          </button>
        </div>

        {/* Reflexão da noite */}
        <div style={{ background: 'linear-gradient(135deg, #0a0a1a, #0e1a2d)', border: '1px solid rgba(100,120,200,0.2)', borderRadius: 12, padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <span style={{ fontSize: 16 }}>🌙</span>
            <p style={{ fontSize: 15, fontWeight: 600, color: '#F5F0E8', margin: 0 }}>Reflexão da noite</p>
          </div>
          <div style={{ marginBottom: 14 }}>
            <p style={{ fontSize: 12, color: 'rgba(245,240,232,0.5)', marginBottom: 6, fontWeight: 500 }}>O que conquistei hoje?</p>
            <textarea rows={3} value={diario.conquista ?? ''} onChange={e => setDiario(d => ({ ...d, conquista: e.target.value }))} placeholder="Uma vitória, por menor que seja..."
              style={{ width: '100%', fontSize: 14, resize: 'none', borderRadius: 8, padding: '10px 12px', border: '1px solid rgba(245,240,232,0.1)', fontFamily: 'var(--font-body)', color: '#F5F0E8', background: 'rgba(255,255,255,0.05)', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 12, color: 'rgba(245,240,232,0.5)', marginBottom: 6, fontWeight: 500 }}>O que aprendi hoje?</p>
            <textarea rows={3} value={diario.aprendizado ?? ''} onChange={e => setDiario(d => ({ ...d, aprendizado: e.target.value }))} placeholder="Uma lição, insight ou descoberta..."
              style={{ width: '100%', fontSize: 14, resize: 'none', borderRadius: 8, padding: '10px 12px', border: '1px solid rgba(245,240,232,0.1)', fontFamily: 'var(--font-body)', color: '#F5F0E8', background: 'rgba(255,255,255,0.05)', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 12, color: 'rgba(245,240,232,0.5)', marginBottom: 8, fontWeight: 500 }}>Energia no fim do dia</p>
            <div style={{ display: 'flex', gap: 8 }}>
              {[1,2,3,4,5].map(n => (
                <button key={n} onClick={() => setDiario(d => ({ ...d, energia_fim: n }))}
                  style={{ width: 36, height: 36, borderRadius: '50%', border: `1px solid ${diario.energia_fim === n ? '#C8A030' : 'rgba(245,240,232,0.15)'}`, background: diario.energia_fim === n ? '#C8A030' : 'transparent', color: diario.energia_fim === n ? '#0E0E0E' : 'rgba(245,240,232,0.5)', fontSize: 13, fontWeight: diario.energia_fim === n ? 600 : 400, cursor: 'pointer' }}>{n}</button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 12, color: 'rgba(245,240,232,0.5)', marginBottom: 8, fontWeight: 500 }}>Nota do dia</p>
            <div style={{ display: 'flex', gap: 8 }}>
              {[1,2,3,4,5].map(n => (
                <button key={n} onClick={() => setDiario(d => ({ ...d, nota_dia: n }))}
                  style={{ width: 36, height: 36, borderRadius: '50%', border: `1px solid ${diario.nota_dia === n ? '#C8A030' : 'rgba(245,240,232,0.15)'}`, background: diario.nota_dia === n ? '#C8A030' : 'transparent', color: diario.nota_dia === n ? '#0E0E0E' : 'rgba(245,240,232,0.5)', fontSize: 13, fontWeight: diario.nota_dia === n ? 600 : 400, cursor: 'pointer' }}>{n}</button>
              ))}
            </div>
          </div>
          <button onClick={salvarReflexaoNoite} disabled={salvandoNoite}
            style={{ width: '100%', padding: 13, background: salvoNoite ? '#27AE60' : 'rgba(200,160,48,0.9)', color: '#0E0E0E', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: salvandoNoite ? 'wait' : 'pointer', transition: 'background 0.2s', letterSpacing: '0.04em' }}>
            {salvandoNoite ? 'Salvando...' : salvoNoite ? '✓ Noite registrada!' : 'Registrar reflexão da noite'}
          </button>
        </div>

        {/* Card compartilhar */}
        <CardCompartilhar diario={diario} streak={streak} momento={momento} />

        {/* Gráfico de humor */}
        <GraficoHumor historico={historico} />

        {/* Histórico 30 dias */}
        <div style={{ background: '#fff', border: '1px solid var(--color-brand-border)', borderRadius: 12, padding: '20px 24px' }}>
          <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-brand-dark-green)', marginBottom: 4 }}>Meu histórico</p>
          <p style={{ fontSize: 12, color: 'var(--color-brand-gray)', marginBottom: 16 }}>Últimos 30 dias — clique num dia para ver o registro</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {Array.from({ length: 30 }).map((_, i) => {
              const d = new Date();
              d.setDate(d.getDate() - (29 - i));
              const dataStr = d.toISOString().split('T')[0];
              const registro = historico.find(h => h.data === dataStr);
              const isHoje = dataStr === hoje;
              return (
                <button key={dataStr} onClick={() => registro ? setDiaSelecionado(diaSelecionado?.data === dataStr ? null : registro) : null} title={dataStr}
                  style={{ width: 32, height: 32, borderRadius: '50%', border: 'none', cursor: registro ? 'pointer' : 'default', background: isHoje ? '#C8A030' : registro ? '#1E392A' : 'rgba(30,57,42,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: isHoje ? '0 0 10px rgba(200,160,48,0.4)' : 'none' }}>
                  {isHoje ? <span style={{ fontSize: 14 }}>🔥</span> : registro ? <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#C8A030" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> : null}
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
                {diaSelecionado.conquista && <p style={{ fontSize: 13, color: 'var(--color-brand-dark-green)', margin: 0 }}>✅ Conquista: <em>"{diaSelecionado.conquista}"</em></p>}
                {diaSelecionado.aprendizado && <p style={{ fontSize: 13, color: 'var(--color-brand-dark-green)', margin: 0 }}>📖 Aprendizado: <em>"{diaSelecionado.aprendizado}"</em></p>}
                {diaSelecionado.energia_fim && <p style={{ fontSize: 13, color: 'var(--color-brand-dark-green)', margin: 0 }}>🔋 Energia fim: <strong>{diaSelecionado.energia_fim}/5</strong></p>}
                {diaSelecionado.nota_dia && <p style={{ fontSize: 13, color: 'var(--color-brand-dark-green)', margin: 0 }}>⭐ Nota do dia: <strong>{diaSelecionado.nota_dia}/5</strong></p>}
                {diaSelecionado.missao_cumprida && <p style={{ fontSize: 13, color: '#27AE60', fontWeight: 600, margin: 0 }}>✓ Missão cumprida neste dia!</p>}
              </div>
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}