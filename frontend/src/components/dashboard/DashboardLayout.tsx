'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton, useAuth, useUser } from '@clerk/nextjs';
import { useSupabaseClient } from '@/lib/useSupabaseClient';
import { buscarTodasRespostas } from '@/lib/queries';

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

function IconConfiguracoes() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 1v2M9 15v2M1 9h2M15 9h2M3.22 3.22l1.42 1.42M13.36 13.36l1.42 1.42M3.22 14.78l1.42-1.42M13.36 4.64l1.42-1.42"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
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

// ─── Nav config ───────────────────────────────────────────────────────────────

const PRIMARY_NAV = [
  { label: 'Dashboard',   href: '/dashboard',   icon: <IconDashboard />,   exact: true },
  { label: 'Ferramentas', href: '/ferramentas', icon: <IconFerramentas />, exact: false },
  { label: 'Progresso',   href: '/perfil',      icon: <IconProgresso />,   exact: true },
];

const SECONDARY_NAV = [
  { label: 'Perfil',        href: '/perfil',    icon: <IconPerfil />,        exact: true },
  { label: 'Config.',       href: '/dashboard', icon: <IconConfiguracoes />, exact: true },
];

// ─── Mock content ─────────────────────────────────────────────────────────────

const MOCK_STATS = [
  { label: 'Ferramentas concluídas', valor: '7', total: '/16', cor: '#1E392A' },
  { label: 'Sequência de dias',      valor: '14', total: ' dias', cor: '#E0A55F' },
  { label: 'Progresso geral',        valor: '44', total: '%',    cor: '#2D5A4F' },
  { label: 'Revisões feitas',        valor: '3',  total: '/12',  cor: '#81B29A' },
];

const MOCK_FERRAMENTAS = [
  { codigo: 'F01', nome: 'Raio-X 360°',     status: 'concluido',    pct: 100 },
  { codigo: 'F02', nome: 'Mapa de Valores', status: 'concluido',    pct: 100 },
  { codigo: 'F03', nome: 'Propósito de Vida', status: 'em-progresso', pct: 60 },
  { codigo: 'F04', nome: 'Visão de Futuro',  status: 'nao-iniciado', pct: 0 },
];

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    'concluido':    { label: 'Concluído',    bg: 'rgba(39,174,96,0.1)',   color: '#1a7a40' },
    'em-progresso': { label: 'Em progresso', bg: 'rgba(224,165,95,0.15)', color: '#a0692d' },
    'nao-iniciado': { label: 'Não iniciado', bg: 'rgba(107,114,128,0.1)', color: '#6B7280' },
  };
  const s = map[status] ?? map['nao-iniciado'];
  return (
    <span className="rounded-full px-2 py-0.5 text-xs font-medium"
      style={{ background: s.bg, color: s.color, fontFamily: 'var(--font-body)', whiteSpace: 'nowrap' }}>
      {s.label}
    </span>
  );
}

