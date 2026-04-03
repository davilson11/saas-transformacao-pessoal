// Sem 'use client' — componente puramente estático

const GOLD  = '#C8A030';
const DARK  = '#0E0E0E';
const FRAME = '#1A1A1A';

// ─── Mini dashboard simulado ─────────────────────────────────────────────────

function SimulatedDashboard() {
  const navItems = ['⊞', '🔧', '📊', '👤', '⚙'];
  const tools = [
    { code: 'F01', name: 'Raio-X 360°',       pct: 100, done: true  },
    { code: 'F02', name: 'Bússola de Valores', pct: 100, done: true  },
    { code: 'F03', name: 'SWOT Pessoal',       pct:  60, done: false },
    { code: 'F04', name: 'OKRs Pessoais',      pct:   0, done: false },
  ];

  return (
    <div style={{
      display: 'flex',
      height: '100%',
      background: DARK,
      overflow: 'hidden',
      fontFamily: "'DM Sans', sans-serif",
    }}>

      {/* Sidebar */}
      <div style={{
        width: 52,
        flexShrink: 0,
        background: '#0E0E0E',
        borderRight: '1px solid rgba(200,160,48,0.12)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: 12,
        gap: 2,
      }}>
        {/* Logo dot */}
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 7, color: '#F5F0E8', letterSpacing: '0.18em', textAlign: 'center', lineHeight: 1 }}>
            K
          </div>
          <div style={{ width: 4, height: 4, borderRadius: '50%', background: GOLD, margin: '3px auto 0' }} />
        </div>
        {navItems.map((icon, i) => (
          <div
            key={i}
            style={{
              width: 38,
              height: 38,
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              background: i === 0 ? 'rgba(200,160,48,0.15)' : 'transparent',
              borderLeft: i === 0 ? `2px solid ${GOLD}` : '2px solid transparent',
              color: i === 0 ? GOLD : 'rgba(245,240,232,0.35)',
            }}
          >
            {icon}
          </div>
        ))}
      </div>

      {/* Conteúdo principal */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Topbar */}
        <div style={{
          height: 36,
          flexShrink: 0,
          background: '#111111',
          borderBottom: '1px solid rgba(200,160,48,0.10)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 14px',
          gap: 10,
        }}>
          <span style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 11, color: GOLD }}>Kairos</span>
          {/* Search simulado */}
          <div style={{
            flex: 1,
            maxWidth: 140,
            height: 20,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            paddingLeft: 7,
            gap: 5,
          }}>
            <span style={{ fontSize: 8, color: 'rgba(245,240,232,0.3)' }}>🔍</span>
            <span style={{ fontSize: 8, color: 'rgba(245,240,232,0.25)' }}>Buscar ferramenta...</span>
          </div>
          <div style={{
            fontSize: 8,
            color: GOLD,
            background: 'rgba(200,160,48,0.12)',
            border: `1px solid rgba(200,160,48,0.22)`,
            borderRadius: 99,
            padding: '2px 7px',
            whiteSpace: 'nowrap',
          }}>
            🔥 14 dias
          </div>
        </div>

        {/* Área de conteúdo */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>

          {/* Hero card — Visão Âncora */}
          <div style={{
            background: '#0E0E0E',
            border: '1px solid rgba(200,160,48,0.22)',
            borderRadius: 10,
            padding: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 7, color: 'rgba(245,244,240,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 5 }}>
                Sua Visão Âncora — F00
              </div>
              <div style={{
                fontFamily: 'Georgia, serif',
                fontStyle: 'italic',
                fontSize: 10,
                color: '#F5F0E8',
                lineHeight: 1.35,
              }}>
                &ldquo;Em 2026, sou o profissional que<br />transformou sua área de atuação&rdquo;
              </div>
            </div>
            {/* Mini ring */}
            <div style={{ flexShrink: 0, textAlign: 'center' }}>
              <svg width="38" height="38" viewBox="0 0 38 38" fill="none" style={{ transform: 'rotate(-90deg)', display: 'block' }}>
                <circle cx="19" cy="19" r="14" stroke="rgba(255,255,255,0.08)" strokeWidth="4" fill="none" />
                <circle cx="19" cy="19" r="14" stroke={GOLD} strokeWidth="4" fill="none"
                  strokeLinecap="round"
                  strokeDasharray={String(2 * Math.PI * 14)}
                  strokeDashoffset={String(2 * Math.PI * 14 * 0.14)}
                />
              </svg>
              <div style={{
                marginTop: -28,
                fontFamily: 'monospace',
                fontSize: 8,
                fontWeight: 700,
                color: GOLD,
                textAlign: 'center',
                position: 'relative',
                zIndex: 1,
                lineHeight: 38 / 10 + 'px',
              }}>
                86
              </div>
            </div>
          </div>

          {/* Grid: stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {[
              { label: 'Concluídas', val: '7', sub: '/ 16 ferramentas' },
              { label: 'Progresso',  val: '44%', sub: 'geral do programa' },
            ].map((s) => (
              <div key={s.label} style={{
                background: '#1A1A1A',
                border: '1px solid rgba(200,160,48,0.14)',
                borderRadius: 8,
                padding: '8px 10px',
              }}>
                <div style={{ fontSize: 7, color: 'rgba(245,240,232,0.4)', marginBottom: 3 }}>{s.label}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: GOLD, lineHeight: 1 }}>{s.val}</div>
                <div style={{ fontSize: 6.5, color: 'rgba(245,240,232,0.3)', marginTop: 2 }}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Lista de ferramentas */}
          <div style={{
            background: '#1A1A1A',
            border: '1px solid rgba(200,160,48,0.12)',
            borderRadius: 10,
            overflow: 'hidden',
          }}>
            <div style={{ padding: '8px 10px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 9, color: GOLD }}>
                Fase 01 — Autoconhecimento
              </span>
            </div>
            {tools.map((t, i) => (
              <div key={t.code} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                padding: '6px 10px',
                borderBottom: i < tools.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              }}>
                <span style={{
                  fontFamily: 'monospace',
                  fontSize: 7,
                  fontWeight: 700,
                  color: GOLD,
                  background: 'rgba(200,160,48,0.1)',
                  padding: '1px 5px',
                  borderRadius: 99,
                  flexShrink: 0,
                }}>
                  {t.code}
                </span>
                <span style={{ fontSize: 8, color: '#F5F0E8', flex: 1 }}>{t.name}</span>
                <div style={{ width: 40, height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 99, overflow: 'hidden', flexShrink: 0 }}>
                  <div style={{ height: '100%', width: `${t.pct}%`, background: t.done ? '#27AE60' : GOLD, borderRadius: 99 }} />
                </div>
                {t.done && (
                  <span style={{ fontSize: 7, color: '#27AE60', flexShrink: 0 }}>✓</span>
                )}
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}

// ─── Browser frame ────────────────────────────────────────────────────────────

function BrowserFrame() {
  return (
    <div style={{
      background: FRAME,
      border: '1px solid rgba(200,160,48,0.30)',
      borderRadius: 12,
      overflow: 'hidden',
      boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(200,160,48,0.10)',
    }}>
      {/* Barra do browser */}
      <div style={{
        height: 38,
        background: '#222222',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '0 14px',
        flexShrink: 0,
      }}>
        {/* Traffic lights */}
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          {['#FF5F57', '#FEBC2E', '#28C840'].map((c, i) => (
            <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c, opacity: 0.9 }} />
          ))}
        </div>

        {/* Barra de endereço */}
        <div style={{
          flex: 1,
          maxWidth: 280,
          margin: '0 auto',
          height: 22,
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 5,
        }}>
          <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
            <path d="M6 1a5 5 0 1 0 0 10A5 5 0 0 0 6 1zM2 6a4 4 0 0 1 4-4v8a4 4 0 0 1-4-4z" fill="rgba(200,160,48,0.6)" />
          </svg>
          <span style={{ fontSize: 10, color: 'rgba(245,240,232,0.55)', fontFamily: 'monospace' }}>
            meukairos.com.br/dashboard
          </span>
        </div>
      </div>

      {/* Conteúdo do dashboard */}
      <div style={{ height: 380 }}>
        <SimulatedDashboard />
      </div>
    </div>
  );
}

// ─── Mini cards de benefícios ─────────────────────────────────────────────────

const MINI_CARDS = [
  {
    icon: '🔧',
    title: '16 Ferramentas Guiadas',
    desc: 'Cada ferramenta te conduz passo a passo, sem tela em branco.',
  },
  {
    icon: '💾',
    title: 'Progresso Salvo',
    desc: 'Continue exatamente de onde parou, em qualquer momento.',
  },
  {
    icon: '📱',
    title: 'Qualquer Dispositivo',
    desc: 'Acesse pelo celular, tablet ou computador sem perder nada.',
  },
];

// ─── Componente principal ─────────────────────────────────────────────────────

export function ProdutoEmAcao() {
  return (
    <section
      style={{
        background: DARK,
        padding: 'clamp(64px, 8vw, 100px) clamp(20px, 5vw, 80px)',
      }}
    >
      <div style={{ maxWidth: 900, margin: '0 auto' }}>

        {/* Título */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <span style={{
            display: 'inline-block',
            fontFamily: "'DM Mono', monospace",
            fontSize: 11,
            fontWeight: 600,
            color: GOLD,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            marginBottom: 14,
            background: 'rgba(200,160,48,0.10)',
            border: '1px solid rgba(200,160,48,0.22)',
            padding: '4px 14px',
            borderRadius: 99,
          }}>
            Produto
          </span>
          <h2 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontStyle: 'italic',
            fontWeight: 400,
            fontSize: 'clamp(26px, 4vw, 40px)',
            color: '#F5F0E8',
            lineHeight: 1.15,
            margin: '0 0 14px',
          }}>
            Veja o Kairos por dentro
          </h2>
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 'clamp(14px, 1.8vw, 17px)',
            color: 'rgba(245,244,240,0.55)',
            lineHeight: 1.65,
            maxWidth: 480,
            margin: '0 auto',
          }}>
            Seu painel de controle pessoal — tudo em um lugar
          </p>
        </div>

        {/* Browser frame */}
        <BrowserFrame />

        {/* Mini cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
          marginTop: 32,
        }}>
          {MINI_CARDS.map((card) => (
            <div
              key={card.title}
              style={{
                background: '#141414',
                border: '1px solid rgba(200,160,48,0.18)',
                borderRadius: 12,
                padding: '18px 20px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 14,
              }}
            >
              <div style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: 'rgba(200,160,48,0.10)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                flexShrink: 0,
              }}>
                {card.icon}
              </div>
              <div>
                <p style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 13,
                  fontWeight: 700,
                  color: '#F5F0E8',
                  margin: '0 0 4px',
                  lineHeight: 1.3,
                }}>
                  {card.title}
                </p>
                <p style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 12,
                  color: 'rgba(245,244,240,0.45)',
                  margin: 0,
                  lineHeight: 1.55,
                }}>
                  {card.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
