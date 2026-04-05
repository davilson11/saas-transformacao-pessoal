'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useSupabaseClient } from '@/lib/useSupabaseClient';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import type { MomentoKairos, DiarioKairos } from '@/lib/database.types';

const EMOCOES = ['animado', 'focado', 'grato', 'cansado', 'ansioso', 'tranquilo'];

const MOMENTO_EXEMPLO: MomentoKairos = {
  id: '1',
  data: new Date().toISOString().split('T')[0],
  fase: 1,
  voz_texto: 'Eu não te coloquei nessa jornada para que você apenas sobreviva a ela — te coloquei para que você a domine. O autoconhecimento que estás buscando não é um luxo, é uma arma. Quem conhece a si mesmo não pode ser facilmente derrubado. Levanta. Olha fundo. O que você vai encontrar dentro de você vai surpreender até a você mesmo.',
  versiculo: 'Pois tu mesmo criaste as minhas entranhas; tu me teceste no ventre de minha mãe. Graças te dou pelo fato de eu ser uma criação tão admirável.',
  versiculo_ref: 'Salmos 139:13-14 — TPT',
  missao: 'Pegue um papel e escreva 3 coisas que você descobriu sobre si mesmo desde que começou o Kairos. Não pense muito — escreva o que vier primeiro.',
  created_at: new Date().toISOString(),
};

export default function MomentoPage() {
  const { user } = useUser();
  const { getClient } = useSupabaseClient();

  const [momento] = useState<MomentoKairos>(MOMENTO_EXEMPLO);
  const [diario, setDiario] = useState<Partial<DiarioKairos>>({});
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const hoje = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      const client = await getClient();
      const { data } = await client
        .from('diario_kairos')
        .select('*')
        .eq('user_id', user.id)
        .eq('data', hoje)
        .single();
      if (data) setDiario(data);
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
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setDiario(d => ({ ...d, missao_cumprida: true }))}
              style={{ flex: 1, padding: '9px', borderRadius: 8, fontSize: 13, cursor: 'pointer', background: diario.missao_cumprida ? '#C8A030' : 'transparent', color: diario.missao_cumprida ? '#0E0E0E' : 'var(--color-brand-dark-green)', border: `1px solid ${diario.missao_cumprida ? '#C8A030' : 'var(--color-brand-border)'}`, fontWeight: diario.missao_cumprida ? 600 : 400 }}
            >
              {diario.missao_cumprida ? '✓ Missão cumprida!' : 'Marcar como cumprida'}
            </button>
          </div>
        </div>

        {/* Diário */}
        <div style={{ background: '#fff', border: '1px solid var(--color-brand-border)', borderRadius: 12, padding: '20px 24px' }}>
          <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-brand-dark-green)', marginBottom: 16 }}>Meu diário de hoje</p>

          {/* Sono */}
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

          {/* Emoção */}
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

          {/* Preocupação */}
          <div style={{ marginBottom: 14 }}>
            <p style={{ fontSize: 12, color: 'var(--color-brand-gray)', marginBottom: 6, fontWeight: 500 }}>O que está pesando na sua mente hoje?</p>
            <textarea rows={3} value={diario.preocupacao ?? ''} onChange={e => setDiario(d => ({ ...d, preocupacao: e.target.value }))}
              placeholder="Escreva livremente..."
              style={{ width: '100%', fontSize: 14, resize: 'none', borderRadius: 8, padding: '10px 12px', border: '1px solid var(--color-brand-border)', fontFamily: 'var(--font-body)', color: 'var(--color-brand-dark-green)', background: 'rgba(30,57,42,0.02)', outline: 'none', boxSizing: 'border-box' }} />
          </div>

          {/* Gratidão */}
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 12, color: 'var(--color-brand-gray)', marginBottom: 6, fontWeight: 500 }}>Pelo que sou grato hoje?</p>
            <textarea rows={3} value={diario.gratidao ?? ''} onChange={e => setDiario(d => ({ ...d, gratidao: e.target.value }))}
              placeholder="Pelo menos uma coisa..."
              style={{ width: '100%', fontSize: 14, resize: 'none', borderRadius: 8, padding: '10px 12px', border: '1px solid var(--color-brand-border)', fontFamily: 'var(--font-body)', color: 'var(--color-brand-dark-green)', background: 'rgba(30,57,42,0.02)', outline: 'none', boxSizing: 'border-box' }} />
          </div>

          {/* Botão salvar */}
          <button onClick={salvarDiario} disabled={salvando}
            style={{ width: '100%', padding: 13, background: salvo ? '#27AE60' : '#0E0E0E', color: '#F5F0E8', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: salvando ? 'wait' : 'pointer', transition: 'background 0.2s', letterSpacing: '0.04em' }}>
            {salvando ? 'Salvando...' : salvo ? '✓ Diário registrado!' : 'Registrar meu dia'}
          </button>
        </div>

      </div>
    </DashboardLayout>
  );
}