function MockContent() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#F5F0E8', fontSize: 22, fontWeight: 400, fontStyle: 'italic' }}>
          Bom dia, Ana 👋
        </h2>
        <p style={{ fontSize: 14, color: 'rgba(245,240,232,0.5)', marginTop: 4 }}>
          Você está na Fase 1 — Autoconhecimento. Continue de onde parou.
        </p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {MOCK_STATS.map((s) => (
          <div key={s.label} className="rounded-2xl p-5 flex flex-col gap-1"
            style={{ background: '#1A1A1A', border: '1px solid rgba(200,160,48,0.15)' }}>
            <p style={{ fontSize: 12, color: 'rgba(245,240,232,0.45)', fontFamily: 'var(--font-body)' }}>
              {s.label}
            </p>
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: 32, fontWeight: 700, lineHeight: 1, color: s.cor }}>
              {s.valor}<span style={{ fontSize: 16, fontWeight: 500, color: 'var(--color-brand-gray)' }}>{s.total}</span>
            </p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl p-6"
          style={{ background: '#1A1A1A', border: '1px solid rgba(200,160,48,0.15)' }}>
          <p style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 400, fontStyle: 'italic', fontSize: 15, color: '#C8A030', marginBottom: 16 }}>
            Fase 1 — Autoconhecimento
          </p>
          <div className="flex flex-col gap-3">
            {MOCK_FERRAMENTAS.map((f) => (
              <div key={f.codigo} className="flex items-center gap-4">
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#C8A030',
                  background: 'rgba(200,160,48,0.1)', padding: '2px 8px', borderRadius: 99, whiteSpace: 'nowrap' }}>
                  {f.codigo}
                </span>
                <span style={{ fontSize: 14, color: '#F5F0E8', flex: 1 }}>{f.nome}</span>
                <div className="rounded-full overflow-hidden flex-shrink-0" style={{ width: 64, height: 4, background: 'var(--color-brand-border)' }}>
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${f.pct}%`, background: f.pct === 100 ? '#27AE60' : 'var(--color-brand-gold)' }} />
                </div>
                <StatusPill status={f.status} />
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl p-6 flex flex-col gap-4"
          style={{ background: 'linear-gradient(135deg, #1E392A 0%, #2D5A4F 100%)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
            color: 'var(--color-brand-gold)', fontFamily: 'var(--font-body)' }}>
            Próxima ação
          </p>
          <div>
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: 18, color: 'var(--color-brand-cream)', fontWeight: 700, lineHeight: 1.3 }}>
              Propósito de Vida
            </p>
            <p style={{ fontSize: 13, color: 'rgba(244,241,222,0.6)', marginTop: 6, lineHeight: 1.6 }}>
              Você está 60% — faltam apenas 3 perguntas.
            </p>
          </div>
          <div className="rounded-full overflow-hidden" style={{ height: 4, background: 'rgba(255,255,255,0.12)' }}>
            <div className="h-full rounded-full" style={{ width: '60%', background: 'var(--color-brand-gold)' }} />
          </div>
          <a href="#" className="btn-gold text-sm mt-auto" style={{ justifyContent: 'center', padding: '10px 16px', borderRadius: 10 }}>
            Continuar →
          </a>
        </div>
      </div>
    </div>
  );
}

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

  // Fechar ao clicar fora
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative', flex: '0 1 320px', minWidth: 0 }}>
      {/* Input */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'rgba(255,255,255,0.05)',
          border: `1px solid ${open ? 'rgba(200,160,48,0.45)' : 'rgba(255,255,255,0.09)'}`,
          borderRadius: 10,
          padding: '0 12px',
          height: 36,
          transition: 'border-color 0.15s',
        }}
      >
        <span style={{ color: 'rgba(245,240,232,0.35)', flexShrink: 0 }}>
          <IconSearch />
        </span>
        <input
          type="text"
          value={query}
          placeholder="Buscar ferramenta..."
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontFamily: 'var(--font-body)',
            fontSize: 13,
            color: '#F5F0E8',
            minWidth: 0,
          }}
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setOpen(false); }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'rgba(245,240,232,0.3)',
              fontSize: 14,
              lineHeight: 1,
              padding: 0,
              flexShrink: 0,
            }}
            aria-label="Limpar busca"
          >
            ✕
          </button>
        )}
      </div>

      {/* Dropdown de resultados */}
      {open && results.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            background: '#1A1A1A',
            border: '1px solid rgba(200,160,48,0.25)',
            borderRadius: 12,
            overflow: 'hidden',
            boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
            zIndex: 200,
          }}
        >
          {results.map((tool) => (
            <Link
              key={tool.slug}
              href={`/ferramentas/${tool.slug}`}
              onClick={() => { setQuery(''); setOpen(false); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 14px',
                textDecoration: 'none',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                transition: 'background 0.1s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(200,160,48,0.08)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  fontWeight: 700,
                  color: '#C8A030',
                  background: 'rgba(200,160,48,0.12)',
                  padding: '2px 7px',
                  borderRadius: 99,
                  flexShrink: 0,
                }}
              >
                {tool.codigo}
              </span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#F5F0E8', flex: 1 }}>
                {tool.nome}
              </span>
              <span style={{ fontSize: 10, color: 'rgba(245,240,232,0.3)', flexShrink: 0 }}>→</span>
            </Link>
          ))}
        </div>
      )}

      {/* Sem resultados */}
      {open && query.trim().length > 0 && results.length === 0 && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            background: '#1A1A1A',
            border: '1px solid rgba(200,160,48,0.15)',
            borderRadius: 12,
            padding: '14px',
            textAlign: 'center',
            zIndex: 200,
          }}
        >
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
    <div className="flex overflow-hidden" style={{ height: '100dvh', background: '#0E0E0E' }}>
      <aside className="flex flex-col items-center py-4 flex-shrink-0"
        style={{ width: 72, background: '#0E0E0E', gap: 2, borderRight: '1px solid rgba(200,160,48,0.08)' }}>
        <div style={{ width: 36, height: 12, background: 'rgba(200,160,48,0.12)', borderRadius: 2, marginBottom: 12 }} />
        {[...Array(5)].map((_, i) => (
          <div key={i} style={{ width: 52, height: 52, background: 'rgba(255,255,255,0.04)', borderRadius: 12, marginBottom: 2 }} />
        ))}
      </aside>
      <div className="flex flex-col flex-1 overflow-hidden">
        <header style={{ height: 56, background: '#111111', borderBottom: '1px solid rgba(200,160,48,0.12)' }} />
        <main className="flex-1 p-6" style={{ background: '#0E0E0E' }}>
          <div style={{ width: 200, height: 24, background: 'rgba(200,160,48,0.1)', borderRadius: 4, marginBottom: 8 }} />
          <div style={{ width: 300, height: 14, background: 'rgba(255,255,255,0.06)', borderRadius: 4, marginBottom: 24 }} />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" style={{ marginBottom: 24 }}>
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

  const [pendingCount, setPendingCount] = useState<number | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      const client = await getClient();
      const respostas = await buscarTodasRespostas(user.id, client);
      const concluidas = respostas.filter((r) => r.concluida).length;
      setPendingCount(16 - concluidas);
    })();
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isLoaded) return <DashboardSkeleton />;

  const now = new Date();
  const dateLabel = now.toLocaleDateString('pt-BR', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  });

  function NavItem({
    label, href, icon, exact, badge,
  }: {
    label: string;
    href: string;
    icon: React.ReactNode;
    exact?: boolean;
    badge?: number | null;
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
          gap: 4,
          width: '100%',
          height: 56,
          borderRadius: 0,
          textDecoration: 'none',
          color: isActive ? '#C8A030' : 'rgba(245,240,232,0.38)',
          background: isActive ? 'rgba(200,160,48,0.15)' : 'transparent',
          borderLeft: isActive ? '3px solid #C8A030' : '3px solid transparent',
          transition: 'all 0.15s',
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
        {/* Ícone */}
        <div style={{ position: 'relative' }}>
          {icon}
          {/* Badge de pendentes */}
          {badge !== null && badge !== undefined && badge > 0 && (
            <span
              style={{
                position: 'absolute',
                top: -5,
                right: -7,
                minWidth: 14,
                height: 14,
                background: '#C8A030',
                color: '#0E0E0E',
                borderRadius: 99,
                fontSize: 8,
                fontWeight: 800,
                fontFamily: 'var(--font-body)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 3px',
                lineHeight: 1,
                boxShadow: '0 0 0 2px #0E0E0E',
              }}
            >
              {badge > 99 ? '99+' : badge}
            </span>
          )}
        </div>
        {/* Label */}
        <span
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 9,
            fontWeight: isActive ? 700 : 400,
            letterSpacing: '0.01em',
            lineHeight: 1,
            color: 'inherit',
          }}
        >
          {label}
        </span>
      </Link>
    );
  }

  return (
    <div className="flex overflow-hidden" style={{ height: '100dvh', fontFamily: 'var(--font-body)', background: '#0E0E0E' }}>

      {/* ── Sidebar ───────────────────────────────────────────────── */}
      <aside
        style={{
          width: 72,
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: 16,
          paddingBottom: 16,
          background: '#0E0E0E',
          borderRight: '1px solid rgba(200,160,48,0.10)',
          overflowY: 'auto',
        }}
      >
        {/* Logo mark */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 16, gap: 3 }}>
          <span
            style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: 10,
              fontWeight: 400,
              color: '#F5F0E8',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              lineHeight: 1,
            }}
          >
            KAIROS
          </span>
          <span style={{ width: 5, height: 5, background: '#C8A030', borderRadius: '50%', display: 'inline-block' }} />
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
              badge={item.label === 'Ferramentas' ? pendingCount : null}
            />
          ))}
        </nav>

        {/* Separador */}
        <div
          style={{
            width: 32,
            height: 1,
            background: 'rgba(200,160,48,0.14)',
            margin: '8px 0',
            flexShrink: 0,
          }}
        />

        {/* Nav secundária */}
        <nav style={{ width: '100%' }}>
          {SECONDARY_NAV.map((item) => (
            <NavItem
              key={item.label}
              label={item.label}
              href={item.href}
              icon={item.icon}
              exact={item.exact}
            />
          ))}
        </nav>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Avatar placeholder */}
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'rgba(200,160,48,0.12)',
            border: '1.5px solid rgba(200,160,48,0.28)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            fontSize: 12,
            color: '#C8A030',
            flexShrink: 0,
          }}
        >
          {user?.firstName?.[0] ?? 'K'}
        </div>
      </aside>

      {/* ── Main ──────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 overflow-hidden">

        {/* Topbar */}
        <header
          style={{
            height: 56,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            padding: '0 20px',
            background: '#111111',
            borderBottom: '1px solid rgba(200,160,48,0.12)',
          }}
        >
          {/* Esquerda: logo + data */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, minWidth: 0 }}>
            <span
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontStyle: 'italic',
                fontSize: 18,
                fontWeight: 400,
                color: '#C8A030',
                lineHeight: 1,
                letterSpacing: '-0.01em',
                flexShrink: 0,
              }}
            >
              Kairos
            </span>
            <span
              style={{
                display: 'inline-block',
                width: 1,
                height: 16,
                background: 'rgba(200,160,48,0.2)',
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 12,
                color: 'rgba(245,240,232,0.4)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: 160,
              }}
            >
              {dateLabel}
            </span>
          </div>

          {/* Centro: busca */}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <SearchBar />
          </div>

          {/* Direita: streak + UserButton */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 12,
                fontWeight: 600,
                color: '#C8A030',
                background: 'rgba(200,160,48,0.10)',
                border: '1px solid rgba(200,160,48,0.22)',
                borderRadius: 99,
                padding: '4px 11px',
                whiteSpace: 'nowrap',
              }}
            >
              🔥 13 dias
            </span>
            <UserButton
              appearance={{
                elements: { avatarBox: { width: 32, height: 32 } },
              }}
            />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6" style={{ background: '#0E0E0E' }}>
          {children ?? <MockContent />}
        </main>
      </div>
    </div>
  );
}
