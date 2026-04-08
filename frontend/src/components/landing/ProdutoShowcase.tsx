'use client'

import { useState } from 'react'

type Tab = 'dashboard' | 'momento' | 'ancora' | 'ferramenta'

const TABS: { id: Tab; label: string; url: string }[] = [
  { id: 'dashboard',   label: 'Dashboard',       url: 'meukairos.com.br/dashboard' },
  { id: 'momento',     label: 'Momento Kairos',   url: 'meukairos.com.br/momento' },
  { id: 'ancora',      label: 'Visão Âncora',     url: 'meukairos.com.br/visao-ancora' },
  { id: 'ferramenta',  label: 'Ferramentas',      url: 'meukairos.com.br/ferramentas/raio-x' },
]

function ScreenDashboard() {
  return (
    <div style={{ display: 'flex', height: 360 }}>
      {/* Sidebar */}
      <div style={{ width: 56, background: '#0E0E0E', borderRight: '1px solid rgba(200,160,48,0.08)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 0', gap: 4, flexShrink: 0 }}>
        <span style={{ fontFamily: 'Georgia, serif', fontSize: 9, color: '#C8A030', letterSpacing: '.12em', writingMode: 'vertical-rl', transform: 'rotate(180deg)', marginBottom: 8 }}>KAIROS</span>
        {[
          <path key="a" d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" />,
          <path key="b" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />,
          <path key="c" d="M3 12h4v9H3zM10 7h4v14h-4zM17 3h4v18h-4z" />,
          <path key="d" d="M20 21v-2a4 4 0 00-8 0v2M12 11a4 4 0 100-8 4 4 0 000 8z" />,
        ].map((p, i) => (
          <div key={i} style={{ width: 36, height: 36, borderRadius: 8, background: i === 0 ? 'rgba(200,160,48,0.15)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={i === 0 ? '#C8A030' : 'rgba(245,240,232,0.35)'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{p}</svg>
          </div>
        ))}
      </div>

      {/* Main */}
      <div style={{ flex: 1, background: '#F8F4EE', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Topbar */}
        <div style={{ background: '#fff', borderBottom: '1px solid #E8E2D6', padding: '0 16px', height: 44, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 15, color: '#1A1A1A' }}>Kairos</span>
            <div style={{ width: 1, height: 14, background: '#E8E2D6' }} />
            <span style={{ fontSize: 11, color: '#888' }}>The Cockpit · Ter, 7 de Abr</span>
          </div>
          <span style={{ background: 'rgba(200,160,48,0.1)', border: '1px solid rgba(200,160,48,0.25)', borderRadius: 99, padding: '3px 10px', fontSize: 11, color: '#C8A030', fontWeight: 600 }}>13 dias 🔥</span>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Hero card */}
          <div style={{ background: '#0E0E0E', border: '1px solid rgba(200,160,48,0.2)', borderRadius: 10, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 9, color: 'rgba(200,160,48,0.6)', letterSpacing: '.14em', textTransform: 'uppercase', marginBottom: 4 }}>Sua Visão Âncora — F00</div>
              <div style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 13, color: '#F5F0E8', lineHeight: 1.3, maxWidth: 200 }}>"Em 2026 sou o profissional que transformou sua área de atuação"</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Georgia, serif', fontSize: 22, color: '#F5F0E8', lineHeight: 1 }}>86</div>
              <div style={{ fontSize: 9, color: '#C8A030', letterSpacing: '.1em', textTransform: 'uppercase' }}>Vitality</div>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
            {[['7', '/16', 'Ferramentas abertas'], ['44', '%', 'Progresso geral'], ['13', ' dias', 'Sequência atual']].map(([n, s, l]) => (
              <div key={l} style={{ background: '#fff', border: '1px solid #E8E2D6', borderRadius: 8, padding: '10px 12px' }}>
                <div style={{ fontFamily: 'Georgia, serif', fontSize: 20, color: '#1A1A1A', lineHeight: 1 }}>{n}<span style={{ fontSize: 12, color: '#888', fontFamily: 'sans-serif' }}>{s}</span></div>
                <div style={{ fontSize: 10, color: '#888', marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>

          {/* Phase progress */}
          <div style={{ background: '#fff', border: '1px solid #E8E2D6', borderRadius: 8, padding: '10px 12px' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#1A1A1A', marginBottom: 8 }}>Progresso por fase</div>
            {[['Fase 01 · Autoconhecimento', 75], ['Fase 02 · Visão e Metas', 40], ['Fase 03 · Hábitos', 20], ['Fase 04 · Crescimento', 5]].map(([l, p]) => (
              <div key={l as string} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                <div style={{ fontSize: 10, color: '#888', width: 140, flexShrink: 0 }}>{l as string}</div>
                <div style={{ flex: 1, height: 3, background: '#E8E2D6', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ width: `${p}%`, height: '100%', background: '#C8A030', borderRadius: 99 }} />
                </div>
                <div style={{ fontSize: 10, color: '#C8A030', fontWeight: 600, width: 28, textAlign: 'right' }}>{p}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function ScreenMomento() {
  const [sono, setSono] = useState(4)
  const [emocao, setEmocao] = useState('focado')
  const [cumprida, setCumprida] = useState(false)

  return (
    <div style={{ height: 360, overflow: 'auto', background: '#F8F4EE', display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: '#0E0E0E', padding: '14px 16px', flexShrink: 0 }}>
        <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 9, color: '#C8A030', letterSpacing: '.14em', textTransform: 'uppercase', marginBottom: 3 }}>Momento Kairos · Fase 01 — Terça, 7 de Abril</div>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: 16, color: '#F5F0E8', fontWeight: 400 }}>Bom dia, Davilson.</div>
      </div>
      <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        <div style={{ background: '#fff', borderLeft: '3px solid #C8A030', borderTop: '1px solid #E8E2D6', borderRight: '1px solid #E8E2D6', borderBottom: '1px solid #E8E2D6', borderRadius: '0 8px 8px 0', padding: '12px 14px' }}>
          <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 9, color: '#888', letterSpacing: '.14em', textTransform: 'uppercase', marginBottom: 6 }}>A voz do dia</div>
          <div style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 12, color: '#2A2520', lineHeight: 1.7 }}>"Sua visão precisa ser grande o suficiente para assustar um pouco. O desconforto que você sente não é sinal de que ela está errada — é sinal de que ela é real."</div>
        </div>
        <div style={{ background: 'rgba(200,160,48,0.06)', border: '1px solid rgba(200,160,48,0.2)', borderRadius: 8, padding: '10px 12px' }}>
          <div style={{ fontSize: 11, color: '#4A4540', lineHeight: 1.6, marginBottom: 4 }}>Ora, àquele que é poderoso para fazer tudo muito mais abundantemente além do que pedimos ou pensamos.</div>
          <div style={{ fontSize: 10, color: '#C8A030', fontWeight: 600 }}>Efésios 3:20 — TPT</div>
        </div>
        <div style={{ background: '#fff', border: '1px solid #E8E2D6', borderRadius: 8, padding: '10px 12px' }}>
          <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 9, color: '#C8A030', letterSpacing: '.14em', textTransform: 'uppercase', marginBottom: 5 }}>Sua missão de hoje</div>
          <div style={{ fontSize: 11, color: '#2A2520', lineHeight: 1.6, marginBottom: 8 }}>Expanda sua visão: o que você acrescentaria se soubesse que não podia falhar?</div>
          <button onClick={() => setCumprida(true)} style={{ width: '100%', background: cumprida ? '#27AE60' : '#C8A030', color: '#0E0E0E', border: 'none', borderRadius: 6, padding: '7px 12px', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
            {cumprida ? '✓ Missão cumprida!' : 'Marcar como cumprida'}
          </button>
        </div>
        <div style={{ background: '#fff', border: '1px solid #E8E2D6', borderRadius: 8, padding: '10px 12px' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#1A1A1A', marginBottom: 8 }}>Registro da manhã</div>
          <div style={{ fontSize: 10, color: '#888', marginBottom: 5 }}>Como dormi?</div>
          <div style={{ display: 'flex', gap: 5 }}>
            {[1,2,3,4,5].map(n => (
              <button key={n} onClick={() => setSono(n)} style={{ width: 28, height: 28, borderRadius: '50%', border: `1px solid ${sono === n ? '#C8A030' : '#E8E2D6'}`, background: sono === n ? '#C8A030' : 'transparent', color: sono === n ? '#0E0E0E' : '#888', fontSize: 10, fontWeight: sono === n ? 700 : 400, cursor: 'pointer' }}>{n}</button>
            ))}
          </div>
          <div style={{ fontSize: 10, color: '#888', margin: '8px 0 5px' }}>Como estou agora?</div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {['focado', 'animado', 'grato', 'cansado'].map(e => (
              <button key={e} onClick={() => setEmocao(e)} style={{ padding: '3px 9px', borderRadius: 99, fontSize: 10, border: `1px solid ${emocao === e ? 'rgba(200,160,48,0.4)' : '#E8E2D6'}`, background: emocao === e ? 'rgba(200,160,48,0.12)' : 'transparent', color: emocao === e ? '#854F0B' : '#888', cursor: 'pointer' }}>{e}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function ScreenAncora() {
  return (
    <div style={{ height: 360, overflow: 'auto', background: '#F8F4EE', display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: '#0E0E0E', padding: '14px 16px', flexShrink: 0 }}>
        <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 9, color: '#C8A030', letterSpacing: '.14em', textTransform: 'uppercase', marginBottom: 3 }}>F00 · Visão Âncora</div>
        <div style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 15, color: '#F5F0E8' }}>O documento mais importante da sua jornada</div>
      </div>
      <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ background: '#fff', border: '1px solid #E8E2D6', borderRadius: 8, padding: '12px 14px' }}>
          <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 9, color: '#C8A030', letterSpacing: '.14em', textTransform: 'uppercase', marginBottom: 6 }}>Minha manchete de vida</div>
          <div style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 14, color: '#1A1A1A', lineHeight: 1.4 }}>"Em 2026, sou o profissional que transformou sua área de atuação e vive com propósito real."</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[
            ['O que me dá energia', 'Criar sistemas que ajudam pessoas a viver com mais clareza'],
            ['O que tira meu sono', 'Chegar em 2027 sem ter construído nada que dure'],
            ['Minha declaração', 'Vivo com intenção, sirvo com excelência e construo com legado'],
            ['Meu pedido mais profundo', 'Ter impacto real na vida de pessoas que precisam de direção'],
          ].map(([l, v]) => (
            <div key={l} style={{ background: '#fff', border: '1px solid #E8E2D6', borderRadius: 8, padding: '10px 12px' }}>
              <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 9, color: '#888', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '.08em' }}>{l}</div>
              <div style={{ fontSize: 11, color: '#2A2520', lineHeight: 1.5 }}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{ background: 'rgba(200,160,48,0.06)', border: '1px solid rgba(200,160,48,0.2)', borderRadius: 8, padding: '10px 12px', fontSize: 11, color: '#4A4540', lineHeight: 1.6 }}>
          ✦ A Visão Âncora é o primeiro passo da jornada — leva 60 minutos e ancora todas as suas decisões pelos próximos 12 meses.
        </div>
      </div>
    </div>
  )
}

