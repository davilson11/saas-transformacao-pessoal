'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton, useAuth } from '@clerk/nextjs';

// ─── SVG Icons ──────────────────────────────────────────────────────────────

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

// ─── Nav config ─────────────────────────────────────────────────────────────

const NAV_ITEMS: { label: string; href: string; icon: React.ReactNode; exact?: boolean }[] = [
  { label: 'Dashboard',     href: '/dashboard',   icon: <IconDashboard />,     exact: true },
  { label: 'Ferramentas',   href: '/ferramentas', icon: <IconFerramentas /> },
  { label: 'Progresso',     href: '/perfil',      icon: <IconProgresso />,     exact: true },
  { label: 'Perfil',        href: '/perfil',      icon: <IconPerfil />,        exact: true },
  { label: 'Configurações', href: '/dashboard',   icon: <IconConfiguracoes />, exact: true },
];

// ─── Mock content ────────────────────────────────────────────────────────────

const MOCK_STATS = [
  { label: 'Ferramentas concluídas', valor: '7', total: '/16', cor: '#1E392A' },
  { label: 'Sequência de dias',      valor: '14', total: ' dias', cor: '#E0A55F' },
  { label: 'Progresso geral',        valor: '44', total: '%',    cor: '#2D5A4F' },
  { label: 'Revisões feitas',        valor: '3',  total: '/12',  cor: '#81B29A' },
];

