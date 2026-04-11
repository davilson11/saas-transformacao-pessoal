'use client';

import { useState, useEffect, useRef, createContext, useContext } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton, useAuth, useUser } from '@clerk/nextjs';
import { useSupabaseClient } from '@/lib/useSupabaseClient';
import { buscarTodasRespostas } from '@/lib/queries';

// ─── Modo Foco Context ────────────────────────────────────────────────────────

export const ModoFocoContext = createContext(false);
export function useModoFoco() { return useContext(ModoFocoContext); }

// ─── Ferramentas para busca ───────────────────────────────────────────────────

const TOOLS_LIST = [
  { codigo: 'F01', nome: 'Raio-X 360°',              slug: 'raio-x' },
  { codigo: 'F02', nome: 'Bússola de Valores',        slug: 'bussola-valores' },
  { codigo: 'F03', nome: 'SWOT Pessoal',              slug: 'swot-pessoal' },
  { codigo: 'F04', nome: 'Feedback 360°',             slug: 'feedback-360' },
  { codigo: 'F05', nome: 'OKRs Pessoais',             slug: 'okrs-pessoais' },
  { codigo: 'F06', nome: 'Design de Vida',            slug: 'design-vida' },
  { codigo: 'F07', nome: 'DRE Pessoal',               slug: 'dre-pessoal' },
  { codigo: 'F08', nome: 'Rotina Ideal',              slug: 'rotina-ideal' },
  { codigo: 'F09', nome: 'Auditoria de Tempo',        slug: 'auditoria-tempo' },
  { codigo: 'F10', nome: 'Arquiteto de Rotinas',      slug: 'arquiteto-rotinas' },
  { codigo: 'F11', nome: 'Sprint de Aprendizado',     slug: 'sprint-aprendizado' },
  { codigo: 'F12', nome: 'Energia e Vitalidade',      slug: 'energia-vitalidade' },
  { codigo: 'F13', nome: 'Desconstrutor de Crenças',  slug: 'desconstrutor-crencas' },
  { codigo: 'F14', nome: 'CRM de Relacionamentos',    slug: 'crm-relacionamentos' },
  { codigo: 'F15', nome: 'Diário de Bordo',           slug: 'diario-bordo' },
  { codigo: 'F16', nome: 'Prevenção de Recaída',      slug: 'prevencao-recaida' },
];

// ─── SVG Icons ────────────────────────────────────────────────────────────────