function ScreenFerramenta() {
  return (
    <div style={{ display: 'flex', height: 360 }}>
      {/* Sidebar */}
      <div style={{ width: 160, background: '#0E0E0E', borderRight: '1px solid rgba(200,160,48,0.08)', padding: '12px 0', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '8px 14px 10px', borderBottom: '1px solid rgba(200,160,48,0.1)', marginBottom: 6 }}>
          <div style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 13, color: '#F5F0E8' }}>Kairos</div>
          <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 8, color: '#C8A030', letterSpacing: '.1em', marginTop: 1 }}>F01 · RAIO-X 360°</div>
        </div>
        {[
          { label: 'Bem-vindo', done: true, active: false },
          { label: 'Avalie as Áreas', done: false, active: true },
          { label: 'Visualize', done: false, active: false },
          { label: 'Próximos Passos', done: false, active: false },
        ].map((e, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 14px', background: e.active ? 'rgba(200,160,48,0.1)' : 'transparent' }}>
            <div style={{ width: 18, height: 18, borderRadius: '50%', border: `1.5px solid ${e.done || e.active ? '#C8A030' : 'rgba(200,160,48,0.3)'}`, background: e.done ? 'rgba(200,160,48,0.2)' : e.active ? 'rgba(200,160,48,0.9)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: e.active ? '#0E0E0E' : '#C8A030', fontWeight: 700, flexShrink: 0 }}>
              {e.done ? '✓' : i + 1}
            </div>
            <span style={{ fontSize: 11, color: e.active ? '#F5F0E8' : 'rgba(245,240,232,0.5)', fontWeight: e.active ? 600 : 400 }}>{e.label}</span>
          </div>
        ))}
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ background: '#fff', borderBottom: '1px solid #E8E2D6', padding: '8px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <span style={{ fontSize: 11, color: '#888' }}>Ferramentas › <span style={{ color: '#C8A030', fontWeight: 600 }}>Raio-X 360°</span></span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 80, height: 3, background: '#E8E2D6', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ width: '33%', height: '100%', background: '#C8A030' }} />
            </div>
            <span style={{ fontSize: 10, color: '#C8A030', fontWeight: 600 }}>33%</span>
          </div>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: 14, background: '#F8F4EE' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(200,160,48,0.1)', border: '1px solid rgba(200,160,48,0.25)', borderRadius: 99, padding: '4px 10px', fontSize: 10, color: '#C8A030', fontFamily: 'DM Mono, monospace', marginBottom: 10 }}>F01 · Diagnóstico das 8 áreas</div>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: 18, color: '#1A1A1A', marginBottom: 4 }}>Raio-X 360°</div>
          <div style={{ fontSize: 11, color: '#888', marginBottom: 12, lineHeight: 1.5 }}>Diagnóstico completo de onde você está hoje em todas as áreas da sua vida.</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
            {[['💪', 'Saúde & Corpo', 'Movimento, sono e alimentação'], ['💼', 'Carreira', 'Propósito e crescimento'], ['💰', 'Finanças', 'Controle e planejamento'], ['🤝', 'Relacionamentos', 'Conexões que importam']].map(([ic, t, d]) => (
              <div key={t} style={{ background: '#fff', border: '1px solid #E8E2D6', borderRadius: 8, padding: 10 }}>
                <div style={{ fontSize: 16, marginBottom: 4 }}>{ic}</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#1A1A1A', marginBottom: 2 }}>{t}</div>
                <div style={{ fontSize: 10, color: '#888', lineHeight: 1.4 }}>{d}</div>
              </div>
            ))}
          </div>
          <div style={{ background: 'rgba(200,160,48,0.06)', border: '1px solid rgba(200,160,48,0.2)', borderRadius: 8, padding: 10, fontSize: 11, color: '#4A4540', lineHeight: 1.6 }}>
            💡 Cada ferramenta te conduz passo a passo — sem tela em branco. Progresso salvo automaticamente.
          </div>
        </div>
      </div>
    </div>
  )
}