const MOCK_FERRAMENTAS = [
  { codigo: 'F01', nome: 'Raio-X 360°',     status: 'concluido', pct: 100 },
  { codigo: 'F02', nome: 'Mapa de Valores', status: 'concluido', pct: 100 },
  { codigo: 'F03', nome: 'Propósito de Vida', status: 'em-progresso', pct: 60 },
  { codigo: 'F04', nome: 'Visão de Futuro',  status: 'nao-iniciado', pct: 0 },
];

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    'concluido':     { label: 'Concluído',      bg: 'rgba(39,174,96,0.1)',   color: '#1a7a40' },
    'em-progresso':  { label: 'Em progresso',   bg: 'rgba(224,165,95,0.15)', color: '#a0692d' },
    'nao-iniciado':  { label: 'Não iniciado',   bg: 'rgba(107,114,128,0.1)', color: '#6B7280' },
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
      {/* Boas-vindas */}
      <div>
        <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#F5F0E8', fontSize: 22, fontWeight: 400, fontStyle: 'italic' }}>
          Bom dia, Ana 👋
        </h2>
        <p style={{ fontSize: 14, color: 'rgba(245,240,232,0.5)', marginTop: 4 }}>
          Você está na Fase 1 — Autoconhecimento. Continue de onde parou.
        </p>
      </div>

      {/* Stat cards */}
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

      {/* Linha principal: progresso + próxima ação */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Ferramentas recentes */}
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
                {/* barra de progresso */}
                <div className="rounded-full overflow-hidden flex-shrink-0" style={{ width: 64, height: 4, background: 'var(--color-brand-border)' }}>
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${f.pct}%`, background: f.pct === 100 ? '#27AE60' : 'var(--color-brand-gold)' }} />
                </div>
                <StatusPill status={f.status} />
              </div>
            ))}
          </div>
        </div>

        {/* Próxima ação */}
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
              Você está 60% — faltam apenas 3 perguntas para concluir esta ferramenta.
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

// ─── Layout principal ────────────────────────────────────────────────────────

interface DashboardLayoutProps {
  children?: React.ReactNode;
}

function DashboardSkeleton() {
  return (
    <div className="flex overflow-hidden" style={{ height: '100dvh', background: '#0E0E0E' }}>
      {/* Sidebar skeleton */}
      <aside className="flex flex-col items-center py-4 flex-shrink-0" style={{ width: 60, background: '#0E0E0E', gap: 2, borderRight: '1px solid rgba(200,160,48,0.08)' }}>
        <div style={{ width: 32, height: 12, background: 'rgba(200,160,48,0.12)', borderRadius: 2, marginBottom: 12 }} />
        {[...Array(5)].map((_, i) => (
          <div key={i} style={{ width: 44, height: 44, background: 'rgba(255,255,255,0.04)', borderRadius: 12, marginBottom: 2 }} />
        ))}
      </aside>
      {/* Main skeleton */}
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

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isLoaded } = useAuth();
  const pathname = usePathname();

  if (!isLoaded) return <DashboardSkeleton />;

  const now = new Date();
  const dateLabel = now.toLocaleDateString('pt-BR', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <div className="flex overflow-hidden" style={{ height: '100dvh', fontFamily: 'var(--font-body)', background: '#0E0E0E' }}>

      {/* ── Sidebar ─────────────────────────────────────────────────── */}
      <aside
        className="flex flex-col items-center py-4 flex-shrink-0"
        style={{ width: 60, background: '#0E0E0E', gap: 2, borderRight: '1px solid rgba(200,160,48,0.08)' }}
      >
        {/* Logo mark */}
        <div className="flex flex-col items-center mb-3 flex-shrink-0 gap-0.5">
          <span
            style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: 11,
              fontWeight: 400,
              color: '#F5F0E8',
              letterSpacing: '0.20em',
              textTransform: 'uppercase',
              lineHeight: 1,
            }}
          >
            KAIROS
          </span>
          <span
            style={{
              width: 5,
              height: 5,
              background: '#B5840A',
              borderRadius: '50%',
              display: 'inline-block',
            }}
          />
        </div>

        {/* Nav items */}
        {NAV_ITEMS.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.label}
              href={item.href}
              className="flex flex-col items-center justify-center gap-1 rounded-xl transition-all duration-200 w-full px-1"
              style={{
                height: 48,
                background: isActive ? 'rgba(200,160,48,0.12)' : 'transparent',
                color: isActive ? '#C8A030' : 'rgba(245,240,232,0.4)',
                border: `1px solid ${isActive ? 'rgba(200,160,48,0.25)' : 'transparent'}`,
                textDecoration: 'none',
              }}
              aria-label={item.label}
            >
              {item.icon}
              <span style={{
                fontFamily: 'var(--font-body)',
                fontSize: 9,
                fontWeight: isActive ? 600 : 400,
                letterSpacing: '0.01em',
                lineHeight: 1,
                color: 'inherit',
              }}>
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Avatar */}
        <div className="flex items-center justify-center rounded-full font-bold text-xs flex-shrink-0"
          style={{ width: 32, height: 32, background: 'rgba(224,165,95,0.15)',
            color: 'var(--color-brand-gold)', border: '1.5px solid rgba(224,165,95,0.3)',
            fontFamily: 'var(--font-heading)' }}>
          AV
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 overflow-hidden">

        {/* Topbar */}
        <header
          className="flex items-center justify-between flex-shrink-0 px-6"
          style={{ height: 56, background: '#111111', borderBottom: '1px solid rgba(200,160,48,0.12)' }}
        >
          {/* Esquerda: logo + separador + título */}
          <div className="flex items-center gap-3 min-w-0">
            <span
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontStyle: 'italic',
                fontSize: 20,
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
                height: 18,
                background: 'rgba(200,160,48,0.2)',
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 13,
                color: 'rgba(245,240,232,0.5)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              The Cockpit · <span style={{ textTransform: 'capitalize' }}>{dateLabel}</span>
            </span>
          </div>

          {/* Direita: streak badge + avatar */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--color-brand-gold)',
                background: 'rgba(181,132,10,0.1)',
                border: '1px solid rgba(181,132,10,0.25)',
                borderRadius: 99,
                padding: '4px 12px',
                whiteSpace: 'nowrap',
              }}
            >
              13 dias 🔥
            </span>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: { width: 34, height: 34 },
                },
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