function IconDashboard() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="1" y="1" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <rect x="10" y="1" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <rect x="1" y="10" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <rect x="10" y="10" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function IconFerramentas() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M11.5 2.5a4 4 0 0 1 0 5.66l-6.5 6.5a1.5 1.5 0 0 1-2.12-2.12L9.34 6A4 4 0 0 1 11.5 2.5Z"
        stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="13" cy="13" r="2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function IconProgresso() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="1" y="11" width="4" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="7" y="7" width="4" height="10" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="13" y="3" width="4" height="14" rx="1" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function IconPerfil() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="6" r="3.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2 16c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconDiario() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="3" y="1.5" width="12" height="15" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 5.5h6M6 8.5h6M6 11.5h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconMomento() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M9 2v2M9 14v2M2 9h2M14 9h2M4.22 4.22l1.42 1.42M12.36 12.36l1.42 1.42M4.22 13.78l1.42-1.42M12.36 5.64l1.42-1.42"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="9" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 10l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconFoco({ active }: { active: boolean }) {
  return active ? (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <circle cx="7.5" cy="7.5" r="2.5" fill="currentColor" />
      <path d="M1 1l4 4M14 1l-4 4M1 14l4-4M14 14l-4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ) : (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <circle cx="7.5" cy="7.5" r="2.5" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="7.5" cy="7.5" r="6" stroke="currentColor" strokeWidth="1.2" strokeDasharray="2 2" />
    </svg>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getSaudacao(hora: number): string {
  if (hora >= 5 && hora < 12) return 'Bom dia';
  if (hora >= 12 && hora < 18) return 'Boa tarde';
  return 'Boa noite';
}

// ─── Nav config ───────────────────────────────────────────────────────────────

const PRIMARY_NAV = [
  { label: 'Dashboard',   href: '/dashboard',                  icon: <IconDashboard />,  exact: true  },
  { label: 'Ferramentas', href: '/ferramentas',                icon: <IconFerramentas />, exact: false },
  { label: 'Diário',      href: '/ferramentas/diario-bordo',   icon: <IconDiario />,     exact: false },
  { label: 'Progresso',   href: '/progresso',                  icon: <IconProgresso />,  exact: true  },
];

const SECONDARY_NAV = [
  { label: 'Perfil',   href: '/perfil',   icon: <IconPerfil />,   exact: true },
  { label: 'Momento',  href: '/momento',  icon: <IconMomento />,  exact: true },
];

// ─── Search bar ───────────────────────────────────────────────────────────────

function SearchBar() {
  const [query, setQuery] = useState('');
  const [open, setOpen]   = useState(false);
  const ref               = useRef<HTMLDivElement>(null);

  const results = query.trim().length > 0
    ? TOOLS_LIST.filter(
        (t) =>
          t.nome.toLowerCase().includes(query.toLowerCase()) ||
          t.codigo.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 6)
    : [];

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative', flex: '0 1 280px', minWidth: 0 }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        background: 'rgba(255,255,255,0.05)',
        border: `1px solid ${open ? 'rgba(200,160,48,0.45)' : 'rgba(255,255,255,0.09)'}`,
        borderRadius: 10, padding: '0 12px', height: 34,
        transition: 'border-color 0.15s',
      }}>
        <span style={{ color: 'rgba(245,240,232,0.35)', flexShrink: 0 }}><IconSearch /></span>
        <input
          type="text" value={query} placeholder="Buscar ferramenta..."
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            fontFamily: 'var(--font-body)', fontSize: 12, color: '#F5F0E8', minWidth: 0,
          }}
        />
        {query && (
          <button onClick={() => { setQuery(''); setOpen(false); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(245,240,232,0.3)', fontSize: 13, lineHeight: 1, padding: 0, flexShrink: 0 }}
            aria-label="Limpar busca">✕</button>
        )}
      </div>

      {open && results.length > 0 && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
          background: '#1A1A1A', border: '1px solid rgba(200,160,48,0.25)',
          borderRadius: 12, overflow: 'hidden',
          boxShadow: '0 16px 40px rgba(0,0,0,0.5)', zIndex: 200,
        }}>
          {results.map((tool) => (
            <Link key={tool.slug} href={`/ferramentas/${tool.slug}`}
              onClick={() => { setQuery(''); setOpen(false); }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.1s' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(200,160,48,0.08)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: '#C8A030', background: 'rgba(200,160,48,0.12)', padding: '2px 7px', borderRadius: 99, flexShrink: 0 }}>
                {tool.codigo}
              </span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#F5F0E8', flex: 1 }}>{tool.nome}</span>
              <span style={{ fontSize: 10, color: 'rgba(245,240,232,0.3)', flexShrink: 0 }}>→</span>
            </Link>
          ))}
        </div>
      )}

      {open && query.trim().length > 0 && results.length === 0 && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
          background: '#1A1A1A', border: '1px solid rgba(200,160,48,0.15)',
          borderRadius: 12, padding: '14px', textAlign: 'center', zIndex: 200,
        }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(245,240,232,0.4)' }}>
            Nenhuma ferramenta encontrada
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div style={{ display: 'flex', overflow: 'hidden', height: '100dvh', background: '#0E0E0E' }}>
      <aside style={{ width: 72, background: '#0E0E0E', borderRight: '1px solid rgba(200,160,48,0.08)', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 16, gap: 4 }}>
        <div style={{ width: 36, height: 10, background: 'rgba(200,160,48,0.12)', borderRadius: 2, marginBottom: 12 }} />
        {[...Array(5)].map((_, i) => (
          <div key={i} style={{ width: 52, height: 52, background: 'rgba(255,255,255,0.04)', borderRadius: 12 }} />
        ))}
      </aside>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{ height: 54, background: '#111111', borderBottom: '1px solid rgba(200,160,48,0.12)' }} />
        <main style={{ flex: 1, padding: 24, background: '#0E0E0E' }}>
          <div style={{ width: 220, height: 24, background: 'rgba(200,160,48,0.1)', borderRadius: 4, marginBottom: 8 }} />
          <div style={{ width: 300, height: 14, background: 'rgba(255,255,255,0.06)', borderRadius: 4, marginBottom: 24 }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{ height: 80, background: '#1A1A1A', border: '1px solid rgba(200,160,48,0.12)', borderRadius: 16 }} />
            ))}
          </div>
          <div style={{ height: 200, background: '#1A1A1A', border: '1px solid rgba(200,160,48,0.12)', borderRadius: 16 }} />
        </main>
      </div>
    </div>
  );
}