export function ProdutoShowcase() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')

  const screens: Record<Tab, JSX.Element> = {
    dashboard: <ScreenDashboard />,
    momento: <ScreenMomento />,
    ancora: <ScreenAncora />,
    ferramenta: <ScreenFerramenta />,
  }

  const currentUrl = TABS.find(t => t.id === activeTab)?.url ?? ''

  return (
    <section style={{ background: '#0E0E0E', padding: '5rem 1.5rem' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div className="section-label">Produto</div>
          <h2 className="section-title">Veja o Kairos <em>por dentro</em></h2>
          <p style={{ color: '#AAA49A', fontSize: '.95rem', maxWidth: 520, margin: '.75rem auto 0', lineHeight: 1.85 }}>
            Seu painel de controle pessoal — tudo em um lugar, acessível em qualquer dispositivo.
          </p>
        </div>

        {/* Browser frame */}
        <div style={{ background: '#111', border: '1px solid rgba(200,160,48,0.2)', borderRadius: 12, overflow: 'hidden', maxWidth: 900, margin: '0 auto' }}>

          {/* Browser bar */}
          <div style={{ background: '#1A1A1A', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid rgba(200,160,48,0.1)' }}>
            <div style={{ display: 'flex', gap: 6 }}>
              {['#ff5f56','#ffbd2e','#27c93f'].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
            </div>
            <div style={{ background: '#0E0E0E', border: '1px solid rgba(200,160,48,0.15)', borderRadius: 6, padding: '4px 12px', fontFamily: 'DM Mono, monospace', fontSize: 11, color: 'rgba(200,160,48,0.6)', flex: 1, textAlign: 'center' }}>
              {currentUrl}
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 2, padding: '0 12px', background: '#111', borderBottom: '1px solid rgba(200,160,48,0.1)', overflowX: 'auto' }}>
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '8px 14px',
                  fontSize: 11,
                  cursor: 'pointer',
                  color: activeTab === tab.id ? '#F5F0E8' : 'rgba(245,240,232,0.4)',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: `2px solid ${activeTab === tab.id ? '#C8A030' : 'transparent'}`,
                  whiteSpace: 'nowrap' as const,
                  fontFamily: 'DM Sans, sans-serif',
                  transition: 'color .2s',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Screen */}
          <div key={activeTab} style={{ animation: 'fadeInUp .25s ease' }}>
            {screens[activeTab]}
          </div>
        </div>

        {/* Features */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginTop: '3rem' }}>
          {[
            { icon: '⚡', title: '16 ferramentas guiadas', desc: 'Cada ferramenta conduz você passo a passo, sem tela em branco e sem confusão.' },
            { icon: '☀️', title: 'Momento Kairos diário', desc: 'Reflexão, versículo e missão do dia — um ritual que transforma sua manhã.' },
            { icon: '💾', title: 'Progresso salvo', desc: 'Continue exatamente de onde parou, em qualquer momento e dispositivo.' },
          ].map(f => (
            <div key={f.title} style={{ textAlign: 'center' }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(200,160,48,0.1)', border: '1px solid rgba(200,160,48,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: 20 }}>{f.icon}</div>
              <div style={{ fontSize: '.9rem', fontWeight: 600, color: '#F5F0E8', marginBottom: '.35rem' }}>{f.title}</div>
              <div style={{ fontSize: '.8rem', color: '#888', lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  )
}