// ─── Layout principal ─────────────────────────────────────────────────────────

interface DashboardLayoutProps {
  children?: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isLoaded } = useAuth();
  const { user }     = useUser();
  const pathname     = usePathname();
  const { getClient } = useSupabaseClient();

  const [pendingCount,  setPendingCount]  = useState<number | null>(null);
  const [streakDiario,  setStreakDiario]  = useState(0);
  const [diarioHoje,    setDiarioHoje]    = useState<boolean | null>(null);
  const [modoFoco,      setModoFoco]      = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      const client = await getClient();
      // Ferramentas pendentes
      const respostas = await buscarTodasRespostas(user.id, client);
      const concluidas = respostas.filter((r) => r.concluida).length;
      setPendingCount(16 - concluidas);

      // Diário — streak + hoje
      const hoje = new Date().toISOString().split('T')[0];
      const { data: hist } = await client
        .from('diario_kairos')
        .select('data')
        .eq('user_id', user.id)
        .order('data', { ascending: false })
        .limit(60);

      if (hist) {
        const datas = hist.map((h: { data: string }) => h.data).sort((a: string, b: string) => b.localeCompare(a));
        setDiarioHoje(datas.includes(hoje));
        let s = 0;
        const now = new Date();
        for (let i = 0; i < datas.length; i++) {
          const esp = new Date(now);
          esp.setDate(now.getDate() - i);
          if (datas[i] === esp.toISOString().split('T')[0]) s++;
          else break;
        }
        setStreakDiario(s);
      }
    })();
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isLoaded) return <DashboardSkeleton />;

  const hora        = new Date().getHours();
  const saudacao    = getSaudacao(hora);
  const primeiroNome = user?.firstName ?? user?.fullName?.split(' ')[0] ?? 'você';

  // ── NavItem ────────────────────────────────────────────────────────────────

  function NavItem({
    label, href, icon, exact, badgeCount, badgeRed,
  }: {
    label: string;
    href: string;
    icon: React.ReactNode;
    exact?: boolean;
    badgeCount?: number | null;
    badgeRed?: boolean;
  }) {
    const isActive = exact ? pathname === href : pathname.startsWith(href);

    return (
      <Link
        href={href}
        title={label}
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 3,
          width: '100%',
          minHeight: 56,
          padding: '8px 0',
          borderRadius: 0,
          textDecoration: 'none',
          color: isActive ? '#C8A030' : 'rgba(245,240,232,0.38)',
          background: isActive ? 'rgba(200,160,48,0.12)' : 'transparent',
          borderLeft: isActive ? '2.5px solid #C8A030' : '2.5px solid transparent',
          transition: 'all 0.2s',
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => {
          if (!isActive) {
            e.currentTarget.style.background = 'rgba(200,160,48,0.07)';
            e.currentTarget.style.color = 'rgba(245,240,232,0.70)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'rgba(245,240,232,0.38)';
          }
        }}
      >
        {/* Ícone + badge */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          {icon}
          {/* Badge dourado (ferramentas pendentes) */}
          {badgeCount !== null && badgeCount !== undefined && badgeCount > 0 && !badgeRed && (
            <span style={{
              position: 'absolute', top: -5, right: -7,
              minWidth: 14, height: 14,
              background: '#C8A030', color: '#0E0E0E',
              borderRadius: 99, fontSize: 8, fontWeight: 800,
              fontFamily: 'var(--font-body)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '0 3px', lineHeight: 1,
              boxShadow: '0 0 0 2px #0E0E0E',
            }}>
              {badgeCount > 99 ? '99+' : badgeCount}
            </span>
          )}
          {/* Badge vermelho (diário não feito) */}
          {badgeRed && (
            <span style={{
              position: 'absolute', top: -4, right: -5,
              width: 8, height: 8,
              background: '#ef4444',
              borderRadius: '50%',
              boxShadow: '0 0 0 2px #0E0E0E',
            }} />
          )}
        </div>
        {/* Label */}
        <span style={{
          fontFamily: 'var(--font-body)',
          fontSize: 9,
          fontWeight: isActive ? 700 : 400,
          letterSpacing: '0.02em',
          lineHeight: 1,
          color: 'inherit',
          textAlign: 'center',
        }}>
          {label}
        </span>
      </Link>
    );
  }

  return (
    <ModoFocoContext.Provider value={modoFoco}>
      <div style={{ display: 'flex', overflow: 'hidden', height: '100dvh', fontFamily: 'var(--font-body)', background: '#0E0E0E' }}>

        {/* ══════════════════════════════════════════
            SIDEBAR
        ══════════════════════════════════════════ */}
        <aside style={{
          width: 72,
          flexShrink: 0,
          display: modoFoco ? 'none' : 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: 14,
          paddingBottom: 14,
          background: '#0A0A0A',
          borderRight: '1px solid rgba(200,160,48,0.10)',
          overflowY: 'auto',
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 14, gap: 3 }}>
            <span style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: 9, fontWeight: 400, color: '#F5F0E8',
              letterSpacing: '0.22em', textTransform: 'uppercase', lineHeight: 1,
            }}>
              KAIROS
            </span>
            <span style={{ width: 4, height: 4, background: '#C8A030', borderRadius: '50%', display: 'inline-block' }} />
          </div>

          {/* Nav principal */}
          <nav style={{ width: '100%' }}>
            {PRIMARY_NAV.map((item) => (
              <NavItem
                key={item.label}
                label={item.label}
                href={item.href}
                icon={item.icon}
                exact={item.exact}
                badgeCount={item.label === 'Ferramentas' ? pendingCount : null}
                badgeRed={item.label === 'Diário' && diarioHoje === false}
              />
            ))}
          </nav>

          {/* Separador */}
          <div style={{ width: 28, height: 1, background: 'rgba(200,160,48,0.14)', margin: '6px 0', flexShrink: 0 }} />

          {/* Nav secundária */}
          <nav style={{ width: '100%' }}>
            {SECONDARY_NAV.map((item) => (
              <NavItem key={item.label} label={item.label} href={item.href} icon={item.icon} exact={item.exact} />
            ))}
          </nav>

          {/* Spacer + avatar */}
          <div style={{ flex: 1 }} />
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: 'rgba(200,160,48,0.12)',
            border: '1.5px solid rgba(200,160,48,0.28)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 12, color: '#C8A030',
            flexShrink: 0,
          }}>
            {user?.firstName?.[0] ?? 'K'}
          </div>
        </aside>

        {/* ══════════════════════════════════════════
            MAIN COLUMN
        ══════════════════════════════════════════ */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>

          {/* ── TOPBAR ───────────────────────────────── */}
          <header style={{
            height: 54,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '0 16px',
            background: '#111111',
            borderBottom: '1px solid rgba(200,160,48,0.12)',
          }}>

            {/* ── Esquerda: logo + saudação ── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, minWidth: 0 }}>
              {modoFoco && (
                <span style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontStyle: 'italic', fontSize: 17, fontWeight: 400, color: '#C8A030', lineHeight: 1, flexShrink: 0,
                }}>
                  Kairos
                </span>
              )}
              {!modoFoco && (
                <>
                  <span style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontStyle: 'italic', fontSize: 17, fontWeight: 400, color: '#C8A030', lineHeight: 1, flexShrink: 0,
                  }}>
                    Kairos
                  </span>
                  <span style={{ display: 'inline-block', width: 1, height: 14, background: 'rgba(200,160,48,0.2)', flexShrink: 0 }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, overflow: 'hidden' }}>
                    <span style={{
                      fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500,
                      color: 'rgba(245,240,232,0.82)', whiteSpace: 'nowrap',
                      overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {saudacao}, <strong style={{ color: '#F5F0E8' }}>{primeiroNome}</strong>
                    </span>
                    {/* Indicador do diário */}
                    {diarioHoje !== null && (
                      <span
                        title={diarioHoje ? 'Diário registrado hoje' : 'Diário pendente'}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          fontSize: 11, fontWeight: 600,
                          color: diarioHoje ? '#22c55e' : '#f59e0b',
                          background: diarioHoje ? 'rgba(34,197,94,0.10)' : 'rgba(245,158,11,0.10)',
                          border: `1px solid ${diarioHoje ? 'rgba(34,197,94,0.25)' : 'rgba(245,158,11,0.25)'}`,
                          padding: '2px 8px', borderRadius: 99, flexShrink: 0,
                        }}
                      >
                        {diarioHoje ? (
                          <>
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                              <path d="M1.5 5l2.5 2.5 4.5-5" stroke="#22c55e" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Hoje ✓
                          </>
                        ) : '📔 Registrar'}
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* ── Centro: busca ── */}
            {!modoFoco && (
              <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                <SearchBar />
              </div>
            )}
            {modoFoco && <div style={{ flex: 1 }} />}

            {/* ── Direita: streak + modo foco + avatar ── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>

              {/* Streak */}
              {!modoFoco && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 700,
                  color: streakDiario > 0 ? '#C8A030' : 'rgba(245,240,232,0.3)',
                  background: streakDiario > 0 ? 'rgba(200,160,48,0.12)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${streakDiario > 0 ? 'rgba(200,160,48,0.28)' : 'rgba(255,255,255,0.07)'}`,
                  borderRadius: 99, padding: '4px 10px', whiteSpace: 'nowrap',
                  transition: 'all 0.2s',
                }}>
                  {streakDiario > 0 ? `🔥 ${streakDiario}d` : '💤 0d'}
                </span>
              )}

              {/* Botão Modo Foco */}
              <button
                onClick={() => setModoFoco((v) => !v)}
                title={modoFoco ? 'Sair do Modo Foco' : 'Modo Foco — mostrar só o essencial'}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  fontSize: 11, fontWeight: 600, cursor: 'pointer',
                  color: modoFoco ? '#0E0E0E' : '#C8A030',
                  background: modoFoco
                    ? 'linear-gradient(135deg, #C8A030, #e8c76a)'
                    : 'rgba(200,160,48,0.10)',
                  border: `1px solid ${modoFoco ? 'transparent' : 'rgba(200,160,48,0.28)'}`,
                  borderRadius: 99, padding: '5px 12px', whiteSpace: 'nowrap',
                  transition: 'all 0.2s',
                  boxShadow: modoFoco ? '0 2px 12px rgba(200,160,48,0.4)' : 'none',
                }}
              >
                <IconFoco active={modoFoco} />
                {modoFoco ? 'Sair do Foco' : 'Modo Foco'}
              </button>

              <UserButton appearance={{ elements: { avatarBox: { width: 30, height: 30 } } }} />
            </div>
          </header>

          {/* ── CONTENT ──────────────────────────────── */}
          <main
            style={{
              flex: 1, overflowY: 'auto',
              padding: modoFoco ? '0' : '24px',
              background: modoFoco ? '#0E0E0E' : '#F5F2EC',
              transition: 'padding 0.3s ease, background 0.3s ease',
            }}
          >
            {children}
          </main>
        </div>
      </div>

      <style>{`
        @keyframes dl-pulse {
          0%, 100% { opacity: 0.4 }
          50%       { opacity: 0.8 }
        }
      `}</style>
    </ModoFocoContext.Provider>
  );
}
